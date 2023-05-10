/**
 * Utility for formatting text for result outputs.
 * from: https://github.com/callstack/reassure/blob/main/packages/reassure-compare/src/utils/format.ts
 */

const formatPercent = (value) => {
    const valueAsPercent = value * 100;
    return `${valueAsPercent.toFixed(1)}%`;
};

const formatPercentChange = (value) => {
    const absValue = Math.abs(value);

    // Round to zero
    if (absValue < 0.005) { return '±0.0%'; }

    return `${value >= 0 ? '+' : '-'}${formatPercent(absValue)}`;
};

const formatDuration = duration => `${duration.toFixed(3)} ms`;

const formatDurationChange = (value) => {
    if (value > 0) {
        return `+${formatDuration(value)}`;
    }
    if (value < 0) {
        return `${formatDuration(value)}`;
    }
    return '0 ms';
};

const formatChange = (value) => {
    if (value > 0) { return `+${value}`; }
    if (value < 0) { return `${value}`; }
    return '0';
};

const getDurationSymbols = (entry) => {
    if (!entry.isDurationDiffOfSignificance) {
        if (entry.relativeDurationDiff > 0.15) { return '🟡'; }
        if (entry.relativeDurationDiff < -0.15) { return '🟢'; }
        return '';
    }

    if (entry.relativeDurationDiff > 0.33) { return '🔴🔴'; }
    if (entry.relativeDurationDiff > 0.05) { return '🔴'; }
    if (entry.relativeDurationDiff < -0.33) { return '🟢🟢'; }
    if (entry.relativeDurationDiff < -0.05) { return ' 🟢'; }

    return '';
};

const formatDurationDiffChange = (entry) => {
    const {baseline, current} = entry;

    let output = `${formatDuration(baseline.mean)} → ${formatDuration(current.mean)}`;

    if (baseline.mean !== current.mean) {
        output += ` (${formatDurationChange(entry.diff)}, ${formatPercentChange(entry.relativeDurationDiff)})`;
    }

    output += ` ${getDurationSymbols(entry)}`;

    return output;
};

module.exports = {
    formatPercent,
    formatPercentChange,
    formatDuration,
    formatDurationChange,
    formatChange,
    getDurationSymbols,
    formatDurationDiffChange,
};
