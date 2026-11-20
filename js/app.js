/* Boot: load state, run migrations, render first route. Also shared UI helpers (commit, toasts, chrome). */
(function () {
  const U = NS.util;
  const H = U.escapeHTML;

  function hadStoredKey() {
    try { return localStorage.getItem(NS.config.STORAGE_KEY) !== null; } catch (e) { return false; }
  }

  function toast(message, art) {
    const box = document.getElementById('toasts');
    if (!box) return;
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = (art ? '<span class="art" aria-hidden="true">' + H(art) + '</span>' : '') + '<span>' + H(message) + '</span>';
    box.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }

  // Persist state, unlock badges (toast for each), refresh the crisis bar and banner.
  function commit() {
    const earned = NS.data.evaluateBadges(NS.state, U.today());
    NS.storage.save(NS.state);
    earned.forEach(b => toast('Badge earned: ' + b.label, b.art));
    updateChrome();
    return earned;
  }

  function replaceState(next, persist) {
    NS.state = next;
    if (persist !== false) commit();
    else updateChrome();
  }

  function updateChrome() {
    const s = NS.state;
    const sug = NS.logic.suggest.today(s);
    const extra = document.getElementById('crisisExtra');
    if (extra) extra.hidden = !NS.logic.suggest.isActive(sug);

    const banner = document.getElementById('demoBanner');
    if (banner) {
      const show = s.demo && !s.settings.hideDemoBanner;
      banner.hidden = !show;
      if (show && !banner.firstChild) {
        banner.innerHTML = '<div class="inner"><span>Sample data. Clear it in <a href="#/settings">Settings</a>.</span>' +
          '<button class="iconbtn" type="button" id="hideDemoBanner" aria-label="Hide sample data banner">' + NS.icons.get('x', 18) + '</button></div>';
        banner.querySelector('#hideDemoBanner').addEventListener('click', () => {
          NS.state.settings.hideDemoBanner = true; commit();
        });
      }
      if (!show) banner.innerHTML = '';
    }
  }

  function boot() {
    const existed = hadStoredKey();
    NS.state = NS.storage.load();
    if (existed) NS.storage.save(NS.state); // persist migrations / normalization
    document.querySelectorAll('[data-icon]').forEach(el => { el.innerHTML = NS.icons.get(el.dataset.icon, 22); });
    NS.router.start();
  }

  NS.app = { commit, toast, replaceState, updateChrome };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
