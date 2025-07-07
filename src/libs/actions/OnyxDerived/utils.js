"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Check if a specific key exists in sourceValue from OnyxDerived
 */
var hasKeyTriggeredCompute = function (key, sourceValues) {
    if (!sourceValues) {
        return false;
    }
    return Object.keys(sourceValues).some(function (sourceKey) { return sourceKey === key; });
};
exports.default = hasKeyTriggeredCompute;
