type MemoizeStatsEntry = {
    keyLength: number;
    didHit: boolean;
    processingTime: number;
};

class MemoizeStats {
    private calls = 0;

    private hits = 0;

    private avgKeyLength = 0;

    private avgCacheRetrievalTime = 0;

    private avgFnTime = 0;

    enabled = false;

    constructor(enabled: boolean) {
        this.enabled = enabled;
    }

    // See https://en.wikipedia.org/wiki/Moving_average#Cumulative_average
    private calculateCumulativeAvg(avg: number, length: number, value: number) {
        return (avg * (length - 1) + value) / length;
    }

    private cumulateEntry(entry: MemoizeStatsEntry) {
        if (!this.enabled) {
            return;
        }

        this.calls++;
        this.hits += entry.didHit ? 1 : 0;

        this.avgKeyLength = this.calculateCumulativeAvg(this.avgKeyLength, this.calls, entry.keyLength);

        if (entry.didHit) {
            this.avgCacheRetrievalTime = this.calculateCumulativeAvg(this.avgCacheRetrievalTime, this.hits, entry.processingTime);
        } else {
            this.avgFnTime = this.calculateCumulativeAvg(this.avgFnTime, this.calls - this.hits, entry.processingTime);
        }
    }

    createEntry() {
        // If monitoring is disabled, return a dummy object that does nothing
        if (!this.enabled) {
            return {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                registerStat: <P extends keyof MemoizeStatsEntry>(cacheProp: P, value: MemoizeStatsEntry[P]) => {},
                save: () => {},
            };
        }

        const entry: Partial<MemoizeStatsEntry> = {};

        return {
            registerStat: <P extends keyof MemoizeStatsEntry>(cacheProp: P, value: MemoizeStatsEntry[P]) => {
                entry[cacheProp] = value;
            },
            save: () => {
                // Check if all required stats are present
                if (entry.keyLength === undefined || entry.didHit === undefined || entry.processingTime === undefined) {
                    return;
                }

                this.cumulateEntry(entry as MemoizeStatsEntry);
            },
        };
    }

    startMonitoring() {
        this.enabled = true;
        this.calls = 0;
        this.hits = 0;
        this.avgKeyLength = 0;
        this.avgCacheRetrievalTime = 0;
        this.avgFnTime = 0;
    }

    stopMonitoring() {
        this.enabled = false;

        return {
            calls: this.calls,
            hits: this.hits,
            avgKeyLength: this.avgKeyLength,
            avgCacheRetrievalTime: this.avgCacheRetrievalTime,
            avgFnTime: this.avgFnTime,
        };
    }
}

export type {MemoizeStatsEntry};
export {MemoizeStats};
