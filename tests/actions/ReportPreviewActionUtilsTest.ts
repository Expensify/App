import {renderHook} from '@testing-library/react-native';
import type {OnyxCollection} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getReportPreviewAction} from '@libs/ReportPreviewActionUtils';
// eslint-disable-next-line no-restricted-syntax
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, ReportViolations, Transaction, TransactionViolation} from '@src/types/onyx';
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
const TRANSACTION_ID = 1;
const VIOLATIONS: OnyxCollection<TransactionViolation[]> = {};

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

        const policy = createRandomPolicy(0, CONST.POLICY.TYPE.PERSONAL);
        expect(getReportPreviewAction(VIOLATIONS, false, CURRENT_USER_EMAIL, report, policy, [])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.ADD_EXPENSE);
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
        } as unknown as Transaction;

        // Simulate how components use a hook to pass the isReportArchived parameter
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));

        await waitForBatchedUpdatesWithAct();

        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT);
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
        } as unknown as Transaction;

        // Simulate how components use a hook to pass the isReportArchived parameter
        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.SUBMIT);
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

        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
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
            } as unknown as Transaction;

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
            await waitForBatchedUpdatesWithAct();
            expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE);
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

            expect(getReportPreviewAction(VIOLATIONS, false, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
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

            expect(getReportPreviewAction(VIOLATIONS, false, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
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
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.APPROVE);
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
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
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
        expect(getReportPreviewAction(VIOLATIONS, false, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
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
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction], invoiceReceiverPolicy)).toBe(
            CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY,
        );
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
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction], invoiceReceiverPolicy)).toBe(
            CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW,
        );
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
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction], invoiceReceiverPolicy)).toBe(
            CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY,
        );
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
        expect(getReportPreviewAction(VIOLATIONS, isChatReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction], undefined)).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
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
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(
            CONST.REPORT.REPORT_PREVIEW_ACTIONS.EXPORT_TO_ACCOUNTING,
        );
    });

    it('canReview should return true for reports where there are violations, user is submitter or approver and Workflows are enabled', async () => {
        (ReportUtils.hasAnyViolations as jest.Mock).mockReturnValue(true);
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            statusNum: 0,
            stateNum: 0,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const REPORT_VIOLATION = {
            FIELD_REQUIRED: 'fieldRequired',
        } as unknown as ReportViolations;
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${REPORT_ID}`, REPORT_VIOLATION);

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
            {
                name: CONST.VIOLATIONS.OVER_LIMIT,
            } as TransactionViolation,
        ]);
        const violations: OnyxCollection<TransactionViolation[]> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                {
                    name: CONST.VIOLATIONS.OVER_LIMIT,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                } as TransactionViolation,
            ],
        };

        const transaction = {
            transactionID: `${TRANSACTION_ID}`,
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();
        expect(getReportPreviewAction(violations, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW);
    });

    it('canReview should return true for reports with RTER violations regardless of workspace workflow configuration', async () => {
        (ReportUtils.hasAnyViolations as jest.Mock).mockReturnValue(true);
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            statusNum: 0,
            stateNum: 0,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const REPORT_VIOLATION = {
            FIELD_REQUIRED: 'fieldRequired',
        } as unknown as ReportViolations;
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${REPORT_ID}`, REPORT_VIOLATION);

        const violations: OnyxCollection<TransactionViolation[]> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                {
                    name: CONST.VIOLATIONS.RTER,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                    data: {
                        pendingPattern: true,
                        rterType: CONST.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
                    },
                } as TransactionViolation,
            ],
        };

        const transaction = {
            transactionID: `${TRANSACTION_ID}`,
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(getReportPreviewAction(violations, false, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW);
    });

    it('canReview should return true when strict policy rules are enabled and report has violations', async () => {
        const hasAnyViolationsMock = ReportUtils.hasAnyViolations as jest.Mock;
        hasAnyViolationsMock.mockReturnValue(true);

        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            statusNum: 0,
            stateNum: 0,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const violations: OnyxCollection<TransactionViolation[]> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                } as TransactionViolation,
            ],
        };

        const transaction = {
            transactionID: `${TRANSACTION_ID}`,
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        await waitForBatchedUpdatesWithAct();

        // When strict policy rules are enabled, REVIEW should be shown instead of SUBMIT
        expect(getReportPreviewAction(violations, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction], undefined, false, false, false, true)).toBe(
            CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW,
        );
    });

    it('canView should return true for reports in which we are waiting for user to add a bank account', async () => {
        const report = {
            ...createRandomReport(REPORT_ID, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            isWaitingOnBankAccount: true,
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
        expect(getReportPreviewAction(VIOLATIONS, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });

    it('canReview should return false for submitters when RECEIPT_NOT_SMART_SCANNED violation exists but is hidden from submitter', async () => {
        (ReportUtils.hasAnyViolations as jest.Mock).mockReturnValue(true);
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            statusNum: 0,
            stateNum: 0,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Create a RECEIPT_NOT_SMART_SCANNED violation that should be hidden from submitter
        const violations: OnyxCollection<TransactionViolation[]> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                {
                    name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                } as TransactionViolation,
            ],
        };

        const transaction = {
            transactionID: `${TRANSACTION_ID}`,
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        // Should return VIEW instead of REVIEW because the violation is hidden from submitter
        expect(getReportPreviewAction(violations, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });

    it('canReview should return true when report has mix of visible and hidden violations but at least one is visible', async () => {
        (ReportUtils.hasAnyViolations as jest.Mock).mockReturnValue(true);
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            statusNum: 0,
            stateNum: 0,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Mix of hidden and visible violations
        const violations: OnyxCollection<TransactionViolation[]> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                {
                    name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                } as TransactionViolation,
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                } as TransactionViolation,
            ],
        };

        const transaction = {
            transactionID: `${TRANSACTION_ID}`,
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        // Should return REVIEW because at least one violation (MISSING_CATEGORY) is visible
        expect(getReportPreviewAction(violations, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.REVIEW);
    });

    it('canReview should return false when report has no visible violations for current user role', async () => {
        (ReportUtils.hasAnyViolations as jest.Mock).mockReturnValue(true);
        const report: Report = {
            ...createRandomReport(REPORT_ID, undefined),
            statusNum: 0,
            stateNum: 0,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            isWaitingOnBankAccount: false,
        };

        const policy = createRandomPolicy(0);
        policy.areWorkflowsEnabled = true;
        policy.type = CONST.POLICY.TYPE.CORPORATE;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // All violations hidden from submitter
        const violations: OnyxCollection<TransactionViolation[]> = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                {
                    name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                    type: CONST.VIOLATION_TYPES.NOTICE,
                } as TransactionViolation,
                {
                    name: CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED,
                    type: CONST.VIOLATION_TYPES.WARNING,
                } as TransactionViolation,
            ],
        };

        const transaction = {
            transactionID: `${TRANSACTION_ID}`,
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.parentReportID));
        expect(getReportPreviewAction(violations, isReportArchived.current, CURRENT_USER_EMAIL, report, policy, [transaction])).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.VIEW);
    });
});
