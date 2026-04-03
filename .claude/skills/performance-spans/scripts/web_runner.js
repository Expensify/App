#!/usr/bin/env node
/**
 * Web performance test runner for Sentry span measurements.
 *
 * Connects to Chrome DevTools Protocol, runs warmup + measured iterations
 * by clicking LHN inbox items, and captures console.debug span output.
 *
 * Web layout notes:
 *   - The app uses a split-pane layout: LHN (report list) stays visible on the left
 *     while reports open in the right pane. No "back" navigation is needed.
 *   - The runner navigates to /inbox before starting so the LHN shows inbox items.
 *   - LHN items have aria-labels longer than 40 chars; UI chrome has short labels.
 *
 * Prerequisites:
 *   - Chrome running with --remote-debugging-port=9222
 *     Launch: /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
 *               --remote-debugging-port=9222 --user-data-dir=/tmp/chrome-perf-test \
 *               "https://dev.new.expensify.com:8082/"
 *   - User is logged in to the web app.
 *
 * Usage:
 *   node web_runner.js --prefix ManualOpenReport --out /tmp/perf_web.log \
 *     --iterations 20 --warmup 2 --wait 3000 --chrome-port 9222 \
 *     --app-url https://dev.new.expensify.com:8082
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// ---------------------------------------------------------------------------
// CLI args
// ---------------------------------------------------------------------------
const args = process.argv.slice(2);
function getArg(name) {
    const idx = args.indexOf(name);
    return idx !== -1 ? args[idx + 1] : null;
}

const prefix = getArg('--prefix') ?? 'ManualOpenReport';
const outFile = getArg('--out') ?? '/tmp/perf_web.log';
const iterations = parseInt(getArg('--iterations') ?? '20', 10);
const warmupIterations = parseInt(getArg('--warmup') ?? '2', 10);
const waitMs = parseInt(getArg('--wait') ?? '3000', 10);
const chromePort = getArg('--chrome-port') ?? '9222';
const appUrl = (getArg('--app-url') ?? 'https://dev.new.expensify.com:8082').replace(/\/$/, '');
const inboxUrl = `${appUrl}/inbox`;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function resolveWsModule() {
    const candidates = [path.resolve(__dirname, '../../../../node_modules/ws'), path.resolve(__dirname, '../../../../../node_modules/ws'), 'ws'];
    for (const c of candidates) {
        try {
            return require(c);
        } catch {}
    }
    process.stderr.write('[web_runner] Cannot find "ws" module. Run: npm install ws\n');
    process.exit(1);
}

function discoverChromeWsUrl(callback) {
    http.get(`http://localhost:${chromePort}/json`, (res) => {
        let body = '';
        res.on('data', (c) => (body += c));
        res.on('end', () => {
            try {
                const targets = JSON.parse(body);
                const target = targets.find((t) => t.type === 'page' && (t.url.includes('expensify') || t.url.includes('8082'))) ?? targets.find((t) => t.type === 'page');
                if (!target) {
                    process.stderr.write('[web_runner] No page target found in Chrome /json. Is the app open?\n');
                    process.exit(1);
                }
                process.stderr.write(`[web_runner] Found page: ${target.url}\n`);
                callback(target.webSocketDebuggerUrl);
            } catch (e) {
                process.stderr.write(`[web_runner] Failed to parse Chrome /json: ${e}\n`);
                process.exit(1);
            }
        });
    }).on('error', (e) => {
        process.stderr.write(`[web_runner] Cannot reach Chrome on port ${chromePort}: ${e.message}\n`);
        process.stderr.write('[web_runner] Launch Chrome with:\n');
        process.stderr.write(
            `  /Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome \\\n    --remote-debugging-port=${chromePort} --user-data-dir=/tmp/chrome-perf-test \\\n    "${appUrl}/"\n`,
        );
        process.exit(1);
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// JS snippets evaluated inside the page
// ---------------------------------------------------------------------------
// Scope queries to the LHN container (data-testid="lhn-options-list").
// This avoids picking up links/buttons in the open report's right pane regardless of window width.
const FIND_LHN_ITEMS_JS = `
(function() {
  const LONG = 40;
  const lhn = document.querySelector('[data-testid="lhn-options-list"]');
  if (!lhn) return [];
  return Array.from(lhn.querySelectorAll('[role="button"], [role="option"]'))
    .filter(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      const label = (el.getAttribute('aria-label') || '').trim();
      return label.length > LONG;
    })
    .map((el, i) => {
      const label = (el.getAttribute('aria-label') || '').trim();
      return {index: i, text: label.replace(/\\s+/g, ' ').substring(0, 80)};
    });
})()
`;

function clickItemJs(itemIndex) {
    return `
(function() {
  const LONG = 40;
  const lhn = document.querySelector('[data-testid="lhn-options-list"]');
  if (!lhn) return false;
  const items = Array.from(lhn.querySelectorAll('[role="button"], [role="option"]'))
    .filter(el => {
      const rect = el.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return false;
      return (el.getAttribute('aria-label') || '').trim().length > 40;
    });
  const el = items[${itemIndex}];
  if (el) { el.click(); return true; }
  return false;
})()
`;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
discoverChromeWsUrl((wsUrl) => {
    const WebSocket = resolveWsModule();
    const logStream = fs.createWriteStream(outFile, {flags: 'a'});

    process.stderr.write(`[web_runner] Connecting to ${wsUrl}\n`);
    process.stderr.write(`[web_runner] prefix: "${prefix}" | iterations: ${iterations} | warmup: ${warmupIterations}\n`);
    process.stderr.write(`[web_runner] Writing to: ${outFile}\n`);

    const ws = new WebSocket(wsUrl);
    let msgId = 1;
    const pending = {};
    let recording = false;

    function send(method, params = {}) {
        return new Promise((resolve) => {
            const id = msgId++;
            pending[id] = resolve;
            ws.send(JSON.stringify({id, method, params}));
        });
    }

    async function evaluate(script) {
        const result = await send('Runtime.evaluate', {expression: script, returnByValue: true});
        return result?.result?.value;
    }

    async function navigateTo(url) {
        await send('Page.navigate', {url});
        // Poll until the LHN container has items (SPA rendering can take 2-4s after navigation)
        for (let i = 0; i < 20; i++) {
            await sleep(500);
            const count = await evaluate(
                `(() => { const lhn = document.querySelector('[data-testid="lhn-options-list"]'); if (!lhn) return 0; return lhn.querySelectorAll('[role="button"],[role="option"]').length; })()`,
            );
            if ((count ?? 0) > 0) break;
        }
    }

    ws.on('message', (data) => {
        let msg;
        try {
            msg = JSON.parse(data.toString());
        } catch {
            return;
        }

        if (msg.id && pending[msg.id]) {
            pending[msg.id](msg.result ?? {});
            delete pending[msg.id];
        }

        if (msg.method !== 'Runtime.consoleAPICalled') return;

        const argValues = msg.params?.args ?? [];
        const text = argValues
            .map((a) => {
                if (a.value !== undefined) return String(a.value);
                if (a.description) return a.description;
                try {
                    return JSON.stringify(a);
                } catch {
                    return '';
                }
            })
            .join(' ');

        if (!text.includes(prefix)) return;

        const line = `[${new Date().toISOString()}] ${text}`;
        if (recording) {
            logStream.write(line + '\n');
            process.stdout.write(line + '\n');
        }
    });

    ws.on('error', (e) => {
        process.stderr.write(`[web_runner] WebSocket error: ${e.message}\n`);
        process.exit(1);
    });

    ws.on('open', async () => {
        process.stderr.write('[web_runner] Connected. Enabling Runtime and Page domains...\n');
        await send('Runtime.enable');
        await send('Page.enable');

        // Use a narrow window (below the split-pane breakpoint) so every LHN click
        // triggers a full navigation to the report. In split-pane mode, clicking an
        // already-visible report doesn't re-trigger ManualOpenReport.
        try {
            const {windowId} = await send('Browser.getWindowForTarget');
            await send('Browser.setWindowBounds', {windowId, bounds: {width: 700, height: 900}});
            process.stderr.write('[web_runner] Window set to 700x900 (single-pane mode).\n');
            await sleep(500); // allow layout to reflow
        } catch {
            process.stderr.write('[web_runner] Could not resize window (non-fatal).\n');
        }

        // Navigate to inbox to load the LHN with report items
        process.stderr.write(`[web_runner] Navigating to ${inboxUrl}...\n`);
        await navigateTo(inboxUrl);

        // Confirm LHN items are visible
        const initialItems = await evaluate(FIND_LHN_ITEMS_JS);
        const initialCount = initialItems?.length ?? 0;
        if (initialCount === 0) {
            process.stderr.write('[web_runner] No LHN items found after navigating to inbox. Is the user logged in?\n');
            process.exit(1);
        }
        process.stderr.write(`[web_runner] Found ${initialCount} LHN items.\n`);

        // Helper: navigate to inbox and get fresh LHN items
        async function getInboxItems() {
            await navigateTo(inboxUrl);
            const items = await evaluate(FIND_LHN_ITEMS_JS);
            return items ?? [];
        }

        // -- Warmup --
        process.stderr.write(`[web_runner] Running ${warmupIterations} warmup iterations (not recorded)...\n`);
        recording = false;
        for (let i = 0; i < warmupIterations; i++) {
            const items = await getInboxItems();
            const count = items.length;
            if (count === 0) {
                process.stderr.write(`[web_runner] warmup-${i + 1}: no LHN items, skipping\n`);
                continue;
            }
            const idx = i % count;
            process.stderr.write(`[web_runner] warmup-${i + 1}: clicking item ${idx} "${items[idx]?.text?.substring(0, 50)}"\n`);
            await evaluate(clickItemJs(idx));
            await sleep(waitMs);
        }

        // -- Measured iterations --
        process.stderr.write('[web_runner] Starting recorded iterations...\n');
        recording = true;
        for (let i = 0; i < iterations; i++) {
            const items = await getInboxItems();
            const count = items.length;
            if (count === 0) {
                process.stderr.write(`[web_runner] iter-${i + 1}: no LHN items, skipping\n`);
                continue;
            }
            const idx = i % count;
            process.stderr.write(`[web_runner] iter-${i + 1}: clicking idx=${idx} "${items[idx]?.text?.substring(0, 50)}"\n`);
            await evaluate(clickItemJs(idx));
            await sleep(waitMs);
        }

        process.stderr.write('[web_runner] All iterations complete.\n');
        recording = false;
        logStream.end();
        ws.close();
        process.exit(0);
    });
});
