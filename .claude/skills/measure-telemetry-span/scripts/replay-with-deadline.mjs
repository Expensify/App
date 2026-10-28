#!/usr/bin/env node

import {spawn} from 'node:child_process';

const replayArgs = process.argv.slice(2);
if (replayArgs.length === 0) {
    process.stderr.write('Usage: replay-with-deadline.mjs <flow.ad> --timeout <ms> [agent-device replay options]\n');
    process.exit(2);
}

function readFlagValue(args, flag) {
    const index = args.indexOf(flag);
    if (index >= 0) {
        return args.at(index + 1);
    }

    const prefix = `${flag}=`;
    return args.find((argument) => argument.startsWith(prefix))?.slice(prefix.length);
}

const timeoutValue = readFlagValue(replayArgs, '--timeout') ?? process.env.REPLAY_TIMEOUT_MS ?? '120000';
const timeoutMs = Number(timeoutValue);
if (!Number.isInteger(timeoutMs) || timeoutMs < 1) {
    process.stderr.write(`Replay timeout must be a positive integer, received: ${timeoutValue}\n`);
    process.exit(2);
}

const stateDirectory = process.env.AGENT_DEVICE_STATE_DIR;
if (!stateDirectory) {
    process.stderr.write('AGENT_DEVICE_STATE_DIR is required so timeout cleanup cannot stop an unrelated daemon.\n');
    process.exit(2);
}

const detached = process.platform !== 'win32';
const replay = spawn('agent-device', ['replay', ...replayArgs], {
    detached,
    env: process.env,
    stdio: 'inherit',
});

let timedOut = false;
let terminationExitCode;
let forceKillTimer;

function signalReplay(signal) {
    if (!replay.pid) {
        return;
    }

    try {
        if (detached) {
            process.kill(-replay.pid, signal);
        } else {
            replay.kill(signal);
        }
    } catch (error) {
        if (error?.code !== 'ESRCH') {
            throw error;
        }
    }
}

function startCleanup() {
    const cleanup = spawn('agent-device', ['daemon', 'stop', '--state-dir', stateDirectory, '--clean'], {
        env: process.env,
        stdio: 'inherit',
    });
    const cleanupTimer = setTimeout(() => {
        process.stderr.write('Daemon cleanup exceeded 2000ms and was terminated.\n');
        cleanup.kill('SIGKILL');
    }, 2000);

    cleanup.once('error', (error) => {
        clearTimeout(cleanupTimer);
        process.stderr.write(`Unable to start daemon cleanup: ${error.message}\n`);
    });
    cleanup.once('exit', () => {
        clearTimeout(cleanupTimer);
    });
}

function handleTermination(signal, exitCode) {
    if (timedOut || terminationExitCode) {
        return;
    }

    terminationExitCode = exitCode;
    process.stderr.write(`Received ${signal}. Terminating replay and cleaning the isolated daemon.\n`);
    signalReplay(signal);
    forceKillTimer = setTimeout(() => {
        signalReplay('SIGKILL');
    }, 1000);
}

process.on('SIGINT', () => {
    handleTermination('SIGINT', 130);
});
process.on('SIGTERM', () => {
    handleTermination('SIGTERM', 143);
});

const deadlineTimer = setTimeout(() => {
    timedOut = true;
    process.stderr.write(`Replay exceeded ${timeoutMs}ms. Terminating the client and cleaning the isolated daemon.\n`);
    signalReplay('SIGTERM');
    forceKillTimer = setTimeout(() => {
        signalReplay('SIGKILL');
    }, 1000);
}, timeoutMs);

replay.once('error', (error) => {
    clearTimeout(deadlineTimer);
    clearTimeout(forceKillTimer);
    process.stderr.write(`Unable to start agent-device replay: ${error.message}\n`);
    process.exitCode = 127;
});

replay.once('exit', (code, signal) => {
    clearTimeout(deadlineTimer);
    clearTimeout(forceKillTimer);

    if (timedOut) {
        startCleanup();
        process.exitCode = 124;
        return;
    }

    if (terminationExitCode) {
        startCleanup();
        process.exitCode = terminationExitCode;
        return;
    }

    if (signal) {
        process.stderr.write(`agent-device replay exited from signal ${signal}.\n`);
        process.exitCode = 1;
        return;
    }

    process.exitCode = code ?? 1;
});
