import buildChartSeries, {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';
import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {GroupedItem} from '@components/Search/types';

import CONST from '@src/CONST';

const CURRENT_WINDOW_START = '2026-01-01';
const PREVIOUS_WINDOW_START = '2025-01-01';

/** A month bucket as a search snapshot groups it. */
function makeMonth(year: number, month: number, total: number): GroupedItem {
    return {
        keyForList: `${year}-${month}`,
        transactions: [],
        groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
        year,
        month,
        count: 1,
        total,
        currency: CONST.CURRENCY.USD,
        formattedMonth: `${month}/${year}`,
        shortFormattedMonth: `M${month}`,
        sortKey: month,
    };
}

/** A merchant group as a search snapshot groups it. */
function makeMerchant(merchant: string, total: number): GroupedItem {
    return {
        keyForList: merchant,
        transactions: [],
        groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        merchant,
        count: 1,
        total,
        currency: CONST.CURRENCY.USD,
        formattedMerchant: merchant,
    };
}

const getLabel = (item: GroupedItem) => CHART_GROUP_BY_CONFIG[item.groupedBy ?? CONST.SEARCH.GROUP_BY.MERCHANT].getLabel(item);
const getAmount = (item: GroupedItem) => item.total ?? 0;

describe('buildChartSeries', () => {
    it('plots one unnamed series when nothing is compared', () => {
        // Given a ranking chart with no comparison
        const rows = [makeMerchant('Amazon', 300), makeMerchant('Uber', 100)];

        // When its series are built
        const model = buildChartSeries({primary: {rows}, groupBy: CONST.SEARCH.GROUP_BY.MERCHANT, getLabel, getAmount});

        // Then every point carries the one value the chart draws, and nothing names a window
        expect(model.series).toEqual([{key: CHART_SERIES_KEY.PRIMARY, label: undefined, color: undefined}]);
        expect(model.rows.map((row) => row.point.values)).toEqual([{[CHART_SERIES_KEY.PRIMARY]: 300}, {[CHART_SERIES_KEY.PRIMARY]: 100}]);
    });

    it('pairs ranking rows by the group they describe, not by the order they were ranked in', () => {
        // Given the same two merchants ranked differently in each window
        const rows = [makeMerchant('Amazon', 300), makeMerchant('Uber', 100)];
        const previousRows = [makeMerchant('Uber', 250), makeMerchant('Amazon', 50)];

        // When the windows are plotted against each other
        const model = buildChartSeries({
            primary: {rows, label: 'YTD 2026', color: '#1', start: CURRENT_WINDOW_START},
            comparison: {rows: previousRows, label: 'YTD 2025', color: '#2', start: PREVIOUS_WINDOW_START},
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            getLabel,
            getAmount,
        });

        // Then each merchant is measured against itself
        expect(model.rows.at(0)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 50});
        expect(model.rows.at(1)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 100, [CHART_SERIES_KEY.COMPARISON]: 250});
    });

    it('pairs time buckets by their position in their own window, so a month with no expenses cannot shift the rest', () => {
        // Given a current window missing February, which a search returns no bucket for
        const rows = [makeMonth(2026, 1, 100), makeMonth(2026, 3, 300)];
        const previousRows = [makeMonth(2025, 1, 10), makeMonth(2025, 2, 20), makeMonth(2025, 3, 30)];

        // When the two windows are plotted against each other
        const model = buildChartSeries({
            primary: {rows, label: 'YTD 2026', start: CURRENT_WINDOW_START},
            comparison: {rows: previousRows, label: 'YTD 2025', start: PREVIOUS_WINDOW_START},
            groupBy: CONST.SEARCH.GROUP_BY.MONTH,
            getLabel,
            getAmount,
        });

        // Then January meets January and March meets March, rather than March sliding onto February
        expect(model.rows.at(0)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 100, [CHART_SERIES_KEY.COMPARISON]: 10});
        expect(model.rows.at(1)?.point.values).toEqual({[CHART_SERIES_KEY.PRIMARY]: 300, [CHART_SERIES_KEY.COMPARISON]: 30});
    });

    it('draws a group the compared window has nothing for at zero', () => {
        // Given a merchant that only appears in the window on screen
        const rows = [makeMerchant('Amazon', 300)];

        // When it is plotted against a window without it
        const model = buildChartSeries({
            primary: {rows, label: 'YTD 2026', start: CURRENT_WINDOW_START},
            comparison: {rows: [makeMerchant('Uber', 250)], label: 'YTD 2025', start: PREVIOUS_WINDOW_START},
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            getLabel,
            getAmount,
        });

        // Then its comparison bar is empty and no row is invented for it
        expect(model.rows).toHaveLength(1);
        expect(model.rows.at(0)?.point.values[CHART_SERIES_KEY.COMPARISON]).toBe(0);
        expect(model.rows.at(0)?.comparisonItem).toBeUndefined();
    });

    it('keeps the rows behind both values, so a press can be traced back to a window', () => {
        // Given a merchant present in both windows
        const primaryItem = makeMerchant('Amazon', 300);
        const comparisonItem = makeMerchant('Amazon', 50);

        // When the windows are plotted against each other
        const model = buildChartSeries({
            primary: {rows: [primaryItem], label: 'YTD 2026', start: CURRENT_WINDOW_START},
            comparison: {rows: [comparisonItem], label: 'YTD 2025', start: PREVIOUS_WINDOW_START},
            groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            getLabel,
            getAmount,
        });

        // Then the row holds the grouped item each of its values was read from
        expect(model.rows.at(0)?.item).toBe(primaryItem);
        expect(model.rows.at(0)?.comparisonItem).toBe(comparisonItem);
    });
});
