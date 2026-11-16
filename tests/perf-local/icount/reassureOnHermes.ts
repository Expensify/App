/**
 * Stand-in for `reassure` when an existing perf-local test file runs on the Hermes CLI for instruction counting.
 * Instead of timing, it runs the measured function a fixed number of times (set per process through globalThis.__ICOUNT),
 * so the process-level instruction count is the same work every time.
 */
type MeasureOptions = {beforeEach?: () => Promise<void> | void; afterEach?: () => Promise<void> | void};
type Settings = {test: number; iterations: number};

declare const print: (message: string) => void;

// At least this long, so the suggested iteration count gives a workload well above process startup noise.
const CALIBRATION_MS = 200;

function getSettings(): Settings {
    return (globalThis as unknown as {__ICOUNT: Settings}).__ICOUNT;
}

async function measureAsyncFunction(fn: () => Promise<unknown> | unknown, options?: MeasureOptions): Promise<void> {
    const {iterations} = getSettings();
    if (iterations < 0) {
        // Calibration: how many calls fit in CALIBRATION_MS. The result is then pinned, so later runs do identical work.
        const startedAt = Date.now();
        let calls = 0;
        do {
            await options?.beforeEach?.();
            await fn();
            await options?.afterEach?.();
            calls++;
        } while (Date.now() - startedAt < CALIBRATION_MS);
        print(`icount calibrate ${calls} ${Date.now() - startedAt}`);
        return;
    }
    for (let index = 0; index < iterations; index++) {
        await options?.beforeEach?.();
        await fn();
        await options?.afterEach?.();
    }
}

async function measureFunction(fn: () => unknown, options?: MeasureOptions): Promise<void> {
    const {iterations} = getSettings();
    if (iterations < 0) {
        return measureAsyncFunction(fn, options);
    }
    for (let index = 0; index < iterations; index++) {
        await options?.beforeEach?.();
        fn();
        await options?.afterEach?.();
    }
}

async function measureRenders(): Promise<void> {
    throw new Error('measureRenders is not supported on the Hermes CLI');
}

export {measureAsyncFunction, measureFunction, measureRenders};
