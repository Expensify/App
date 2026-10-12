import assert from 'node:assert/strict';
import {spawn, spawnSync} from 'node:child_process';
import {chmodSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import test from 'node:test';
import {fileURLToPath} from 'node:url';

const runnerPath = fileURLToPath(new URL('./replay-with-deadline.mjs', import.meta.url));

function createFakeAgentDevice() {
    const directory = mkdtempSync(path.join(tmpdir(), 'agent-device-deadline-'));
    const executable = path.join(directory, 'agent-device');
    writeFileSync(
        executable,
        `#!/bin/sh
if [ "$1" = "replay" ]; then
    if [ "$FAKE_AGENT_DEVICE_MODE" = "hang" ]; then
        sleep 2
    fi
    if [ "$FAKE_AGENT_DEVICE_MODE" = "ignore-signals" ]; then
        trap '' INT TERM
        sleep 2
    fi
    if [ "$FAKE_AGENT_DEVICE_MODE" = "fail" ]; then
        exit 7
    fi
    exit 0
fi
if [ "$1" = "daemon" ] && [ "$2" = "stop" ]; then
    printf 'daemon-stop\\n' >> "$FAKE_CLEANUP_LOG"
    exit 0
fi
exit 2
`,
    );
    chmodSync(executable, 0o755);
    return directory;
}

function runWithFakeAgentDevice(mode, timeoutMs = 5000) {
    const directory = createFakeAgentDevice();
    const cleanupLog = path.join(directory, 'cleanup.log');
    const startedAt = performance.now();
    const result = spawnSync(process.execPath, [runnerPath, 'flow.ad', '--session', 'deadline-test', '--timeout', String(timeoutMs)], {
        encoding: 'utf8',
        env: {
            ...process.env,
            PATH: `${directory}:${process.env.PATH}`,
            AGENT_DEVICE_STATE_DIR: directory,
            FAKE_AGENT_DEVICE_MODE: mode,
            FAKE_CLEANUP_LOG: cleanupLog,
        },
    });

    return {
        cleanupLog,
        directory,
        elapsedMs: performance.now() - startedAt,
        result,
    };
}

test('returns the replay exit code', () => {
    const success = runWithFakeAgentDevice('success');
    const failure = runWithFakeAgentDevice('fail');

    try {
        assert.equal(success.result.status, 0, success.result.stderr);
        assert.equal(failure.result.status, 7, failure.result.stderr);
    } finally {
        rmSync(success.directory, {recursive: true, force: true});
        rmSync(failure.directory, {recursive: true, force: true});
    }
});

test('terminates replay at the deadline and starts session cleanup', async () => {
    const run = runWithFakeAgentDevice('hang', 250);

    try {
        assert.equal(run.result.status, 124, run.result.stderr);
        assert.ok(run.elapsedMs < 2000, `deadline took ${run.elapsedMs.toFixed(0)}ms`);
        assert.match(run.result.stderr, /Replay exceeded 250ms/);

        for (let attempt = 0; attempt < 20 && !existsSync(run.cleanupLog); attempt += 1) {
            await new Promise((resolve) => {
                setTimeout(resolve, 25);
            });
        }

        assert.equal(readFileSync(run.cleanupLog, 'utf8'), 'daemon-stop\n');
    } finally {
        rmSync(run.directory, {recursive: true, force: true});
    }
});

test('handles repeated SIGTERM and cleans the isolated daemon', async () => {
    const directory = createFakeAgentDevice();
    const cleanupLog = path.join(directory, 'cleanup.log');
    const child = spawn(process.execPath, [runnerPath, 'flow.ad', '--session', 'signal-test', '--timeout', '5000'], {
        env: {
            ...process.env,
            PATH: `${directory}:${process.env.PATH}`,
            AGENT_DEVICE_STATE_DIR: directory,
            FAKE_AGENT_DEVICE_MODE: 'ignore-signals',
            FAKE_CLEANUP_LOG: cleanupLog,
        },
        stdio: ['ignore', 'ignore', 'pipe'],
    });
    let stderr = '';
    child.stderr.setEncoding('utf8');
    child.stderr.on('data', (chunk) => {
        stderr += chunk;
    });

    await new Promise((resolve) => {
        setTimeout(resolve, 100);
    });
    child.kill('SIGTERM');
    await new Promise((resolve) => {
        setTimeout(resolve, 50);
    });
    child.kill('SIGTERM');
    const exit = await new Promise((resolve) => {
        child.once('close', (code, signal) => {
            resolve({code, signal});
        });
    });

    try {
        assert.deepEqual(exit, {code: 143, signal: null}, stderr);
        assert.equal(readFileSync(cleanupLog, 'utf8'), 'daemon-stop\n');
    } finally {
        rmSync(directory, {recursive: true, force: true});
    }
});
