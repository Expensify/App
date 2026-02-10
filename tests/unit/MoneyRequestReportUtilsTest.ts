import type {TransactionListItemType} from '@components/SelectionListWithSections/types';
import {getReportIDForTransaction, hasNonReimbursableTransactions, isBillableEnabledOnPolicy} from '@libs/MoneyRequestReportUtils';
import CONST from '@src/CONST';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';

const policyBaseMock: Policy = {
    id: '123456789A',
    name: 'Policy',
    role: 'admin',
    outputCurrency: 'USD',
    type: 'team',
    owner: 'admin@test.com',
    isPolicyExpenseChatEnabled: true,
};

const reportBaseMock: Report = {
    chatReportID: '1706144653204915',
    created: '2024-12-21 13:05:20',
    submitted: '2024-12-21 13:05:20',
    approved: undefined,
    currency: 'USD',
    isWaitingOnBankAccount: false,
    managerID: 100,
    nonReimbursableTotal: 0,
    ownerAccountID: 100,
    policyID: policyBaseMock.id,
    reportID: '123',
    reportName: 'Expense Report #123',
    stateNum: 1,
    statusNum: 1,
    total: -5000,
    type: 'expense',
    unheldTotal: -5000,
    transactionCount: 5,
};

const reportActionBaseMock: ReportAction = {
    accountID: 100,
    actorAccountID: 100,
    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
    created: '2024-12-21 13:05:21',
    message: [{type: 'COMMENT', html: 'IOU', text: 'IOU'}],
    reportActionID: '11111111',
    originalMessage: {
        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        IOUTransactionID: '555',
        IOUReportID: reportBaseMock.reportID,
    },
    reportID: reportBaseMock.reportID,
};

const transactionItemBaseMock: TransactionListItemType = {
    action: 'submit',
    allActions: ['submit'],
    amount: -5000,
    report: reportBaseMock,
    policy: policyBaseMock,
    reportAction: reportActionBaseMock,
    holdReportAction: undefined,
    cardID: undefined,
    cardName: undefined,
    category: '',
    comment: {comment: ''},
    created: '2024-12-21',
    submitted: '2024-12-21',
    approved: undefined,
    posted: undefined,
    exported: undefined,
    currency: 'USD',
    date: '2024-12-21',
    formattedFrom: 'Admin',
    formattedMerchant: 'Expense',
    formattedTo: '',
    formattedTotal: 5000,
    from: {
        accountID: 18439984,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_3.png',
        displayName: 'Admin',
        login: 'admin@test.com',
    },
    hasEReceipt: false,
    keyForList: '1',
    merchant: 'Expense',
    modifiedAmount: 0,
    modifiedCreated: '',
    modifiedCurrency: '',
    modifiedMerchant: 'Expense',
    parentTransactionID: '',
    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    reportID: reportBaseMock.reportID,
    shouldShowMerchant: true,
    shouldShowYear: true,
    shouldShowYearSubmitted: true,
    shouldShowYearApproved: false,
    shouldShowYearPosted: false,
    shouldShowYearExported: false,
    isAmountColumnWide: false,
    isTaxAmountColumnWide: false,
    tag: '',
    to: {
        accountID: 0,
        avatar: '',
        displayName: undefined,
        login: undefined,
    },
    transactionID: '1',
    receipt: undefined,
    taxAmount: undefined,
    mccGroup: undefined,
    modifiedMCCGroup: undefined,
    errors: undefined,
    filename: undefined,
    violations: [],
};

describe('MoneyRequestReportUtils', () => {
    describe('getReportIDForTransaction', () => {
        it('returns transaction thread ID if its not from one transaction report', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock};
            const resultID = getReportIDForTransaction(transactionItem, '456');

            expect(resultID).toBe('456');
        });

        it('returns transaction thread ID if its from self DM', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock, reportID: CONST.REPORT.UNREPORTED_REPORT_ID};
            const resultID = getReportIDForTransaction(transactionItem, '456');

            expect(resultID).toBe('456');
        });

        it('returns expense reportID if its from one transaction report', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock, report: {...reportBaseMock, transactionCount: 1}};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('123');
        });

        it('returns reportID if transaction thread ID is 0 - unreported', () => {
            const transactionItem: TransactionListItemType = {...transactionItemBaseMock};
            const resultID = getReportIDForTransaction(transactionItem);

            expect(resultID).toBe('123');
        });
    });

    describe('isBillableEnabledOnPolicy', () => {
        test('returns false when policy is missing', () => {
            expect(isBillableEnabledOnPolicy(undefined)).toBe(false);
        });

        test('returns true when policy is paid group and defaultBillable is enabled', () => {
            const policy = {type: CONST.POLICY.TYPE.TEAM, disabledFields: {defaultBillable: false}} as unknown as Policy;
            expect(isBillableEnabledOnPolicy(policy)).toBe(true);
        });

        test('returns true when policy is paid group and defaultBillable is missing', () => {
            const policy = {type: CONST.POLICY.TYPE.CORPORATE, disabledFields: {}} as unknown as Policy;
            expect(isBillableEnabledOnPolicy(policy)).toBe(true);
        });

        test('returns false when policy is paid group and defaultBillable is disabled', () => {
            const policy = {type: CONST.POLICY.TYPE.TEAM, disabledFields: {defaultBillable: true}} as unknown as Policy;
            expect(isBillableEnabledOnPolicy(policy)).toBe(false);
        });

        test('returns false when policy is non-paid group', () => {
            const policy = {type: CONST.POLICY.TYPE.PERSONAL, disabledFields: {defaultBillable: false}} as unknown as Policy;
            expect(isBillableEnabledOnPolicy(policy)).toBe(false);
        });
    });

    describe('hasNonReimbursableTransactions', () => {
        test('returns false when all transactions are reimbursable by default', () => {
            const t1 = {reimbursable: undefined} as unknown as Transaction;
            const t2 = {reimbursable: true} as unknown as Transaction;
            expect(hasNonReimbursableTransactions([t1, t2])).toBe(false);
        });

        test('returns true when any transaction is non-reimbursable', () => {
            const reimbursable = {reimbursable: true} as unknown as Transaction;
            const nonReimbursable = {reimbursable: false} as unknown as Transaction;
            expect(hasNonReimbursableTransactions([reimbursable, nonReimbursable])).toBe(true);
        });
    });
});
