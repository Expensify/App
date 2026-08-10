#!/usr/bin/env -S node --experimental-strip-types --disable-warning=MODULE_TYPELESS_PACKAGE_JSON
// cspell:ignore TYPELESS devicectl

import type {TupleToUnion} from 'type-fest';

import CLI from 'expensify-common/CLI';
import {spawn, spawnSync} from 'node:child_process';
import {existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {dirname, join, resolve} from 'node:path';
import process from 'node:process';

const PLATFORM_NAMES = ['android', 'ios'] as const;
const DEFAULT_RUNS = 20;
const DEFAULT_TIMEOUT_SECONDS = 30;
const RELAUNCH_DELAY_MS = 500;
const POLL_INTERVAL_MS = 250;
const BENCHMARK_LOG_TAG = '[EXPENSIFY_BENCHMARK]';
const MAX_CAPTURED_LOG_LENGTH = 1_000_000;

type PlatformName = TupleToUnion<typeof PLATFORM_NAMES>;
type StartupMode = 'process' | 'cold';
type BenchmarkLogEvent = {
    event: 'span_end';
    span: string;
    durationMs: number;
    timestamp: number;
};
type BenchmarkStats = {
    runs: number;
    average: number;
    p50: number;
    p75: number;
    p90: number;
    p95: number;
    p99: number;
    min: number;
    max: number;
};
type PlatformAdapter = {
    name: PlatformName;
    prepareStartup: (mode: StartupMode, appPath?: string) => Promise<void>;
    launchAndWait: (spanName: string, timeoutSeconds: number) => Promise<number>;
};

const scriptPath = process.argv.at(1);
if (!scriptPath) {
    throw new Error('Unable to resolve the benchmark script path.');
}
const rootDirectory = resolve(dirname(resolve(scriptPath)), '..');

function fail(message: string): never {
    throw new Error(message);
}

function run(command: string, args: string[]): void {
    const result = spawnSync(command, args, {cwd: rootDirectory, stdio: 'inherit'});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
    }
}

function capture(command: string, args: string[]): string {
    const result = spawnSync(command, args, {cwd: rootDirectory, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024});
    if (result.error) {
        fail(`Failed to run ${command}: ${result.error.message}`);
    }
    if (result.status !== 0) {
        const stderr = result.stderr.trim();
        fail(stderr || `${command} exited with status ${result.status ?? 'unknown'}.`);
    }
    return result.stdout;
}

function runAllowFailure(command: string, args: string[]): boolean {
    const result = spawnSync(command, args, {cwd: rootDirectory, stdio: 'ignore'});
    return !result.error && result.status === 0;
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolvePromise) => {
        setTimeout(resolvePromise, milliseconds);
    });
}

function parseChoice<T extends string>(value: string, choices: readonly T[], label: string): T {
    const choice = choices.find((candidate) => candidate === value);
    if (!choice) {
        fail(`${label} must be one of: ${choices.join(', ')}. Received: ${value}`);
    }
    return choice;
}

function parsePositiveInteger(value: string, label: string): number {
    const parsed = Number(value);
    if (!Number.isSafeInteger(parsed) || parsed <= 0) {
        fail(`${label} must be a positive integer. Received: ${value}`);
    }
    return parsed;
}

