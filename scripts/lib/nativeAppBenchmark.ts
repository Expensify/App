import type {NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions} from './nativeAppBenchmark/shared';

import {assertAndroidAppInstalled, createAndroidAdapter, parseAndroidProcessIdentifier} from './nativeAppBenchmark/android';
import {createIOSAdapter, iOSBenchmarkMarkerPath, parseIOSInstalledAppURL, parseIOSLaunchProcessIdentifier, parseIOSRunningAppProcessIdentifier} from './nativeAppBenchmark/ios';
import {BENCHMARK_LOG_TAG, PLATFORM_NAMES, findBenchmarkDuration, latestBenchmarkEvents, parseBenchmarkLogEvents} from './nativeAppBenchmark/shared';

async function createNativeAppBenchmarkAdapter(options: NativeAppBenchmarkAdapterOptions): Promise<NativeAppBenchmarkAdapter> {
    if (options.platform === 'android') {
        return createAndroidAdapter(options);
    }
    return createIOSAdapter(options);
}

export {
    BENCHMARK_LOG_TAG,
    PLATFORM_NAMES,
    assertAndroidAppInstalled,
    createNativeAppBenchmarkAdapter,
    findBenchmarkDuration,
    iOSBenchmarkMarkerPath,
    latestBenchmarkEvents,
    parseAndroidProcessIdentifier,
    parseBenchmarkLogEvents,
    parseIOSInstalledAppURL,
    parseIOSLaunchProcessIdentifier,
    parseIOSRunningAppProcessIdentifier,
};
export type {BenchmarkLogEvent, CollectBenchmarkEventsOptions, NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions, PlatformName, StartupMode} from './nativeAppBenchmark/shared';
