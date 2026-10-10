/** Collects completed interactive benchmark spans from an iOS app's cache markers. */

// cspell:ignore devicectl

import {existsSync, mkdtempSync, readFileSync, rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';

import type {BenchmarkLogEvent} from '../lib/nativeAppBenchmark';

import {iOSBenchmarkMarkerPath, parseBenchmarkLogEvents} from '../lib/nativeAppBenchmark';
import {runAllowFailure, sleep} from '../lib/scriptUtils';

const POLL_INTERVAL_MS = 250;

/** Snapshots markers before an action, then waits for a fresh event for every requested span. */
function createIOSJourneyBenchmarkReader(deviceID: string, appID: string) {
    let previousMarkers: Map<string, string | undefined> | undefined;

    function begin(spanNames: readonly string[]): void {
        if (spanNames.length === 0) {
            throw new Error('At least one iOS benchmark span is required.');
        }
        const markers = new Map<string, string | undefined>();
        for (const spanName of new Set(spanNames)) {
            markers.set(spanName, readMarker(deviceID, appID, spanName));
        }
        previousMarkers = markers;
    }

    async function collect(spanNames: readonly string[], timeoutSeconds: number): Promise<BenchmarkLogEvent[]> {
        const snapshot = previousMarkers;
        if (spanNames.length === 0 || !snapshot || spanNames.some((spanName) => !snapshot.has(spanName))) {
            throw new Error('Snapshot every requested iOS benchmark span with begin() before the UI action.');
        }
        if (!Number.isFinite(timeoutSeconds) || timeoutSeconds <= 0) {
            throw new Error('The iOS benchmark span timeout must be positive.');
        }

        const uniqueSpanNames = [...new Set(spanNames)];
        const deadline = Date.now() + timeoutSeconds * 1000;
        const events = new Map<string, BenchmarkLogEvent>();
        while (Date.now() < deadline) {
            for (const spanName of uniqueSpanNames) {
                if (events.has(spanName)) {
                    continue;
                }
                const marker = readMarker(deviceID, appID, spanName);
                if (marker === undefined || marker === snapshot.get(spanName)) {
                    continue;
                }
                const event = parseBenchmarkLogEvents(marker).findLast((candidate) => candidate.span === spanName);
                if (event) {
                    events.set(spanName, event);
                }
            }
            if (events.size === uniqueSpanNames.length) {
                return spanNames.map((spanName) => {
                    const event = events.get(spanName);
                    if (!event) {
                        throw new Error(`Missing collected iOS benchmark span ${spanName}.`);
                    }
                    return event;
                });
            }
            await sleep(POLL_INTERVAL_MS);
        }
        const missing = uniqueSpanNames.filter((spanName) => !events.has(spanName));
        throw new Error(`Timed out after ${timeoutSeconds}s waiting for iOS benchmark span(s): ${missing.join(', ')}.`);
    }

    return {begin, collect};
}

function readMarker(deviceID: string, appID: string, spanName: string): string | undefined {
    const temporaryDirectory = mkdtempSync(join(tmpdir(), 'expensify-journey-benchmark-ios-'));
    const localPath = join(temporaryDirectory, 'benchmark.log');
    try {
        const copied = runAllowFailure('xcrun', [
            'devicectl',
            'device',
            'copy',
            'from',
            '--device',
            deviceID,
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
}

export default createIOSJourneyBenchmarkReader;
