# Rent House Milano — demo animata

Demo HTML statica del sito Rent House Milano, ricavata dal file Figma "RentHouse" (frame desktop 1920px).

## Pagine

- `index.html`: home
- `appartamenti.html`: elenco appartamenti e FAQ
- `deluxe-room.html`: scheda appartamento

## Animazioni

- sipario con monogramma all'apertura e nel passaggio tra una pagina e l'altra
- effetto typing sul titolo principale di ogni pagina
- foto in parallasse e foto sovrapposte che fluttuano a velocità diverse
- titoli che salgono riga per riga, testi e foto che compaiono allo scroll
- smooth scroll ([Lenis](https://github.com/darkroomengineering/lenis))
- caroselli trascinabili col mouse, FAQ apribili, header che si nasconde scorrendo

Chi ha attivato "riduci movimento" nel sistema operativo vede il sito senza animazioni.

## Vederla in locale

Non serve installare niente: apri `index.html` nel browser, oppure avvia un server statico:

```bash
python3 -m http.server 8000
```

e vai su http://localhost:8000.

## Note

- Il layout desktop scala in proporzione al frame Figma da 1920px; sotto i 900px passa a una versione mobile impilata.
- I testi in inglese (scheda camera, FAQ, footer) e i prezzi in $ sono quelli del template in Figma: vanno sostituiti con i contenuti definitivi.
- Le risposte delle FAQ sono testi segnaposto.
