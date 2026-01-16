import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import getReportPreviewAction from '@libs/ReportPreviewActionUtils';
// eslint-disable-next-line no-restricted-syntax
import type * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import type {Connections, NetSuiteConnection} from '@src/types/onyx/Policy';
import * as InvoiceData from '../data/Invoice';
import type {InvoiceTestData} from '../data/Invoice';
import createRandomPolicy from '../utils/collections/policies';
import {createRandomReport} from '../utils/collections/reports';
import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';

const SESSION = {
    email: CURRENT_USER_EMAIL,
    accountID: CURRENT_USER_ACCOUNT_ID,
};

const PERSONAL_DETAILS = {
    accountID: CURRENT_USER_ACCOUNT_ID,
    login: CURRENT_USER_EMAIL,
};

const REPORT_ID = 1;

jest.mock('@libs/ReportUtils', () => ({
    ...jest.requireActual<typeof ReportUtils>('@libs/ReportUtils'),
    hasAnyViolations: jest.fn().mockReturnValue(false),
    getReportTransactions: jest.fn().mockReturnValue(['mockValue']),
}));
jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPreferredExporter: jest.fn().mockReturnValue(true),
    hasAccountingConnections: jest.fn().mockReturnValue(true),
    getValidConnectedIntegration: jest.fn().mockReturnValue('netsuite'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
}));
jest.mock('@src/libs/SearchUIUtils', () => ({
    getSuggestedSearches: jest.fn().mockReturnValue({}),
}));

