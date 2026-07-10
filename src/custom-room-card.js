const CARD_TAG = "custom-room-card";
const VERSION = "0.1.0";

const DOMAIN_META = {
  light: { label: "Luce", icon: "mdi:lightbulb", activeIcon: "mdi:lightbulb", inactiveIcon: "mdi:lightbulb-outline" },
  cover: { label: "Tapparella", icon: "mdi:roller-shade", activeIcon: "mdi:roller-shade", inactiveIcon: "mdi:roller-shade-closed" },
  climate: { label: "Clima", icon: "mdi:air-conditioner", activeIcon: "mdi:air-conditioner", inactiveIcon: "mdi:air-conditioner" },
  media_player: { label: "Media", icon: "mdi:television", activeIcon: "mdi:television", inactiveIcon: "mdi:television-off" },
  input_boolean: { label: "Interruttore", icon: "mdi:toggle-switch", activeIcon: "mdi:toggle-switch", inactiveIcon: "mdi:toggle-switch-off-outline" },
  switch: { label: "Interruttore", icon: "mdi:toggle-switch", activeIcon: "mdi:toggle-switch", inactiveIcon: "mdi:toggle-switch-off-outline" },
};

const UNAVAILABLE = new Set(["unavailable", "unknown"]);

const CARD_STYLE = `
  :host{display:block}ha-card{overflow:hidden;border-radius:24px;background:var(--card-background-color);box-shadow:0 2px 8px rgb(0 0 0 / 7%),0 0 0 1px rgb(166 109 88 / 18%)}
  .header{position:relative;display:flex;flex-direction:column;align-items:flex-start;width:100%;min-height:116px;padding:22px 36px;border:0;color:var(--primary-text-color);text-align:left;cursor:pointer;background:linear-gradient(120deg,rgb(166 109 88 / 92%),rgb(166 109 88 / 55%) 35%,rgb(166 109 88 / 20%) 65%,transparent)}
  .title{font-size:1.8rem;font-weight:600;line-height:1.2;color:#fff;text-shadow:0 1px 3px rgb(0 0 0 / 20%)}.room-icon{position:absolute;right:32px;top:38px;--mdc-icon-size:48px;color:rgb(166 109 88 / 82%);filter:drop-shadow(0 2px 4px rgb(0 0 0 / 15%))}.summary{display:flex;align-items:center;gap:12px;margin-top:14px;color:#fff;font-size:1.1rem;white-space:nowrap}.status{--mdc-icon-size:19px;color:rgb(255 255 255 / 40%)}.status.active{color:#ffa726}.chips{display:flex;gap:12px;flex-wrap:wrap;padding:16px 28px 22px;background:linear-gradient(120deg,rgb(166 109 88 / 13%),rgb(166 109 88 / 4%))}.chip{display:inline-flex;align-items:center;gap:9px;min-height:46px;max-width:100%;padding:0 18px;border:1px solid rgb(166 109 88 / 18%);border-radius:999px;background:rgb(166 109 88 / 6%);color:var(--primary-text-color);font:600 1rem/1 var(--primary-font-family);cursor:pointer;box-shadow:0 2px 2px rgb(0 0 0 / 22%)}.chip ha-icon{--mdc-icon-size:25px;color:var(--secondary-text-color)}.chip.active{border-color:rgb(255 167 38 / 45%);background:rgb(255 167 38 / 15%)}.chip.active ha-icon{color:#ffb300}.empty{padding:20px 28px;color:var(--secondary-text-color)}@media(max-width:450px){.header{padding:20px 22px}.chips{padding:14px 18px 18px}.room-icon{right:20px}.title{font-size:1.55rem}.summary{gap:8px;font-size:1rem;max-width:85%;overflow:hidden}}
`;

