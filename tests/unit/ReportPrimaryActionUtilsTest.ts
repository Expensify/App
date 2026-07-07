import {renderHook} from '@testing-library/react-native';

import useReportIsArchived from '@hooks/useReportIsArchived';

import {getValidConnectedIntegration, isPreferredExporter} from '@libs/PolicyUtils';
import type * as PolicyUtils from '@libs/PolicyUtils';
import {
    getReportPrimaryAction,
    getTransactionThreadPrimaryAction,
    isApproveAction,
    isExportAction,
    isMarkAsResolvedAction,
    isPrimaryMarkAsResolvedAction,
    isReviewDuplicatesAction,
} from '@libs/ReportPrimaryActionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import type {InvoiceTestData} from '../data/Invoice';

import {chatReportR14932 as chatReport} from '../../__mocks__/reportData/reports';
import * as InvoiceData from '../data/Invoice';
import createMock from '../utils/createMock';

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

const REPORT_ID = '1';
const CHAT_REPORT_ID = '2';
const POLICY_ID = '3';
const INVOICE_SENDER_ACCOUNT_ID = 4;

// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPolicyAdmin: jest.fn().mockImplementation((policy?: Policy) => policy?.role === 'admin'),
    getValidConnectedIntegration: jest.fn(),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isGroupPolicy: jest.fn().mockReturnValue(true),
}));

