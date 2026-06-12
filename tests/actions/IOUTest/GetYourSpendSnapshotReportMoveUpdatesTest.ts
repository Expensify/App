import Onyx from 'react-native-onyx';
import {getYourSpendSnapshotReportMoveUpdates} from '@libs/actions/IOU/YourSpendSnapshotUpdate';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {buildAwaitingApprovalQuery, buildRepaidLast30DaysQuery} from '@libs/YourSpendQueryUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, SearchResults, Transaction} from '@src/types/onyx';
import createRandomPolicy from '../../utils/collections/policies';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 42;
const OTHER_ACCOUNT_ID = 99;
const POLICY_ID = 'paidPolicy1';
const EXPENSE_REPORT_ID = 'expenseReport1';

const paidPolicy: Policy = {
    ...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM, 'Team Workspace'),
    id: POLICY_ID,
    owner: 'owner@test.com',
    role: CONST.POLICY.ROLE.ADMIN,
    outputCurrency: CONST.CURRENCY.USD,
};

const OPEN_STATUS = {stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};
const SUBMITTED_STATUS = {stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED};
const APPROVED_STATUS = {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
const REIMBURSED_STATUS = {stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED};

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

/** A date string a few days in the past so repaid-last-30-days matching includes the transaction. */
function getRecentCreatedDate(): string {
    const date = new Date();
    date.setUTCDate(date.getUTCDate() - 5);
    return date.toISOString().slice(0, 10);
}

function buildExpenseReport(overrides: Partial<Report> = {}): Report {
    return {
        reportID: EXPENSE_REPORT_ID,
        type: CONST.REPORT.TYPE.EXPENSE,
        policyID: POLICY_ID,
        ownerAccountID: ACCOUNT_ID,
        currency: CONST.CURRENCY.USD,
        total: -10000,
        ...overrides,
    } as Report;
}

function buildTransaction(overrides: Partial<Transaction> = {}): Transaction {
    return {
        transactionID: 'reportMoveTxn',
        reportID: EXPENSE_REPORT_ID,
        amount: -10000,
        currency: CONST.CURRENCY.USD,
        reimbursable: true,
        created: '2026-01-15',
        merchant: 'Test Merchant',
        ...overrides,
    } as Transaction;
}

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

async function seedAwaitingApprovalSnapshot(total: number, currency: string = CONST.CURRENCY.USD) {
    const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
    const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
    await Onyx.set(snapshotKey, buildSnapshotSearchResults(total, currency));
    await waitForBatchedUpdates();
    return snapshotKey;
}

async function seedRepaidSnapshot(total: number, currency: string = CONST.CURRENCY.USD) {
    const paymentQueryJSON = buildSearchQueryJSON(buildRepaidLast30DaysQuery(ACCOUNT_ID));
    const snapshotKey = getSnapshotKey(paymentQueryJSON?.hash ?? 0);
    await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, paidPolicy);
    await Onyx.set(snapshotKey, buildSnapshotSearchResults(total, currency));
    await waitForBatchedUpdates();
    return snapshotKey;
}

