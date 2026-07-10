# Custom Room Card

Una card Lovelace per Home Assistant che trasforma un'area in una panoramica visuale della stanza: stato di presenza/aperture, temperatura, umidità e luminosità nel titolo; controlli rapidi per luci, tapparelle, climatizzazione e media nella parte inferiore.

Non richiede `button-card`, Mushroom, `card-mod` o `stack-in-card`.

## Installazione con HACS

1. In HACS, aggiungi questo repository come **Dashboard** custom repository e installalo.
2. Ricarica il browser (oppure Home Assistant).
3. Aggiungi una card alla dashboard, seleziona **Custom Room Card** e scegli un'area.

In alternativa, configurazione YAML:

```yaml
type: custom:custom-room-card
area: sala
```

`area` è l'ID dell'area, non il suo nome visualizzato.

## Come vengono scelte le entità

La card trova automaticamente le entità assegnate direttamente all'area e quelle assegnate a dispositivi dell'area. Le raggruppa in Luci, Tapparelle, Clima e Media. Per l'intestazione privilegia sensori con `device_class` standard (`temperature`, `humidity`, `illuminance`, `presence`, `opening`).

## Opzioni

```yaml
type: custom:custom-room-card
area: sala
title: Sala relax              # Opzionale: sostituisce il nome area
icon: mdi:sofa                 # Opzionale: icona intestazione
navigation_path: "#sala"       # Opzionale: tap sull'intestazione
show_media: true               # Predefinito: true
show_climate: true             # Predefinito: true
show_covers: true              # Predefinito: true
show_lights: true              # Predefinito: true
```

Un tap su una luce la accende/spegne; il tap sulle altre categorie apre i dettagli dell'entità. Tenere premuto apre sempre i dettagli. La card gestisce anche aree ancora senza entità, senza mostrare errori.

## Sviluppo

```sh
npm install
npm run build
npm run check
```

La risorsa HACS è il bundle monofile `custom-room-card.js`. Dopo ogni modifica al sorgente, esegui `npm run build` prima di pubblicare una release.
