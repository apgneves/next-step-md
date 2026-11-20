/* Site-wide constants. Every other file attaches to window.NS. */
window.NS = window.NS || {};
NS.data = NS.data || {};
NS.logic = NS.logic || {};
NS.views = NS.views || {};

NS.config = {
  APP_NAME: 'Next Step MD',
  VERSION: '1.0.0',
  STORAGE_KEY: 'nextstepmd.v1',
  DATA_VERSION: 1,
  // Anonymous feedback form created by the team (for example a Google or Microsoft Form).
  // Leave empty to hide the "Give feedback" button.
  FEEDBACK_URL: '',
  // true: first-time visitors are offered "Try it with sample data" (showcase mode).
  DEMO: true,
  // Hosted URL (used in README and for the poster QR code). Fill in after deploying.
  SITE_URL: 'https://apgneves.github.io/next-step-md/'
};