describe('getYourSpendSnapshotReportMoveUpdates', () => {
    it('adds the report total to awaiting approval when a report is submitted (OPEN -> SUBMITTED)', async () => {
        const snapshotKey = await seedAwaitingApprovalSnapshot(10000);

        const {optimisticData, failureData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(SUBMITTED_STATUS),
            reportTransactions: [buildTransaction()],
            fromStatus: OPEN_STATUS,
            toStatus: SUBMITTED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: 20000, currency: CONST.CURRENCY.USD}},
            }),
        ]);
        expect(failureData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: 10000, currency: CONST.CURRENCY.USD}},
            }),
        ]);
    });

    it('subtracts the report total from awaiting approval when a report is retracted (SUBMITTED -> OPEN)', async () => {
        const snapshotKey = await seedAwaitingApprovalSnapshot(30000);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(OPEN_STATUS),
            reportTransactions: [buildTransaction()],
            fromStatus: SUBMITTED_STATUS,
            toStatus: OPEN_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: 20000, currency: CONST.CURRENCY.USD}},
            }),
        ]);
    });

    it('subtracts the report total from awaiting approval when a report is rejected (SUBMITTED -> OPEN)', async () => {
        const snapshotKey = await seedAwaitingApprovalSnapshot(30000);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(OPEN_STATUS),
            reportTransactions: [buildTransaction()],
            fromStatus: SUBMITTED_STATUS,
            toStatus: OPEN_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: 20000, currency: CONST.CURRENCY.USD}},
            }),
        ]);
    });

    it('adds the report total back to awaiting approval when a report is unapproved (APPROVED -> SUBMITTED)', async () => {
        const snapshotKey = await seedAwaitingApprovalSnapshot(10000);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(SUBMITTED_STATUS),
            reportTransactions: [buildTransaction()],
            fromStatus: APPROVED_STATUS,
            toStatus: SUBMITTED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: 20000, currency: CONST.CURRENCY.USD}},
            }),
        ]);
    });

    it('subtracts the report total from repaid when a payment is cancelled (REIMBURSED -> APPROVED)', async () => {
        const snapshotKey = await seedRepaidSnapshot(30000);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(APPROVED_STATUS),
            reportTransactions: [buildTransaction({created: getRecentCreatedDate()})],
            fromStatus: REIMBURSED_STATUS,
            toStatus: APPROVED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: 20000, currency: CONST.CURRENCY.USD}},
            }),
        ]);
    });

    it('does not patch when the report is not owned by the current user', async () => {
        await seedAwaitingApprovalSnapshot(10000);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport({...SUBMITTED_STATUS, ownerAccountID: OTHER_ACCOUNT_ID}),
            reportTransactions: [buildTransaction()],
            fromStatus: OPEN_STATUS,
            toStatus: SUBMITTED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toHaveLength(0);
    });

    it('does not patch when the report transactions are non-reimbursable', async () => {
        await seedAwaitingApprovalSnapshot(10000);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(SUBMITTED_STATUS),
            reportTransactions: [buildTransaction({reimbursable: false})],
            fromStatus: OPEN_STATUS,
            toStatus: SUBMITTED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toHaveLength(0);
    });

    it('does not patch when the workspace is not a paid group policy', async () => {
        const approvalQueryJSON = buildSearchQueryJSON(buildAwaitingApprovalQuery(ACCOUNT_ID, [POLICY_ID]));
        const snapshotKey = getSnapshotKey(approvalQueryJSON?.hash ?? 0);
        await Onyx.set(snapshotKey, buildSnapshotSearchResults(10000, CONST.CURRENCY.USD));
        await waitForBatchedUpdates();

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(SUBMITTED_STATUS),
            reportTransactions: [buildTransaction()],
            fromStatus: OPEN_STATUS,
            toStatus: SUBMITTED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toHaveLength(0);
    });

    it('does not patch when the transaction cannot be converted into the snapshot currency', async () => {
        await seedAwaitingApprovalSnapshot(10000, CONST.CURRENCY.EUR);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport(SUBMITTED_STATUS),
            reportTransactions: [buildTransaction()],
            fromStatus: OPEN_STATUS,
            toStatus: SUBMITTED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toHaveLength(0);
    });

    it('patches using convertedAmount when the snapshot currency differs from the transaction currency', async () => {
        const snapshotKey = await seedAwaitingApprovalSnapshot(10000);

        const {optimisticData} = getYourSpendSnapshotReportMoveUpdates({
            iouReport: buildExpenseReport({...SUBMITTED_STATUS, currency: CONST.CURRENCY.EUR}),
            reportTransactions: [buildTransaction({currency: CONST.CURRENCY.EUR, amount: -10000, convertedAmount: -5000})],
            fromStatus: OPEN_STATUS,
            toStatus: SUBMITTED_STATUS,
            currentUserAccountID: ACCOUNT_ID,
        });

        expect(optimisticData).toEqual([
            expect.objectContaining({
                key: snapshotKey,
                value: {search: {total: 15000, currency: CONST.CURRENCY.USD}},
            }),
        ]);
    });
});
