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
/**
 * Builder of the cache using `Array` primitive under the hood. It is an LRU cache, where the most recently accessed elements are at the end of the array, and the least recently accessed elements are at the front.
 * @param config - Cache configuration, check `CacheConfig` type for more details.
 * @returns
 */
function ArrayCache(config) {
    var cache = [];
    var maxSize = config.maxSize, keyComparator = config.keyComparator;
    /**
     * Returns the index of the key in the cache array.
     * We search the array backwards because the most recently added entries are at the end, and our heuristic follows the principles of an LRU cache - that the most recently added entries are most likely to be used again.
     */
    function getKeyIndex(key) {
        var _a;
        for (var i = cache.length - 1; i >= 0; i--) {
            var cacheItem = (_a = cache.at(i)) === null || _a === void 0 ? void 0 : _a.at(0);
            if (cacheItem && keyComparator(cacheItem, key)) {
                return i;
            }
        }
        return -1;
    }
    return {
        get: function (key) {
            var index = getKeyIndex(key);
            if (index === -1) {
                return undefined;
            }
            var entry = cache.splice(index, 1)[0];
            cache.push(entry);
            return { value: entry[1] };
        },
        set: function (key, value) {
            var index = getKeyIndex(key);
            if (index !== -1) {
                cache.splice(index, 1);
            }
            cache.push([key, value]);
            if (cache.length > maxSize) {
                cache.shift();
            }
        },
        getSet: function (key, valueProducer) {
            var index = getKeyIndex(key);
            if (index !== -1) {
                var entry = cache.splice(index, 1)[0];
                cache.push(entry);
                return { value: entry[1] };
            }
            var value = valueProducer();
            cache.push([key, value]);
            if (cache.length > maxSize) {
                cache.shift();
            }
            return { value: value };
        },
        snapshot: {
            keys: function () { return cache.map(function (entry) { return entry[0]; }); },
            values: function () { return cache.map(function (entry) { return entry[1]; }); },
            entries: function () { return __spreadArray([], cache, true); },
        },
        get size() {
            return cache.length;
        },
    };
}
exports.default = ArrayCache;
