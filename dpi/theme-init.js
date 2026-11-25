/* dpi — ripristino del tema prima del primo disegno. Script classico, sincrono, senza dipendenze (compatibile con CSP: file esterno, niente inline/eval).
   Includilo nell'<head> PRIMA dei CSS e del bundle, senza defer/async:  <script src="dpi/theme-init.js"></script>
   Legge la preferenza salvata da js/theme.js (chiave 'dpi-theme': light | dark | auto) e imposta gli STESSI attributi su <html>: data-dpi-theme (assente = auto)
   e data-dpi-theme-effective. color-scheme segue da data-dpi-theme (css/tokens.css). Senza preferenza salvata non tocca nulla: si segue il sistema. */
(function () {
    var d = document.documentElement, p = null;
    try { p = localStorage.getItem('dpi-theme'); } catch (e) { /* storage non disponibile: si segue il sistema */ }
    if (p === 'light' || p === 'dark') d.setAttribute('data-dpi-theme', p);
    else if (p === 'auto') d.removeAttribute('data-dpi-theme');
    var a = d.getAttribute('data-dpi-theme');
    var dark = a === 'dark' || (a !== 'light' && typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches);
    d.setAttribute('data-dpi-theme-effective', dark ? 'dark' : 'light');
})();
