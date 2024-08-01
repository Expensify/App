/**
 * Utility for formatting text for result outputs.
 * from: https://github.com/callstack/reassure/blob/main/packages/reassure-compare/src/utils/format.ts
 */
import type {Entry} from './console';

const formatPercent = (value: number): string => {
    const valueAsPercent = value * 100;
    return `${valueAsPercent.toFixed(1)}%`;
};

const formatPercentChange = (value: number): string => {
    const absValue = Math.abs(value);

    // Round to zero
    if (absValue < 0.005) {
        return '±0.0%';
    }

    return `${value >= 0 ? '+' : '-'}${formatPercent(absValue)}`;
};

const formatMetric = (duration: number, unit: string): string => `${duration.toFixed(3)} ${unit}`;

const formatMetricChange = (value: number, unit: string): string => {
    if (value > 0) {
        return `+${formatMetric(value, unit)}`;
    }
    if (value < 0) {
        return `${formatMetric(value, unit)}`;
    }
    return `0 ${unit}`;
};

const formatChange = (value: number): string => {
    if (value > 0) {
        return `+${value}`;
    }
    if (value < 0) {
        return `${value}`;
    }
    return '0';
};

const getDurationSymbols = (entry: Entry): string => {
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

const formatMetricDiffChange = (entry: Entry): string => {
    const {baseline, current} = entry;

    let output = `${formatMetric(baseline.mean, entry.unit)} → ${formatMetric(current.mean, entry.unit)}`;

    if (baseline.mean !== current.mean) {
        output += ` (${formatMetricChange(entry.diff, entry.unit)}, ${formatPercentChange(entry.relativeDurationDiff)})`;
    }

    output += ` ${getDurationSymbols(entry)}`;

    return output;
};

export {formatPercent, formatPercentChange, formatMetric, formatMetricChange, formatChange, getDurationSymbols, formatMetricDiffChange};
