import type {DevelopmentOrigins} from './csp';

import {getCSP, NONCE_PLACEHOLDER} from './csp';
import {isAPIRequest} from './developmentAPIProxy';
import getDevelopmentConfig from './developmentConfig';
import fetchDevelopmentResponse from './fetchDevelopmentResponse';

/** Content-hashed build output (`main-<16 hex>.bundle.js`, `main.<10 hex>.css`, ...), emitted at the root of `dist/`. */
const HASHED_ASSET_PATH = /^\/[^/]+(?:-[0-9a-f]{16}\.bundle\.js|\.[0-9a-f]{10}\.[a-z0-9]+)$/;

/** Paths that can only be files. A miss on one of these is a 404 rather than the SPA shell. */
const STATIC_FILE_PATH = /\.(?:js|mjs|css|map|json|wasm|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp3|wav|ogg|lottie|pdf|txt|bcmap|br)$/i;

/** Files the web build also emits as a Brotli 11 twin (`foo.js.br`), which is smaller than Cloudflare's edge compression. */
const PRECOMPRESSED_CONTENT_TYPES: Record<string, string> = {
    js: 'text/javascript',
    css: 'text/css',
    svg: 'image/svg+xml',
    wasm: 'application/wasm',
    ttf: 'font/ttf',
};
const PRECOMPRESSED_PATH = /\.(?:js|css|svg|wasm|ttf)$/;
const TWIN_PATH = /\.(?:js|css|svg|wasm|ttf)\.br$/i;

const REVALIDATE_CACHE_CONTROL = 'public, max-age=0, must-revalidate';

const AASA_PATH = '/.well-known/apple-app-site-association';
const LEGACY_AASA_PATH = '/apple-app-site-association';

function generateNonce(): string {
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    return btoa(String.fromCharCode(...bytes));
}

function isHTMLResponse(response: Response): boolean {
    return response.headers.get('Content-Type')?.startsWith('text/html') ?? false;
}

function getOpaqueTag(etag: string): string {
    return etag.trim().replace(/^W\//, '').replace(/^"|"$/g, '');
}

/** The twin and the original share the asset's ETag, so the twin gets its own to keep each representation's validator distinct. */
function getBrotliETag(etag: string): string {
    return `"${getOpaqueTag(etag)}-br"`;
}

/** If-None-Match uses weak comparison, and Cloudflare weakens ETags on responses it compresses. */
function matchesIfNoneMatch(request: Request, etag: string | null): boolean {
    const ifNoneMatch = request.headers.get('If-None-Match');
    if (!ifNoneMatch || !etag) {
        return false;
    }
    const opaqueTag = getOpaqueTag(etag);
    return ifNoneMatch.split(',').some((candidate) => candidate.trim() === '*' || getOpaqueTag(candidate) === opaqueTag);
}

/** Decoded, because the asset router also maps `/foo.js.%62r` to the twin. */
function isTwinPath(pathname: string): boolean {
    try {
        return TWIN_PATH.test(decodeURIComponent(pathname));
    } catch {
        return TWIN_PATH.test(pathname);
    }
}

/** The asset router 307-redirects any other encoding (`@` -> `%40`), which would change the deep link the user opened. */
function toAssetRouterEncoding(pathname: string): string {
    return pathname
        .split('/')
        .map((segment) => {
            try {
                return encodeURIComponent(decodeURIComponent(segment));
            } catch {
                return segment;
            }
        })
        .join('/');
}

/** Conditional headers are dropped, because the Worker chooses the representation and answers revalidation itself. */
function buildAssetRequest(request: Request, url: URL, pathSuffix = ''): Request {
    const assetURL = new URL(url);
    assetURL.pathname = (url.pathname === LEGACY_AASA_PATH ? AASA_PATH : toAssetRouterEncoding(url.pathname)) + pathSuffix;
    const assetRequest = new Request(assetURL, request);
    assetRequest.headers.delete('If-None-Match');
    assetRequest.headers.delete('If-Modified-Since');
    return assetRequest;
}

function setSecurityHeaders(headers: Headers, environment: Env['ENVIRONMENT'] | DevelopmentEnv['ENVIRONMENT'], nonce: string, developmentOrigins?: DevelopmentOrigins) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    headers.set('Content-Security-Policy', getCSP(environment, nonce, developmentOrigins));
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'origin-when-cross-origin');
    headers.set('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
    // Used by react-native-release-profiler
    headers.set('Document-Policy', 'js-profiling');
}

