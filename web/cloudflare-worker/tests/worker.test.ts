import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync} from 'node:fs';
import path from 'node:path';
import {after, before, describe, test} from 'node:test';

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

    test('does not publish files listed in .assetsignore', async () => {
        // Given the build contains Brotli twins and a merged source map
        for (const path of [`${HASHED_BUNDLE_PATH}.br`, '/merged-source-map.js.map']) {
            // When they are requested
            const response = await server.fetch(path);

            // Then they are not served, since they were never uploaded as assets
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

describe('production worker', () => {
    const {server, cleanup} = createWorkerHarness('production');

    before(async () => {
        await server.listen();
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
        assertTemplateInlineScriptsAllowed(csp);
    });
});
