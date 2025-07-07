"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Memoize = void 0;
var ArrayCache_1 = require("./cache/ArrayCache");
var stats_1 = require("./stats");
var utils_1 = require("./utils");
/**
 * Global memoization class. Use it to orchestrate memoization (e.g. start/stop global monitoring).
 */
var Memoize = /** @class */ (function () {
    function Memoize() {
    }
    Memoize.registerMemoized = function (id, memoized) {
        this.memoizedList.push({ id: id, memoized: memoized });
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
            var id = _a.id, memoized = _a.memoized;
            return ({ id: id, stats: memoized.stopMonitoring() });
        });
    };
    Memoize.isMonitoringEnabled = false;
    Memoize.memoizedList = [];
    return Memoize;
}());
exports.Memoize = Memoize;
/**
 * Wraps a function with a memoization layer. Useful for caching expensive calculations.
 * @param fn - Function to memoize
 * @param opts - Options for the memoization layer, for more details see `ClientOptions` type.
 * @returns Memoized function with a cache API attached to it.
 */
function memoize(fn, opts) {
    var _a;
    var options = (0, utils_1.mergeOptions)(opts);
    var cache = (0, ArrayCache_1.default)({ maxSize: options.maxSize, keyComparator: (0, utils_1.getEqualityComparator)(options) });
    var stats = new stats_1.default(options.monitor || Memoize.isMonitoringEnabled);
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
            var result = (constructable ? new ((_a = fn).bind.apply(_a, __spreadArray([void 0], args, false)))() : fn.apply(void 0, args));
            statsEntry.trackTime('processingTime', fnTimeStart);
            statsEntry.track('didHit', false);
            return result;
        }
        var truncatedArgs = (0, utils_1.truncateArgs)(args, options.maxArgs);
        var key = options.transformKey ? options.transformKey(truncatedArgs) : truncatedArgs;
        var cached = cache.getSet(key, function () {
            var _a;
            var fnTimeStart = performance.now();
            var result = (constructable ? new ((_a = fn).bind.apply(_a, __spreadArray([void 0], args, false)))() : fn.apply(void 0, args));
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
    memoized.startMonitoring = function () { return stats.startMonitoring(); };
    memoized.stopMonitoring = function () { return stats.stopMonitoring(); };
    Memoize.registerMemoized((_a = options.monitoringName) !== null && _a !== void 0 ? _a : fn.name, memoized);
    return memoized;
}
exports.default = memoize;
