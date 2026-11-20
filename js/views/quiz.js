/* Daily quiz #/quiz (spec 6.7). Optional; never blocks other features. */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get, QE = NS.logic.quizEngine;
  let sess = null; // { nav, date, index, picks: {i: choice}, replay, end }

  function session(params, day) {
    if (sess && sess.keep && sess.date === day.date) { sess.keep = false; sess.nav = params.nav; return sess; }
    if (!sess || sess.nav !== params.nav || sess.date !== day.date) {
      const firstOpen = day.firstTry.findIndex(v => v !== true && v !== false);
      sess = { nav: params.nav, date: day.date, index: firstOpen === -1 ? 0 : firstOpen, picks: {}, replay: false, end: day.completed };
    }
    return sess;
  }

  function progressBar(i, day) {
    return '<ol class="steps plain" aria-hidden="true">' + day.questions.map((_, k) =>
      '<li class="' + (k < i || (sess.end) ? 'done' : '') + '"></li>').join('') + '</ol>';
  }

  NS.views.quiz = {
    title: 'Today\'s quiz',
    render(params) {
      const s = NS.state, today = U.today();
      const day = QE.getOrCreateDay(s, today).day;
      const ss = session(params, day);
      const n = day.questions.length;
      let h = '<h1>Today\'s quiz</h1>';

      if (ss.end) {
        const answered = QE.answeredCount(day);
        h += progressBar(n, day);
        h += '<div class="card" style="text-align:center"><p class="pill">' + answered + ' of ' + n + ' done</p>' +
          '<h2 style="margin:10px 0 4px">' + (answered === n ? 'That\'s today\'s quiz.' : 'Nice start.') + '</h2>' +
          '<p class="muted">' + (answered === n ? 'A new set of 3 questions is ready tomorrow.' : 'You can come back to the ones you skipped any time today.') + '</p></div>';
        if (answered < n) h += '<button class="btn" type="button" id="resume">Answer the skipped ' + (n - answered === 1 ? 'question' : 'questions') + '</button>';
        h += '<a class="btn ghost" href="#/learn">Read more on the Learn page</a>';
        h += '<button class="btn ghost" type="button" id="replay">Replay today\'s questions</button>';
        h += '<p class="foot">Badges are for effort, not score: finishing 5 daily quizzes earns one.</p>';
        return h;
      }

      const q = NS.data.quizById(day.questions[ss.index]);
      const pick = ss.picks[ss.index];
      const answered = pick !== undefined;
      h += progressBar(ss.index, day);
      h += '<p class="sub">Question ' + (ss.index + 1) + ' of ' + n + ' · ' + (q.type === 'tf' ? 'Myth or fact?' : 'Pick one') + (ss.replay ? ' · Replay' : '') + '</p>';
      h += '<div class="card"><p class="quiz-prompt" id="qPrompt">' + (q.type === 'tf' ? '"' + H(q.prompt) + '"' : H(q.prompt)) + '</p>';
      h += '<div role="group" aria-labelledby="qPrompt">' + q.options.map((o, i) => {
        const isRight = answered && o === q.answer, isPicked = answered && o === pick;
        return '<button type="button" class="opt' + (isRight ? ' right' : '') + (isPicked ? ' picked' : '') + '" data-opt="' + i + '" data-fid="opt-' + i + '"' + (answered ? ' disabled' : '') + '>' +
          H(o) + (isRight ? '<span class="tagline">' + (isPicked ? 'Your answer · correct' : 'Answer') + '</span>' : isPicked ? '<span class="tagline">Your answer</span>' : '') + '</button>';
      }).join('') + '</div>';
      if (answered) {
        const right = pick === q.answer;
        h += '<div class="explain' + (right ? '' : ' amber') + '" role="status"><b>' + (right ? 'That\'s right.' : 'Here\'s the surprising part:') + '</b> ' +
          (right ? '' : 'the answer is ' + H(q.answer) + '. ') + H(q.explanation) +
          '<span class="src">Source: ' + H(q.source) + ' · <a href="' + H(q.learnLink) + '">Learn more' + '</a></span></div>';
      }
      h += '</div>';
      if (answered) h += '<button class="btn" type="button" id="next" data-fid="next">' + (ss.index + 1 < n ? 'Next question' : 'Finish') + I('arrow', 18) + '</button>';
      else h += '<button class="btn ghost" type="button" id="skip">Skip this one</button>';
      h += '<p class="foot">Optional. Badges are for effort, not score.</p>';
      return h;
    },
    mount(root, params) {
      const s = NS.state, today = U.today();
      const day = QE.getDay(s, today);
      const ss = sess;
      // Persist today's picks and mark the visible question as seen.
      if (!ss.end && day.questions[ss.index]) QE.markSeen(s, day.questions[ss.index]);
      NS.storage.save(s);

      root.querySelectorAll('[data-opt]').forEach(b => b.addEventListener('click', () => {
        const q = NS.data.quizById(day.questions[ss.index]);
        const choice = q.options[+b.getAttribute('data-opt')];
        ss.picks[ss.index] = choice;
        QE.answer(s, today, ss.index, choice); // first answer only; replays never change firstTry
        NS.app.commit();
        NS.router.refresh();
        const nx = document.getElementById('next'); if (nx) nx.focus({ preventScroll: true });
      }));
      // Move to a new screen within the quiz: scroll to top and focus the heading.
      const show = () => { sess.keep = true; NS.router.render(); };
      const advance = () => {
        ss.index++;
        if (ss.index >= day.questions.length) ss.end = true;
        show();
      };
      const next = root.querySelector('#next'); if (next) next.addEventListener('click', advance);
      const skip = root.querySelector('#skip'); if (skip) skip.addEventListener('click', advance);
      const replay = root.querySelector('#replay'); if (replay) replay.addEventListener('click', () => {
        sess = { nav: ss.nav, date: day.date, index: 0, picks: {}, replay: true, end: false };
        show();
      });
      const resume = root.querySelector('#resume'); if (resume) resume.addEventListener('click', () => {
        const open = day.firstTry.findIndex(v => v !== true && v !== false);
        ss.index = open === -1 ? 0 : open; ss.end = false;
        show();
      });
    }
  };
})();
