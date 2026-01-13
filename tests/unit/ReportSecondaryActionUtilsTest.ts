import Onyx from 'react-native-onyx';
// eslint-disable-next-line no-restricted-syntax
import type * as PolicyUtils from '@libs/PolicyUtils';
import {getSecondaryExportReportActions, getSecondaryReportActions, getSecondaryTransactionThreadActions, isMergeActionForSelectedTransactions} from '@libs/ReportSecondaryActionUtils';
import CONST from '@src/CONST';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';
import {actionR14932, originalMessageR14932} from '../../__mocks__/reportData/actions';
import {chatReportR14932 as chatReport} from '../../__mocks__/reportData/reports';

const EMPLOYEE_ACCOUNT_ID = 1;
const EMPLOYEE_EMAIL = 'employee@mail.com';
const MANAGER_ACCOUNT_ID = 2;
const MANAGER_EMAIL = 'manager@mail.com';
const APPROVER_ACCOUNT_ID = 3;
const APPROVER_EMAIL = 'approver@mail.com';
const ADMIN_ACCOUNT_ID = 4;
const ADMIN_EMAIL = 'admin@mail.com';

const SESSION = {
    email: EMPLOYEE_EMAIL,
    accountID: EMPLOYEE_ACCOUNT_ID,
};

const PERSONAL_DETAILS = {
    accountID: EMPLOYEE_ACCOUNT_ID,
    login: EMPLOYEE_EMAIL,
};

const REPORT_ID = 1;
const POLICY_ID = 'POLICY_ID';
const OLD_POLICY_ID = 'OLD_POLICY_ID';

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPreferredExporter: jest.fn().mockReturnValue(true),
    hasAccountingConnections: jest.fn().mockReturnValue(true),
    isPolicyAdmin: jest.fn().mockReturnValue(true),
    getValidConnectedIntegration: jest.fn().mockReturnValue('netsuite'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
}));

