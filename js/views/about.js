/* About #/about (spec 6.11) */
(function () {
  const U = NS.util, H = U.escapeHTML, I = NS.icons.get;

  NS.views.about = {
    title: 'About',
    render() {
      let h = '<h1>About Next Step MD</h1>';
      h += '<p class="sub">A free, private, mobile-first website for Maryland college students who are struggling with substance use or are in recovery.</p>';
      h += '<div class="card"><h2 style="margin-top:0">What it is</h2><p>Next Step MD explains how addiction works, points you to crisis lines, treatment and peer support, teaches coping strategies, and gives you a recovery planner with daily check-ins, progress charts, badges and a short daily quiz.</p>' +
        '<p>It was built as a final policy showcase project for an Intro to Psychology class. In Maryland, an estimated 86.0% of 18- to 25-year-olds who needed substance use treatment in 2022-2023 did not receive it (SAMHSA, 2024). Many students do not know where to start, or do not want to ask in person. A website is private, free and open at any hour.</p></div>';
      h += '<div class="card soft"><h2 style="margin-top:0">' + I('shield', 20, ' style="vertical-align:-4px;margin-right:6px"') + 'Privacy</h2>' +
        '<p><b>Nothing you type leaves this device.</b> There are no accounts, no cookies, no analytics and no tracking. Your plan, check-ins and quiz history are stored only in this browser. You can export or delete them any time in <a href="#/settings">Settings</a>.</p>' +
        '<p class="small" style="margin:0">If you share this device, anyone using this browser could open the site and see your entries. Use Delete everything in Settings when you are done, if that is a concern.</p></div>';
      h += '<div class="card"><h2 style="margin-top:0">Content review</h2><p>Facts on this site come from the sources below, mainly the National Institute on Drug Abuse and SAMHSA. Phone numbers and links are checked against official sites. The Learn and quiz text is being shared with campus counseling staff for review. Next Step MD is not a medical service and does not give medical advice. If you are in danger, call 911.</p></div>';
      h += '<h2>Sources</h2><ul class="sources">' + NS.data.sources.map(s => '<li>' + s.text + ' ' + U.extLink(s.url, H(s.url.replace(/^https?:\/\//, ''))) + '</li>').join('') + '</ul>';
      h += '<p class="foot">Version ' + H(NS.config.VERSION) + '</p>';
      return h;
    }
  };
})();
