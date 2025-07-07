"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shallowCompare = void 0;
exports.filterObject = filterObject;
var getDefinedKeys = function (obj) {
    return Object.entries(obj)
        .filter(function (_a) {
        var value = _a[1];
        return value !== undefined;
    })
        .map(function (_a) {
        var key = _a[0];
        return key;
    });
};
var shallowCompare = function (obj1, obj2) {
    if (!obj1 && !obj2) {
        return true;
    }
    if (obj1 && obj2) {
        var keys1 = getDefinedKeys(obj1);
        var keys2 = getDefinedKeys(obj2);
        return keys1.length === keys2.length && keys1.every(function (key) { return obj1[key] === obj2[key]; });
    }
    return false;
};
exports.shallowCompare = shallowCompare;
function filterObject(obj, predicate) {
    return Object.keys(obj)
        .filter(function (key) { return predicate(key, obj[key]); })
        .reduce(function (result, key) {
        // eslint-disable-next-line no-param-reassign
        result[key] = obj[key];
        return result;
    }, {});
}
