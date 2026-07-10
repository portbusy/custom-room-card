// src/custom-room-card.js
var CARD_TAG = "custom-room-card";
var VERSION = "0.2.0";
var CATEGORIES = {
  lights: { domain: "light", label: "Luci", icon: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
  covers: { domain: "cover", label: "Tapparelle", icon: "mdi:roller-shade", off: "mdi:roller-shade-closed" },
  climate: { domain: "climate", label: "Clima", icon: "mdi:air-conditioner", off: "mdi:air-conditioner" },
  media: { domain: "media_player", label: "Media", icon: "mdi:television", off: "mdi:television-off" },
  switches: { domain: "switch", domains: ["switch", "input_boolean"], label: "Interruttori", icon: "mdi:toggle-switch", off: "mdi:toggle-switch-off-outline" }
};
var OFF = /* @__PURE__ */ new Set(["off", "closed", "idle", "standby", "unavailable", "unknown"]);
var escape = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
var on = (state) => state && !OFF.has(state.state);
var number = (value, digits = 0) => {
  const n = Number.parseFloat(value);
  return Number.isFinite(n) ? n.toFixed(digits) : null;
};
var entityName = (hass, id) => hass.states[id]?.attributes?.friendly_name || id;
var elapsed = (changed) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(changed || 0).getTime()) / 1e3));
  if (!Number.isFinite(seconds) || seconds > 31536e3) return "";
  if (seconds < 60) return "ora";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min fa`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} h fa`;
  return `${Math.floor(seconds / 86400)} g fa`;
};
var CARD_STYLE = `
  :host{display:block}.rooms{display:grid;gap:14px}.room{overflow:hidden;border-radius:24px;background:var(--card-background-color);box-shadow:0 2px 8px rgb(0 0 0 / 7%),0 0 0 1px color-mix(in srgb,var(--room-color) 27%,transparent)}.header{position:relative;display:flex;flex-direction:column;align-items:flex-start;width:100%;box-sizing:border-box;padding:16px 18px 18px;border:0;color:#fff;text-align:left;cursor:pointer;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 92%,transparent),color-mix(in srgb,var(--room-color) 55%,transparent) 35%,color-mix(in srgb,var(--room-color) 20%,transparent) 65%,transparent)}.title{font-size:1.1em;font-weight:600;line-height:1.2;text-shadow:0 1px 3px rgb(0 0 0 / 20%)}.room-icon{position:absolute;right:18px;top:16px;--mdc-icon-size:40px;color:color-mix(in srgb,var(--room-color) 82%,white);filter:drop-shadow(0 2px 4px rgb(0 0 0 / 15%))}.summary{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:.82em;white-space:nowrap}.summary ha-icon{--mdc-icon-size:18px;color:rgb(255 255 255 / 42%)}.summary ha-icon.active{color:#ffa726}.motion-time{color:rgb(255 255 255 / 75%);font-size:.9em}.chips{display:flex;align-content:center;gap:8px;flex-wrap:wrap;box-sizing:border-box;padding:8px 14px 12px;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 13%,transparent),color-mix(in srgb,var(--room-color) 4%,transparent))}.chip{display:inline-flex;align-items:center;gap:8px;min-height:36px;max-width:100%;padding:0 14px;border:1px solid color-mix(in srgb,var(--room-color) 23%,transparent);border-radius:999px;background:color-mix(in srgb,var(--room-color) 7%,transparent);color:var(--primary-text-color);font:600 .9em/1 var(--primary-font-family,sans-serif);cursor:pointer;box-shadow:0 2px 2px rgb(0 0 0 / 20%)}.chip ha-icon{--mdc-icon-size:21px;color:var(--secondary-text-color)}.chip.active{border-color:color-mix(in srgb,var(--chip-active,#ffb300) 52%,transparent);background:color-mix(in srgb,var(--chip-active,#ffb300) 15%,transparent)}.chip.active ha-icon{color:var(--chip-active,#ffb300)}.empty{padding:18px 14px;color:var(--secondary-text-color)}.status-icon{cursor:pointer}.status-metric{display:inline-flex;align-items:center;gap:4px;cursor:pointer}
`;
var EDITOR_STYLE = `
  :host{display:block}.editor{display:grid;gap:16px;padding:16px}.controls{display:flex;align-items:center;gap:10px}.room-editor{display:grid;gap:12px;padding:14px}.room-actions{display:flex;align-items:center;justify-content:flex-end;gap:4px;padding-top:4px;border-top:1px solid var(--divider-color)}.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.field{display:grid;gap:5px;font-size:.9rem}.entities{display:grid;gap:12px}.entities h4{margin:2px 0 0;font-size:.95rem}.category{display:grid;gap:8px}.category-title{font-weight:500}.entity-row{display:grid;gap:8px;padding:10px;border:1px solid var(--divider-color);border-radius:8px}.entity-main{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px}.chip-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px}@media(max-width:520px){.fields,.chip-options{grid-template-columns:1fr}}.entity-row details{margin-top:8px;font-size:.9em}.entity-row details summary{cursor:pointer;font-weight:500;color:var(--secondary-text-color)}.chip-conditions-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:8px}
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
var CustomRoomCard = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._clock = null;
  }
  static getConfigElement() {
    return document.createElement("custom-room-card-editor");
  }
  static getStubConfig(hass) {
    const area = Object.keys(hass?.areas || {})[0];
    return { type: `custom:${CARD_TAG}`, sort_by_motion: false, rooms: area ? [{ area, entities: {} }] : [] };
  }
  setConfig(config) {
    const rooms = Array.isArray(config.rooms) && config.rooms.length ? config.rooms : config.area ? [{ area: config.area, title: config.title, icon: config.icon, color: config.color, entities: config.entities || {} }] : [];
    this._config = { ...config, rooms: rooms.map((room) => ({ entities: {}, ...room })) };
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._render();
  }
  connectedCallback() {
    this._clock = window.setInterval(() => this._render(), 6e4);
  }
  disconnectedCallback() {
    if (this._clock) window.clearInterval(this._clock);
    this._clock = null;
  }
  getCardSize() {
    return Math.max(2, (this._config?.rooms?.length || 1) * 2);
  }
  _areaIds(area) {
    const devices = this._hass.devices || {};
    return Object.values(this._hass.entities || {}).filter((e) => e.area_id === area || e.device_id && devices[e.device_id]?.area_id === area).map((e) => e.entity_id).filter((id) => this._hass.states[id]);
  }
  _sensor(ids, classes) {
    return ids.map((id) => this._hass.states[id]).find((s) => classes.includes(s?.attributes?.device_class) && !OFF.has(s?.state));
  }
  _motion(room, ids) {
    return room.motion_entity ? this._hass.states[room.motion_entity] : this._sensor(ids, ["motion", "occupancy", "presence"]);
  }
  _opening(room, ids) {
    return room.opening_entity ? this._hass.states[room.opening_entity] : this._sensor(ids, ["opening", "door", "window"]);
  }
  _openingIcon(opening) {
    if (!opening) return "";
    const active = on(opening);
    const deviceClass = opening.attributes?.device_class;
    if (deviceClass === "door") return active ? "mdi:door-open" : "mdi:door-closed";
    if (deviceClass === "garage_door") return active ? "mdi:garage-open" : "mdi:garage";
    return active ? "mdi:window-open-variant" : "mdi:window-closed-variant";
  }
  _sort(rooms) {
    if (!this._config.sort_by_motion) return rooms;
    return [...rooms].sort((a, b) => {
      const ma = this._motion(a.room, a.ids);
      const mb = this._motion(b.room, b.ids);
      if (on(ma) !== on(mb)) return on(mb) - on(ma);
      return new Date(mb?.last_changed || 0) - new Date(ma?.last_changed || 0);
    });
  }
  _showChip(chip) {
    if (!chip.condition_entity) return true;
    const stateObj = this._hass.states[chip.condition_entity];
    if (!stateObj) return false;
    const isMatched = stateObj.state === (chip.condition_state || "on");
    return chip.condition_invert ? !isMatched : isMatched;
  }
  _chips(room, roomIndex) {
    return Object.entries(room.entities || {}).flatMap(([category, selected]) => {
      const domains = CATEGORIES[category]?.domains || [CATEGORIES[category]?.domain];
      const selectedArray = Array.isArray(selected) ? selected : selected ? [selected] : [];
      return selectedArray.map((item, chipIndex) => {
        const chip = typeof item === "string" ? { entity: item } : item;
        return { ...chip, roomIndex, category, chipIndex };
      }).filter((chip) => chip.entity && domains.includes(chip.entity.split(".")[0]) && this._hass.states[chip.entity] && this._showChip(chip));
    });
  }
  _render() {
    if (!this._hass || !this._config) return;
    const rooms = this._sort(this._config.rooms.map((room, roomIndex) => ({ room, ids: this._areaIds(room.area), roomIndex })));
    this.shadowRoot.innerHTML = `<style>${CARD_STYLE}</style><div class="rooms">${rooms.map(({ room, ids, roomIndex }) => this._room(room, ids, roomIndex)).join("") || `<div class="empty">Aggiungi una stanza dalla configurazione della card.</div>`}</div>`;
    this.shadowRoot.querySelectorAll(".header").forEach((button) => button.addEventListener("click", () => this._fire("hass-more-info", { entityId: button.dataset.entity })));
    this.shadowRoot.querySelectorAll(".status-icon, .status-metric").forEach((element) => {
      element.addEventListener("click", (event) => {
        event.stopPropagation();
        this._fire("hass-more-info", { entityId: element.dataset.entity });
      });
    });
    this.shadowRoot.querySelectorAll(".chip").forEach((button) => {
      const getActionConfig = () => {
        const roomIndex = Number.parseInt(button.dataset.roomIndex);
        const category = button.dataset.category;
        const chipIndex = Number.parseInt(button.dataset.chipIndex);
        const room = this._config.rooms[roomIndex];
        const rawSelected = room.entities?.[category];
        const selectedArray = Array.isArray(rawSelected) ? rawSelected : rawSelected ? [rawSelected] : [];
        const item = selectedArray[chipIndex];
        const chip = typeof item === "string" ? { entity: item } : item;
        const defaultTapAction = ["light", "switch", "input_boolean"].includes(chip.entity.split(".")[0]) ? "toggle" : "more-info";
        return {
          entity: chip.entity,
          tap_action: chip.tap_action || { action: defaultTapAction },
          hold_action: chip.hold_action || { action: "more-info" }
        };
      };
      button.addEventListener("click", () => {
        const actionConfig = getActionConfig();
        const actionEvent = new CustomEvent("hass-action", {
          bubbles: true,
          composed: true,
          detail: {
            config: actionConfig,
            action: "tap"
          }
        });
        button.dispatchEvent(actionEvent);
      });
      button.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        const actionConfig = getActionConfig();
        const actionEvent = new CustomEvent("hass-action", {
          bubbles: true,
          composed: true,
          detail: {
            config: actionConfig,
            action: "hold"
          }
        });
        button.dispatchEvent(actionEvent);
      });
    });
  }
  _room(room, ids, roomIndex) {
    const area = this._hass.areas?.[room.area];
    const title = room.title || area?.name || room.area;
    const temp = room.temperature_entity ? this._hass.states[room.temperature_entity] : this._sensor(ids, ["temperature"]);
    const humidity = room.humidity_entity ? this._hass.states[room.humidity_entity] : this._sensor(ids, ["humidity"]);
    const lux = room.illuminance_entity ? this._hass.states[room.illuminance_entity] : this._sensor(ids, ["illuminance"]);
    const motion = this._motion(room, ids);
    const opening = this._opening(room, ids);
    const tempValue = temp && `${escape(number(temp.state, 1) ?? temp.state)}\xB0C`;
    const humidityValue = humidity && `${escape(number(humidity.state) ?? humidity.state)}%`;
    const luxValue = lux && `${escape(number(lux.state) ?? lux.state)} lx`;
    const tempElement = temp ? `<span class="status-metric" data-entity="${escape(room.temperature_entity || temp.entity_id)}"><ha-icon icon="mdi:thermometer"></ha-icon><span>${tempValue}</span></span>` : "";
    const humidityElement = humidity ? `<span class="status-metric" data-entity="${escape(room.humidity_entity || humidity.entity_id)}"><ha-icon icon="mdi:water-percent"></ha-icon><span>${humidityValue}</span></span>` : "";
    const luxElement = lux ? `<span class="status-metric" data-entity="${escape(room.illuminance_entity || lux.entity_id)}"><ha-icon icon="mdi:weather-sunny"></ha-icon><span>${luxValue}</span></span>` : "";
    const metrics = [tempElement, humidityElement, luxElement].filter(Boolean).join("");
    const status = [
      motion && `<ha-icon class="status-icon ${on(motion) ? "active" : ""}" icon="mdi:circle" data-entity="${escape(room.motion_entity || motion.entity_id)}"></ha-icon>`,
      opening && `<ha-icon class="status-icon ${on(opening) ? "active" : ""}" icon="${escape(this._openingIcon(opening))}" data-entity="${escape(room.opening_entity || opening.entity_id)}"></ha-icon>`
    ].filter(Boolean).join("");
    const chips = this._chips(room, roomIndex);
    const color = room.color || defaultColor(title);
    const lastMotion = motion ? elapsed(motion.last_changed) : "";
    return `<section class="room" style="--room-color:${escape(color)}"><button class="header" data-entity="${escape(room.motion_entity || ids[0] || "")}" aria-label="${escape(title)}"><ha-icon class="room-icon" icon="${escape(room.icon || area?.icon || "mdi:home")}"></ha-icon><span class="title">${escape(title)}</span><span class="summary">${status}${metrics}${lastMotion ? `<span class="motion-time">Movimento: ${lastMotion}</span>` : ""}</span></button>${chips.length ? `<div class="chips">${chips.map((chip) => this._chip(chip)).join("")}</div>` : `<div class="empty">Nessuna entit\xE0 selezionata</div>`}</section>`;
  }
  _chip(chip) {
    const id = chip.entity;
    const domain = id.split(".")[0];
    const category = Object.values(CATEGORIES).find((item) => item.domain === domain) || CATEGORIES.switches;
    const active = on(this._hass.states[id]);
    const icon = active ? chip.active_icon || chip.icon || category.icon : chip.icon || category.off;
    return `<button class="chip ${active ? "active" : ""}" style="--chip-active:${escape(chip.color || "#ffb300")}" data-entity="${escape(id)}" data-domain="${escape(domain)}" data-room-index="${chip.roomIndex}" data-category="${escape(chip.category)}" data-chip-index="${chip.chipIndex}"><ha-icon icon="${escape(icon)}"></ha-icon><span>${escape(chip.name || entityName(this._hass, id))}</span></button>`;
  }
  _fire(type, detail) {
    this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true }));
  }
};
var CustomRoomCardEditor = class extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }
  setConfig(config) {
    const rooms = Array.isArray(config.rooms) && config.rooms.length ? config.rooms : config.area ? [{ area: config.area, title: config.title, icon: config.icon, color: config.color, entities: config.entities || {} }] : [];
    const { area, entities, ...rest } = config;
    const next = { ...rest, rooms };
    if (JSON.stringify(next) === JSON.stringify(this._config)) return;
    this._config = next;
    if (this._isUpdating) {
      this._isUpdating = false;
      return;
    }
    this._render();
  }
  set hass(hass) {
    const needsInitialRender = !this._hass && this._config;
    this._hass = hass;
    if (needsInitialRender) this._render();
  }
  _emit(config) {
    this._config = config;
    this._isUpdating = true;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  _updateRoom(index, changes) {
    const rooms = this._config.rooms.map((room, i) => i === index ? { ...room, ...changes } : room);
    this._emit({ ...this._config, rooms });
  }
  _moveRoom(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= this._config.rooms.length) return;
    const rooms = [...this._config.rooms];
    [rooms[index], rooms[target]] = [rooms[target], rooms[index]];
    this._emit({ ...this._config, rooms });
    this._render();
  }
  _handlePicker(picker, callback, rerender = false) {
    picker.addEventListener("value-changed", (event) => {
      if (event.target !== picker) return;
      callback(event.detail.value);
      if (rerender) this._render();
    });
  }
  _addEntityPicker(holder, label, domains, onPick) {
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass;
    picker.label = label;
    picker.includeDomains = domains;
    picker.value = "";
    picker.allowCustomEntity = true;
    this._handlePicker(picker, (value) => {
      if (value) onPick(value);
    }, true);
    holder.append(picker);
  }
  _saveState() {
    if (!this.shadowRoot) return { expanded: [], openDetails: [] };
    const expanded = Array.from(this.shadowRoot.querySelectorAll("ha-expansion-panel")).map((panel, index) => panel.expanded ? index : -1).filter((index) => index !== -1);
    const openDetails = Array.from(this.shadowRoot.querySelectorAll("details")).filter((d) => d.open).map((d) => d.getAttribute("data-details-id"));
    return { expanded, openDetails };
  }
  _restoreState(state) {
    if (!this.shadowRoot) return;
    const panels = this.shadowRoot.querySelectorAll("ha-expansion-panel");
    state.expanded.forEach((index) => {
      if (panels[index]) panels[index].expanded = true;
    });
    state.openDetails.forEach((id) => {
      const details = this.shadowRoot.querySelector(`details[data-details-id="${id}"]`);
      if (details) details.open = true;
    });
  }
  _selectedEntityRow(holder, chip, domains, onChange, onRemove, roomIndex, category, entityIndex) {
    const row = document.createElement("div");
    row.className = "entity-row";
    const main = document.createElement("div");
    main.className = "entity-main";
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass;
    picker.value = chip.entity;
    picker.includeDomains = domains;
    picker.allowCustomEntity = true;
    this._handlePicker(picker, (value) => value ? onChange({ ...chip, entity: value }) : onRemove(), true);
    const remove = document.createElement("ha-icon-button");
    remove.label = "Rimuovi entit\xE0";
    const removeIcon = document.createElement("ha-icon");
    removeIcon.icon = "mdi:close";
    remove.append(removeIcon);
    remove.addEventListener("click", () => {
      onRemove();
      this._render();
    });
    main.append(picker, remove);
    row.append(main);
    const options = document.createElement("div");
    options.className = "chip-options";
    const name = document.createElement("ha-input");
    name.label = "Etichetta";
    name.value = chip.name || "";
    name.addEventListener("change", (event) => onChange({ ...chip, name: event.currentTarget.value || void 0 }));
    const icon = document.createElement("ha-icon-picker");
    icon.hass = this._hass;
    icon.label = "Icona";
    icon.value = chip.icon || "";
    this._handlePicker(icon, (value) => onChange({ ...chip, icon: value || void 0 }));
    const activeIcon = document.createElement("ha-icon-picker");
    activeIcon.hass = this._hass;
    activeIcon.label = "Icona attiva";
    activeIcon.value = chip.active_icon || "";
    this._handlePicker(activeIcon, (value) => onChange({ ...chip, active_icon: value || void 0 }));
    const color = document.createElement("ha-selector");
    color.hass = this._hass;
    color.selector = { ui_color: {} };
    color.value = chip.color || "#ffb300";
    this._handlePicker(color, (value) => onChange({ ...chip, color: value || void 0 }));
    const tapAction = document.createElement("ha-selector");
    tapAction.hass = this._hass;
    tapAction.label = "Azione tocco";
    tapAction.selector = { ui_action: {} };
    tapAction.value = chip.tap_action || { action: "none" };
    this._handlePicker(tapAction, (value) => onChange({ ...chip, tap_action: value || void 0 }));
    const holdAction = document.createElement("ha-selector");
    holdAction.hass = this._hass;
    holdAction.label = "Pressione prolungata";
    holdAction.selector = { ui_action: {} };
    holdAction.value = chip.hold_action || { action: "none" };
    this._handlePicker(holdAction, (value) => onChange({ ...chip, hold_action: value || void 0 }));
    options.append(name, icon, activeIcon, color, tapAction, holdAction);
    row.append(options);
    const details = document.createElement("details");
    details.setAttribute("data-details-id", `${roomIndex}-${category}-${entityIndex}`);
    const summary = document.createElement("summary");
    summary.textContent = "Condizioni di visibilit\xE0";
    details.append(summary);
    const condGrid = document.createElement("div");
    condGrid.className = "chip-conditions-grid";
    const condEntity = document.createElement("ha-entity-picker");
    condEntity.hass = this._hass;
    condEntity.label = "Entit\xE0 condizione";
    condEntity.value = chip.condition_entity || "";
    this._handlePicker(condEntity, (value) => onChange({ ...chip, condition_entity: value || void 0 }));
    const condState = document.createElement("ha-input");
    condState.label = "Stato atteso";
    condState.value = chip.condition_state || "on";
    condState.addEventListener("change", (event) => onChange({ ...chip, condition_state: event.currentTarget.value || void 0 }));
    const condInvertDiv = document.createElement("div");
    condInvertDiv.className = "field";
    condInvertDiv.innerHTML = `<span>Inverti condizione</span><ha-switch id="invert" ${chip.condition_invert ? "checked" : ""}></ha-switch>`;
    condInvertDiv.querySelector("#invert").addEventListener("change", (event) => onChange({ ...chip, condition_invert: event.currentTarget.checked || void 0 }));
    condGrid.append(condEntity, condState, condInvertDiv);
    details.append(condGrid);
    row.append(details);
    holder.append(row);
  }
  _render() {
    if (!this._hass || !this._config) return;
    this._isUpdating = false;
    const state = this._saveState();
    this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style><div class="editor"><div class="controls"><ha-switch id="sort" ${this._config.sort_by_motion ? "checked" : ""}></ha-switch><label for="sort">Ordina le stanze per movimento</label></div><div id="rooms"></div><ha-button id="add">Aggiungi stanza</ha-button></div>`;
    const rooms = this.shadowRoot.querySelector("#rooms");
    this._config.rooms.forEach((room, index) => this._roomEditor(rooms, room, index));
    this.shadowRoot.querySelector("#sort").addEventListener("change", (event) => this._emit({ ...this._config, sort_by_motion: event.currentTarget.checked }));
    this.shadowRoot.querySelector("#add").addEventListener("click", () => {
      this._emit({ ...this._config, rooms: [...this._config.rooms, { entities: {} }] });
      this._render();
    });
    this._restoreState(state);
  }
  _roomEditor(parent, room, index) {
    const panel = document.createElement("ha-expansion-panel");
    panel.header = room.title || this._hass.areas?.[room.area]?.name || `Stanza ${index + 1}`;
    panel.outlined = true;
    const container = document.createElement("section");
    container.className = "room-editor";
    container.innerHTML = `<div class="fields"><div class="field"><span>Area</span><ha-area-picker data-area></ha-area-picker></div><div class="field"><span>Titolo personalizzato</span><ha-input data-title label="Titolo"></ha-input></div><div class="field" data-color><span>Colore base</span></div><div class="field"><span>Icona</span><ha-icon-picker data-icon label="Icona"></ha-icon-picker></div><div class="field"><span>Sensore movimento</span><ha-entity-picker data-motion label="Movimento"></ha-entity-picker></div><div class="field"><span>Sensore apertura</span><ha-entity-picker data-opening label="Apertura"></ha-entity-picker></div><div class="field"><span>Sensore temperatura</span><ha-entity-picker data-temperature label="Temperatura"></ha-entity-picker></div><div class="field"><span>Sensore umidit\xE0</span><ha-entity-picker data-humidity label="Umidit\xE0"></ha-entity-picker></div><div class="field"><span>Sensore luminosit\xE0</span><ha-entity-picker data-illuminance label="Luminosit\xE0"></ha-entity-picker></div></div><div class="entities"><h4>Entit\xE0 per categoria</h4></div><div class="room-actions"><ha-icon-button data-up label="Sposta stanza in alto"><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button><ha-icon-button data-down label="Sposta stanza in basso"><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button><ha-icon-button data-remove label="Rimuovi stanza"><ha-icon icon="mdi:delete"></ha-icon></ha-icon-button></div>`;
    panel.append(container);
    parent.append(panel);
    const area = container.querySelector("[data-area]");
    area.hass = this._hass;
    area.value = room.area || "";
    this._handlePicker(area, (value) => this._updateRoom(index, { area: value || void 0 }), true);
    const title = container.querySelector("[data-title]");
    title.value = room.title || "";
    title.addEventListener("change", (event) => this._updateRoom(index, { title: event.currentTarget.value || void 0 }));
    const colorHolder = container.querySelector("[data-color]");
    const color = document.createElement("ha-selector");
    color.hass = this._hass;
    color.selector = { ui_color: {} };
    color.value = room.color || defaultColor(this._hass.areas?.[room.area]?.name);
    this._handlePicker(color, (value) => this._updateRoom(index, { color: value }));
    colorHolder.append(color);
    const icon = container.querySelector("[data-icon]");
    icon.hass = this._hass;
    icon.value = room.icon || "";
    this._handlePicker(icon, (value) => this._updateRoom(index, { icon: value || void 0 }));
    const motion = container.querySelector("[data-motion]");
    motion.hass = this._hass;
    motion.value = room.motion_entity || "";
    motion.includeDomains = ["binary_sensor"];
    motion.includeDeviceClasses = ["motion", "occupancy", "presence"];
    motion.allowCustomEntity = true;
    this._handlePicker(motion, (value) => this._updateRoom(index, { motion_entity: value || void 0 }));
    const opening = container.querySelector("[data-opening]");
    opening.hass = this._hass;
    opening.value = room.opening_entity || "";
    opening.includeDomains = ["binary_sensor"];
    opening.includeDeviceClasses = ["opening", "door", "window"];
    opening.allowCustomEntity = true;
    this._handlePicker(opening, (value) => this._updateRoom(index, { opening_entity: value || void 0 }));
    const tempPicker = container.querySelector("[data-temperature]");
    tempPicker.hass = this._hass;
    tempPicker.value = room.temperature_entity || "";
    tempPicker.includeDomains = ["sensor"];
    tempPicker.includeDeviceClasses = ["temperature"];
    tempPicker.allowCustomEntity = true;
    this._handlePicker(tempPicker, (value) => this._updateRoom(index, { temperature_entity: value || void 0 }));
    const humPicker = container.querySelector("[data-humidity]");
    humPicker.hass = this._hass;
    humPicker.value = room.humidity_entity || "";
    humPicker.includeDomains = ["sensor"];
    humPicker.includeDeviceClasses = ["humidity"];
    humPicker.allowCustomEntity = true;
    this._handlePicker(humPicker, (value) => this._updateRoom(index, { humidity_entity: value || void 0 }));
    const luxPicker = container.querySelector("[data-illuminance]");
    luxPicker.hass = this._hass;
    luxPicker.value = room.illuminance_entity || "";
    luxPicker.includeDomains = ["sensor"];
    luxPicker.includeDeviceClasses = ["illuminance"];
    luxPicker.allowCustomEntity = true;
    this._handlePicker(luxPicker, (value) => this._updateRoom(index, { illuminance_entity: value || void 0 }));
    Object.entries(CATEGORIES).forEach(([key, meta]) => {
      const category = document.createElement("section");
      category.className = "category";
      category.innerHTML = `<span class="category-title">${meta.label}</span>`;
      container.querySelector(".entities").append(category);
      const domains = meta.domains || [meta.domain];
      const rawSelected = room.entities?.[key];
      const selectedArray = Array.isArray(rawSelected) ? rawSelected : rawSelected ? [rawSelected] : [];
      const selected = selectedArray.map((item) => typeof item === "string" ? { entity: item } : item).filter((item) => item?.entity);
      const set = (next) => this._updateRoom(index, { entities: { ...room.entities || {}, [key]: next } });
      selected.forEach((chip, entityIndex) => this._selectedEntityRow(category, chip, domains, (value) => set(selected.map((item, i) => i === entityIndex ? value : item)), () => set(selected.filter((_, i) => i !== entityIndex)), index, key, entityIndex));
      this._addEntityPicker(category, `Aggiungi ${meta.label.toLowerCase()}`, domains, (value) => set([...selected, { entity: value }]));
    });
    const up = container.querySelector("[data-up]");
    up.disabled = index === 0;
    up.addEventListener("click", () => this._moveRoom(index, -1));
    const down = container.querySelector("[data-down]");
    down.disabled = index === this._config.rooms.length - 1;
    down.addEventListener("click", () => this._moveRoom(index, 1));
    container.querySelector("[data-remove]").addEventListener("click", () => {
      this._emit({ ...this._config, rooms: this._config.rooms.filter((_, i) => i !== index) });
      this._render();
    });
  }
};
customElements.define(CARD_TAG, CustomRoomCard);
customElements.define("custom-room-card-editor", CustomRoomCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type: CARD_TAG, name: "Custom Room Card", description: "Panoramica multi-stanza configurabile per area." });
console.info(`%c CUSTOM-ROOM-CARD %c v${VERSION} `, "color:white;background:#A66D58;font-weight:700", "color:#A66D58;background:white;font-weight:700");
