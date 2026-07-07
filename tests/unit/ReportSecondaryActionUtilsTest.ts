import type * as PolicyUtils from '@libs/PolicyUtils';
import {
    getSecondaryExportReportActions,
    getSecondaryReportActions,
    getSecondaryTransactionThreadActions,
    isChangeWorkspaceAction,
    isMergeActionForSelectedTransactions,
} from '@libs/ReportSecondaryActionUtils';

import CONST from '@src/CONST';
import {getValidConnectedIntegration, isPreferredExporter} from '@src/libs/PolicyUtils';
import * as ReportActionsUtils from '@src/libs/ReportActionsUtils';
import * as ReportUtils from '@src/libs/ReportUtils';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';
import type {Connections} from '@src/types/onyx/Policy';

import Onyx from 'react-native-onyx';

import {actionR14932, originalMessageR14932} from '../../__mocks__/reportData/actions';
import {chatReportR14932 as chatReport} from '../../__mocks__/reportData/reports';
import createRandomPolicy from '../utils/collections/policies';
import {createExpenseReport} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import createMock from '../utils/createMock';

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

const REPORT_ID = '1';
const POLICY_ID = 'POLICY_ID';
const OLD_POLICY_ID = 'OLD_POLICY_ID';
const ORIGINAL_TRANSACTION_ID = 'ORIGINAL_TRANSACTION_ID';
const SPLIT_TRANSACTION_ID = 'SPLIT_TRANSACTION_ID';
type QBOConfig = Connections[typeof CONST.POLICY.CONNECTIONS.NAME.QBO]['config'];

const createQBOConfig = (autoSyncEnabled: boolean, exporter = EMPLOYEE_EMAIL): QBOConfig => ({
    realmId: 'realm-id',
    companyName: 'QBO Company',
    autoSync: {
        jobID: '',
        enabled: autoSyncEnabled,
    },
    syncPeople: false,
    syncItems: false,
    markChecksToBePrinted: false,
    reimbursableExpensesExportDestination: CONST.QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE.VENDOR_BILL,
    nonReimbursableExpensesExportDestination: CONST.QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE.CREDIT_CARD,
    nonReimbursableBillDefaultVendor: '',
    autoCreateVendor: false,
    hasChosenAutoSyncOption: true,
    syncClasses: CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT,
    syncCustomers: CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT,
    syncLocations: CONST.INTEGRATION_ENTITY_MAP_TYPES.DEFAULT,
    lastConfigurationTime: 0,
    syncTax: false,
    enableNewCategories: false,
    exportDate: CONST.QUICKBOOKS_EXPORT_DATE.REPORT_EXPORTED,
    export: {
        exporter,
    },
    credentials: {
        companyID: 'company-id',
        companyName: 'QBO Company',
        scope: '',
    },
});

const createQBOConnections = (autoSyncEnabled: boolean, exporter = EMPLOYEE_EMAIL) => ({
    [CONST.POLICY.CONNECTIONS.NAME.QBO]: {
        config: createQBOConfig(autoSyncEnabled, exporter),
    },
});

const createQBOPolicy = (role: Policy['role'], autoSyncEnabled: boolean, exporter = EMPLOYEE_EMAIL): Policy => ({
    id: POLICY_ID,
    name: 'QBO Policy',
    role,
    type: CONST.POLICY.TYPE.TEAM,
    owner: ADMIN_EMAIL,
    outputCurrency: CONST.CURRENCY.USD,
    isPolicyExpenseChatEnabled: true,
    connections: createQBOConnections(autoSyncEnabled, exporter),
});

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPreferredExporter: jest.fn().mockReturnValue(true),
    hasAccountingConnections: jest.fn().mockReturnValue(true),
    isPolicyAdmin: jest.fn().mockReturnValue(true),
    isPolicyApprover: (...args: Parameters<typeof PolicyUtils.isPolicyApprover>) => jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils').isPolicyApprover(...args),
    isPolicyAuditor: (...args: Parameters<typeof PolicyUtils.isPolicyAuditor>) => jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils').isPolicyAuditor(...args),
    getValidConnectedIntegration: jest.fn().mockReturnValue('netsuite'),
    isPaidGroupPolicy: jest.fn().mockReturnValue(true),
    isGroupPolicy: jest.fn().mockReturnValue(true),
}));

