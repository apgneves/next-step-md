/* Daily quiz engine (spec Section 7.3). */
(function () {
  const U = NS.util;
  const PER_DAY = 3;

  // Pick 3 question ids for a date. Deterministic for (bank, seen, date).
  // Returns { ids, seen } where `seen` is the seen-list to use (cleared when a new cycle starts).
  function pick(bank, seen, date) {
    const rng = U.seededRandom('nextstepmd:' + date);
    let seenList = Array.isArray(seen) ? seen.slice() : [];
    let unseen = bank.filter(q => seenList.indexOf(q.id) === -1);
    let first = [];
    if (unseen.length < PER_DAY) {
      // New cycle: use the leftovers first, then draw from the full bank.
      first = U.shuffle(unseen, rng);
      seenList = [];
      unseen = bank.filter(q => first.indexOf(q) === -1);
    }
    const pool = first.concat(U.shuffle(unseen, rng));
    const chosen = [];
    const topics = {};
    // First pass: distinct topics.
    pool.forEach(q => {
      if (chosen.length < PER_DAY && !topics[q.topic]) { chosen.push(q); topics[q.topic] = true; }
    });
    // Fill if the pool could not supply distinct topics.
    pool.forEach(q => { if (chosen.length < PER_DAY && chosen.indexOf(q) === -1) chosen.push(q); });
    return { ids: chosen.map(q => q.id), seen: seenList };
  }

  function getDay(s, date) { return s.quiz.days.find(d => d.date === date) || null; }

  // Today's quiz record, created (and persisted by the caller) on first visit.
  function getOrCreateDay(s, date, bank) {
    date = date || U.today();
    bank = bank || NS.data.quiz;
    let day = getDay(s, date);
    if (day) return { day, created: false };
    const p = pick(bank, s.quiz.seen, date);
    s.quiz.seen = p.seen;
    day = { date, questions: p.ids, firstTry: [null, null, null], completed: false };
    s.quiz.days.push(day);
    return { day, created: true };
  }

  function markSeen(s, id) {
    if (s.quiz.seen.indexOf(id) === -1) s.quiz.seen.push(id);
  }

  // Record an answer. Only the first answer to each question counts (replays never change it).
  // Returns { correct, completedNow }.
  function answer(s, date, index, choice) {
    const day = getDay(s, date);
    if (!day) return { correct: false, completedNow: false };
    const q = NS.data.quizById(day.questions[index]);
    const correct = !!q && choice === q.answer;
    let completedNow = false;
    if (day.firstTry[index] === null || day.firstTry[index] === undefined) {
      day.firstTry[index] = correct;
      if (!day.completed && day.firstTry.slice(0, day.questions.length).every(v => v === true || v === false)) {
        day.completed = true;
        completedNow = true;
      }
    }
    return { correct, completedNow };
  }

  function answeredCount(day) {
    return day ? day.firstTry.slice(0, day.questions.length).filter(v => v === true || v === false).length : 0;
  }

  // First-try accuracy for the showcase. range: 'all' | 'first-week' | 'latest-week' | { from, to }.
  function firstTryAccuracy(s, range) {
    const days = s.quiz.days.slice().sort((a, b) => a.date < b.date ? -1 : 1);
    if (!days.length) return null;
    let from = days[0].date, to = days[days.length - 1].date;
    if (range === 'first-week') to = U.addDays(from, 6);
    else if (range === 'latest-week') from = U.addDays(to, -6);
    else if (range && typeof range === 'object') { from = range.from || from; to = range.to || to; }
    let correct = 0, total = 0;
    days.forEach(d => {
      if (d.date < from || d.date > to) return;
      d.firstTry.forEach(v => { if (v === true || v === false) { total++; if (v) correct++; } });
    });
    if (!total) return null;
    return { correct, total, pct: Math.round(correct / total * 100), from, to };
  }

  NS.logic.quizEngine = { PER_DAY, pick, getDay, getOrCreateDay, markSeen, answer, answeredCount, firstTryAccuracy };
})();
