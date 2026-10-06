import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import CONST from '@src/CONST';

import type {Locale as DateFnsLocale} from 'date-fns';

import {format, isSameDay, isSameMonth, parse} from 'date-fns';

import type {GroupedItem, SearchGroupBy} from './types';

import CHART_GROUP_BY_CONFIG from './chartGroupByConfig';

type GetInProgressBucketLabelParams = {
    groupBy: SearchGroupBy;
    item: GroupedItem;

    /** Today's date, as a yyyy-MM-dd string */
    today: string;

    dateFnsLocale: DateFnsLocale | undefined;
    translate: LocalizedTranslate;
};

/** Names the days from `start` through `end`, e.g. "Oct 5", "Oct 1–5" or "Jan 1–Oct 5". */
function formatElapsedSpan(start: Date, end: Date, dateFnsLocale: DateFnsLocale | undefined): string {
    const startLabel = format(start, 'MMM d', {locale: dateFnsLocale});
    if (isSameDay(start, end)) {
        return startLabel;
    }
    return `${startLabel}–${format(end, isSameMonth(start, end) ? 'd' : 'MMM d', {locale: dateFnsLocale})}`;
}

/**
 * Labels the group that is still collecting expenses, the one whose dates include today, e.g. "Oct 1–5 so far".
 * Returns undefined for every other group, including groups that aren't time-based.
 */
function getInProgressBucketLabel({groupBy, item, today, dateFnsLocale, translate}: GetInProgressBucketLabelParams): string | undefined {
    const range = CHART_GROUP_BY_CONFIG[groupBy].getDateRange?.(item);
    if (!range || today < range.start || today > range.end) {
        return undefined;
    }

    const start = parse(range.start, CONST.DATE.FNS_FORMAT_STRING, new Date());
    let period: string;
    if (groupBy === CONST.SEARCH.GROUP_BY.WEEK) {
        period = translate('search.weekOf', {date: format(start, 'MMM d', {locale: dateFnsLocale})});
    } else if (groupBy === CONST.SEARCH.GROUP_BY.QUARTER) {
        period = format(start, 'QQQ', {locale: dateFnsLocale});
    } else {
        period = formatElapsedSpan(start, parse(today, CONST.DATE.FNS_FORMAT_STRING, new Date()), dateFnsLocale);
    }
    return translate('search.periodSoFar', {period});
}

export default getInProgressBucketLabel;
