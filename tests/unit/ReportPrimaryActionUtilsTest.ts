import {renderHook} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {getReportPrimaryAction, getTransactionThreadPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, Transaction, TransactionViolation} from '@src/types/onyx';
import {chatReportR14932 as chatReport} from '../../__mocks__/reportData/reports';
import * as InvoiceData from '../data/Invoice';
import type {InvoiceTestData} from '../data/Invoice';

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
const CHAT_REPORT_ID = 2;
const POLICY_ID = 3;
const INVOICE_SENDER_ACCOUNT_ID = 4;

// This keeps the error "@rnmapbox/maps native code not available." from causing the tests to fail
jest.mock('@components/ConfirmedRoute.tsx');

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

    it('should return ADD_EXPENSE for expense report with no transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [], violations: {}, policy: {} as Policy})).toBe(CONST.REPORT.PRIMARY_ACTIONS.ADD_EXPENSE);
    });

    it('should return SUBMIT for expense report with manual submit', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe(CONST.REPORT.PRIMARY_ACTIONS.SUBMIT);
    });

    it('should not return SUBMIT option for admin with only pending transactions', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        const policy = {
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE,
        };
        const transaction = {
            reportID: `${REPORT_ID}`,
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe('');
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

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe(CONST.REPORT.PRIMARY_ACTIONS.APPROVE);
    });

    it('should return empty for report being processed but transactions are scanning', async () => {
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
            receipt: {
                state: CONST.IOU.RECEIPT_STATE.SCANNING,
            },
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe('');
    });

    it('should return empty for report being processed but transactions are pending', async () => {
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
            status: CONST.TRANSACTION.STATUS.PENDING,
            amount: 10,
            merchant: 'Merchant',
            date: '2025-01-01',
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe('');
    });

    it('should return PAY for submitted invoice report  if paid as personal', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 7,
        } as unknown as Report;
        const parentReport = {
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: CURRENT_USER_ACCOUNT_ID,
            },
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const policy = {} as Policy;
        const invoiceReceiverPolicy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as Policy;
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy, invoiceReceiverPolicy})).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should not return PAY for zero value invoice report if paid as personal', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 0,
        } as unknown as Report;
        const parentReport = {
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                accountID: CURRENT_USER_ACCOUNT_ID,
            },
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const policy = {} as Policy;
        const invoiceReceiverPolicy = {
            role: CONST.POLICY.ROLE.ADMIN,
        } as Policy;
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy, invoiceReceiverPolicy})).toBe('');
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
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
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
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe(
            CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING,
        );
    });

    it('should not return EXPORT TO ACCOUNTING for invoice reports', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
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
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).not.toBe(
            CONST.REPORT.PRIMARY_ACTIONS.EXPORT_TO_ACCOUNTING,
        );
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

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [], violations: {}, policy: policy as Policy, reportNameValuePairs: {}, reportActions})).toBe('');
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
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
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

        expect(getReportPrimaryAction({report, chatReport, reportTransactions: [transaction], violations: {}, policy: policy as Policy})).toBe(CONST.REPORT.PRIMARY_ACTIONS.REMOVE_HOLD);
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

        expect(
            getReportPrimaryAction({
                report,
                chatReport,
                reportTransactions: [transaction],
                violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
                policy: policy as Policy,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
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

        expect(
            getReportPrimaryAction({
                report,
                chatReport,
                reportTransactions: [transaction],
                violations: {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${TRANSACTION_ID}`]: [violation]},
                policy: policy as Policy,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.MARK_AS_CASH);
    });

    it('should return an empty string for invoice report when the chat report is archived', async () => {
        // Given the invoice data
        const {policy, convertedInvoiceChat: invoiceChatReport}: InvoiceTestData = InvoiceData;
        const report = {
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            chatReportID: invoiceChatReport.chatReportID,
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.chatReportID}`, {
            private_isArchived: new Date().toString(),
        });
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        // Simulate how components determine if a chat report is archived by using this hook
        const {result: isChatReportArchived} = renderHook(() => useReportIsArchived(report?.chatReportID));

        // Then the getReportPrimaryAction should return the empty string
        expect(
            getReportPrimaryAction({
                report,
                chatReport: invoiceChatReport,
                reportTransactions: [transaction],
                violations: {},
                // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
                policy: policy as Policy,
                isChatReportArchived: isChatReportArchived.current,
            }),
        ).toBe('');
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

    it('Should return empty string when we are waiting for user to add a bank account', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: CURRENT_USER_ACCOUNT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            isWaitingOnBankAccount: true,
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
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;

        expect(
            getReportPrimaryAction({
                report,
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                policy: policy as Policy,
            }),
        ).toBe('');
    });

    it('should return PAY for submitted invoice report if paid as business and the payer is the policy admin', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 7,
        } as unknown as Report;
        const parentReport = {
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: POLICY_ID,
            },
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const invoiceReceiverPolicy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;
        expect(
            getReportPrimaryAction({
                report,
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                policy: {} as Policy,
                invoiceReceiverPolicy: invoiceReceiverPolicy as Policy,
            }),
        ).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('should not return PAY for zero value invoice report if paid as business and the payer is the policy admin', async () => {
        const report = {
            reportID: REPORT_ID,
            type: CONST.REPORT.TYPE.INVOICE,
            ownerAccountID: INVOICE_SENDER_ACCOUNT_ID,
            parentReportID: CHAT_REPORT_ID,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            total: 0,
        } as unknown as Report;
        const parentReport = {
            reportID: CHAT_REPORT_ID,
            invoiceReceiver: {
                type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                policyID: POLICY_ID,
            },
        } as unknown as Report;
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${CHAT_REPORT_ID}`, parentReport);
        const invoiceReceiverPolicy = {
            role: CONST.POLICY.ROLE.ADMIN,
        };
        const transaction = {
            reportID: `${REPORT_ID}`,
        } as unknown as Transaction;
        expect(
            getReportPrimaryAction({
                report,
                chatReport,
                reportTransactions: [transaction],
                violations: {},
                policy: {} as Policy,
                invoiceReceiverPolicy: invoiceReceiverPolicy as Policy,
            }),
        ).toBe('');
    });
});
