import {getUpdateMoneyRequestParams} from '@libs/actions/IOU/UpdateMoneyRequest';
import {
    getYourSpendSnapshotReimbursableUpdates,
    getYourSpendSnapshotTotalUpdates,
    getYourSpendSnapshotTransactionRemovalUpdates,
    transactionMatchesAwaitingApprovalQuery,
} from '@libs/actions/IOU/YourSpendSnapshotUpdate';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import type {YourSpendPatchData} from '@libs/YourSpendPatchData';
import {buildAwaitingApprovalQuery} from '@libs/YourSpendQueryUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 42;
const POLICY_ID = 'paidPolicy1';
const TRANSACTION_ID = 'txn1';
const EXPENSE_REPORT_ID = 'expenseReport1';
const THREAD_REPORT_ID = 'thread1';

const paidPolicy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'Team Workspace'),
    id: POLICY_ID,
    owner: 'owner@test.com',
    role: CONST.POLICY.ROLE.ADMIN,
    outputCurrency: CONST.CURRENCY.USD,
};

/** Builds a fully-typed snapshot collection key from a search query hash. */
function getSnapshotKey(hash: number): `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${number}` {
    return `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`;
}

/** Builds a fully-typed `SearchResults` snapshot with the given total/currency. */
function buildSnapshotSearchResults(total: number, currency: string): SearchResults {
    return {
        search: {
            offset: 0,
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
            hasMoreResults: false,
            hasResults: true,
            isLoading: false,
            count: 1,
            total,
            currency,
        },
        data: {},
    };
}

/**
 * Builds the snapshot context the builders now receive as a parameter (previously read via a module-level Onyx
 * subscription), mirroring what `useYourSpendPatchData` supplies from the triggering component.
 */
function buildYourSpendPatchData(snapshotKey: `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${number}`, total: number, currency: string): YourSpendPatchData {
    return {
        paidPolicies: {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: paidPolicy},
        snapshotSearches: {[snapshotKey]: buildSnapshotSearchResults(total, currency).search},
    };
}

const expenseReport: Report = {
    reportID: EXPENSE_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    policyID: POLICY_ID,
    ownerAccountID: ACCOUNT_ID,
    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    currency: CONST.CURRENCY.USD,
    total: -10000,
} as Report;

const transactionThreadReport: Report = {
    reportID: THREAD_REPORT_ID,
    type: CONST.REPORT.TYPE.EXPENSE,
    parentReportID: EXPENSE_REPORT_ID,
} as Report;

// Expense-report transactions are stored with the opposite sign, so a positive stored `amount` (10000) is a spend
// that `getAmount`/the snapshot total represent as negative (-10000). Mirrors real Onyx data.
const transaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: EXPENSE_REPORT_ID,
    amount: 10000,
    currency: CONST.CURRENCY.USD,
    reimbursable: true,
    created: '2026-01-15',
    merchant: 'Test Merchant',
} as Transaction;

beforeAll(() => {
    Onyx.init({
        keys: ONYXKEYS,
        initialKeyStates: {
            [ONYXKEYS.SESSION]: {accountID: ACCOUNT_ID, email: 'user@test.com'},
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[ACCOUNT_ID]: {accountID: ACCOUNT_ID, login: 'user@test.com'}},
        },
    });
    initOnyxDerivedValues();
    IntlStore.load(CONST.LOCALES.EN);
    return waitForBatchedUpdates();
});

beforeEach(() => {
    return Onyx.clear().then(waitForBatchedUpdates);
});

