/* DPI — runtime frontend. FILE GENERATO da tools/build.mjs (sorgenti modulari in dpi/js/): non modificare a mano.
 * Bundle classico autonomo (IIFE): <script src="dpi/dpi.js" defer></script>. Include runtime, componenti, icone (Lucide, ISC) e il motore LiquidGlass (MIT, gentpan, non modificato):
 * licenze e provenienza in THIRD-PARTY-LICENSES.txt. Registra window.DPI e inizializza da solo i componenti. */
(() => {
  var __defProp = Object.defineProperty;
  var __export = (target2, all) => {
    for (var name in all)
      __defProp(target2, name, { get: all[name], enumerable: true });
  };

  // dpi/js/dropdown.js
  var dropdown_exports = {};
  __export(dropdown_exports, {
    bind: () => bind2,
    hide: () => hide,
    setup: () => setup2,
    show: () => show
  });

  // dpi/js/util.js
  var uid = 0;
  function ownedMap() {
    const k = Symbol("dpi.owned");
    return {
      get: (o) => o && typeof o === "object" ? o[k] : void 0,
      set(o, v) {
        o[k] = v;
        return this;
      },
      has: (o) => !!o && typeof o === "object" && k in o,
      delete(o) {
        if (o && typeof o === "object" && k in o) {
          delete o[k];
          return true;
        }
        return false;
      }
    };
  }
  function ensureId(el6, prefix = "dpi") {
    if (!el6.id) el6.id = `${prefix}-${++uid}`;
    return el6.id;
  }
  function emit(el6, name, detail = {}) {
    el6.dispatchEvent(new CustomEvent(`dpi:${name}`, { bubbles: true, detail }));
  }
  var owned = /* @__PURE__ */ new Set();
  function listenWhile(owner, target2, type, fn, opt) {
    target2.addEventListener(type, fn, opt);
    const rec2 = { owner, target: target2, type, fn, opt, orphan: false };
    owned.add(rec2);
    return () => {
      target2.removeEventListener(type, fn, opt);
      owned.delete(rec2);
    };
  }
  function onRemoved(owner, dispose) {
    const rec2 = { owner, dispose, orphan: false };
    owned.add(rec2);
    return () => owned.delete(rec2);
  }
  function releaseOrphans() {
    for (const rec2 of [...owned]) {
      if (rec2.owner.isConnected) rec2.orphan = false;
      else if (rec2.orphan) {
        owned.delete(rec2);
        if (rec2.dispose) {
          try {
            rec2.dispose();
          } catch (e) {
            console.error(e);
          }
        } else rec2.target.removeEventListener(rec2.type, rec2.fn, rec2.opt);
      } else rec2.orphan = true;
    }
  }

  // dpi/js/drop.js
  var drop_exports = {};
  __export(drop_exports, {
    Springs: () => Springs,
    collect: () => collect2,
    count: () => count,
    createDrop: () => createDrop,
    destroyAll: () => destroyAll,
    elasticOnly: () => elasticOnly,
    get: () => get
  });

  // dpi/vendor/liquidglass/liquid-glass.js
  var NS = "http://www.w3.org/2000/svg";
  var XLINK = "http://www.w3.org/1999/xlink";
  var NEUTRAL = 128;
  var MAP_CACHE_SIZE = 48;
  var DEFAULTS = Object.freeze({
    // Lens rectangle in CSS px, relative to the filtered element's border box.
    x: 0,
    y: 0,
    width: 120,
    height: 64,
    radius: 32,
    // Optics.
    refraction: 18,
    // maximum bend at the rim, CSS px
    bezel: 0.6,
    // curved rim width as a fraction of the lens half-size (min side); 1 = full dome
    curvature: 4,
    // rim profile exponent: 2 = circular, 4 = squircle-like, higher = steeper rim
    ior: 1.5,
    // index of refraction; shapes how quickly the bend fades from the rim inward
    invert: false,
    // false = convex lens (magnifies), true = concave (content pushed outward)
    chroma: 0.12,
    // colour fringe; blue bends (1 + chroma)x as far as red. 0 skips the extra passes
    blur: 0,
    // frost, CSS px
    specular: 0.45,
    // rim highlight 0..1. 0 skips the pass
    specularWidth: 2,
    // rim highlight width, CSS px
    lightAngle: -120,
    // degrees; 0 = light from the right, -90 = from the top. The lit rim is brightest, the far rim reflects dimly
    mapScale: 0
    // map pixels per CSS px; 0 = devicePixelRatio capped at 2
  });
  var MAP_KEYS = ["width", "height", "radius", "bezel", "curvature", "ior", "invert", "specular", "specularWidth", "lightAngle"];
  var engine = detectEngine();
  function detectEngine() {
    if (typeof navigator === "undefined") return "unknown";
    const brands = navigator.userAgentData?.brands;
    if (brands?.some((b) => /Chromium/.test(b.brand))) return "blink";
    const ua = navigator.userAgent;
    if (/Firefox\//.test(ua)) return "gecko";
    if (/AppleWebKit\//.test(ua) && !/Chrome\/|Chromium\/|Edg\//.test(ua)) return "webkit";
    return /Chrome\//.test(ua) ? "blink" : "unknown";
  }
  var profileCache = /* @__PURE__ */ new Map();
  function profileTable(curvature, ior) {
    const key = `${curvature}|${ior}`;
    let table = profileCache.get(key);
    if (table) return table;
    const N = 512;
    table = new Float32Array(N + 1);
    let max = 0;
    for (let i = 0; i <= N; i++) {
      const s = Math.min(i / N, 1 - 1e-6);
      const a = Math.pow(1 - s, curvature);
      const slope = Math.pow(1 - s, curvature - 1) * Math.pow(Math.max(1 - a, 1e-9), 1 / curvature - 1);
      const theta = Math.atan(slope);
      const refracted = Math.asin(Math.sin(theta) / ior);
      const bend = Math.tan(theta - refracted);
      table[i] = bend;
      if (bend > max) max = bend;
    }
    for (let i = 0; i <= N; i++) table[i] /= max || 1;
    table[N] = 0;
    profileCache.set(key, table);
    return table;
  }
  function renderLensMap(options2 = {}, scale = 1) {
    const p = { ...DEFAULTS, ...options2 };
    const w = Math.max(2, Math.round(p.width * scale));
    const h = Math.max(2, Math.round(p.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    const image = ctx.createImageData(w, h);
    const px = image.data;
    const sx = p.width / w;
    const sy = p.height / h;
    const hw = p.width / 2;
    const hh = p.height / 2;
    const r = Math.max(0, Math.min(p.radius, hw, hh));
    const bezel = Math.max(0.5, p.bezel * Math.min(hw, hh));
    const table = profileTable(p.curvature, p.ior);
    const N = table.length - 1;
    const rimWidth = Math.max(0.5, p.specularWidth);
    const aa = Math.max(sx, sy);
    const angle = p.lightAngle * Math.PI / 180;
    const lx = Math.cos(angle);
    const ly = Math.sin(angle);
    const dir = p.invert ? -1 : 1;
    const qw = Math.ceil(w / 2);
    const qh = Math.ceil(h / 2);
    for (let j = 0; j < qh; j++) {
      const y = (j + 0.5) * sy - hh;
      for (let i = 0; i < qw; i++) {
        const x = (i + 0.5) * sx - hw;
        const qx = -x - (hw - r);
        const qy = -y - (hh - r);
        const ox = Math.max(qx, 0);
        const oy = Math.max(qy, 0);
        const corner = Math.hypot(ox, oy);
        const dist = corner + Math.min(Math.max(qx, qy), 0) - r;
        const alpha = Math.min(1, Math.max(0, 0.5 - dist / aa));
        if (alpha <= 0) continue;
        let nx;
        let ny;
        if (qx > 0 && qy > 0) {
          nx = ox / corner;
          ny = oy / corner;
        } else if (qx > qy) {
          nx = 1;
          ny = 0;
        } else {
          nx = 0;
          ny = 1;
        }
        const inset = Math.max(0, -dist);
        const s = inset / bezel;
        const m = s >= 1 ? 0 : table[Math.min(N, Math.round(s * N))];
        const bx = Math.round(127 * m * nx * dir);
        const by = Math.round(127 * m * ny * dir);
        const crisp = Math.max(0, 1 - inset / rimWidth);
        const glow = Math.max(0, 1 - inset / (rimWidth * 5));
        const rim = p.specular * (crisp * crisp + 0.3 * glow * glow);
        const a = Math.round(alpha * 255);
        const i2 = w - 1 - i;
        const j2 = h - 1 - j;
        write(px, (j * w + i) * 4, NEUTRAL + bx, NEUTRAL + by, rimLight(rim, -nx * lx - ny * ly), a);
        if (i2 !== i) write(px, (j * w + i2) * 4, NEUTRAL - bx, NEUTRAL + by, rimLight(rim, nx * lx - ny * ly), a);
        if (j2 !== j) write(px, (j2 * w + i) * 4, NEUTRAL + bx, NEUTRAL - by, rimLight(rim, -nx * lx + ny * ly), a);
        if (i2 !== i && j2 !== j) write(px, (j2 * w + i2) * 4, NEUTRAL - bx, NEUTRAL - by, rimLight(rim, nx * lx + ny * ly), a);
      }
    }
    ctx.putImageData(image, 0, 0);
    return { canvas, width: w, height: h, scale };
  }
  function rimLight(rim, facing) {
    const shade = 0.12 + 0.88 * (facing > 0 ? facing : -0.4 * facing);
    return NEUTRAL + Math.round(127 * Math.min(1, rim * shade));
  }
  function write(px, o, r, g, b, a) {
    px[o] = r;
    px[o + 1] = g;
    px[o + 2] = b;
    px[o + 3] = a;
  }
  var mapCache = /* @__PURE__ */ new Map();
  function mapKeyOf(p, scale) {
    return MAP_KEYS.map((k) => p[k]).join("|") + "|" + scale;
  }
  function lensMap(p, scale, key) {
    let entry2 = mapCache.get(key);
    if (entry2) {
      mapCache.delete(key);
    } else {
      const url = renderLensMap(p, scale).canvas.toDataURL("image/png");
      entry2 = { key, url, decoded: false, ready: null };
      const img = new Image();
      img.src = url;
      entry2.ready = img.decode().catch(() => {
      }).then(() => {
        entry2.decoded = true;
      });
      if (mapCache.size >= MAP_CACHE_SIZE) mapCache.delete(mapCache.keys().next().value);
    }
    mapCache.set(key, entry2);
    return entry2;
  }
  var svgRoot = null;
  function defsNode() {
    if (svgRoot?.isConnected) return svgRoot.firstChild;
    svgRoot = document.createElementNS(NS, "svg");
    svgRoot.setAttribute("aria-hidden", "true");
    svgRoot.setAttribute("width", "0");
    svgRoot.setAttribute("height", "0");
    svgRoot.style.cssText = "position:absolute;width:0;height:0;overflow:hidden;pointer-events:none";
    svgRoot.appendChild(document.createElementNS(NS, "defs"));
    document.body.appendChild(svgRoot);
    return svgRoot.firstChild;
  }
  function node(name, attrs) {
    const n = document.createElementNS(NS, name);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  var CHANNELS = [
    "1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0",
    "0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0"
  ];
  function buildGraph(filter, p) {
    filter.replaceChildren();
    const lensRect = [];
    const add = (name, attrs, inLens) => {
      const n = node(name, attrs);
      filter.appendChild(n);
      if (inLens) lensRect.push(n);
      return n;
    };
    add("feFlood", { "flood-color": "rgb(128,128,128)", "flood-opacity": "1", result: "neutral" }, true);
    const image = add("feImage", { preserveAspectRatio: "none", result: "lensShape" }, true);
    add("feComposite", { in: "lensShape", in2: "neutral", operator: "over", result: "map" }, true);
    const aspect = engine === "webkit" ? add("feColorMatrix", { in: "map", type: "matrix", result: "bend" }, true) : null;
    const bendMap = aspect ? "bend" : "map";
    let source = "SourceGraphic";
    let blur = null;
    if (p.blur > 0) {
      blur = add("feGaussianBlur", { in: "SourceGraphic", result: "frosted" });
      source = "frosted";
    }
    const displace = [];
    if (p.chroma > 0) {
      CHANNELS.forEach((values, i) => {
        displace.push(add("feDisplacementMap", { in: source, in2: bendMap, xChannelSelector: "R", yChannelSelector: "G" }, true));
        add("feColorMatrix", { type: "matrix", values, result: `ch${i}` }, true);
      });
      add("feComposite", { in: "ch0", in2: "ch1", operator: "arithmetic", k1: 0, k2: 1, k3: 1, k4: 0, result: "rg" }, true);
      add("feComposite", { in: "rg", in2: "ch2", operator: "arithmetic", k1: 0, k2: 1, k3: 1, k4: 0, result: "refracted" }, true);
    } else {
      displace.push(
        add("feDisplacementMap", { in: source, in2: bendMap, xChannelSelector: "R", yChannelSelector: "G", result: "refracted" }, true)
      );
    }
    let lit = "refracted";
    if (p.specular > 0) {
      add("feColorMatrix", { in: "map", type: "matrix", values: `0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 2 0 ${-(2 * NEUTRAL) / 255}`, result: "rim" }, true);
      add("feComposite", { in: "rim", in2: "refracted", operator: "arithmetic", k1: 0, k2: 1, k3: 1, k4: 0, result: "lit" }, true);
      lit = "lit";
    }
    add("feComposite", { in: lit, in2: "lensShape", operator: "in", result: "lens" }, true);
    add("feComposite", { in: "SourceGraphic", in2: "lensShape", operator: "out", result: "outside" });
    add("feComposite", { in: "lens", in2: "outside", operator: "over" });
    return { image, aspect, blur, displace, lensRect };
  }
  function bendScale(px, w, h) {
    if (engine === "webkit") {
      const m = Math.min(w, h);
      return { scale: 2 * px / m, kx: m / w, ky: m / h };
    }
    if (engine === "gecko") return { scale: 2 * px / Math.sqrt((w * w + h * h) / 2), kx: 1, ky: 1 };
    return { scale: 2 * px / w, kx: 1, ky: 1 };
  }
  function setRect(n, x, y, w, h) {
    n.setAttribute("x", x);
    n.setAttribute("y", y);
    n.setAttribute("width", w);
    n.setAttribute("height", h);
  }
  var uid2 = 0;
  function createGlass(target2, options2 = {}) {
    const base = `lg${++uid2}`;
    const mode = options2.mode ?? "content";
    const fallback2 = options2.fallback ?? "blur(12px) saturate(1.6)";
    const p = { ...DEFAULTS, ...pick(options2) };
    const flags = { fit: !!options2.fit, clip: !!options2.clip, sync: !!options2.sync, hidden: !!options2.hidden };
    const useBackdropURL = mode === "backdrop" && engine === "blink";
    const active2 = mode !== "backdrop" || useBackdropURL;
    if (!active2) {
      target2.style.backdropFilter = fallback2;
      target2.style.webkitBackdropFilter = fallback2;
    }
    const filter = node("filter", {
      filterUnits: "objectBoundingBox",
      x: 0,
      y: 0,
      width: 1,
      height: 1,
      primitiveUnits: "objectBoundingBox",
      // sRGB keeps 128 meaning "no bend"; the default linearRGB would shift every pixel.
      "color-interpolation-filters": "sRGB"
    });
    if (active2) defsNode().appendChild(filter);
    let graph = null;
    let structure = "";
    let wanted2 = "";
    let requested = 0;
    let shown = { key: "", seq: -1 };
    let version = 0;
    let frame4 = 0;
    let settleTimers = [];
    let destroyed = false;
    let box = { width: target2.offsetWidth, height: target2.offsetHeight };
    const observer2 = active2 ? new ResizeObserver(() => {
      box = { width: target2.offsetWidth, height: target2.offsetHeight };
      schedule2();
    }) : null;
    observer2?.observe(target2);
    function settle2() {
      settleTimers.forEach(clearTimeout);
      settleTimers = [60, 250].map((ms) => setTimeout(schedule2, ms));
    }
    function show3(entry2, seq2) {
      if (seq2 <= shown.seq || !graph) return false;
      graph.image.setAttribute("href", entry2.url);
      graph.image.setAttributeNS(XLINK, "xlink:href", entry2.url);
      shown = { key: entry2.key, seq: seq2 };
      settle2();
      return true;
    }
    function flush() {
      frame4 = 0;
      if (destroyed || !active2) return;
      if (flags.hidden) {
        if (useBackdropURL) target2.style.backdropFilter = "";
        else target2.style.filter = "";
        if (flags.clip) target2.style.clipPath = "inset(50%)";
        return;
      }
      const W = box.width;
      const H = box.height;
      if (W < 1 || H < 1) return;
      if (flags.fit) {
        p.x = 0;
        p.y = 0;
        p.width = W;
        p.height = H;
      }
      if (p.width < 1 || p.height < 1) return;
      const s = `${p.chroma > 0}|${p.blur > 0}|${p.specular > 0}`;
      if (s !== structure) {
        graph = buildGraph(filter, p);
        structure = s;
        shown = { key: "", seq: -1 };
        wanted2 = "";
      }
      const dpr = window.devicePixelRatio || 1;
      const scale = p.mapScale > 0 ? p.mapScale : Math.min(dpr, 2);
      const snap = (v) => Math.round(v * dpr) / dpr;
      const x = snap(p.x);
      const y = snap(p.y);
      const w = snap(p.width);
      const h = snap(p.height);
      const key = mapKeyOf(p, scale);
      if (wanted2 !== key) {
        wanted2 = key;
        const entry2 = lensMap(p, scale, key);
        const seq2 = ++requested;
        if (entry2.decoded) show3(entry2, seq2);
        else entry2.ready.then(() => !destroyed && show3(entry2, seq2) && schedule2());
      }
      if (flags.clip) {
        const r = Math.min(p.radius, w / 2, h / 2);
        target2.style.clipPath = `inset(${y}px ${W - x - w}px ${H - y - h}px ${x}px round ${r}px)`;
      }
      if (!shown.key) return;
      for (const n of graph.lensRect) setRect(n, x / W, y / H, w / W, h / H);
      const { scale: k, kx, ky } = bendScale(p.refraction, W, H);
      const scales = graph.displace.length === 3 ? [k, k * (1 + p.chroma / 2), k * (1 + p.chroma)] : [k];
      graph.displace.forEach((n, i) => n.setAttribute("scale", scales[i]));
      if (graph.aspect) {
        graph.aspect.setAttribute("values", `${kx} 0 0 0 ${(1 - kx) / 2}  0 ${ky} 0 0 ${(1 - ky) / 2}  0 0 1 0 0  0 0 0 1 0`);
      }
      if (graph.blur) {
        graph.blur.setAttribute("stdDeviation", `${p.blur / W} ${p.blur / H}`);
        const pad3 = Math.ceil(p.refraction * (1 + p.chroma) + 3 * p.blur);
        setRect(graph.blur, (x - pad3) / W, (y - pad3) / H, (w + 2 * pad3) / W, (h + 2 * pad3) / H);
      }
      filter.id = `${base}-v${++version}`;
      const ref = `url(#${filter.id})`;
      if (useBackdropURL) target2.style.backdropFilter = ref;
      else target2.style.filter = ref;
    }
    function schedule2() {
      if (flags.sync) flush();
      else if (!frame4) frame4 = requestAnimationFrame(flush);
    }
    schedule2();
    return {
      /** Merge new lens geometry / optics. Moving the lens never regenerates the map. */
      update(next = {}) {
        const changes = pick(next);
        const hidden = next.hidden === void 0 ? flags.hidden : !!next.hidden;
        if (hidden === flags.hidden && Object.keys(changes).every((k) => changes[k] === p[k])) return;
        Object.assign(p, changes);
        flags.hidden = hidden;
        schedule2();
      },
      /** Apply pending changes now (e.g. before measuring or taking a screenshot). */
      flush() {
        if (frame4) cancelAnimationFrame(frame4);
        flush();
      },
      get params() {
        return { ...p };
      },
      get filterId() {
        return filter.id;
      },
      destroy() {
        destroyed = true;
        if (frame4) cancelAnimationFrame(frame4);
        settleTimers.forEach(clearTimeout);
        observer2?.disconnect();
        filter.remove();
        target2.style.filter = "";
        target2.style.backdropFilter = "";
        target2.style.webkitBackdropFilter = "";
        if (flags.clip) target2.style.clipPath = "";
      }
    };
  }
  function pick(o) {
    const out = {};
    for (const k in DEFAULTS) if (o[k] !== void 0) out[k] = o[k];
    return out;
  }
  var reducedMotion = typeof matchMedia === "function" ? matchMedia("(prefers-reduced-motion: reduce)") : { matches: false };

  // dpi/js/glass.js
  var glass_exports = {};
  __export(glass_exports, {
    PRESETS: () => PRESETS,
    bind: () => bind,
    canRefract: () => canRefract,
    cloneSource: () => cloneSource,
    collect: () => collect,
    counters: () => counters,
    engine: () => engine,
    glassEngine: () => glassEngine,
    markThemeHandled: () => markThemeHandled,
    modeFor: () => modeFor,
    occluded: () => occluded,
    refresh: () => refresh,
    registerKind: () => registerKind,
    registerLayer: () => registerLayer,
    requestSync: () => request,
    resolveScope: () => resolveScope,
    setMode: () => setMode,
    setup: () => setup,
    stats: () => stats,
    syncHost: () => syncHost,
    themeChanged: () => themeChanged,
    track: () => track,
    unregisterLayer: () => unregisterLayer
  });
  function detectGlassEngine() {
    if (typeof document === "undefined") return "blur";
    const root4 = document.documentElement;
    const forced = root4.getAttribute("data-dpi-glass-engine");
    const supportsUrl = typeof CSS !== "undefined" && typeof CSS.supports === "function" && CSS.supports("backdrop-filter", "url(#dpi-probe)");
    const can = engine === "blink" && supportsUrl && forced !== "blur";
    root4.setAttribute("data-dpi-glass-engine", can ? "refraction" : "blur");
    return can ? "refraction" : "blur";
  }
  var glassEngine = detectGlassEngine();
  var canRefract = glassEngine === "refraction";
  var PRESETS = {
    panel: { refraction: 24, bezel: 0.3, curvature: 4, chroma: 0.1, blur: 2, specular: 0.5, specularWidth: 2 },
    bar: { refraction: 16, bezel: 0.8, curvature: 3, chroma: 0.1, blur: 1, specular: 0.55, specularWidth: 1.5 },
    // menu: stessi principi ottici di barra e pulsanti (bordo affidato al velo condiviso, nessun riflesso speculare del motore), rifrazione contenuta e sfocatura lieve per la leggibilità
    menu: { refraction: 12, bezel: 0.7, curvature: 3, chroma: 0.08, blur: 4, specular: 0, specularWidth: 1, lightAngle: -90, float: true },
    button: { refraction: 14, bezel: 0.8, curvature: 3, chroma: 0.12, blur: 0, specular: 0.6, specularWidth: 1.5 },
    lens: { refraction: 18, bezel: 0.9, curvature: 3, chroma: 0.12, blur: 0, specular: 0.7, specularWidth: 1.5, float: true },
    // superfici di contenuto (card): vetro neutro STATICO, mai una lente per ogni card
    surface: { static: true },
    // gocce (drop.js): la lente è una forma che si deforma dentro uno stage fisso; luce dall'alto a sinistra come nei riferimenti
    drop: { refraction: 16, bezel: 0.75, curvature: 3, chroma: 0.1, blur: 0, specular: 0, specularWidth: 1, lightAngle: -90, float: true },
    droplens: { refraction: 34, bezel: 0.6, curvature: 3.4, chroma: 0.16, blur: 0, specular: 0, specularWidth: 1, lightAngle: -90, float: true }
  };
  var OPTIC_ATTRS = {
    refraction: "refraction",
    bezel: "bezel",
    curvature: "curvature",
    ior: "ior",
    chroma: "chroma",
    blur: "blur",
    specular: "specular",
    "specular-width": "specularWidth",
    "light-angle": "lightAngle"
  };
  var hosts = /* @__PURE__ */ new Map();
  var tracked = /* @__PURE__ */ new Set();
  var counters = { syncs: 0, writes: 0, frames: 0, dropFrames: 0, dropLoops: 0, maps: 0 };
  var kinds = /* @__PURE__ */ new Map();
  function registerKind(name, impl) {
    kinds.set(name, impl);
  }
  var observer = null;
  var frame = 0;
  var loop = 0;
  var mq = (q) => typeof matchMedia === "function" ? matchMedia(q).matches : false;
  var presetOf = (host) => host.getAttribute("data-dpi-glass") || "panel";
  var isFloat = (host) => !!PRESETS[presetOf(host)]?.float;
  function resolveScope(host) {
    const sel2 = host.getAttribute("data-dpi-backdrop-source");
    const scope = sel2 ? document.querySelector(sel2) : host.parentElement?.closest("[data-dpi-backdrop]");
    if (!scope) return null;
    if (scope.matches("img")) return { scope, source: scope };
    const inner = scope.getAttribute("data-dpi-backdrop");
    return { scope, source: inner ? scope.querySelector(inner) : scope.querySelector("img") || scope };
  }
  function occluded(host, scope) {
    for (let a = host.parentElement; a && a !== scope && a !== document.documentElement; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const m = cs.backgroundColor.match(/[\d.]+/g);
      const alpha = m && m.length > 3 ? parseFloat(m[3]) : m && cs.backgroundColor !== "transparent" ? 1 : 0;
      if (alpha >= 0.95 || cs.backgroundImage !== "none") return true;
    }
    return false;
  }
  function modeFor(host) {
    if (host.getAttribute("data-dpi-drop") === "menu") return "opaque";
    if (host.closest('[data-dpi-surface="solid"]') || host.hasAttribute("data-dpi-opaque") || mq("(prefers-reduced-transparency: reduce)") || mq("(forced-colors: active)")) return "solid";
    if (host.getAttribute("data-dpi-drop") === "menu" && engine !== "blink") return "blur";
    if (!canRefract) return "blur";
    if (host.hasAttribute("data-dpi-live")) return "refraction";
    if (PRESETS[presetOf(host)]?.static) return "blur";
    if (host.closest("dialog")) return "blur";
    const r = resolveScope(host);
    if (!r || !r.source) return "blur";
    if (occluded(host, r.scope)) return "blur";
    if (!isFloat(host) && host.parentElement?.closest('.dpi-glass[data-dpi-glass-mode="refraction"]')) return "nested";
    return "refraction";
  }
  function opticsOf(host) {
    const { float, ...o } = PRESETS[presetOf(host)] || PRESETS.panel;
    for (const [attr3, key] of Object.entries(OPTIC_ATTRS)) {
      const v = host.getAttribute(`data-dpi-${attr3}`);
      if (v !== null && v !== "" && !Number.isNaN(Number(v))) o[key] = Number(v);
    }
    return o;
  }
  function cloneSource(source) {
    let copy;
    const cs = getComputedStyle(source);
    if (source instanceof HTMLImageElement) {
      copy = source.cloneNode(false);
      for (const a of ["id", "class", "data-dpi-backdrop", "style", "srcset", "sizes"]) copy.removeAttribute(a);
      copy.src = source.currentSrc || source.src;
      copy.alt = "";
      copy.loading = "eager";
      copy.decoding = "async";
      copy.style.objectFit = cs.objectFit;
      copy.style.objectPosition = cs.objectPosition;
      if (cs.filter !== "none") copy.style.filter = cs.filter;
      if (cs.opacity !== "1") copy.style.opacity = cs.opacity;
    } else {
      copy = document.createElement("span");
      for (const k of ["backgroundColor", "backgroundImage", "backgroundSize", "backgroundPosition", "backgroundRepeat", "backgroundOrigin", "backgroundClip"]) {
        copy.style[k] = cs[k];
      }
    }
    copy.className = "dpi-glass__copy";
    copy.setAttribute("aria-hidden", "true");
    return copy;
  }
  function radiusOf(host, w, h) {
    const attr3 = host.getAttribute("data-dpi-radius");
    const r = attr3 !== null && !Number.isNaN(Number(attr3)) ? Number(attr3) : parseFloat(getComputedStyle(host).borderTopLeftRadius) || 0;
    return Math.min(r, w / 2, h / 2);
  }
  function setMode(host, mode) {
    if (host.dataset.dpiGlassMode === mode) return;
    host.dataset.dpiGlassMode = mode;
    emit(host, "glass-mode", { mode });
  }
  function build(host) {
    const { scope, source } = resolveScope(host);
    const layer = document.createElement("span");
    layer.className = "dpi-glass__layer";
    layer.setAttribute("aria-hidden", "true");
    const copy = cloneSource(source);
    layer.append(copy);
    const legend = host.querySelector(":scope > legend");
    if (legend) legend.after(layer);
    else host.prepend(layer);
    const glass = createGlass(layer, { ...opticsOf(host), fit: true, clip: true, radius: 16 });
    hosts.set(host, { layer, copy, source, scope, glass, key: "" });
    observer ??= new ResizeObserver((entries) => entries.forEach((e) => hosts.has(e.target) && request()));
    observer.observe(host);
    if (source instanceof HTMLImageElement && !source.complete) source.addEventListener("load", request, { once: true });
    request();
  }
  function teardown(host) {
    const rec2 = hosts.get(host);
    if (!rec2) return;
    rec2.glass.destroy();
    rec2.layer.remove();
    observer?.unobserve(host);
    hosts.delete(host);
    tracked.delete(host);
  }
  function sync(list = hosts) {
    counters.syncs++;
    for (const host of list instanceof Map ? list.keys() : list) {
      const rec2 = hosts.get(host);
      if (!rec2) continue;
      const lr = rec2.layer.getBoundingClientRect();
      if (!lr.width || !lr.height) continue;
      const sr = rec2.source.getBoundingClientRect();
      if (!sr.width || !sr.height) continue;
      const key = `${lr.width}|${lr.height}|${sr.width}|${sr.height}|${sr.left - lr.left}|${sr.top - lr.top}`;
      if (key === rec2.key) continue;
      rec2.key = key;
      counters.writes++;
      rec2.copy.style.width = `${sr.width}px`;
      rec2.copy.style.height = `${sr.height}px`;
      rec2.copy.style.transform = `translate(${sr.left - lr.left}px, ${sr.top - lr.top}px)`;
      if (!rec2.noRadius) rec2.glass.update({ radius: radiusOf(host, lr.width, lr.height) });
    }
  }
  function request() {
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        sync();
      });
    }
  }
  function tick() {
    loop = 0;
    if (!tracked.size) return;
    counters.frames++;
    sync(tracked);
    loop = requestAnimationFrame(tick);
  }
  function track(host) {
    if (!hosts.has(host)) return () => {
    };
    tracked.add(host);
    if (!loop) loop = requestAnimationFrame(tick);
    return () => {
      tracked.delete(host);
      request();
    };
  }
  function stats() {
    return { ...counters, tracking: tracked.size, loopActive: loop !== 0 || counters.dropLoops > 0, refracting: hosts.size };
  }
  function registerLayer(host, rec2) {
    hosts.set(host, { key: "", noRadius: true, ...rec2 });
    observer ??= new ResizeObserver((entries) => entries.forEach((e) => hosts.has(e.target) && request()));
    observer.observe(host);
    request();
  }
  function unregisterLayer(host) {
    observer?.unobserve(host);
    hosts.delete(host);
    tracked.delete(host);
  }
  var orphans = /* @__PURE__ */ new Set();
  function collect() {
    for (const host of [...hosts.keys()]) {
      if (host.isConnected) {
        orphans.delete(host);
        continue;
      }
      if (orphans.has(host)) {
        orphans.delete(host);
        if (hosts.get(host)?.glass) teardown(host);
      } else orphans.add(host);
    }
    for (const h of [...orphans]) if (!hosts.has(h)) orphans.delete(h);
  }
  function syncHost(host) {
    sync([host]);
  }
  function setup(host) {
    const kind = host.hasAttribute("data-dpi-drop") ? kinds.get("drop") : host.hasAttribute("data-dpi-toggle") ? kinds.get("toggle") : null;
    if (kind) {
      const m = modeFor(host);
      kind.apply(host, m);
      setMode(host, m);
      return;
    }
    const mode = modeFor(host);
    if (host.hasAttribute("data-dpi-live")) {
      teardown(host);
      setMode(host, mode);
      return;
    }
    if (mode === "refraction") {
      if (!hosts.has(host)) build(host);
    } else {
      teardown(host);
    }
    setMode(host, mode);
  }
  function refresh(root4 = document, { rebuild = false } = {}) {
    root4.querySelectorAll(".dpi-glass, [data-dpi-drop], [data-dpi-toggle]").forEach((h) => {
      if (rebuild) teardown(h);
      setup(h);
    });
  }
  var themeHandled = false;
  function markThemeHandled() {
    themeHandled = true;
  }
  function themeChanged() {
    refresh(document, { rebuild: true });
  }
  var bound = false;
  function bind() {
    if (bound) return;
    bound = true;
    addEventListener("scroll", request, { capture: true, passive: true });
    addEventListener("resize", request);
    for (const q of ["(prefers-reduced-transparency: reduce)", "(forced-colors: active)", "(prefers-color-scheme: dark)"]) {
      if (typeof matchMedia === "function") matchMedia(q).addEventListener("change", () => refresh(document, { rebuild: true }));
    }
    document.addEventListener("dpi:open", request);
    let themeTimer = 0;
    new MutationObserver(() => {
      if (themeHandled) {
        themeHandled = false;
        return;
      }
      clearTimeout(themeTimer);
      themeTimer = setTimeout(() => {
        refresh(document, { rebuild: true });
        document.dispatchEvent(new CustomEvent("dpi:theme-change"));
      }, 20);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-dpi-theme", "data-dpi-surface"], subtree: true });
  }

  // dpi/js/drop.js
  var reduced = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  var KEYS = ["ox", "oy", "sw", "sh"];
  var Springs = class {
    constructor({ k = 380, c = 17 } = {}) {
      this.k = k;
      this.c = c;
      this.s = Object.fromEntries(KEYS.map((n) => [n, { v: 0, x: 0, t: 0 }]));
    }
    get(n) {
      return this.s[n].v;
    }
    vel(n) {
      return this.s[n].x;
    }
    target(n, t) {
      this.s[n].t = t;
    }
    set(n, v) {
      Object.assign(this.s[n], { v, x: 0, t: v });
    }
    kick(n, x) {
      this.s[n].x += x;
    }
    step(dt) {
      let rest = Math.min(dt, 0.064);
      while (rest > 1e-6) {
        const h = Math.min(1 / 240, rest);
        for (const n of KEYS) {
          const q = this.s[n];
          q.x += (-this.k * (q.v - q.t) - this.c * q.x) * h;
          q.v += q.x * h;
        }
        rest -= h;
      }
      let settled = true;
      for (const n of KEYS) {
        const q = this.s[n];
        if (Math.abs(q.v - q.t) < 0.12 && Math.abs(q.x) < 0.5) {
          q.v = q.t;
          q.x = 0;
        } else settled = false;
      }
      return settled;
    }
  };
  var drops = /* @__PURE__ */ new Map();
  function el(tag, cls, parent) {
    const n = document.createElement(tag);
    n.className = cls;
    n.setAttribute("aria-hidden", "true");
    if (parent) parent.append(n);
    return n;
  }
  function opticsOf2(name, extra = {}) {
    const { float, ...o } = PRESETS[name] || PRESETS.drop;
    return { ...o, ...extra };
  }
  function createDrop(host, cfg = {}) {
    if (drops.has(host)) return drops.get(host);
    let M3 = cfg.margin ?? 14;
    const springs = new Springs(cfg.spring);
    const stretch = cfg.stretch ?? { gain: 0.012, max: 0.32 };
    const d = { host, cfg, springs, stretch, mode: "blur", stage: null, g: null, running: false, last: 0, raf: 0, destroyed: false, rect: null };
    const shadow = el("span", "dpi-drop__shadow", null);
    const tint = el("span", "dpi-drop__tint", null);
    if (getComputedStyle(host).position === "static") host.style.position = "relative";
    host.prepend(shadow);
    host.append(tint);
    if (cfg.surface !== false) host.setAttribute("data-dpi-drop-ready", "");
    function rest() {
      if (cfg.rest) return cfg.rest();
      const b = host.getBoundingClientRect();
      return { x: -host.clientLeft, y: -host.clientTop, w: b.width, h: b.height };
    }
    function restRadius(r) {
      if (cfg.radius === "pill" || cfg.radius === void 0) {
        const br = parseFloat(getComputedStyle(host).borderTopLeftRadius);
        return Number.isFinite(br) && br < Math.min(r.w, r.h) / 2 - 0.5 && cfg.radius === void 0 ? br : Math.min(r.w, r.h) / 2;
      }
      return cfg.radius;
    }
    function pose() {
      const r = rest();
      d.restRect = r;
      let w = Math.max(2, r.w + springs.get("sw"));
      let h = Math.max(2, r.h + springs.get("sh"));
      const ex = clamp(Math.abs(springs.vel("ox")) * stretch.gain, 0, stretch.max);
      const ey = clamp(Math.abs(springs.vel("oy")) * stretch.gain, 0, stretch.max);
      w *= 1 + ex - 0.45 * ey;
      h *= 1 + ey - 0.45 * ex;
      const xt = d.extra;
      if (xt) {
        w = Math.max(2, w + xt.sw);
        h = Math.max(2, h + xt.sh);
      }
      const cx = r.x + r.w / 2 + springs.get("ox") + (xt ? xt.ox : 0);
      const cy = r.y + r.h / 2 + springs.get("oy") + (xt ? xt.oy : 0);
      const r0 = restRadius(r);
      let rad = cfg.radius === void 0 || cfg.radius === "pill" ? Math.min(w, h) / 2 : Math.min(r0 * h / r.h, w / 2, h / 2);
      if (d.collapse && cfg.radius !== void 0 && cfg.radius !== "pill") {
        const c = d.collapse;
        const t = clamp(Math.max((w - c.w) / Math.max(1, r.w - c.w), (h - c.h) / Math.max(1, r.h - c.h)), 0, 1);
        rad = Math.min(c.r + (r0 - c.r) * t, w / 2, h / 2);
      }
      return { x: cx - w / 2, y: cy - h / 2, w, h, r: rad };
    }
    const stepOf = (v) => v < 80 ? 6 : v < 160 ? 10 : 16;
    const up = (v) => {
      const st = stepOf(v);
      return Math.ceil((v - 0.01) / st) * st;
    };
    function opticsBox(p) {
      const wq = up(p.w);
      const hq = up(p.h);
      const pill = p.r >= Math.min(p.w, p.h) / 2 - 0.75;
      const rq = pill ? Math.min(wq, hq) / 2 : Math.min(Math.ceil(p.r / 3) * 3, wq / 2, hq / 2);
      return { wq, hq, rq, ex: (wq - p.w) / 2, ey: (hq - p.h) / 2 };
    }
    d.opticsBox = opticsBox;
    function paint4(p) {
      d.rect = p;
      {
        const s = tint.style;
        s.left = `${p.x.toFixed(2)}px`;
        s.top = `${p.y.toFixed(2)}px`;
        s.width = `${p.w.toFixed(2)}px`;
        s.height = `${p.h.toFixed(2)}px`;
        s.borderRadius = `${p.r.toFixed(2)}px`;
      }
      {
        const r = d.restRect ?? { x: p.x, y: p.y, w: p.w, h: p.h };
        const bw = Math.max(2, r.w);
        const bh = Math.max(2, r.h);
        const s = shadow.style;
        if (d.shadowKey !== `${r.x}|${r.y}|${bw}|${bh}`) {
          d.shadowKey = `${r.x}|${r.y}|${bw}|${bh}`;
          s.left = `${r.x}px`;
          s.top = `${r.y}px`;
          s.width = `${bw}px`;
          s.height = `${bh}px`;
          s.borderRadius = `${restRadius(r).toFixed(2)}px`;
        }
        const sx = p.w / bw;
        const sy = p.h / bh;
        s.transform = `translate(${(p.x - r.x).toFixed(2)}px, ${(p.y - r.y).toFixed(2)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
        if (d.collapse) s.borderRadius = `${(p.r / Math.max(0.05, sx)).toFixed(2)}px / ${(p.r / Math.max(0.05, sy)).toFixed(2)}px`;
      }
      cfg.onPaint?.(p);
      d.onPaint?.(p);
      if (!d.pointerLight && d.running) {
        const vx = springs.vel("ox");
        const vy = springs.vel("oy");
        const sp = Math.hypot(vx, vy);
        d.light(clamp(vx * 0.05, -40, 40), 1 + clamp(sp / 400, 0, 0.7));
      }
      if (d.exactCenter) {
        const r0 = d.restRect ?? p;
        const dx = p.x + p.w / 2 - (r0.x + r0.w / 2) - (d.extra?.iconOx ?? 0);
        const dy = p.y + p.h / 2 - (r0.y + r0.h / 2) - (d.extra?.iconOy ?? 0);
        host.style.setProperty("--dpi-dx", `${dx.toFixed(2)}px`);
        host.style.setProperty("--dpi-dy", `${dy.toFixed(2)}px`);
      } else {
        host.style.setProperty("--dpi-dx", `${(springs.get("ox") * 0.55).toFixed(2)}px`);
        host.style.setProperty("--dpi-dy", `${(springs.get("oy") * 0.55).toFixed(2)}px`);
      }
      if (d.lens) {
        const s = d.lens.style;
        const o = opticsBox(p);
        s.left = `${(p.x - o.ex).toFixed(2)}px`;
        s.top = `${(p.y - o.ey).toFixed(2)}px`;
        s.width = `${o.wq}px`;
        s.height = `${o.hq}px`;
        s.borderRadius = `${o.rq}px`;
        s.clipPath = `inset(${o.ey.toFixed(2)}px ${o.ex.toFixed(2)}px round ${p.r.toFixed(2)}px)`;
        counters.maps++;
        d.g.update({ radius: o.rq });
      } else if (d.g) {
        const o = opticsBox(p);
        counters.maps++;
        d.g.update({ x: p.x + M3 - o.ex, y: p.y + M3 - o.ey, width: o.wq, height: o.hq, radius: o.rq });
        const W = d.stageW ?? 0;
        const H = d.stageH ?? 0;
        const x = p.x + M3;
        const y = p.y + M3;
        d.stage.style.clipPath = `inset(${y.toFixed(2)}px ${(W - x - p.w).toFixed(2)}px ${(H - y - p.h).toFixed(2)}px ${x.toFixed(2)}px round ${p.r.toFixed(2)}px)`;
      }
    }
    d.render = () => {
      d.pre?.();
      paint4(pose());
      d.afterPaint?.(d.rect);
    };
    function frame4(now) {
      d.raf = 0;
      if (d.destroyed) return;
      const dt = Math.min(0.05, (now - d.last) / 1e3 || 1 / 60);
      d.last = now;
      counters.dropFrames++;
      const settled = springs.step(dt);
      d.render();
      d.onFrame?.();
      if (settled) {
        d.running = false;
        counters.dropLoops--;
        host.removeAttribute("data-dpi-moving");
        request();
        emit(host, "drop-settled", {});
      } else {
        d.raf = requestAnimationFrame(frame4);
      }
    }
    function wake() {
      if (d.running || d.destroyed) return;
      d.running = true;
      counters.dropLoops++;
      host.setAttribute("data-dpi-moving", "");
      d.last = performance.now();
      d.raf = requestAnimationFrame(frame4);
    }
    d.moveTo = (ox, oy, { immediate = false } = {}) => {
      if (immediate || reduced()) {
        springs.set("ox", ox);
        springs.set("oy", oy);
        d.render();
        return;
      }
      springs.target("ox", ox);
      springs.target("oy", oy);
      wake();
    };
    d.deform = (sw, sh) => {
      if (reduced()) return;
      springs.target("sw", sw);
      springs.target("sh", sh);
      wake();
    };
    d.pull = (ox, oy, sw, sh) => {
      if (reduced()) return;
      springs.target("ox", ox);
      springs.target("oy", oy);
      springs.target("sw", sw);
      springs.target("sh", sh);
      wake();
    };
    d.light = (deg, strength = 1) => {
      if (reduced()) return;
      tint.style.setProperty("--dpi-light-angle", `${deg.toFixed(1)}deg`);
      tint.style.setProperty("--dpi-light-strength", strength.toFixed(2));
    };
    d.lightReset = () => {
      tint.style.removeProperty("--dpi-light-angle");
      tint.style.removeProperty("--dpi-light-strength");
    };
    d.snap = (ox, oy, sw, sh) => {
      springs.set("ox", ox);
      springs.set("oy", oy);
      springs.set("sw", sw);
      springs.set("sh", sh);
      d.render();
    };
    d.rebase = (ox, oy = 0) => {
      springs.s.ox.v += ox;
      springs.s.oy.v += oy;
      d.render();
    };
    d.kick = (n, v) => {
      if (!reduced()) {
        springs.kick(n, v);
        wake();
      }
    };
    d.setSpring = (k, c) => {
      springs.k = k;
      springs.c = c;
    };
    d.collapsedPose = (vr, from = null) => {
      const hr = host.getBoundingClientRect();
      if (from) {
        const br = parseFloat(getComputedStyle(from).borderTopLeftRadius);
        d.collapse = { w: vr.width, h: vr.height, r: Math.min(Number.isFinite(br) ? br : 0, vr.width / 2, vr.height / 2) };
      }
      return { ox: vr.left + vr.width / 2 - (hr.left + hr.width / 2), oy: vr.top + vr.height / 2 - (hr.top + hr.height / 2), sw: vr.width - hr.width, sh: vr.height - hr.height };
    };
    d.setMargin = (m) => {
      m = Math.max(14, Math.ceil(m));
      if (m === M3) return;
      M3 = m;
      if (d.stage) {
        d.stage.style.left = `${-M3}px`;
        d.stage.style.top = `${-M3}px`;
        const clone = d.stage.querySelector(":scope > .dpi-drop__clone");
        if (clone) {
          clone.style.left = `${M3}px`;
          clone.style.top = `${M3}px`;
        }
        resizeStage();
        d.render();
        syncHost(d.stage);
        request();
        return;
      }
      d.render();
    };
    d.pose = pose;
    d.get = (n) => springs.get(n);
    d.velocity = (n) => springs.vel(n);
    d.measure = () => {
      request();
      resizeStage();
      d.render();
    };
    function resizeStage() {
      if (!d.stage) return;
      d.stageW = host.clientWidth + 2 * M3;
      d.stageH = host.clientHeight + 2 * M3;
      d.stage.style.width = `${d.stageW}px`;
      d.stage.style.height = `${d.stageH}px`;
      placeBase(d.stage);
      const clone = d.stage.querySelector(":scope > .dpi-drop__clone");
      if (clone) {
        clone.style.width = `${host.clientWidth}px`;
        clone.style.height = `${host.clientHeight}px`;
      }
    }
    function placeBase(stage) {
      const base = stage.querySelector(":scope > .dpi-drop__base");
      if (!base) return;
      base.style.cssText = `position:absolute;left:${M3}px;top:${M3}px;width:${host.clientWidth}px;height:${host.clientHeight}px;border-radius:${getComputedStyle(host).borderTopLeftRadius};`;
    }
    function buildClone() {
      const wrap = el("div", "dpi-drop__clone", null);
      const cs = getComputedStyle(host);
      wrap.style.cssText = `position:absolute;left:${M3}px;top:${M3}px;box-sizing:border-box;padding:${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft};width:${host.clientWidth}px;height:${host.clientHeight}px;pointer-events:none;`;
      wrap.setAttribute("inert", "");
      for (const c of host.children) {
        if (c === shadow || c === tint || c === d.stage || c.hasAttribute("data-dpi-drop-skip")) continue;
        const k = c.cloneNode(true);
        k.removeAttribute("id");
        k.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
        wrap.append(k);
      }
      return wrap;
    }
    if (cfg.content) {
      let t = 0;
      d.mo = new MutationObserver((recs2) => {
        if (!d.stage || recs2.every((r) => r.target.closest?.(".dpi-drop__stage, .dpi-drop__shadow, .dpi-drop__tint, .dpi-drop__lens"))) return;
        clearTimeout(t);
        t = setTimeout(() => d.refreshContent(), 30);
      });
      d.mo.observe(host, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ["aria-current", "data-dpi-candidate", "data-dpi-checked", "class", "href", "hidden"] });
    }
    d.refreshContent = () => {
      if (!d.stage || !cfg.content) return;
      d.stage.querySelector(":scope > .dpi-drop__clone")?.remove();
      d.stage.append(buildClone());
      d.onContent?.();
    };
    function mountStage() {
      if (d.stage || cfg.stage === false) return;
      const r = resolveScope(cfg.modeHost || host);
      if (!r || !r.source) return;
      const stage = el("span", "dpi-drop__stage", null);
      stage.style.cssText = `position:absolute;left:${-M3}px;top:${-M3}px;width:${host.clientWidth + 2 * M3}px;height:${host.clientHeight + 2 * M3}px;pointer-events:none;`;
      const copy = cloneSource(r.source);
      stage.append(copy);
      if (cfg.base) {
        el("span", "dpi-drop__base", stage);
        placeBase(stage);
      }
      host.insertBefore(stage, tint);
      d.stage = stage;
      d.stageW = host.clientWidth + 2 * M3;
      d.stageH = host.clientHeight + 2 * M3;
      if (cfg.content) stage.append(buildClone());
      const p = pose();
      const o = opticsBox(p);
      d.g = createGlass(stage, { ...opticsOf2(cfg.optics || "drop", cfg.opticsExtra), x: p.x + M3 - o.ex, y: p.y + M3 - o.ey, width: o.wq, height: o.hq, radius: o.rq, clip: false, sync: true });
      d.render();
      registerLayer(stage, { layer: stage, copy, source: r.source, scope: r.scope, glass: d.g });
      syncHost(stage);
      if (r.source instanceof HTMLImageElement && !r.source.complete) r.source.addEventListener("load", () => request(), { once: true });
    }
    d.refreshCopy = () => {
      if (!d.stage) return;
      const r = resolveScope(cfg.modeHost || host);
      if (!r || !r.source) return;
      const copy = cloneSource(r.source);
      const old = d.stage.querySelector(":scope > .dpi-glass__copy");
      if (old) old.replaceWith(copy);
      else d.stage.prepend(copy);
      registerLayer(d.stage, { layer: d.stage, copy, source: r.source, scope: r.scope, glass: d.g });
      d.refreshContent();
      request();
    };
    function mountLens() {
      if (d.lens) return;
      const lens = el("span", "dpi-drop__lens", null);
      lens.style.cssText = "position:absolute;pointer-events:none;";
      host.insertBefore(lens, tint);
      d.lens = lens;
      const p = pose();
      d.g = createGlass(lens, { ...opticsOf2(cfg.optics || "drop", cfg.opticsExtra), mode: "backdrop", fit: true, radius: Math.round(opticsBox(p).rq), sync: true });
    }
    function unmountLens() {
      if (!d.lens) return;
      d.g?.destroy();
      d.g = null;
      d.lens.remove();
      d.lens = null;
    }
    function unmountStage() {
      if (!d.stage) return;
      unregisterLayer(d.stage);
      d.g?.destroy();
      d.g = null;
      d.stage.remove();
      d.stage = null;
    }
    d.setMode = (mode) => {
      d.mode = mode;
      if (cfg.backdrop && canRefract && mode !== "solid" && !host.hasAttribute("data-dpi-no-backdrop")) {
        unmountStage();
        mountLens();
      } else {
        unmountLens();
        if (mode === "refraction") mountStage();
        else unmountStage();
      }
      d.render();
    };
    d.destroy = () => {
      if (d.destroyed) return;
      d.destroyed = true;
      if (d.raf) cancelAnimationFrame(d.raf);
      if (d.running) counters.dropLoops--;
      unmountStage();
      unmountLens();
      d.ro?.disconnect();
      d.mo?.disconnect();
      shadow.remove();
      tint.remove();
      host.removeAttribute("data-dpi-drop-ready");
      host.removeAttribute("data-dpi-moving");
      for (const v of ["--dpi-dx", "--dpi-dy"]) host.style.removeProperty(v);
      d.unbind?.();
      drops.delete(host);
    };
    d.ro = new ResizeObserver(() => {
      resizeStage();
      d.render();
    });
    d.ro.observe(host);
    drops.set(host, d);
    d.render();
    return d;
  }
  var get = (host) => drops.get(host);
  var count = () => drops.size;
  function bindButton(host, d) {
    const mode = host.getAttribute("data-dpi-elastic");
    const elastic = host.hasAttribute("data-dpi-elastic") && mode !== "off";
    let down = false;
    let hover = false;
    const off2 = [];
    const on = (t, f3, o) => {
      host.addEventListener(t, f3, o);
      off2.push(() => host.removeEventListener(t, f3, o));
    };
    const disabled = () => host.disabled || host.getAttribute("aria-disabled") === "true";
    let lastDx = 0;
    let lastDy = 0;
    let bounceUntil = 0;
    function apply3() {
      if (!elastic || reduced()) {
        host.toggleAttribute("data-dpi-pressed", down);
        return;
      }
      const r = d.pose();
      const base = host.offsetWidth;
      const lim = [7, 4, 0.14, 0.2];
      const ox = clamp(lastDx * lim[2], -lim[0], lim[0]) * (hover ? 1 : 0);
      const oy = clamp(lastDy * lim[3], -lim[1], lim[1]) * (hover ? 1 : 0);
      const pull = Math.abs(ox);
      const sw = pull * 1.1 + (down ? base * 0.07 : 0);
      const sh = -pull * 0.35 + (down ? -host.offsetHeight * 0.13 : 0);
      if (down) d.setSpring(560, 26);
      else if (performance.now() < bounceUntil) d.setSpring(300, 12.5);
      else d.setSpring(460, 30);
      d.pull(ox, oy, sw, sh);
      void r;
    }
    const lightFrom = (dx, dy, strength) => {
      d.pointerLight = true;
      const r = host.getBoundingClientRect();
      const nx = dx / Math.max(1, r.width / 2);
      const ny = dy / Math.max(1, r.height / 2);
      const m = Math.hypot(nx, ny);
      if (m < 0.22) {
        d.light(d.lastLightAngle ?? 0, 1 + (strength - 1) * (m / 0.22) * 0.5);
        return;
      }
      d.lastLightAngle = Math.atan2(nx, -ny) * 180 / Math.PI;
      d.light(d.lastLightAngle, strength);
    };
    const lightOff = () => {
      d.pointerLight = false;
      d.lastLightAngle = void 0;
      d.lightReset();
    };
    on("pointermove", (e) => {
      if (disabled() || e.pointerType === "touch" && !down) return;
      const r = host.getBoundingClientRect();
      lastDx = e.clientX - (r.left + r.width / 2);
      lastDy = e.clientY - (r.top + r.height / 2);
      hover = true;
      lightFrom(lastDx, lastDy, down ? 1.6 : 1.25);
      apply3();
    });
    on("pointerenter", (e) => {
      if (!disabled() && e.pointerType !== "touch") {
        hover = true;
      }
    });
    on("pointerdown", (e) => {
      if (disabled() || e.button !== 0) return;
      down = true;
      hover = true;
      const r = host.getBoundingClientRect();
      lastDx = e.clientX - (r.left + r.width / 2);
      lastDy = e.clientY - (r.top + r.height / 2);
      lightFrom(lastDx, lastDy, 1.6);
      apply3();
    });
    const release = () => {
      down = false;
      bounceUntil = performance.now() + 450;
      apply3();
    };
    on("pointerup", release);
    on("pointercancel", () => {
      down = false;
      hover = false;
      lightOff();
      apply3();
    });
    on("pointerleave", () => {
      down = false;
      hover = false;
      lightOff();
      apply3();
    });
    on("pointerup", (e) => {
      if (e.pointerType === "touch") lightOff();
    });
    on("keydown", (e) => {
      if ((e.key === "Enter" || e.key === " ") && !disabled() && !e.repeat) {
        down = true;
        apply3();
      }
    });
    on("keyup", (e) => {
      if (e.key === "Enter" || e.key === " ") release();
    });
    on("blur", () => {
      if (down || hover) {
        down = false;
        hover = false;
        apply3();
      }
    });
    d.unbind = () => off2.forEach((f3) => f3());
  }
  function elasticOnly(host) {
    if (drops.has(host)) return drops.get(host);
    host.setAttribute("data-dpi-elastic", "");
    let d = null;
    d = createDrop(host, {
      stage: false,
      surface: false,
      backdrop: false,
      stretch: { gain: 6e-3, max: 0.18 },
      onPaint: (p) => {
        const r = d?.restRect;
        if (!r) return;
        const tx = p.x + p.w / 2 - (r.x + r.w / 2);
        const ty = p.y + p.h / 2 - (r.y + r.h / 2);
        host.style.setProperty("translate", `${tx.toFixed(2)}px ${ty.toFixed(2)}px`);
        host.style.setProperty("scale", `${(p.w / r.w).toFixed(4)} ${(p.h / r.h).toFixed(4)}`);
      }
    });
    bindButton(host, d);
    return d;
  }
  registerKind("drop", {
    apply(host, mode) {
      let d = drops.get(host);
      if (!d) {
        const kind = host.getAttribute("data-dpi-drop") || "button";
        const radius = kind === "menu" ? parseFloat(getComputedStyle(host).borderTopLeftRadius) || 14 : void 0;
        d = createDrop(host, { optics: kind === "lens" ? "droplens" : "drop", stretch: kind === "menu" ? { gain: 4e-3, max: 0.1 } : { gain: 6e-3, max: 0.18 }, backdrop: host.hasAttribute("data-dpi-notify-glass"), base: host.hasAttribute("data-dpi-notify-glass"), stage: kind !== "menu", radius, spring: kind === "menu" ? { k: 260, c: 18 } : void 0 });
        if (kind === "button") bindButton(host, d);
      }
      d.setMode(mode === "refraction" ? "refraction" : mode);
    }
  });
  function collect2() {
    for (const [host, d] of drops) {
      if (host.isConnected) d.orphan = false;
      else if (d.orphan) d.destroy();
      else d.orphan = true;
    }
  }
  function destroyAll(root4 = document) {
    for (const [host, d] of drops) if (root4 === document || root4.contains(host)) d.destroy();
  }
  document.addEventListener("dpi:theme-change", () => {
    for (const d of drops.values()) d.refreshCopy();
  });
  document.addEventListener("dpi:glass-mode", (e) => {
    const d = drops.get(e.target);
    if (d && !e.target.hasAttribute("data-dpi-drop")) d.setMode(e.detail.mode);
  });

  // dpi/js/dropdown.js
  var open = /* @__PURE__ */ new Set();
  var records = ownedMap();
  function parts(root4) {
    return {
      kind: root4.dataset.dpiDropdown === "nav" ? "nav" : "actions",
      trigger: root4.querySelector("[data-dpi-dropdown-trigger]"),
      panel: root4.querySelector("[data-dpi-dropdown-panel]")
    };
  }
  function items(panel2) {
    return [...panel2.querySelectorAll(".dpi-menu__item")].filter((n) => !n.disabled && n.getAttribute("aria-disabled") !== "true");
  }
  function setup2(root4) {
    if (records.has(root4)) return;
    const { kind, trigger: trigger2, panel: panel2 } = parts(root4);
    if (!trigger2 || !panel2) return;
    records.set(root4, { focus: null, wired: null, fallback: null });
    root4.dataset.dpiReady = "1";
    root4.dataset.dpiState = "closed";
    panel2.classList.add("dpi-menu");
    panel2.classList.remove("dpi-glass");
    panel2.removeAttribute("data-dpi-glass");
    panel2.setAttribute("data-dpi-drop", "menu");
    root4.setAttribute("data-dpi-morph", "");
    ensureId(panel2, "dpi-menu");
    trigger2.setAttribute("aria-controls", panel2.id);
    trigger2.setAttribute("aria-expanded", "false");
    if (kind === "actions") {
      trigger2.setAttribute("aria-haspopup", "menu");
      panel2.setAttribute("role", "menu");
      panel2.querySelectorAll("ul, li").forEach((el6) => el6.setAttribute("role", "none"));
      panel2.querySelectorAll(".dpi-menu__sep").forEach((el6) => el6.setAttribute("role", "separator"));
      panel2.querySelectorAll(".dpi-menu__item").forEach((it) => {
        if (!["menuitemcheckbox", "menuitemradio"].includes(it.getAttribute("role"))) it.setAttribute("role", "menuitem");
        it.tabIndex = -1;
      });
      if (!panel2.hasAttribute("aria-label") && !panel2.hasAttribute("aria-labelledby")) {
        panel2.setAttribute("aria-labelledby", ensureId(trigger2, "dpi-trigger"));
      }
    }
    panel2.hidden = true;
  }
  function place(root4, panel2) {
    root4.removeAttribute("data-dpi-placement");
    root4.removeAttribute("data-dpi-align");
    panel2.style.removeProperty("--dpi-menu-shift-x");
    panel2.style.removeProperty("--dpi-menu-max-height");
    const margin = 12;
    const trigger2 = parts(root4).trigger;
    const morph = root4.hasAttribute("data-dpi-morph");
    panel2.style.setProperty("--dpi-menu-top", `${trigger2.offsetTop}px`);
    panel2.style.setProperty("--dpi-menu-bottom", `${Math.max(0, root4.offsetHeight - trigger2.offsetTop - trigger2.offsetHeight)}px`);
    panel2.style.setProperty("--dpi-menu-trigger-w", `${trigger2.offsetWidth}px`);
    panel2.style.setProperty("--dpi-menu-trigger-h", `${trigger2.offsetHeight}px`);
    let r = panel2.getBoundingClientRect();
    if (r.right > innerWidth - margin) root4.dataset.dpiAlign = "end";
    r = panel2.getBoundingClientRect();
    const shift = r.left < margin ? margin - r.left : r.right > innerWidth - margin ? innerWidth - margin - r.right : 0;
    panel2.style.setProperty("--dpi-menu-shift-x", `${shift}px`);
    const t = trigger2.getBoundingClientRect();
    const below = Math.max(0, innerHeight - (morph ? t.top : t.bottom + 8) - margin);
    const above = Math.max(0, (morph ? t.bottom : t.top - 8) - margin);
    const top = r.height > below && above > below;
    if (top) root4.dataset.dpiPlacement = "top";
    panel2.style.setProperty("--dpi-menu-max-height", `${Math.max(48, top ? above : below)}px`);
  }
  var reduced2 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var stateOf = (root4) => root4.dataset.dpiState || "closed";
  var isOpenish = (root4) => ["opening", "open"].includes(stateOf(root4));
  var clamp2 = (x) => Math.max(0, Math.min(1, x));
  var ease = (x) => {
    const t = clamp2(x);
    return t * t * (3 - 2 * t);
  };
  var content = (panel2) => {
    const list = panel2.querySelector(":scope > .dpi-menu__list");
    return list ? [list] : [...panel2.children].filter((el6) => !el6.matches(".dpi-drop__tint, .dpi-drop__shadow, .dpi-drop__stage, .dpi-drop__lens"));
  };
  function clearReveal(root4, panel2) {
    for (const el6 of content(panel2)) {
      el6.style.removeProperty("clip-path");
      el6.style.removeProperty("opacity");
      el6.style.removeProperty("translate");
    }
    if (root4.hasAttribute("data-dpi-notify-dock")) panel2.querySelectorAll("[data-dpi-notify-clipped]").forEach((el6) => el6.removeAttribute("data-dpi-notify-clipped"));
    root4.style.removeProperty("--dpi-menu-t");
    root4.removeAttribute("data-dpi-menu-visible");
  }
  function focusPending(root4, panel2) {
    const rec2 = records.get(root4);
    if (!rec2?.focus || !isOpenish(root4)) return;
    const list = items(panel2);
    const target2 = rec2.focus === "last" ? list[list.length - 1] : list[0];
    rec2.focus = null;
    target2?.focus({ preventScroll: true });
  }
  function surfaceRect(trigger2) {
    const r = trigger2.getBoundingClientRect();
    const p = get(trigger2)?.rect;
    return p ? { left: r.left + trigger2.clientLeft + p.x, top: r.top + trigger2.clientTop + p.y, width: p.w, height: p.h } : r;
  }
  function revealNotification(el6, p) {
    const inset = 2;
    const x = p.x - el6.offsetLeft + inset, y = p.y - el6.offsetTop + inset;
    const w = Math.max(0, p.w - 2 * inset), h = Math.max(0, p.h - 2 * inset);
    const r = Math.max(0, Math.min(p.r - inset, w / 2, h / 2));
    const n = (v) => v.toFixed(3);
    const X = x + w, Y = y + h;
    const path = w < 0.01 || h < 0.01 ? "M 0 0 Z" : `M ${n(x + r)} ${n(y)} H ${n(X - r)} A ${n(r)} ${n(r)} 0 0 1 ${n(X)} ${n(y + r)} V ${n(Y - r)} A ${n(r)} ${n(r)} 0 0 1 ${n(X - r)} ${n(Y)} H ${n(x + r)} A ${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(Y - r)} V ${n(y + r)} A ${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)} Z`;
    el6.style.clipPath = `path('${path}')`;
    el6.style.opacity = "1";
    el6.style.removeProperty("translate");
    const inside = (px, py) => {
      if (px < x || px > X || py < y || py > Y) return false;
      const cx = Math.max(x + r, Math.min(px, X - r));
      const cy = Math.max(y + r, Math.min(py, Y - r));
      return (px - cx) ** 2 + (py - cy) ** 2 <= r * r;
    };
    const box = el6.getBoundingClientRect();
    for (const button3 of el6.querySelectorAll("button")) {
      const b = button3.getBoundingClientRect();
      const left = b.left - box.left - 2, top = b.top - box.top - 2;
      const right = b.right - box.left + 2, bottom = b.bottom - box.top + 2;
      const fits = inside(left, top) && inside(right, top) && inside(right, bottom) && inside(left, bottom);
      button3.toggleAttribute("data-dpi-notify-clipped", !fits);
    }
  }
  function reveal(root4, panel2, p, trigger2) {
    const base = get(panel2)?.collapse || { w: trigger2.offsetWidth, h: trigger2.offsetHeight };
    const axes = [];
    if (Math.abs(panel2.offsetWidth - base.w) > 1) axes.push((p.w - base.w) / (panel2.offsetWidth - base.w));
    if (Math.abs(panel2.offsetHeight - base.h) > 1) axes.push((p.h - base.h) / (panel2.offsetHeight - base.h));
    const progress = clamp2(axes.length ? axes.reduce((a, b) => a + b, 0) / axes.length : p.w / panel2.offsetWidth);
    for (const el6 of content(panel2)) {
      if (root4.hasAttribute("data-dpi-notify-dock")) {
        revealNotification(el6, p);
        continue;
      }
      const x = el6.offsetLeft, y = el6.offsetTop;
      el6.style.clipPath = `inset(${Math.max(0, p.y - y).toFixed(2)}px ${Math.max(0, x + el6.offsetWidth - p.x - p.w).toFixed(2)}px ${Math.max(0, y + el6.offsetHeight - p.y - p.h).toFixed(2)}px ${Math.max(0, p.x - x).toFixed(2)}px round ${Math.max(0, p.r - 4).toFixed(2)}px)`;
      el6.style.opacity = ease((progress - 0.18) / 0.62).toFixed(3);
      el6.style.translate = `0 ${((root4.dataset.dpiPlacement === "top" ? 4 : -4) * (1 - progress)).toFixed(2)}px`;
    }
    root4.style.setProperty("--dpi-menu-t", (1 - ease(progress / 0.3)).toFixed(3));
    root4.toggleAttribute("data-dpi-menu-visible", progress > 0.65);
    if (progress > 0.65 && stateOf(root4) === "opening") focusPending(root4, panel2);
  }
  function finishOpen(root4, panel2) {
    root4.dataset.dpiState = "open";
    panel2.inert = false;
    clearReveal(root4, panel2);
    focusPending(root4, panel2);
  }
  function finishClosed(root4, panel2) {
    panel2.hidden = true;
    panel2.inert = true;
    root4.dataset.dpiState = "closed";
    clearReveal(root4, panel2);
    const rec2 = records.get(root4);
    if (rec2) rec2.focus = null;
  }
  function wireDrop(root4, panel2) {
    if (!get(panel2)) setup(panel2);
    const d = get(panel2);
    const rec2 = records.get(root4);
    if (!d || rec2.wired === d) return d;
    rec2.wired = d;
    d.pointerLight = true;
    d.onPaint = (p) => {
      if (["opening", "closing"].includes(stateOf(root4))) reveal(root4, panel2, p, parts(root4).trigger);
    };
    panel2.addEventListener("dpi:drop-settled", (e) => {
      if (e.target !== panel2) return;
      if (stateOf(root4) === "opening") finishOpen(root4, panel2);
      else if (stateOf(root4) === "closing") finishClosed(root4, panel2);
    });
    return d;
  }
  function fallback(root4, panel2, showing) {
    const rec2 = records.get(root4);
    const current3 = rec2.fallback;
    if (current3) {
      current3.playbackRate = showing ? 1 : -1;
      current3.play();
      return;
    }
    if (!panel2.animate || reduced2()) {
      if (showing) finishOpen(root4, panel2);
      else finishClosed(root4, panel2);
      return;
    }
    const animation = panel2.animate([
      { opacity: 0, translate: "var(--dpi-menu-shift-x, 0px) -8px", clipPath: "inset(0 0 85% 0 round 24px)" },
      { opacity: 1, translate: "var(--dpi-menu-shift-x, 0px) 0", clipPath: "inset(0 round 24px)" }
    ], { duration: showing ? 320 : 260, easing: "cubic-bezier(.2,.8,.2,1)", fill: "both" });
    rec2.fallback = animation;
    if (!showing) {
      animation.currentTime = 260;
      animation.playbackRate = -1;
    }
    animation.onfinish = () => {
      rec2.fallback = null;
      animation.cancel();
      if (isOpenish(root4)) finishOpen(root4, panel2);
      else finishClosed(root4, panel2);
    };
  }
  function show(root4, { focus = "first" } = {}) {
    if (!records.has(root4)) setup2(root4);
    const { kind, trigger: trigger2, panel: panel2 } = parts(root4);
    if (!trigger2 || !panel2 || isOpenish(root4)) return;
    for (const other of open) if (other !== root4 && !other.hasAttribute("data-dpi-notify-modal")) hide(other);
    const wasClosed = stateOf(root4) === "closed";
    const rec2 = records.get(root4);
    rec2.focus = kind === "actions" ? focus : null;
    panel2.hidden = false;
    panel2.inert = false;
    trigger2.setAttribute("aria-expanded", "true");
    open.add(root4);
    if (wasClosed) place(root4, panel2);
    root4.dataset.dpiState = "opening";
    const d = wireDrop(root4, panel2);
    if (d) {
      if (wasClosed) {
        const c = d.collapsedPose(surfaceRect(trigger2), trigger2);
        d.snap(c.ox, c.oy, c.sw, c.sh);
      }
      if (reduced2()) {
        d.snap(0, 0, 0, 0);
        finishOpen(root4, panel2);
      } else {
        d.setSpring(320, 33);
        d.pull(0, 0, 0, 0);
      }
    } else fallback(root4, panel2, true);
    emit(root4, "open", { component: "dropdown" });
  }
  function hide(root4, { restoreFocus: restoreFocus2 = false } = {}) {
    const { trigger: trigger2, panel: panel2 } = parts(root4);
    if (!panel2 || !isOpenish(root4)) return;
    trigger2.setAttribute("aria-expanded", "false");
    open.delete(root4);
    records.get(root4).focus = null;
    root4.dataset.dpiState = "closing";
    panel2.inert = true;
    if (restoreFocus2) trigger2.focus({ preventScroll: true });
    const d = get(panel2);
    if (d && !reduced2()) {
      const c = d.collapsedPose(surfaceRect(trigger2), trigger2);
      d.setSpring(380, 38);
      d.pull(c.ox, c.oy, c.sw, c.sh);
    } else if (reduced2()) finishClosed(root4, panel2);
    else fallback(root4, panel2, false);
    emit(root4, "close", { component: "dropdown" });
  }
  var typeahead = { text: "", t: 0 };
  function onKeydown(e) {
    const root4 = e.target.closest?.("[data-dpi-dropdown]");
    if (!root4 || !root4.dataset.dpiReady) return;
    const { kind, trigger: trigger2, panel: panel2 } = parts(root4);
    const isOpen4 = isOpenish(root4);
    const onTrigger = trigger2.contains(e.target);
    if (e.key === "Escape" && isOpen4) {
      e.preventDefault();
      e.stopPropagation();
      hide(root4, { restoreFocus: true });
      return;
    }
    if (onTrigger && kind === "actions" && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
      e.preventDefault();
      if (!isOpen4) show(root4, { focus: e.key === "ArrowUp" ? "last" : "first" });
      else {
        records.get(root4).focus = e.key === "ArrowUp" ? "last" : "first";
        focusPending(root4, panel2);
      }
      return;
    }
    if (kind !== "actions" || !isOpen4 || !panel2.contains(e.target)) return;
    const list = items(panel2);
    if (!list.length) return;
    const i = list.indexOf(document.activeElement);
    let next = null;
    if (e.key === "ArrowDown") next = list[(i + 1) % list.length];
    else if (e.key === "ArrowUp") next = list[(i - 1 + list.length) % list.length];
    else if (e.key === "Home") next = list[0];
    else if (e.key === "End") next = list[list.length - 1];
    else if (e.key === "Tab") {
      hide(root4);
      return;
    } else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== " ") {
      const now = Date.now();
      typeahead = { text: (now - typeahead.t > 700 ? "" : typeahead.text) + e.key.toLowerCase(), t: now };
      next = list.find((n) => n.textContent.trim().toLowerCase().startsWith(typeahead.text));
    }
    if (next) {
      e.preventDefault();
      next.focus();
    }
  }
  function onClick(e) {
    const trigger2 = e.target.closest?.("[data-dpi-dropdown-trigger]");
    if (trigger2) {
      if (trigger2.disabled || trigger2.getAttribute("aria-disabled") === "true") return;
      e.preventDefault();
      const root5 = trigger2.closest("[data-dpi-dropdown]");
      if (!root5?.dataset.dpiReady) return;
      const { panel: panel2 } = parts(root5);
      if (!isOpenish(root5)) show(root5);
      else hide(root5, { restoreFocus: true });
      return;
    }
    const item2 = e.target.closest?.(".dpi-menu__item");
    const root4 = item2?.closest("[data-dpi-dropdown]");
    if (root4?.dataset.dpiReady) {
      if (item2.disabled || item2.getAttribute("aria-disabled") === "true") return;
      const role = item2.getAttribute("role");
      if (role === "menuitemcheckbox" || role === "menuitemradio") {
        if (role === "menuitemradio") items(parts(root4).panel).filter((it) => it.getAttribute("role") === role).forEach((it) => it.setAttribute("aria-checked", "false"));
        const checked = role === "menuitemradio" || item2.getAttribute("aria-checked") !== "true";
        item2.setAttribute("aria-checked", String(checked));
        emit(root4, "menu-change", { source: item2, value: item2.value, checked });
      }
      if (!item2.hasAttribute("data-dpi-keep-open")) hide(root4, { restoreFocus: parts(root4).kind === "actions" });
    }
  }
  function onOutside(e) {
    for (const root4 of [...open]) if (!root4.hasAttribute("data-dpi-notify-modal") && !root4.contains(e.target)) hide(root4);
  }
  function onFocusout(e) {
    const root4 = e.target.closest?.("[data-dpi-dropdown]");
    if (!root4 || root4.hasAttribute("data-dpi-notify-dock") || parts(root4).kind !== "nav") return;
    if (e.relatedTarget && !root4.contains(e.relatedTarget)) hide(root4);
  }
  var bound2 = false;
  function bind2() {
    if (bound2) return;
    bound2 = true;
    document.addEventListener("keydown", onKeydown);
    document.addEventListener("click", onClick);
    document.addEventListener("pointerdown", onOutside);
    document.addEventListener("focusout", onFocusout);
    addEventListener("resize", () => {
      for (const root4 of open) {
        const { panel: panel2 } = parts(root4);
        place(root4, panel2);
        get(panel2)?.measure();
      }
    }, { passive: true });
  }

  // dpi/js/navbar.js
  var navbar_exports = {};
  __export(navbar_exports, {
    bind: () => bind3,
    setup: () => setup3
  });
  function parts2(nav2) {
    return { toggle: nav2.querySelector("[data-dpi-navbar-toggle]"), collapse: nav2.querySelector("[data-dpi-navbar-collapse]") };
  }
  function setup3(nav2) {
    if (nav2.dataset.dpiReady) return;
    const { toggle: toggle2, collapse } = parts2(nav2);
    if (!toggle2 || !collapse) return;
    nav2.dataset.dpiReady = "1";
    toggle2.setAttribute("aria-controls", ensureId(collapse, "dpi-nav"));
    toggle2.setAttribute("aria-expanded", "false");
  }
  function set(nav2, isOpen4, { restoreFocus: restoreFocus2 = false } = {}) {
    const { toggle: toggle2, collapse } = parts2(nav2);
    if (isOpen4) collapse.setAttribute("data-dpi-open", "");
    else collapse.removeAttribute("data-dpi-open");
    toggle2.setAttribute("aria-expanded", String(isOpen4));
    if (!isOpen4 && restoreFocus2) toggle2.focus();
    emit(nav2, isOpen4 ? "open" : "close", { component: "navbar" });
  }
  var bound3 = false;
  function bind3() {
    if (bound3) return;
    bound3 = true;
    document.addEventListener("click", (e) => {
      const toggle2 = e.target.closest?.("[data-dpi-navbar-toggle]");
      const nav2 = toggle2?.closest("[data-dpi-navbar]");
      if (!nav2?.dataset.dpiReady) return;
      set(nav2, !parts2(nav2).collapse.hasAttribute("data-dpi-open"));
    });
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || e.defaultPrevented) return;
      const nav2 = e.target.closest?.("[data-dpi-navbar]");
      if (!nav2?.dataset.dpiReady || !parts2(nav2).collapse.hasAttribute("data-dpi-open")) return;
      if (getComputedStyle(parts2(nav2).toggle).display === "none") return;
      e.preventDefault();
      set(nav2, false, { restoreFocus: true });
    });
  }

  // dpi/js/dialog.js
  var dialog_exports = {};
  __export(dialog_exports, {
    bind: () => bind4
  });
  var openers = ownedMap();
  function openDialog(dialog, opener) {
    if (dialog.open) return;
    openers.set(dialog, opener);
    dialog.showModal();
    emit(dialog, "open", { component: "dialog" });
  }
  var bound4 = false;
  function bind4() {
    if (bound4) return;
    bound4 = true;
    document.addEventListener("click", (e) => {
      const opener = e.target.closest?.("[data-dpi-dialog-open]");
      if (opener) {
        const dialog = document.getElementById(opener.getAttribute("data-dpi-dialog-open"));
        if (dialog instanceof HTMLDialogElement) {
          e.preventDefault();
          openDialog(dialog, opener);
        }
        return;
      }
      const closer = e.target.closest?.("[data-dpi-dialog-close]");
      if (closer) {
        const dialog = closer.closest("dialog");
        if (dialog) {
          e.preventDefault();
          dialog.close(closer.getAttribute("data-dpi-dialog-close") || "");
        }
        return;
      }
      if (e.target instanceof HTMLDialogElement && e.target.hasAttribute("data-dpi-dismissible") && e.target.open) {
        const sheet = e.target.classList.contains("dpi-sheet");
        const r = e.target.getBoundingClientRect();
        const inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (sheet || !inside) e.target.close("dismiss");
      }
    });
    document.addEventListener(
      "close",
      (e) => {
        const dialog = e.target;
        if (!(dialog instanceof HTMLDialogElement) || !(dialog.classList.contains("dpi-dialog") || dialog.classList.contains("dpi-sheet"))) return;
        const opener = openers.get(dialog);
        openers.delete(dialog);
        if (opener?.isConnected) opener.focus();
        emit(dialog, "close", { component: "dialog", returnValue: dialog.returnValue });
      },
      true
    );
  }

  // dpi/js/sheet.js
  var sheet_exports = {};
  __export(sheet_exports, {
    bind: () => bind5,
    closeAnimated: () => closeAnimated
  });
  function detent(sheet, value2) {
    sheet.setAttribute("data-dpi-sheet", value2);
    const h = sheet.querySelector("[data-dpi-sheet-handle]");
    h?.setAttribute("aria-expanded", String(value2 === "large"));
  }
  var reduced3 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function closeAnimated(sheet, reason = "dismiss") {
    if (!sheet.open || sheet.hasAttribute("data-dpi-closing")) return;
    const panel2 = sheet.querySelector(".dpi-sheet__panel");
    if (reduced3() || !panel2) {
      sheet.close(reason);
      return;
    }
    sheet.setAttribute("data-dpi-closing", "");
    let done7 = false;
    const fin = () => {
      if (done7) return;
      done7 = true;
      panel2.removeEventListener("transitionend", onEnd);
      sheet.removeAttribute("data-dpi-closing");
      if (sheet.open) sheet.close(reason);
    };
    const onEnd = (e) => e.target === panel2 && fin();
    panel2.addEventListener("transitionend", onEnd);
    setTimeout(fin, 700);
  }
  var bound5 = false;
  function bind5() {
    if (bound5) return;
    bound5 = true;
    document.addEventListener("click", (e) => {
      const h = e.target.closest?.("[data-dpi-sheet-handle]");
      if (!h || h.dataset.dpiDragged) return;
      const sheet = h.closest(".dpi-sheet");
      detent(sheet, sheet.getAttribute("data-dpi-sheet") === "large" ? "medium" : "large");
    });
    document.addEventListener("keydown", (e) => {
      const h = e.target.closest?.("[data-dpi-sheet-handle]");
      if (!h) return;
      const sheet = h.closest(".dpi-sheet");
      const large = sheet.getAttribute("data-dpi-sheet") === "large";
      if (e.key === "ArrowUp") {
        e.preventDefault();
        if (!large) detent(sheet, "large");
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (large) detent(sheet, "medium");
        else closeAnimated(sheet);
      }
    });
    let drag = null;
    document.addEventListener("pointerdown", (e) => {
      const h = e.target.closest?.("[data-dpi-sheet-handle]");
      if (!h || e.button !== 0) return;
      drag = { h, panel: h.closest(".dpi-sheet__panel"), y0: e.clientY, dy: 0 };
      h.setPointerCapture(e.pointerId);
      delete h.dataset.dpiDragged;
    });
    document.addEventListener("pointermove", (e) => {
      if (!drag) return;
      drag.dy = e.clientY - drag.y0;
      if (Math.abs(drag.dy) > 4) drag.h.dataset.dpiDragged = "1";
      drag.panel.style.transition = "none";
      drag.panel.style.transform = `translateY(${Math.max(0, drag.dy)}px)`;
    });
    const end = () => {
      if (!drag) return;
      const { h, panel: panel2, dy } = drag;
      drag = null;
      panel2.style.transition = "";
      panel2.style.transform = "";
      const sheet = h.closest(".dpi-sheet");
      if (dy > 120) closeAnimated(sheet);
      else if (dy < -60 && sheet.getAttribute("data-dpi-sheet") !== "large") detent(sheet, "large");
      setTimeout(() => delete h.dataset.dpiDragged, 0);
    };
    document.addEventListener("pointerup", end);
    document.addEventListener("pointercancel", end);
  }

  // dpi/js/action.js
  var action_exports = {};
  __export(action_exports, {
    bind: () => bind6
  });
  var bound6 = false;
  function bind6() {
    if (bound6) return;
    bound6 = true;
    document.addEventListener("click", (e) => {
      const el6 = e.target.closest?.("[data-dpi-action]:not(form)");
      if (!el6 || el6.matches('[aria-disabled="true"], :disabled')) return;
      if (el6.hasAttribute("data-dpi-action-prevent")) e.preventDefault();
      emit(el6, "action", { name: el6.getAttribute("data-dpi-action"), source: el6 });
    });
    document.addEventListener("submit", (e) => {
      const form = e.target;
      if (!(form instanceof HTMLFormElement) || !form.hasAttribute("data-dpi-action")) return;
      if (form.hasAttribute("data-dpi-action-prevent")) e.preventDefault();
      emit(form, "action", { name: form.getAttribute("data-dpi-action"), source: form, submitter: e.submitter ?? null });
    });
    document.addEventListener("click", async (e) => {
      const btn = e.target.closest?.("[data-dpi-copy]");
      if (!btn) return;
      const code = btn.closest(".dpi-code")?.querySelector("code")?.textContent ?? "";
      const label2 = btn.querySelector(".dpi-btn__label");
      const icon4 = btn.querySelector(".dpi-icon");
      const original = label2?.textContent ?? "";
      const iconName = icon4?.getAttribute("data-dpi-icon");
      let ok = true;
      try {
        await navigator.clipboard.writeText(code);
      } catch {
        ok = false;
      }
      btn.setAttribute("data-dpi-copy-state", ok ? "done" : "error");
      if (label2) label2.textContent = ok ? "Copiato" : "Copia non riuscita";
      clearTimeout(btn.__dpiCopyTimer);
      btn.__dpiCopyTimer = setTimeout(() => {
        btn.removeAttribute("data-dpi-copy-state");
        if (label2) label2.textContent = original;
      }, 1600);
      void iconName;
    });
  }

  // dpi/js/bottombar.js
  var bottombar_exports = {};
  __export(bottombar_exports, {
    bind: () => bind7,
    setup: () => setup5
  });

  // dpi/js/bar-search.js
  var bar_search_exports = {};
  __export(bar_search_exports, {
    abort: () => abort2,
    close: () => close2,
    configure: () => configure,
    defaultBar: () => defaultBar,
    isOpen: () => isOpen,
    open: () => open3,
    query: () => query,
    setQuery: () => setQuery,
    setup: () => setup4,
    stateOf: () => stateOf3,
    suggest: () => suggest,
    toggle: () => toggle
  });

  // dpi/js/bar-morph.js
  var clamp3 = (x) => Math.max(0, Math.min(1, x));
  var ease2 = (x) => {
    const t = clamp3(x);
    return t * t * (3 - 2 * t);
  };
  var mix = (a, b, t) => a + (b - a) * t;
  var f = (n) => (Math.round(n * 100) / 100).toString();
  var BAR_MORPH = Object.freeze({ gap: 10, stretch: 12, blob: 56 });
  function plan({ bar: bar2, pocket, body, grow = 1, mode = "side", gap = BAR_MORPH.gap, stretch = BAR_MORPH.stretch, radius = 24 }) {
    const p = { bar: bar2, pocket, body, grow, mode, gap, stretch, radius };
    if (mode === "solo" || !pocket) {
      p.mode = "solo";
      return p;
    }
    if (mode === "stack") {
      p.s = grow;
      p.xp = grow > 0 ? pocket.y + pocket.h : pocket.y;
      p.tNear0 = p.s * ((grow > 0 ? bar2.y : bar2.y + bar2.h) - p.xp);
      p.tFar0 = p.s * ((grow > 0 ? bar2.y + bar2.h : bar2.y) - p.xp);
      p.len = body.h;
      p.tFarT = gap + body.h;
    } else {
      const s = body.x + body.w / 2 >= pocket.x + pocket.w / 2 ? 1 : -1;
      p.s = s;
      p.xp = s > 0 ? pocket.x + pocket.w : pocket.x;
      p.tNear0 = s * ((s > 0 ? bar2.x : bar2.x + bar2.w) - p.xp);
      p.tFar0 = s * ((s > 0 ? bar2.x + bar2.w : bar2.x) - p.xp);
      p.len = body.w;
      p.tFarT = gap + body.w;
    }
    p.tNear0 = Math.min(p.tNear0, 0);
    p.tFar0 = Math.max(p.tFar0, 0);
    p.blob = Math.min(p.len, Math.max(30, Math.min(BAR_MORPH.blob, p.len * 0.42)));
    return p;
  }
  function sdBox(px, py, r) {
    const cx = r.x + r.w / 2, cy = r.y + r.h / 2;
    const rr = Math.min(r.r ?? 0, r.w / 2, r.h / 2);
    const qx = Math.abs(px - cx) - (r.w / 2 - rr), qy = Math.abs(py - cy) - (r.h / 2 - rr);
    return Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - rr;
  }
  function smin(a, b, k) {
    if (k <= 0) return a < b ? a : b;
    const h = Math.max(k - Math.abs(a - b), 0) / k;
    return Math.min(a, b) - h * h * k / 4;
  }
  var SEG = [null, [[3, 0]], [[0, 1]], [[3, 1]], [[1, 2]], "a", [[0, 2]], [[3, 2]], [[2, 3]], [[0, 2]], "b", [[1, 2]], [[1, 3]], [[0, 1]], [[3, 0]], null];
  function contour(field, ox, oy, w, h, cs) {
    const nx = Math.ceil(w / cs) + 1, ny = Math.ceil(h / cs) + 1;
    const val = new Float32Array(nx * ny);
    for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) val[j * nx + i] = field(ox + i * cs, oy + j * cs);
    const ex = new Float32Array(nx * ny * 2), ey = new Float32Array(nx * ny * 2);
    const have = new Uint8Array(nx * ny * 2);
    const edge = (e, i, j) => {
      let a, b, id;
      if (e === 0) {
        id = (j * nx + i) * 2;
        a = j * nx + i;
        b = a + 1;
      } else if (e === 2) {
        id = ((j + 1) * nx + i) * 2;
        a = (j + 1) * nx + i;
        b = a + 1;
      } else if (e === 3) {
        id = (j * nx + i) * 2 + 1;
        a = j * nx + i;
        b = a + nx;
      } else {
        id = (j * nx + i + 1) * 2 + 1;
        a = j * nx + i + 1;
        b = a + nx;
      }
      if (!have[id]) {
        const va = val[a], vb = val[b], t = va === vb ? 0.5 : va / (va - vb);
        const horiz = e === 0 || e === 2;
        const x0 = a % nx, y0 = Math.floor(a / nx);
        ex[id] = ox + (x0 + (horiz ? t : 0)) * cs;
        ey[id] = oy + (y0 + (horiz ? 0 : t)) * cs;
        have[id] = 1;
      }
      return id;
    };
    const links = /* @__PURE__ */ new Map();
    const link = (p, q) => {
      (links.get(p) ?? links.set(p, []).get(p)).push(q);
      (links.get(q) ?? links.set(q, []).get(q)).push(p);
    };
    for (let j = 0; j < ny - 1; j++) {
      for (let i = 0; i < nx - 1; i++) {
        const a = val[j * nx + i] < 0, b = val[j * nx + i + 1] < 0, c = val[(j + 1) * nx + i + 1] < 0, d = val[(j + 1) * nx + i] < 0;
        const idx = (a ? 1 : 0) | (b ? 2 : 0) | (c ? 4 : 0) | (d ? 8 : 0);
        let segs = SEG[idx];
        if (!segs) continue;
        if (segs === "a" || segs === "b") {
          const center = (val[j * nx + i] + val[j * nx + i + 1] + val[(j + 1) * nx + i + 1] + val[(j + 1) * nx + i]) / 4 < 0;
          segs = segs === "a" ? center ? [[0, 1], [2, 3]] : [[3, 0], [1, 2]] : center ? [[3, 0], [1, 2]] : [[0, 1], [2, 3]];
        }
        for (const [e1, e2] of segs) link(edge(e1, i, j), edge(e2, i, j));
      }
    }
    const loops = [];
    const seen = /* @__PURE__ */ new Set();
    for (const start3 of links.keys()) {
      if (seen.has(start3)) continue;
      const pts = [];
      let prev = -1, cur2 = start3;
      for (let guard2 = 0; guard2 < 1e5; guard2++) {
        seen.add(cur2);
        pts.push([ex[cur2], ey[cur2]]);
        const nb = links.get(cur2);
        const next = nb.find((n) => n !== prev && !seen.has(n)) ?? nb.find((n) => n !== prev);
        if (next === void 0 || next === start3 || seen.has(next)) break;
        prev = cur2;
        cur2 = next;
      }
      if (pts.length > 2) loops.push(pts);
    }
    return loops;
  }
  function loopsToPath(loops, bx, by) {
    let d = "";
    for (const pts of loops) {
      const out = [];
      const n = pts.length;
      for (let i = 0; i < n; i++) {
        const p0 = pts[(i + n - 1) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
        const cr = (p1[0] - p0[0]) * (p2[1] - p1[1]) - (p1[1] - p0[1]) * (p2[0] - p1[0]);
        if (Math.abs(cr) > 0.01) out.push(p1);
      }
      const q = out.length > 2 ? out : pts;
      d += `M ${f(q[0][0] - bx)} ${f(q[0][1] - by)}`;
      for (let i = 1; i < q.length; i++) d += ` L ${f(q[i][0] - bx)} ${f(q[i][1] - by)}`;
      d += " Z";
    }
    return d;
  }
  function roundedPath(r, bx = 0, by = 0) {
    const x = r.x - bx, y = r.y - by, w = r.w, h = r.h, rr = Math.max(0, Math.min(r.r ?? 0, w / 2, h / 2));
    if (w <= 0 || h <= 0) return "M 0 0 Z";
    const a = (xx, yy) => `A ${f(rr)} ${f(rr)} 0 0 1 ${f(xx)} ${f(yy)}`;
    return `M ${f(x + rr)} ${f(y)} H ${f(x + w - rr)} ${a(x + w, y + rr)} V ${f(y + h - rr)} ${a(x + w - rr, y + h)} H ${f(x + rr)} ${a(x, y + h - rr)} V ${f(y + rr)} ${a(x + rr, y)} Z`;
  }
  function frame2(pl, uRaw, box, { cell = 3, blend = null } = {}) {
    const u = clamp3(uRaw);
    const { bar: bar2, body } = pl;
    let pocket = pl.pocket;
    const mat = ease2((u - 0.06) / 0.62);
    const reveal2 = ease2((u - 0.52) / 0.38);
    const c = ease2(u / 0.4);
    const x = ease2((u - 0.28) / 0.72);
    const v = ease2((u - 0.36) / 0.64);
    const a = ease2(u / 0.55);
    const out = { u, mat, reveal: reveal2, grow: v, k: 0 };
    let b;
    if (pl.mode === "solo") {
      const cx = bar2.x + bar2.w / 2;
      const wBlob = Math.min(body.w, Math.max(48, body.w * 0.4));
      const w = mix(mix(bar2.w, wBlob, c), body.w, x);
      const hh = mix(bar2.h, body.h, v);
      const y = pl.grow > 0 ? bar2.y : bar2.y + bar2.h - hh;
      const bodyCx = mix(cx, body.x + body.w / 2, x);
      b = { x: bodyCx - w / 2, y, w, h: hh, r: Math.min(mix(bar2.r, pl.radius, v), w / 2, hh / 2) };
      out.body = b;
      out.pocket = null;
      out.path = u <= 5e-4 ? roundedPath(b, box.x, box.y) : loopsToPath(contour((px, py) => sdBox(px, py, b), box.x, box.y, box.w, box.h, cell), box.x, box.y);
      out.keep = { solo: true, f: 1 - c };
      return out;
    }
    const s = pl.s;
    const nearT = mix(pl.tNear0, pl.gap, a) + pl.stretch * Math.sin(Math.PI * clamp3((u - 0.3) / 0.6));
    const blobFar = pl.gap + pl.blob;
    const farT = mix(mix(pl.tFar0, blobFar, c), pl.tFarT, x);
    const nearEdge = pl.xp + s * nearT, farEdge = pl.xp + s * farT;
    const lo = Math.min(nearEdge, farEdge), hi = Math.max(nearEdge, farEdge);
    const radius = (hh, ww) => Math.min(mix(bar2.r, pl.radius, v), ww / 2, hh / 2);
    if (pl.mode === "stack") {
      const hh = Math.max(1, hi - lo);
      const xs = mix(bar2.x, body.x, v), xe = mix(bar2.x + bar2.w, body.x + body.w, v);
      b = { x: xs, y: lo, w: Math.max(1, xe - xs), h: hh, r: 0 };
      b.r = radius(hh, b.w);
    } else {
      const ww = Math.max(1, hi - lo);
      const hh = mix(bar2.h, body.h, v);
      const y = pl.grow > 0 ? bar2.y : bar2.y + bar2.h - hh;
      b = { x: lo, y, w: ww, h: hh, r: 0 };
      b.r = radius(hh, ww);
    }
    if (blend && blend.t < 1) {
      const lr = (x2, y, t) => ({ x: mix(x2.x, y.x, t), y: mix(x2.y, y.y, t), w: mix(x2.w, y.w, t), h: mix(x2.h, y.h, t), r: mix(x2.r ?? 0, y.r ?? 0, t) });
      if (blend.body) b = lr(blend.body, b, blend.t);
      if (blend.pocket && pocket) pocket = lr(blend.pocket, pocket, blend.tp ?? blend.t);
    }
    const gx = Math.max(0, b.x - (pocket.x + pocket.w), pocket.x - (b.x + b.w)), gy = Math.max(0, b.y - (pocket.y + pocket.h), pocket.y - (b.y + b.h));
    const sep = Math.hypot(gx, gy);
    const k = sep <= 0 ? 0 : Math.min(64, (2.35 * sep + 5) * ease2(sep / Math.max(4, pl.gap * 0.6)));
    out.k = k;
    out.body = b;
    out.pocket = pocket;
    out.path = u <= 5e-4 ? roundedPath(bar2, box.x, box.y) : loopsToPath(contour((px, py) => smin(sdBox(px, py, pocket), sdBox(px, py, b), k), box.x, box.y, box.w, box.h, cell), box.x, box.y);
    const pocketLen = pl.mode === "stack" ? pocket.h : pocket.w;
    out.keep = pl.mode === "stack" ? { stack: true, f: 1 - c } : { stack: false, s, opp: Math.max(0, Math.min(-pl.tNear0 - pocketLen, -pocketLen - nearT)), far: Math.max(0, Math.min(pl.tFar0 * (1 - c), farT)) };
    return out;
  }

  // dpi/js/bar-state.js
  var STATES = Object.freeze(["nav", "search", "notify", "to-search", "from-search", "to-notify", "from-notify"]);
  var SEARCH = /* @__PURE__ */ new Set(["search", "to-search", "from-search"]);
  var NOTIFY = /* @__PURE__ */ new Set(["notify", "to-notify", "from-notify"]);
  var isSearchState = (s) => SEARCH.has(s);
  var isNotifyState = (s) => NOTIFY.has(s);
  var data = /* @__PURE__ */ new WeakMap();
  var busy = /* @__PURE__ */ new Set();
  var idle = /* @__PURE__ */ new Set();
  var rec = (bar2) => {
    let d = data.get(bar2);
    if (!d) data.set(bar2, d = { s: "nav", want: null });
    return d;
  };
  var get2 = (bar2) => bar2 ? data.get(bar2)?.s ?? "nav" : "nav";
  function set2(bar2, s) {
    if (!bar2 || !STATES.includes(s)) return;
    const d = rec(bar2);
    if (d.s === s) return;
    const from = d.s;
    d.s = s;
    if (s === "nav") {
      busy.delete(bar2);
      bar2.removeAttribute("data-dpi-bar-state");
    } else {
      busy.add(bar2);
      bar2.setAttribute("data-dpi-bar-state", s);
    }
    try {
      emit(bar2, "bar-state", { from, to: s });
    } catch {
    }
    if (s === "nav") queueMicrotask(() => {
      for (const fn of [...idle]) fn(bar2);
    });
  }
  var wanted = (bar2) => data.get(bar2)?.want ?? null;
  function want(bar2, v) {
    rec(bar2).want = v;
  }
  function searchBusy() {
    for (const b of busy) {
      const d = data.get(b);
      if (d && (SEARCH.has(d.s) || d.want)) return true;
    }
    for (const b of pendingBars) if (data.get(b)?.want) return true;
    return false;
  }
  var pendingBars = /* @__PURE__ */ new Set();
  function trackPending(bar2, on) {
    if (on) pendingBars.add(bar2);
    else pendingBars.delete(bar2);
  }
  function canMorph(bar2, modal2 = false) {
    const d = data.get(bar2);
    if (!d) return true;
    if (SEARCH.has(d.s)) return false;
    if (d.want && !modal2) return false;
    return true;
  }
  var modal = false;
  var setModal = (v) => {
    modal = !!v;
  };
  var isModal = () => modal;
  var onIdle = (fn) => {
    idle.add(fn);
    return () => idle.delete(fn);
  };
  var notifyCloser = null;
  var setNotifyCloser = (fn) => {
    notifyCloser = fn;
  };
  var closeNotify = (bar2) => notifyCloser ? notifyCloser(bar2) : true;
  function state(bar2) {
    const b = bar2 ?? document.querySelector("[data-dpi-bottombar][data-dpi-bar-search]") ?? document.querySelector("[data-dpi-bottombar]");
    return get2(b);
  }

  // dpi/js/bar-notify.js
  var RECT_GLASS = engine === "webkit";
  var NS2 = "http://www.w3.org/2000/svg";
  var SPEED = 1 / 0.95;
  var ACCEL = 13;
  var EDGE = 5;
  var MARGIN = 36;
  var MIN_SIDE = 168;
  var reduced4 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var ease3 = (x) => {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  };
  var svg = (tag, attrs = {}) => {
    const n = document.createElementNS(NS2, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    return n;
  };
  var uid3 = 0;
  function usable(bar2, cfg = {}) {
    if (!bar2 || !bar2.isConnected || bar2.hidden || bar2.inert || bar2.closest("[hidden], [inert]")) return false;
    if (bar2.hasAttribute("data-dpi-hidden") || bar2.getAttribute("data-dpi-notify") === "off" || bar2.hasAttribute("data-dpi-inline")) return false;
    if (document.documentElement.getAttribute("data-dpi-notify-morph") === "off" || cfg.barMorph === false) return false;
    if (document.querySelector('.dpi-chatbot[data-dpi-state="open"], .dpi-chatbot[data-dpi-state="opening"]')) return false;
    try {
      if (document.querySelector("dialog[open]:modal")) return false;
    } catch {
    }
    const cs = getComputedStyle(bar2);
    if (cs.display === "none" || cs.visibility === "hidden" || Number(cs.opacity) < 0.5) return false;
    const r = bar2.getBoundingClientRect();
    if (r.width < 120 || r.height < 24) return false;
    const vw = document.documentElement.clientWidth, vh = globalThis.visualViewport?.height ?? innerHeight;
    const visible = Math.min(r.bottom, vh) - Math.max(r.top, 0);
    return visible >= r.height * 0.98 && r.left >= -1 && r.right <= vw + 1;
  }
  function pickBar(cfg = {}) {
    const c = cfg.bar;
    const list = c instanceof Element ? [c] : typeof c === "string" ? [...document.querySelectorAll(c)] : [...document.querySelectorAll("[data-dpi-bottombar]")];
    return list.find((b) => usable(b, cfg)) ?? null;
  }
  var S = null;
  var active = () => !!S;
  function listOf(bar2) {
    return bar2.querySelector(":scope > .dpi-bottombar__list");
  }
  function activeItem(bar2) {
    const items2 = [...bar2.querySelectorAll(":scope > .dpi-bottombar__list .dpi-bottombar__item")];
    const i = Number(bar2.getAttribute("data-dpi-index"));
    return Number.isFinite(i) && i >= 0 && items2[i] ? items2[i] : null;
  }
  function measure(st, slot, cfg) {
    const bar2 = st.bar;
    const br = bar2.getBoundingClientRect();
    const vw = document.documentElement.clientWidth, vh = globalThis.visualViewport?.height ?? innerHeight;
    const cs = getComputedStyle(bar2);
    const barRect = { x: 0, y: 0, w: br.width, h: br.height, r: Math.min(parseFloat(cs.borderTopLeftRadius) || 32, br.height / 2, br.width / 2) };
    const it = st.pocketItem ?? activeItem(bar2);
    let pocket = null;
    if (it) {
      const r = it.getBoundingClientRect();
      const l = listOf(bar2)?.getBoundingClientRect();
      const x0 = Math.max(r.left, l ? l.left : r.left) - br.left, x1 = Math.min(r.right, l ? l.right : r.right) - br.left;
      const px = Math.max(0, x0 - EDGE), pw = Math.min(br.width, x1 + EDGE) - px;
      pocket = { x: px, y: 0, w: Math.max(24, pw), h: br.height, r: Math.min(barRect.r, br.height / 2) };
    }
    const wantDown = br.top + br.height / 2 < vh / 2;
    const maxW = Math.max(120, Math.min(cfg.maxWidth ?? 420, vw - 24));
    slot.setAttribute("data-measure", "");
    slot.style.width = "max-content";
    slot.style.maxWidth = `${maxW}px`;
    const natural = Math.ceil(slot.getBoundingClientRect().width);
    slot.removeAttribute("data-measure");
    const gap = BAR_MORPH.gap;
    let mode = pocket ? "side" : "solo";
    let s = 1, Wt, Ht, x, y, grow;
    const heightAt = (w) => {
      slot.style.width = `${w}px`;
      slot.style.maxWidth = "";
      slot.style.height = "";
      return Math.ceil(slot.scrollHeight);
    };
    if (mode === "side") {
      const left = pocket.x - gap, right = br.width - (pocket.x + pocket.w) - gap;
      s = right >= left ? 1 : -1;
      const room = Math.min(maxW, s > 0 ? right : left);
      if (room < MIN_SIDE && Math.max(left, right) < MIN_SIDE) mode = "stack";
      else Wt = Math.max(Math.min(room, MIN_SIDE), Math.min(natural, room));
    }
    let need;
    if (mode === "side") {
      const wStack = Math.min(maxW, br.width), needSide = heightAt(Wt), needStack = heightAt(wStack);
      if (needSide - needStack >= 64) {
        mode = "stack";
        Wt = wStack;
        need = needStack;
      } else need = needSide;
    }
    if (mode === "stack" && need === void 0) Wt = Math.min(maxW, br.width);
    if (mode === "solo") Wt = Math.min(maxW, Math.max(natural, Math.min(br.width, MIN_SIDE)), br.width);
    if (need === void 0) need = heightAt(Wt);
    else heightAt(Wt);
    const dn = (extra) => vh - br.bottom - 12 - extra, up = (extra) => br.top - 12 - extra;
    if (mode === "side" || mode === "solo") {
      const availDown = vh - br.top - 12, availUp = br.bottom - 12;
      grow = wantDown ? need <= availDown || availDown >= availUp ? 1 : -1 : need <= availUp || availUp >= availDown ? -1 : 1;
      const limit = grow > 0 ? availDown : availUp;
      Ht = Math.max(br.height, Math.min(need, limit));
      y = grow > 0 ? 0 : br.height - Ht;
      x = mode === "side" ? s > 0 ? pocket.x + pocket.w + gap : pocket.x - gap - Wt : (br.width - Wt) / 2;
    } else {
      const availD = dn(gap), availU = up(gap);
      grow = wantDown ? need <= availD || availD >= availU ? 1 : -1 : need <= availU || availU >= availD ? -1 : 1;
      Ht = Math.max(48, Math.min(need, grow > 0 ? availD : availU));
      x = (br.width - Wt) / 2;
      y = grow > 0 ? br.height + gap : -gap - Ht;
    }
    slot.style.width = `${Wt}px`;
    const scrolls = need > Ht + 1;
    slot.style.height = `${Ht}px`;
    slot.toggleAttribute("data-scrolls", scrolls);
    const body = { x, y, w: Wt, h: Ht, r: Math.min(cfg.radius ?? 26, Ht / 2) };
    return { bar: barRect, pocket, body, grow, mode, radius: body.r, origin: { x: br.left, y: br.top }, scrolls };
  }
  function boxOf(rects, clampTo = null) {
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const r of rects) {
      if (!r) continue;
      x0 = Math.min(x0, r.x);
      y0 = Math.min(y0, r.y);
      x1 = Math.max(x1, r.x + r.w);
      y1 = Math.max(y1, r.y + r.h);
    }
    let bx0 = x0 - MARGIN, by0 = y0 - MARGIN, bx1 = x1 + MARGIN, by1 = y1 + MARGIN;
    if (clampTo) {
      bx0 = Math.min(Math.max(bx0, clampTo.x0), x0 - 3);
      by0 = Math.min(Math.max(by0, clampTo.y0), y0 - 3);
      bx1 = Math.max(Math.min(bx1, clampTo.x1), x1 + 3);
      by1 = Math.max(Math.min(by1, clampTo.y1), y1 + 3);
    }
    return { x: Math.floor(bx0), y: Math.floor(by0), w: Math.ceil(bx1 - bx0), h: Math.ceil(by1 - by0) };
  }
  function buildMass(st) {
    const id = `dpi-bbn-${++uid3}`;
    const layer = document.createElement("span");
    layer.className = "dpi-bbn";
    layer.setAttribute("aria-hidden", "true");
    const glass = document.createElement("span");
    glass.className = "dpi-bbn__glass";
    const mk4 = () => svg("svg", { class: "dpi-bbn__svg", focusable: "false", "aria-hidden": "true" });
    const sh = mk4(), sv = mk4();
    const defs = svg("defs");
    const grad = svg("radialGradient", { id: `${id}-g`, gradientUnits: "userSpaceOnUse", cx: "0", cy: "0", r: "1" });
    grad.append(svg("stop", { offset: "0", "stop-color": "var(--dpi-menu-hi)" }), svg("stop", { offset: "0.58", "stop-color": "var(--dpi-menu-bg)" }), svg("stop", { offset: "1", "stop-color": "var(--dpi-menu-lo)" }));
    const filt = svg("filter", { id: `${id}-s`, filterUnits: "userSpaceOnUse", x: "0", y: "0", width: "1", height: "1", "color-interpolation-filters": "sRGB" });
    filt.append(svg("feGaussianBlur", { in: "SourceAlpha", stdDeviation: "13", result: "b" }), svg("feOffset", { in: "b", dy: "8", result: "o" }), svg("feComposite", { in: "o", in2: "SourceAlpha", operator: "out" }));
    defs.append(grad, filt);
    const shadow = svg("path", { class: "dpi-bbn__shadow", filter: `url(#${id}-s)` });
    sh.append(defs, shadow);
    const fill2 = svg("path", { class: "dpi-bbn__fill", fill: `url(#${id}-g)` });
    const rim = svg("path", { class: "dpi-bbn__rim" });
    sv.append(fill2, rim);
    const glassP = RECT_GLASS ? document.createElement("span") : null;
    if (glassP) glassP.className = "dpi-bbn__glass";
    layer.append(sh, glass, ...glassP ? [glassP] : [], sv);
    st.bar.prepend(layer);
    return { layer, glass, glassP, sv, sh, grad, shadow, fill: fill2, rim, filt };
  }
  function paint(st) {
    const { m, pl, box, u } = st;
    const bar2 = st.bar;
    const fr = frame2(pl, u, box, { cell: st.cell, blend: st.blend });
    st.curBody = fr.body;
    st.curPocket = fr.pocket;
    st.fr = fr;
    const o = st.originLocal;
    m.layer.style.left = `${box.x - o.x}px`;
    m.layer.style.top = `${box.y - o.y}px`;
    m.layer.style.width = `${box.w}px`;
    m.layer.style.height = `${box.h}px`;
    m.sv.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`);
    m.sh.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`);
    m.filt.setAttribute("width", box.w);
    m.filt.setAttribute("height", box.h);
    m.fill.setAttribute("d", fr.path);
    m.shadow.setAttribute("d", fr.path);
    m.rim.setAttribute("d", fr.path);
    const b = st.target1 ?? st.body;
    m.grad.setAttribute("gradientTransform", `translate(${b.x + b.w / 2 - box.x} ${b.y + b.h * 0.3 - box.y}) scale(${Math.max(40, b.w * 1.3)} ${Math.max(40, b.h * 1.5)})`);
    m.layer.style.setProperty("--bbn-m", fr.mat.toFixed(3));
    m.layer.style.clipPath = "";
    if (RECT_GLASS) {
      const place5 = (el6, r) => {
        if (!r) {
          el6.style.display = "none";
          return;
        }
        el6.style.display = "";
        el6.style.inset = "auto";
        el6.style.left = `${r.x - box.x}px`;
        el6.style.top = `${r.y - box.y}px`;
        el6.style.width = `${r.w}px`;
        el6.style.height = `${r.h}px`;
        el6.style.borderRadius = `${Math.min(r.r ?? 0, r.w / 2, r.h / 2)}px`;
      };
      place5(m.glass, fr.body);
      place5(m.glassP, fr.pocket);
    } else m.glass.style.clipPath = `path('${fr.path}')`;
    const w = st.wrap;
    const tb = st.target1 ?? st.body;
    const B = fr.body, slack = Math.min(tb.x + 14 - B.x, tb.y + 14 - B.y, B.x + B.w - (tb.x + tb.w - 14), B.y + B.h - (tb.y + tb.h - 14));
    const room = ease3((slack + 1) / 12);
    w.style.left = `${st.origin.x + box.x}px`;
    w.style.top = `${st.origin.y + box.y}px`;
    w.style.width = `${box.w}px`;
    w.style.height = `${box.h}px`;
    w.style.clipPath = `path('${fr.path}')`;
    for (const sl of w.children) {
      const k = sl === st.slot ? 1 : 0;
      sl.style.opacity = String(k ? st.newFade * fr.reveal * room : st.oldFade * fr.reveal);
      sl.style.visibility = Number(sl.style.opacity) < 0.01 ? "hidden" : "";
    }
    const list = listOf(bar2);
    if (list && st.listLocal) {
      const L = st.listLocal, k = fr.keep;
      const pk = fr.pocket;
      let x0, x1;
      if (!pk || k.solo) {
        const half = bar2.getBoundingClientRect().width * k.f / 2, c = L.x + L.w / 2;
        x0 = c - half;
        x1 = c + half;
      } else if (k.stack) {
        x0 = pk.x - k.f * (pk.x - L.x);
        x1 = pk.x + pk.w + k.f * (L.x + L.w - pk.x - pk.w);
      } else if (k.s > 0) {
        x0 = pk.x - k.opp;
        x1 = pk.x + pk.w + k.far;
      } else {
        x0 = pk.x - k.far;
        x1 = pk.x + pk.w + k.opp;
      }
      const full = u <= 5e-4;
      list.style.clipPath = full ? "" : `inset(0 ${Math.max(0, L.x + L.w - x1)}px 0 ${Math.max(0, x0 - L.x)}px)`;
      list.style.visibility = !full && x1 - x0 < 1 ? "hidden" : "";
      const lens = st.lens, LL = st.lensLocal;
      if (lens && LL) {
        const lx0 = pk && pk.x >= LL.x ? x0 + Math.max(0, LL.x + LL.w - pk.x) * Math.max(0, Math.min(1, x0 / Math.max(1, pk.x))) : x0;
        lens.style.clipPath = full ? "" : `inset(0 ${Math.max(0, LL.x + LL.w - x1).toFixed(2)}px 0 ${Math.max(0, lx0 - LL.x).toFixed(2)}px)`;
        lens.style.visibility = !full && (x1 <= LL.x + 0.5 || lx0 >= LL.x + LL.w - 0.5) ? "hidden" : "";
      }
    }
    setInert(st, u > 0.04);
    st.wrap.style.visibility = "";
  }
  function setInert(st, on) {
    if (st.inertOn === on) return;
    st.inertOn = on;
    const act = st.pocketItem ?? activeItem(st.bar);
    for (const li of st.bar.querySelectorAll(":scope > .dpi-bottombar__list > li")) {
      li.inert = on && !(act && li.contains(act));
    }
    if (st.lens) st.lens.inert = on;
  }
  function relayout(st, { keepFrom = false } = {}) {
    const slot = st.slot;
    const was = st.u;
    const M3 = measure(st, slot, st.cfg);
    st.origin = M3.origin;
    const bar2 = st.bar;
    const br = bar2.getBoundingClientRect();
    st.target1 = M3.body;
    st.pocketRect = M3.pocket;
    st.barRect = M3.bar;
    st.mode = M3.mode;
    st.grow = M3.grow;
    const from = keepFrom ? st.curBody ?? M3.body : M3.body;
    st.bodyFrom = from;
    st.bodyTo = M3.body;
    st.s = keepFrom ? 0 : 1;
    const pFrom = keepFrom && st.curPocket ? st.curPocket : M3.pocket;
    st.pocketFrom = pFrom;
    st.pocketTo = M3.pocket;
    const vwid = document.documentElement.clientWidth, vhei = globalThis.visualViewport?.height ?? innerHeight;
    st.box = boxOf([M3.bar, from, M3.body, pFrom, M3.pocket], { x0: -br.left, y0: -br.top, x1: vwid - br.left, y1: vhei - br.top });
    const lr = listOf(bar2)?.getBoundingClientRect();
    st.listLocal = lr ? { x: lr.left - br.left, y: lr.top - br.top, w: lr.width, h: lr.height } : null;
    st.lens = bar2.querySelector(":scope > .dpi-bottombar__search");
    const lnr = st.lens?.getBoundingClientRect();
    st.lensLocal = lnr ? { x: lnr.left - br.left, y: lnr.top - br.top, w: lnr.width, h: lnr.height } : null;
    st.originLocal = { x: bar2.clientLeft, y: bar2.clientTop };
    st.cell = Math.max(2.5, Math.min(5, Math.sqrt(st.box.w * st.box.h / 24e3)));
    st.slot.style.left = `${st.target1.x - st.box.x}px`;
    st.slot.style.top = `${st.target1.y - st.box.y}px`;
    buildPlan(st);
    void was;
  }
  function buildPlan(st) {
    st.pl = plan({ bar: st.barRect, pocket: st.pocketTo, body: st.bodyTo, grow: st.grow, mode: st.mode, radius: st.target1.r });
    st.blend = st.s < 1 ? { body: st.bodyFrom, pocket: st.pocketFrom, t: ease3(st.s), tp: 1 - (1 - st.s) ** 3 } : null;
  }
  function tick2(now) {
    const st = S;
    if (!st) return;
    st.raf = 0;
    let dt = Math.min(0.05, Math.max(0, (now - st.last) / 1e3));
    st.last = now;
    while (dt > 1e-6) {
      const step = Math.min(dt, 1 / 240);
      const wanted2 = Math.sign(st.target - st.u) * SPEED;
      const a = Math.max(-ACCEL * step, Math.min(ACCEL * step, wanted2 - st.v));
      st.v += a;
      const next = st.u + st.v * step;
      if ((st.target - st.u) * (st.target - next) <= 0) {
        st.u = st.target;
        st.v = 0;
        break;
      }
      st.u = Math.max(0, Math.min(1, next));
      if (next < 0 || next > 1) st.v = 0;
      dt -= step;
    }
    if (st.s < 1) {
      st.s = Math.min(1, st.s + (now - (st.sLast ?? now)) / 1e3 / 0.5);
      st.sLast = now;
      st.oldFade = 1 - ease3(st.s / 0.45);
      st.newFade = ease3((st.s - 0.35) / 0.65);
      buildPlan(st);
      if (st.s >= 1) {
        endHandover(st);
      }
    } else st.sLast = now;
    paint(st);
    const settled = st.u === st.target && st.v === 0 && st.s >= 1;
    if (!settled) st.raf = requestAnimationFrame(tick2);
    else if (st.target === 1) opened(st);
    else closed(st);
  }
  function kick(st) {
    if (reduced4()) {
      cancelAnimationFrame(st.raf);
      st.raf = 0;
      st.u = st.target;
      st.v = 0;
      if (st.s < 1) {
        st.s = 1;
        st.oldFade = 0;
        st.newFade = 1;
        buildPlan(st);
        endHandover(st);
      }
      paint(st);
      if (st.target === 1) opened(st);
      else closed(st);
    } else if (!st.raf) {
      st.last = performance.now();
      st.sLast = st.last;
      st.raf = requestAnimationFrame(tick2);
    }
  }
  function endHandover(st) {
    for (const sl of [...st.wrap.children]) if (sl !== st.slot) {
      st.hooks.dropContent?.(sl);
      sl.remove();
    }
    st.oldFade = 0;
    st.newFade = 1;
    st.curPocket = st.pocketTo;
  }
  function opened(st) {
    if (st.openedFired) return;
    st.openedFired = true;
    set2(st.bar, "notify");
    st.layer?.setAttribute("data-open", "");
    st.hooks.opened?.();
  }
  function closed(st) {
    if (S !== st) return;
    teardown2(st);
    st.hooks.closed?.();
  }
  function teardown2(st) {
    cancelAnimationFrame(st.raf);
    st.ac.abort();
    st.mo.disconnect();
    st.ro.disconnect();
    st.posRo?.disconnect();
    st.bar.removeAttribute("data-dpi-bbn");
    st.m.layer.remove();
    const list = listOf(st.bar);
    if (list) {
      list.style.clipPath = "";
      list.style.visibility = "";
    }
    if (st.lens) {
      st.lens.style.clipPath = "";
      st.lens.style.visibility = "";
    }
    st.inertOn = true;
    setInert(st, false);
    st.wrap.remove();
    if (S === st) S = null;
    set2(st.bar, "nav");
  }
  function open2(bar2, { content: content2, root: root4, cfg = {}, hooks = {} }) {
    if (S && S.bar !== bar2) teardown2(S);
    const slot = document.createElement("div");
    slot.className = "dpi-bbn-slot";
    slot.append(content2);
    if (S && S.bar === bar2) {
      const st2 = S;
      const wasClosing = st2.target === 0;
      st2.hooks = hooks;
      st2.cfg = cfg;
      st2.openedFired = false;
      st2.wrap.append(slot);
      hooks.mounted?.();
      for (const sl of st2.wrap.children) if (sl !== slot) sl.style.pointerEvents = "none";
      st2.slot = slot;
      slot.style.opacity = "0";
      st2.target = 1;
      set2(bar2, "to-notify");
      relayout(st2, { keepFrom: true });
      st2.oldFade = 1;
      st2.newFade = 0;
      st2.s = 0;
      void wasClosing;
      kick(st2);
      return st2;
    }
    const st = { bar: bar2, cfg, hooks, slot, u: 0, v: 0, target: 1, s: 1, oldFade: 0, newFade: 1, ac: new AbortController(), openedFired: false, inertOn: false };
    st.wrap = document.createElement("div");
    st.wrap.className = "dpi-bbn-wrap";
    st.wrap.style.visibility = "hidden";
    st.wrap.append(slot);
    root4.append(st.wrap);
    hooks.mounted?.();
    st.pocketItem = activeItem(bar2);
    relayout(st);
    st.m = buildMass(st);
    bar2.setAttribute("data-dpi-bbn", reduced4() ? "reduced" : "");
    S = st;
    set2(bar2, "to-notify");
    st.slot.style.opacity = "0";
    const { signal } = st.ac;
    const redo = () => {
      if (S !== st) return;
      relayout(st, { keepFrom: true });
      st.s = 1;
      buildPlan(st);
      paint(st);
    };
    const gone = () => !bar2.isConnected || bar2.hidden || bar2.closest("[hidden]") || getComputedStyle(bar2).display === "none" || !bar2.getBoundingClientRect().width;
    const check = () => {
      if (S === st && gone()) {
        st.hooks.lost?.();
        return true;
      }
      return false;
    };
    st.ro = new ResizeObserver(() => {
      if (!check()) redo();
    });
    st.ro.observe(bar2);
    const sync8 = () => {
      const br = bar2.getBoundingClientRect();
      st.origin = { x: br.left, y: br.top };
      st.wrap.style.left = `${br.left + st.box.x}px`;
      st.wrap.style.top = `${br.top + st.box.y}px`;
    };
    addEventListener("scroll", sync8, { passive: true, signal, capture: true });
    if (bar2.parentElement) {
      st.posRo = new ResizeObserver(() => {
        if (S === st) sync8();
      });
      for (const n of [bar2.parentElement, ...bar2.parentElement.children]) if (n !== bar2) st.posRo.observe(n);
    }
    addEventListener("resize", redo, { signal });
    globalThis.visualViewport?.addEventListener("resize", redo, { signal });
    document.addEventListener("dpi:chatbot-open", () => {
      if (S === st) st.hooks.lost?.();
    }, { signal });
    st.mo = new MutationObserver(() => {
      if (S !== st || check()) return;
      const next = activeItem(bar2);
      if (!next || next === st.pocketItem) return;
      st.hooks.routeChanged?.();
      const oldPocket = st.curPocket;
      st.pocketItem = next;
      const prev = st.u;
      st.inertOn = !st.inertOn;
      setInert(st, !st.inertOn);
      relayout(st, { keepFrom: true });
      if (oldPocket) st.pocketFrom = oldPocket;
      st.oldFade = 0;
      st.newFade = 1;
      st.s = 0;
      st.sLast = void 0;
      buildPlan(st);
      void prev;
      kick(st);
    });
    st.mo.observe(bar2, { attributes: true, attributeFilter: ["data-dpi-index", "hidden", "data-dpi-hidden"] });
    addEventListener("pagehide", () => {
      if (S === st) teardown2(st);
    }, { signal });
    paint(st);
    kick(st);
    return st;
  }
  function close() {
    const st = S;
    if (!st || st.target === 0) return;
    st.target = 0;
    st.openedFired = true;
    set2(st.bar, "from-notify");
    kick(st);
  }
  function abort() {
    const st = S;
    if (!st) return;
    teardown2(st);
  }
  function stateOf2() {
    return S ? { u: S.u, target: S.target, mode: S.mode, grow: S.grow, side: S.pl?.s } : null;
  }

  // dpi/js/enhance.js
  var enhance_exports = {};
  __export(enhance_exports, {
    apply: () => apply,
    icon: () => icon
  });

  // dpi/js/icons.js
  var icons = { "activity": [["path", { "d": "M22 12h-2.48a2 2 0 0 0-1.93 1.46l-2.35 8.36a.25.25 0 0 1-.48 0L9.24 2.18a.25.25 0 0 0-.48 0l-2.35 8.36A2 2 0 0 1 4.49 12H2" }]], "alarm-clock": [["circle", { "cx": "12", "cy": "13", "r": "8" }], ["path", { "d": "M12 9v4l2 2" }], ["path", { "d": "M5 3 2 6" }], ["path", { "d": "m22 6-3-3" }], ["path", { "d": "M6.38 18.7 4 21" }], ["path", { "d": "M17.64 18.67 20 21" }]], "align-center": [["path", { "d": "M17 12H7" }], ["path", { "d": "M19 18H5" }], ["path", { "d": "M21 6H3" }]], "align-left": [["path", { "d": "M15 12H3" }], ["path", { "d": "M17 18H3" }], ["path", { "d": "M21 6H3" }]], "align-right": [["path", { "d": "M21 12H9" }], ["path", { "d": "M21 18H7" }], ["path", { "d": "M21 6H3" }]], "angry": [["path", { "d": "M15 12v-1.584" }], ["path", { "d": "M17 10a5 5 0 00-3 1" }], ["path", { "d": "M7 10a5 5 0 013 1" }], ["path", { "d": "M9 12v-1.584" }], ["path", { "d": "M9 17a5 5 0 016.001 0" }], ["circle", { "cx": "12", "cy": "12", "r": "10" }]], "archive": [["rect", { "x": "2", "y": "3", "width": "20", "height": "5", "rx": "1" }], ["path", { "d": "M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" }], ["path", { "d": "M10 12h4" }]], "arrow-down": [["path", { "d": "M12 5v14" }], ["path", { "d": "m19 12-7 7-7-7" }]], "arrow-down-to-line": [["path", { "d": "M12 17V3" }], ["path", { "d": "m6 11 6 6 6-6" }], ["path", { "d": "M19 21H5" }]], "arrow-down-up": [["path", { "d": "m3 16 4 4 4-4" }], ["path", { "d": "M7 20V4" }], ["path", { "d": "m21 8-4-4-4 4" }], ["path", { "d": "M17 4v16" }]], "arrow-left": [["path", { "d": "m12 19-7-7 7-7" }], ["path", { "d": "M19 12H5" }]], "arrow-right": [["path", { "d": "M5 12h14" }], ["path", { "d": "m12 5 7 7-7 7" }]], "arrow-up": [["path", { "d": "m5 12 7-7 7 7" }], ["path", { "d": "M12 19V5" }]], "arrow-up-down": [["path", { "d": "m21 16-4 4-4-4" }], ["path", { "d": "M17 20V4" }], ["path", { "d": "m3 8 4-4 4 4" }], ["path", { "d": "M7 4v16" }]], "at-sign": [["circle", { "cx": "12", "cy": "12", "r": "4" }], ["path", { "d": "M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" }]], "ban": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "m4.9 4.9 14.2 14.2" }]], "bell": [["path", { "d": "M10.268 21a2 2 0 0 0 3.464 0" }], ["path", { "d": "M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" }]], "bell-off": [["path", { "d": "M10.268 21a2 2 0 0 0 3.464 0" }], ["path", { "d": "M17 17H4a1 1 0 0 1-.74-1.673C4.59 13.956 6 12.499 6 8a6 6 0 0 1 .258-1.742" }], ["path", { "d": "m2 2 20 20" }], ["path", { "d": "M8.668 3.01A6 6 0 0 1 18 8c0 2.687.77 4.653 1.707 6.05" }]], "bold": [["path", { "d": "M6 12h9a4 4 0 0 1 0 8H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h7a4 4 0 0 1 0 8" }]], "bookmark": [["path", { "d": "M17 3a2 2 0 0 1 2 2v15a1 1 0 0 1-1.496.868l-4.512-2.578a2 2 0 0 0-1.984 0l-4.512 2.578A1 1 0 0 1 5 20V5a2 2 0 0 1 2-2z" }]], "bot": [["path", { "d": "M12 8V4H8" }], ["rect", { "x": "4", "y": "8", "width": "16", "height": "12", "rx": "2" }], ["path", { "d": "M2 14h2" }], ["path", { "d": "M20 14h2" }], ["path", { "d": "M15 13v2" }], ["path", { "d": "M9 13v2" }]], "brain": [["path", { "d": "M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" }], ["path", { "d": "M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" }], ["path", { "d": "M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" }], ["path", { "d": "M17.599 6.5a3 3 0 0 0 .399-1.375" }], ["path", { "d": "M6.003 5.125A3 3 0 0 0 6.401 6.5" }], ["path", { "d": "M3.477 10.896a4 4 0 0 1 .585-.396" }], ["path", { "d": "M19.938 10.5a4 4 0 0 1 .585.396" }], ["path", { "d": "M6 18a4 4 0 0 1-1.967-.516" }], ["path", { "d": "M19.967 17.484A4 4 0 0 1 18 18" }]], "building-2": [["path", { "d": "M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" }], ["path", { "d": "M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2" }], ["path", { "d": "M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2" }], ["path", { "d": "M10 6h4" }], ["path", { "d": "M10 10h4" }], ["path", { "d": "M10 14h4" }], ["path", { "d": "M10 18h4" }]], "calendar": [["path", { "d": "M8 2v3" }], ["path", { "d": "M16 2v3" }], ["rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2" }], ["path", { "d": "M3 9h18" }]], "calendar-clock": [["path", { "d": "M21 7.5V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h3.5" }], ["path", { "d": "M16 2v4" }], ["path", { "d": "M8 2v4" }], ["path", { "d": "M3 10h5" }], ["path", { "d": "M17.5 17.5 16 16.3V14" }], ["circle", { "cx": "16", "cy": "16", "r": "6" }]], "calendar-days": [["path", { "d": "M8 2v4" }], ["path", { "d": "M16 2v4" }], ["rect", { "x": "3", "y": "4", "width": "18", "height": "18", "rx": "2" }], ["path", { "d": "M3 10h18" }], ["path", { "d": "M8 14h.01" }], ["path", { "d": "M12 14h.01" }], ["path", { "d": "M16 14h.01" }], ["path", { "d": "M8 18h.01" }], ["path", { "d": "M12 18h.01" }], ["path", { "d": "M16 18h.01" }]], "calendar-plus": [["path", { "d": "M16 18h6" }], ["path", { "d": "M16 2v3" }], ["path", { "d": "M19 15v6" }], ["path", { "d": "M21 11.5V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h8.3" }], ["path", { "d": "M3 9h18" }], ["path", { "d": "M8 2v3" }]], "camera": [["path", { "d": "M13.997 4a2 2 0 0 1 1.76 1.05l.486.9A2 2 0 0 0 18.003 7H20a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1.997a2 2 0 0 0 1.759-1.048l.489-.904A2 2 0 0 1 10.004 4z" }], ["circle", { "cx": "12", "cy": "13", "r": "3" }]], "check": [["path", { "d": "M20 6 9 17l-5-5" }]], "check-check": [["path", { "d": "M18 6 7 17l-5-5" }], ["path", { "d": "m22 10-7.5 7.5L13 16" }]], "chevron-down": [["path", { "d": "m6 9 6 6 6-6" }]], "chevron-left": [["path", { "d": "m15 18-6-6 6-6" }]], "chevron-right": [["path", { "d": "m9 18 6-6-6-6" }]], "chevron-up": [["path", { "d": "m18 15-6-6-6 6" }]], "chevrons-left": [["path", { "d": "m11 17-5-5 5-5" }], ["path", { "d": "m18 17-5-5 5-5" }]], "chevrons-right": [["path", { "d": "m6 17 5-5-5-5" }], ["path", { "d": "m13 17 5-5-5-5" }]], "circle": [["circle", { "cx": "12", "cy": "12", "r": "10" }]], "circle-alert": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["line", { "x1": "12", "x2": "12", "y1": "8", "y2": "12" }], ["line", { "x1": "12", "x2": "12.01", "y1": "16", "y2": "16" }]], "circle-check": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "m16 9-5.5 5.5L8 12" }]], "circle-dashed": [["path", { "d": "M10.1 2.182a10 10 0 0 1 3.8 0" }], ["path", { "d": "M13.9 21.818a10 10 0 0 1-3.8 0" }], ["path", { "d": "M17.609 3.721a10 10 0 0 1 2.69 2.7" }], ["path", { "d": "M2.182 13.9a10 10 0 0 1 0-3.8" }], ["path", { "d": "M20.279 17.609a10 10 0 0 1-2.7 2.69" }], ["path", { "d": "M21.818 10.1a10 10 0 0 1 0 3.8" }], ["path", { "d": "M3.721 6.391a10 10 0 0 1 2.7-2.69" }], ["path", { "d": "M6.391 20.279a10 10 0 0 1-2.69-2.7" }]], "circle-plus": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "M8 12h8" }], ["path", { "d": "M12 8v8" }]], "circle-question-mark": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "M9 9.5a3 2.5 0 016 0c0 2-2 2-3 3.5" }], ["path", { "d": "M12 17h.01" }]], "circle-x": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "m15 9-6 6" }], ["path", { "d": "m9 9 6 6" }]], "clipboard-list": [["rect", { "x": "8", "y": "2", "width": "8", "height": "4", "rx": "1", "ry": "1" }], ["path", { "d": "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" }], ["path", { "d": "M12 11h4" }], ["path", { "d": "M12 16h4" }], ["path", { "d": "M8 11h.01" }], ["path", { "d": "M8 16h.01" }]], "clock": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "M12 6v6l4 2" }]], "cloud-upload": [["path", { "d": "M12 13v8" }], ["path", { "d": "M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242" }], ["path", { "d": "m8 17 4-4 4 4" }]], "coffee": [["path", { "d": "M10 2v2" }], ["path", { "d": "M14 2v2" }], ["path", { "d": "M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" }], ["path", { "d": "M6 2v2" }]], "cog": [["path", { "d": "M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" }], ["path", { "d": "M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z" }], ["path", { "d": "M12 2v2" }], ["path", { "d": "M12 22v-2" }], ["path", { "d": "m17 20.66-1-1.73" }], ["path", { "d": "M11 10.27 7 3.34" }], ["path", { "d": "m20.66 17-1.73-1" }], ["path", { "d": "m3.34 7 1.73 1" }], ["path", { "d": "M14 12h8" }], ["path", { "d": "M2 12h2" }], ["path", { "d": "m20.66 7-1.73 1" }], ["path", { "d": "m3.34 17 1.73-1" }], ["path", { "d": "m17 3.34-1 1.73" }], ["path", { "d": "m11 13.73-4 6.93" }]], "copy": [["rect", { "width": "14", "height": "14", "x": "8", "y": "8", "rx": "2", "ry": "2" }], ["path", { "d": "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" }]], "cpu": [["rect", { "x": "4", "y": "4", "width": "16", "height": "16", "rx": "2" }], ["rect", { "x": "9", "y": "9", "width": "6", "height": "6", "rx": "1" }], ["path", { "d": "M15 2v2" }], ["path", { "d": "M15 20v2" }], ["path", { "d": "M2 15h2" }], ["path", { "d": "M2 9h2" }], ["path", { "d": "M20 15h2" }], ["path", { "d": "M20 9h2" }], ["path", { "d": "M9 2v2" }], ["path", { "d": "M9 20v2" }]], "download": [["path", { "d": "M12 15V3" }], ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }], ["path", { "d": "m7 10 5 5 5-5" }]], "droplet": [["path", { "d": "M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" }]], "ellipsis": [["circle", { "cx": "12", "cy": "12", "r": "1" }], ["circle", { "cx": "19", "cy": "12", "r": "1" }], ["circle", { "cx": "5", "cy": "12", "r": "1" }]], "eraser": [["path", { "d": "m7 21-4.3-4.3c-1-1-1-2.5 0-3.4l9.6-9.6c1-1 2.5-1 3.4 0l5.6 5.6c1 1 1 2.5 0 3.4L13 21" }], ["path", { "d": "M22 21H7" }], ["path", { "d": "m5 11 9 9" }]], "external-link": [["path", { "d": "M15 3h6v6" }], ["path", { "d": "M10 14 21 3" }], ["path", { "d": "M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" }]], "eye": [["path", { "d": "M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" }], ["circle", { "cx": "12", "cy": "12", "r": "3" }]], "eye-off": [["path", { "d": "M10.733 5.076a10.744 10.744 0 0 1 11.205 6.575 1 1 0 0 1 0 .696 10.747 10.747 0 0 1-1.444 2.49" }], ["path", { "d": "M14.084 14.158a3 3 0 0 1-4.242-4.242" }], ["path", { "d": "M17.479 17.499a10.75 10.75 0 0 1-15.417-5.151 1 1 0 0 1 0-.696 10.75 10.75 0 0 1 4.446-5.143" }], ["path", { "d": "m2 2 20 20" }]], "file": [["path", { "d": "M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z" }], ["path", { "d": "M14 2v5a1 1 0 0 0 1 1h5" }]], "file-archive": [["path", { "d": "M10 12v-1" }], ["path", { "d": "M10 18v-2" }], ["path", { "d": "M10 7V6" }], ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { "d": "M15.5 22H18a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v16a2 2 0 0 0 .274 1.01" }], ["circle", { "cx": "10", "cy": "20", "r": "2" }]], "file-audio": [["path", { "d": "M17.5 22h.5a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v3" }], ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { "d": "M2 19a2 2 0 1 1 4 0v1a2 2 0 1 1-4 0v-4a6 6 0 0 1 12 0v4a2 2 0 1 1-4 0v-1a2 2 0 1 1 4 0" }]], "file-check-2": [["path", { "d": "M4 22h14a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v4" }], ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { "d": "m3 15 2 2 4-4" }]], "file-json": [["path", { "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }], ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { "d": "M10 12a1 1 0 0 0-1 1v1a1 1 0 0 1-1 1 1 1 0 0 1 1 1v1a1 1 0 0 0 1 1" }], ["path", { "d": "M14 18a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1 1 1 0 0 1-1-1v-1a1 1 0 0 0-1-1" }]], "file-text": [["path", { "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }], ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { "d": "M10 9H8" }], ["path", { "d": "M16 13H8" }], ["path", { "d": "M16 17H8" }]], "file-type": [["path", { "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }], ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { "d": "M9 13v-1h6v1" }], ["path", { "d": "M12 12v6" }], ["path", { "d": "M11 18h2" }]], "file-up": [["path", { "d": "M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" }], ["path", { "d": "M14 2v4a2 2 0 0 0 2 2h4" }], ["path", { "d": "M12 12v6" }], ["path", { "d": "m15 15-3-3-3 3" }]], "film": [["rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2" }], ["path", { "d": "M7 3v18" }], ["path", { "d": "M3 7.5h4" }], ["path", { "d": "M3 12h18" }], ["path", { "d": "M3 16.5h4" }], ["path", { "d": "M17 3v18" }], ["path", { "d": "M17 7.5h4" }], ["path", { "d": "M17 16.5h4" }]], "flag": [["path", { "d": "M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" }], ["line", { "x1": "4", "y1": "22", "x2": "4", "y2": "15" }]], "flame": [["path", { "d": "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" }]], "folder": [["path", { "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" }]], "folder-kanban": [["path", { "d": "M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2Z" }], ["path", { "d": "M8 10v4" }], ["path", { "d": "M12 10v2" }], ["path", { "d": "M16 10v6" }]], "folder-open": [["path", { "d": "m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" }]], "folder-plus": [["path", { "d": "M12 10v6" }], ["path", { "d": "M9 13h6" }], ["path", { "d": "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2Z" }]], "forward": [["polyline", { "points": "15 17 20 12 15 7" }], ["path", { "d": "M4 18v-2a4 4 0 0 1 4-4h12" }]], "frown": [["path", { "d": "M15 10V9" }], ["path", { "d": "M9 10V9" }], ["path", { "d": "M9 16a5 5 0 016 0" }], ["circle", { "cx": "12", "cy": "12", "r": "10" }]], "git-branch": [["line", { "x1": "6", "y1": "3", "x2": "6", "y2": "15" }], ["circle", { "cx": "18", "cy": "6", "r": "3" }], ["circle", { "cx": "6", "cy": "18", "r": "3" }], ["path", { "d": "M18 9a9 9 0 0 1-9 9" }]], "git-commit-horizontal": [["circle", { "cx": "12", "cy": "12", "r": "3" }], ["line", { "x1": "3", "y1": "12", "x2": "9", "y2": "12" }], ["line", { "x1": "15", "y1": "12", "x2": "21", "y2": "12" }]], "git-compare": [["circle", { "cx": "18", "cy": "18", "r": "3" }], ["circle", { "cx": "6", "cy": "6", "r": "3" }], ["path", { "d": "M13 6h3a2 2 0 0 1 2 2v7" }], ["path", { "d": "M11 18H8a2 2 0 0 1-2-2V9" }]], "glasses": [["circle", { "cx": "6", "cy": "15", "r": "4" }], ["circle", { "cx": "18", "cy": "15", "r": "4" }], ["path", { "d": "M14 15a2 2 0 0 0-2-2 2 2 0 0 0-2 2" }], ["path", { "d": "M2.5 13 5 7c.7-1.3 1.4-2 3-2" }], ["path", { "d": "M21.5 13 19 7c-.7-1.3-1.5-2-3-2" }]], "grip-vertical": [["circle", { "cx": "9", "cy": "12", "r": "1" }], ["circle", { "cx": "9", "cy": "5", "r": "1" }], ["circle", { "cx": "9", "cy": "19", "r": "1" }], ["circle", { "cx": "15", "cy": "12", "r": "1" }], ["circle", { "cx": "15", "cy": "5", "r": "1" }], ["circle", { "cx": "15", "cy": "19", "r": "1" }]], "hand": [["path", { "d": "M18 11V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2" }], ["path", { "d": "M14 10V4a2 2 0 0 0-2-2a2 2 0 0 0-2 2v2" }], ["path", { "d": "M10 10.5V6a2 2 0 0 0-2-2a2 2 0 0 0-2 2v8" }], ["path", { "d": "M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" }]], "hard-drive": [["line", { "x1": "22", "y1": "12", "x2": "2", "y2": "12" }], ["path", { "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" }], ["line", { "x1": "6", "y1": "16", "x2": "6.01", "y2": "16" }], ["line", { "x1": "10", "y1": "16", "x2": "10.01", "y2": "16" }]], "hash": [["line", { "x1": "4", "y1": "9", "x2": "20", "y2": "9" }], ["line", { "x1": "4", "y1": "15", "x2": "20", "y2": "15" }], ["line", { "x1": "10", "y1": "3", "x2": "8", "y2": "21" }], ["line", { "x1": "16", "y1": "3", "x2": "14", "y2": "21" }]], "heart": [["path", { "d": "M2 9.5a5.5 5.5 0 0 1 9.591-3.676.56.56 0 0 0 .818 0A5.49 5.49 0 0 1 22 9.5c0 2.29-1.5 4-3 5.5l-5.492 5.313a2 2 0 0 1-3 .019L5 15c-1.5-1.5-3-3.2-3-5.5" }]], "highlighter": [["path", { "d": "m9 11-6 6v3h9l3-3" }], ["path", { "d": "m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" }]], "history": [["path", { "d": "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { "d": "M3 3v5h5" }], ["path", { "d": "M12 7v5l4 2" }]], "hourglass": [["path", { "d": "M5 22h14" }], ["path", { "d": "M5 2h14" }], ["path", { "d": "M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22" }], ["path", { "d": "M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2" }]], "house": [["path", { "d": "M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" }], ["path", { "d": "M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }]], "image": [["rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2", "ry": "2" }], ["circle", { "cx": "9", "cy": "9", "r": "2" }], ["path", { "d": "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }]], "image-plus": [["path", { "d": "M16 5h6" }], ["path", { "d": "M19 2v6" }], ["path", { "d": "M21 11.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7.5" }], ["path", { "d": "m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" }], ["circle", { "cx": "9", "cy": "9", "r": "2" }]], "inbox": [["polyline", { "points": "22 12 16 12 14 15 10 15 8 12 2 12" }], ["path", { "d": "M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" }]], "indent-decrease": [["path", { "d": "M21 12H11" }], ["path", { "d": "M21 18H11" }], ["path", { "d": "M21 6H11" }], ["path", { "d": "m7 8-4 4 4 4" }]], "indent-increase": [["path", { "d": "M21 12H11" }], ["path", { "d": "M21 18H11" }], ["path", { "d": "M21 6H11" }], ["path", { "d": "m3 8 4 4-4 4" }]], "info": [["circle", { "cx": "12", "cy": "12", "r": "10" }], ["path", { "d": "M12 16v-4" }], ["path", { "d": "M12 8h.01" }]], "italic": [["line", { "x1": "19", "y1": "4", "x2": "10", "y2": "4" }], ["line", { "x1": "14", "y1": "20", "x2": "5", "y2": "20" }], ["line", { "x1": "15", "y1": "4", "x2": "9", "y2": "20" }]], "key-round": [["path", { "d": "M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" }], ["circle", { "cx": "16.5", "cy": "7.5", "r": ".5" }]], "languages": [["path", { "d": "m5 8 6 6" }], ["path", { "d": "m4 14 6-6 2-3" }], ["path", { "d": "M2 5h12" }], ["path", { "d": "M7 2h1" }], ["path", { "d": "m22 22-5-10-5 10" }], ["path", { "d": "M14 18h6" }]], "laugh": [["path", { "d": "M15 10V9" }], ["path", { "d": "M7.084 14.302a5.12 5.12 0 009.833 0 .24.24 0 00-.235-.302H7.32a.24.24 0 00-.235.302" }], ["path", { "d": "M9 10V9" }], ["circle", { "cx": "12", "cy": "12", "r": "10" }]], "layout-dashboard": [["rect", { "x": "3", "y": "3", "width": "7", "height": "9", "rx": "1" }], ["rect", { "x": "14", "y": "3", "width": "7", "height": "5", "rx": "1" }], ["rect", { "x": "14", "y": "12", "width": "7", "height": "9", "rx": "1" }], ["rect", { "x": "3", "y": "16", "width": "7", "height": "5", "rx": "1" }]], "layout-grid": [["rect", { "width": "7", "height": "7", "x": "3", "y": "3", "rx": "1" }], ["rect", { "width": "7", "height": "7", "x": "14", "y": "3", "rx": "1" }], ["rect", { "width": "7", "height": "7", "x": "14", "y": "14", "rx": "1" }], ["rect", { "width": "7", "height": "7", "x": "3", "y": "14", "rx": "1" }]], "lightbulb": [["path", { "d": "M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" }], ["path", { "d": "M9 18h6" }], ["path", { "d": "M10 22h4" }]], "link-2": [["path", { "d": "M9 17H7A5 5 0 0 1 7 7h2" }], ["path", { "d": "M15 7h2a5 5 0 1 1 0 10h-2" }], ["line", { "x1": "8", "y1": "12", "x2": "16", "y2": "12" }]], "list": [["path", { "d": "M3 5h.01" }], ["path", { "d": "M3 12h.01" }], ["path", { "d": "M3 19h.01" }], ["path", { "d": "M8 5h13" }], ["path", { "d": "M8 12h13" }], ["path", { "d": "M8 19h13" }]], "list-checks": [["path", { "d": "M13 5h8" }], ["path", { "d": "M13 12h8" }], ["path", { "d": "M13 19h8" }], ["path", { "d": "m3 17 2 2 4-4" }], ["path", { "d": "m3 7 2 2 4-4" }]], "list-ordered": [["path", { "d": "M10 12h11" }], ["path", { "d": "M10 18h11" }], ["path", { "d": "M10 6h11" }], ["path", { "d": "M4 10h2" }], ["path", { "d": "M4 6h1v4" }], ["path", { "d": "M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" }]], "list-plus": [["path", { "d": "M11 12H3" }], ["path", { "d": "M16 6H3" }], ["path", { "d": "M16 18H3" }], ["path", { "d": "M18 9v6" }], ["path", { "d": "M21 12h-6" }]], "list-todo": [["rect", { "x": "3", "y": "5", "width": "6", "height": "6", "rx": "1" }], ["path", { "d": "m3 17 2 2 4-4" }], ["path", { "d": "M13 6h8" }], ["path", { "d": "M13 12h8" }], ["path", { "d": "M13 18h8" }]], "loader": [["path", { "d": "M12 2v4" }], ["path", { "d": "m16.2 7.8 2.9-2.9" }], ["path", { "d": "M18 12h4" }], ["path", { "d": "m16.2 16.2 2.9 2.9" }], ["path", { "d": "M12 18v4" }], ["path", { "d": "m4.9 19.1 2.9-2.9" }], ["path", { "d": "M2 12h4" }], ["path", { "d": "m4.9 4.9 2.9 2.9" }]], "loader-circle": [["path", { "d": "M21 12a9 9 0 1 1-6.219-8.56" }]], "lock": [["rect", { "width": "18", "height": "11", "x": "3", "y": "11", "rx": "2", "ry": "2" }], ["path", { "d": "M7 11V7a5 5 0 0 1 10 0v4" }]], "log-out": [["path", { "d": "m16 17 5-5-5-5" }], ["path", { "d": "M21 12H9" }], ["path", { "d": "M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" }]], "mail": [["path", { "d": "m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" }], ["rect", { "x": "2", "y": "4", "width": "20", "height": "16", "rx": "2" }]], "mail-open": [["path", { "d": "M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z" }], ["path", { "d": "m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10" }]], "map-pin": [["path", { "d": "M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" }], ["circle", { "cx": "12", "cy": "10", "r": "3" }]], "maximize-2": [["polyline", { "points": "15 3 21 3 21 9" }], ["polyline", { "points": "9 21 3 21 3 15" }], ["line", { "x1": "21", "y1": "3", "x2": "14", "y2": "10" }], ["line", { "x1": "3", "y1": "21", "x2": "10", "y2": "14" }]], "meh": [["path", { "d": "M15 10V9" }], ["path", { "d": "M8 16h8" }], ["path", { "d": "M9 10V9" }], ["circle", { "cx": "12", "cy": "12", "r": "10" }]], "memory-stick": [["path", { "d": "M6 19v-3" }], ["path", { "d": "M10 19v-3" }], ["path", { "d": "M14 19v-3" }], ["path", { "d": "M18 19v-3" }], ["path", { "d": "M8 11V9" }], ["path", { "d": "M16 11V9" }], ["path", { "d": "M12 11V9" }], ["path", { "d": "M2 15h20" }], ["path", { "d": "M2 7a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v1.1a2 2 0 0 0 0 3.837V17a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-5.1a2 2 0 0 0 0-3.837Z" }]], "menu": [["path", { "d": "M4 5h16" }], ["path", { "d": "M4 12h16" }], ["path", { "d": "M4 19h16" }]], "message-circle": [["path", { "d": "M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" }]], "message-square": [["path", { "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }]], "message-square-plus": [["path", { "d": "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" }], ["path", { "d": "M12 7v6" }], ["path", { "d": "M9 10h6" }]], "messages-square": [["path", { "d": "M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" }], ["path", { "d": "M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" }]], "mic": [["path", { "d": "M12 19v3" }], ["path", { "d": "M19 10v2a7 7 0 0 1-14 0v-2" }], ["rect", { "x": "9", "y": "2", "width": "6", "height": "13", "rx": "3" }]], "mic-off": [["line", { "x1": "2", "y1": "2", "x2": "22", "y2": "22" }], ["path", { "d": "M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" }], ["path", { "d": "M5 10v2a7 7 0 0 0 12 5" }], ["path", { "d": "M15 9.34V5a3 3 0 0 0-5.68-1.33" }], ["path", { "d": "M9 9v3a3 3 0 0 0 5.12 2.12" }], ["line", { "x1": "12", "y1": "19", "x2": "12", "y2": "22" }]], "minimize-2": [["polyline", { "points": "4 14 10 14 10 20" }], ["polyline", { "points": "20 10 14 10 14 4" }], ["line", { "x1": "14", "y1": "10", "x2": "21", "y2": "3" }], ["line", { "x1": "3", "y1": "21", "x2": "10", "y2": "14" }]], "minus": [["path", { "d": "M5 12h14" }]], "moon": [["path", { "d": "M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401" }]], "music": [["path", { "d": "M21 16V3a1 1 0 0 0-1.28-.96l-10 2.917a1 1 0 0 0-.72.96V19" }], ["circle", { "cx": "18", "cy": "16", "r": "3" }], ["circle", { "cx": "6", "cy": "19", "r": "3" }]], "music-2": [["path", { "d": "m19 6-5.2-3.9a.5.5 0 0 0-.8.4V18" }], ["circle", { "cx": "9", "cy": "18", "r": "4" }]], "notebook-pen": [["path", { "d": "M13.4 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7.4" }], ["path", { "d": "M2 6h4" }], ["path", { "d": "M2 10h4" }], ["path", { "d": "M2 14h4" }], ["path", { "d": "M2 18h4" }], ["path", { "d": "M21.378 5.626a1 1 0 1 0-3.004-3.004l-5.01 5.012a2 2 0 0 0-.506.854l-.837 2.87a.5.5 0 0 0 .62.62l2.87-.837a2 2 0 0 0 .854-.506z" }]], "palette": [["path", { "d": "M12 22a1 1 0 0 1 0-20 10 9 0 0 1 10 9 5 5 0 0 1-5 5h-2.25a1.75 1.75 0 0 0-1.4 2.8l.3.4a1.75 1.75 0 0 1-1.4 2.8z" }], ["circle", { "cx": "13.5", "cy": "6.5", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "17.5", "cy": "10.5", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "6.5", "cy": "12.5", "r": ".5", "fill": "currentColor" }], ["circle", { "cx": "8.5", "cy": "7.5", "r": ".5", "fill": "currentColor" }]], "paperclip": [["path", { "d": "M13.234 20.252 21 12.3" }], ["path", { "d": "m16 6-8.414 8.586a2 2 0 0 0 0 2.828 2 2 0 0 0 2.828 0l8.414-8.586a4 4 0 0 0 0-5.656 4 4 0 0 0-5.656 0l-8.415 8.585a6 6 0 1 0 8.486 8.486" }]], "party-popper": [["path", { "d": "M5.8 11.3 2 22l10.7-3.79" }], ["path", { "d": "M4 3h.01" }], ["path", { "d": "M22 8h.01" }], ["path", { "d": "M15 2h.01" }], ["path", { "d": "M22 20h.01" }], ["path", { "d": "m22 2-2.24.75a2.9 2.9 0 0 0-1.96 3.12c.1.86-.57 1.63-1.45 1.63h-.38c-.86 0-1.6.6-1.76 1.44L14 10" }], ["path", { "d": "m22 13-.82-.33c-.86-.34-1.82.2-1.98 1.11c-.11.7-.72 1.22-1.43 1.22H17" }], ["path", { "d": "m11 2 .33.82c.34.86-.2 1.82-1.11 1.98C9.52 4.9 9 5.52 9 6.23V7" }], ["path", { "d": "M11 13c1.93 1.93 2.83 4.17 2 5-.83.83-3.07-.07-5-2-1.93-1.93-2.83-4.17-2-5 .83-.83 3.07.07 5 2Z" }]], "pause": [["rect", { "x": "14", "y": "4", "width": "4", "height": "16", "rx": "1" }], ["rect", { "x": "6", "y": "4", "width": "4", "height": "16", "rx": "1" }]], "pencil": [["path", { "d": "M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z" }], ["path", { "d": "m15 5 4 4" }]], "phone": [["path", { "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" }]], "phone-call": [["path", { "d": "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" }], ["path", { "d": "M14.05 2a9 9 0 0 1 8 7.94" }], ["path", { "d": "M14.05 6A5 5 0 0 1 18 10" }]], "play": [["polygon", { "points": "6 3 20 12 6 21 6 3" }]], "plus": [["path", { "d": "M5 12h14" }], ["path", { "d": "M12 5v14" }]], "power": [["path", { "d": "M12 2v10" }], ["path", { "d": "M18.4 6.6a9 9 0 1 1-12.77.04" }]], "power-off": [["path", { "d": "M18.36 6.64A9 9 0 0 1 20.77 15" }], ["path", { "d": "M6.16 6.16a9 9 0 1 0 12.68 12.68" }], ["path", { "d": "M12 2v4" }], ["path", { "d": "m2 2 20 20" }]], "printer": [["path", { "d": "M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" }], ["path", { "d": "M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" }], ["rect", { "x": "6", "y": "14", "width": "12", "height": "8", "rx": "1" }]], "redo-2": [["path", { "d": "m15 14 5-5-5-5" }], ["path", { "d": "M20 9H9.5A5.5 5.5 0 0 0 4 14.5A5.5 5.5 0 0 0 9.5 20H13" }]], "refresh-cw": [["path", { "d": "M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" }], ["path", { "d": "M21 3v5h-5" }], ["path", { "d": "M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" }], ["path", { "d": "M8 16H3v5" }]], "repeat": [["path", { "d": "m17 2 4 4-4 4" }], ["path", { "d": "M3 11v-1a4 4 0 0 1 4-4h14" }], ["path", { "d": "m7 22-4-4 4-4" }], ["path", { "d": "M21 13v1a4 4 0 0 1-4 4H3" }]], "reply": [["polyline", { "points": "9 17 4 12 9 7" }], ["path", { "d": "M20 18v-2a4 4 0 0 0-4-4H4" }]], "reply-all": [["polyline", { "points": "7 17 2 12 7 7" }], ["polyline", { "points": "12 17 7 12 12 7" }], ["path", { "d": "M22 18v-2a4 4 0 0 0-4-4H7" }]], "rocket": [["path", { "d": "M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" }], ["path", { "d": "m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" }], ["path", { "d": "M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" }], ["path", { "d": "M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" }]], "rotate-ccw": [["path", { "d": "M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" }], ["path", { "d": "M3 3v5h5" }]], "save": [["path", { "d": "M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" }], ["path", { "d": "M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7" }], ["path", { "d": "M7 3v4a1 1 0 0 0 1 1h7" }]], "search": [["path", { "d": "m21 21-4.34-4.34" }], ["circle", { "cx": "11", "cy": "11", "r": "8" }]], "send": [["path", { "d": "M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" }], ["path", { "d": "m21.854 2.147-10.94 10.939" }]], "server": [["rect", { "x": "2", "y": "2", "width": "20", "height": "8", "rx": "2", "ry": "2" }], ["rect", { "x": "2", "y": "14", "width": "20", "height": "8", "rx": "2", "ry": "2" }], ["line", { "x1": "6", "y1": "6", "x2": "6.01", "y2": "6" }], ["line", { "x1": "6", "y1": "18", "x2": "6.01", "y2": "18" }]], "settings": [["path", { "d": "M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915" }], ["circle", { "cx": "12", "cy": "12", "r": "3" }]], "settings-2": [["path", { "d": "M20 7h-9" }], ["path", { "d": "M14 17H5" }], ["circle", { "cx": "17", "cy": "17", "r": "3" }], ["circle", { "cx": "7", "cy": "7", "r": "3" }]], "share": [["path", { "d": "M12 2v13" }], ["path", { "d": "m16 6-4-4-4 4" }], ["path", { "d": "M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" }]], "shield": [["path", { "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }]], "shield-alert": [["path", { "d": "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }], ["path", { "d": "M12 8v4" }], ["path", { "d": "M12 16h.01" }]], "skip-forward": [["polygon", { "points": "5 4 15 12 5 20 5 4" }], ["line", { "x1": "19", "y1": "5", "x2": "19", "y2": "19" }]], "sliders-horizontal": [["path", { "d": "M10 5H3" }], ["path", { "d": "M12 19H3" }], ["path", { "d": "M14 3v4" }], ["path", { "d": "M16 17v4" }], ["path", { "d": "M21 12h-9" }], ["path", { "d": "M21 19h-5" }], ["path", { "d": "M21 5h-7" }], ["path", { "d": "M8 10v4" }], ["path", { "d": "M8 12H3" }]], "smile": [["path", { "d": "M15 10V9" }], ["path", { "d": "M16.472 15a6 6 0 01-8.943 0" }], ["path", { "d": "M9 10V9" }], ["circle", { "cx": "12", "cy": "12", "r": "10" }]], "smile-plus": [["path", { "d": "M22 11v1a10 10 0 1 1-9-10" }], ["path", { "d": "M8 14s1.5 2 4 2 4-2 4-2" }], ["line", { "x1": "9", "y1": "9", "x2": "9.01", "y2": "9" }], ["line", { "x1": "15", "y1": "9", "x2": "15.01", "y2": "9" }], ["path", { "d": "M16 5h6" }], ["path", { "d": "M19 2v6" }]], "sparkles": [["path", { "d": "M11.017 2.814a1 1 0 0 1 1.966 0l1.051 5.558a2 2 0 0 0 1.594 1.594l5.558 1.051a1 1 0 0 1 0 1.966l-5.558 1.051a2 2 0 0 0-1.594 1.594l-1.051 5.558a1 1 0 0 1-1.966 0l-1.051-5.558a2 2 0 0 0-1.594-1.594l-5.558-1.051a1 1 0 0 1 0-1.966l5.558-1.051a2 2 0 0 0 1.594-1.594z" }], ["path", { "d": "M20 2v4" }], ["path", { "d": "M22 4h-4" }], ["circle", { "cx": "4", "cy": "20", "r": "2" }]], "spell-check": [["path", { "d": "m6 16 6-12 6 12" }], ["path", { "d": "M8 12h8" }], ["path", { "d": "m16 20 2 2 4-4" }]], "square": [["rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2" }]], "square-check-big": [["path", { "d": "M21 10.5V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h12.5" }], ["path", { "d": "m9 11 3 3L22 4" }]], "square-kanban": [["rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2" }], ["path", { "d": "M8 7v7" }], ["path", { "d": "M12 7v4" }], ["path", { "d": "M16 7v9" }]], "square-pen": [["path", { "d": "M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" }], ["path", { "d": "M18.375 2.625a1 1 0 0 1 3 3l-9.013 9.014a2 2 0 0 1-.853.505l-2.873.84a.5.5 0 0 1-.62-.62l.84-2.873a2 2 0 0 1 .506-.852z" }]], "star": [["path", { "d": "M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" }]], "sticky-note": [["path", { "d": "M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8Z" }], ["path", { "d": "M15 3v4a2 2 0 0 0 2 2h4" }]], "strikethrough": [["path", { "d": "M16 4H9a3 3 0 0 0-2.83 4" }], ["path", { "d": "M14 12a4 4 0 0 1 0 8H6" }], ["line", { "x1": "4", "y1": "12", "x2": "20", "y2": "12" }]], "sun": [["circle", { "cx": "12", "cy": "12", "r": "4" }], ["path", { "d": "M12 2v2" }], ["path", { "d": "M12 20v2" }], ["path", { "d": "m4.93 4.93 1.41 1.41" }], ["path", { "d": "m17.66 17.66 1.41 1.41" }], ["path", { "d": "M2 12h2" }], ["path", { "d": "M20 12h2" }], ["path", { "d": "m6.34 17.66-1.41 1.41" }], ["path", { "d": "m19.07 4.93-1.41 1.41" }]], "sun-medium": [["circle", { "cx": "12", "cy": "12", "r": "4" }], ["path", { "d": "M12 3v1" }], ["path", { "d": "M12 20v1" }], ["path", { "d": "M3 12h1" }], ["path", { "d": "M20 12h1" }], ["path", { "d": "m18.364 5.636-.707.707" }], ["path", { "d": "m6.343 17.657-.707.707" }], ["path", { "d": "m5.636 5.636.707.707" }], ["path", { "d": "m17.657 17.657.707.707" }]], "table": [["path", { "d": "M12 3v18" }], ["rect", { "x": "3", "y": "3", "width": "18", "height": "18", "rx": "2" }], ["path", { "d": "M3 9h18" }], ["path", { "d": "M3 15h18" }]], "table-2": [["path", { "d": "M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18" }]], "tag": [["path", { "d": "M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z" }], ["circle", { "cx": "7.5", "cy": "7.5", "r": ".5" }]], "thumbs-down": [["path", { "d": "M17 14V2" }], ["path", { "d": "M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88Z" }]], "thumbs-up": [["path", { "d": "M7 10v12" }], ["path", { "d": "M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z" }]], "ticket": [["path", { "d": "M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" }], ["path", { "d": "M13 5v2" }], ["path", { "d": "M13 17v2" }], ["path", { "d": "M13 11v2" }]], "timer": [["line", { "x1": "10", "y1": "2", "x2": "14", "y2": "2" }], ["line", { "x1": "12", "y1": "14", "x2": "15", "y2": "11" }], ["circle", { "cx": "12", "cy": "14", "r": "8" }]], "trash": [["path", { "d": "M10 11v6" }], ["path", { "d": "M14 11v6" }], ["path", { "d": "M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" }], ["path", { "d": "M3 6h18" }], ["path", { "d": "M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }]], "trash-2": [["path", { "d": "M3 6h18" }], ["path", { "d": "M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" }], ["path", { "d": "M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" }], ["line", { "x1": "10", "y1": "11", "x2": "10", "y2": "17" }], ["line", { "x1": "14", "y1": "11", "x2": "14", "y2": "17" }]], "triangle-alert": [["path", { "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }], ["path", { "d": "M12 9v4" }], ["path", { "d": "M12 17h.01" }]], "triangle-exclamation-point": [["path", { "d": "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" }], ["path", { "d": "M12 9v4" }], ["path", { "d": "M12 17h.01" }]], "trophy": [["path", { "d": "M10 14.66V17a1 1 0 0 1-1 1 2 2 0 0 0-2 2v2" }], ["path", { "d": "M14 14.66V17a1 1 0 0 0 1 1 2 2 0 0 1 2 2v2" }], ["path", { "d": "M17.916 10H19.5A2.5 2.5 0 0 0 22 7.5V5a1 1 0 0 0-1-1h-3" }], ["path", { "d": "M4 22h16" }], ["path", { "d": "M6 9a6 6 0 0 0 12 0V3a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1z" }], ["path", { "d": "M6.084 10H4.5A2.5 2.5 0 0 1 2 7.5V5a1 1 0 0 1 1-1h3" }]], "underline": [["path", { "d": "M6 4v6a6 6 0 0 0 12 0V4" }], ["line", { "x1": "4", "y1": "20", "x2": "20", "y2": "20" }]], "undo-2": [["path", { "d": "M9 14 4 9l5-5" }], ["path", { "d": "M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5a5.5 5.5 0 0 1-5.5 5.5H11" }]], "unlink": [["path", { "d": "m18.84 12.25 1.72-1.71h-.02a5.004 5.004 0 0 0-.12-7.07 5.006 5.006 0 0 0-6.95 0l-1.72 1.71" }], ["path", { "d": "m5.17 11.75-1.71 1.71a5.004 5.004 0 0 0 .12 7.07 5.006 5.006 0 0 0 6.95 0l1.71-1.71" }], ["line", { "x1": "8", "y1": "2", "x2": "8", "y2": "5" }], ["line", { "x1": "2", "y1": "8", "x2": "5", "y2": "8" }], ["line", { "x1": "16", "y1": "19", "x2": "16", "y2": "22" }], ["line", { "x1": "19", "y1": "16", "x2": "22", "y2": "16" }]], "upload": [["path", { "d": "M12 3v12" }], ["path", { "d": "m17 8-5-5-5 5" }], ["path", { "d": "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }]], "user": [["path", { "d": "M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" }], ["circle", { "cx": "12", "cy": "7", "r": "4" }]], "user-plus": [["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["circle", { "cx": "9", "cy": "7", "r": "4" }], ["line", { "x1": "19", "y1": "8", "x2": "19", "y2": "14" }], ["line", { "x1": "22", "y1": "11", "x2": "16", "y2": "11" }]], "user-round": [["circle", { "cx": "12", "cy": "8", "r": "5" }], ["path", { "d": "M20 21a8 8 0 0 0-16 0" }]], "users": [["path", { "d": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }], ["circle", { "cx": "9", "cy": "7", "r": "4" }], ["path", { "d": "M22 21v-2a4 4 0 0 0-3-3.87" }], ["path", { "d": "M16 3.13a4 4 0 0 1 0 7.75" }]], "video": [["path", { "d": "m16 13 5.223 3.482a.5.5 0 0 0 .777-.416V7.87a.5.5 0 0 0-.752-.432L16 10.5" }], ["rect", { "x": "2", "y": "6", "width": "14", "height": "12", "rx": "2" }]], "volume-2": [["path", { "d": "M11 4.702a.705.705 0 0 0-1.203-.498L6.413 7.587A1.4 1.4 0 0 1 5.416 8H3a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.416a1.4 1.4 0 0 1 .997.413l3.383 3.384A.705.705 0 0 0 11 19.298z" }], ["path", { "d": "M16 9a5 5 0 0 1 0 6" }], ["path", { "d": "M19.364 18.364a9 9 0 0 0 0-12.728" }]], "wand-sparkles": [["path", { "d": "m21.64 3.64-1.28-1.28a1.21 1.21 0 0 0-1.72 0L2.36 18.64a1.21 1.21 0 0 0 0 1.72l1.28 1.28a1.2 1.2 0 0 0 1.72 0L21.64 5.36a1.2 1.2 0 0 0 0-1.72" }], ["path", { "d": "m14 7 3 3" }], ["path", { "d": "M5 6v4" }], ["path", { "d": "M19 14v4" }], ["path", { "d": "M10 2v2" }], ["path", { "d": "M7 8H3" }], ["path", { "d": "M21 16h-4" }], ["path", { "d": "M11 3H9" }]], "x": [["path", { "d": "M18 6 6 18" }], ["path", { "d": "m6 6 12 12" }]] };

  // dpi/js/enhance.js
  var NS3 = "http://www.w3.org/2000/svg";
  function icon(name, size2 = "md", label2 = null) {
    const shapes = icons[name];
    if (!shapes) return null;
    const svg2 = document.createElementNS(NS3, "svg");
    fill(svg2, name, shapes, size2, label2);
    return svg2;
  }
  function fill(svg2, name, shapes, size2, label2) {
    const set4 = (k, v) => svg2.setAttribute(k, v);
    svg2.setAttribute("class", `dpi-icon dpi-icon--${size2}`);
    set4("viewBox", "0 0 24 24");
    set4("width", "24");
    set4("height", "24");
    set4("fill", "none");
    set4("stroke", "currentColor");
    set4("stroke-width", "2");
    set4("stroke-linecap", "round");
    set4("stroke-linejoin", "round");
    set4("focusable", "false");
    set4("data-dpi-icon", name);
    if (label2) {
      set4("role", "img");
      set4("aria-label", label2);
    } else set4("aria-hidden", "true");
    for (const [tag, attrs] of shapes) {
      const el6 = document.createElementNS(NS3, tag);
      for (const k in attrs) el6.setAttribute(k, attrs[k]);
      svg2.append(el6);
    }
  }
  function applyIcons(root4) {
    for (const el6 of root4.querySelectorAll("[data-dpi-icon]")) {
      const name = el6.getAttribute("data-dpi-icon");
      const size2 = el6.getAttribute("data-dpi-icon-size") || "md";
      const label2 = el6.getAttribute("data-dpi-icon-label");
      if (el6 instanceof SVGElement) {
        if (el6.childElementCount === 0 && icons[name]) fill(el6, name, icons[name], size2, label2);
      } else if (!el6.querySelector(":scope > svg") && icons[name]) {
        el6.append(icon(name, size2, label2));
      }
    }
  }
  var solid = () => document.documentElement.getAttribute("data-dpi-surface") === "solid";
  var unglassed = (el6) => el6.hasAttribute("data-dpi-glass") || el6.closest('[data-dpi-glass="off"]') === el6;
  function glassify(el6, preset, pill) {
    el6.classList.add("dpi-glass");
    if (pill) el6.classList.add("dpi-glass--pill");
    el6.setAttribute("data-dpi-glass", preset);
  }
  function applyMaterial(root4) {
    if (solid()) return;
    for (const b of root4.querySelectorAll(".dpi-btn:not(.dpi-btn--plain)")) {
      if (unglassed(b) || b.hasAttribute("data-dpi-drop")) continue;
      glassify(b, "button", true);
      b.setAttribute("data-dpi-drop", "button");
      if (b.classList.contains("dpi-btn--icon-only")) b.setAttribute("data-dpi-elastic", "");
      if (!b.querySelector(":scope > .dpi-btn__content")) {
        const wrap = document.createElement("span");
        wrap.className = "dpi-btn__content";
        for (const n of [...b.childNodes]) {
          if (n.nodeType === 3 && n.textContent.trim() !== "") {
            const label2 = document.createElement("span");
            label2.className = "dpi-btn__label";
            label2.textContent = n.textContent.trim();
            n.replaceWith(label2);
          }
        }
        wrap.append(...b.childNodes);
        b.append(wrap);
      }
      if (b.tagName === "BUTTON" && !b.hasAttribute("type")) b.setAttribute("type", "button");
    }
    for (const c of root4.querySelectorAll(".dpi-card")) {
      if (unglassed(c)) continue;
      glassify(c, "surface", false);
    }
  }
  function apply(root4 = document) {
    applyIcons(root4);
    applyMaterial(root4);
  }

  // dpi/js/bar-search.js
  var RECT_GLASS2 = engine === "webkit";
  var SPEED2 = 1 / 0.95;
  var ACCEL2 = 13;
  var EDGE2 = 5;
  var GAP = 8;
  var NATIVE_U = 0.012;
  var BLOB = 0.62;
  var reduced5 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var coarse = () => typeof matchMedia === "function" && matchMedia("(pointer: coarse)").matches;
  var ease4 = (x) => {
    const t = Math.max(0, Math.min(1, x));
    return t * t * (3 - 2 * t);
  };
  var el2 = (tag, cls, parent) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.append(n);
    return n;
  };
  var uid4 = 0;
  var cfgs = ownedMap();
  var S2 = null;
  var cfgOf = (bar2) => {
    let c = cfgs.get(bar2);
    if (!c) {
      c = { query: "", opts: {}, setupDone: false };
      cfgs.set(bar2, c);
    }
    return c;
  };
  var attr = (bar2, n, d = "") => bar2.getAttribute(`data-dpi-bar-search-${n}`) ?? d;
  var listOf2 = (bar2) => bar2.querySelector(":scope > .dpi-bottombar__list");
  var lensBtn = (bar2) => bar2.querySelector(":scope > .dpi-bottombar__search");
  var defaultBar = () => document.querySelector('[data-dpi-bottombar][data-dpi-bar-search]:not([data-dpi-bar-search="off"]):not([hidden])');
  var isOpen = (bar2 = defaultBar()) => isSearchState(get2(bar2)) && get2(bar2) !== "from-search";
  var stateOf3 = () => S2 ? { u: S2.u, target: S2.target, v: S2.v } : null;
  function canOpen(bar2) {
    const blocked = (b) => b.closest(isModal() ? "[hidden]" : "[hidden], [inert]");
    if (!bar2 || !bar2.isConnected || bar2.hidden || blocked(bar2) || bar2.hasAttribute("data-dpi-hidden") || !bar2.hasAttribute("data-dpi-bar-search") || bar2.getAttribute("data-dpi-bar-search") === "off") return false;
    if (document.querySelector('.dpi-chatbot[data-dpi-state="open"], .dpi-chatbot[data-dpi-state="opening"]')) return false;
    try {
      if (document.querySelector("dialog[open]:modal")) return false;
    } catch {
    }
    const cs = getComputedStyle(bar2);
    if (cs.display === "none" || cs.visibility === "hidden") return false;
    const r = bar2.getBoundingClientRect();
    return r.width >= 160 && r.height >= 24;
  }
  function setup4(bar2) {
    if (!bar2.hasAttribute("data-dpi-bar-search") || bar2.getAttribute("data-dpi-bar-search") === "off" || bar2.hasAttribute("data-dpi-inline")) return;
    const c = cfgOf(bar2);
    if (c.setupDone) return;
    c.setupDone = true;
    let btn = lensBtn(bar2);
    if (!btn) {
      btn = el2("button", "dpi-bottombar__search");
      btn.type = "button";
      btn.append(icon("search", "lg"));
      const lab = el2("span", "dpi-visually-hidden", btn);
      lab.textContent = attr(bar2, "label", "Cerca");
      bar2.prepend(btn);
    }
    btn.setAttribute("aria-label", attr(bar2, "label", "Cerca"));
    btn.setAttribute("aria-expanded", "false");
    btn.title = attr(bar2, "label", "Cerca");
    bar2.setAttribute("data-dpi-bar-searchable", "");
    btn.addEventListener("click", () => toggle(bar2));
    onRemoved(bar2, () => {
      if (S2?.bar === bar2) abort2();
    });
  }
  function open3(bar2 = defaultBar(), o = {}) {
    if (!bar2 || !canOpen(bar2)) return false;
    setup4(bar2);
    const s = get2(bar2);
    if (s === "from-search") {
      reverse(S2, true);
      if (o.focus !== false) focusInput(S2);
      return true;
    }
    if (isSearchState(s)) {
      if (o.focus !== false) focusInput(S2);
      return true;
    }
    if (isNotifyState(s)) {
      want(bar2, { focus: o.focus !== false });
      trackPending(bar2, true);
      closeNotify(bar2);
      return true;
    }
    return start(bar2, o);
  }
  function close2(bar2 = S2?.bar ?? defaultBar(), o = {}) {
    if (bar2 && wanted(bar2)) {
      want(bar2, null);
      trackPending(bar2, false);
    }
    if (!S2 || S2.bar !== bar2 || S2.target === 0) return false;
    const had = S2.form.contains(document.activeElement);
    S2.target = 0;
    set2(bar2, "from-search");
    S2.form.inert = true;
    S2.btn.setAttribute("aria-expanded", "false");
    closeSuggest(S2);
    if (o.restoreFocus !== false && (had || o.restoreFocus)) S2.btn.focus({ preventScroll: true });
    cfgOf(bar2).query = S2.input.value;
    emit(bar2, "bar-search-close", { bar: bar2, query: S2.input.value });
    kick2(S2);
    return true;
  }
  function toggle(bar2 = defaultBar()) {
    if (!bar2) return false;
    const s = get2(bar2);
    if (isSearchState(s) && s !== "from-search") {
      if (S2?.input.value === "") return close2(bar2, { restoreFocus: true });
      focusInput(S2);
      return true;
    }
    return open3(bar2);
  }
  function configure(bar2 = defaultBar(), o = {}) {
    if (bar2) Object.assign(cfgOf(bar2).opts, o);
  }
  var query = (bar2 = defaultBar()) => S2 && S2.bar === bar2 ? S2.input.value : cfgOf(bar2).query;
  function setQuery(bar2 = defaultBar(), q = "") {
    const c = cfgOf(bar2);
    c.query = String(q);
    if (S2?.bar === bar2) {
      S2.input.value = c.query;
      syncClear(S2);
    }
  }
  function suggest(bar2 = defaultBar(), items2 = []) {
    if (!S2 || S2.bar !== bar2) return;
    renderSuggest(S2, items2);
  }
  function start(bar2, o = {}) {
    if (S2 && S2.bar !== bar2) abort2();
    bar2.dispatchEvent(new CustomEvent("dpi:bar-cancel-gesture"));
    const c = cfgOf(bar2);
    const btn = lensBtn(bar2);
    const st = { bar: bar2, btn, cfg: c, u: 0, v: 0, target: 1, raf: 0, last: 0, ac: new AbortController(), inertOn: false, openedFired: false, sugItems: [], sugActive: -1 };
    buildField(st);
    S2 = st;
    measureAll(st);
    st.m = buildMass(st);
    nativeEdge(st.m, bar2.hasAttribute("data-dpi-live") && !RECT_GLASS2);
    bar2.setAttribute("data-dpi-bbn", reduced5() ? "search-reduced" : "search");
    bar2.setAttribute("data-dpi-bbn-kind", "search");
    btn.setAttribute("aria-expanded", "true");
    set2(bar2, "to-search");
    st.input.value = c.query;
    syncClear(st);
    paint2(st);
    emit(bar2, "bar-search-open", { bar: bar2 });
    if (o.focus !== false) focusInput(st, true);
    listen(st);
    kick2(st);
    return true;
  }
  function focusInput(st, select2 = false) {
    if (!st) return;
    try {
      st.input.focus({ preventScroll: true });
    } catch {
      st.input.focus();
    }
    if (select2 && st.input.value) {
      try {
        st.input.select();
      } catch {
      }
    }
  }
  function buildField(st) {
    const { bar: bar2 } = st, id = `dpi-bsr-${++uid4}`;
    const form = el2("form", "dpi-bar-search");
    form.setAttribute("role", "search");
    form.setAttribute("aria-label", attr(bar2, "label", "Cerca"));
    form.noValidate = true;
    form.setAttribute("autocomplete", "off");
    const action = attr(bar2, "action");
    if (action) {
      form.setAttribute("data-dpi-action", action);
      form.setAttribute("data-dpi-action-prevent", "");
    }
    const field = el2("div", "dpi-bar-search__field", form);
    const input = el2("input", "dpi-bar-search__input", field);
    input.type = "search";
    input.name = attr(bar2, "name", "q");
    input.id = `${id}-q`;
    input.autocomplete = "off";
    input.autocapitalize = "off";
    input.spellcheck = false;
    input.setAttribute("enterkeyhint", "search");
    input.setAttribute("aria-label", attr(bar2, "placeholder", "Cerca…"));
    input.placeholder = attr(bar2, "placeholder", "Cerca…");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-controls", `${id}-sg`);
    const scope = attr(bar2, "scope");
    if (scope) {
      const h = el2("input", "", form);
      h.type = "hidden";
      h.name = "scope";
      h.value = scope;
    }
    const mkBtn = (cls, ic, label2) => {
      const b = el2("button", `dpi-btn dpi-btn--plain dpi-btn--icon-only dpi-btn--sm dpi-bar-search__btn ${cls}`, field);
      b.type = "button";
      b.setAttribute("aria-label", label2);
      b.title = label2;
      b.append(icon(ic, "md"));
      return b;
    };
    const clear2 = mkBtn("dpi-bar-search__clear", "circle-x", attr(bar2, "clear-label", "Cancella il testo"));
    clear2.hidden = true;
    const sep = el2("span", "dpi-bar-search__sep", field);
    sep.setAttribute("aria-hidden", "true");
    const closeB = mkBtn("dpi-bar-search__close", "x", attr(bar2, "close-label", "Chiudi la ricerca"));
    const sug = el2("ul", "dpi-bar-search__suggest");
    sug.id = `${id}-sg`;
    sug.setAttribute("role", "listbox");
    sug.hidden = true;
    sug.setAttribute("aria-label", "Suggerimenti");
    Object.assign(st, { form, field, input, clear: clear2, closeB, sug, uid: id });
    form.addEventListener("submit", (e) => {
      const q = input.value.trim();
      const o = st.cfg.opts;
      if (!bar2.hasAttribute("data-dpi-bar-search-native")) e.preventDefault();
      closeSuggest(st);
      st.cfg.query = input.value;
      emit(bar2, "bar-search-submit", { bar: bar2, query: q, form });
      try {
        o.onsubmit?.(q, { bar: bar2, form, event: e });
      } catch (err) {
        console.error(err);
      }
      if (coarse()) input.blur();
    });
    input.addEventListener("input", () => {
      syncClear(st);
      const o = st.cfg.opts;
      if (typeof o.suggest === "function") {
        try {
          renderSuggest(st, o.suggest(input.value) ?? []);
        } catch (err) {
          console.error(err);
        }
      }
    });
    clear2.addEventListener("click", () => {
      input.value = "";
      syncClear(st);
      closeSuggest(st);
      focusInput(st);
      emit(bar2, "bar-search-clear", { bar: bar2 });
    });
    closeB.addEventListener("click", () => close2(bar2, { restoreFocus: true }));
    for (const b of [clear2, closeB]) b.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") e.preventDefault();
    });
    form.addEventListener("keydown", (e) => onKey(st, e));
    sug.addEventListener("pointerdown", (e) => e.preventDefault());
    sug.addEventListener("click", (e) => {
      const li = e.target.closest('[role="option"]');
      if (!li) return;
      input.value = li.dataset.value ?? li.textContent;
      syncClear(st);
      closeSuggest(st);
      focusInput(st);
      form.requestSubmit();
    });
    bar2.append(form, sug);
  }
  function syncClear(st) {
    st.clear.hidden = st.input.value === "";
  }
  function onKey(st, e) {
    if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      if (!st.sug.hidden) closeSuggest(st);
      else close2(st.bar, { restoreFocus: true });
      return;
    }
    if (e.target !== st.input) return;
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && !e.altKey) {
      if (st.sug.hidden) {
        const o = st.cfg.opts;
        if (e.key === "ArrowDown" && typeof o.suggest === "function") renderSuggest(st, o.suggest(st.input.value) ?? []);
        if (st.sug.hidden) return;
      }
      e.preventDefault();
      const n = st.sugItems.length;
      let i = st.sugActive + (e.key === "ArrowDown" ? 1 : -1);
      if (i >= n) i = -1;
      else if (i < -1) i = n - 1;
      setActive(st, i);
    } else if (e.key === "Enter" && st.sugActive >= 0 && !st.sug.hidden) {
      const it = st.sugItems[st.sugActive];
      st.input.value = it.value;
      syncClear(st);
      closeSuggest(st);
    }
  }
  function setActive(st, i) {
    st.sugActive = i;
    [...st.sug.children].forEach((li, k) => li.toggleAttribute("data-active", k === i));
    if (i >= 0) st.input.setAttribute("aria-activedescendant", st.sug.children[i].id);
    else st.input.removeAttribute("aria-activedescendant");
  }
  function renderSuggest(st, items2) {
    const list = (items2 || []).map((x) => typeof x === "string" ? { label: x, value: x } : { label: String(x.label ?? x.value), value: String(x.value ?? x.label) }).slice(0, 8);
    st.sugItems = list;
    st.sug.textContent = "";
    list.forEach((it, i) => {
      const li = el2("li", "dpi-bar-search__option", st.sug);
      li.id = `${st.uid}-o${i}`;
      li.setAttribute("role", "option");
      li.dataset.value = it.value;
      li.textContent = it.label;
    });
    const show3 = list.length > 0 && S2 === st && st.target === 1;
    st.sug.hidden = !show3;
    st.input.setAttribute("aria-expanded", String(show3));
    st.sugActive = -1;
    st.input.removeAttribute("aria-activedescendant");
    if (show3) {
      const br = st.bar.getBoundingClientRect(), vh = globalThis.visualViewport?.height ?? innerHeight;
      st.sug.setAttribute("data-side", br.top + br.height / 2 < vh / 2 ? "below" : "above");
      st.sug.style.left = `${st.fieldRect.x}px`;
      st.sug.style.width = `${st.fieldRect.w}px`;
    }
  }
  function closeSuggest(st) {
    if (st.sug.hidden) return;
    st.sug.hidden = true;
    st.input.setAttribute("aria-expanded", "false");
    st.input.removeAttribute("aria-activedescendant");
    st.sugActive = -1;
  }
  function measureAll(st) {
    const { bar: bar2, btn } = st;
    const br = bar2.getBoundingClientRect(), cs = getComputedStyle(bar2);
    const vw = document.documentElement.clientWidth, vh = globalThis.visualViewport?.height ?? innerHeight;
    const barRect = { x: 0, y: 0, w: br.width, h: br.height, r: Math.min(parseFloat(cs.borderTopLeftRadius) || 32, br.height / 2, br.width / 2) };
    const r = btn.getBoundingClientRect();
    const px = Math.max(0, r.left - br.left - EDGE2), pw = Math.min(br.width, r.right - br.left + EDGE2) - px;
    const pocket = { x: px, y: 0, w: Math.max(24, pw), h: br.height, r: Math.min(barRect.r, br.height / 2) };
    const right = pocket.x + pocket.w / 2 < br.width / 2;
    const bx = right ? pocket.x + pocket.w + GAP : 0;
    const body = { x: bx, y: 0, w: Math.max(40, right ? br.width - bx : pocket.x - GAP), h: br.height, r: barRect.r };
    st.barRect = barRect;
    st.pocket = pocket;
    st.body = body;
    st.origin = { x: br.left, y: br.top };
    st.originLocal = { x: bar2.clientLeft, y: bar2.clientTop };
    st.box = boxOf([barRect, pocket, body], { x0: -br.left, y0: -br.top, x1: vw - br.left, y1: vh - br.top });
    st.cell = Math.max(2.5, Math.min(5, Math.sqrt(st.box.w * st.box.h / 24e3)));
    st.pl = plan({ bar: barRect, pocket, body, grow: 1, mode: "side", gap: GAP, radius: barRect.r });
    st.pl.blob = Math.min(st.pl.len, Math.max(30, st.pl.len * BLOB));
    const ins = (r2) => ({ x: r2.x + 1, y: r2.y + 1, w: Math.max(2, r2.w - 2), h: Math.max(2, r2.h - 2), r: Math.max(0, (r2.r ?? 0) - 1) });
    st.plIn = plan({ bar: ins(barRect), pocket: ins(pocket), body: ins(body), grow: 1, mode: "side", gap: GAP, radius: Math.max(0, barRect.r - 1) });
    st.plIn.blob = st.pl.blob;
    st.pl.basePocket = st.pl.pocket;
    st.plIn.basePocket = st.plIn.pocket;
    const lr = listOf2(bar2)?.getBoundingClientRect();
    st.listLocal = lr ? { x: lr.left - br.left, y: lr.top - br.top, w: lr.width, h: lr.height } : null;
    const fx = body.x - st.box.x, fy = body.y - st.box.y;
    st.fieldRect = { x: body.x, y: body.y, w: body.w, h: body.h };
    const f3 = st.field.style;
    f3.left = `${fx}px`;
    f3.top = `${fy}px`;
    f3.width = `${body.w}px`;
    f3.height = `${body.h}px`;
    st.field.style.setProperty("--bsr-pad-r", `${Math.max(8, (body.h - 36) / 2)}px`);
  }
  function nativeEdge(m, live3) {
    const id = `${m.layer.querySelector("filter").id}-in`;
    const cp = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
    cp.id = id;
    cp.setAttribute("clipPathUnits", "userSpaceOnUse");
    m.clipPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    cp.append(m.clipPath);
    m.sv.prepend(cp);
    m.rim.setAttribute("clip-path", `url(#${id})`);
    m.rim.style.strokeWidth = "2px";
    m.layer.querySelector("feGaussianBlur")?.setAttribute("stdDeviation", "14");
    if (!live3) {
      const li = document.createElementNS("http://www.w3.org/2000/svg", "clipPath");
      li.id = `${id}-lit`;
      li.setAttribute("clipPathUnits", "userSpaceOnUse");
      m.innerClip = document.createElementNS("http://www.w3.org/2000/svg", "path");
      li.append(m.innerClip);
      m.sv.prepend(li);
      m.lights = [[1, "var(--dpi-lens-edge)"], [-1, "light-dark(rgb(0 0 0 / 0.05), rgb(0 0 0 / 0.3))"]].map(([dy, fill2]) => {
        const p = document.createElementNS("http://www.w3.org/2000/svg", "path");
        p.setAttribute("fill-rule", "evenodd");
        p.setAttribute("clip-path", `url(#${id}-lit)`);
        p.style.fill = fill2;
        p.style.stroke = "none";
        m.sv.append(p);
        return { p, dy };
      });
    }
  }
  function shiftPath(d, dx, dy) {
    return d.replace(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g, (_, a, b) => `${(+a + dx).toFixed(2)} ${(+b + dy).toFixed(2)}`);
  }
  function asBar(st, e, path) {
    const { box, barRect: b } = st, s = e.style;
    s.inset = "auto";
    s.left = `${-box.x}px`;
    s.top = `${-box.y}px`;
    s.width = `${b.w}px`;
    s.height = `${b.h}px`;
    s.boxSizing = "border-box";
    s.border = "1px solid transparent";
    s.clipPath = `path('${shiftPath(path, box.x, box.y)}')`;
  }
  function paint2(st) {
    const { m, box, bar: bar2 } = st;
    for (const pl of [st.pl, st.plIn]) {
      const b = pl.basePocket, h0 = Math.min(b.w, b.h), h = h0 + (b.h - h0) * ease4(st.u / 0.2);
      pl.pocket = { x: b.x, y: b.y + (b.h - h) / 2, w: b.w, h, r: Math.min(b.r, h / 2, b.w / 2) };
    }
    const cell = st.cell;
    const fr = frame2(st.pl, st.u, box, { cell });
    st.fr = fr;
    const o = st.originLocal;
    m.layer.style.left = `${box.x - o.x}px`;
    m.layer.style.top = `${box.y - o.y}px`;
    m.layer.style.width = `${box.w}px`;
    m.layer.style.height = `${box.h}px`;
    m.sv.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`);
    m.sh.setAttribute("viewBox", `0 0 ${box.w} ${box.h}`);
    for (const [k, v] of [["x", -64], ["y", -64], ["width", box.w + 128], ["height", box.h + 128]]) m.filt.setAttribute(k, v);
    m.fill.setAttribute("d", fr.path);
    m.shadow.setAttribute("d", fr.path);
    m.rim.setAttribute("d", fr.path);
    m.clipPath.setAttribute("d", fr.path);
    if (m.lights && st.u >= NATIVE_U) {
      const inner = frame2(st.plIn, st.u, box, { cell }).path;
      m.innerClip.setAttribute("d", inner);
      for (const l of m.lights) l.p.setAttribute("d", `${inner} ${shiftPath(inner, 0, l.dy)}`);
    }
    m.layer.style.setProperty("--bbn-m", "0");
    m.layer.style.clipPath = "";
    const native = st.u < NATIVE_U;
    if (native !== st.native) {
      st.native = native;
      m.layer.style.display = native ? "none" : "";
      if (native) bar2.removeAttribute("data-dpi-bbn");
      else bar2.setAttribute("data-dpi-bbn", reduced5() ? "search-reduced" : "search");
    }
    const live3 = bar2.hasAttribute("data-dpi-live") && !RECT_GLASS2;
    if (live3) {
      m.glass.style.display = "none";
      const surf = bar2.querySelector(":scope > .dpi-bottombar__surface");
      const frIn = native ? null : frame2(st.plIn, st.u, box, { cell });
      if (surf) surf.style.clipPath = frIn ? `path('${shiftPath(frIn.path, box.x - o.x, box.y - o.y)}')` : "";
    } else if (RECT_GLASS2) {
      const place5 = (e, r) => {
        if (!r) {
          e.style.display = "none";
          return;
        }
        e.style.display = "";
        e.style.inset = "auto";
        e.style.left = `${r.x - box.x}px`;
        e.style.top = `${r.y - box.y}px`;
        e.style.width = `${r.w}px`;
        e.style.height = `${r.h}px`;
        e.style.borderRadius = `${Math.min(r.r ?? 0, r.w / 2, r.h / 2)}px`;
      };
      place5(m.glass, fr.body);
      place5(m.glassP, fr.pocket);
      if (!st.tint) {
        for (const e of [m.glass, m.glassP]) e.style.background = "none";
        st.tint = el2("span", "dpi-bbn__glass");
        st.tint.style.webkitBackdropFilter = "none";
        st.tint.style.backdropFilter = "none";
        m.glassP.after(st.tint);
      }
      asBar(st, st.tint, fr.path);
    } else asBar(st, m.glass, fr.path);
    m.grad.setAttribute("gradientTransform", `translate(${st.body.x + st.body.w / 2 - box.x} ${st.body.y + st.body.h * 0.3 - box.y}) scale(${Math.max(40, st.body.w * 1.3)} ${Math.max(40, st.body.h * 1.5)})`);
    const f3 = st.form;
    f3.style.left = `${box.x - o.x}px`;
    f3.style.top = `${box.y - o.y}px`;
    f3.style.width = `${box.w}px`;
    f3.style.height = `${box.h}px`;
    f3.style.clipPath = st.u <= 5e-4 ? "inset(0 0 100% 0)" : `path('${fr.path}')`;
    const B = fr.body, tb = st.body;
    const lack = Math.max(B.x - tb.x, tb.x + tb.w - (B.x + B.w), B.y - tb.y, tb.y + tb.h - (B.y + B.h));
    f3.style.opacity = String((fr.reveal * ease4((8 - lack) / 8)).toFixed(3));
    const list = listOf2(bar2);
    if (list && st.listLocal) {
      const L = st.listLocal, k = fr.keep, pk = fr.pocket;
      let x0, x1;
      if (k.s > 0) {
        x0 = pk.x - k.opp;
        x1 = pk.x + pk.w - EDGE2 + k.far;
      } else {
        x0 = pk.x + EDGE2 - k.far;
        x1 = pk.x + pk.w + k.opp;
      }
      const full = st.u <= 5e-4;
      list.style.clipPath = full ? "" : `inset(0 ${Math.max(0, L.x + L.w - x1)}px 0 ${Math.max(0, x0 - L.x)}px)`;
      list.style.visibility = !full && x1 - x0 < 1 ? "hidden" : "";
    }
    bar2.style.setProperty("--dpi-bs-lens", String((1 - ease4(st.u / 0.3)).toFixed(3)));
    bar2.style.setProperty("--dpi-bs-fade", String((1 - ease4(st.u / 0.5)).toFixed(3)));
    setInert2(st, st.u > 0.04);
  }
  function setInert2(st, on) {
    if (st.inertOn === on) return;
    st.inertOn = on;
    for (const li of st.bar.querySelectorAll(":scope > .dpi-bottombar__list > li")) li.inert = on;
  }
  function tick3(now) {
    const st = S2;
    if (!st) return;
    st.raf = 0;
    let dt = Math.min(0.05, Math.max(0, (now - st.last) / 1e3));
    st.last = now;
    while (dt > 1e-6) {
      const step = Math.min(dt, 1 / 240);
      const wanted2 = Math.sign(st.target - st.u) * SPEED2;
      const a = Math.max(-ACCEL2 * step, Math.min(ACCEL2 * step, wanted2 - st.v));
      st.v += a;
      const next = st.u + st.v * step;
      if ((st.target - st.u) * (st.target - next) <= 0) {
        st.u = st.target;
        st.v = 0;
        break;
      }
      st.u = Math.max(0, Math.min(1, next));
      if (next < 0 || next > 1) st.v = 0;
      dt -= step;
    }
    paint2(st);
    if (st.u === st.target && st.v === 0) settle(st);
    else st.raf = requestAnimationFrame(tick3);
  }
  function kick2(st) {
    if (reduced5()) {
      cancelAnimationFrame(st.raf);
      st.raf = 0;
      st.u = st.target;
      st.v = 0;
      paint2(st);
      settle(st);
    } else if (!st.raf) {
      st.last = performance.now();
      st.raf = requestAnimationFrame(tick3);
    }
  }
  function reverse(st, open6) {
    if (!st) return;
    st.target = open6 ? 1 : 0;
    if (open6) {
      st.form.inert = false;
      st.btn.setAttribute("aria-expanded", "true");
      set2(st.bar, "to-search");
      emit(st.bar, "bar-search-open", { bar: st.bar });
    }
    st.openedFired = false;
    kick2(st);
  }
  function settle(st) {
    if (S2 !== st) return;
    if (st.target === 1) {
      if (st.openedFired) return;
      st.openedFired = true;
      set2(st.bar, "search");
      st.form.setAttribute("data-dpi-open", "");
    } else teardown3(st);
  }
  function listen(st) {
    const { bar: bar2 } = st, { signal } = st.ac;
    const gone = () => !bar2.isConnected || bar2.hidden || bar2.closest(isModal() ? "[hidden]" : "[hidden], [inert]") || !bar2.getBoundingClientRect().width || getComputedStyle(bar2).display === "none";
    const redo = () => {
      if (S2 !== st) return;
      if (gone()) {
        abort2();
        return;
      }
      measureAll(st);
      paint2(st);
    };
    st.ro = new ResizeObserver(redo);
    st.ro.observe(bar2);
    st.mo = new MutationObserver(() => {
      if (S2 === st && gone()) abort2();
    });
    st.mo.observe(bar2, { attributes: true, attributeFilter: ["hidden", "inert", "data-dpi-hidden"] });
    const hostsMO = bar2.parentElement;
    if (hostsMO) {
      st.mo.observe(hostsMO, { attributes: true, attributeFilter: ["hidden", "inert"] });
    }
    addEventListener("resize", redo, { signal });
    const vv = globalThis.visualViewport;
    const kb = () => {
      if (S2 !== st) return;
      if (!bar2.classList.contains("dpi-bottombar--embedded") && vv) bar2.style.setProperty("--dpi-bar-kb", `${Math.max(0, Math.round(innerHeight - (vv.height + vv.offsetTop)))}px`);
      redo();
    };
    vv?.addEventListener("resize", kb, { signal });
    vv?.addEventListener("scroll", kb, { signal });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !e.defaultPrevented && S2 === st && st.target === 1 && (document.activeElement === document.body || bar2.contains(document.activeElement)) && !st.form.contains(document.activeElement)) close2(bar2, { restoreFocus: true });
    }, { signal });
    document.addEventListener("dpi:chatbot-open", () => {
      if (S2 === st) abort2();
    }, { signal });
    addEventListener("pagehide", () => {
      if (S2 === st) abort2();
    }, { signal });
    st.index = bar2.getAttribute("data-dpi-index");
  }
  function teardown3(st, { keepFocus = false } = {}) {
    if (S2 !== st) return;
    cancelAnimationFrame(st.raf);
    st.ac.abort();
    st.ro?.disconnect();
    st.mo?.disconnect();
    const bar2 = st.bar;
    st.cfg.query = st.input.value;
    st.btn.setAttribute("aria-expanded", "false");
    bar2.removeAttribute("data-dpi-bbn");
    bar2.removeAttribute("data-dpi-bbn-kind");
    bar2.style.removeProperty("--dpi-bs-lens");
    bar2.style.removeProperty("--dpi-bs-fade");
    bar2.style.removeProperty("--dpi-bar-kb");
    const surf = bar2.querySelector(":scope > .dpi-bottombar__surface");
    if (surf) surf.style.clipPath = "";
    const list = listOf2(bar2);
    if (list) {
      list.style.clipPath = "";
      list.style.visibility = "";
    }
    st.inertOn = true;
    setInert2(st, false);
    if (!keepFocus && st.form.contains(document.activeElement)) st.btn.focus({ preventScroll: true });
    st.m.layer.remove();
    st.form.remove();
    st.sug.remove();
    S2 = null;
    set2(bar2, "nav");
  }
  function abort2() {
    const st = S2;
    if (!st) return;
    emit(st.bar, "bar-search-close", { bar: st.bar, query: st.input.value });
    teardown3(st, { keepFocus: !st.bar.isConnected });
  }
  onIdle((bar2) => {
    const w = wanted(bar2);
    if (!w) return;
    want(bar2, null);
    trackPending(bar2, false);
    if (S2 || !canOpen(bar2)) return;
    start(bar2, { focus: w.focus });
  });

  // dpi/js/bottombar.js
  var DRAG_START = 8;
  var DRAG_START_TOUCH = 10;
  var EDGE3 = 44;
  var EDGE_SPEED = 720;
  var SUPPRESS_MS = 450;
  var OUTSIDE = 24;
  var M = 18;
  var reduced6 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var FIELD = 'input:not([type="button"],[type="submit"],[type="checkbox"],[type="radio"],[type="range"],[type="reset"]), textarea, select, [contenteditable=""], [contenteditable="true"]';
  var clamp4 = (v, a, b) => Math.min(Math.max(v, a), b);
  var SK = "dpi-bar-prev";
  var states = ownedMap();
  function setup5(bar2) {
    if (states.has(bar2)) return;
    const items2 = () => [...bar2.querySelectorAll(":scope > .dpi-bottombar__list .dpi-bottombar__item")];
    const st = { phase: "idle", pointerId: null, startX: 0, item: null, index: 0, pending: null, suppressUntil: 0, lx: 0, ly: 0, acc: 0, adopted: false, bypass: false };
    states.set(bar2, st);
    const curIndex = () => {
      const i = Number(bar2.getAttribute("data-dpi-index"));
      return Number.isFinite(i) ? i : -1;
    };
    const itemRect = (i) => {
      const it = items2()[i];
      const br = bar2.getBoundingClientRect();
      const r = it.getBoundingClientRect();
      return { x: r.left - br.left - bar2.clientLeft, y: r.top - br.top - bar2.clientTop, w: r.width, h: r.height };
    };
    const lensRest = () => {
      const i = clamp4(curIndex(), 0, items2().length - 1);
      const r = itemRect(i);
      return { x: r.x - 4, y: r.y - 10, w: r.w + 8, h: r.h + 20 };
    };
    const center = (i) => {
      const r = itemRect(i);
      return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    };
    const inline = bar2.hasAttribute("data-dpi-inline");
    const embedded = bar2.hasAttribute("data-dpi-embedded");
    const list = bar2.querySelector(":scope > .dpi-bottombar__list");
    if (bar2.hasAttribute("data-dpi-bar-search")) setup4(bar2);
    if (canRefract) bar2.setAttribute("data-dpi-live", "");
    const drop2 = createDrop(bar2, { surface: false, backdrop: true, margin: M, optics: "droplens", content: true, base: true, rest: lensRest, radius: "pill", stretch: { gain: 0.011, max: 0.38 }, spring: { k: 300, c: 19 } });
    bar2.setAttribute("data-dpi-lens", curIndex() < 0 ? "none" : "");
    const syncClone = () => {
      const c = bar2.querySelector(":scope > .dpi-drop__stage .dpi-bottombar__list");
      if (c && list) c.scrollLeft = list.scrollLeft;
    };
    const lensVisible = () => {
      if (bar2.hasAttribute("data-dpi-dragging")) {
        bar2.removeAttribute("data-dpi-lens-offscreen");
        return;
      }
      const i = curIndex();
      const it = items2()[i];
      if (!it || !list) return;
      const a = it.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      const vis = Math.min(a.right, l.right) - Math.max(a.left, l.left);
      bar2.toggleAttribute("data-dpi-lens-offscreen", vis < a.width * 0.6);
    };
    const scrolls = () => !!list && list.scrollWidth > list.clientWidth + 1;
    const reveal2 = (it, smooth = false) => {
      if (!list || !it || !scrolls()) return;
      const a = it.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      const target2 = list.scrollLeft + (a.left - l.left) - (l.width - a.width) / 2;
      list.scrollTo({ left: clamp4(target2, 0, list.scrollWidth - list.clientWidth), behavior: smooth && !reduced6() ? "smooth" : "auto" });
    };
    const refreshScroll = () => {
      bar2.toggleAttribute("data-dpi-scrolls", scrolls());
      syncClone();
      lensVisible();
      drop2.measure();
    };
    list?.addEventListener("scroll", () => {
      syncClone();
      lensVisible();
      drop2.render();
    }, { passive: true });
    list?.addEventListener("focusin", (e) => {
      const it = e.target.closest?.(".dpi-bottombar__item");
      if (it) reveal2(it, true);
    });
    drop2.onContent = syncClone;
    let surface = null;
    let surfaceGlass = null;
    const barRadius = () => parseFloat(getComputedStyle(bar2).borderTopLeftRadius) || 32;
    const syncSurface = (mode2) => {
      const want2 = bar2.hasAttribute("data-dpi-live") && mode2 && mode2 !== "solid";
      if (want2 && !surface) {
        surface = document.createElement("span");
        surface.className = "dpi-bottombar__surface";
        surface.setAttribute("aria-hidden", "true");
        bar2.prepend(surface);
        const { float, ...o } = PRESETS.bar;
        surfaceGlass = createGlass(surface, { ...o, refraction: 20, bezel: 0.5, blur: 5, specular: 0, mode: "backdrop", fit: true, radius: Math.round(barRadius()), sync: true });
      } else if (!want2 && surface) {
        surfaceGlass?.destroy();
        surface.remove();
        surface = surfaceGlass = null;
      }
    };
    onRemoved(bar2, () => {
      surfaceGlass?.destroy();
      surfaceGlass = null;
      surface = null;
    });
    bar2.addEventListener("dpi:glass-mode", (e) => {
      if (e.target === bar2) syncSurface(e.detail.mode);
    });
    new ResizeObserver(() => surfaceGlass?.update({ radius: Math.round(barRadius()) })).observe(bar2);
    st.drop = drop2;
    const mode = bar2.dataset.dpiGlassMode;
    if (mode) drop2.setMode(mode);
    try {
      const prev = JSON.parse(sessionStorage.getItem(SK) || "null");
      sessionStorage.removeItem(SK);
      const cur2 = curIndex();
      if (prev && prev.p !== location.pathname && Date.now() - prev.t < 8e3 && prev.i !== cur2 && cur2 >= 0 && prev.i < items2().length && !reduced6() && !inline) {
        drop2.moveTo(center(prev.i).x - center(cur2).x, 0, { immediate: true });
        requestAnimationFrame(() => drop2.moveTo(0, 0));
      }
    } catch {
    }
    listenWhile(bar2, window, "pagehide", () => {
      try {
        sessionStorage.setItem(SK, JSON.stringify({ i: curIndex(), p: location.pathname, t: Date.now() }));
      } catch {
      }
    });
    const itemAt = (x) => {
      const all = items2();
      const lr = (list || bar2).getBoundingClientRect();
      let best = 0;
      let bd = Infinity;
      all.forEach((it, i) => {
        const r = it.getBoundingClientRect();
        const l = Math.max(r.left, lr.left);
        const rr = Math.min(r.right, lr.right);
        const d = rr <= l ? 1e4 + Math.min(Math.abs(x - r.left), Math.abs(x - r.right)) : x < l ? l - x : x > rr ? x - rr : 0;
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      return best;
    };
    const track3 = () => {
      const br = bar2.getBoundingClientRect();
      const all = items2();
      const c0 = center(st.index);
      const lo = center(0).x - c0.x - 6;
      const hi = center(all.length - 1).x - c0.x + 6;
      const px = st.lx - br.left - bar2.clientLeft;
      const py = st.ly - br.top - bar2.clientTop;
      drop2.pull(clamp4(px - c0.x, lo, hi), clamp4((py - c0.y) * 0.22, -9, 9), 10, 10);
      const c = itemAt(st.lx);
      all.forEach((it, i) => i === c ? it.setAttribute("data-dpi-candidate", "") : it.removeAttribute("data-dpi-candidate"));
    };
    let auto = 0;
    let autoT = 0;
    function stopAuto() {
      if (auto) cancelAnimationFrame(auto);
      auto = 0;
      st.acc = 0;
    }
    const autoStep = (t) => {
      auto = 0;
      if (st.phase !== "dragging" || !scrolls()) return;
      const dt = Math.min(0.05, (t - (autoT || t)) / 1e3);
      autoT = t;
      const lr = list.getBoundingClientRect();
      const zone = Math.min(EDGE3, lr.width / 3);
      const dl = st.lx - lr.left;
      const dr = lr.right - st.lx;
      const v = dl < zone ? -(1 - clamp4(dl, 0, zone) / zone) : dr < zone ? 1 - clamp4(dr, 0, zone) / zone : 0;
      if (v) {
        st.acc += v * EDGE_SPEED * dt;
        const step = Math.trunc(st.acc);
        if (step) {
          st.acc -= step;
          const before = list.scrollLeft;
          list.scrollLeft = before + step;
          const moved = list.scrollLeft - before;
          if (moved) {
            drop2.rebase(moved, 0);
            syncClone();
            track3();
          }
        }
      } else st.acc = 0;
      auto = requestAnimationFrame(autoStep);
    };
    const startAuto = () => {
      if (!auto && scrolls()) {
        autoT = 0;
        auto = requestAnimationFrame(autoStep);
      }
    };
    const relax = () => {
      drop2.setSpring(300, 19);
      drop2.pull(0, 0, 0, 0);
    };
    const reset = () => {
      stopAuto();
      st.pending?.();
      bar2.removeAttribute("data-dpi-dragging");
      bar2.querySelectorAll("[data-dpi-pressed],[data-dpi-candidate]").forEach((el6) => {
        el6.removeAttribute("data-dpi-pressed");
        el6.removeAttribute("data-dpi-candidate");
      });
      st.phase = "idle";
      st.pointerId = null;
      st.item = null;
      relax();
    };
    let shown = curIndex();
    const syncIndex = () => {
      const i = curIndex();
      if (i === shown) return;
      const from = shown;
      shown = i;
      bar2.setAttribute("data-dpi-lens", i < 0 ? "none" : "");
      if (st.phase === "dragging" || st.phase === "pressed" || i < 0 || from < 0 || inline) {
        drop2.measure();
        return;
      }
      const n = items2().length;
      const a = center(clamp4(from, 0, n - 1));
      const b = center(clamp4(i, 0, n - 1));
      reveal2(items2()[clamp4(i, 0, n - 1)], true);
      if (reduced6()) {
        drop2.measure();
        return;
      }
      drop2.rebase(a.x - b.x, a.y - b.y);
      relax();
    };
    new MutationObserver(syncIndex).observe(bar2, { attributes: true, attributeFilter: ["data-dpi-index"] });
    function settle2(fn) {
      let done7 = false;
      const run = () => {
        if (done7) return;
        done7 = true;
        bar2.removeEventListener("dpi:drop-settled", run);
        clearTimeout(timer);
        st.pending = null;
        fn();
      };
      const timer = setTimeout(run, 900);
      bar2.addEventListener("dpi:drop-settled", run);
      st.pending = () => {
        done7 = true;
        bar2.removeEventListener("dpi:drop-settled", run);
        clearTimeout(timer);
        st.pending = null;
      };
      if (reduced6()) run();
    }
    function select2(i, then) {
      const from = center(clamp4(curIndex(), 0, items2().length - 1));
      shown = i;
      bar2.setAttribute("data-dpi-index", String(i));
      reveal2(items2()[i], true);
      const to = center(i);
      drop2.rebase(from.x - to.x, from.y - to.y);
      relax();
      settle2(then);
    }
    bar2.addEventListener("dragstart", (e) => e.preventDefault());
    bar2.addEventListener("touchmove", (e) => {
      if (st.phase === "dragging" && e.cancelable) e.preventDefault();
    }, { passive: false });
    bar2.addEventListener("contextmenu", (e) => {
      if (st.phase !== "idle") e.preventDefault();
    });
    bar2.addEventListener("pointerdown", (e) => {
      if (e.button !== 0 || !e.isPrimary) return;
      const item2 = e.target.closest(".dpi-bottombar__item");
      if (!item2) return;
      reset();
      st.suppressUntil = 0;
      st.adopted = false;
      st.lx = e.clientX;
      st.ly = e.clientY;
      st.phase = "pressed";
      st.pointerId = e.pointerId;
      st.startX = e.clientX;
      st.item = item2;
      st.index = curIndex();
      item2.setAttribute("data-dpi-pressed", "");
      const j = items2().indexOf(item2);
      if (st.index >= 0 && j >= 0) {
        const dx = center(j).x - center(st.index).x;
        drop2.setSpring(520, 26);
        drop2.pull(dx * 0.22, 0, 8, 8);
      }
    });
    bar2.addEventListener("pointermove", (e) => {
      if (e.pointerId !== st.pointerId) return;
      st.lx = e.clientX;
      st.ly = e.clientY;
      if (st.phase === "pressed") {
        if (Math.abs(e.clientX - st.startX) < (e.pointerType === "touch" ? DRAG_START_TOUCH : DRAG_START)) return;
        if (st.index < 0) {
          const j = items2().indexOf(st.item);
          if (j < 0) return;
          st.adopted = true;
          st.index = j;
          shown = j;
          bar2.setAttribute("data-dpi-index", String(j));
          bar2.setAttribute("data-dpi-lens", "");
          drop2.moveTo(0, 0, { immediate: true });
        }
        st.phase = "dragging";
        try {
          bar2.setPointerCapture(e.pointerId);
        } catch {
        }
        st.item?.removeAttribute("data-dpi-pressed");
        bar2.setAttribute("data-dpi-dragging", "");
        drop2.setSpring(700, 38);
        emit(bar2, "bar-drag", { phase: "start" });
        startAuto();
      }
      if (st.phase !== "dragging") return;
      track3();
    });
    const end = (e, cancelled) => {
      if (e.pointerId !== st.pointerId) return;
      if (st.phase === "pressed") {
        st.item?.removeAttribute("data-dpi-pressed");
        st.phase = "idle";
        st.pointerId = null;
        relax();
        return;
      }
      if (st.phase !== "dragging") return;
      st.suppressUntil = performance.now() + SUPPRESS_MS;
      stopAuto();
      const list2 = items2();
      const br = bar2.getBoundingClientRect();
      const outside = e.clientX < br.left - OUTSIDE || e.clientX > br.right + OUTSIDE || e.clientY < br.top - OUTSIDE || e.clientY > br.bottom + OUTSIDE;
      const c = itemAt(e.clientX);
      const pid = e.pointerId;
      st.pointerId = null;
      st.phase = "settling";
      try {
        bar2.releasePointerCapture(pid);
      } catch {
      }
      bar2.removeAttribute("data-dpi-dragging");
      lensVisible();
      list2.forEach((it) => it.removeAttribute("data-dpi-candidate"));
      const target2 = !cancelled && !outside && (c !== st.index || st.adopted) ? list2[c] : null;
      if (target2) {
        select2(c, () => {
          st.phase = "idle";
          st.item = null;
          emit(bar2, "bar-select", { index: c });
          st.bypass = true;
          target2.click();
          st.bypass = false;
        });
      } else {
        if (st.adopted) {
          shown = -1;
          bar2.setAttribute("data-dpi-index", "-1");
          bar2.setAttribute("data-dpi-lens", "none");
        }
        relax();
        if (!st.adopted) reveal2(list2[clamp4(curIndex(), 0, list2.length - 1)], true);
        settle2(() => {
          st.phase = "idle";
          st.item = null;
        });
      }
    };
    bar2.addEventListener("dpi:bar-cancel-gesture", () => {
      if ((st.phase === "dragging" || st.phase === "pressed") && st.pointerId !== null) end({ pointerId: st.pointerId, clientX: -1e6, clientY: -1e6 }, true);
    });
    listenWhile(bar2, document, "pointerup", (e) => end(e, false));
    listenWhile(bar2, document, "pointercancel", (e) => end(e, true));
    bar2.addEventListener("lostpointercapture", (e) => e.target === bar2 && st.phase === "dragging" && end(e, true));
    listenWhile(bar2, window, "blur", () => st.phase === "dragging" && st.pointerId !== null && end({ pointerId: st.pointerId, clientX: -1e6, clientY: -1e6 }, true));
    listenWhile(bar2, window, "keydown", (e) => e.key === "Escape" && st.phase === "dragging" && st.pointerId !== null && end({ pointerId: st.pointerId, clientX: -1e6, clientY: -1e6 }, true));
    bar2.addEventListener("click", (e) => {
      const item2 = e.target.closest(".dpi-bottombar__item");
      if (!item2) return;
      if (st.suppressUntil > performance.now() && e.isTrusted) {
        st.suppressUntil = 0;
        e.preventDefault();
        e.stopPropagation();
        return;
      }
      item2.setAttribute("data-dpi-pop", "");
      setTimeout(() => item2.removeAttribute("data-dpi-pop"), 500);
      const plain = !st.bypass && e.button === 0 && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey && (item2.target === "" || item2.target === "_self");
      const j = items2().indexOf(item2);
      if (!plain || reduced6() || inline || j === curIndex() || curIndex() < 0 || st.phase === "settling") return;
      e.preventDefault();
      st.phase = "settling";
      select2(j, () => {
        st.phase = "idle";
        st.bypass = true;
        item2.click();
        st.bypass = false;
      });
    }, true);
    bar2.addEventListener("keydown", (e) => {
      const keys = { ArrowLeft: -1, ArrowRight: 1, Home: "first", End: "last" };
      if (!(e.key in keys)) return;
      const list2 = items2();
      const i = list2.indexOf(document.activeElement);
      if (i < 0) return;
      const rtl2 = getComputedStyle(bar2).direction === "rtl";
      const k = keys[e.key];
      const next = k === "first" ? 0 : k === "last" ? list2.length - 1 : clamp4(i + (rtl2 ? -k : k), 0, list2.length - 1);
      e.preventDefault();
      list2[next].focus();
    });
    const measure3 = () => {
      const h = bar2.getBoundingClientRect().height;
      if (h) document.documentElement.style.setProperty("--dpi-bar-h-measured", `${Math.ceil(h)}px`);
      drop2.measure();
    };
    new ResizeObserver(() => {
      refreshScroll();
      if (inline || embedded) drop2.measure();
      else measure3();
    }).observe(bar2);
    if (embedded) listenWhile(bar2, window, "resize", () => drop2.measure());
    reveal2(items2()[clamp4(curIndex(), 0, items2().length - 1)]);
    requestAnimationFrame(refreshScroll);
    if (!inline && !embedded) measure3();
    document.fonts?.ready.then(() => {
      drop2.measure();
      drop2.refreshContent();
    });
    if (inline || embedded) return;
    const vv = window.visualViewport;
    const update = () => {
      const field = document.activeElement?.matches?.(FIELD) && !bar2.contains(document.activeElement);
      const shrunk = vv ? vv.height < window.innerHeight * 0.8 : false;
      bar2.toggleAttribute("data-dpi-hidden", !!(field && shrunk));
    };
    if (vv) listenWhile(bar2, vv, "resize", update);
    listenWhile(bar2, document, "focusin", update);
    listenWhile(bar2, document, "focusout", () => setTimeout(update, 0));
  }
  function bind7() {
  }

  // dpi/js/indicator.js
  var indicator_exports = {};
  __export(indicator_exports, {
    setup: () => setup6
  });
  var reduced7 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function place2(root4, ind, animate) {
    const input = root4.querySelector(".dpi-segmented__input:checked");
    const label2 = input?.nextElementSibling;
    if (!label2) {
      ind.hidden = true;
      return;
    }
    ind.hidden = false;
    const rr = root4.getBoundingClientRect();
    const lr = label2.getBoundingClientRect();
    if (!lr.width) return;
    const x = lr.left - rr.left - root4.clientLeft;
    const y = lr.top - rr.top - root4.clientTop;
    if (!animate) ind.removeAttribute("data-dpi-ready");
    ind.style.width = `${lr.width}px`;
    ind.style.height = `${lr.height}px`;
    ind.style.transform = `translate(${x}px, ${y}px)`;
    if (!animate) {
      void ind.offsetWidth;
      ind.setAttribute("data-dpi-ready", "");
    } else if (!reduced7()) {
      ind.removeAttribute("data-dpi-moving");
      void ind.offsetWidth;
      ind.setAttribute("data-dpi-moving", "");
    }
  }
  function setup6(root4) {
    if (root4.dataset.dpiIndicator) return;
    root4.dataset.dpiIndicator = "1";
    const ind = document.createElement("span");
    ind.className = "dpi-segmented__indicator";
    ind.setAttribute("aria-hidden", "true");
    root4.prepend(ind);
    root4.classList.add("dpi-segmented--indicator");
    place2(root4, ind, false);
    root4.addEventListener("change", () => place2(root4, ind, true));
    ind.addEventListener("animationend", () => ind.removeAttribute("data-dpi-moving"));
    new ResizeObserver(() => place2(root4, ind, false)).observe(root4);
    document.fonts?.ready.then(() => place2(root4, ind, false));
  }

  // dpi/js/toggle.js
  var toggle_exports = {};
  __export(toggle_exports, {
    setup: () => setup7
  });
  var M2 = 18;
  var clamp5 = (v, a, b) => Math.min(Math.max(v, a), b);
  var inst = ownedMap();
  function setupToggle(host) {
    if (inst.has(host)) return inst.get(host);
    const input = host.querySelector(".dpi-toggle__input");
    const knob = host.querySelector(".dpi-toggle__knob");
    const num2 = (v) => parseFloat(getComputedStyle(host).getPropertyValue(v));
    const geom = () => {
      const kw = num2("--dpi-knob-w");
      const kh = num2("--dpi-knob-h");
      return { kw, kh, W: host.offsetWidth, H: host.offsetHeight, travel: host.offsetWidth - kw - 4 };
    };
    const rest = () => {
      const g = geom();
      return { x: 2, y: (g.H - g.kh) / 2, w: g.kw, h: g.kh };
    };
    const themed = host.classList.contains("dpi-toggle--theme");
    const d = createDrop(host, {
      surface: false,
      margin: M2,
      optics: "droplens",
      content: true,
      rest,
      radius: "pill",
      ...themed ? { backdrop: true, base: true } : {},
      stretch: { gain: 0.012, max: 0.42 },
      spring: { k: 420, c: 20 },
      onPaint: (p) => {
        knob.style.left = `${p.x}px`;
        knob.style.top = `${p.y}px`;
        knob.style.width = `${p.w}px`;
        knob.style.height = `${p.h}px`;
      }
    });
    host.setAttribute("data-dpi-lens", "");
    const pos = () => input.checked ? geom().travel : 0;
    d.moveTo(pos(), 0, { immediate: true });
    const st = { down: false, drag: false, id: null, x0: 0, ox0: 0, suppressUntil: 0 };
    const relax = () => {
      d.setSpring(420, 20);
      d.pull(pos(), 0, 0, 0);
    };
    const sync8 = () => {
      host.toggleAttribute("data-dpi-checked", input.checked);
      d.refreshContent();
    };
    sync8();
    input.addEventListener("change", () => {
      sync8();
      if (!st.drag) relax();
    });
    host.addEventListener("pointerdown", (e) => {
      if (input.disabled || e.button !== 0 || !e.isPrimary) return;
      st.suppressUntil = 0;
      Object.assign(st, { down: true, drag: false, id: e.pointerId, x0: e.clientX, ox0: pos() });
      d.setSpring(560, 30);
      d.pull(pos(), 0, 7, 7);
    });
    host.addEventListener("pointermove", (e) => {
      if (!st.down || e.pointerId !== st.id) return;
      const dx = e.clientX - st.x0;
      if (!st.drag && Math.abs(dx) > (e.pointerType === "touch" ? 6 : 4)) {
        st.drag = true;
        try {
          host.setPointerCapture(e.pointerId);
        } catch {
        }
        host.setAttribute("data-dpi-dragging", "");
      }
      if (st.drag) d.pull(clamp5(st.ox0 + dx, -3, geom().travel + 3), 0, 9, 9);
    });
    const finish2 = (e, cancelled) => {
      if (!st.down || e.pointerId !== st.id) return;
      const dragged = st.drag;
      Object.assign(st, { down: false, drag: false, id: null });
      host.removeAttribute("data-dpi-dragging");
      try {
        host.releasePointerCapture(e.pointerId);
      } catch {
      }
      if (dragged) {
        if (e.type === void 0 && cancelled) {
          st.suppressUntil = Infinity;
          document.addEventListener("pointerup", () => {
            st.suppressUntil = performance.now() + 450;
          }, { once: true });
        } else st.suppressUntil = performance.now() + 450;
        if (!cancelled) {
          const t = geom().travel;
          const next = d.get("ox") + d.velocity("ox") * 0.08 > t / 2;
          if (next !== input.checked) {
            input.checked = next;
            input.dispatchEvent(new Event("input", { bubbles: true }));
            input.dispatchEvent(new Event("change", { bubbles: true }));
          }
        }
      }
      relax();
    };
    host.addEventListener("pointerup", (e) => finish2(e, false));
    host.addEventListener("pointercancel", (e) => finish2(e, true));
    host.addEventListener("pointerleave", (e) => {
      if (st.down && !st.drag) finish2(e, true);
    });
    host.addEventListener("lostpointercapture", (e) => {
      if (st.drag && e.target === host) finish2(e, true);
    });
    listenWhile(host, window, "keydown", (e) => {
      if (e.key === "Escape" && st.drag) finish2({ pointerId: st.id }, true);
    });
    host.addEventListener("click", (e) => {
      if (st.suppressUntil > performance.now() && e.isTrusted) {
        st.suppressUntil = 0;
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    input.form?.addEventListener("reset", () => setTimeout(() => {
      sync8();
      relax();
    }, 0));
    new ResizeObserver(() => {
      d.measure();
      d.moveTo(pos(), 0, { immediate: !d.running });
      d.refreshContent();
    }).observe(host);
    document.fonts?.ready.then(() => {
      d.measure();
      d.refreshContent();
    });
    const settle2 = () => {
      sync8();
      d.moveTo(pos(), 0, { immediate: true });
    };
    const rec2 = { d, settle: settle2, themed };
    inst.set(host, rec2);
    return rec2;
  }
  registerKind("toggle", {
    apply(host, mode) {
      const { d, settle: settle2, themed } = setupToggle(host);
      d.setMode(mode);
      settle2();
      d.render();
      if (themed) host.setAttribute("data-dpi-ready", "");
    }
  });
  var setup7 = setupToggle;

  // dpi/js/expand.js
  var expand_exports = {};
  __export(expand_exports, {
    get: () => get3,
    setup: () => setup8
  });
  var reduced8 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp6 = (v, a, b) => Math.min(Math.max(v, a), b);
  var NS4 = "http://www.w3.org/2000/svg";
  var inst2 = ownedMap();
  var surfaceId = 0;
  var SPRING = [380, 39];
  var OPEN_SPRING = [2880, 107.4];
  var SPLIT_SPRING = [56, 15];
  var CLOSE_SPRING = [352, 37.6];
  var DETACH_FROM = 0.12;
  var DETACH_TO = 0.6;
  var OPEN_CONTACT = 0.25;
  function buildBridge(trigger2) {
    const el6 = document.createElement("div");
    el6.className = "dpi-expand__goo";
    el6.setAttribute("aria-hidden", "true");
    const body = document.createElement("span");
    body.className = "dpi-expand__goo-body";
    el6.append(body);
    const refresh2 = () => {
      const t = trigger2.querySelector(":scope > .dpi-drop__tint");
      if (!t) return;
      const cs = getComputedStyle(t);
      body.style.setProperty("background-image", cs.backgroundImage);
      body.style.setProperty("background-color", cs.backgroundColor);
    };
    const hide2 = () => {
      if (!body.hidden) body.hidden = true;
      return null;
    };
    const paint4 = (A, B) => {
      const [L, R] = A.x + A.w / 2 <= B.x + B.w / 2 ? [A, B] : [B, A];
      const rL = L.h / 2;
      const rR = R.h / 2;
      const rmin = Math.min(rL, rR);
      const g = R.x - (L.x + L.w);
      const gmax = Math.min(L.h, R.h);
      if (g <= 0 || g >= gmax) return hide2();
      const s = 1 - g / gmax;
      const mid = rmin * 0.85 * s ** 0.7;
      if (mid < 1.5) return hide2();
      const end = mid + 0.5 * (rmin - mid);
      const yc = (L.y + L.h / 2 + R.y + R.h / 2) / 2;
      const sinL = Math.min(0.999, end / rL), sinR = Math.min(0.999, end / rR);
      const cosL = Math.sqrt(1 - sinL * sinL), cosR = Math.sqrt(1 - sinR * sinR);
      const xl = L.x + L.w - rL + rL * cosL;
      const xr = R.x + rR - rR * cosR;
      if (xr - xl < 0.5) return hide2();
      const bw = xr - xl;
      const bh = 2 * end;
      const k = cosL + cosR;
      const t = Math.min(bw / 2, k > 0.05 ? 8 * (end - mid) / (3 * k) : bw / 2);
      const f3 = (n) => n.toFixed(2);
      const d = `M 0 0 C ${f3(t * sinL)} ${f3(t * cosL)} ${f3(bw - t * sinR)} ${f3(t * cosR)} ${f3(bw)} 0 L ${f3(bw)} ${f3(bh)} C ${f3(bw - t * sinR)} ${f3(bh - t * cosR)} ${f3(t * sinL)} ${f3(bh - t * cosL)} 0 ${f3(bh)} Z`;
      const st = body.style;
      st.left = `${f3(xl)}px`;
      st.top = `${f3(yc - end)}px`;
      st.width = `${f3(bw)}px`;
      st.height = `${f3(bh)}px`;
      st.clipPath = `path('${d}')`;
      if (body.hidden) body.hidden = false;
      return { xl, xr, left: L === A ? "a" : "b" };
    };
    const reset = () => {
      body.hidden = true;
    };
    body.hidden = true;
    return { goo: el6, refresh: refresh2, paint: paint4, reset };
  }
  function openingOutline(a, b, limit, pullPrimary = false) {
    const ra = Math.min(a.w, a.h) / 2, rb = Math.min(b.w, b.h) / 2;
    const cy = a.y + a.h / 2;
    const ca = a.x + a.w / 2, cb = b.x + rb, cr = b.x + b.w - rb;
    const distance = Math.max(0, cb - ca);
    const gap = distance - ra - rb;
    return (ox = 0, oy = 0) => {
      const pt = (x, y) => `${(x - ox).toFixed(3)} ${(y - oy).toFixed(3)}`;
      const arc = (r, x, y) => `A ${r.toFixed(3)} ${r.toFixed(3)} 0 0 1 ${pt(x, y)}`;
      const circle = () => `M ${pt(ca, cy - ra)} ${arc(ra, ca + ra, cy)} ${arc(ra, ca, cy + ra)} ${arc(ra, ca - ra, cy)} ${arc(ra, ca, cy - ra)} Z`;
      const pill = () => `M ${pt(cb, cy - rb)} L ${pt(cr, cy - rb)} ${arc(rb, cr + rb, cy)} ${arc(rb, cr, cy + rb)} L ${pt(cb, cy + rb)} ${arc(rb, cb - rb, cy)} ${arc(rb, cb, cy - rb)} Z`;
      if (gap >= limit) return `${circle()} ${pill()}`;
      const cosine = clamp6(distance / (ra + rb + limit), 0, 1);
      let end = Math.min(ra, rb) * Math.sqrt(Math.max(0, 1 - cosine * cosine));
      if (distance > 1e-3 && distance < ra + rb) {
        const ix = (distance * distance + ra * ra - rb * rb) / (2 * distance);
        end = Math.max(end, Math.sqrt(Math.max(0, ra * ra - ix * ix)));
      }
      const caCos = Math.sqrt(Math.max(0, 1 - (end / ra) ** 2));
      const cbCos = Math.sqrt(Math.max(0, 1 - (end / rb) ** 2));
      const phase = clamp6((gap + ra) / (limit + ra), 0, 1);
      const tension = Math.sin(Math.PI * phase) ** 2;
      const xr = cb - rb * cbCos;
      const available2 = Math.max(0, xr - (ca + ra * caCos));
      const pull = pullPrimary ? Math.min(ra * 0.65 * tension, available2 * 0.9 / Math.max(0.05, caCos)) : 0;
      const rightRadius = ra + pull;
      const primaryArc = (x, y) => `A ${rightRadius.toFixed(3)} ${ra.toFixed(3)} 0 0 1 ${pt(x, y)}`;
      const xl = ca + rightRadius * caCos;
      const length = Math.max(0, Math.min((xr - xl) * 0.45, end * 0.7));
      const tangentX = rightRadius * end / (ra * ra);
      const tangentLength = Math.hypot(tangentX, caCos) || 1;
      const dxA = length * tangentX / tangentLength, dyA = length * caCos / tangentLength;
      const dxB = length * end / rb, dyB = length * cbCos;
      const top = `${primaryArc(xl, cy - end)} C ${pt(xl + dxA, cy - end + dyA)} ${pt(xr - dxB, cy - end + dyB)} ${pt(xr, cy - end)} ${arc(rb, cb, cy - rb)}`;
      const bottom = `${arc(rb, xr, cy + end)} C ${pt(xr - dxB, cy + end - dyB)} ${pt(xl + dxA, cy + end - dyA)} ${pt(xl, cy + end)} ${primaryArc(ca, cy + ra)}`;
      return `M ${pt(ca, cy - ra)} ${top} L ${pt(cr, cy - rb)} ${arc(rb, cr + rb, cy)} ${arc(rb, cr, cy + rb)} L ${pt(cb, cy + rb)} ${bottom} ${arc(ra, ca - ra, cy)} ${arc(ra, ca, cy - ra)} Z`;
    };
  }
  function setup8(root4) {
    if (inst2.has(root4)) return inst2.get(root4);
    const trigger2 = root4.querySelector("[data-dpi-expand-trigger]");
    const panel2 = root4.querySelector("[data-dpi-expand-panel]");
    if (!trigger2 || !panel2) return null;
    const items2 = panel2.querySelector(".dpi-expand__items");
    const dA = get(trigger2);
    const dB = get(panel2);
    const st = { open: false };
    root4.setAttribute("data-dpi-ready", "");
    const rec2 = { st };
    inst2.set(root4, rec2);
    let transitioning = false;
    const rectOf = (el6) => ({ x: el6.offsetLeft, y: el6.offsetTop, w: el6.offsetWidth, h: el6.offsetHeight });
    const space = (right) => {
      if (right == null) {
        if (panel2.style.marginInlineEnd) panel2.style.marginInlineEnd = "";
        if (panel2.style.translate) panel2.style.translate = "";
        return;
      }
      const full = panel2.offsetLeft + panel2.offsetWidth, t = trigger2.offsetLeft + trigger2.offsetWidth;
      const m = `${(-Math.max(0, full - Math.max(t, Math.min(full, right)))).toFixed(2)}px`;
      if (panel2.style.marginInlineEnd !== m) panel2.style.marginInlineEnd = m;
      const park = right <= 0 && !transitioning ? `${m} 0` : "";
      if (panel2.style.translate !== park) panel2.style.translate = park;
    };
    const setAria = (o) => {
      root4.toggleAttribute("data-dpi-open", o);
      trigger2.setAttribute("aria-expanded", String(o));
    };
    if (!dA || !dB) {
      setAria(false);
      panel2.inert = true;
      root4.setAttribute("data-dpi-collapsed", "");
      space(0);
      const toggle2 = (o) => {
        st.open = o;
        setAria(o);
        panel2.inert = !o;
        root4.toggleAttribute("data-dpi-collapsed", !o);
        space(o ? null : 0);
      };
      trigger2.addEventListener("click", () => toggle2(!st.open));
      root4.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && st.open) {
          toggle2(false);
          trigger2.focus({ preventScroll: true });
        }
      });
      return rec2;
    }
    dA.setSpring(...SPRING);
    dB.setSpring(...SPRING);
    dB.stretch.gain /= 2;
    const material = buildBridge(trigger2);
    const goo = material.goo;
    root4.prepend(goo);
    listenWhile(root4, document, "dpi:theme-change", () => material.refresh());
    const poses = { a: null, b: null };
    const rectAt = (el6, p) => {
      const o = rectOf(el6);
      return { x: o.x + p.x, y: o.y + p.y, w: p.w, h: p.h, r: p.r };
    };
    let lastMotion = null;
    let lastInert = null;
    let openingVisual = false;
    let sharedVisual = false;
    let slowDetach = false;
    dA.exactCenter = true;
    panel2.querySelectorAll(".dpi-expand__item").forEach((it) => elasticOnly(it));
    const clearExtra = () => {
      root4.removeAttribute("data-dpi-merged");
      if (dB.extra) {
        dB.extra = null;
        dB.render();
      }
    };
    let interactive = false;
    const itemEls = [...panel2.querySelectorAll(".dpi-expand__item")];
    const setVisible = (el6, on) => {
      if (on === el6.hasAttribute("data-dpi-pending")) el6.toggleAttribute("data-dpi-pending", !on);
    };
    const showItems = (on) => {
      interactive = on;
      if (items2) items2.inert = !on;
      panel2.inert = !on;
      lastInert = !on;
      applyItems();
    };
    const insideRounded = (r, px, py) => {
      if (px < r.x || px > r.x + r.w || py < r.y || py > r.y + r.h) return false;
      const k = Math.min(r.w, r.h) / 2;
      const cx = px < r.x + k ? r.x + k : px > r.x + r.w - k ? r.x + r.w - k : px;
      const cy = py < r.y + k ? r.y + k : py > r.y + r.h - k ? r.y + r.h - k : py;
      return (px - cx) ** 2 + (py - cy) ** 2 <= k * k;
    };
    const fits = (it, rb, a) => {
      const svg2 = it.querySelector("svg");
      const size2 = svg2 ? parseFloat(getComputedStyle(svg2).width) || 22 : 22;
      const half = size2 / 2 + 3;
      const cx = panel2.offsetLeft + panel2.clientLeft + (items2 ? items2.offsetLeft : 0) + it.offsetLeft + it.offsetWidth / 2 + contentShift;
      const cy = panel2.offsetTop + panel2.clientTop + (items2 ? items2.offsetTop : 0) + it.offsetTop + it.offsetHeight / 2;
      const dir = rb.x + rb.w / 2 >= a.x + a.w / 2 ? 1 : -1;
      if (dir > 0 ? cx - half < a.x + a.w + 4 : cx + half > a.x - 4) return false;
      return [[cx - half, cy - half], [cx + half, cy - half], [cx - half, cy + half], [cx + half, cy + half]].every(([px, py]) => insideRounded(rb, px, py));
    };
    let contentShift = 0;
    let gate = null;
    function applyItems() {
      const open6 = st.open;
      let ok = true;
      const order = gate && gate.rb.x + gate.rb.w / 2 < rectOf(trigger2).x + rectOf(trigger2).w / 2 ? [...itemEls].reverse() : itemEls;
      order.forEach((it) => {
        const all = open6 && (interactive || reduced8());
        ok = ok && (all || transitioning && gate && fits(it, gate.rb, gate.a));
        setVisible(it, all || ok);
      });
    }
    showItems(false);
    const reach = () => dB.setMargin(Math.max(Math.abs(panel2.offsetLeft - trigger2.offsetLeft), Math.abs(panel2.offsetLeft + panel2.offsetWidth - (trigger2.offsetLeft + trigger2.offsetWidth))) + 16);
    reach();
    const ownPose = () => {
      const x = dB.extra;
      dB.extra = null;
      const q = dB.pose();
      dB.extra = x;
      return q;
    };
    const secondary = (own, a) => {
      if (!openingVisual) return sharedVisual ? { ...own, x: own.x + panel2.clientLeft, y: own.y + panel2.clientTop } : own;
      const fin = rectOf(panel2);
      const from = a.x + a.w / 2 - (fin.x + fin.w / 2);
      const u = clamp6(1 - dB.get("ox") / (Math.abs(from) > 0.01 ? from : -1), 0, 1);
      const travel = fin.x - a.x;
      const contact = Math.min(a.w, Math.max(0, travel));
      const neckTravel = travel - contact;
      let x;
      if (travel < 0) {
        x = a.x + travel * u;
      } else if (u < OPEN_CONTACT) {
        const t = u / OPEN_CONTACT;
        const tangent = neckTravel * OPEN_CONTACT / (1 - OPEN_CONTACT);
        x = a.x + contact * t * t * (3 - 2 * t) + tangent * t * t * (t - 1);
      } else {
        x = a.x + contact + neckTravel * (u - OPEN_CONTACT) / (1 - OPEN_CONTACT);
      }
      const w = a.w + (fin.w - a.w) * u;
      const h = a.h + (fin.h - a.h) * u;
      return { x, y: a.y + (a.h - h) / 2, w, h, r: h / 2 };
    };
    let openingShape = null;
    dB.pre = () => {
      let next = null;
      let merged = false;
      if (transitioning && !reduced8()) {
        const a = rectOf(trigger2);
        const own = rectAt(panel2, ownPose());
        const S3 = secondary(own, a);
        const dir = S3.x + S3.w / 2 >= a.x + a.w / 2 ? 1 : -1;
        const g = dir > 0 ? S3.x - (a.x + a.w) : a.x - (S3.x + S3.w);
        merged = g <= 0;
        const finalGap = Math.max(1, rectOf(panel2).x - (a.x + a.w));
        const connected = sharedVisual && g < finalGap * 0.85;
        if (slowDetach && st.open) {
          const fin = rectOf(panel2);
          const from = a.x + a.w / 2 - (fin.x + fin.w / 2);
          const u = clamp6(1 - dB.get("ox") / (Math.abs(from) > 0.01 ? from : -1), 0, 1);
          const s = clamp6((u - DETACH_FROM) / (DETACH_TO - DETACH_FROM), 0, 1);
          const e = s * s * (3 - 2 * s);
          const k = SPLIT_SPRING[0] * (OPEN_SPRING[0] / SPLIT_SPRING[0]) ** e;
          dB.setSpring(k, 2 * Math.sqrt(k));
          if (s >= 1) slowDetach = false;
        }
        let T = S3;
        if (connected || !sharedVisual && merged) {
          const L = Math.min(a.x, S3.x), R = Math.max(a.x + a.w, S3.x + S3.w), Tp = Math.min(a.y, S3.y), Bt = Math.max(a.y + a.h, S3.y + S3.h);
          T = { x: L, y: Tp, w: R - L, h: Bt - Tp };
        }
        openingShape = connected ? { a, secondary: S3 } : null;
        next = { sw: T.w - own.w, sh: T.h - own.h, ox: T.x + T.w / 2 - (own.x + own.w / 2), oy: T.y + T.h / 2 - (own.y + own.h / 2) };
        if (sharedVisual) {
          next.ox -= panel2.clientLeft;
          next.oy -= panel2.clientTop;
        }
        if (Math.abs(next.sw) + Math.abs(next.sh) + Math.abs(next.ox) + Math.abs(next.oy) < 0.01) next = null;
      }
      if (!transitioning || !sharedVisual) openingShape = null;
      dB.extra = next;
      if (root4.hasAttribute("data-dpi-merged") !== merged) root4.toggleAttribute("data-dpi-merged", merged);
    };
    const tintA = trigger2.querySelector(":scope > .dpi-drop__tint");
    const tintB = panel2.querySelector(":scope > .dpi-drop__tint");
    const uncut = () => {
      tintA?.style.removeProperty("clip-path");
      tintB?.style.removeProperty("clip-path");
    };
    const update = () => {
      if (!poses.a || !poses.b) return;
      const motion = transitioning;
      if (motion !== lastMotion) {
        if (motion) material.refresh();
        else {
          material.reset();
          uncut();
        }
        root4.toggleAttribute("data-dpi-motion", motion);
        lastMotion = motion;
      }
      if (motion) {
        const a = rectOf(trigger2);
        const S3 = secondary(rectAt(panel2, ownPose()), a);
        const neck = sharedVisual ? (material.reset(), null) : material.paint(rectAt(trigger2, poses.a), S3);
        contentShift = openingVisual ? S3.x - rectOf(panel2).x : 0;
        if (items2) items2.style.translate = `${contentShift.toFixed(3)}px 0px`;
        if (neck && tintA && tintB) {
          const aLeft = neck.left === "a";
          const ra = rectAt(trigger2, poses.a);
          const rb = rectAt(panel2, poses.b);
          const cutA = aLeft ? ra.x + ra.w - neck.xl : neck.xr - ra.x;
          const cutB = aLeft ? neck.xr - rb.x : rb.x + rb.w - neck.xl;
          tintA.style.clipPath = aLeft ? `inset(-40px ${Math.max(0, cutA).toFixed(2)}px -40px -40px)` : `inset(-40px -40px -40px ${Math.max(0, cutA).toFixed(2)}px)`;
          tintB.style.clipPath = aLeft ? `inset(-40px -40px -40px ${Math.max(0, cutB).toFixed(2)}px)` : `inset(-40px ${Math.max(0, cutB).toFixed(2)}px -40px -40px)`;
        } else if (!sharedVisual) uncut();
        gate = { rb: S3, a };
        space(S3.x + S3.w);
      } else {
        gate = null;
        contentShift = 0;
        space(st.open ? null : 0);
        if (items2) items2.style.removeProperty("translate");
      }
      applyItems();
    };
    const svgNode = (tag, attrs = {}) => {
      const node2 = document.createElementNS(NS4, tag);
      for (const [key, value2] of Object.entries(attrs)) node2.setAttribute(key, value2);
      return node2;
    };
    const id = `dpi-expand-surface-${++surfaceId}`;
    const contour2 = svgNode("svg", { class: "dpi-expand__contour", "aria-hidden": "true" });
    const defs = svgNode("defs");
    const shadowFilter = svgNode("filter", { id: `${id}-shadow`, filterUnits: "userSpaceOnUse", "color-interpolation-filters": "sRGB" });
    const erode = svgNode("feMorphology", { in: "SourceAlpha", operator: "erode", radius: "8", result: "spread" });
    const blur = svgNode("feGaussianBlur", { in: "spread", stdDeviation: "11", result: "blur" });
    const offset = svgNode("feOffset", { in: "blur", dy: "10", result: "offset" });
    const color = svgNode("feFlood", { "flood-color": "#000", "flood-opacity": "0.28", result: "color" });
    const far = svgNode("feComposite", { in: "color", in2: "offset", operator: "in", result: "far" });
    const nearBlur = svgNode("feGaussianBlur", { in: "SourceAlpha", stdDeviation: "2.5", result: "nearBlur" });
    const nearOffset = svgNode("feOffset", { in: "nearBlur", dy: "2", result: "nearOffset" });
    const nearColor = svgNode("feFlood", { "flood-color": "#000", "flood-opacity": "0.1", result: "nearColor" });
    const near = svgNode("feComposite", { in: "nearColor", in2: "nearOffset", operator: "in", result: "near" });
    const merge = svgNode("feMerge", { result: "shadows" });
    merge.append(svgNode("feMergeNode", { in: "far" }), svgNode("feMergeNode", { in: "near" }));
    shadowFilter.append(
      erode,
      blur,
      offset,
      color,
      far,
      nearBlur,
      nearOffset,
      nearColor,
      near,
      merge,
      svgNode("feComposite", { in: "shadows", in2: "SourceAlpha", operator: "out" })
    );
    const inside = svgNode("clipPath", { id: `${id}-inside`, clipPathUnits: "userSpaceOnUse" });
    const insidePath = svgNode("path");
    inside.append(insidePath);
    const mask = svgNode("mask", { id: `${id}-rim`, maskUnits: "userSpaceOnUse", maskContentUnits: "userSpaceOnUse" });
    const maskPath = svgNode("path", { fill: "none", stroke: "#fff", "stroke-width": "2", "clip-path": `url(#${id}-inside)` });
    mask.append(maskPath);
    defs.append(shadowFilter, inside, mask);
    const lightLayer = () => {
      const field = svgNode("foreignObject");
      const material2 = document.createElementNS("http://www.w3.org/1999/xhtml", "div");
      material2.setAttribute("class", "dpi-expand__surface-light");
      field.append(material2);
      return { field, material: material2 };
    };
    const primaryLight = lightLayer();
    const secondaryLight = lightLayer();
    const shadowPath = svgNode("path", { class: "dpi-expand__surface-shadow", filter: `url(#${id}-shadow)` });
    const outline = svgNode("path", { "clip-path": `url(#${id}-inside)` });
    const rim = svgNode("g", { "aria-hidden": "true", mask: `url(#${id}-rim)` });
    rim.append(primaryLight.field, secondaryLight.field);
    contour2.append(defs, shadowPath, outline, rim);
    contour2.style.display = "none";
    root4.append(contour2);
    const light = (layer, body, tint, start3, end) => {
      const cs = tint ? getComputedStyle(tint) : null;
      layer.material.style.setProperty("--dpi-light-angle", cs?.getPropertyValue("--dpi-light-angle") || "0deg");
      layer.material.style.setProperty("--dpi-light-strength", cs?.getPropertyValue("--dpi-light-strength") || "1");
      layer.material.style.setProperty("--dpi-light-x", `${body.x + body.w / 2 - start3}px`);
      layer.material.style.setProperty("--dpi-light-y", `${body.y + body.h / 2 + 1}px`);
      layer.field.setAttribute("x", start3);
      layer.field.setAttribute("y", "-1");
      layer.field.setAttribute("width", Math.max(0, end - start3));
      layer.field.setAttribute("height", root4.offsetHeight + 2);
    };
    dB.afterPaint = (p) => {
      if (!transitioning || !sharedVisual || !openingShape) {
        if (root4.hasAttribute("data-dpi-opening-surface")) {
          root4.removeAttribute("data-dpi-opening-surface");
          tintB?.style.removeProperty("clip-path");
        }
        contour2.style.display = "none";
        rim.style.display = "none";
        return;
      }
      root4.setAttribute("data-dpi-opening-surface", "");
      const { a, secondary: b } = openingShape;
      const finalGap = Math.max(1, rectOf(panel2).x - (a.x + a.w));
      const shape = openingOutline(a, b, finalGap * 0.85, st.open);
      const offset2 = rectOf(panel2);
      if (tintB) tintB.style.clipPath = `path('${shape(offset2.x + panel2.clientLeft + p.x, offset2.y + panel2.clientTop + p.y)}')`;
      const optics = dB.stage || dB.lens;
      if (optics) {
        const x = offset2.x + panel2.clientLeft + (parseFloat(optics.style.left) || 0);
        const y = offset2.y + panel2.clientTop + (parseFloat(optics.style.top) || 0);
        optics.style.clipPath = `path('${shape(x, y)}')`;
      }
      contour2.style.display = "";
      rim.style.display = "";
      contour2.setAttribute("width", root4.offsetWidth);
      contour2.setAttribute("height", root4.offsetHeight);
      const path = shape();
      outline.setAttribute("d", path);
      shadowPath.setAttribute("d", path);
      const split2 = (a.x + a.w + b.x) / 2;
      light(primaryLight, a, tintA, -1, split2);
      light(secondaryLight, b, tintB, split2, root4.offsetWidth + 1);
      insidePath.setAttribute("d", path);
      maskPath.setAttribute("d", path);
      mask.setAttribute("x", "-1");
      mask.setAttribute("y", "-1");
      mask.setAttribute("width", root4.offsetWidth + 2);
      mask.setAttribute("height", root4.offsetHeight + 2);
      shadowFilter.setAttribute("x", "-64");
      shadowFilter.setAttribute("y", "-64");
      shadowFilter.setAttribute("width", root4.offsetWidth + 128);
      shadowFilter.setAttribute("height", root4.offsetHeight + 128);
    };
    function restoreClosedSurface(resetLight = false) {
      if (st.open || transitioning) return;
      material.reset();
      root4.removeAttribute("data-dpi-opening-surface");
      root4.removeAttribute("data-dpi-merged");
      root4.removeAttribute("data-dpi-motion");
      contour2.style.display = "none";
      rim.style.display = "none";
      uncut();
      if (resetLight) {
        dA.pointerLight = false;
        dA.lastLightAngle = void 0;
        dA.lightReset();
      }
      dA.render();
    }
    dA.onPaint = (p) => {
      poses.a = p;
      update();
    };
    dB.onPaint = (p) => {
      poses.b = p;
      update();
    };
    dA.render();
    dB.render();
    const collapsed = () => dB.collapsedPose(trigger2.getBoundingClientRect(), trigger2);
    const snapCollapsed = () => {
      const c = collapsed();
      dB.snap(c.ox, c.oy, c.sw, c.sh);
    };
    snapCollapsed();
    setAria(false);
    root4.setAttribute("data-dpi-collapsed", "");
    space(0);
    dB.host.addEventListener("dpi:drop-settled", (e) => {
      if (e.target !== dB.host) return;
      root4.toggleAttribute("data-dpi-motion", false);
      material.reset();
      transitioning = false;
      openingVisual = false;
      sharedVisual = false;
      slowDetach = false;
      uncut();
      clearExtra();
      lastMotion = false;
      const at = Math.abs(dB.get("ox")) < 0.5 && Math.abs(dB.get("oy")) < 0.5 && Math.abs(dB.get("sw")) < 0.5 && Math.abs(dB.get("sh")) < 0.5;
      showItems(st.open && at);
      space(st.open ? null : 0);
      if (!st.open) {
        root4.setAttribute("data-dpi-collapsed", "");
        restoreClosedSurface();
      }
    });
    function setOpen(o) {
      if (o === st.open) return;
      if (!transitioning) {
        openingVisual = o;
        sharedVisual = o;
        slowDetach = o;
      } else if (o) {
        slowDetach = false;
        sharedVisual = true;
        material.reset();
        uncut();
      }
      if (!o) slowDetach = false;
      st.open = o;
      setAria(o);
      if (o) root4.removeAttribute("data-dpi-collapsed");
      emit(root4, o ? "open" : "close", { component: "expand" });
      if (reduced8()) {
        transitioning = false;
        openingVisual = sharedVisual = slowDetach = false;
        if (o) dB.snap(0, 0, 0, 0);
        else {
          snapCollapsed();
          root4.setAttribute("data-dpi-collapsed", "");
        }
        showItems(o);
        space(o ? null : 0);
        update();
        return;
      }
      if (!transitioning) {
        reach();
        dA.measure();
        dB.measure();
        if (o) snapCollapsed();
      }
      transitioning = true;
      showItems(false);
      dB.setSpring(...o && slowDetach ? SPLIT_SPRING : CLOSE_SPRING);
      dB.render();
      update();
      if (o) dB.pull(0, 0, 0, 0);
      else {
        const c = collapsed();
        dB.pull(c.ox, c.oy, c.sw, c.sh);
      }
    }
    rec2.setOpen = setOpen;
    trigger2.addEventListener("click", () => setOpen(!st.open));
    root4.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && st.open) {
        e.stopPropagation();
        setOpen(false);
        trigger2.focus({ preventScroll: true });
      }
    });
    listenWhile(root4, document, "pointerdown", (e) => {
      if (root4.contains(e.target)) return;
      if (st.open) setOpen(false);
      else restoreClosedSurface(true);
    });
    trigger2.addEventListener("blur", () => restoreClosedSurface(true));
    root4.addEventListener("focusout", (e) => {
      if (st.open && e.relatedTarget && !root4.contains(e.relatedTarget)) setOpen(false);
    });
    document.fonts?.ready.then(() => {
      reach();
      dA.measure();
      dB.measure();
      if (!st.open && !transitioning) {
        snapCollapsed();
        update();
      }
    });
    new ResizeObserver(() => {
      reach();
      if (!st.open && !transitioning && !dB.running) {
        snapCollapsed();
        update();
      }
    }).observe(root4);
    update();
    return rec2;
  }
  var get3 = (root4) => inst2.get(root4);

  // dpi/js/theme.js
  var theme_exports = {};
  __export(theme_exports, {
    STORAGE_KEY: () => STORAGE_KEY,
    apply: () => apply2,
    bind: () => bind8,
    effective: () => effective,
    init: () => init,
    preference: () => preference,
    sync: () => sync2
  });
  var root = document.documentElement;
  var mq2 = typeof matchMedia === "function" ? matchMedia("(prefers-color-scheme: dark)") : { matches: false, addEventListener() {
  } };
  var valid = (v) => v === "auto" || v === "light" || v === "dark";
  var applying = false;
  var STORAGE_KEY = "dpi-theme";
  var load = () => {
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      return valid(v) ? v : null;
    } catch {
      return null;
    }
  };
  var save = (pref) => {
    try {
      localStorage.setItem(STORAGE_KEY, pref);
    } catch {
    }
  };
  function setAttr(pref) {
    const before = root.getAttribute("data-dpi-theme");
    if (pref === "auto") root.removeAttribute("data-dpi-theme");
    else root.setAttribute("data-dpi-theme", pref);
    return root.getAttribute("data-dpi-theme") !== before;
  }
  var preference = () => {
    const a = root.getAttribute("data-dpi-theme");
    return valid(a) ? a : "auto";
  };
  var effective = () => {
    const p = preference();
    return p === "auto" ? mq2.matches ? "dark" : "light" : p;
  };
  function sync2(scope = document) {
    const eff = effective();
    const pref = preference();
    applying = true;
    try {
      const set4 = (input, on) => {
        if (input.checked === on) return;
        input.checked = on;
        input.dispatchEvent(new Event("change", { bubbles: true }));
      };
      for (const t of scope.querySelectorAll("input[data-dpi-theme-toggle]")) set4(t, eff === "dark");
      for (const r of scope.querySelectorAll("input[data-dpi-theme-pref]")) set4(r, r.value === pref);
    } finally {
      applying = false;
    }
  }
  function publish(rebuild) {
    root.setAttribute("data-dpi-theme-effective", effective());
    sync2(document);
    if (rebuild) themeChanged();
    emit(document, "theme-change", { preference: preference(), effective: effective() });
  }
  function apply2(pref) {
    if (!valid(pref)) return;
    markThemeHandled();
    setAttr(pref);
    save(pref);
    publish(true);
  }
  function restore() {
    const saved = load();
    if (!saved) return false;
    if (!setAttr(saved)) return false;
    markThemeHandled();
    publish(true);
    return true;
  }
  var bound7 = false;
  function bind8() {
    if (bound7) return;
    bound7 = true;
    document.addEventListener("change", (e) => {
      if (applying) return;
      const i = e.target;
      if (!(i instanceof HTMLInputElement)) return;
      if (i.hasAttribute("data-dpi-theme-toggle")) apply2(i.checked ? "dark" : "light");
      else if (i.hasAttribute("data-dpi-theme-pref") && i.checked) apply2(i.value);
    });
    mq2.addEventListener("change", () => {
      if (preference() === "auto") publish(false);
    });
    addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY || e.key === null) restore();
    });
  }
  function init() {
    bind8();
    if (restore()) return;
    root.setAttribute("data-dpi-theme-effective", effective());
    sync2(document);
  }

  // dpi/js/loading.js
  var loading_exports = {};
  __export(loading_exports, {
    bindNavigation: () => bindNavigation,
    configure: () => configure2,
    firstLoad: () => firstLoad,
    fragment: () => fragment,
    options: () => options,
    wait: () => wait
  });
  var root2 = document.documentElement;
  var options = { maxWait: 6e3, navDelay: 150, navigation: true, minDuration: 1500 };
  var configure2 = (o = {}) => Object.assign(options, o);
  var off = () => root2.getAttribute("data-dpi-loading") === "off" || document.body?.getAttribute("data-dpi-loading") === "off";
  var pending = /* @__PURE__ */ new Set();
  var collecting = false;
  var template = null;
  function wait(p) {
    if (collecting) pending.add(Promise.resolve(p).catch(() => {
    }));
  }
  var busyTarget = () => document.body.querySelector(":scope > main") || document.body;
  var frame3 = () => new Promise((r) => requestAnimationFrame(() => r()));
  var inView = (el6) => {
    const r = el6.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight && r.right > 0 && r.left < innerWidth;
  };
  var settleImage = (img) => {
    if (img.complete && img.naturalWidth > 0) return Promise.resolve();
    if (typeof img.decode === "function") return img.decode();
    return new Promise((res) => {
      img.addEventListener("load", res, { once: true });
      img.addEventListener("error", res, { once: true });
    });
  };
  var CREDIT_KEY = "dpi-loading-credit";
  function takeCredit() {
    try {
      const raw = sessionStorage.getItem(CREDIT_KEY);
      sessionStorage.removeItem(CREDIT_KEY);
      if (!raw) return 0;
      const c = JSON.parse(raw);
      const same = typeof c.to === "string" && c.to.split("#")[0] === location.href.split("#")[0];
      return same && Date.now() - c.ts < 15e3 && Number.isFinite(c.shown) ? Math.max(0, Math.min(c.shown, 1e4)) : 0;
    } catch {
      return 0;
    }
  }
  function shownSince(now) {
    try {
      const e = performance.getEntriesByType("paint").find((x) => x.name === "first-paint") || performance.getEntriesByType("paint")[0];
      return e ? Math.min(e.startTime, now) : now;
    } catch {
      return now;
    }
  }
  function hold(ms) {
    return new Promise((res) => {
      const end = () => {
        clearTimeout(t);
        removeEventListener("pagehide", end);
        res();
      };
      const t = setTimeout(end, ms);
      addEventListener("pagehide", end, { once: true });
    });
  }
  async function firstLoad() {
    const body = document.body;
    const scope = body?.querySelector('[data-dpi-loading]:not([data-dpi-loading="off"])');
    if (!body || off() || !scope) {
      root2.setAttribute("data-dpi-ready", "");
      return;
    }
    const sk = body.querySelector(":scope > .dpi-page-skeleton");
    const status = document.createElement("div");
    status.className = "dpi-visually-hidden";
    status.setAttribute("role", "status");
    status.textContent = "Caricamento della pagina";
    body.append(status);
    const busy2 = scope;
    busy2.setAttribute("aria-busy", "true");
    const t0 = performance.now();
    const shownAt = shownSince(t0);
    const credit = takeCredit();
    void body.offsetHeight;
    collecting = true;
    emit(document, "loading-collect", { wait });
    let timer = 0;
    const limit = new Promise((res) => {
      timer = setTimeout(() => res(true), options.maxWait);
    });
    const images = [...document.images].filter((img) => !img.closest("[hidden], [inert]") && inView(img)).map(settleImage);
    const work = Promise.allSettled([document.fonts?.ready, ...images, ...pending]).then(() => false);
    const timedOut = await Promise.race([work, limit]);
    clearTimeout(timer);
    await frame3();
    if (!timedOut && options.minDuration > 0) {
      const remaining = Math.min(options.minDuration - (performance.now() - shownAt) - credit, options.maxWait - (performance.now() - t0));
      if (remaining > 0) await hold(remaining);
    }
    root2.setAttribute("data-dpi-ready", "");
    busy2.removeAttribute("aria-busy");
    template = sk;
    sk?.remove();
    status.remove();
    collecting = false;
    pending.clear();
  }
  var overlay = null;
  var notice = null;
  var busyEl = null;
  var overlayAt = 0;
  var target = null;
  var navTimer = 0;
  var guard = 0;
  function generic() {
    const el6 = document.createElement("div");
    el6.className = "dpi-page-skeleton";
    const wrap = document.createElement("div");
    wrap.className = "dpi-container dpi-page dpi-sk-stack";
    for (const c of ["dpi-sk-h1", "dpi-sk-line", "dpi-sk-line dpi-sk-w-md", "dpi-sk-block"]) {
      const b = document.createElement("span");
      b.className = `dpi-skeleton__bar ${c}`;
      wrap.append(b);
    }
    el6.append(wrap);
    return el6;
  }
  function showNav() {
    if (overlay || off() || !document.body) return;
    overlay = template ? template.cloneNode(true) : generic();
    overlay.setAttribute("data-dpi-nav", "");
    overlay.setAttribute("aria-hidden", "true");
    notice = document.createElement("div");
    notice.className = "dpi-visually-hidden";
    notice.setAttribute("role", "status");
    notice.textContent = "Caricamento della pagina";
    document.body.append(overlay, notice);
    busyEl = busyTarget();
    busyEl.setAttribute("aria-busy", "true");
    overlayAt = performance.now();
    guard = setTimeout(hideNav, options.maxWait + 2e3);
  }
  function handOver() {
    if (!overlay || !target) return;
    try {
      sessionStorage.setItem(CREDIT_KEY, JSON.stringify({ to: target, shown: performance.now() - overlayAt, ts: Date.now() }));
    } catch {
    }
  }
  function hideNav() {
    clearTimeout(navTimer);
    clearTimeout(guard);
    overlay?.remove();
    notice?.remove();
    busyEl?.removeAttribute("aria-busy");
    busyEl = null;
    overlay = notice = null;
    overlayAt = 0;
  }
  var internal = (href) => {
    try {
      const u = new URL(href, location.href);
      return u.origin === location.origin && (u.protocol === "http:" || u.protocol === "https:") ? u : null;
    } catch {
      return null;
    }
  };
  var schedule = (e, to) => {
    target = to;
    clearTimeout(navTimer);
    navTimer = setTimeout(() => {
      if (!e.defaultPrevented) showNav();
    }, options.navDelay);
  };
  var bound8 = false;
  function bindNavigation() {
    if (bound8) return;
    bound8 = true;
    document.addEventListener("click", (e) => {
      if (!options.navigation || off() || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target instanceof Element ? e.target.closest("a[href]") : null;
      if (!a || a.hasAttribute("download") || a.hasAttribute("data-dpi-no-loading")) return;
      const t = a.getAttribute("target");
      if (t && t !== "_self") return;
      const href = a.getAttribute("href") || "";
      if (href.startsWith("#")) return;
      const u = internal(a.href);
      if (!u || u.pathname === location.pathname && u.search === location.search && u.hash !== "") return;
      schedule(e, u.href);
    });
    document.addEventListener("submit", (e) => {
      const f3 = e.target;
      if (!options.navigation || off() || !(f3 instanceof HTMLFormElement)) return;
      const t = e.submitter?.getAttribute("formtarget") || f3.getAttribute("target");
      if (t && t !== "_self") return;
      const u = internal(e.submitter?.getAttribute("formaction") || f3.action);
      if (!u) return;
      schedule(e, (f3.method || "get").toLowerCase() === "get" ? u.href : null);
    });
    addEventListener("pageshow", (e) => {
      if (e.persisted) {
        try {
          sessionStorage.removeItem(CREDIT_KEY);
        } catch {
        }
      }
      hideNav();
    });
    addEventListener("pagehide", () => {
      handOver();
      hideNav();
    });
  }
  function fragment(el6, work) {
    const p = Promise.resolve(typeof work === "function" ? work() : work);
    const wrap = document.createElement("div");
    wrap.className = "dpi-skeleton-fragment";
    wrap.setAttribute("aria-hidden", "true");
    const tpl = el6.querySelector(":scope > template[data-dpi-skeleton]");
    if (tpl) wrap.append(tpl.content.cloneNode(true));
    else for (const c of ["dpi-sk-h2", "dpi-sk-line", "dpi-sk-line dpi-sk-w-md"]) {
      const b = document.createElement("span");
      b.className = `dpi-skeleton__bar ${c}`;
      wrap.append(b);
    }
    el6.setAttribute("aria-busy", "true");
    el6.prepend(wrap);
    const t0 = performance.now();
    const timer = setTimeout(() => done7(), options.maxWait);
    let hold2 = 0;
    const done7 = () => {
      clearTimeout(timer);
      clearTimeout(hold2);
      wrap.remove();
      el6.removeAttribute("aria-busy");
    };
    const finish2 = () => {
      const remaining = Math.min(options.minDuration - (performance.now() - t0), options.maxWait - (performance.now() - t0));
      if (remaining > 0) hold2 = setTimeout(done7, remaining);
      else done7();
    };
    return p.then((v) => {
      finish2();
      return v;
    }, (err) => {
      finish2();
      throw err;
    });
  }

  // dpi/js/widgets.js
  var widgets_exports = {};
  __export(widgets_exports, {
    bind: () => bind9,
    init: () => init2,
    toastShow: () => toastShow
  });
  var reduced9 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var clamp7 = (v, a, b) => Math.min(Math.max(v, a), b);
  var rtl = (el6) => getComputedStyle(el6).direction === "rtl";
  var done = /* @__PURE__ */ new WeakSet();
  var once = (el6) => done.has(el6) ? false : (done.add(el6), true);
  var norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  function tabs(root4) {
    const list = root4.querySelector('[role="tablist"]');
    const tab = () => [...list.querySelectorAll('[role="tab"]')];
    const panels = () => [...root4.querySelectorAll(':scope > [role="tabpanel"]')];
    const select2 = (i, focus = false) => {
      const t = tab();
      t.forEach((b, k) => {
        const on = k === i;
        b.setAttribute("aria-selected", String(on));
        b.tabIndex = on ? 0 : -1;
        panels()[k]?.toggleAttribute("data-dpi-inactive", !on);
      });
      if (focus) t[i].focus();
      emit(root4, "tab", { value: t[i].dataset.value, index: i });
    };
    list.addEventListener("click", (e) => {
      const b = e.target.closest('[role="tab"]');
      if (b && !b.disabled) select2(tab().indexOf(b));
    });
    list.addEventListener("keydown", (e) => {
      const t = tab().filter((b) => !b.disabled && !b.hidden);
      const i = t.indexOf(document.activeElement);
      if (i < 0) return;
      const dir = rtl(root4) ? -1 : 1;
      let n = null;
      if (e.key === "ArrowRight") n = (i + dir + t.length) % t.length;
      else if (e.key === "ArrowLeft") n = (i - dir + t.length) % t.length;
      else if (e.key === "Home") n = 0;
      else if (e.key === "End") n = t.length - 1;
      if (n === null) return;
      e.preventDefault();
      select2(tab().indexOf(t[n]), true);
    });
  }
  function tooltip(root4) {
    const bubble = root4.querySelector('[role="tooltip"]');
    const target2 = root4.querySelector("a[href], button, input, select, textarea, [tabindex]");
    if (target2 && bubble) {
      const ids = (target2.getAttribute("aria-describedby") || "").split(/\s+/).filter(Boolean);
      if (!ids.includes(bubble.id)) target2.setAttribute("aria-describedby", [...ids, bubble.id].join(" "));
    }
    root4.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && !root4.hasAttribute("data-dpi-dismissed")) {
        root4.setAttribute("data-dpi-dismissed", "");
        e.stopPropagation();
      }
    });
    const reset = () => root4.removeAttribute("data-dpi-dismissed");
    root4.addEventListener("pointerleave", reset);
    root4.addEventListener("focusout", reset);
  }
  function popover(root4) {
    const panel2 = root4.querySelector("[popover]");
    const trig = root4.querySelector("[popovertarget]");
    if (!panel2 || !trig) return;
    const place5 = () => {
      const t = trig.getBoundingClientRect();
      const p = panel2.getBoundingClientRect();
      const side = root4.dataset.placement || "bottom";
      const gap = 8;
      let x = t.left + t.width / 2 - p.width / 2;
      let y = t.bottom + gap;
      if (side === "top") y = t.top - p.height - gap;
      else if (side === "start") {
        x = t.left - p.width - gap;
        y = t.top + t.height / 2 - p.height / 2;
      } else if (side === "end") {
        x = t.right + gap;
        y = t.top + t.height / 2 - p.height / 2;
      }
      if (side === "bottom" && y + p.height > innerHeight - 4 && t.top > p.height + gap) y = t.top - p.height - gap;
      panel2.style.left = `${clamp7(x, 4, Math.max(4, innerWidth - p.width - 4))}px`;
      panel2.style.top = `${clamp7(y, 4, Math.max(4, innerHeight - p.height - 4))}px`;
    };
    if ("showPopover" in panel2) {
      panel2.addEventListener("toggle", (e) => {
        trig.setAttribute("aria-expanded", String(e.newState === "open"));
        if (e.newState === "open") {
          place5();
          panel2.querySelector("a[href], button, input, select, textarea, [tabindex]")?.focus?.({ preventScroll: true });
        } else if (!panel2.contains(document.activeElement) || document.activeElement === document.body) trig.focus?.({ preventScroll: true });
        emit(root4, e.newState === "open" ? "open" : "close", { component: "popover" });
      });
      listenWhile(root4, window, "resize", () => {
        if (panel2.matches(":popover-open")) place5();
      });
    } else {
      panel2.hidden = true;
      trig.removeAttribute("popovertarget");
      const set4 = (o) => {
        panel2.hidden = !o;
        trig.setAttribute("aria-expanded", String(o));
        if (o) {
          panel2.style.position = "fixed";
          place5();
        }
      };
      trig.addEventListener("click", () => set4(panel2.hidden));
      root4.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && !panel2.hidden) {
          set4(false);
          trig.focus();
        }
      });
      listenWhile(root4, document, "pointerdown", (e) => {
        if (!panel2.hidden && !root4.contains(e.target)) set4(false);
      });
    }
    trig.setAttribute("aria-expanded", "false");
  }
  var timers = /* @__PURE__ */ new WeakMap();
  function armToast(t) {
    const ms = Number(t.dataset.dpiDuration || 0);
    if (!ms) return;
    const start3 = () => {
      clearTimeout(timers.get(t));
      timers.set(t, setTimeout(() => t.remove(), ms));
    };
    const stop = () => clearTimeout(timers.get(t));
    t.addEventListener("pointerenter", stop);
    t.addEventListener("pointerleave", start3);
    t.addEventListener("focusin", stop);
    t.addEventListener("focusout", start3);
    start3();
  }
  function toastShow({ message, tone = "neutral", duration = 4e3 } = {}) {
    const region = document.querySelector("[data-dpi-toasts]");
    const tpl = region?.querySelector("template[data-dpi-toast-template]");
    if (!region || !tpl) throw new Error("DPI.toast.show richiede una toast_region nella pagina");
    const frag = tpl.content.cloneNode(true);
    const t = frag.querySelector(".dpi-toast");
    t.querySelector(".dpi-toast__message").textContent = String(message ?? "");
    for (const k of ["info", "success", "warning", "danger"]) t.classList.toggle(`dpi-toast--${k}`, tone === k);
    t.setAttribute("role", tone === "danger" ? "alert" : "status");
    if (duration > 0) t.dataset.dpiDuration = String(duration);
    region.append(frag);
    const live3 = region.lastElementChild;
    refresh(live3);
    armToast(live3);
    return live3;
  }
  function stepper(root4) {
    const steps = () => [...root4.querySelectorAll(":scope > .dpi-stepper__list > .dpi-stepper__step")];
    const panelOf = (k) => root4.querySelector(`:scope > .dpi-stepper__panels > [id$="-p${k}"]`);
    const act = (name) => root4.querySelector(`[data-dpi-step-act="${name}"]`);
    const nav2 = root4.dataset.dpiNav || "none";
    const disabledAt = (k) => steps()[k - 1]?.dataset.state === "disabled";
    const total = () => steps().length;
    const current3 = () => Number(root4.dataset.dpiCurrent) || 1;
    const STATUS = { done: " (completato)", current: " (passo corrente)", todo: " (da fare)", disabled: " (non disponibile)" };
    const valid2 = (k) => {
      if (root4.dataset.dpiValidate !== "true") return true;
      const bad = [...panelOf(k)?.querySelectorAll("input, select, textarea") ?? []].find((c) => !c.disabled && !c.checkValidity());
      if (!bad) return true;
      bad.reportValidity();
      bad.focus();
      emit(root4, "step-invalid", { current: k, field: bad.name || null });
      return false;
    };
    const paint4 = () => {
      const n = current3();
      steps().forEach((li, i) => {
        const k = i + 1;
        const s = li.dataset.state === "disabled" ? "disabled" : k < n ? "done" : k === n ? "current" : "todo";
        li.dataset.state = s;
        li.className = `dpi-stepper__step dpi-stepper__step--${s}`;
        if (s === "current") li.setAttribute("aria-current", "step");
        else li.removeAttribute("aria-current");
        const sr = li.querySelector("[data-dpi-step-status]");
        if (sr) sr.textContent = STATUS[s];
        const t = li.querySelector(".dpi-stepper__trigger");
        if (t) t.disabled = s === "disabled" || nav2 === "linear" && k > n + 1;
        panelOf(k)?.toggleAttribute("data-dpi-inactive", k !== n);
      });
      const prevOk = [...Array(n - 1).keys()].some((x) => !disabledAt(x + 1));
      const nextOk = [...Array(total() - n).keys()].some((x) => !disabledAt(n + x + 1));
      const prev = act("prev")?.querySelector("button");
      if (prev) {
        prev.disabled = !prevOk;
      }
      const nxt = act("next");
      if (nxt) nxt.hidden = !nextOk;
      const fin = act("finish");
      if (fin) fin.hidden = nextOk;
    };
    const set4 = (k, { announce: announce2 = true, focus = false } = {}) => {
      const from = current3();
      k = clamp7(k, 1, total());
      if (k === from || disabledAt(k)) return false;
      if (k > from && !valid2(from)) return false;
      root4.dataset.dpiCurrent = String(k);
      paint4();
      if (focus) (panelOf(k) ?? steps()[k - 1]?.querySelector(".dpi-stepper__trigger"))?.focus({ preventScroll: false });
      if (announce2) emit(root4, "step", { current: k, from, total: total() });
      return true;
    };
    const move = (dir) => {
      let k = current3() + dir;
      while (k >= 1 && k <= total() && disabledAt(k)) k += dir;
      if (k >= 1 && k <= total()) set4(k, { focus: true });
    };
    const finish2 = () => {
      if (valid2(current3())) emit(root4, "step-finish", { current: current3(), total: total() });
    };
    act("prev")?.addEventListener("click", () => move(-1));
    act("next")?.addEventListener("click", () => move(1));
    act("finish")?.addEventListener("click", finish2);
    root4.addEventListener("click", (e) => {
      const t = e.target.closest?.(".dpi-stepper__trigger");
      if (!t || !root4.contains(t)) return;
      set4(steps().indexOf(t.closest(".dpi-stepper__step")) + 1, { focus: true });
    });
    root4.addEventListener("keydown", (e) => {
      if (e.key !== "Enter" || e.defaultPrevented) return;
      const f3 = e.target;
      if (!(f3 instanceof HTMLInputElement) || !f3.closest(".dpi-stepper__panel") || ["button", "submit", "checkbox", "radio"].includes(f3.type)) return;
      e.preventDefault();
      if (act("finish") && !act("finish").hidden) finish2();
      else if (act("next")) move(1);
    });
    root4.__dpiStepper = { set: (k) => set4(k), next: () => move(1), prev: () => move(-1), finish: finish2 };
    paint4();
  }
  function carousel(root4) {
    const track3 = root4.querySelector("[data-dpi-carousel-track]");
    const slides = () => [...track3.children];
    const dots = [...root4.querySelectorAll(".dpi-carousel__dot")];
    const btns = [...root4.querySelectorAll(".dpi-carousel__controls > .dpi-btn, .dpi-carousel__controls > span > .dpi-btn")];
    const prev = btns[0];
    const next = btns[btns.length - 1];
    const index = () => {
      const w = track3.clientWidth || 1;
      return clamp7(Math.round(Math.abs(track3.scrollLeft) / w), 0, slides().length - 1);
    };
    const sync8 = () => {
      const i = index();
      dots.forEach((d, k) => k === i ? d.setAttribute("aria-current", "true") : d.removeAttribute("aria-current"));
      if (prev) prev.disabled = i <= 0;
      if (next) next.disabled = i >= slides().length - 1;
      emit(root4, "slide", { index: i });
    };
    const go = (i) => {
      const n = clamp7(i, 0, slides().length - 1);
      const dir = rtl(root4) ? -1 : 1;
      track3.scrollTo({ left: dir * n * track3.clientWidth, behavior: reduced9() ? "auto" : "smooth" });
    };
    prev?.addEventListener("click", () => go(index() - 1));
    next?.addEventListener("click", () => go(index() + 1));
    dots.forEach((d, k) => d.addEventListener("click", () => go(k)));
    track3.addEventListener("keydown", (e) => {
      const d = rtl(root4) ? -1 : 1;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        go(index() + d);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        go(index() - d);
      } else if (e.key === "Home") {
        e.preventDefault();
        go(0);
      } else if (e.key === "End") {
        e.preventDefault();
        go(slides().length - 1);
      }
    });
    let raf = 0;
    track3.addEventListener("scroll", () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(sync8);
    }, { passive: true });
    sync8();
  }
  function chips(root4) {
    root4.addEventListener("click", (e) => {
      const b = e.target.closest(".dpi-chip__remove");
      if (!b || b.disabled) return;
      const chip = b.closest(".dpi-chip");
      const label2 = chip.querySelector("span:not(.dpi-icon)")?.textContent ?? "";
      const sib = chip.nextElementSibling?.querySelector(".dpi-chip__remove") ?? chip.previousElementSibling?.querySelector?.(".dpi-chip__remove");
      chip.remove();
      emit(root4, "chip-remove", { label: label2 });
      sib?.focus();
    });
  }
  function split(root4) {
    const btn = root4.querySelector(".dpi-split__bar .dpi-btn");
    const side = root4.querySelector(".dpi-split__side");
    if (!btn || !side) return;
    btn.setAttribute("aria-controls", side.id);
    btn.setAttribute("aria-expanded", "false");
    const set4 = (o, focus = false) => {
      root4.toggleAttribute("data-dpi-open", o);
      btn.setAttribute("aria-expanded", String(o));
      if (o) side.querySelector("a[href], button, input")?.focus({ preventScroll: true });
      else if (focus) btn.focus();
      emit(root4, o ? "open" : "close", { component: "split_view" });
    };
    btn.addEventListener("click", () => set4(!root4.hasAttribute("data-dpi-open")));
    root4.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && root4.hasAttribute("data-dpi-open")) {
        e.stopPropagation();
        set4(false, true);
      }
    });
    side.addEventListener("click", (e) => {
      if (e.target.closest("a[href]") && root4.hasAttribute("data-dpi-open")) set4(false);
    });
    listenWhile(root4, document, "pointerdown", (e) => {
      if (root4.hasAttribute("data-dpi-open") && !side.contains(e.target) && !btn.contains(e.target)) set4(false);
    });
  }
  function nav(root4) {
    const list = root4.querySelector(".dpi-nav__list");
    const reveal2 = (a, smooth) => {
      if (!root4.classList.contains("dpi-nav--scroll") || !a) return;
      const r = a.getBoundingClientRect();
      const l = list.getBoundingClientRect();
      list.scrollTo({ left: clamp7(list.scrollLeft + (r.left - l.left) - (l.width - r.width) / 2, 0, list.scrollWidth - list.clientWidth), behavior: smooth && !reduced9() ? "smooth" : "auto" });
    };
    reveal2(root4.querySelector("[aria-current]"), false);
    list.addEventListener("focusin", (e) => reveal2(e.target.closest("a"), true));
    if (root4.hasAttribute("data-dpi-spy")) {
      const links = [...root4.querySelectorAll('a[href^="#"]')];
      const targets = links.map((a) => document.getElementById(decodeURIComponent(a.getAttribute("href").slice(1))));
      let raf = 0;
      const run = () => {
        let cur2 = -1;
        targets.forEach((t, i) => {
          if (t && t.getBoundingClientRect().top <= innerHeight * 0.3) cur2 = i;
        });
        links.forEach((a, i) => i === cur2 ? (a.setAttribute("aria-current", "location"), reveal2(a, true)) : a.removeAttribute("aria-current"));
      };
      listenWhile(root4, window, "scroll", () => {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(run);
      }, { passive: true });
      run();
    }
  }
  function combobox(root4) {
    const input = root4.querySelector(".dpi-combobox__input");
    const hidden = root4.querySelector("[data-dpi-combobox-value]");
    const list = root4.querySelector('[role="listbox"]');
    const empty = list.querySelector(".dpi-combobox__empty");
    const opts2 = () => [...list.querySelectorAll('[role="option"]')];
    const free = root4.dataset.free === "true";
    let active2 = -1;
    const visible = () => opts2().filter((o) => !o.hidden);
    const open6 = (o) => {
      list.hidden = !o;
      input.setAttribute("aria-expanded", String(o));
      if (!o) {
        active2 = -1;
        input.removeAttribute("aria-activedescendant");
        opts2().forEach((x) => x.removeAttribute("data-active"));
      }
    };
    const setActive2 = (i) => {
      const v = visible();
      if (!v.length) return;
      active2 = (i + v.length) % v.length;
      opts2().forEach((x) => x.removeAttribute("data-active"));
      const o = v[active2];
      o.setAttribute("data-active", "");
      input.setAttribute("aria-activedescendant", o.id);
      o.scrollIntoView({ block: "nearest" });
    };
    const filter = () => {
      const q = norm(input.value.trim());
      let n = 0;
      for (const o of opts2()) {
        const m = q === "" || norm(o.textContent).includes(q);
        o.hidden = !m;
        if (m) n++;
      }
      empty.hidden = n > 0;
      active2 = -1;
      opts2().forEach((x) => x.removeAttribute("data-active"));
    };
    const committed = { v: hidden.value, l: input.value };
    const syncSelected = () => opts2().forEach((x) => x.setAttribute("aria-selected", String(committed.v !== "" && x.dataset.value === committed.v)));
    const commit = (v, l, notify) => {
      const changed = hidden.value !== v;
      input.value = l;
      hidden.value = v;
      committed.v = v;
      committed.l = l;
      syncSelected();
      if (changed) hidden.dispatchEvent(new Event("change", { bubbles: true }));
      if (notify) emit(root4, "combobox-select", { value: v, label: l });
    };
    const choose = (o) => {
      open6(false);
      commit(o.dataset.value, o.textContent, true);
    };
    const revert = () => {
      if (free) return;
      input.value = committed.l;
      if (hidden.value !== committed.v) {
        hidden.value = committed.v;
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }
    };
    input.addEventListener("input", () => {
      filter();
      open6(true);
      if (free) {
        hidden.value = input.value;
        return;
      }
      if (hidden.value !== "") {
        hidden.value = "";
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
    input.addEventListener("focus", () => {
      filter();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        if (list.hidden) {
          filter();
          open6(true);
        }
        setActive2(active2 + 1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (list.hidden) {
          filter();
          open6(true);
        }
        setActive2(active2 < 0 ? visible().length - 1 : active2 - 1);
      } else if (e.key === "Enter") {
        if (!list.hidden && active2 >= 0) {
          e.preventDefault();
          choose(visible()[active2]);
        }
      } else if (e.key === "Escape") {
        if (!list.hidden) {
          e.preventDefault();
          e.stopPropagation();
          open6(false);
          revert();
        } else if (!free && input.value !== committed.l) {
          e.preventDefault();
          e.stopPropagation();
          revert();
        }
      } else if (e.key === "Home" && !list.hidden) {
        e.preventDefault();
        setActive2(0);
      } else if (e.key === "End" && !list.hidden) {
        e.preventDefault();
        setActive2(visible().length - 1);
      }
    });
    list.addEventListener("mousedown", (e) => e.preventDefault());
    list.addEventListener("click", (e) => {
      const o = e.target.closest('[role="option"]');
      if (o && !o.hidden) choose(o);
    });
    root4.addEventListener("focusout", (e) => {
      if (root4.contains(e.relatedTarget)) return;
      open6(false);
      if (free) return;
      const q = norm(input.value.trim());
      const exact = q === "" ? null : opts2().find((o) => norm(o.textContent) === q);
      if (exact) commit(exact.dataset.value, exact.textContent, hidden.value !== exact.dataset.value);
      else if (q === "") commit("", "", false);
      else revert();
    });
    root4.closest("form")?.addEventListener("reset", () => {
      committed.v = hidden.defaultValue;
      committed.l = input.defaultValue;
      input.value = committed.l;
      hidden.value = committed.v;
      syncSelected();
      open6(false);
    });
  }
  function range(root4) {
    const input = root4.querySelector('input[type="range"]');
    const out = root4.querySelector("output");
    const upd = () => {
      const min = Number(input.min || 0);
      const max = Number(input.max || 100);
      input.style.setProperty("--dpi-range-fill", `${(Number(input.value) - min) / Math.max(1, max - min) * 100}%`);
      if (out) out.textContent = input.value;
    };
    input.addEventListener("input", upd);
    input.form?.addEventListener("reset", () => requestAnimationFrame(upd));
    upd();
  }
  function otp(root4) {
    const cells = [...root4.querySelectorAll(".dpi-otp__cell")];
    const hidden = root4.querySelector("[data-dpi-otp-value]");
    const numeric = cells[0]?.inputMode === "numeric";
    const clean = (s) => numeric ? s.replace(/\D/g, "") : s.replace(/\s/g, "");
    const sync8 = () => {
      const v = cells.map((c) => c.value).join("");
      if (hidden.value !== v) {
        hidden.value = v;
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }
      if (v.length === cells.length) emit(root4, "otp-complete", { value: v });
    };
    cells.forEach((c, i) => {
      c.addEventListener("input", () => {
        const v = clean(c.value);
        c.value = v.slice(-1);
        if (c.value && cells[i + 1]) cells[i + 1].focus();
        sync8();
      });
      c.addEventListener("keydown", (e) => {
        if (e.key === "Backspace" && !c.value && cells[i - 1]) {
          e.preventDefault();
          cells[i - 1].value = "";
          cells[i - 1].focus();
          sync8();
        } else if (e.key === "ArrowLeft" && cells[i - 1]) {
          e.preventDefault();
          cells[i - 1].focus();
        } else if (e.key === "ArrowRight" && cells[i + 1]) {
          e.preventDefault();
          cells[i + 1].focus();
        }
      });
      c.addEventListener("focus", () => c.select());
      c.addEventListener("paste", (e) => {
        e.preventDefault();
        const t = clean(e.clipboardData?.getData("text") ?? "");
        [...t].slice(0, cells.length - i).forEach((ch, k) => {
          cells[i + k].value = ch;
        });
        cells[Math.min(cells.length - 1, i + t.length)]?.focus();
        sync8();
      });
    });
    root4.closest("form")?.addEventListener("reset", () => requestAnimationFrame(sync8));
  }
  var LEVELS = ["Molto debole", "Debole", "Discreta", "Buona", "Ottima"];
  function password(root4) {
    const input = root4.querySelector("input");
    const btn = root4.querySelector(".dpi-input-group__addon .dpi-btn");
    btn?.setAttribute("aria-pressed", "false");
    btn?.addEventListener("click", () => {
      const show3 = input.type === "password";
      input.type = show3 ? "text" : "password";
      btn.setAttribute("aria-pressed", String(show3));
    });
    const meter = root4.querySelector(".dpi-strength");
    if (!meter) return;
    const label2 = meter.querySelector("[data-dpi-strength-label]");
    const score = (v) => {
      if (!v) return -1;
      let s = 0;
      if (v.length >= 8) s++;
      if (v.length >= 12) s++;
      if (/[a-z]/.test(v) && /[A-Z]/.test(v)) s++;
      if (/\d/.test(v)) s++;
      if (/[^A-Za-z0-9]/.test(v)) s++;
      return Math.min(4, Math.max(0, s - (v.length < 6 ? 1 : 0)));
    };
    const upd = () => {
      const s = score(input.value);
      meter.dataset.score = String(s);
      label2.textContent = s < 0 ? "Robustezza: —" : `Robustezza: ${LEVELS[s]}`;
    };
    input.addEventListener("input", upd);
    upd();
  }
  function markFailed(img) {
    const host = img.closest(".dpi-image, .dpi-avatar");
    host?.setAttribute("data-dpi-failed", "");
  }
  function checkImages(root4) {
    root4.querySelectorAll("img[data-dpi-image], img.dpi-avatar__img").forEach((img) => {
      if (img.complete && img.naturalWidth === 0 && img.getAttribute("src")) markFailed(img);
    });
  }
  function init2(root4 = document) {
    const each = (sel2, fn) => root4.querySelectorAll(sel2).forEach((el6) => {
      if (once(el6)) fn(el6);
    });
    each("[data-dpi-tabs]", tabs);
    each("[data-dpi-tooltip]", tooltip);
    each("[data-dpi-popover]", popover);
    each("[data-dpi-stepper]", stepper);
    each("[data-dpi-carousel]", carousel);
    each('[data-dpi-chips="input"]', chips);
    each("[data-dpi-split]", split);
    each("[data-dpi-nav]", nav);
    each("[data-dpi-combobox]", combobox);
    each("[data-dpi-range]", range);
    each("[data-dpi-otp]", otp);
    each("[data-dpi-password]", password);
    each(".dpi-toast[data-dpi-duration]", armToast);
    checkImages(root4);
  }
  var bound9 = false;
  function bind9() {
    if (bound9) return;
    bound9 = true;
    document.addEventListener("error", (e) => {
      if (e.target instanceof HTMLImageElement && (e.target.hasAttribute("data-dpi-image") || e.target.classList.contains("dpi-avatar__img"))) markFailed(e.target);
    }, true);
    document.addEventListener("click", (e) => {
      const b = e.target.closest?.(".dpi-toast .dpi-btn");
      if (b) b.closest(".dpi-toast").remove();
    });
  }

  // dpi/js/calendar.js
  var calendar_exports = {};
  __export(calendar_exports, {
    datepickerApi: () => datepickerApi,
    init: () => init3
  });

  // dpi/js/anchor.js
  function place3(panel2, anchor) {
    const m = 8, gap = 4;
    const r = anchor.getBoundingClientRect();
    const rtl2 = getComputedStyle(anchor).direction === "rtl";
    panel2.style.position = "fixed";
    panel2.style.left = "0px";
    panel2.style.top = "0px";
    const w = panel2.offsetWidth;
    const h = panel2.offsetHeight;
    const below = innerHeight - r.bottom - gap - m;
    const above = r.top - gap - m;
    const down = h <= below || below >= above;
    let left = rtl2 ? r.right - w : r.left;
    left = Math.max(m, Math.min(left, innerWidth - m - w));
    const top = down ? r.bottom + gap : r.top - gap - h;
    panel2.style.left = `${Math.round(left)}px`;
    panel2.style.top = `${Math.round(Math.max(m, Math.min(top, innerHeight - m - h)))}px`;
    panel2.setAttribute("data-dpi-placement", down ? "bottom" : "top");
  }
  function track2(panel2, anchor, { onOpen, onClose } = {}) {
    let raf = 0;
    const again = (e) => {
      if (e?.target && panel2.contains(e.target)) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        if (panel2.matches(":popover-open")) place3(panel2, anchor);
      });
    };
    panel2.addEventListener("toggle", (e) => {
      if (e.newState === "open") {
        place3(panel2, anchor);
        addEventListener("resize", again);
        addEventListener("scroll", again, true);
        onOpen?.();
      } else {
        removeEventListener("resize", again);
        removeEventListener("scroll", again, true);
        cancelAnimationFrame(raf);
        onClose?.();
      }
    });
  }
  function fire(el6) {
    el6.dispatchEvent(new Event("input", { bubbles: true }));
    el6.dispatchEvent(new Event("change", { bubbles: true }));
  }

  // dpi/js/calendar.js
  var pad = (n) => String(n).padStart(2, "0");
  var iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  var parse = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return iso(d) === s ? d : null;
  };
  var addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
  var addMonths = (d, n) => {
    const t = new Date(d.getFullYear(), d.getMonth() + n, 1);
    const last = new Date(t.getFullYear(), t.getMonth() + 1, 0).getDate();
    return new Date(t.getFullYear(), t.getMonth(), Math.min(d.getDate(), last));
  };
  var done2 = /* @__PURE__ */ new WeakSet();
  function setup9(root4) {
    const cfg = {
      locale: root4.dataset.locale === "en" ? "en-GB" : "it-IT",
      first: Number(root4.dataset.firstDay ?? 1),
      today: parse(root4.dataset.today) ?? /* @__PURE__ */ new Date(),
      min: parse(root4.dataset.min),
      max: parse(root4.dataset.max),
      disabled: new Set(JSON.parse(root4.dataset.disabled || "[]")),
      dow: new Set(JSON.parse(root4.dataset.disabledWeekdays || "[]")),
      events: JSON.parse(root4.dataset.events || "{}"),
      details: root4.dataset.details === "true"
    };
    const it = cfg.locale === "it-IT";
    const longDate = new Intl.DateTimeFormat(cfg.locale, { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const monthName = new Intl.DateTimeFormat(cfg.locale, { month: "long" });
    const wdShort = new Intl.DateTimeFormat(cfg.locale, { weekday: "short" });
    const wdLong = new Intl.DateTimeFormat(cfg.locale, { weekday: "long" });
    const st = { month: parse(`${root4.dataset.month}-01`) ?? new Date(cfg.today.getFullYear(), cfg.today.getMonth(), 1), value: parse(root4.dataset.value) };
    const grid = root4.querySelector(".dpi-calendar__grid");
    const body = grid.querySelector("tbody");
    const head = grid.querySelector("thead tr");
    const selM = root4.querySelector('[data-dpi-cal="month"]');
    const selY = root4.querySelector('[data-dpi-cal="year"]');
    const live3 = root4.querySelector("[data-dpi-cal-title]");
    const det = root4.querySelector("[data-dpi-cal-details]");
    const hidden = root4.querySelector("[data-dpi-cal-value]");
    const isDisabled = (d) => cfg.min && d < cfg.min || cfg.max && d > cfg.max || cfg.disabled.has(iso(d)) || cfg.dow.has(d.getDay());
    const evOf = (d) => cfg.events[iso(d)] ?? [];
    const label2 = (d) => {
      const n = evOf(d).length;
      return longDate.format(d) + (n ? `, ${n} ${it ? n === 1 ? "evento" : "eventi" : n === 1 ? "event" : "events"}` : "");
    };
    function mk4(tag, cls, text2) {
      const e = document.createElement(tag);
      if (cls) e.className = cls;
      if (text2 != null) e.textContent = text2;
      return e;
    }
    function renderHead() {
      head.replaceChildren();
      for (let i = 0; i < 7; i++) {
        const k = (cfg.first + i) % 7;
        const ref = new Date(2021, 0, 3 + k);
        const th = mk4("th", "dpi-calendar__wd", wdShort.format(ref).replace(".", "").slice(0, 3));
        th.scope = "col";
        th.abbr = wdLong.format(ref);
        head.append(th);
      }
    }
    function renderDetails() {
      if (!det) return;
      det.replaceChildren();
      if (!st.value) {
        det.append(mk4("p", "dpi-hint", it ? "Seleziona un giorno per vedere gli eventi." : "Select a day to see its events."));
        return;
      }
      const ev = evOf(st.value);
      if (!ev.length) {
        det.append(mk4("p", "dpi-hint", it ? `Nessun evento il ${longDate.format(st.value)}.` : `No events on ${longDate.format(st.value)}.`));
        return;
      }
      const ul = mk4("ul", "dpi-calendar__events");
      for (const e of ev) {
        const li = mk4("li", "dpi-calendar__event");
        li.append(mk4("span", "dpi-calendar__event-time", e.time), mk4("span", "dpi-calendar__event-title", e.title));
        if (e.place) li.append(mk4("span", "dpi-calendar__event-place", e.place));
        ul.append(li);
      }
      det.append(ul);
    }
    function render2(focusIso = null) {
      const y = st.month.getFullYear();
      const m = st.month.getMonth();
      selM.value = String(m + 1);
      if (![...selY.options].some((o) => Number(o.value) === y) || Number(selY.options[0].value) > y - 3 || Number(selY.options[selY.options.length - 1].value) < y + 3) {
        selY.replaceChildren(...Array.from({ length: 21 }, (_, i) => {
          const o = mk4("option", "", String(y - 10 + i));
          o.value = String(y - 10 + i);
          return o;
        }));
      }
      selY.value = String(y);
      live3.textContent = `${monthName.format(st.month)} ${y}`;
      grid.setAttribute("aria-label", live3.textContent);
      const first = new Date(y, m, 1);
      const offset = (first.getDay() - cfg.first + 7) % 7;
      const start3 = addDays(first, -offset);
      const focus = focusIso ?? (st.value && st.value.getMonth() === m && st.value.getFullYear() === y ? iso(st.value) : cfg.today.getMonth() === m && cfg.today.getFullYear() === y ? iso(cfg.today) : iso(first));
      body.replaceChildren();
      for (let w = 0; w < 6; w++) {
        const tr = document.createElement("tr");
        for (let i = 0; i < 7; i++) {
          const d = addDays(start3, w * 7 + i);
          const k = iso(d);
          const td = mk4("td", "dpi-calendar__cell");
          td.setAttribute("role", "gridcell");
          const b = document.createElement("button");
          b.type = "button";
          b.className = ["dpi-calendar__day", d.getMonth() !== m ? "dpi-calendar__day--outside" : "", k === iso(cfg.today) ? "dpi-calendar__day--today" : "", st.value && k === iso(st.value) ? "dpi-calendar__day--selected" : "", evOf(d).length ? "dpi-calendar__day--events" : ""].filter(Boolean).join(" ");
          b.dataset.date = k;
          b.tabIndex = k === focus ? 0 : -1;
          b.disabled = isDisabled(d);
          b.setAttribute("aria-pressed", String(!!st.value && k === iso(st.value)));
          if (k === iso(cfg.today)) b.setAttribute("aria-current", "date");
          b.setAttribute("aria-label", label2(d));
          b.append(mk4("span", "dpi-calendar__num", String(d.getDate())));
          if (evOf(d).length) {
            const dots = mk4("span", "dpi-calendar__dots");
            dots.setAttribute("aria-hidden", "true");
            dots.append(mk4("span", "dpi-calendar__dot"));
            b.append(dots);
          }
          td.append(b);
          tr.append(td);
        }
        body.append(tr);
      }
      renderDetails();
      if (focusIso) body.querySelector(`[data-date="${focusIso}"]`)?.focus();
    }
    function select2(d, { silent = false } = {}) {
      if (isDisabled(d)) return;
      st.value = d;
      st.month = new Date(d.getFullYear(), d.getMonth(), 1);
      root4.dataset.value = iso(d);
      if (hidden) {
        hidden.value = iso(d);
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      }
      render2();
      if (!silent) emit(root4, "calendar-select", { date: iso(d), events: evOf(d) });
    }
    function go(months, focusIso = null) {
      st.month = new Date(st.month.getFullYear(), st.month.getMonth() + months, 1);
      render2(focusIso);
      emit(root4, "calendar-navigate", { month: `${st.month.getFullYear()}-${pad(st.month.getMonth() + 1)}` });
    }
    root4.addEventListener("click", (e) => {
      const day = e.target.closest(".dpi-calendar__day");
      if (day && root4.contains(day)) {
        const d = parse(day.dataset.date);
        if (d) select2(d);
        return;
      }
      const nav2 = e.target.closest("[data-dpi-cal]");
      if (!nav2 || nav2.matches("select")) return;
      const a = nav2.dataset.dpiCal;
      if (a === "prev") go(-1);
      else if (a === "next") go(1);
      else if (a === "today") {
        st.month = new Date(cfg.today.getFullYear(), cfg.today.getMonth(), 1);
        select2(cfg.today);
      }
    });
    root4.addEventListener("change", (e) => {
      const t = e.target;
      if (t === selM) {
        st.month = new Date(st.month.getFullYear(), Number(selM.value) - 1, 1);
        render2();
      } else if (t === selY) {
        st.month = new Date(Number(selY.value), st.month.getMonth(), 1);
        render2();
      }
    });
    root4.addEventListener("keydown", (e) => {
      const day = e.target.closest?.(".dpi-calendar__day");
      if (!day) return;
      const cur2 = parse(day.dataset.date);
      let n = null;
      const wd = (cur2.getDay() - cfg.first + 7) % 7;
      if (e.key === "ArrowLeft") n = addDays(cur2, -1);
      else if (e.key === "ArrowRight") n = addDays(cur2, 1);
      else if (e.key === "ArrowUp") n = addDays(cur2, -7);
      else if (e.key === "ArrowDown") n = addDays(cur2, 7);
      else if (e.key === "Home") n = addDays(cur2, -wd);
      else if (e.key === "End") n = addDays(cur2, 6 - wd);
      else if (e.key === "PageUp") n = addMonths(cur2, e.shiftKey ? -12 : -1);
      else if (e.key === "PageDown") n = addMonths(cur2, e.shiftKey ? 12 : 1);
      if (!n) return;
      e.preventDefault();
      if (n.getMonth() !== st.month.getMonth() || n.getFullYear() !== st.month.getFullYear()) {
        st.month = new Date(n.getFullYear(), n.getMonth(), 1);
        render2(iso(n));
        emit(root4, "calendar-navigate", { month: `${n.getFullYear()}-${pad(n.getMonth() + 1)}` });
      } else body.querySelector(`[data-date="${iso(n)}"]`)?.focus();
    });
    root4.__dpiCal = { isDisabled, setLimits(min, max) {
      cfg.min = parse(min);
      cfg.max = parse(max);
      render2();
    }, setValue(d) {
      if (d) {
        st.value = d;
        st.month = new Date(d.getFullYear(), d.getMonth(), 1);
        root4.dataset.value = iso(d);
      } else {
        st.value = null;
        delete root4.dataset.value;
      }
      render2();
    }, select: select2 };
    renderHead();
    render2();
  }
  var dpReg = ownedMap();
  function datepicker(root4) {
    const text2 = root4.querySelector("[data-dpi-date-text]");
    const hidden = root4.querySelector("[data-dpi-date-value]");
    const panel2 = root4.querySelector("[popover]");
    const cal = root4.querySelector("[data-dpi-calendar]");
    if (!text2 || !hidden || !cal) return;
    const btn = root4.querySelector("[popovertarget]");
    const it = root4.dataset.locale !== "en";
    const fmt2 = (d) => it ? `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}` : iso(d);
    const read = (s) => {
      const m = (it ? /^(\d{1,2})[/.-](\d{1,2})[/.-](\d{4})$/ : /^(\d{4})-(\d{1,2})-(\d{1,2})$/).exec(s.trim());
      if (!m) return null;
      const [y, mo, d] = it ? [m[3], m[2], m[1]] : [m[1], m[2], m[3]];
      return parse(`${y}-${pad(Number(mo))}-${pad(Number(d))}`);
    };
    const limits = () => cal.__dpiCal?.setLimits(root4.dataset.min || null, root4.dataset.max || null);
    const blocked = (d) => !!cal.__dpiCal?.isDisabled(d);
    const bad = (msg) => {
      text2.setCustomValidity(msg ?? (it ? "Data non valida o non selezionabile." : "Invalid or unavailable date."));
      hidden.value = "";
    };
    const fire3 = () => {
      hidden.dispatchEvent(new Event("input", { bubbles: true }));
      hidden.dispatchEvent(new Event("change", { bubbles: true }));
      emit(root4, "datepicker-change", { value: hidden.value });
    };
    function put(d, { notify = true, keepText = false } = {}) {
      if (!d) {
        if (!keepText) text2.value = "";
        hidden.value = "";
        text2.setCustomValidity("");
        cal.__dpiCal?.setValue(null);
      } else if (blocked(d)) {
        if (!keepText) text2.value = fmt2(d);
        bad();
      } else {
        if (!keepText) text2.value = fmt2(d);
        hidden.value = iso(d);
        text2.setCustomValidity("");
        cal.__dpiCal?.setValue(d);
      }
      if (notify) fire3();
    }
    function fromText(notify) {
      const v = text2.value.trim();
      if (v === "") return put(null, { notify });
      const d = read(v);
      if (!d) {
        bad();
        if (notify) fire3();
        return;
      }
      put(d, { notify, keepText: true });
    }
    const api = {
      sync(value2) {
        limits();
        if (value2 !== void 0) hidden.value = value2 ?? "";
        const d = parse(hidden.value);
        if (d) put(d, { notify: false });
        else if (hidden.value === "") {
          text2.value = "";
          text2.setCustomValidity("");
          cal.__dpiCal?.setValue(null);
        } else {
          text2.value = hidden.value;
          bad();
        }
      },
      fromText
    };
    dpReg.set(root4, api);
    limits();
    cal.addEventListener("dpi:calendar-select", (e) => {
      const d = parse(e.detail.date);
      if (!d) return;
      put(d);
      panel2?.hidePopover?.();
      text2.focus();
    });
    text2.addEventListener("input", () => fromText(true));
    text2.addEventListener("change", () => {
      const d = read(text2.value);
      if (d && !blocked(d)) text2.value = fmt2(d);
    });
    text2.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && e.altKey && panel2 && !panel2.matches(":popover-open")) {
        e.preventDefault();
        panel2.showPopover?.();
      }
    });
    if (panel2) track2(panel2, text2.closest(".dpi-input-group") ?? text2, {
      onOpen() {
        btn?.setAttribute("aria-expanded", "true");
        (cal.querySelector('.dpi-calendar__day[tabindex="0"]:not(:disabled)') ?? cal.querySelector(".dpi-calendar__day:not(:disabled)"))?.focus({ preventScroll: true });
      },
      onClose() {
        btn?.setAttribute("aria-expanded", "false");
      }
    });
    btn?.setAttribute("aria-expanded", "false");
  }
  var dpBound = false;
  function bindReset() {
    if (dpBound) return;
    dpBound = true;
    document.addEventListener("reset", (e) => {
      const f3 = e.target;
      if (!(f3 instanceof HTMLFormElement)) return;
      requestAnimationFrame(() => f3.querySelectorAll("[data-dpi-datepicker]").forEach((el6) => dpReg.get(el6)?.fromText(false)));
    });
  }
  var datepickerApi = {
    sync(el6, value2) {
      const r = el6?.closest?.("[data-dpi-datepicker]") ?? el6?.querySelector?.("[data-dpi-datepicker]");
      if (r) dpReg.get(r)?.sync(value2);
    }
  };
  function init3(root4 = document) {
    bindReset();
    root4.querySelectorAll("[data-dpi-calendar]").forEach((el6) => {
      if (!done2.has(el6)) {
        done2.add(el6);
        setup9(el6);
      }
    });
    root4.querySelectorAll("[data-dpi-datepicker]").forEach((el6) => {
      if (!done2.has(el6)) {
        done2.add(el6);
        datepicker(el6);
      }
    });
  }

  // dpi/js/pickers.js
  var pickers_exports = {};
  __export(pickers_exports, {
    init: () => init4,
    timepickerApi: () => timepickerApi,
    weekdaysApi: () => weekdaysApi
  });
  var pad2 = (n) => String(n).padStart(2, "0");
  var done3 = /* @__PURE__ */ new WeakSet();
  var mk = (tag, cls, text2) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text2 != null) e.textContent = text2;
    return e;
  };
  var toMin = (s) => {
    const m = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec((s ?? "").trim());
    return m ? Number(m[1]) * 60 + Number(m[2]) : null;
  };
  var toStr = (n) => `${pad2(Math.floor(n / 60))}:${pad2(n % 60)}`;
  function lenient(s) {
    const t = s.trim();
    let m = /^(\d{1,2})\s*[:.,h]\s*(\d{1,2})$/.exec(t);
    let h;
    let mi;
    if (m) {
      h = Number(m[1]);
      mi = Number(m[2]);
    } else if (m = /^(\d{1,2})$/.exec(t)) {
      h = Number(m[1]);
      mi = 0;
    } else if (m = /^(\d{3,4})$/.exec(t)) {
      h = Number(t.slice(0, -2));
      mi = Number(t.slice(-2));
    } else return null;
    return h < 24 && mi < 60 ? h * 60 + mi : null;
  }
  var tpReg = ownedMap();
  function timepicker(root4) {
    const text2 = root4.querySelector("[data-dpi-time-text]");
    const hidden = root4.querySelector("[data-dpi-time-value]");
    const panel2 = root4.querySelector("[popover]");
    const btn = root4.querySelector("[popovertarget]");
    if (!text2 || !hidden || !panel2) return;
    const it = root4.dataset.locale !== "en";
    const msg = { invalid: it ? "Ora non valida: usa il formato HH:MM." : "Invalid time: use HH:MM.", range: it ? "Ora fuori dall’intervallo consentito." : "Time outside the allowed range." };
    const lim = () => ({ min: toMin(root4.dataset.min) ?? 0, max: toMin(root4.dataset.max) ?? 1439, step: Math.min(60, Math.max(1, Math.round(Number(root4.dataset.step) || 1))) });
    const cur2 = () => toMin(hidden.value);
    const bad = (m) => {
      text2.setCustomValidity(m);
      hidden.value = "";
    };
    const notify = () => {
      fire(hidden);
      emit(root4, "timepicker-change", { value: hidden.value });
    };
    function put(n, { fireIt = true, keepText = false } = {}) {
      const { min, max } = lim();
      if (n == null) {
        if (!keepText) text2.value = "";
        hidden.value = "";
        text2.setCustomValidity("");
      } else if (n < min || n > max) {
        if (!keepText) text2.value = toStr(n);
        bad(msg.range);
      } else {
        if (!keepText) text2.value = toStr(n);
        hidden.value = toStr(n);
        text2.setCustomValidity("");
      }
      if (fireIt) notify();
    }
    function fromText(fireIt) {
      const v = text2.value.trim();
      if (v === "") return put(null, { fireIt });
      const n = toMin(v);
      if (n == null) {
        bad(msg.invalid);
        if (fireIt) notify();
        return;
      }
      put(n, { fireIt, keepText: true });
    }
    const api = {
      sync(value2) {
        if (value2 !== void 0) hidden.value = value2 ?? "";
        const v = hidden.value.trim();
        if (v === "") {
          text2.value = "";
          text2.setCustomValidity("");
        } else {
          const n = toMin(v);
          if (n == null) {
            text2.value = v;
            bad(msg.invalid);
          } else put(n, { fireIt: false });
        }
      },
      fromText,
      setDisabled(off2) {
        text2.disabled = !!off2;
        if (btn) btn.disabled = !!off2;
        root4.toggleAttribute("data-disabled", !!off2);
        if (off2) panel2.hidePopover?.();
      }
    };
    tpReg.set(root4, api);
    const cols = mk("div", "dpi-timepicker__cols");
    const hCol = mk("div", "dpi-timepicker__col");
    hCol.setAttribute("role", "listbox");
    hCol.setAttribute("aria-label", it ? "Ore" : "Hours");
    const mCol = mk("div", "dpi-timepicker__col");
    mCol.setAttribute("role", "listbox");
    mCol.setAttribute("aria-label", it ? "Minuti" : "Minutes");
    cols.append(hCol, mCol);
    panel2.append(cols);
    const item2 = (col, v, selected, ok) => {
      const b = mk("button", "dpi-timepicker__opt", pad2(v));
      b.type = "button";
      b.setAttribute("role", "option");
      b.dataset.v = String(v);
      b.tabIndex = -1;
      b.setAttribute("aria-selected", String(!!selected));
      b.disabled = !ok;
      col.append(b);
    };
    function build3() {
      const { min, max, step } = lim();
      const n = cur2();
      const h = n == null ? null : Math.floor(n / 60);
      const okMin = (hh2, m) => hh2 * 60 + m >= min && hh2 * 60 + m <= max;
      hCol.replaceChildren();
      mCol.replaceChildren();
      for (let hh2 = 0; hh2 < 24; hh2++) {
        let any = false;
        for (let m = 0; m < 60; m += step) if (okMin(hh2, m)) {
          any = true;
          break;
        }
        item2(hCol, hh2, hh2 === h, any);
      }
      const hh = h ?? Number([...hCol.children].find((b) => !b.disabled)?.dataset.v ?? 0);
      const mins = /* @__PURE__ */ new Set();
      for (let m = 0; m < 60; m += step) mins.add(m);
      if (n != null) mins.add(n % 60);
      for (const m of [...mins].sort((a, b) => a - b)) item2(mCol, m, n != null && m === n % 60, okMin(hh, m));
      for (const col of [hCol, mCol]) {
        const first = col.querySelector('[aria-selected="true"]:not(:disabled)') ?? col.querySelector(".dpi-timepicker__opt:not(:disabled)");
        if (first) first.tabIndex = 0;
      }
    }
    const scrollSel = (col) => {
      const s = col.querySelector('[aria-selected="true"]') ?? col.querySelector('[tabindex="0"]');
      if (s) col.scrollTop = Math.max(0, s.offsetTop - col.clientHeight / 2 + s.offsetHeight / 2);
    };
    const focusIn = (col) => (col.querySelector('[aria-selected="true"]:not(:disabled)') ?? col.querySelector('[tabindex="0"]') ?? col.querySelector(".dpi-timepicker__opt:not(:disabled)"))?.focus({ preventScroll: true });
    panel2.addEventListener("click", (e) => {
      const b = e.target.closest(".dpi-timepicker__opt");
      if (!b || b.disabled) return;
      const { min, max, step } = lim();
      const n = cur2();
      if (b.parentElement === hCol) {
        const h = Number(b.dataset.v);
        let m = n == null ? 0 : n % 60;
        if (h * 60 + m < min || h * 60 + m > max) {
          m = 0;
          while (m < 60 && (h * 60 + m < min || h * 60 + m > max)) m += step;
        }
        put(h * 60 + m);
        build3();
        scrollSel(hCol);
        scrollSel(mCol);
        focusIn(mCol);
      } else {
        const h = n == null ? Number(hCol.querySelector(".dpi-timepicker__opt:not(:disabled)")?.dataset.v ?? 0) : Math.floor(n / 60);
        put(h * 60 + Number(b.dataset.v));
        panel2.hidePopover?.();
        text2.focus();
      }
    });
    panel2.addEventListener("keydown", (e) => {
      const b = e.target.closest?.(".dpi-timepicker__opt");
      if (!b) return;
      const col = b.parentElement;
      const list = [...col.querySelectorAll(".dpi-timepicker__opt:not(:disabled)")];
      const i = list.indexOf(b);
      let to = null;
      if (e.key === "ArrowDown") to = list[Math.min(list.length - 1, i + 1)];
      else if (e.key === "ArrowUp") to = list[Math.max(0, i - 1)];
      else if (e.key === "Home") to = list[0];
      else if (e.key === "End") to = list[list.length - 1];
      else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
        if (e.key === "ArrowRight" === (col === hCol)) {
          e.preventDefault();
          focusIn(col === hCol ? mCol : hCol);
        }
        return;
      }
      if (!to) return;
      e.preventDefault();
      for (const x of col.children) x.tabIndex = -1;
      to.tabIndex = 0;
      to.focus();
    });
    track2(panel2, text2.closest(".dpi-input-group") ?? text2, {
      onOpen() {
        build3();
        scrollSel(hCol);
        scrollSel(mCol);
        focusIn(hCol);
        btn?.setAttribute("aria-expanded", "true");
      },
      onClose() {
        btn?.setAttribute("aria-expanded", "false");
      }
    });
    btn?.setAttribute("aria-expanded", "false");
    text2.addEventListener("input", () => fromText(true));
    text2.addEventListener("change", () => {
      const n = text2.value.trim() === "" ? null : lenient(text2.value);
      if (n != null) put(n, { fireIt: cur2() !== n });
      else fromText(false);
    });
    text2.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && e.altKey && !panel2.matches(":popover-open")) {
        e.preventDefault();
        panel2.showPopover?.();
        return;
      }
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.altKey) {
        e.preventDefault();
        const { min, max, step } = lim();
        const n = cur2() ?? lenient(text2.value);
        const base = n ?? (e.key === "ArrowUp" ? min - step : max + step);
        const next = e.key === "ArrowUp" ? Math.ceil((base + 1) / step) * step : Math.floor((base - 1) / step) * step;
        put(Math.max(min, Math.min(max, next)));
      }
    });
  }
  function weekdays(root4) {
    const first = Number(root4.dataset.firstDay ?? 1);
    const items2 = [...root4.querySelectorAll(".dpi-weekdays__item")];
    items2.sort((a, b) => (Number(a.dataset.dow) - first + 7) % 7 - (Number(b.dataset.dow) - first + 7) % 7);
    for (const i of items2) root4.append(i);
    const inputs = () => [...root4.querySelectorAll(".dpi-weekdays__input")];
    root4.addEventListener("change", () => emit(root4, "weekdays-change", { values: inputs().filter((i) => i.checked).map((i) => i.value) }));
    root4.addEventListener("keydown", (e) => {
      const t = e.target;
      if (!(t instanceof HTMLInputElement) || t.type !== "checkbox" || e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const list = inputs().filter((i) => !i.disabled);
      const rtl2 = getComputedStyle(root4).direction === "rtl";
      const step = e.key === "ArrowRight" !== rtl2 ? 1 : -1;
      const to = list[(list.indexOf(t) + step + list.length) % list.length];
      if (to) {
        e.preventDefault();
        to.focus();
      }
    });
  }
  var weekdaysApi = {
    /** valori selezionati (stringhe, come inviati col form) */
    get(el6) {
      const r = el6?.closest?.("[data-dpi-weekdays]") ?? el6;
      return [...r?.querySelectorAll(".dpi-weekdays__input:checked") ?? []].map((i) => i.value);
    },
    /** imposta la selezione da codice (array di valori) */
    set(el6, values) {
      const r = el6?.closest?.("[data-dpi-weekdays]") ?? el6;
      const v = new Set((values ?? []).map(String));
      r?.querySelectorAll(".dpi-weekdays__input").forEach((i) => {
        i.checked = v.has(i.value);
      });
    }
  };
  var timepickerApi = {
    /** riallinea testo, validità e pannello dopo un cambio da codice (hidden, data-min, data-max, data-step); con `value` lo imposta */
    sync(el6, value2) {
      const r = el6?.closest?.("[data-dpi-timepicker]") ?? el6?.querySelector?.("[data-dpi-timepicker]");
      if (r) tpReg.get(r)?.sync(value2);
    },
    setDisabled(el6, off2) {
      const r = el6?.closest?.("[data-dpi-timepicker]") ?? el6;
      if (r) tpReg.get(r)?.setDisabled(off2);
    }
  };
  function datetime(root4) {
    const dps = () => [...root4.querySelectorAll(".dpi-datepicker")];
    const tps = () => [...root4.querySelectorAll(".dpi-timepicker")];
    const all = root4.querySelector("[data-dpi-allday]");
    const val = (el6, sel2) => el6?.querySelector(sel2)?.value ?? "";
    function link() {
      const [d1, d2] = dps();
      const [t1, t2] = tps();
      const a = val(d1, "[data-dpi-date-value]");
      const b = val(d2, "[data-dpi-date-value]");
      if (d1 && d2) {
        if (a) {
          d2.dataset.min = a;
          if (b && b < a) datepickerApi.sync(d2, a);
          else datepickerApi.sync(d2);
        } else {
          delete d2.dataset.min;
          datepickerApi.sync(d2);
        }
      }
      if (t1 && t2) {
        const s = val(t1, "[data-dpi-time-value]");
        const e = val(t2, "[data-dpi-time-value]");
        const same = !d2 || !a || !b || a === b;
        if (same && s) {
          t2.dataset.min = s;
          if (e && e < s) timepickerApi.sync(t2, s);
          else timepickerApi.sync(t2);
        } else {
          delete t2.dataset.min;
          timepickerApi.sync(t2);
        }
      }
    }
    function allday() {
      if (all) tps().forEach((t) => tpReg.get(t)?.setDisabled(all.checked));
    }
    root4.addEventListener("change", () => {
      allday();
      link();
    });
    allday();
    link();
  }
  var bound10 = false;
  function bindReset2() {
    if (bound10) return;
    bound10 = true;
    document.addEventListener("reset", (e) => {
      const f3 = e.target;
      if (!(f3 instanceof HTMLFormElement)) return;
      requestAnimationFrame(() => {
        f3.querySelectorAll("[data-dpi-timepicker]").forEach((el6) => tpReg.get(el6)?.fromText(false));
        f3.querySelectorAll("[data-dpi-datetime]").forEach((el6) => el6.dispatchEvent(new Event("change", { bubbles: true })));
      });
    });
  }
  function init4(root4 = document) {
    bindReset2();
    root4.querySelectorAll("[data-dpi-timepicker]").forEach((el6) => {
      if (!done3.has(el6)) {
        done3.add(el6);
        timepicker(el6);
      }
    });
    root4.querySelectorAll("[data-dpi-weekdays]").forEach((el6) => {
      if (!done3.has(el6)) {
        done3.add(el6);
        weekdays(el6);
      }
    });
    root4.querySelectorAll("[data-dpi-datetime]").forEach((el6) => {
      if (!done3.has(el6)) {
        done3.add(el6);
        datetime(el6);
      }
    });
  }

  // dpi/js/map.js
  var map_exports = {};
  __export(map_exports, {
    hasProvider: () => hasProvider,
    init: () => init5,
    registerProvider: () => registerProvider
  });
  var providers = /* @__PURE__ */ new Map();
  var contexts = /* @__PURE__ */ new Set();
  var TILE = 256;
  var clamp8 = (v, a, b) => Math.min(Math.max(v, a), b);
  var done4 = /* @__PURE__ */ new WeakSet();
  var safeUrl = (u) => {
    try {
      const x = new URL(u, location.href);
      return x.protocol === "https:" || x.protocol === "http:" ? x.href : null;
    } catch {
      return null;
    }
  };
  function registerProvider(name, cfg) {
    if (typeof cfg?.tiles !== "string" || !safeUrl(cfg.tiles.replace(/\{[a-z]+\}/g, "0"))) throw new Error(`provider «${name}»: serve tiles (URL http/https con {z} {x} {y})`);
    if (cfg.tilesDark !== void 0 && (typeof cfg.tilesDark !== "string" || !safeUrl(cfg.tilesDark.replace(/\{[a-z]+\}/g, "0")))) throw new Error(`provider «${name}»: tilesDark deve essere un URL http/https con {z} {x} {y}`);
    if (!cfg.attribution) throw new Error(`provider «${name}»: l'attribuzione è obbligatoria`);
    providers.set(name, { maxZoom: 19, minZoom: 1, subdomains: ["a", "b", "c"], ...cfg });
    contexts.forEach((c) => c());
  }
  var effectiveTheme = () => document.documentElement.getAttribute("data-dpi-theme-effective") || (matchMedia?.("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  var hasProvider = (name) => providers.has(name);
  var worldX = (lng, z) => (lng + 180) / 360 * TILE * 2 ** z;
  var worldY = (lat, z) => {
    const s = Math.sin(clamp8(lat, -85.0511, 85.0511) * Math.PI / 180);
    return (0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI)) * TILE * 2 ** z;
  };
  var lngOf = (x, z) => x / (TILE * 2 ** z) * 360 - 180;
  var latOf = (y, z) => {
    const n = Math.PI - 2 * Math.PI * y / (TILE * 2 ** z);
    return 180 / Math.PI * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  };
  function setup10(root4) {
    const name = root4.dataset.provider || "";
    const load2 = root4.dataset.load || "consent";
    const fallback2 = root4.querySelector("[data-dpi-map-fallback]");
    const status = root4.querySelector("[data-dpi-map-status]");
    const vp = root4.querySelector("[data-dpi-map-viewport]");
    const markers = JSON.parse(root4.dataset.markers || "[]");
    const view = { lat: Number(root4.dataset.lat), lng: Number(root4.dataset.lng), z: Number(root4.dataset.zoom) };
    let started = false;
    let wired = false;
    const prov = () => providers.get(name);
    const fail = (msg) => {
      if (vp) vp.hidden = true;
      fallback2.hidden = false;
      status.textContent = msg;
      emit(root4, "map-fallback", { reason: msg });
    };
    function start3() {
      if (started) return;
      const P = prov();
      if (!P) return;
      started = true;
      fallback2.hidden = true;
      vp.hidden = false;
      const tiles = document.createElement("div");
      tiles.className = "dpi-map__tiles";
      const pins = document.createElement("div");
      pins.className = "dpi-map__pins";
      const attr3 = document.createElement("div");
      attr3.className = "dpi-map__attribution";
      const a = document.createElement("a");
      a.href = safeUrl(P.attributionUrl ?? "") ?? "#";
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.textContent = P.attribution;
      attr3.append(a);
      const tu = P.termsUrl ? safeUrl(P.termsUrl) : null;
      if (tu) {
        const t = document.createElement("a");
        t.href = tu;
        t.target = "_blank";
        t.rel = "noopener noreferrer";
        t.textContent = "Condizioni";
        attr3.append(document.createTextNode(" · "), t);
      }
      const popup2 = document.createElement("div");
      popup2.className = "dpi-map__popup";
      popup2.hidden = true;
      popup2.setAttribute("role", "dialog");
      vp.prepend(tiles, pins);
      vp.append(attr3, popup2);
      const imgs = /* @__PURE__ */ new Map();
      let variant = "";
      const themeVariant = () => effectiveTheme() === "dark" ? P.tilesDark ? "native" : P.darkTiles === "none" ? "light" : "adapted" : "light";
      const applyTheme = () => {
        const v = themeVariant();
        if (v === variant) return;
        const rebuild = v === "native" !== (variant === "native");
        variant = v;
        tiles.setAttribute("data-dpi-tile-theme", v === "native" ? "dark-native" : v === "adapted" ? "dark-adapted" : "light");
        if (P.darkFilter) tiles.style.setProperty("--dpi-map-dark-filter", String(P.darkFilter));
        if (rebuild) {
          for (const img of imgs.values()) img.remove();
          imgs.clear();
          if (rendered) render2();
        }
      };
      let rendered = false;
      listenWhile(root4, document, "dpi:theme-change", applyTheme);
      let errors = 0;
      let cspBlocked = false;
      const onCsp = (ev) => {
        if (ev.blockedURI && String(ev.blockedURI).startsWith(new URL(P.tiles.replace(/\{[a-z]+\}/g, "x"), location.href).origin)) cspBlocked = true;
      };
      listenWhile(root4, document, "securitypolicyviolation", onCsp);
      const diagnose = () => cspBlocked ? "La Content-Security-Policy dell'applicazione blocca il dominio delle tessere: va ammesso in img-src. Elenco dei luoghi:" : navigator.onLine === false ? "Rete assente: le tessere non possono essere caricate. Elenco dei luoghi:" : "Il provider non ha servito le tessere (rifiuto, ad esempio 403 per politica d'uso o referrer, chiave non valida, o servizio non raggiungibile). Elenco dei luoghi:";
      let loaded = 0;
      const size2 = () => ({ w: vp.clientWidth || 300, h: vp.clientHeight || 300 });
      let openMarker = -1;
      function render2() {
        rendered = true;
        const { w, h } = size2();
        const z = view.z;
        const cx = worldX(view.lng, z);
        const cy = worldY(view.lat, z);
        const x0 = Math.floor((cx - w / 2) / TILE);
        const x1 = Math.floor((cx + w / 2) / TILE);
        const y0 = Math.floor((cy - h / 2) / TILE);
        const y1 = Math.floor((cy + h / 2) / TILE);
        const n = 2 ** z;
        const want2 = /* @__PURE__ */ new Set();
        for (let ty = Math.max(0, y0); ty <= Math.min(n - 1, y1); ty++) {
          for (let tx = x0; tx <= x1; tx++) {
            const wx = (tx % n + n) % n;
            const key = `${variant}/${z}/${wx}/${ty}/${tx}`;
            want2.add(key);
            let img = imgs.get(key);
            if (!img) {
              img = document.createElement("img");
              img.className = "dpi-map__tile";
              img.alt = "";
              img.draggable = false;
              img.decoding = "async";
              img.referrerPolicy = P.referrerPolicy ?? "strict-origin-when-cross-origin";
              const key2 = typeof P.key === "function" ? P.key() : P.key ?? "";
              const sub = P.subdomains?.[(wx + ty) % P.subdomains.length] ?? "";
              img.src = (variant === "native" ? P.tilesDark : P.tiles).replace("{z}", z).replace("{x}", wx).replace("{y}", ty).replace("{s}", sub).replace("{key}", encodeURIComponent(key2));
              img.addEventListener("load", () => {
                loaded++;
              });
              img.addEventListener("error", () => {
                errors++;
                img.remove();
                imgs.delete(key);
                if (errors >= 6 && loaded === 0) {
                  started = false;
                  fail(diagnose());
                }
              });
              imgs.set(key, img);
              tiles.append(img);
            }
            img.style.left = `${Math.round(tx * TILE - (cx - w / 2))}px`;
            img.style.top = `${Math.round(ty * TILE - (cy - h / 2))}px`;
          }
        }
        for (const [k, img] of imgs) if (!want2.has(k)) {
          img.remove();
          imgs.delete(k);
        }
        pins.querySelectorAll(".dpi-map__pin").forEach((p, i) => {
          const m = markers[i];
          const px = worldX(m.lng, z) - (cx - w / 2);
          const py = worldY(m.lat, z) - (cy - h / 2);
          p.style.left = `${px}px`;
          p.style.top = `${py}px`;
          p.hidden = px < -20 || py < -20 || px > w + 20 || py > h + 20;
        });
        if (openMarker >= 0) placePopup();
      }
      function placePopup() {
        const p = pins.children[openMarker];
        if (!p || p.hidden) {
          popup2.hidden = true;
          return;
        }
        popup2.hidden = false;
        const { w } = size2();
        popup2.style.left = `${clamp8(parseFloat(p.style.left) - popup2.offsetWidth / 2, 6, Math.max(6, w - popup2.offsetWidth - 6))}px`;
        popup2.style.top = `${Math.max(6, parseFloat(p.style.top) - popup2.offsetHeight - 14)}px`;
      }
      markers.forEach((m, i) => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "dpi-map__pin";
        b.setAttribute("aria-label", m.title);
        b.setAttribute("aria-haspopup", "dialog");
        b.addEventListener("click", (e) => {
          e.stopPropagation();
          openMarker = openMarker === i ? -1 : i;
          if (openMarker < 0) {
            popup2.hidden = true;
            return;
          }
          popup2.replaceChildren();
          const t = document.createElement("strong");
          t.textContent = m.title;
          popup2.append(t);
          if (m.description) {
            const d = document.createElement("span");
            d.textContent = m.description;
            popup2.append(d);
          }
          popup2.setAttribute("aria-label", m.title);
          placePopup();
          emit(root4, "map-marker", { index: i, title: m.title });
        });
        pins.append(b);
      });
      const zoom = (dz) => {
        view.z = clamp8(view.z + dz, P.minZoom, P.maxZoom);
        render2();
      };
      const pan = (dx, dy) => {
        const z = view.z;
        view.lng = lngOf(worldX(view.lng, z) + dx, z);
        view.lat = latOf(worldY(view.lat, z) + dy, z);
        render2();
      };
      const ctl = vp.querySelectorAll(".dpi-map__controls .dpi-btn");
      ctl[0]?.addEventListener("click", () => zoom(1));
      ctl[1]?.addEventListener("click", () => zoom(-1));
      let drag = null;
      vp.addEventListener("pointerdown", (e) => {
        if (e.target.closest(".dpi-btn, .dpi-map__pin, .dpi-map__popup, a")) return;
        drag = { x: e.clientX, y: e.clientY };
        vp.setPointerCapture(e.pointerId);
        vp.dataset.dpiDragging = "";
      });
      vp.addEventListener("pointermove", (e) => {
        if (!drag) return;
        pan(drag.x - e.clientX, drag.y - e.clientY);
        drag = { x: e.clientX, y: e.clientY };
      });
      const end = () => {
        drag = null;
        delete vp.dataset.dpiDragging;
      };
      vp.addEventListener("pointerup", end);
      vp.addEventListener("pointercancel", end);
      vp.addEventListener("wheel", (e) => {
        if (!e.ctrlKey) return;
        e.preventDefault();
        zoom(e.deltaY < 0 ? 1 : -1);
      }, { passive: false });
      vp.addEventListener("keydown", (e) => {
        const s = 80;
        const k = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
        if (k) {
          e.preventDefault();
          pan(...k);
        } else if (e.key === "+" || e.key === "=") {
          e.preventDefault();
          zoom(1);
        } else if (e.key === "-") {
          e.preventDefault();
          zoom(-1);
        } else if (e.key === "Escape" && openMarker >= 0) {
          e.stopPropagation();
          openMarker = -1;
          popup2.hidden = true;
        }
      });
      vp.addEventListener("click", (e) => {
        if (!e.target.closest(".dpi-map__pin, .dpi-map__popup")) {
          openMarker = -1;
          popup2.hidden = true;
        }
      });
      new ResizeObserver(render2).observe(vp);
      applyTheme();
      render2();
      emit(root4, "map-ready", { provider: name });
    }
    function configure4() {
      const P = prov();
      if (load2 === "never" || started) return;
      if (!P) {
        if (name) status.textContent = `Il provider «${name}» non è stato registrato dall'applicazione: la mappa non può caricarsi. Elenco dei luoghi:`;
        return;
      }
      if (load2 === "auto") {
        start3();
        return;
      }
      let host = "";
      try {
        host = new URL(P.tiles.replace(/\{[a-z]+\}/g, "x")).host.replace(/^x\./, "");
      } catch {
      }
      status.textContent = `La mappa usa un servizio esterno (${host || name}, ${P.attribution}): caricandola, il browser invia richieste a quel servizio.`;
      if (!wired) {
        wired = true;
        root4.querySelector(".dpi-map__consent .dpi-btn")?.addEventListener("click", start3);
      }
    }
    contexts.add(configure4);
    configure4();
  }
  function init5(root4 = document) {
    root4.querySelectorAll("[data-dpi-map]").forEach((el6) => {
      if (!done4.has(el6)) {
        done4.add(el6);
        setup10(el6);
      }
    });
  }

  // dpi/js/notify.js
  var notify_exports = {};
  __export(notify_exports, {
    alertShow: () => alertShow,
    barState: () => barState,
    bind: () => bind10,
    configure: () => configure3,
    confirm: () => confirm,
    popupShow: () => popupShow,
    show: () => show2,
    toastShow: () => toastShow2
  });
  var cfgState = { maxWidth: 420, barMorph: "auto", bar: null, radius: 26 };
  var MARGIN2 = 12;
  var QUEUE_TTL = 3e4;
  var TONE_ICON = { info: "info", success: "circle-check", warning: "triangle-exclamation-point", danger: "circle-x" };
  var FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
  var root3 = null;
  var safe = null;
  var live = null;
  var alertLive = null;
  var dock = null;
  var trigger = null;
  var panel = null;
  var cur = null;
  var queue = [];
  var seq = 0;
  var bound11 = false;
  var inerted = [];
  var hostEl = null;
  var hostMO = null;
  var hostPO = null;
  var approved = /* @__PURE__ */ new WeakSet();
  var pending2 = /* @__PURE__ */ new WeakSet();
  function el3(tag, cls, parent) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (parent) parent.append(n);
    return n;
  }
  function ensureRoot() {
    if (root3?.isConnected) return root3;
    root3 = el3("div", "dpi-notify");
    root3.setAttribute("data-dpi-notify-root", "");
    safe = el3("div", "dpi-notify__safe", root3);
    live = el3("div", "dpi-visually-hidden", root3);
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    alertLive = el3("div", "dpi-visually-hidden", root3);
    alertLive.setAttribute("role", "alert");
    alertLive.setAttribute("aria-live", "assertive");
    dock = el3("div", "dpi-dropdown dpi-notify__dock", root3);
    dock.setAttribute("data-dpi-dropdown", "nav");
    dock.setAttribute("data-dpi-notify-dock", "");
    dock.hidden = true;
    trigger = el3("span", "dpi-notify__origin", dock);
    trigger.setAttribute("data-dpi-dropdown-trigger", "");
    trigger.setAttribute("aria-hidden", "true");
    panel = el3("div", "dpi-menu dpi-notify__panel", dock);
    panel.setAttribute("data-dpi-dropdown-panel", "");
    document.body.append(root3);
    setup2(dock);
    new MutationObserver(() => {
      if (!cur) return;
      const state3 = dock.dataset.dpiState;
      if (state3 === "open" && !cur.closing) activate(cur);
      if (state3 === "closed" && cur.closing) finish(cur);
    }).observe(dock, { attributes: true, attributeFilter: ["data-dpi-state"] });
    dock.addEventListener("dpi:close", (e) => {
      if (e.target === dock && cur && !cur.closing) close3(cur, cur.modal ? false : "dismiss");
    });
    return root3;
  }
  function button(label2, cls, onClick4) {
    const b = el3("button", `dpi-btn ${cls}`.trim());
    b.type = "button";
    b.textContent = String(label2);
    b.addEventListener("click", onClick4);
    return b;
  }
  function buildContent(item2) {
    const c = el3("div", `dpi-notify__content dpi-notify__content--${item2.kind}`);
    c.setAttribute("data-dpi-tone", item2.tone);
    const id = `dpi-notify-c${++seq}`;
    const body = el3("div", "dpi-notify__text");
    if (item2.kind === "confirm") {
      c.setAttribute("role", "alertdialog");
      c.setAttribute("aria-modal", "true");
    }
    const icon4 = TONE_ICON[item2.tone];
    if (icon4 && item2.kind !== "confirm") {
      const i = el3("span", "dpi-notify__icon", c);
      i.setAttribute("aria-hidden", "true");
      const s = el3("span", "", i);
      s.setAttribute("data-dpi-icon", icon4);
    }
    c.append(body);
    if (item2.title) {
      const t = el3("h2", "dpi-notify__title", body);
      t.id = `${id}-t`;
      t.textContent = String(item2.title);
      if (item2.kind === "confirm") c.setAttribute("aria-labelledby", t.id);
    }
    if (item2.message) {
      const m = el3("p", "dpi-notify__message", body);
      m.id = `${id}-m`;
      m.textContent = String(item2.message);
      if (item2.kind === "confirm") c.setAttribute("aria-describedby", m.id);
    }
    if (item2.detail) {
      const dt = el3("p", "dpi-notify__detail", body);
      dt.id = `${id}-d`;
      dt.textContent = String(item2.detail);
      if (item2.kind === "confirm" && !item2.message) c.setAttribute("aria-describedby", dt.id);
    }
    const actions = el3("div", "dpi-notify__actions");
    item2.buttons = [];
    if (item2.kind === "confirm") {
      const cancel = button(item2.cancelLabel, "", () => close3(item2, false));
      const ok = button(item2.confirmLabel, item2.tone === "danger" ? "dpi-btn--danger" : "dpi-btn--primary", () => close3(item2, true));
      actions.append(cancel, ok);
      item2.buttons.push(cancel, ok);
      item2.focusTarget = item2.tone === "danger" ? cancel : ok;
    } else {
      for (const a of item2.actions) {
        const b = button(a.label, a.variant ? `dpi-btn--${a.variant}` : "", () => {
          try {
            a.onClick?.();
          } finally {
            close3(item2, a.value ?? a.label);
          }
        });
        actions.append(b);
        item2.buttons.push(b);
      }
    }
    if (actions.childElementCount) body.append(actions);
    if (item2.kind !== "confirm" && item2.closable) {
      const x = el3("button", "dpi-btn dpi-btn--icon-only dpi-btn--sm dpi-notify__close", c);
      x.type = "button";
      x.setAttribute("aria-label", item2.closeLabel);
      const ic = el3("span", "", x);
      ic.setAttribute("data-dpi-icon", "x");
      x.addEventListener("click", () => close3(item2, "dismiss"));
    }
    return c;
  }
  function layout(item2) {
    const vw = document.documentElement.clientWidth;
    const vv = globalThis.visualViewport;
    const top = trigger.getBoundingClientRect().top;
    const bottom = vv ? Math.min(innerHeight, vv.offsetTop + vv.height) : innerHeight;
    const width = Math.max(1, Math.min(cfgState.maxWidth, vw - 2 * MARGIN2));
    const available2 = Math.max(48, bottom - top - MARGIN2);
    dock.style.setProperty("--dpi-notify-width", `${width}px`);
    panel.style.setProperty("--dpi-notify-height", `${available2}px`);
    item2.content.style.minHeight = `${Math.min(available2, item2.kind === "confirm" ? 160 : 96)}px`;
  }
  function activate(item2) {
    if (item2.active || item2.closing) return;
    item2.active = true;
    item2.content.setAttribute("data-dpi-interactive", "");
    item2.content.inert = false;
    if (item2.modal) (item2.focusTarget ?? item2.content).focus?.({ preventScroll: true });
    armTimer(item2);
    emit(item2.content, "notify-opened", { kind: item2.kind });
  }
  function normalize(kind, o = {}) {
    const modal2 = kind === "confirm";
    const tone = ["info", "success", "warning", "danger"].includes(o.tone) ? o.tone : "neutral";
    return {
      kind,
      modal: modal2,
      tone,
      title: o.title ?? "",
      message: o.message ?? "",
      detail: o.detail ?? "",
      duration: kind === "toast" ? o.duration ?? 5e3 : o.duration ?? 0,
      actions: kind === "toast" || kind === "alert" || kind === "popup" ? o.actions ?? (o.action ? [o.action] : []) : [],
      closable: o.closable ?? true,
      closeLabel: o.closeLabel ?? "Chiudi",
      confirmLabel: o.confirmLabel ?? "Conferma",
      cancelLabel: o.cancelLabel ?? "Annulla",
      origin: o.origin ?? null,
      queuedAt: performance.now(),
      morph: o.morph,
      bar: o.bar ?? null,
      opener: o.source instanceof Element ? o.source : document.activeElement
    };
  }
  function enqueue(item2) {
    ensureRoot();
    bindGlobal();
    item2.result = new Promise((res) => {
      item2.resolve = res;
    });
    queue.push(item2);
    if (cur && !cur.modal && item2.modal && !cur.closing) close3(cur, "preempt");
    if (cur?.bar && cur.closing && !cur.handover && (item2.modal || !wanted(cur.bar))) {
      cur.handover = true;
      finish(cur);
      return { close: (r = "dismiss") => close3(item2, r), closed: item2.result, get element() {
        return item2.content ?? null;
      } };
    }
    pump();
    return {
      close: (r = "dismiss") => close3(item2, r),
      closed: item2.result,
      get element() {
        return item2.content ?? null;
      }
    };
  }
  function pump() {
    if (cur || !queue.length) return;
    const i = queue.findIndex((x) => x.modal);
    if (i < 0 && searchBusy()) {
      expireQueued();
      return;
    }
    cur = queue.splice(i >= 0 ? i : 0, 1)[0];
    bindGlobal();
    open4(cur);
  }
  function expireQueued() {
    const now = performance.now();
    for (let k = queue.length - 1; k >= 0; k--) {
      const q = queue[k];
      if (q.kind === "toast" && !q.modal && now - q.queuedAt > QUEUE_TTL) {
        queue.splice(k, 1);
        q.closing = true;
        q.resolve?.("expired");
      }
    }
  }
  onIdle(() => {
    if (!cur && queue.length) {
      expireQueued();
      pump();
    }
  });
  setNotifyCloser((bar2) => {
    if (!cur || cur.bar !== bar2) return true;
    if (cur.modal) return false;
    if (!cur.closing) close3(cur, "dismiss");
    return true;
  });
  function modalDialogFor(item2) {
    const open6 = [...document.querySelectorAll("dialog[open]")].filter((d) => {
      try {
        return d.matches(":modal");
      } catch {
        return true;
      }
    });
    if (!open6.length) return null;
    const own = item2?.opener?.closest?.("dialog[open]");
    return open6.includes(own) ? own : open6[open6.length - 1];
  }
  function hostCheck() {
    if (!hostEl) return;
    if (hostEl.isConnected && hostEl.open) return;
    if (cur?.modal && !cur.closing) close3(cur, false);
    detachHost();
  }
  var onHostCancel = (e) => {
    if (cur?.modal && !cur.closing) e.preventDefault();
  };
  function attachHost(d) {
    if (hostEl === d) return;
    detachHost();
    hostEl = d;
    root3.setAttribute("popover", "manual");
    d.append(root3);
    try {
      root3.showPopover();
    } catch {
    }
    root3.setAttribute("data-dpi-notify-hosted", "");
    hostMO = new MutationObserver(hostCheck);
    hostMO.observe(d, { attributes: true, attributeFilter: ["open"] });
    if (d.parentNode) {
      hostPO = new MutationObserver(hostCheck);
      hostPO.observe(d.parentNode, { childList: true });
    }
    d.addEventListener("close", hostCheck);
    d.addEventListener("cancel", onHostCancel);
  }
  function detachHost() {
    if (!hostEl) return;
    const d = hostEl;
    hostEl = null;
    hostMO?.disconnect();
    hostPO?.disconnect();
    hostMO = hostPO = null;
    d.removeEventListener("close", hostCheck);
    d.removeEventListener("cancel", onHostCancel);
    try {
      root3.hidePopover();
    } catch {
    }
    root3.removeAttribute("popover");
    root3.removeAttribute("data-dpi-notify-hosted");
    root3.removeAttribute("data-dpi-notify-scrim");
    if (root3.parentNode !== document.body) document.body.append(root3);
  }
  function inertPage(item2) {
    if (!item2.modal) return;
    setModal(true);
    for (const n of hostEl ? hostEl.children : document.body.children) {
      if (n === root3 || n.inert) continue;
      n.inert = true;
      inerted.push(n);
    }
  }
  function open4(item2) {
    const hostDialog = modalDialogFor(item2);
    if (hostDialog) attachHost(hostDialog);
    else detachHost();
    root3.toggleAttribute("data-dpi-notify-scrim", !!(hostDialog && item2.modal));
    let bar2 = item2.morph === false || hostDialog ? null : pickBar({ ...cfgState, ...item2.bar ? { bar: item2.bar } : {} });
    if (bar2 && !canMorph(bar2, item2.modal)) bar2 = null;
    if (!bar2 && active()) abort();
    item2.bar = bar2;
    item2.content = buildContent(item2);
    item2.content.inert = true;
    if (bar2) {
      openBar(item2, bar2);
      return;
    }
    panel.append(item2.content);
    globalThis.DPI?.init?.(item2.content);
    dock.hidden = false;
    dock.toggleAttribute("data-dpi-notify-modal", item2.modal);
    inertPage(item2);
    layout(item2);
    announce(item2);
    emit(item2.content, "notify-open", { kind: item2.kind });
    show(dock, { focus: null });
    if (dock.dataset.dpiState === "open") activate(item2);
  }
  function openBar(item2, bar2) {
    dock.hidden = true;
    dock.toggleAttribute("data-dpi-notify-modal", false);
    inertPage(item2);
    announce(item2);
    root3.toggleAttribute("data-dpi-notify-bar", true);
    open2(bar2, {
      content: item2.content,
      root: root3,
      cfg: cfgState,
      hooks: {
        mounted: () => globalThis.DPI?.init?.(item2.content),
        opened: () => {
          if (cur === item2 && !item2.closing) activate(item2);
        },
        closed: () => finish(item2),
        dropContent: (slot) => {
          try {
            destroyAll(slot);
          } catch {
          }
        },
        lost: () => lostBar(item2)
      }
    });
    emit(item2.content, "notify-open", { kind: item2.kind });
  }
  function lostBar(item2) {
    if (cur !== item2) return;
    abort();
    root3.removeAttribute("data-dpi-notify-bar");
    if (item2.closing) {
      finish(item2);
      return;
    }
    item2.bar = null;
    item2.active = false;
    item2.timerArmed = false;
    item2.content.inert = true;
    item2.content.removeAttribute("data-dpi-interactive");
    panel.append(item2.content);
    dock.hidden = false;
    layout(item2);
    show(dock, { focus: null });
    if (dock.dataset.dpiState === "open") activate(item2);
  }
  function announce(item2) {
    if (item2.modal) return;
    const region = item2.kind === "alert" || item2.tone === "danger" ? alertLive : live;
    const text2 = [item2.title, item2.message, item2.detail].filter(Boolean).join(". ");
    region.textContent = "";
    item2.announceTimer = setTimeout(() => {
      region.textContent = text2;
    }, 60);
  }
  function armTimer(item2) {
    if (!(item2.duration > 0) || item2.timerArmed) return;
    item2.timerArmed = true;
    item2.remaining = item2.duration;
    item2.ac = new AbortController();
    const c = item2.content;
    const { signal } = item2.ac;
    const stop = () => {
      clearTimeout(item2.timer);
      if (item2.t0) {
        item2.remaining -= performance.now() - item2.t0;
        item2.t0 = 0;
      }
    };
    const go = () => {
      if (item2.closing || item2.hover || item2.focus) return;
      clearTimeout(item2.timer);
      item2.t0 = performance.now();
      item2.timer = setTimeout(() => close3(item2, "timeout"), Math.max(300, item2.remaining));
    };
    c.addEventListener("pointerenter", () => {
      item2.hover = true;
      stop();
    }, { signal });
    c.addEventListener("pointerleave", () => {
      item2.hover = false;
      go();
    }, { signal });
    c.addEventListener("focusin", () => {
      item2.focus = true;
      stop();
    }, { signal });
    c.addEventListener("focusout", (e) => {
      if (!c.contains(e.relatedTarget)) {
        item2.focus = false;
        go();
      }
    }, { signal });
    go();
  }
  function restoreInert() {
    setModal(false);
    for (const n of inerted.splice(0)) n.inert = false;
  }
  function fallbackFocus() {
    const m = document.querySelector('main, [role="main"]');
    if (!m) return;
    if (!m.hasAttribute("tabindex")) m.setAttribute("tabindex", "-1");
    m.focus({ preventScroll: true });
  }
  function restoreFocus(item2) {
    const o = item2.opener;
    if (o && o.isConnected && typeof o.focus === "function" && !o.closest("[hidden], [inert]")) {
      o.focus({ preventScroll: true });
      if (document.activeElement === o) return true;
    }
    return false;
  }
  function close3(item2, result) {
    if (item2.closing) return;
    if (item2 !== cur) {
      const i = queue.indexOf(item2);
      if (i >= 0) queue.splice(i, 1);
      item2.closing = true;
      item2.resolve?.(item2.modal ? false : result);
      return;
    }
    item2.closing = true;
    clearTimeout(item2.timer);
    clearTimeout(item2.announceTimer);
    item2.ac?.abort();
    item2.content.inert = true;
    item2.content.removeAttribute("data-dpi-interactive");
    item2.resolve(item2.modal ? result === true : result);
    if (item2.modal) {
      restoreInert();
      if (!restoreFocus(item2)) item2.needsFocus = true;
    } else if (item2.content.contains(document.activeElement)) {
      if (!restoreFocus(item2)) fallbackFocus();
    }
    emit(item2.content, "notify-close", { kind: item2.kind });
    if (item2.bar) {
      if (queue.length && !(wanted(item2.bar) && !queue.some((x) => x.modal))) {
        item2.handover = true;
        finish(item2);
      } else close();
      return;
    }
    hide(dock);
    if (dock.dataset.dpiState === "closed") finish(item2);
  }
  function finish(item2) {
    if (cur !== item2) return;
    if (item2.handover) {
      try {
        item2.content.inert = true;
      } catch {
      }
    } else {
      destroyAll(item2.content);
      item2.content.remove();
    }
    cur = null;
    dock.removeAttribute("data-dpi-notify-modal");
    if (item2.modal) {
      const a = document.activeElement;
      if (item2.needsFocus || !a || a === document.body || !a.isConnected) {
        if (!restoreFocus(item2)) fallbackFocus();
      }
    }
    if (queue.length) {
      pump();
      if (cur) return;
    }
    dock.hidden = true;
    root3.removeAttribute("data-dpi-notify-bar");
    detachHost();
    unbindGlobal();
  }
  function relayout2() {
    if (cur && !cur.bar) layout(cur);
  }
  function onKey2(e) {
    if (!cur || cur.closing) return;
    if (e.key === "Escape" && (cur.modal || cur.content.contains(e.target))) {
      if (cur.modal) {
        e.preventDefault();
        e.stopPropagation();
        close3(cur, false);
      } else if (!cur.closing) {
        close3(cur, "dismiss");
      }
      return;
    }
    if (e.key === "Tab" && cur.modal) {
      const list = [...cur.content.querySelectorAll(FOCUSABLE)].filter((n) => n.tabIndex >= 0 && !n.closest("[inert], [hidden]"));
      if (!list.length) {
        e.preventDefault();
        return;
      }
      const first = list[0], lastEl = list[list.length - 1];
      if (!cur.content.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        lastEl.focus();
      } else if (!e.shiftKey && document.activeElement === lastEl) {
        e.preventDefault();
        first.focus();
      }
    }
  }
  function onFocusIn(e) {
    if (cur?.modal && !cur.closing && !cur.content.contains(e.target) && !root3.contains(e.target)) (cur.focusTarget ?? cur.content).focus?.({ preventScroll: true });
  }
  var ro = null;
  function bindGlobal() {
    if (bound11) return;
    bound11 = true;
    document.addEventListener("keydown", onKey2, true);
    document.addEventListener("focusin", onFocusIn);
    addEventListener("resize", relayout2);
    addEventListener("orientationchange", relayout2);
    globalThis.visualViewport?.addEventListener("resize", relayout2);
    globalThis.visualViewport?.addEventListener("scroll", relayout2);
    ro = new ResizeObserver(relayout2);
    ro.observe(trigger);
  }
  function unbindGlobal() {
    if (!bound11) return;
    bound11 = false;
    document.removeEventListener("keydown", onKey2, true);
    document.removeEventListener("focusin", onFocusIn);
    removeEventListener("resize", relayout2);
    removeEventListener("orientationchange", relayout2);
    globalThis.visualViewport?.removeEventListener("resize", relayout2);
    globalThis.visualViewport?.removeEventListener("scroll", relayout2);
    ro?.disconnect();
    ro = null;
  }
  function toastShow2(o = {}) {
    return enqueue(normalize("toast", o));
  }
  function alertShow(o = {}) {
    return enqueue(normalize("alert", { tone: "warning", ...o })).closed.then(() => void 0);
  }
  function popupShow(o = {}) {
    return enqueue(normalize("popup", o)).closed;
  }
  function confirm(o = {}) {
    return enqueue(normalize("confirm", o)).closed;
  }
  function configure3(o = {}) {
    Object.assign(cfgState, o);
  }
  var show2 = (kind, o) => enqueue(normalize(kind, o));
  var attr2 = (n, name) => n.getAttribute(`data-dpi-${name}`);
  var opts = (n, name) => ({
    title: attr2(n, "title") ?? void 0,
    tone: attr2(n, "tone") ?? void 0,
    duration: attr2(n, "duration") !== null ? Number(attr2(n, "duration")) : void 0,
    origin: attr2(n, "notify-origin-for") ?? void 0,
    message: attr2(n, name) ?? ""
  });
  function confirmOptions(n, source) {
    return {
      title: attr2(n, "confirm-title") ?? "",
      message: attr2(n, "confirm") ?? "",
      detail: attr2(n, "confirm-detail") ?? "",
      confirmLabel: attr2(n, "confirm-label") ?? void 0,
      cancelLabel: attr2(n, "cancel-label") ?? void 0,
      tone: attr2(n, "confirm-tone") ?? void 0,
      origin: attr2(n, "notify-origin-for") ?? void 0,
      source
    };
  }
  function onClick2(e) {
    const t = e.target.closest?.("[data-dpi-toast], [data-dpi-alert], [data-dpi-confirm]");
    if (!t || t.matches('[aria-disabled="true"], :disabled')) return;
    if (t.hasAttribute("data-dpi-confirm") && !(t instanceof HTMLFormElement)) {
      if (approved.has(t)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      if (pending2.has(t)) return;
      pending2.add(t);
      const dd = t.closest("[data-dpi-dropdown]");
      const trigger2 = dd?.querySelector("[data-dpi-dropdown-trigger]");
      if (dd) hide(dd);
      confirm(confirmOptions(t, trigger2 ?? t)).then((ok) => {
        pending2.delete(t);
        if (!ok || !t.isConnected) return;
        approved.add(t);
        try {
          t.click();
        } finally {
          approved.delete(t);
        }
      });
      return;
    }
    if (t.hasAttribute("data-dpi-toast")) toastShow2(opts(t, "toast"));
    else if (t.hasAttribute("data-dpi-alert")) alertShow(opts(t, "alert"));
  }
  function onSubmit(e) {
    const f3 = e.target;
    if (!(f3 instanceof HTMLFormElement) || !f3.hasAttribute("data-dpi-confirm")) return;
    if (approved.has(f3)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    if (pending2.has(f3)) return;
    pending2.add(f3);
    const submitter = e.submitter ?? null;
    confirm(confirmOptions(f3, submitter ?? f3)).then((ok) => {
      pending2.delete(f3);
      if (!ok || !f3.isConnected) return;
      approved.add(f3);
      try {
        f3.requestSubmit(submitter);
      } finally {
        approved.delete(f3);
      }
    });
  }
  var declared = false;
  function bind10() {
    if (declared) return;
    declared = true;
    ensureRoot();
    document.addEventListener("click", onClick2, true);
    document.addEventListener("submit", onSubmit, true);
  }
  var barState = () => stateOf2();

  // dpi/js/fileinput.js
  var fileinput_exports = {};
  __export(fileinput_exports, {
    init: () => init6,
    sync: () => sync3
  });
  var done5 = /* @__PURE__ */ new WeakSet();
  var state2 = ownedMap();
  var bound12 = false;
  function size(n) {
    const f3 = new Intl.NumberFormat(document.documentElement.lang || void 0, { maximumFractionDigits: 1 });
    if (n < 1024) return `${n} B`;
    if (n < 1024 ** 2) return `${f3.format(n / 1024)} KB`;
    if (n < 1024 ** 3) return `${f3.format(n / 1024 ** 2)} MB`;
    return `${f3.format(n / 1024 ** 3)} GB`;
  }
  var el4 = (tag, cls, text2) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text2 != null) e.textContent = text2;
    return e;
  };
  function matchesAccept(file, accept) {
    const toks = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (!toks.length) return true;
    const name = file.name.toLowerCase(), type = (file.type || "").toLowerCase();
    return toks.some((t) => t.startsWith(".") ? name.endsWith(t) : t.endsWith("/*") ? type.startsWith(t.slice(0, -1)) : type === t);
  }
  function fire2(input) {
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
  function setFiles(input, files) {
    try {
      const dt = new DataTransfer();
      for (const f3 of files) dt.items.add(f3);
      input.files = dt.files;
      return true;
    } catch {
      return false;
    }
  }
  function item(index, name, sz, single, plain = false) {
    const li = el4("li", "dpi-file__item");
    const ic = el4("span", "dpi-file__icon");
    const svg2 = icon("file", "sm");
    if (svg2) ic.append(svg2);
    const nm = el4("span", "dpi-file__name", name);
    nm.title = name;
    li.append(ic, nm);
    if (sz) li.append(el4("span", "dpi-file__size", sz));
    if (plain) return li;
    const b = el4("button", "dpi-btn dpi-btn--sm dpi-file__remove");
    b.type = "button";
    b.setAttribute("aria-label", `Rimuovi ${name}`);
    if (single) {
      b.append(el4("span", "dpi-btn__label", "Rimuovi"));
      b.dataset.dpiFileRemove = "all";
    } else {
      b.classList.add("dpi-btn--icon-only");
      const x = icon("x", "sm");
      if (x) b.append(x);
      b.dataset.dpiFileRemove = String(index);
    }
    li.append(b);
    return li;
  }
  function render(root4) {
    const s = state2.get(root4);
    if (!s) return;
    const { input, list, hint, pick: pick2, clear: clear2 } = s;
    const files = [...input.files];
    const dir = root4.hasAttribute("data-dpi-file-dir");
    const disabled = input.matches(":disabled");
    const multiple = input.multiple && !dir;
    root4.toggleAttribute("data-dpi-disabled", disabled);
    pick2.disabled = disabled;
    list.textContent = "";
    s.err.hidden = true;
    if (dir && files.length) {
      const total = files.reduce((a, f3) => a + f3.size, 0);
      const folder = files[0].webkitRelativePath?.split("/")[0] || "";
      list.append(item(null, `${folder ? folder + " — " : ""}${files.length} file`, size(total), true));
    } else {
      files.slice(0, 50).forEach((f3, i) => list.append(item(i, f3.name, size(f3.size), !multiple)));
      if (files.length > 50) list.append(item(null, `… e altri ${files.length - 50} file`, "", false, true));
    }
    clear2.hidden = !(multiple && files.length > 1);
    if (!root4.hasAttribute("data-dpi-file-drop")) {
      hint.hidden = files.length > 0;
      hint.textContent = root4.getAttribute("data-dpi-file-empty") ?? "Nessun file selezionato";
    }
  }
  function removeAt(root4, index) {
    const { input, pick: pick2 } = state2.get(root4);
    if (index === "all") input.value = "";
    else {
      const files = [...input.files];
      files.splice(Number(index), 1);
      if (!setFiles(input, files)) input.value = "";
    }
    fire2(input);
    const buttons = [...root4.querySelectorAll(".dpi-file__remove")];
    (buttons[Math.min(Number(index) || 0, buttons.length - 1)] || pick2).focus();
  }
  function drop(root4, dt) {
    const { input, err } = state2.get(root4);
    if (input.matches(":disabled")) return;
    let files = [...dt.files];
    if (!files.length) return;
    const accept = input.getAttribute("accept") || "";
    const bad = files.filter((f3) => !matchesAccept(f3, accept));
    files = files.filter((f3) => matchesAccept(f3, accept));
    if (!input.multiple) files = files.slice(0, 1);
    else {
      const key = (f3) => `${f3.name}|${f3.size}|${f3.lastModified}`;
      const have = new Set([...input.files].map(key));
      files = [...input.files, ...files.filter((f3) => !have.has(key(f3)))];
    }
    if (files.length && setFiles(input, files)) fire2(input);
    if (bad.length) {
      err.textContent = `Formato non ammesso: ${bad.map((f3) => f3.name).join(", ")}`;
      err.hidden = false;
      root4.dispatchEvent(new CustomEvent("dpi:file-rejected", { bubbles: true, detail: { files: bad } }));
    }
  }
  function setup11(root4) {
    const input = root4.querySelector('input[type="file"]');
    if (!input) return;
    const dir = root4.hasAttribute("data-dpi-file-dir");
    if (dir) input.setAttribute("webkitdirectory", "");
    let bar2 = root4.querySelector(":scope > .dpi-file__bar");
    let pick2 = root4.querySelector(".dpi-file__pick");
    let hint = root4.querySelector(".dpi-file__hint");
    let list = root4.querySelector(".dpi-file__list");
    let clear2 = root4.querySelector(".dpi-file__clear");
    let err = root4.querySelector(".dpi-file__error");
    if (!bar2) {
      bar2 = el4("div", "dpi-file__bar");
      root4.append(bar2);
    }
    if (!pick2) {
      pick2 = el4("button", "dpi-btn dpi-file__pick");
      const ic = icon(dir ? "folder" : "upload", "sm");
      if (ic) pick2.append(ic);
      pick2.append(el4("span", "dpi-btn__label", root4.getAttribute("data-dpi-file-label") || (dir ? "Scegli cartella…" : "Scegli file…")));
    }
    pick2.type = "button";
    if (!bar2.contains(pick2)) bar2.append(pick2);
    if (!hint) {
      hint = el4("span", "dpi-file__hint", root4.getAttribute("data-dpi-file-hint") || "oppure trascina qui i file");
      bar2.append(hint);
    }
    if (!clear2) {
      clear2 = el4("button", "dpi-btn dpi-btn--sm dpi-file__clear");
      clear2.type = "button";
      clear2.hidden = true;
      clear2.append(el4("span", "dpi-btn__label", "Rimuovi tutti"));
      bar2.append(clear2);
    }
    if (!list) {
      list = el4("ul", "dpi-file__list");
      root4.append(list);
    }
    if (!err) {
      err = el4("p", "dpi-file__error dpi-error");
      err.setAttribute("role", "alert");
      err.hidden = true;
      root4.append(err);
    }
    list.setAttribute("role", "list");
    list.setAttribute("aria-live", "polite");
    if (!list.hasAttribute("aria-label")) list.setAttribute("aria-label", "File selezionati");
    ensureId(list, "dpi-file-list");
    ensureId(pick2, "dpi-file-pick");
    const lbl = input.labels?.[0];
    if (lbl) pick2.setAttribute("aria-labelledby", `${ensureId(lbl, "dpi-label")} ${pick2.id}`);
    pick2.setAttribute("aria-describedby", list.id);
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    root4.setAttribute("data-dpi-file-ready", "");
    state2.set(root4, { input, pick: pick2, list, hint, err, clear: clear2 });
    pick2.addEventListener("click", () => input.click());
    clear2.addEventListener("click", () => removeAt(root4, "all"));
    list.addEventListener("click", (e) => {
      const b = e.target.closest("[data-dpi-file-remove]");
      if (b && list.contains(b)) removeAt(root4, b.dataset.dpiFileRemove);
    });
    input.addEventListener("change", () => {
      root4.removeAttribute("data-dpi-invalid");
      render(root4);
    });
    input.addEventListener("invalid", () => {
      root4.setAttribute("data-dpi-invalid", "");
      pick2.focus();
    });
    new MutationObserver(() => render(root4)).observe(input, { attributes: true, attributeFilter: ["disabled", "multiple"] });
    if (root4.hasAttribute("data-dpi-file-drop") && !dir) {
      const has = (e) => [...e.dataTransfer?.types || []].includes("Files");
      let depth = 0;
      root4.addEventListener("dragenter", (e) => {
        if (!has(e)) return;
        e.preventDefault();
        depth++;
        if (!input.matches(":disabled")) root4.setAttribute("data-dpi-dragover", "");
      });
      root4.addEventListener("dragover", (e) => {
        if (!has(e)) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = input.matches(":disabled") ? "none" : "copy";
      });
      root4.addEventListener("dragleave", () => {
        depth = Math.max(0, depth - 1);
        if (!depth) root4.removeAttribute("data-dpi-dragover");
      });
      root4.addEventListener("drop", (e) => {
        if (!has(e)) return;
        e.preventDefault();
        depth = 0;
        root4.removeAttribute("data-dpi-dragover");
        drop(root4, e.dataTransfer);
      });
    }
    render(root4);
  }
  function sync3(scope = document) {
    const list = [...scope.querySelectorAll("[data-dpi-file-ready]")];
    if (scope.matches?.("[data-dpi-file-ready]")) list.unshift(scope);
    list.forEach(render);
  }
  function init6(root4 = document) {
    if (!bound12) {
      bound12 = true;
      document.addEventListener("reset", (e) => setTimeout(() => {
        for (const r of document.querySelectorAll("[data-dpi-file-ready]")) {
          if (state2.get(r)?.input.form === e.target) {
            r.removeAttribute("data-dpi-invalid");
            render(r);
          }
        }
      }));
    }
    const list = [...root4.querySelectorAll("[data-dpi-file]")];
    if (root4.matches?.("[data-dpi-file]")) list.unshift(root4);
    for (const r of list) if (!done5.has(r)) {
      done5.add(r);
      setup11(r);
    }
  }

  // dpi/js/select.js
  var select_exports = {};
  __export(select_exports, {
    init: () => init7,
    isOpen: () => isOpen2,
    sync: () => sync4
  });
  var inst3 = ownedMap();
  var bound13 = false;
  var current = null;
  var norm2 = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  function create(select2) {
    const trigger2 = document.createElement("button");
    trigger2.type = "button";
    trigger2.className = `dpi-selectx__trigger ${select2.className}`.trim();
    const value2 = document.createElement("span");
    value2.className = "dpi-selectx__value";
    trigger2.append(value2);
    const panel2 = document.createElement("div");
    panel2.className = "dpi-selectx__panel";
    panel2.hidden = true;
    panel2.setAttribute("role", "listbox");
    panel2.tabIndex = -1;
    if (HTMLElement.prototype.hasOwnProperty("popover")) panel2.setAttribute("popover", "manual");
    if (select2.id) {
      trigger2.id = `${select2.id}-trigger`;
      panel2.id = `${select2.id}-panel`;
      value2.id = `${select2.id}-value`;
    }
    ensureId(panel2, "dpi-selectx");
    ensureId(value2, "dpi-selectx-value");
    ensureId(trigger2, "dpi-selectx-trigger");
    trigger2.setAttribute("role", "combobox");
    trigger2.setAttribute("aria-haspopup", "listbox");
    trigger2.setAttribute("aria-expanded", "false");
    trigger2.setAttribute("aria-controls", panel2.id);
    let items2 = [];
    let active2 = null;
    let isOpen4 = false;
    let buf = "", bufTimer = 0, raf = 0;
    const enabled = () => items2.filter((i) => !i.disabled);
    const chipMode = () => select2.multiple && select2.hasAttribute("data-dpi-select-chips");
    let chipsHost = null, chipsKey = "", structKey = "", snapshot = "";
    const pickedKey = () => [...select2.selectedOptions].map((o) => o.index).join(",");
    function labelText() {
      const ph = select2.getAttribute("data-dpi-select-placeholder");
      const sel2 = [...select2.selectedOptions];
      if (select2.multiple) {
        if (!sel2.length) return { text: ph || "Seleziona…", empty: true };
        if (chipMode()) return { text: sel2.length === 1 ? "1 selezionato" : `${sel2.length} selezionati`, empty: false };
        const mode = select2.getAttribute("data-dpi-select-summary");
        if (mode === "list" || mode !== "count" && sel2.length <= 2) return { text: sel2.map((o2) => o2.text.trim()).join(", "), empty: false };
        return { text: `${sel2.length} selezionati`, empty: false };
      }
      const o = sel2[0];
      if (!o || o.value === "") return { text: ph || o?.text.trim() || "Seleziona…", empty: true };
      return { text: o.text.trim(), empty: false };
    }
    function updateTrigger() {
      const { text: text2, empty } = labelText();
      value2.textContent = text2;
      trigger2.toggleAttribute("data-dpi-placeholder", empty);
      trigger2.disabled = select2.matches(":disabled");
      for (const a of ["aria-invalid", "aria-describedby", "aria-required"]) {
        const v = a === "aria-required" ? select2.required ? "true" : null : select2.getAttribute(a);
        if (v == null) trigger2.removeAttribute(a);
        else trigger2.setAttribute(a, v);
      }
      const ids = [...select2.labels || []].map((l) => ensureId(l, "dpi-label"));
      const al = select2.getAttribute("aria-label");
      if (al) trigger2.setAttribute("aria-label", al);
      else trigger2.removeAttribute("aria-label");
      trigger2.setAttribute("aria-labelledby", [...ids, ...al && !ids.length ? [trigger2.id] : [], value2.id].join(" "));
      renderChips();
    }
    function renderChips() {
      if (!chipMode()) {
        chipsHost?.remove();
        chipsHost = null;
        chipsKey = "";
        return;
      }
      if (!chipsHost) {
        chipsHost = document.createElement("ul");
        chipsHost.className = "dpi-selectx__chips";
        chipsHost.addEventListener("click", (e) => {
          const b = e.target.closest(".dpi-selectx__chip-x");
          if (b && chipsHost.contains(b)) removeChip(b.closest("li"));
        });
        chipsHost.addEventListener("keydown", onChipKey);
        panel2.after(chipsHost);
      }
      const picked = [...select2.selectedOptions].filter((o) => !(o.value === "" && !o.text.trim()));
      const dis = select2.matches(":disabled");
      const key = JSON.stringify([picked.map((o) => [o.index, o.text.trim(), o.matches(":disabled")]), dis, select2.getAttribute("data-dpi-select-chips-label"), select2.getAttribute("data-dpi-select-remove-label")]);
      if (key === chipsKey) return;
      chipsKey = key;
      chipsHost.setAttribute("aria-label", select2.getAttribute("data-dpi-select-chips-label") || "Selezionati");
      chipsHost.hidden = !picked.length;
      const tpl = select2.getAttribute("data-dpi-select-remove-label") || "Rimuovi {nome}";
      chipsHost.textContent = "";
      for (const o of picked) {
        const name = o.text.trim();
        const li = document.createElement("li");
        li.className = "dpi-selectx__chip dpi-chip dpi-chip--input";
        li.dataset.dpiOptionIndex = String(o.index);
        const t = document.createElement("span");
        t.className = "dpi-selectx__chip-label";
        t.textContent = name;
        const x = document.createElement("button");
        x.type = "button";
        x.className = "dpi-btn dpi-btn--plain dpi-btn--icon-only dpi-btn--sm dpi-selectx__chip-x";
        x.setAttribute("aria-label", tpl.replace("{nome}", name));
        x.title = tpl.replace("{nome}", name);
        if (select2.id) x.id = `${select2.id}-chip-${o.index}`;
        x.disabled = dis || o.matches(":disabled");
        const ic = icon("x", "sm");
        if (ic) x.append(ic);
        li.append(t, x);
        chipsHost.append(li);
      }
    }
    function removeChip(li) {
      const o = li && select2.options[Number(li.dataset.dpiOptionIndex)];
      if (!o || !o.selected || select2.matches(":disabled") || o.matches(":disabled")) return;
      const sibs = [...chipsHost.querySelectorAll("li")];
      const at = sibs.indexOf(li);
      const nextIdx = (sibs[at + 1] || sibs[at - 1])?.dataset.dpiOptionIndex;
      o.selected = false;
      select2.dispatchEvent(new Event("input", { bubbles: true }));
      select2.dispatchEvent(new Event("change", { bubbles: true }));
      api.sync();
      const nb = nextIdx != null && chipsHost.querySelector(`li[data-dpi-option-index="${nextIdx}"] .dpi-selectx__chip-x`);
      (nb || trigger2).focus({ preventScroll: true });
    }
    function onChipKey(e) {
      const x = e.target.closest?.(".dpi-selectx__chip-x");
      if (!x) return;
      if (e.key === "Backspace" || e.key === "Delete") {
        e.preventDefault();
        removeChip(x.closest("li"));
        return;
      }
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        const rtl2 = getComputedStyle(trigger2).direction === "rtl";
        const list = [...chipsHost.querySelectorAll(".dpi-selectx__chip-x:not(:disabled)")];
        const d = e.key === "ArrowRight" !== rtl2 ? 1 : -1;
        const nx = list[list.indexOf(x) + d];
        if (nx) {
          e.preventDefault();
          nx.focus();
        }
      }
    }
    function render2() {
      panel2.textContent = "";
      items2 = [];
      const multiple = select2.multiple;
      panel2.setAttribute("aria-multiselectable", String(multiple));
      const add = (opt, host) => {
        if (opt.hidden || multiple && opt.value === "") return;
        const e = document.createElement("div");
        e.className = "dpi-selectx__option";
        e.id = `${panel2.id}-o${items2.length}`;
        e.setAttribute("role", "option");
        e.setAttribute("aria-selected", String(opt.selected));
        const disabled = opt.matches(":disabled");
        if (disabled) e.setAttribute("aria-disabled", "true");
        if (!multiple && opt.value === "") e.setAttribute("data-dpi-empty", "");
        const t = opt.text.trim();
        e.textContent = t || " ";
        host.append(e);
        items2.push({ opt, el: e, label: norm2(t), disabled });
      };
      for (const c of select2.children) {
        if (c.tagName === "OPTGROUP") {
          if (c.hidden) continue;
          const g = document.createElement("div");
          g.setAttribute("role", "group");
          const h = document.createElement("div");
          h.className = "dpi-selectx__group";
          h.setAttribute("role", "presentation");
          h.id = `${panel2.id}-g${panel2.children.length}`;
          h.textContent = c.label;
          g.setAttribute("aria-labelledby", h.id);
          g.append(h);
          for (const o of c.children) if (o.tagName === "OPTION") add(o, g);
          panel2.append(g);
        } else if (c.tagName === "OPTION") add(c, panel2);
      }
      const done7 = select2.getAttribute("data-dpi-select-done"), clear2 = select2.getAttribute("data-dpi-select-clear");
      if (multiple && (done7 || clear2)) {
        const f3 = document.createElement("div");
        f3.className = "dpi-selectx__foot";
        f3.setAttribute("aria-hidden", "true");
        const mk4 = (label2, act, cls) => {
          const b = document.createElement("button");
          b.type = "button";
          b.tabIndex = -1;
          b.textContent = label2;
          b.className = `dpi-btn dpi-btn--sm ${cls}`.trim();
          b.setAttribute("data-dpi-glass", "off");
          b.setAttribute("data-dpi-select-act", act);
          return b;
        };
        if (clear2) f3.append(mk4(clear2, "clear", ""));
        if (done7) f3.append(mk4(done7, "done", "dpi-btn--primary"));
        panel2.append(f3);
      }
      structKey = structure();
    }
    function structure() {
      const parts4 = [];
      for (const c of select2.children) {
        if (c.tagName === "OPTGROUP") parts4.push(["g", c.label, c.hidden, [...c.children].map((o) => [o.value, o.text, o.hidden, o.matches(":disabled")])]);
        else if (c.tagName === "OPTION") parts4.push(["o", c.value, c.text, c.hidden, c.matches(":disabled")]);
      }
      return JSON.stringify([parts4, select2.multiple, select2.getAttribute("data-dpi-select-done"), select2.getAttribute("data-dpi-select-clear")]);
    }
    function setActive2(it, scroll = true) {
      if (active2) active2.el.removeAttribute("data-dpi-active");
      active2 = it || null;
      if (!active2) {
        trigger2.removeAttribute("aria-activedescendant");
        return;
      }
      active2.el.setAttribute("data-dpi-active", "");
      trigger2.setAttribute("aria-activedescendant", active2.el.id);
      if (scroll) reveal2(active2.el);
    }
    function reveal2(el6) {
      const top = el6.offsetTop, bottom = top + el6.offsetHeight, pad3 = 8;
      if (top - pad3 < panel2.scrollTop) panel2.scrollTop = Math.max(0, top - pad3);
      else if (bottom + pad3 > panel2.scrollTop + panel2.clientHeight) panel2.scrollTop = bottom + pad3 - panel2.clientHeight;
    }
    function position() {
      if (!isOpen4) return;
      if (!trigger2.isConnected) {
        close5(false);
        return;
      }
      const r = trigger2.getBoundingClientRect();
      const vw = innerWidth, vh = innerHeight, gap = 4, m = 8, cap = 320;
      const rtl2 = getComputedStyle(trigger2).direction === "rtl";
      panel2.style.minWidth = `${Math.round(r.width)}px`;
      panel2.style.maxHeight = `${cap}px`;
      panel2.style.left = "0px";
      panel2.style.top = "0px";
      const h = Math.min(panel2.offsetHeight, cap), w = panel2.offsetWidth;
      const below = vh - r.bottom - gap - m, above = r.top - gap - m;
      const down = h <= below || below >= above;
      const maxH = Math.min(cap, Math.max(down ? below : above, 96));
      panel2.style.maxHeight = `${maxH}px`;
      const h2 = Math.min(h, maxH);
      let left = rtl2 ? r.right - w : r.left;
      left = Math.max(m, Math.min(left, vw - m - w));
      panel2.style.left = `${Math.round(left)}px`;
      panel2.style.top = `${Math.round(down ? r.bottom + gap : r.top - gap - h2)}px`;
      panel2.setAttribute("data-dpi-placement", down ? "bottom" : "top");
    }
    const schedule2 = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(position);
    };
    const onScroll = (e) => {
      if (e.target !== panel2) schedule2();
    };
    const onDown = (e) => {
      if (!panel2.contains(e.target) && !trigger2.contains(e.target)) api.close(false);
    };
    function open6() {
      if (isOpen4 || trigger2.disabled) return;
      if (current && current !== api) current.close(false);
      updateTrigger();
      render2();
      snapshot = pickedKey();
      panel2.setAttribute("data-dpi-placing", "");
      panel2.hidden = false;
      try {
        if (panel2.popover === "manual" && !panel2.matches(":popover-open")) panel2.showPopover();
      } catch {
      }
      isOpen4 = true;
      current = api;
      trigger2.setAttribute("aria-expanded", "true");
      position();
      setActive2(items2.find((i) => i.opt.selected && !i.disabled) || enabled()[0] || null);
      panel2.removeAttribute("data-dpi-placing");
      emit(select2, "select-open", {});
      document.addEventListener("pointerdown", onDown, true);
      addEventListener("resize", schedule2);
      addEventListener("scroll", onScroll, true);
    }
    function close5(restore2 = true) {
      if (!isOpen4) return;
      isOpen4 = false;
      if (current === api) current = null;
      try {
        if (panel2.matches(":popover-open")) panel2.hidePopover();
      } catch {
      }
      panel2.hidden = true;
      panel2.removeAttribute("data-dpi-keyboard");
      trigger2.setAttribute("aria-expanded", "false");
      trigger2.removeAttribute("aria-activedescendant");
      document.removeEventListener("pointerdown", onDown, true);
      removeEventListener("resize", schedule2);
      removeEventListener("scroll", onScroll, true);
      cancelAnimationFrame(raf);
      active2 = null;
      panel2.removeAttribute("data-dpi-placing");
      if (restore2) trigger2.focus({ preventScroll: true });
      emit(select2, "select-close", { changed: pickedKey() !== snapshot });
    }
    function choose(it) {
      if (!it || it.disabled) return;
      let changed = true;
      if (select2.multiple) it.opt.selected = !it.opt.selected;
      else {
        changed = !it.opt.selected || select2.selectedIndex !== it.opt.index;
        it.opt.selected = true;
      }
      if (changed) {
        select2.dispatchEvent(new Event("input", { bubbles: true }));
        select2.dispatchEvent(new Event("change", { bubbles: true }));
      }
      updateTrigger();
      for (const i of items2) i.el.setAttribute("aria-selected", String(i.opt.selected));
      if (!select2.multiple) close5(true);
    }
    function move(d) {
      const list = enabled();
      if (!list.length) return;
      const i = list.indexOf(active2);
      setActive2(list[i < 0 ? d > 0 ? 0 : list.length - 1 : Math.max(0, Math.min(list.length - 1, i + d))]);
    }
    function typeahead2(ch) {
      clearTimeout(bufTimer);
      buf += norm2(ch) || ch.toLowerCase();
      bufTimer = setTimeout(() => {
        buf = "";
      }, 700);
      const same = [...buf].every((c) => c === buf[0]);
      const needle = same ? buf[0] : buf;
      const list = enabled();
      if (!list.length) return;
      const cur2 = Math.max(0, list.indexOf(active2)), off2 = same ? 1 : 0;
      for (let k = 0; k < list.length; k++) {
        const it = list[(cur2 + off2 + k) % list.length];
        if (it.label.startsWith(needle)) {
          setActive2(it);
          return;
        }
      }
    }
    trigger2.addEventListener("click", () => {
      if (isOpen4) close5(true);
      else open6();
    });
    trigger2.addEventListener("blur", () => {
      if (isOpen4) close5(false);
    });
    trigger2.addEventListener("focus", () => api.sync());
    trigger2.addEventListener("keyup", (e) => {
      if (e.key === " ") e.preventDefault();
    });
    trigger2.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) return;
      const k = e.key;
      const printable = k.length === 1 && !e.altKey;
      panel2.setAttribute("data-dpi-keyboard", "");
      if (k === "Backspace" && chipMode() && !buf) {
        const last = [...select2.selectedOptions].filter((o) => !o.matches(":disabled")).pop();
        if (last && !select2.matches(":disabled")) {
          e.preventDefault();
          last.selected = false;
          select2.dispatchEvent(new Event("input", { bubbles: true }));
          select2.dispatchEvent(new Event("change", { bubbles: true }));
        }
        return;
      }
      if (!isOpen4) {
        if (k === "ArrowDown" || k === "ArrowUp" || k === "Enter" || k === " " && !buf) {
          e.preventDefault();
          open6();
        } else if (k === "Home" || k === "End") {
          e.preventDefault();
          open6();
          const l = enabled();
          setActive2(k === "Home" ? l[0] : l[l.length - 1]);
        } else if (printable && k !== " ") {
          e.preventDefault();
          open6();
          typeahead2(k);
        }
        return;
      }
      if (k === "ArrowDown") {
        e.preventDefault();
        move(1);
      } else if (k === "ArrowUp") {
        e.preventDefault();
        move(-1);
      } else if (k === "PageDown") {
        e.preventDefault();
        move(8);
      } else if (k === "PageUp") {
        e.preventDefault();
        move(-8);
      } else if (k === "Home") {
        e.preventDefault();
        setActive2(enabled()[0]);
      } else if (k === "End") {
        e.preventDefault();
        const l = enabled();
        setActive2(l[l.length - 1]);
      } else if (k === "Enter" || k === " " && !buf) {
        e.preventDefault();
        choose(active2);
      } else if (k === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        close5(true);
      } else if (k === "Tab") close5(false);
      else if (printable) {
        e.preventDefault();
        typeahead2(k);
      }
    });
    panel2.addEventListener("mousedown", (e) => e.preventDefault());
    panel2.addEventListener("mousemove", (e) => {
      const o = e.target.closest(".dpi-selectx__option");
      panel2.removeAttribute("data-dpi-keyboard");
      if (o && o !== active2?.el) {
        const it = items2.find((i) => i.el === o);
        if (it && !it.disabled) setActive2(it, false);
      }
    });
    panel2.addEventListener("click", (e) => {
      const act = e.target.closest("[data-dpi-select-act]");
      if (act) {
        if (act.getAttribute("data-dpi-select-act") === "clear") {
          let any = false;
          for (const o2 of select2.options) if (o2.selected && !o2.matches(":disabled")) {
            o2.selected = false;
            any = true;
          }
          if (any) {
            select2.dispatchEvent(new Event("input", { bubbles: true }));
            select2.dispatchEvent(new Event("change", { bubbles: true }));
          }
          api.sync();
        } else close5(true);
        return;
      }
      const o = e.target.closest(".dpi-selectx__option");
      if (o) choose(items2.find((i) => i.el === o));
    });
    select2.addEventListener("focus", () => trigger2.focus());
    select2.addEventListener("invalid", () => trigger2.focus());
    select2.addEventListener("change", () => api.sync());
    const api = {
      trigger: trigger2,
      panel: panel2,
      open: open6,
      close: close5,
      get isOpen() {
        return isOpen4;
      },
      sync() {
        updateTrigger();
        if (!isOpen4) return;
        if (structure() === structKey && items2.length) {
          for (const i of items2) i.el.setAttribute("aria-selected", String(i.opt.selected));
          return;
        }
        const prev = active2?.opt, st = panel2.scrollTop;
        render2();
        panel2.scrollTop = st;
        setActive2(items2.find((i) => i.opt === prev && !i.disabled) || items2.find((i) => i.opt.selected) || enabled()[0] || null, false);
        position();
      }
    };
    select2.setAttribute("data-dpi-select-ready", "");
    select2.tabIndex = -1;
    select2.setAttribute("aria-hidden", "true");
    select2.after(trigger2, panel2);
    updateTrigger();
    let pending3 = false;
    new MutationObserver(() => {
      if (pending3) return;
      pending3 = true;
      queueMicrotask(() => {
        pending3 = false;
        api.sync();
      });
    }).observe(select2, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["disabled", "label", "value", "hidden", "selected", "multiple", "required", "aria-invalid", "aria-label", "data-dpi-select-placeholder", "data-dpi-select-summary"]
    });
    return api;
  }
  function setup12(select2) {
    if (inst3.has(select2) || select2.tagName !== "SELECT") return;
    if (select2.hasAttribute("size") && select2.size > 1) return;
    inst3.set(select2, create(select2));
  }
  function sync4(el6 = document) {
    const list = [...el6.querySelectorAll?.("select[data-dpi-select-ready]") ?? []];
    if (el6.matches?.("select[data-dpi-select-ready]")) list.unshift(el6);
    for (const s of list) inst3.get(s)?.sync();
  }
  var isOpen2 = (el6) => !!inst3.get(el6)?.isOpen;
  function init7(root4 = document) {
    if (!bound13) {
      bound13 = true;
      document.addEventListener("reset", (e) => setTimeout(() => {
        for (const s of e.target.querySelectorAll?.("select[data-dpi-select-ready]") ?? []) inst3.get(s)?.sync();
        for (const s of document.querySelectorAll("select[data-dpi-select-ready][form]")) if (s.form === e.target) inst3.get(s)?.sync();
      }));
    }
    const list = [...root4.querySelectorAll("select[data-dpi-select]")];
    if (root4.matches?.("select[data-dpi-select]")) list.unshift(root4);
    list.forEach(setup12);
  }

  // dpi/js/searchbar.js
  var searchbar_exports = {};
  __export(searchbar_exports, {
    close: () => close4,
    init: () => init8,
    open: () => open5
  });
  var done6 = /* @__PURE__ */ new WeakSet();
  var reduced10 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var bound14 = false;
  var parts3 = (form) => ({ toggle: form.querySelector(".dpi-searchbar__toggle"), input: form.querySelector(".dpi-searchbar__input") });
  var isOpen3 = (form) => form.hasAttribute("data-dpi-open");
  function setState(form, open6) {
    const { toggle: toggle2, input } = parts3(form);
    form.toggleAttribute("data-dpi-open", open6);
    toggle2?.setAttribute("aria-expanded", String(open6));
    if (input) {
      input.tabIndex = open6 ? 0 : -1;
      input.inert = !open6;
    }
  }
  function open5(form, { focus = true } = {}) {
    if (!form || isOpen3(form)) {
      if (form && focus) parts3(form).input?.focus();
      return;
    }
    setState(form, true);
    const { input } = parts3(form);
    if (!focus || !input) return;
    if (reduced10()) {
      input.focus();
      return;
    }
    let fired = false;
    const go = () => {
      if (fired) return;
      fired = true;
      form.removeEventListener("transitionend", onEnd);
      if (isOpen3(form)) input.focus();
    };
    const onEnd = (e) => {
      if (e.target === form && e.propertyName === "inline-size") go();
    };
    form.addEventListener("transitionend", onEnd);
    setTimeout(go, 450);
  }
  function close4(form, { restoreFocus: restoreFocus2 = false } = {}) {
    if (!form || !isOpen3(form)) return;
    const { toggle: toggle2, input } = parts3(form);
    const had = input && form.contains(document.activeElement);
    setState(form, false);
    if (restoreFocus2 || had) toggle2?.focus();
  }
  function setup13(form) {
    const { toggle: toggle2, input } = parts3(form);
    if (!toggle2 || !input) return;
    toggle2.setAttribute("aria-expanded", String(isOpen3(form)));
    setState(form, isOpen3(form) || input.value !== "");
    toggle2.addEventListener("click", () => {
      if (!isOpen3(form)) open5(form);
      else if (input.value === "") close4(form, { restoreFocus: true });
      else input.focus();
    });
    form.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !isOpen3(form)) return;
      e.preventDefault();
      e.stopPropagation();
      close4(form, { restoreFocus: true });
    });
    form.addEventListener("reset", () => setTimeout(() => {
      if (input.value === "") close4(form);
    }));
  }
  function init8(root4 = document) {
    if (!bound14) {
      bound14 = true;
      document.addEventListener("pointerdown", (e) => {
        for (const f3 of document.querySelectorAll("[data-dpi-searchbar][data-dpi-open]")) {
          if (f3.contains(e.target)) continue;
          if (parts3(f3).input?.value === "") close4(f3);
        }
      }, true);
    }
    const list = [...root4.querySelectorAll("[data-dpi-searchbar]")];
    if (root4.matches?.("[data-dpi-searchbar]")) list.unshift(root4);
    for (const f3 of list) if (!done6.has(f3)) {
      done6.add(f3);
      setup13(f3);
    }
  }

  // dpi/js/richtext.js
  var richtext_exports = {};
  __export(richtext_exports, {
    bind: () => bind11,
    init: () => init9,
    sanitize: () => sanitize,
    set: () => set3,
    sync: () => sync5,
    text: () => text,
    toText: () => toText,
    value: () => value
  });
  var TAGS = /* @__PURE__ */ new Set([
    "p",
    "br",
    "div",
    "span",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "s",
    "strike",
    "del",
    "sub",
    "sup",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "hr",
    "pre",
    "code",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "td",
    "th",
    "img"
  ]);
  var VOID = /* @__PURE__ */ new Set(["br", "hr", "img"]);
  var DROP = /* @__PURE__ */ new Set([
    "script",
    "style",
    "head",
    "title",
    "iframe",
    "object",
    "embed",
    "form",
    "svg",
    "math",
    "noscript",
    "template",
    "textarea",
    "select",
    "button",
    "input",
    "video",
    "audio",
    "canvas",
    "meta",
    "link",
    "base",
    "frame",
    "frameset",
    "applet",
    "source",
    "track",
    "map",
    "area",
    "dialog",
    "option",
    "datalist"
  ]);
  var BLOCK = /* @__PURE__ */ new Set(["p", "div", "ul", "ol", "li", "blockquote", "h1", "h2", "h3", "h4", "hr", "pre", "table", "thead", "tbody", "tfoot", "tr", "td", "th"]);
  var CSS_FULL = /* @__PURE__ */ new Set([
    "color",
    "background-color",
    "background",
    "font-family",
    "font-size",
    "font-weight",
    "font-style",
    "text-decoration",
    "text-align",
    "margin",
    "margin-left",
    "margin-right",
    "margin-top",
    "margin-bottom",
    "padding",
    "padding-left",
    "padding-right",
    "padding-top",
    "padding-bottom",
    "border",
    "border-left",
    "border-top",
    "border-bottom",
    "border-right",
    "border-collapse",
    "width",
    "height",
    "line-height",
    "vertical-align",
    "white-space",
    "list-style-type"
  ]);
  var CSS_BASIC = /* @__PURE__ */ new Set(["font-weight", "font-style", "text-decoration", "text-align", "color", "background-color"]);
  var COLORS = /* @__PURE__ */ new Set(["color", "background-color", "background"]);
  var URL_OK = /^(https?:\/\/|mailto:)[^\s<>"']+$/i;
  var IMG_OK = /^data:image\/(png|jpe?g|gif|webp);base64,[A-Za-z0-9+/=]+$/;
  var MAX_DEPTH = 60;
  function cleanStyle(v, o) {
    const allowed = o.level === "basic" ? CSS_BASIC : CSS_FULL;
    const out = [];
    for (const decl of String(v || "").split(";")) {
      const i = decl.indexOf(":");
      if (i < 0) continue;
      const k = decl.slice(0, i).trim().toLowerCase();
      const val = decl.slice(i + 1).trim();
      if (!allowed.has(k) || !val || val.length > 120) continue;
      if (o.colors === false && COLORS.has(k)) continue;
      if (/url\s*\(|expression|javascript|@import|[<>\\]|var\s*\(/i.test(val)) continue;
      out.push(`${k}:${val}`);
    }
    return out.join(";");
  }
  function copyNode(src, dst, o, outDoc, depth) {
    for (const n of Array.from(src.childNodes)) {
      if (n.nodeType === 3) {
        dst.append(outDoc.createTextNode(n.nodeValue));
        continue;
      }
      if (n.nodeType !== 1) continue;
      const tag = n.localName;
      if (DROP.has(tag)) continue;
      if (depth > MAX_DEPTH) {
        dst.append(outDoc.createTextNode(n.textContent));
        continue;
      }
      if (tag === "font") {
        const c = n.getAttribute("color");
        if (o.colors !== false && c && /^[#\w ,.()%-]{1,40}$/.test(c)) {
          const sp = outDoc.createElement("span");
          sp.setAttribute("style", `color:${c}`);
          copyNode(n, sp, o, outDoc, depth + 1);
          dst.append(sp);
        } else copyNode(n, dst, o, outDoc, depth + 1);
        continue;
      }
      if (!TAGS.has(tag)) {
        copyNode(n, dst, o, outDoc, depth + 1);
        continue;
      }
      const el6 = outDoc.createElement(tag);
      const st = cleanStyle(n.getAttribute("style"), o);
      if (st) el6.setAttribute("style", st);
      if (tag === "a") {
        const href = (n.getAttribute("href") || "").trim();
        if (!URL_OK.test(href)) {
          copyNode(n, dst, o, outDoc, depth + 1);
          continue;
        }
        el6.setAttribute("href", href);
        el6.setAttribute("target", "_blank");
        el6.setAttribute("rel", "noopener noreferrer");
      } else if (tag === "img") {
        const s = (n.getAttribute("src") || "").trim();
        if (!(IMG_OK.test(s) || o.remote && /^https?:\/\/[^\s<>"']+$/i.test(s))) continue;
        el6.setAttribute("src", s);
        for (const k of ["width", "height", "alt"]) {
          const v = n.getAttribute(k);
          if (v && /^[\w .%-]{1,80}$/.test(v)) el6.setAttribute(k, v);
        }
      } else if (tag === "td" || tag === "th") {
        for (const k of ["colspan", "rowspan"]) {
          const v = n.getAttribute(k);
          if (v && /^\d{1,3}$/.test(v)) el6.setAttribute(k, v);
        }
      } else if (tag === "ol") {
        const v = n.getAttribute("start");
        if (v && /^-?\d{1,5}$/.test(v)) el6.setAttribute("start", v);
      }
      const lockedIn = (tag === "div" || tag === "blockquote") && (n.hasAttribute("data-dpi-rt-locked") || tag === "blockquote" && o.locked && /(^|;)\s*list-style-type\s*:\s*none\s*(;|$)/i.test(n.getAttribute("style") || ""));
      if (lockedIn && o.locked) {
        el6.setAttribute("data-dpi-rt-locked", "");
        el6.removeAttribute("style");
      } else if (lockedIn && o.marker && tag === "blockquote") el6.setAttribute("style", "list-style-type:none");
      if (!VOID.has(tag)) copyNode(n, el6, o, outDoc, depth + 1);
      dst.append(el6);
    }
  }
  function sanitize(html, opts2 = {}) {
    const doc = new DOMParser().parseFromString(String(html ?? ""), "text/html");
    const outDoc = document.implementation.createHTMLDocument("");
    copyNode(doc.body, outDoc.body, opts2, outDoc, 0);
    return outDoc.body.innerHTML;
  }
  function toText(html) {
    const doc = new DOMParser().parseFromString(String(html ?? ""), "text/html");
    const walk = (node2, pre) => {
      if (node2.nodeType === 3) return pre ? node2.nodeValue : node2.nodeValue.replace(/[ \t\r\n\f]+/g, " ");
      if (node2.nodeType !== 1) return "";
      const tag = node2.localName;
      if (DROP.has(tag)) return "";
      if (tag === "br") return "\n";
      if (tag === "hr") return "\n---\n";
      const inPre = pre || tag === "pre";
      if (tag === "ul" || tag === "ol") {
        let k = Number(node2.getAttribute("start")) || 1;
        return "\n" + Array.from(node2.children).map((c) => c.localName === "li" ? `${tag === "ol" ? `${k++}. ` : "- "}${walk(c, inPre).trim()}
` : walk(c, inPre)).join("") + "\n";
      }
      const inner = Array.from(node2.childNodes).map((c) => walk(c, inPre)).join("");
      if (tag === "blockquote") return "\n" + inner.trim().split("\n").map((l) => `> ${l}`.trimEnd()).join("\n") + "\n";
      if (tag === "td" || tag === "th") return inner.trim() + "	";
      return BLOCK.has(tag) ? `
${inner}
` : inner;
    };
    return walk(doc.body, false).replace(/\xa0/g, " ").replace(/[ \t]+\n/g, "\n").replace(/\n +/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
  }
  var inst4 = ownedMap();
  var current2 = null;
  var TOOLS = [
    ["bold", "Grassetto", "bold"],
    ["italic", "Corsivo", "italic"],
    ["underline", "Sottolineato", "underline"],
    ["size", "Dimensione del testo"],
    ["color", "Colore del testo", "palette"],
    ["hilite", "Evidenzia", "highlighter"],
    "|",
    ["ul", "Elenco puntato", "list"],
    ["ol", "Elenco numerato", "list-ordered"],
    ["quote", "Citazione", "indent-increase"],
    ["link", "Collegamento", "link"],
    "|",
    ["left", "Allinea a sinistra", "align-left"],
    ["center", "Centra", "align-center"],
    ["right", "Allinea a destra", "align-right"],
    "|",
    ["clear", "Pulisci la formattazione", "eraser"],
    ["undo", "Annulla", "undo-2"],
    ["redo", "Ripeti", "redo-2"]
  ];
  var SIZES = [["9", "Piccolo"], ["11", "Normale"], ["14", "Medio"], ["18", "Grande"], ["24", "Molto grande"]];
  var SWATCHES = [["#000000", "Nero"], ["#6b7280", "Grigio"], ["#c00000", "Rosso"], ["#ff6600", "Arancione"], ["#ffc000", "Giallo scuro"], ["#00b050", "Verde"], ["#00b0f0", "Azzurro"], ["#0070c0", "Blu"], ["#7030a0", "Viola"], ["#ff99cc", "Rosa"], ["#ffff00", "Giallo"], ["#ffffff", "Bianco"]];
  var JUSTIFY = { left: "justifyLeft", center: "justifyCenter", right: "justifyRight" };
  var IMG_MAX = 6e5;
  var EXEC = { bold: "bold", italic: "italic", underline: "underline", ul: "insertUnorderedList", ol: "insertOrderedList" };
  var BLOCK_TAGS = /* @__PURE__ */ new Set(["P", "DIV", "LI", "UL", "OL", "BLOCKQUOTE", "TD", "TH", "TR", "TABLE", "H1", "H2", "H3", "H4", "PRE"]);
  var esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  function setup14(root4) {
    if (inst4.has(root4)) return inst4.get(root4);
    const area = root4.querySelector(".dpi-richtext__area");
    const field = root4.querySelector("textarea.dpi-richtext__value");
    if (!area || !field) return null;
    const required = root4.hasAttribute("data-dpi-richtext-required");
    const form = root4.closest("form");
    let textField = null;
    const textName = root4.getAttribute("data-dpi-richtext-text");
    if (textName) {
      textField = document.createElement("textarea");
      textField.className = "dpi-richtext__text";
      textField.hidden = true;
      textField.name = textName;
      field.after(textField);
    }
    area.setAttribute("contenteditable", "true");
    area.setAttribute("role", "textbox");
    area.setAttribute("aria-multiline", "true");
    if (required) area.setAttribute("aria-required", "true");
    ensureId(area, "dpi-rt");
    const rows = Number(root4.getAttribute("data-dpi-rows")) || 0;
    if (rows && !root4.classList.contains("dpi-richtext--fill")) area.style.minHeight = `calc(${rows} * 1.45em + 2 * var(--dpi-space-3))`;
    try {
      document.execCommand("defaultParagraphSeparator", false, "div");
      document.execCommand("styleWithCSS", false, "false");
    } catch {
    }
    const bar2 = document.createElement("div");
    bar2.className = "dpi-richtext__bar";
    bar2.setAttribute("role", "toolbar");
    bar2.setAttribute("aria-label", "Formattazione del testo");
    bar2.setAttribute("aria-controls", area.id);
    bar2.innerHTML = TOOLS.map((t) => t === "|" ? '<span class="dpi-richtext__sep" role="separator" aria-orientation="vertical"></span>' : t[0] === "size" ? `<select class="dpi-select dpi-select--sm dpi-richtext__size" data-dpi-rt-size aria-label="${esc(t[1])}" title="${esc(t[1])}">${SIZES.map(([v, l]) => `<option value="${v}"${v === "11" ? " selected" : ""}>${l}</option>`).join("")}</select>` : `<button class="dpi-btn dpi-btn--sm dpi-btn--icon-only dpi-richtext__btn" type="button" data-dpi-rt="${t[0]}" aria-pressed="false" title="${esc(t[1])}"><span data-dpi-icon="${t[2]}"></span><span class="dpi-visually-hidden">${esc(t[1])}</span></button>`).join("");
    const linkRow = document.createElement("div");
    linkRow.className = "dpi-richtext__link";
    linkRow.hidden = true;
    linkRow.innerHTML = `<label class="dpi-visually-hidden" for="${area.id}-url">Indirizzo del collegamento</label><input class="dpi-input dpi-richtext__url" id="${area.id}-url" type="url" inputmode="url" autocomplete="off" placeholder="https://… oppure indirizzo email" maxlength="2000"><button class="dpi-btn dpi-btn--sm dpi-btn--primary" type="button" data-dpi-rt="link-ok">Applica</button><button class="dpi-btn dpi-btn--sm" type="button" data-dpi-rt="link-off">Rimuovi</button><button class="dpi-btn dpi-btn--sm" type="button" data-dpi-rt="link-x">Annulla</button><p class="dpi-error" role="alert" hidden data-dpi-rt-err>Indirizzo non valido: usa http, https o mailto.</p>`;
    const colorRow = document.createElement("div");
    colorRow.className = "dpi-richtext__colors";
    colorRow.hidden = true;
    colorRow.setAttribute("role", "group");
    colorRow.innerHTML = SWATCHES.map(([c, n]) => `<button class="dpi-richtext__swatch" type="button" data-dpi-rt-color="${c}" title="${esc(n)}" aria-label="${esc(n)}"></button>`).join("") + '<button class="dpi-btn dpi-btn--sm" type="button" data-dpi-rt-color="">Predefinito</button><button class="dpi-btn dpi-btn--sm" type="button" data-dpi-rt-color="x">Chiudi</button>';
    colorRow.querySelectorAll(".dpi-richtext__swatch").forEach((b) => {
      b.style.backgroundColor = b.getAttribute("data-dpi-rt-color");
    });
    area.before(bar2, linkRow, colorRow);
    apply(bar2);
    const btns = Array.from(bar2.querySelectorAll("button"));
    btns.forEach((b, i) => {
      b.tabIndex = i === 0 ? 0 : -1;
    });
    const url = linkRow.querySelector("input");
    const err = linkRow.querySelector("[data-dpi-rt-err]");
    let saved = null;
    const selIn = () => {
      const s = getSelection();
      return s && s.rangeCount && area.contains(s.anchorNode) ? s : null;
    };
    const up = (sel2) => {
      const s = selIn();
      if (!s) return null;
      const n = s.anchorNode;
      const el6 = n.nodeType === 1 ? n : n.parentElement;
      const f3 = el6?.closest(sel2);
      return f3 && area.contains(f3) ? f3 : null;
    };
    const remember = () => {
      const s = selIn();
      if (s) saved = s.getRangeAt(0).cloneRange();
    };
    const restore2 = () => {
      area.focus({ preventScroll: true });
      if (saved && !selIn()) {
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(saved);
      }
    };
    let timer = 0;
    const isEmpty = () => area.textContent.replace(/\s/g, "") === "" && !area.querySelector("img,hr,table");
    const sync8 = () => {
      clearTimeout(timer);
      const clone = area.cloneNode(true);
      const html = sanitize(clone.innerHTML, { level: "full", marker: true });
      const empty = isEmpty();
      field.value = empty ? "" : html;
      if (textField) textField.value = empty ? "" : toText(html);
      area.toggleAttribute("data-dpi-empty", empty);
      if (!empty) area.removeAttribute("aria-invalid");
      return field.value;
    };
    const later = () => {
      clearTimeout(timer);
      timer = setTimeout(sync8, 150);
    };
    const lock = () => {
      area.querySelectorAll("[data-dpi-rt-locked]").forEach((b) => b.setAttribute("contenteditable", "false"));
      const edge = (c, first) => {
        if (c && c.nodeType === 1 && c.hasAttribute("data-dpi-rt-locked")) {
          const d = document.createElement("div");
          d.append(document.createElement("br"));
          if (first) area.prepend(d);
          else area.append(d);
        }
      };
      edge(area.firstChild, true);
      edge(area.lastChild, false);
    };
    const load2 = (html) => {
      const tpl = document.createElement("template");
      tpl.innerHTML = sanitize(html, { level: "full", locked: true });
      area.replaceChildren(tpl.content);
      lock();
      sync8();
    };
    load2(field.defaultValue);
    const state3 = () => {
      const on = (k, v) => bar2.querySelector(`[data-dpi-rt="${k}"]`)?.setAttribute("aria-pressed", String(!!v));
      const q = (c) => {
        try {
          return document.queryCommandState(c);
        } catch {
          return false;
        }
      };
      const inside = !!selIn();
      for (const k of Object.keys(EXEC)) on(k, inside && q(EXEC[k]));
      on("quote", inside && up("blockquote"));
      for (const k of Object.keys(JUSTIFY)) on(k, inside && q(JUSTIFY[k]));
      on("link", inside && up("a[href]"));
    };
    const exec = (c, v) => {
      restore2();
      document.execCommand(c, false, v);
      remember();
      state3();
      sync8();
      emit(root4, "richtext", { html: field.value });
    };
    const execCss = (c, v) => {
      restore2();
      try {
        document.execCommand("styleWithCSS", false, "true");
        document.execCommand(c, false, v);
      } finally {
        try {
          document.execCommand("styleWithCSS", false, "false");
        } catch {
        }
      }
      remember();
      state3();
      sync8();
      emit(root4, "richtext", { html: field.value });
    };
    let palette = "";
    const showColors = (k) => {
      if (palette === k && !colorRow.hidden) {
        colorRow.hidden = true;
        return;
      }
      palette = k;
      remember();
      colorRow.setAttribute("aria-label", k === "hilite" ? "Evidenzia" : "Colore del testo");
      colorRow.hidden = false;
    };
    const applyColor = (c) => {
      colorRow.hidden = true;
      if (c === "x") {
        restore2();
        return;
      }
      if (palette === "hilite") execCss("hiliteColor", c || "transparent");
      else execCss("foreColor", c || "inherit");
    };
    const applySize = (pt) => {
      execCss("fontSize", "7");
      area.querySelectorAll('font[size="7"], span[style*="xxx-large"]').forEach((f3) => {
        const sp = document.createElement("span");
        sp.style.fontSize = `${pt}pt`;
        while (f3.firstChild) sp.append(f3.firstChild);
        f3.replaceWith(sp);
      });
      sync8();
    };
    const showLink = () => {
      remember();
      const a = up("a[href]");
      url.value = a ? a.getAttribute("href") : "";
      err.hidden = true;
      linkRow.hidden = false;
      url.focus();
      url.select();
    };
    const hideLink = (focus = true) => {
      linkRow.hidden = true;
      err.hidden = true;
      if (focus) restore2();
    };
    const normUrl = (v) => {
      v = v.trim();
      if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(v)) return `mailto:${v}`;
      if (!/^[a-z][a-z0-9+.-]*:/i.test(v) && /^[^\s/]+\.[^\s/]{2,}(\/\S*)?$/.test(v)) return `https://${v}`;
      return v;
    };
    const applyLink = () => {
      const href = normUrl(url.value);
      if (!URL_OK.test(href)) {
        err.hidden = false;
        url.setAttribute("aria-invalid", "true");
        url.focus();
        return;
      }
      url.removeAttribute("aria-invalid");
      linkRow.hidden = true;
      restore2();
      const s = selIn();
      const a = up("a[href]");
      if (a) a.setAttribute("href", href);
      else if (s && s.isCollapsed) document.execCommand("insertHTML", false, `<a href="${esc(href)}">${esc(href)}</a>`);
      else document.execCommand("createLink", false, href);
      remember();
      state3();
      sync8();
    };
    const clearFormat = () => {
      restore2();
      document.execCommand("removeFormat");
      document.execCommand("unlink");
      const s = selIn();
      if (s) {
        const r = s.getRangeAt(0);
        area.querySelectorAll("[style]").forEach((el6) => {
          if (r.intersectsNode(el6) && !BLOCK_TAGS.has(el6.tagName)) el6.removeAttribute("style");
        });
      }
      remember();
      state3();
      sync8();
    };
    bar2.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) e.preventDefault();
    });
    bar2.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-dpi-rt]");
      if (!b) return;
      const k = b.getAttribute("data-dpi-rt");
      if (EXEC[k]) exec(EXEC[k]);
      else if (JUSTIFY[k]) execCss(JUSTIFY[k]);
      else if (k === "color" || k === "hilite") showColors(k);
      else if (k === "undo" || k === "redo") exec(k);
      else if (k === "quote") exec("formatBlock", up("blockquote") ? "div" : "blockquote");
      else if (k === "link") {
        if (linkRow.hidden) showLink();
        else hideLink();
      } else if (k === "clear") clearFormat();
    });
    colorRow.addEventListener("mousedown", (e) => {
      if (e.target.closest("button")) e.preventDefault();
    });
    colorRow.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-dpi-rt-color]");
      if (b) applyColor(b.getAttribute("data-dpi-rt-color"));
    });
    colorRow.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        colorRow.hidden = true;
        restore2();
      }
    });
    bar2.querySelector("[data-dpi-rt-size]")?.addEventListener("change", (e) => {
      applySize(e.target.value);
      e.target.value = "11";
    });
    linkRow.addEventListener("click", (e) => {
      const b = e.target.closest("button[data-dpi-rt]");
      if (!b) return;
      const k = b.getAttribute("data-dpi-rt");
      if (k === "link-ok") applyLink();
      else if (k === "link-off") {
        hideLink();
        const a = up("a[href]");
        if (a) document.execCommand("unlink");
        remember();
        state3();
        sync8();
      } else hideLink();
    });
    linkRow.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && e.target === url) {
        e.preventDefault();
        applyLink();
      } else if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        hideLink();
      }
    });
    bar2.addEventListener("keydown", (e) => {
      const i = btns.indexOf(document.activeElement);
      if (i < 0 || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
      e.preventDefault();
      const dir = getComputedStyle(root4).direction === "rtl" ? -1 : 1;
      const n = e.key === "Home" ? 0 : e.key === "End" ? btns.length - 1 : (i + (e.key === "ArrowRight" ? dir : -dir) + btns.length) % btns.length;
      btns.forEach((b, k) => {
        b.tabIndex = k === n ? 0 : -1;
      });
      btns[n].focus();
    });
    area.addEventListener("input", () => {
      later();
      area.toggleAttribute("data-dpi-empty", isEmpty());
    });
    area.addEventListener("focus", () => {
      current2 = api;
      state3();
    });
    area.addEventListener("blur", () => {
      remember();
      sync8();
    });
    area.addEventListener("keyup", () => {
      remember();
      state3();
    });
    area.addEventListener("mouseup", () => {
      remember();
      state3();
    });
    const files = (list) => {
      const ev = new CustomEvent("dpi:richtext-files", { bubbles: true, cancelable: true, detail: { files: list } });
      root4.dispatchEvent(ev);
      if (ev.defaultPrevented) return;
      list.filter((f3) => /^image\/(png|jpeg|gif|webp)$/.test(f3.type) && f3.size <= IMG_MAX).forEach((f3) => {
        const r = new FileReader();
        r.onload = () => {
          restore2();
          document.execCommand("insertHTML", false, `<img src="${esc(String(r.result))}" alt="${esc(f3.name.slice(0, 60))}">`);
          remember();
          sync8();
        };
        r.readAsDataURL(f3);
      });
    };
    const insert = (html, text2) => {
      const clean = html ? sanitize(html, { level: "basic", colors: false }) : "";
      if (clean.trim()) document.execCommand("insertHTML", false, clean);
      else if (text2) document.execCommand("insertText", false, text2);
      sync8();
    };
    area.addEventListener("paste", (e) => {
      const cd = e.clipboardData;
      if (!cd) return;
      e.preventDefault();
      if (cd.files?.length && !cd.getData("text/plain") && !cd.getData("text/html")) {
        files(Array.from(cd.files));
        return;
      }
      insert(cd.getData("text/html"), cd.getData("text/plain"));
    });
    let inner = false;
    area.addEventListener("dragstart", () => {
      inner = true;
    });
    area.addEventListener("dragend", () => {
      inner = false;
    });
    area.addEventListener("drop", (e) => {
      const dt = e.dataTransfer;
      if (inner) {
        inner = false;
        return;
      }
      e.preventDefault();
      if (!dt) return;
      if (dt.files && dt.files.length && !dt.getData("text/plain") && !dt.getData("text/html")) {
        files(Array.from(dt.files));
        return;
      }
      const pos = document.caretPositionFromPoint?.(e.clientX, e.clientY);
      const rng = pos ? (() => {
        const r = document.createRange();
        r.setStart(pos.offsetNode, pos.offset);
        return r;
      })() : document.caretRangeFromPoint?.(e.clientX, e.clientY);
      if (rng && area.contains(rng.startContainer)) {
        const s = getSelection();
        s.removeAllRanges();
        s.addRange(rng);
      }
      area.focus();
      insert(dt.getData("text/html"), dt.getData("text/plain"));
    });
    if (form) {
      form.addEventListener("formdata", (e) => {
        sync8();
        e.formData.set(field.name, field.value);
        if (textField) e.formData.set(textField.name, textField.value);
      });
      form.addEventListener("submit", (e) => {
        if (!required) return;
        sync8();
        if (!isEmpty()) return;
        e.preventDefault();
        e.stopImmediatePropagation();
        area.setAttribute("aria-invalid", "true");
        area.focus();
      }, true);
      form.addEventListener("reset", () => setTimeout(() => {
        load2(field.defaultValue);
        area.removeAttribute("aria-invalid");
      }, 0));
    }
    const api = { root: root4, area, field, sync: sync8, state: state3, load: load2 };
    inst4.set(root4, api);
    return api;
  }
  var of = (root4) => inst4.get(root4) ?? setup14(root4);
  var value = (root4) => {
    const e = of(root4);
    return e ? e.sync() : "";
  };
  var text = (root4) => toText(value(root4));
  var sync5 = value;
  var set3 = (root4, html) => {
    const e = of(root4);
    if (e) e.load(html);
  };
  function init9(root4 = document) {
    root4.querySelectorAll("[data-dpi-richtext]").forEach(setup14);
    if (root4.matches?.("[data-dpi-richtext]")) setup14(root4);
  }
  var bound15 = false;
  function bind11() {
    if (bound15) return;
    bound15 = true;
    document.addEventListener("selectionchange", () => {
      if (current2 && document.activeElement === current2.area) {
        current2.state();
      }
    });
    document.addEventListener("click", (e) => {
      const l = e.target.closest?.("label[for]");
      if (!l) return;
      const t = document.getElementById(l.getAttribute("for"));
      if (t?.classList.contains("dpi-richtext__area")) t.focus();
    });
  }

  // dpi/js/chatbot.js
  var chatbot_exports = {};
  __export(chatbot_exports, {
    get: () => get4,
    init: () => init10,
    mount: () => mount,
    neckGeometry: () => neckGeometry,
    safeHref: () => safeHref
  });

  // dpi/js/chatbot-morph.js
  var clamp9 = (x) => Math.max(0, Math.min(1, x));
  var ease5 = (x) => {
    const t = clamp9(x);
    return t * t * (3 - 2 * t);
  };
  var mix2 = (a, b, t) => a + (b - a) * t;
  var f2 = (n) => n.toFixed(3);
  function roundedPath2({ x, y, w, h, r }) {
    if (w <= 0 || h <= 0) return "M 0 0 Z";
    r = Math.max(0, Math.min(r, w / 2, h / 2));
    const arc = (xx, yy) => `A ${f2(r)} ${f2(r)} 0 0 1 ${f2(xx)} ${f2(yy)}`;
    return `M ${f2(x + r)} ${f2(y)} H ${f2(x + w - r)} ${arc(x + w, y + r)} V ${f2(y + h - r)} ${arc(x + w - r, y + h)} H ${f2(x + r)} ${arc(x, y + h - r)} V ${f2(y + r)} ${arc(x + r, y)} Z`;
  }
  function chatbotFrame(source, target2, progress) {
    const u = clamp9(progress);
    const direction = target2.y + target2.h / 2 >= source.y + source.h / 2 ? 1 : -1;
    const grow = ease5((u - 0.66) / 0.34);
    const birth = ease5(u / 0.24);
    const rise = ease5((u - 0.1) / 0.46);
    const release = ease5((u - 0.2) / 0.36);
    const seed = Math.min(48, source.w * 0.96, target2.w, target2.h);
    const elongation = 1 + 0.22 * Math.sin(Math.PI * clamp9((u - 0.16) / 0.4)) * (1 - grow);
    const w = mix2(seed * birth / Math.sqrt(elongation), target2.w, grow);
    const h = mix2(seed * birth * elongation, target2.h, grow);
    const cx = mix2(source.x + source.w / 2, target2.x + target2.w / 2, grow);
    const face = direction > 0 ? source.y + source.h : source.y;
    const endFace = direction > 0 ? target2.y : target2.y + target2.h;
    const gap = Math.max(0, direction * (endFace - face));
    const separation = Math.min(30, Math.max(18, gap));
    const near = mix2(face + direction * separation * rise, endFace, grow);
    const y = direction > 0 ? near : near - h;
    const r = Math.min(mix2(Math.min(w, h) / 2, target2.r, grow), w / 2, h / 2);
    const body = { x: cx - w / 2, y, w, h, r: Math.max(0, r) };
    const bodyPath = roundedPath2(body);
    const strength = 1 - release;
    const base = Math.min(source.w * 0.3, w * 0.4) * strength;
    const throat = Math.min(16, w * 0.32) * strength;
    const attached = u > 0 && base > 0.01 && throat > 0.01;
    if (!attached) return { ...body, grow, attached: false, fill: bodyPath, stroke: bodyPath };
    const sourceCX = source.x + source.w / 2;
    const a = face - direction * 0.75;
    const q = (x, yy) => `${f2(x)} ${f2(a + direction * yy)}`;
    const top = direction * (near - a), bottom = top + h;
    const left = cx - w / 2, right = cx + w / 2;
    const sourceR = Math.min(source.w, source.h) / 2;
    const flatSource = source.w / 2 - sourceR;
    const sinSource = sourceR ? Math.min(0.999, Math.max(0, base - flatSource) / sourceR) : 0;
    const cosSource = Math.sqrt(1 - sinSource * sinSource);
    const sourceY = -sourceR * (1 - cosSource);
    const joinCX = Math.max(left + throat, Math.min(sourceCX, right - throat));
    const lx = joinCX - throat, rx = joinCX + throat;
    const sinLeft = r ? Math.min(0.999, Math.max(0, left + r - lx) / r) : 0;
    const sinRight = r ? Math.min(0.999, Math.max(0, rx - (right - r)) / r) : 0;
    const cosLeft = Math.sqrt(1 - sinLeft * sinLeft), cosRight = Math.sqrt(1 - sinRight * sinRight);
    const ly = top + r * (1 - cosLeft), ry = top + r * (1 - cosRight);
    const handle = (yy, cos) => Math.max(0, Math.min(
      (yy - sourceY) * 0.65,
      base * 0.85 / Math.max(0.1, cosSource),
      throat * 0.85 / Math.max(0.1, cos)
    ));
    const kl = handle(ly, cosLeft), kr = handle(ry, cosRight);
    let path = `M ${q(sourceCX - base, sourceY)}`;
    path += ` C ${q(sourceCX - base + kl * cosSource, sourceY + kl * sinSource)} ${q(lx + kl * cosLeft, ly - kl * sinLeft)} ${q(lx, ly)}`;
    const sweep2 = direction > 0 ? 0 : 1;
    const arc = (xx, yy) => `A ${f2(r)} ${f2(r)} 0 0 ${sweep2} ${q(xx, yy)}`;
    if (lx < left + r) path += ` ${arc(left, top + r)}`;
    else path += ` L ${q(left + r, top)} ${arc(left, top + r)}`;
    path += ` L ${q(left, bottom - r)} ${arc(left + r, bottom)}`;
    path += ` L ${q(right - r, bottom)} ${arc(right, bottom - r)}`;
    path += ` L ${q(right, top + r)}`;
    if (rx > right - r) path += ` ${arc(rx, ry)}`;
    else path += ` ${arc(right - r, top)} L ${q(rx, top)}`;
    path += ` C ${q(rx - kr * cosRight, ry - kr * sinRight)} ${q(sourceCX + base - kr * cosSource, sourceY + kr * sinSource)} ${q(sourceCX + base, sourceY)}`;
    const fill2 = path + ` A ${f2(sourceR)} ${f2(sourceR)} 0 0 ${direction > 0 ? 1 : 0} ${q(sourceCX - base, sourceY)} Z`;
    return { ...body, grow, attached: true, fill: fill2, stroke: base < 0.6 ? bodyPath : path };
  }

  // dpi/js/chatbot.js
  var instances = ownedMap();
  var NS5 = "http://www.w3.org/2000/svg";
  var MORPH_TIME_SCALE = 0.75;
  var MORPH_SPEED = 1 / 1.05 / MORPH_TIME_SCALE;
  var MORPH_ACCEL = 12 / (MORPH_TIME_SCALE * MORPH_TIME_SCALE);
  var BURY = 3;
  var reduced11 = () => typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = () => typeof matchMedia === "function" && matchMedia("(pointer: fine)").matches;
  function neckGeometry(T0, B0, dir, finalGap) {
    const mir = (R) => dir > 0 ? R : { ...R, y: -(R.y + R.h) };
    const T = mir(T0), B = mir(B0);
    const tb = T.y + T.h, bt = B.y;
    if (bt - tb < -2) return null;
    const g = Math.max(0, bt - tb);
    const L = Math.max(8, finalGap * 0.85);
    if (g >= L) return null;
    const ax = T.x + T.w / 2;
    const rT = Math.max(0, Math.min(T.r, T.w / 2, T.h / 2)), rB = Math.max(0, Math.min(B.r, B.w / 2, B.h / 2));
    const rmin = Math.min(rT, rB);
    let mid = rmin * 0.85 * (1 - g / L) ** 0.7;
    if (mid < 1.5) return null;
    let end = mid + 0.5 * (rmin - mid);
    end = Math.min(end, Math.min(ax - B.x, B.x + B.w - ax) * 0.92, T.w / 2 * 0.95);
    mid = Math.min(mid, end * 0.9);
    if (mid < 1.5 || end < 1.5) return null;
    const flatT = Math.max(0, T.w / 2 - rT);
    const sinT = rT > 0 ? Math.min(0.999, Math.max(0, end - flatT) / rT) : 0;
    const cosT = Math.sqrt(1 - sinT * sinT);
    const yT = tb - rT * (1 - cosT);
    const side = (sgn) => {
      const x = ax + sgn * end;
      const edge = sgn < 0 ? x - B.x : B.x + B.w - x;
      const sinB = rB > 0 ? Math.min(0.999, Math.max(0, rB - edge) / rB) : 0;
      const cosB = Math.sqrt(1 - sinB * sinB);
      const yB = bt + rB * (1 - cosB);
      const span = yB - yT;
      if (span < 0.5) return null;
      const k = Math.min(8 * (end - mid) / (3 * (cosT + cosB)), 0.9 * span / (sinT + sinB + 1e-6));
      return { P: [[x, yT], [x - sgn * k * cosT, yT + k * sinT], [x - sgn * k * cosB, yB - k * sinB], [x, yB]], yB };
    };
    const l = side(-1), r = side(1);
    if (!l || !r) return null;
    const f3 = (n) => n.toFixed(2);
    const pt = ([x, y]) => `${f3(x)} ${f3(dir * y)}`;
    const cur2 = (P) => `C ${pt(P[1])} ${pt(P[2])} ${pt(P[3])}`;
    const xl = ax - end, xr = ax + end;
    const left = `M ${pt(l.P[0])} ${cur2(l.P)}`;
    const right = `M ${pt(r.P[0])} ${cur2(r.P)}`;
    const fill2 = `M ${pt([xl, yT - BURY])} L ${pt(l.P[0])} ${cur2(l.P)} L ${pt([xl, l.yB + BURY])} L ${pt([xr, r.yB + BURY])} L ${pt(r.P[3])} C ${pt(r.P[2])} ${pt(r.P[1])} ${pt(r.P[0])} L ${pt([xr, yT - BURY])} Z`;
    const fT = dir > 0 ? 1 : 0, fB = dir > 0 ? 0 : 1;
    const dT = Math.abs(fT - 0.3) / 1.5;
    const dB = Math.hypot((ax - (B0.x + B0.w / 2)) / (1.3 * Math.max(1, B0.w)), Math.abs(fB - 0.3) / 1.5);
    return { fill: fill2, left, right, y1: dir * yT, y2: dir * (l.yB + r.yB) / 2, dT, dB };
  }
  var LABELS = {
    open: "Apri la chat",
    close: "Chiudi la chat",
    title: "Assistente",
    placeholder: "Scrivi un messaggio…",
    send: "Invia",
    log: "Conversazione",
    empty: "Come posso aiutarti?",
    loading: "Sto scrivendo…",
    you: "Tu",
    assistant: "Assistente",
    system: "Sistema",
    sources: "Fonti",
    suggestions: "Suggerimenti",
    useful: "Risposta utile",
    notUseful: "Risposta non utile",
    attach: "Allega un file",
    removeFile: "Rimuovi l’allegato",
    input: "Messaggio"
  };
  function safeHref(url) {
    const u = String(url ?? "").trim();
    if (!u) return null;
    if (/^(https?:|mailto:)/i.test(u)) return u;
    if (/^[a-z][a-z0-9+.-]*:/i.test(u)) return null;
    return u;
  }
  function el5(tag, cls, attrs) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (attrs) {
      for (const [k, v] of Object.entries(attrs)) if (v !== void 0 && v !== null && v !== false) n.setAttribute(k, v === true ? "" : String(v));
    }
    return n;
  }
  function button2({ label: label2, icon: icon4, iconOnly = true, cls = "dpi-btn dpi-btn--sm", attrs = {} }) {
    const b = el5("button", cls + (iconOnly ? " dpi-btn--icon-only" : ""), { type: "button", ...attrs });
    const c = el5("span", "dpi-btn__content");
    const svg2 = icon4 ? icon(icon4, "md") : null;
    if (svg2) {
      svg2.setAttribute("aria-hidden", "true");
      c.append(svg2);
    }
    if (iconOnly) {
      b.setAttribute("aria-label", label2);
      b.title = label2;
    } else c.append(Object.assign(el5("span", "dpi-btn__label"), { textContent: label2 }));
    b.append(c);
    return b;
  }
  function mount(root4, options2 = {}) {
    if (!root4) return null;
    if (instances.has(root4)) return instances.get(root4);
    const d0 = root4.dataset;
    const o = {
      title: d0.dpiTitle,
      placeholder: d0.dpiPlaceholder,
      emptyText: d0.dpiEmpty,
      icon: d0.dpiIcon || "message-circle",
      triggerLabel: d0.dpiTriggerLabel,
      maxLength: d0.dpiMaxLength ? +d0.dpiMaxLength : 0,
      maxHeight: d0.dpiMaxHeight,
      width: d0.dpiWidth,
      inputMaxHeight: d0.dpiInputMaxHeight,
      echo: d0.dpiEcho !== "false",
      enterToSend: d0.dpiEnter !== "newline",
      open: d0.dpiOpen === "",
      suggestions: [],
      headerActions: [],
      tools: [],
      persistSuggestions: false,
      attach: false,
      subtitle: void 0,
      topFrom: d0.dpiTopFrom || null,
      trigger: d0.dpiTrigger || null,
      ...options2
    };
    const L = { ...LABELS, ...options2.labels || {} };
    const slots0 = {};
    root4.querySelectorAll(":scope > [data-dpi-chatbot-slot]").forEach((n) => {
      slots0[n.getAttribute("data-dpi-chatbot-slot")] = n;
    });
    root4.classList.add("dpi-chatbot");
    root4.setAttribute("data-dpi-chatbot", "");
    root4.setAttribute("data-dpi-morph", "");
    root4.dataset.dpiState = "closed";
    root4.replaceChildren();
    if (o.maxHeight) root4.style.setProperty("--dpi-chatbot-max-height", o.maxHeight);
    if (o.width) root4.style.setProperty("--dpi-chatbot-w", o.width);
    if (o.inputMaxHeight) root4.style.setProperty("--dpi-chatbot-input-max", o.inputMaxHeight);
    const extEl = (() => {
      let n = null;
      try {
        n = typeof o.trigger === "string" ? document.querySelector(o.trigger) : o.trigger;
      } catch {
        n = null;
      }
      if (!n && root4.id) {
        try {
          n = document.querySelector(`[data-dpi-chatbot-trigger-for="${CSS.escape(root4.id)}"]`);
        } catch {
          n = null;
        }
      }
      return n instanceof HTMLElement ? n : null;
    })();
    const external = !!extEl;
    const trigger2 = extEl || button2({ label: o.triggerLabel || L.open, icon: o.icon, cls: "dpi-btn dpi-btn--lg", attrs: { "data-dpi-chatbot-trigger": "" } });
    if (!external) root4.setAttribute("data-dpi-chatbot-internal", "");
    if (external) {
      trigger2.classList.add("dpi-chatbot-trigger");
      trigger2.setAttribute("data-dpi-chatbot-external", "");
      trigger2.setAttribute("aria-haspopup", "dialog");
    }
    const panel2 = el5("section", "dpi-chatbot__panel", { role: "dialog", "aria-modal": "false", "data-dpi-chatbot-panel": "", hidden: true, tabindex: "-1" });
    const titleId = ensureId(panel2, "dpi-chatbot") + "-title";
    panel2.setAttribute("aria-labelledby", titleId);
    trigger2.setAttribute("aria-controls", panel2.id);
    trigger2.setAttribute("aria-expanded", "false");
    const inner = el5("div", "dpi-chatbot__inner");
    const header = el5("header", "dpi-chatbot__header");
    const heading = el5("div", "dpi-chatbot__heading");
    const titleEl = el5("h2", "dpi-chatbot__title", { id: titleId });
    const subEl = el5("p", "dpi-chatbot__subtitle", { hidden: true });
    heading.append(titleEl, subEl);
    const headerSlot = slots0["header-actions"] || el5("div");
    headerSlot.classList.add("dpi-chatbot__header-actions");
    headerSlot.setAttribute("data-dpi-chatbot-slot", "header-actions");
    const closeBtn = button2({ label: L.close, icon: "x", attrs: { "data-dpi-chatbot-close": "" } });
    header.append(heading, headerSlot, closeBtn);
    const main = el5("div", "dpi-chatbot__main");
    const emptyEl = slots0.empty || el5("div");
    emptyEl.classList.add("dpi-chatbot__empty");
    emptyEl.setAttribute("data-dpi-chatbot-slot", "empty");
    const emptyText = el5("p", "dpi-chatbot__empty-text");
    const sugEl = el5("div", "dpi-chatbot__suggestions", { role: "group", "aria-label": L.suggestions });
    emptyEl.prepend(emptyText);
    const log = el5("div", "dpi-chatbot__log", { role: "log", "aria-live": "polite", "aria-relevant": "additions text", "aria-label": L.log });
    const typing = el5("div", "dpi-chatbot__typing", { hidden: true });
    const typingDots = el5("span", "dpi-chatbot__dots", { "aria-hidden": "true" });
    typingDots.append(el5("i"), el5("i"), el5("i"));
    const typingLabel = el5("span", "dpi-chatbot__typing-label");
    typing.append(typingDots, typingLabel);
    log.append(typing);
    const aside = slots0.aside || el5("div");
    aside.classList.add("dpi-chatbot__aside");
    aside.setAttribute("data-dpi-chatbot-slot", "aside");
    aside.hidden = true;
    main.append(emptyEl, log, aside);
    const errorEl = el5("div", "dpi-chatbot__error", { role: "alert", hidden: true });
    const above = slots0.above || el5("div");
    above.classList.add("dpi-chatbot__above");
    above.setAttribute("data-dpi-chatbot-slot", "above");
    const chips2 = el5("div", "dpi-chatbot__chips");
    const filesEl = el5("ul", "dpi-chatbot__files", { hidden: true, "aria-label": L.attach });
    const composer = el5("form", "dpi-chatbot__composer", { novalidate: true });
    const tools = el5("div", "dpi-chatbot__tools");
    const field = el5("div", "dpi-chatbot__field");
    const ta = el5("textarea", "dpi-textarea dpi-chatbot__input", { rows: 1, "aria-label": o.inputLabel || L.input, placeholder: o.placeholder || L.placeholder, enterkeyhint: "send", autocomplete: "off" });
    if (o.maxLength) ta.maxLength = o.maxLength;
    field.append(ta);
    const sendBtn = button2({ label: L.send, icon: "send", cls: "dpi-btn dpi-btn--primary dpi-btn--icon-only", attrs: { type: "submit", "data-dpi-chatbot-send": "" } });
    composer.append(tools, field, sendBtn);
    const fileInput = o.attach ? el5("input", "dpi-visually-hidden", { type: "file", tabindex: "-1", "aria-hidden": "true", ...o.attach.accept ? { accept: o.attach.accept } : {}, ...o.attach.multiple ? { multiple: true } : {} }) : null;
    if (fileInput) composer.append(fileInput);
    inner.append(header, main, errorEl, above, chips2, filesEl, composer);
    panel2.append(inner);
    if (external) root4.append(panel2);
    else root4.append(trigger2, panel2);
    apply(root4);
    refresh(root4);
    const st = { messages: /* @__PURE__ */ new Map(), seq: 0, disabled: false, loading: false, files: [], stick: true, focus: null, wired: null, raf: 0, ro: null, topRo: null, topRaf: 0, top: "", surface: null, geo: null, morphU: 0, morphV: 0, morphTarget: 0, morphRaf: 0, morphLast: 0 };
    let tools_ = [];
    const stateOf4 = () => root4.dataset.dpiState || "closed";
    const isOpenish2 = () => ["opening", "open"].includes(stateOf4());
    const isOpen4 = () => isOpenish2();
    function setHeader({ title, subtitle } = {}) {
      if (title !== void 0) titleEl.textContent = title;
      if (subtitle !== void 0) {
        subEl.textContent = subtitle || "";
        subEl.hidden = !subtitle;
      }
    }
    function refreshControls(host) {
      apply(host);
      if (host.isConnected) refresh(host);
    }
    function renderActionButtons(host, list, area) {
      host.querySelectorAll("[data-dpi-chatbot-act]").forEach((n) => {
        destroyAll(n);
        n.remove();
      });
      for (const a of list || []) {
        const b = button2({ label: a.label, icon: a.icon, iconOnly: !!a.icon && a.iconOnly !== false, attrs: { "data-dpi-chatbot-act": a.id, "data-dpi-chatbot-area": area, ...a.pressed !== void 0 ? { "aria-pressed": String(!!a.pressed) } : {}, ...a.disabled ? { disabled: true } : {} } });
        host.append(b);
      }
      refreshControls(host);
    }
    const setHeaderActions = (list) => renderActionButtons(headerSlot, list, "header");
    function setTools(list) {
      tools_ = list || [];
      renderActionButtons(tools, tools_, "composer");
      if (o.attach && !tools.querySelector("[data-dpi-chatbot-attach]")) tools.prepend(attachBtn);
      tools.hidden = !tools.children.length;
      refreshControls(tools);
    }
    const attachBtn = o.attach ? button2({ label: L.attach, icon: "paperclip", attrs: { "data-dpi-chatbot-attach": "" } }) : null;
    function setSuggestions(list) {
      o.suggestions = (list || []).map((s) => typeof s === "string" ? { text: s } : s);
      destroyAll(sugEl);
      sugEl.replaceChildren(...o.suggestions.map((s) => {
        return button2({ label: s.label || s.text, iconOnly: false, cls: "dpi-btn dpi-btn--sm dpi-chatbot__chip", attrs: { "data-dpi-chatbot-suggestion": s.text } });
      }));
      placeSuggestions();
      refreshControls(sugEl);
    }
    function placeSuggestions() {
      const empty = !st.messages.size;
      if (empty) {
        if (sugEl.parentNode !== emptyEl) emptyEl.append(sugEl);
        chips2.hidden = true;
      } else if (o.persistSuggestions && o.suggestions.length) {
        if (sugEl.parentNode !== chips2) chips2.append(sugEl);
        chips2.hidden = false;
      } else {
        sugEl.remove();
        chips2.hidden = true;
      }
      sugEl.hidden = !o.suggestions.length;
      if (sugEl.isConnected) refreshControls(sugEl);
    }
    function refreshEmpty() {
      const empty = !st.messages.size;
      main.toggleAttribute("data-dpi-empty", empty);
      emptyEl.hidden = !empty;
      emptyText.textContent = o.emptyText || L.empty;
      log.tabIndex = empty ? -1 : 0;
      placeSuggestions();
    }
    const nearEnd = () => log.scrollHeight - log.scrollTop - log.clientHeight < 80;
    function scrollToEnd() {
      log.scrollTop = log.scrollHeight;
      st.stick = true;
    }
    log.addEventListener("scroll", () => {
      st.stick = nearEnd();
    }, { passive: true });
    function fill2(article, m) {
      const activeKey = article.contains(document.activeElement) ? document.activeElement.getAttribute("data-dpi-key") : null;
      destroyAll(article);
      article.replaceChildren();
      article.dataset.role = m.role;
      article.dataset.status = m.status || "done";
      if (m.status === "pending") article.setAttribute("aria-busy", "true");
      else article.removeAttribute("aria-busy");
      const bubble = el5("div", "dpi-chatbot__bubble");
      const who = m.role === "user" ? L.you : m.role === "assistant" ? L.assistant : L.system;
      bubble.append(Object.assign(el5("span", "dpi-visually-hidden"), { textContent: `${m.author || who}: ` }));
      const body = el5("div", "dpi-chatbot__text");
      if (m.nodes) body.append(...[].concat(m.nodes));
      else if (m.html !== void 0 && m.html !== null) body.innerHTML = String(m.html);
      else {
        body.textContent = m.text ?? "";
        body.classList.add("dpi-chatbot__text--plain");
      }
      if (body.childNodes.length) bubble.append(body);
      if (m.status === "pending") {
        const dots = el5("span", "dpi-chatbot__dots", { "aria-hidden": "true" });
        dots.append(el5("i"), el5("i"), el5("i"));
        bubble.append(dots);
      }
      article.append(bubble);
      if (m.meta) article.append(Object.assign(el5("p", "dpi-chatbot__meta"), { textContent: m.meta }));
      if (m.sources?.length) {
        const wrap = el5("div", "dpi-chatbot__sources");
        wrap.append(Object.assign(el5("span", "dpi-chatbot__sources-label"), { textContent: L.sources }));
        const ul = el5("ul", "dpi-chatbot__source-list");
        for (const s of m.sources) {
          const li = el5("li");
          const href = safeHref(s.href);
          const a = href ? el5("a", "dpi-link", { href, .../^https?:/i.test(href) ? { target: "_blank", rel: "noopener noreferrer" } : {} }) : el5("span");
          a.textContent = s.title || s.href || "";
          li.append(a);
          ul.append(li);
        }
        wrap.append(ul);
        article.append(wrap);
      }
      const foot = el5("div", "dpi-chatbot__foot");
      for (const a of m.actions || []) foot.append(button2({ label: a.label, icon: a.icon, iconOnly: false, attrs: { "data-dpi-chatbot-act": a.id, "data-dpi-chatbot-area": "message", "data-dpi-key": "a:" + a.id } }));
      if (m.feedback) {
        const v = m.feedbackValue || 0;
        foot.append(
          button2({ label: L.useful, icon: "thumbs-up", attrs: { "data-dpi-chatbot-fb": "1", "aria-pressed": String(v === 1), "data-dpi-key": "fb:1" } }),
          button2({ label: L.notUseful, icon: "thumbs-down", attrs: { "data-dpi-chatbot-fb": "-1", "aria-pressed": String(v === -1), "data-dpi-key": "fb:-1" } })
        );
        if (m.feedbackNote) foot.append(Object.assign(el5("span", "dpi-chatbot__meta"), { textContent: m.feedbackNote }));
      }
      if (foot.children.length) article.append(foot);
      refreshControls(article);
      if (activeKey) article.querySelector(`[data-dpi-key="${CSS.escape(activeKey)}"]`)?.focus({ preventScroll: true });
    }
    function addMessage(m = {}) {
      const id = m.id !== void 0 && m.id !== null ? String(m.id) : `m${++st.seq}`;
      if (st.messages.has(id)) {
        updateMessage(id, m);
        return id;
      }
      const stick = nearEnd() || m.role === "user";
      const rec2 = { data: { role: "assistant", status: "done", ...m, id }, node: el5("article", "dpi-chatbot__msg", { "data-dpi-chatbot-id": id }) };
      st.messages.set(id, rec2);
      fill2(rec2.node, rec2.data);
      log.insertBefore(rec2.node, typing);
      refreshControls(rec2.node);
      refreshEmpty();
      if (stick) scrollToEnd();
      return id;
    }
    function updateMessage(id, patch = {}) {
      const rec2 = st.messages.get(String(id));
      if (!rec2) return false;
      const stick = nearEnd();
      const next = { ...rec2.data, ...patch, id: rec2.data.id };
      if (patch.text !== void 0 && patch.html === void 0) next.html = void 0;
      if (patch.html !== void 0 && patch.text === void 0) next.text = void 0;
      if ((patch.text !== void 0 || patch.html !== void 0) && patch.nodes === void 0) next.nodes = void 0;
      rec2.data = next;
      fill2(rec2.node, next);
      if (stick) scrollToEnd();
      return true;
    }
    function removeMessage(id) {
      const rec2 = st.messages.get(String(id));
      if (!rec2) return false;
      destroyAll(rec2.node);
      rec2.node.remove();
      st.messages.delete(String(id));
      refreshEmpty();
      return true;
    }
    function clear2() {
      for (const r of st.messages.values()) {
        destroyAll(r.node);
        r.node.remove();
      }
      st.messages.clear();
      setError(null);
      refreshEmpty();
    }
    function setLoading(v) {
      const on = !!v;
      st.loading = on;
      typing.hidden = !on;
      typingLabel.textContent = on ? typeof v === "object" && v.label ? v.label : L.loading : "";
      log.setAttribute("aria-busy", String(on));
      if (on && nearEnd()) scrollToEnd();
    }
    function setError(msg) {
      errorEl.textContent = msg ? String(msg) : "";
      errorEl.hidden = !msg;
    }
    function setDisabled(v) {
      st.disabled = !!v;
      root4.toggleAttribute("data-dpi-disabled", st.disabled);
      ta.disabled = st.disabled;
      composer.querySelectorAll("button").forEach((b) => {
        b.disabled = st.disabled;
      });
      updateSend();
    }
    function updateSend() {
      sendBtn.disabled = st.disabled || !ta.value.trim() && !st.files.length;
    }
    function fit2() {
      if (!panel2.offsetWidth) {
        ta.style.height = "";
        return;
      }
      ta.style.height = "auto";
      const max = parseFloat(getComputedStyle(ta).maxHeight);
      const border = ta.offsetHeight - ta.clientHeight;
      const h = ta.scrollHeight + border;
      const cap = Number.isFinite(max) ? max : Infinity;
      ta.style.height = `${Math.min(h, cap)}px`;
      ta.style.overflowY = h > cap ? "auto" : "hidden";
    }
    function submit(text2, source = "composer") {
      const t = String(text2 ?? "").trim();
      if (st.disabled || !t && !(source === "composer" && st.files.length)) return false;
      const files = source === "composer" ? st.files.slice() : [];
      const messageId = o.echo ? `m${++st.seq}` : null;
      const prevScroll = st.stick;
      if (o.echo) addMessage({ id: messageId, role: "user", text: t, meta: files.length ? files.map((f3) => f3.name).join(", ") : void 0 });
      const ev = new CustomEvent("dpi:chatbot-send", { bubbles: true, cancelable: true, detail: { text: t, files, source, messageId, bot } });
      root4.dispatchEvent(ev);
      if (ev.defaultPrevented) {
        if (messageId) removeMessage(messageId);
        st.stick = prevScroll;
        return false;
      }
      if (source === "composer") {
        ta.value = "";
        st.files = [];
        renderFiles();
        fit2();
      }
      updateSend();
      return true;
    }
    function renderFiles() {
      destroyAll(filesEl);
      filesEl.replaceChildren(...st.files.map((f3, i) => {
        const li = el5("li", "dpi-chatbot__file");
        li.append(Object.assign(el5("span"), { textContent: f3.name }), button2({ label: `${L.removeFile}: ${f3.name}`, icon: "x", attrs: { "data-dpi-chatbot-unfile": String(i) } }));
        return li;
      }));
      filesEl.hidden = !st.files.length;
      refreshControls(filesEl);
      updateSend();
    }
    composer.addEventListener("submit", (e) => {
      e.preventDefault();
      submit(ta.value);
    });
    ta.addEventListener("input", () => {
      fit2();
      updateSend();
    });
    ta.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey && !e.isComposing && !e.ctrlKey && !e.altKey && !e.metaKey && o.enterToSend) {
        e.preventDefault();
        submit(ta.value);
      }
    });
    attachBtn && attachBtn.addEventListener("click", () => fileInput.click());
    fileInput && fileInput.addEventListener("change", () => {
      st.files.push(...fileInput.files);
      fileInput.value = "";
      renderFiles();
    });
    root4.addEventListener("click", (e) => {
      const t = e.target.closest?.("button");
      if (!t || !root4.contains(t) || t === trigger2) return;
      if (t.hasAttribute("data-dpi-chatbot-close")) {
        hide2({ restoreFocus: true });
        return;
      }
      const sug = t.getAttribute("data-dpi-chatbot-suggestion");
      if (sug !== null) {
        submit(sug, "suggestion");
        return;
      }
      const un = t.getAttribute("data-dpi-chatbot-unfile");
      if (un !== null) {
        st.files.splice(+un, 1);
        renderFiles();
        ta.focus();
        return;
      }
      const fb = t.getAttribute("data-dpi-chatbot-fb");
      if (fb !== null) {
        const art = t.closest("[data-dpi-chatbot-id]");
        const id = art?.getAttribute("data-dpi-chatbot-id");
        const rec2 = st.messages.get(id);
        if (!rec2) return;
        const value2 = rec2.data.feedbackValue === +fb ? 0 : +fb;
        updateMessage(id, { feedbackValue: value2 });
        emit(root4, "chatbot-feedback", { messageId: id, value: value2, bot });
        return;
      }
      const act = t.getAttribute("data-dpi-chatbot-act");
      if (act !== null) {
        const art = t.closest("[data-dpi-chatbot-id]");
        emit(root4, "chatbot-action", { id: act, messageId: art ? art.getAttribute("data-dpi-chatbot-id") : null, area: t.getAttribute("data-dpi-chatbot-area"), source: t, bot });
      }
    });
    function showAside(v) {
      const on = v === void 0 ? aside.hidden : !!v;
      if (on === !aside.hidden) return on;
      aside.hidden = !on;
      log.inert = on;
      emptyEl.inert = on;
      if (on) log.setAttribute("aria-hidden", "true");
      else log.removeAttribute("aria-hidden");
      root4.toggleAttribute("data-dpi-aside", on);
      emit(root4, "chatbot-aside", { open: on, bot });
      return on;
    }
    const topRef = () => {
      const t = o.topFrom;
      if (t) {
        try {
          const n = typeof t === "string" ? document.querySelector(t) : t;
          if (n) return n;
        } catch {
        }
      }
      return external && trigger2.isConnected ? trigger2 : null;
    };
    function placeSide(keep = false) {
      if (!external || !trigger2.isConnected) return false;
      const t = trigger2.getBoundingClientRect(), W = document.documentElement.clientWidth;
      const start3 = W >= 576 && t.width > 0 && (keep ? root4.hasAttribute("data-dpi-side-start") : t.left + t.width / 2 < W / 2);
      const x = start3 ? `${Math.round(t.left)}px` : "";
      const had = root4.hasAttribute("data-dpi-side-start"), prev = root4.style.getPropertyValue("--dpi-chatbot-x");
      if (start3 === had && x === prev) return false;
      root4.toggleAttribute("data-dpi-side-start", start3);
      if (start3) root4.style.setProperty("--dpi-chatbot-x", x);
      else root4.style.removeProperty("--dpi-chatbot-x");
      return true;
    }
    function measureTop() {
      const moved = placeSide(!!st.sideDecided);
      st.sideDecided = true;
      const ref = topRef();
      let v = "";
      if (ref) {
        const r = ref.getBoundingClientRect();
        if (r.height > 0 && r.bottom > 0 && r.top < innerHeight / 2) v = `calc(${Math.ceil(r.bottom)}px + var(--dpi-chatbot-gap))`;
      }
      if (v === st.top && !moved) return;
      st.top = v;
      if (v) root4.style.setProperty("--dpi-chatbot-top", v);
      else root4.style.removeProperty("--dpi-chatbot-top");
      st.geo = null;
      if (stateOf4() !== "closed") paintMorph();
    }
    const onTopMove = (e) => {
      if (e && e.target instanceof Node && root4.contains(e.target)) return;
      if (e?.type === "resize") st.sideDecided = false;
      cancelAnimationFrame(st.topRaf);
      st.topRaf = requestAnimationFrame(measureTop);
    };
    function followTrigger(on) {
      st.sideRo?.disconnect();
      st.sideRo = null;
      if (!on || !external || typeof ResizeObserver !== "function") return;
      st.sideRo = new ResizeObserver(() => {
        if (stateOf4() !== "closed" && placeSide(true)) {
          st.geo = null;
          paintMorph();
        }
      });
      for (const n of [trigger2, trigger2.parentElement, trigger2.previousElementSibling]) if (n) st.sideRo.observe(n);
    }
    function bindTop(on) {
      if (!o.topFrom && !external) return;
      const f3 = on ? "addEventListener" : "removeEventListener";
      window[f3]("scroll", onTopMove, { capture: true, passive: true });
      window[f3]("resize", onTopMove, { passive: true });
      if (on) {
        const ref = topRef();
        if (ref && typeof ResizeObserver === "function") {
          st.topRo = new ResizeObserver(onTopMove);
          st.topRo.observe(ref);
        }
        followTrigger(true);
        measureTop();
      } else {
        followTrigger(false);
        st.sideDecided = false;
        st.topRo?.disconnect();
        st.topRo = null;
        cancelAnimationFrame(st.topRaf);
        st.top = "";
        root4.style.removeProperty("--dpi-chatbot-top");
        root4.removeAttribute("data-dpi-side-start");
        root4.style.removeProperty("--dpi-chatbot-x");
      }
    }
    function measureTrigger() {
      if (external) return;
      const h = Math.ceil(trigger2.offsetHeight);
      if (h > 0) root4.style.setProperty("--dpi-chatbot-trig-h", `${h}px`);
    }
    function syncViewport() {
      const vv = globalThis.visualViewport;
      let kb = 0, top = 0;
      if (vv && vv.scale <= 1.01) {
        kb = Math.max(0, innerHeight - vv.height - vv.offsetTop);
        top = vv.offsetTop;
      }
      const typingKb = kb > 80 && root4.contains(document.activeElement);
      root4.toggleAttribute("data-dpi-kb", typingKb);
      if (typingKb) {
        root4.style.setProperty("--dpi-chatbot-kb", `${Math.round(kb)}px`);
        root4.style.setProperty("--dpi-chatbot-vt", `${Math.round(top)}px`);
      } else {
        root4.style.removeProperty("--dpi-chatbot-kb");
        root4.style.removeProperty("--dpi-chatbot-vt");
      }
      st.geo = null;
      if (stateOf4() !== "closed") paintMorph();
    }
    const onViewport = () => {
      cancelAnimationFrame(st.raf);
      st.raf = requestAnimationFrame(syncViewport);
    };
    function bindViewport(on) {
      const vv = globalThis.visualViewport;
      const f3 = on ? "addEventListener" : "removeEventListener";
      vv?.[f3]("resize", onViewport);
      vv?.[f3]("scroll", onViewport);
      window[f3]("resize", onViewport);
      root4[f3]("focusin", onViewport);
      root4[f3]("focusout", onViewport);
      if (on) {
        st.ro = typeof ResizeObserver === "function" ? new ResizeObserver(() => {
          if (st.stick && isOpenish2()) log.scrollTop = log.scrollHeight;
        }) : null;
        st.ro?.observe(log);
      } else {
        st.ro?.disconnect();
        st.ro = null;
      }
    }
    function refreshGeo() {
      const p = panel2.getBoundingClientRect();
      const t = trigger2.getBoundingClientRect();
      st.geo = {
        source: { x: t.left, y: t.top, w: t.width, h: t.height },
        target: {
          x: p.left,
          y: p.top,
          w: p.width,
          h: p.height,
          r: parseFloat(getComputedStyle(panel2).borderTopLeftRadius) || 28
        }
      };
      return st.geo;
    }
    function svgEl(tag, attrs = {}) {
      const n = document.createElementNS(NS5, tag);
      for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
      return n;
    }
    function ensureSurface() {
      if (st.surface) return st.surface;
      const id = `${panel2.id}-morph`;
      const svg2 = svgEl("svg", { class: "dpi-chatbot__surface", "aria-hidden": "true", focusable: "false" });
      const defs = svgEl("defs");
      const gradient = svgEl("radialGradient", { id: `${id}-fill`, gradientUnits: "userSpaceOnUse", cx: "0", cy: "0", r: "1" });
      gradient.append(
        svgEl("stop", { offset: "0", "stop-color": "var(--dpi-menu-hi)" }),
        svgEl("stop", { offset: "0.58", "stop-color": "var(--dpi-menu-bg)" }),
        svgEl("stop", { offset: "1", "stop-color": "var(--dpi-menu-lo)" })
      );
      const filter = svgEl("filter", { id: `${id}-shadow`, x: "-50%", y: "-50%", width: "200%", height: "200%" });
      filter.append(svgEl("feGaussianBlur", { stdDeviation: "8" }), svgEl("feOffset", { dy: "5" }));
      defs.append(gradient, filter);
      const shadow = svgEl("path", { class: "dpi-chatbot__surface-shadow", filter: `url(#${id}-shadow)` });
      const fill3 = svgEl("path", { class: "dpi-chatbot__surface-fill", fill: `url(#${id}-fill)` });
      const rim = svgEl("path", { class: "dpi-chatbot__surface-rim" });
      svg2.append(defs, shadow, fill3, rim);
      panel2.prepend(svg2);
      st.surface = { svg: svg2, gradient, shadow, fill: fill3, rim };
      return st.surface;
    }
    function destroySurface() {
      st.surface?.svg.remove();
      st.surface = null;
    }
    function paintMorph() {
      if (panel2.hidden) return;
      const geo = st.geo || refreshGeo();
      const { target: target2 } = geo;
      if (!target2.w || !target2.h) return;
      const tr = trigger2.getBoundingClientRect();
      const source = geo.source = { x: tr.left, y: tr.top, w: tr.width, h: tr.height };
      const surface = ensureSurface();
      const W = document.documentElement.clientWidth, H = innerHeight;
      surface.svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
      surface.svg.style.width = `${W}px`;
      surface.svg.style.height = `${H}px`;
      surface.gradient.setAttribute("gradientTransform", `translate(${target2.x + target2.w / 2} ${target2.y + target2.h * 0.3}) scale(${target2.w * 1.3} ${target2.h * 1.5})`);
      const p = chatbotFrame(source, target2, st.morphU);
      surface.fill.setAttribute("d", p.fill);
      surface.shadow.setAttribute("d", p.fill);
      surface.rim.setAttribute("d", p.stroke);
      const room = p.grow > 0 && p.w >= Math.min(200, target2.w) && p.h >= Math.min(160, target2.h);
      inner.style.visibility = room ? "" : "hidden";
      inner.style.clipPath = `path('${roundedPath2({
        x: p.x - target2.x + 2,
        y: p.y - target2.y + 2,
        w: Math.max(0, p.w - 4),
        h: Math.max(0, p.h - 4),
        r: Math.max(0, p.r - 2)
      })}')`;
      inner.style.removeProperty("opacity");
      inner.style.removeProperty("translate");
      root4.toggleAttribute("data-dpi-chatbot-visible", st.morphU >= 0.995);
    }
    function focusPending2() {
      if (!st.focus || !isOpenish2()) return;
      st.focus = null;
      if (finePointer()) ta.focus({ preventScroll: true });
      else panel2.focus({ preventScroll: true });
    }
    function finishOpen2() {
      root4.dataset.dpiState = "open";
      panel2.inert = false;
      paintMorph();
      focusPending2();
      scrollToEnd();
    }
    function finishClosed2() {
      panel2.hidden = true;
      panel2.inert = true;
      root4.dataset.dpiState = "closed";
      root4.removeAttribute("data-dpi-chatbot-visible");
      inner.style.removeProperty("clip-path");
      inner.style.removeProperty("visibility");
      st.focus = null;
      st.geo = null;
      bindViewport(false);
      bindTop(false);
      root4.style.removeProperty("--dpi-chatbot-kb");
      root4.style.removeProperty("--dpi-chatbot-vt");
      root4.removeAttribute("data-dpi-kb");
    }
    function morphTick(now) {
      st.morphRaf = 0;
      let dt = Math.min(0.05, Math.max(0, (now - st.morphLast) / 1e3));
      st.morphLast = now;
      while (dt > 1e-6) {
        const step = Math.min(dt, 1 / 240);
        const wanted2 = Math.sign(st.morphTarget - st.morphU) * MORPH_SPEED;
        const acceleration = Math.max(-MORPH_ACCEL * step, Math.min(MORPH_ACCEL * step, wanted2 - st.morphV));
        st.morphV += acceleration;
        const next = st.morphU + st.morphV * step;
        if ((st.morphTarget - st.morphU) * (st.morphTarget - next) <= 0) {
          st.morphU = st.morphTarget;
          st.morphV = 0;
          break;
        }
        st.morphU = Math.max(0, Math.min(1, next));
        if (next < 0 || next > 1) st.morphV = 0;
        dt -= step;
      }
      const settled = st.morphU === st.morphTarget && st.morphV === 0;
      paintMorph();
      if (!settled) st.morphRaf = requestAnimationFrame(morphTick);
      else if (st.morphTarget === 1) finishOpen2();
      else finishClosed2();
    }
    function animateTo(target2) {
      st.morphTarget = target2;
      if (reduced11()) {
        cancelAnimationFrame(st.morphRaf);
        st.morphRaf = 0;
        st.morphU = target2;
        st.morphV = 0;
        paintMorph();
        if (target2) finishOpen2();
        else finishClosed2();
      } else if (!st.morphRaf) {
        st.morphLast = performance.now();
        st.morphRaf = requestAnimationFrame(morphTick);
      }
    }
    function show3({ focus = true } = {}) {
      if (isOpenish2()) return;
      const wasClosed = stateOf4() === "closed";
      st.focus = focus ? "auto" : null;
      inner.style.visibility = "hidden";
      panel2.hidden = false;
      panel2.inert = true;
      fit2();
      trigger2.setAttribute("aria-expanded", "true");
      if (wasClosed) {
        st.morphU = 0;
        st.morphV = 0;
        measureTrigger();
        bindViewport(true);
        bindTop(true);
        syncViewport();
        refreshGeo();
      }
      root4.dataset.dpiState = "opening";
      paintMorph();
      animateTo(1);
      emit(root4, "chatbot-open", { bot });
    }
    function hide2({ restoreFocus: restoreFocus2 = false } = {}) {
      if (!isOpenish2()) return;
      trigger2.setAttribute("aria-expanded", "false");
      st.focus = null;
      if (restoreFocus2 || panel2.contains(document.activeElement)) trigger2.focus({ preventScroll: true });
      root4.dataset.dpiState = "closing";
      panel2.inert = true;
      animateTo(0);
      emit(root4, "chatbot-close", { bot });
    }
    const toggle2 = () => isOpenish2() ? hide2({ restoreFocus: false }) : show3();
    const onTriggerClick = (e) => {
      e.preventDefault();
      if (!isOpenish2()) show3();
      else hide2({ restoreFocus: true });
    };
    trigger2.addEventListener("click", onTriggerClick);
    root4.addEventListener("keydown", (e) => {
      if (e.key !== "Escape" || !isOpenish2() || e.defaultPrevented) return;
      e.preventDefault();
      e.stopPropagation();
      if (!aside.hidden) {
        showAside(false);
        return;
      }
      hide2({ restoreFocus: true });
    });
    const onDocKey = (e) => {
      if (e.key !== "Escape" || e.defaultPrevented || !isOpenish2() || root4.contains(e.target)) return;
      const a = document.activeElement;
      if (a && a !== document.body && a !== document.documentElement) return;
      e.preventDefault();
      if (!aside.hidden) {
        showAside(false);
        return;
      }
      hide2({ restoreFocus: true });
    };
    document.addEventListener("keydown", onDocKey);
    const onExternal = (e) => {
      const t = e.target.closest?.("[data-dpi-chatbot-trigger-for]");
      if (!t || t === trigger2 || !root4.id || t.getAttribute("data-dpi-chatbot-trigger-for") !== root4.id) return;
      e.preventDefault();
      if (isOpenish2()) hide2({ restoreFocus: false });
      else show3();
    };
    document.addEventListener("click", onExternal);
    const onResize = () => {
      st.geo = null;
      measureTrigger();
      if (stateOf4() !== "closed") {
        fit2();
        paintMorph();
      }
    };
    addEventListener("resize", onResize, { passive: true });
    function destroy() {
      removeEventListener("resize", onResize);
      bindViewport(false);
      bindTop(false);
      cancelAnimationFrame(st.morphRaf);
      cancelAnimationFrame(st.raf);
      trigger2.removeEventListener("click", onTriggerClick);
      destroySurface();
      destroyAll(root4);
      root4.removeAttribute("data-dpi-chatbot-internal");
      root4.style.removeProperty("--dpi-chatbot-trig-h");
      document.removeEventListener("keydown", onDocKey);
      document.removeEventListener("click", onExternal);
      if (!external) get(trigger2)?.destroy?.();
      else {
        trigger2.classList.remove("dpi-chatbot-trigger");
        trigger2.removeAttribute("data-dpi-chatbot-external");
        trigger2.removeAttribute("aria-expanded");
        trigger2.removeAttribute("aria-controls");
      }
      instances.delete(root4);
      root4.replaceChildren();
    }
    const bot = {
      el: root4,
      trigger: trigger2,
      external,
      panel: panel2,
      log,
      textarea: ta,
      open: show3,
      close: (opts2) => hide2(opts2),
      toggle: toggle2,
      isOpen: isOpen4,
      addMessage,
      updateMessage,
      removeMessage,
      clear: clear2,
      getMessage: (id) => {
        const r = st.messages.get(String(id));
        return r ? { ...r.data } : null;
      },
      setLoading,
      setError,
      setDisabled,
      setSuggestions,
      setHeader,
      setHeaderActions,
      setTools,
      slot: (name) => ({ "header-actions": headerSlot, above, aside, empty: emptyEl })[name] || null,
      showAside,
      toggleAside: () => showAside(),
      isAsideOpen: () => !aside.hidden,
      getValue: () => ta.value,
      setValue: (t) => {
        ta.value = String(t ?? "");
        fit2();
        updateSend();
      },
      focus: () => {
        if (stateOf4() !== "open") {
          st.focus = "auto";
          if (!isOpenish2()) show3();
        } else ta.focus({ preventScroll: true });
      },
      scrollToEnd,
      send: (text2) => submit(text2, "api"),
      destroy
    };
    instances.set(root4, bot);
    setHeader({ title: o.title || L.title, subtitle: o.subtitle });
    setHeaderActions(o.headerActions);
    setTools(o.tools);
    setSuggestions(o.suggestions);
    refreshEmpty();
    updateSend();
    panel2.inert = true;
    if (o.open) show3({ focus: false });
    return bot;
  }
  var get4 = (el6) => instances.get(el6) || null;
  function init10(root4 = document) {
    if (root4.matches?.("[data-dpi-chatbot]") && !instances.has(root4)) mount(root4);
    root4.querySelectorAll("[data-dpi-chatbot]").forEach((n) => {
      if (!instances.has(n)) mount(n);
    });
  }

  // dpi/js/overflow.js
  var overflow_exports = {};
  __export(overflow_exports, {
    init: () => init11
  });
  var recs = ownedMap();
  var live2 = /* @__PURE__ */ new Set();
  var num = (v) => parseFloat(v) || 0;
  var label = (el6) => (el6.textContent || "").replace(/\s+/g, " ").trim();
  function build2(isNav, name) {
    const wrap = document.createElement(isNav ? "li" : "div");
    wrap.className = `dpi-dropdown dpi-dropdown--end dpi-overflow${isNav ? " dpi-nav__item" : ""}`;
    wrap.setAttribute("data-dpi-dropdown", isNav ? "nav" : "actions");
    if (!isNav) wrap.setAttribute("role", "none");
    wrap.hidden = true;
    const trigger2 = document.createElement("button");
    trigger2.type = "button";
    trigger2.className = `${isNav ? "dpi-nav__link" : "dpi-tabs__tab"} dpi-overflow__more`;
    trigger2.setAttribute("data-dpi-dropdown-trigger", "");
    const text2 = document.createElement("span");
    text2.className = "dpi-overflow__label";
    text2.textContent = name;
    const sr = document.createElement("span");
    sr.className = "dpi-visually-hidden";
    trigger2.append(text2, sr);
    const panel2 = document.createElement("div");
    panel2.className = "dpi-menu dpi-overflow__menu";
    panel2.setAttribute("data-dpi-dropdown-panel", "");
    const ul = document.createElement("ul");
    ul.className = "dpi-menu__list";
    panel2.append(ul);
    wrap.append(trigger2, panel2);
    return { wrap, trigger: trigger2, sr, ul };
  }
  function setup15(root4) {
    if (recs.has(root4)) return;
    const isTabs = root4.hasAttribute("data-dpi-tabs");
    const isNav = !isTabs && root4.hasAttribute("data-dpi-nav");
    if (!isTabs && !isNav) return;
    if (isNav && root4.classList.contains("dpi-nav--stack")) return;
    const list = isTabs ? root4.querySelector('[role="tablist"]') : root4.querySelector(".dpi-nav__list");
    if (!list) return;
    const parts4 = build2(isNav, root4.getAttribute("data-dpi-overflow-label") || "Altro");
    const rec2 = { root: root4, list, isNav, ...parts4, items: [], over: [], k: -1, w: [], moreW: 0, gap: 0, dirty: true, busy: false, entries: /* @__PURE__ */ new WeakMap(), back: /* @__PURE__ */ new WeakMap() };
    recs.set(root4, rec2);
    live2.add(new WeakRef(rec2));
    list.append(rec2.wrap);
    setup2(rec2.wrap);
    rec2.wrap.addEventListener("click", (e) => {
      const b = e.target.closest?.(".dpi-menu__item");
      const it = b && rec2.back.get(b);
      if (it && !isNav && !it.disabled) it.click();
    });
    if (isTabs) rec2.trigger.addEventListener("keydown", (e) => {
      const rtl2 = getComputedStyle(root4).direction === "rtl";
      if (e.key !== (rtl2 ? "ArrowRight" : "ArrowLeft")) return;
      const vis = rec2.items.filter((t) => !t.hidden && !t.disabled);
      if (vis.length) {
        e.preventDefault();
        vis[vis.length - 1].focus();
      }
    });
    root4.addEventListener("dpi:tab", () => sync6(rec2));
    rec2.ro = new ResizeObserver(() => layout2(rec2));
    rec2.ro.observe(root4);
    rec2.mo = new MutationObserver((records2) => {
      let dirty = false, state3 = false;
      for (const r of records2) {
        if (r.target === rec2.wrap || rec2.wrap.contains(r.target)) continue;
        if (r.type === "childList" && r.target === list && [...r.addedNodes, ...r.removedNodes].every((n) => n === rec2.wrap)) continue;
        if (r.type === "attributes") state3 = true;
        else dirty = true;
      }
      if (dirty) {
        rec2.dirty = true;
        layout2(rec2);
      } else if (state3) sync6(rec2);
    });
    rec2.mo.observe(list, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ["aria-selected", "aria-current", "disabled", "aria-disabled"] });
    layout2(rec2);
  }
  var collect3 = (rec2) => {
    const { list, wrap, isNav } = rec2;
    if (!isNav) return [...list.querySelectorAll('[role="tab"]')];
    return [...list.children].filter((el6) => el6 !== wrap && el6.querySelector("a[href]"));
  };
  var linkOf = (rec2, it) => rec2.isNav ? it.querySelector("a[href]") : it;
  var isActive = (rec2, it) => rec2.isNav ? !["", "false", null].includes(linkOf(rec2, it).getAttribute("aria-current")) : it.getAttribute("aria-selected") === "true";
  function entry(rec2, it) {
    let e = rec2.entries.get(it);
    if (e) return e;
    const li = document.createElement("li");
    const b = document.createElement(rec2.isNav ? "a" : "button");
    b.className = "dpi-menu__item";
    if (!rec2.isNav) {
      li.setAttribute("role", "none");
      b.type = "button";
      b.setAttribute("role", "menuitemradio");
      b.tabIndex = -1;
    }
    const text2 = document.createElement("span");
    text2.className = "dpi-menu__label";
    b.append(text2);
    li.append(b);
    e = { li, b, text: text2 };
    rec2.entries.set(it, e);
    rec2.back.set(b, it);
    return e;
  }
  function measure2(rec2, items2) {
    rec2.wrap.hidden = false;
    for (const it of items2) it.hidden = false;
    rec2.w = items2.map((it) => it.getBoundingClientRect().width);
    rec2.moreW = rec2.wrap.getBoundingClientRect().width;
    rec2.gap = num(getComputedStyle(rec2.list).columnGap);
    rec2.items = items2;
    rec2.dirty = false;
  }
  function available(rec2) {
    const p = rec2.list.parentElement;
    const pc = getComputedStyle(p), lc = getComputedStyle(rec2.list);
    return p.getBoundingClientRect().width - num(pc.paddingLeft) - num(pc.paddingRight) - num(pc.borderLeftWidth) - num(pc.borderRightWidth) - num(lc.marginLeft) - num(lc.marginRight) - num(lc.paddingLeft) - num(lc.paddingRight) - num(lc.borderLeftWidth) - num(lc.borderRightWidth) - 1;
  }
  function fit(rec2, avail) {
    const { w, gap, moreW } = rec2;
    const n = w.length;
    if (w.reduce((a, b) => a + b, 0) + gap * Math.max(0, n - 1) <= avail) return n;
    let used = moreW, k = 0;
    for (; k < n; k++) {
      const add = w[k] + gap;
      if (used + add > avail) break;
      used += add;
    }
    return k;
  }
  function layout2(rec2) {
    if (rec2.busy) return;
    const { root: root4, list, wrap } = rec2;
    if (!root4.isConnected || root4.getClientRects().length === 0) return;
    rec2.busy = true;
    try {
      if (list.lastElementChild !== wrap) list.append(wrap);
      const items2 = collect3(rec2);
      if (rec2.dirty || items2.length !== rec2.items.length || items2.some((it, i) => it !== rec2.items[i])) {
        rec2.dirty = true;
        measure2(rec2, items2);
      }
      const n = items2.length;
      const k = fit(rec2, available(rec2));
      const ae = document.activeElement;
      const lost = ae && items2.slice(k).some((it) => it === ae || it.contains(ae));
      wrap.hidden = k >= n;
      items2.forEach((it, i) => {
        if (it.hidden !== i >= k) it.hidden = i >= k;
      });
      if (k >= n && wrap.dataset.dpiState && wrap.dataset.dpiState !== "closed") hide(wrap);
      if (lost) rec2.trigger.focus({ preventScroll: true });
      const over = items2.slice(k);
      if (over.length !== rec2.over.length || over.some((it, i) => it !== rec2.over[i])) rec2.ul.replaceChildren(...over.map((it) => entry(rec2, it).li));
      const changed = k !== rec2.k || over.some((it, i) => it !== rec2.over[i]);
      rec2.over = over;
      rec2.k = k;
      sync6(rec2);
      if (changed) emit(root4, "overflow", { visible: k, total: n, hidden: over.map(label) });
    } finally {
      rec2.busy = false;
    }
  }
  function sync6(rec2) {
    const { items: items2, over } = rec2;
    let current3 = null;
    for (const it of over) {
      const e = entry(rec2, it);
      const t = label(it);
      if (e.text.textContent !== t) e.text.textContent = t;
      const on = isActive(rec2, it);
      if (on) current3 = it;
      if (rec2.isNav) {
        const a = linkOf(rec2, it);
        for (const attr3 of ["href", "target", "rel"]) {
          const v = a.getAttribute(attr3);
          if (v === null) e.b.removeAttribute(attr3);
          else if (e.b.getAttribute(attr3) !== v) e.b.setAttribute(attr3, v);
        }
        if (on) e.b.setAttribute("aria-current", a.getAttribute("aria-current"));
        else e.b.removeAttribute("aria-current");
        if (a.getAttribute("aria-disabled") === "true") e.b.setAttribute("aria-disabled", "true");
        else e.b.removeAttribute("aria-disabled");
      } else {
        e.b.setAttribute("aria-checked", String(on));
        e.b.disabled = it.disabled;
      }
    }
    rec2.trigger.toggleAttribute("data-dpi-overflow-active", !!current3);
    if (current3) rec2.trigger.setAttribute("aria-current", "true");
    else rec2.trigger.removeAttribute("aria-current");
    const sr = current3 ? `: ${label(current3)}` : "";
    if (rec2.sr.textContent !== sr) rec2.sr.textContent = sr;
    if (!rec2.isNav) {
      const vis = items2.filter((t) => !t.hidden);
      const active2 = vis.find((t) => t.getAttribute("aria-selected") === "true") || (items2.some((t) => t.getAttribute("aria-selected") === "true") ? vis.find((t) => !t.disabled) : null);
      if (active2) for (const t of vis) {
        const want2 = t === active2 ? 0 : -1;
        if (t.tabIndex !== want2) t.tabIndex = want2;
      }
    }
  }
  var bound16 = false;
  function bindGlobal2() {
    if (bound16) return;
    bound16 = true;
    const all = (dirty) => {
      for (const ref of [...live2]) {
        const rec2 = ref.deref();
        if (!rec2) {
          live2.delete(ref);
          continue;
        }
        if (dirty) rec2.dirty = true;
        layout2(rec2);
      }
    };
    addEventListener("orientationchange", () => all(false));
    if (document.fonts) {
      document.fonts.ready.then(() => all(true));
      document.fonts.addEventListener?.("loadingdone", () => all(true));
    }
  }
  function init11(root4 = document) {
    if (typeof ResizeObserver === "undefined" || typeof MutationObserver === "undefined") return;
    if (root4.matches?.("[data-dpi-overflow]")) setup15(root4);
    root4.querySelectorAll("[data-dpi-overflow]").forEach(setup15);
    bindGlobal2();
  }

  // dpi/js/diff.js
  var diff_exports = {};
  __export(diff_exports, {
    clear: () => clear,
    init: () => init12,
    select: () => select,
    selection: () => selection
  });
  var sel = ownedMap();
  var scrolled = /* @__PURE__ */ new WeakSet();
  var bound17 = false;
  var rowsOf = (d) => [...d.querySelectorAll(":scope > .dpi-diff__row[data-dpi-diff-line]")];
  var pathOf = (row) => row.getAttribute("data-dpi-diff-path") || "";
  var lineOf = (row) => +row.getAttribute("data-dpi-diff-line") || 0;
  function paint3(d, s) {
    for (const row of rowsOf(d)) {
      const on = !!s && pathOf(row) === s.path && lineOf(row) >= s.from && lineOf(row) <= s.to;
      row.classList.toggle("dpi-diff__row--selected", on);
      row.querySelector("[data-dpi-diff-pick]")?.setAttribute("aria-pressed", on ? "true" : "false");
    }
  }
  function place4(d, s) {
    const panel2 = d.querySelector(":scope > [data-dpi-diff-panel]");
    if (!panel2) return null;
    if (!s) {
      panel2.hidden = true;
      return panel2;
    }
    const last = rowsOf(d).filter((r) => pathOf(r) === s.path && lineOf(r) === s.to).pop();
    if (last) {
      let at = last;
      while (at.nextElementSibling && at.nextElementSibling.classList.contains("dpi-diff__notes")) at = at.nextElementSibling;
      if (at.nextElementSibling !== panel2) at.after(panel2);
    }
    panel2.hidden = false;
    return panel2;
  }
  function select(d, path, from, to, anchor) {
    const s = from ? { path: path || "", anchor: anchor || from, from: Math.min(from, to || from), to: Math.max(from, to || from) } : null;
    if (s) sel.set(d, s);
    else sel.delete(d);
    paint3(d, s);
    const panel2 = place4(d, s);
    emit(d, "diff-select", { diff: d, path: s ? s.path : "", from: s ? s.from : 0, to: s ? s.to : 0, panel: panel2 });
  }
  var clear = (d) => select(d, "", 0);
  var selection = (d) => {
    const s = sel.get(d);
    return s ? { path: s.path, from: s.from, to: s.to } : null;
  };
  function onClick3(e) {
    const btn = e.target.closest?.("[data-dpi-diff-pick]");
    if (!btn) return;
    const row = btn.closest(".dpi-diff__row[data-dpi-diff-line]"), d = row?.closest("[data-dpi-diff]");
    if (!d || row.parentElement !== d) return;
    const path = pathOf(row), n = lineOf(row), cur2 = sel.get(d);
    if (e.shiftKey && cur2 && cur2.path === path) select(d, path, Math.min(cur2.anchor, n), Math.max(cur2.anchor, n), cur2.anchor);
    else if (cur2 && cur2.path === path && cur2.from === n && cur2.to === n) clear(d);
    else select(d, path, n, n, n);
  }
  function onKey3(e) {
    if (e.key !== "Escape") return;
    const d = e.target.closest?.("[data-dpi-diff]");
    if (d && sel.has(d) && !e.defaultPrevented && !e.target.closest("dialog,[data-dpi-dropdown-panel]")) clear(d);
  }
  function init12(root4 = document) {
    if (!bound17) {
      bound17 = true;
      document.addEventListener("click", onClick3);
      document.addEventListener("keydown", onKey3);
    }
    const all = root4.matches?.("[data-dpi-diff]") ? [root4] : [...root4.querySelectorAll("[data-dpi-diff]")];
    for (const d of all) {
      const f3 = d.querySelector(":scope > [data-dpi-diff-focus]");
      if (f3 && !scrolled.has(d)) {
        scrolled.add(d);
        requestAnimationFrame(() => f3.scrollIntoView({ block: "center" }));
      }
    }
  }

  // dpi/js/colorpicker.js
  var colorpicker_exports = {};
  __export(colorpicker_exports, {
    init: () => init13,
    normalize: () => normalize2,
    sync: () => sync7
  });
  var DEFAULTS2 = ["#2563eb", "#7c3aed", "#db2777", "#dc2626", "#ea580c", "#d97706", "#65a30d", "#16a34a", "#0d9488", "#0891b2", "#475569", "#111827"];
  var clamp10 = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
  var mk2 = (tag, cls, attrs) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    for (const [k, v] of Object.entries(attrs || {})) if (v !== void 0 && v !== false) e.setAttribute(k, v === true ? "" : String(v));
    return e;
  };
  var reg = ownedMap();
  function normalize2(s) {
    const t = String(s ?? "").trim().replace(/^#/, "").toLowerCase();
    if (/^[0-9a-f]{6}$/.test(t)) return "#" + t;
    if (/^[0-9a-f]{3}$/.test(t)) return "#" + t.split("").map((c) => c + c).join("");
    return null;
  }
  function hexToHsv(hex) {
    const n = parseInt(hex.slice(1), 16);
    const r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d) h = max === r ? (g - b) / d % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: (Math.round(h * 60) + 360) % 360, s: max ? d / max : 0, v: max };
  }
  function hsvToHex({ h, s, v }) {
    const f3 = (n) => {
      const k = (n + h / 60) % 6;
      return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
    };
    return "#" + [f3(5), f3(3), f3(1)].map((x) => Math.round(x * 255).toString(16).padStart(2, "0")).join("");
  }
  function setup16(root4) {
    if (reg.has(root4)) return reg.get(root4);
    const hexEl = root4.querySelector(".dpi-colorpicker__hex");
    if (!hexEl) return null;
    const clearable = root4.hasAttribute("data-dpi-colorpicker-clearable");
    const colors = (root4.getAttribute("data-dpi-colors") || "").split(/[\s,]+/).map(normalize2).filter(Boolean);
    const palette = colors.length ? colors : DEFAULTS2;
    let hsv = { h: 210, s: 0.8, v: 0.9 };
    let busy2 = false;
    const swatch = mk2("button", "dpi-colorpicker__swatch", { type: "button", "aria-haspopup": "dialog", "aria-expanded": "false", title: "Scegli il colore" });
    const chip = mk2("span", "dpi-colorpicker__chip", { "aria-hidden": "true" });
    const lbl = mk2("span", "dpi-visually-hidden");
    lbl.textContent = "Scegli il colore";
    swatch.append(chip, lbl);
    root4.prepend(swatch);
    const panel2 = mk2("div", "dpi-popover__panel dpi-colorpicker__panel", { popover: "auto", role: "dialog", "aria-label": "Scelta del colore" });
    const pal = mk2("div", "dpi-colorpicker__palette", { role: "group", "aria-label": "Tavolozza" });
    const sws = palette.map((c) => {
      const b = mk2("button", "dpi-colorpicker__sw", { type: "button", "aria-pressed": "false", "aria-label": c, title: c, "data-color": c });
      b.style.setProperty("--dpi-cp", c);
      pal.append(b);
      return b;
    });
    const area = mk2("div", "dpi-colorpicker__area", { role: "slider", tabindex: "0", "aria-label": "Saturazione e luminosità", "aria-valuemin": "0", "aria-valuemax": "100" });
    const knob = mk2("span", "dpi-colorpicker__knob", { "aria-hidden": "true" });
    area.append(knob);
    const hue = mk2("input", "dpi-colorpicker__hue", { type: "range", min: "0", max: "360", step: "1", "aria-label": "Tonalità" });
    const custom = mk2("div", "dpi-colorpicker__custom");
    custom.append(area, hue);
    const clear2 = clearable ? mk2("button", "dpi-btn dpi-btn--sm dpi-colorpicker__clear", { type: "button" }) : null;
    if (clear2) clear2.textContent = "Nessun colore";
    panel2.append(pal, custom);
    if (clear2) panel2.append(clear2);
    root4.append(panel2);
    const current3 = () => normalize2(hexEl.value);
    function paint4() {
      const c = current3();
      if (c) {
        chip.style.setProperty("--dpi-cp", c);
        root4.removeAttribute("data-dpi-empty");
      } else {
        chip.style.removeProperty("--dpi-cp");
        root4.setAttribute("data-dpi-empty", "");
      }
      sws.forEach((b) => b.setAttribute("aria-pressed", String(!!c && b.dataset.color === c)));
      if (c) hsv = (() => {
        const n = hexToHsv(c);
        return { h: n.s === 0 || n.v === 0 ? hsv.h : n.h, s: n.s, v: n.v };
      })();
      panel2.style.setProperty("--dpi-cp-hue", String(hsv.h));
      knob.style.setProperty("--dpi-x", `${(hsv.s * 100).toFixed(1)}%`);
      knob.style.setProperty("--dpi-y", `${((1 - hsv.v) * 100).toFixed(1)}%`);
      hue.value = String(Math.round(hsv.h));
      area.setAttribute("aria-valuenow", String(Math.round(hsv.s * 100)));
      area.setAttribute("aria-valuetext", `saturazione ${Math.round(hsv.s * 100)}%, luminosità ${Math.round(hsv.v * 100)}%`);
      swatch.title = c ? `Colore ${c}: scegli il colore` : "Nessun colore: scegli il colore";
      hexEl.setAttribute("aria-invalid", hexEl.value && !c ? "true" : "false");
    }
    function commit(value2) {
      if (busy2) return;
      busy2 = true;
      hexEl.value = value2;
      fire(hexEl);
      emit(root4, "colorpicker-change", { value: value2 });
      busy2 = false;
      paint4();
    }
    const fromHsv = () => commit(hsvToHex(hsv));
    hexEl.addEventListener("input", () => {
      if (!busy2) paint4();
    });
    hexEl.addEventListener("change", () => {
      if (busy2) return;
      const n = normalize2(hexEl.value);
      if (n && n !== hexEl.value) hexEl.value = n;
      if (!n && !hexEl.value && !clearable) hexEl.setCustomValidity("");
      paint4();
    });
    pal.addEventListener("click", (e) => {
      const b = e.target.closest(".dpi-colorpicker__sw");
      if (b) commit(b.dataset.color);
    });
    pal.addEventListener("keydown", (e) => {
      const i = sws.indexOf(document.activeElement);
      if (i < 0) return;
      const cols = Math.max(1, Math.round(pal.clientWidth / (sws[0].offsetWidth + 8))) || 6;
      const to = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + cols, ArrowUp: i - cols, Home: 0, End: sws.length - 1 }[e.key];
      if (to === void 0) return;
      e.preventDefault();
      sws[clamp10(to, 0, sws.length - 1)].focus();
    });
    const place5 = (e) => {
      const r = area.getBoundingClientRect();
      hsv = { ...hsv, s: clamp10((e.clientX - r.left) / r.width), v: 1 - clamp10((e.clientY - r.top) / r.height) };
      fromHsv();
    };
    area.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      area.focus({ preventScroll: true });
      try {
        area.setPointerCapture(e.pointerId);
      } catch {
      }
      area.dataset.dpiDrag = "";
      place5(e);
    });
    area.addEventListener("pointermove", (e) => {
      if (area.hasAttribute("data-dpi-drag")) place5(e);
    });
    const endDrag = () => area.removeAttribute("data-dpi-drag");
    area.addEventListener("pointerup", endDrag);
    area.addEventListener("pointercancel", endDrag);
    area.addEventListener("lostpointercapture", endDrag);
    area.addEventListener("keydown", (e) => {
      const step = e.shiftKey ? 0.1 : 0.01;
      const d = { ArrowRight: [step, 0], ArrowLeft: [-step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
      if (!d) return;
      e.preventDefault();
      hsv = { ...hsv, s: clamp10(hsv.s + d[0]), v: clamp10(hsv.v + d[1]) };
      fromHsv();
    });
    hue.addEventListener("input", () => {
      hsv = { ...hsv, h: Number(hue.value) };
      fromHsv();
    });
    clear2?.addEventListener("click", () => {
      commit("");
      panel2.hidePopover?.();
    });
    track2(panel2, swatch, {
      onOpen() {
        swatch.setAttribute("aria-expanded", "true");
        paint4();
        (sws.find((b) => b.getAttribute("aria-pressed") === "true") || sws[0] || area).focus({ preventScroll: true });
      },
      onClose() {
        swatch.setAttribute("aria-expanded", "false");
        if (panel2.contains(document.activeElement) || document.activeElement === document.body) swatch.focus({ preventScroll: true });
      }
    });
    swatch.addEventListener("click", () => {
      if (hexEl.disabled) return;
      if (panel2.matches(":popover-open")) panel2.hidePopover();
      else panel2.showPopover();
    });
    swatch.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" && e.altKey && !hexEl.disabled) {
        e.preventDefault();
        if (!panel2.matches(":popover-open")) panel2.showPopover();
      }
    });
    const syncDisabled = () => {
      swatch.disabled = hexEl.disabled;
      if (hexEl.disabled && panel2.matches(":popover-open")) panel2.hidePopover();
      root4.toggleAttribute("data-dpi-disabled", hexEl.disabled);
    };
    new MutationObserver(syncDisabled).observe(hexEl, { attributes: true, attributeFilter: ["disabled"] });
    hexEl.form?.addEventListener("reset", () => setTimeout(paint4, 0));
    syncDisabled();
    paint4();
    const rec2 = { root: root4, input: hexEl, sync: paint4 };
    reg.set(root4, rec2);
    return rec2;
  }
  var sync7 = (root4) => {
    const r = typeof root4 === "string" ? document.querySelector(root4) : root4;
    (reg.get(r) || setup16(r))?.sync();
  };
  function init13(root4 = document) {
    if (root4.matches?.("[data-dpi-colorpicker]")) setup16(root4);
    root4.querySelectorAll?.("[data-dpi-colorpicker]").forEach(setup16);
  }

  // dpi/js/audio.js
  var audio_exports = {};
  __export(audio_exports, {
    get: () => get5,
    init: () => init14,
    setup: () => setup17
  });
  var reg2 = ownedMap();
  var RATES = [1, 1.25, 1.5, 2];
  var mk3 = (tag, cls, attrs) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    for (const [k, v] of Object.entries(attrs || {})) if (v !== void 0 && v !== false) e.setAttribute(k, v === true ? "" : String(v));
    return e;
  };
  var fmt = (s) => {
    if (!Number.isFinite(s) || s < 0) return "–:––";
    const t = Math.floor(s);
    const h = Math.floor(t / 3600), m = Math.floor(t % 3600 / 60), x = t % 60;
    return h ? `${h}:${String(m).padStart(2, "0")}:${String(x).padStart(2, "0")}` : `${m}:${String(x).padStart(2, "0")}`;
  };
  var icon2 = (name) => {
    const s = icon(name, "md");
    if (s) s.setAttribute("aria-hidden", "true");
    return s;
  };
  function setup17(root4) {
    if (reg2.has(root4)) return reg2.get(root4);
    const audio = root4.querySelector("audio");
    if (!audio) return null;
    audio.controls = false;
    audio.removeAttribute("controls");
    const label2 = root4.getAttribute("data-dpi-audio-label") || audio.getAttribute("aria-label") || "Registrazione audio";
    root4.setAttribute("role", "group");
    root4.setAttribute("aria-label", label2);
    const play = mk3("button", "dpi-btn dpi-btn--icon-only dpi-audio__play", { type: "button", "aria-label": "Riproduci", title: "Riproduci" });
    const playIc = icon2("play"), pauseIc = icon2("pause");
    const content2 = mk3("span", "dpi-btn__content");
    content2.append(...[playIc, pauseIc].filter(Boolean));
    play.append(content2);
    pauseIc?.setAttribute("hidden", "");
    const seek = mk3("input", "dpi-audio__seek", { type: "range", min: "0", max: "0", step: "0.1", value: "0", "aria-label": "Posizione", disabled: true });
    const time = mk3("span", "dpi-audio__time", { "aria-hidden": "true" });
    const status = mk3("span", "dpi-visually-hidden", { role: "status" });
    const tools = mk3("span", "dpi-audio__tools");
    let rateBtn = null;
    if (root4.getAttribute("data-dpi-audio-rate") !== "off") {
      rateBtn = mk3("button", "dpi-btn dpi-btn--sm dpi-audio__rate", { type: "button", "aria-label": "Velocità di riproduzione: 1×", title: "Velocità di riproduzione" });
      rateBtn.textContent = "1×";
      tools.append(rateBtn);
    }
    const dl = root4.getAttribute("data-dpi-audio-download");
    if (dl) {
      const a = mk3("a", "dpi-btn dpi-btn--icon-only dpi-btn--sm dpi-audio__download", { href: dl, download: "", "aria-label": "Scarica l’audio", title: "Scarica l’audio" });
      const c = mk3("span", "dpi-btn__content");
      const ic = icon2("download");
      if (ic) c.append(ic);
      a.append(c);
      tools.append(a);
    }
    const msg = mk3("p", "dpi-audio__error dpi-text dpi-text--sm", { role: "alert", hidden: true });
    msg.textContent = "Audio non disponibile.";
    root4.append(play, time, seek, tools, status, msg);
    const noseek = () => root4.hasAttribute("data-dpi-audio-noseek");
    const dur = () => Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    function paint4() {
      const d = dur(), t = audio.currentTime || 0;
      seek.max = String(d || 0);
      seek.disabled = !d || noseek() || root4.hasAttribute("data-dpi-error");
      if (document.activeElement !== seek || !seek.matches(":active")) seek.value = String(Math.min(t, d || 0));
      root4.style.setProperty("--dpi-audio-p", d ? `${Math.min(100, t / d * 100).toFixed(2)}%` : "0%");
      time.textContent = `${fmt(t)} / ${fmt(d)}`;
      seek.setAttribute("aria-valuetext", `${fmt(t)} di ${fmt(d)}`);
      const playing = !audio.paused && !audio.ended;
      root4.toggleAttribute("data-dpi-playing", playing);
      play.setAttribute("aria-label", playing ? "Pausa" : "Riproduci");
      play.title = playing ? "Pausa" : "Riproduci";
      playIc?.toggleAttribute("hidden", playing);
      pauseIc?.toggleAttribute("hidden", !playing);
    }
    const toggle2 = () => {
      if (audio.paused || audio.ended) {
        audio.play?.().catch(() => {
        });
      } else audio.pause();
    };
    play.addEventListener("click", toggle2);
    audio.addEventListener("play", () => {
      document.querySelectorAll("audio").forEach((o) => {
        if (o !== audio && !o.paused) o.pause();
      });
      paint4();
    });
    for (const ev of ["pause", "ended", "timeupdate", "loadedmetadata", "durationchange", "seeked"]) audio.addEventListener(ev, paint4);
    audio.addEventListener("waiting", () => root4.setAttribute("data-dpi-busy", ""));
    audio.addEventListener("playing", () => root4.removeAttribute("data-dpi-busy"));
    audio.addEventListener("error", () => {
      root4.setAttribute("data-dpi-error", "");
      msg.hidden = false;
      play.disabled = true;
      paint4();
      status.textContent = "Audio non disponibile";
    });
    seek.addEventListener("input", () => {
      if (!noseek()) {
        audio.currentTime = Number(seek.value);
        paint4();
      }
    });
    rateBtn?.addEventListener("click", () => {
      const i = RATES.indexOf(audio.playbackRate);
      audio.playbackRate = RATES[(i + 1) % RATES.length];
      const l = `${String(audio.playbackRate).replace(".", ",")}×`;
      rateBtn.textContent = l;
      rateBtn.setAttribute("aria-label", `Velocità di riproduzione: ${l}`);
    });
    new MutationObserver(paint4).observe(root4, { attributes: true, attributeFilter: ["data-dpi-audio-noseek"] });
    if (audio.autoplay) toggle2();
    paint4();
    const rec2 = { audio, play: () => audio.play?.(), pause: () => audio.pause(), toggle: toggle2 };
    reg2.set(root4, rec2);
    return rec2;
  }
  var get5 = (el6) => reg2.get(el6) || null;
  function init14(root4 = document) {
    if (root4.matches?.("[data-dpi-audio]")) setup17(root4);
    root4.querySelectorAll?.("[data-dpi-audio]").forEach(setup17);
  }

  // dpi/js/main.js
  var VERSION = "0.1.0";
  function sweep() {
    for (let i = 0; i < 2; i++) {
      collect2();
      collect();
      releaseOrphans();
    }
  }
  function init15(root4 = document) {
    collect2();
    collect();
    releaseOrphans();
    init6(root4);
    init7(root4);
    init8(root4);
    init9(root4);
    apply(root4);
    init11(root4);
    if (root4.matches?.("[data-dpi-dropdown]")) setup2(root4);
    root4.querySelectorAll("[data-dpi-dropdown]").forEach(setup2);
    root4.querySelectorAll("[data-dpi-navbar]").forEach(setup3);
    sync2(root4);
    root4.querySelectorAll("input[data-dpi-indeterminate]").forEach((i) => {
      i.indeterminate = true;
    });
    root4.querySelectorAll("[data-dpi-bottombar]").forEach(setup5);
    root4.querySelectorAll(".dpi-segmented").forEach(setup6);
    refresh(root4);
    init10(root4);
    root4.querySelectorAll("[data-dpi-expand]").forEach(setup8);
    init2(root4);
    init3(root4);
    init4(root4);
    init5(root4);
    init14(root4);
    init13(root4);
    init12(root4);
  }
  function start2() {
    document.documentElement.classList.add("dpi-js");
    init();
    bind2();
    bind3();
    bind4();
    bind5();
    bind6();
    bind10();
    bind9();
    bind11();
    bind();
    init15();
    emit(document, "ready", { version: VERSION });
    bindNavigation();
    firstLoad();
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start2, { once: true });
  else start2();
  var toast = { show: toastShow2 };
  var alert = alertShow;
  var popup = popupShow;
  var confirm2 = confirm;
  var icon3 = icon;
  var bar = { state, STATES, search: bar_search_exports };
  globalThis.DPI = { bar, audio: audio_exports, colorpicker: colorpicker_exports, chatbot: chatbot_exports, VERSION, init: init15, sweep, toast, alert, popup, confirm: confirm2, notify: notify_exports, icon: icon3, loading: loading_exports, theme: theme_exports, widgets: widgets_exports, calendar: calendar_exports, pickers: pickers_exports, datepicker: datepickerApi, timepicker: timepickerApi, weekdays: weekdaysApi, map: map_exports, dropdown: dropdown_exports, navbar: navbar_exports, dialog: dialog_exports, sheet: sheet_exports, action: action_exports, glass: glass_exports, bottombar: bottombar_exports, indicator: indicator_exports, drop: drop_exports, toggle: toggle_exports, expand: expand_exports, enhance: enhance_exports, file: fileinput_exports, select: select_exports, searchbar: searchbar_exports, richtext: richtext_exports, overflow: overflow_exports, diff: diff_exports };
})();
