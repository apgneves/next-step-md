/* Recovery plan wizard #/plan/1 to #/plan/6 (spec 6.3). Each step edits a draft and saves on Continue. */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;

  const STEPS = [
    null,
    { field: 'reasons', title: 'My reasons', sub: 'Why recovery matters to you. Add up to 5.' },
    { field: 'goals', title: 'My goals', sub: 'Small, specific goals work best. You can mark them done later on Progress.' },
    { field: 'triggers', title: 'My triggers', sub: 'Situations or feelings that make cravings more likely.' },
    { field: 'coping', title: 'Coping strategies', sub: 'What you will do when a craving hits. Pick at least one.' },
    { field: 'people', title: 'People I can count on', sub: 'Up to 8 people. Phone numbers stay on this device.' },
    { field: 'resources', title: 'My resources', sub: 'Pin the places you would reach out to. They appear on your plan.' }
  ];
  const REASON_SUGGESTIONS = ['Stay in school', 'Health', 'Family', 'Friends', 'Money', 'Feel like myself'];
  const TRIGGER_PRESETS = ['Exam stress', 'Weekend parties', 'Being alone at night', 'Conflict', 'Boredom', 'Certain people or places', 'Poor sleep', 'Feeling down'];
  const MAX_REASONS = 5, MAX_PEOPLE = 8, MAX_GOALS = 12, MAX_CUSTOM = 15;

  let draft = null; // { step, nav, data, error }

  function ensureDraft(step, nav) {
    if (!draft || draft.step !== step || draft.nav !== nav) {
      draft = { step, nav, data: U.clone(NS.state.plan[STEPS[step].field]), error: '' };
    }
    return draft;
  }

  const chip = (label, pressed, attrs) =>
    '<button type="button" class="chip" aria-pressed="' + (pressed ? 'true' : 'false') + '" ' + attrs + '>' +
    (pressed ? I('check', 16) : I('plus', 16)) + H(label) + '</button>';
  const removable = (label, attrs, kind) =>
    '<li><span class="grow">' + H(label) + '</span><button type="button" class="iconbtn" ' + attrs +
    ' aria-label="Remove ' + H(kind) + ': ' + H(label) + '">' + I('x', 18) + '</button></li>';
  const addForm = (id, label, placeholder, disabled, extra) =>
    '<form class="add-form" data-form="' + id + '" novalidate>' +
    '<label class="q" for="in-' + id + '">' + label + '</label>' + (extra || '') +
    '<div class="field"><input type="text" id="in-' + id + '" data-fid="in-' + id + '" maxlength="300" autocomplete="off" placeholder="' + H(placeholder) + '"' + (disabled ? ' disabled' : '') + '>' +
    '<button class="btn small inline" type="submit" style="margin-top:0"' + (disabled ? ' disabled' : '') + '>Add</button></div></form>';

  function stepBar(step) {
    const done = NS.state.plan.stepsDone;
    let h = '<ol class="steps" aria-label="Plan steps">';
    for (let n = 1; n <= 6; n++) {
      const isDone = done.indexOf(n) !== -1;
      h += '<li><a href="#/plan/' + n + '" class="' + (isDone ? 'done' : '') + '"' + (n === step ? ' aria-current="step"' : '') +
        ' aria-label="Step ' + n + ': ' + STEPS[n].title + (isDone ? ' (saved)' : '') + '"><i></i></a></li>';
    }
    return h + '</ol>';
  }

  function body(step, d) {
    const data = d.data;
    let h = '';
    if (step === 1) {
      const full = data.length >= MAX_REASONS;
      h += '<div class="card"><p class="q">Ideas</p><div class="chips">' +
        REASON_SUGGESTIONS.map(r => chip(r, data.indexOf(r) !== -1, 'data-toggle="' + H(r) + '" data-fid="r-' + H(r) + '"' + (full && data.indexOf(r) === -1 ? ' disabled' : ''))).join('') + '</div>' +
        addForm('reason', 'Add your own', 'For example: Be there for my sister', full) +
        (full ? '<p class="hint" style="margin-top:6px">You have 5 reasons. Remove one to add another.</p>' : '') + '</div>';
      h += '<div class="card"><p class="q">My reasons (' + data.length + ' of 5)</p>' +
        (data.length ? '<ul class="list">' + data.map((r, i) => removable(r, 'data-remove="' + i + '"', 'reason')).join('') + '</ul>' : '<p class="empty">No reasons yet. Tap an idea or add your own.</p>') + '</div>';
    }
    if (step === 2) {
      const full = data.length >= MAX_GOALS;
      const term = d.term || 'short';
      const termCtl = '<fieldset class="seg" style="margin-bottom:4px"><legend class="sr-only">Goal type</legend><div class="seg-opts" style="grid-template-columns:1fr 1fr">' +
        '<label><input type="radio" name="term" value="short"' + (term === 'short' ? ' checked' : '') + '><span>This week or month</span></label>' +
        '<label><input type="radio" name="term" value="long"' + (term === 'long' ? ' checked' : '') + '><span>Long-term</span></label></div></fieldset>';
      h += '<div class="card">' + addForm('goal', 'Add a goal', 'For example: Go to one support meeting', full, termCtl) + '</div>';
      ['short', 'long'].forEach(t => {
        const list = data.filter(g => g.term === t);
        h += '<div class="card"><p class="q">' + (t === 'short' ? 'Short-term goals' : 'Long-term goals') + '</p>' +
          (list.length ? '<ul class="list">' + list.map(g => removable(g.text + (g.done ? ' (done)' : ''), 'data-remove-goal="' + H(g.id) + '"', 'goal')).join('') + '</ul>'
            : '<p class="empty">None yet.</p>') + '</div>';
      });
    }
    if (step === 3) {
      const custom = data.filter(t => TRIGGER_PRESETS.indexOf(t) === -1);
      h += '<div class="card"><p class="q">Common triggers</p><div class="chips">' +
        TRIGGER_PRESETS.map(t => chip(t, data.indexOf(t) !== -1, 'data-toggle="' + H(t) + '" data-fid="t-' + H(t) + '"')).join('') + '</div>' +
        addForm('trigger', 'Add your own', 'For example: Sunday nights', custom.length >= MAX_CUSTOM) +
        (custom.length ? '<ul class="list" style="margin-top:8px">' + custom.map(t => removable(t, 'data-remove-val="' + H(t) + '"', 'trigger')).join('') + '</ul>' : '') + '</div>';
    }
    if (step === 4) {
      const custom = data.filter(c => c.indexOf('custom:') === 0);
      h += '<div class="card">';
      NS.data.strategyCategories.forEach(cat => {
        h += '<p class="group-title">' + cat + '</p><div class="chips">' +
          NS.data.strategies.filter(s => s.category === cat).map(s => chip(s.name, data.indexOf(s.id) !== -1, 'data-toggle="' + s.id + '" data-fid="c-' + s.id + '"')).join('') + '</div>';
      });
      h += '<p class="hint" style="margin-top:10px"><a href="#/strategies">See how each strategy works</a></p>';
      h += addForm('coping', 'Add your own', 'For example: Play guitar', custom.length >= MAX_CUSTOM) +
        (custom.length ? '<ul class="list" style="margin-top:8px">' + custom.map(c => removable(c.slice(7), 'data-remove-val="' + H(c) + '"', 'strategy')).join('') + '</ul>' : '') + '</div>';
      h += '<p class="small muted">' + U.plural(data.length, 'strategy', 'strategies') + ' selected.</p>';
    }
    if (step === 5) {
      const full = data.length >= MAX_PEOPLE;
      h += '<div class="card"><p class="q">My people (' + data.length + ' of 8)</p>' +
        (data.length ? data.map((p, i) => '<div class="person"><span class="av ' + ['', 'c1', 'c2', 'c3'][i % 4] + '" aria-hidden="true">' + H(p.name.charAt(0).toUpperCase()) + '</span>' +
          '<span class="grow"><b>' + H(p.name) + (p.relation ? ' (' + H(p.relation) + ')' : '') + '</b><small>' + H(p.helpsWith || (p.phone ? p.phone : '')) + '</small></span>' +
          '<button type="button" class="iconbtn" data-remove="' + i + '" aria-label="Remove ' + H(p.name) + '">' + I('x', 18) + '</button></div>').join('')
          : '<p class="empty">Add a friend, family member, mentor or counselor.</p>') + '</div>';
      if (!full) {
        h += '<form class="card add-form" data-form="person" novalidate><p class="q">Add a person</p><div class="form-grid">' +
          '<div><label for="p-name">Name (required)</label><input type="text" id="p-name" data-fid="p-name" maxlength="60" autocomplete="off"></div>' +
          '<div><label for="p-rel">Relation</label><input type="text" id="p-rel" maxlength="60" autocomplete="off" placeholder="Roommate, parent, counselor..."></div>' +
          '<div><label for="p-help">What they help with</label><input type="text" id="p-help" maxlength="300" autocomplete="off" placeholder="For example: Goes to the gym with me"></div>' +
          '<div><label for="p-phone">Phone (optional, stays on this device)</label><input type="tel" id="p-phone" maxlength="30" autocomplete="off"></div>' +
          '</div><button class="btn ghost" type="submit">' + I('plus', 18) + 'Add person</button></form>';
      } else {
        h += '<p class="hint">You have 8 people. Remove one to add another.</p>';
      }
    }
    if (step === 6) {
      h += '<div class="card" role="group" aria-label="Resources">' + NS.data.resources.map(r =>
        '<label class="check"><input type="checkbox" data-res="' + r.id + '" data-fid="res-' + r.id + '"' + (data.indexOf(r.id) !== -1 ? ' checked' : '') + '>' +
        '<span class="grow"><span class="lbl">' + H(r.name) + '</span><small>' + H(r.tags.join(' · ')) + '</small></span></label>').join('') + '</div>';
    }
    return h;
  }

  NS.views.plan = {
    title: p => p.step ? 'Plan step ' + p.step + ': ' + STEPS[p.step].title : 'My recovery plan',
    render(params) {
      const step = params.step;
      const d = ensureDraft(step, params.nav);
      const last = step === 6;
      let h = '<h1>My recovery plan</h1>' + stepBar(step) +
        '<p class="sub"><b>Step ' + step + ' of 6 · ' + STEPS[step].title + '.</b> ' + STEPS[step].sub + '</p>';
      h += body(step, d);
      if (d.error) h += '<p class="err" role="alert">' + H(d.error) + '</p>';
      h += '<button class="btn" type="button" id="saveStep" data-fid="saveStep">' + (last ? 'Save and see my plan' : 'Save and continue') + I('arrow', 18) + '</button>';
      h += '<div class="spread" style="margin-top:6px">' +
        (step > 1 ? '<a class="backlink" href="#/plan/' + (step - 1) + '">' + I('back', 18) + 'Back</a>' : '<span></span>') +
        '<a class="backlink" href="#/plan/summary">View plan summary</a></div>';
      h += '<p class="foot">Your plan is saved only on this device.</p>';
      return h;
    },
    mount(root, params) {
      const step = params.step;
      const d = ensureDraft(step, params.nav);
      const data = d.data;
      const rerender = (focusId) => {
        d.error = '';
        NS.router.refresh();
        if (focusId) { const el = document.getElementById(focusId); if (el) el.focus(); }
      };

      root.querySelectorAll('[data-toggle]').forEach(b => b.addEventListener('click', () => {
        const v = b.getAttribute('data-toggle');
        const i = data.indexOf(v);
        if (i === -1) { if (step === 1 && data.length >= MAX_REASONS) return; data.push(v); }
        else data.splice(i, 1);
        rerender();
      }));
      root.querySelectorAll('[data-remove]').forEach(b => b.addEventListener('click', () => {
        data.splice(+b.getAttribute('data-remove'), 1); rerender();
      }));
      root.querySelectorAll('[data-remove-val]').forEach(b => b.addEventListener('click', () => {
        const i = data.indexOf(b.getAttribute('data-remove-val')); if (i !== -1) data.splice(i, 1); rerender();
      }));
      root.querySelectorAll('[data-remove-goal]').forEach(b => b.addEventListener('click', () => {
        const i = data.findIndex(g => g.id === b.getAttribute('data-remove-goal')); if (i !== -1) data.splice(i, 1); rerender();
      }));
      root.querySelectorAll('input[name="term"]').forEach(r => r.addEventListener('change', () => { d.term = r.value; }));
      root.querySelectorAll('[data-res]').forEach(c => c.addEventListener('change', () => {
        const id = c.getAttribute('data-res'); const i = data.indexOf(id);
        if (c.checked && i === -1) data.push(id); if (!c.checked && i !== -1) data.splice(i, 1);
      }));

      root.querySelectorAll('form.add-form').forEach(f => f.addEventListener('submit', e => {
        e.preventDefault();
        const kind = f.getAttribute('data-form');
        if (kind === 'person') {
          const name = U.cleanText(f.querySelector('#p-name').value, 60);
          if (!name) { d.error = 'Add a name first.'; NS.router.refresh(); const n = document.getElementById('p-name'); if (n) n.focus(); return; }
          if (data.length >= MAX_PEOPLE) return;
          data.push({ id: U.id('p'), name, relation: U.cleanText(f.querySelector('#p-rel').value, 60),
            helpsWith: U.cleanText(f.querySelector('#p-help').value), phone: U.cleanPhone(f.querySelector('#p-phone').value) });
          rerender('p-name');
          return;
        }
        const input = f.querySelector('input[type=text]');
        const v = U.cleanText(input.value);
        if (!v) { input.focus(); return; }
        if (kind === 'reason') { if (data.length < MAX_REASONS && data.indexOf(v) === -1) data.push(v); }
        if (kind === 'trigger') { if (data.indexOf(v) === -1) data.push(v); }
        if (kind === 'coping') { const id = 'custom:' + v; if (data.indexOf(id) === -1) data.push(id); }
        if (kind === 'goal') {
          if (data.length < MAX_GOALS) data.push({ id: U.id('g'), text: v, term: d.term || 'short', done: false, doneAt: null });
        }
        rerender('in-' + kind);
      }));

      root.querySelector('#saveStep').addEventListener('click', () => {
        // Unsubmitted text in an "Add" box is easy to forget; add it before saving.
        const pending = root.querySelector('form.add-form input[type=text]');
        if (pending && pending.value.trim() && step !== 5) { pending.form.requestSubmit ? pending.form.requestSubmit() : pending.form.dispatchEvent(new Event('submit', { cancelable: true })); }
        if (step === 4 && data.length === 0) {
          d.error = 'Pick at least one coping strategy so your plan has something to reach for.';
          NS.router.refresh();
          return;
        }
        const plan = NS.state.plan;
        plan[STEPS[step].field] = U.clone(data);
        if (plan.stepsDone.indexOf(step) === -1) { plan.stepsDone.push(step); plan.stepsDone.sort((a, b) => a - b); }
        plan.updatedAt = U.now().toISOString();
        NS.app.commit();
        draft = null;
        NS.router.go(step === 6 ? '#/plan/summary' : '#/plan/' + (step + 1));
      });
    }
  };

  NS.views.plan.STEPS = STEPS;
})();
