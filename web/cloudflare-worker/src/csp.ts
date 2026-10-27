import NONCE_PLACEHOLDER from './noncePlaceholder';

type CSPOptions = {
    fontSrcHosts?: string[];
    frameSrcHosts?: string[];
    scriptSrcHashes?: string[];
    connectSrcHosts?: string[];
    mediaSrcHosts?: string[];
};

/** Origins only the live development Worker allows, beyond what the deployed CSP does. */
type DevelopmentOrigins = {
    /** The public Worker origin as a WebSocket origin, for Rsbuild HMR. */
    hmrOrigin: string;

    /** Local backends from `.env`, which serve API responses, attachments, and OldDot pages. */
    backendOrigins: string[];
};

/**
 * The app hardcodes this development OldDot origin (CONST.INTERNAL_DEV_EXPENSIFY_URL) for links and the wallet statement
 * iframe, so it is allowed even when no local backend is configured.
 */
const DEVELOPMENT_OLDDOT_ORIGIN = 'https://www.expensify.com.dev';

/** Inline scripts allowed without a nonce. Tests check that every such script in `web/index.html` is listed. */
const INLINE_SCRIPT_HASHES = [
    'sha256-hK550RmP3t+9myNCpVty39wCs9CDUTXjWUP30rrXvD0=',
    'sha256-JgQ1FoMqsUqLfloUqis32MBUkR9nCO7v7MjXWfmS6eY=',
    'sha256-Xr7MaaLC2xWFhQ/khbLZgUddvDCpUuEbefj9xj/9O9s=',
    'sha256-teb83afsm9CMKzhm1Dd8p0ieUMAEb4sajrZR3sH+vPE=',
    'sha256-RvmVKfUeI9jgs3Hf2cF8pJfT96fa/A0p+uUF+ea8Cnk=',
    'sha256-ZC4Ihfl+1sv3E25DQh090ITQKwffxiocyA9C1vaePKU=',
];

function buildCSP({fontSrcHosts = [], frameSrcHosts = [], scriptSrcHashes = [], connectSrcHosts = [], mediaSrcHosts = []}: CSPOptions): string {
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
            ...connectSrcHosts,
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
            'https://sandbox.transferwise.tech',
            'https://sdk.onfido.com',
            'https://secure.expensify.com',
            'https://staging.expensify.com',
            'https://td.doubleclick.net',
            'https://wise.com',
            'https://www.expensify.com',
            'https://www.googletagmanager.com',
        ],
        'worker-src': ["'self'", 'blob:'],
        'child-src': ["'self'", 'blob:'],
        'media-src': [...mediaSrcHosts, 'blob:', 'https://assets.onfido.com', 'https://d2k5nsl2zxldvw.cloudfront.net', 'https://staging.expensify.com', 'https://www.expensify.com'],
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

function getCSP(environment: Env['ENVIRONMENT'] | DevelopmentEnv['ENVIRONMENT'], nonce: string, developmentOrigins?: DevelopmentOrigins): string {
    let csp = environment === 'staging' ? STAGING_CSP : PRODUCTION_CSP;
    if (environment === 'development') {
        const backendOrigins = [...new Set([DEVELOPMENT_OLDDOT_ORIGIN, ...(developmentOrigins?.backendOrigins ?? [])])];
        csp = buildCSP({
            fontSrcHosts: ["'self'"],
            frameSrcHosts: backendOrigins,
            scriptSrcHashes: INLINE_SCRIPT_HASHES,
            connectSrcHosts: [...backendOrigins, ...(developmentOrigins ? [developmentOrigins.hmrOrigin] : [])],
            // 'self' covers attachments the Rsbuild proxy serves from the app origin.
            mediaSrcHosts: ["'self'", ...backendOrigins],
        });
    }
    return csp.replace(NONCE_PLACEHOLDER, `nonce-${nonce}`);
}

export {NONCE_PLACEHOLDER, getCSP};
export type {DevelopmentOrigins};
