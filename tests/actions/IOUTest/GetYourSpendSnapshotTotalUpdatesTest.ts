import Onyx from 'react-native-onyx';
import {getUpdateMoneyRequestParams} from '@libs/actions/IOU/UpdateMoneyRequest';
import {getYourSpendSnapshotTotalUpdates, transactionMatchesAwaitingApprovalQuery} from '@libs/actions/IOU/YourSpendSnapshotUpdate';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {buildAwaitingApprovalQuery} from '@libs/YourSpendQueryUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 42;
const POLICY_ID = 'paidPolicy1';
const TRANSACTION_ID = 'txn1';
const EXPENSE_REPORT_ID = 'expenseReport1';
const THREAD_REPORT_ID = 'thread1';

const paidPolicy: Policy = {
    id: POLICY_ID,
    type: CONST.POLICY.TYPE.TEAM,
    name: 'Team Workspace',
    owner: 'owner@test.com',
    role: CONST.POLICY.ROLE.ADMIN,
    outputCurrency: CONST.CURRENCY.USD,
} as Policy;

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

const transaction: Transaction = {
    transactionID: TRANSACTION_ID,
    reportID: EXPENSE_REPORT_ID,
    amount: -10000,
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
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${approvalQueryJSON?.hash}` as `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${number}`;

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(snapshotKey, {
            search: {
                type: CONST.SEARCH.DATA_TYPES.EXPENSE,
                status: CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING,
                count: 1,
                total: 10000,
                currency: CONST.CURRENCY.USD,
            },
            data: {},
        } as SearchResults);
        await waitForBatchedUpdates();

        expect(transactionMatchesAwaitingApprovalQuery(expenseReport, transaction, ACCOUNT_ID, [POLICY_ID])).toBe(true);

        const updatedTransaction: Transaction = {
            ...transaction,
            modifiedAmount: 20000,
        };

        const {optimisticData, failureData} = getYourSpendSnapshotTotalUpdates({
            transaction,
            updatedTransaction,
            iouReport: expenseReport,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {
                    search: {
                        total: 20000,
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
                        total: 10000,
                        currency: CONST.CURRENCY.USD,
                    },
                },
            }),
        ]);
    });

    it('does not patch snapshots when the currency changes to a different report currency', () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${approvalQueryJSON?.hash}` as `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${number}`;

        Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        Onyx.set(snapshotKey, {
            search: {count: 1, total: 10000, currency: CONST.CURRENCY.USD},
            data: {},
        } as SearchResults);

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
        });

        expect(optimisticData).toHaveLength(0);
    });
});

describe('getUpdateMoneyRequestParams — Your spend snapshot totals', () => {
    it('includes awaiting-approval snapshot total updates when the amount changes', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = `${ONYXKEYS.COLLECTION.SNAPSHOT}${approvalQueryJSON?.hash}` as `${typeof ONYXKEYS.COLLECTION.SNAPSHOT}${number}`;

        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.set(snapshotKey, {
            search: {count: 1, total: 10000, currency: CONST.CURRENCY.USD},
            data: {},
        } as SearchResults);
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
        });

        const snapshotOptimisticUpdate = onyxData.optimisticData?.find((update) => update.key === snapshotKey);
        expect(snapshotOptimisticUpdate).toEqual(
            expect.objectContaining({
                value: {
                    search: {
                        total: 20000,
                        currency: CONST.CURRENCY.USD,
                    },
                },
            }),
        );
    });
});
