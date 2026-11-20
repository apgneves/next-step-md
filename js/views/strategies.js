/* Coping strategies #/strategies (spec 6.9) */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;
  let filter = 'All';

  NS.views.strategies = {
    title: 'Coping strategies',
    render() {
      const coping = NS.state.plan.coping;
      let h = '<h1>Coping strategies</h1><p class="sub">Ways to get through a craving and build days that make cravings less likely. Add the ones you like to your plan.</p>';
      h += '<div class="chips filters" role="group" aria-label="Filter strategies">' + ['All'].concat(NS.data.strategyCategories).map(c =>
        '<button type="button" class="chip" data-filter="' + H(c) + '" data-fid="f-' + H(c) + '" aria-pressed="' + (filter === c) + '">' + H(c) + '</button>').join('') + '</div>';
      const list = NS.data.strategies.filter(s => filter === 'All' || s.category === filter);
      h += '<p class="sr-only" aria-live="polite">' + list.length + ' strategies shown</p>';
      h += list.map(s => {
        const inPlan = coping.indexOf(s.id) !== -1;
        return '<article class="card strat"><span class="cat">' + H(s.category) + '</span><h2 style="margin:2px 0 4px">' + H(s.name) + '</h2><p class="muted" style="margin:0">' + H(s.summary) + '</p>' +
          '<ol>' + s.steps.map(x => '<li>' + H(x) + '</li>').join('') + '</ol>' +
          '<button type="button" class="chip" style="margin-top:10px" data-add="' + s.id + '" data-fid="add-' + s.id + '" aria-pressed="' + inPlan + '">' +
          (inPlan ? I('check', 16) + 'In my plan' : I('plus', 16) + 'Add to my plan') + '<span class="sr-only">: ' + H(s.name) + '</span></button></article>';
      }).join('');
      h += '<p class="disclaimer">These are general coping ideas, not medical advice. If you are in danger, call 911.</p>';
      return h;
    },
    mount(root) {
      root.querySelectorAll('[data-filter]').forEach(b => b.addEventListener('click', () => { filter = b.getAttribute('data-filter'); NS.router.refresh(); }));
      root.querySelectorAll('[data-add]').forEach(b => b.addEventListener('click', () => {
        const id = b.getAttribute('data-add'), c = NS.state.plan.coping, i = c.indexOf(id);
        if (i === -1) c.push(id); else c.splice(i, 1);
        NS.state.plan.updatedAt = U.now().toISOString();
        NS.app.commit();
        NS.app.toast(i === -1 ? 'Added to your plan' : 'Removed from your plan');
        NS.router.refresh();
      }));
    }
  };
})();
