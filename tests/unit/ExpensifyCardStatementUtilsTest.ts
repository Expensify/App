import {getExpensifyCardStatementParamsFromFeed, getExpensifyCardStatementSelection, isExpensifyCardStatementSearch} from '@libs/ExpensifyCardStatementUtils';
import type {SearchQueryJSON, SelectedTransactions} from '@src/components/Search/types';
import CONST from '@src/CONST';
import type {SearchResultDataType, SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

// Mirrors how production turns a selection into download params (useSearchBulkActions.exportExpensifyCardStatementPDF):
// the export is only offered for a single feed, otherwise the multi-feed alert is shown instead.
function getStatementParamsForExport(queryJSON: SearchQueryJSON, selectedTransactions: SelectedTransactions, searchData: SearchResultDataType) {
    const selection = getExpensifyCardStatementSelection(queryJSON, selectedTransactions, searchData);
    const feed = selection && !selection.hasMultipleFeeds ? selection.feeds.at(0) : undefined;
    return feed ? getExpensifyCardStatementParamsFromFeed(feed) : undefined;
}

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
    // The util only reads the group_-prefixed entries, so a record of those is a sufficient fixture.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return groups as unknown as SearchResultDataType;
}

function makeSettlementGroup(overrides: Partial<SearchWithdrawalIDGroup> = {}): SearchWithdrawalIDGroup {
    return {
        entryID: 123,
        count: 1,
        total: 1000,
        currency: 'USD',
        accountNumber: '1234',
        bankName: CONST.BANK_NAMES.AMERICAN_EXPRESS,
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
        // A plain transaction key (not group_-prefixed) can't resolve to a settlement.
        const selectedTransactions: SelectedTransactions = {
            txn123: makeSelectedTransaction(),
        };

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, {})).toBeUndefined();
    });

    it('includes a settlement selected directly by its row (collapsed, no loaded transactions)', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        // A collapsed row stores the group key itself, not individual transactions.
        const selectedTransactions: SelectedTransactions = {[groupKey]: makeSelectedTransaction({reportID: undefined})};
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);
    });

    it('includes a settlement even when not all of its transactions are loaded or selected', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        // Only 1 of the settlement's 2 transactions is selected; the PDF still covers the whole settlement.
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);
    });

    it('returns a single-feed selection when a whole settlement is selected', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);

        const params = getStatementParamsForExport(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(params).toEqual({
            policyID: 'policy1',
            feedCountry: 'US',
            entryIDs: [123],
        });
    });

    it('excludes a mixed-workspace settlement (no policyID) so the export is not offered', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, policyID: undefined})});

        // A settlement with no policyID can't be scoped to one workspace, so it is skipped entirely - no dead-end menu item.
        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData)).toBeUndefined();
        expect(getStatementParamsForExport(expensifyCardStatementQueryJSON, selectedTransactions, searchData)).toBeUndefined();
    });

    it('exports the valid feed when a mixed-workspace settlement is also selected', () => {
        const validGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const mixedGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        const selectedTransactions: SelectedTransactions = {
            ...makeSettlementSelection(validGroupKey, 1),
            ...makeSettlementSelection(mixedGroupKey, 1),
        };
        const searchData = makeSearchData({
            [validGroupKey]: makeSettlementGroup({entryID: 123, policyID: 'policy1'}),
            [mixedGroupKey]: makeSettlementGroup({entryID: 456, policyID: undefined}),
        });

        // The mixed-workspace settlement is dropped, leaving a single valid feed that can be exported.
        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);
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
        expect(getStatementParamsForExport(expensifyCardStatementQueryJSON, selectedTransactions, searchData)).toBeUndefined();
    });

    it('hides the export when a transaction-narrowing filter is active', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});
        const narrowedQueryJSON: SearchQueryJSON = {
            ...expensifyCardStatementQueryJSON,
            flatFilters: [
                ...expensifyCardStatementQueryJSON.flatFilters,
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.MERCHANT, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'Starbucks'}]},
            ],
        };

        expect(getExpensifyCardStatementSelection(narrowedQueryJSON, selectedTransactions, searchData)).toBeUndefined();
    });

    it('keeps the export when only statement-scope filters are active', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});
        const scopedQueryJSON: SearchQueryJSON = {
            ...expensifyCardStatementQueryJSON,
            flatFilters: [
                ...expensifyCardStatementQueryJSON.flatFilters,
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: '2026-05-01'}]},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'policy1'}]},
            ],
        };

        const selection = getExpensifyCardStatementSelection(scopedQueryJSON, selectedTransactions, searchData);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);
    });

    it('excludes failed settlements from the selection', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 5})});

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData)).toBeUndefined();
    });

    it('includes pending settlements in the selection', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 0})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);
    });

    it('includes settlements that are settled pending batch processing (state 9)', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 9})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', entryIDs: [123]}]);
    });
});
