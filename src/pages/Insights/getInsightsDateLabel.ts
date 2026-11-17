import type {LocaleContextProps} from '@components/LocaleContextProvider';

import DateUtils from '@libs/DateUtils';
import {getDateDisplayValue} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';

import type {InsightsFilters} from './insightsFilters';

import {buildDateFormValues} from './insightsQueries';

/** Keeps a custom day in the same short format as a custom range, unlike the Date filter's "On October 5, 2026". */
function getInsightsDateLabel(date: InsightsFilters['date'], translate: LocaleContextProps['translate'], dateFnsLocale: LocaleContextProps['dateFnsLocale']): string {
    if ('on' in date) {
        return DateUtils.formatToMonthDayWithOptionalYearInUTC(date.on, dateFnsLocale);
    }
    return getDateDisplayValue(CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE, buildDateFormValues(date), translate, dateFnsLocale);
}

export default getInsightsDateLabel;
