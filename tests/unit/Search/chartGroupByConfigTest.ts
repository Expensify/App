import CHART_GROUP_BY_CONFIG from '@components/Search/chartGroupByConfig';
import type {
    TransactionCardGroupListItemType,
    TransactionCategoryGroupListItemType,
    TransactionMemberGroupListItemType,
    TransactionMerchantGroupListItemType,
    TransactionMonthGroupListItemType,
    TransactionQuarterGroupListItemType,
    TransactionTagGroupListItemType,
    TransactionWeekGroupListItemType,
    TransactionWithdrawalIDGroupListItemType,
    TransactionYearGroupListItemType,
} from '@components/Search/SearchList/ListItem/types';
import type {GroupedItem, SearchGroupBy} from '@components/Search/types';

import CONST from '@src/CONST';

import type HybridAppModuleType from '@expensify/react-native-hybrid-app/src/types';

import createMock from '../../utils/createMock';

// The Jest environment has no ReactNativeHybridApp module, which DateUtils loads through IntlStore and Log.
jest.mock('@expensify/react-native-hybrid-app', () => {
    return {
        __esModule: true,
        default: {
            isHybridApp: jest.fn<ReturnType<HybridAppModuleType['isHybridApp']>, Parameters<HybridAppModuleType['isHybridApp']>>(() => false),
        },
    };
});

type ChartGroupByCase = {
    groupBy: SearchGroupBy;
    item: GroupedItem;
    expectedIcon: (typeof CHART_GROUP_BY_CONFIG)[SearchGroupBy]['titleIconName'];
    expectedLabel: string;
    expectedShortLabel?: string;
    expectedFilterQuery: string;
};

const memberItem = createMock<TransactionMemberGroupListItemType>({
    groupedBy: CONST.SEARCH.GROUP_BY.FROM,
    accountID: 0,
    formattedFrom: 'Ada Lovelace',
});
const cardItem = createMock<TransactionCardGroupListItemType>({
    groupedBy: CONST.SEARCH.GROUP_BY.CARD,
    cardID: 123,
    formattedCardName: 'Travel card',
});

const cases: ChartGroupByCase[] = [
    {
        groupBy: CONST.SEARCH.GROUP_BY.FROM,
        item: memberItem,
        expectedIcon: 'Users',
        expectedLabel: 'Ada Lovelace',
        expectedFilterQuery: 'from:0',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.CARD,
        item: cardItem,
        expectedIcon: 'CreditCard',
        expectedLabel: 'Travel card',
        expectedFilterQuery: 'cardID:123',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
        item: createMock<TransactionWithdrawalIDGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
            entryID: 456,
            formattedWithdrawalID: '456',
        }),
        expectedIcon: 'Send',
        expectedLabel: '456',
        expectedFilterQuery: 'withdrawalID:456',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        item: createMock<TransactionCategoryGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
            category: 'Travel meals',
            formattedCategory: 'Travel meals',
        }),
        expectedIcon: 'Folder',
        expectedLabel: 'Travel meals',
        expectedFilterQuery: 'category:"Travel meals"',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        item: createMock<TransactionMerchantGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            merchant: 'Coffee shop',
            formattedMerchant: 'Coffee shop',
        }),
        expectedIcon: 'Basket',
        expectedLabel: 'Coffee shop',
        expectedFilterQuery: 'merchant="Coffee shop"',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.TAG,
        item: createMock<TransactionTagGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.TAG,
            tag: 'Client visit',
            formattedTag: 'Client visit',
        }),
        expectedIcon: 'Tag',
        expectedLabel: 'Client visit',
        expectedFilterQuery: 'tag:"Client visit"',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.MONTH,
        item: createMock<TransactionMonthGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.MONTH,
            year: 2025,
            month: 6,
            formattedMonth: 'June 2025',
            shortFormattedMonth: 'Jun 25',
        }),
        expectedIcon: 'Calendar',
        expectedLabel: 'June 2025',
        expectedShortLabel: 'Jun 25',
        expectedFilterQuery: 'date>=2025-06-01 date<=2025-06-30',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.WEEK,
        item: createMock<TransactionWeekGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.WEEK,
            week: '2025-06-09',
            formattedWeek: 'Jun 9 - Jun 15, 2025',
            shortFormattedWeek: 'Jun 9 - 15, 25',
        }),
        expectedIcon: 'Calendar',
        expectedLabel: 'Jun 9 - Jun 15, 2025',
        expectedShortLabel: 'Jun 9 - 15, 25',
        expectedFilterQuery: 'date>=2025-06-09 date<=2025-06-15',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.YEAR,
        item: createMock<TransactionYearGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.YEAR,
            year: 2025,
            formattedYear: '2025',
        }),
        expectedIcon: 'Calendar',
        expectedLabel: '2025',
        expectedFilterQuery: 'date>=2025-01-01 date<=2025-12-31',
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.QUARTER,
        item: createMock<TransactionQuarterGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.QUARTER,
            year: 2025,
            quarter: 3,
            formattedQuarter: 'Q3 2025',
            shortFormattedQuarter: 'Q3 25',
        }),
        expectedIcon: 'Calendar',
        expectedLabel: 'Q3 2025',
        expectedShortLabel: 'Q3 25',
        expectedFilterQuery: 'date>=2025-07-01 date<=2025-09-30',
    },
];

