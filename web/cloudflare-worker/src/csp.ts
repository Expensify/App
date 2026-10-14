/** Placeholder in the CSP and in `web/index.html` script tags that the Worker replaces with a per-request nonce. */
const NONCE_PLACEHOLDER = 'nonce-random-value';

type CSPOptions = {
    fontSrcHosts?: string[];
    frameSrcHosts?: string[];
    scriptSrcHashes?: string[];
};

/** Inline scripts allowed without a nonce. Tests check that every such script in `web/index.html` is listed. */
const INLINE_SCRIPT_HASHES = [
    'sha256-hK550RmP3t+9myNCpVty39wCs9CDUTXjWUP30rrXvD0=',
    'sha256-JgQ1FoMqsUqLfloUqis32MBUkR9nCO7v7MjXWfmS6eY=',
    'sha256-Xr7MaaLC2xWFhQ/khbLZgUddvDCpUuEbefj9xj/9O9s=',
    'sha256-teb83afsm9CMKzhm1Dd8p0ieUMAEb4sajrZR3sH+vPE=',
    'sha256-RvmVKfUeI9jgs3Hf2cF8pJfT96fa/A0p+uUF+ea8Cnk=',
    'sha256-ZC4Ihfl+1sv3E25DQh090ITQKwffxiocyA9C1vaePKU=',
];

function buildCSP({fontSrcHosts = [], frameSrcHosts = [], scriptSrcHashes = []}: CSPOptions): string {
    const csp: Record<string, string[]> = {
        'default-src': ["'self'", 'https://assets.onfido.com'],
        'script-src': [
            "'self'",
            `'${NONCE_PLACEHOLDER}'`,
            ...scriptSrcHashes.map((hash) => `'${hash}'`),
            "'unsafe-eval'",
            'https://*.convertexperiments.com',
            'https://*.sardine.ai/',
            'https://*.sentry.io',
            'https://accounts.google.com/gsi/client',
            'https://api.mapbox.com',
            'https://api.openai.com',
            'https://appleid.cdn-apple.com',
            'https://assets.onfido.com',
            'https://burp',
            'https://cdn.expensify.com',
            'https://cdn.ketchjs.com',
            'https://cdn.plaid.com',
            'https://connect.facebook.net',
            'https://edge.fullstory.com',
            'https://global.ketchcdn.com',
            'https://googletagmanager.com',
            'https://*.googletagmanager.com',
            'https://rs.fullstory.com',
            'https://sdk.onfido.com',
            'https://sentry.io',
            'https://snap.licdn.com',
            'https://tagmanager.google.com',
            'https://web-sdk.smartlook.com',
            'https://www.redditstatic.com',
            'https://www.woopra.com',
        ],
        'connect-src': [
            "'self'",
            'blob: *.onfido.com',
            'data:',
            'https://*.analytics.google.com',
            'https://*.convertexperiments.com',
            'https://*.doubleclick.net',
            'https://*.google-analytics.com',
            'https://*.googleapis.com',
            'https://*.googleusercontent.com',
            'https://*.pusher.com',
            'https://*.pusherapp.com',
            'https://*.sentry.io',
            'https://*.smartlook.cloud',
            'https://*.tiles.mapbox.com',
            'https://accounts.google.com/gsi/',
            'https://alb.reddit.com',
            'https://analytics.google.com',
            'https://api.mapbox.com',
            'https://api.openai.com',
            'https://cdn.expensify.com',
            'https://cdn.ketchjs.com',
            'https://connect.facebook.net',
            'https://edge.fullstory.com',
            'https://events.mapbox.com',
            'https://global.ketchcdn.com',
            'https://google-analytics.com',
            'https://googletagmanager.com',
            'https://*.googletagmanager.com',
            'https://pixel-config.reddit.com',
            'https://rs.fullstory.com',
            'https://secure.expensify.com',
            'https://sentry.io',
            'https://snap.licdn.com',
            'https://staging-secure.expensify.com',
            'https://staging.expensify.com',
            'https://telephony.onfido.com',
            'https://www.expensify.com',
            'https://www.google.com/ccm/collect',
            'https://www.google.com/ccm/form-data/942650393',
            'https://www.google.com/measurement/',
            'https://www.google.com/pagead/1p-conversion/942650393/',
            'https://www.google.com/pagead/form-data/942650393',
            'https://www.google.com/rmkt/collect/942650393/',
            'https://www.googleadservices.com/pagead/conversion/942650393/',
            'https://www.redditstatic.com',
            'https://www.woopra.com',
            'wss://*.onfido.com',
            'wss://*.pusher.com',
            'wss://sync.onfido.com',
        ],
        'img-src': [
            '*',
            'blob:',
            'data:',
            'https://*.google-analytics.com',
            'https://*.googletagmanager.com',
            'https://google-analytics.com',
            'https://googletagmanager.com',
            'https://px.ads.linkedin.com',
            'https://rs.fullstory.com',
            'https://ssl.gstatic.com',
            'https://www.facebook.com',
            'https://www.gstatic.com',
        ],
        'style-src': [
            "'self'",
            "'unsafe-inline'",
            'https://accounts.google.com/gsi/style',
            'https://assets.onfido.com',
            'https://fonts.googleapis.com',
            'https://googletagmanager.com',
            'https://sdk.onfido.com',
            'https://tagmanager.google.com',
        ],
        'font-src': ['data:', ...fontSrcHosts, 'https://fonts.gstatic.com'],
        'frame-src': [
            "'self'",
            ...frameSrcHosts,
            'https://accounts.google.com/gsi/',
            'https://app.storylane.io',
            'https://*.sardine.ai/',
            'https://cdn.plaid.com',
            'https://eu.id.group-ib.com',
            'https://expensify.navattic.com',
            'https://expensify.storylane.io',
            'https://hooks.stripe.com',
            'https://sdk.onfido.com',
            'https://secure.expensify.com',
            'https://staging.expensify.com',
            'https://td.doubleclick.net',
            'https://www.expensify.com',
            'https://www.googletagmanager.com',
        ],
        'worker-src': ["'self'", 'blob:'],
        'child-src': ["'self'", 'blob:'],
        'media-src': ['blob:', 'https://assets.onfido.com', 'https://d2k5nsl2zxldvw.cloudfront.net', 'https://staging.expensify.com', 'https://www.expensify.com'],
    };

    return Object.entries(csp)
        .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
        .join('; ');
}

const STAGING_CSP = buildCSP({
    fontSrcHosts: ["'self'"],
    frameSrcHosts: ['new-expensify://staging.new.expensify.com'],
    scriptSrcHashes: INLINE_SCRIPT_HASHES,
});

const PRODUCTION_CSP = buildCSP({
    fontSrcHosts: ["'self'", 'https://www.expensify.com'],
    frameSrcHosts: ['new-expensify://new.expensify.com'],
    scriptSrcHashes: INLINE_SCRIPT_HASHES,
});

function getCSP(environment: Env['ENVIRONMENT'], nonce: string): string {
    const csp = environment === 'staging' ? STAGING_CSP : PRODUCTION_CSP;
    return csp.replace(NONCE_PLACEHOLDER, `nonce-${nonce}`);
}

export {NONCE_PLACEHOLDER, getCSP};
