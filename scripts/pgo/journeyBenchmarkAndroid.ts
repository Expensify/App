/** Collects completed interactive benchmark spans from the current Android app process. */

import type {BenchmarkLogEvent} from '../lib/nativeAppBenchmark';

import {POLL_INTERVAL_MS, parseBenchmarkLogEvents, sleep} from '../lib/nativeAppBenchmark/shared';
import {capture, run} from '../lib/scriptUtils';

function createAndroidJourneyBenchmarkReader(deviceID: string, appID: string) {
    const adbArgs = (args: string[]) => ['-s', deviceID, ...args];
    let consumedEventCount = 0;

    function begin(): void {
        run('adb', adbArgs(['logcat', '-c']));
        consumedEventCount = 0;
    }

    async function collect(spanNames: readonly string[], timeoutSeconds: number): Promise<BenchmarkLogEvent[]> {
        if (spanNames.length === 0) {
            throw new Error('Select at least one Android journey benchmark span.');
        }
        const processID = capture('adb', adbArgs(['shell', 'pidof', appID]))
            .trim()
            .split(/\s+/)
            .find((candidate) => /^\d+$/.test(candidate));
        if (!processID) {
            throw new Error(`Unable to find the running Android process for ${appID}.`);
        }

        const deadline = Date.now() + timeoutSeconds * 1000;
        let observedSpanNames: string[] = [];
        while (Date.now() < deadline) {
            const logs = capture('adb', adbArgs(['logcat', `--pid=${processID}`, '-d', '-v', 'raw']));
            const events = parseBenchmarkLogEvents(logs);
            if (events.length < consumedEventCount) {
                throw new Error('Android benchmark logcat events were discarded during collection. Restart the journey benchmark.');
            }
            const freshEvents = events.slice(consumedEventCount);
            const collected = spanNames.map((spanName) => freshEvents.findLast((event) => event.span === spanName));
            observedSpanNames = [...new Set(freshEvents.map((event) => event.span))];
            if (collected.every((event) => event !== undefined)) {
                consumedEventCount = events.length;
                return collected.filter((event): event is BenchmarkLogEvent => event !== undefined);
            }
            await sleep(POLL_INTERVAL_MS);
        }
        throw new Error(`Timed out after ${timeoutSeconds}s waiting for Android journey benchmark spans: ${spanNames.join(', ')}. Observed: ${observedSpanNames.join(', ') || 'none'}.`);
    }

    return {begin, collect};
}

export default createAndroidJourneyBenchmarkReader;
