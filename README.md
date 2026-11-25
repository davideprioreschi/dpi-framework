# DPI — framework frontend Liquid Glass

HTML, CSS e JavaScript. Nessuna build, nessuna dipendenza a runtime.

## Usarlo dal web

```html
<script src="https://davideprioreschi.github.io/dpi-framework/dpi/theme-init.js"></script>
<link rel="stylesheet" href="https://davideprioreschi.github.io/dpi-framework/dpi/dpi.css">
<link rel="stylesheet" href="https://davideprioreschi.github.io/dpi-framework/dpi/css/reset.css">
<script src="https://davideprioreschi.github.io/dpi-framework/dpi/dpi.js" defer></script>
```

E sul contenitore che deve usare la tipografia di DPI:

```html
<body class="dpi-root">
```

`reset.css` agisce solo dentro `.dpi-root`, non sul resto della pagina.

Questi indirizzi seguono sempre l'ultima versione pubblicata: un aggiornamento arriva ai siti che li usano senza interventi (la cache del browser può impiegare qualche minuto).

## In locale

In alternativa si copia la cartella `dpi/` nel proprio sito (vedi `dpi/LEGGIMI.txt`).

## Documentazione

- Componenti e guida: https://davideprioreschi.github.io/dpi-framework/
- Pagina di esempio: `esempio/index.html`

## Licenze

Le licenze di Poppins (OFL), Lucide (ISC) e LiquidGlass (MIT) sono in `dpi/THIRD-PARTY-LICENSES.txt`.

La rifrazione reale del vetro è disponibile solo nei browser Chromium; altrove c'è una resa alternativa.
