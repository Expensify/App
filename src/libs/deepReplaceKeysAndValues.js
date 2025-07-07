"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @param target the object or value to transform
 * @param oldVal the value to search for
 * @param newVal the replacement value
 */
function deepReplaceKeysAndValues(target, oldVal, newVal) {
    if (!target) {
        return target;
    }
    if (typeof target === 'string') {
        return target.replace(oldVal, newVal);
    }
    if (typeof target !== 'object') {
        return target;
    }
    if (Array.isArray(target)) {
        return target.map(function (item) { return deepReplaceKeysAndValues(item, oldVal, newVal); });
    }
    var newObj = {};
    Object.entries(target).forEach(function (_a) {
        var key = _a[0], val = _a[1];
        var newKey = key.replace(oldVal, newVal);
        if (val instanceof File || val instanceof Blob) {
            newObj[newKey] = val;
            return;
        }
        if (typeof val === 'object') {
            newObj[newKey] = deepReplaceKeysAndValues(val, oldVal, newVal);
            return;
        }
        if (val === oldVal) {
            newObj[newKey] = newVal;
            return;
        }
        if (typeof val === 'string') {
            newObj[newKey] = val.replace(oldVal, newVal);
            return;
        }
        newObj[newKey] = val;
    });
    return newObj;
}
exports.default = deepReplaceKeysAndValues;
