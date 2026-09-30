import type {TransactionListItemType} from '@components/Search/SearchList/ListItem/types';

import {getReportIDForTransaction, isBillableEnabledOnPolicy, shouldWaitForTransactions} from '@libs/MoneyRequestReportUtils';

import CONST from '@src/CONST';
import type {Policy, Report, ReportAction, ReportLoadingState} from '@src/types/onyx';

import createMock from '../utils/createMock';

const policyBaseMock: Policy = {
    id: '123456789A',
    name: 'Policy',
    role: 'admin',
    outputCurrency: 'USD',
    type: 'team',
    owner: 'admin@test.com',
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
    },
    reportID: reportBaseMock.reportID,
};

const transactionItemBaseMock: TransactionListItemType = {
    action: 'submit',
    allActions: ['submit'],
    canPay: false,
    canApprove: false,
    canSubmit: true,
    canChangeApprover: false,
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
            const policy = createMock<Policy>({type: CONST.POLICY.TYPE.TEAM, disabledFields: {defaultBillable: false}});
            expect(isBillableEnabledOnPolicy(policy)).toBe(true);
        });

        test('returns true when policy is paid group and defaultBillable is missing', () => {
            const policy = createMock<Policy>({type: CONST.POLICY.TYPE.CORPORATE, disabledFields: {}});
            expect(isBillableEnabledOnPolicy(policy)).toBe(true);
        });

        test('returns false when policy is paid group and defaultBillable is disabled', () => {
            const policy = createMock<Policy>({type: CONST.POLICY.TYPE.TEAM, disabledFields: {defaultBillable: true}});
            expect(isBillableEnabledOnPolicy(policy)).toBe(false);
        });

        test('returns false when policy is non-paid group', () => {
            const policy = createMock<Policy>({type: CONST.POLICY.TYPE.PERSONAL, disabledFields: {defaultBillable: false}});
            expect(isBillableEnabledOnPolicy(policy)).toBe(false);
        });
    });

    describe('shouldWaitForTransactions', () => {
        const zeroTotalReport = {...reportBaseMock, total: 0};

        test('ignores a stored loading flag when no report load is pending', () => {
            const reportLoadingState: ReportLoadingState = {isLoadingInitialReportActions: true, hasOnceLoadedReportActions: false};

            expect(shouldWaitForTransactions(zeroTotalReport, [], reportLoadingState, false, false)).toBe(false);
        });

        test('waits for transactions when a report load is pending despite a false stored loading flag', () => {
            const reportLoadingState: ReportLoadingState = {isLoadingInitialReportActions: false, hasOnceLoadedReportActions: false};

            expect(shouldWaitForTransactions(zeroTotalReport, [], reportLoadingState, true, false)).toBe(true);
        });

        test('does not wait after report actions have loaded successfully', () => {
            const reportLoadingState: ReportLoadingState = {isLoadingInitialReportActions: false, hasOnceLoadedReportActions: true};

            expect(shouldWaitForTransactions(zeroTotalReport, [], reportLoadingState, true, false)).toBe(false);
        });

        test('still waits for a nonzero report total when no transactions are available', () => {
            const reportLoadingState: ReportLoadingState = {isLoadingInitialReportActions: false, hasOnceLoadedReportActions: false};

            expect(shouldWaitForTransactions(reportBaseMock, [], reportLoadingState, false, false)).toBe(true);
        });
    });
});
