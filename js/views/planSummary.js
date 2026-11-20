/* Plan summary and PDF export #/plan/summary (spec 6.4) */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;

  function section(title, step, inner, isEmpty, wide) {
    return '<section class="card' + (wide ? ' wide' : '') + '"><div class="spread"><h2 style="margin:0">' + title + '</h2>' +
      (step ? '<a class="backlink no-print" href="#/plan/' + step + '" aria-label="Edit ' + H(title) + '">' + I('edit', 16) + 'Edit</a>' : '') + '</div>' +
      (isEmpty ? '<p class="empty">Not filled in yet. <a class="no-print" href="#/plan/' + step + '">Add now</a></p>' : inner) + '</section>';
  }
  const ul = items => '<ul>' + items.map(x => '<li>' + x + '</li>').join('') + '</ul>';

  NS.views.planSummary = {
    title: 'My plan summary',
    render() {
      const p = NS.state.plan;
      const complete = [1, 2, 3, 4, 5, 6].every(n => p.stepsDone.indexOf(n) !== -1);
      let h = '<h1>My recovery plan</h1>';
      h += '<p class="sub">' + (complete ? 'Your plan is ready. Come back and change it whenever you need to.' : 'Your plan so far. Finish the remaining steps when you are ready.') +
        (p.updatedAt ? ' <span class="small">Last updated ' + H(U.niceDate(U.dateStr(new Date(p.updatedAt)))) + '.</span>' : '') + '</p>';
      if (!complete) {
        const next = [1, 2, 3, 4, 5, 6].find(n => p.stepsDone.indexOf(n) === -1);
        h += '<a class="btn no-print" href="#/plan/' + next + '" style="margin:0 0 12px">Continue with step ' + next + I('arrow', 18) + '</a>';
      }

      h += '<div class="summary-grid">';
      h += section('My reasons', 1, ul(p.reasons.map(H)), !p.reasons.length);
      const goalLine = g => H(g.text) + (g.done ? ' <small class="muted">(done)</small>' : '');
      const sg = p.goals.filter(g => g.term === 'short'), lg = p.goals.filter(g => g.term === 'long');
      h += section('Goals', 2, (sg.length ? '<p class="small muted" style="margin:4px 0 2px">Short-term</p>' + ul(sg.map(goalLine)) : '') +
        (lg.length ? '<p class="small muted" style="margin:6px 0 2px">Long-term</p>' + ul(lg.map(goalLine)) : ''), !p.goals.length);
      h += section('Triggers', 3, '<div class="chips">' + p.triggers.map(t => '<span class="chip static">' + H(t) + '</span>').join('') + '</div>', !p.triggers.length);
      h += section('When a craving hits, I will...', 4, ul(p.coping.map(c => H(NS.data.strategyName(c)))), !p.coping.length);
      h += section('People I can count on', 5, p.people.map((x, i) => '<div class="person"><span class="av ' + ['', 'c1', 'c2', 'c3'][i % 4] + '" aria-hidden="true">' + H(x.name.charAt(0).toUpperCase()) + '</span>' +
        '<span class="grow"><b>' + H(x.name) + (x.relation ? ' (' + H(x.relation) + ')' : '') + '</b><small>' + H(x.helpsWith) + '</small></span>' +
        (x.phone ? '<a class="callink" href="' + H(U.telHref(x.phone)) + '">' + I('phone', 14) + H(x.phone) + '</a>' : '') + '</div>').join(''), !p.people.length, true);
      const res = p.resources.map(id => NS.data.resources.find(r => r.id === id)).filter(Boolean);
      h += section('My resources', 6, ul(res.map(r => '<b>' + H(r.name) + '</b>' + (r.contact.call ? ' · ' + H(r.contact.call) : '') + (r.contact.web ? ' · ' + H(r.contact.web.replace(/^https?:\/\//, '').replace(/\/$/, '')) : ''))), !res.length, true);
      h += '<section class="card wide soft"><h2 style="margin:0 0 4px">Crisis line</h2><p>Call or text <b>988</b>, any time, free. For an overdose or immediate danger, call <b>911</b>.</p></section>';
      h += '</div>';

      h += '<button class="btn" type="button" id="printPlan">' + I('print', 18) + 'Download or print my plan</button>';
      h += '<p class="hint no-print" style="margin-top:6px">In the print window, choose "Save as PDF" to keep a copy.</p>';
      h += '<p class="foot">Your plan is saved only on this device.</p>';
      return h;
    },
    mount(root) {
      root.querySelector('#printPlan').addEventListener('click', () => window.print());
    }
  };
})();
