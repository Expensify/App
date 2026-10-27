/** Exercise the live forwarding path in real workerd against a loopback HTTP/WebSocket server. */
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {once} from 'node:events';
import {cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import http from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {after, before, describe, test} from 'node:test';
import {setTimeout as delay} from 'node:timers/promises';
import {experimental_readRawConfig} from 'wrangler';
import {WebSocket, WebSocketServer} from 'ws';

describe('live development worker', () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), 'live-worker-'));
    const upstream = http.createServer(async (request, response) => {
        if (request.url?.startsWith('/echo') || request.url?.startsWith('/api/echo')) {
            const chunks = [];
            for await (const chunk of request) {
                chunks.push(chunk);
            }
            response.setHeader('Content-Type', 'application/json');
            response.end(JSON.stringify({method: request.method, url: request.url, body: Buffer.concat(chunks).toString(), validator: request.headers['if-none-match'] ?? null}));
        } else if (request.url === '/redirect') {
            const address = upstream.address();
            assert.ok(address && typeof address !== 'string');
            response.writeHead(302, {Location: `http://127.0.0.1:${address.port}/target?next=1`});
            response.end();
        } else if (request.url === '/stream.txt') {
            response.setHeader('Content-Type', 'text/plain');
            response.write('first ');
            setImmediate(() => response.end('second'));
        } else if (request.url?.startsWith('/api/') || request.url?.startsWith('/receipts/')) {
            response.writeHead(403, {'Content-Type': 'text/html', 'Cache-Control': 'private'});
            response.end('backend error, not the app shell');
        } else if (request.url === '/.well-known/apple-app-site-association') {
            response.end('{"applinks":{}}');
        } else if (request.url === '/main-0123456789abcdef.bundle.js') {
            response.writeHead(200, {'Content-Type': 'application/javascript', ETag: 'bundle'});
            response.end('console.log("dev bundle");');
        } else {
            response.writeHead(200, {'Content-Type': 'text/html', ETag: 'html', 'Last-Modified': new Date().toUTCString()});
            response.end('<!doctype html><script nonce="nonce-random-value">window.fixture = true</script><div>app shell</div>');
        }
    });
    const sockets = new WebSocketServer({server: upstream});
    sockets.on('connection', (socket, request) => {
        socket.on('message', (message) => socket.send(`${request.url}:${message.toString()}`));
    });
    let origin: string;
    let worker: ReturnType<typeof spawn>;
    const server = {fetch: (url: string, init?: RequestInit) => fetch(`${origin}${url}`, init)};
    before(async () => {
        upstream.listen(0, '127.0.0.1');
        await once(upstream, 'listening');
        const address = upstream.address();
        assert.ok(address && typeof address !== 'string');
        const portReservation = http.createServer();
        portReservation.listen(0, '127.0.0.1');
        await once(portReservation, 'listening');
        const reservedAddress = portReservation.address();
        assert.ok(reservedAddress && typeof reservedAddress !== 'string');
        const port = reservedAddress.port;
        await new Promise<void>((resolve) => portReservation.close(() => resolve()));
        origin = `http://127.0.0.1:${port}`;
        cpSync(path.resolve(import.meta.dirname, '../src'), path.join(tempDir, 'src'), {recursive: true});
        const {rawConfig} = experimental_readRawConfig({config: path.resolve(import.meta.dirname, '../wrangler.dev.jsonc')});
        const {rawConfig: deployedConfig} = experimental_readRawConfig({config: path.resolve(import.meta.dirname, '../wrangler.jsonc')});
        assert.equal(rawConfig.compatibility_date, deployedConfig.compatibility_date, 'Live and deployed Workers must use the same runtime compatibility date');
        const configPath = path.join(tempDir, 'wrangler.json');
        writeFileSync(configPath, JSON.stringify({...rawConfig, main: './src/index.ts'}));
        worker = spawn(
            process.execPath,
            [
                'node_modules/wrangler/bin/wrangler.js',
                'dev',
                '--local',
                '--config',
                configPath,
                '--ip',
                '127.0.0.1',
                '--port',
                String(port),
                '--inspector-port',
                '0',
                '--var',
                `DEV_UPSTREAM:http://127.0.0.1:${address.port}`,
                '--var',
                'DEV_CONNECT_ORIGINS:["http://backend.test:8080"]',
            ],
            {cwd: path.resolve(import.meta.dirname, '..'), env: {...process.env, WRANGLER_SEND_METRICS: 'false'}},
        );
        await new Promise<void>((resolve, reject) => {
            const timeout = setTimeout(() => reject(new Error('Wrangler did not start')), 20000);
            worker.stdout?.on('data', (data) => {
                if (String(data).includes('Ready on')) {
                    clearTimeout(timeout);
                    resolve();
                }
            });
            worker.stderr?.on('data', (data) => process.stderr.write(data));
            worker.once('exit', (code) => {
                clearTimeout(timeout);
                reject(new Error(`Wrangler exited before readiness: ${code}`));
            });
        });
    });
    after(async () => {
        if (worker && worker.exitCode === null && worker.signalCode === null) {
            worker.kill('SIGTERM');
            await once(worker, 'exit');
        }
        for (const socket of sockets.clients) {
            socket.terminate();
        }
        await new Promise<void>((resolve) => sockets.close(() => resolve()));
        await new Promise<void>((resolve) => upstream.close(() => resolve()));
        rmSync(tempDir, {recursive: true, force: true});
    });

    test('forwards POST bodies, queries, and HEAD without consuming the response twice', async () => {
        // Given a real HTTP upstream
        // When an API POST with a query passes through the Worker
        const response = await server.fetch('/api/echo?q=reserved%40value', {method: 'POST', body: 'posted payload'});
        // Then the request reaches the upstream unchanged and HEAD has no body
        assert.deepEqual(await response.json(), {method: 'POST', url: '/api/echo?q=reserved%40value', body: 'posted payload', validator: null});
        assert.equal(await (await server.fetch('/echo', {method: 'HEAD'})).text(), '');
    });

    test('sends a form POST to the same page as a GET, like the deployed Worker', async () => {
        // Given a form submit the app didn't cancel, which Rsbuild can't serve
        // When the browser POSTs it as a page load
        const response = await server.fetch('/home?x=1', {method: 'POST', body: 'login=a%40b.com', redirect: 'manual'});
        // Then it is redirected to load the same page, instead of reaching the upstream
        assert.equal(response.status, 303);
        assert.equal(response.headers.get('Location'), '/home?x=1');
        assert.equal(await response.text(), '');
    });

    test('transforms HTML and removes validators, including on conditional requests', async () => {
        // Given cached HTML
        // When a conditional navigation reaches the live Worker
        const response = await server.fetch('/settings/profile', {headers: {'If-None-Match': 'html'}});
        const html = await response.text();
        const nonce = /nonce="([^"]+)"/.exec(html)?.[1];
        // Then the returned body and CSP agree, no validator survives, and a new load has a new nonce
        assert.equal(response.status, 200);
        assert.ok(nonce && nonce !== 'nonce-random-value');
        assert.ok(response.headers.get('Content-Security-Policy')?.includes(`'nonce-${nonce}'`));
        assert.equal(response.headers.get('ETag'), null);
        assert.equal(response.headers.get('Last-Modified'), null);
        assert.equal(response.headers.get('X-Content-Type-Options'), 'nosniff');
        assert.doesNotMatch(await (await server.fetch('/')).text(), new RegExp(nonce));
        assert.equal(((await (await server.fetch('/echo', {headers: {'If-None-Match': 'html'}})).json()) as {validator: string | null}).validator, null);
    });

    test('allows only explicit development connections alongside the normal CSP', async () => {
        // Given explicit local backend settings
        // When the Worker serves a page
        const csp = (await server.fetch('/')).headers.get('Content-Security-Policy') ?? '';
        // Then HMR and that backend are allowed without weakening script enforcement
        assert.ok(csp.includes(origin.replace('http:', 'ws:')));
        assert.ok(csp.includes('https://www.expensify.com.dev'));
        assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'|connect-src \*/);
    });

    test('adds only configured backends and the OldDot origin the app hardcodes', async () => {
        // Given a backend from .env, and the app's hardcoded development OldDot URL (CONST.INTERNAL_DEV_EXPENSIFY_URL)
        // When the Worker serves a page
        const csp = (await server.fetch('/')).headers.get('Content-Security-Policy') ?? '';
        // Then both are allowed, and unconfigured or server-side-only origins are not
        assert.ok(csp.includes('http://backend.test:8080'));
        assert.match(csp, /frame-src [^;]*https:\/\/www\.expensify\.com\.dev/);
        assert.doesNotMatch(csp, /secure\.expensify\.com\.dev|localhost:9000/);
    });

    test('allows local backends to serve videos and the OldDot statement iframe', async () => {
        // Given proxied attachments, the default local OldDot and a configured backend
        // When the Worker serves a page
        const csp = (await server.fetch('/')).headers.get('Content-Security-Policy') ?? '';
        const getSources = (directive: string) => new RegExp(`(?:^|; )${directive} ([^;]*)`).exec(csp)?.[1].split(' ') ?? [];
        // Then videos load from the app origin and every local backend, which can also be framed
        for (const source of ["'self'", 'https://www.expensify.com.dev', 'http://backend.test:8080']) {
            assert.ok(getSources('media-src').includes(source), `media-src is missing ${source}`);
        }
        for (const source of ['https://www.expensify.com.dev', 'http://backend.test:8080']) {
            assert.ok(getSources('frame-src').includes(source), `frame-src is missing ${source}`);
        }
        // And the HMR WebSocket stays a connect-only source
        const hmrOrigin = origin.replace('http:', 'ws:');
        assert.ok(!getSources('media-src').includes(hmrOrigin) && !getSources('frame-src').includes(hmrOrigin));
    });

    test('does not apply immutable caching to live bundles or mistake missing files for the shell', async () => {
        // Given a live bundle and an unknown static asset
        // When both are fetched
        const bundle = await server.fetch('/main-0123456789abcdef.bundle.js');
        const missing = await server.fetch('/missing.js');
        // Then edits cannot be hidden behind immutable caching and missing JS is not HTML
        assert.equal(bundle.headers.get('Cache-Control'), 'no-store');
        assert.equal(missing.status, 404);
        assert.match(missing.headers.get('Content-Type') ?? '', /text\/plain/);
        // And the 404 keeps the development CSP, like every other live response
        assert.ok(missing.headers.get('Content-Security-Policy')?.includes(origin.replace('http:', 'ws:')));
    });

    test('preserves backend errors/downloads without treating HTML errors as SPA responses', async () => {
        // Given API and receipt paths
        // When the backend returns its own HTML error
        for (const url of ['/api/Test', '/receipts/test.pdf']) {
            const response = await server.fetch(url);
            // Then status, body and private caching survive without Worker HTML rewriting
            assert.equal(response.status, 403);
            assert.equal(await response.text(), 'backend error, not the app shell');
            assert.equal(response.headers.get('Cache-Control'), 'private');
        }
    });

    test('streams responses, rewrites internal redirects and preserves AASA aliases', async () => {
        // Given live streaming, a redirect and the legacy AASA path
        // When they pass through the Worker
        const stream = await server.fetch('/stream.txt');
        const redirect = await fetch(`${origin}/redirect`, {redirect: 'manual'});
        const aasa = await server.fetch('/apple-app-site-association');
        // Then the full stream arrives, redirects stay public, and AASA is JSON
        assert.equal(await stream.text(), 'first second');
        assert.equal(redirect.headers.get('Location'), `${origin}/target?next=1`, `status=${redirect.status} body=${await redirect.text()}`);
        assert.equal(aasa.headers.get('Content-Type'), 'application/json');
        assert.deepEqual(await aasa.json(), {applinks: {}});
    });

    test('passes WebSocket upgrades, messages and HMR token queries through', {timeout: 10000}, async () => {
        // Given a real WebSocket client connecting through the Worker
        // When it sends a message
        const socket = new WebSocket(`${origin.replace('http:', 'ws:')}/rsbuild-hmr?token=test`);
        await once(socket, 'open');
        socket.send('hot update');
        const [message] = await once(socket, 'message');
        // Then the real upstream sees the HMR query and its reply arrives through the upgraded connection
        assert.equal(message.toString(), '/rsbuild-hmr?token=test:hot update');
        socket.close();
        await once(socket, 'close');
    });

    test('automatically reloads both the Worker entry point and imported CSP modules', {timeout: 15000}, async () => {
        // Given the CLI is watching an isolated copy of the actual Worker source
        const entryPath = path.join(tempDir, 'src/index.ts');
        const cspPath = path.join(tempDir, 'src/csp.ts');
        const entry = readFileSync(entryPath, 'utf8');
        const csp = readFileSync(cspPath, 'utf8');
        // A missing target would otherwise leave the source unchanged, and fail later as a misleading reload timeout.
        const replaceOnce = (source: string, target: string, replacement: string) => {
            assert.ok(source.includes(target), `Reload test target is missing from the Worker source: ${target}`);
            return source.replace(target, replacement);
        };
        const waitForResponse = async (matches: (response: Response) => boolean) => {
            const deadline = Date.now() + 5000;
            while (Date.now() < deadline) {
                const response = await server.fetch('/');
                await response.arrayBuffer();
                if (matches(response)) {
                    return;
                }
                await delay(50);
            }
            assert.fail('Wrangler did not reload the edited source');
        };
        try {
            // When the entry point and an imported module change, without restarting Wrangler
            writeFileSync(
                entryPath,
                replaceOnce(entry, "headers.set('X-Content-Type-Options', 'nosniff');", "headers.set('X-Content-Type-Options', 'nosniff'); headers.set('X-Reload-Proof', 'entry');"),
            );
            await waitForResponse((response) => response.headers.get('X-Reload-Proof') === 'entry');
            writeFileSync(cspPath, replaceOnce(csp, "'worker-src': [", "'worker-src': ['https://module-reload.invalid', "));
            // Then both changes are served on subsequent requests, including the new CSP
            await waitForResponse((response) => response.headers.get('Content-Security-Policy')?.includes('https://module-reload.invalid') ?? false);
        } finally {
            writeFileSync(entryPath, entry);
            writeFileSync(cspPath, csp);
        }
        await waitForResponse((response) => response.headers.get('X-Reload-Proof') === null && !response.headers.get('Content-Security-Policy')?.includes('https://module-reload.invalid'));
    });

    test('reports an unavailable upstream without serving stale built output', async () => {
        // Given the live upstream has stopped
        for (const socket of sockets.clients) {
            socket.terminate();
        }
        upstream.closeAllConnections();
        await new Promise<void>((resolve) => upstream.close(() => resolve()));
        // When a new page is requested
        const response = await server.fetch('/');
        // Then the response explains the local failure rather than falling back to dist
        assert.equal(response.status, 503);
        assert.match(await response.text(), /Rsbuild server is unavailable/);
    });
});
