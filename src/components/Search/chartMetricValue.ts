import CONST from '@src/CONST';

import type {GroupedItem, SearchChartMetric} from './types';

/** Returns how long a group's reports spent in the charted workflow stage, in seconds, or undefined when the group doesn't report one */
function getAverageDuration(item: GroupedItem): number | undefined {
    return 'averageDuration' in item ? (item.averageDuration ?? undefined) : undefined;
}

/**
 * Returns whether a group has a value to plot for the metric.
 * A group none of whose reports completed the stage has no duration, and plotting it as 0 would read as reports that took no time at all.
 * A compared period reports a group it has no expenses for with a count and duration of 0 rather than null, so the count is checked too.
 */
function hasChartedValue(item: GroupedItem, metric: SearchChartMetric | undefined): boolean {
    return metric !== CONST.SEARCH.CHART_METRIC.DURATION || (!!item.count && getAverageDuration(item) !== undefined);
}

export {getAverageDuration, hasChartedValue};
