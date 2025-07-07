"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Log_1 = require("@libs/Log");
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isMemoizeStatsEntry(entry) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    return entry.didHit !== undefined && entry.processingTime !== undefined;
}
var MemoizeStats = /** @class */ (function () {
    function MemoizeStats(enabled) {
        /**
         * Number of calls to the memoized function. Both cache hits and misses are counted.
         */
        this.calls = 0;
        /**
         * Number of cache hits. This is the number of times the cache returned a value instead of calling the original function.
         */
        this.hits = 0;
        /**
         * Average time of cache retrieval. This is the time it takes to retrieve a value from the cache, without calling the original function.
         */
        this.avgCacheTime = 0;
        /**
         * Average time of original function execution. This is the time it takes to execute the original function when the cache does not have a value.
         */
        this.avgFnTime = 0;
        /**
         * Current cache size. This is the number of entries in the cache.
         */
        this.cacheSize = 0;
        this.isEnabled = false;
        this.isEnabled = enabled;
    }
    // See https://en.wikipedia.org/wiki/Moving_average#Cumulative_average
    MemoizeStats.prototype.calculateCumulativeAvg = function (avg, length, value) {
        var result = (avg * (length - 1) + value) / length;
        // If the length is 0, we return the average. For example, when calculating average cache retrieval time, hits may be 0, and in that case we want to return the current average cache retrieval time
        return Number.isFinite(result) ? result : avg;
    };
    MemoizeStats.prototype.cumulateEntry = function (entry) {
        this.calls++;
        this.cacheSize = entry.cacheSize;
        if (entry.didHit) {
            this.hits++;
            this.avgCacheTime = this.calculateCumulativeAvg(this.avgCacheTime, this.hits, entry.processingTime);
        }
        else {
            this.avgFnTime = this.calculateCumulativeAvg(this.avgFnTime, this.calls - this.hits, entry.processingTime);
        }
    };
    MemoizeStats.prototype.saveEntry = function (entry) {
        if (!this.isEnabled) {
            return;
        }
        if (!isMemoizeStatsEntry(entry)) {
            Log_1.default.warn('MemoizeStats:saveEntry: Invalid entry', entry);
            return;
        }
        return this.cumulateEntry(entry);
    };
    MemoizeStats.prototype.createEntry = function () {
        var _this = this;
        // If monitoring is disabled, return a dummy object that does nothing
        if (!this.isEnabled) {
            return {
                track: function () { },
                get: function () { },
                save: function () { },
                trackTime: function () { },
            };
        }
        var entry = {};
        return {
            track: function (cacheProp, value) {
                entry[cacheProp] = value;
            },
            trackTime: function (cacheProp, startTime, endTime) {
                if (endTime === void 0) { endTime = performance.now(); }
                entry[cacheProp] = endTime - startTime;
            },
            get: function (cacheProp) { return entry[cacheProp]; },
            save: function () { return _this.saveEntry(entry); },
        };
    };
    MemoizeStats.prototype.startMonitoring = function () {
        this.isEnabled = true;
        this.calls = 0;
        this.hits = 0;
        this.avgCacheTime = 0;
        this.avgFnTime = 0;
        this.cacheSize = 0;
    };
    MemoizeStats.prototype.stopMonitoring = function () {
        this.isEnabled = false;
        return {
            calls: this.calls,
            hits: this.hits,
            avgCacheTime: this.avgCacheTime,
            avgFnTime: this.avgFnTime,
            cacheSize: this.cacheSize,
        };
    };
    return MemoizeStats;
}());
exports.default = MemoizeStats;
