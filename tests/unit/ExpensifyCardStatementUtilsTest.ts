import {getExpensifyCardStatementKey, getExpensifyCardStatementParams, getExpensifyCardStatementSelection, isExpensifyCardStatementSearch} from '@libs/ExpensifyCardStatementUtils';
import type {SearchQueryJSON, SelectedTransactions} from '@src/components/Search/types';
import CONST from '@src/CONST';
import type {SearchResultDataType, SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

const expensifyCardStatementQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense policyID:policy1 withdrawal-type:expensify-card withdrawn>=2026-05-01 withdrawn<=2026-05-31 groupBy:withdrawal-id',
    hash: 67890,
    recentSearchHash: 67890,
    similarSearchHash: 67890,
    flatFilters: [
        {
            key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
            filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD}],
        },
    ],
    type: CONST.SEARCH.DATA_TYPES.EXPENSE,
    status: CONST.SEARCH.STATUS.EXPENSE.ALL,
    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
    view: CONST.SEARCH.VIEW.TABLE,
    policyID: ['policy1'],
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
};

function makeSelectedTransaction(overrides: Partial<SelectedTransactions[string]> = {}): SelectedTransactions[string] {
    return {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: false,
        isHeld: false,
        canUnhold: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        reportID: 'report1',
        policyID: 'policy1',
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        ...overrides,
    };
}

/**
 * Selecting a settlement adds its transactions (keyed by transaction ID), each tagged with the settlement's groupKey.
 * Build `selectedTransactionCount` such entries so tests can model whole-settlement vs partial (line-item) selections.
 */
function makeSettlementSelection(groupKey: string, selectedTransactionCount: number): SelectedTransactions {
    const selection: SelectedTransactions = {};
    for (let index = 0; index < selectedTransactionCount; index++) {
        selection[`${groupKey}_txn${index}`] = makeSelectedTransaction({groupKey, reportID: undefined});
    }
    return selection;
}

function makeSearchData(groups: Record<string, SearchWithdrawalIDGroup>): SearchResultDataType {
    return groups as unknown as SearchResultDataType;
}

function makeSettlementGroup(overrides: Partial<SearchWithdrawalIDGroup> = {}): SearchWithdrawalIDGroup {
    return {
        entryID: 123,
        count: 1,
        total: 1000,
        currency: 'USD',
        accountNumber: '1234',
        bankName: 'American Express' as SearchWithdrawalIDGroup['bankName'],
        debitPosted: '2026-05-31',
        state: 8,
        policyID: 'policy1',
        feedCountry: 'US',
        ...overrides,
    };
}

describe('ExpensifyCardStatementUtils', () => {
    it('identifies Expensify Card withdrawal-group searches', () => {
        expect(isExpensifyCardStatementSearch(expensifyCardStatementQueryJSON)).toBe(true);
        expect(isExpensifyCardStatementSearch({...expensifyCardStatementQueryJSON, groupBy: undefined})).toBe(false);
    });

    it('returns undefined when no selected transaction maps to a settlement group', () => {
        const selectedTransactions: SelectedTransactions = {
            '123': makeSelectedTransaction(),
        };

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, {})).toBeUndefined();
    });

    it('returns undefined for a partial (line-item only) settlement selection', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        // Only 1 of the settlement's 2 transactions is selected.
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData)).toBeUndefined();
    });

    it('returns a single-feed selection when a whole cleared settlement is selected', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);

        const params = getExpensifyCardStatementParams(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(params).toEqual({
            policyID: 'policy1',
            feedCountry: 'US',
            entryIDs: [123],
            statementKey: getExpensifyCardStatementKey('policy1', 'US', [123]),
        });
    });

    it('flags multiple feeds when settlements span workspaces or programs', () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        const selectedTransactions: SelectedTransactions = {
            ...makeSettlementSelection(firstGroupKey, 1),
            ...makeSettlementSelection(secondGroupKey, 1),
        };
        const searchData = makeSearchData({
            [firstGroupKey]: makeSettlementGroup({entryID: 123, policyID: 'policy1'}),
            [secondGroupKey]: makeSettlementGroup({entryID: 456, policyID: 'policy2'}),
        });

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.hasMultipleFeeds).toBe(true);
        expect(getExpensifyCardStatementParams(expensifyCardStatementQueryJSON, selectedTransactions, searchData)).toBeUndefined();
    });

    it('excludes failed settlements from the selection', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 5})});

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData)).toBeUndefined();
    });

    it('includes settlements that are settled pending batch processing (state 9, shown as Cleared)', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 9})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);
    });
});
