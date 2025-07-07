"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatMetricDiffChange = exports.getDurationSymbols = exports.formatChange = exports.formatMetricChange = exports.formatMetric = exports.formatPercentChange = exports.formatPercent = void 0;
var formatPercent = function (value) {
    var valueAsPercent = value * 100;
    return "".concat(valueAsPercent.toFixed(1), "%");
};
exports.formatPercent = formatPercent;
var formatPercentChange = function (value) {
    var absValue = Math.abs(value);
    // Round to zero
    if (absValue < 0.005) {
        return '±0.0%';
    }
    return "".concat(value >= 0 ? '+' : '-').concat(formatPercent(absValue));
};
exports.formatPercentChange = formatPercentChange;
var formatMetric = function (duration, unit) { return "".concat(duration.toFixed(3), " ").concat(unit); };
exports.formatMetric = formatMetric;
var formatMetricChange = function (value, unit) {
    if (value > 0) {
        return "+".concat(formatMetric(value, unit));
    }
    if (value < 0) {
        return "".concat(formatMetric(value, unit));
    }
    return "0 ".concat(unit);
};
exports.formatMetricChange = formatMetricChange;
var formatChange = function (value) {
    if (value > 0) {
        return "+".concat(value);
    }
    if (value < 0) {
        return "".concat(value);
    }
    return '0';
};
exports.formatChange = formatChange;
var getDurationSymbols = function (entry) {
    if (!entry.isDurationDiffOfSignificance) {
        if (entry.relativeDurationDiff > 0.15) {
            return '🟡';
        }
        if (entry.relativeDurationDiff < -0.15) {
            return '🟢';
        }
        return '';
    }
    if (entry.relativeDurationDiff > 0.33) {
        return '🔴🔴';
    }
    if (entry.relativeDurationDiff > 0.05) {
        return '🔴';
    }
    if (entry.relativeDurationDiff < -0.33) {
        return '🟢🟢';
    }
    if (entry.relativeDurationDiff < -0.05) {
        return ' 🟢';
    }
    return '';
};
exports.getDurationSymbols = getDurationSymbols;
var formatMetricDiffChange = function (entry) {
    var baseline = entry.baseline, current = entry.current;
    var output = "".concat(formatMetric(baseline.mean, entry.unit), " \u2192 ").concat(formatMetric(current.mean, entry.unit));
    if (baseline.mean !== current.mean) {
        output += " (".concat(formatMetricChange(entry.diff, entry.unit), ", ").concat(formatPercentChange(entry.relativeDurationDiff), ")");
    }
    output += " ".concat(getDurationSymbols(entry));
    return output;
};
exports.formatMetricDiffChange = formatMetricDiffChange;
