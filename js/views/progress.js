/* Progress #/progress (spec 6.6) */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;
  let range = 14;

  // Inline SVG line chart: mood (1-5) and craving (0-10), both scaled 0-1. Missing days are gaps.
  function chartSVG(series) {
    const W = 320, Ht = 150, PL = 10, PR = 10, PT = 10, PB = 22, n = series.length;
    const x = i => PL + (n === 1 ? (W - PL - PR) / 2 : i * (W - PL - PR) / (n - 1));
    const y = v => PT + (1 - v) * (Ht - PT - PB);
    let g = '';
    for (let k = 0; k <= 4; k++) { const yy = y(k / 4).toFixed(1); g += '<line x1="' + PL + '" x2="' + (W - PR) + '" y1="' + yy + '" y2="' + yy + '" stroke="#ece8df" stroke-width="1"/>'; }
    function line(vals, color) {
      let d = '', dots = '', run = [];
      const flush = () => {
        if (run.length > 1) d += run.map((p, j) => (j ? 'L' : 'M') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ') + ' ';
        run = [];
      };
      vals.forEach((v, i) => {
        if (v === null) { flush(); return; }
        const p = [x(i), y(v)];
        run.push(p);
        dots += '<circle cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="' + (i === n - 1 ? 4.5 : n > 20 ? 2 : 2.8) + '" fill="' + color + '"/>';
      });
      flush();
      return (d ? '<path d="' + d + '" fill="none" stroke="' + color + '" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>' : '') + dots;
    }
    g += line(series.map(s => s.craving === null ? null : s.craving / 10), '#e8a33d');
    g += line(series.map(s => s.mood === null ? null : (s.mood - 1) / 4), '#1f6f6b');
    g += '<text x="' + PL + '" y="' + (Ht - 5) + '" font-size="10" fill="#5d6b70">' + n + ' days ago</text>' +
      '<text x="' + (W - PR) + '" y="' + (Ht - 5) + '" font-size="10" fill="#5d6b70" text-anchor="end">today</text>';
    return g;
  }

  NS.views.progress = {
    title: 'My progress',
    render() {
      const s = NS.state, st = NS.logic.stats, today = U.today();
      const series = st.series(s, range, today);
      const present = series.filter(d => d.mood !== null);
      let h = '<h1>My progress</h1><p class="sub">Your trends and what you have done. Progress never resets to zero.</p>';

      h += '<div class="tiles">' +
        '<div class="card"><div class="n">' + st.checkinsThisMonth(s, today) + '</div><small>check-ins this month</small></div>' +
        '<div class="card"><div class="n">' + st.currentStreak(s, today) + '</div><small>current streak</small></div>' +
        '<div class="card"><div class="n">' + st.bestStreak(s) + '</div><small>best streak</small></div></div>';
      h += NS.logic.suggest.todayCheckin(s, today) ? '' : '<a class="btn" href="#/checkin" style="margin:12px 0 0">' + I('sun', 18) + 'Do today\'s check-in</a>';

      h += '<div class="spread" style="margin-top:18px"><h2 style="margin:0">My last ' + range + ' days</h2>' +
        '<div class="chips" role="group" aria-label="Chart range">' +
        [14, 30].map(r => '<button type="button" class="chip" data-range="' + r + '" data-fid="range-' + r + '" aria-pressed="' + (range === r) + '">' + r + ' days</button>').join('') + '</div></div>';
      const label = 'Line chart of mood and craving for the last ' + range + ' days. ' + U.plural(present.length, 'check-in') + ' in this period.' +
        (present.length ? ' Latest: mood ' + present[present.length - 1].mood + ' of 5, craving ' + present[present.length - 1].craving + ' of 10.' : '');
      h += '<div class="card chart-wrap" style="margin-top:8px"><svg viewBox="0 0 320 150" role="img" aria-label="' + H(label) + '">' + chartSVG(series) + '</svg>' +
        '<div class="legend"><span><i style="background:var(--teal)"></i>Mood (1 to 5)</span><span><i style="background:var(--amber)"></i>Cravings (0 to 10)</span><span>Gaps are days without a check-in</span></div>' +
        (present.length ? '<details><summary>' + I('chevron', 16, ' class="chev"') + 'Show as a table</summary><div class="body"><table class="data"><thead><tr><th scope="col">Date</th><th scope="col">Mood</th><th scope="col">Craving</th></tr></thead><tbody>' +
          present.slice().reverse().map(d => '<tr><td>' + H(U.niceDate(d.date)) + '</td><td>' + d.mood + '</td><td>' + d.craving + '</td></tr>').join('') + '</tbody></table></div></details>' : '') +
        '</div>';

      const ins = st.insights(s, today);
      if (ins.length) h += ins.map(t => '<div class="note">' + H(t) + '</div>').join('');
      else h += '<div class="note">Insights appear after 7 check-ins. You have ' + s.checkins.length + ' so far.</div>';

      // Goals
      h += '<h2>My goals</h2><div class="card">';
      if (s.plan.goals.length) {
        h += s.plan.goals.map(g => '<label class="check' + (g.done ? ' done' : '') + '"><input type="checkbox" data-goal="' + H(g.id) + '" data-fid="goal-' + H(g.id) + '"' + (g.done ? ' checked' : '') + '>' +
          '<span class="grow"><span class="lbl">' + H(g.text) + '</span><small>' + (g.term === 'long' ? 'Long-term' : 'Short-term') + (g.done && g.doneAt ? ' · done ' + H(U.niceDate(g.doneAt)) : '') + '</small></span></label>').join('');
      } else {
        h += '<p class="empty">No goals yet. <a href="#/plan/2">Add goals to your plan</a></p>';
      }
      h += '</div>';

      // Self-reported actions
      h += '<h2>Things I did today</h2><div class="card">' +
        '<button type="button" class="btn ghost" data-event="reachedOut" data-fid="ev-r" style="margin-top:0">' + I('people', 18) + 'I reached out to someone today</button>' +
        '<button type="button" class="btn ghost" data-event="meetings" data-fid="ev-m">' + I('help', 18) + 'I went to a support meeting</button>' +
        '<p class="small muted" style="margin-top:8px">Reached out ' + U.plural(s.events.reachedOut, 'time') + ' · Meetings: ' + s.events.meetings + '</p></div>';

      // Badges
      h += '<h2>Milestones</h2><p class="hint">Badges reward what you do, not perfection. They are never taken away.</p><div class="badges">';
      h += NS.data.badges.map(b => {
        const on = s.badges[b.id];
        return '<div class="badge' + (on ? '' : ' locked') + '"><div class="art" aria-hidden="true">' + H(b.art) + '</div><b>' + H(b.label) + '</b>' +
          '<small>' + (on ? 'Earned ' + H(U.niceDate(on)) : H(b.hint)) + '</small><span class="sr-only">' + (on ? ', earned' : ', locked') + '</span></div>';
      }).join('');
      h += '</div>';
      return h;
    },
    mount(root) {
      root.querySelectorAll('[data-range]').forEach(b => b.addEventListener('click', () => { range = +b.getAttribute('data-range'); NS.router.refresh(); }));
      root.querySelectorAll('[data-goal]').forEach(c => c.addEventListener('change', () => {
        const g = NS.state.plan.goals.find(x => x.id === c.getAttribute('data-goal'));
        if (!g) return;
        g.done = c.checked; g.doneAt = c.checked ? U.today() : null;
        NS.state.plan.updatedAt = U.now().toISOString();
        NS.app.commit();
        if (c.checked) NS.app.toast('Goal done. Nice work.');
        NS.router.refresh();
      }));
      root.querySelectorAll('[data-event]').forEach(b => b.addEventListener('click', () => {
        const k = b.getAttribute('data-event');
        NS.state.events[k] = (NS.state.events[k] || 0) + 1;
        NS.app.commit();
        NS.app.toast(k === 'reachedOut' ? 'Logged. Reaching out takes courage.' : 'Logged. Showing up counts.');
        NS.router.refresh();
      }));
    }
  };
})();