function createNotFoundResponse(environment: Env['ENVIRONMENT'] | DevelopmentEnv['ENVIRONMENT'], nonce: string, developmentOrigins?: DevelopmentOrigins): Response {
    const notFound = new Response('Not Found', {status: 404, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
    setSecurityHeaders(notFound.headers, environment, nonce, developmentOrigins);
    return notFound;
}

type ServedFile = {
    response: Response;
    isBrotli: boolean;
};

function createBrotliResponse(body: ReadableStream | null, headers: Headers, etag: string | null): Response {
    headers.set('Content-Encoding', 'br');
    // A shared fallback tag would let one twin's 304 answer another's revalidation.
    if (etag) {
        headers.set('ETag', getBrotliETag(etag));
    } else {
        headers.delete('ETag');
    }
    headers.delete('Content-Length');
    return new Response(body, {headers});
}

/** The asset, or its Brotli twin when the build has one. */
async function getAsset(env: Env, request: Request, url: URL, mayHaveTwin: boolean): Promise<ServedFile> {
    const asset = await env.ASSETS.fetch(buildAssetRequest(request, url));
    if (!mayHaveTwin || asset.status !== 200 || isHTMLResponse(asset)) {
        return {response: asset, isBrotli: false};
    }

    const twin = await env.ASSETS.fetch(buildAssetRequest(request, url, '.br'));
    if (twin.status !== 200 || isHTMLResponse(twin)) {
        await twin.body?.cancel();
        return {response: asset, isBrotli: false};
    }

    await asset.body?.cancel();
    return {response: createBrotliResponse(twin.body, new Headers(asset.headers), asset.headers.get('ETag') ?? twin.headers.get('ETag')), isBrotli: true};
}

async function getPreviousBuildObject(bucket: R2Bucket, key: string, method: string): Promise<R2Object | R2ObjectBody | null> {
    return method === 'HEAD' ? bucket.head(key) : bucket.get(key);
}

/** A file uploaded by an earlier deploy, for tabs still running that build. Null when no build had it. */
async function getPreviousBuildFile(env: Env, url: URL, method: string, mayHaveTwin: boolean): Promise<ServedFile | null> {
    if (!env.PREVIOUS_BUILDS) {
        return null;
    }

    let key: string;
    try {
        key = decodeURIComponent(url.pathname.slice(1));
    } catch {
        return null;
    }

    try {
        if (mayHaveTwin) {
            const twin = await getPreviousBuildObject(env.PREVIOUS_BUILDS, `${key}.br`, method);
            if (twin) {
                const extension = key.slice(key.lastIndexOf('.') + 1);
                // The twin's stored type describes the `.br` file, not the content it encodes.
                const headers = new Headers({'Cache-Control': REVALIDATE_CACHE_CONTROL, 'Content-Type': PRECOMPRESSED_CONTENT_TYPES[extension] ?? 'application/octet-stream'});
                return {response: createBrotliResponse('body' in twin ? twin.body : null, headers, twin.httpEtag), isBrotli: true};
            }
        }

        const object = await getPreviousBuildObject(env.PREVIOUS_BUILDS, key, method);
        if (!object) {
            return null;
        }
        const headers = new Headers({'Cache-Control': REVALIDATE_CACHE_CONTROL, ETag: object.httpEtag});
        object.writeHttpMetadata(headers);
        return {response: new Response('body' in object ? object.body : null, {headers}), isBrotli: false};
    } catch (error) {
        // A 404 lets the tab recover with a reload, as it does for a file no build has.
        console.error(`Failed to read ${key} from the previous builds bucket`, error);
        return null;
    }
}

export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);
        const isDevelopment = env.ENVIRONMENT === 'development';
        const nonce = generateNonce();

        // Twins are only served as an encoding of the original.
        if (isTwinPath(url.pathname)) {
            return createNotFoundResponse(env.ENVIRONMENT, nonce);
        }

        // The app's forms keep `method="post" action="/"` for password managers, so a submit the app doesn't cancel
        // reaches here. Static Assets only serves GET and HEAD, so load the same page instead of returning a 405.
        // Locally, API requests are POSTs through this Worker to the backend.
        if (request.method === 'POST' && !(isDevelopment && isAPIRequest(url.pathname))) {
            const redirect = new Response(null, {status: 303, headers: {Location: `${url.origin}${url.pathname}${url.search}`, 'Cache-Control': 'no-store'}});
            setSecurityHeaders(redirect.headers, env.ENVIRONMENT, nonce);
            return redirect;
        }

        const isNavigation = request.headers.get('Sec-Fetch-Mode') === 'navigate';
        const isAASAPath = url.pathname === AASA_PATH || url.pathname === LEGACY_AASA_PATH;
        const isPrecompressed = !isDevelopment && PRECOMPRESSED_PATH.test(url.pathname);
        // Cloudflare presents every request with `Accept-Encoding: br, gzip` and decodes the twin for clients without Brotli.
        let served: ServedFile;
        let developmentOrigins: DevelopmentOrigins | undefined;
        if (isDevelopment) {
            const {upstream, backendOrigins} = getDevelopmentConfig(env);
            const assetResponse = await fetchDevelopmentResponse(request, upstream);
            if (assetResponse.status === 101 || isAPIRequest(url.pathname)) {
                return assetResponse;
            }
            developmentOrigins = {hmrOrigin: url.origin.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:'), backendOrigins};
            served = {response: assetResponse, isBrotli: false};
        } else {
            served = await getAsset(env, request, url, isPrecompressed);
        }

        // The SPA fallback answers every miss with index.html. A browser asking for a missing chunk needs the file from
        // an earlier build, or a real 404.
        if (isHTMLResponse(served.response) && (isAASAPath || (!isNavigation && STATIC_FILE_PATH.test(url.pathname)))) {
            const previousBuildFile = isAASAPath || isDevelopment ? null : await getPreviousBuildFile(env, url, request.method, isPrecompressed);
            if (!previousBuildFile) {
                await served.response.body?.cancel();
                return createNotFoundResponse(env.ENVIRONMENT, nonce, developmentOrigins);
            }
            await served.response.body?.cancel();
            served = previousBuildFile;
        }

        const {response: file, isBrotli} = served;
        const headers = new Headers(file.headers);
        setSecurityHeaders(headers, env.ENVIRONMENT, nonce, developmentOrigins);

        if (isAASAPath) {
            headers.set('Content-Type', 'application/json');
        }

        if (isDevelopment) {
            headers.set('Cache-Control', 'no-store');
            headers.delete('ETag');
            headers.delete('Last-Modified');
        } else if (HASHED_ASSET_PATH.test(url.pathname)) {
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        if (!isHTMLResponse(file)) {
            if (isPrecompressed) {
                headers.append('Vary', 'Accept-Encoding');
            }

            if (matchesIfNoneMatch(request, headers.get('ETag'))) {
                await file.body?.cancel();
                headers.delete('Content-Length');
                headers.delete('Content-Encoding');
                return new Response(null, {status: 304, headers});
            }

            // The twin is already Brotli-encoded, so Cloudflare must send its bytes as they are.
            return new Response(file.body, {status: file.status, statusText: file.statusText, headers, encodeBody: isBrotli ? 'manual' : 'automatic'});
        }

        // The nonce changes per request, so a 304 would pair a cached body with a CSP that no longer matches it.
        headers.set('Cache-Control', 'no-cache');
        headers.delete('ETag');
        headers.delete('Last-Modified');
        return new HTMLRewriter()
            .on(`script[nonce="${NONCE_PLACEHOLDER}"]`, {
                element(element) {
                    element.setAttribute('nonce', nonce);
                },
            })
            .transform(new Response(file.body, {status: file.status, statusText: file.statusText, headers}));
    },
} satisfies ExportedHandler<Env | DevelopmentEnv>;
