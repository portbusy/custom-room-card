const CARD_TAG = "custom-room-card";
const VERSION = "0.2.0";
const CATEGORIES = {
  lights: { domain: "light", label: "Luci", icon: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
  covers: { domain: "cover", label: "Tapparelle", icon: "mdi:roller-shade", off: "mdi:roller-shade-closed" },
  climate: { domain: "climate", label: "Clima", icon: "mdi:air-conditioner", off: "mdi:air-conditioner" },
  media: { domain: "media_player", label: "Media", icon: "mdi:television", off: "mdi:television-off" },
  switches: { domain: "switch", domains: ["switch", "input_boolean"], label: "Interruttori", icon: "mdi:toggle-switch", off: "mdi:toggle-switch-off-outline" },
};
const OFF = new Set(["off", "closed", "idle", "standby", "unavailable", "unknown"]);
const escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const on = (state) => state && !OFF.has(state.state);
const number = (value, digits = 0) => { const n = Number.parseFloat(value); return Number.isFinite(n) ? n.toFixed(digits) : null; };
const entityName = (hass, id) => hass.states[id]?.attributes?.friendly_name || id;

const CARD_STYLE = `
  :host{display:block}.rooms{display:grid;gap:14px}.room{overflow:hidden;border-radius:24px;background:var(--card-background-color);box-shadow:0 2px 8px rgb(0 0 0 / 7%),0 0 0 1px color-mix(in srgb,var(--room-color) 27%,transparent)}.header{position:relative;display:flex;flex-direction:column;align-items:flex-start;width:100%;box-sizing:border-box;padding:16px 18px 18px;border:0;color:#fff;text-align:left;cursor:pointer;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 92%,transparent),color-mix(in srgb,var(--room-color) 55%,transparent) 35%,color-mix(in srgb,var(--room-color) 20%,transparent) 65%,transparent)}.title{font-size:1.1em;font-weight:600;line-height:1.2;text-shadow:0 1px 3px rgb(0 0 0 / 20%)}.room-icon{position:absolute;right:18px;top:16px;--mdc-icon-size:40px;color:color-mix(in srgb,var(--room-color) 82%,white);filter:drop-shadow(0 2px 4px rgb(0 0 0 / 15%))}.summary{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:.82em;white-space:nowrap}.summary ha-icon{--mdc-icon-size:18px;color:rgb(255 255 255 / 42%)}.summary ha-icon.active{color:#ffa726}.chips{display:flex;align-content:center;gap:8px;flex-wrap:wrap;box-sizing:border-box;padding:8px 14px 12px;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 13%,transparent),color-mix(in srgb,var(--room-color) 4%,transparent))}.chip{display:inline-flex;align-items:center;gap:8px;min-height:36px;max-width:100%;padding:0 14px;border:1px solid color-mix(in srgb,var(--room-color) 23%,transparent);border-radius:999px;background:color-mix(in srgb,var(--room-color) 7%,transparent);color:var(--primary-text-color);font:600 .9em/1 var(--primary-font-family,sans-serif);cursor:pointer;box-shadow:0 2px 2px rgb(0 0 0 / 20%)}.chip ha-icon{--mdc-icon-size:21px;color:var(--secondary-text-color)}.chip.active{border-color:rgb(255 167 38 / 52%);background:rgb(255 167 38 / 15%)}.chip.active ha-icon{color:#ffb300}.empty{padding:18px 14px;color:var(--secondary-text-color)}
`;
const EDITOR_STYLE = `
  :host{display:block}.editor{display:grid;gap:16px;padding:16px}.controls{display:flex;align-items:center;gap:10px}.room-editor{display:grid;gap:12px;padding:14px;border:1px solid var(--divider-color);border-radius:12px}.room-head{display:flex;align-items:center;justify-content:space-between}.room-head h3{margin:0;font-size:1rem}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.field{display:grid;gap:5px;font-size:.9rem}.entities{display:grid;gap:12px}.entities h4{margin:2px 0 0;font-size:.95rem}.category{display:grid;gap:8px}.category-title{font-weight:500}.entity-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px}@media(max-width:520px){.fields{grid-template-columns:1fr}}
`;

function defaultColor(name = "") {
  const n = name.toLowerCase();
  if (/bagno|bath/.test(n)) return "#5c9eb8";
  if (/camera|letto|bed/.test(n)) return "#7d79ad";
  if (/cucina|kitchen/.test(n)) return "#c88b54";
  if (/giardino|garden|terrazzo/.test(n)) return "#67966f";
  if (/studio|office/.test(n)) return "#7c8fa9";
  return "#a66d58";
}

class CustomRoomCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  static getConfigElement() { return document.createElement("custom-room-card-editor"); }
  static getStubConfig(hass) { const area = Object.keys(hass?.areas || {})[0]; return { type: `custom:${CARD_TAG}`, sort_by_motion: false, rooms: area ? [{ area, entities: {} }] : [] }; }
  setConfig(config) {
    const legacy = config.area ? [{ area: config.area, title: config.title, icon: config.icon, color: config.color, entities: config.entities || {} }] : config.rooms;
    this._config = { ...config, rooms: (legacy || []).map((room) => ({ entities: {}, ...room })) };
    this._render();
  }
  set hass(hass) { this._hass = hass; this._render(); }
  getCardSize() { return Math.max(2, (this._config?.rooms?.length || 1) * 2); }
  _areaIds(area) {
    const devices = this._hass.devices || {};
    return Object.values(this._hass.entities || {}).filter((e) => e.area_id === area || (e.device_id && devices[e.device_id]?.area_id === area)).map((e) => e.entity_id).filter((id) => this._hass.states[id]);
  }
  _sensor(ids, classes) { return ids.map((id) => this._hass.states[id]).find((s) => classes.includes(s?.attributes?.device_class) && !OFF.has(s?.state)); }
  _motion(room, ids) { return room.motion_entity ? this._hass.states[room.motion_entity] : this._sensor(ids, ["motion", "occupancy", "presence"]); }
  _sort(rooms) {
    if (!this._config.sort_by_motion) return rooms;
    return [...rooms].sort((a, b) => {
      const ma = this._motion(a.room, a.ids); const mb = this._motion(b.room, b.ids);
      if (on(ma) !== on(mb)) return on(mb) - on(ma);
      return new Date(mb?.last_changed || 0) - new Date(ma?.last_changed || 0);
    });
  }
  _entities(room, ids) {
    return Object.entries(room.entities || {}).flatMap(([category, selected]) => {
      const domains = CATEGORIES[category]?.domains || [CATEGORIES[category]?.domain];
      return (Array.isArray(selected) ? selected : selected ? [selected] : []).filter((id) => domains.includes(id.split(".")[0]) && this._hass.states[id]);
    });
  }
  _render() {
    if (!this._hass || !this._config) return;
    const rooms = this._sort(this._config.rooms.map((room) => ({ room, ids: this._areaIds(room.area) })));
    this.shadowRoot.innerHTML = `<style>${CARD_STYLE}</style><div class="rooms">${rooms.map(({ room, ids }) => this._room(room, ids)).join("") || `<div class="empty">Aggiungi una stanza dalla configurazione della card.</div>`}</div>`;
    this.shadowRoot.querySelectorAll(".header").forEach((button) => button.addEventListener("click", () => this._fire("hass-more-info", { entityId: button.dataset.entity })));
    this.shadowRoot.querySelectorAll(".chip").forEach((button) => {
      const moreInfo = () => this._fire("hass-more-info", { entityId: button.dataset.entity });
      button.addEventListener("click", () => ["light", "switch", "input_boolean"].includes(button.dataset.domain) ? this._hass.callService(button.dataset.domain, "toggle", { entity_id: button.dataset.entity }) : moreInfo());
      button.addEventListener("contextmenu", (event) => { event.preventDefault(); moreInfo(); });
    });
  }
  _room(room, ids) {
    const area = this._hass.areas?.[room.area]; const title = room.title || area?.name || room.area;
    const temp = this._sensor(ids, ["temperature"]); const humidity = this._sensor(ids, ["humidity"]); const lux = this._sensor(ids, ["illuminance"]); const motion = this._motion(room, ids); const opening = this._sensor(ids, ["opening", "door", "window"]);
    const metrics = [temp && `${escape(number(temp.state, 1) ?? temp.state)}°C`, humidity && `${escape(number(humidity.state) ?? humidity.state)}%`, lux && `${escape(number(lux.state) ?? lux.state)} lx`].filter(Boolean);
    const status = [motion && `<ha-icon class="${on(motion) ? "active" : ""}" icon="mdi:circle"></ha-icon>`, opening && `<ha-icon class="${on(opening) ? "active" : ""}" icon="mdi:${on(opening) ? "window-open-variant" : "window-closed-variant"}"></ha-icon>`].filter(Boolean).join("");
    const entities = this._entities(room, ids); const color = room.color || defaultColor(title);
    return `<section class="room" style="--room-color:${escape(color)}"><button class="header" data-entity="${escape(room.motion_entity || ids[0] || "")}" aria-label="${escape(title)}"><ha-icon class="room-icon" icon="${escape(room.icon || area?.icon || "mdi:home")}"></ha-icon><span class="title">${escape(title)}</span><span class="summary">${status}${metrics.map((m) => `<span>${m}</span>`).join("")}</span></button>${entities.length ? `<div class="chips">${entities.map((id) => this._chip(id)).join("")}</div>` : `<div class="empty">Nessuna entità selezionata</div>`}</section>`;
  }
  _chip(id) {
    const domain = id.split(".")[0]; const category = Object.values(CATEGORIES).find((item) => item.domain === domain) || CATEGORIES.switches; const active = on(this._hass.states[id]);
    return `<button class="chip ${active ? "active" : ""}" data-entity="${escape(id)}" data-domain="${escape(domain)}"><ha-icon icon="${active ? category.icon : category.off}"></ha-icon><span>${escape(entityName(this._hass, id))}</span></button>`;
  }
  _fire(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true })); }
}

class CustomRoomCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  setConfig(config) {
    const next = { ...config, rooms: config.rooms || (config.area ? [{ area: config.area, entities: config.entities || {} }] : []) };
    if (JSON.stringify(next) === JSON.stringify(this._config)) return;
    this._config = next; this._render();
  }
  set hass(hass) { this._hass = hass; this._render(); }
  _emit(config) { this._config = config; this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true })); }
  _updateRoom(index, changes) { const rooms = this._config.rooms.map((room, i) => i === index ? { ...room, ...changes } : room); this._emit({ ...this._config, rooms }); }
  _handlePicker(picker, callback, rerender = false) {
    picker.addEventListener("value-changed", (event) => {
      if (event.target !== picker) return;
      callback(event.detail.value);
      if (rerender) this._render();
    });
  }
  _addEntityPicker(holder, label, domains, onPick) {
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass; picker.label = label; picker.includeDomains = domains; picker.value = ""; picker.allowCustomEntity = true;
    this._handlePicker(picker, (value) => { if (value) onPick(value); }, true);
    holder.append(picker);
  }
  _selectedEntityRow(holder, entity, domains, onChange, onRemove) {
    const row = document.createElement("div"); row.className = "entity-row";
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass; picker.value = entity; picker.includeDomains = domains; picker.allowCustomEntity = true;
    this._handlePicker(picker, (value) => value ? onChange(value) : onRemove(), !entity);
    const remove = document.createElement("ha-icon-button"); remove.icon = "mdi:close"; remove.label = "Rimuovi entità";
    remove.addEventListener("click", () => { onRemove(); this._render(); });
    row.append(picker, remove); holder.append(row);
  }
  _render() {
    if (!this._hass || !this._config) return;
    this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style><div class="editor"><div class="controls"><ha-switch id="sort" ${this._config.sort_by_motion ? "checked" : ""}></ha-switch><label for="sort">Ordina le stanze per movimento</label></div><div id="rooms"></div><ha-button id="add">Aggiungi stanza</ha-button></div>`;
    const rooms = this.shadowRoot.querySelector("#rooms");
    this._config.rooms.forEach((room, index) => this._roomEditor(rooms, room, index));
    this.shadowRoot.querySelector("#sort").addEventListener("change", (event) => this._emit({ ...this._config, sort_by_motion: event.target.checked }));
    this.shadowRoot.querySelector("#add").addEventListener("click", () => { this._emit({ ...this._config, rooms: [...this._config.rooms, { entities: {} }] }); this._render(); });
  }
  _roomEditor(parent, room, index) {
    const container = document.createElement("section"); container.className = "room-editor";
    container.innerHTML = `<div class="room-head"><h3>Stanza ${index + 1}</h3><ha-icon-button data-remove icon="mdi:delete" label="Rimuovi stanza"></ha-icon-button></div><div class="fields"><div class="field"><span>Area</span><ha-area-picker data-area></ha-area-picker></div><div class="field" data-color><span>Colore base</span></div><div class="field"><span>Icona</span><ha-icon-picker data-icon label="Icona"></ha-icon-picker></div><div class="field"><span>Sensore movimento</span><ha-entity-picker data-motion label="Movimento"></ha-entity-picker></div></div><div class="entities"><h4>Entità per categoria</h4></div>`;
    parent.append(container);
    const area = container.querySelector("[data-area]"); area.hass = this._hass; area.value = room.area || ""; this._handlePicker(area, (value) => this._updateRoom(index, { area: value || undefined }), true);
    const colorHolder = container.querySelector("[data-color]"); const color = document.createElement("ha-selector"); color.hass = this._hass; color.selector = { ui_color: {} }; color.value = room.color || defaultColor(this._hass.areas?.[room.area]?.name); this._handlePicker(color, (value) => this._updateRoom(index, { color: value })); colorHolder.append(color);
    const icon = container.querySelector("[data-icon]"); icon.hass = this._hass; icon.value = room.icon || ""; this._handlePicker(icon, (value) => this._updateRoom(index, { icon: value || undefined }));
    const motion = container.querySelector("[data-motion]"); motion.hass = this._hass; motion.value = room.motion_entity || ""; motion.includeDomains = ["binary_sensor"]; motion.includeDeviceClasses = ["motion", "occupancy", "presence"]; motion.allowCustomEntity = true; this._handlePicker(motion, (value) => this._updateRoom(index, { motion_entity: value || undefined }));
    Object.entries(CATEGORIES).forEach(([key, meta]) => {
      const category = document.createElement("section"); category.className = "category"; category.innerHTML = `<span class="category-title">${meta.label}</span>`; container.querySelector(".entities").append(category);
      const domains = meta.domains || [meta.domain]; const selected = Array.isArray(room.entities?.[key]) ? room.entities[key] : [];
      const set = (next) => this._updateRoom(index, { entities: { ...(room.entities || {}), [key]: next } });
      selected.forEach((entity, entityIndex) => this._selectedEntityRow(category, entity, domains, (value) => set(selected.map((item, i) => i === entityIndex ? value : item)), () => set(selected.filter((_, i) => i !== entityIndex))));
      this._addEntityPicker(category, `Aggiungi ${meta.label.toLowerCase()}`, domains, (value) => set([...selected, value]));
    });
    container.querySelector("[data-remove]").addEventListener("click", () => { this._emit({ ...this._config, rooms: this._config.rooms.filter((_, i) => i !== index) }); this._render(); });
  }
}

customElements.define(CARD_TAG, CustomRoomCard);
customElements.define("custom-room-card-editor", CustomRoomCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type: CARD_TAG, name: "Custom Room Card", description: "Panoramica multi-stanza configurabile per area." });
console.info(`%c CUSTOM-ROOM-CARD %c v${VERSION} `, "color:white;background:#A66D58;font-weight:700", "color:#A66D58;background:white;font-weight:700");