describe('getYourSpendSnapshotTotalUpdates', () => {
    it('patches the awaiting-approval snapshot total with the amount delta', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-10000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        expect(transactionMatchesAwaitingApprovalQuery(expenseReport, transaction, ACCOUNT_ID, [POLICY_ID])).toBe(true);

        const updatedTransaction: Transaction = {
            ...transaction,
            modifiedAmount: 20000,
        };

        // Raising the spend from 100 to 200 makes the (negative) section total more negative: -100 -> -200.
        const {optimisticData, failureData} = getYourSpendSnapshotTotalUpdates({
            transaction,
            updatedTransaction,
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
            context: buildYourSpendPatchData(snapshotKey, -10000, CONST.CURRENCY.USD),
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {
                    search: {
                        total: -20000,
                        count: 1,
                        currency: CONST.CURRENCY.USD,
                    },
                },
            }),
        ]);
        expect(failureData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {
                    search: {
                        total: -10000,
                        count: 1,
                        currency: CONST.CURRENCY.USD,
                    },
                },
            }),
        ]);
    });

    it('does not patch snapshots when the currency changes to a different report currency', () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        Onyx.set(snapshotKey, buildSnapshotSearchResults(10000, CONST.CURRENCY.USD));

        const updatedTransaction: Transaction = {
            ...transaction,
            amount: -20000,
            currency: CONST.CURRENCY.EUR,
        };

        const {optimisticData} = getYourSpendSnapshotTotalUpdates({
            transaction,
            updatedTransaction,
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
            context: buildYourSpendPatchData(snapshotKey, 10000, CONST.CURRENCY.USD),
        });

        expect(optimisticData).toHaveLength(0);
    });
});

describe('getYourSpendSnapshotTransactionRemovalUpdates', () => {
    it('subtracts the removed transaction amount from the awaiting-approval snapshot total', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-30000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        // Removing a 100 spend pulls the (negative) section total toward zero: -300 -> -200.
        const {optimisticData, failureData} = getYourSpendSnapshotTransactionRemovalUpdates({
            transaction,
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
            context: buildYourSpendPatchData(snapshotKey, -30000, CONST.CURRENCY.USD),
        });

        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`;
        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: -20000, count: 0, currency: CONST.CURRENCY.USD}},
            }),
            // The removed transaction is also dropped from the snapshot data so the Search page stays in sync offline.
            expect.objectContaining({
                key: snapshotKey,
                value: {data: {[transactionKey]: null}},
            }),
        ]);
        expect(failureData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: -30000, count: 1, currency: CONST.CURRENCY.USD}},
            }),
            expect.objectContaining({
                key: snapshotKey,
                value: {data: {[transactionKey]: transaction}},
            }),
        ]);
    });

    it('does not patch when the removed transaction is non-reimbursable', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(30000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        const {optimisticData} = getYourSpendSnapshotTransactionRemovalUpdates({
            transaction: {...transaction, reimbursable: false},
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
            context: buildYourSpendPatchData(snapshotKey, 30000, CONST.CURRENCY.USD),
        });

        expect(optimisticData).toHaveLength(0);
    });
});

describe('getYourSpendSnapshotReimbursableUpdates', () => {
    it('subtracts the amount and drops the data row when an expense becomes non-reimbursable', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-30000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        // Flipping a 100 reimbursable spend to non-reimbursable pulls the (negative) section total toward zero: -300 -> -200.
        const {optimisticData, failureData} = getYourSpendSnapshotReimbursableUpdates({
            transaction,
            updatedTransaction: {...transaction, reimbursable: false},
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
            context: buildYourSpendPatchData(snapshotKey, -30000, CONST.CURRENCY.USD),
        });

        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`;
        expect(optimisticData).toEqual([
            expect.objectContaining({key: snapshotKey, value: {search: {total: -20000, count: 0, currency: CONST.CURRENCY.USD}}}),
            expect.objectContaining({key: snapshotKey, value: {data: {[transactionKey]: null}}}),
        ]);
        expect(failureData).toEqual([
            expect.objectContaining({key: snapshotKey, value: {search: {total: -30000, count: 1, currency: CONST.CURRENCY.USD}}}),
            expect.objectContaining({key: snapshotKey, value: {data: {[transactionKey]: transaction}}}),
        ]);
    });

    it('adds the amount and inserts the data row when an expense becomes reimbursable', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-10000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        const updatedTransaction: Transaction = {...transaction, reimbursable: true};

        // Flipping a 100 non-reimbursable spend to reimbursable makes the (negative) section total more negative: -100 -> -200.
        const {optimisticData, failureData} = getYourSpendSnapshotReimbursableUpdates({
            transaction: {...transaction, reimbursable: false},
            updatedTransaction,
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
            context: buildYourSpendPatchData(snapshotKey, -10000, CONST.CURRENCY.USD),
        });

        const transactionKey = `${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`;
        expect(optimisticData).toEqual([
            expect.objectContaining({key: snapshotKey, value: {search: {total: -20000, count: 2, currency: CONST.CURRENCY.USD}}}),
            expect.objectContaining({key: snapshotKey, value: {data: {[transactionKey]: updatedTransaction}}}),
        ]);
        expect(failureData).toEqual([
            expect.objectContaining({key: snapshotKey, value: {search: {total: -10000, count: 1, currency: CONST.CURRENCY.USD}}}),
            expect.objectContaining({key: snapshotKey, value: {data: {[transactionKey]: null}}}),
        ]);
    });

    it('does not patch snapshots when the reimbursable flag is unchanged', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-10000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        const {optimisticData} = getYourSpendSnapshotReimbursableUpdates({
            transaction,
            updatedTransaction: {...transaction, merchant: 'Renamed'},
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
            context: buildYourSpendPatchData(snapshotKey, -10000, CONST.CURRENCY.USD),
        });

        expect(optimisticData).toHaveLength(0);
    });
});

