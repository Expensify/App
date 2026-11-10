import type {LocaleContextProps} from '@components/LocaleContextProvider';

import {getDateDisplayValue} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import {format, isThisYear, parse} from 'date-fns';

import type {InsightsFilters} from './insightsFilters';

import {buildDateFormValues} from './insightsQueries';

/** Builds the Insights Date filter label. */
function getInsightsDateLabel(date: InsightsFilters['date'], translate: LocaleContextProps['translate'], dateFnsLocale: LocaleContextProps['dateFnsLocale']): string {
    if ('on' in date) {
        const day = parse(date.on, CONST.DATE.FNS_FORMAT_STRING, new Date());
        return format(day, isThisYear(day) ? CONST.DATE.MONTH_DAY_ABBR_FORMAT : CONST.DATE.MONTH_DAY_YEAR_ABBR_FORMAT, {locale: dateFnsLocale});
    }
    return getDateDisplayValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, buildDateFormValues(date), translate, dateFnsLocale);
}

export default getInsightsDateLabel;
