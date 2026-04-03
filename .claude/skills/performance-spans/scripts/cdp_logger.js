#!/usr/bin/env node
/**
 * CDP console.debug logger for React Native Hermes apps.
 *
 * Connects to the Metro inspector (http://localhost:8081/json), enables the
 * Runtime domain, and writes every Runtime.consoleAPICalled message whose
 * text contains the given --prefix to an output file.
 *
 * Usage:
 *   node cdp_logger.js --prefix ManualOpenReport --out /tmp/perf_spans.log
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

const prefix = getArg('--prefix') ?? '';
const outFile = getArg('--out') ?? '/tmp/perf_spans.log';
const metroPort = getArg('--metro-port') ?? '8081';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function discoverWsUrl(callback) {
    http.get(`http://localhost:${metroPort}/json`, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
            try {
                const targets = JSON.parse(body);
                // page=1 is the React Native Bridgeless (JS) runtime
                const target = targets.find((t) => t.id && t.id.endsWith('-1'));
                if (!target) {
                    process.stderr.write(`[cdp_logger] No page=1 target found in /json response\n`);
                    process.exit(1);
                }
                callback(target.webSocketDebuggerUrl);
            } catch (e) {
                process.stderr.write(`[cdp_logger] Failed to parse /json: ${e}\n`);
                process.exit(1);
            }
        });
    }).on('error', (e) => {
        process.stderr.write(`[cdp_logger] Cannot reach Metro on port ${metroPort}: ${e.message}\n`);
        process.exit(1);
    });
}

function resolveWsModule() {
    // Try local project node_modules first, then global
    const candidates = [path.resolve(__dirname, '../../../../node_modules/ws'), path.resolve(__dirname, '../../../../../node_modules/ws'), 'ws'];
    for (const candidate of candidates) {
        try {
            return require(candidate);
        } catch {}
    }
    process.stderr.write(`[cdp_logger] Cannot find 'ws' module. Run: npm install ws\n`);
    process.exit(1);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
discoverWsUrl((wsUrl) => {
    const WebSocket = resolveWsModule();
    const logStream = fs.createWriteStream(outFile, {flags: 'a'});

    process.stderr.write(`[cdp_logger] Connecting to ${wsUrl}\n`);
    process.stderr.write(`[cdp_logger] Filtering prefix: "${prefix || '(all)'}"\n`);
    process.stderr.write(`[cdp_logger] Writing to: ${outFile}\n`);

    const ws = new WebSocket(wsUrl);
    let msgId = 1;

    ws.on('open', () => {
        process.stderr.write('[cdp_logger] Connected. Enabling Runtime...\n');
        ws.send(JSON.stringify({id: msgId++, method: 'Runtime.enable'}));
    });

    ws.on('message', (data) => {
        let msg;
        try {
            msg = JSON.parse(data.toString());
        } catch {
            return;
        }

        if (msg.method !== 'Runtime.consoleAPICalled') {
            return;
        }

        const args = msg.params?.args ?? [];
        const text = args
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

        if (prefix && !text.includes(prefix)) {
            return;
        }

        const line = `[${new Date().toISOString()}] ${text}`;
        logStream.write(line + '\n');
        process.stdout.write(line + '\n');
    });

    ws.on('error', (e) => {
        process.stderr.write(`[cdp_logger] WebSocket error: ${e.message}\n`);
        process.exit(1);
    });

    ws.on('close', () => {
        process.stderr.write('[cdp_logger] WebSocket closed.\n');
        logStream.end();
    });

    function shutdown() {
        process.stderr.write('[cdp_logger] Shutting down...\n');
        ws.close();
        logStream.end();
        process.exit(0);
    }

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
});
