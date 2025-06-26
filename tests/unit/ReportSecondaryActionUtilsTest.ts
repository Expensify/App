import Onyx from 'react-native-onyx';
import {getSecondaryExportReportActions, getSecondaryReportActions, getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
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
        expect(getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy})).toEqual(result);
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
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = {
            transactionID: TRANSACTION_ID,
        } as unknown as Transaction;

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy});
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
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy});
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
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy});
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy});
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

        const result = getSecondaryReportActions({
            report,
            chatReport,
            reportTransactions: [transaction],
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            policy,
        });
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

        const result = getSecondaryReportActions({
            report,
            chatReport,
            reportTransactions: [transaction],
            violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
            policy,
        });
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('does not include APPROVE option for report with transactions are being scanned', () => {
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(false);
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy});
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy});
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

        const result = getSecondaryReportActions({
            report,
            chatReport,
            reportTransactions: [
                {
                    transactionID: TRANSACTION_ID,
                } as unknown as Transaction,
            ],
            violations: {},
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
            comment: {},
        } as unknown as Transaction;
        const policy = {} as unknown as Policy;

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: true, canUnholdRequest: true});
        jest.spyOn(ReportActionsUtils, 'getOneTransactionThreadReportID').mockReturnValueOnce(originalMessageR14932.IOUTransactionID);
        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy, reportActions: [actionR14932]});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.HOLD)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for submitted IOU report and manager being the payer of the new policy', async () => {
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy, policies});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy, policies});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for submitter, submitted report without approvals', async () => {
        const oldPolicy = {
            id: OLD_POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
            approver: MANAGER_EMAIL,
            employeeList: {
                [MANAGER_EMAIL]: {email: MANAGER_EMAIL, role: CONST.POLICY.ROLE.USER},
                [EMPLOYEE_EMAIL]: {email: EMPLOYEE_EMAIL, role: CONST.POLICY.ROLE.USER},
            },
        } as unknown as Policy;

        const newPolicy = {
            id: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
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
            report,
            chatReport,
            reportTransactions: [],
            violations: {},
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy, policies});
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [], violations: {}, policy, policies});
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [{} as Transaction], violations: {}, policy});
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy, reportActions});
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy, reportActions});
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction1, transaction2], violations: {}, policy, reportActions});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('includes DELETE option for owner of single processing expense transaction', async () => {
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
        } as unknown as Transaction;

        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });

    it('includes DELETE option for owner of processing expense report', async () => {
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

        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction1, transaction2], violations: {}, policy});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
    });

    it('does not include DELETE option for report that has been forwarded', async () => {
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

        const result = getSecondaryReportActions({report, chatReport, reportTransactions: [transaction], violations: {}, policy});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(false);
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

    it('should always return default option', () => {
        const report = {} as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = [CONST.REPORT.EXPORT_OPTIONS.DOWNLOAD_CSV];
        expect(getSecondaryExportReportActions(report, policy)).toEqual(result);
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

        const result = getSecondaryExportReportActions(report, policy);
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
            role: CONST.POLICY.ROLE.ADMIN,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {}},
        } as unknown as Policy;

        const result = getSecondaryExportReportActions(report, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.EXPORT_TO_INTEGRATION)).toBe(true);
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

        const result = getSecondaryExportReportActions(report, policy);
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

        const result = getSecondaryExportReportActions(report, policy);
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

        const result = getSecondaryExportReportActions(report, policy);
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

        const result = getSecondaryExportReportActions(report, policy);
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

        const result = getSecondaryExportReportActions(report, policy);
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

        const result = getSecondaryExportReportActions(report, policy);
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

        const result = getSecondaryExportReportActions(report, policy);
        expect(result.includes(CONST.REPORT.EXPORT_OPTIONS.MARK_AS_EXPORTED)).toBe(true);
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
        expect(getSecondaryTransactionThreadActions(report, {} as Transaction, [], policy)).toEqual(result);
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

        const policy = {} as unknown as Policy;

        jest.spyOn(ReportUtils, 'canHoldUnholdReportAction').mockReturnValueOnce({canHoldRequest: true, canUnholdRequest: true});
        const result = getSecondaryTransactionThreadActions(report, transaction, [actionR14932], policy);
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

        const policy = {} as unknown as Policy;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryTransactionThreadActions(report, {} as Transaction, [], policy);
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });
});
