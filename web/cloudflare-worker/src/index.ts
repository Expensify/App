import {getCSP, NONCE_PLACEHOLDER} from './csp';
import {fetchDevelopmentResponse, isAPIRequest} from './fetchDevelopmentResponse';

/** Content-hashed build output (`main-<16 hex>.bundle.js`, `main.<10 hex>.css`, ...), emitted at the root of `dist/`. */
const HASHED_ASSET_PATH = /^\/[^/]+(?:-[0-9a-f]{16}\.bundle\.js|\.[0-9a-f]{10}\.[a-z0-9]+)$/;

/** Paths that can only be files. A miss on one of these is a 404 rather than the SPA shell. */
const STATIC_FILE_PATH = /\.(?:js|mjs|css|map|json|wasm|png|jpe?g|gif|webp|avif|svg|ico|woff2?|ttf|otf|mp3|wav|ogg|lottie|pdf|txt|bcmap|br)$/i;

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

function buildAssetRequest(request: Request, url: URL): Request {
    const assetURL = new URL(url);
    assetURL.pathname = url.pathname === LEGACY_AASA_PATH ? AASA_PATH : toAssetRouterEncoding(url.pathname);
    if (assetURL.pathname === url.pathname) {
        return request;
    }
    return new Request(assetURL, request);
}

function setSecurityHeaders(headers: Headers, environment: Env['ENVIRONMENT'] | DevelopmentEnv['ENVIRONMENT'], nonce: string, connectSrcHosts: string[] = []) {
    headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
    headers.set('Content-Security-Policy', getCSP(environment, nonce, connectSrcHosts));
    headers.set('X-Frame-Options', 'SAMEORIGIN');
    headers.set('X-Content-Type-Options', 'nosniff');
    headers.set('Referrer-Policy', 'origin-when-cross-origin');
    // Used by react-native-release-profiler
    headers.set('Document-Policy', 'js-profiling');
}

function getPreviousBuildFileHeaders(object: R2Object): Headers {
    const headers = new Headers({'Cache-Control': 'public, max-age=0, must-revalidate', ETag: object.httpEtag});
    object.writeHttpMetadata(headers);
    return headers;
}

/** A file uploaded by an earlier deploy, for tabs still running that build. Null when no build had it. */
async function getPreviousBuildFile(env: Env, url: URL, method: string): Promise<Response | null> {
    if (!env.PREVIOUS_BUILDS) {
        return null;
    }

    let key: string;
    try {
        key = decodeURIComponent(url.pathname.slice(1));
    } catch {
        return null;
    }

    if (method === 'HEAD') {
        const object = await env.PREVIOUS_BUILDS.head(key);
        return object ? new Response(null, {headers: getPreviousBuildFileHeaders(object)}) : null;
    }

    const object = await env.PREVIOUS_BUILDS.get(key);
    return object ? new Response(object.body, {headers: getPreviousBuildFileHeaders(object)}) : null;
}

export default {
    async fetch(request, env): Promise<Response> {
        const url = new URL(request.url);
        const isDevelopment = env.ENVIRONMENT === 'development';
        const nonce = generateNonce();
        const isNavigation = request.headers.get('Sec-Fetch-Mode') === 'navigate';
        const isAASAPath = url.pathname === AASA_PATH || url.pathname === LEGACY_AASA_PATH;
        let assetResponse = isDevelopment ? await fetchDevelopmentResponse(request, env) : await env.ASSETS.fetch(buildAssetRequest(request, url));

        if (assetResponse.status === 101 || (isDevelopment && isAPIRequest(url.pathname))) {
            return assetResponse;
        }
        const connectSrcHosts = isDevelopment ? [url.origin.replace(/^https:/, 'wss:').replace(/^http:/, 'ws:'), ...(JSON.parse(env.DEV_CONNECT_ORIGINS) as string[])] : [];

        // The SPA fallback answers every miss with index.html. A browser asking for a missing chunk needs the file from
        // an earlier build, or a real 404.
        if (isHTMLResponse(assetResponse) && (isAASAPath || (!isNavigation && STATIC_FILE_PATH.test(url.pathname)))) {
            const previousBuildFile = isAASAPath || isDevelopment ? null : await getPreviousBuildFile(env, url, request.method);
            if (!previousBuildFile) {
                const notFound = new Response('Not Found', {status: 404, headers: {'Content-Type': 'text/plain; charset=utf-8'}});
                setSecurityHeaders(notFound.headers, env.ENVIRONMENT, nonce, connectSrcHosts);
                return notFound;
            }
            assetResponse = previousBuildFile;
        }

        const response = new Response(assetResponse.body, assetResponse);
        setSecurityHeaders(response.headers, env.ENVIRONMENT, nonce, connectSrcHosts);

        if (isAASAPath) {
            response.headers.set('Content-Type', 'application/json');
        }

        if (isDevelopment) {
            response.headers.set('Cache-Control', 'no-store');
            response.headers.delete('ETag');
            response.headers.delete('Last-Modified');
        } else if (HASHED_ASSET_PATH.test(url.pathname)) {
            response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        }

        if (!isHTMLResponse(response)) {
            return response;
        }

        // The nonce changes per request, so a 304 would pair a cached body with a CSP that no longer matches it.
        response.headers.set('Cache-Control', 'no-cache');
        response.headers.delete('ETag');
        response.headers.delete('Last-Modified');
        return new HTMLRewriter()
            .on(`script[nonce="${NONCE_PLACEHOLDER}"]`, {
                element(element) {
                    element.setAttribute('nonce', nonce);
                },
            })
            .transform(response);
    },
} satisfies ExportedHandler<Env | DevelopmentEnv>;
