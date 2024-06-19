type MemoizeStatsEntry = {
    keyLength: number;
    didHit: boolean;
    cacheRetrievalTime: number;
    fnTime?: number;
    cacheSize: number;
};

class MemoizeStats {
    private calls = 0;

    private hits = 0;

    private avgKeyLength = 0;

    private avgCacheRetrievalTime = 0;

    private avgFnTime = 0;

    private cacheSize = 0;

    enabled = false;

    constructor(enabled: boolean) {
        this.enabled = enabled;
    }

    // See https://en.wikipedia.org/wiki/Moving_average#Cumulative_average
    private calculateCumulativeAvg(avg: number, length: number, value: number) {
        return (avg * (length - 1) + value) / length;
    }

    private cumulateEntry(entry: MemoizeStatsEntry) {
        this.calls++;
        this.hits += entry.didHit ? 1 : 0;

        this.cacheSize = entry.cacheSize;

        this.avgKeyLength = this.calculateCumulativeAvg(this.avgKeyLength, this.calls, entry.keyLength);

        this.avgCacheRetrievalTime = this.calculateCumulativeAvg(this.avgCacheRetrievalTime, this.hits, entry.cacheRetrievalTime);

        if (entry.fnTime !== undefined) {
            this.avgFnTime = this.calculateCumulativeAvg(this.avgFnTime, this.calls - this.hits, entry.fnTime);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static isMemoizeStatsEntry(entry: any): entry is MemoizeStatsEntry {
        return entry.keyLength !== undefined && entry.didHit !== undefined && entry.cacheRetrievalTime !== undefined;
    }

    // eslint-disable-next-line rulesdir/prefer-early-return
    private saveEntry(entry: Partial<MemoizeStatsEntry>) {
        if (this.enabled && MemoizeStats.isMemoizeStatsEntry(entry)) {
            this.cumulateEntry(entry);
        }
    }

    createEntry() {
        // If monitoring is disabled, return a dummy object that does nothing
        if (!this.enabled) {
            return {
                track: () => {},
                save: () => {},
            };
        }

        const entry: Partial<MemoizeStatsEntry> = {};

        return {
            track: <P extends keyof MemoizeStatsEntry>(cacheProp: P, value: MemoizeStatsEntry[P]) => {
                entry[cacheProp] = value;
            },
            save: () => this.saveEntry(entry),
        };
    }

    startMonitoring() {
        this.enabled = true;
        this.calls = 0;
        this.hits = 0;
        this.avgKeyLength = 0;
        this.avgCacheRetrievalTime = 0;
        this.avgFnTime = 0;
        this.cacheSize = 0;
    }

    stopMonitoring() {
        this.enabled = false;

        return {
            calls: this.calls,
            hits: this.hits,
            avgKeyLength: this.avgKeyLength,
            avgCacheRetrievalTime: this.avgCacheRetrievalTime,
            avgFnTime: this.avgFnTime,
            cacheSize: this.cacheSize,
        };
    }
}

export type {MemoizeStatsEntry};
export {MemoizeStats};
