'use strict';
var __spreadArrays =
    (this && this.__spreadArrays) ||
    function () {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++) for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++) r[k] = a[j];
        return r;
    };
exports.__esModule = true;
exports.Memoize = void 0;
var ArrayCache_1 = require('./cache/ArrayCache');
var stats_1 = require('./stats');
var utils_1 = require('./utils');
/**
 * Global memoization class. Use it to orchestrate memoization (e.g. start/stop global monitoring).
 */
var Memoize = /** @class */ (function () {
    function Memoize() {}
    Memoize.registerMemoized = function (id, memoized) {
        this.memoizedList.push({id: id, memoized: memoized});
    };
    Memoize.startMonitoring = function () {
        if (this.isMonitoringEnabled) {
            return;
        }
        this.isMonitoringEnabled = true;
        Memoize.memoizedList.forEach(function (_a) {
            var memoized = _a.memoized;
            memoized.startMonitoring();
        });
    };
    Memoize.stopMonitoring = function () {
        if (!this.isMonitoringEnabled) {
            return;
        }
        this.isMonitoringEnabled = false;
        return Memoize.memoizedList.map(function (_a) {
            var id = _a.id,
                memoized = _a.memoized;
            return {id: id, stats: memoized.stopMonitoring()};
        });
    };
    Memoize.isMonitoringEnabled = false;
    Memoize.memoizedList = [];
    return Memoize;
})();
exports.Memoize = Memoize;
/**
 * Wraps a function with a memoization layer. Useful for caching expensive calculations.
 * @param fn - Function to memoize
 * @param opts - Options for the memoization layer, for more details see `ClientOptions` type.
 * @returns Memoized function with a cache API attached to it.
 */
function memoize(fn, opts) {
    var _a;
    var options = utils_1.mergeOptions(opts);
    var cache = ArrayCache_1['default']({maxSize: options.maxSize, keyComparator: utils_1.getEqualityComparator(options)});
    var stats = new stats_1.MemoizeStats(options.monitor || Memoize.isMonitoringEnabled);
    var memoized = function memoized() {
        var _a;
        var _newTarget = this && this instanceof memoized ? this.constructor : void 0;
        var _b;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var statsEntry = stats.createEntry();
        var retrievalTimeStart = performance.now();
        // Detect if memoized function was called with `new` keyword. If so we need to call the original function as constructor.
        var constructable = !!_newTarget;
        // If skipCache is set, check if we should skip the cache
        if ((_b = options.skipCache) === null || _b === void 0 ? void 0 : _b.call(options, args)) {
            var fnTimeStart = performance.now();
            var result = constructable ? new ((_a = fn).bind.apply(_a, __spreadArrays([void 0], args)))() : fn.apply(void 0, args);
            statsEntry.trackTime('processingTime', fnTimeStart);
            statsEntry.track('didHit', false);
            return result;
        }
        var truncatedArgs = utils_1.truncateArgs(args, options.maxArgs);
        var key = options.transformKey ? options.transformKey(truncatedArgs) : truncatedArgs;
        var cached = cache.getSet(key, function () {
            var _a;
            var fnTimeStart = performance.now();
            var result = constructable ? new ((_a = fn).bind.apply(_a, __spreadArrays([void 0], args)))() : fn.apply(void 0, args);
            // Track processing time
            statsEntry.trackTime('processingTime', fnTimeStart);
            statsEntry.track('didHit', false);
            return result;
        });
        // If processing time was not tracked inside getSet callback, track it as a cache retrieval
        if (statsEntry.get('processingTime') === undefined) {
            statsEntry.trackTime('processingTime', retrievalTimeStart);
            statsEntry.track('didHit', true);
        }
        statsEntry.track('cacheSize', cache.size);
        statsEntry.save();
        return cached.value;
    };
    /**
     * Cache API attached to the memoized function. Currently there is an issue with typing cache keys, but the functionality works as expected.
     */
    memoized.cache = cache;
    memoized.startMonitoring = function () {
        return stats.startMonitoring();
    };
    memoized.stopMonitoring = function () {
        return stats.stopMonitoring();
    };
    Memoize.registerMemoized((_a = options.monitoringName) !== null && _a !== void 0 ? _a : fn.name, memoized);
    return memoized;
}
exports['default'] = memoize;
