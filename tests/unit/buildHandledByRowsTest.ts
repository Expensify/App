import type {TransactionHandledByGroupListItemType} from '@components/Search/SearchList/ListItem/types';

import buildHandledByRows from '@pages/Insights/charts/buildHandledByRows';
import {RANKING_TABLE_CHANGE} from '@pages/Insights/charts/buildRankingTableRows';

import CONST from '@src/CONST';

/** A grouped Handled by result, carrying the fields the table is built from. */
function handledByGroup(key: string, count: number, percentOfTotal: number): TransactionHandledByGroupListItemType {
    return {
        groupedBy: CONST.SEARCH.GROUP_BY.HANDLED_BY,
        handledBy: key === 'rules' ? CONST.INSIGHTS.HANDLED_BY_SOURCE.RULES : CONST.INSIGHTS.HANDLED_BY_SOURCE.PEOPLE,
        formattedHandledBy: key,
        keyForList: `group_${key}`,
        count,
        total: 0,
        currency: CONST.CURRENCY.USD,
        percentOfTotal,
        averageDuration: CONST.DATE.SECONDS_PER_DAY,
        transactions: [],
    };
}

describe('buildHandledByRows', () => {
    it('leaves out sources that finished no reports and keeps the backend shares', () => {
        // Given people and rules with reports in the period, and an agent group with none
        const data = [handledByGroup('people', 168, 60), handledByGroup('rules', 112, 40), handledByGroup('agent', 0, 0)];

        // When the rows are built
        const rows = buildHandledByRows({data, comparison: undefined, isComparingPreviousPeriod: false});

        // Then only the sources with reports are listed, since a row of zeros says nothing
        expect(rows.map(({item}) => item.keyForList)).toEqual(['group_people', 'group_rules']);
        // And each row keeps the share the backend worked out, so the rows add up to 100%
        expect(rows.map(({share}) => share)).toEqual([60, 40]);
        // And the bars are scaled to the source with the most reports, like Top violations
        expect(rows.map(({barWidthPercent}) => barWidthPercent)).toEqual([100, (112 / 168) * 100]);
    });

    it('matches each source to its previous period by key when comparing', () => {
        // Given people who handled more reports than in the previous period, and rules that handled fewer
        const data = [handledByGroup('people', 150, 60), handledByGroup('rules', 100, 40)];
        const previous = [handledByGroup('rules', 200, 50), handledByGroup('people', 100, 50)];

        // When the rows are built against the previous period
        const rows = buildHandledByRows({data, comparison: {data: previous, color: ''}, isComparingPreviousPeriod: true});

        // Then each source shows how its own reports changed, whatever order the previous period lists them in
        expect(rows.map(({change}) => change)).toEqual([
            {type: RANKING_TABLE_CHANGE.INCREASE, percent: 50},
            {type: RANKING_TABLE_CHANGE.DECREASE, percent: 50},
        ]);
    });
});