describe('getSecondaryAction', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            initialKeyStates: {
                [ONYXKEYS.SESSION]: SESSION,
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {[EMPLOYEE_ACCOUNT_ID]: PERSONAL_DETAILS, [APPROVER_ACCOUNT_ID]: {accountID: APPROVER_ACCOUNT_ID, login: APPROVER_EMAIL}},
            },
        });
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        jest.mocked(getValidConnectedIntegration).mockReturnValue('netsuite');
        jest.mocked(jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPaidGroupPolicy).mockReturnValue(true);
        jest.mocked(isPreferredExporter).mockReturnValue(true);
        Onyx.clear();
    });

    it('should always return default options', () => {
        const report = createMock<Report>({});
        const policy = createMock<Policy>({});

        const result = [
            CONST.REPORT.SECONDARY_ACTIONS.EXPORT,
            CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF,
            CONST.REPORT.SECONDARY_ACTIONS.PRINT,
            CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS,
        ];
        expect(
            getSecondaryReportActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                submitterLogin: '',
                report,
                chatReport,
                reportTransactions: [],
                originalTransaction: createMock<Transaction>({}),
                violations: {},
                bankAccountList: {},
                policy,
                isProduction: false,
            }),
        ).toEqual(result);
    });

    it('does not include PRINT option when the report is in OPEN state', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.PRINT)).toBe(false);

        // DOWNLOAD_PDF is unaffected — only PRINT is gated on the OPEN state
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD_PDF)).toBe(true);
    });

    it('includes PRINT option when the report is submitted', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        } as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.PRINT)).toBe(true);
    });

    it('includes ADD_EXPENSE option for empty report', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE)).toBe(true);
    });

    it('includes SUBMIT option', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('includes SUBMIT option while a retract update is pending', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            pendingFields: {
                hasReportBeenRetracted: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            total: 10,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('includes SUBMIT option while only nextStep is pending', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            pendingFields: {
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            total: 10,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('includes SUBMIT option for admin', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('include SUBMIT option for zero amount transaction', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 0,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID_1',
            amount: 0,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('includes SUBMIT option when report total is 0 but there are transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 0,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const transaction1 = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID_1',
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const transaction2 = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID_2',
            amount: -10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('should not include SUBMIT option when report total is 0 and there are no transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 0,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('include SUBMIT option if the report is retracted', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            hasReportBeenReopened: true,
        });
        const policy = createMock<Policy>({
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.USER,
            type: CONST.POLICY.TYPE.CORPORATE,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
            comment: {
                hold: 'hold',
            },
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue('12345');
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(true);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
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
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.AUDITOR,
            type: CONST.POLICY.TYPE.CORPORATE,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('should include SUBMIT option for admin with only pending transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
            role: CONST.POLICY.ROLE.ADMIN,
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('should not include SUBMIT option when transaction has smartscan failed violation', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.SMARTSCAN_FAILED,
            type: CONST.VIOLATION_TYPES.WARNING,
            showInReview: true,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('should not include SUBMIT option when smartscan failed with missing fields before violation is written', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 10,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: `${REPORT_ID}`,
            iouRequestType: CONST.IOU.REQUEST_TYPE.SCAN,
            receipt: {state: CONST.IOU.RECEIPT_STATE.SCAN_FAILED},
            merchant: '',
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(false);
    });

    it('includes APPROVE option for approver and report with duplicates', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
        });
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);

        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for approver and report with only pending transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
        });
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('includes APPROVE option for DEW policy report without pending approval', async () => {
        // Given a submitted expense report on a DEW policy without any pending approval action
        const TRANSACTION_ID = 'TRANSACTION_ID_DEW';
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        });
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });
        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const violations = {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]};

        // When getting secondary report actions
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations,
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        // Then APPROVE should be included because DEW approval is not in progress
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for DEW policy report with pending approval', async () => {
        // Given a submitted expense report on a DEW policy with a pending approval action
        const TRANSACTION_ID = 'TRANSACTION_ID_DEW_PENDING';
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        });
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
        });
        const violation = createMock<TransactionViolation>({
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const violations = {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]};

        // When getting secondary report actions while DEW approval is pending
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations,
            bankAccountList: {},
            policy,
            reportMetadata: {pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE},
            isProduction: false,
        });

        // Then APPROVE should not be included because DEW is already processing an approval
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('does not include APPROVE option when submitter is the manager on a Submit workspace even with duplicate violations', async () => {
        const TRANSACTION_ID = 'TRANSACTION_ID_SUBMIT_WORKSPACE_SUBMITTER';
        const report = {
            ...createExpenseReport(Number(REPORT_ID)),
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };
        const policy = {
            ...createRandomPolicy(0, CONST.POLICY.TYPE.SUBMIT),
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            preventSelfApproval: false,
            approver: EMPLOYEE_EMAIL,
        };
        const transaction = {
            ...createRandomTransaction(0),
            transactionID: TRANSACTION_ID,
        };
        const violation: TransactionViolation = {
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
            type: CONST.VIOLATION_TYPES.VIOLATION,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createRandomTransaction(0),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('includes APPROVE option when a different user is the manager on a Submit workspace with duplicate violations', async () => {
        const TRANSACTION_ID = 'TRANSACTION_ID_SUBMIT_WORKSPACE_APPROVER';
        const report = {
            ...createExpenseReport(Number(REPORT_ID)),
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: APPROVER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };
        const policy = {
            ...createRandomPolicy(1, CONST.POLICY.TYPE.SUBMIT),
            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
            preventSelfApproval: false,
            approver: APPROVER_EMAIL,
        };
        const transaction = {
            ...createRandomTransaction(1),
            transactionID: TRANSACTION_ID,
        };
        const violation: TransactionViolation = {
            name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
            type: CONST.VIOLATION_TYPES.VIOLATION,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: APPROVER_EMAIL,
            currentUserAccountID: APPROVER_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createRandomTransaction(1),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('includes APPROVE option for report with RTER violations when it is submitted', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
        });
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

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for report with RTER violations when it is not submitted', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
        });
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

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('includes APPROVE option for admin with report having broken connection when it is submitted', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({role: CONST.POLICY.ROLE.ADMIN, autoReporting: true, autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT});
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

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for admin with report having broken connection that is not submitted', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({role: CONST.POLICY.ROLE.ADMIN});
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

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('does not include APPROVE option for report with transactions that are being scanned', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
        });
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            receipt: {
                state: CONST.IOU.RECEIPT_STATE.SCANNING,
            },
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
    });

    it('includes UNAPPROVE option', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({approver: EMPLOYEE_EMAIL});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('includes UNAPPROVE option for admin on finally approved report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: MANAGER_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: APPROVER_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('includes UNAPPROVE option for manager on finally approved report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: APPROVER_EMAIL,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('does not include UNAPPROVE option for non-admin, non-manager on finally approved report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: MANAGER_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: APPROVER_EMAIL,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('does not include UNAPPROVE option for non-approved report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('does not include UNAPPROVE option for settled report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('does not include UNAPPROVE option for payment processing report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: EMPLOYEE_ACCOUNT_ID,
            isWaitingOnBankAccount: true,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('does not include UNAPPROVE option for non-admin on DEW policy', () => {
        // Given an approved expense report on a DEW policy where the current user is the manager but not an admin
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: EMPLOYEE_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        });

        // When getting secondary report actions
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        // Then UNAPPROVE should not be included because DEW policies restrict unapprove to admins only
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(false);
    });

    it('includes UNAPPROVE option for admin on DEW policy', () => {
        // Given an approved expense report on a DEW policy where the current user is an admin
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            managerID: MANAGER_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            approver: APPROVER_EMAIL,
            role: CONST.POLICY.ROLE.ADMIN,
            approvalMode: CONST.POLICY.APPROVAL_MODE.DYNAMICEXTERNAL,
        });

        // When getting secondary report actions
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        // Then UNAPPROVE should be included because admins can unapprove on DEW policies
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for report paid elsewhere', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for report before nacha cutoff', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.BILLING,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: true,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        });
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = createMock<ReportAction>({
            reportActionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            },
            created: tomorrow.toISOString(),
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [
                createMock<Transaction>({
                    transactionID: TRANSACTION_ID,
                }),
            ],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for bank payment in BILLING state', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.BILLING,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        });
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = createMock<ReportAction>({
            reportActionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            created: tomorrow.toISOString(),
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [
                createMock<Transaction>({
                    transactionID: TRANSACTION_ID,
                }),
            ],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for bank payment in APPROVED + REIMBURSED state', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        });
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = createMock<ReportAction>({
            reportActionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            created: tomorrow.toISOString(),
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [
                createMock<Transaction>({
                    transactionID: TRANSACTION_ID,
                }),
            ],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for auto-reimbursed payment', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.AUTOREIMBURSED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            managerID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        });
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Use tomorrow's date to ensure we're always before the NACHA cutoff (23:45 UTC)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const ACTION_ID = 'action_id';
        const reportAction = createMock<ReportAction>({
            reportActionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
            created: tomorrow.toISOString(),
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [
                createMock<Transaction>({
                    transactionID: TRANSACTION_ID,
                }),
            ],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes RECEIVED_PAYMENT option for approved expense report submitter with reimbursable spend', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            total: -100,
            nonReimbursableTotal: 0,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.USER,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(true);
    });

    it('includes RECEIVED_PAYMENT option for negative expense report even when non-reimbursable total matches total', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            total: -100,
            nonReimbursableTotal: -100,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.USER,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(true);
    });

    it('does not include RECEIVED_PAYMENT option for admin', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            total: -100,
            nonReimbursableTotal: 0,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(false);
    });

    it('include RECEIVED_PAYMENT option when payments are disabled', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            total: -100,
            nonReimbursableTotal: 0,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.USER,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(true);
    });

    it('does not include RECEIVED_PAYMENT option when a bank payment action exists', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            total: -100,
            nonReimbursableTotal: 0,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.USER,
        });
        const reportAction = createMock<ReportAction>({
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [reportAction],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(false);
    });

    it('does not include RECEIVED_PAYMENT option when the report has held expenses', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            total: -100,
            nonReimbursableTotal: 0,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.USER,
        });
        const heldTransaction = createMock<Transaction>({
            comment: {
                hold: '2026-05-09 00:00:00',
            },
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [heldTransaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(false);
    });

    it('includes RECEIVED_PAYMENT option when only pay-elsewhere action exists', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            total: -100,
            nonReimbursableTotal: 0,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.USER,
        });
        const reportAction = createMock<ReportAction>({
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            },
        });

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [reportAction],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(true);
    });

    it('includes RECEIVED_PAYMENT for submitter on Outstanding (Processing) report in Submit workspace', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            total: -100,
            nonReimbursableTotal: 0,
        } as unknown as Report;
        const policy = {
            type: CONST.POLICY.TYPE.SUBMIT,
            role: CONST.POLICY.ROLE.EDITOR,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(true);
    });

    it('does not include RECEIVED_PAYMENT when current user did not submit the report (Submit workspace)', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: MANAGER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            total: -100,
            nonReimbursableTotal: 0,
        } as unknown as Report;
        const policy = {
            type: CONST.POLICY.TYPE.SUBMIT,
            role: CONST.POLICY.ROLE.EDITOR,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(false);
    });

    it('does not include RECEIVED_PAYMENT for submitter on Submit workspace report waiting on bank account', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            total: -100,
            nonReimbursableTotal: 0,
            isWaitingOnBankAccount: true,
        } as unknown as Report;
        const policy = {
            type: CONST.POLICY.TYPE.SUBMIT,
            role: CONST.POLICY.ROLE.EDITOR,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(false);
    });

    it('does not include RECEIVED_PAYMENT for submitter on Submit workspace report with held expenses', () => {
        const heldTransaction = {
            transactionID: '1',
            comment: {hold: 'hold-id'},
        } as unknown as Transaction;
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            total: -100,
            nonReimbursableTotal: 0,
        } as unknown as Report;
        const policy = {
            type: CONST.POLICY.TYPE.SUBMIT,
            role: CONST.POLICY.ROLE.EDITOR,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [heldTransaction],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(false);
    });

    it('does not include RECEIVED_PAYMENT for submitter on Outstanding report in non-Submit workspace', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            total: -100,
            nonReimbursableTotal: 0,
        } as unknown as Report;
        const policy = {
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.USER,
        } as unknown as Policy;

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: {} as Transaction,
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT)).toBe(false);
    });

    it('includes HOLD option ', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID_R14932',
            comment: {},
        });
        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: true, canUnholdRequest: true});
        jest.spyOn(ReportUtils, 'isAwaitingFirstLevelApproval').mockReturnValueOnce(true);
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValueOnce(originalMessageR14932.IOUTransactionID);
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [actionR14932],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });

    it('does not include HOLD option for submitter after first approval', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID_R14932',
            comment: {},
        });
        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: false, canUnholdRequest: false});
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValueOnce(originalMessageR14932.IOUTransactionID);
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [actionR14932],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(false);
    });

    it('does not include HOLD option for action owner on open expense report when expense is already on hold', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID_R14932',
            comment: {
                hold: 'REPORT_ACTION_ID',
            },
        });
        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: false, canUnholdRequest: true});
        jest.spyOn(ReportUtils, 'isActionCreator').mockReturnValue(true);
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValueOnce(originalMessageR14932.IOUTransactionID);
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions: [actionR14932],
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(false);
    });

    it('does not include CHANGE_WORKSPACE option for submitted IOU report and manager being the payer of the new policy', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: MANAGER_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };
        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            policies,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(false);
    });

    it('includes CHANGE_WORKSPACE option for open expense report submitter', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        });

        const personalDetails = {
            [ADMIN_ACCOUNT_ID]: {login: ADMIN_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };

        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            policies,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for submitter, submitted report without approvals', async () => {
        const oldPolicy = createMock<Policy>({
            id: OLD_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: MANAGER_EMAIL,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });

        const newPolicy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });

        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: oldPolicy.id,
        });

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
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy: oldPolicy,
            policies,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for approver', async () => {
        const oldPolicy = createMock<Policy>({
            id: OLD_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: APPROVER_EMAIL,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });

        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: oldPolicy.id,
        });

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [APPROVER_ACCOUNT_ID]: {login: APPROVER_EMAIL, accountID: APPROVER_ACCOUNT_ID},
        };

        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: APPROVER_EMAIL,
            isPolicyExpenseChatEnabled: true,
            role: CONST.POLICY.ROLE.USER,
            employeeList: {
                [APPROVER_EMAIL]: {email: APPROVER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy, [`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`]: oldPolicy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${OLD_POLICY_ID}`, oldPolicy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: APPROVER_EMAIL, accountID: APPROVER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            policies,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for admin', async () => {
        const oldPolicy = createMock<Policy>({
            id: OLD_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });

        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            policyID: oldPolicy.id,
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
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
            submitterLogin: EMPLOYEE_EMAIL,
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            policies,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes DELETE option for expense report submitter', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        });
        const policy = createMock<Policy>({});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [createMock<Transaction>({})],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('replaces SPLIT with DELETE for per diem split expenses in the more menu', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        });
        const transaction = createMock<Transaction>({
            transactionID: SPLIT_TRANSACTION_ID,
            reportID: REPORT_ID,
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
            comment: {
                originalTransactionID: ORIGINAL_TRANSACTION_ID,
                source: CONST.IOU.TYPE.SPLIT,
            },
        });
        const originalTransaction = createMock<Transaction>({
            transactionID: ORIGINAL_TRANSACTION_ID,
            amount: 20,
            merchant: 'Merchant',
            created: '2025-01-01',
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                },
            },
        });
        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: undefined,
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction,
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for invoice report submitter when total is zero', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            total: 0,
        });

        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.USER,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: createMock<Transaction>({}),
            reportAction: undefined,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for owner of unreported transaction', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
        });

        const reportActions = createMock<ReportAction[]>([
            {
                reportActionID: '1',
                reportID: String(REPORT_ID),
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                },
            },
        ]);

        const policy = createMock<Policy>({});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for owner of single processing IOU transaction', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const reportActions = createMock<ReportAction[]>([
            {
                reportActionID: '1',
                reportID: REPORT_ID,
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                },
            },
        ]);

        const policy = createMock<Policy>({});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('does not include DELETE option for IOU report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const TRANSACTION_ID_2 = 'TRANSACTION_ID_2';

        const transaction1 = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const transaction2 = createMock<Transaction>({
            transactionID: TRANSACTION_ID_2,
            reportID: REPORT_ID,
        });

        const reportActions = createMock<ReportAction[]>([
            {
                reportActionID: '1',
                reportID: REPORT_ID,
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                },
            },
            {
                reportActionID: '2',
                reportID: REPORT_ID,
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID_2,
                },
            },
        ]);

        const policy = createMock<Policy>({});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('includes DELETE option for owner of single processing expense transaction which is not forwarded', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: POLICY_ID,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            employeeList: {
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: APPROVER_EMAIL,
                },
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for owner of processing expense report which is not forwarded', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            policyID: POLICY_ID,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const TRANSACTION_ID_2 = 'TRANSACTION_ID_2';

        const transaction1 = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const transaction2 = createMock<Transaction>({
            transactionID: TRANSACTION_ID_2,
            reportID: REPORT_ID,
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            employeeList: {
                [EMPLOYEE_EMAIL]: {
                    email: EMPLOYEE_EMAIL,
                    submitsTo: APPROVER_EMAIL,
                },
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('does not includes DELETE option for report that has been forwarded', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            policyID: POLICY_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: APPROVER_EMAIL,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('does not include DELETE option for corporate liability card transaction', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            managedCard: true,
            comment: {
                liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT,
            },
        });

        const policy = createMock<Policy>({});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('does not include DELETE option for unreported card expense imported with deleting disabled', async () => {
        // Given the unreported card expense imported with deleting disabled
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.CHAT,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
            managedCard: true,
            comment: {
                liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT,
            },
        });

        const reportActions = createMock<ReportAction[]>([
            {
                reportActionID: '1',
                reportID: String(REPORT_ID),
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                },
            },
        ]);

        const policy = createMock<Policy>({});
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // Then it should return false since the unreported card expense is imported with deleting disabled
        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('include DELETE option for demo transaction', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            comment: {
                isDemoTransaction: true,
            },
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: APPROVER_EMAIL,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes REMOVE HOLD option for admin if he is the holder and primary action is not REMOVE HOLD', () => {
        const report = createMock<Report>({});
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
        });
        const reportTransactions = createMock<Transaction[]>([
            {
                comment: {
                    hold: 'REPORT_ACTION_ID',
                },
            },
        ]);

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(originalMessageR14932.IOUTransactionID);
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions,
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result).toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    });

    it('does not include REMOVE HOLD option for closed reports with transactions on hold', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
        });
        const reportTransactions = createMock<Transaction[]>([
            {
                comment: {
                    hold: 'REPORT_ACTION_ID',
                },
            },
        ]);

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(originalMessageR14932.IOUTransactionID);
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions,
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    });

    it('include DUPLICATE option for single-transaction expense report', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction1 = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const reportActions = createMock<ReportAction[]>([
            {
                reportActionID: '1',
                reportID: REPORT_ID,
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                },
            },
        ]);

        const policy = createMock<Policy>({});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction1],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE)).toBe(true);
    });

    it('does not include DUPLICATE option if there are no transactions', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        const policy = createMock<Policy>({
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            harvesting: {
                enabled: true,
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            violations: {},
            bankAccountList: {},
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE)).toBe(false);
    });

    it('does not include DUPLICATE option for expense report with multiple transactions', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';
        const TRANSACTION_ID_2 = 'TRANSACTION_ID_2';

        const transaction1 = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const transaction2 = createMock<Transaction>({
            transactionID: TRANSACTION_ID_2,
            reportID: REPORT_ID,
        });

        const reportActions = createMock<ReportAction[]>([
            {
                reportActionID: '1',
                reportID: REPORT_ID,
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                },
            },
            {
                reportActionID: '2',
                reportID: REPORT_ID,
                actorAccountID: EMPLOYEE_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID_2,
                },
            },
        ]);

        const policy = createMock<Policy>({});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction1, transaction2],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE)).toBe(false);
    });

    it('does not include DUPLICATE option for card transaction', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
            managedCard: true,
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            approver: APPROVER_EMAIL,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE)).toBe(false);
    });

    it('does not include DUPLICATE option for expenses from other users', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: APPROVER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        });

        const TRANSACTION_ID = 'TRANSACTION_ID';

        const transaction1 = createMock<Transaction>({
            transactionID: TRANSACTION_ID,
            reportID: REPORT_ID,
        });

        const reportActions = createMock<ReportAction[]>([
            {
                reportActionID: '1',
                reportID: REPORT_ID,
                actorAccountID: APPROVER_ACCOUNT_ID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUTransactionID: TRANSACTION_ID,
                },
            },
        ]);

        const policy = createMock<Policy>({});

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction1],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE)).toBe(false);
    });

    it('includes MOVE_EXPENSE option for single expense report when user can move expense', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            policyID: POLICY_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });
        const transaction = createMock<Transaction>({
            transactionID: originalMessageR14932.IOUTransactionID,
        });
        const reportActions = [actionR14932];
        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canEditFieldOfMoneyRequest').mockReturnValue(true);
        jest.spyOn(ReportUtils, 'canUserPerformWriteAction').mockReturnValue(true);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result).toContain(CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE);
    });

    it('does not include MOVE_EXPENSE option when canEditFieldOfMoneyRequest returns false', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            policyID: POLICY_ID,
        });
        const transaction = createMock<Transaction>({
            transactionID: originalMessageR14932.IOUTransactionID,
        });
        const reportActions = [actionR14932];
        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canEditFieldOfMoneyRequest').mockReturnValue(false);
        jest.spyOn(ReportUtils, 'canUserPerformWriteAction').mockReturnValue(true);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [transaction],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            reportActions,

            isProduction: false,
        });
        expect(result).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE);
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
        const report = createMock<Report>({});
        const policy = createMock<Policy>({});

        const result = [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV];
        expect(getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy)).toEqual(result);
    });

    it('should include export templates when provided', () => {
        const report = createMock<Report>({});
        const policy = createMock<Policy>({});
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
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            connections: {
                [CONST.POLICY.CONNECTIONS.NAME.QBO]: {},
            },
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(false);
    });

    it('includes EXPORT option for expense report with payments enabled', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            id: POLICY_ID,
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        });

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(true);
    });

    it('includes EXPORT option and templates together', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        });
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
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {autoSync: {enabled: true}}}},
        });

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for invoice report sender', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
        });
        const policy = createMock<Policy>({
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        });
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report preferred exporter', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: EMPLOYEE_EMAIL}, autoSync: {enabled: false}}}},
        });

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report with payments enabled', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        });

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report with payments disabled', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {autoSync: {enabled: true}}}},
        });

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report preferred exporter', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: EMPLOYEE_EMAIL}, autoSync: {enabled: false}}}},
        });

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report preferred exporter when auto-sync is enabled', () => {
        const report: Report = {
            reportID: `${REPORT_ID}`,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };
        const policy = createQBOPolicy(CONST.POLICY.ROLE.USER, true);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report admin', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        });
        const policy = createMock<Policy>({
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: ADMIN_EMAIL}, autoSync: {enabled: true}}}},
            role: CONST.POLICY.ROLE.ADMIN,
        });

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report admin when auto-sync is disabled and live export connection is invalid', () => {
        jest.mocked(getValidConnectedIntegration).mockReturnValue(undefined);
        jest.mocked(isPreferredExporter).mockReturnValue(false);

        const report: Report = {
            reportID: `${REPORT_ID}`,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };
        const policy = createQBOPolicy(CONST.POLICY.ROLE.ADMIN, false);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(false);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for reimbursed expense report payer', () => {
        jest.mocked(jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPaidGroupPolicy).mockReturnValue(false);
        jest.mocked(isPreferredExporter).mockReturnValue(false);

        const report: Report = {
            reportID: `${REPORT_ID}`,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        };
        const policy = createQBOPolicy(CONST.POLICY.ROLE.USER, false);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('does not include MARK_AS_EXPORTED option for expense report non-admin who is not preferred exporter or payer', () => {
        jest.mocked(jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPaidGroupPolicy).mockReturnValue(false);
        jest.mocked(isPreferredExporter).mockReturnValue(false);

        const report: Report = {
            reportID: `${REPORT_ID}`,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        };
        const policy = createQBOPolicy(CONST.POLICY.ROLE.USER, false);

        const result = getSecondaryExportReportActions(SESSION.accountID, SESSION.email, report, {}, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(false);
    });

    it('includes REMOVE HOLD option for admin if he is not the holder', () => {
        const report = createMock<Report>({});
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
        });
        const reportTransactions = createMock<Transaction[]>([
            {
                comment: {
                    hold: 'REPORT_ACTION_ID',
                },
            },
        ]);

        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValue(originalMessageR14932.IOUTransactionID);
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions,
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            isProduction: false,
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
        const report = createMock<Report>({});
        const policy = createMock<Policy>({});

        const result = [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS];
        expect(
            getSecondaryTransactionThreadActions({
                currentUserLogin: EMPLOYEE_EMAIL,
                currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
                parentReport: report,
                reportTransaction: createMock<Transaction>({}),
                reportAction: undefined,
                originalTransaction: createMock<Transaction>({}),
                policy,
                isProduction: false,
            }),
        ).toEqual(result);
    });

    it('includes HOLD option', () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });

        const transaction = createMock<Transaction>({
            comment: {},
        });

        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: true, canUnholdRequest: true});
        jest.spyOn(ReportUtils, 'isAwaitingFirstLevelApproval').mockReturnValueOnce(true);
        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });

    it('includes REMOVE HOLD option for transaction thread report admin if he is not the holder', () => {
        const report = createMock<Report>({});
        const transactionThreadReport = createMock<Report>({});
        const policy = createMock<Policy>({
            role: CONST.POLICY.ROLE.ADMIN,
        });
        const transaction = createMock<Transaction>({
            comment: {
                hold: 'REPORT_ACTION_ID',
            },
        });

        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(false);
        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: undefined,
            originalTransaction: createMock<Transaction>({}),
            policy,
            transactionThreadReport,
            isProduction: false,
        });
        expect(result).toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);

        // Do not show if admin is the holder
        jest.spyOn(ReportUtils, 'isHoldCreator').mockReturnValue(true);
        const result2 = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: undefined,
            originalTransaction: createMock<Transaction>({}),
            policy,
            transactionThreadReport,
            isProduction: false,
        });
        expect(result2).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.REMOVE_HOLD);
    });

    it('includes DELETE option for expense report submitter', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        });

        const policy = createMock<Policy>({});

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: createMock<Transaction>({}),
            reportAction: undefined,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('replaces SPLIT with DELETE for per diem split expenses in transaction threads', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        });
        const transaction = createMock<Transaction>({
            transactionID: SPLIT_TRANSACTION_ID,
            reportID: REPORT_ID,
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
            comment: {
                originalTransactionID: ORIGINAL_TRANSACTION_ID,
                source: CONST.IOU.TYPE.SPLIT,
            },
        });
        const originalTransaction = createMock<Transaction>({
            transactionID: ORIGINAL_TRANSACTION_ID,
            amount: 20,
            merchant: 'Merchant',
            created: '2025-01-01',
            iouRequestType: CONST.IOU.REQUEST_TYPE.PER_DIEM,
            comment: {
                type: CONST.TRANSACTION.TYPE.CUSTOM_UNIT,
                customUnit: {
                    name: CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
                },
            },
        });
        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: undefined,
            originalTransaction,
            policy,
            isProduction: false,
        });

        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('should not include CHANGE_WORKSPACE option for exported report', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: MANAGER_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });
        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };
        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        });
        const reportActions = createMock<ReportAction[]>([
            {
                actionName: CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION,
                originalMessage: {markedManually: true},
            },
        ]);
        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`]: policy};
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            submitterLogin: '',
            report,
            chatReport,
            reportTransactions: [],
            originalTransaction: createMock<Transaction>({}),
            violations: {},
            bankAccountList: {},
            policy,
            policies,
            reportActions,

            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(false);
    });

    it('includes the SPLIT option if the current user belongs to the workspace', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(true);
    });

    it('includes the SPLIT option after the other split half was deleted', async () => {
        // Given an open expense report owned by the current user
        const report = createMock<Report>({
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        });

        // And a surviving split child that still references the original (its sibling was unreported then deleted)
        const survivingSplit = createMock<Transaction>({
            transactionID: 'SURVIVING_SPLIT',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 50,
            merchant: 'Merchant',
            created: '2025-01-01',
            reportID: REPORT_ID,
            comment: {originalTransactionID: 'ORIGINAL_TRANSACTION', source: CONST.IOU.TYPE.SPLIT},
        });

        // And the original ("parent") expense transaction still existing, hidden on the split report
        const originalTransaction = createMock<Transaction>({
            transactionID: 'ORIGINAL_TRANSACTION',
            amount: 100,
            merchant: 'Merchant',
            created: '2025-01-01',
            reportID: CONST.REPORT.SPLIT_REPORT_ID,
            comment: {},
        });

        // And the current user is a member of the policy
        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // When the secondary transaction-thread actions are computed
        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: survivingSplit,
            reportAction: actionR14932,
            originalTransaction,
            policy,
            isProduction: false,
        });

        // Then the SPLIT option is available
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(true);
    });

    it('does not include the SPLIT option if the current user does not belong to the workspace', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
    });

    it('does not include the SPLIT option if the policy is not expense chat enabled', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: false,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
    });

    it('does not include the SPLIT option for processing report with instant submit, submit-and-close, and payments disabled', async () => {
        const report = createMock<Report>({
            reportID: REPORT_ID,
            policyID: POLICY_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const policy = createMock<Policy>({
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            isPolicyExpenseChatEnabled: true,
            autoReporting: true,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
            approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
            role: CONST.POLICY.ROLE.ADMIN,
        });

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: report,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
    });

    it('includes the SPLIT option when parentReport is a selfDM report (unreported expense)', () => {
        const selfDMReport = createMock<Report>({
            reportID: REPORT_ID,
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const policy = createMock<Policy>({});

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: selfDMReport,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(true);
    });

    it('includes the SPLIT option when grandParentReport is a selfDM report (transaction thread inside selfDM)', () => {
        // parentReport is a transaction thread (not selfDM, not expense report)
        const transactionThreadReport = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
        });

        const selfDMReport = createMock<Report>({
            reportID: '999',
            chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const policy = createMock<Policy>({});

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: transactionThreadReport,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            grandParentReport: selfDMReport,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(true);
    });

    it('does not include the SPLIT option when parentReport is not selfDM and not an expense report', () => {
        const nonExpenseReport = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
        });

        const transaction = createMock<Transaction>({
            transactionID: 'TRANSACTION_ID',
            status: CONST.TRANSACTION.STATUS.POSTED,
            amount: 10,
            merchant: 'Merchant',
            created: '2025-01-01',
        });

        const policy = createMock<Policy>({});

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport: nonExpenseReport,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isProduction: false,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SPLIT)).toBe(false);
    });

    it('includes MOVE_EXPENSE option for transaction thread when user can move expense', () => {
        const parentReport = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            policyID: POLICY_ID,
        });
        const transaction = createMock<Transaction>({
            transactionID: originalMessageR14932.IOUTransactionID,
        });
        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canEditFieldOfMoneyRequest').mockReturnValue(true);
        jest.spyOn(ReportUtils, 'canUserPerformWriteAction').mockReturnValue(true);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isChatReportArchived: false,
            isProduction: false,
        });
        expect(result).toContain(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MOVE_EXPENSE);
    });

    it('does not include MOVE_EXPENSE option for transaction thread when canEditFieldOfMoneyRequest returns false', () => {
        const parentReport = createMock<Report>({
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            policyID: POLICY_ID,
        });
        const transaction = createMock<Transaction>({
            transactionID: originalMessageR14932.IOUTransactionID,
        });
        const policy = createMock<Policy>({});

        jest.spyOn(ReportUtils, 'canEditFieldOfMoneyRequest').mockReturnValue(false);
        jest.spyOn(ReportUtils, 'canUserPerformWriteAction').mockReturnValue(true);

        const result = getSecondaryTransactionThreadActions({
            currentUserLogin: EMPLOYEE_EMAIL,
            currentUserAccountID: EMPLOYEE_ACCOUNT_ID,
            parentReport,
            reportTransaction: transaction,
            reportAction: actionR14932,
            originalTransaction: createMock<Transaction>({}),
            policy,
            isChatReportArchived: false,
            isProduction: false,
        });
        expect(result).not.toContain(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MOVE_EXPENSE);
    });

    describe('isMergeAction', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return true for transactions with negative amounts', () => {
            const report = createMock<Report>({
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            });

            const transaction = createMock<Transaction>({
                transactionID: 'TRANSACTION_ID',
                amount: -100,
                currency: 'USD',
            });

            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.ADMIN,
            });

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
                submitterLogin: '',
                report,
                chatReport: undefined,
                reportTransactions: [transaction],
                originalTransaction: createMock<Transaction>({}),
                violations: {},
                bankAccountList: {},
                policy,

                isProduction: false,
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MERGE)).toBe(true);
        });

        it('should return true for transactions with positive amounts when eligible', () => {
            const report = createMock<Report>({
                reportID: REPORT_ID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            });

            const transaction = createMock<Transaction>({
                transactionID: 'TRANSACTION_ID',
                amount: 100,
                currency: 'USD',
            });

            const policy = createMock<Policy>({
                role: CONST.POLICY.ROLE.ADMIN,
            });

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
                submitterLogin: '',
                report,
                chatReport: undefined,
                reportTransactions: [transaction],
                originalTransaction: createMock<Transaction>({}),
                violations: {},
                bankAccountList: {},
                policy,

                isProduction: false,
            });

            expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MERGE)).toBe(true);
        });
    });

    describe('isMergeActionForSelectedTransactions', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return false when there are more than 2 transactions', () => {
            const transactions = [
                createMock<Transaction>({transactionID: '1', amount: 100}),
                createMock<Transaction>({transactionID: '2', amount: 200}),
                createMock<Transaction>({transactionID: '3', amount: 300}),
            ];
            const reports = [createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE})];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should return false when there are more than 2 reports', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100})];
            const reports = [
                createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE}),
                createMock<Report>({reportID: '2', type: CONST.REPORT.TYPE.EXPENSE}),
                createMock<Report>({reportID: '3', type: CONST.REPORT.TYPE.EXPENSE}),
            ];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should return false when there are more than 2 policies', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100})];
            const reports = [createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE})];
            const policies = createMock<Policy[]>([
                {id: 'policy1', role: CONST.POLICY.ROLE.ADMIN},
                {id: 'policy2', role: CONST.POLICY.ROLE.ADMIN},
                {id: 'policy3', role: CONST.POLICY.ROLE.ADMIN},
            ]);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should return false when a report is not eligible for merge', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100})];
            const reports = [createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'})];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.USER}]);

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(false);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), false);
        });

        it('should return true for single transaction when report is eligible for merge', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100})];
            const reports = [createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'})];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(true);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), true);
        });

        it('should return true for two eligible transactions', () => {
            const transaction1 = createMock<Transaction>({
                transactionID: '1',
                amount: 100,
                managedCard: false,
            });
            const transaction2 = createMock<Transaction>({
                transactionID: '2',
                amount: 200,
                managedCard: false,
            });
            const transactions = [transaction1, transaction2];
            const reports = [
                createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}),
                createMock<Report>({reportID: '2', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}),
            ];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(true);
        });

        it('should return false when transactions are not eligible for merge', () => {
            const transaction1 = createMock<Transaction>({
                transactionID: '1',
                amount: 100,
                managedCard: true,
            });
            const transaction2 = createMock<Transaction>({
                transactionID: '2',
                amount: 200,
                managedCard: true,
            });
            const transactions = [transaction1, transaction2];
            const reports = [
                createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}),
                createMock<Report>({reportID: '2', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}),
            ];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
        });

        it('should handle missing policy gracefully', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100})];
            const reports = [createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'nonexistent'})];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            // Should return true because when policy is not found, function doesn't prevent merging
            // (since we have 1 transaction, it will return true after the policy check)
            expect(result).toBe(true);
        });

        it('should return true for admin user with eligible reports', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100})];
            const reports = [createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'})];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(true);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(true);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), true);
        });

        it('should return false for non-admin user with ineligible reports', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100})];
            const reports = [createMock<Report>({reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'})];
            const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.USER}]);

            jest.spyOn(ReportUtils, 'isMoneyRequestReportEligibleForMerge').mockReturnValue(false);

            const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

            expect(result).toBe(false);
            expect(ReportUtils.isMoneyRequestReportEligibleForMerge).toHaveBeenCalledWith(reports.at(0), false);
        });

        it('should return false when one of multiple reports is not eligible', () => {
            const transactions = [createMock<Transaction>({transactionID: '1', amount: 100}), createMock<Transaction>({transactionID: '2', amount: 200})];
            const reports = createMock<Report[]>([
                {reportID: '1', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                {reportID: '2', type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy2'},
            ]);
            const policies = createMock<Policy[]>([
                {id: 'policy1', role: CONST.POLICY.ROLE.ADMIN},
                {id: 'policy2', role: CONST.POLICY.ROLE.USER},
            ]);

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
                const transaction1 = createMock<Transaction>({
                    transactionID: '1',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 100,
                });
                const transaction2 = createMock<Transaction>({
                    transactionID: '2',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 200,
                });
                const transactions = [transaction1, transaction2];
                const reports: Report[] = [];
                const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies);

                expect(result).toBe(true);
            });

            it('should return true when both reported transactions have the same owner', () => {
                const transaction1 = createMock<Transaction>({
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                });
                const transaction2 = createMock<Transaction>({
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                });
                const transactions = [transaction1, transaction2];
                const reports = createMock<Report[]>([
                    {reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                    {reportID: 'report2', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                ]);
                const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(true);
            });

            it('should return false when both reported transactions belong to different users', () => {
                const transaction1 = createMock<Transaction>({
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                });
                const transaction2 = createMock<Transaction>({
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                });
                const transactions = [transaction1, transaction2];
                const reports = createMock<Report[]>([
                    {reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                    {reportID: 'report2', ownerAccountID: MANAGER_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'},
                ]);
                const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(false);
            });

            it('should return true when first transaction is unreported and second belongs to current user', () => {
                const transaction1 = createMock<Transaction>({
                    transactionID: '1',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 100,
                });
                const transaction2 = createMock<Transaction>({
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                });
                const transactions = [transaction1, transaction2];
                const reports = createMock<Report[]>([{reportID: 'report2', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}]);
                const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(true);
            });

            it('should return true when second transaction is unreported and first belongs to current user', () => {
                const transaction1 = createMock<Transaction>({
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                });
                const transaction2 = createMock<Transaction>({
                    transactionID: '2',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 200,
                });
                const transactions = [transaction1, transaction2];
                const reports = createMock<Report[]>([{reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}]);
                const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, EMPLOYEE_ACCOUNT_ID);

                expect(result).toBe(true);
            });

            it('should return false when first transaction is unreported and second belongs to different user', () => {
                const transaction1 = createMock<Transaction>({
                    transactionID: '1',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 100,
                });
                const transaction2 = createMock<Transaction>({
                    transactionID: '2',
                    reportID: 'report2',
                    amount: 200,
                });
                const transactions = [transaction1, transaction2];
                const reports = createMock<Report[]>([{reportID: 'report2', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}]);
                const policies = createMock<Policy[]>([{id: 'policy1'}]);

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, MANAGER_ACCOUNT_ID);

                expect(result).toBe(false);
            });

            it('should return false when second transaction is unreported and first belongs to different user', () => {
                const transaction1 = createMock<Transaction>({
                    transactionID: '1',
                    reportID: 'report1',
                    amount: 100,
                });
                const transaction2 = createMock<Transaction>({
                    transactionID: '2',
                    reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 200,
                });
                const transactions = [transaction1, transaction2];
                const reports = createMock<Report[]>([{reportID: 'report1', ownerAccountID: EMPLOYEE_ACCOUNT_ID, type: CONST.REPORT.TYPE.EXPENSE, policyID: 'policy1'}]);
                const policies = createMock<Policy[]>([{id: 'policy1', role: CONST.POLICY.ROLE.ADMIN}]);

                const result = isMergeActionForSelectedTransactions(transactions, reports, policies, MANAGER_ACCOUNT_ID);

                expect(result).toBe(false);
            });
        });
    });

    describe('isChangeWorkspaceAction', () => {
        // Helper functions
        const createReport = (overrides = {}) =>
            createMock<Report>({
                reportID: String(REPORT_ID),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: EMPLOYEE_ACCOUNT_ID,
                policyID: POLICY_ID,
                ...overrides,
            });

        const createPolicy = (id: string) =>
            createMock<Policy>({
                id,
                type: CONST.POLICY.TYPE.TEAM,
            });

        const createPolicies = (...policyIds: string[]) =>
            policyIds.reduce((acc, id) => {
                acc[`${ONYXKEYS.COLLECTION.POLICY}${id}`] = createPolicy(id);
                return acc;
            }, createMock<Record<string, Policy>>({}));

        type MockFunction = ((...args: unknown[]) => unknown) | boolean;
        type MockConfig = Partial<{
            isIOUReport: boolean;
            doesReportContainRequestsFromMultipleUsers: boolean;
            isCurrentUserSubmitter: boolean;
            isReportManager: boolean;
            isWorkspaceEligibleForReportChange: MockFunction;
            canEditReportPolicy: boolean;
            isExported: boolean;
            isSettled: boolean;
        }>;

        const setupMocks = (mocks: MockConfig = {}) => {
            const defaults = {
                isIOUReport: false,
                doesReportContainRequestsFromMultipleUsers: false,
                isCurrentUserSubmitter: false,
                isReportManager: false,
                isWorkspaceEligibleForReportChange: true,
                canEditReportPolicy: true,
                isExported: false,
                isSettled: false,
            };

            for (const [method, value] of Object.entries({...defaults, ...mocks})) {
                if (typeof value === 'function') {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-argument
                    jest.spyOn(ReportUtils, method as keyof typeof ReportUtils).mockImplementation(value as any);
                } else {
                    jest.spyOn(ReportUtils, method as keyof typeof ReportUtils).mockReturnValue(value);
                }
            }
        };

        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return false when IOU report contains requests from multiple users', () => {
            setupMocks({isIOUReport: true, doesReportContainRequestsFromMultipleUsers: true});
            const report = createReport({type: CONST.REPORT.TYPE.IOU});
            const policies = createPolicies(POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(false);
        });

        it('should return false when IOU report and user is neither submitter nor manager', () => {
            setupMocks({isIOUReport: true});
            const report = createReport({type: CONST.REPORT.TYPE.IOU});
            const policies = createPolicies(POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(false);
        });

        it('should return false when there are no available policies', () => {
            setupMocks({isWorkspaceEligibleForReportChange: false});
            const report = createReport();
            const policies = createPolicies(POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(false);
        });

        it('should return false when only one available policy and it is the same as current report policy', () => {
            setupMocks();
            const report = createReport({policyID: POLICY_ID});
            const policies = createPolicies(POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(false);
        });

        it('should return true when only one available policy but report has no policy', () => {
            setupMocks();
            const report = createReport({policyID: undefined});
            const policies = createPolicies(POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(true);
        });

        it('should return true when only one available policy and it is different from current report policy', () => {
            setupMocks({isWorkspaceEligibleForReportChange: ((_, policy: Policy) => policy?.id === POLICY_ID) as MockFunction});
            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(true);
        });

        it('should return false when cannot edit report policy', () => {
            setupMocks({canEditReportPolicy: false});
            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(false);
        });

        it('should return false when report is exported', () => {
            setupMocks({isExported: true});
            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '', [])).toBe(false);
        });

        it('should return true when multiple available policies exist', () => {
            setupMocks();
            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID, 'another_policy');

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(true);
        });

        it('should return true when IOU report with single user and user is submitter', () => {
            setupMocks({isIOUReport: true, isCurrentUserSubmitter: true});
            const report = createReport({type: CONST.REPORT.TYPE.IOU, policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(true);
        });

        it('should return true when IOU report with single user and user is manager', () => {
            setupMocks({isIOUReport: true, isReportManager: true});
            const report = createReport({type: CONST.REPORT.TYPE.IOU, policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(true);
        });

        it('should return true when report is settled and currentUserLogin is admin of available policies', () => {
            setupMocks({isSettled: true});
            const mockedIsPolicyAdmin = jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPolicyAdmin as jest.Mock;
            mockedIsPolicyAdmin.mockReturnValue(true);

            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, ADMIN_EMAIL, '')).toBe(true);
        });

        it('should return false when report is settled and currentUserLogin is not admin of any policy', () => {
            setupMocks({isSettled: true});
            const mockedIsPolicyAdmin = jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPolicyAdmin as jest.Mock;
            mockedIsPolicyAdmin.mockReturnValue(false);

            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(false);
        });

        it('should filter policies by admin role using currentUserLogin when report is settled', () => {
            setupMocks({isSettled: true});
            const mockedIsPolicyAdmin = jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPolicyAdmin as jest.Mock;
            mockedIsPolicyAdmin.mockImplementation((policy: Policy, login?: string) => {
                return login === ADMIN_EMAIL && policy?.id === POLICY_ID;
            });

            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            // Admin user sees the one eligible policy (POLICY_ID) which differs from report's OLD_POLICY_ID
            expect(isChangeWorkspaceAction(report, policies, ADMIN_EMAIL, '')).toBe(true);
            // Non-admin user has all policies filtered out
            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(false);
        });

        it('should not filter policies by admin role when report is not settled', () => {
            setupMocks({isSettled: false});
            const mockedIsPolicyAdmin = jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPolicyAdmin as jest.Mock;
            mockedIsPolicyAdmin.mockReturnValue(false);

            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);

            // Even though isPolicyAdmin returns false, non-settled reports skip the admin check
            expect(isChangeWorkspaceAction(report, policies, EMPLOYEE_EMAIL, '')).toBe(true);
        });

        it('should pass currentUserLogin to isPolicyAdmin for each candidate policy when settled', () => {
            setupMocks({isSettled: true});
            const mockedIsPolicyAdmin = jest.requireMock<typeof PolicyUtils>('@libs/PolicyUtils').isPolicyAdmin as jest.Mock;
            mockedIsPolicyAdmin.mockReturnValue(true);

            const report = createReport({policyID: OLD_POLICY_ID});
            const policies = createPolicies(POLICY_ID, OLD_POLICY_ID);
            const testLogin = 'specific-user@mail.com';

            isChangeWorkspaceAction(report, policies, testLogin, '');

            const callsWithLogin = mockedIsPolicyAdmin.mock.calls.filter((call: unknown[]) => call.at(1) === testLogin);
            expect(callsWithLogin.length).toBeGreaterThan(0);
        });
    });
});
