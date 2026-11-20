/* Hash router: #/home, #/plan/3, #/learn/brain ... Handles nav highlight, scroll reset,
 * focus management and document.title (spec Section 10). */
(function () {
  const NAV = { home: 'home', plan: 'plan', planSummary: 'plan', checkin: 'progress', progress: 'progress', quiz: 'learn', learn: 'learn', strategies: 'learn', help: 'help', settings: 'settings', about: 'about' };
  let current = null;
  let firstRender = true;
  let navCount = 0; // increments on every real navigation (not on in-place refresh)

  function parse(hash) {
    let h = (hash || '').replace(/^#\/?/, '');
    const parts = h.split('/').filter(Boolean);
    const head = parts[0] || 'home';
    if (head === 'plan') {
      if (parts[1] === 'summary') return { view: 'planSummary', params: {} };
      const n = parseInt(parts[1], 10);
      if (n >= 1 && n <= 6) return { view: 'plan', params: { step: n } };
      return { view: 'plan', params: { step: null } };
    }
    if (head === 'learn') return { view: 'learn', params: { section: parts[1] || null } };
    if (NS.views[head] && head !== 'plan' && head !== 'planSummary') return { view: head, params: {} };
    return { view: 'home', params: {} };
  }

  // Redirects that depend on state (for example #/plan opens the summary when the plan is complete).
  function resolve(route) {
    if (route.view === 'plan' && !route.params.step) {
      const done = NS.state.plan.stepsDone;
      if ([1, 2, 3, 4, 5, 6].every(n => done.indexOf(n) !== -1)) return { view: 'planSummary', params: {}, replace: '#/plan/summary' };
      const next = [1, 2, 3, 4, 5, 6].find(n => done.indexOf(n) === -1) || 1;
      return { view: 'plan', params: { step: next }, replace: '#/plan/' + next };
    }
    return route;
  }

  function setTitle(view, params) {
    const t = typeof view.title === 'function' ? view.title(params) : view.title;
    document.title = (t ? t + ' | ' : '') + NS.config.APP_NAME;
  }

  function highlight(name) {
    const key = NAV[name] || '';
    document.querySelectorAll('nav.bottom a, .top-links a').forEach(a => {
      const on = a.dataset.v === key;
      a.classList.toggle('on', on);
      if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
  }

  function render(opts) {
    opts = opts || {};
    const main = document.getElementById('view');
    let route = resolve(parse(location.hash));
    if (route.replace && location.hash !== route.replace) {
      history.replaceState(null, '', route.replace);
    }
    const view = NS.views[route.view];
    if (!opts.keepPosition) navCount++;
    route.params.nav = navCount;
    current = route;
    let html;
    try { html = view.render(route.params); }
    catch (e) {
      console.error(e);
      html = '<h1>Something went wrong</h1><p class="sub">This page could not load. Your data is still saved on this device.</p><a class="btn" href="#/home">Go to Home</a>';
    }
    main.innerHTML = html;
    if (view.mount) {
      try { view.mount(main, route.params); } catch (e) { console.error(e); }
    }
    setTitle(view, route.params);
    highlight(route.view);
    NS.app.updateChrome();

    if (!opts.keepPosition) {
      window.scrollTo(0, 0);
      if (!firstRender) {
        const h1 = main.querySelector('h1');
        if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus({ preventScroll: true }); }
      }
      if (view.afterFocus) view.afterFocus(main, route.params);
    }
    firstRender = false;
  }

  // Re-render the current view in place, keeping scroll position and focus.
  function refresh() {
    const y = window.scrollY;
    const ae = document.activeElement;
    const fid = ae && ae.getAttribute && (ae.getAttribute('data-fid') || ae.id);
    render({ keepPosition: true });
    if (fid) {
      const main = document.getElementById('view');
      const el = main.querySelector('[data-fid="' + fid.replace(/"/g, '') + '"]') || document.getElementById(fid);
      if (el && !el.disabled) el.focus({ preventScroll: true });
    }
    window.scrollTo(0, y);
  }

  function go(hash) {
    if (location.hash === hash) render();
    else location.hash = hash;
  }

  function start() {
    // Prototype-style hashes (#plan) still work.
    if (location.hash && !/^#\//.test(location.hash) && location.hash.length > 1) {
      history.replaceState(null, '', '#/' + location.hash.slice(1));
    }
    window.addEventListener('hashchange', () => render());
    render();
  }

  NS.router = { parse, render, refresh, go, start, current: () => current };
})();
