// cspell:ignore BEGINSWITH devicectl

/** Implements iOS benchmark setup, launch, process control, and marker collection through CoreDevice. */

import {isJSONArray, isJSONObject} from '@src/types/utils/JSONUtils';

import type {JsonValue} from 'type-fest';

import {env, file} from 'bun';
import {mkdtempSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import type {BenchmarkLogEvent, NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions} from './shared';

import {POLL_INTERVAL_MS, RELAUNCH_DELAY_MS, benchmarkCollectionSpanNames, createCommandHelpers, latestBenchmarkEvents, parseBenchmarkLogEvents, sleep} from './shared';

const IOS_BENCHMARK_DIRECTORY = 'Library/Caches/ExpensifyBenchmark';

type CoreDeviceInstalledApp = {
    bundleIdentifier: string;
    url: string;
};
type CoreDeviceInstalledAppsResponse = {
    result: {
        apps: CoreDeviceInstalledApp[];
    };
};

// Bun leaves parsed JSON untyped, so direct file reads are narrowed to JsonValue and then validated against the CoreDevice fields used below.

/** Creates an iOS benchmark adapter that manages app state and polls per-span markers through CoreDevice. */
async function createIOSAdapter({rootDirectory, deviceIdentifier, appID}: Omit<NativeAppBenchmarkAdapterOptions, 'platform'>): Promise<NativeAppBenchmarkAdapter> {
    const {run, runAllowFailure} = createCommandHelpers(rootDirectory);
    const environmentDeviceIdentifier = env.IOS_DEVICE_ID;
    const device = await resolveIOSDevice(rootDirectory, deviceIdentifier ?? environmentDeviceIdentifier);
    let runningProcessIdentifier: number | undefined;
    /** Best-effort terminates the process tracked by this adapter and clears the cached identifier. */
    const terminate = () => {
        if (runningProcessIdentifier === undefined) {
            return;
        }
        runAllowFailure('xcrun', ['devicectl', 'device', 'process', 'terminate', '--device', device, '--pid', String(runningProcessIdentifier)]);
        runningProcessIdentifier = undefined;
    };
    /** Launches the app through CoreDevice and caches the process identifier from its JSON response. */
    const launch = async (): Promise<void> => {
        const temporaryDirectory = createTemporaryDirectory('expensify-benchmark-ios-launch-');
        const jsonPath = join(temporaryDirectory, 'launch.json');
        try {
            run('xcrun', ['devicectl', 'device', 'process', 'launch', '--device', device, '--terminate-existing', '--json-output', jsonPath, '--quiet', appID]);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const response = (await file(jsonPath).json()) as JsonValue;
            runningProcessIdentifier = parseIOSLaunchProcessIdentifier(response);
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    };
    /** Resolves a process that may predate this adapter by matching the app's installed executable path. */
    const resolveRunningProcessIdentifier = async (): Promise<number | undefined> => {
        const temporaryDirectory = createTemporaryDirectory('expensify-benchmark-ios-process-');
        const appsJSONPath = join(temporaryDirectory, 'apps.json');
        const processesJSONPath = join(temporaryDirectory, 'processes.json');
        try {
            run('xcrun', ['devicectl', 'device', 'info', 'apps', '--device', device, '--bundle-id', appID, '--json-output', appsJSONPath, '--quiet']);
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const rawAppsResponse = (await file(appsJSONPath).json()) as JsonValue;
            const appsResponse = parseIOSInstalledAppsResponse(rawAppsResponse);
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
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const processesResponse = (await file(processesJSONPath).json()) as JsonValue;
            return parseIOSRunningAppProcessIdentifier(processesResponse, appURL);
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    };
    /** Copies one marker from the app data container, returning undefined when the marker is unavailable. */
    const readBenchmarkMarker = async (spanName: string): Promise<string | undefined> => {
        // CoreDevice cannot stream the launched app's console output, so collect the marker written to the iOS app container instead.
        const temporaryDirectory = createTemporaryDirectory('expensify-benchmark-ios-marker-');
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
            const markerFile = file(localPath);
            return copied && (await markerFile.exists()) ? await markerFile.text() : undefined;
        } finally {
            rmSync(temporaryDirectory, {recursive: true, force: true});
        }
    };

    return {
        name: 'ios',
        appID,
        deviceIdentifier: device,
        prepareStartup: async (mode, appPath, installArtifact = false) => {
            runningProcessIdentifier ??= await resolveRunningProcessIdentifier();
            terminate();
            if (mode === 'cold' || installArtifact) {
                if (!appPath) {
                    throw new Error(
                        mode === 'cold'
                            ? 'iOS true-cold startup requires --app-path so the app can be reinstalled after clearing its data.'
                            : 'iOS artifact installation requires an app path.',
                    );
                }
                if (!(await file(appPath).exists())) {
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
            const previousMarkers = new Map(await Promise.all(collectionSpanNames.map(async (spanName) => [spanName, await readBenchmarkMarker(spanName)] as const)));
            await launch();

            const deadline = Date.now() + options.waitTimeSeconds * 1000;
            const eventsBySpan = new Map<string, BenchmarkLogEvent>();
            while (Date.now() < deadline) {
                for (const spanName of collectionSpanNames) {
                    const marker = await readBenchmarkMarker(spanName);
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

/** Uses the configured device or requires exactly one booted physical iOS device when discovering automatically. */
async function resolveIOSDevice(rootDirectory: string, configuredDevice: string | undefined): Promise<string> {
    if (configuredDevice) {
        return configuredDevice;
    }

    const {run} = createCommandHelpers(rootDirectory);
    const temporaryDirectory = createTemporaryDirectory('expensify-benchmark-ios-devices-');
    const jsonPath = join(temporaryDirectory, 'devices.json');
    try {
        run('xcrun', ['devicectl', 'list', 'devices', '--json-output', jsonPath]);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        const response = (await file(jsonPath).json()) as JsonValue;
        if (!isJSONObject(response) || !isJSONObject(response.result) || !isJSONArray(response.result.devices)) {
            throw new Error('CoreDevice returned an unexpected device-list response.');
        }

        const devices = response.result.devices.flatMap((device) => {
            if (!isJSONObject(device) || !isJSONObject(device.hardwareProperties) || !isJSONObject(device.deviceProperties)) {
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

// CoreDevice does not publish a runtime schema for `devicectl --json-output`, so validate each required field before returning a domain type.
/** Validates a CoreDevice launch response and returns the launched process identifier. */
function parseIOSLaunchProcessIdentifier(response: JsonValue): number {
    if (!isJSONObject(response) || !isJSONObject(response.result) || !isJSONObject(response.result.process)) {
        throw new Error('CoreDevice returned an unexpected app-launch response.');
    }
    const {processIdentifier} = response.result.process;
    if (typeof processIdentifier !== 'number' || !Number.isInteger(processIdentifier) || processIdentifier <= 0) {
        throw new Error('CoreDevice did not return a valid app process identifier.');
    }
    return processIdentifier;
}

/** Validates the minimal installed-app response shape used by the benchmark adapter. */
function parseIOSInstalledAppsResponse(response: JsonValue): CoreDeviceInstalledAppsResponse {
    if (!isJSONObject(response) || !isJSONObject(response.result) || !isJSONArray(response.result.apps) || !response.result.apps.every(isCoreDeviceInstalledApp)) {
        throw new Error('CoreDevice returned an unexpected installed-app response.');
    }
    return {result: {apps: response.result.apps}};
}

/** Finds the installed app's normalized container URL in a validated CoreDevice response. */
function parseIOSInstalledAppURL(response: CoreDeviceInstalledAppsResponse, appID: string): string {
    const app = response.result.apps.find((candidate) => candidate.bundleIdentifier === appID);
    if (!app) {
        throw new Error(`Unable to find installed iOS app ${appID}.`);
    }
    return app.url.endsWith('/') ? app.url : `${app.url}/`;
}

/** Finds the app's main process by requiring its executable to be a direct child of the installed app URL. */
function parseIOSRunningAppProcessIdentifier(response: JsonValue, appURL: string): number | undefined {
    if (!isJSONObject(response) || !isJSONObject(response.result) || !isJSONArray(response.result.runningProcesses)) {
        throw new Error('CoreDevice returned an unexpected process-list response.');
    }
    const runningProcess = response.result.runningProcesses.find((candidate) => {
        if (!isJSONObject(candidate) || typeof candidate.executable !== 'string') {
            return false;
        }
        const relativeExecutablePath = candidate.executable.slice(appURL.length);
        return candidate.executable.startsWith(appURL) && relativeExecutablePath.length > 0 && !relativeExecutablePath.includes('/');
    });
    if (!isJSONObject(runningProcess)) {
        return undefined;
    }
    const {processIdentifier} = runningProcess;
    return typeof processIdentifier === 'number' && Number.isInteger(processIdentifier) && processIdentifier > 0 ? processIdentifier : undefined;
}

/** Maps a span name to its encoded marker path inside the iOS app data container. */
function iOSBenchmarkMarkerPath(spanName: string): string {
    return `${IOS_BENCHMARK_DIRECTORY}/${encodeURIComponent(spanName)}.log`;
}

function createTemporaryDirectory(prefix: string): string {
    return mkdtempSync(join(tmpdir(), prefix));
}

function isCoreDeviceInstalledApp(value: JsonValue): value is CoreDeviceInstalledApp {
    return isJSONObject(value) && typeof value.bundleIdentifier === 'string' && typeof value.url === 'string';
}

export {createIOSAdapter, iOSBenchmarkMarkerPath, parseIOSInstalledAppURL, parseIOSInstalledAppsResponse, parseIOSLaunchProcessIdentifier, parseIOSRunningAppProcessIdentifier};
export type {CoreDeviceInstalledAppsResponse};
