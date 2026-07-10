# Custom Room Card

Una card Lovelace multi-stanza per Home Assistant: stato di presenza/aperture, temperatura, umidità e luminosità nel titolo; controlli rapidi configurati esplicitamente per ogni area.

Non richiede `button-card`, Mushroom, `card-mod` o `stack-in-card`.

## Installazione con HACS

1. In HACS, aggiungi questo repository come **Dashboard** custom repository e installalo.
2. Ricarica il browser (oppure Home Assistant).
3. Aggiungi una card alla dashboard, seleziona **Custom Room Card** e scegli un'area.

In alternativa, configurazione YAML:

```yaml
type: custom:custom-room-card
sort_by_motion: true
rooms:
  - area: sala
    color: "#a66d58"
    motion_entity: binary_sensor.presenza_sala
    entities:
      lights:
        - light.luci_sala
      covers:
        - cover.tapparella_sala
      climate:
        - climate.condizionatore_sala
```

`area` è l'ID dell'area, non il suo nome visualizzato. L'editor visuale usa componenti nativi di Home Assistant per scegliere area, colori, icone, sensore di movimento ed entità per categoria.

## Come vengono scelte le entità

La card trova automaticamente solo i sensori di riepilogo assegnati direttamente all'area o ai suoi dispositivi. Per i pulsanti scegli invece in modo esplicito le entità di ciascuna categoria (Luci, Tapparelle, Clima, Media e Interruttori), evitando controlli tecnici indesiderati. Per l'intestazione privilegia `temperature`, `humidity`, `illuminance`, `presence`, `motion` e `opening`.

## Opzioni

```yaml
type: custom:custom-room-card
sort_by_motion: true            # Porta in alto le aree con movimento attivo
rooms:
  - area: sala
    title: Sala relax           # Opzionale
    icon: mdi:sofa              # Opzionale
    color: "#a66d58"            # Opzionale: predefinito in base al nome area
    motion_entity: binary_sensor.presenza_sala
    entities:
      lights: [light.luci_sala]
      covers: [cover.tapparella_sala]
      climate: [climate.condizionatore_sala]
      media: []
      switches: []
```

Un tap su una luce o interruttore la accende/spegne; il tap sulle altre categorie apre i dettagli dell'entità. Il colore predefinito si adatta a cucina, bagno, camera, studio e giardino; per gli altri ambienti usa il caldo colore sala dello screenshot.

## Sviluppo

```sh
npm install
npm run build
npm run check
```

La risorsa HACS è il bundle monofile `custom-room-card.js`. Dopo ogni modifica al sorgente, esegui `npm run build` prima di pubblicare una release.
