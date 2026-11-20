/* Stats definitions (spec Section 7.1). All functions are pure; `today` defaults to the local date. */
(function () {
  const U = NS.util;

  const sorted = s => s.checkins.slice().sort((a, b) => a.date < b.date ? -1 : a.date > b.date ? 1 : 0);
  const byDate = s => { const m = {}; s.checkins.forEach(c => { m[c.date] = c; }); return m; };
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  const round5 = n => { const r = Math.round(n / 5) * 5; return r === 0 ? 0 : r; }; // avoid -0

  function checkinsThisMonth(s, today) {
    today = today || U.today();
    return s.checkins.filter(c => U.sameMonth(c.date, today)).length;
  }

  // Consecutive days with a check-in ending today, or ending yesterday if today has none yet.
  function currentStreak(s, today) {
    today = today || U.today();
    const m = byDate(s);
    let day = m[today] ? today : U.addDays(today, -1);
    let n = 0;
    while (m[day]) { n++; day = U.addDays(day, -1); }
    return n;
  }

  // Runs of consecutive dates: [{start, end, length}]
  function runs(s) {
    const dates = sorted(s).map(c => c.date);
    const out = [];
    dates.forEach(d => {
      const last = out[out.length - 1];
      if (last && U.daysBetween(last.end, d) === 1) { last.end = d; last.length++; }
      else if (!last || last.end !== d) out.push({ start: d, end: d, length: 1 });
    });
    return out;
  }
  function bestStreak(s) { return runs(s).reduce((m, r) => Math.max(m, r.length), 0); }
  // Date on which a streak of length n was first reached.
  function dateOfStreak(s, n) {
    const r = runs(s).find(x => x.length >= n);
    return r ? U.addDays(r.start, n - 1) : null;
  }

  function goalsDone(s) { return s.plan.goals.filter(g => g.done).length; }
  function copingUses(s) { return s.checkins.filter(c => c.usedCoping === true).length; }

  // Craving trend: percent change rounded to the nearest 5%.
  // 14+ check-ins: most recent 7 vs first 7. Otherwise last 7 days vs previous 7 days (3+ check-ins each).
  function cravingTrend(s, today) {
    today = today || U.today();
    const list = sorted(s);
    let base, recent, basis;
    if (list.length >= 14) {
      base = list.slice(0, 7); recent = list.slice(-7); basis = 'first-week';
    } else {
      const inRange = (c, from, to) => c.date >= from && c.date <= to;
      recent = list.filter(c => inRange(c, U.addDays(today, -6), today));
      base = list.filter(c => inRange(c, U.addDays(today, -13), U.addDays(today, -7)));
      basis = 'previous-week';
      if (recent.length < 3 || base.length < 3) return null;
    }
    const b = avg(base.map(c => c.craving)), r = avg(recent.map(c => c.craving));
    if (b === 0) return { pct: r === 0 ? 0 : null, basis, base: b, recent: r };
    return { pct: round5((r - b) / b * 100), basis, base: b, recent: r };
  }

  // Mode of strategy over the last 30 days; ties broken by most recent use.
  function mostUsedStrategy(s, today) {
    today = today || U.today();
    const from = U.addDays(today, -29);
    const counts = {}, last = {};
    sorted(s).forEach(c => {
      if (c.date < from || c.date > today || !c.strategy) return;
      counts[c.strategy] = (counts[c.strategy] || 0) + 1;
      last[c.strategy] = c.date;
    });
    let best = null;
    Object.keys(counts).forEach(k => {
      if (!best || counts[k] > counts[best] || (counts[k] === counts[best] && last[k] > last[best])) best = k;
    });
    return best ? { id: best, count: counts[best] } : null;
  }

  // Plain-language insights. Only shown with 7+ check-ins; never judgmental.
  function insights(s, today) {
    if (s.checkins.length < 7) return [];
    const out = [];
    const t = cravingTrend(s, today);
    if (t && t.pct !== null) {
      const vs = t.basis === 'first-week' ? 'compared with your first week' : 'compared with the week before';
      if (t.pct <= -5) out.push('Cravings are down ' + Math.abs(t.pct) + '% ' + vs + '.');
      else if (t.pct >= 5) out.push('Cravings have been higher this week. Your plan has strategies that can help.');
      else out.push('Cravings have been about the same ' + vs + '.');
    }
    const m = mostUsedStrategy(s, today);
    if (m) out.push('Your most-used strategy is ' + NS.data.strategyName(m.id) + '.');
    return out;
  }

  // Chart series: one entry per day, null where there is no check-in (gaps, not zeros).
  function series(s, days, today) {
    today = today || U.today();
    const m = byDate(s);
    const out = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = U.addDays(today, -i);
      out.push(m[d] ? { date: d, mood: m[d].mood, craving: m[d].craving } : { date: d, mood: null, craving: null });
    }
    return out;
  }

  NS.logic.stats = { sorted, checkinsThisMonth, currentStreak, bestStreak, dateOfStreak, runs, goalsDone, copingUses, cravingTrend, mostUsedStrategy, insights, series };
})();
