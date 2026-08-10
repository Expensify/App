// cspell:ignore devicectl

import type {TupleToUnion} from 'type-fest';

import {spawn, spawnSync} from 'node:child_process';
import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';

const PLATFORM_NAMES = ['android', 'ios'] as const;
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
type NativeAppBenchmarkAdapter = {
    name: PlatformName;
    prepareStartup: (mode: StartupMode, appPath?: string) => Promise<void>;
    launchAndWait: (spanName: string, timeoutSeconds: number) => Promise<number>;
};
type NativeAppBenchmarkAdapterOptions = {
    platform: PlatformName;
    rootDirectory: string;
    appID: string;
    deviceIdentifier?: string;
};

function fail(message: string): never {
    throw new Error(message);
}

function createCommandHelpers(rootDirectory: string) {
    const run = (command: string, args: string[]): void => {
        const result = spawnSync(command, args, {cwd: rootDirectory, stdio: 'inherit'});
        if (result.error) {
            fail(`Failed to run ${command}: ${result.error.message}`);
        }
        if (result.status !== 0) {
            fail(`${command} exited with status ${result.status ?? 'unknown'}.`);
        }
    };

    const capture = (command: string, args: string[]): string => {
        const result = spawnSync(command, args, {cwd: rootDirectory, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024});
        if (result.error) {
            fail(`Failed to run ${command}: ${result.error.message}`);
        }
        if (result.status !== 0) {
            const stderr = result.stderr.trim();
            fail(stderr || `${command} exited with status ${result.status ?? 'unknown'}.`);
        }
        return result.stdout;
    };

    const runAllowFailure = (command: string, args: string[]): boolean => {
        const result = spawnSync(command, args, {cwd: rootDirectory, stdio: 'ignore'});
        return !result.error && result.status === 0;
    };

    return {capture, run, runAllowFailure};
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolvePromise) => {
        setTimeout(resolvePromise, milliseconds);
    });
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

function waitForBenchmarkProcess(rootDirectory: string, command: string, args: string[], spanName: string, timeoutSeconds: number): Promise<number> {
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

function createAndroidAdapter({rootDirectory, deviceIdentifier, appID}: Omit<NativeAppBenchmarkAdapterOptions, 'platform'>): NativeAppBenchmarkAdapter {
    const {capture, run} = createCommandHelpers(rootDirectory);
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

function resolveIosDevice(rootDirectory: string, configuredDevice: string | undefined): string {
    if (configuredDevice) {
        return configuredDevice;
    }

    const {run} = createCommandHelpers(rootDirectory);
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

function createIosAdapter({rootDirectory, deviceIdentifier, appID}: Omit<NativeAppBenchmarkAdapterOptions, 'platform'>): NativeAppBenchmarkAdapter {
    const {run, runAllowFailure} = createCommandHelpers(rootDirectory);
    const iosDeviceID: unknown = process.env.IOS_DEVICE_ID;
    const environmentDeviceIdentifier = typeof iosDeviceID === 'string' ? iosDeviceID : undefined;
    const device = resolveIosDevice(rootDirectory, deviceIdentifier ?? environmentDeviceIdentifier);
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
            waitForBenchmarkProcess(
                rootDirectory,
                'xcrun',
                ['devicectl', 'device', 'process', 'launch', '--device', device, '--terminate-existing', '--console', appID],
                spanName,
                timeoutSeconds,
            ),
    };
}

function createNativeAppBenchmarkAdapter(options: NativeAppBenchmarkAdapterOptions): NativeAppBenchmarkAdapter {
    if (options.platform === 'android') {
        return createAndroidAdapter(options);
    }
    return createIosAdapter(options);
}

export {BENCHMARK_LOG_TAG, PLATFORM_NAMES, createNativeAppBenchmarkAdapter, findBenchmarkDuration, parseBenchmarkLogEvents};
export type {BenchmarkLogEvent, NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions, PlatformName, StartupMode};