describe('getUpdateMoneyRequestParams — Your spend snapshot totals', () => {
    it('includes awaiting-approval snapshot total updates when the amount changes', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-10000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        const {onyxData} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            transactionChanges: {amount: -20000},
            policy: paidPolicy,
            policyTagList: {},
            reportPolicyTags: {},
            policyCategories: {},
            iouReport: expenseReport,
            currentUserAccountIDParam: ACCOUNT_ID,
            currentUserEmailParam: 'user@test.com',
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
            delegateAccountID: undefined,
            yourSpendPatchData: buildYourSpendPatchData(snapshotKey, -10000, CONST.CURRENCY.USD),
        });

        const snapshotOptimisticUpdate = onyxData.optimisticData?.find((update) => update.key === snapshotKey);
        expect(snapshotOptimisticUpdate).toEqual(
            expect.objectContaining({
                value: {
                    search: {
                        total: -20000,
                        count: 1,
                        currency: CONST.CURRENCY.USD,
                    },
                },
            }),
        );
    });

    it('includes snapshot updates that remove the expense when it is toggled non-reimbursable', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-30000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        const {onyxData} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            transactionChanges: {reimbursable: false},
            policy: paidPolicy,
            policyTagList: {},
            reportPolicyTags: {},
            policyCategories: {},
            iouReport: expenseReport,
            currentUserAccountIDParam: ACCOUNT_ID,
            currentUserEmailParam: 'user@test.com',
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
            delegateAccountID: undefined,
            yourSpendPatchData: buildYourSpendPatchData(snapshotKey, -30000, CONST.CURRENCY.USD),
        });

        const snapshotTotalUpdate = onyxData.optimisticData?.find((update) => update.key === snapshotKey && !!update.value && typeof update.value === 'object' && 'search' in update.value);
        expect(snapshotTotalUpdate).toEqual(
            expect.objectContaining({
                value: {search: {total: -20000, count: 0, currency: CONST.CURRENCY.USD}},
            }),
        );
    });

    it('does not include snapshot total updates for a currency-only change', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(-10000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        const {onyxData} = getUpdateMoneyRequestParams({
            transactionID: TRANSACTION_ID,
            transactionThreadReport,
            transactionChanges: {currency: CONST.CURRENCY.EUR},
            policy: paidPolicy,
            policyTagList: {},
            reportPolicyTags: {},
            policyCategories: {},
            iouReport: expenseReport,
            currentUserAccountIDParam: ACCOUNT_ID,
            currentUserEmailParam: 'user@test.com',
            isASAPSubmitBetaEnabled: false,
            iouReportNextStep: undefined,
            delegateAccountID: undefined,
            yourSpendPatchData: buildYourSpendPatchData(snapshotKey, -10000, CONST.CURRENCY.USD),
        });

        const snapshotOptimisticUpdate = onyxData.optimisticData?.find((update) => update.key === snapshotKey);
        expect(snapshotOptimisticUpdate).toBeUndefined();
    });
});
