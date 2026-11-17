/**
 * Classifies navigations on the host that serves both New Expensify and Expensify Classic. Each pattern is tested against the pathname and query.
 * The service worker bundles this module, so it must not import app code.
 *
 * - App-only paths are rendered only by New Expensify, so the worker can open its saved app for them.
 * - Shared paths are served by both products, and the experience cookie on the server decides which one, so the worker must ask the network.
 * - Any other path belongs to Expensify Classic or the backend, and the worker leaves it alone.
 *
 * Expensify Classic matches paths case-sensitively and only serves the exact shape of each shared path, so deeper paths under a shared path are app-only.
 * Every pattern ends at a segment boundary, because Classic pages share prefixes with app routes (`/r` and `/reports`, `/a` and `/admin`).
 */

const SEGMENT_END = String.raw`(?:\/|\?|$)`;
const OPTIONAL_TRAILING_SLASH = String.raw`\/?(?:\?|$)`;
const SEGMENT = String.raw`[^/?]+`;

/** First path segments that only New Expensify serves. */
const APP_ONLY_FIRST_SEGMENTS = [
    // Routes
    'transition',
    'connection-complete',
    'bank-connection-complete',
    'sign-in-with-saml',
    'workspaces',
    'workspace',
    'domains',
    'domain',
    'search',
    'search-router',
    'r',
    'e',
    'new',
    'attachment',
    'auto-submit',
    'bank-account',
    'enable-payments',
    'submit-expense',
    'track-expense',
    'sign-in-modal',
    'restricted-action',
    'set-default-workspace',
    'onboarding',
    'debug',
    'test-tools',
    'track-training',
    'travel-dot-link',
    'multifactor-authentication',
    'reject',
    'insights',
    'pay',
    'share',
    'manual',
    'scan',
    'start',
    'time',
    'per-diem',
    'distance',
    'distance-map',
    'distance-manual',
    'distance-gps',
    'distance-odometer',
    'eReceipt',
    'setting',
    // Money request actions (`/:action/:iouType/...`)
    'create',
    'edit',
    'submit',
    'categorize',
    // Dynamic routes that can open from any screen, including the root
    'add-payment-card',
    'add-us-bank-account',
    'app-download-links',
    'beta-overrides',
    'contact-methods',
    'enter-signer-info',
    'exit-survey',
    'keyboard-shortcuts',
    'money-request-upgrade',
    'new-report-workspace-selection',
    'personal-card',
    'two-factor-auth',
    'a',
    'avatar',
    'referral',
    'task-details',
    // Old links that New Expensify redirects to current routes
    'flag',
    'merge',
    'missing-personal-details',
    'home-page',
    // Alias of /home; Classic only serves the lowercase path
    'Home',
];

const APP_ONLY_NAVIGATION_PATHS: RegExp[] = [
    new RegExp(String.raw`^\/(?:${APP_ONLY_FIRST_SEGMENTS.join('|')})${SEGMENT_END}`),

    // The installed app shell, which upgrade navigations load
    /^\/index\.html(?:\?|$)/,

    // Deeper paths under shared paths
    new RegExp(String.raw`^\/(?:settings|home|inbox|travel)\/${SEGMENT}`),
    new RegExp(String.raw`^\/statements\/${SEGMENT}\/${SEGMENT}`),
    new RegExp(String.raw`^\/[uv]\/${SEGMENT}\/${SEGMENT}\/${SEGMENT}`),

    // Deeper paths under Classic pages
    new RegExp(String.raw`^\/policy\/${SEGMENT}\/copy-settings${SEGMENT_END}`),
    new RegExp(String.raw`^\/reports\/reject\/${SEGMENT}`),
];

const SHARED_NAVIGATION_PATHS: RegExp[] = [
    /^\/(?:\?|$)/,
    new RegExp(String.raw`^\/(?:inbox|home|settings|travel)${OPTIONAL_TRAILING_SLASH}`),
    new RegExp(String.raw`^\/statements\/${SEGMENT}${OPTIONAL_TRAILING_SLASH}`),
    new RegExp(String.raw`^\/[uv]\/${SEGMENT}\/${SEGMENT}${OPTIONAL_TRAILING_SLASH}`),
];

/** Expensify Classic sign-out pages, including the identity provider's SAML sign-out callback. */
const SIGN_OUT_NAVIGATION_PATHS: RegExp[] = [/^\/signout(?:\.php)?\/?(?:\?|$)/, /^\/authentication\/saml\/logoutCallback\.php(?:\?|$)/];

export {APP_ONLY_NAVIGATION_PATHS, SHARED_NAVIGATION_PATHS, SIGN_OUT_NAVIGATION_PATHS};
