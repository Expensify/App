import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {after, before, describe, test} from 'node:test';
import {brotliCompressSync} from 'node:zlib';

import createWorkerHarness from './createWorkerHarness.ts';

const HASHED_BUNDLE_PATH = '/main-0123456789abcdef.bundle.js';
// Node's fetch overwrites Sec-Fetch-Mode with the request mode. Miniflare restores this header as Sec-Fetch-Mode.
const NAVIGATION_HEADERS = {'MF-Sec-Fetch-Mode': 'navigate'};
const WEB_TEMPLATE_PATH = path.resolve(import.meta.dirname, '../../index.html');

/** The template's conditionals only wrap whole script tags, so its inline script bodies are byte-for-byte what the build emits. */
function assertTemplateInlineScriptsAllowed(csp: string) {
    const html = readFileSync(WEB_TEMPLATE_PATH, 'utf8');
    const inlineScripts = [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(([, attributes, body]) => !/\b(?:src|nonce)=/.test(attributes) && body.trim());

    assert.ok(inlineScripts.length > 0, `Expected ${WEB_TEMPLATE_PATH} to contain an inline script without a nonce`);
    for (const [, , body] of inlineScripts) {
        const hash = `sha256-${createHash('sha256').update(body).digest('base64')}`;
        assert.ok(csp.includes(`'${hash}'`), `The CSP does not allow this inline script from web/index.html (add '${hash}' to src/csp.ts):\n${body.trim().slice(0, 120)}`);
    }
}

function getHTMLNonce(html: string): string | undefined {
    return /<script nonce="([^"]+)"/.exec(html)?.[1];
}

function assertSecurityHeaders(response: Response) {
    assert.equal(response.headers.get('Strict-Transport-Security'), 'max-age=31536000; includeSubDomains; preload');
    assert.equal(response.headers.get('X-Frame-Options'), 'SAMEORIGIN');
    assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    assert.equal(response.headers.get('Referrer-Policy'), 'origin-when-cross-origin');
    assert.equal(response.headers.get('Document-Policy'), 'js-profiling');
    assert.match(response.headers.get('Content-Security-Policy') ?? '', /^default-src 'self'/);
}

