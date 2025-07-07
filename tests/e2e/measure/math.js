"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var filterOutliersViaIQR = function (data) {
    var _a, _b, _c, _d, _e, _f;
    var q1;
    var q3;
    var values = data.slice().sort(function (a, b) { return a - b; });
    if ((values.length / 4) % 1 === 0) {
        q1 = (1 / 2) * (((_a = values.at(values.length / 4)) !== null && _a !== void 0 ? _a : 0) + ((_b = values.at(values.length / 4 + 1)) !== null && _b !== void 0 ? _b : 0));
        q3 = (1 / 2) * (((_c = values.at(values.length * (3 / 4))) !== null && _c !== void 0 ? _c : 0) + ((_d = values.at(values.length * (3 / 4) + 1)) !== null && _d !== void 0 ? _d : 0));
    }
    else {
        q1 = (_e = values.at(Math.floor(values.length / 4 + 1))) !== null && _e !== void 0 ? _e : 0;
        q3 = (_f = values.at(Math.ceil(values.length * (3 / 4) + 1))) !== null && _f !== void 0 ? _f : 0;
    }
    var iqr = q3 - q1;
    var maxValue = q3 + iqr * 1.5;
    var minValue = q1 - iqr * 1.5;
    return values.filter(function (x) { return x >= minValue && x <= maxValue; });
};
var mean = function (arr) { return arr.reduce(function (a, b) { return a + b; }, 0) / arr.length; };
var std = function (arr) {
    var avg = mean(arr);
    return Math.sqrt(arr.map(function (i) { return Math.pow((i - avg), 2); }).reduce(function (a, b) { return a + b; }) / arr.length);
};
var getStats = function (entries) {
    var cleanedEntries = filterOutliersViaIQR(entries);
    var meanDuration = mean(cleanedEntries);
    var stdevDuration = std(cleanedEntries);
    return {
        mean: meanDuration,
        stdev: stdevDuration,
        runs: cleanedEntries.length,
        entries: cleanedEntries,
    };
};
exports.default = getStats;
