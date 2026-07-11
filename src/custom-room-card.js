const CARD_TAG = "custom-room-card";
const VERSION = "0.3.26";
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
const elapsed = (changed, hass) => {
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(changed || 0).getTime()) / 1000));
  if (!Number.isFinite(seconds) || seconds > 31536000) return "";
  
  const lang = (hass && hass.language) ? hass.language.split("-")[0] : "en";
  if (lang === "it") {
    if (seconds < 60) return "ora";
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min fa`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} h fa`;
    return `${Math.floor(seconds / 86400)} g fa`;
  }
  if (lang === "fr") {
    if (seconds < 60) return "maintenant";
    if (seconds < 3600) return `il y a ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `il y a ${Math.floor(seconds / 3600)} h`;
    return `il y a ${Math.floor(seconds / 86400)} j`;
  }
  if (lang === "es") {
    if (seconds < 60) return "ahora";
    if (seconds < 3600) return `hace ${Math.floor(seconds / 60)} min`;
    if (seconds < 86400) return `hace ${Math.floor(seconds / 3600)} h`;
    return `hace ${Math.floor(seconds / 86400)} d`;
  }
  if (lang === "de") {
    if (seconds < 60) return "jetzt";
    if (seconds < 3600) return `vor ${Math.floor(seconds / 60)} Min.`;
    if (seconds < 86400) return `vor ${Math.floor(seconds / 3600)} Std.`;
    return `vor ${Math.floor(seconds / 86400)} T.`;
  }
  // Fallback (English)
  if (seconds < 60) return "now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

const TRANSLATIONS = {
  en: {
    empty_card: "Add a room from the card configuration.",
    good_morning: "Good morning",
    good_afternoon: "Good afternoon",
    good_evening: "Good evening",
    good_night: "Good night",
    default_user: "User",
    not_available: "N/A",
    card_type: "Card Type",
    rooms: "Rooms",
    weather: "Weather",
    sort_by_motion: "Sort rooms by motion",
    show_entity_icons: "Use real entity icons",
    category_order: "Category ordering",
    add_room: "Add room",
    area: "Area",
    custom_title: "Custom title",
    base_color: "Base color",
    icon_optional: "Icon (optional)",
    motion_sensor: "Motion sensor",
    opening_sensor: "Opening sensor",
    temperature_sensor: "Temperature sensor",
    humidity_sensor: "Humidity sensor",
    illuminance_sensor: "Illuminance sensor",
    tap_action: "Tap action",
    hold_action: "Hold action",
    lights: "Lights",
    covers: "Covers",
    climate: "Climate",
    media: "Media",
    switches: "Switches",
    appearance: "Appearance",
    label_optional: "Label (optional)",
    active_icon: "Active icon",
    visibility_conditions: "Visibility conditions",
    room_visibility_conditions: "Room visibility conditions",
    additional_summary_entities: "Additional summary entities",
    add_entity: "Add entity",
    add_chip: "Add chip",
    remove_entity: "Remove entity",
    sposta_alto: "Move up",
    sposta_basso: "Move down",
    rimuovi_stanza: "Remove room",
    personalizza: "Customize",
    no_entities: "No entities selected",
    apparent_temp: "Apparent temperature",
    weather_condition: "Weather condition (text)",
    high_temp: "Max temperature",
    low_temp: "Min temperature",
    precip_probability: "Precipitation probability",
    animated_icon: "Animated icon sensor",
    sunset_sensor: "Sunset sensor",
    room: "Room",
    entities_by_category: "Entities by category",
    actions: "Actions",
    show_dropdown: "Show dropdown list"
  },
  it: {
    empty_card: "Aggiungi una stanza dalla configurazione della card.",
    good_morning: "Buongiorno",
    good_afternoon: "Buon pomeriggio",
    good_evening: "Buonasera",
    good_night: "Buonanotte",
    default_user: "Utente",
    not_available: "N/D",
    card_type: "Tipologia Card",
    rooms: "Stanze",
    weather: "Meteo",
    sort_by_motion: "Ordina le stanze per movimento",
    show_entity_icons: "Usa icone reali delle entità",
    category_order: "Ordinamento categorie",
    add_room: "Aggiungi stanza",
    area: "Area",
    custom_title: "Titolo personalizzato",
    base_color: "Colore base",
    icon_optional: "Icona (opzionale)",
    motion_sensor: "Sensore di movimento",
    opening_sensor: "Sensore di apertura",
    temperature_sensor: "Sensore di temperatura",
    humidity_sensor: "Sensore di umidità",
    illuminance_sensor: "Sensore di luminosità",
    tap_action: "Azione tocco",
    hold_action: "Pressione prolungata",
    lights: "Luci",
    covers: "Tapparelle",
    climate: "Clima",
    media: "Media",
    switches: "Interruttori",
    appearance: "Aspetto",
    label_optional: "Etichetta (opzionale)",
    active_icon: "Icona attiva",
    visibility_conditions: "Condizioni di visibilità",
    room_visibility_conditions: "Condizioni di visibilità stanza",
    additional_summary_entities: "Entità riepilogo aggiuntive",
    add_entity: "Aggiungi entità",
    add_chip: "Aggiungi chip",
    remove_entity: "Rimuovi entità",
    sposta_alto: "Sposta in alto",
    sposta_basso: "Sposta in basso",
    rimuovi_stanza: "Rimuovi stanza",
    personalizza: "Personalizza",
    no_entities: "Nessuna entità selezionata",
    apparent_temp: "Temperatura apparente",
    weather_condition: "Condizione tradotta",
    high_temp: "Temperatura massima",
    low_temp: "Temperatura minima",
    precip_probability: "Probabilità precipitazioni",
    animated_icon: "Icona animata",
    sunset_sensor: "Tramonto (sun.sun)",
    room: "Stanza",
    entities_by_category: "Entità per categoria",
    actions: "Azioni",
    show_dropdown: "Mostra menu a discesa"
  },
  fr: {
    empty_card: "Ajoutez une pièce depuis la configuration de la carte.",
    good_morning: "Bonjour",
    good_afternoon: "Bon après-midi",
    good_evening: "Bonsoir",
    good_night: "Bonne nuit",
    default_user: "Utilisateur",
    not_available: "N/D",
    card_type: "Type de Carte",
    rooms: "Pièces",
    weather: "Météo",
    sort_by_motion: "Trier les pièces par mouvement",
    show_entity_icons: "Utiliser de vraies icônes d'entités",
    category_order: "Ordre des catégories",
    add_room: "Ajouter une pièce",
    area: "Zone",
    custom_title: "Titre personnalisé",
    base_color: "Couleur de base",
    icon_optional: "Icône (optionnel)",
    motion_sensor: "Détecteur de mouvement",
    opening_sensor: "Capteur d'ouverture",
    temperature_sensor: "Capteur de température",
    humidity_sensor: "Capteur d'humidité",
    illuminance_sensor: "Capteur de luminosité",
    tap_action: "Action au tap",
    hold_action: "Action au hold",
    lights: "Lumières",
    covers: "Volets",
    climate: "Climatisation",
    media: "Médias",
    switches: "Interrupteurs",
    appearance: "Apparence",
    label_optional: "Étiquette (optionnel)",
    active_icon: "Icona active",
    visibility_conditions: "Conditions de visibilité",
    room_visibility_conditions: "Conditions de visibilité de la pièce",
    additional_summary_entities: "Entités de résumé supplémentaires",
    add_entity: "Ajouter une entité",
    add_chip: "Ajouter un badge",
    remove_entity: "Supprimer l'entité",
    sposta_alto: "Déplacer vers le haut",
    sposta_basso: "Déplacer vers le bas",
    rimuovi_stanza: "Supprimer la pièce",
    personalizza: "Personnaliser",
    no_entities: "Aucune entité sélectionnée",
    apparent_temp: "Température ressentie",
    weather_condition: "Condition météo (texte)",
    high_temp: "Température maximale",
    low_temp: "Température minimale",
    precip_probability: "Probabilité de précipitations",
    animated_icon: "Capteur d'icône animée",
    sunset_sensor: "Capteur de coucher du soleil",
    room: "Pièce",
    entities_by_category: "Entités par catégorie",
    actions: "Actions",
    show_dropdown: "Afficher la liste déroulante"
  },
  es: {
    empty_card: "Agrega una habitación desde la configuración de la tarjeta.",
    good_morning: "Buenos días",
    good_afternoon: "Buenas tardes",
    good_evening: "Buenas noches",
    good_night: "Buenas noches",
    default_user: "Usuario",
    not_available: "N/D",
    card_type: "Tipo de Tarjeta",
    rooms: "Habitaciones",
    weather: "Meteorología",
    sort_by_motion: "Ordenar habitaciones por movimiento",
    show_entity_icons: "Usar iconos reales de entidades",
    category_order: "Orden de catégories",
    add_room: "Agregar habitación",
    area: "Zona",
    custom_title: "Título personalizado",
    base_color: "Color base",
    icon_optional: "Icono (opcional)",
    motion_sensor: "Sensor de movimiento",
    opening_sensor: "Sensor de apertura",
    temperature_sensor: "Sensor de temperatura",
    humidity_sensor: "Sensor de humedad",
    illuminance_sensor: "Sensor de luminosidad",
    tap_action: "Acción de toque",
    hold_action: "Acción de pulsar y mantener",
    lights: "Luces",
    covers: "Persianas",
    climate: "Clima",
    media: "Medios",
    switches: "Interruptores",
    appearance: "Apariencia",
    label_optional: "Etiqueta (opcional)",
    active_icon: "Icono activo",
    visibility_conditions: "Condiciones de visibilidad",
    room_visibility_conditions: "Condiciones de visibilidad de la habitación",
    additional_summary_entities: "Entidades de resumen adicionales",
    add_entity: "Agregar entidad",
    add_chip: "Agregar chip",
    remove_entity: "Eliminar entidad",
    sposta_alto: "Mover arriba",
    sposta_basso: "Mover abajo",
    rimuovi_stanza: "Eliminar habitación",
    personalizza: "Personalizar",
    no_entities: "No se seleccionó ninguna entidad",
    apparent_temp: "Temperatura aparente",
    weather_condition: "Condición climática (texto)",
    high_temp: "Temperatura máxima",
    low_temp: "Temperatura mínima",
    precip_probability: "Probabilidad de precipitación",
    animated_icon: "Sensor de icono animado",
    sunset_sensor: "Sensor de puesta de sol",
    room: "Habitación",
    entities_by_category: "Entidades por categoría",
    actions: "Acciones",
    show_dropdown: "Mostrar menú desplegable"
  },
  de: {
    empty_card: "Füge einen Raum in der Kartenkonfiguration hinzu.",
    good_morning: "Guten Morgen",
    good_afternoon: "Guten Tag",
    good_evening: "Guten Abend",
    good_night: "Gute Nacht",
    default_user: "Benutzer",
    not_available: "N/A",
    card_type: "Kartentyp",
    rooms: "Räume",
    weather: "Wetter",
    sort_by_motion: "Räume nach Bewegung sortieren",
    show_entity_icons: "Echte Entitätssymbole verwenden",
    category_order: "Reihenfolge der Kategorien",
    add_room: "Raum hinzufügen",
    area: "Bereich",
    custom_title: "Benutzerdefinierter Titel",
    base_color: "Basisfarbe",
    icon_optional: "Symbol (optional)",
    motion_sensor: "Bewegungsmelder",
    opening_sensor: "Öffnungssensor",
    temperature_sensor: "Temperatursensor",
    humidity_sensor: "Feuchtigkeitssensor",
    illuminance_sensor: "Helligkeitssensor",
    tap_action: "Tippen-Aktion",
    hold_action: "Gedrückthalten-Aktion",
    lights: "Lichter",
    covers: "Rollos",
    climate: "Klima",
    media: "Medien",
    switches: "Schalter",
    appearance: "Aussehen",
    label_optional: "Beschriftung (optional)",
    active_icon: "Aktives Symbol",
    visibility_conditions: "Sichtbarkeitsbedingungen",
    room_visibility_conditions: "Sichtbarkeitsbedingungen für den Raum",
    additional_summary_entities: "Zusätzliche Zusammenfassungsentitäten",
    add_entity: "Entität hinzufügen",
    add_chip: "Chip hinzufügen",
    remove_entity: "Entität entfernen",
    sposta_alto: "Nach oben verschieben",
    sposta_basso: "Nach unten verschieben",
    rimuovi_stanza: "Raum entfernen",
    personalizza: "Anpassen",
    no_entities: "Keine Entitäten ausgewählt",
    apparent_temp: "Gefühlte Temperatur",
    weather_condition: "Wetterbedingung (Text)",
    high_temp: "Höchsttemperatur",
    low_temp: "Tiefsttemperatur",
    precip_probability: "Niederschlagswahrscheinlichkeit",
    animated_icon: "Sensor für animiertes Symbol",
    sunset_sensor: "Sonnenuntergangs-Sensor",
    room: "Raum",
    entities_by_category: "Entitäten nach Kategorie",
    actions: "Aktionen",
    show_dropdown: "Dropdown-Liste anzeigen"
  }
};

function localize(hass, key) {
  const lang = (hass && hass.language) ? hass.language.split("-")[0] : "en";
  const dict = TRANSLATIONS[lang] || TRANSLATIONS.en;
  return dict[key] || TRANSLATIONS.en[key] || key;
}

const CARD_STYLE = `
  :host{display:block}.rooms{display:grid;gap:14px}.room{overflow:hidden;border-radius:24px;background:var(--card-background-color);box-shadow:0 2px 8px rgb(0 0 0 / 7%),0 0 0 1px color-mix(in srgb,var(--room-color) 27%,transparent),inset 0 1px 0 rgb(255 255 255 / 12%)}.header{position:relative;display:flex;flex-direction:column;align-items:flex-start;width:100%;box-sizing:border-box;padding:16px 18px 18px;border:0;color:#fff;text-align:left;cursor:pointer;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 92%,transparent),color-mix(in srgb,var(--room-color) 55%,transparent) 35%,color-mix(in srgb,var(--room-color) 20%,transparent) 65%,transparent)}.title{display:inline-flex;align-items:baseline;font-size:1.1em;font-weight:600;line-height:1.2;text-shadow:0 1px 3px rgb(0 0 0 / 20%)}.room-icon{position:absolute;right:18px;top:16px;--mdc-icon-size:40px;color:color-mix(in srgb,var(--room-color) 82%,white);filter:drop-shadow(0 2px 4px rgb(0 0 0 / 15%))}.summary{display:flex;align-items:center;gap:8px;margin-top:8px;font-size:.82em;white-space:nowrap}.summary ha-icon{--mdc-icon-size:18px;color:rgb(255 255 255 / 42%)}.summary ha-icon.active{color:#ffa726}.motion-time{margin-left:8px;font-size:.72em;font-weight:normal;color:rgb(255 255 255 / 65%);text-shadow:none}.chips{display:flex;align-content:center;gap:8px;flex-wrap:wrap;box-sizing:border-box;padding:8px 14px 12px;background:linear-gradient(120deg,color-mix(in srgb,var(--room-color) 13%,transparent),color-mix(in srgb,var(--room-color) 4%,transparent))}.chip{display:inline-flex;align-items:center;gap:6px;min-height:30px;max-width:100%;padding:0 10px;border:1px solid color-mix(in srgb,var(--room-color) 23%,transparent);border-radius:999px;background:color-mix(in srgb,var(--room-color) 7%,transparent);color:var(--primary-text-color);font:600 .82em/1 var(--primary-font-family,sans-serif);cursor:pointer;box-shadow:0 2px 2px rgb(0 0 0 / 20%)}.chip ha-icon{--mdc-icon-size:18px;color:var(--secondary-text-color)}.chip.active{border-color:color-mix(in srgb,var(--chip-active,#ffb300) 52%,transparent);background:color-mix(in srgb,var(--chip-active,#ffb300) 15%,transparent)}.chip.active ha-icon{color:var(--chip-active,#ffb300)}.empty{padding:18px 14px;color:var(--secondary-text-color)}.status-icon{cursor:pointer}.status-metric{display:inline-flex;align-items:center;gap:4px;cursor:pointer}.weather-header{width:100%;box-sizing:border-box;padding:20px 22px 16px 22px;border:0;color:#fff;text-align:left;cursor:pointer;background:linear-gradient(135deg,rgba(18,38,58,0.97) 0%,rgba(30,65,95,0.95) 55%,rgba(20,50,75,0.97) 100%);font-family:inherit}.weather-greeting{font-size:0.72em;font-weight:500;letter-spacing:0.06em;opacity:0.55;margin-bottom:12px;text-transform:uppercase;text-align:left}.weather-grid{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;gap:4px;width:100%}.weather-col-left{text-align:left}.weather-temp{font-size:2.6em;font-weight:300;line-height:1;letter-spacing:-1.5px}.weather-cond{font-size:0.85em;opacity:0.75;margin-top:6px}.weather-sunset{display:flex;align-items:center;font-size:0.85em;opacity:0.50;margin-top:4px;gap:5px}.weather-col-center{display:flex;align-items:center;justify-content:center;margin:-18px 0}.weather-col-center img{width:130px;height:130px}.weather-col-right{text-align:right;display:flex;flex-direction:column;align-items:flex-end;gap:5px}.weather-high,.weather-low{font-size:0.95em;font-weight:600;opacity:0.9}.weather-precip{display:flex;align-items:center;font-size:0.95em;font-weight:500}
  .chip-dropdown {
    position: relative;
    padding-right: 22px !important;
  }
  .chip-dropdown::after {
    content: "";
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-25%);
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 4px solid var(--secondary-text-color);
    pointer-events: none;
  }
  .chip-dropdown.active::after {
    border-top-color: var(--chip-active, #ffb300);
  }
  .chip-select-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    opacity: 0;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }
`;
const EDITOR_STYLE = `
  :host {
    display: block;
    container-type: inline-size;
    color: var(--primary-text-color);
    font-family: var(--paper-font-common-base_-_font-family, inherit);
  }
  .editor {
    display: flex;
    flex-direction: column;
    gap: 20px;
    padding: 16px;
    background: var(--card-background-color, var(--primary-background-color, #fff));
    border-radius: var(--ha-card-border-radius, 12px);
    border: 1px solid var(--divider-color);
    color: var(--primary-text-color);
    font-family: var(--paper-font-body1_-_font-family, inherit);
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--divider-color);
  }
  .control-item {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.95em;
  }
  .control-item > span {
    font-weight: 500;
    color: var(--secondary-text-color);
  }
  .control-item label {
    cursor: pointer;
    user-select: none;
    color: var(--primary-text-color);
  }
  .controls select {
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--divider-color);
    background: var(--secondary-background-color, var(--card-background-color, #fafafa));
    color: var(--primary-text-color);
    font-family: inherit;
    font-size: 0.95em;
    cursor: pointer;
    outline: none;
    transition: border-color 0.2s;
  }
  .controls select:focus {
    border-color: var(--primary-color);
  }
  #rooms {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  ha-expansion-panel {
    display: block;
    --ha-expansion-panel-summary-padding: 0 16px;
    --ha-card-border-color: var(--divider-color) !important;
    --ha-card-background: var(--secondary-background-color, var(--card-background-color, #fafafa)) !important;
    --card-background-color: var(--secondary-background-color, var(--card-background-color, #fafafa)) !important;
    border-radius: var(--ha-card-border-radius, 12px) !important;
    overflow: hidden;
    margin-bottom: 8px;
  }
  .room-editor {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    border-top: 1px solid var(--divider-color);
  }
  .fields {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  .field > span {
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--secondary-text-color);
  }
  .full-width-field {
    display: block;
    width: 100%;
  }
  .entities {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-top: 8px;
  }
  .entities h4 {
    margin: 0;
    font-size: 0.9rem;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--divider-color);
    padding-bottom: 6px;
  }
  .category {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--secondary-background-color, var(--card-background-color, #fafafa));
  }
  .category-header {
    display: flex;
    align-items: center;
    gap: 10px;
    font-weight: 600;
    font-size: 0.95em;
    color: var(--primary-text-color);
  }
  .category-header ha-icon {
    --mdc-icon-size: 20px;
    color: var(--primary-color);
  }
  .entity-editor-content {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px 12px 12px;
    border-top: 1px dashed var(--divider-color);
    margin-top: 8px;
  }
  .entity-main {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .entity-main ha-entity-picker {
    flex-grow: 1;
  }
  .editor-section-title {
    font-size: 0.78em;
    font-weight: 700;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.7px;
    margin-top: 8px;
    padding-bottom: 4px;
    border-bottom: 1px solid var(--divider-color);
  }
  .chip-options {
    display: grid;
    grid-template-columns: 1fr;
    gap: 16px;
  }
  details {
    margin-top: 8px;
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 8px);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    overflow: hidden;
  }
  details summary {
    padding: 10px 14px;
    cursor: pointer;
    font-weight: 500;
    font-size: 0.9em;
    color: var(--primary-text-color);
    user-select: none;
    background: var(--secondary-background-color, var(--divider-color));
    outline: none;
  }
  details ha-card-conditions-editor {
    display: block;
    padding: 14px;
  }
  .room-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid var(--divider-color);
  }
  .category-order-section {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 16px;
    border: 1px solid var(--divider-color);
    border-radius: var(--ha-card-border-radius, 12px);
    background: var(--secondary-background-color, var(--card-background-color, #fafafa));
  }
  .category-order-section h5 {
    margin: 0;
    font-size: 0.8em;
    font-weight: 600;
    color: var(--secondary-text-color);
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid var(--divider-color);
    padding-bottom: 6px;
  }
  .category-order-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 12px;
    border-radius: var(--ha-card-border-radius, 8px);
    background: var(--secondary-background-color, var(--card-background-color, #fafafa));
    border: 1px solid var(--divider-color);
  }
  .category-order-info {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 0.9em;
    font-weight: 500;
  }
  .category-order-info ha-icon {
    --mdc-icon-size: 18px;
    color: var(--secondary-text-color);
  }
  .category-order-actions {
    display: flex;
    align-items: center;
    gap: 4px;
  }
  .category-order-actions ha-icon-button {
    --mdc-icon-button-size: 28px;
    --mdc-icon-size: 18px;
  }
  .editor:not(.mode-rooms) .rooms-only {
    display: none !important;
  }
  .editor:not(.mode-weather) .weather-only {
    display: none !important;
  }
  .weather-editor-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  .field.full-width {
    grid-column: 1 / -1;
  }
  @container (min-width: 560px) {
    .fields {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }
    .chip-options {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 20px;
    }
  }
`;

function formatState(stateObj, suffix, digits = null) {
  if (!stateObj) return "";
  const state = stateObj.state;
  if (state === "unknown" || state === "unavailable") return "-";
  const numVal = digits !== null ? number(state, digits) : state;
  return `${escape(numVal ?? state)}${suffix}`;
}

function getDomainIcon(domain, stateObj = null) {
  if (stateObj?.attributes?.icon) return stateObj.attributes.icon;
  switch (domain) {
    case "light": return "mdi:lightbulb";
    case "switch": return "mdi:toggle-switch";
    case "binary_sensor": return "mdi:checkbox-marked-circle";
    case "sensor": return "mdi:eye";
    case "cover": return "mdi:roller-shade";
    case "fan": return "mdi:fan";
    case "media_player": return "mdi:play";
    case "climate": return "mdi:thermostat";
    default: return "mdi:bookmark";
  }
}

function defaultColor(name = "") {
  const n = name.toLowerCase();
  if (/bagno|bath/.test(n)) return "#5c9eb8";
  if (/camera|letto|bed/.test(n)) return "#7d79ad";
  if (/cucina|kitchen/.test(n)) return "#c88b54";
  if (/giardino|garden|terrazzo/.test(n)) return "#67966f";
  if (/studio|office/.test(n)) return "#7c8fa9";
  return "#a66d58";
}

function checkConditionsMet(hass, conditions) {
  if (!conditions || !Array.isArray(conditions) || conditions.length === 0) return true;
  
  return conditions.every((cond) => {
    if (!cond || !cond.condition) return true;
    
    if (cond.condition === "and") {
      return checkConditionsMet(hass, cond.conditions);
    }
    if (cond.condition === "or") {
      const subConds = cond.conditions;
      if (!subConds || !Array.isArray(subConds) || subConds.length === 0) return true;
      return subConds.some((subCond) => checkConditionsMet(hass, [subCond]));
    }
    if (cond.condition === "not") {
      return !checkConditionsMet(hass, Array.isArray(cond.conditions) ? cond.conditions : [cond.conditions]);
    }
    
    if (cond.condition === "state") {
      const entityId = cond.entity_id || cond.entity;
      if (!entityId) return true;
      const stateObj = hass.states[entityId];
      const state = stateObj ? stateObj.state : "unavailable";
      
      if (cond.state !== undefined) {
        if (Array.isArray(cond.state)) {
          return cond.state.some(s => String(state) === String(s));
        }
        return String(state) === String(cond.state);
      }
      if (cond.state_not !== undefined) {
        if (Array.isArray(cond.state_not)) {
          return !cond.state_not.some(s => String(state) === String(s));
        }
        return String(state) !== String(cond.state_not);
      }
      return true;
    }
    
    if (cond.condition === "numeric_state") {
      const entityId = cond.entity_id || cond.entity;
      if (!entityId) return true;
      const stateObj = hass.states[entityId];
      if (!stateObj) return false;
      const val = parseFloat(stateObj.state);
      if (isNaN(val)) return false;
      
      if (cond.above !== undefined && val <= parseFloat(cond.above)) return false;
      if (cond.below !== undefined && val >= parseFloat(cond.below)) return false;
      return true;
    }
    
    if (cond.condition === "user") {
      if (!hass.user || !cond.users) return true;
      return cond.users.includes(hass.user.id);
    }
    
    if (cond.condition === "screen") {
      if (!cond.media_query) return true;
      return window.matchMedia(cond.media_query).matches;
    }
    
    if (cond.condition === "location") {
      if (!cond.locations) return false;
      const targetEntityId = cond.entity_id || cond.entity;
      let stateObj = null;
      if (targetEntityId) {
        stateObj = hass.states[targetEntityId];
      } else if (hass.user) {
        stateObj = Object.values(hass.states).find(
          (s) =>
            s.entity_id.startsWith("person.") &&
            s.attributes.user_id === hass.user.id
        );
      }
      if (!stateObj) return false;
      return cond.locations.includes(stateObj.state);
    }
    
    if (cond.condition === "zone") {
      const entityId = cond.entity_id || cond.entity;
      if (!entityId || !cond.zone) return false;
      const stateObj = hass.states[entityId];
      if (!stateObj) return false;
      
      const zoneId = cond.zone;
      const zoneState = hass.states[zoneId];
      const zoneName = zoneState ? (zoneState.attributes.friendly_name || "").toLowerCase() : "";
      const personState = (stateObj.state || "").toLowerCase();
      
      if (zoneId === "zone.home" && personState === "home") return true;
      if (personState === zoneId.split(".")[1]) return true;
      if (zoneName && personState === zoneName) return true;
      return false;
    }
    
    return true;
  });
}

function extractConditionEntities(conditions) {
  const entities = [];
  if (!conditions || !Array.isArray(conditions)) return entities;
  conditions.forEach((cond) => {
    if (!cond) return;
    const entityId = cond.entity_id || cond.entity;
    if (entityId) {
      entities.push(entityId);
    }
    if (cond.conditions) {
      entities.push(...extractConditionEntities(cond.conditions));
    }
  });
  return entities;
}

function sanitizeVisibilityConditions(conditions) {
  if (!conditions) return [];
  const arr = Array.isArray(conditions) ? conditions : [conditions];
  return arr.map((cond) => {
    if (!cond) return cond;
    const newCond = { ...cond };
    if (newCond.entity_id) {
      newCond.entity = newCond.entity_id;
      delete newCond.entity_id;
    }
    if (newCond.conditions) {
      newCond.conditions = sanitizeVisibilityConditions(newCond.conditions);
    }
    return newCond;
  });
}

function bindActionHandler(element, getActionConfig, onEditorSelect, stopClickPropagation = false) {
  let timer = null;
  let hasHeld = false;
  let startX = 0;
  let startY = 0;

  const start = (event) => {
    if (event.button !== undefined && event.button !== 0) return;
    if (event.target && event.target.closest) {
      if (event.target.closest(".status-icon") || event.target.closest(".status-metric")) {
        return;
      }
    }
    hasHeld = false;
    startX = event.clientX;
    startY = event.clientY;
    timer = setTimeout(() => {
      hasHeld = true;
      triggerAction("hold");
    }, 500);
  };

  const end = () => {
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const move = (event) => {
    if (!timer) return;
    const diffX = Math.abs(event.clientX - startX);
    const diffY = Math.abs(event.clientY - startY);
    if (diffX > 10 || diffY > 10) {
      clearTimeout(timer);
      timer = null;
    }
  };

  const triggerAction = (action) => {
    if (document.querySelector("custom-room-card-editor")) {
      if (action === "tap" && onEditorSelect) {
        onEditorSelect();
      }
      return;
    }
    const config = getActionConfig();
    const actionEvent = new CustomEvent("hass-action", {
      bubbles: true,
      composed: true,
      detail: { config, action }
    });
    element.dispatchEvent(actionEvent);
  };

  element.addEventListener("pointerdown", start);
  element.addEventListener("pointerup", end);
  element.addEventListener("pointermove", move);
  element.addEventListener("pointercancel", end);

  element.addEventListener("click", (event) => {
    if (stopClickPropagation) {
      event.stopPropagation();
    }
    if (hasHeld) {
      event.preventDefault();
      event.stopPropagation();
      hasHeld = false;
      return;
    }
    triggerAction("tap");
  });

  element.addEventListener("contextmenu", (event) => {
    event.preventDefault();
    if (document.querySelector("custom-room-card-editor")) return;
    triggerAction("hold");
  });
}


class CustomRoomCard extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); this._clock = null; this._templateSubs = {}; this._renderedTemplates = {}; this._monitoredEntities = []; this._oldBodyHTML = ""; }
  static getConfigElement() { return document.createElement("custom-room-card-editor"); }
  static getStubConfig(hass) { const area = Object.keys(hass?.areas || {})[0]; return { type: `custom:${CARD_TAG}`, sort_by_motion: false, rooms: area ? [{ area, entities: {} }] : [] }; }
  setConfig(config) {
    const card_type = config.card_type || "rooms";
    const rooms = Array.isArray(config.rooms) && config.rooms.length
      ? config.rooms
      : config.area ? [{ area: config.area, title: config.title, icon: config.icon, color: config.color, entities: config.entities || {} }] : [];
    this._config = { ...config, card_type, rooms: rooms.map((room) => ({ entities: {}, ...room })) };
    this._updateMonitoredEntities();
    this._render();
  }
  _updateMonitoredEntities() {
    const entities = new Set();
    if (!this._config) return;
    
    // Monitora la persona dell'utente corrente per cambi di posizione reattivi
    if (this._hass && this._hass.user) {
      const personEntity = Object.values(this._hass.states).find(
        (s) =>
          s.entity_id.startsWith("person.") &&
          s.attributes.user_id === this._hass.user.id
      );
      if (personEntity) {
        entities.add(personEntity.entity_id);
      }
    }

    const cardType = this._config.card_type || "rooms";
    if (cardType === "rooms") {
      (this._config.rooms || []).forEach(room => {
        if (room.condition_entity) entities.add(room.condition_entity);
        if (room.visibility) {
          const conds = Array.isArray(room.visibility) ? room.visibility : [room.visibility];
          extractConditionEntities(conds).forEach(id => entities.add(id));
        }
        if (room.temperature_entity) entities.add(room.temperature_entity);
        if (room.humidity_entity) entities.add(room.humidity_entity);
        if (room.illuminance_entity) entities.add(room.illuminance_entity);
        if (room.motion_entity) entities.add(room.motion_entity);
        if (room.opening_entity) entities.add(room.opening_entity);
        if (room.entities) {
          Object.values(room.entities).forEach(val => {
            const arr = Array.isArray(val) ? val : (val ? [val] : []);
            arr.forEach(item => {
              const id = typeof item === "string" ? item : item?.entity;
              if (id) entities.add(id);
              const condId = item?.condition_entity;
              if (condId) entities.add(condId);
              if (item?.visibility) {
                const conds = Array.isArray(item.visibility) ? item.visibility : [item.visibility];
                extractConditionEntities(conds).forEach(cid => entities.add(cid));
              }
            });
          });
        }
        if (room.summary_entities) {
          room.summary_entities.forEach(item => {
            const id = typeof item === "string" ? item : item?.entity;
            if (id) entities.add(id);
          });
        }
        if (room.area && this._hass) {
          const areaIds = this._areaIds(room.area);
          areaIds.forEach(id => entities.add(id));
        }
      });
    } else {
      if (this._config.temp_entity) entities.add(this._config.temp_entity);
      if (this._config.condition_entity) entities.add(this._config.condition_entity);
      if (this._config.high_temp_entity) entities.add(this._config.high_temp_entity);
      if (this._config.low_temp_entity) entities.add(this._config.low_temp_entity);
      if (this._config.precip_probability_entity) entities.add(this._config.precip_probability_entity);
      if (this._config.weather_icon_entity) entities.add(this._config.weather_icon_entity);
      if (this._config.sunset_entity) entities.add(this._config.sunset_entity);
      if (this._config.chips) {
        this._config.chips.forEach(item => {
          const id = typeof item === "string" ? item : item?.entity;
          if (id) entities.add(id);
          const condId = item?.condition_entity;
          if (condId) entities.add(condId);
          if (item?.visibility) {
            const conds = Array.isArray(item.visibility) ? item.visibility : [item.visibility];
            extractConditionEntities(conds).forEach(cid => entities.add(cid));
          }
        });
      }
    }
    this._monitoredEntities = Array.from(entities);
  }
  _buildAreaEntitiesCache() {
    if (!this._hass) return;
    const cache = {};
    const devices = this._hass.devices || {};
    Object.values(this._hass.entities || {}).forEach((e) => {
      const areaId = e.area_id || (e.device_id && devices[e.device_id]?.area_id);
      if (areaId) {
        if (!cache[areaId]) cache[areaId] = [];
        if (this._hass.states[e.entity_id]) {
          cache[areaId].push(e.entity_id);
        }
      }
    });
    this._areaEntitiesCache = cache;
  }
  set hass(hass) {
    const oldHass = this._hass;
    this._hass = hass;
    this._buildAreaEntitiesCache();
    this._updateMonitoredEntities();
    if (!oldHass) {
      this._render();
      return;
    }
    let changed = false;
    for (const id of this._monitoredEntities) {
      if (oldHass.states[id] !== hass.states[id]) {
        changed = true;
        break;
      }
    }
    if (changed) {
      this._render();
    }
  }
  connectedCallback() { this._clock = window.setInterval(() => this._render(), 60000); }
  disconnectedCallback() {
    if (this._clock) window.clearInterval(this._clock);
    this._clock = null;
    Object.values(this._templateSubs).forEach((sub) => {
      if (sub.unsubFunc) {
        sub.unsubFunc();
      } else {
        sub.cancelled = true;
      }
    });
    this._templateSubs = {};
    this._renderedTemplates = {};
  }
  getCardSize() { return Math.max(2, (this._config?.rooms?.length || 1) * 2); }
  _areaIds(area) {
    return this._areaEntitiesCache?.[area] || [];
  }
  _sensor(ids, classes) { return ids.map((id) => this._hass.states[id]).find((s) => classes.includes(s?.attributes?.device_class) && !OFF.has(s?.state)); }
  _motion(room, ids) { return room.motion_entity ? this._hass.states[room.motion_entity] : this._sensor(ids, ["motion", "occupancy", "presence"]); }
  _opening(room, ids) { return room.opening_entity ? this._hass.states[room.opening_entity] : this._sensor(ids, ["opening", "door", "window"]); }
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
      const ma = this._motion(a.room, a.ids); const mb = this._motion(b.room, b.ids);
      if (on(ma) !== on(mb)) return on(mb) - on(ma);
      return new Date(mb?.last_changed || 0) - new Date(ma?.last_changed || 0);
    });
  }
  _updateTemplateSubscriptions() {
    if (!this._hass || !this._config) return;
    const cardType = this._config.card_type || "rooms";
    const activeKeys = new Set();
    
    const checkTemplate = (templateStr, key) => {
      const isTemplate = templateStr && (templateStr.includes("{{") || templateStr.includes("{%"));
      if (isTemplate) {
        activeKeys.add(key);
        if (!this._templateSubs[key] || this._templateSubs[key].template !== templateStr) {
          if (this._templateSubs[key]) {
            const oldSub = this._templateSubs[key];
            if (oldSub.unsubFunc) {
              oldSub.unsubFunc();
            } else {
              oldSub.cancelled = true;
            }
          }
          const subInfo = { template: templateStr, unsubFunc: null, cancelled: false };
          this._templateSubs[key] = subInfo;
          
          this._hass.connection.subscribeMessage(
            (output) => {
              if (subInfo.cancelled) return;
              if (output && output.result !== undefined && this._renderedTemplates[key] !== output.result) {
                this._renderedTemplates[key] = output.result;
                this._render();
              }
            },
            { type: "render_template", template: templateStr }
          ).then(
            (unsubFunc) => {
              if (subInfo.cancelled) {
                unsubFunc();
              } else {
                subInfo.unsubFunc = unsubFunc;
              }
            },
            (err) => {
              console.error("Error subscribing to template", err);
            }
          );
        }
      }
    };

    if (cardType === "rooms") {
      (this._config.rooms || []).forEach((room, roomIndex) => {
        if (room.title) {
          checkTemplate(room.title, `room-${roomIndex}-title`);
        }
        const defaultOrder = ["lights", "covers", "climate", "media", "switches"];
        const order = this._config.category_order || defaultOrder;
        order.forEach((category) => {
          const rawSelected = room.entities?.[category];
          const selectedArray = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);
          selectedArray.forEach((item, chipIndex) => {
            const chip = typeof item === "string" ? { entity: item } : item;
            if (chip.name) {
              checkTemplate(chip.name, `${roomIndex}-${category}-${chipIndex}`);
            }
          });
        });
      });
    } else {
      (this._config.chips || []).forEach((item, chipIndex) => {
        const chip = typeof item === "string" ? { entity: item } : item;
        if (chip.name) {
          checkTemplate(chip.name, `0-weather-${chipIndex}`);
        }
      });
    }
    
    // Clean up stale subscriptions
    Object.keys(this._templateSubs).forEach((key) => {
      if (!activeKeys.has(key)) {
        const oldSub = this._templateSubs[key];
        if (oldSub.unsubFunc) {
          oldSub.unsubFunc();
        } else {
          oldSub.cancelled = true;
        }
        delete this._templateSubs[key];
        delete this._renderedTemplates[key];
      }
    });
  }
  _showChip(chip) {
    if (chip.visibility) {
      const conds = Array.isArray(chip.visibility) ? chip.visibility : [chip.visibility];
      return checkConditionsMet(this._hass, conds);
    }
    if (!chip.condition_entity) return true;
    const stateObj = this._hass.states[chip.condition_entity];
    if (!stateObj) return false;
    const isMatched = stateObj.state === (chip.condition_state || "on");
    return chip.condition_invert ? !isMatched : isMatched;
  }
  _showRoom(room) {
    if (room.visibility) {
      const conds = Array.isArray(room.visibility) ? room.visibility : [room.visibility];
      return checkConditionsMet(this._hass, conds);
    }
    if (!room.condition_entity) return true;
    const stateObj = this._hass.states[room.condition_entity];
    if (!stateObj) return false;
    const isMatched = stateObj.state === (room.condition_state || "on");
    return room.condition_invert ? !isMatched : isMatched;
  }
  _chips(room, roomIndex) {
    const defaultOrder = ["lights", "covers", "climate", "media", "switches"];
    const order = this._config.category_order || defaultOrder;
    return order.flatMap((category) => {
      const selected = room.entities?.[category];
      if (!selected) return [];
      const domains = CATEGORIES[category]?.domains || [CATEGORIES[category]?.domain];
      const selectedArray = Array.isArray(selected) ? selected : (selected ? [selected] : []);
      return selectedArray
        .map((item, chipIndex) => {
          const chip = typeof item === "string" ? { entity: item } : item;
          return { ...chip, roomIndex, category, chipIndex };
        })
        .filter((chip) => chip.entity && domains.includes(chip.entity.split(".")[0]) && this._hass.states[chip.entity] && this._showChip(chip));
    });
  }
  _weather() {
    const tempEntityObj = this._hass.states[this._config.temp_entity];
    const temp = tempEntityObj ? parseFloat(tempEntityObj.state).toFixed(1) : "N/D";
    
    const condEntityObj = this._hass.states[this._config.condition_entity];
    const cond = condEntityObj ? condEntityObj.state : "N/D";
    
    const highEntityObj = this._hass.states[this._config.high_temp_entity];
    const high = highEntityObj ? Math.round(parseFloat(highEntityObj.state)) : "N/D";
    
    const lowEntityObj = this._hass.states[this._config.low_temp_entity];
    const low = lowEntityObj ? Math.round(parseFloat(lowEntityObj.state)) : "N/D";
    
    const precipEntityObj = this._hass.states[this._config.precip_probability_entity];
    const precip = precipEntityObj ? precipEntityObj.state : "0";
    
    const iconEntityObj = this._hass.states[this._config.weather_icon_entity];
    const iconPath = iconEntityObj ? iconEntityObj.state.trim() : "";
    
    let sunset = "N/D";
    const sunEntityObj = this._hass.states[this._config.sunset_entity || "sun.sun"];
    if (sunEntityObj && sunEntityObj.attributes.next_setting) {
      sunset = new Date(sunEntityObj.attributes.next_setting).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
    }
    
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buongiorno' : hour < 18 ? 'Buonasera' : 'Buonanotte';
    const name = this._hass.user ? this._hass.user.name : "Utente";
    
    const precipColor = parseInt(precip) > 0 ? '#5b9bd5' : 'rgba(255,255,255,0.35)';
    const umbrellaIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="17" height="17" style="vertical-align:middle;margin-right:4px;flex-shrink:0;"><path fill="${precipColor}" d="M12,2A10,10 0 0,1 22,12H13A1,1 0 0,0 12,13A1,1 0 0,1 10,14A1,1 0 0,0 8,13H2A10,10 0 0,1 12,2M9,17A1,1 0 0,1 10,18A2,2 0 0,0 14,18V13H12A3,3 0 0,1 9,16V17Z"/></svg>`;
    
    const chipsData = (this._config.chips || [])
      .map((item, chipIndex) => {
        const chip = typeof item === "string" ? { entity: item } : item;
        return { ...chip, roomIndex: 0, category: "weather", chipIndex };
      })
      .filter((chip) => chip.entity && this._hass.states[chip.entity] && this._showChip(chip));
      
    const color = this._config.color || "#1a365d";
    
    return `
      <section class="room weather-room" style="--room-color:${escape(color)}">
        <button class="header weather-header" aria-label="Meteo Detail">
          <div class="weather-greeting">${greeting}, ${name}</div>
          <div class="weather-grid">
            <div class="weather-col-left">
              <div class="weather-temp">${temp}°</div>
              <div class="weather-cond">${cond}</div>
              <div class="weather-sunset">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="15" height="15" style="flex-shrink:0;"><path fill="rgba(255,200,100,0.75)" d="M3,12H7A5,5 0 0,1 12,7A5,5 0 0,1 17,12H21A1,1 0 0,1 22,13A1,1 0 0,1 21,14H3A1,1 0 0,1 2,13A1,1 0 0,1 3,12M15,17A3,3 0 0,1 12,20A3,3 0 0,1 9,17H15Z"/></svg>
                <span>${sunset}</span>
              </div>
            </div>
            <div class="weather-col-center">
              ${iconPath ? `<img src="${iconPath}" />` : `<ha-icon icon="mdi:weather-partly-cloudy" style="--mdc-icon-size:80px;color:rgba(255,255,255,0.7)"></ha-icon>`}
            </div>
            <div class="weather-col-right">
              <div class="weather-high">↑ ${high}°</div>
              <div class="weather-low">↓ ${low}°</div>
              <div class="weather-precip">
                ${umbrellaIcon}<span>${precip}%</span>
              </div>
            </div>
          </div>
        </button>
        ${chipsData.length ? `<div class="chips">${chipsData.map((chip) => this._chip(chip)).join("")}</div>` : ""}
      </section>
    `;
  }
  _render() {
    if (!this._hass || !this._config) return;
    this._updateTemplateSubscriptions();
    const cardType = this._config.card_type || "rooms";
    
    if (cardType === "rooms") {
      const rooms = this._sort((this._config.rooms || []).map((room, roomIndex) => ({ room, ids: this._areaIds(room.area), roomIndex })).filter(({ room }) => this._showRoom(room)));
      const newHTML = `<div class="rooms">${rooms.map(({ room, ids, roomIndex }) => this._room(room, ids, roomIndex)).join("") || `<div class="empty">Aggiungi una stanza dalla configurazione della card.</div>`}</div>`;
      if (this._oldBodyHTML !== newHTML) {
        this.shadowRoot.innerHTML = `<style>${CARD_STYLE}</style>${newHTML}`;
        this._oldBodyHTML = newHTML;
        this._bindEvents(cardType);
      }
    } else {
      const newHTML = this._weather();
      if (this._oldBodyHTML !== newHTML) {
        this.shadowRoot.innerHTML = `<style>${CARD_STYLE}</style>${newHTML}`;
        this._oldBodyHTML = newHTML;
        this._bindEvents(cardType);
      }
    }
  }
  _bindEvents(cardType) {
    if (cardType === "rooms") {
      this.shadowRoot.querySelectorAll(".header:not(.weather-header)").forEach((button) => {
        const roomIndex = Number.parseInt(button.dataset.roomIndex);
        const getActionConfig = () => {
          const room = this._config.rooms[roomIndex];
          return {
            entity: room.motion_entity || (button.dataset.entity !== "" ? button.dataset.entity : undefined),
            tap_action: room.tap_action || { action: "more-info" },
            hold_action: room.hold_action || { action: "none" }
          };
        };
        bindActionHandler(
          button,
          getActionConfig,
          () => {
            window.dispatchEvent(new CustomEvent("custom-room-card-select", {
              bubbles: true,
              composed: true,
              detail: { roomIndex, type: "room" }
            }));
          }
        );
      });
      this.shadowRoot.querySelectorAll(".status-icon, .status-metric").forEach((element) => {
        element.addEventListener("click", (event) => {
          event.stopPropagation();
          this._fire("hass-more-info", { entityId: element.dataset.entity });
        });
      });
    } else {
      this.shadowRoot.querySelectorAll(".weather-header").forEach((button) => {
        const getActionConfig = () => {
          return {
            entity: this._config.temp_entity,
            tap_action: this._config.tap_action || { action: "navigate", navigation_path: "#meteo" },
            hold_action: this._config.hold_action || { action: "none" }
          };
        };
        bindActionHandler(
          button,
          getActionConfig,
          () => {
            window.dispatchEvent(new CustomEvent("custom-room-card-select", {
              bubbles: true,
              composed: true,
              detail: { roomIndex: 0, type: "room" }
            }));
          }
        );
      });
    }
    
    this.shadowRoot.querySelectorAll(".chip").forEach((button) => {
      const isDropdown = button.classList.contains("chip-dropdown");
      if (isDropdown) {
        const select = button.querySelector(".chip-select-overlay");
        if (select) {
          select.addEventListener("change", (event) => {
            const entityId = select.dataset.entity;
            const value = event.target.value;
            const domain = entityId.split(".")[0];
            this._hass.callService(domain, "select_option", {
              entity_id: entityId,
              option: value
            });
          });
        }
        return;
      }
      
      const roomIndex = Number.parseInt(button.dataset.roomIndex);
      const category = button.dataset.category;
      const chipIndex = Number.parseInt(button.dataset.chipIndex);
      const getActionConfig = () => {
        let chip;
        if (category === "weather") {
          const item = (this._config.chips || [])[chipIndex];
          chip = typeof item === "string" ? { entity: item } : item;
        } else {
          const room = (this._config.rooms || [])[roomIndex];
          const rawSelected = room?.entities?.[category];
          const selectedArray = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);
          const item = selectedArray[chipIndex];
          chip = typeof item === "string" ? { entity: item } : item;
        }
        
        return {
          entity: chip?.entity,
          tap_action: chip?.tap_action || { action: "more-info" },
          hold_action: chip?.hold_action || { action: "none" }
        };
      };
      
      bindActionHandler(
        button,
        getActionConfig,
        () => {
          window.dispatchEvent(new CustomEvent("custom-room-card-select", {
            bubbles: true,
            composed: true,
            detail: {
              roomIndex,
              category,
              chipIndex,
              type: "chip"
            }
          }));
        },
        true // stopClickPropagation
      );
    });
  }
  _room(room, ids, roomIndex) {
    const area = this._hass.areas?.[room.area];
    const titleKey = `room-${roomIndex}-title`;
    const hasTitleTemplate = room.title && (room.title.includes("{{") || room.title.includes("{%"));
    const title = hasTitleTemplate
      ? (this._renderedTemplates?.[titleKey] !== undefined ? this._renderedTemplates[titleKey] : "")
      : (room.title || area?.name || room.area);
    const temp = room.temperature_entity ? this._hass.states[room.temperature_entity] : this._sensor(ids, ["temperature"]);
    const humidity = room.humidity_entity ? this._hass.states[room.humidity_entity] : this._sensor(ids, ["humidity"]);
    const lux = room.illuminance_entity ? this._hass.states[room.illuminance_entity] : this._sensor(ids, ["illuminance"]);
    const motion = this._motion(room, ids); const opening = this._opening(room, ids);
    
    const tempValue = temp ? formatState(temp, "°C", 1) : null;
    const humidityValue = humidity ? formatState(humidity, "%") : null;
    const luxValue = lux ? formatState(lux, " lx") : null;
    
    const tempElement = tempValue !== null ? `<span class="status-metric" data-entity="${escape(room.temperature_entity || temp.entity_id)}"><ha-icon icon="mdi:thermometer"></ha-icon><span>${tempValue}</span></span>` : "";
    const humidityElement = humidityValue !== null ? `<span class="status-metric" data-entity="${escape(room.humidity_entity || humidity.entity_id)}"><ha-icon icon="mdi:water-percent"></ha-icon><span>${humidityValue}</span></span>` : "";
    const luxElement = luxValue !== null ? `<span class="status-metric" data-entity="${escape(room.illuminance_entity || lux.entity_id)}"><ha-icon icon="mdi:weather-sunny"></ha-icon><span>${luxValue}</span></span>` : "";

    const customMetrics = (room.summary_entities || [])
      .map((item) => {
        const itemConfig = typeof item === "string" ? { entity: item } : item;
        const stateObj = this._hass.states[itemConfig.entity];
        if (!stateObj) return "";
        const stateVal = stateObj.state;
        const val = (stateVal === "unknown" || stateVal === "unavailable") ? "-" : stateVal;
        const unit = (stateVal !== "unknown" && stateVal !== "unavailable") ? (stateObj.attributes.unit_of_measurement || "") : "";
        const label = itemConfig.name ? `${itemConfig.name} ${val}${unit}` : `${val}${unit}`;
        const domain = itemConfig.entity.split(".")[0];
        const icon = itemConfig.icon || getDomainIcon(domain, stateObj);
        return `<span class="status-metric" data-entity="${escape(itemConfig.entity)}"><ha-icon icon="${escape(icon)}"></ha-icon><span>${escape(label)}</span></span>`;
      })
      .filter(Boolean)
      .join("");
    
    const metrics = [tempElement, humidityElement, luxElement, customMetrics].filter(Boolean).join("");
    const status = [
      motion && `<ha-icon class="status-icon ${on(motion) ? "active" : ""}" icon="mdi:circle" data-entity="${escape(room.motion_entity || motion.entity_id)}"></ha-icon>`,
      opening && `<ha-icon class="status-icon ${on(opening) ? "active" : ""}" icon="${escape(this._openingIcon(opening))}" data-entity="${escape(room.opening_entity || opening.entity_id)}"></ha-icon>`
    ].filter(Boolean).join("");
    const chips = this._chips(room, roomIndex);
    const isPresenceActive = motion ? on(motion) : true;
    const color = isPresenceActive ? (room.color || defaultColor(title)) : "#808080";
    const lastMotion = motion ? elapsed(motion.last_changed) : "";
    return `<section class="room" style="--room-color:${escape(color)}"><button class="header" data-room-index="${roomIndex}" data-entity="${escape(room.motion_entity || ids[0] || "")}" aria-label="${escape(title)}"><ha-icon class="room-icon" icon="${escape(room.icon || area?.icon || "mdi:home")}"></ha-icon><span class="title">${escape(title)}${lastMotion ? `<span class="motion-time">${lastMotion}</span>` : ""}</span><span class="summary">${status}${metrics}</span></button>${chips.length ? `<div class="chips">${chips.map((chip) => this._chip(chip)).join("")}</div>` : `<div class="empty">Nessuna entità selezionata</div>`}</section>`;
  }
  _chip(chip) {
    const id = chip.entity; const domain = id.split(".")[0]; const category = Object.values(CATEGORIES).find((item) => item.domain === domain) || CATEGORIES.switches; const stateObj = this._hass.states[id]; const active = on(stateObj);
    let icon = active ? chip.active_icon || chip.icon || category.icon : chip.icon || category.off;
    if (this._config.show_entity_icons && stateObj?.attributes?.icon) {
      icon = stateObj.attributes.icon;
    }
    const templateKey = `${chip.roomIndex}-${chip.category}-${chip.chipIndex}`;
    const hasTemplate = chip.name && (chip.name.includes("{{") || chip.name.includes("{%"));
    const label = hasTemplate 
      ? (this._renderedTemplates?.[templateKey] !== undefined ? this._renderedTemplates[templateKey] : "") 
      : (chip.name || entityName(this._hass, id));
    
    const isDropdown = chip.dropdown && (domain === "input_select" || domain === "select") && stateObj?.attributes?.options;
    if (isDropdown) {
      const options = stateObj.attributes.options || [];
      const optionTags = options.map(opt => `<option value="${escape(opt)}" ${opt === stateObj.state ? "selected" : ""}>${escape(opt)}</option>`).join("");
      return `<div class="chip chip-dropdown ${active ? "active" : ""}" style="--chip-active:${escape(chip.color || "#ffb300")}" data-entity="${escape(id)}" data-domain="${escape(domain)}" data-room-index="${chip.roomIndex}" data-category="${escape(chip.category)}" data-chip-index="${chip.chipIndex}"><ha-icon icon="${escape(icon)}"></ha-icon><span>${escape(label)}</span><select class="chip-select-overlay" data-entity="${escape(id)}">${optionTags}</select></div>`;
    }
    
    return `<button class="chip ${active ? "active" : ""}" style="--chip-active:${escape(chip.color || "#ffb300")}" data-entity="${escape(id)}" data-domain="${escape(domain)}" data-room-index="${chip.roomIndex}" data-category="${escape(chip.category)}" data-chip-index="${chip.chipIndex}"><ha-icon icon="${escape(icon)}"></ha-icon><span>${escape(label)}</span></button>`;
  }
  _fire(type, detail) { this.dispatchEvent(new CustomEvent(type, { detail, bubbles: true, composed: true })); }
}

class CustomRoomCardEditor extends HTMLElement {
  constructor() { super(); this.attachShadow({ mode: "open" }); }
  connectedCallback() {
    if (!customElements.get("ha-card-conditions-editor")) {
      const conditionalCard = customElements.get("hui-conditional-card");
      if (conditionalCard && typeof conditionalCard.getConfigElement === "function") {
        try {
          conditionalCard.getConfigElement();
        } catch (e) {
          console.warn("Failed to load ha-card-conditions-editor via hui-conditional-card", e);
        }
      }
    }
    this._selectListener = (event) => {
      const { type, roomIndex, category, chipIndex } = event.detail;
      this._focusEditorPanel(type, roomIndex, category, chipIndex);
    };
    window.addEventListener("custom-room-card-select", this._selectListener);
  }
  disconnectedCallback() {
    if (this._selectListener) {
      window.removeEventListener("custom-room-card-select", this._selectListener);
    }
  }
  _focusEditorPanel(type, roomIndex, category, chipIndex) {
    if (!this.shadowRoot) return;
    const roomPanels = this.shadowRoot.querySelectorAll("ha-expansion-panel:not([data-panel-id])");
    const roomPanel = roomPanels[roomIndex];
    if (roomPanel) {
      if (!roomPanel.expanded) {
        roomPanel.expanded = true;
        roomPanel.dispatchEvent(new CustomEvent("expanded-changed"));
      }
      if (type === "chip") {
        setTimeout(() => {
          const chipPanelId = `${roomIndex}-${category}-${chipIndex}`;
          const chipPanel = this.shadowRoot.querySelector(`ha-expansion-panel[data-panel-id="${chipPanelId}"]`);
          if (chipPanel) {
            if (!chipPanel.expanded) {
              chipPanel.expanded = true;
              chipPanel.dispatchEvent(new CustomEvent("expanded-changed"));
            }
            chipPanel.scrollIntoView({ behavior: "smooth", block: "center" });
          }
        }, 120);
      } else {
        roomPanel.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }
  setConfig(config) {
    const card_type = config.card_type || "rooms";
    const rooms = Array.isArray(config.rooms) && config.rooms.length
      ? config.rooms
      : config.area ? [{ area: config.area, title: config.title, icon: config.icon, color: config.color, entities: config.entities || {} }] : [];
    const { area, entities, ...rest } = config;
    const next = { ...rest, card_type, rooms };
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
    if (this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-entity-picker, ha-entities-picker, ha-icon-picker, ha-area-picker, ha-selector, ha-card-conditions-editor").forEach((picker) => {
        picker.hass = hass;
      });
    }
    if (needsInitialRender) {
      this._render();
      if (hass && typeof hass.loadBackendTranslation === "function") {
        try {
          hass.loadBackendTranslation("config");
          hass.loadBackendTranslation("translation", "automation");
        } catch (e) {
          console.warn("Could not load backend translations for condition editor", e);
        }
      }
    }
  }
  _emit(config) {
    this._config = config;
    this._isUpdating = true;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config }, bubbles: true, composed: true }));
  }
  _updateRoom(index, changes) { const rooms = this._config.rooms.map((room, i) => i === index ? { ...room, ...changes } : room); this._emit({ ...this._config, rooms }); }
  _moveRoom(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= this._config.rooms.length) return;
    const rooms = [...this._config.rooms];
    [rooms[index], rooms[target]] = [rooms[target], rooms[index]];
    this._emit({ ...this._config, rooms }); this._render();
  }
  _handlePicker(picker, callback, rerender = false) {
    let lastValue = picker.value;
    picker.addEventListener("value-changed", (event) => {
      if (event.target !== picker) return;
      const newValue = event.detail.value;
      if (newValue === lastValue) return;
      lastValue = newValue;
      picker.value = newValue;
      callback(newValue);
      if (rerender) this._render();
    });
  }
  _addEntityPicker(holder, label, domains, onPick) {
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass; picker.label = label; picker.includeDomains = domains; picker.value = ""; picker.allowCustomEntity = true;
    this._handlePicker(picker, (value) => { if (value) onPick(value); }, true);
    holder.append(picker);
  }
  _updateChip(roomIndex, category, entityIndex, chipChanges) {
    if (category === "weather") {
      const chips = (this._config.chips || []).map((item, eIdx) => {
        if (eIdx !== entityIndex) return item;
        const chip = typeof item === "string" ? { entity: item } : item;
        return { ...chip, ...chipChanges };
      });
      this._emit({ ...this._config, chips });
      return;
    }
    const rooms = this._config.rooms.map((room, rIdx) => {
      if (rIdx !== roomIndex) return room;
      const rawSelected = room.entities?.[category];
      const selectedArray = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);
      const selected = selectedArray.map((item) => typeof item === "string" ? { entity: item } : item);
      const updatedEntities = selected.map((item, eIdx) => {
        if (eIdx !== entityIndex) return item;
        return { ...item, ...chipChanges };
      });
      return { ...room, entities: { ...(room.entities || {}), [category]: updatedEntities } };
    });
    this._emit({ ...this._config, rooms });
  }
  _removeChip(roomIndex, category, entityIndex) {
    if (category === "weather") {
      const chips = (this._config.chips || []).filter((_, eIdx) => eIdx !== entityIndex);
      this._emit({ ...this._config, chips });
      return;
    }
    const rooms = this._config.rooms.map((room, rIdx) => {
      if (rIdx !== roomIndex) return room;
      const rawSelected = room.entities?.[category];
      const selectedArray = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);
      const selected = selectedArray.map((item) => typeof item === "string" ? { entity: item } : item);
      const updatedEntities = selected.filter((_, eIdx) => eIdx !== entityIndex);
      return { ...room, entities: { ...(room.entities || {}), [category]: updatedEntities } };
    });
    this._emit({ ...this._config, rooms });
  }
  _addChip(roomIndex, category, entity) {
    if (category === "weather") {
      const chips = [...(this._config.chips || []), { entity }];
      this._emit({ ...this._config, chips });
      return;
    }
    const rooms = this._config.rooms.map((room, rIdx) => {
      if (rIdx !== roomIndex) return room;
      const rawSelected = room.entities?.[category];
      const selectedArray = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);
      const selected = selectedArray.map((item) => typeof item === "string" ? { entity: item } : item);
      const updatedEntities = [...selected, { entity }];
      return { ...room, entities: { ...(room.entities || {}), [category]: updatedEntities } };
    });
    this._emit({ ...this._config, rooms });
  }
  _saveState() {
    if (!this.shadowRoot) return { expanded: [], openDetails: [], expandedChips: [] };
    const expanded = Array.from(this.shadowRoot.querySelectorAll("ha-expansion-panel:not([data-panel-id])"))
      .map((panel, index) => (panel.expanded || panel.hasAttribute("expanded")) ? index : -1)
      .filter((index) => index !== -1);
    const expandedChips = Array.from(this.shadowRoot.querySelectorAll("ha-expansion-panel[data-panel-id]"))
      .filter((panel) => panel.expanded || panel.hasAttribute("expanded"))
      .map((panel) => panel.getAttribute("data-panel-id"));
    const openDetails = Array.from(this.shadowRoot.querySelectorAll("details"))
      .filter((d) => d.open)
      .map((d) => d.getAttribute("data-details-id"));
    return { expanded, openDetails, expandedChips };
  }
  _restoreState(state) {
    if (!this.shadowRoot) return;
    const panels = this.shadowRoot.querySelectorAll("ha-expansion-panel:not([data-panel-id])");
    state.expanded.forEach((index) => {
      if (panels[index]) {
        panels[index].expanded = true;
        panels[index].setAttribute("expanded", "");
        if (typeof panels[index].__triggerRender === "function") {
          panels[index].__triggerRender();
        }
      }
    });
    state.expandedChips.forEach((id) => {
      const panel = this.shadowRoot.querySelector(`ha-expansion-panel[data-panel-id="${id}"]`);
      if (panel) {
        panel.expanded = true;
        panel.setAttribute("expanded", "");
        if (typeof panel.__triggerRender === "function") {
          panel.__triggerRender();
        }
      }
    });
    state.openDetails.forEach((id) => {
      const details = this.shadowRoot.querySelector(`details[data-details-id="${id}"]`);
      if (details) details.open = true;
    });
  }
  _selectedEntityRow(holder, chip, domains, roomIndex, category, entityIndex) {
    const panel = document.createElement("ha-expansion-panel");
    const nameText = chip.entity ? entityName(this._hass, chip.entity) : "";
    panel.header = nameText || `Chip ${entityIndex + 1}`;
    panel.outlined = true;
    panel.setAttribute("data-panel-id", `${roomIndex}-${category}-${entityIndex}`);

    const renderChipContent = () => {
      const container = document.createElement("div");
      container.className = "entity-editor-content";
      
      const main = document.createElement("div"); main.className = "entity-main";
      const picker = document.createElement("ha-entity-picker");
      picker.hass = this._hass; picker.value = chip.entity; picker.includeDomains = domains; picker.allowCustomEntity = true;
      this._handlePicker(picker, (value) => value ? this._updateChip(roomIndex, category, entityIndex, { entity: value }) : this._removeChip(roomIndex, category, entityIndex), true);
      
      const remove = document.createElement("ha-icon-button"); remove.label = localize(this._hass, "remove_entity");
      const removeIcon = document.createElement("ha-icon"); removeIcon.icon = "mdi:close"; remove.append(removeIcon);
      remove.addEventListener("click", () => { this._removeChip(roomIndex, category, entityIndex); this._render(); });
      main.append(picker, remove); container.append(main);

      // Aspetto (Appearance) section
      const appearanceTitle = document.createElement("div"); appearanceTitle.className = "editor-section-title"; appearanceTitle.textContent = localize(this._hass, "appearance");
      container.append(appearanceTitle);
      
      const name = document.createElement("ha-selector"); name.className = "full-width-field"; name.hass = this._hass; name.label = localize(this._hass, "label_optional"); name.selector = { template: {} }; name.value = chip.name || ""; this._handlePicker(name, (value) => this._updateChip(roomIndex, category, entityIndex, { name: value || undefined }));
      container.append(name);

      const appearanceGrid = document.createElement("div"); appearanceGrid.className = "chip-options";
      const icon = document.createElement("ha-icon-picker"); icon.hass = this._hass; icon.label = localize(this._hass, "icon_optional"); icon.value = chip.icon || ""; this._handlePicker(icon, (value) => this._updateChip(roomIndex, category, entityIndex, { icon: value || undefined }));
      const activeIcon = document.createElement("ha-icon-picker"); activeIcon.hass = this._hass; activeIcon.label = localize(this._hass, "active_icon"); activeIcon.value = chip.active_icon || ""; this._handlePicker(activeIcon, (value) => this._updateChip(roomIndex, category, entityIndex, { active_icon: value || undefined }));
      const color = document.createElement("ha-selector"); color.hass = this._hass; color.selector = { ui_color: {} }; color.value = chip.color || "#ffb300"; this._handlePicker(color, (value) => this._updateChip(roomIndex, category, entityIndex, { color: value || undefined }));
      appearanceGrid.append(icon, activeIcon, color); container.append(appearanceGrid);

      // Azioni (Actions) section
      const actionsTitle = document.createElement("div"); actionsTitle.className = "editor-section-title"; actionsTitle.textContent = localize(this._hass, "actions");
      container.append(actionsTitle);
      
      const actionsGrid = document.createElement("div"); actionsGrid.className = "chip-options";
      const tapAction = document.createElement("ha-selector"); tapAction.hass = this._hass; tapAction.label = localize(this._hass, "tap_action"); tapAction.selector = { ui_action: {} }; tapAction.value = chip.tap_action || { action: "more-info" }; this._handlePicker(tapAction, (value) => this._updateChip(roomIndex, category, entityIndex, { tap_action: value || undefined }));
      const holdAction = document.createElement("ha-selector"); holdAction.hass = this._hass; holdAction.label = localize(this._hass, "hold_action"); holdAction.selector = { ui_action: {} }; holdAction.value = chip.hold_action || { action: "none" }; this._handlePicker(holdAction, (value) => this._updateChip(roomIndex, category, entityIndex, { hold_action: value || undefined }));
      actionsGrid.append(tapAction, holdAction); container.append(actionsGrid);

      if (chip.entity && (chip.entity.startsWith("input_select.") || chip.entity.startsWith("select."))) {
        const dropdownItem = document.createElement("div");
        dropdownItem.className = "control-item";
        dropdownItem.style.marginTop = "8px";
        dropdownItem.style.padding = "0 8px";
        dropdownItem.innerHTML = `<ha-switch id="dropdown" ${chip.dropdown ? "checked" : ""}></ha-switch><label for="dropdown" style="margin-left:8px;">${localize(this._hass, "show_dropdown")}</label>`;
        dropdownItem.querySelector("#dropdown").addEventListener("change", (event) => {
          this._updateChip(roomIndex, category, entityIndex, { dropdown: event.currentTarget.checked });
        });
        container.append(dropdownItem);
      }

      const details = document.createElement("details");
      details.setAttribute("data-details-id", `${roomIndex}-${category}-${entityIndex}`);
      const summary = document.createElement("summary"); summary.textContent = localize(this._hass, "visibility_conditions"); details.append(summary);

      const visibility = sanitizeVisibilityConditions(chip.visibility || (chip.condition_entity ? [
        chip.condition_invert ? {
          condition: "state",
          entity: chip.condition_entity,
          state_not: chip.condition_state || "on"
        } : {
          condition: "state",
          entity: chip.condition_entity,
          state: chip.condition_state || "on"
        }
      ] : []));

      const condSelector = document.createElement("ha-card-conditions-editor");
      condSelector.hass = this._hass;
      condSelector.conditions = visibility;
      condSelector.addEventListener("value-changed", (event) => {
        if (event.target !== condSelector) return;
        const value = event.detail.value;
        condSelector.conditions = value;
        const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
        this._updateChip(roomIndex, category, entityIndex, {
          visibility: hasValue ? value : undefined,
          condition_entity: undefined,
          condition_state: undefined,
          condition_invert: undefined
        });
        this._render();
      });
      details.append(condSelector);
      container.append(details);

      panel.append(container);
    };

    const triggerRender = () => {
      if (panel.dataset.rendered === "true") return;
      panel.dataset.rendered = "true";
      renderChipContent();
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 50);
    };
    panel.__triggerRender = triggerRender;

    panel.addEventListener("pointerdown", triggerRender);
    panel.addEventListener("expanded-changed", (event) => {
      if (panel.expanded) triggerRender();
    });

    if (panel.expanded || panel.hasAttribute("expanded")) {
      triggerRender();
    }

    holder.append(panel);
  }
  _moveCategory(index, direction) {
    const defaultOrder = ["lights", "covers", "climate", "media", "switches"];
    const order = [...(this._config.category_order || defaultOrder)];
    const target = index + direction;
    if (target < 0 || target >= order.length) return;
    [order[index], order[target]] = [order[target], order[index]];
    this._emit({ ...this._config, category_order: order });
    this._render();
  }
  _render() {
    if (!this._hass || !this._config) return;
    this._isUpdating = false;
    const state = this._saveState();
    
    // Imposta minHeight per evitare il saltellamento o il reset dello scorrimento del dialog
    const container = this.shadowRoot.querySelector(".editor");
    const currentHeight = container ? container.offsetHeight : 0;
    if (currentHeight) {
      this.style.minHeight = `${currentHeight}px`;
    }
    
    const cardType = this._config.card_type || "rooms";
    
    if (!this.shadowRoot.querySelector(".editor")) {
      this.shadowRoot.innerHTML = `<style>${EDITOR_STYLE}</style><div class="editor"><div class="controls"><div class="control-item"><ha-select id="card-type" label="${localize(this._hass, "card_type")}"><ha-list-item value="rooms">${localize(this._hass, "rooms")}</ha-list-item><ha-list-item value="weather">${localize(this._hass, "weather")}</ha-list-item></ha-select></div><div class="control-item rooms-only"><ha-switch id="sort" ${this._config.sort_by_motion ? "checked" : ""}></ha-switch><label for="sort">${localize(this._hass, "sort_by_motion")}</label></div><div class="control-item"><ha-switch id="entity-icons" ${this._config.show_entity_icons ? "checked" : ""}></ha-switch><label for="entity-icons">${localize(this._hass, "show_entity_icons")}</label></div></div><div class="category-order-section rooms-only"><h5>${localize(this._hass, "category_order")}</h5><div id="category-order-list"></div></div><div id="rooms-section" class="rooms-only"><div id="rooms"></div><ha-button id="add">${localize(this._hass, "add_room")}</ha-button></div><div id="weather-section" class="weather-only"></div></div>`;
      
      const typeSelect = this.shadowRoot.querySelector("#card-type");
      typeSelect.value = cardType;
      typeSelect.addEventListener("change", (event) => {
        const val = event.target.value;
        this._emit({ ...this._config, card_type: val });
        this._render();
      });
      
      this.shadowRoot.querySelector("#sort").addEventListener("change", (event) => this._emit({ ...this._config, sort_by_motion: event.currentTarget.checked }));
      this.shadowRoot.querySelector("#entity-icons").addEventListener("change", (event) => this._emit({ ...this._config, show_entity_icons: event.currentTarget.checked }));
      this.shadowRoot.querySelector("#add").addEventListener("click", () => { this._emit({ ...this._config, rooms: [...(this._config.rooms || []), { entities: {} }] }); this._render(); });
    } else {
      const typeSelect = this.shadowRoot.querySelector("#card-type");
      if (typeSelect) typeSelect.value = cardType;
      const sortSwitch = this.shadowRoot.querySelector("#sort");
      if (sortSwitch) sortSwitch.checked = !!this._config.sort_by_motion;
      const iconsSwitch = this.shadowRoot.querySelector("#entity-icons");
      if (iconsSwitch) iconsSwitch.checked = !!this._config.show_entity_icons;
    }
    
    const editorEl = this.shadowRoot.querySelector(".editor");
    editorEl.className = `editor mode-${cardType}`;
    
    if (cardType === "rooms") {
      const defaultOrder = ["lights", "covers", "climate", "media", "switches"];
      const order = this._config.category_order || defaultOrder;
      const orderList = this.shadowRoot.querySelector("#category-order-list");
      if (orderList) {
        orderList.innerHTML = "";
        order.forEach((key, idx) => {
          const meta = CATEGORIES[key];
          if (!meta) return;
          const row = document.createElement("div");
          row.className = "category-order-row";
          row.innerHTML = `<div class="category-order-info"><ha-icon icon="${meta.icon}"></ha-icon><span>${meta.label}</span></div><div class="category-order-actions"><ha-icon-button data-up="${idx}" label="Sposta in alto"><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button><ha-icon-button data-down="${idx}" label="Sposta in basso"><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button></div>`;
          const upBtn = row.querySelector('[data-up]');
          const downBtn = row.querySelector('[data-down]');
          upBtn.disabled = idx === 0;
          downBtn.disabled = idx === order.length - 1;
          upBtn.addEventListener("click", () => this._moveCategory(idx, -1));
          downBtn.addEventListener("click", () => this._moveCategory(idx, 1));
          orderList.append(row);
        });
      }
      
      const roomsContainer = this.shadowRoot.querySelector("#rooms");
      roomsContainer.innerHTML = "";
      if (Array.isArray(this._config.rooms)) {
        this._config.rooms.forEach((room, index) => this._roomEditor(roomsContainer, room, index));
      }
    } else {
      const weatherSection = this.shadowRoot.querySelector("#weather-section");
      this._weatherEditor(weatherSection);
    }
    
    this._restoreState(state);
    
    requestAnimationFrame(() => {
      this.style.minHeight = "";
    });
  }
  _weatherEditor(parent) {
    parent.innerHTML = "";
    const container = document.createElement("section");
    container.className = "weather-editor-container";
    container.innerHTML = `
      <div class="fields">
        <div class="field"><ha-entity-picker data-temp label="${localize(this._hass, "apparent_temp")}"></ha-entity-picker></div>
        <div class="field"><ha-entity-picker data-cond label="${localize(this._hass, "weather_condition")}"></ha-entity-picker></div>
        <div class="field"><ha-entity-picker data-high label="${localize(this._hass, "high_temp")}"></ha-entity-picker></div>
        <div class="field"><ha-entity-picker data-low label="${localize(this._hass, "low_temp")}"></ha-entity-picker></div>
        <div class="field"><ha-entity-picker data-precip label="${localize(this._hass, "precip_probability")}"></ha-entity-picker></div>
        <div class="field"><ha-entity-picker data-icon label="${localize(this._hass, "animated_icon")}"></ha-entity-picker></div>
        <div class="field"><ha-entity-picker data-sunset label="${localize(this._hass, "sunset_sensor")}"></ha-entity-picker></div>
        <div class="field" data-color></div>
        <div class="field" data-tap-action></div>
        <div class="field" data-hold-action></div>
      </div>
      <div class="entities">
        <h4>Chips</h4>
        <div id="weather-chips-list"></div>
      </div>
    `;
    parent.append(container);
    
    const temp = container.querySelector("[data-temp]"); temp.hass = this._hass; temp.value = this._config.temp_entity || ""; this._handlePicker(temp, (value) => this._emit({ ...this._config, temp_entity: value || undefined }));
    const cond = container.querySelector("[data-cond]"); cond.hass = this._hass; cond.value = this._config.condition_entity || ""; this._handlePicker(cond, (value) => this._emit({ ...this._config, condition_entity: value || undefined }));
    const high = container.querySelector("[data-high]"); high.hass = this._hass; high.value = this._config.high_temp_entity || ""; this._handlePicker(high, (value) => this._emit({ ...this._config, high_temp_entity: value || undefined }));
    const low = container.querySelector("[data-low]"); low.hass = this._hass; low.value = this._config.low_temp_entity || ""; this._handlePicker(low, (value) => this._emit({ ...this._config, low_temp_entity: value || undefined }));
    const precip = container.querySelector("[data-precip]"); precip.hass = this._hass; precip.value = this._config.precip_probability_entity || ""; this._handlePicker(precip, (value) => this._emit({ ...this._config, precip_probability_entity: value || undefined }));
    const icon = container.querySelector("[data-icon]"); icon.hass = this._hass; icon.value = this._config.weather_icon_entity || ""; this._handlePicker(icon, (value) => this._emit({ ...this._config, weather_icon_entity: value || undefined }));
    const sunset = container.querySelector("[data-sunset]"); sunset.hass = this._hass; sunset.value = this._config.sunset_entity || "sun.sun"; this._handlePicker(sunset, (value) => this._emit({ ...this._config, sunset_entity: value || undefined }));
    
    const colorHolder = container.querySelector("[data-color]"); const color = document.createElement("ha-selector"); color.hass = this._hass; color.label = localize(this._hass, "base_color"); color.selector = { ui_color: {} }; color.value = this._config.color || "#1a365d"; this._handlePicker(color, (value) => this._emit({ ...this._config, color: value })); colorHolder.append(color);
    
    const tapActionHolder = container.querySelector("[data-tap-action]");
    const tapAction = document.createElement("ha-selector"); tapAction.hass = this._hass; tapAction.label = localize(this._hass, "tap_action"); tapAction.selector = { ui_action: {} }; tapAction.value = this._config.tap_action || { action: "navigate", navigation_path: "#meteo" }; this._handlePicker(tapAction, (value) => this._emit({ ...this._config, tap_action: value || undefined })); tapActionHolder.append(tapAction);

    const holdActionHolder = container.querySelector("[data-hold-action]");
    const holdAction = document.createElement("ha-selector"); holdAction.hass = this._hass; holdAction.label = localize(this._hass, "hold_action"); holdAction.selector = { ui_action: {} }; holdAction.value = this._config.hold_action || { action: "none" }; this._handlePicker(holdAction, (value) => this._emit({ ...this._config, hold_action: value || undefined })); holdActionHolder.append(holdAction);
    
    const chipsList = container.querySelector("#weather-chips-list");
    const chips = this._config.chips || [];
    chips.forEach((chip, index) => {
      this._selectedEntityRow(chipsList, chip, null, 0, "weather", index);
    });
    this._addEntityPicker(chipsList, localize(this._hass, "add_chip"), null, (value) => this._addChip(0, "weather", value));
  }
  _roomEditor(parent, room, index) {
    const panel = document.createElement("ha-expansion-panel"); panel.outlined = true;
    
    const headerSpan = document.createElement("span");
    headerSpan.slot = "header";
    headerSpan.style.display = "inline-flex";
    headerSpan.style.alignItems = "center";
    headerSpan.style.gap = "8px";
    
    const roomArea = this._hass.areas?.[room.area];
    const roomIcon = document.createElement("ha-icon");
    roomIcon.icon = room.icon || roomArea?.icon || "mdi:home";
    roomIcon.style.setProperty("--mdc-icon-size", "20px");
    roomIcon.style.color = "var(--secondary-text-color)";
    
    const textSpan = document.createElement("span");
    textSpan.textContent = room.title || roomArea?.name || `${localize(this._hass, "room")} ${index + 1}`;
    
    headerSpan.append(roomIcon, textSpan);
    panel.append(headerSpan);
    
    const renderRoomContent = () => {
      const container = document.createElement("section"); container.className = "room-editor";
      container.innerHTML = `<div class="fields"><div class="field"><ha-area-picker data-area label="${localize(this._hass, "area")}"></ha-area-picker></div><div class="field full-width" data-title></div><div class="field" data-color></div><div class="field"><ha-icon-picker data-icon label="${localize(this._hass, "icon_optional")}"></ha-icon-picker></div><div class="field"><ha-entity-picker data-motion label="${localize(this._hass, "motion_sensor")}"></ha-entity-picker></div><div class="field"><ha-entity-picker data-opening label="${localize(this._hass, "opening_sensor")}"></ha-entity-picker></div><div class="field"><ha-entity-picker data-temperature label="${localize(this._hass, "temperature_sensor")}"></ha-entity-picker></div><div class="field"><ha-entity-picker data-humidity label="${localize(this._hass, "humidity_sensor")}"></ha-entity-picker></div><div class="field"><ha-entity-picker data-illuminance label="${localize(this._hass, "illuminance_sensor")}"></ha-entity-picker></div><div class="field" data-tap-action></div><div class="field" data-hold-action></div></div><div class="entities"><h4>${localize(this._hass, "entities_by_category")}</h4></div><div class="room-actions"><ha-icon-button data-up label="${localize(this._hass, "sposta_alto")}"><ha-icon icon="mdi:arrow-up"></ha-icon></ha-icon-button><ha-icon-button data-down label="${localize(this._hass, "sposta_basso")}"><ha-icon icon="mdi:arrow-down"></ha-icon></ha-icon-button><ha-icon-button data-remove label="${localize(this._hass, "rimuovi_stanza")}"><ha-icon icon="mdi:delete"></ha-icon></ha-icon-button></div>`;
      panel.append(container);
      
      const area = container.querySelector("[data-area]"); area.hass = this._hass; area.label = localize(this._hass, "area"); area.value = room.area || ""; this._handlePicker(area, (value) => this._updateRoom(index, { area: value || undefined }), true);
      
      const titleHolder = container.querySelector("[data-title]");
      const titleSelector = document.createElement("ha-selector"); titleSelector.hass = this._hass; titleSelector.label = localize(this._hass, "custom_title"); titleSelector.selector = { template: {} }; titleSelector.value = room.title || ""; this._handlePicker(titleSelector, (value) => this._updateRoom(index, { title: value || undefined })); titleHolder.append(titleSelector);
      
      const colorHolder = container.querySelector("[data-color]"); const color = document.createElement("ha-selector"); color.hass = this._hass; color.label = localize(this._hass, "base_color"); color.selector = { ui_color: {} }; color.value = room.color || defaultColor(this._hass.areas?.[room.area]?.name); this._handlePicker(color, (value) => this._updateRoom(index, { color: value })); colorHolder.append(color);
      const icon = container.querySelector("[data-icon]"); icon.hass = this._hass; icon.value = room.icon || ""; this._handlePicker(icon, (value) => this._updateRoom(index, { icon: value || undefined }));
      const motion = container.querySelector("[data-motion]"); motion.hass = this._hass; motion.value = room.motion_entity || ""; motion.includeDomains = ["binary_sensor"]; motion.includeDeviceClasses = ["motion", "occupancy", "presence"]; motion.allowCustomEntity = true; this._handlePicker(motion, (value) => this._updateRoom(index, { motion_entity: value || undefined }));
      const opening = container.querySelector("[data-opening]"); opening.hass = this._hass; opening.value = room.opening_entity || ""; opening.includeDomains = ["binary_sensor"]; opening.includeDeviceClasses = ["opening", "door", "window"]; opening.allowCustomEntity = true; this._handlePicker(opening, (value) => this._updateRoom(index, { opening_entity: value || undefined }));
      const tempPicker = container.querySelector("[data-temperature]"); tempPicker.hass = this._hass; tempPicker.value = room.temperature_entity || ""; tempPicker.includeDomains = ["sensor"]; tempPicker.includeDeviceClasses = ["temperature"]; tempPicker.allowCustomEntity = true; this._handlePicker(tempPicker, (value) => this._updateRoom(index, { temperature_entity: value || undefined }));
      const humPicker = container.querySelector("[data-humidity]"); humPicker.hass = this._hass; humPicker.value = room.humidity_entity || ""; humPicker.includeDomains = ["sensor"]; humPicker.includeDeviceClasses = ["humidity"]; humPicker.allowCustomEntity = true; this._handlePicker(humPicker, (value) => this._updateRoom(index, { humidity_entity: value || undefined }));
      const luxPicker = container.querySelector("[data-illuminance]"); luxPicker.hass = this._hass; luxPicker.value = room.illuminance_entity || ""; luxPicker.includeDomains = ["sensor"]; luxPicker.includeDeviceClasses = ["illuminance"]; luxPicker.allowCustomEntity = true; this._handlePicker(luxPicker, (value) => this._updateRoom(index, { illuminance_entity: value || undefined }));
      
      const tapActionHolder = container.querySelector("[data-tap-action]");
      const tapAction = document.createElement("ha-selector"); tapAction.hass = this._hass; tapAction.label = localize(this._hass, "tap_action"); tapAction.selector = { ui_action: {} }; tapAction.value = room.tap_action || { action: "more-info" }; this._handlePicker(tapAction, (value) => this._updateRoom(index, { tap_action: value || undefined })); tapActionHolder.append(tapAction);

      const holdActionHolder = container.querySelector("[data-hold-action]");
      const holdAction = document.createElement("ha-selector"); holdAction.hass = this._hass; holdAction.label = localize(this._hass, "hold_action"); holdAction.selector = { ui_action: {} }; holdAction.value = room.hold_action || { action: "none" }; this._handlePicker(holdAction, (value) => this._updateRoom(index, { hold_action: value || undefined })); holdActionHolder.append(holdAction);
      
      // Summary entities section
      const summarySec = document.createElement("div");
      summarySec.className = "summary-entities-section";
      summarySec.style.display = "flex";
      summarySec.style.flexDirection = "column";
      summarySec.style.gap = "12px";
      summarySec.style.marginBottom = "16px";
      summarySec.innerHTML = `<div class="editor-section-title" style="margin-top: 0;">${localize(this._hass, "additional_summary_entities")}</div>`;
      
      const entitiesPicker = document.createElement("ha-entities-picker");
      entitiesPicker.hass = this._hass;
      const rawSummary = room.summary_entities || [];
      const summaryArray = Array.isArray(rawSummary) ? rawSummary : (rawSummary ? [rawSummary] : []);
      const summaryEntities = summaryArray.map((item) => typeof item === "string" ? { entity: item } : item).filter((item) => item?.entity);
      
      entitiesPicker.value = summaryEntities.map(item => item.entity);
      entitiesPicker.addEventListener("value-changed", (event) => {
        if (event.target !== entitiesPicker) return;
        const newEntitiesList = event.detail.value || [];
        const existingMap = new Map(summaryEntities.map(item => [item.entity, item]));
        const updated = newEntitiesList.map(id => {
          const existing = existingMap.get(id);
          return existing ? existing : { entity: id };
        });
        this._updateRoom(index, { summary_entities: updated.length ? updated : undefined });
        this._render();
      });
      summarySec.append(entitiesPicker);

      summaryEntities.forEach((item, entityIndex) => {
        this._selectedSummaryEntityRow(summarySec, item, index, entityIndex);
      });

      container.insertBefore(summarySec, container.querySelector(".entities"));

      const defaultOrder = ["lights", "covers", "climate", "media", "switches"];
      const order = this._config.category_order || defaultOrder;
      order.forEach((key) => {
        const meta = CATEGORIES[key];
        if (!meta) return;
        const category = document.createElement("section");
        category.className = "category";
        category.innerHTML = `<div class="category-header"><ha-icon icon="${meta.icon}"></ha-icon><span class="category-title">${localize(this._hass, key)}</span></div>`;
        container.querySelector(".entities").append(category);
        const domains = meta.domains || [meta.domain];
        const rawSelected = room.entities?.[key];
        const selectedArray = Array.isArray(rawSelected) ? rawSelected : (rawSelected ? [rawSelected] : []);
        const selected = selectedArray.map((item) => typeof item === "string" ? { entity: item } : item).filter((item) => item?.entity);
        selected.forEach((chip, entityIndex) => this._selectedEntityRow(category, chip, domains, index, key, entityIndex));
        this._addEntityPicker(category, `${localize(this._hass, "add_entity")} ${localize(this._hass, key)}`, domains, (value) => this._addChip(index, key, value));
      });
      const details = document.createElement("details");
      details.setAttribute("data-details-id", `room-${index}-visibility`);
      const summary = document.createElement("summary"); summary.textContent = localize(this._hass, "room_visibility_conditions"); details.append(summary);

      const visibility = sanitizeVisibilityConditions(room.visibility || (room.condition_entity ? [
        room.condition_invert ? {
          condition: "state",
          entity: room.condition_entity,
          state_not: room.condition_state || "on"
        } : {
          condition: "state",
          entity: room.condition_entity,
          state: room.condition_state || "on"
        }
      ] : []));

      const condSelector = document.createElement("ha-card-conditions-editor");
      condSelector.hass = this._hass;
      condSelector.conditions = visibility;
      condSelector.addEventListener("value-changed", (event) => {
        if (event.target !== condSelector) return;
        const value = event.detail.value;
        condSelector.conditions = value;
        const hasValue = Array.isArray(value) ? value.length > 0 : !!value;
        this._updateRoom(index, {
          visibility: hasValue ? value : undefined,
          condition_entity: undefined,
          condition_state: undefined,
          condition_invert: undefined
        });
        this._render();
      });
      details.append(condSelector);
      container.insertBefore(details, container.querySelector(".room-actions"));

      const up = container.querySelector("[data-up]"); up.disabled = index === 0; up.addEventListener("click", () => this._moveRoom(index, -1));
      const down = container.querySelector("[data-down]"); down.disabled = index === this._config.rooms.length - 1; down.addEventListener("click", () => this._moveRoom(index, 1));
      container.querySelector("[data-remove]").addEventListener("click", () => { this._emit({ ...this._config, rooms: this._config.rooms.filter((_, i) => i !== index) }); this._render(); });
    };

    const triggerRoomRender = () => {
      if (panel.dataset.rendered === "true") return;
      panel.dataset.rendered = "true";
      renderRoomContent();
      setTimeout(() => {
        window.dispatchEvent(new Event("resize"));
      }, 50);
    };
    panel.__triggerRender = triggerRoomRender;

    panel.addEventListener("pointerdown", triggerRoomRender);
    panel.addEventListener("expanded-changed", (event) => {
      if (panel.expanded) triggerRoomRender();
    });

    if (panel.expanded || panel.hasAttribute("expanded")) {
      triggerRoomRender();
    }

    parent.append(panel);
  }

  _updateSummaryEntity(roomIndex, entityIndex, changes) {
    const rooms = [...(this._config.rooms || [])];
    const room = { ...rooms[roomIndex] };
    const summary_entities = [...(room.summary_entities || [])];
    const item = typeof summary_entities[entityIndex] === "string"
      ? { entity: summary_entities[entityIndex] }
      : { ...summary_entities[entityIndex] };
    summary_entities[entityIndex] = { ...item, ...changes };
    room.summary_entities = summary_entities;
    rooms[roomIndex] = room;
    this._emit({ ...this._config, rooms });
  }
  _selectedSummaryEntityRow(holder, item, roomIndex, entityIndex) {
    const panel = document.createElement("ha-expansion-panel");
    const nameText = item.entity ? entityName(this._hass, item.entity) : "";
    panel.header = `${nameText || item.entity} (Personalizza)`;
    panel.outlined = true;
    panel.setAttribute("data-panel-id", `${roomIndex}-summary-${entityIndex}`);

    const renderContent = () => {
      const container = document.createElement("div");
      container.className = "entity-editor-content";
      
      const appearanceTitle = document.createElement("div"); appearanceTitle.className = "editor-section-title"; appearanceTitle.textContent = "Aspetto"; container.append(appearanceTitle);
      
      const name = document.createElement("ha-selector"); name.className = "full-width-field"; name.hass = this._hass; name.label = "Etichetta (opzionale)"; name.selector = { template: {} }; name.value = item.name || ""; this._handlePicker(name, (value) => this._updateSummaryEntity(roomIndex, entityIndex, { name: value || undefined }));
      container.append(name);

      const appearanceGrid = document.createElement("div"); appearanceGrid.className = "chip-options";
      const icon = document.createElement("ha-icon-picker"); icon.hass = this._hass; icon.label = "Icona (opzionale)"; icon.value = item.icon || ""; this._handlePicker(icon, (value) => this._updateSummaryEntity(roomIndex, entityIndex, { icon: value || undefined }));
      appearanceGrid.append(icon); container.append(appearanceGrid);

      panel.append(container);
    };

    const state = this._saveState();
    if (state.expandedChips.includes(panel.getAttribute("data-panel-id"))) {
      panel.expanded = true;
      renderContent();
    } else {
      panel.addEventListener("expanded-changed", (event) => {
        if (event.detail.expanded && !panel.querySelector(".entity-editor-content")) {
          renderContent();
        }
      }, { once: true });
    }

    const triggerRender = () => {
      if (!panel.expanded && !panel.querySelector(".entity-editor-content")) {
        renderContent();
      }
    };
    panel.addEventListener("pointerdown", triggerRender);

    holder.append(panel);
  }
}

customElements.define(CARD_TAG, CustomRoomCard);
customElements.define("custom-room-card-editor", CustomRoomCardEditor);
window.customCards = window.customCards || [];
window.customCards.push({ type: CARD_TAG, name: "Custom Room Card", description: "Panoramica multi-stanza configurabile per area." });
console.info(`%c CUSTOM-ROOM-CARD %c v${VERSION} `, "color:white;background:#A66D58;font-weight:700", "color:#A66D58;background:white;font-weight:700");