describe('getReportPreviewAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('getReportPreviewAction should return ADD_EXPENSE action for report preview with no transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            isWaitingOnBankAccount: false,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = createRandomPolicy(0, CONST.POLICY.TYPE.CORPORATE);
        expect(
            getReportPreviewAction({
                isReportArchived: false,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE);
    });

    it('canSubmit should return true for expense preview report with manual submit', async () => {
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        if (policy.harvesting) {
            policy.harvesting.enabled = false;
        }
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const transaction = {
            reportID: `${REPORT_ID}`,
            amount: 100,
            merchant: 'Test Merchant',
            created: '2025-01-01',
        } as unknown as Transaction;

        // Simulate how components use a hook to pass the isReportArchived parameter
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));

        await waitForBatchedUpdatesWithAct();

        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT);
    });

    it('canSubmit should return true for open report in instant submit policy with no approvers', async () => {
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN, // Report is OPEN
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.approvalMode = CONST.POLICY.APPROVAL_MODE.OPTIONAL; // Submit & Close
        policy.autoReporting = true;
        policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT; // Instant submit
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        if (policy.harvesting) {
            policy.harvesting.enabled = false;
        }

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const transaction = {
            reportID: `${REPORT_ID}`,
            amount: 100,
            merchant: 'Test Merchant',
            created: '2025-01-01',
        } as unknown as Transaction;

        // Simulate how components use a hook to pass the isReportArchived parameter
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT);
    });

    it('canSubmit should return false for expense preview report with only pending transactions', async () => {
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        if (policy.harvesting) {
            policy.harvesting.enabled = false;
        }
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const transaction = {
            reportID: `${REPORT_ID}`,
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        // Simulate how components use a hook to pass the isReportArchived parameter
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));

        await waitForBatchedUpdatesWithAct();

        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });

    it('canSubmit should return false for expense preview report with smartscan failed violation', async () => {
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        if (policy.harvesting) {
            policy.harvesting.enabled = false;
        }
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const violations = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                {
                    name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
                    type: CONST.VIOLATION_TYPES.WARNING,
                    showInReview: true,
                },
            ],
        };

        // Simulate how components use a hook to pass the isReportArchived parameter
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));

        await waitForBatchedUpdatesWithAct();

        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
                invoiceReceiverPolicy: undefined,
                isPaidAnimationRunning: undefined,
                isApprovedAnimationRunning: undefined,
                isSubmittingAnimationRunning: undefined,
                isDEWSubmitPending: undefined,
                violationsData: violations,
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });

    describe('canApprove', () => {
        it('should return true for report being processed', async () => {
            const report = {
                ...createRandomReport(REPORT_ID, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: CURRENT_USER_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
            };

            const policy = createRandomPolicy(0);
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.approver = CURRENT_USER_EMAIL;
            policy.approvalMode = CONST.POLICY.APPROVAL_MODE.BASIC;
            policy.preventSelfApproval = false;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            const transaction = {
                reportID: `${REPORT_ID}`,
                amount: 100,
                merchant: 'Test Merchant',
                created: '2025-01-01',
            } as unknown as Transaction;

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
            await waitForBatchedUpdatesWithAct();
            expect(
                getReportPreviewAction({
                    isReportArchived: isReportArchived.current,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    currentUserLogin: CURRENT_USER_EMAIL,
                    report,
                    policy,
                    transactions: [transaction],
                    bankAccountList: {},
                }),
            ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE);
        });

        it('should return false for report with scanning expenses', async () => {
            const report = {
                ...createRandomReport(REPORT_ID, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: CURRENT_USER_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
            };

            const policy = createRandomPolicy(0);
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.approver = CURRENT_USER_EMAIL;
            policy.approvalMode = CONST.POLICY.APPROVAL_MODE.BASIC;
            policy.preventSelfApproval = false;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            const transaction = {
                reportID: `${REPORT_ID}`,
                receipt: {
                    state: CONST.IOU.RECEIPT_STATE.SCANNING,
                },
            } as unknown as Transaction;

            expect(
                getReportPreviewAction({
                    isReportArchived: false,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    currentUserLogin: CURRENT_USER_EMAIL,
                    report,
                    policy,
                    transactions: [transaction],
                    bankAccountList: {},
                }),
            ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
        });

        it('should return false for report with pending expenses', async () => {
            const report = {
                ...createRandomReport(REPORT_ID, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                managerID: CURRENT_USER_ACCOUNT_ID,
                isWaitingOnBankAccount: false,
            };

            const policy = createRandomPolicy(0);
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.approver = CURRENT_USER_EMAIL;
            policy.approvalMode = CONST.POLICY.APPROVAL_MODE.BASIC;
            policy.preventSelfApproval = false;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            const transaction = {
                reportID: `${REPORT_ID}`,
                status: CONST.TRANSACTION.STATUS.PENDING,
                amount: 10,
                merchant: 'Merchant',
                date: '2025-01-01',
            } as unknown as Transaction;

            expect(
                getReportPreviewAction({
                    isReportArchived: false,
                    currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                    currentUserLogin: CURRENT_USER_EMAIL,
                    report,
                    policy,
                    transactions: [transaction],
                    bankAccountList: {},
                }),
            ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
        });
    });

    it("canApprove should return true for the current report manager regardless of whether they're in the current approval workflow", async () => {
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.approver = `another+${CURRENT_USER_EMAIL}`;
        policy.approvalMode = CONST.POLICY.APPROVAL_MODE.BASIC;
        policy.preventSelfApproval = false;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const transaction = {
            reportID: `${REPORT_ID}`,
            amount: 100,
            merchant: 'Test Merchant',
            created: '2025-01-01',
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE);
    });

    it('canPay should return true for expense report with payments enabled', async () => {
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: -100,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
    });

    it('canPay should return false for Expense report with zero total amount', async () => {
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 0,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        await waitForBatchedUpdatesWithAct();
        // Should not show PAY button for zero amount Expenses
        expect(
            getReportPreviewAction({
                isReportArchived: false,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });

    it('canPay should return true for submitted invoice', async () => {
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            isWaitingOnBankAccount: false,
            total: 7,
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

        const invoiceReceiverPolicy = createRandomPolicy(0);
        invoiceReceiverPolicy.role = CONST.POLICY.ROLE.ADMIN;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                invoiceReceiverPolicy,
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
    });

    it('getReportPreviewAction should return VIEW action for zero value invoice', async () => {
        const PARENT_REPORT_ID = (REPORT_ID + 1).toString();
        const parentReport: Report = {
            ...createRandomReport(Number(PARENT_REPORT_ID), undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: CURRENT_USER_ACCOUNT_ID,
            },
            policyID: '1',
        };

        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            parentReportID: PARENT_REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID + 1, // Different from current user
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            isWaitingOnBankAccount: false,
            total: 0,
            policyID: '1',
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
        policy.id = '1';

        const invoiceReceiverPolicy = createRandomPolicy(0);
        invoiceReceiverPolicy.role = CONST.POLICY.ROLE.ADMIN;

        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${PARENT_REPORT_ID}`, parentReport);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
                invoiceReceiverPolicy,
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });

    it('canPay should return false for archived invoice', async () => {
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            isWaitingOnBankAccount: false,
            total: 7,
        };

        const policy = createRandomPolicy(0);
        policy.role = CONST.POLICY.ROLE.ADMIN;
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;

        const invoiceReceiverPolicy = createRandomPolicy(0);
        invoiceReceiverPolicy.role = CONST.POLICY.ROLE.ADMIN;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {
            private_isArchived: new Date().toString(),
        });
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
                invoiceReceiverPolicy,
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
    });

    it('getReportPreviewAction should return VIEW action for invoice when the chat report is archived', async () => {
        // Given the invoice data
        const {policy, convertedInvoiceChat: chatReport}: InvoiceTestData = InvoiceData;
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            chatReportID: chatReport.chatReportID,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`, {
            private_isArchived: new Date().toString(),
        });
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        // Simulate how components determined if a chat report is archived by using this hook
        const {result: isChatReportArchived} = renderHook(() => useReportIsArchived(report?.chatReportID));
        await waitForBatchedUpdatesWithAct();
        // Then the getReportPreviewAction should return the View action
        expect(
            getReportPreviewAction({
                isReportArchived: isChatReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
                invoiceReceiverPolicy: undefined,
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });

    it('canExport should return true for finished reports', async () => {
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.type = CONST.POLICY.TYPE.CORPORATE;
        policy.connections = {[CONST.POLICY.CONNECTIONS.NAME.NETSUITE]: {} as NetSuiteConnection} as Connections;
        policy.reimbursementChoice = CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(
            getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: CURRENT_USER_EMAIL,
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING);
    });

    describe('DEW (Dynamic External Workflow) submit pending', () => {
        it('should return VIEW action when DEW submit is pending and report is OPEN', async () => {
            // Given an open expense report with a corporate policy where DEW submit is pending
            const report: Report = {
                ...createRandomReport(REPORT_ID, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                isWaitingOnBankAccount: false,
            };

            const policy = createRandomPolicy(0);
            policy.type = CONST.POLICY.TYPE.CORPORATE;

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            const transaction = {
                reportID: `${REPORT_ID}`,
            } as unknown as Transaction;

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));

            // When getReportPreviewAction is called with isDEWSubmitPending = true
            const result = getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: '',
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
                invoiceReceiverPolicy: undefined,
                isPaidAnimationRunning: false,
                isApprovedAnimationRunning: false,
                isSubmittingAnimationRunning: false,
                isDEWSubmitPending: true,
            });

            // Then it should return VIEW because DEW submission is pending offline
            expect(result).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
        });

        it('should return SUBMIT action when DEW submit has failed (not pending) and report is OPEN', async () => {
            // Given an open expense report where DEW submit has failed (returned from backend, not pending offline)
            const report: Report = {
                ...createRandomReport(REPORT_ID, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                isWaitingOnBankAccount: false,
            };

            const policy = createRandomPolicy(0);
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
            if (policy.harvesting) {
                policy.harvesting.enabled = false;
            }

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            const transaction = {
                reportID: `${REPORT_ID}`,
            } as unknown as Transaction;

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));

            // When getReportPreviewAction is called with isDEWSubmitPending = false (failed, not pending)
            const result = getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: '',
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
                invoiceReceiverPolicy: undefined,
                isPaidAnimationRunning: false,
                isApprovedAnimationRunning: false,
                isSubmittingAnimationRunning: false,
                isDEWSubmitPending: false,
            });

            // Then it should allow SUBMIT because failed submissions can be retried (not VIEW)
            expect(result).not.toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
        });

        it('should return SUBMIT action when DEW submit has not failed and report is OPEN', async () => {
            // Given an open expense report where DEW submit has not failed
            const report: Report = {
                ...createRandomReport(REPORT_ID, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: CURRENT_USER_ACCOUNT_ID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                isWaitingOnBankAccount: false,
            };

            const policy = createRandomPolicy(0);
            policy.type = CONST.POLICY.TYPE.CORPORATE;
            policy.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
            if (policy.harvesting) {
                policy.harvesting.enabled = false;
            }

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
            const transaction = {
                reportID: `${REPORT_ID}`,
            } as unknown as Transaction;

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));

            // When getReportPreviewAction is called with isDEWSubmitPending = false
            const result = getReportPreviewAction({
                isReportArchived: isReportArchived.current,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                currentUserLogin: '',
                report,
                policy,
                transactions: [transaction],
                bankAccountList: {},
                invoiceReceiverPolicy: undefined,
                isPaidAnimationRunning: false,
                isApprovedAnimationRunning: false,
                isSubmittingAnimationRunning: false,
                isDEWSubmitPending: false,
            });

            // Then it should not return VIEW because DEW submit did not fail and regular logic applies
            expect(result).not.toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
        });
    });
});
