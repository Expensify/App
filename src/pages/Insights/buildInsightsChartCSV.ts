/** Builds a CSV from the current period's loaded chart groups, without exporting individual expenses. */
import {COUNT_COLUMN_TITLE_KEYS} from '@components/Charts/utils/formatChartCount';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';
import type {ChartStackStage} from '@components/Search/buildStackedSeries';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import {getAverageDuration} from '@components/Search/chartMetricValue';
import {isEmptyPeriodAfterToday} from '@components/Search/isPeriodAfterToday';
import applyRunningTotal from '@components/Search/runningTotal';
import type {GroupedItem, SearchChartCountDimension, SearchChartMetric, SearchGroupBy} from '@components/Search/types';

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
    countDimension?: SearchChartCountDimension;
    metric?: SearchChartMetric;

    /** The stages a stacked chart draws in each bucket, each written in a column of its own */
    stages?: readonly ChartStackStage[];
};

const GROUP_HEADER_KEYS: Partial<Record<SearchGroupBy, TranslationPaths>> = {
    [CONST.SEARCH.GROUP_BY.FROM]: 'common.from',
    [CONST.SEARCH.GROUP_BY.APPROVER]: 'common.approver',
    [CONST.SEARCH.GROUP_BY.MERCHANT]: 'common.merchant',
    [CONST.SEARCH.GROUP_BY.CATEGORY]: 'common.category',
    [CONST.SEARCH.GROUP_BY.TAG]: 'common.tag',
    [CONST.SEARCH.GROUP_BY.PAID_BY]: 'search.filters.groupBy.paid-by',
    [CONST.SEARCH.GROUP_BY.VIOLATION]: 'search.filters.groupBy.violation',
    [CONST.SEARCH.GROUP_BY.WORKFLOW_STAGE]: 'search.filters.groupBy.workflow-stage',
};

/** Matches the precision the chart writes average durations in */
const AVERAGE_DAYS_FRACTION_DIGITS = 1;

/** Hours keep two decimals, so a source handling reports in minutes doesn't read as 0 */
const AVERAGE_HOURS_FRACTION_DIGITS = 2;

/** Shares are written like the table writes them, e.g. 40.8 */
const SHARE_FRACTION_DIGITS = 1;

function formatDays(durationInSeconds: number): string {
    return (durationInSeconds / CONST.DATE.SECONDS_PER_DAY).toFixed(AVERAGE_DAYS_FRACTION_DIGITS);
}

/** Writes the Handled by sources as the table lists them, leaving out sources with no reports and the setup rows, which hold no data */
function buildHandledByCSV(data: GroupedItem[], translate: LocalizedTranslate): string {
    const sources = data.flatMap((item) => (item.groupedBy === CONST.SEARCH.GROUP_BY.HANDLED_BY && item.count > 0 ? [item] : []));
    const reportCount = sources.reduce((sum, item) => sum + item.count, 0);
    const header = [
        translate('insightsPage.handledBy.sourceColumn'),
        translate('insightsPage.share'),
        translate(COUNT_COLUMN_TITLE_KEYS[CONST.SEARCH.CHART_COUNT_DIMENSION.REPORT]),
        translate('insightsPage.handledBy.averageHoursColumn'),
    ];
    const rows = sources.map((item) =>
        [
            escapeCsvField(item.formattedHandledBy),
            ((item.count / reportCount) * 100).toFixed(SHARE_FRACTION_DIGITS),
            String(item.count),
            // A source with no finished report has no average, so its cell is left empty rather than read as 0 hours
            item.averageDuration === null ? '' : (item.averageDuration / CONST.DATE.SECONDS_PER_HOUR).toFixed(AVERAGE_HOURS_FRACTION_DIGITS),
        ].join(','),
    );
    return `\uFEFF${[header.map(escapeCsvField).join(','), ...rows].join('\r\n')}`;
}

function buildInsightsChartCSV({
    data,
    groupBy,
    dateFilterStart,
    currency,
    getCurrencyDecimals,
    translate,
    today,
    shouldShowRunningTotal,
    countDimension = CONST.SEARCH.CHART_COUNT_DIMENSION.EXPENSE,
    metric,
    stages,
}: BuildInsightsChartCSVParams): string {
    const {getLabel, getDateRange} = CHART_GROUP_BY_CONFIG[groupBy];
    if (groupBy === CONST.SEARCH.GROUP_BY.HANDLED_BY) {
        return buildHandledByCSV(data, translate);
    }
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
    const countHeader = translate(COUNT_COLUMN_TITLE_KEYS[countDimension]);
    const isDurationMetric = metric === CONST.SEARCH.CHART_METRIC.DURATION;
    const durationHeaders = stages ? stages.map(({label}) => label) : [translate('insightsPage.averageDays')];
    const valueHeaders = isDurationMetric ? durationHeaders : [translate('common.total'), translate('common.currency')];
    const header = [groupHeader, countHeader, ...valueHeaders].map(escapeCsvField).join(',');

    // Trimmed before the running total, which replaces each period's count with the count so far
    const lastKeptIndex = data.findLastIndex((item) => !isEmptyPeriodAfterToday(item, groupBy, today, dateFilterStart));
    const keptData = data.slice(0, lastKeptIndex + 1);
    const exportedData = shouldShowRunningTotal ? applyRunningTotal({data: keptData, groupBy}).data : keptData;

    const csvRows = exportedData.map((item) => {
        const label = escapeCsvField(getDateRange?.(item)?.start ?? getLabel(item));
        const count = item.count ?? 0;
        if (stages) {
            // A stage none of the bucket's reports completed has no duration, so its cell is left empty rather than read as 0 days
            const stageDays = stages.map((stage) => {
                const duration = stage.getValue(item);
                return typeof duration === 'number' ? formatDays(duration) : '';
            });
            return [label, count, ...stageDays].join(',');
        }
        if (isDurationMetric) {
            return [label, count, formatDays(getAverageDuration(item) ?? 0)].join(',');
        }
        const itemCurrency = item.currency ?? currency;
        return [label, count, convertToFrontendAmountAsString(item.total ?? 0, getCurrencyDecimals(itemCurrency)), escapeCsvField(itemCurrency)].join(',');
    });

    return `\uFEFF${[header, ...csvRows].join('\r\n')}`;
}

export default buildInsightsChartCSV;
