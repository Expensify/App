// cspell:ignore BEGINSWITH devicectl serialno

import type {TupleToUnion} from 'type-fest';

import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import process from 'node:process';

const PLATFORM_NAMES = ['android', 'ios'] as const;
const RELAUNCH_DELAY_MS = 500;
const POLL_INTERVAL_MS = 250;
const BENCHMARK_LOG_TAG = '[EXPENSIFY_BENCHMARK]';
const IOS_BENCHMARK_DIRECTORY = 'Library/Caches/ExpensifyBenchmark';

type PlatformName = TupleToUnion<typeof PLATFORM_NAMES>;
type StartupMode = 'process' | 'cold';
type BenchmarkLogEvent = {
    event: 'span_end';
    span: string;
    durationMs: number;
    timestamp: number;
};
type CollectBenchmarkEventsOptions = {
    spanNames: string[];
    waitTimeSeconds: number;
    waitUntilSpan?: string;
};
type NativeAppBenchmarkAdapter = {
    name: PlatformName;
    appID: string;
    deviceIdentifier: string;
    prepareStartup: (mode: StartupMode, appPath?: string, installArtifact?: boolean) => Promise<void>;
    launchAndCollect: (options: CollectBenchmarkEventsOptions) => Promise<BenchmarkLogEvent[]>;
};
type NativeAppBenchmarkAdapterOptions = {
    platform: PlatformName;
    rootDirectory: string;
    appID: string;
    deviceIdentifier?: string;
};

