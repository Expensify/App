import Onyx from 'react-native-onyx';
import getSecondaryAction from '@libs/ReportSecondaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';

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
        // await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = [CONST.REPORT.SECONDARY_ACTIONS.DOWNLOAD, CONST.REPORT.SECONDARY_ACTIONS.VIEW_DETAILS];
        expect(getSecondaryAction(report, policy, [], {})).toEqual(result);
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

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.SUBMIT)).toBe(true);
    });

    it('includes APPROVE option for approver and report with duplicates', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
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

        const result = getSecondaryAction(report, policy, [transaction], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('includes APPROVE option for report with RTER violations for all transactions', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
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

        const result = getSecondaryAction(report, policy, [transaction], {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.APPROVE)).toBe(true);
    });

    it('includes APPROVE option for admin and report with broken connection', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
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

        const result = getSecondaryAction(report, policy, [transaction], {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]});
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

        const result = getSecondaryAction(report, policy, [], {});
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
        const policy = {} as unknown as Policy;

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes CANCEL_PAYMENT option for report before nacha cutoff', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        } as unknown as Report;
        const policy = {} as unknown as Policy;
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

        const result = getSecondaryAction(
            report,
            policy,
            [
                {
                    transactionID: TRANSACTION_ID,
                } as unknown as Transaction,
            ],
            {},
        );
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT)).toBe(true);
    });

    it('includes EXPORT option for invoice submitter', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryAction(report, policy, [], {});
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

        const result = getSecondaryAction(report, policy, [], {});
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

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.EXPORT_TO_ACCOUNTING)).toBe(true);
    });

    it('includes MARK_AS_EXPORTED option for invoice report sender', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
        } as unknown as Report;
        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryAction(report, policy, [], {});
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
        } as unknown as Policy;

        const result = getSecondaryAction(report, policy, [], {});
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

        const result = getSecondaryAction(report, policy, [], {});
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
            connections: {[CONST.POLICY.CONNECTIONS.NAME.QBD]: {config: {export: {exporter: CURRENT_USER_EMAIL}}}},
        } as unknown as Policy;

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.MARK_AS_EXPORTED)).toBe(true);
    });

    it('includes HOLD option ', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
        } as unknown as Report;
        const policy = {} as unknown as Policy;

        const result = getSecondaryAction(report, policy, [], {});
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
            areWorkflowsEnabled: false,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryAction(report, policy, [], {});
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
        const policy = {} as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for opened expense report submitter', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;
        const policy = {
            approver: CURRENT_USER_EMAIL,
        } as unknown as Policy;

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for approved expense report payer', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for not exported expense report admin', () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        } as unknown as Report;
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as unknown as Policy;

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE)).toBe(true);
    });

    it('includes CHANGE_WORKSPACE option for IOU report receiver', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.IOU,
            managerID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
        } as unknown as Report;
        const POLICY_ID = 'policyID';
        const policy = {
            policyID: POLICY_ID,
            type: CONST.POLICY.TYPE.TEAM,
        } as unknown as Policy;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${POLICY_ID}`, policy);

        const result = getSecondaryAction(report, {} as Policy, [], {});
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

        const result = getSecondaryAction(report, policy, [], {});
        expect(result.includes(CONST.REPORT.SECONDARY_ACTIONS.DELETE)).toBe(true);
    });
});
