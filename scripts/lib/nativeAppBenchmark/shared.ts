import type {TupleToUnion} from 'type-fest';

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

export {
    BENCHMARK_LOG_TAG,
    PLATFORM_NAMES,
    POLL_INTERVAL_MS,
    RELAUNCH_DELAY_MS,
    benchmarkCollectionSpanNames,
    createCommandHelpers,
    findBenchmarkDuration,
    isRecord,
    latestBenchmarkEvents,
    parseBenchmarkLogEvents,
    sleep,
};
export type {BenchmarkLogEvent, CollectBenchmarkEventsOptions, NativeAppBenchmarkAdapter, NativeAppBenchmarkAdapterOptions, PlatformName, StartupMode};
