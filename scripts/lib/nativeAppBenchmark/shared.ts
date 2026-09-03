/** Provides benchmark event parsing, polling primitives, and subprocess helpers shared by the native platform adapters. */

import {isJSONObject} from '@src/types/utils/JSONUtils';

import type {JsonValue, TupleToUnion} from 'type-fest';

import {spawnSync} from 'bun';

const PLATFORM_NAMES = ['android', 'ios'] as const;
const RELAUNCH_DELAY_MS = 500;
const POLL_INTERVAL_MS = 250;
const BENCHMARK_LOG_TAG = '[EXPENSIFY_BENCHMARK]';

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

/** Extracts valid benchmark events from mixed device logs and ignores unrelated, malformed, or incomplete tagged output. */
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
            // JSON.parse is not generically typed, but a successful parse can only produce a JsonValue.
            // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
            const event = JSON.parse(output.slice(jsonStart, jsonEnd + 1)) as JsonValue;
            if (
                isJSONObject(event) &&
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

/** Selects the latest event for each requested span while preserving the caller's span order. */
function latestBenchmarkEvents(events: BenchmarkLogEvent[], spanNames: string[]): BenchmarkLogEvent[] {
    return [...new Set(spanNames)].flatMap((spanName) => {
        const event = events.findLast((candidate) => candidate.span === spanName);
        return event ? [event] : [];
    });
}

/** Includes the completion sentinel in collection even when the caller does not want it in the reported metrics. */
function benchmarkCollectionSpanNames(options: CollectBenchmarkEventsOptions): string[] {
    const waitUntilSpanNames = options.waitUntilSpan ? [options.waitUntilSpan] : [];
    const spanNames = [...options.spanNames, ...waitUntilSpanNames];
    return [...new Set(spanNames)];
}

/** Creates command runners for inherited output, captured output, and expected best-effort failures. */
function createCommandHelpers(rootDirectory: string) {
    const run = (command: string, args: string[]): void => {
        const result = spawnSync([command, ...args], {cwd: rootDirectory, stdin: 'inherit', stdout: 'inherit', stderr: 'inherit'});
        if (!result.success) {
            throw new Error(`${command} exited with status ${result.exitCode}.`);
        }
    };

    const capture = (command: string, args: string[]): string => {
        const result = spawnSync([command, ...args], {cwd: rootDirectory, maxBuffer: 100 * 1024 * 1024});
        if (!result.success) {
            const stderr = result.stderr.toString().trim();
            throw new Error(stderr || `${command} exited with status ${result.exitCode}.`);
        }
        return result.stdout.toString();
    };

    const runAllowFailure = (command: string, args: string[]): boolean => {
        return spawnSync([command, ...args], {cwd: rootDirectory, stdin: 'ignore', stdout: 'ignore', stderr: 'ignore'}).success;
    };

    return {capture, run, runAllowFailure};
}

/** Returns the most recent duration for a span when device output contains repeated benchmark events. */
function findBenchmarkDuration(output: string, spanName: string): number | undefined {
    return parseBenchmarkLogEvents(output).findLast((event) => event.span === spanName)?.durationMs;
}

function sleep(milliseconds: number): Promise<void> {
    return new Promise((resolvePromise) => {
        setTimeout(resolvePromise, milliseconds);
    });
}

export {
    BENCHMARK_LOG_TAG,
    PLATFORM_NAMES,
    POLL_INTERVAL_MS,
    RELAUNCH_DELAY_MS,
    benchmarkCollectionSpanNames,
    createCommandHelpers,
    findBenchmarkDuration,
    latestBenchmarkEvents,
    parseBenchmarkLogEvents,
    sleep,
};
export type {BenchmarkLogEvent, CollectBenchmarkEventsOptions, NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions, PlatformName, StartupMode};
