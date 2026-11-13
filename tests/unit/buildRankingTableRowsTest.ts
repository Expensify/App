import type {TransactionViolationGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import buildRankingTableRows, {RANKING_TABLE_CHANGE} from '@pages/Insights/charts/buildRankingTableRows';

import CONST from '@src/CONST';

/** A grouped violation result, carrying the fields the table is built from. */
function violationGroup(violation: string, count: number, percentOfTotal?: number): TransactionViolationGroupListItemType {
    return {
        groupedBy: CONST.SEARCH.GROUP_BY.VIOLATION,
        violation,
        formattedViolation: violation,
        keyForList: `group_${violation}`,
        count,
        total: count * 100,
        currency: CONST.CURRENCY.USD,
        percentOfTotal,
        transactions: [],
    };
}

describe('buildRankingTableRows', () => {
    it('takes each share from the backend and scales the bars to the largest row', () => {
        // Given two listed violation types, whose shares the backend worked out of every type's expenses
        const data = [violationGroup('missingReceipt', 50, 18.8), violationGroup('overLimit', 25, 9.4)];

        // When the rows are built
        const {rows} = buildRankingTableRows({data, comparison: undefined, isComparingPreviousPeriod: false});

        // Then each row shows the backend's share, since the types past the limit aren't here to share out of
        expect(rows.map(({share}) => share)).toEqual([18.8, 9.4]);
        // And the bars are scaled to the largest row, which fills the bar area
        expect(rows.map(({barWidthPercent}) => barWidthPercent)).toEqual([100, 50]);
        // And no row shows a change, since the page doesn't compare against the previous period
        expect(rows.every(({change}) => change === undefined)).toBe(true);
    });

    it('marks the average on the same scale as the bars', () => {
        // Given an average of 20 expenses per violation type, and a top row with 40
        const data = [violationGroup('missingReceipt', 40), violationGroup('overLimit', 10)];

        // When the rows are built against the average
        const table = buildRankingTableRows({data, comparison: {[CONST.SEARCH.CHART_METRIC.COUNT]: 20}, isComparingPreviousPeriod: false});

        // Then the average line sits halfway along the bar area, where a bar for 20 expenses would end
        expect(table.average).toBe(20);
        expect(table.averageWidthPercent).toBe(50);
    });

    it('rounds the change from the previous period to a whole percentage, and shows a type without previous expenses as new', () => {
        // Given violation types that grew, shrank, stayed the same, and had no expenses in the previous period
        const data = [violationGroup('missingReceipt', 33), violationGroup('overLimit', 10), violationGroup('missingCategory', 8), violationGroup('missingTag', 5)];
        const previous = [violationGroup('missingReceipt', 25), violationGroup('overLimit', 20), violationGroup('missingCategory', 8)];

        // When the rows are built against the previous period
        const {rows} = buildRankingTableRows({data, comparison: {data: previous, color: ''}, isComparingPreviousPeriod: true});

        // Then each row shows how its expenses changed, with "new" standing in for a change from zero
        expect(rows.map(({change}) => change)).toEqual([
            {type: RANKING_TABLE_CHANGE.INCREASE, percent: 32},
            {type: RANKING_TABLE_CHANGE.DECREASE, percent: 50},
            {type: RANKING_TABLE_CHANGE.NONE},
            {type: RANKING_TABLE_CHANGE.NEW},
        ]);
    });

    it('shows no change when the previous period has nothing to compare against', () => {
        // Given the page compares against the previous period, but no previous rows came back
        const data = [violationGroup('missingReceipt', 10)];

        // When the rows are built
        const {rows} = buildRankingTableRows({data, comparison: undefined, isComparingPreviousPeriod: true});

        // Then the row shows no change rather than calling the type new
        expect(rows.at(0)?.change).toEqual({type: RANKING_TABLE_CHANGE.NONE});
    });
});