function createCommandHelpers(rootDirectory: string) {
    const run = (command: string, args: string[]): void => {
        const result = Bun.spawnSync([command, ...args], {cwd: rootDirectory, stdin: 'inherit', stdout: 'inherit', stderr: 'inherit'});
        if (!result.success) {
            throw new Error(`${command} exited with status ${result.exitCode}.`);
        }
    };

    const capture = (command: string, args: string[]): string => {
        const result = Bun.spawnSync([command, ...args], {cwd: rootDirectory, maxBuffer: 100 * 1024 * 1024});
        if (!result.success) {
            const stderr = result.stderr.toString().trim();
            throw new Error(stderr || `${command} exited with status ${result.exitCode}.`);
        }
        return result.stdout.toString();
    };

    const runAllowFailure = (command: string, args: string[]): boolean => {
        return Bun.spawnSync([command, ...args], {cwd: rootDirectory, stdin: 'ignore', stdout: 'ignore', stderr: 'ignore'}).success;
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

function latestBenchmarkEvents(events: BenchmarkLogEvent[], spanNames: string[]): BenchmarkLogEvent[] {
    return [...new Set(spanNames)].flatMap((spanName) => {
        const event = events.findLast((candidate) => candidate.span === spanName);
        return event ? [event] : [];
    });
}

function benchmarkCollectionSpanNames(options: CollectBenchmarkEventsOptions): string[] {
    const waitUntilSpanNames = options.waitUntilSpan ? [options.waitUntilSpan] : [];
    const spanNames = [...options.spanNames, ...waitUntilSpanNames];
    return [...new Set(spanNames)];
}

function iOSBenchmarkMarkerPath(spanName: string): string {
    return `${IOS_BENCHMARK_DIRECTORY}/${encodeURIComponent(spanName)}.log`;
}

// CoreDevice does not publish a runtime schema for `devicectl --json-output`, so keep parsed responses unknown until each required field is validated.
function parseIOSLaunchProcessIdentifier(response: unknown): number {
    if (!isRecord(response) || !isRecord(response.result) || !isRecord(response.result.process)) {
        throw new Error('CoreDevice returned an unexpected app-launch response.');
    }
    const {processIdentifier} = response.result.process;
    if (typeof processIdentifier !== 'number' || !Number.isInteger(processIdentifier) || processIdentifier <= 0) {
        throw new Error('CoreDevice did not return a valid app process identifier.');
    }
    return processIdentifier;
}

function parseIOSInstalledAppURL(response: unknown, appID: string): string {
    if (!isRecord(response) || !isRecord(response.result) || !Array.isArray(response.result.apps)) {
        throw new Error('CoreDevice returned an unexpected installed-app response.');
    }
    const apps: unknown[] = response.result.apps;
    const app: unknown = apps.find((candidate) => isRecord(candidate) && candidate.bundleIdentifier === appID);
    if (!isRecord(app) || typeof app.url !== 'string') {
        throw new Error(`Unable to find installed iOS app ${appID}.`);
    }
    return app.url.endsWith('/') ? app.url : `${app.url}/`;
}

function parseIosRunningAppProcessIdentifier(response: unknown, appURL: string): number | undefined {
    if (!isRecord(response) || !isRecord(response.result) || !Array.isArray(response.result.runningProcesses)) {
        throw new Error('CoreDevice returned an unexpected process-list response.');
    }
    const runningProcesses: unknown[] = response.result.runningProcesses;
    const runningProcess: unknown = runningProcesses.find((candidate) => {
        if (!isRecord(candidate) || typeof candidate.executable !== 'string') {
            return false;
        }
        const relativeExecutablePath = candidate.executable.slice(appURL.length);
        return candidate.executable.startsWith(appURL) && relativeExecutablePath.length > 0 && !relativeExecutablePath.includes('/');
    });
    if (!isRecord(runningProcess)) {
        return undefined;
    }
    const {processIdentifier} = runningProcess;
    return typeof processIdentifier === 'number' && Number.isInteger(processIdentifier) && processIdentifier > 0 ? processIdentifier : undefined;
}

function parseAndroidProcessIdentifier(output: string, appID: string): string {
    const processIdentifier = output
        .trim()
        .split(/\s+/)
        .find((candidate) => /^\d+$/.test(candidate));
    if (!processIdentifier) {
        throw new Error(`Unable to find the running Android process for ${appID}.`);
    }
    return processIdentifier;
}

function assertAndroidAppInstalled(packagePath: string, appID: string): void {
    if (packagePath.trim().startsWith('package:')) {
        return;
    }
    throw new Error(`Android app ${appID} is not installed. Pass its APK path or install it before benchmarking.`);
}

function createAndroidAdapter({rootDirectory, deviceIdentifier, appID}: Omit<NativeAppBenchmarkAdapterOptions, 'platform'>): NativeAppBenchmarkAdapter {
    const {capture, run} = createCommandHelpers(rootDirectory);
    const selectedDeviceIdentifier = deviceIdentifier ?? capture('adb', ['get-serialno']).trim();
    if (!selectedDeviceIdentifier || selectedDeviceIdentifier === 'unknown') {
        throw new Error('Unable to resolve the Android device serial. Use --device to select one.');
    }
    const adbArgs = (args: string[]) => ['-s', selectedDeviceIdentifier, ...args];
    const adb = (args: string[]) => run('adb', adbArgs(args));
    const adbCapture = (args: string[]) => capture('adb', adbArgs(args));
    const activity = `${appID}/org.me.mobiexpensifyg.ExpensifyActivityBase`;

    return {
        name: 'android',
        appID,
        deviceIdentifier: selectedDeviceIdentifier,
        prepareStartup: async (mode, appPath, installArtifact = false) => {
            adb(['shell', 'am', 'force-stop', appID]);
            if (installArtifact) {
                if (!appPath) {
                    throw new Error('Android artifact installation requires an app path.');
                }
                if (!existsSync(appPath)) {
                    throw new Error(`Android app not found at ${appPath}.`);
                }
                adb(['install', '-r', '-d', appPath]);
            }
            assertAndroidAppInstalled(adbCapture(['shell', 'pm', 'path', appID]), appID);
            if (mode === 'cold') {
                adb(['shell', 'pm', 'clear', appID]);
                adb(['shell', 'cmd', 'package', 'compile', '--reset', appID]);
            }
            adb(['logcat', '-c']);
            await sleep(RELAUNCH_DELAY_MS);
        },
        launchAndCollect: async (options) => {
            adb(['shell', 'am', 'start', '-W', '-n', activity]);
            const processIdentifier = parseAndroidProcessIdentifier(adbCapture(['shell', 'pidof', appID]), appID);
            const deadline = Date.now() + options.waitTimeSeconds * 1000;
            let logs = '';
            while (Date.now() < deadline) {
                logs = adbCapture(['logcat', `--pid=${processIdentifier}`, '-d', '-v', 'raw']);
                const events = parseBenchmarkLogEvents(logs);
                if (options.waitUntilSpan && events.some((event) => event.span === options.waitUntilSpan)) {
                    return latestBenchmarkEvents(events, options.spanNames);
                }
                await sleep(POLL_INTERVAL_MS);
            }
            const events = parseBenchmarkLogEvents(logs);
            if (options.waitUntilSpan) {
                throw new Error(`Timed out after ${options.waitTimeSeconds}s waiting for benchmark span ${options.waitUntilSpan}.\n${logs}`);
            }
            return latestBenchmarkEvents(events, options.spanNames);
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
            throw new Error('CoreDevice returned an unexpected device-list response.');
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
            throw new Error(`Expected one booted physical iOS device, found ${devices.length}. Use --device to select one.`);
        }
        const device = devices.at(0);
        if (!device) {
            throw new Error('Unable to resolve the connected iOS device.');
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
    let runningProcessIdentifier: number | undefined;
    const terminate = () => {
        if (runningProcessIdentifier === undefined) {
            return;
        }
        runAllowFailure('xcrun', ['devicectl', 'device', 'process', 'terminate', '--device', device, '--pid', String(runningProcessIdentifier)]);
        runningProcessIdentifier = undefined;
    };
    const launch = (): void => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-ios-launch-'));
        const jsonPath = join(temporaryDirectory, 'launch.json');
        try {
            run('xcrun', ['devicectl', 'device', 'process', 'launch', '--device', device, '--terminate-existing', '--json-output', jsonPath, '--quiet', appID]);
            const response: unknown = JSON.parse(readFileSync(jsonPath, 'utf8'));
            runningProcessIdentifier = parseIOSLaunchProcessIdentifier(response);
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    };
    const resolveRunningProcessIdentifier = (): number | undefined => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-ios-process-'));
        const appsJSONPath = join(temporaryDirectory, 'apps.json');
        const processesJSONPath = join(temporaryDirectory, 'processes.json');
        try {
            run('xcrun', ['devicectl', 'device', 'info', 'apps', '--device', device, '--bundle-id', appID, '--json-output', appsJSONPath, '--quiet']);
            const appsResponse: unknown = JSON.parse(readFileSync(appsJSONPath, 'utf8'));
            const appURL = parseIOSInstalledAppURL(appsResponse, appID);
            const escapedAppURL = appURL.replaceAll('\\', '\\\\').replaceAll("'", "\\'");
            run('xcrun', [
                'devicectl',
                'device',
                'info',
                'processes',
                '--device',
                device,
                '--filter',
                `executable.absoluteString BEGINSWITH '${escapedAppURL}'`,
                '--json-output',
                processesJSONPath,
                '--quiet',
            ]);
            const processesResponse: unknown = JSON.parse(readFileSync(processesJSONPath, 'utf8'));
            return parseIosRunningAppProcessIdentifier(processesResponse, appURL);
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    };
    const readBenchmarkMarker = (spanName: string): string | undefined => {
        const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-benchmark-ios-marker-'));
        const localPath = join(temporaryDirectory, 'benchmark.log');
        try {
            const copied = runAllowFailure('xcrun', [
                'devicectl',
                'device',
                'copy',
                'from',
                '--device',
                device,
                '--source',
                iOSBenchmarkMarkerPath(spanName),
                '--destination',
                localPath,
                '--domain-type',
                'appDataContainer',
                '--domain-identifier',
                appID,
                '--quiet',
            ]);
            return copied && existsSync(localPath) ? readFileSync(localPath, 'utf8') : undefined;
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    };

    return {
        name: 'ios',
        appID,
        deviceIdentifier: device,
        prepareStartup: async (mode, appPath, installArtifact = false) => {
            runningProcessIdentifier ??= resolveRunningProcessIdentifier();
            terminate();
            if (mode === 'cold' || installArtifact) {
                if (!appPath) {
                    throw new Error(
                        mode === 'cold'
                            ? 'iOS true-cold startup requires --app-path so the app can be reinstalled after clearing its data.'
                            : 'iOS artifact installation requires an app path.',
                    );
                }
                if (!existsSync(appPath)) {
                    throw new Error(`iOS app not found at ${appPath}.`);
                }
                if (mode === 'cold') {
                    runAllowFailure('xcrun', ['devicectl', 'device', 'uninstall', 'app', '--device', device, appID]);
                }
                run('xcrun', ['devicectl', 'device', 'install', 'app', '--device', device, appPath]);
            }
            await sleep(RELAUNCH_DELAY_MS);
        },
        launchAndCollect: async (options) => {
            const collectionSpanNames = benchmarkCollectionSpanNames(options);
            const previousMarkers = new Map(collectionSpanNames.map((spanName) => [spanName, readBenchmarkMarker(spanName)]));
            launch();

            const deadline = Date.now() + options.waitTimeSeconds * 1000;
            const eventsBySpan = new Map<string, BenchmarkLogEvent>();
            while (Date.now() < deadline) {
                for (const spanName of collectionSpanNames) {
                    const marker = readBenchmarkMarker(spanName);
                    if (marker === undefined || marker === previousMarkers.get(spanName)) {
                        continue;
                    }
                    const event = parseBenchmarkLogEvents(marker).findLast((candidate) => candidate.span === spanName);
                    if (event) {
                        eventsBySpan.set(spanName, event);
                    }
                }
                if (options.waitUntilSpan && eventsBySpan.has(options.waitUntilSpan)) {
                    return latestBenchmarkEvents([...eventsBySpan.values()], options.spanNames);
                }
                await sleep(POLL_INTERVAL_MS);
            }
            if (options.waitUntilSpan) {
                throw new Error(`Timed out after ${options.waitTimeSeconds}s waiting for benchmark span ${options.waitUntilSpan}.`);
            }
            return latestBenchmarkEvents([...eventsBySpan.values()], options.spanNames);
        },
    };
}

function createNativeAppBenchmarkAdapter(options: NativeAppBenchmarkAdapterOptions): NativeAppBenchmarkAdapter {
    if (options.platform === 'android') {
        return createAndroidAdapter(options);
    }
    return createIosAdapter(options);
}

export {
    BENCHMARK_LOG_TAG,
    PLATFORM_NAMES,
    assertAndroidAppInstalled,
    createNativeAppBenchmarkAdapter,
    findBenchmarkDuration,
    iOSBenchmarkMarkerPath,
    parseIOSInstalledAppURL,
    parseBenchmarkLogEvents,
    parseIOSLaunchProcessIdentifier,
    parseIosRunningAppProcessIdentifier,
    latestBenchmarkEvents,
    parseAndroidProcessIdentifier,
};
export type {BenchmarkLogEvent, CollectBenchmarkEventsOptions, NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions, PlatformName, StartupMode};
