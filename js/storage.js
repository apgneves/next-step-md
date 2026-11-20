/* Device-only storage: one localStorage key, versioned JSON. Every access is wrapped in try/catch. */
(function () {
  const U = NS.util;
  const key = () => NS.config.STORAGE_KEY;

  function defaultPlan() {
    return { stepsDone: [], reasons: [], goals: [], triggers: [], coping: [], people: [], resources: [], updatedAt: null };
  }

  function defaultState() {
    return {
      version: NS.config.DATA_VERSION,
      createdAt: U.now().toISOString(),
      demo: false,
      plan: defaultPlan(),
      checkins: [],
      quiz: { seen: [], days: [] },
      badges: {},
      events: { reachedOut: 0, meetings: 0 },
      settings: { hideDemoBanner: false, sampleCardDismissed: false }
    };
  }

  const arr = v => Array.isArray(v) ? v : [];
  const num = (v, d) => (typeof v === 'number' && isFinite(v)) ? v : d;
  const strList = (v, max) => arr(v).filter(x => typeof x === 'string').map(x => U.cleanText(x)).filter(Boolean).slice(0, max || 50);

  // Fill in missing fields and drop malformed records. Unknown top-level fields are kept.
  function normalize(s) {
    const d = defaultState();
    const out = Object.assign({}, s);
    out.version = NS.config.DATA_VERSION;
    out.createdAt = typeof s.createdAt === 'string' ? s.createdAt : d.createdAt;
    out.demo = s.demo === true;

    const p = U.isObj(s.plan) ? s.plan : {};
    out.plan = Object.assign({}, p, {
      stepsDone: arr(p.stepsDone).filter(n => Number.isInteger(n) && n >= 1 && n <= 6)
        .filter((n, i, a) => a.indexOf(n) === i).sort((a, b) => a - b),
      reasons: strList(p.reasons, 5),
      goals: arr(p.goals).filter(g => U.isObj(g) && typeof g.text === 'string' && g.text.trim()).map(g => ({
        id: typeof g.id === 'string' ? g.id : U.id('g'),
        text: U.cleanText(g.text),
        term: g.term === 'long' ? 'long' : 'short',
        done: g.done === true,
        doneAt: U.isDateStr(g.doneAt) ? g.doneAt : null
      })),
      triggers: strList(p.triggers, 30),
      coping: strList(p.coping, 30),
      people: arr(p.people).filter(x => U.isObj(x) && typeof x.name === 'string' && x.name.trim()).slice(0, 8).map(x => ({
        id: typeof x.id === 'string' ? x.id : U.id('p'),
        name: U.cleanText(x.name, 60),
        relation: U.cleanText(x.relation, 60),
        helpsWith: U.cleanText(x.helpsWith),
        phone: U.cleanPhone(x.phone)
      })),
      resources: strList(p.resources, 30),
      updatedAt: typeof p.updatedAt === 'string' ? p.updatedAt : null
    });

    // At most one check-in per date (last one wins), sorted by date.
    const byDate = {};
    arr(s.checkins).forEach(c => {
      if (!U.isObj(c) || !U.isDateStr(c.date)) return;
      const mood = num(c.mood, NaN), craving = num(c.craving, NaN);
      if (!(mood >= 1 && mood <= 5) || !(craving >= 0 && craving <= 10)) return;
      byDate[c.date] = Object.assign({}, c, {
        mood: Math.round(mood), craving: Math.round(craving),
        usedCoping: c.usedCoping === true ? true : (c.usedCoping === 'none' ? 'none' : false),
        strategy: typeof c.strategy === 'string' ? c.strategy : '',
        note: U.cleanNote(c.note)
      });
    });
    out.checkins = Object.keys(byDate).sort().map(k => byDate[k]);

    const q = U.isObj(s.quiz) ? s.quiz : {};
    out.quiz = Object.assign({}, q, {
      seen: arr(q.seen).filter(x => typeof x === 'string'),
      days: arr(q.days).filter(x => U.isObj(x) && U.isDateStr(x.date) && Array.isArray(x.questions)).map(x => ({
        date: x.date,
        questions: x.questions.filter(id => typeof id === 'string').slice(0, 3),
        firstTry: [0, 1, 2].map(i => (arr(x.firstTry)[i] === true ? true : arr(x.firstTry)[i] === false ? false : null)),
        completed: x.completed === true
      }))
    });

    out.badges = {};
    if (U.isObj(s.badges)) Object.keys(s.badges).forEach(k => { if (U.isDateStr(s.badges[k])) out.badges[k] = s.badges[k]; });

    const e = U.isObj(s.events) ? s.events : {};
    out.events = Object.assign({}, e, { reachedOut: Math.max(0, num(e.reachedOut, 0)), meetings: Math.max(0, num(e.meetings, 0)) });

    const st = U.isObj(s.settings) ? s.settings : {};
    out.settings = Object.assign({}, d.settings, st, {
      hideDemoBanner: st.hideDemoBanner === true,
      sampleCardDismissed: st.sampleCardDismissed === true
    });
    return out;
  }

  // Upgrade older versions in place. Version-less data (for example from the prototype) is normalized.
  function migrate(s) {
    if (!U.isObj(s)) return defaultState();
    // Future: if (s.version === 1) { ...; s.version = 2; }
    return normalize(s);
  }

  function load() {
    try {
      const raw = localStorage.getItem(key());
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!U.isObj(parsed)) return defaultState();
      return migrate(parsed);
    } catch (e) {
      return defaultState();
    }
  }

  function save(state) {
    try {
      localStorage.setItem(key(), JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  function remove() {
    try { localStorage.removeItem(key()); } catch (e) { /* ignore */ }
  }

  function hasData(s) {
    return s.checkins.length > 0 || s.plan.stepsDone.length > 0 || s.quiz.days.length > 0 ||
      s.plan.goals.length > 0 || s.plan.coping.length > 0 || s.events.reachedOut > 0 || s.events.meetings > 0;
  }

  // Download the state as a JSON file (blob URL: no network request).
  function exportJSON(state) {
    try {
      const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'next-step-md-backup.json';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      return true;
    } catch (e) { return false; }
  }

  // Validate an uploaded backup. Resolves with a normalized state; the caller confirms before replacing.
  function parseBackup(text) {
    let obj;
    try { obj = JSON.parse(text); } catch (e) { throw new Error('That file is not a Next Step MD backup (it is not valid JSON).'); }
    if (!U.isObj(obj) || typeof obj.version !== 'number' || !U.isObj(obj.plan) || !Array.isArray(obj.checkins)) {
      throw new Error('That file does not look like a Next Step MD backup.');
    }
    if (obj.version > NS.config.DATA_VERSION) throw new Error('That backup is from a newer version of the site.');
    return migrate(obj);
  }
  function importJSON(file) {
    return new Promise((resolve, reject) => {
      if (!file) return reject(new Error('No file chosen.'));
      if (file.size > 2000000) return reject(new Error('That file is too large to be a backup.'));
      const r = new FileReader();
      r.onload = () => { try { resolve(parseBackup(String(r.result))); } catch (e) { reject(e); } };
      r.onerror = () => reject(new Error('Could not read that file.'));
      r.readAsText(file);
    });
  }

  function deleteAll() {
    remove();
    return defaultState();
  }

  // 14 days of realistic sample data (as in the prototype). Each demo path unlocks one more badge:
  // finish the plan (step 6), finish today's quiz (5th day), log a coping strategy (10th use).
  function seedDemo(today) {
    today = today || U.today();
    const s = defaultState();
    s.demo = true;
    const mood = [2, 2, 3, 2, 3, 3, 2, 3, 4, 3, 4, 4, 3, 4];
    const crave = [8, 7, 7, 8, 6, 6, 7, 5, 5, 4, 4, 3, 4, 3];
    const used = [false, true, false, true, true, true, false, true, true, false, true, true, false, true]; // 9 uses
    const strat = ['', 'text-someone', '', 'walk-10', 'walk-10', 'urge-surf', '', 'text-someone', 'exercise', '', 'text-someone', 'urge-surf', '', 'text-someone'];
    const notes = ['Midterm week. Rough start.', '', '', 'Party invite Friday, said no.', '', '', 'Felt lonely tonight.', '', 'Gym with Jordan helped.', '', '', 'Good day.', '', ''];
    s.checkins = mood.map((m, i) => ({
      date: U.addDays(today, i - 14),
      mood: m, craving: crave[i],
      usedCoping: used[i] ? true : (crave[i] <= 3 ? 'none' : false),
      strategy: used[i] ? strat[i] : '',
      note: notes[i]
    }));
    s.plan = {
      stepsDone: [1, 2, 3, 4, 5],
      reasons: ['Stay in school', 'Health', 'Be there for my sister'],
      goals: [
        { id: 'g1', text: 'Go to one support meeting', term: 'short', done: true, doneAt: U.addDays(today, -6) },
        { id: 'g2', text: 'Check in every day this week', term: 'short', done: true, doneAt: U.addDays(today, -2) },
        { id: 'g3', text: 'Book a campus counseling appointment', term: 'short', done: false, doneAt: null },
        { id: 'g4', text: 'Finish the semester with passing grades', term: 'long', done: false, doneAt: null }
      ],
      triggers: ['Exam stress', 'Weekend parties', 'Being alone at night'],
      coping: ['text-someone', 'walk-10', 'urge-surf', 'exercise', 'custom:Play guitar'],
      people: [
        { id: 'p1', name: 'Jordan', relation: 'Roommate', helpsWith: 'Goes to the gym with me', phone: '' },
        { id: 'p2', name: 'Mom', relation: 'Family', helpsWith: 'Call any time, no questions', phone: '' },
        { id: 'p3', name: 'Campus counselor', relation: 'Counselor', helpsWith: 'Weekly appointment, Tuesdays', phone: '' }
      ],
      resources: ['988', 'samhsa-helpline'],
      updatedAt: U.parseDate(U.addDays(today, -3)).toISOString()
    };
    s.events = { reachedOut: 3, meetings: 1 };
    s.settings.sampleCardDismissed = true;

    // Four completed quiz days (the fifth, today, unlocks "5 days of learning").
    const qe = NS.logic.quizEngine;
    if (qe && NS.data.quiz) {
      const pattern = [[false, true, false], [true, false, true], [true, true, false], [true, true, true]];
      [-12, -9, -5, -2].forEach((off, i) => {
        const date = U.addDays(today, off);
        const pick = qe.pick(NS.data.quiz, s.quiz.seen, date);
        s.quiz.seen = pick.seen.concat(pick.ids);
        s.quiz.days.push({ date, questions: pick.ids, firstTry: pattern[i], completed: true });
      });
    }
    // Badges earned on the dates they would have been earned.
    if (NS.data.evaluateBadges) NS.data.evaluateBadges(s, today, true);
    return s;
  }

  NS.storage = { defaultState, defaultPlan, normalize, migrate, load, save, remove, hasData, exportJSON, importJSON, parseBackup, deleteAll, seedDemo };
})();
