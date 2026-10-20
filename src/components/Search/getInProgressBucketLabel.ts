import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';

import type {Locale as DateFnsLocale} from 'date-fns';

import {format, parse} from 'date-fns';

import type {GroupedItem, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';

type GetInProgressBucketLabelParams = {
    groupBy: SearchGroupBy;
    item: GroupedItem;

    /** Today's date, as a yyyy-MM-dd string */
    today: string;

    /** The query's own date bounds. A group only counts as in progress while today is inside them. */
    dateFilterRange: {start?: string; end?: string};

    dateFnsLocale: DateFnsLocale | undefined;
    translate: LocalizedTranslate;
};

const DAY_FORMAT = 'MMM d';

/** How each time-based group names its period, e.g. "Oct 5", "Oct", "Q4" or "2026". Weeks are named with a translation instead. */
const PERIOD_FORMATS: Partial<Record<SearchGroupBy, string>> = {
    [CONST.SEARCH.GROUP_BY.DAY]: DAY_FORMAT,
    [CONST.SEARCH.GROUP_BY.MONTH]: 'LLL',
    [CONST.SEARCH.GROUP_BY.QUARTER]: 'QQQ',
    [CONST.SEARCH.GROUP_BY.YEAR]: 'yyyy',
};

/**
 * Labels the group that is still collecting expenses, the one whose dates include today, e.g. "Oct so far".
 * Returns undefined for every other group, including groups that aren't time-based.
 */
function getInProgressBucketLabel({groupBy, item, today, dateFnsLocale, dateFilterRange, translate}: GetInProgressBucketLabelParams): string | undefined {
    const range = CHART_GROUP_BY_CONFIG[groupBy].getDateRange?.(item);
    if (!range || today < range.start || today > range.end) {
        return undefined;
    }

    // A query that ends before today is complete even when its last group isn't, e.g. a custom range ending yesterday.
    if ((dateFilterRange.start && today < dateFilterRange.start) || (dateFilterRange.end && today > dateFilterRange.end)) {
        return undefined;
    }

    const start = parse(range.start, CONST.DATE.FNS_FORMAT_STRING, new Date());
    const periodFormat = PERIOD_FORMATS[groupBy];
    const period = periodFormat ? format(start, periodFormat, {locale: dateFnsLocale}) : translate('search.weekOf', {date: format(start, DAY_FORMAT, {locale: dateFnsLocale})});
    return translate('search.periodSoFar', {period});
}

export default getInProgressBucketLabel;
