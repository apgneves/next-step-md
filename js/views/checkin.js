/* Daily check-in #/checkin (spec 6.5) plus the shared support-suggestion card (spec 7.2). */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;
  let saved = null; // { nav, earned: [], updated: bool }

  function resourceLink(r) {
    if (r.contact.call) return '<a href="tel:' + H(r.contact.call.replace(/[^\d+]/g, '')) + '">' + H(r.name) + ' (' + H(r.contact.call) + ')</a>';
    if (r.contact.web) return U.extLink(r.contact.web, H(r.name));
    return '<a href="#/help">' + H(r.name) + '</a>';
  }

  // Support card HTML for a suggestion object from NS.logic.suggest.
  function supportHTML(sug, opts) {
    opts = opts || {};
    const s = NS.state;
    let h = '';
    if (sug.tough) {
      h += '<section class="card support" aria-labelledby="supT"><h2 id="supT">Tough day. Here\'s something from your plan.</h2>';
      if (sug.urgent) {
        h += '<p class="urgent">If you feel unsafe or might hurt yourself, call or text <a href="tel:988">988</a> now, or call <a href="tel:911">911</a>.</p>';
      }
      if (sug.strategy) {
        const lib = NS.data.strategyById(sug.strategy);
        h += '<p class="q" style="margin-top:4px">Try: ' + H(NS.data.strategyName(sug.strategy)) + '</p>';
        if (lib && !opts.compact) h += '<ol style="margin:0 0 8px;padding-left:20px;font-size:14px">' + lib.steps.map(x => '<li>' + H(x) + '</li>').join('') + '</ol>';
      }
      if (sug.people.length) {
        h += '<p class="q">Reach out</p>' + sug.people.map((p, i) => '<div class="person"><span class="av ' + ['', 'c1'][i] + '" aria-hidden="true">' + H(p.name.charAt(0).toUpperCase()) + '</span>' +
          '<span class="grow"><b>' + H(p.name) + '</b><small>' + H(p.helpsWith || p.relation) + '</small></span>' +
          (p.phone ? '<a class="callink" href="' + H(U.telHref(p.phone)) + '">' + I('phone', 14) + 'Call</a>' : '') + '</div>').join('');
      }
      h += '<a class="backlink" href="#/strategies">More coping strategies' + I('arrow', 16) + '</a></section>';
    }
    if (sug.highStreak) {
      const pinned = s.plan.resources.map(id => NS.data.resources.find(r => r.id === id)).filter(Boolean);
      h += '<section class="card soft" aria-labelledby="supH"><h2 id="supH" style="margin-top:0">Cravings have been high for a few days.</h2>' +
        '<p>Talking to a counselor can help.</p>' +
        (pinned.length ? '<ul style="margin:0 0 8px;padding-left:20px">' + pinned.map(r => '<li>' + resourceLink(r) + '</li>').join('') + '</ul>' : '') +
        '<a class="backlink" href="#/help">See all help options' + I('arrow', 16) + '</a></section>';
    }
    if (sug.noCoping && opts.includeStarter) {
      h += '<section class="card warm" aria-labelledby="supS"><h2 id="supS" style="margin-top:0">Two strategies to start with</h2>' +
        NS.data.starterStrategies.map(id => {
          const st = NS.data.strategyById(id);
          return '<div class="spread" style="border-top:1px solid #f1d9ad;padding:6px 0"><span><b>' + H(st.name) + '</b><br><small>' + H(st.summary) + '</small></span>' +
            '<button type="button" class="btn small inline ghost" style="margin:0" data-add-starter="' + id + '">Add</button></div>';
        }).join('') + '</section>';
    }
    return h;
  }

  function seg(name, legend, values, labels, checked, cls, n) {
    return '<fieldset class="seg ' + (cls || '') + '"><legend>' + legend + '</legend><div class="seg-opts n' + n + '">' +
      values.map((v, i) => '<label><input type="radio" name="' + name + '" value="' + v + '"' + (String(checked) === String(v) ? ' checked' : '') +
        ' aria-label="' + H(labels[i]) + '"><span aria-hidden="true">' + H(String(v)) + '</span></label>').join('') + '</div>';
  }

  NS.views.checkin = {
    title: 'Daily check-in',
    supportHTML,
    render(params) {
      const s = NS.state, today = U.today();
      const existing = NS.logic.suggest.todayCheckin(s, today);

      if (saved && saved.nav === params.nav) {
        const sug = NS.logic.suggest.today(s);
        let h = '<h1>Check-in saved</h1><p class="sub">' + (saved.updated ? 'Today\'s check-in was updated.' : 'Thanks for checking in today. Every check-in counts.') + '</p>';
        if (saved.earned.length) {
          h += '<div class="card warm"><p class="q" style="margin-top:0">New badge' + (saved.earned.length > 1 ? 's' : '') + '</p>' +
            saved.earned.map(b => '<div class="row" style="margin-top:6px"><span class="badge-mini" aria-hidden="true">' + H(b.art) + '</span><b>' + H(b.label) + '</b></div>').join('') + '</div>';
        }
        h += supportHTML(sug, { includeStarter: true });
        if (!sug.tough && !sug.highStreak) h += '<div class="note">Nice work. Seeing your patterns over time is how a plan gets better.</div>';
        h += '<div class="btn-row"><a class="btn" href="#/progress">See my progress</a><a class="btn ghost" href="#/home">Home</a></div>';
        h += '<button type="button" class="linkbtn" id="editAgain" style="margin-top:8px">Change today\'s check-in</button>';
        return h;
      }

      const c = existing || { mood: '', craving: '', usedCoping: null, strategy: '', note: '' };
      const used = c.usedCoping === true ? 'yes' : c.usedCoping === 'none' ? 'none' : (existing ? 'no' : '');
      const coping = s.plan.coping.length ? s.plan.coping : NS.data.strategies.map(x => x.id);

      let h = '<h1>Daily check-in</h1><p class="sub">' + H(U.longDate(today)) + '. ' +
        (existing ? 'You already checked in today. Saving again updates it.' : 'About 30 seconds. There are no wrong answers.') + '</p>';
      h += '<form id="ciForm" class="card" novalidate>';
      h += seg('mood', 'How\'s your mood today?', [1, 2, 3, 4, 5], ['1, rough', '2', '3', '4', '5, great'], c.mood, '', 5);
      h += '<div class="scale" aria-hidden="true"><span>1 Rough</span><span>Great 5</span></div></fieldset>';
      h += seg('craving', 'Craving level', [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], ['0, none', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10, strongest'], c.craving, 'amber', 11);
      h += '<div class="scale" aria-hidden="true"><span>0 None</span><span>Strongest 10</span></div></fieldset>';
      h += '<fieldset class="seg"><legend>Did you use a coping strategy today?</legend><div class="seg-opts n3">' +
        [['yes', 'Yes'], ['no', 'No'], ['none', 'Didn\'t need one']].map(([v, l]) =>
          '<label><input type="radio" name="used" value="' + v + '"' + (used === v ? ' checked' : '') + '><span>' + l + '</span></label>').join('') + '</div></fieldset>';
      h += '<div id="whichWrap"' + (used === 'yes' ? '' : ' hidden') + '><label class="q" for="which">Which one?</label><select id="which">' +
        coping.map(id => '<option value="' + H(id) + '"' + (c.strategy === id ? ' selected' : '') + '>' + H(NS.data.strategyName(id)) + '</option>').join('') + '</select>' +
        (s.plan.coping.length ? '' : '<p class="hint" style="margin-top:6px">Add strategies to <a href="#/plan/4">your plan</a> to see them first here.</p>') + '</div>';
      h += '<label class="q" for="note">Note (optional)</label><textarea id="note" maxlength="300" placeholder="Anything you want to remember about today">' + H(c.note) + '</textarea>' +
        '<div class="counter" id="noteCount" aria-live="polite">' + c.note.length + ' / 300</div>';
      h += '<div id="ciErr"></div>';
      h += '<button class="btn" type="submit">' + I('check', 18) + 'Save check-in</button></form>';
      h += '<p class="foot">Check-ins are private and stay on this device.</p>';
      return h;
    },
    mount(root, params) {
      const again = root.querySelector('#editAgain');
      if (again) { again.addEventListener('click', () => { saved = null; NS.router.render(); }); }
      root.querySelectorAll('[data-add-starter]').forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-add-starter');
        if (NS.state.plan.coping.indexOf(id) === -1) NS.state.plan.coping.push(id);
        NS.state.plan.updatedAt = U.now().toISOString();
        NS.app.commit();
        NS.app.toast('Added to your plan: ' + NS.data.strategyName(id));
        NS.router.refresh();
      }));

      const form = root.querySelector('#ciForm');
      if (!form) return;
      const wrap = root.querySelector('#whichWrap');
      form.querySelectorAll('input[name=used]').forEach(r => r.addEventListener('change', () => { wrap.hidden = r.value !== 'yes' || !r.checked; }));
      const note = root.querySelector('#note'), cnt = root.querySelector('#noteCount');
      note.addEventListener('input', () => { cnt.textContent = note.value.length + ' / 300'; });

      form.addEventListener('submit', e => {
        e.preventDefault();
        const val = n => { const r = form.querySelector('input[name=' + n + ']:checked'); return r ? r.value : null; };
        const mood = val('mood'), craving = val('craving'), used = val('used');
        const missing = [];
        if (mood === null) missing.push('mood');
        if (craving === null) missing.push('craving level');
        if (missing.length) {
          root.querySelector('#ciErr').innerHTML = '<p class="err" role="alert">Pick your ' + missing.join(' and ') + ' to save.</p>';
          const first = form.querySelector('input[name=' + (mood === null ? 'mood' : 'craving') + ']');
          if (first) first.focus();
          return;
        }
        const s = NS.state, today = U.today();
        const rec = {
          date: today, mood: +mood, craving: +craving,
          usedCoping: used === 'yes' ? true : used === 'none' ? 'none' : false,
          strategy: used === 'yes' ? root.querySelector('#which').value : '',
          note: U.cleanNote(note.value)
        };
        const i = s.checkins.findIndex(c => c.date === today);
        const updated = i !== -1;
        if (updated) s.checkins[i] = rec; else s.checkins.push(rec);
        s.checkins.sort((a, b) => a.date < b.date ? -1 : 1);
        const earned = NS.app.commit();
        saved = { nav: params.nav, earned, updated };
        NS.router.refresh();
        window.scrollTo(0, 0);
        const h1 = root.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); }
      });
    }
  };
})();
