/** Builds a CSV from the current period's loaded chart groups, without exporting individual expenses. */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {isEmptyPeriodAfterToday} from '@components/Search/isPeriodAfterToday';
import applyRunningTotal from '@components/Search/runningTotal';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import escapeCsvField from '@libs/escapeCsvField';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';

type BuildInsightsChartCSVParams = {
    data: GroupedItem[];
    groupBy: SearchGroupBy;
    dateFilterStart?: string;
    currency: string;
    getCurrencyDecimals: (currency: string) => number;
    translate: LocalizedTranslate;
    today: string;
    shouldShowRunningTotal?: boolean;
};

const GROUP_HEADER_KEYS: Partial<Record<SearchGroupBy, TranslationPaths>> = {
    [CONST.SEARCH.GROUP_BY.FROM]: 'common.from',
    [CONST.SEARCH.GROUP_BY.MERCHANT]: 'common.merchant',
    [CONST.SEARCH.GROUP_BY.CATEGORY]: 'common.category',
};

function buildInsightsChartCSV({data, groupBy, dateFilterStart, currency, getCurrencyDecimals, translate, today, shouldShowRunningTotal}: BuildInsightsChartCSVParams): string {
    const {getLabel, getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    const groupHeader = translate(GROUP_HEADER_KEYS[groupBy] ?? 'common.date');
    const header = [groupHeader, translate('common.expenses'), translate('common.total'), translate('common.currency')].map(escapeCsvField).join(',');

    // Trimmed before the running total, which replaces each period's count with the count so far
    const lastKeptIndex = data.findLastIndex((item) => !isEmptyPeriodAfterToday(item, groupBy, today, dateFilterStart));
    const keptData = data.slice(0, lastKeptIndex + 1);
    const exportedData = shouldShowRunningTotal ? applyRunningTotal({data: keptData, groupBy}).data : keptData;

    const rows = exportedData.map((item) => ({
        label: getDateRange?.(item)?.start ?? getLabel(item),
        count: item.count ?? 0,
        total: item.total ?? 0,
        currency: item.currency ?? currency,
    }));

    const csvRows = rows.map((row) =>
        [escapeCsvField(row.label), row.count, convertToFrontendAmountAsString(row.total, getCurrencyDecimals(row.currency)), escapeCsvField(row.currency)].join(','),
    );

    return `\uFEFF${[header, ...csvRows].join('\r\n')}`;
}

export default buildInsightsChartCSV;
