/** Builds a CSV from the current period's loaded chart groups, without exporting individual expenses. */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import escapeCsvField from '@libs/escapeCsvField';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

import type {Interval} from 'date-fns';

import {eachDayOfInterval, eachMonthOfInterval, eachQuarterOfInterval, eachWeekOfInterval, eachYearOfInterval, format, parseISO} from 'date-fns';

type BuildInsightsChartCSVParams = {
    data: GroupedItem[];
    groupBy: SearchGroupBy;
    dateRange: {start?: string; end?: string};
    currency: string;
    getCurrencyDecimals: (currency: string) => number;
    translate: LocalizedTranslate;
};

const GROUP_HEADER_KEYS: Partial<Record<SearchGroupBy, TranslationPaths>> = {
    [CONST.SEARCH.GROUP_BY.FROM]: 'common.from',
    [CONST.SEARCH.GROUP_BY.MERCHANT]: 'common.merchant',
    [CONST.SEARCH.GROUP_BY.CATEGORY]: 'common.category',
};

function getPeriodStarts(groupBy: SearchGroupBy, interval: Interval): Date[] {
    switch (groupBy) {
        case CONST.SEARCH.GROUP_BY.DAY:
            return eachDayOfInterval(interval);
        case CONST.SEARCH.GROUP_BY.WEEK:
            // Search weeks start on Sunday, regardless of the display locale.
            return eachWeekOfInterval(interval, {weekStartsOn: 0});
        case CONST.SEARCH.GROUP_BY.MONTH:
            return eachMonthOfInterval(interval);
        case CONST.SEARCH.GROUP_BY.QUARTER:
            return eachQuarterOfInterval(interval);
        case CONST.SEARCH.GROUP_BY.YEAR:
            return eachYearOfInterval(interval);
        default:
            return [];
    }
}

function buildInsightsChartCSV({data, groupBy, dateRange, currency, getCurrencyDecimals, translate}: BuildInsightsChartCSVParams): string {
    const {getLabel, getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const groupHeader = translate(GROUP_HEADER_KEYS[groupBy] ?? 'common.date');
    const header = [groupHeader, translate('common.expenses'), translate('common.total'), translate('common.currency')].map(escapeCsvField).join(',');

    let rows = data.map((item) => ({
        label: getDateRange?.(item)?.start ?? getLabel(item),
        count: item.count ?? 0,
        total: item.total ?? 0,
        currency: item.currency ?? currency,
    }));

    if (getDateRange && dateRange.start && dateRange.end) {
        const rowsByDate = new Map(rows.map((row) => [row.label, row]));
        rows = getPeriodStarts(groupBy, {start: parseISO(dateRange.start), end: parseISO(dateRange.end)}).map((date) => {
            const label = format(date, CONST.DATE.FNS_FORMAT_STRING);
            return rowsByDate.get(label) ?? {label, count: 0, total: 0, currency};
        });
    }

    const csvRows = rows.map((row) =>
        [escapeCsvField(row.label), row.count, convertToFrontendAmountAsString(row.total, getCurrencyDecimals(row.currency)), escapeCsvField(row.currency)].join(','),
    );

    return `\uFEFF${[header, ...csvRows].join('\r\n')}`;
}

export default buildInsightsChartCSV;
