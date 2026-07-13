import {getExpensifyCardStatementParamsFromFeed, getExpensifyCardStatementSelection, isExpensifyCardStatementSearch} from '@libs/ExpensifyCardStatementUtils';

import type {SearchQueryJSON, SelectedTransactions} from '@src/components/Search/types';
import CONST from '@src/CONST';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';

import {makeSearchData, makeSelectedTransaction, makeSettlementGroup, makeSettlementSelection} from '../utils/ExpensifyCardStatementTestUtils';

// The export is admin-only. Unless a test overrides it, treat the user as an admin of every workspace (both the
// per-workspace check and the cross-workspace fallback) so the existing cases exercise the rest of the selection logic.
const isAdminOfAnyPolicy = () => true;
const IS_ADMIN_OF_ALL_WORKSPACES = true;

// Mirrors how production turns a selection into download params (useSearchBulkActions.exportExpensifyCardStatementPDF):
// the export is only offered for a single feed, otherwise the multi-feed alert is shown instead.
function getStatementParamsForExport(queryJSON: SearchQueryJSON, selectedTransactions: SelectedTransactions, searchData: SearchResultDataType) {
    const selection = getExpensifyCardStatementSelection(queryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
    const feed = selection && !selection.hasMultipleFeeds ? selection.feeds.at(0) : undefined;
    return feed ? getExpensifyCardStatementParamsFromFeed(feed) : undefined;
}

// Default statement view: no workspace filter, so the statement is the whole (unscoped) settlement.
const expensifyCardStatementQueryJSON: SearchQueryJSON = {
    inputQuery: 'type:expense withdrawal-type:expensify-card withdrawn>=2026-05-01 withdrawn<=2026-05-31 groupBy:withdrawal-id',
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
    sortBy: CONST.SEARCH.TABLE_COLUMNS.GROUP_WITHDRAWN,
    sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
    groupBy: CONST.SEARCH.GROUP_BY.WITHDRAWAL_ID,
    view: CONST.SEARCH.VIEW.TABLE,
    filters: {operator: CONST.SEARCH.SYNTAX_OPERATORS.AND, left: 'type', right: 'expense'},
};

// Workspace-filtered view: a single policyID: filter scopes the statement to that workspace.
const scopedQueryJSON: SearchQueryJSON = {
    ...expensifyCardStatementQueryJSON,
    inputQuery: 'type:expense policyID:policy1 withdrawal-type:expensify-card withdrawn>=2026-05-01 withdrawn<=2026-05-31 groupBy:withdrawal-id',
    flatFilters: [
        ...expensifyCardStatementQueryJSON.flatFilters,
        {
            key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
            filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'policy1'}],
        },
    ],
};

