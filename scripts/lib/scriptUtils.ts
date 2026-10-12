/** Reusable helpers for repository tooling scripts. */

import {spawnSync} from 'node:child_process';
import {existsSync, readdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import process from 'node:process';

const rootDirectory = resolve(import.meta.dirname, '../..');

function fail(message: string): never {
    throw new Error(message);
}

function run(command: string, args: string[], cwd = rootDirectory): void {
    const result = spawnSync(command, args, {cwd, stdio: 'inherit'});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
    }
}

function capture(command: string, args: string[], cwd = rootDirectory): string {
    const result = spawnSync(command, args, {cwd, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        const stderr = result.stderr.trim();
        fail(stderr.length > 0 ? stderr : `${command} exited with status ${result.status ?? 'unknown'}.`);
    }
    return result.stdout;
}

function captureBinary(command: string, args: string[], cwd = rootDirectory): Buffer {
    const result = spawnSync(command, args, {cwd, encoding: 'buffer', maxBuffer: 100 * 1024 * 1024});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
    }
    return result.stdout;
}

function runAllowFailure(command: string, args: string[], cwd = rootDirectory): boolean {
    const result = spawnSync(command, args, {cwd, stdio: 'ignore'});
    return !result.error && result.status === 0;
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolvePromise) => {
        setTimeout(resolvePromise, milliseconds);
    });
}

function findFiles(directory: string, extension: string): string[] {
    if (!existsSync(directory)) {
        return [];
    }

    return readdirSync(directory, {withFileTypes: true}).flatMap((entry) => {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) {
            return findFiles(path, extension);
        }
        return entry.isFile() && entry.name.endsWith(extension) ? [path] : [];
    });
}

function requirePositiveInteger(value: number, label: string): number {
    if (!Number.isSafeInteger(value) || value <= 0) {
        fail(`${label} must be a positive integer, received: ${value}`);
    }
    return value;
}

function parsePositiveInteger(rawValue: string, label: string): number {
    return requirePositiveInteger(Number(rawValue), label);
}

function parseChoice<T extends string>(rawValue: string, choices: readonly T[], label: string): T {
    const choice = choices.find((candidate) => candidate === rawValue);
    if (!choice) {
        fail(`${label} must be one of: ${choices.join(', ')}. Received: ${rawValue}`);
    }
    return choice;
}

function environmentString(name: string): string | undefined {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function valueAt<T>(values: readonly T[], index: number): T {
    const value = values.at(index);
    if (value === undefined) {
        fail(`Expected a value at index ${index}.`);
    }
    return value;
}

export {capture, captureBinary, environmentString, fail, findFiles, parseChoice, parsePositiveInteger, requirePositiveInteger, rootDirectory, run, runAllowFailure, sleep, valueAt};
