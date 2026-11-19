import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';

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

/**
 * How each time-based group names its period, e.g. "Oct 5", "Oct", "Q4" or "2026". Weeks are named with a translation instead.
 * A day goes through `DateUtils.formatToMonthDay`, since date-fns can't order a month and day without a year by language.
 */
const PERIOD_FORMATTERS: Partial<Record<SearchGroupBy, (start: Date, dateFnsLocale: DateFnsLocale | undefined) => string>> = {
    [CONST.SEARCH.GROUP_BY.DAY]: (start, dateFnsLocale) => DateUtils.formatToMonthDay(start, dateFnsLocale),
    [CONST.SEARCH.GROUP_BY.MONTH]: (start, dateFnsLocale) => format(start, 'LLL', {locale: dateFnsLocale}),
    [CONST.SEARCH.GROUP_BY.QUARTER]: (start, dateFnsLocale) => format(start, 'QQQ', {locale: dateFnsLocale}),
    [CONST.SEARCH.GROUP_BY.YEAR]: (start, dateFnsLocale) => format(start, 'yyyy', {locale: dateFnsLocale}),
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
    const formatPeriod = PERIOD_FORMATTERS[groupBy];
    const period = formatPeriod ? formatPeriod(start, dateFnsLocale) : translate('search.weekOf', {date: DateUtils.formatToMonthDay(start, dateFnsLocale)});
    return translate('search.periodSoFar', {period});
}

export default getInProgressBucketLabel;
