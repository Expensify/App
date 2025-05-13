import Onyx from 'react-native-onyx';
import {getReportPrimaryAction, getTransactionThreadPrimaryAction} from '@libs/ReportPrimaryActionUtils';
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

    it('should return SUBMIT for expense report with manual submit', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(getReportPrimaryAction(report, [{} as Transaction], {}, policy as Policy)).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });

    it('should return Approve for report being processed', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: CURRENT_USER_ACCOUNT_ID,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            approver: CURRENT_USER_EMAIL,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        };
        const transaction = {
            reportID: `${REPORT_ID}`,
            comment: {
                hold: 'Hold',
            },
        } as unknown as Transaction;

        expect(getReportPrimaryAction(report, [transaction], {}, policy as Policy)).toBe(CONST.REPORT.PRIMARY_ACTIONS.APPROVE);
    });

    it('should return PAY for submitted invoice report', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };

        expect(getReportPrimaryAction(report, [], {}, policy as Policy)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should return PAY for expense report with payments enabled', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: -300,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };

        expect(getReportPrimaryAction(report, [], {}, policy as Policy)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should return EXPORT TO ACCOUNTING for finished reports', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        } as unknown as Report;
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

        expect(getReportPrimaryAction(report, [], {}, policy as Policy)).toBe(CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING);
    });

    it('should not return EXPORT TO ACCOUNTING for reports marked manually as exported', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
        } as unknown as Report;
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
        const reportActions = [
            {actionName: CONST.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION, reportActionID: '1', created: '2025-01-01', originalMessage: {markedManually: true}},
        ] as unknown as ReportAction[];

        expect(getReportPrimaryAction(report, [], {}, policy as Policy, {}, reportActions)).toBe('');
    });

    it('should return REMOVE HOLD for reports with transactions on hold', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const HOLD_ACTION_ID = 'HOLD_ACTION_ID';
        const REPORT_ACTION_ID = 'REPORT_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const CHILD_REPORT_ID = 'CHILD_REPORT_ID';
        const transaction = {
            transactionID: TRANSACTION_ID,
            comment: {
                hold: HOLD_ACTION_ID,
            },
        } as unknown as Transaction;

        const reportAction = {
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            type: CONST.REPORT.ACTIONS.TYPE.IOU,
            reportActionID: REPORT_ACTION_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
            childReportID: CHILD_REPORT_ID,
            message: [
                {
                    html: 'html',
                },
            ],
            originalMessage: {
                type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                IOUTransactionID: TRANSACTION_ID,
            },
        } as unknown as ReportAction;

        const holdAction = {
            reportActionID: HOLD_ACTION_ID,
            reportID: CHILD_REPORT_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${REPORT_ID}`, {[REPORT_ACTION_ID]: reportAction});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {[HOLD_ACTION_ID]: holdAction});

        expect(getReportPrimaryAction(report, [transaction], {}, policy as Policy)).toBe(CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD);
    });

    it('should return MARK AS CASH if has all RTER violations', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            total: -300,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
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

        expect(getReportPrimaryAction(report, [transaction], {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]}, policy as Policy)).toBe(
            CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH,
        );
    });

    it('should return MARK AS CASH for broken connection', async () => {
        const report = {
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
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

        expect(getReportPrimaryAction(report, [transaction], {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]}, policy as Policy)).toBe(
            CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH,
        );
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
        const report = {
            reportID: CHILD_REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
        } as unknown as Report;

        const transaction = {
            transactionID: TRANSACTION_ID,
            comment: {
                hold: HOLD_ACTION_ID,
            },
        } as unknown as Transaction;

        const holdAction = {
            reportActionID: HOLD_ACTION_ID,
            reportID: CHILD_REPORT_ID,
            actorAccountID: CURRENT_USER_ACCOUNT_ID,
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${CHILD_REPORT_ID}`, {[HOLD_ACTION_ID]: holdAction});

        expect(getTransactionThreadPrimaryAction(report, {} as Report, transaction, [], policy as Policy)).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REMOVE_HOLD);
    });

    it('should return REVIEW DUPLICATES when there are duplicated transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
        const REPORT_ACTION_ID = 'REPORT_ACTION_ID';
        const TRANSACTION_ID = 'TRANSACTION_ID';
        const transaction = {
            transactionID: TRANSACTION_ID,
            comment: {
                hold: REPORT_ACTION_ID,
            },
        } as unknown as Transaction;

        await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${TRANSACTION_ID}`, transaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`, [
            {
                name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
            } as TransactionViolation,
        ]);

        expect(getTransactionThreadPrimaryAction({} as Report, report, transaction, [], policy as Policy)).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.REVIEW_DUPLICATES);
    });

    it('should return MARK AS CASH if has all RTER violations', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
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

        expect(getTransactionThreadPrimaryAction({} as Report, report, transaction, [violation], policy as Policy)).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('should return MARK AS CASH for broken connection', async () => {
        const report = {
            reportID: REPORT_ID,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            type: CONST.REPORT.TYPE.EXPENSE,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {};
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

        expect(getTransactionThreadPrimaryAction({} as Report, report, transaction, [violation], policy as Policy)).toBe(CONST.REPORT.TRANSACTION_PRIMARY_ACTIONS.MARK_AS_CASH);
    });
});
