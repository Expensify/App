import type {SelectedTransactions} from '@components/Search/types';
import CONST from '@src/CONST';
import type {SearchResultDataType, SearchWithdrawalIDGroup} from '@src/types/onyx/SearchResults';

/** Shared fixtures for the Expensify Card statement PDF tests (selection logic and the bulk-action hook). */

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
        fundID: 1,
        ...overrides,
    };
}

function makeSearchData(groups: Record<string, SearchWithdrawalIDGroup>): SearchResultDataType {
    // The util/hook only read the group_-prefixed entries, so a record of those is a sufficient fixture.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
    return groups as unknown as SearchResultDataType;
}

export {makeSearchData, makeSelectedTransaction, makeSettlementGroup, makeSettlementSelection};
