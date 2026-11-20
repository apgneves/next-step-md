/* Learn #/learn and #/learn/<section> (spec 6.8) */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;

  // Escape text, then turn [[Author, Year]] into a citation link to the Sources section.
  function withCites(text) {
    return H(text).replace(/\[\[([^\]]+)\]\]/g, (m, k) => '<a class="cite" href="#/learn/sources">(' + k + ')</a>');
  }

  function sourcesList() {
    return '<ul class="sources">' + NS.data.sources.map(s =>
      '<li>' + s.text + ' ' + U.extLink(s.url, H(s.url.replace(/^https?:\/\//, ''))) + '</li>').join('') + '</ul>';
  }

  function flipCard(q) {
    return '<button type="button" class="flip" aria-pressed="false" data-flip>' +
      '<span class="flip-inner">' +
      '<span class="face front"><span class="k">Myth or fact?</span><span class="stmt">"' + H(q.prompt) + '"</span><span class="tap">Tap to flip</span></span>' +
      '<span class="face back" aria-hidden="true"><span class="ans">' + H(q.answer) + '</span><span>' + H(q.explanation) + '</span><span class="src">(' + H(q.source) + ')</span></span>' +
      '</span></button>';
  }

  NS.views.learn = {
    title: 'Learn',
    render(params) {
      let h = '<h1>Learn</h1><p class="sub">Short, plain-language facts about addiction and recovery, with sources.</p>';
      h += '<a class="big-btn" href="#/quiz"><span class="ic t">' + I('learn', 22) + '</span><span class="txt"><b>Today\'s 3-question quiz</b><small>Test yourself: it helps you remember</small></span>' + I('chevron', 18) + '</a>';
      h += '<a class="big-btn" href="#/strategies"><span class="ic a">' + I('leaf', 22) + '</span><span class="txt"><b>Coping strategies</b><small>12 things to try when a craving hits</small></span>' + I('chevron', 18) + '</a>';
      NS.data.learn.forEach(sec => {
        const open = params.section === sec.id;
        h += '<details class="learn-sec" id="sec-' + sec.id + '"' + (open ? ' open' : '') + '><summary>' + H(sec.title) + I('chevron', 18, ' class="chev"') + '</summary><div class="body">';
        if (sec.body) h += sec.body.map(p => '<p>' + withCites(p) + '</p>').join('');
        if (sec.note) h += '<p class="small muted">' + H(sec.note) + '</p>';
        if (sec.flipCards) {
          h += '<p>' + H(sec.intro) + '</p>' + sec.flipCards.map(id => NS.data.quizById(id)).filter(Boolean).map(flipCard).join('');
        }
        if (sec.sources) h += sourcesList();
        h += '</div></details>';
      });
      h += '<p class="disclaimer">This page is for education, not medical advice. Talk with a health professional about your own situation. If you are in danger, call 911.</p>';
      return h;
    },
    mount(root) {
      root.querySelectorAll('[data-flip]').forEach(b => b.addEventListener('click', () => {
        const on = b.getAttribute('aria-pressed') !== 'true';
        b.setAttribute('aria-pressed', String(on));
        b.querySelector('.front').setAttribute('aria-hidden', String(on));
        b.querySelector('.back').setAttribute('aria-hidden', String(!on));
      }));
    },
    afterFocus(root, params) {
      if (!params.section) return;
      const el = root.querySelector('#sec-' + params.section);
      if (el) { el.open = true; el.scrollIntoView({ block: 'start' }); const s = el.querySelector('summary'); if (s) s.focus({ preventScroll: true }); }
    }
  };
})();
