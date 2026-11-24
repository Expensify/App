/** Lays out Recent history's bars: each period's bar and the average marker on one scale. */
import CONST from '@src/CONST';
import type {InsightsDetailsHistoryPeriod} from '@src/types/onyx';

import {format} from 'date-fns';

/** Most periods the section lists, counting the summarized one */
const RECENT_HISTORY_PERIOD_COUNT = 4;

type RecentHistoryRow = {
    /** First day of the period, as yyyy-MM-dd */
    start: string;

    /** Spend in the period, in the group currency's smallest unit */
    total: number;

    /** Bar length, as a percentage of the longest bar or the average, whichever is larger */
    widthPercent: number;

    /** Whether the period hasn't ended yet */
    isInProgress: boolean;
};

type RecentHistoryLayout = {
    /** Newest first */
    rows: RecentHistoryRow[];

    /** Position of the average marker on the bars' scale, undefined when the average isn't shown */
    averageWidthPercent: number | undefined;
};

/** Returns the first day of a history period, as yyyy-MM-dd. */
function getHistoryPeriodStart(period: InsightsDetailsHistoryPeriod): string {
    if ('day' in period) {
        return period.day;
    }
    if ('week' in period) {
        return period.week;
    }
    if ('quarter' in period) {
        return format(new Date(period.year, (period.quarter - 1) * 3, 1), CONST.DATE.FNS_FORMAT_STRING);
    }
    if ('month' in period) {
        return format(new Date(period.year, period.month - 1, 1), CONST.DATE.FNS_FORMAT_STRING);
    }
    return `${period.year}-01-01`;
}

/**
 * Lays out the periods, newest first, on a scale that fits both the longest bar and the average.
 * Refunds can make a period negative, which draws no bar.
 */
function buildRecentHistoryRows(allHistory: InsightsDetailsHistoryPeriod[], average: number | undefined, isNewestInProgress: boolean): RecentHistoryLayout {
    const history = allHistory.slice(0, RECENT_HISTORY_PERIOD_COUNT);
    const scale = Math.max(average ?? 0, ...history.map(({total}) => total));
    const getWidthPercent = (value: number) => (scale > 0 ? (Math.max(value, 0) / scale) * 100 : 0);

    return {
        rows: history.map((period, index) => ({
            start: getHistoryPeriodStart(period),
            total: period.total,
            widthPercent: getWidthPercent(period.total),
            isInProgress: isNewestInProgress && index === 0,
        })),
        averageWidthPercent: average === undefined || scale <= 0 ? undefined : getWidthPercent(average),
    };
}

export default buildRecentHistoryRows;
export {RECENT_HISTORY_PERIOD_COUNT};
