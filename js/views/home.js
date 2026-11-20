/* Home #/home (spec 6.2) */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;

  function bigBtn(href, icCls, icon, title, sub, done) {
    return '<a class="big-btn" href="' + href + '"><span class="ic ' + icCls + '">' + I(icon, 22) + '</span>' +
      '<span class="txt"><b>' + title + '</b><small>' + sub + '</small></span>' +
      (done ? '<span class="done">' + I('check', 14) + 'Done today</span>' : I('chevron', 18, ' class="muted"')) + '</a>';
  }

  NS.views.home = {
    title: 'Home',
    render() {
      const s = NS.state, st = NS.logic.stats, today = U.today();
      const planStarted = s.plan.stepsDone.length > 0;
      const planDone = [1, 2, 3, 4, 5, 6].every(n => s.plan.stepsDone.indexOf(n) !== -1);
      const checkedIn = !!NS.logic.suggest.todayCheckin(s, today);
      const qd = NS.logic.quizEngine.getDay(s, today);
      const quizDone = !!(qd && qd.completed);
      const badgeCount = Object.keys(s.badges).length;
      const cur = st.currentStreak(s, today), best = st.bestStreak(s);
      const showSample = NS.config.DEMO && !s.settings.sampleCardDismissed && !NS.storage.hasData(s);

      let h = '<h1>You don\'t have to have it figured out to start.</h1>' +
        '<p class="sub">Next Step MD is a free, private space where Maryland college students can learn about substance use, make a recovery plan and find help.</p>';

      if (showSample) {
        h += '<div class="card warm" id="sampleCard"><h2 style="margin-top:0">First time here?</h2>' +
          '<p>See how the planner works with two weeks of sample data. You can clear it any time in Settings.</p>' +
          '<div class="btn-row"><button class="btn" type="button" id="trySample">Try it with sample data</button>' +
          '<button class="btn ghost" type="button" id="dismissSample">Start fresh</button></div></div>';
      }

      const sug = NS.logic.suggest.today(s);
      if (sug.tough || sug.highStreak) h += NS.views.checkin.supportHTML(sug, { compact: true });

      h += '<div class="tiles">' +
        '<div class="card"><div class="n">' + st.checkinsThisMonth(s, today) + '</div><small>check-ins this month</small></div>' +
        '<div class="card"><div class="n">' + st.goalsDone(s) + '</div><small>goals done</small></div>' +
        '<div class="card"><div class="n">' + badgeCount + '</div><small>badges earned</small></div></div>';
      if (s.checkins.length) {
        h += '<p class="streakline">Current streak: ' + U.plural(cur, 'day') + ' · Best: ' + U.plural(best, 'day') + '</p>';
      } else {
        h += '<p class="streakline">Every check-in counts. Missed days never erase your progress.</p>';
      }

      h += bigBtn('#/plan', 't', 'plan', planDone ? 'View my recovery plan' : planStarted ? 'Continue my plan' : 'Make my recovery plan',
        planDone ? 'Reasons, triggers, coping and your people' : 'Goals, triggers, coping, my people', false);
      h += bigBtn('#/checkin', 'a', 'sun', 'Daily check-in', checkedIn ? 'Saved for today. Tap to update it.' : '30 seconds: mood and cravings', checkedIn);
      h += bigBtn('#/quiz', 't', 'learn', 'Today\'s 3-question quiz', quizDone ? 'Next quiz tomorrow' : 'Myths vs. facts about addiction', quizDone);
      h += bigBtn('#/help', 'r', 'help', 'Find help near me', 'Counseling, treatment, peer groups', false);

      h += '<p class="foot"><span class="pill">Private · no login</span><br>Everything you enter stays on this device.</p>';
      return h;
    },
    mount(root) {
      const t = root.querySelector('#trySample');
      if (t) t.addEventListener('click', () => {
        NS.app.replaceState(NS.storage.seedDemo(U.today()));
        NS.app.toast('Sample data loaded');
        NS.router.refresh();
        const h1 = root.querySelector('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); }
      });
      const d = root.querySelector('#dismissSample');
      if (d) d.addEventListener('click', () => {
        NS.state.settings.sampleCardDismissed = true; NS.app.commit(); NS.router.go('#/plan/1');
      });
    }
  };
})();
