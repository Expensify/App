// cspell:ignore serialno

import type {NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions} from './shared';

import {fileExists} from '../bunFile';
import {POLL_INTERVAL_MS, RELAUNCH_DELAY_MS, createCommandHelpers, latestBenchmarkEvents, parseBenchmarkLogEvents, sleep} from './shared';

/** Creates an Android benchmark adapter that controls installation, process state, compilation state, and scoped logcat collection. */
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
                if (!(await fileExists(appPath))) {
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

function assertAndroidAppInstalled(packagePath: string, appID: string): void {
    if (packagePath.trim().startsWith('package:')) {
        return;
    }
    throw new Error(`Android app ${appID} is not installed. Pass its APK path or install it before benchmarking.`);
}

/** Extracts the numeric process ID from `adb shell pidof` output and rejects an empty result. */
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

export {assertAndroidAppInstalled, createAndroidAdapter, parseAndroidProcessIdentifier};
