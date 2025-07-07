"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
// eslint-disable-next-line no-restricted-imports
var react_native_onyx_1 = require("react-native-onyx");
var SearchContext_1 = require("@components/Search/SearchContext");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var COLLECTION_VALUES = Object.values(ONYXKEYS_1.default.COLLECTION);
var getDataByPath = function (data, path) {
    // Handle prefixed collections
    for (var _i = 0, COLLECTION_VALUES_1 = COLLECTION_VALUES; _i < COLLECTION_VALUES_1.length; _i++) {
        var collection = COLLECTION_VALUES_1[_i];
        if (path.startsWith(collection)) {
            var key = "".concat(collection).concat(path.slice(collection.length));
            return data === null || data === void 0 ? void 0 : data[key];
        }
    }
    // Handle direct keys
    return data === null || data === void 0 ? void 0 : data[path];
};
// Helper function to get key data from snapshot
var getKeyData = function (snapshotData, key, initialValue) {
    var _a, _b;
    if (key.endsWith('_')) {
        // Create object to store matching entries
        var result_1 = {};
        var prefix_1 = key;
        // Get all keys that start with the prefix
        Object.entries((_a = snapshotData === null || snapshotData === void 0 ? void 0 : snapshotData.data) !== null && _a !== void 0 ? _a : {}).forEach(function (_a) {
            var dataKey = _a[0], value = _a[1];
            if (!dataKey.startsWith(prefix_1)) {
                return;
            }
            result_1[dataKey] = value;
        });
        return (Object.keys(result_1).length > 0 ? result_1 : initialValue);
    }
    return ((_b = getDataByPath(snapshotData === null || snapshotData === void 0 ? void 0 : snapshotData.data, key)) !== null && _b !== void 0 ? _b : initialValue);
};
/**
 * Custom hook for accessing and subscribing to Onyx data with search snapshot support
 */
var useOnyx = function (key, options, dependencies) {
    var _a = (0, SearchContext_1.useSearchContext)(), isOnSearch = _a.isOnSearch, currentSearchHash = _a.currentSearchHash;
    var useOnyxOptions = options;
    var _b = useOnyxOptions !== null && useOnyxOptions !== void 0 ? useOnyxOptions : {}, selectorProp = _b.selector, optionsWithoutSelector = __rest(_b, ["selector"]);
    // Determine if we should use snapshot data based on search state and key
    var shouldUseSnapshot = (0, react_1.useMemo)(function () {
        return isOnSearch && !!currentSearchHash && !key.startsWith(ONYXKEYS_1.default.COLLECTION.SNAPSHOT) && CONST_1.default.SEARCH.SNAPSHOT_ONYX_KEYS.some(function (snapshotKey) { return key.startsWith(snapshotKey); });
    }, [isOnSearch, currentSearchHash, key]);
    // Create selector function that handles both regular and snapshot data
    var selector = (0, react_1.useMemo)(function () {
        if (!selectorProp || !shouldUseSnapshot) {
            return selectorProp;
        }
        return function (data) { return selectorProp(getKeyData(data, key)); };
    }, [selectorProp, shouldUseSnapshot, key]);
    var onyxOptions = __assign(__assign({}, optionsWithoutSelector), { selector: selector, allowDynamicKey: true });
    var snapshotKey = shouldUseSnapshot ? "".concat(ONYXKEYS_1.default.COLLECTION.SNAPSHOT).concat(currentSearchHash) : key;
    var originalResult = (0, react_native_onyx_1.useOnyx)(snapshotKey, onyxOptions, dependencies);
    // Extract and memoize the specific key data from snapshot if in search mode
    var result = (0, react_1.useMemo)(function () {
        // if it has selector, we don't need to use snapshot here
        if (!shouldUseSnapshot || selector) {
            return originalResult;
        }
        var keyData = getKeyData(originalResult[0], key, onyxOptions === null || onyxOptions === void 0 ? void 0 : onyxOptions.initialValue);
        return [keyData, originalResult[1]];
    }, [shouldUseSnapshot, originalResult, key, onyxOptions === null || onyxOptions === void 0 ? void 0 : onyxOptions.initialValue, selector]);
    return result;
};
exports.default = useOnyx;
