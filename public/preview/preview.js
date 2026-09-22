/* =========================================================================
   Preview build: motion + interaction layer.
   Runs on top of the shared app.js renderer. Nothing here is required for
   the page to work: every block is defensive and reduced-motion aware.
   ========================================================================= */
(function () {
  'use strict';
  var reduce = false;
  try { reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) {}
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------------------------------------------------- scroll progress */
  (function () {
    if (reduce) return;
    var bar = document.createElement('div');
    bar.id = 'pv-progress';
    document.body.appendChild(bar);
    var queued = false;
    function paint() {
      queued = false;
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? Math.min(1, Math.max(0, window.scrollY / h)) : 0;
      bar.style.setProperty('--pv-p', p.toFixed(4));
    }
    window.addEventListener('scroll', function () {
      if (queued) return;
      queued = true;
      window.requestAnimationFrame(paint);
    }, { passive: true });
    paint();
  })();

  /* ---------------------------------------------------------- tab indicator */
  (function () {
    var tabs = $('#tabs');
    if (!tabs) return;
    function move() {
      var act = $('.tab.active', tabs);
      if (!act) return;
      tabs.style.setProperty('--pv-tab-x', act.offsetLeft + 'px');
      tabs.style.setProperty('--pv-tab-w', act.offsetWidth + 'px');
    }
    tabs.addEventListener('click', function () { setTimeout(move, 0); });
    window.addEventListener('resize', move);
    setTimeout(move, 60);
    setTimeout(move, 600);
    // i18n switch rebuilds labels
    $$('.lang-switch button').forEach(function (b) { b.addEventListener('click', function () { setTimeout(move, 120); }); });
    move();
  })();

  /* ---------------------------------------------------------- staggered reveal */
  var seen = new WeakSet();
  function reveal(scope, step) {
    if (reduce) return;
    var nodes = $$('.kpi', scope).concat($$('tr.row-main', scope));
    nodes.slice(0, 60).forEach(function (el, i) {
      if (seen.has(el)) return;
      seen.add(el);
      el.classList.add('pv-rv');
      el.style.setProperty('--pv-i', String(Math.min(i, 12) * (step || 1)));
      window.requestAnimationFrame(function () { el.classList.add('pv-in'); });
    });
  }
  function activeView() { return $('.view.active') || document; }
  function watch() {
    var grid = $('#stats-grid');
    var bodies = ['#plans-tbody', '#top-tbody'].map(function (s) { return $(s); }).filter(Boolean);
    var obs = new MutationObserver(function () {
      reveal(activeView());
      countUp();
    });
    if (grid) obs.observe(grid, { childList: true, subtree: true });
    bodies.forEach(function (b) { obs.observe(b, { childList: true }); });
    var tabs = $('#tabs');
    if (tabs) tabs.addEventListener('click', function () { setTimeout(function () { reveal(activeView()); }, 30); });
    var views = $('#main');
    if (views) obs.observe(views, { childList: false, subtree: false, attributes: true, attributeFilter: ['class'] });
    reveal(activeView());
  }

  /* ---------------------------------------------------------- kpi count up */
  var counted = new WeakMap();
  var animating = new WeakSet();
  function countUp() {
    if (reduce) return;
    $$('.kpi .v').forEach(function (el) {
      if (animating.has(el)) return;
      var raw = (el.textContent || '').trim();
      var m = raw.match(/^([0-9][0-9.,\u00a0 ]*)$/);
      if (!m) return;
      var target = parseInt(raw.replace(/[^0-9]/g, ''), 10);
      if (!isFinite(target) || target <= 0) return;
      if (counted.get(el) === raw) return;
      counted.set(el, raw);
      animating.add(el);
      var sep = raw.indexOf(',') >= 0 ? ',' : (raw.indexOf('.') >= 0 && raw.length > 3 ? '.' : '');
      var t0 = null;
      var dur = 620;
      function frame(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        var v = Math.round(target * eased);
        el.textContent = sep ? v.toLocaleString('en-US').replace(/,/g, sep === ',' ? ',' : '.') : String(v);
        if (p < 1) window.requestAnimationFrame(frame);
        else { el.textContent = raw; animating.delete(el); }
      }
      window.requestAnimationFrame(frame);
    });
  }

  /* ---------------------------------------------------------- "data updated" chip */
  function lastSeen() {
    var meta = $('#meta-updated');
    var host = $('.app-meta');
    if (!meta || !host) return;
    var now = (meta.textContent || '').trim();
    if (!now) return;
    var KEY = 'cpc-preview-snapshot';
    var prev = null;
    try { prev = window.localStorage.getItem(KEY); } catch (e) {}
    try { window.localStorage.setItem(KEY, now); } catch (e) {}
    if (!prev || prev === now) return;
    var chip = document.createElement('span');
    chip.id = 'pv-lastseen';
    chip.textContent = document.documentElement.lang === 'de' ? 'Daten seit deinem letzten Besuch erneuert' : 'data updated since your last visit';
    host.appendChild(chip);
  }

  /* ---------------------------------------------------------- theme switch redraw */
  // app.js zeichnet den Chart nur bei Resize/Filterwechsel neu. Nach dem
  // Theme-Wechsel bleibt die Canvas daher in den alten Farben stehen (auch live).
  (function () {
    var btn = document.querySelector('#theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      window.setTimeout(function () {
        try { window.dispatchEvent(new Event('resize')); } catch (e) {}
      }, 60);
    });
  })();

  function boot() {
    try { watch(); } catch (e) {}
    try { countUp(); } catch (e) {}
    try { lastSeen(); } catch (e) {}
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 80); });
  else setTimeout(boot, 80);
  // app.js fills the KPIs after its data fetch resolves
  window.addEventListener('load', function () { setTimeout(function () { try { countUp(); } catch (e) {} }, 250); });
})();
