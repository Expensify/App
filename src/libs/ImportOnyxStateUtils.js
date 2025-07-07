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
exports.cleanAndTransformState = cleanAndTransformState;
exports.importState = importState;
exports.transformNumericKeysToArray = transformNumericKeysToArray;
var cloneDeep_1 = require("lodash/cloneDeep");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ImportOnyxState_1 = require("./actions/ImportOnyxState");
// List of Onyx keys from the .txt file we want to keep for the local override
var keysToOmit = [ONYXKEYS_1.default.ACTIVE_CLIENTS, ONYXKEYS_1.default.FREQUENTLY_USED_EMOJIS, ONYXKEYS_1.default.NETWORK, ONYXKEYS_1.default.CREDENTIALS, ONYXKEYS_1.default.PREFERRED_THEME];
function isRecord(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null;
}
function transformNumericKeysToArray(data) {
    var dataCopy = (0, cloneDeep_1.default)(data);
    if (!isRecord(dataCopy)) {
        return Array.isArray(dataCopy) ? dataCopy.map(transformNumericKeysToArray) : dataCopy;
    }
    var keys = Object.keys(dataCopy);
    if (keys.length === 0) {
        return dataCopy;
    }
    var allKeysAreNumeric = keys.every(function (key) { return !Number.isNaN(Number(key)); });
    var keysAreSequential = keys.every(function (key, index) { return parseInt(key, 10) === index; });
    if (allKeysAreNumeric && keysAreSequential) {
        return keys.map(function (key) { return transformNumericKeysToArray(dataCopy[key]); });
    }
    for (var key in dataCopy) {
        if (key in dataCopy) {
            dataCopy[key] = transformNumericKeysToArray(dataCopy[key]);
        }
    }
    return dataCopy;
}
function cleanAndTransformState(state) {
    var parsedState = JSON.parse(state);
    Object.keys(parsedState).forEach(function (key) {
        var shouldOmit = keysToOmit.some(function (onyxKey) { return key.startsWith(onyxKey); });
        if (shouldOmit) {
            delete parsedState[key];
        }
    });
    var transformedState = transformNumericKeysToArray(parsedState);
    return transformedState;
}
function importState(transformedState) {
    var collectionKeys = __spreadArray([], new Set(Object.values(ONYXKEYS_1.default.COLLECTION)), true);
    var collectionsMap = new Map();
    var regularState = {};
    Object.entries(transformedState).forEach(function (_a) {
        var entryKey = _a[0], entryValue = _a[1];
        var key = entryKey;
        var value = entryValue;
        var collectionKey = collectionKeys.find(function (cKey) { return key.startsWith(cKey); });
        if (collectionKey) {
            if (!collectionsMap.has(collectionKey)) {
                collectionsMap.set(collectionKey, {});
            }
            var collection = collectionsMap.get(collectionKey);
            if (!collection) {
                return;
            }
            collection[key] = value;
        }
        else {
            regularState[key] = value;
        }
    });
    return (0, ImportOnyxState_1.clearOnyxStateBeforeImport)()
        .then(function () { return (0, ImportOnyxState_1.importOnyxCollectionState)(collectionsMap); })
        .then(function () { return (0, ImportOnyxState_1.importOnyxRegularState)(regularState); });
}
