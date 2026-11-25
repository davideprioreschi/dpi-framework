// Documentazione DPI — codice dell'APPLICAZIONE (non del framework): ricerca client-side con Ctrl/Cmd+K e provider della mappa degli esempi.
// Script CLASSICO (defer, dopo dpi/dpi.js): usa il runtime window.DPI, non ne incorpora una copia. L'indice di ricerca è un dato preparato (assets/search-index.js): nessun fetch,
// quindi la documentazione funziona anche aprendo le pagine con doppio clic.
const { init, map } = globalThis.DPI;
const script = document.currentScript;   // valido durante l'esecuzione di uno script classico

// Provider degli esempi (solo per la demo della mappa): OpenStreetMap, senza chiave, attribuzione e condizioni visibili, caricamento solo dopo consenso.
map.registerProvider('osm', {
    tiles: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '© OpenStreetMap contributors',
    attributionUrl: 'https://www.openstreetmap.org/copyright',
    termsUrl: 'https://operations.osmfoundation.org/policies/tiles/',
    maxZoom: 19,
    subdomains: [''],
});

const base = new URL('../', script.src);   // radice del sito di documentazione
const load = () => Promise.resolve(globalThis.DPI_DOCS_INDEX ?? []);
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const opener = () => [...document.querySelectorAll('[data-dpi-dialog-open]')].find((b) => b.getAttribute('data-dpi-dialog-open').endsWith('cerca'));
const dlg = () => document.querySelector('dialog[id$="cerca"]');
const box = () => dlg()?.querySelector('[aria-label="Risultati"]');
let timer = 0;
let seq = 0;

addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); opener()?.click(); }
});

async function search(q) {
    const my = ++seq;
    const data = await load();
    if (my !== seq || !box()) return;
    const n = norm(q.trim());
    const hits = n === '' ? [] : data
        .map((p) => {
            const t = norm(p.title);
            const score = (t === n ? 6 : 0) + (t.startsWith(n) ? 3 : 0) + (t.includes(n) ? 2 : 0) + (norm(p.kw).includes(n) ? 1 : 0) + (norm(p.summary).includes(n) ? 1 : 0);
            return { p, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score || a.p.title.localeCompare(b.p.title))
        .slice(0, 12);
    const rows = hits.map(({ p }) => `<li><a class="dpi-list__row dpi-list__row_link" href="${esc(new URL(p.url, base).href)}"><span class="dpi-list__text"><span class="dpi-list__label">${esc(p.title)}</span><span class="dpi-list__detail">${esc(p.cat)} — ${esc(p.summary.slice(0, 90))}</span></span></a></li>`).join('');
    box().innerHTML = rows
        ? `<ul class="dpi-list" aria-label="Risultati">${rows}</ul>`
        : `<p class="dpi-text dpi-text--muted">${n === '' ? 'Scrivi per cercare componenti e guide.' : `Nessun risultato per «${esc(q)}».`}</p>`;
    init(box());
}

document.addEventListener('input', (e) => {
    const i = e.target;
    if (!(i instanceof HTMLInputElement) || i.name !== 'q' || !dlg()?.contains(i)) return;
    clearTimeout(timer);
    timer = setTimeout(() => search(i.value), 120);
});

// Invio sul campo apre il primo risultato; frecce spostano il focus tra i risultati
document.addEventListener('keydown', (e) => {
    const d = dlg();
    if (!d?.open) return;
    const links = () => [...d.querySelectorAll('[aria-label="Risultati"] a')];
    if (e.target.name === 'q' && e.key === 'Enter') { e.preventDefault(); links()[0]?.click(); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); const l = links(); const i = l.indexOf(document.activeElement); (l[i + 1] ?? l[0])?.focus(); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); const l = links(); const i = l.indexOf(document.activeElement); if (i <= 0) d.querySelector('input[name="q"]')?.focus(); else l[i - 1].focus(); }
});
