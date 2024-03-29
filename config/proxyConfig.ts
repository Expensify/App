/**
 * These are the base API roots used to send requests to the proxy.
 * We only specify for staging URLs as API requests are sent to the production
 * servers by default.
 */
type ProxyConfig = {
    STAGING: string;
    STAGING_SECURE: string;
};

const proxyConfig: ProxyConfig = {
    STAGING: '/staging/',
    STAGING_SECURE: '/staging-secure/',
};

export default proxyConfig;
