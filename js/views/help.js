/* Find help #/help (spec 6.10) */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;
  const FILTERS = ['All', 'Crisis', 'Free', 'Peer support', 'Virtual', 'On campus'];
  let filter = 'All';

  function actions(r) {
    const c = r.contact;
    let h = '';
    if (c.call) h += '<a class="act' + (r.tags.indexOf('Crisis') !== -1 ? ' primary' : '') + '" href="tel:' + H(c.call.replace(/[^\d+]/g, '')) + '">' + I('phone', 16) + 'Call ' + H(c.call) + '</a>';
    if (c.text) h += '<a class="act" href="sms:' + H(c.text) + '">' + I('message', 16) + 'Text ' + H(c.text) + '</a>';
    if (c.web) h += U.extLink(c.web, I('globe', 16) + H(c.webLabel || 'Website'), 'act');
    if (c.web2) h += U.extLink(c.web2, I('globe', 16) + H(c.web2Label || 'Website'), 'act');
    return h ? '<div class="actions">' + h + '</div>' : '';
  }

  function campusExtra() {
    const people = NS.state.plan.people.filter(p => /counsel/i.test(p.relation + ' ' + p.name));
    const pinned = NS.state.plan.resources.map(id => NS.data.resources.find(r => r.id === id))
      .filter(r => r && r.tags.indexOf('On campus') !== -1 && !r.campus);
    let h = '';
    if (people.length || pinned.length) {
      h += '<p class="small" style="margin:8px 0 0"><b>From your plan:</b> ' +
        people.map(p => H(p.name) + (p.phone ? ' (<a href="' + H(U.telHref(p.phone)) + '">' + H(p.phone) + '</a>)' : '')).concat(pinned.map(r => H(r.name))).join(', ') + '</p>';
    } else {
      h += '<p class="small muted" style="margin:8px 0 0">Search your school\'s website for "counseling center". You can save the contact in <a href="#/plan/5">your plan</a>.</p>';
    }
    return h;
  }

  NS.views.help = {
    title: 'Find help',
    render() {
      let h = '<h1>Find help</h1><p class="sub">Free and confidential options in Maryland, from crisis lines to peer groups. You can reach out for yourself or a friend.</p>';
      h += '<div class="chips filters" role="group" aria-label="Filter resources">' + FILTERS.map(f =>
        '<button type="button" class="chip" data-filter="' + H(f) + '" data-fid="hf-' + H(f) + '" aria-pressed="' + (filter === f) + '">' + H(f) + '</button>').join('') + '</div>';
      const list = NS.data.resources.filter(r => filter === 'All' || r.tags.indexOf(filter) !== -1);
      h += '<p class="sr-only" aria-live="polite">' + list.length + ' resources shown</p>';
      h += list.map(r => '<article class="card res" id="res-' + r.id + '"><div>' + r.tags.map(t => '<span class="tag' + (t === 'Crisis' ? ' crisis-tag' : '') + '">' + H(t.toUpperCase()) + '</span>').join('') + '</div>' +
        '<h2 style="margin:2px 0 4px;font-size:16px">' + H(r.name) + '</h2><p style="margin:0">' + H(r.description) + '</p>' +
        (r.campus ? campusExtra() : '') + actions(r) +
        '<details><summary>' + I('chevron', 16, ' class="chev"') + 'What to expect</summary><div class="body"><p>' + H(r.expect) + '</p></div></details></article>').join('');
      h += '<p class="disclaimer">Next Step MD is not a medical service. If you are in danger, call 911.<br>Details can change, so check each service\'s own site for the latest information. <a href="#/about">About this site</a></p>';
      return h;
    },
    mount(root) {
      root.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { filter = b.getAttribute('data-filter'); NS.router.refresh(); }));
    }
  };
})();
