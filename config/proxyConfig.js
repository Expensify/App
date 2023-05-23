/**
 * These are the base API roots used to send requests to the proxy.
 * We only specify for staging URLs as API requests are sent to the production
 * servers by default.
 */
module.exports = {
    STAGING: '/staging/',
    STAGING_SECURE: '/staging-secure/',
};
