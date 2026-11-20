/* Small pure helpers: local dates, escaping, ids, seeded random. */
(function () {
  const pad = n => String(n).padStart(2, '0');

  const util = {
    // Overridable clock (tests set NS.util.now to a fixed date).
    now: () => new Date(),

    // Local calendar date as YYYY-MM-DD.
    dateStr(d) {
      return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    },
    today() { return util.dateStr(util.now()); },

    // Parse YYYY-MM-DD as a local date at noon (avoids DST edge cases).
    parseDate(s) {
      const [y, m, d] = String(s).split('-').map(Number);
      return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0);
    },
    isDateStr(s) { return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s); },
    addDays(s, n) {
      const d = util.parseDate(s);
      d.setDate(d.getDate() + n);
      return util.dateStr(d);
    },
    // Whole days from a to b (b - a).
    daysBetween(a, b) {
      return Math.round((util.parseDate(b) - util.parseDate(a)) / 86400000);
    },
    // Day number since epoch, for rotation.
    dayNumber(s) { return Math.round(util.parseDate(s).getTime() / 86400000); },
    sameMonth(a, b) { return String(a).slice(0, 7) === String(b).slice(0, 7); },
    niceDate(s) {
      const d = util.parseDate(s);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    },
    longDate(s) {
      const d = util.parseDate(s);
      return d.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
    },

    escapeHTML(v) {
      return String(v == null ? '' : v)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    },

    // Trim and cap free text (spec 5: 300 characters).
    cleanText(v, max) {
      return String(v == null ? '' : v).replace(/\s+/g, ' ').trim().slice(0, max || 300);
    },
    cleanNote(v) {
      return String(v == null ? '' : v).trim().slice(0, 300);
    },
    // Keep digits and + ( ) - . and spaces for phone numbers.
    cleanPhone(v) {
      return String(v == null ? '' : v).replace(/[^\d+()\-. ]/g, '').trim().slice(0, 30);
    },
    telHref(v) { return 'tel:' + String(v).replace(/[^\d+]/g, ''); },

    id(prefix) {
      return (prefix || '') + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-3);
    },

    // Deterministic PRNG from a string seed (xmur3 hash + mulberry32).
    seededRandom(seed) {
      let h = 1779033703 ^ String(seed).length;
      for (let i = 0; i < String(seed).length; i++) {
        h = Math.imul(h ^ String(seed).charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
      }
      let a = (() => {
        h = Math.imul(h ^ (h >>> 16), 2246822507);
        h = Math.imul(h ^ (h >>> 13), 3266489909);
        return (h ^= h >>> 16) >>> 0;
      })();
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    shuffle(arr, rng) {
      const a = arr.slice();
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    },

    clone(o) { return JSON.parse(JSON.stringify(o)); },
    isObj(o) { return o !== null && typeof o === 'object' && !Array.isArray(o); },
    plural(n, one, many) { return n + ' ' + (n === 1 ? one : (many || one + 's')); },

    // External link with safe rel (spec 10).
    extLink(href, label, cls) {
      return '<a href="' + util.escapeHTML(href) + '" target="_blank" rel="noopener noreferrer"' +
        (cls ? ' class="' + cls + '"' : '') + '>' + label + '<span class="sr-only"> (opens in a new tab)</span></a>';
    }
  };

  NS.util = util;
})();
