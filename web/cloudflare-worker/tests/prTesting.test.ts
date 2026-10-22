import {Miniflare, Request as WorkerRequest, Response as WorkerResponse} from 'miniflare';
/** Runs the PR-testing Worker in workerd with S3 requests mocked, never reaching a real PR build. */
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {after, before, describe, test} from 'node:test';
import {experimental_readRawConfig} from 'wrangler';

const WORKER_DIR = path.resolve(import.meta.dirname, '..');
const HTML = '<!doctype html><script nonce="nonce-random-value">window.fixture = true;</script><script src="/bundle.js"></script>';

describe('PR-testing worker', () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'pr-testing-worker-'));
    const pending: Array<{
        pathname: string;
        status: number;
        body: string;
        headers: Record<string, string>;
    }> = [];
    const requests: Array<{pathname: string; cacheEverything: unknown}> = [];
    let worker: Miniflare;

    function mockS3(pathname: string, status: number, body: string, headers: Record<string, string> = {}) {
        pending.push({pathname, status, body, headers});
    }

    before(async () => {
        const configPath = path.join(WORKER_DIR, 'wrangler.pr-testing.jsonc');
        execFileSync(process.execPath, [path.join(WORKER_DIR, 'node_modules/wrangler/bin/wrangler.js'), 'deploy', '--dry-run', '--config', configPath, '--outdir', tempDir], {
            env: {...process.env, WRANGLER_SEND_METRICS: 'false'},
        });
        const {rawConfig} = experimental_readRawConfig({config: configPath});
        worker = new Miniflare({
            workers: [
                {
                    config: {
                        name: rawConfig.name ?? '',
                        compatibilityDate: rawConfig.compatibility_date ?? '',
                        manifest: {
                            mainModule: 'prTesting.js',
                            modules: {
                                'prTesting.js': {
                                    type: 'esm',
                                    contents: readFileSync(path.join(tempDir, 'prTesting.js'), 'utf8'),
                                },
                            },
                        },
                    },
                    dev: {
                        outboundService: {
                            type: 'fetcher',
                            handler(request: WorkerRequest) {
                                const url = new URL(request.url);
                                assert.equal(url.origin, 'https://ad-hoc-expensify-cash.s3.amazonaws.com');
                                const expected = pending.shift();
                                assert.ok(expected, `Unexpected S3 request: ${url.pathname}`);
                                assert.equal(url.pathname, expected.pathname);
                                requests.push({
                                    pathname: url.pathname,
                                    cacheEverything: request.cf?.cacheEverything,
                                });
                                return new WorkerResponse(expected.body, {
                                    status: expected.status,
                                    headers: expected.headers,
                                });
                            },
                        },
                    },
                },
            ],
        });
        await worker.ready;
    });

    after(async () => {
        await worker?.dispose();
        rmSync(tempDir, {recursive: true, force: true});
        assert.equal(pending.length, 0, 'Every expected S3 request must be made');
    });

    function mockHTML(prNumber: string) {
        mockS3(`/web/${prNumber}/index.html`, 200, HTML, {
            'Content-Type': 'text/html',
            ETag: '"old-shell"',
            'Last-Modified': 'Wed, 01 Jan 2025 00:00:00 GMT',
        });
    }

    test('serves the S3 directory selected by the PR hostname', async () => {
        // Given two PR builds with different assets at the same path
        for (const prNumber of ['12345', '67890']) {
            mockS3(`/web/${prNumber}/bundle.js`, 200, `// PR ${prNumber}`, {
                'Content-Type': 'text/javascript',
                'Cache-Control': 'public,max-age=31536000,immutable',
            });

            // When each PR's hostname requests that asset
            const response = await worker.dispatchFetch(`https://${prNumber}.pr-testing.expensify.com/bundle.js`);

            // Then it gets its own build and retains the origin's asset caching policy
            assert.equal(response.status, 200);
            assert.equal(await response.text(), `// PR ${prNumber}`);
            assert.equal(response.headers.get('Cache-Control'), 'public,max-age=31536000,immutable');
            assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
            assert.equal(requests.at(-1)?.cacheEverything, true);
        }
    });

    test('serves the root and index.html with matching fresh CSP nonces', async () => {
        // Given two loads of the same PR's app shell
        const nonces = new Set<string>();
        for (const pathname of ['/', '/index.html']) {
            mockHTML('12345');

            // When the shell is requested at either URL
            const response = await worker.dispatchFetch(`https://12345.pr-testing.expensify.com${pathname}`);
            const html = await response.text();
            const nonce = /<script nonce="([^"]+)"/.exec(html)?.[1];
            const csp = response.headers.get('Content-Security-Policy') ?? '';

            // Then only the placeholder is replaced, matching the CSP, and HTML cannot revalidate an older nonce
            assert.ok(nonce);
            nonces.add(nonce);
            assert.ok(csp.includes(`'nonce-${nonce}'`));
            assert.doesNotMatch(html, /nonce-random-value/);
            assert.match(html, /<script src="\/bundle.js"><\/script>/);
            assert.equal(response.headers.get('Cache-Control'), 'no-cache');
            assert.equal(response.headers.get('ETag'), null);
            assert.equal(response.headers.get('Last-Modified'), null);
            assert.equal(response.headers.get('Strict-Transport-Security'), 'max-age=31536000; includeSubDomains; preload');
            assert.equal(response.headers.get('X-Frame-Options'), 'SAMEORIGIN');
            assert.equal(response.headers.get('Referrer-Policy'), 'origin-when-cross-origin');
            assert.equal(response.headers.get('Document-Policy'), 'js-profiling');
            assert.equal(requests.at(-1)?.cacheEverything, false);
        }
        assert.equal(nonces.size, 2);
    });

    test('uses the PR-testing CSP and allows the App template inline scripts', async () => {
        // Given the shared App template and PR-testing's font origin
        mockHTML('12345');

        // When a PR build is loaded
        const response = await worker.dispatchFetch('https://12345.pr-testing.expensify.com/');
        const csp = response.headers.get('Content-Security-Policy') ?? '';

        // Then PR fonts and staging frames are allowed, as is every inline script without a nonce in the template
        assert.match(csp, /font-src data: https:\/\/\*\.pr-testing\.expensify\.com/);
        assert.match(csp, /frame-src 'self' https:\/\/staging\.expensify\.com/);
        assert.doesNotMatch(csp, /new-expensify:\/\//);
        const template = readFileSync(path.resolve(WORKER_DIR, '../index.html'), 'utf8');
        const scripts = [...template.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].filter(([, attributes, body]) => !/\b(?:src|nonce)=/.test(attributes) && body.trim());
        assert.ok(scripts.length > 0);
        for (const [, , body] of scripts) {
            const hash = createHash('sha256').update(body).digest('base64');
            assert.ok(csp.includes(`'sha256-${hash}'`));
        }
        await response.text();
    });

    test('preserves the SPA fallback for non-200 S3 responses', async () => {
        // Given deep links and missing files that the original Worker answered with the app shell
        for (const [pathname, status] of [
            ['/r/123', 403],
            ['/missing.js', 404],
            ['/unavailable', 500],
        ] as const) {
            mockS3(`/web/12345${pathname}`, status, 'S3 error');
            mockHTML('12345');

            // When they are requested directly
            const response = await worker.dispatchFetch(`https://12345.pr-testing.expensify.com${pathname}`);

            // Then the shell is returned with a fresh nonce rather than changing routing during the migration
            assert.equal(response.status, 200);
            assert.match(await response.text(), /window.fixture/);
            assert.equal(response.headers.get('Cache-Control'), 'no-cache');
            assert.equal(requests.at(-1)?.cacheEverything, false);
        }
    });

    test('preserves the fallback error if no build exists for a PR', async () => {
        // Given a PR with neither the requested file nor an app shell
        mockS3('/web/12345/missing', 404, 'Missing');
        mockS3('/web/12345/index.html', 403, 'No build', {
            'Content-Type': 'application/xml',
        });

        // When the PR is opened
        const response = await worker.dispatchFetch('https://12345.pr-testing.expensify.com/missing');

        // Then the origin failure is preserved with security headers
        assert.equal(response.status, 403);
        assert.equal(await response.text(), 'No build');
        assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
    });

    test('preserves service-worker update headers without rewriting JavaScript', async () => {
        // Given the fixed-name service worker is overwritten by every build
        mockS3('/web/12345/service-worker.js', 200, '// nonce-random-value', {
            'Content-Type': 'text/javascript',
            'Cache-Control': 'no-cache,no-store,must-revalidate',
        });

        // When the browser checks for an update
        const response = await worker.dispatchFetch('https://12345.pr-testing.expensify.com/service-worker.js');

        // Then it retains the origin's no-cache policy and unchanged contents
        assert.equal(response.headers.get('Cache-Control'), 'no-cache,no-store,must-revalidate');
        assert.equal(await response.text(), '// nonce-random-value');
        assert.equal(requests.at(-1)?.cacheEverything, false);
    });
});
