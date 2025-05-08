import Onyx from 'react-native-onyx';
import {getSecondaryReportActions, getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';

const EMPLOYEE_ACCOUNT_ID = 1;
const EMPLOYEE_EMAIL = 'employee@mail.com';
const MANAGER_ACCOUNT_ID = 2;
const MANAGER_EMAIL = 'manager@mail.com';
const APPROVER_ACCOUNT_ID = 3;
const APPROVER_EMAIL = 'approver@mail.com';
const PAYER_ACCOUNT_ID = 4;
const PAYER_EMAIL = 'payer@mail.com';
const ADMIN_ACCOUNT_ID = 5;
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
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[EMPLOYEE_ACCOUNT_ID]: PERSONAL_DETAILS});
    });

    it('should always return default options', () => {
        const report = {} as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD, CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS];
        expect(getSecondaryReportActions(report, [], {}, policy)).toEqual(result);
    });

    it('includes SUBMIT option', async () => {
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
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

        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
            {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
            } as TransactionViolation,
        ]);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions(report, [transaction], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('includes APPROVE option for report with RTER violations for all transactions', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: EMPLOYEE_ACCOUNT_ID,
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

        const result = getSecondaryReportActions(report, [transaction], {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('includes APPROVE option for admin and report with broken connection', () => {
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

        const result = getSecondaryReportActions(report, [transaction], {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('includes UNAPPROVE option', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {approver: EMPLOYEE_EMAIL} as unknown as Policy;

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for report paid elsewhere', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for report before nacha cutoff', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: true,
        } as unknown as Report;
        const policy = {role: CONST.POLICY.ROLE.ADMIN} as unknown as Policy;
        const TRANSACTION_ID = 'transaction_id';
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const ACTION_ID = 'action_id';
        const reportAction = {
            actionID: ACTION_ID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            message: {
                IOUTransactionID: TRANSACTION_ID,
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
            },
            created: '2025-03-06 18:00:00.000',
        } as unknown as ReportAction;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[ACTION_ID]: reportAction});

        const result = getSecondaryReportActions(
            report,
            [
                {
                    transactionID: TRANSACTION_ID,
                } as unknown as Transaction,
            ],
            {},
            policy,
        );
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes EXPORT option for invoice submitter', async () => {
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING)).toBe(true);
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
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        } as unknown as Policy;

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING)).toBe(true);
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING)).toBe(true);
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report preffered exporter', () => {
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
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

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
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
            comment: {},
        } as unknown as Transaction;
        const policy = {} as unknown as Policy;

        const result = getSecondaryReportActions(report, [transaction], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for IOU and both submitter and payer members', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;
        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };
        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            employeeList: {
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for IOU and the submitter is not a member but current user is admin', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;
        const personalDetails = {
            [ADMIN_ACCOUNT_ID]: {login: ADMIN_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };
        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for opened expense report submitter', async () => {
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
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
        };

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: EMPLOYEE_EMAIL, accountID: EMPLOYEE_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for approver', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
            [APPROVER_ACCOUNT_ID]: {login: APPROVER_EMAIL},
        };

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: APPROVER_EMAIL,
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: APPROVER_EMAIL, accountID: APPROVER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for payer', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [MANAGER_ACCOUNT_ID]: {login: MANAGER_EMAIL},
            [APPROVER_ACCOUNT_ID]: {login: APPROVER_EMAIL},
        };

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: APPROVER_EMAIL,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            // achAccount: {
            //     reimburser: PAYER_EMAIL,
            // },
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
                [PAYER_EMAIL]: {email: PAYER_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: PAYER_EMAIL, accountID: PAYER_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for admin', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            managerID: MANAGER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        } as unknown as Report;

        const personalDetails = {
            [EMPLOYEE_ACCOUNT_ID]: {login: EMPLOYEE_EMAIL},
            [ADMIN_ACCOUNT_ID]: {login: ADMIN_EMAIL},
        };

        const policy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            employeeList: {
                [ADMIN_EMAIL]: {email: ADMIN_EMAIL, role: CONST.POLICY.ROLE.ADMIN},
            },
        } as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(ONYXKEYS.SESSION, {email: ADMIN_EMAIL, accountID: ADMIN_ACCOUNT_ID});
        await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails);

        const result = getSecondaryReportActions(report, [], {}, policy);
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

        const result = getSecondaryReportActions(report, [{} as Transaction], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
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

        const result = [CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.VIEW_DETAILS];
        expect(getSecondaryTransactionThreadActions(report, {} as Transaction)).toEqual(result);
    });

    it('include HOLD option ', () => {
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

        const result = getSecondaryTransactionThreadActions(report, transaction);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });

    it('include DELETE option for expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: EMPLOYEE_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        } as unknown as Report;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(report, {} as Transaction);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });
});
