/* Badge definitions and unlock rules (spec Section 7.4). Badges reward actions, never scores
 * or days abstinent, and are never taken away. */
(function () {
  const U = NS.util;
  const S = () => NS.logic.stats;

  // Each rule: test(state) -> bool. when(state) -> date it was earned (used when back-filling demo data).
  NS.data.badges = [
    { id: 'first-checkin', label: 'First check-in', art: '1', hint: 'Do your first check-in',
      test: s => s.checkins.length >= 1,
      when: s => s.checkins[0] && s.checkins[0].date },
    { id: 'streak-7', label: '7-day streak', art: '7', hint: 'Check in 7 days in a row',
      test: s => S().bestStreak(s) >= 7,
      when: s => S().dateOfStreak(s, 7) },
    { id: 'checkins-30', label: '30 check-ins', art: '30', hint: 'Check in 30 times',
      test: s => s.checkins.length >= 30,
      when: s => s.checkins[29] && s.checkins[29].date },
    { id: 'plan-finished', label: 'Plan finished', art: 'Plan', hint: 'Finish your recovery plan',
      test: s => [1, 2, 3, 4, 5, 6].every(n => s.plan.stepsDone.indexOf(n) !== -1) },
    { id: 'reached-out', label: 'Reached out', art: 'Ask', hint: 'Reach out to someone on your list',
      test: s => s.events.reachedOut >= 1 },
    { id: 'first-meeting', label: 'First meeting', art: 'Mtg', hint: 'Go to a support meeting',
      test: s => s.events.meetings >= 1 },
    { id: 'goal-done', label: 'Goal done', art: 'Goal', hint: 'Complete a goal',
      test: s => s.plan.goals.some(g => g.done),
      when: s => s.plan.goals.filter(g => g.done && g.doneAt).map(g => g.doneAt).sort()[0] },
    { id: 'learning-5', label: '5 days of learning', art: '5', hint: 'Finish 5 daily quizzes',
      test: s => s.quiz.days.filter(d => d.completed).length >= 5,
      when: s => { const d = s.quiz.days.filter(x => x.completed).map(x => x.date).sort(); return d[4]; } },
    { id: 'strategy-10', label: 'Strategy pro', art: 'Pro', hint: 'Use a coping strategy 10 times',
      test: s => s.checkins.filter(c => c.usedCoping === true).length >= 10,
      when: s => { const c = s.checkins.filter(x => x.usedCoping === true); return c[9] && c[9].date; } }
  ];

  NS.data.badgeById = id => NS.data.badges.find(b => b.id === id) || null;

  // Unlock any newly earned badges. Mutates state.badges; returns the newly earned definitions.
  // backfill: use the date each badge would have been earned (demo seeding) instead of today.
  NS.data.evaluateBadges = function (state, today, backfill) {
    today = today || U.today();
    const earned = [];
    NS.data.badges.forEach(b => {
      if (state.badges[b.id]) return; // never taken away
      let ok = false;
      try { ok = !!b.test(state); } catch (e) { ok = false; }
      if (!ok) return;
      let date = today;
      if (backfill && b.when) { const w = b.when(state); if (U.isDateStr(w)) date = w; }
      state.badges[b.id] = date;
      earned.push(b);
    });
    return earned;
  };
})();