describe('ExpensifyCardStatementUtils', () => {
    it('identifies Expensify Card withdrawal-group searches', () => {
        expect(isExpensifyCardStatementSearch(expensifyCardStatementQueryJSON)).toBe(true);
        expect(isExpensifyCardStatementSearch({...expensifyCardStatementQueryJSON, groupBy: undefined})).toBe(false);
    });

    it('requires a positive, exclusive expensify-card withdrawal-type filter', () => {
        // Negated (NOT expensify-card) can show non-card withdrawal groups.
        const negated: SearchQueryJSON = {
            ...expensifyCardStatementQueryJSON,
            flatFilters: [
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.NOT_EQUAL_TO, value: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD}]},
            ],
        };
        expect(isExpensifyCardStatementSearch(negated)).toBe(false);

        // Mixed with another withdrawal type can show reimbursement groups too.
        const mixed: SearchQueryJSON = {
            ...expensifyCardStatementQueryJSON,
            flatFilters: [
                {
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
                    filters: [
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.WITHDRAWAL_TYPE.REIMBURSEMENT},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD},
                    ],
                },
            ],
        };
        expect(isExpensifyCardStatementSearch(mixed)).toBe(false);
    });

    it('hides the export when the search is filtered to multiple workspaces', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});
        // policyID:A,B scopes the search to a subset of workspaces, which can't be honored as a statement scope.
        const multiPolicyQueryJSON: SearchQueryJSON = {
            ...expensifyCardStatementQueryJSON,
            flatFilters: [
                ...expensifyCardStatementQueryJSON.flatFilters,
                {
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.POLICY_ID,
                    filters: [
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'policy1'},
                        {operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: 'policy2'},
                    ],
                },
            ],
        };

        expect(getExpensifyCardStatementSelection(multiPolicyQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES)).toBeUndefined();
    });

    it('returns undefined when no selected transaction maps to a settlement group', () => {
        // A plain transaction key (not group_-prefixed) can't resolve to a settlement.
        const selectedTransactions: SelectedTransactions = {
            txn123: makeSelectedTransaction(),
        };

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, {}, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES)).toBeUndefined();
    });

    it('includes a settlement selected directly by its row (collapsed, no loaded transactions)', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        // A collapsed row stores the group key itself, not individual transactions.
        const selectedTransactions: SelectedTransactions = {[groupKey]: makeSelectedTransaction({reportID: undefined})};
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });

    it("hides the export when only some of a settlement's transactions are selected", () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        // Only 1 of the settlement's 2 transactions is selected. The statement covers the whole settlement, so a
        // single-transaction selection must not enable it - that would export expenses the user did not select.
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES)).toBeUndefined();
    });

    it('includes a settlement when all of its transactions are selected', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        // Every transaction in the (expanded) settlement is selected, so the whole settlement is selected.
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });

    it('scopes the statement to the workspace when a single policyID filter is applied', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});

        const selection = getExpensifyCardStatementSelection(scopedQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', fundID: 1, entryIDs: [123]}]);

        const params = getStatementParamsForExport(scopedQueryJSON, selectedTransactions, searchData);
        expect(params).toEqual({
            policyID: 'policy1',
            feedCountry: 'US',
            entryIDs: [123],
        });
    });

    it('exports the whole settlement unscoped when no workspace filter is applied', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        // The settlement maps to a single workspace, but with no policyID filter we still export it unscoped.
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2, policyID: 'policy1'})});

        const params = getStatementParamsForExport(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(params).toEqual({policyID: undefined, feedCountry: 'US', entryIDs: [123]});
    });

    it('exports a cross-workspace settlement (no policyID) as the whole settlement', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, policyID: undefined})});

        // A settlement that spans workspaces has no single policyID, so it is exported unscoped (no policyID sent).
        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);

        const params = getStatementParamsForExport(expensifyCardStatementQueryJSON, selectedTransactions, searchData);
        expect(params).toEqual({policyID: undefined, feedCountry: 'US', entryIDs: [123]});
    });

    it('groups same-feed settlements together even when they belong to different workspaces', () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        const selectedTransactions: SelectedTransactions = {
            ...makeSettlementSelection(firstGroupKey, 1),
            ...makeSettlementSelection(secondGroupKey, 1),
        };
        const searchData = makeSearchData({
            [firstGroupKey]: makeSettlementGroup({entryID: 123, policyID: 'policy1'}),
            [secondGroupKey]: makeSettlementGroup({entryID: 456, policyID: undefined}),
        });

        // Both settlements are the same feed (US), so they group into one exportable feed.
        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds.at(0)?.entryIDs).toEqual([123, 456]);
    });

    it('flags multiple feeds when settlements belong to different feeds (different fundID, same program)', () => {
        const firstGroupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const secondGroupKey = `${CONST.SEARCH.GROUP_PREFIX}456`;
        const selectedTransactions: SelectedTransactions = {
            ...makeSettlementSelection(firstGroupKey, 1),
            ...makeSettlementSelection(secondGroupKey, 1),
        };
        // Same program (US) but different feeds (fundID 1 vs 2), e.g. two workspaces each provisioned their own feed.
        const searchData = makeSearchData({
            [firstGroupKey]: makeSettlementGroup({entryID: 123, feedCountry: 'US', fundID: 1}),
            [secondGroupKey]: makeSettlementGroup({entryID: 456, feedCountry: 'US', fundID: 2}),
        });

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
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

        expect(getExpensifyCardStatementSelection(narrowedQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES)).toBeUndefined();
    });

    it('hides the export when a non-all expense status narrows the rows', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});
        // status:unreported narrows which expenses are shown, so the PDF would not match the on-screen rows.
        const narrowedStatusQueryJSON: SearchQueryJSON = {
            ...expensifyCardStatementQueryJSON,
            flatFilters: [
                ...expensifyCardStatementQueryJSON.flatFilters,
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.STATUS, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: CONST.SEARCH.STATUS.EXPENSE.UNREPORTED}]},
            ],
        };

        expect(getExpensifyCardStatementSelection(narrowedStatusQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES)).toBeUndefined();
    });

    it('keeps the export when only statement-scope filters are active', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 2);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, count: 2})});
        const scopeFilteredQueryJSON: SearchQueryJSON = {
            ...scopedQueryJSON,
            flatFilters: [
                ...scopedQueryJSON.flatFilters,
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN, filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.GREATER_THAN, value: '2026-05-01'}]},
            ],
        };

        const selection = getExpensifyCardStatementSelection(scopeFilteredQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.feeds).toEqual([{policyID: 'policy1', feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });

    it('includes failed settlements in the selection (the statement labels their status)', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 5})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });

    it('includes pending settlements in the selection', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 0})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });

    it('includes settlements that are settled pending batch processing (state 9)', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, state: 9})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, IS_ADMIN_OF_ALL_WORKSPACES);
        expect(selection?.hasMultipleFeeds).toBe(false);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });

    it("hides the export when the user is not an admin of the settlement's workspace", () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, policyID: 'policy1'})});
        // The statement is admin-only. A cardholder can see the settlement in search, but must not be offered the
        // export - the backend would reject it with a 401.
        const denyAllPolicies = () => false;

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, denyAllPolicies, false)).toBeUndefined();
    });

    it('includes the settlement when the user is an admin of its workspace', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, policyID: 'policy1'})});
        const isAdminOfPolicy1 = (policyID: string) => policyID === 'policy1';

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfPolicy1, false);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });

    it('hides a cross-workspace settlement when the user is not an admin of all workspaces', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        // A cross-workspace settlement has no single policyID; without admin of every workspace it can't be exported.
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, policyID: undefined})});

        expect(getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, false)).toBeUndefined();
    });

    it('includes a cross-workspace settlement when the user is an admin of all workspaces', () => {
        const groupKey = `${CONST.SEARCH.GROUP_PREFIX}123`;
        const selectedTransactions = makeSettlementSelection(groupKey, 1);
        const searchData = makeSearchData({[groupKey]: makeSettlementGroup({entryID: 123, policyID: undefined})});

        const selection = getExpensifyCardStatementSelection(expensifyCardStatementQueryJSON, selectedTransactions, searchData, isAdminOfAnyPolicy, true);
        expect(selection?.feeds).toEqual([{policyID: undefined, feedCountry: 'US', fundID: 1, entryIDs: [123]}]);
    });
});
