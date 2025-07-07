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
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeOptions = mergeOptions;
exports.getEqualityComparator = getEqualityComparator;
exports.truncateArgs = truncateArgs;
var fast_equals_1 = require("fast-equals");
var const_1 = require("./const");
function getEqualityComparator(opts) {
    // Use the custom equality comparator if it is provided
    if (typeof opts.equality === 'function') {
        return opts.equality;
    }
    if (opts.equality === 'shallow') {
        return fast_equals_1.shallowEqual;
    }
    return fast_equals_1.deepEqual;
}
function mergeOptions(options) {
    if (!options) {
        return const_1.default;
    }
    return __assign(__assign({}, const_1.default), options);
}
function truncateArgs(args, maxArgs) {
    // Hot paths are declared explicitly to avoid the overhead of the slice method
    if (maxArgs === undefined) {
        return args;
    }
    if (maxArgs >= args.length) {
        return args;
    }
    if (maxArgs === 0) {
        return [];
    }
    if (maxArgs === 1) {
        return [args[0]];
    }
    if (maxArgs === 2) {
        return [args[0], args[1]];
    }
    if (maxArgs === 3) {
        return [args[0], args[1], args[2]];
    }
    return args.slice(0, maxArgs);
}