function environmentString(name: string): string | undefined {
    const value: unknown = process.env[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseBenchmarkLogEvents(output: string): BenchmarkLogEvent[] {
    const events: BenchmarkLogEvent[] = [];
    let offset = 0;

    while (offset < output.length) {
        const tagIndex = output.indexOf(BENCHMARK_LOG_TAG, offset);
        if (tagIndex < 0) {
            break;
        }

        const jsonStart = output.indexOf('{', tagIndex + BENCHMARK_LOG_TAG.length);
        const jsonEnd = jsonStart < 0 ? -1 : output.indexOf('}', jsonStart);
        if (jsonStart < 0 || jsonEnd < 0) {
            break;
        }

        offset = jsonEnd + 1;
        try {
            const event: unknown = JSON.parse(output.slice(jsonStart, jsonEnd + 1));
            if (
                isRecord(event) &&
                event.event === 'span_end' &&
                typeof event.span === 'string' &&
                typeof event.durationMs === 'number' &&
                Number.isFinite(event.durationMs) &&
                typeof event.timestamp === 'number'
            ) {
                events.push({event: 'span_end', span: event.span, durationMs: event.durationMs, timestamp: event.timestamp});
            }
        } catch {
            // Ignore unrelated or incomplete console output containing the benchmark tag.
        }
    }

    return events;
}

function findBenchmarkDuration(output: string, spanName: string): number | undefined {
    return parseBenchmarkLogEvents(output).findLast((event) => event.span === spanName)?.durationMs;
}

function waitForBenchmarkProcess(command: string, args: string[], spanName: string, timeoutSeconds: number): Promise<number> {
    return new Promise((resolvePromise, reject) => {
        const processHandle = spawn(command, args, {cwd: rootDirectory});
        let output = '';
        let settled = false;
        let timeout: ReturnType<typeof setTimeout>;

        const finish = (result: {duration: number} | {error: Error}) => {
            if (settled) {
                return;
            }

            settled = true;
            clearTimeout(timeout);
            processHandle.kill('SIGINT');
            if ('error' in result) {
                reject(result.error);
                return;
            }
            resolvePromise(result.duration);
        };

        const readOutput = (chunk: Buffer) => {
            output = `${output}${chunk.toString()}`.slice(-MAX_CAPTURED_LOG_LENGTH);
            const duration = findBenchmarkDuration(output, spanName);
            if (duration !== undefined) {
                finish({duration});
            }
        };

        timeout = setTimeout(() => finish({error: new Error(`Timed out after ${timeoutSeconds}s waiting for benchmark span ${spanName}.\n${output}`)}), timeoutSeconds * 1000);
        processHandle.stdout.on('data', readOutput);
        processHandle.stderr.on('data', readOutput);
        processHandle.on('error', (error) => finish({error}));
        processHandle.on('exit', (code) => {
            if (settled) {
                return;
            }
            finish({error: new Error(`App launch exited with code ${code ?? 'unknown'} before ${spanName} completed.\n${output}`)});
        });
    });
}

function createAndroidAdapter(deviceIdentifier: string | undefined, appID: string): PlatformAdapter {
    const adbArgs = (args: string[]) => (deviceIdentifier ? ['-s', deviceIdentifier, ...args] : args);
    const adb = (args: string[]) => run('adb', adbArgs(args));
    const adbCapture = (args: string[]) => capture('adb', adbArgs(args));
    const activity = `${appID}/org.me.mobiexpensifyg.ExpensifyActivityBase`;

    return {
        name: 'android',
        prepareStartup: async (mode) => {
            adb(['shell', 'am', 'force-stop', appID]);
            if (mode === 'cold') {
                adb(['shell', 'pm', 'clear', appID]);
                adb(['shell', 'cmd', 'package', 'compile', '--reset', appID]);
            }
            adb(['logcat', '-c']);
            await sleep(RELAUNCH_DELAY_MS);
        },
        launchAndWait: async (spanName, timeoutSeconds) => {
            adb(['shell', 'am', 'start', '-W', '-n', activity]);
            const deadline = Date.now() + timeoutSeconds * 1000;
            let logs = '';
            while (Date.now() < deadline) {
                logs = adbCapture(['logcat', '-d', '-v', 'raw']);
                const duration = findBenchmarkDuration(logs, spanName);
                if (duration !== undefined) {
                    return duration;
                }
                await sleep(POLL_INTERVAL_MS);
            }
            fail(`Timed out after ${timeoutSeconds}s waiting for benchmark span ${spanName}.\n${logs}`);
        },
    };
}

function resolveIosDevice(configuredDevice: string | undefined): string {
    if (configuredDevice) {
        return configuredDevice;
    }

    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-ios-devices-'));
    const jsonPath = join(temporaryDirectory, 'devices.json');
    try {
        run('xcrun', ['devicectl', 'list', 'devices', '--json-output', jsonPath]);
        const response: unknown = JSON.parse(readFileSync(jsonPath, 'utf8'));
        if (!isRecord(response) || !isRecord(response.result) || !Array.isArray(response.result.devices)) {
            fail('CoreDevice returned an unexpected device-list response.');
        }

        const devices = response.result.devices.flatMap((device) => {
            if (!isRecord(device) || !isRecord(device.hardwareProperties) || !isRecord(device.deviceProperties)) {
                return [];
            }
            const {hardwareProperties, deviceProperties} = device;
            if (
                hardwareProperties.platform !== 'iOS' ||
                hardwareProperties.reality !== 'physical' ||
                deviceProperties.bootState !== 'booted' ||
                typeof hardwareProperties.udid !== 'string' ||
                typeof deviceProperties.name !== 'string'
            ) {
                return [];
            }
            return [{name: deviceProperties.name, udid: hardwareProperties.udid}];
        });
        if (devices.length !== 1) {
            fail(`Expected one booted physical iOS device, found ${devices.length}. Use --device to select one.`);
        }
        const device = devices.at(0);
        if (!device) {
            fail('Unable to resolve the connected iOS device.');
        }
        console.log(`Using iOS device ${device.name} (${device.udid}).`);
        return device.udid;
    } finally {
        rmSync(temporaryDirectory, {recursive: true, force: true});
    }
}

function createIosAdapter(deviceIdentifier: string | undefined, appID: string): PlatformAdapter {
    const device = resolveIosDevice(deviceIdentifier ?? environmentString('IOS_DEVICE_ID'));
    const terminate = () => runAllowFailure('xcrun', ['devicectl', 'device', 'process', 'terminate', '--device', device, appID]);

    return {
        name: 'ios',
        prepareStartup: async (mode, appPath) => {
            terminate();
            if (mode === 'cold') {
                if (!appPath) {
                    fail('iOS true-cold startup requires --app-path so the app can be reinstalled after clearing its data.');
                }
                if (!existsSync(appPath)) {
                    fail(`iOS app not found at ${appPath}.`);
                }
                runAllowFailure('xcrun', ['devicectl', 'device', 'uninstall', 'app', '--device', device, appID]);
                run('xcrun', ['devicectl', 'device', 'install', 'app', '--device', device, appPath]);
            }
            await sleep(RELAUNCH_DELAY_MS);
        },
        launchAndWait: (spanName, timeoutSeconds) =>
            waitForBenchmarkProcess('xcrun', ['devicectl', 'device', 'process', 'launch', '--device', device, '--terminate-existing', '--console', appID], spanName, timeoutSeconds),
    };
}

function percentile(sortedValues: number[], fraction: number): number {
    const position = (sortedValues.length - 1) * fraction;
    const lowerIndex = Math.floor(position);
    const upperIndex = Math.ceil(position);
    const remainder = position - lowerIndex;
    const lowerValue = sortedValues.at(lowerIndex);
    const upperValue = sortedValues.at(upperIndex);
    if (lowerValue === undefined || upperValue === undefined) {
        fail('Cannot calculate a percentile without benchmark samples.');
    }
    return lowerValue + remainder * (upperValue - lowerValue);
}

function benchmarkStats(samples: number[]): BenchmarkStats {
    const sortedValues = samples.toSorted((left, right) => left - right);
    const min = sortedValues.at(0);
    const max = sortedValues.at(-1);
    if (min === undefined || max === undefined) {
        fail('No benchmark samples were recorded.');
    }

    return {
        runs: samples.length,
        average: samples.reduce((sum, value) => sum + value, 0) / samples.length,
        p50: percentile(sortedValues, 0.5),
        p75: percentile(sortedValues, 0.75),
        p90: percentile(sortedValues, 0.9),
        p95: percentile(sortedValues, 0.95),
        p99: percentile(sortedValues, 0.99),
        min,
        max,
    };
}

async function measureStartup(adapter: PlatformAdapter, mode: StartupMode, appPath: string | undefined, spanName: string, timeoutSeconds: number): Promise<number> {
    await adapter.prepareStartup(mode, appPath);
    return adapter.launchAndWait(spanName, timeoutSeconds);
}

async function benchmarkStartups(
    adapter: PlatformAdapter,
    mode: StartupMode,
    appPath: string | undefined,
    spanName: string,
    runs: number,
    timeoutSeconds: number,
    outputPath: string,
): Promise<void> {
    console.log(`Running one unmeasured ${mode === 'cold' ? 'true-cold' : 'cold-process'} warm-up startup.`);
    await measureStartup(adapter, mode, appPath, spanName, timeoutSeconds);

    const samples: number[] = [];
    for (let runNumber = 1; runNumber <= runs; runNumber += 1) {
        const duration = await measureStartup(adapter, mode, appPath, spanName, timeoutSeconds);
        samples.push(duration);
        console.log(`Run ${runNumber}/${runs}: ${duration}ms`);
    }

    mkdirSync(dirname(outputPath), {recursive: true});
    writeFileSync(outputPath, ['run,duration_ms', ...samples.map((duration, index) => `${index + 1},${duration}`), ''].join('\n'));
    console.table([Object.fromEntries(Object.entries(benchmarkStats(samples)).map(([key, value]) => [key, value.toFixed(2)]))]);
    console.log(`Recorded ${runs} samples in ${outputPath}`);
}

async function main(): Promise<void> {
    /* eslint-disable @typescript-eslint/naming-convention */
    const cli = new CLI({
        positionalArgs: [
            {
                name: 'platform',
                description: `Native platform to benchmark (${PLATFORM_NAMES.join(', ')})`,
                parse: (value): PlatformName => parseChoice(value, PLATFORM_NAMES, 'Platform'),
            },
            {
                name: 'span',
                description: 'Whitelisted Sentry span name to benchmark',
                default: 'ManualAppStartup',
            },
            {
                name: 'runs',
                description: 'Number of measured startup runs',
                default: DEFAULT_RUNS,
                parse: (value) => parsePositiveInteger(value, 'Run count'),
            },
            {
                name: 'timeout',
                description: 'Seconds to wait for the benchmark span',
                default: DEFAULT_TIMEOUT_SECONDS,
                parse: (value) => parsePositiveInteger(value, 'Timeout'),
            },
        ],
        namedArgs: {
            device: {
                description: 'adb serial on Android, or CoreDevice identifier, UDID, serial number, or name on iOS',
                required: false,
            },
            'app-id': {
                description: 'Application ID or bundle identifier',
                required: false,
            },
            'app-path': {
                description: 'Path to the signed iOS .app; required with --cold on iOS',
                required: false,
            },
            output: {
                description: 'CSV output path',
                required: false,
            },
        },
        flags: {
            cold: {
                description: 'Run true-cold starts by clearing app data; default only terminates and relaunches the process',
            },
        },
    });
    /* eslint-enable @typescript-eslint/naming-convention */

    const platformName = parseChoice(String(cli.positionalArgs.platform), PLATFORM_NAMES, 'Platform');
    const spanName = String(cli.positionalArgs.span);
    const runs = Number(cli.positionalArgs.runs);
    const timeoutSeconds = Number(cli.positionalArgs.timeout);
    const mode: StartupMode = cli.flags.cold ? 'cold' : 'process';
    const defaultAppID = platformName === 'android' ? 'org.me.mobiexpensifyg' : 'com.expensify.expensifylite';
    const appID = cli.namedArgs['app-id'] ?? defaultAppID;
    const appPath = cli.namedArgs['app-path'] ?? environmentString('IOS_APP_PATH');
    const safeSpanName = spanName.replaceAll(/[^a-zA-Z0-9_-]/g, '-');
    const outputPath = resolve(cli.namedArgs.output ?? join(rootDirectory, '.benchmarks', `${platformName}-${safeSpanName}-${mode}.csv`));
    const adapter = platformName === 'android' ? createAndroidAdapter(cli.namedArgs.device, appID) : createIosAdapter(cli.namedArgs.device, appID);

    await benchmarkStartups(adapter, mode, appPath, spanName, runs, timeoutSeconds, outputPath);
}

if (scriptPath.endsWith('benchmarkAppStartup.ts')) {
    main().catch((error: unknown) => {
        console.error(error instanceof Error ? error.message : error);
        process.exitCode = 1;
    });
}

export {benchmarkStats, findBenchmarkDuration, parseBenchmarkLogEvents, percentile};