const EDITOR_STYLE = `
  :host{display:block}.editor{display:grid;gap:14px;padding:16px}.editor label{display:grid;gap:6px;font-size:.9rem}.editor input,.editor select{box-sizing:border-box;width:100%;padding:9px;border:1px solid var(--divider-color);border-radius:6px;background:var(--card-background-color);color:var(--primary-text-color)}.editor .toggle{display:flex;align-items:center;gap:8px}.editor .toggle input{width:auto}
`;

function html(value) {
  return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
}

function nameFor(hass, entityId) {
  return hass.states[entityId]?.attributes?.friendly_name || entityId;
}

function isOn(state) {
  return state && !["off", "closed", "idle", "standby", "unavailable", "unknown"].includes(state.state);
}

function formatNumber(value, digits = 0) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed.toFixed(digits) : null;
}

class CustomRoomCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  static getConfigElement() {
    return document.createElement("custom-room-card-editor");
  }

  static getStubConfig(hass) {
    const firstArea = Object.keys(hass?.areas || {})[0];
    return { type: `custom:${CARD_TAG}`, ...(firstArea ? { area: firstArea } : {}) };
  }

  setConfig(config) {
    if (!config?.area) throw new Error("Definisci un'area per custom-room-card.");
    this._config = { show_lights: true, show_covers: true, show_climate: true, show_media: true, show_switches: false, ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  getCardSize() { return 3; }

  _areaEntityIds() {
    const area = this._config?.area;
    if (!area || !this._hass) return [];
    const devices = this._hass.devices || {};
    return Object.values(this._hass.entities || {})
      .filter((entry) => entry.area_id === area || (entry.device_id && devices[entry.device_id]?.area_id === area))
      .map((entry) => entry.entity_id)
      .filter((id) => this._hass.states[id]);
  }

  _findSensor(ids, classes) {
    return ids.map((id) => this._hass.states[id]).find((state) =>
      state?.attributes?.device_class && classes.includes(state.attributes.device_class) && !UNAVAILABLE.has(state.state));
  }

  _groups(ids) {
    return Object.keys(DOMAIN_META).map((domain) => ({
      domain,
      entities: ids.filter((id) => id.startsWith(`${domain}.`)),
    })).filter((group) => {
      const option = { light: "show_lights", cover: "show_covers", climate: "show_climate", media_player: "show_media", input_boolean: "show_switches", switch: "show_switches" }[group.domain];
      return group.entities.length && (!option || this._config[option] !== false);
    });
  }

  _render() {
    if (!this._config || !this._hass) return;
    const hass = this._hass;
    const ids = this._areaEntityIds();
    const area = hass.areas?.[this._config.area];
    const title = this._config.title || area?.name || this._config.area;
    const temperature = this._findSensor(ids, ["temperature"]);
    const humidity = this._findSensor(ids, ["humidity"]);
    const illuminance = this._findSensor(ids, ["illuminance"]);
    const presence = this._findSensor(ids, ["presence", "occupancy", "motion"]);
    const opening = this._findSensor(ids, ["opening", "door", "window"]);
    const metrics = [
      temperature && `${html(formatNumber(temperature.state, 1) ?? temperature.state)}°C`,
      humidity && `${html(formatNumber(humidity.state) ?? humidity.state)}%`,
      illuminance && `${html(formatNumber(illuminance.state) ?? illuminance.state)} lx`,
    ].filter(Boolean);
    const statusIcons = [
      presence && `<ha-icon title="Presenza" class="status ${isOn(presence) ? "active" : ""}" icon="mdi:circle"></ha-icon>`,
      opening && `<ha-icon title="${isOn(opening) ? "Aperto" : "Chiuso"}" class="status ${isOn(opening) ? "active" : ""}" icon="mdi:${isOn(opening) ? "window-open-variant" : "window-closed-variant"}"></ha-icon>`,
    ].filter(Boolean).join("");
    const chips = this._groups(ids).flatMap((group) => group.entities.map((entity) => this._chip(group.domain, entity))).join("");

    this.shadowRoot.innerHTML = `<style>${CARD_STYLE}</style><ha-card class="room-card">
      <button class="header" aria-label="${html(title)}">
        <ha-icon class="room-icon" icon="${html(this._config.icon || area?.icon || "mdi:home")}"></ha-icon>
        <span class="title">${html(title)}</span>
        <span class="summary">${statusIcons}${metrics.map((item) => `<span>${item}</span>`).join("")}</span>
      </button>
      ${chips ? `<div class="chips">${chips}</div>` : `<div class="empty">Nessuna entità controllabile in quest’area</div>`}
    </ha-card>`;
    this._attachEvents();
  }

  _chip(domain, entity) {
    const meta = DOMAIN_META[domain];
    const active = isOn(this._hass.states[entity]);
    const icon = active ? meta.activeIcon : meta.inactiveIcon;
    const label = nameFor(this._hass, entity) || meta.label;
    return `<button class="chip ${active ? "active" : ""}" data-entity="${html(entity)}" data-domain="${html(domain)}" aria-label="${html(label)}">
      <ha-icon icon="${html(icon)}"></ha-icon><span>${html(label)}</span>
    </button>`;
  }

  _attachEvents() {
    this.shadowRoot.querySelector(".header")?.addEventListener("click", () => {
      if (this._config.navigation_path) history.pushState(null, "", this._config.navigation_path);
      else this._fire("hass-more-info", { entityId: this._areaEntityIds()[0] });
    });
    this.shadowRoot.querySelectorAll(".chip").forEach((chip) => {
      const detail = { entityId: chip.dataset.entity };
      chip.addEventListener("click", () => {
        if (["light", "switch", "input_boolean"].includes(chip.dataset.domain)) this._hass.callService(chip.dataset.domain, "toggle", { entity_id: chip.dataset.entity });
        else this._fire("hass-more-info", detail);
      });
      chip.addEventListener("contextmenu", (event) => { event.preventDefault(); this._fire("hass-more-info", detail); });
    });
  }

  _fire(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true })); }
}

class CustomRoomCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  setConfig(config) { this._config = config; this._render(); }
  set hass(hass) { this._hass = hass; this._render(); }
  _render() {
    if (!this._hass || !this._config) return;
    const options = Object.entries(this._hass.areas || {}).map(([id, area]) => `<option value="${html(id)}" ${id === this._config.area ? "selected" : ""}>${html(area.name)}</option>`).join("");
    this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style><div class="editor">
      <label>Area<select data-key="area"><option value="">Seleziona un’area</option>${options}</select></label>
      <label>Titolo (opzionale)<input data-key="title" value="${html(this._config.title)}" placeholder="Nome dell’area"></label>
      <label>Icona (opzionale)<input data-key="icon" value="${html(this._config.icon)}" placeholder="mdi:sofa"></label>
      ${[["show_lights", "Mostra luci"], ["show_covers", "Mostra tapparelle"], ["show_climate", "Mostra clima"], ["show_media", "Mostra media"], ["show_switches", "Mostra interruttori"]].map(([key, label]) => `<label class="toggle"><input type="checkbox" data-key="${key}" ${this._config[key] !== false ? "checked" : ""}>${label}</label>`).join("")}
    </div>`;
    this.shadowRoot.querySelectorAll("[data-key]").forEach((input) => input.addEventListener("change", () => {
      const key = input.dataset.key;
      const value = input.type === "checkbox" ? input.checked : input.value;
      this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: { ...this._config, [key]: value } }, bubbles: true, composed: true }));
    }));
  }
}

customElements.define(CARD_TAG, CustomRoomCard);
customElements.define("custom-room-card-editor", CustomRoomCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type: CARD_TAG, name: "Custom Room Card", description: "Una panoramica visuale automatica per un'area." });
console.info(`%c CUSTOM-ROOM-CARD %c v${VERSION} `, "color:white;background:#A66D58;font-weight:700", "color:#A66D58;background:white;font-weight:700");