const optionalLabelCases: Array<Pick<ChartGroupByCase, 'groupBy' | 'item'>> = [
    {
        groupBy: CONST.SEARCH.GROUP_BY.FROM,
        item: createMock<TransactionMemberGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.FROM,
            accountID: 1,
        }),
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.CARD,
        item: createMock<TransactionCardGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.CARD,
            cardID: 2,
            formattedCardName: '',
        }),
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
        item: createMock<TransactionWithdrawalIDGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
            entryID: 3,
        }),
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.CATEGORY,
        item: createMock<TransactionCategoryGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.CATEGORY,
            category: '',
            formattedCategory: '',
        }),
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.MERCHANT,
        item: createMock<TransactionMerchantGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT,
            merchant: '',
        }),
    },
    {
        groupBy: CONST.SEARCH.GROUP_BY.TAG,
        item: createMock<TransactionTagGroupListItemType>({
            groupedBy: CONST.SEARCH.GROUP_BY.TAG,
            tag: '',
            formattedTag: '',
        }),
    },
];

describe('CHART_GROUP_BY_CONFIG', () => {
    it('uses the explicit exact operator for merchant drill-downs', () => {
        // Given a merchant group whose short name must match exactly.
        const item = createMock<TransactionMerchantGroupListItemType>({groupedBy: CONST.SEARCH.GROUP_BY.MERCHANT, merchant: 'I'});

        // When the chart builds its merchant drill-down query.
        const query = CHART_GROUP_BY_CONFIG[CONST.SEARCH.GROUP_BY.MERCHANT].getFilterQuery(item);

        // Then the exact operator prevents matching merchants that only contain this name.
        expect(query).toBe('merchant="I"');
    });

    test.each(cases)('returns the $groupBy chart values for a matching item', ({groupBy, item, expectedIcon, expectedLabel, expectedShortLabel, expectedFilterQuery}) => {
        // Given a producer-shaped item for the selected group.
        const config = CHART_GROUP_BY_CONFIG[groupBy];

        // When the chart reads its label and drill-down configuration.
        // Then the matching group preserves its display values and filter.
        expect(config.titleIconName).toBe(expectedIcon);
        expect(config.getLabel(item)).toBe(expectedLabel);
        expect(config.getShortLabel?.(item)).toBe(expectedShortLabel);
        expect(config.getFilterQuery(item)).toBe(expectedFilterQuery);
    });

    test.each(cases)('rejects an item that does not match the $groupBy configuration', ({groupBy}) => {
        // Given a valid item from a different group.
        const config = CHART_GROUP_BY_CONFIG[groupBy];
        const mismatchedItem = groupBy === CONST.SEARCH.GROUP_BY.FROM ? cardItem : memberItem;

        // When the selected configuration receives the other group.
        // Then it returns empty values instead of reading unrelated fields.
        expect(config.getLabel(mismatchedItem)).toBe('');
        expect(config.getShortLabel?.(mismatchedItem)).toBeUndefined();
        expect(config.getFilterQuery(mismatchedItem)).toBe('');
    });

    test.each(optionalLabelCases)('returns an empty label for an absent or empty optional $groupBy label', ({groupBy, item}) => {
        // Given a matching item with an absent or empty display label.
        const config = CHART_GROUP_BY_CONFIG[groupBy];

        // When the chart requests the optional label.
        const label = config.getLabel(item);

        // Then the display fallback remains an empty string.
        expect(label).toBe('');
    });
});