describe('staging worker', () => {
    const {server, cleanup} = createWorkerHarness('staging');

    before(async () => {
        await server.listen();
    });

    after(async () => {
        await cleanup();
    });

    test('nonces the inline scripts in index.html to match the CSP header', async () => {
        // Given the app shell with a script carrying the nonce placeholder from web/index.html
        // When the browser navigates to the root
        const response = await server.fetch('/', {headers: NAVIGATION_HEADERS});
        const html = await response.text();
        const nonce = getHTMLNonce(html);

        // Then the placeholder is replaced with a nonce that the CSP header allows, so the inline script runs
        assert.equal(response.status, 200);
        assert.ok(nonce);
        assert.doesNotMatch(html, /nonce-random-value/);
        assert.ok(response.headers.get('Content-Security-Policy')?.includes(`'nonce-${nonce}'`));
        assertSecurityHeaders(response);
    });

    test('generates a different nonce on every request', async () => {
        // Given two loads of the app shell
        // When both are fetched
        const first = getHTMLNonce(await (await server.fetch('/', {headers: NAVIGATION_HEADERS})).text());
        const second = getHTMLNonce(await (await server.fetch('/', {headers: NAVIGATION_HEADERS})).text());

        // Then the nonces differ, otherwise an attacker could reuse a nonce seen in an earlier response
        assert.notEqual(first, second);
    });

    test('never gives the browser a validator for HTML', async () => {
        // Given the shell's nonce changes on every request
        // When the browser loads it
        const response = await server.fetch('/', {headers: NAVIGATION_HEADERS});

        // Then it has nothing to revalidate with, because a 304 would keep the old nonce while the new CSP header expects a new one
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('Cache-Control'), 'no-cache');
        assert.equal(response.headers.get('ETag'), null);
        assert.equal(response.headers.get('Last-Modified'), null);
    });

    test('serves the app shell for SPA deep links', async () => {
        // Given a deep link to a report, which has no matching file in the build
        // When the browser navigates to it
        const response = await server.fetch('/r/1234567890', {headers: NAVIGATION_HEADERS});

        // Then the app shell is returned so the client-side router can handle the route
        assert.equal(response.status, 200);
        assert.match(await response.text(), /New Expensify fixture/);
        assertSecurityHeaders(response);
    });

    test('serves deep links containing reserved characters without redirecting', async () => {
        // Given deep links with characters the asset router would otherwise redirect to their percent-encoded form
        for (const path of ['/settings/profile/contact-methods/someone@example.com/details', '/r/a+b:c,d']) {
            // When the browser navigates to them
            const response = await server.fetch(path, {headers: NAVIGATION_HEADERS, redirect: 'manual'});

            // Then the app shell is served at the URL as typed
            assert.equal(response.status, 200, path);
            assert.match(await response.text(), /New Expensify fixture/, path);
        }
    });

    test('sends a form POST to the same page as a GET', async () => {
        // Given a form the browser submits instead of the app, as it does when a password manager submits a login form
        for (const path of ['/', '/home', '/r/123?referrer=search', '//attacker.example/phish']) {
            // When the browser POSTs it as a page load, with the full URL so the harness keeps a path starting with `//`
            const response = await server.fetch(`https://new.expensify.com${path}`, {
                method: 'POST',
                headers: {...NAVIGATION_HEADERS, 'Content-Type': 'application/x-www-form-urlencoded'},
                body: 'login=a%40b.com',
                redirect: 'manual',
            });

            // Then it is redirected to load the same page, instead of getting a blank 405
            assert.equal(response.status, 303, path);
            // An absolute URL on the same host, so a path starting with `//` can't send the browser to another host
            assert.equal(response.headers.get('Location'), `https://new.expensify.com${path}`, path);
            assert.equal(response.headers.get('Cache-Control'), 'no-store', path);
            assert.equal(await response.text(), '', path);
            assertSecurityHeaders(response);
        }
    });

    test('serves /index.html without redirecting to /', async () => {
        // Given the service worker caches the shell ahead of time by its file name
        // When /index.html is requested
        const response = await server.fetch('/index.html');

        // Then it is served directly, so the cached entry stays valid
        assert.equal(response.status, 200);
        assert.ok(getHTMLNonce(await response.text()));
    });

    test('caches content-hashed files as immutable', async () => {
        // Given the two hashed naming schemes the web build emits: `-<16 hex>.bundle.js` for JS and `.<10 hex>.<ext>` for other assets
        for (const path of [HASHED_BUNDLE_PATH, '/main.0123456789.css']) {
            // When the browser loads them
            const response = await server.fetch(path);

            // Then they can be cached forever, because a new build always produces a new file name
            assert.equal(response.status, 200, path);
            assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable', path);
            assertSecurityHeaders(response);
        }
    });

    test('makes files without a build content hash revalidate', async () => {
        // Given files that keep their name across builds, or whose hash is not in a scheme the Worker recognizes
        for (const path of ['/version.json', '/service-worker.js', '/workbox-01234567.js']) {
            // When they are requested
            const response = await server.fetch(path);

            // Then the browser must revalidate them, so a deploy is picked up on the next update check
            assert.equal(response.status, 200, path);
            assert.doesNotMatch(response.headers.get('Cache-Control') ?? '', /immutable/, path);
            assert.match(response.headers.get('Cache-Control') ?? '', /max-age=0|no-cache/, path);
        }
    });

    test('returns 404 for a missing bundle instead of the app shell', async () => {
        // Given a tab still running an older build that lazy-loads a chunk this build does not contain
        // When the chunk is requested
        const response = await server.fetch('/main-ffffffffffffffff.bundle.js');

        // Then it gets a 404, so the client's ChunkLoadError recovery runs instead of parsing HTML as JavaScript
        assert.equal(response.status, 404);
        assert.doesNotMatch(response.headers.get('Content-Type') ?? '', /text\/html/);
        assertSecurityHeaders(response);
    });

    test('serves the app shell when navigating to a route that looks like a file', async () => {
        // Given a missing path ending in a static file extension
        const path = '/r/123/receipt.pdf';

        // When the browser navigates to it, as when a user opens a link
        const navigation = await server.fetch(path, {headers: NAVIGATION_HEADERS});

        // Then the app shell is served so the client-side router can handle it
        assert.equal(navigation.status, 200);
        assert.match(await navigation.text(), /New Expensify fixture/);

        // When the same path is fetched by a script or image tag
        const fileRequest = await server.fetch(path);

        // Then it is a 404, because a script or image request must never receive HTML
        assert.equal(fileRequest.status, 404);
    });

    test('serves the app shell when navigating to a route ending in .br', async () => {
        // Given a deep link whose last segment is a Brazilian domain, as in an email address
        // When the browser navigates to it
        const response = await server.fetch('/settings/profile/contact-methods/user@example.com.br', {headers: NAVIGATION_HEADERS});

        // Then the app shell is served, because only twins of build files are hidden
        assert.equal(response.status, 200);
        assert.match(await response.text(), /New Expensify fixture/);
    });

    test('serves the apple-app-site-association file as JSON at both paths', async () => {
        // Given the AASA file has no extension, so it gets no Content-Type from the asset store
        for (const path of ['/.well-known/apple-app-site-association', '/apple-app-site-association']) {
            // When Apple's CDN fetches it from the current or legacy location
            const response = await server.fetch(path);

            // Then it is JSON, which universal links require
            assert.equal(response.status, 200, path);
            assert.equal(response.headers.get('Content-Type'), 'application/json', path);
            assert.deepEqual(await response.json(), {applinks: {details: []}}, path);
        }
    });

    test('does not serve source maps or Brotli twins at their own URLs', async () => {
        // Given the build contains a merged source map, which .assetsignore keeps out of the upload, and Brotli twins
        for (const path of ['/merged-source-map.js.map', `${HASHED_BUNDLE_PATH}.br`, `${HASHED_BUNDLE_PATH}.%62r`, `${HASHED_BUNDLE_PATH}.BR`]) {
            // When they are requested directly
            const response = await server.fetch(path);

            // Then they are not served: maps must stay private, and twins are only served as an encoding of the original
            assert.equal(response.status, 404, path);
        }
    });

    test('uses the staging CSP', async () => {
        // Given the staging environment
        // When any page is requested
        const csp = (await server.fetch('/', {headers: NAVIGATION_HEADERS})).headers.get('Content-Security-Policy') ?? '';

        // Then the CSP allows deep links back into the staging app, and every inline script the template can render
        assert.match(csp, /new-expensify:\/\/staging\.new\.expensify\.com/);
        assertTemplateInlineScriptsAllowed(csp);
    });
});

