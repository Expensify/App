import Onyx from 'react-native-onyx';
import {getSecondaryReportActions, getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';

const CURRENT_USER_ACCOUNT_ID = 1;
const CURRENT_USER_EMAIL = 'tester@mail.com';
const OTHER_USER_EMAIL = 'tester1@mail.com';

const SESSION = {
    email: CURRENT_USER_EMAIL,
    accountID: CURRENT_USER_ACCOUNT_ID,
};

const PERSONAL_DETAILS = {
    accountID: CURRENT_USER_ACCOUNT_ID,
    login: CURRENT_USER_EMAIL,
};

const REPORT_ID = 1;
const POLICY_ID = 'POLICY_ID';
const POLICY_ID2 = 'POLICY_ID2';

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
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: PERSONAL_DETAILS});
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {
            approver: CURRENT_USER_EMAIL,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            managerID: CURRENT_USER_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {} as unknown as Policy;
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            managerID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {approver: CURRENT_USER_EMAIL} as unknown as Policy;

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for report paid elsewhere', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: CURRENT_USER_EMAIL}, autoSync: {enabled: false}}}},
        } as unknown as Policy;

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for expense report admin', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: OTHER_USER_EMAIL}, autoSync: {enabled: true}}}},
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes HOLD option ', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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

    it('includes CHANGE_WORKSPACE option for closed expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        } as unknown as Report;

        const policy = {
            id: POLICY_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
            areWorkflowsEnabled: false,
        } as unknown as Policy;
        const policy2 = {
            id: POLICY_ID2,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID2}`, policy2);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for opened expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        } as unknown as Report;
        const policy = {
            id: POLICY_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const policy2 = {
            id: POLICY_ID2,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID2}`, policy2);

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for opened expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;
        const policy = {
            id: POLICY_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
            approver: CURRENT_USER_EMAIL,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const policy2 = {
            id: POLICY_ID2,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID2}`, policy2);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for approved expense report payer', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            id: POLICY_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {role: CONST.POLICY.ROLE.ADMIN}},
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const policy2 = {
            id: POLICY_ID2,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {role: CONST.POLICY.ROLE.ADMIN}},
            role: CONST.POLICY.ROLE.ADMIN,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID2}`, policy2);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for not exported expense report admin', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        } as unknown as Report;
        const policy = {
            id: POLICY_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const policy2 = {
            id: POLICY_ID2,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID2}`, policy2);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for IOU report receiver', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            managerID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        } as unknown as Report;
        const policy = {
            id: POLICY_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const policy2 = {
            id: POLICY_ID2,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            employeeList: {[CURRENT_USER_EMAIL]: {}},
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID2}`, policy2);

        const result = getSecondaryReportActions(report, [], {}, policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes DELETE option for expense report submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[CURRENT_USER_ACCOUNT_ID]: PERSONAL_DETAILS});
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
        } as unknown as Report;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(report, {} as Transaction);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });
});
