/** Serves each PR's existing S3 build through the shared wildcard PR-testing Worker. */
import {NONCE_PLACEHOLDER} from './csp';
import {generateNonce, setSecurityHeaders} from './security';

// These URLs are overwritten by every ad-hoc build, unlike the content-hashed assets.
const UNVERSIONED_PATHS = new Set(['/', '/index.html', '/service-worker.js']);

export default {
    async fetch(request): Promise<Response> {
        const url = new URL(request.url);
        const prNumber = url.hostname.split('.')[0];
        const bucketURL = `https://ad-hoc-expensify-cash.s3.amazonaws.com/web/${prNumber}`;
        const assetURL = bucketURL + (url.pathname === '/' ? '/index.html' : url.pathname);
        let assetResponse = await fetch(assetURL, {
            cf: {cacheEverything: !UNVERSIONED_PATHS.has(url.pathname)},
        });

        // Preserve the existing SPA fallback, including for missing assets, during the repository migration.
        if (assetResponse.status !== 200) {
            assetResponse = await fetch(`${bucketURL}/index.html`, {
                cf: {cacheEverything: false},
            });
        }

        const nonce = generateNonce();
        const response = new Response(assetResponse.body, assetResponse);
        setSecurityHeaders(response.headers, 'pr-testing', nonce);

        if (!response.headers.get('Content-Type')?.startsWith('text/html')) {
            return response;
        }

        // A cached HTML body must not be paired with a freshly generated CSP nonce.
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
} satisfies ExportedHandler;