describe('getSecondaryAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[EMPLOYEE_ACCOUNT_ID]: PERSONAL_DETAILS, [APPROVER_ACCOUNT_ID]: {accountID: APPROVER_ACCOUNT_ID, login: APPROVER_EMAIL}});
    });

    it('should always return default options', () => {
        const report = {} as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = [CONST.REPORT.SECONDARY_ACTIONS.EXPORT, CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF, CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS];
        expect(
            getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport,
                reportTransactions: [],
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
                policy,
            }),
        ).toEqual(result);
    });

    it('includes ADD_EXPENSE option for empty report', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
        } as unknown as Transaction;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE)).toBe(true);
    });

    it('includes SUBMIT option', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('includes SUBMIT option for admin', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.CORPORATE,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('includes SUBMIT option when report total is 0 but there are transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 0,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const transaction1 = {
            transactionID: 'TRANSACTION_ID_1',
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        const transaction2 = {
            transactionID: 'TRANSACTION_ID_2',
            amount: -10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('should not include SUBMIT option when report total is 0 and there are no transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 0,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('include SUBMIT option if the report is retracted', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            hasReportBeenReopened: true,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MANUAL,
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.USER,
            type: CONST.POLICY.TYPE.CORPORATE,
        } as unknown as Policy;

        const transaction = {
            transactionID: 'TRANSACTION_ID',
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
            comment: {
                hold: 'hold',
            },
        } as unknown as Transaction;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue('12345');
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(true);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('should not include SUBMIT option for the user who is not submitter/admin/manager', async () => {
        const report: Report = {
            reportID: '1',
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
            ownerAccountID: APPROVER_ACCOUNT_ID,
            managerID: 0,
        };
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.AUDITOR,
            type: CONST.POLICY.TYPE.CORPORATE,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('should not include SUBMIT option for admin with only pending transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const transaction = {
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('should not include SUBMIT option when transaction has smartscan failed violation', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = {
            transactionID: TRANSACTION_ID,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        const violation = {
            name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
            type: CONST.VIOLATION_TYPES.WARNING,
            showInReview: true,
        } as TransactionViolation;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('includes APPROVE option for approver and report with duplicates', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = {
            transactionID: TRANSACTION_ID,
        } as unknown as Transaction;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);

        const violation = {
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        } as TransactionViolation;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for approver and report with only pending transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = {
            transactionID: TRANSACTION_ID,
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('includes APPROVE option for report with RTER violations when it is submitted', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
        } as unknown as Transaction;

        const violation = {
            name: CONST.VIOLATIONS.RTER,
            data: {
                pendingPattern: true,
                rterType: CONST.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
            },
        } as unknown as TransactionViolation;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for report with RTER violations when it is not submitted', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
        } as unknown as Transaction;

        const violation = {
            name: CONST.VIOLATIONS.RTER,
            data: {
                pendingPattern: true,
                rterType: CONST.RTER_VIOLATION_TYPES.SEVEN_DAY_HOLD,
            },
        } as unknown as TransactionViolation;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('includes APPROVE option for admin with report having broken connection when it is submitted', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {role: CONST.POLICY.ROLE.ADMIN, autoReporting: true, autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT} as unknown as Policy;
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
        } as unknown as Transaction;

        const violation = {
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        } as unknown as TransactionViolation;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for admin with report having broken connection that is not submitted', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {role: CONST.POLICY.ROLE.ADMIN} as unknown as Policy;
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
        } as unknown as Transaction;

        const violation = {
            name: CONST.VIOLATIONS.RTER,
            data: {
                rterType: CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION,
            },
        } as unknown as TransactionViolation;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('does not include APPROVE option for report with transactions that are being scanned', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = {
            transactionID: TRANSACTION_ID,
            receipt: {
                state: CONST.IOU.RECEIPT_STATE.SCANNING,
            },
        } as unknown as Transaction;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('includes UNAPPROVE option', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {approver: EMPLOYEE_EMAIL} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('includes UNAPPROVE option for admin on finally approved report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: MANAGER_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: APPROVER_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('includes UNAPPROVE option for manager on finally approved report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: APPROVER_EMAIL,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('does not include UNAPPROVE option for non-admin, non-manager on finally approved report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: MANAGER_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: APPROVER_EMAIL,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('does not include UNAPPROVE option for non-approved report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('does not include UNAPPROVE option for settled report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('does not include UNAPPROVE option for payment processing report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: EMPLOYEE_ACCOUNT_ID,
            isWaitingOnBankAccount: true,
        } as unknown as Report;
        const policy = {
            approver: EMPLOYEE_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('includes CANCEL_PAYMENT option for report paid elsewhere', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for report before nacha cutoff', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.BILLING,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: true,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = {
            actionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            },
            created: tomorrow.toISOString(),
        } as unknown as ReportAction;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [
                {
                    transactionID: TRANSACTION_ID,
                } as unknown as Transaction,
            ],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for bank payment in BILLING state', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.BILLING,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = {
            actionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            created: tomorrow.toISOString(),
        } as unknown as ReportAction;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [
                {
                    transactionID: TRANSACTION_ID,
                } as unknown as Transaction,
            ],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for bank payment in APPROVED + REIMBURSED state', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = {
            actionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            created: tomorrow.toISOString(),
        } as unknown as ReportAction;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [
                {
                    transactionID: TRANSACTION_ID,
                } as unknown as Transaction,
            ],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for auto-reimbursed payment', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.AUTOREIMBURSED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        } as unknown as Policy;
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = {
            actionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            created: tomorrow.toISOString(),
        } as unknown as ReportAction;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [
                {
                    transactionID: TRANSACTION_ID,
                } as unknown as Transaction,
            ],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes HOLD option ', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;

        const transaction = {
            transactionID: 'TRANSACTION_ID_R14932',
            comment: {},
        } as unknown as Transaction;
        const policy = {} as unknown as Policy;

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: true, canUnholdRequest: true});
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValueOnce(originalMessageR14932.IOUTransactionID);
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [actionR14932],
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });

    it('does not include CHANGE_WORKSPACE option for submitted IOU report and manager being the payer of the new policy', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: MANAGER_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;
        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };
        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            policies,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(false);
    });

    it('includes CHANGE_WORKSPACE option for open expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        } as unknown as Report;

        const personalDetails = {
            [ADMIN_ACCOUNT_ID]: {login: ADMIN_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            policies,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for submitter, submitted report without approvals', async () => {
        const oldPolicy = {
            id: OLD_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: MANAGER_EMAIL,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        const newPolicy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: oldPolicy.id,
        } as unknown as Report;

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL, accountID: MANAGER_ACCOUNT_ID},
        };

        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`]: oldPolicy, [`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: newPolicy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`, oldPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, newPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy: oldPolicy,
            policies,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for approver', async () => {
        const oldPolicy = {
            id: OLD_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: APPROVER_EMAIL,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: oldPolicy.id,
        } as unknown as Report;

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [APPROVER_ACCOUNT_ID]: {login: APPROVER_EMAIL, accountID: APPROVER_ACCOUNT_ID},
        };

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: APPROVER_EMAIL,
            isPolicyExpenseChatEnabled: true,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy, [`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`]: oldPolicy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`, oldPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: APPROVER_EMAIL, accountID: APPROVER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            policies,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for admin', async () => {
        const oldPolicy = {
            id: OLD_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            policyID: oldPolicy.id,
        } as unknown as Report;

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [EMPLOYEE_EMAIL]: {login: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy, [`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`]: oldPolicy};

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [ADMIN_ACCOUNT_ID]: {login: ADMIN_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`, oldPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            policies,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes DELETE option for expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        } as unknown as Report;
        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [{} as Transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for invoice report submitter when total is zero', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            total: 0,
        } as unknown as Report;

        const policy = {
            role: CONST.POLICY.ROLE.USER,
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, {} as Transaction, undefined, {} as Transaction, policy);

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for owner of unreported transaction', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        } as unknown as Transaction;

        const reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                },
            },
        ] as unknown as ReportAction[];

        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for owner of single processing IOU transaction', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: REPORT_ID,
                },
            },
        ] as unknown as ReportAction[];

        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('does not include DELETE option for IOU report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const TRANSACTION_ID_2 = 'TRANSACTION_ID_2';

        const transaction1 = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const transaction2 = {
            transactionID: TRANSACTION_ID_2,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: REPORT_ID,
                },
            },
            {
                reportActionID: '2',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID_2,
                    IOUReportID: REPORT_ID,
                },
            },
        ] as unknown as ReportAction[];

        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('includes DELETE option for owner of single processing expense transaction which is not forwarded', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: POLICY_ID,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            employeeList: {
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: APPROVER_EMAIL,
                },
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for owner of processing expense report which is not forwarded', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: POLICY_ID,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const TRANSACTION_ID_2 = 'TRANSACTION_ID_2';

        const transaction1 = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const transaction2 = {
            transactionID: TRANSACTION_ID_2,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            employeeList: {
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: APPROVER_EMAIL,
                },
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('does not includes DELETE option for report that has been forwarded', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            policyID: POLICY_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: APPROVER_EMAIL,
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('does not include DELETE option for corporate liability card transaction', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            managedCard: true,
            comment: {
                liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT,
            },
        } as unknown as Transaction;

        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('does not include DELETE option for unreported card expense imported with deleting disabled', async () => {
        // Given the unreported card expense imported with deleting disabled
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            managedCard: true,
            comment: {
                liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT,
            },
        } as unknown as Transaction;

        const reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                },
            },
        ] as unknown as ReportAction[];

        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Then it should return false since the unreported card expense is imported with deleting disabled
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('include DELETE option for demo transaction', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {
                isDemoTransaction: true,
            },
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: APPROVER_EMAIL,
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes REMOVE HOLD option for admin if he is the holder and primary action is not REMOVE HOLD', () => {
        const report = {} as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;
        const reportTransactions = [
            {
                comment: {
                    hold: 'REPORT_ACTION_ID',
                },
            },
        ] as unknown as Transaction[];

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(originalMessageR14932.IOUTransactionID);
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions,
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result).toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    });

    it('does not include REMOVE HOLD option for closed reports with transactions on hold', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;
        const reportTransactions = [
            {
                comment: {
                    hold: 'REPORT_ACTION_ID',
                },
            },
        ] as unknown as Transaction[];

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(originalMessageR14932.IOUTransactionID);
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions,
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    });

    it('include DUPLICATE option for single-transaction expense report', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction1 = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: REPORT_ID,
                },
            },
        ] as unknown as ReportAction[];

        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction1],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE)).toBe(true);
    });

    it('does not include DUPLICATE option if there are no transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            violations: {},
            bankAccountList: {},
            originalTransaction: {} as Transaction,
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE)).toBe(false);
    });

    it('does not include DUPLICATE option for expense report with multiple transactions', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const TRANSACTION_ID_2 = 'TRANSACTION_ID_2';

        const transaction1 = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const transaction2 = {
            transactionID: TRANSACTION_ID_2,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const reportActions = [
            {
                reportActionID: '1',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: REPORT_ID,
                },
            },
            {
                reportActionID: '2',
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID_2,
                    IOUReportID: REPORT_ID,
                },
            },
        ] as unknown as ReportAction[];

        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE)).toBe(false);
    });

    it('does not include DUPLICATE option for card transaction', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            managedCard: true,
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: APPROVER_EMAIL,
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE)).toBe(false);
    });

    it('does not include DUPLICATE option for expenses from other users', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction1 = {
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        } as unknown as Transaction;

        const reportActions = [
            {
                reportActionID: '1',
                actorAccountID: APPROVER_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                    IOUReportID: REPORT_ID,
                },
            },
        ] as unknown as ReportAction[];

        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [transaction1],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE)).toBe(false);
    });
});

describe('getSecondaryExportReportActions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[EMPLOYEE_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('should always return default options', () => {
        const report = {} as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV];
        expect(getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy)).toEqual(result);
    });

    it('should include export templates when provided', () => {
        const report = {} as unknown as Report;
        const policy = {} as unknown as Policy;
        const exportTemplates = [
            {
                name: 'All Data - expense level',
                templateName: CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT,
                type: CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS,
                description: '',
                policyID: undefined,
            },
            {
                name: 'All Data - report level',
                templateName: CONST.REPORT.EXPORT_OPTIONS.REPORT_LEVEL_EXPORT,
                type: CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS,
                description: '',
                policyID: undefined,
            },
            {
                name: 'Custom Template',
                templateName: 'custom_template',
                type: CONST.EXPORT_TEMPLATE_TYPES.IN_APP,
                description: 'Custom description',
                policyID: 'POLICY_123',
            },
        ];

        const result = [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV, 'All Data - expense level', 'All Data - report level', 'Custom Template'];
        expect(getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy, exportTemplates)).toEqual(result);
    });

    it('does not include EXPORT option for invoice reports', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {},
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(false);
    });

    it('includes EXPORT option for expense report with payments enabled', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            id: POLICY_ID,
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(true);
    });

    it('includes EXPORT option and templates together', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        } as unknown as Policy;
        const exportTemplates = [
            {
                name: 'All Data - expense level',
                templateName: CONST.REPORT.EXPORT_OPTIONS.EXPENSE_LEVEL_EXPORT,
                type: CONST.EXPORT_TEMPLATE_TYPES.INTEGRATIONS,
                description: '',
                policyID: undefined,
            },
        ];

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy, exportTemplates);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(true);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV)).toBe(true);
        expect(result.includes('All Data - expense level')).toBe(true);
    });

    it('includes EXPORT option for expense report with payments disabled', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {autosync: {enabled: true}}}},
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for invoice report sender', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report preferred exporter', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: EMPLOYEE_EMAIL}, autoSync: {enabled: false}}}},
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report with payments enabled', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report with payments disabled', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {autosync: {enabled: true}}}},
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report preferred exporter', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: EMPLOYEE_EMAIL}, autoSync: {enabled: false}}}},
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report admin', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: ADMIN_EMAIL}, autoSync: {enabled: true}}}},
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes REMOVE HOLD option for admin if he is not the holder', () => {
        const report = {} as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;
        const reportTransactions = [
            {
                comment: {
                    hold: 'REPORT_ACTION_ID',
                },
            },
        ] as unknown as Transaction[];

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(originalMessageR14932.IOUTransactionID);
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions,
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
        });
        expect(result).toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    });
});

describe('getSecondaryTransactionThreadActions', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        Onyx.clear();
        await Onyx.merge(ONYXKEYS.SESSION, SESSION);
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[EMPLOYEE_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('should always return VIEW_DETAILS', () => {
        const report = {} as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS];
        expect(getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, {} as Transaction, undefined, {} as Transaction, policy)).toEqual(result);
    });

    it('includes HOLD option', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;

        const transaction = {
            comment: {},
        } as unknown as Transaction;

        const policy = {} as unknown as Policy;

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: true, canUnholdRequest: true});
        const result = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, transaction, actionR14932, {} as Transaction, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });

    it('includes REMOVE HOLD option for transaction thread report admin if he is not the holder', () => {
        const report = {} as unknown as Report;
        const transactionThreadReport = {} as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;
        const transaction = {
            comment: {
                hold: 'REPORT_ACTION_ID',
            },
        } as unknown as Transaction;

        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);
        const result = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, transaction, undefined, {} as Transaction, policy, transactionThreadReport);
        expect(result).toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);

        // Do not show if admin is the holder
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(true);
        const result2 = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, transaction, undefined, {} as Transaction, policy, transactionThreadReport);
        expect(result2).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    });

    it('includes DELETE option for expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        } as unknown as Report;

        const policy = {} as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, {} as Transaction, undefined, {} as Transaction, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('should not include CHANGE_WORKSPACE option for exported report', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: MANAGER_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;
        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };
        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;
        const reportActions = [
            {
                actionName: CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION,
                originalMessage: {markedManually: true},
            },
        ] as unknown as ReportAction[];
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            policies,
            reportActions,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(false);
    });

    it('includes the SPLIT option if the current user belongs to the workspace', async () => {
        const report = {
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;

        const transaction = {
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, transaction, actionR14932, {} as Transaction, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(true);
    });

    it('does not include the SPLIT option if the current user does not belong to the workspace', async () => {
        const report = {
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;

        const transaction = {
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, transaction, actionR14932, {} as Transaction, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
    });

    it('does not include the SPLIT option if the policy is not expense chat enabled', async () => {
        const report = {
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;

        const transaction = {
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: false,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(EMPLOYEE_EMAIL, report, transaction, actionR14932, {} as Transaction, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
    });

    describe('isMergeAction', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return true for transactions with negative amounts', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as unknown as Report;

            const transaction = {
                transactionID: 'TRANSACTION_ID',
                amount: -100,
                currency: 'USD',
            } as unknown as Transaction;

            const policy = {
                role: CONST.POLICY.ROLE.ADMIN,
            } as unknown as Policy;

            jest.spyOn(ReportUtils, 'getTransactionDetails').mockReturnValue({
                amount: -100,
                created: '2025-01-01',
                attendees: [],
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: '',
                category: '',
                reimbursable: true,
                billable: false,
                tag: '',
                transactionID: 'TRANSACTION_ID',
                originalAmount: 100,
                originalCurrency: 'USD',
                postedDate: '2025-01-01',
                cardID: 1,
                convertedAmount: -100,
            });

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport: undefined,
                reportTransactions: [transaction],
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
                policy,
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MERGE)).toBe(true);
        });

        it('should return true for transactions with positive amounts when eligible', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            } as unknown as Report;

            const transaction = {
                transactionID: 'TRANSACTION_ID',
                amount: 100,
                currency: 'USD',
            } as unknown as Transaction;

            const policy = {
                role: CONST.POLICY.ROLE.ADMIN,
            } as unknown as Policy;

            jest.spyOn(ReportUtils, 'getTransactionDetails').mockReturnValue({
                amount: 100,
                created: '2025-01-01',
                attendees: [],
                currency: 'USD',
                merchant: 'Test Merchant',
                comment: '',
                category: '',
                reimbursable: true,
                billable: false,
                tag: '',
                transactionID: 'TRANSACTION_ID',
                originalAmount: 100,
                originalCurrency: 'USD',
                postedDate: '2025-01-01',
                cardID: 1,
                convertedAmount: 100,
            });

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport: undefined,
                reportTransactions: [transaction],
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
                policy,
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MERGE)).toBe(true);
        });
    });

    describe('REPORT_LAYOUT action', () => {
        it('should not include REPORT_LAYOUT for non-expense reports', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.CHAT,
            } as unknown as Report;
            const transactions = [{transactionID: '1'} as unknown as Transaction, {transactionID: '2'} as unknown as Transaction];

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport,
                reportTransactions: transactions,
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT)).toBe(false);
        });

        it('should not include REPORT_LAYOUT for IOU reports', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.IOU,
            } as unknown as Report;
            const transactions = [{transactionID: '1'} as unknown as Transaction, {transactionID: '2'} as unknown as Transaction];

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport,
                reportTransactions: transactions,
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT)).toBe(false);
        });

        it('should not include REPORT_LAYOUT for expense reports with less than 2 transactions', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as unknown as Report;
            const transactions = [{transactionID: '1'} as unknown as Transaction];

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport,
                reportTransactions: transactions,
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT)).toBe(false);
        });

        it('should not include REPORT_LAYOUT for expense reports with no transactions', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as unknown as Report;

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport,
                reportTransactions: [],
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT)).toBe(false);
        });

        it('should include REPORT_LAYOUT for expense reports with 2 transactions', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as unknown as Report;
            const transactions = [{transactionID: '1'} as unknown as Transaction, {transactionID: '2'} as unknown as Transaction];

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport,
                reportTransactions: transactions,
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT)).toBe(true);
        });

        it('should include REPORT_LAYOUT for expense reports with more than 2 transactions', () => {
            const report = {
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
            } as unknown as Report;
            const transactions = [{transactionID: '1'} as unknown as Transaction, {transactionID: '2'} as unknown as Transaction, {transactionID: '3'} as unknown as Transaction];

            const result = getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                report,
                chatReport,
                reportTransactions: transactions,
                originalTransaction: {} as Transaction,
                violations: {},
                bankAccountList: {},
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.REPORT_LAYOUT)).toBe(true);
        });
    });

    describe('isMergeActionForSelectedTransactions', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return false when there are more than 2 transactions', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction, {transactionID: '2', amount: 200} as Transaction, {transactionID: '3', amount: 300} as Transaction];
            const reports = [{reportID: '1', type: CONST.REPORT.TYPE.EXPENSE} as Report];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should return false when there are more than 2 reports', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction];
            const reports = [
                {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE} as Report,
                {reportID: '2', type: CONST.REPORT.TYPE.EXPENSE} as Report,
                {reportID: '3', type: CONST.REPORT.TYPE.EXPENSE} as Report,
            ];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should return false when there are more than 2 policies', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction];
            const reports = [{reportID: '1', type: CONST.REPORT.TYPE.EXPENSE} as Report];
            const policies = [
                {id: 'policy1', role: CONST.POLICY.ROLE.ADMIN},
                {id: 'policy2', role: CONST.POLICY.ROLE.ADMIN},
                {id: 'policy3', role: CONST.POLICY.ROLE.ADMIN},
            ] as Policy[];

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should return false when a report is not eligible for merge', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction];
            const reports = [{reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.USER}] as Policy[];

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(false);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), false);
        });

        it('should return true for single transaction when report is eligible for merge', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction];
            const reports = [{reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(true);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), true);
        });

        it('should return true for two eligible transactions', () => {
            const transaction1 = {
                transactionID: '1',
                amount: 100,
                managedCard: false,
            } as Transaction;
            const transaction2 = {
                transactionID: '2',
                amount: 200,
                managedCard: false,
            } as Transaction;
            const transactions = [transaction1, transaction2];
            const reports = [
                {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report,
                {reportID: '2', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report,
            ];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(true);
        });

        it('should return false when transactions are not eligible for merge', () => {
            const transaction1 = {
                transactionID: '1',
                amount: 100,
                managedCard: true,
            } as Transaction;
            const transaction2 = {
                transactionID: '2',
                amount: 200,
                managedCard: true,
            } as Transaction;
            const transactions = [transaction1, transaction2];
            const reports = [
                {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report,
                {reportID: '2', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report,
            ];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should handle missing policy gracefully', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction];
            const reports = [{reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'nonexistent'} as Report];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            // Should return true because when policy is not found, function doesn't prevent merging
            // (since we have 1 transaction, it will return true after the policy check)
            expect(result).toBe(true);
        });

        it('should return true for admin user with eligible reports', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction];
            const reports = [{reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(true);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), true);
        });

        it('should return false for non-admin user with ineligible reports', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction];
            const reports = [{reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'} as Report];
            const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.USER}] as Policy[];

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(false);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), false);
        });

        it('should return false when one of multiple reports is not eligible', () => {
            const transactions = [{transactionID: '1', amount: 100} as Transaction, {transactionID: '2', amount: 200} as Transaction];
            const reports = [
                {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                {reportID: '2', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy2'},
            ] as Report[];
            const policies = [
                {id: 'policy1', role: CONST.POLICY.ROLE.ADMIN},
                {id: 'policy2', role: CONST.POLICY.ROLE.USER},
            ] as Policy[];

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge')
                .mockReturnValueOnce(true) // First report eligible
                .mockReturnValueOnce(false); // Second report not eligible

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledTimes(2);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenNthCalledWith(1, reports.at(0), true);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenNthCalledWith(2, reports.at(1), false);
        });

        describe('preventing merge for transactions belonging to different users', () => {
            beforeEach(() => {
                jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);
            });

            it('should return true when both transactions are unreported', () => {
                const transaction1 = {
                    transactionID: '1',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 100,
                } as Transaction;
                const transaction2 = {
                    transactionID: '2',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 200,
                } as Transaction;
                const transactions = [transaction1, transaction2];
                const reports: Report[] = [];
                const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

                expect(result).toBe(true);
            });

            it('should return true when both reported transactions have the same owner', () => {
                const transaction1 = {
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                } as Transaction;
                const transaction2 = {
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                } as Transaction;
                const transactions = [transaction1, transaction2];
                const reports = [
                    {reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                    {reportID: 'report2', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                ] as Report[];
                const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(true);
            });

            it('should return false when both reported transactions belong to different users', () => {
                const transaction1 = {
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                } as Transaction;
                const transaction2 = {
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                } as Transaction;
                const transactions = [transaction1, transaction2];
                const reports = [
                    {reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                    {reportID: 'report2', ownerAccountID: MANAGER_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                ] as Report[];
                const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(false);
            });

            it('should return true when first transaction is unreported and second belongs to current user', () => {
                const transaction1 = {
                    transactionID: '1',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 100,
                } as Transaction;
                const transaction2 = {
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                } as Transaction;
                const transactions = [transaction1, transaction2];
                const reports = [{reportID: 'report2', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}] as Report[];
                const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(true);
            });

            it('should return true when second transaction is unreported and first belongs to current user', () => {
                const transaction1 = {
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                } as Transaction;
                const transaction2 = {
                    transactionID: '2',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 200,
                } as Transaction;
                const transactions = [transaction1, transaction2];
                const reports = [{reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}] as Report[];
                const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(true);
            });

            it('should return false when first transaction is unreported and second belongs to different user', () => {
                const transaction1 = {
                    transactionID: '1',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 100,
                } as Transaction;
                const transaction2 = {
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                } as Transaction;
                const transactions = [transaction1, transaction2];
                const reports = [{reportID: 'report2', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}] as Report[];
                const policies = [{id: 'policy1'}] as Policy[];

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, MANAGER_ACCOUNT_ID);

                expect(result).toBe(false);
            });

            it('should return false when second transaction is unreported and first belongs to different user', () => {
                const transaction1 = {
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                } as Transaction;
                const transaction2 = {
                    transactionID: '2',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 200,
                } as Transaction;
                const transactions = [transaction1, transaction2];
                const reports = [{reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}] as Report[];
                const policies = [{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}] as Policy[];

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, MANAGER_ACCOUNT_ID);

                expect(result).toBe(false);
            });
        });
    });
});
