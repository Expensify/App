import type {YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

/**
 * Builds a stable lookup key for a bar tooltip entry.
 * Uses the raw series x value for horizontal charts (category name) and the chart x value otherwise.
 */
function getBarTooltipKey(yKey: YKey, xValue: string | number): string {
    return `${yKey}:${xValue}`;
}

export default getBarTooltipKey;
