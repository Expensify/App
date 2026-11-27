import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';

import type {InsightsTimeGroupBy} from '@pages/Insights/insightsGroupByUtils';

import CONST from '@src/CONST';

import type {Locale as DateFnsLocale} from 'date-fns';

import {format, getMonth, getQuarter, getYear, parseISO} from 'date-fns';

/** Returns the Details panel's name for the period starting on `start`, e.g. September or Week of Sep 28, with its year when `shouldIncludeYear` is set. */
function getInsightsDetailsPeriodName(
    periodGroupBy: InsightsTimeGroupBy,
    start: string,
    shouldIncludeYear: boolean,
    dateFnsLocale: DateFnsLocale | undefined,
    translate: LocalizedTranslate,
): string {
    const date = parseISO(start);
    const dayFormat = shouldIncludeYear ? 'MMM d, yyyy' : 'MMM d';
    switch (periodGroupBy) {
        case CONST.SEARCH.GROUP_BY.DAY:
            return format(date, dayFormat, {locale: dateFnsLocale});
        case CONST.SEARCH.GROUP_BY.WEEK:
            return translate('search.weekOf', {date: format(date, dayFormat, {locale: dateFnsLocale})});
        case CONST.SEARCH.GROUP_BY.MONTH:
            return shouldIncludeYear ? DateUtils.getFormattedMonthForSearch(getYear(date), getMonth(date) + 1, dateFnsLocale) : format(date, 'LLLL', {locale: dateFnsLocale});
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return shouldIncludeYear ? format(date, 'QQQ yyyy', {locale: dateFnsLocale}) : DateUtils.getShortFormattedQuarterForSearch(getYear(date), getQuarter(date), dateFnsLocale, false);
        default:
            return format(date, 'yyyy', {locale: dateFnsLocale});
    }
}

export default getInsightsDetailsPeriodName;
