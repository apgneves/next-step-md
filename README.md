# Next Step MD

A free, private, mobile-first website for Maryland college students who are struggling with substance use or are in recovery. Built for an Intro to Psychology final policy showcase.

It has a recovery plan wizard with a printable summary, daily check-ins, a progress chart, insights, milestone badges, a daily 3-question myth-vs-fact quiz, Learn pages with sources, a coping strategy library, and a curated Maryland help directory. A crisis bar (call or text 988) sits at the top of every screen.

**Private by design:** no accounts, no server, no cookies, no analytics, no third-party scripts or fonts. Everything a user enters is stored in `localStorage` on their own device. The site makes no network requests after the first load.

The full requirements are in `Next_Step_MD_Development_Spec.pdf`. `prototype.html` is the original single-file prototype (reference only).

**Live site:** https://apgneves.github.io/next-step-md/ (poster QR code: `assets/qr.png`)

## Run it locally

No build step and no dependencies.

- **Easiest:** double-click `index.html`. Everything works from `file://`, including saving data.
- **Local server (closer to the hosted site):** from this folder run

  ```powershell
  python -m http.server 8000
  ```

  then open http://localhost:8000.

Note that data saved under `file://` and under `http://localhost` are separate (each origin has its own storage).

## Run the tests

Open `tests/test.html` in a browser (double-click works). It runs about 100 assertions on `js/logic/*`, `js/data/badges.js`, `js/storage.js` and the content (badge thresholds, quiz selection, streaks, trends, suggestions, storage corruption, export/import, emoji and person-first language checks, Learn word counts). The page title shows PASS or FAIL. It uses its own storage key, so it never touches real data.

## Showcase / demo mode

- First-time visitors see a **Try it with sample data** card on Home. One tap loads 14 days of realistic check-ins, a 5-of-6-step plan, goals, people and 4 days of quiz history.
- Each demo path then unlocks a badge live, so visitors see the toast:
  - **Plan** tab, then **Save and see my plan** on step 6: *Plan finished*.
  - **Today's quiz**, all three questions: *5 days of learning*.
  - **Daily check-in** with "Yes" for coping strategy: *Strategy pro* (the 10th use).
  - A check-in with craving 7 or more shows the support card; craving 9 or more adds the 988/911 line and a Help link in the crisis bar.
- A banner says "Sample data. Clear it in Settings." To reset between visitors: **Settings, Delete everything** (two-step confirm), or load sample data again.
- To turn the sample-data card off, set `DEMO: false` in `js/config.js`.

## Deploy (GitHub Pages)

1. Push this folder to GitHub (the site is served from the repository root).
2. Repository **Settings, Pages**: Source "Deploy from a branch", branch `main`, folder `/ (root)`.
3. The site appears at `https://<user>.github.io/<repo>/`. Put that URL in `SITE_URL` in `js/config.js`.
4. Generate `assets/qr.png` for the poster from that URL (see below) and test it on an iPhone and an Android phone.

GitHub Pages on a **private** repository needs a paid GitHub plan (Pro, Team or Enterprise). On a free plan, either make the repository public or host the folder anywhere that serves static files (Netlify, Cloudflare Pages, a school web space).

### QR code

Any QR generator works; one option with Python:

```powershell
python -m pip install qrcode[pil]
```

```powershell
python -c "import qrcode; qrcode.make('https://YOUR-URL/').save('assets/qr.png')"
```

## Edit content

All content lives in plain data files; no code changes are needed.

| What | File |
| --- | --- |
| Help page resources (phone numbers, links, "What to expect") | `js/data/resources.js` |
| Coping strategies | `js/data/strategies.js` |
| Quiz questions | `js/data/quiz.js` |
| Learn sections and the APA source list | `js/data/learn.js` |
| Badges and unlock rules | `js/data/badges.js` |
| Feedback form link, demo flag, version | `js/config.js` |

Rules from the spec: person-first language, no emojis, warm plain wording (around grade 8), no dosing, tapering or detox instructions, and every fact must have a source. In Learn text, cite with `[[Author, Year]]`; the key must match an entry in `NS.data.sources`. Run `tests/test.html` after editing: it checks emojis, person-first language, citation keys, word counts and that no `TODO-VERIFY` text reaches users.

To add the anonymous feedback form, paste its URL into `FEEDBACK_URL` in `js/config.js`. The **Give feedback** button in Settings appears only when this is set.

## Content verification (checked 2026-11-20)

Every phone number and URL was checked against the official site where the site allowed it.

| Item | Status |
| --- | --- |
| 988 Lifeline: call, text, chat; covers substance use | Verified (988lifeline.org) |
| SMART Recovery meeting finder | Verified: `meetings.smartrecovery.org` |
| NA meeting search | Verified: `na.org/meetingsearch/` |
| AA | `aa.org/find-aa` says it has no meeting finder itself; it lists local AA contacts. Button reads "Find local AA". |
| Terps for Recovery, Tigers in Recovery (founded 2015), Scholars for Recovery | Verified on the cited program pages |
| NIDA: relapse rates similar to other chronic illnesses | Verified |
| NIDA: opioids with alcohol or benzodiazepines raise overdose risk | Verified; added as source NIDA (2022) for quiz q14 |
| MD Dept. of Health 988 page | Confirms 988 covers substance use emergencies. It does **not** say Maryland calls route to a Maryland crisis center, so that claim (spec 8.2, quiz q06) was removed. |

**Still to confirm by hand (TODO-VERIFY, flagged in the data files, not shown to users):**

- SAMHSA National Helpline 1-800-662-4357, hours and English/Spanish (samhsa.gov blocked automated checks).
- FindTreatment.gov filters (site loads; content not readable automatically).
- Maryland 211 substance-use routing (211md.org blocked automated checks).
- Quiz q11 wording against NIDA's Principles of Effective Treatment.
- Quiz q15 confidentiality wording per school.
- Larimer et al. (1999) and Roediger and Karpicke (2006) links (publisher pages blocked automated checks; citations themselves are standard).

**For team / counseling review:** quiz items q16 to q32 (marked `review: 'pending'` in `js/data/quiz.js`), q07 and q27, and the "How to help a friend" Learn section.

## Project structure

```
index.html            App shell: crisis bar, header, <main id="view">, bottom nav, script tags
css/styles.css        Design tokens and components
css/print.css         Print rules for the plan summary (one Letter page)
js/config.js          FEEDBACK_URL, DEMO flag, version
js/util.js            Local dates, escaping, ids, seeded random
js/icons.js           Inline SVG icons
js/storage.js         load / save / migrate / export / import / delete / demo seed
js/data/*.js          Content: resources, strategies, quiz, learn, badges
js/logic/*.js         stats, support suggestions, quiz engine
js/views/*.js         One file per screen: render(params) returns HTML, mount(root) wires events
js/router.js          Hash routing, nav highlight, focus and title on route change
js/app.js             Boot, commit (save + badges + toasts), crisis bar state
tests/test.html       Browser test runner
```

Scripts are classic `<script defer>` files sharing `window.NS` (no ES modules), so the site runs from `file://`.

## Data model

One `localStorage` key, `nextstepmd.v1`, holding versioned JSON (see spec Section 5). Corrupt or missing data falls back to defaults without crashing. Users can export a backup (`next-step-md-backup.json`), import it, or delete everything from Settings.
