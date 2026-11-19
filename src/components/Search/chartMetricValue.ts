import CONST from '@src/CONST';
import type {SearchWorkflowStageDurations} from '@src/types/onyx/SearchResults';

import type {GroupedItem, SearchChartMetric} from './types';

/** Returns how long a group's reports spent in the charted workflow stage, in seconds, or undefined when the group doesn't report one */
function getAverageDuration(item: GroupedItem): number | undefined {
    return 'averageDuration' in item ? (item.averageDuration ?? undefined) : undefined;
}

const STAGE_DURATION_GETTERS: Record<keyof SearchWorkflowStageDurations, (item: GroupedItem) => number | null | undefined> = {
    submitAverageTime: (item) => ('submitAverageTime' in item ? item.submitAverageTime : undefined),
    approveAverageTime: (item) => ('approveAverageTime' in item ? item.approveAverageTime : undefined),
    reimburseAverageTime: (item) => ('reimburseAverageTime' in item ? item.reimburseAverageTime : undefined),
};

/** Returns how long a time bucket's reports spent in one workflow stage, in seconds, or null or undefined when none of them completed it */
function getStageDuration(item: GroupedItem, durationField: keyof SearchWorkflowStageDurations): number | null | undefined {
    return STAGE_DURATION_GETTERS[durationField](item);
}

/**
 * Returns whether a group has a value to plot for the metric.
 * A group none of whose reports completed the stage has no duration, and plotting it as 0 would read as reports that took no time at all.
 * A compared period reports a group it has no expenses for with a count and duration of 0 rather than null, so the count is checked too.
 */
function hasChartedValue(item: GroupedItem, metric: SearchChartMetric | undefined): boolean {
    return metric !== CONST.SEARCH.CHART_METRIC.DURATION || (!!item.count && getAverageDuration(item) !== undefined);
}

export {getAverageDuration, getStageDuration, hasChartedValue};
