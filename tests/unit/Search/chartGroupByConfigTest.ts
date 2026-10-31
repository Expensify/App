import CHART_GROUP_BY_CONFIG, {getChartFilterQuery} from '@components/Search/chartGroupByConfig';
import type {TransactionMerchantGroupListItemType} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import CONST from '@src/CONST';

import createMock from '../../utils/createMock';

describe('chartGroupByConfig', () => {
    it('uses the explicit exact operator for merchant drill-downs', () => {
        // Given an exact merchant value whose query operator must remain equals.
        const item = createMock<TransactionMerchantGroupListItemType>({merchant: 'I'});

        // When the real merchant filter is called.
        const query = CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.MERCHANT].getFilterQuery(item);

        // Then its query keeps the explicit operator.
        expect(query).toBe('merchant="I"');
    });

    it('dispatches every real chart group with its labels, filters and axis contracts', () => {
        // Given rows with the formatted fields produced by SearchUIUtils for each grouping.
        const cases: Array<{
            item: GroupedItem;
            label: string;
            query: string;
            icon: string;
            shortLabel?: string;
            lineLabel?: string;
            steps?: readonly number[];
            range?: {start: string; end: string};
        }> = [
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.FROM}>>({groupedBy: CONST.SEARCH.GROUP_BY.FROM, accountID: 42, formattedFrom: 'Member'}),
                label: 'Member',
                query: 'from:42',
                icon: 'Users',
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.APPROVER}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.APPROVER,
                    accountID: 42,
                    formattedApprover: 'Approver',
                }),
                label: 'Approver',
                query: 'approver:42',
                icon: 'Users',
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.CARD}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.CARD,
                    accountID: 42,
                    cardID: 17,
                    formattedCardName: 'Card',
                }),
                label: 'Card',
                query: 'cardID:17',
                icon: 'CreditCard',
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
                    entryID: 19,
                    formattedWithdrawalID: 'Withdrawal',
                }),
                label: 'Withdrawal',
                query: 'withdrawalID:19',
                icon: 'Send',
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.CATEGORY}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
                    category: 'Meals & drinks',
                    formattedCategory: 'Meals',
                }),
                label: 'Meals',
                query: 'category:"Meals & drinks"',
                icon: 'Folder',
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.MERCHANT}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
                    merchant: 'I',
                    formattedMerchant: 'Merchant',
                }),
                label: 'Merchant',
                query: 'merchant="I"',
                icon: 'Basket',
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.TAG}>>({groupedBy: CONST.SEARCH.GROUP_BY.TAG, tag: 'Team: dinner', formattedTag: 'Tag'}),
                label: 'Tag',
                query: 'tag:"Team: dinner"',
                icon: 'Tag',
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.DAY}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.DAY,
                    day: '2024-02-29',
                    formattedDay: 'February 29, 2024',
                    shortFormattedDay: 'Feb 29',
                    lineChartFormattedDay: 'Feb 29, 2024',
                }),
                label: 'February 29, 2024',
                query: 'date>=2024-02-29 date<=2024-02-29',
                icon: 'Calendar',
                shortLabel: 'Feb 29',
                lineLabel: 'Feb 29, 2024',
                steps: [1, 2, 7, 14],
                range: {start: '2024-02-29', end: '2024-02-29'},
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.MONTH}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
                    year: 2024,
                    month: 2,
                    formattedMonth: 'February 2024',
                    shortFormattedMonth: 'Feb',
                }),
                label: 'February 2024',
                query: 'date>=2024-02-01 date<=2024-02-29',
                icon: 'Calendar',
                shortLabel: 'Feb',
                steps: [1, 2, 3, 6],
                range: {start: '2024-02-01', end: '2024-02-29'},
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.WEEK}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
                    week: '2023-12-31',
                    formattedWeek: 'Dec 31 to Jan 6',
                    shortFormattedWeek: 'Dec 31',
                    lineChartFormattedWeek: 'Dec 31, 2023',
                }),
                label: 'Dec 31 to Jan 6',
                query: 'date>=2023-12-31 date<=2024-01-06',
                icon: 'Calendar',
                shortLabel: 'Dec 31',
                lineLabel: 'Dec 31, 2023',
                steps: [1, 2, 4],
                range: {start: '2023-12-31', end: '2024-01-06'},
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.YEAR}>>({groupedBy: CONST.SEARCH.GROUP_BY.YEAR, year: 2024, formattedYear: '2024'}),
                label: '2024',
                query: 'date>=2024-01-01 date<=2024-12-31',
                icon: 'Calendar',
                steps: [1, 2, 5],
                range: {start: '2024-01-01', end: '2024-12-31'},
            },
            {
                item: createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.QUARTER}>>({
                    groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
                    year: 2024,
                    quarter: 4,
                    formattedQuarter: 'Q4 2024',
                    shortFormattedQuarter: 'Q4',
                }),
                label: 'Q4 2024',
                query: 'date>=2024-10-01 date<=2024-12-31',
                icon: 'Calendar',
                shortLabel: 'Q4',
                steps: [1, 2, 4],
                range: {start: '2024-10-01', end: '2024-12-31'},
            },
        ];

        // When the same dispatcher used by SearchChartView handles each row.
        for (const {item, label, query, icon, shortLabel, lineLabel, steps, range} of cases) {
            const config = CHART_GROUP_BY_CONFIG[item.groupedBy];

            // Then every entry retains the exact filters, labels, date bounds and optional fallbacks.
            expect(getChartFilterQuery(item, item.groupedBy)).toBe(query);
            expect(config.getLabel(item)).toBe(label);
            expect(config.titleIconName).toBe(icon);
            expect(config.getShortLabel?.(item)).toBe(shortLabel);
            expect(config.getLineChartLabel?.(item)).toBe(lineLabel);
            expect(config.axisLabelSteps).toEqual(steps);
            expect(config.getDateRange?.(item)).toEqual(range);
        }
        expect(cases.map(({item}) => item.groupedBy).sort()).toEqual(Object.keys(CHART_GROUP_BY_CONFIG).sort());
    });

    it('keeps broad label and simple-filter fallbacks and existing date guards', () => {
        // Given an unformatted category row, which lacks every other group-specific display field.
        const item = createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.CATEGORY}>>({
            groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
            category: '',
        });
        const groups: SearchGroupBy[] = Object.values(CONST.SEARCH.GROUP_BY);

        // When broad callbacks receive this row.
        // Then absence still produces the original fallbacks.
        for (const group of groups) {
            const config = CHART_GROUP_BY_CONFIG[group];
            expect(config.getLabel(item)).toBe('');
            expect(config.getShortLabel?.(item)).toBeUndefined();
            expect(config.getLineChartLabel?.(item)).toBeUndefined();
            expect(config.getDateRange?.(item)).toBeUndefined();
        }
        expect(CHART_GROUP_BY_CONFIG.from.getFilterQuery(item)).toBe('from:undefined');
        expect(CHART_GROUP_BY_CONFIG.card.getFilterQuery(item)).toBe('cardID:undefined');
        expect(CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID].getFilterQuery(item)).toBe('withdrawalID:undefined');
        expect(CHART_GROUP_BY_CONFIG.merchant.getFilterQuery(item)).toBe('merchant="undefined"');
        expect(CHART_GROUP_BY_CONFIG.tag.getFilterQuery(item)).toBe('tag:"undefined"');
        expect(CHART_GROUP_BY_CONFIG.day.getFilterQuery(item)).toBe('');
    });

    it('retains shared account and year fields across their real union members', () => {
        // Given a card with a cardholder and month/quarter rows carrying a year.
        const card = createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.CARD}>>({groupedBy: CONST.SEARCH.GROUP_BY.CARD, accountID: 42});
        const month = createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.MONTH}>>({groupedBy: CONST.SEARCH.GROUP_BY.MONTH, year: 2024, month: 2});
        const quarter = createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.QUARTER}>>({groupedBy: CONST.SEARCH.GROUP_BY.QUARTER, year: 2023, quarter: 1});

        // When direct callbacks consume shared fields.
        // Then the supported cross-group calls remain valid.
        expect(CHART_GROUP_BY_CONFIG.from.getFilterQuery(card)).toBe('from:42');
        expect(CHART_GROUP_BY_CONFIG.category.getFilterQuery(card)).toBe('category:"undefined"');
        expect(CHART_GROUP_BY_CONFIG.year.getFilterQuery(month)).toBe('date>=2024-01-01 date<=2024-12-31');
        expect(CHART_GROUP_BY_CONFIG.year.getFilterQuery(quarter)).toBe('date>=2023-01-01 date<=2023-12-31');
        expect(getChartFilterQuery(quarter, CONST.SEARCH.GROUP_BY.QUARTER)).toBe('date>=2023-01-01 date<=2023-03-31');
    });

    it('filters by the chart grouping when a row keeps a grouping of its own', () => {
        // Given an expense report row, whose groupedBy has no chart config, and a card row in a time chart.
        const reportRow = Object.assign(createMock<GroupedItem>({}), {groupedBy: CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT});
        const card = createMock<Extract<GroupedItem, {groupedBy: typeof CONST.SEARCH.GROUP_BY.CARD}>>({groupedBy: CONST.SEARCH.GROUP_BY.CARD, accountID: 42});

        // When a chart bar is pressed for these rows.
        // Then the report row uses the chart's filter instead of throwing, and a time chart adds no filter without its own fields.
        expect(getChartFilterQuery(reportRow, CONST.SEARCH.GROUP_BY.FROM)).toBe('from:undefined');
        expect(getChartFilterQuery(reportRow, CONST.SEARCH.GROUP_BY.WEEK)).toBe('');
        expect(getChartFilterQuery(card, CONST.SEARCH.GROUP_BY.MONTH)).toBe('');
        expect(getChartFilterQuery(card, CONST.SEARCH.GROUP_BY.QUARTER)).toBe('');
        expect(getChartFilterQuery(card, CONST.SEARCH.GROUP_BY.YEAR)).toBe('');
    });

    it('requires the actual time fields at the four time-filter call boundaries', () => {
        // Given the production filter signatures, the full union cannot satisfy any time-specific input.
        const acceptsWholeUnion: {
            [TGroup in 'month' | 'week' | 'quarter' | 'year']: GroupedItem extends Parameters<(typeof CHART_GROUP_BY_CONFIG)[TGroup]['getFilterQuery']>[0] ? true : false;
        } = {month: false, week: false, quarter: false, year: false};

        // When TypeScript checks the matrix, widening any filter to the whole union invalidates its false entry.
        // Then the checked values also describe the four runtime callback boundaries.
        expect(acceptsWholeUnion).toEqual({month: false, week: false, quarter: false, year: false});
    });
});
