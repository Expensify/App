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

const formatDuration = (duration: number): string => `${duration.toFixed(3)} ms`;

const formatDurationChange = (value: number): string => {
    if (value > 0) {
        return `+${formatDuration(value)}`;
    }
    if (value < 0) {
        return `${formatDuration(value)}`;
    }
    return '0 ms';
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

const formatDurationDiffChange = (entry: Entry): string => {
    const {baseline, current} = entry;

    let output = `${formatDuration(baseline.mean)} → ${formatDuration(current.mean)}`;

    if (baseline.mean !== current.mean) {
        output += ` (${formatDurationChange(entry.diff)}, ${formatPercentChange(entry.relativeDurationDiff)})`;
    }

    output += ` ${getDurationSymbols(entry)}`;

    return output;
};

export {formatPercent, formatPercentChange, formatDuration, formatDurationChange, formatChange, getDurationSymbols, formatDurationDiffChange};
