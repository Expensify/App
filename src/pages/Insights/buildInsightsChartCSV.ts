/** Builds a CSV from the current period's loaded chart groups, without exporting individual expenses. */
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {isEmptyPeriodAfterToday} from '@components/Search/isPeriodAfterToday';
import applyRunningTotal from '@components/Search/runningTotal';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import escapeCsvField from '@libs/escapeCsvField';
import formatTagParentPath from '@libs/formatTagParentPath';

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
    [CONST.SEARCH.GROUP_BY.APPROVER]: 'common.approver',
    [CONST.SEARCH.GROUP_BY.MERCHANT]: 'common.merchant',
    [CONST.SEARCH.GROUP_BY.CATEGORY]: 'common.category',
    [CONST.SEARCH.GROUP_BY.TAG]: 'common.tag',
    [CONST.SEARCH.GROUP_BY.VIOLATION]: 'search.filters.groupBy.violation',
};

function buildInsightsChartCSV({data, groupBy, dateFilterStart, currency, getCurrencyDecimals, translate, today, shouldShowRunningTotal}: BuildInsightsChartCSVParams): string {
    const {getLabel, getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    if (groupBy === CONST.SEARCH.GROUP_BY.TAG && data.some((item) => item.groupedBy === CONST.SEARCH.GROUP_BY.TAG && item.tagLevel !== undefined)) {
        const tagHeader = [
            translate('common.tag'),
            translate('insightsPage.parent'),
            translate('common.total'),
            translate('insightsPage.shareOfTotal'),
            translate('common.expenses'),
            translate('common.currency'),
        ];
        const tagRows = data.flatMap((item) =>
            item.groupedBy === CONST.SEARCH.GROUP_BY.TAG
                ? [
                      [
                          escapeCsvField(item.formattedTagName ?? item.tag),
                          escapeCsvField(formatTagParentPath(item.parentTagPath)),
                          convertToFrontendAmountAsString(item.total ?? 0, getCurrencyDecimals(item.currency ?? currency)),
                          String(item.percentOfTotal ?? 0),
                          String(item.count ?? 0),
                          escapeCsvField(item.currency ?? currency),
                      ].join(','),
                  ]
                : [],
        );
        return `\uFEFF${[tagHeader.map(escapeCsvField).join(','), ...tagRows].join('\r\n')}`;
    }
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
