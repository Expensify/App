/** Validated settings that `npm run web` passes to the live development Worker as vars. */
type DevelopmentConfig = {
    /** The private loopback Rsbuild origin the Worker forwards to. */
    upstream: URL;

    /** Local backends from `.env`, which serve API responses, attachments, and OldDot pages. */
    backendOrigins: string[];
};

type DevelopmentVars = {
    DEV_UPSTREAM: string;
    DEV_CONNECT_ORIGINS: string;
};

function parseUpstream(value: string): URL {
    const upstream = URL.parse(value);
    if (
        upstream?.protocol !== 'http:' ||
        upstream.hostname !== '127.0.0.1' ||
        !upstream.port ||
        upstream.pathname !== '/' ||
        upstream.search ||
        upstream.hash ||
        upstream.username ||
        upstream.password
    ) {
        throw new Error(`DEV_UPSTREAM must be an HTTP loopback origin with an explicit port, got ${value}`);
    }
    return upstream;
}

function isHTTPOrigin(value: unknown): value is string {
    const url = typeof value === 'string' ? URL.parse(value) : null;
    return (url?.protocol === 'http:' || url?.protocol === 'https:') && url.origin === value;
}

function parseBackendOrigins(value: string): string[] {
    let origins: unknown;
    try {
        origins = JSON.parse(value);
    } catch {
        origins = undefined;
    }
    if (!Array.isArray(origins) || !origins.every(isHTTPOrigin)) {
        throw new Error(`DEV_CONNECT_ORIGINS must be a JSON array of HTTP(S) origins, got ${value}`);
    }
    return origins;
}

let cached: {vars: DevelopmentVars; config: DevelopmentConfig} | undefined;

/** Vars are fixed for the life of the Worker, so they are validated on first use rather than on every request. */
function getDevelopmentConfig(vars: DevelopmentVars): DevelopmentConfig {
    if (cached?.vars.DEV_UPSTREAM !== vars.DEV_UPSTREAM || cached.vars.DEV_CONNECT_ORIGINS !== vars.DEV_CONNECT_ORIGINS) {
        const config = {upstream: parseUpstream(vars.DEV_UPSTREAM), backendOrigins: parseBackendOrigins(vars.DEV_CONNECT_ORIGINS)};
        cached = {vars: {DEV_UPSTREAM: vars.DEV_UPSTREAM, DEV_CONNECT_ORIGINS: vars.DEV_CONNECT_ORIGINS}, config};
    }
    return cached.config;
}

export default getDevelopmentConfig;
export type {DevelopmentConfig};
