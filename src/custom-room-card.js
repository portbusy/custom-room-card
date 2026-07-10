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
  :host{display:block}.rooms{display:grid;gap:14px}.room{overflow:hidden;border-radius:24px;background:var(--card-background-color);box-shadow:0 2px 8px rgb(0 0 0 / 7%),0 0 0 1px color-mix(in srgb,var(--room-color) 27%,transparent)}.header{position:relative;display:flex;flex-direction:column;align-items:flex-start;width:100%;height:166px;box-sizing:border-box;padding:34px 36px;border:0;color:#fff;text-align:left;cursor:pointer;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 92%,transparent),color-mix(in srgb,var(--room-color) 52%,transparent) 39%,color-mix(in srgb,var(--room-color) 15%,transparent) 72%,transparent)}.title{font-size:2rem;font-weight:600;line-height:1.2;text-shadow:0 1px 3px rgb(0 0 0 / 20%)}.room-icon{position:absolute;right:30px;top:52px;--mdc-icon-size:46px;color:color-mix(in srgb,var(--room-color) 82%,white);filter:drop-shadow(0 2px 4px rgb(0 0 0 / 15%))}.summary{display:flex;align-items:center;gap:12px;margin-top:14px;font-size:1.15rem;white-space:nowrap}.summary ha-icon{--mdc-icon-size:19px;color:rgb(255 255 255 / 42%)}.summary ha-icon.active{color:#ffa726}.chips{display:flex;align-content:center;gap:12px;flex-wrap:wrap;box-sizing:border-box;min-height:128px;padding:20px 28px;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 13%,transparent),color-mix(in srgb,var(--room-color) 4%,transparent))}.chip{display:inline-flex;align-items:center;gap:8px;min-height:44px;max-width:100%;padding:0 17px;border:1px solid color-mix(in srgb,var(--room-color) 23%,transparent);border-radius:999px;background:color-mix(in srgb,var(--room-color) 7%,transparent);color:var(--primary-text-color);font:600 1rem/1 var(--primary-font-family,sans-serif);cursor:pointer;box-shadow:0 2px 2px rgb(0 0 0 / 20%)}.chip ha-icon{--mdc-icon-size:24px;color:var(--secondary-text-color)}.chip.active{border-color:rgb(255 167 38 / 52%);background:rgb(255 167 38 / 15%)}.chip.active ha-icon{color:#ffb300}.empty{box-sizing:border-box;min-height:128px;padding:48px 28px;color:var(--secondary-text-color)}@media(max-width:450px){.header{height:72px;padding:10px 16px}.chips{min-height:94px;padding:13px 14px;gap:7px}.room-icon{right:16px;top:21px;--mdc-icon-size:31px}.title{font-size:1rem}.summary{gap:6px;margin-top:5px;font-size:.72rem;max-width:85%;overflow:hidden}.summary ha-icon{--mdc-icon-size:12px}.chip{min-height:32px;padding:0 11px;gap:5px;font-size:.74rem}.chip ha-icon{--mdc-icon-size:17px}.empty{min-height:94px;padding:36px 14px;font-size:.75rem}}
`;
const EDITOR_STYLE = `
  :host{display:block}.editor{display:grid;gap:16px;padding:16px}.controls{display:flex;align-items:center;gap:10px}.room-editor{display:grid;gap:12px;padding:14px;border:1px solid var(--divider-color);border-radius:12px}.room-head{display:flex;align-items:center;justify-content:space-between}.room-head h3{margin:0;font-size:1rem}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.field{display:grid;gap:5px;font-size:.9rem}.entities{display:grid;gap:10px}.entities h4{margin:2px 0 0;font-size:.95rem}@media(max-width:520px){.fields{grid-template-columns:1fr}}
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
  _selector(holder, selector, value, change) {
    const picker = document.createElement("ha-selector"); picker.hass = this._hass; picker.selector = selector; picker.value = value; picker.addEventListener("value-changed", (event) => change(event.detail.value)); holder.append(picker);
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
    container.innerHTML = `<div class="room-head"><h3>Stanza ${index + 1}</h3><ha-icon-button data-remove icon="mdi:delete" label="Rimuovi stanza"></ha-icon-button></div><div class="fields"><div class="field"><span>Area</span><ha-area-picker data-area></ha-area-picker></div><div class="field" data-color><span>Colore base</span></div><div class="field" data-icon><span>Icona</span></div><div class="field" data-motion><span>Sensore movimento</span></div></div><div class="entities"><h4>Entità per categoria</h4></div>`;
    parent.append(container);
    const picker = container.querySelector("[data-area]"); picker.hass = this._hass; picker.value = room.area || ""; picker.addEventListener("value-changed", (e) => this._updateRoom(index, { area: e.detail.value }));
    this._selector(container.querySelector("[data-color]"), { ui_color: {} }, room.color || defaultColor(this._hass.areas?.[room.area]?.name), (value) => this._updateRoom(index, { color: value }));
    this._selector(container.querySelector("[data-icon]"), { icon: {} }, room.icon || "", (value) => this._updateRoom(index, { icon: value }));
    this._selector(container.querySelector("[data-motion]"), { entity: { filter: [{ domain: "binary_sensor", device_class: ["motion", "occupancy", "presence"] }] } }, room.motion_entity || "", (value) => this._updateRoom(index, { motion_entity: value }));
    Object.entries(CATEGORIES).forEach(([key, meta]) => { const field = document.createElement("div"); field.className = "field"; field.innerHTML = `<span>${meta.label}</span>`; container.querySelector(".entities").append(field); this._selector(field, { entity: { multiple: true, filter: (meta.domains || [meta.domain]).map((domain) => ({ domain })) } }, room.entities?.[key] || [], (value) => this._updateRoom(index, { entities: { ...(room.entities || {}), [key]: value || [] } })); });
    container.querySelector("[data-remove]").addEventListener("click", () => { this._emit({ ...this._config, rooms: this._config.rooms.filter((_, i) => i !== index) }); this._render(); });
  }
}

customElements.define(CARD_TAG, CustomRoomCard);
customElements.define("custom-room-card-editor", CustomRoomCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type: CARD_TAG, name: "Custom Room Card", description: "Panoramica multi-stanza configurabile per area." });
console.info(`%c CUSTOM-ROOM-CARD %c v${VERSION} `, "color:white;background:#A66D58;font-weight:700", "color:#A66D58;background:white;font-weight:700");
