/**
 * Tells expensify.com whether to serve New Expensify or Expensify Classic. The server writes the same cookie, so the name, values and lifetime must match.
 * Kept free of app imports because the service worker reads it too.
 */
const EXPERIENCE_COOKIE = {
    NAME: 'experience',
    VALUES: {
        NEW: 'new',
        CLASSIC: 'classic',
    },
    MAX_AGE_SECONDS: 365 * 24 * 60 * 60,
} as const;

export default EXPERIENCE_COOKIE;
