/* Support-suggestion rules (spec Section 7.2). Pure: returns what to show; views render it. */
(function () {
  const U = NS.util;

  // Evaluate the rules for a check-in (normally today's).
  function forCheckin(s, checkin) {
    const out = { tough: false, urgent: false, highStreak: false, noCoping: false, strategy: null, people: [] };
    if (!checkin) return out;
    out.tough = checkin.craving >= 7 || checkin.mood <= 2;
    out.urgent = checkin.craving >= 9 || checkin.mood === 1;

    const coping = s.plan.coping;
    if (out.tough && coping.length) {
      // Rotate by date so the same strategy is not always first.
      out.strategy = coping[((U.dayNumber(checkin.date) % coping.length) + coping.length) % coping.length];
    }
    if (out.tough) out.people = s.plan.people.slice(0, 2);

    // Three most recent check-ins (up to and including this one) all with craving >= 7.
    const upTo = NS.logic.stats.sorted(s).filter(c => c.date <= checkin.date);
    const last3 = upTo.slice(-3);
    out.highStreak = last3.length === 3 && last3.every(c => c.craving >= 7);

    out.noCoping = coping.length === 0;
    return out;
  }

  function todayCheckin(s, today) {
    today = today || U.today();
    return s.checkins.find(c => c.date === today) || null;
  }

  // Suggestion for today's check-in, if one was saved today.
  function today(s, todayStr) {
    return forCheckin(s, todayCheckin(s, todayStr));
  }

  // Is a support suggestion active (drives the crisis bar's second line)?
  function isActive(sug) { return !!(sug && (sug.tough || sug.highStreak)); }

  NS.data.starterStrategies = ['urge-surf', 'text-someone'];
  NS.logic.suggest = { forCheckin, today, todayCheckin, isActive };
})();
