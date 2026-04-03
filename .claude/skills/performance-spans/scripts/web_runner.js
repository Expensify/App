#!/usr/bin/env node
/**
 * Web performance test runner for Sentry span measurements.
 *
 * Connects to Chrome DevTools Protocol, runs warmup + measured iterations
 * by clicking inbox items, and captures console.debug span output.
 *
 * Prerequisites:
 *   - Chrome running with --remote-debugging-port=9222
 *     (macOS: open -a "Google Chrome" --args --remote-debugging-port=9222 "https://dev.new.expensify.com:8082/")
 *   - User is logged in to the web app.
 *
 * Usage:
 *   node web_runner.js --prefix ManualOpenReport --out /tmp/perf_web.log \
 *     --iterations 20 --warmup 2 --wait 3000 --chrome-port 9222
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
                // Prefer the Expensify web app page; fall back to first page target
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
        process.stderr.write('[web_runner] Start Chrome with: --remote-debugging-port=9222\n');
        process.stderr.write('[web_runner] macOS example:\n  open -a "Google Chrome" --args --remote-debugging-port=9222 "https://dev.new.expensify.com:8082/"\n');
        process.exit(1);
    });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// ---------------------------------------------------------------------------
// JS snippets evaluated inside the page
// ---------------------------------------------------------------------------
// Returns [{index, text}] for all "long" interactive elements (inbox items)
const FIND_INBOX_ITEMS_JS = `
(function() {
  const LONG = 40;
  const candidates = Array.from(
    document.querySelectorAll('[role="button"], [role="option"], [role="link"], a[href]')
  );
  return candidates
    .map((el, i) => {
      const label = el.getAttribute('aria-label') || el.textContent || '';
      return {index: i, text: label.trim()};
    })
    .filter(item => item.text.length > LONG)
    .map(item => ({...item, text: item.text.substring(0, 80)}));
})()
`;

function clickItemJs(itemIndex) {
    // Re-query each time so refs are fresh after navigation
    return `
(function() {
  const LONG = 40;
  const candidates = Array.from(
    document.querySelectorAll('[role="button"], [role="option"], [role="link"], a[href]')
  );
  const items = candidates.filter(el => {
    const label = el.getAttribute('aria-label') || el.textContent || '';
    return label.trim().length > LONG;
  });
  const el = items[${itemIndex}];
  if (el) { el.click(); return true; }
  return false;
})()
`;
}

const CLICK_BACK_JS = `
(function() {
  const all = Array.from(document.querySelectorAll('[role="button"], button'));
  const back = all.find(el => {
    const label = (el.getAttribute('aria-label') || el.textContent || '').trim().toLowerCase();
    return label === 'back';
  });
  if (back) { back.click(); return 'button'; }
  window.history.back();
  return 'history';
})()
`;

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
        process.stderr.write('[web_runner] Connected. Enabling Runtime...\n');
        await send('Runtime.enable');

        // -- Warmup --
        process.stderr.write(`[web_runner] Running ${warmupIterations} warmup iterations (not recorded)...\n`);
        recording = false;
        for (let i = 0; i < warmupIterations; i++) {
            const items = await evaluate(FIND_INBOX_ITEMS_JS);
            const count = items?.length ?? 0;
            if (count === 0) {
                process.stderr.write(`[web_runner] warmup-${i + 1}: no inbox items found, skipping\n`);
                continue;
            }
            const idx = i % count;
            process.stderr.write(`[web_runner] warmup-${i + 1}: clicking item ${idx}\n`);
            await evaluate(clickItemJs(idx));
            await sleep(waitMs);
            await evaluate(CLICK_BACK_JS);
            await sleep(1000);
        }

        // -- Measured iterations --
        process.stderr.write('[web_runner] Starting recorded iterations...\n');
        recording = true;
        for (let i = 0; i < iterations; i++) {
            const items = await evaluate(FIND_INBOX_ITEMS_JS);
            const count = items?.length ?? 0;
            if (count === 0) {
                process.stderr.write(`[web_runner] iter-${i + 1}: no inbox items, skipping\n`);
                continue;
            }
            const idx = i % count;
            const label = items[idx]?.text ?? '';
            process.stderr.write(`[web_runner] iter-${i + 1}: clicking idx=${idx} "${label.substring(0, 50)}"\n`);
            await evaluate(clickItemJs(idx));
            await sleep(waitMs);
            await evaluate(CLICK_BACK_JS);
            await sleep(1000);
        }

        process.stderr.write('[web_runner] All iterations complete.\n');
        recording = false;
        logStream.end();
        ws.close();
        process.exit(0);
    });
});
