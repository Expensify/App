/**
 * Reloads the web app while bypassing the HTTP cache for the navigation document.
 *
 * `index.html` is served with `Cache-Control: public, max-age=86400`, so Safari's HTTP
 * disk cache (and the CDN edge) can hold a stale shell that still references chunk hashes
 * which no longer exist. A plain `window.location.reload()` may be served that stale shell
 * - especially in a Safari standalone PWA, where reload cache semantics are unreliable -
 * keeping a ChunkLoadError loop alive even after the service worker and Cache Storage are
 * cleared. Navigating to a unique URL forces a cache miss at both the browser HTTP cache and
 * the edge, so the current shell (with valid chunk hashes) is fetched from the network. We
 * use `replace` so the cache-bust entry does not pollute history.
 */
const CACHE_BUST_PARAM = 'forceReload';

function reloadWithCacheBust(): void {
    if (typeof window === 'undefined' || !window.location) {
        return;
    }

    try {
        const url = new URL(window.location.href);
        url.searchParams.set(CACHE_BUST_PARAM, Date.now().toString());
        window.location.replace(url.toString());
    } catch {
        window.location.reload();
    }
}

export default reloadWithCacheBust;