describe('getPrimaryAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('should return empty string for expense report with no transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [],
                violations: {},
                bankAccountList: {},
                policy: createMock<Policy>({}),
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should return SUBMIT for expense report with manual submit', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });

    it('should return SUBMIT while a retract update is pending', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            pendingFields: {
                hasReportBeenRetracted: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });

    it('should return SUBMIT while only nextStep is pending', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            pendingFields: {
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });

    it('should return SUBMIT for open report in instant submit policy with no approvers', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN, // Report is OPEN
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = {
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL, // Submit & Close
            autoReporting: true,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT, // Instant submit
        };

        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });
    it('should return SUBMIT option for zero amount transaction', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            amount: 0,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });
    it('should return SUBMIT option for admin with only pending transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });

    it('should return Approve for report being processed', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.APPROVE);
    });

    it('should return empty for report being processed but transactions are scanning', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            comment: {
                hold: 'Hold',
            },
            receipt: {
                state: CONST.IOU.RECEIPT_STATE.SCANNING,
            },
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should return empty for report being processed but transactions are pending', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should return true from isApproveAction for DEW policy report without pending approval', async () => {
        // Given a submitted expense report on a DEW policy without any pending approval action
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = createMock<Policy>({
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        });
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        // When checking if approve action is available
        // Then it should return true because DEW approval is not in progress
        expect(isApproveAction(report, [transaction], CURRENT_USER_ACCOUNT_ID, {}, policy)).toBe(true);
    });

    it('should return false from isApproveAction when submitter views their own report on a Submit workspace', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = createMock<Policy>({
            type: CONST.POLICY.TYPE.SUBMIT,
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        });
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        expect(isApproveAction(report, [transaction], CURRENT_USER_ACCOUNT_ID, {}, policy)).toBe(false);
    });

    it('should return true from isApproveAction when approver views a report on a Submit workspace', async () => {
        const approverAccountID = CURRENT_USER_ACCOUNT_ID + 1;
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: approverAccountID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = createMock<Policy>({
            type: CONST.POLICY.TYPE.SUBMIT,
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
        });
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        expect(isApproveAction(report, [transaction], approverAccountID, {}, policy)).toBe(true);
    });

    it('should return false from isApproveAction for DEW policy report with pending approval', async () => {
        // Given a submitted expense report on a DEW policy with a pending approval action
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = createMock<Policy>({
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        });
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        // When checking if approve action is available while DEW approval is pending
        // Then it should return false because DEW is already processing an approval
        expect(isApproveAction(report, [transaction], CURRENT_USER_ACCOUNT_ID, {pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE}, policy)).toBe(false);
    });

    it('should return PAY for submitted invoice report  if paid as personal', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 7,
        });
        const parentReport = createMock<Report>({
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: CURRENT_USER_ACCOUNT_ID,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const policy = createMock<Policy>({});
        const invoiceReceiverPolicy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
        });
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy,
                invoiceReceiverPolicy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should not return PAY for zero value invoice report if paid as personal', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 0,
        });
        const parentReport = createMock<Report>({
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: CURRENT_USER_ACCOUNT_ID,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const policy = createMock<Policy>({});
        const invoiceReceiverPolicy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
        });
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy,
                invoiceReceiverPolicy,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should return PAY for expense report with payments enabled', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: -300,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should return PAY for non-reimburser payments admin in manual reimbursement mode when owner is payer', async () => {
        const ownerEmail = 'owner@manual-test.com';
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            policyID: POLICY_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID + 10,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            total: -300,
            isWaitingOnBankAccount: false,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.CORPORATE,
            role: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
            owner: ownerEmail,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            reimburser: ownerEmail,
            employeeList: {
                [CURRENT_USER_EMAIL]: {
                    role: CONST.POLICY.ROLE.PAYMENTS_ADMIN,
                },
                [ownerEmail]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                },
            },
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: ownerEmail,
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should not return PAY for an expense report when every expense is held', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: -300,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            comment: {
                hold: 'Hold',
            },
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should not return PAY for expense report with only non-reimbursable transactions when total is 0', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: 0,
            nonReimbursableTotal: 0,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
            reimbursable: false,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should return EXPORT TO ACCOUNTING for finished reports', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            connections: {
                intacct: {
                    config: {
                        export: {
                            exporter: CURRENT_USER_EMAIL,
                        },
                    },
                },
            },
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        (getValidConnectedIntegration as jest.Mock).mockReturnValue('netsuite');

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    });

    it('should return EXPORT TO ACCOUNTING for admin who is not the preferred exporter', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            connections: {
                intacct: {
                    config: {
                        export: {
                            exporter: 'someone.else@mail.com',
                        },
                    },
                },
            },
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        (getValidConnectedIntegration as jest.Mock).mockReturnValue('intacct');

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    });

    it('should not return EXPORT TO ACCOUNTING for invoice reports', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            connections: {
                intacct: {
                    config: {
                        export: {
                            exporter: CURRENT_USER_EMAIL,
                        },
                    },
                },
            },
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    });

    it('should not return EXPORT TO ACCOUNTING for reports marked manually as exported', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            connections: {
                intacct: {
                    config: {
                        export: {
                            exporter: CURRENT_USER_EMAIL,
                        },
                    },
                },
            },
        };
        const reportActions = createMock<ReportAction[]>([
            {actionName: CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION, reportActionID: '1', created: '2025-01-01', originalMessage: {markedManually: true}},
        ]);

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                reportNameValuePairs: {},
                reportActions,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should return REMOVE HOLD for an approver who held the expense', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const HOLD_ACTION_ID = 'HOLD_ACTION_ID';
        const REPORT_ACTION_ID = 'REPORT_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const CHILD_REPORT_ID = 'CHILD_REPORT_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            comment: {
                hold: HOLD_ACTION_ID,
            },
        });

        const policy = createMock<Policy>({
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });

        const reportAction = createMock<ReportAction>({
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportActionID: REPORT_ACTION_ID,
            actorAccountID: 2, // The iou was created by a member
            childReportID: CHILD_REPORT_ID,
            message: [
                {
                    html: 'html',
                },
            ],
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: TRANSACTION_ID,
            },
        });

        const holdAction = {
            reportActionID: HOLD_ACTION_ID,
            reportID: CHILD_REPORT_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: reportAction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {[HOLD_ACTION_ID]: holdAction});

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD);
    });

    it('should return REMOVE HOLD for reports with transactions on hold', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const HOLD_ACTION_ID = 'HOLD_ACTION_ID';
        const REPORT_ACTION_ID = 'REPORT_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const CHILD_REPORT_ID = 'CHILD_REPORT_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            comment: {
                hold: HOLD_ACTION_ID,
            },
        });

        const reportAction = createMock<ReportAction>({
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportActionID: REPORT_ACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
            childReportID: CHILD_REPORT_ID,
            message: [
                {
                    html: 'html',
                },
            ],
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: TRANSACTION_ID,
            },
        });

        const holdAction = {
            reportActionID: HOLD_ACTION_ID,
            reportID: CHILD_REPORT_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: reportAction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {[HOLD_ACTION_ID]: holdAction});

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD);
    });

    it('should return REMOVE HOLD over APPROVE when all expenses are held and the manager can unhold', async () => {
        const MEMBER_ACCOUNT_ID = 2;
        const HOLD_ACTION_ID = 'HOLD_ACTION_ID';
        const REPORT_ACTION_ID = 'REPORT_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const CHILD_REPORT_ID = 'CHILD_REPORT_ID';

        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: MEMBER_ACCOUNT_ID,
            managerID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = createMock<Policy>({
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        });

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: `${REPORT_ID}`,
            comment: {
                hold: HOLD_ACTION_ID,
            },
        });

        const reportAction = createMock<ReportAction>({
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportActionID: REPORT_ACTION_ID,
            actorAccountID: MEMBER_ACCOUNT_ID,
            childReportID: CHILD_REPORT_ID,
            childType: CONST.REPORT.TYPE.CHAT,
            message: [
                {
                    html: 'html',
                },
            ],
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: TRANSACTION_ID,
            },
        });

        // The member created the hold, not the approver, so isRemoveHoldAction is false and the result depends on the all-held redirect
        const holdAction = {
            reportActionID: HOLD_ACTION_ID,
            reportID: CHILD_REPORT_ID,
            actorAccountID: MEMBER_ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: reportAction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {[HOLD_ACTION_ID]: holdAction});

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy,
                reportActions: [reportAction],
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD);
    });

    it('should not return REMOVE HOLD for closed reports with transactions on hold', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const HOLD_ACTION_ID = 'HOLD_ACTION_ID';
        const REPORT_ACTION_ID = 'REPORT_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const CHILD_REPORT_ID = 'CHILD_REPORT_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            comment: {
                hold: HOLD_ACTION_ID,
            },
        });

        const reportAction = createMock<ReportAction>({
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportActionID: REPORT_ACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
            childReportID: CHILD_REPORT_ID,
            message: [
                {
                    html: 'html',
                },
            ],
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                IOUTransactionID: TRANSACTION_ID,
            },
        });

        const holdAction = {
            reportActionID: HOLD_ACTION_ID,
            reportID: CHILD_REPORT_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: reportAction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {[HOLD_ACTION_ID]: holdAction});

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD);
    });

    it('should return MARK AS CASH if has all RTER violations', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: -300,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.RTER,
            data: {
                pendingPattern: true,
                rterType: CONST.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
            },
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('should return MARK AS CASH for broken connection', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('should not return MARK AS CASH for broken connection on approved report', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            type: CONST.REPORT.TYPE.EXPENSE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('should not return MARK AS CASH for broken connection on settled (reimbursed) report', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            type: CONST.REPORT.TYPE.EXPENSE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('should not return SUBMIT for expense report with smartscan failed violation', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: `${REPORT_ID}`,
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
            type: CONST.VIOLATION_TYPES.WARNING,
            showInReview: true,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should not return SUBMIT when smartscan failed with missing fields before violation is written', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: `${REPORT_ID}`,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
            merchant: '',
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should return an empty string for invoice report when the chat report is archived', async () => {
        // Given the invoice data
        const {policy, convertedInvoiceChat: invoiceChatReport}: InvoiceTestData = InvoiceData;
        const report = createMock<Report>({
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            chatReportID: invoiceChatReport.chatReportID,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`, {
            private_isArchived: new Date().toString(),
        });
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        // Simulate how components determine if a chat report is archived by using this hook
        const {result: isChatReportArchived} = renderHook(() => useReportIsArchived(report?.chatReportID));

        // Then the getReportPrimaryAction should return the empty string
        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport: invoiceChatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                policy: policy as Policy,
                isChatReportArchived: isChatReportArchived.current,
            }),
        ).toBe('');
    });
});

describe('isReviewDuplicatesAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('should return true when report approver has duplicated transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: 999,
            managerID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        const violation = {
            [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                createMock<TransactionViolation>({
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                }),
            ],
        };

        expect(isReviewDuplicatesAction(report, undefined, [transaction], CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, undefined, violation)).toBe(true);
    });

    it('should return false when report approver has no duplicated transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: 999,
            managerID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);

        expect(isReviewDuplicatesAction(report, undefined, [transaction], CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, undefined, undefined)).toBe(false);
    });

    it('should return false when current user is neither the report submitter nor approver', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: 999,
            managerID: 888,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);

        expect(
            isReviewDuplicatesAction(report, undefined, [transaction], CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, undefined, {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [
                    createMock<TransactionViolation>({
                        name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    }),
                ],
            }),
        ).toBe(false);
    });
});

describe('getTransactionThreadPrimaryAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('should return REMOVE HOLD for transaction thread being on hold', async () => {
        const policy = {};
        const HOLD_ACTION_ID = 'HOLD_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const CHILD_REPORT_ID = 'CHILD_REPORT_ID';
        const report = createMock<Report>({
            reportID: CHILD_REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
        });

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            comment: {
                hold: HOLD_ACTION_ID,
            },
        });

        const holdAction = {
            reportActionID: HOLD_ACTION_ID,
            reportID: CHILD_REPORT_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {[HOLD_ACTION_ID]: holdAction});

        expect(getTransactionThreadPrimaryAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, report, createMock<Report>({}), undefined, transaction, [], policy as Policy, false)).toBe(
            CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD,
        );
    });

    it('should return REVIEW DUPLICATES when there are duplicated transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const REPORT_ACTION_ID = 'REPORT_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            comment: {
                hold: REPORT_ACTION_ID,
            },
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        });

        expect(
            getTransactionThreadPrimaryAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, createMock<Report>({}), report, undefined, transaction, [violation], policy as Policy, false),
        ).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES);
    });

    it('should return MARK AS CASH if has all RTER violations', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.RTER,
            data: {
                pendingPattern: true,
                rterType: CONST.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
            },
        });

        expect(
            getTransactionThreadPrimaryAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, createMock<Report>({}), report, undefined, transaction, [violation], policy as Policy, false),
        ).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('should return MARK AS CASH for broken connection', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        });

        expect(
            getTransactionThreadPrimaryAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, createMock<Report>({}), report, undefined, transaction, [violation], policy as Policy, false),
        ).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('Should return empty string when we are waiting for user to add a bank account', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            isWaitingOnBankAccount: true,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            connections: {
                intacct: {
                    config: {
                        export: {
                            exporter: CURRENT_USER_EMAIL,
                        },
                    },
                },
            },
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });

        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: policy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    it('should return PAY for submitted invoice report if paid as business and the payer is the policy admin', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 7,
        });
        const parentReport = createMock<Report>({
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: POLICY_ID,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const invoiceReceiverPolicy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });
        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: createMock<Policy>({}),
                invoiceReceiverPolicy: invoiceReceiverPolicy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should not return PAY for zero value invoice report if paid as business and the payer is the policy admin', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 0,
        });
        const parentReport = createMock<Report>({
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: POLICY_ID,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const invoiceReceiverPolicy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const transaction = createMock<Transaction>({
            reportID: `${REPORT_ID}`,
        });
        expect(
            getReportPrimaryAction({
                currentUserLogin: CURRENT_USER_EMAIL,
                currentUserAccountID: CURRENT_USER_ACCOUNT_ID,
                report,
                ownerLogin: '',
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                bankAccountList: {},
                policy: createMock<Policy>({}),
                invoiceReceiverPolicy: invoiceReceiverPolicy as Policy,
                isChatReportArchived: false,
            }),
        ).toBe('');
    });

    describe('isMarkAsResolvedAction', () => {
        const submitterAccountID = 1;
        const otherUserAccountID = 3;

        beforeEach(async () => {
            jest.clearAllMocks();
            Onyx.clear();
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: submitterAccountID});
        });

        it('should return true for submitter with pending auto rejected expense violation', () => {
            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: submitterAccountID,
            });

            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                },
            ];

            const result = isMarkAsResolvedAction(report, violations);
            expect(result).toBe(true);
        });

        it('should return true for admin with pending auto rejected expense violation', () => {
            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.ADMIN,
            });

            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: otherUserAccountID, // Different from current user
            });

            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                },
            ];

            const result = isMarkAsResolvedAction(report, violations, policy);
            expect(result).toBe(true);
        });

        it('should return false for non-submitter non-admin user', () => {
            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.USER,
            });

            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: otherUserAccountID, // Different from current user
            });

            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                    type: CONST.VIOLATION_TYPES.WARNING,
                },
            ];

            const result = isMarkAsResolvedAction(report, violations, policy);
            expect(result).toBe(false);
        });

        it('should return false when no violations are present', () => {
            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: submitterAccountID,
            });

            const violations: TransactionViolation[] = [];

            const result = isMarkAsResolvedAction(report, violations);
            expect(result).toBe(false);
        });

        it('should return false when no auto rejected expense violation is present', () => {
            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: submitterAccountID,
            });

            const violations: TransactionViolation[] = [
                {
                    name: CONST.VIOLATIONS.MISSING_CATEGORY,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ];

            const result = isMarkAsResolvedAction(report, violations);
            expect(result).toBe(false);
        });

        it('should return false when report or violations are undefined', () => {
            const result1 = isMarkAsResolvedAction(undefined, []);
            const result2 = isMarkAsResolvedAction(createMock<Report>({}), undefined);

            expect(result1).toBe(false);
            expect(result2).toBe(false);
        });
    });

    describe('isPrimaryMarkAsResolvedAction', () => {
        const submitterAccountID = 1;
        const otherUserAccountID = 3;
        const submitterEmail = 'submitter@example.com';
        beforeEach(async () => {
            jest.clearAllMocks();
            Onyx.clear();
            await Onyx.merge(ONYXKEYS.SESSION, {accountID: submitterAccountID, email: submitterEmail});
        });

        it('should return true if isMarkAsResolvedAction returns true and there is exactly one transaction', () => {
            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.ADMIN,
            });

            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: submitterAccountID,
                type: CONST.REPORT.TYPE.EXPENSE,
            });

            const violations: OnyxCollection<TransactionViolation[]> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`]: [
                    {
                        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                        type: CONST.VIOLATION_TYPES.WARNING,
                    },
                ],
            };

            const reportTransactions = [
                createMock<Transaction>({
                    transactionID: '1',
                }),
            ];

            const result = isPrimaryMarkAsResolvedAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, report, reportTransactions, violations, policy);
            expect(result).toBe(true);
        });

        it('should return false if there are multiple transactions', () => {
            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.ADMIN,
            });

            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: submitterAccountID,
                type: CONST.REPORT.TYPE.EXPENSE,
            });

            const violations: OnyxCollection<TransactionViolation[]> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`]: [
                    {
                        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                        type: CONST.VIOLATION_TYPES.WARNING,
                    },
                ],
            };

            const reportTransactions = [
                createMock<Transaction>({
                    transactionID: '1',
                }),
                createMock<Transaction>({
                    transactionID: '2',
                }),
            ];

            const result = isPrimaryMarkAsResolvedAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, report, reportTransactions, violations, policy);
            expect(result).toBe(false);
        });

        it('should return false if isMarkAsResolvedAction returns false', () => {
            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.USER,
            });

            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: otherUserAccountID,
                type: CONST.REPORT.TYPE.EXPENSE,
            });

            const violations: OnyxCollection<TransactionViolation[]> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`]: [
                    {
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                    },
                ],
            };

            const reportTransactions = [
                createMock<Transaction>({
                    transactionID: '1',
                }),
            ];

            const result = isPrimaryMarkAsResolvedAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, report, reportTransactions, violations, policy);
            expect(result).toBe(false);
        });

        it('should return false if report is not an expense report', () => {
            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.ADMIN,
            });

            const report = createMock<Report>({
                reportID: REPORT_ID,
                ownerAccountID: submitterAccountID,
                type: CONST.REPORT.TYPE.INVOICE,
            });

            const violations: OnyxCollection<TransactionViolation[]> = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}1`]: [
                    {
                        name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
                        type: CONST.VIOLATION_TYPES.WARNING,
                    },
                ],
            };

            const reportTransactions = [
                createMock<Transaction>({
                    transactionID: '1',
                }),
            ];

            const result = isPrimaryMarkAsResolvedAction(CURRENT_USER_EMAIL, CURRENT_USER_ACCOUNT_ID, report, reportTransactions, violations, policy);
            expect(result).toBe(false);
        });
    });
});

describe('isExportAction and isPreferredExporter for todos filtering', () => {
    it('isExportAction returns true for admin who is not the preferred exporter', () => {
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    config: {
                        autoSync: {enabled: false},
                        export: {exporter: 'other.exporter@mail.com'},
                    },
                },
            },
        });

        const report = createMock<Report>({
            reportID: '1',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: false,
        });

        (getValidConnectedIntegration as jest.Mock).mockReturnValue(CONST.POLICY.CONNECTIONS.NAME.QBO);

        expect(isExportAction(report, CURRENT_USER_EMAIL, policy)).toBe(true);
    });

    it('isPreferredExporter returns false when user is not the configured exporter', () => {
        const policy = createMock<Policy>({
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    config: {
                        export: {exporter: 'other.exporter@mail.com'},
                    },
                },
            },
        });

        expect(isPreferredExporter(policy, CURRENT_USER_EMAIL)).toBe(false);
    });

    it('isPreferredExporter returns true when user is the configured exporter', () => {
        const policy = createMock<Policy>({
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
                    config: {
                        export: {exporter: CURRENT_USER_EMAIL},
                    },
                },
            },
        });

        expect(isPreferredExporter(policy, CURRENT_USER_EMAIL)).toBe(true);
    });
});