// The test harness decodes responses before the test reads them, so the twin is identified by its ETag.
describe('staging worker serving Brotli twins', () => {
    const {server, cleanup} = createWorkerHarness('staging');
    const BROTLI = {'Accept-Encoding': 'br'};

    before(async () => {
        await server.listen();
    });

    after(async () => {
        await cleanup();
    });

    async function getETag(path: string): Promise<string> {
        const response = await server.fetch(path, {method: 'HEAD', headers: BROTLI});
        return response.headers.get('ETag') ?? '';
    }

    test("serves the build's Brotli twin", async () => {
        // Given a bundle the build also compressed with Brotli 11
        // When a browser requests it
        const response = await server.fetch(HASHED_BUNDLE_PATH, {headers: BROTLI});

        // Then it gets the twin, labeled with the original's type, so it downloads fewer bytes than edge compression gives
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('mf-content-encoding'), 'br');
        assert.match(response.headers.get('ETag') ?? '', /-br"$/);
        assert.match(response.headers.get('Content-Type') ?? '', /javascript/);
        assert.match(response.headers.get('Vary') ?? '', /Accept-Encoding/);
        assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
        assert.equal(await response.text(), 'window.fixtureBundle = true;');
        assertSecurityHeaders(response);
    });

    test('answers revalidation with 304', async () => {
        // Given files browsers revalidate on every load: one with a twin and one without
        for (const path of ['/service-worker.js', '/version.json']) {
            const etag = await getETag(path);

            // When the browser revalidates the copy it has, including after Cloudflare weakened the ETag
            for (const ifNoneMatch of [etag, `W/${etag}`, `"something-else", ${etag}`]) {
                const response = await server.fetch(path, {headers: {...BROTLI, 'If-None-Match': ifNoneMatch}});

                // Then it gets a 304 with no body instead of downloading the file again
                assert.equal(response.status, 304, `${path} ${ifNoneMatch}`);
                assert.equal(await response.text(), '', `${path} ${ifNoneMatch}`);
                assert.equal(response.headers.get('ETag'), etag, `${path} ${ifNoneMatch}`);
                assert.equal(response.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate', `${path} ${ifNoneMatch}`);
                if (path === '/service-worker.js') {
                    assert.match(response.headers.get('Vary') ?? '', /Accept-Encoding/, `${path} ${ifNoneMatch}`);
                }
            }
        }
    });

    test("does not revalidate the twin with the original's ETag", async () => {
        // Given a browser holding the original, whose ETag is the twin's without the `-br` suffix
        const originalETag = (await getETag('/service-worker.js')).replace(/-br"$/, '"');

        // When it revalidates
        const response = await server.fetch('/service-worker.js', {headers: {...BROTLI, 'If-None-Match': originalETag}});

        // Then it gets the twin in full, because its cached bytes are a different representation
        assert.equal(response.status, 200);
        assert.match(response.headers.get('ETag') ?? '', /-br"$/);
        assert.equal(await response.text(), 'self.fixtureServiceWorker = true;');
    });

    test('serves the original when the build has no twin', async () => {
        // Given a script the build did not compress
        // When a browser requests it
        const response = await server.fetch('/workbox-01234567.js', {headers: BROTLI});

        // Then it gets the original with the asset's own ETag, for Cloudflare to compress at the edge
        assert.equal(response.status, 200);
        assert.doesNotMatch(response.headers.get('ETag') ?? '', /-br"$/);
        assert.match(response.headers.get('ETag') ?? '', /^(W\/)?"[^"]+"$/);
        assert.equal(await response.text(), 'self.fixtureWorkbox = true;');
    });

    test('answers HEAD for a twin without a body', async () => {
        // Given a bundle with a twin
        // When it is requested with HEAD
        const response = await server.fetch(HASHED_BUNDLE_PATH, {method: 'HEAD', headers: BROTLI});

        // Then the headers describe the twin, without sending it
        assert.equal(response.status, 200);
        assert.match(response.headers.get('ETag') ?? '', /-br"$/);
        assert.equal(await response.text(), '');
    });
});

describe('staging worker with files from previous builds', () => {
    const {server, addPreviousBuildFiles, cleanup} = createWorkerHarness('staging');
    const PREVIOUS_CHUNK_PATH = '/main-aaaaaaaaaaaaaaaa.bundle.js';
    const PREVIOUS_TWINNED_CHUNK_PATH = '/main-bbbbbbbbbbbbbbbb.bundle.js';

    before(async () => {
        await server.listen();
        await addPreviousBuildFiles([
            {path: PREVIOUS_CHUNK_PATH.slice(1), contents: 'window.previousBuildChunk = true;', contentType: 'text/javascript'},
            {path: 'canvaskit-0.40.0.wasm', contents: 'previous wasm', contentType: 'application/wasm'},
            {path: HASHED_BUNDLE_PATH.slice(1), contents: 'window.previousCopyOfCurrentChunk = true;', contentType: 'text/javascript'},
            {path: 'r/123/receipt.pdf', contents: 'not a page', contentType: 'application/pdf'},
            {path: PREVIOUS_TWINNED_CHUNK_PATH.slice(1), contents: 'window.previousTwinnedChunk = true;', contentType: 'text/javascript'},
            {path: `${PREVIOUS_TWINNED_CHUNK_PATH.slice(1)}.br`, contents: brotliCompressSync('window.previousTwinnedChunk = true;'), contentType: 'application/octet-stream'},
        ]);
    });

    after(async () => {
        await cleanup();
    });

    test('serves a chunk the current build no longer has from a previous build', async () => {
        // Given a tab still running an older build, whose chunk was uploaded to the bucket when that build deployed
        // When the tab lazy-loads it after a newer deploy
        const response = await server.fetch(PREVIOUS_CHUNK_PATH);

        // Then it loads, so the tab keeps working instead of reloading
        assert.equal(response.status, 200);
        assert.equal(await response.text(), 'window.previousBuildChunk = true;');
        assert.equal(response.headers.get('Content-Type'), 'text/javascript');
        assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
        assertSecurityHeaders(response);
    });

    test('makes a previous build file without a content hash revalidate', async () => {
        // Given a previous build file whose name has a version instead of a content hash
        // When it is requested
        const response = await server.fetch('/canvaskit-0.40.0.wasm');

        // Then it is served, but not cached as immutable
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('Content-Type'), 'application/wasm');
        assert.equal(response.headers.get('Cache-Control'), 'public, max-age=0, must-revalidate');
    });

    test('answers HEAD for a previous build file without a body', async () => {
        // Given a chunk that only exists in a previous build
        // When it is requested with HEAD
        const response = await server.fetch(PREVIOUS_CHUNK_PATH, {method: 'HEAD'});

        // Then it reports the file exists, without sending it
        assert.equal(response.status, 200);
        assert.equal(response.headers.get('Content-Type'), 'text/javascript');
        assert.equal(await response.text(), '');
    });

    test('returns 404 when the previous builds bucket fails', async () => {
        // Given a chunk path whose bucket lookup fails (R2 rejects keys over 1,024 bytes)
        for (const method of ['GET', 'HEAD']) {
            // When it is requested
            const response = await server.fetch(`/${'a'.repeat(1100)}.bundle.js`, {method});

            // Then the Worker answers as it does for a chunk no build has, instead of throwing
            assert.equal(response.status, 404, method);
            assertSecurityHeaders(response);
        }
    });

    test('serves the current build when a previous build has the same file', async () => {
        // Given a file that is in both the current build and the bucket
        // When it is requested
        const response = await server.fetch(HASHED_BUNDLE_PATH);

        // Then the current build's copy wins, so the bucket can never replace what was just deployed
        assert.match(await response.text(), /fixtureBundle/);
    });

    test('never serves a previous build file to a navigation', async () => {
        // Given a route that looks like a file and happens to match a key in the bucket
        // When the browser navigates to it
        const response = await server.fetch('/r/123/receipt.pdf', {headers: NAVIGATION_HEADERS});

        // Then it gets the app shell, because only script and image requests can need an older build's files
        assert.equal(response.status, 200);
        assert.match(await response.text(), /New Expensify fixture/);
    });

    test("serves a previous build's Brotli twin", async () => {
        // Given an older build's chunk and its twin in the bucket
        // When a tab on that build requests the chunk
        const response = await server.fetch(PREVIOUS_TWINNED_CHUNK_PATH, {headers: {'Accept-Encoding': 'br'}});

        // Then it gets the twin, typed as JavaScript rather than with the twin's own stored type
        assert.equal(response.status, 200);
        assert.match(response.headers.get('ETag') ?? '', /-br"$/);
        assert.equal(response.headers.get('Content-Type'), 'text/javascript');
        assert.match(response.headers.get('Vary') ?? '', /Accept-Encoding/);
        assert.equal(response.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
        assert.equal(await response.text(), 'window.previousTwinnedChunk = true;');
    });

    test('answers revalidation of a previous build file with 304', async () => {
        // Given a browser holding a chunk served from the bucket
        const {headers} = await server.fetch(PREVIOUS_TWINNED_CHUNK_PATH, {method: 'HEAD', headers: {'Accept-Encoding': 'br'}});

        // When it revalidates
        const response = await server.fetch(PREVIOUS_TWINNED_CHUNK_PATH, {headers: {'Accept-Encoding': 'br', 'If-None-Match': headers.get('ETag') ?? ''}});

        // Then it gets a 304
        assert.equal(response.status, 304);
    });

    test('returns 404 for a file no build has', async () => {
        // Given a chunk that is in neither the current build nor the bucket
        // When it is requested
        const response = await server.fetch('/main-ffffffffffffffff.bundle.js');

        // Then it is a 404, so the client's ChunkLoadError recovery runs
        assert.equal(response.status, 404);
    });
});

describe('worker with a build that has no apple-app-site-association file', () => {
    const {server, cleanup} = createWorkerHarness('staging', {omittedFiles: ['.well-known/apple-app-site-association']});

    before(async () => {
        await server.listen();
    });

    after(async () => {
        await cleanup();
    });

    test('returns 404 instead of the app shell labelled as JSON', async () => {
        // Given the file has no extension, so the SPA fallback would otherwise answer a miss with index.html
        for (const path of ['/.well-known/apple-app-site-association', '/apple-app-site-association']) {
            // When Apple's CDN fetches it
            const response = await server.fetch(path);

            // Then it gets a 404, because HTML served as JSON would be read as an invalid association file
            assert.equal(response.status, 404, path);
            assert.doesNotMatch(response.headers.get('Content-Type') ?? '', /json|html/, path);
        }
    });
});

describe('test-staging worker', () => {
    const {server, cleanup} = createWorkerHarness('test-staging');

    before(async () => {
        await server.listen();
    });

    after(async () => {
        await cleanup();
    });

    test('uses the staging CSP', async () => {
        // Given the test-staging environment, which serves a staging build
        // When any page is requested
        const csp = (await server.fetch('/', {headers: NAVIGATION_HEADERS})).headers.get('Content-Security-Policy') ?? '';

        // Then it gets the staging CSP, so a staging build behaves there as it does on staging.new.expensify.com
        assert.match(csp, /new-expensify:\/\/staging\.new\.expensify\.com/);
    });
});

describe('production worker', () => {
    const {server, addPreviousBuildFiles, cleanup} = createWorkerHarness('production', {vars: {DEV_UPSTREAM: 'http://127.0.0.1:1', DEV_CONNECT_ORIGINS: '["https://dev-only.invalid"]'}});
    const PREVIOUS_CHUNK_PATH = '/main-aaaaaaaaaaaaaaaa.bundle.js';

    before(async () => {
        await server.listen();
        await addPreviousBuildFiles([{path: PREVIOUS_CHUNK_PATH.slice(1), contents: 'window.previousBuildChunk = true;', contentType: 'text/javascript'}]);
    });

    after(async () => {
        await cleanup();
    });

    test('uses the production CSP', async () => {
        // Given the production environment
        // When any page is requested
        const csp = (await server.fetch('/', {headers: NAVIGATION_HEADERS})).headers.get('Content-Security-Policy') ?? '';

        // Then the CSP allows production deep links, fonts from www.expensify.com, and every inline script the template can render
        assert.match(csp, /new-expensify:\/\/new\.expensify\.com/);
        assert.match(csp, /font-src data: 'self' https:\/\/www\.expensify\.com/);
        assert.doesNotMatch(csp, /new-expensify:\/\/staging/);
        assert.doesNotMatch(csp, /localhost|127\.0\.0\.1|expensify\.com\.dev|dev-only\.invalid/);
        assertTemplateInlineScriptsAllowed(csp);
    });

    test('serves a chunk the current build no longer has from a previous build', async () => {
        // Given a tab still running an older production build, whose chunk is in the production bucket
        // When the tab lazy-loads it after a newer deploy
        const response = await server.fetch(PREVIOUS_CHUNK_PATH);

        // Then it loads from the previous build
        assert.equal(response.status, 200);
        assert.equal(await response.text(), 'window.previousBuildChunk = true;');
    });

    test('returns 404 for a chunk no build has', async () => {
        // Given a chunk that is neither in the current build nor in the bucket
        // When it is requested
        const response = await server.fetch('/main-ffffffffffffffff.bundle.js');

        // Then it is a 404, so the tab gets a ChunkLoadError and recovers
        assert.equal(response.status, 404);
    });
});
