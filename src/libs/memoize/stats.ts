import Log from '@libs/Log';

type MemoizeStatsEntry = {
    didHit: boolean;
    processingTime: number;
    cacheSize: number;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMemoizeStatsEntry(entry: any): entry is MemoizeStatsEntry {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return entry.didHit !== undefined && entry.processingTime !== undefined;
}

class MemoizeStats {
    private calls = 0;

    private hits = 0;

    private avgCacheTime = 0;

    private avgFnTime = 0;

    private cacheSize = 0;

    isEnabled = false;

    constructor(enabled: boolean) {
        this.isEnabled = enabled;
    }

    // See https://en.wikipedia.org/wiki/Moving_average#Cumulative_average
    private calculateCumulativeAvg(avg: number, length: number, value: number) {
        const result = (avg * (length - 1) + value) / length;
        // If the length is 0, we return the average. For example, when calculating average cache retrieval time, hits may be 0, and in that case we want to return the current average cache retrieval time
        return Number.isFinite(result) ? result : avg;
    }

    private cumulateEntry(entry: MemoizeStatsEntry) {
        this.calls++;
        this.cacheSize = entry.cacheSize;

        if (entry.didHit) {
            this.hits++;
            this.avgCacheTime = this.calculateCumulativeAvg(this.avgCacheTime, this.hits, entry.processingTime);
        } else {
            this.avgFnTime = this.calculateCumulativeAvg(this.avgFnTime, this.calls - this.hits, entry.processingTime);
        }
    }

    private saveEntry(entry: Partial<MemoizeStatsEntry>) {
        if (!this.isEnabled) {
            return;
        }

        if (!isMemoizeStatsEntry(entry)) {
            Log.warn('MemoizeStats:saveEntry: Invalid entry', entry);
            return;
        }

        return this.cumulateEntry(entry);
    }

    createEntry() {
        // If monitoring is disabled, return a dummy object that does nothing
        if (!this.isEnabled) {
            return {
                track: () => {},
                get: () => {},
                save: () => {},
                trackTime: () => {},
            };
        }

        const entry: Partial<MemoizeStatsEntry> = {};

        return {
            track: <P extends keyof MemoizeStatsEntry>(cacheProp: P, value: MemoizeStatsEntry[P]) => {
                entry[cacheProp] = value;
            },
            trackTime: <P extends keyof Pick<MemoizeStatsEntry, 'processingTime'>>(cacheProp: P, startTime: number, endTime = performance.now()) => {
                entry[cacheProp] = endTime - startTime;
            },
            get: <P extends keyof MemoizeStatsEntry>(cacheProp: P) => entry[cacheProp],
            save: () => this.saveEntry(entry),
        };
    }

    startMonitoring() {
        this.isEnabled = true;
        this.calls = 0;
        this.hits = 0;
        this.avgCacheTime = 0;
        this.avgFnTime = 0;
        this.cacheSize = 0;
    }

    stopMonitoring() {
        this.isEnabled = false;

        return {
            calls: this.calls,
            hits: this.hits,
            avgCacheTime: this.avgCacheTime,
            avgFnTime: this.avgFnTime,
            cacheSize: this.cacheSize,
        };
    }
}

export type {MemoizeStatsEntry};
export {MemoizeStats};
