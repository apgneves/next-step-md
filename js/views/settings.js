/* Settings #/settings (spec 6.11): export, import, sample data, delete, feedback. */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;
  let ui = { nav: null, confirm: null, pending: null, msg: '' }; // confirm: 'delete1' | 'delete2' | 'sample' | 'import'

  function st(params) {
    if (ui.nav !== params.nav) ui = { nav: params.nav, confirm: null, pending: null, msg: '' };
    return ui;
  }

  NS.views.settings = {
    title: 'Settings',
    render(params) {
      const s = NS.state, u = st(params);
      const QE = NS.logic.quizEngine;
      let h = '<h1>Settings</h1><p class="sub">Your data lives only in this browser on this device. Nothing is sent anywhere.</p>';
      if (u.msg) h += '<div class="note" role="status">' + H(u.msg) + '</div>';

      h += '<h2>My data</h2><div class="card">';
      h += '<p class="q" style="margin-top:0">Back up or move your data</p><p class="hint">Save a file you can import later or on another device.</p>' +
        '<button class="btn ghost" type="button" id="export">' + I('download', 18) + 'Export my data (JSON)</button>';
      h += '<label class="btn ghost" for="importFile" style="cursor:pointer">' + I('upload', 18) + 'Import data</label>' +
        '<input type="file" id="importFile" accept="application/json,.json" class="sr-only">';
      if (u.confirm === 'import' && u.pending) {
        h += '<div class="card warm" style="margin-top:10px" role="alert"><p><b>Replace your current data with this backup?</b></p>' +
          '<p class="small">The backup has ' + U.plural(u.pending.checkins.length, 'check-in') + ' and ' + U.plural(u.pending.plan.stepsDone.length, 'plan step') + ' saved. What is on this device now will be replaced.</p>' +
          '<div class="btn-row"><button class="btn" type="button" id="importYes">Replace my data</button><button class="btn ghost" type="button" id="cancel">Cancel</button></div></div>';
      }
      h += '</div>';

      h += '<h2>Sample data</h2><div class="card"><p class="hint">Fill the site with two weeks of example check-ins, a plan and badges, for demos.</p>';
      if (u.confirm === 'sample') {
        h += '<div class="card warm" role="alert"><p><b>Replace your data with sample data?</b></p><p class="small">Your current plan and check-ins will be replaced. Export first if you want to keep them.</p>' +
          '<div class="btn-row"><button class="btn" type="button" id="sampleYes">Load sample data</button><button class="btn ghost" type="button" id="cancel">Cancel</button></div></div>';
      } else {
        h += '<button class="btn ghost" type="button" id="sample">Load sample data</button>';
      }
      if (s.demo) h += '<p class="small muted" style="margin-top:8px">Sample data is loaded now. Use "Delete everything" below to clear it.</p>';
      h += '</div>';

      h += '<h2>Delete</h2><div class="card">';
      if (u.confirm === 'delete1') {
        h += '<div role="alert"><p><b>Delete everything?</b></p><p class="small">This removes your plan, check-ins, quiz history and badges from this device. It cannot be undone.</p></div>' +
          '<div class="btn-row"><button class="btn danger" type="button" id="del2">Yes, continue</button><button class="btn ghost" type="button" id="cancel">Cancel</button></div>';
      } else if (u.confirm === 'delete2') {
        h += '<div role="alert"><p><b>Last step: this cannot be undone.</b></p></div>' +
          '<div class="btn-row"><button class="btn danger confirm" type="button" id="del3">' + I('trash', 18) + 'Delete everything now</button><button class="btn ghost" type="button" id="cancel">Keep my data</button></div>';
      } else {
        h += '<p class="hint">Removes all of your data from this device.</p><button class="btn danger" type="button" id="del1">' + I('trash', 18) + 'Delete everything</button>';
      }
      h += '</div>';

      if (NS.config.FEEDBACK_URL) {
        h += '<h2>Feedback</h2><div class="card"><p class="hint">Tell the team what worked and what did not. The form is anonymous and separate from this site.</p>' +
          U.extLink(NS.config.FEEDBACK_URL, 'Give feedback', 'btn') + '</div>';
      }

      const a1 = QE.firstTryAccuracy(s, 'first-week'), a2 = QE.firstTryAccuracy(s, 'latest-week');
      h += '<h2>Learning stats</h2><div class="card"><p class="hint">First-try quiz accuracy, so you can see what you have learned.</p>' +
        (a1 ? '<p style="margin:0">First week: <b>' + a1.pct + '%</b> (' + a1.correct + ' of ' + a1.total + ')<br>Latest week: <b>' + a2.pct + '%</b> (' + a2.correct + ' of ' + a2.total + ')<br>Quiz days completed: <b>' + s.quiz.days.filter(d => d.completed).length + '</b></p>'
          : '<p class="empty">Take a daily quiz to see your stats here.</p>') + '</div>';

      h += '<p class="foot">Next Step MD version ' + H(NS.config.VERSION) + ' · <a href="#/about">About and privacy</a></p>';
      return h;
    },
    mount(root, params) {
      const u = st(params);
      const set = (patch, focusId) => {
        Object.assign(u, patch); NS.router.refresh();
        if (focusId) { const el = document.getElementById(focusId); if (el) el.focus(); }
      };
      const on = (id, fn) => { const el = root.querySelector('#' + id); if (el) el.addEventListener('click', fn); };

      on('export', () => set({ msg: NS.storage.exportJSON(NS.state) ? 'Your backup file (next-step-md-backup.json) has been saved to your downloads.' : 'Sorry, export did not work in this browser.' }));
      const file = root.querySelector('#importFile');
      file.addEventListener('change', () => {
        const f = file.files && file.files[0];
        NS.storage.importJSON(f).then(state => set({ confirm: 'import', pending: state, msg: '' }, 'importYes'))
          .catch(err => set({ msg: err.message, confirm: null, pending: null }));
      });
      on('importYes', () => {
        NS.app.replaceState(u.pending);
        set({ confirm: null, pending: null, msg: 'Your data was imported.' });
      });
      on('sample', () => {
        if (NS.storage.hasData(NS.state)) set({ confirm: 'sample', msg: '' }, 'sampleYes');
        else { NS.app.replaceState(NS.storage.seedDemo(U.today())); NS.app.toast('Sample data loaded'); NS.router.go('#/home'); }
      });
      on('sampleYes', () => { NS.app.replaceState(NS.storage.seedDemo(U.today())); NS.app.toast('Sample data loaded'); NS.router.go('#/home'); });
      on('del1', () => set({ confirm: 'delete1', msg: '' }, 'del2'));
      on('del2', () => set({ confirm: 'delete2' }, 'del3'));
      on('del3', () => {
        NS.app.replaceState(NS.storage.deleteAll(), false); // key removed; nothing re-saved
        NS.app.toast('Everything was deleted from this device.');
        NS.router.go('#/home');
      });
      on('cancel', () => set({ confirm: null, pending: null }));
    }
  };
})();
