import {canApproveBill, canPayBill, isBillPayReport} from '@libs/BillPayUtils';
import {translate} from '@libs/Localize';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {canRejectReportAction, getReimbursementQueuedActionMessage} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Policy, Report, ReportAction, Transaction} from '@src/types/onyx';

import createMock from '../utils/createMock';

describe('Bill Pay', () => {
    beforeAll(async () => {
        await IntlStore.load(CONST.LOCALES.EN);
    });

    const accountID = 123;
    const email = 'payer@example.com';
    const policy: Policy = {
        id: 'workspace',
        name: 'Bills',
        type: CONST.POLICY.TYPE.CORPORATE,
        role: CONST.POLICY.ROLE.ADMIN,
        owner: email,
        reimburser: email,
        reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
        outputCurrency: CONST.CURRENCY.USD,
    };
    const bill: Report = {
        reportID: '100',
        type: CONST.REPORT.TYPE.BILL,
        policyID: policy.id,
        ownerAccountID: accountID,
        managerID: accountID,
        total: -125,
        currency: CONST.CURRENCY.USD,
        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
    };

    it('moves a bill from approval to payment only after final approval', () => {
        expect(canApproveBill(bill, accountID)).toBe(true);
        expect(canPayBill(bill, policy, accountID, email)).toBe(false);
        const approved = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
        expect(canApproveBill(approved, accountID)).toBe(false);
        expect(canPayBill(approved, policy, accountID, email)).toBe(true);
        expect(canPayBill({...approved, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}, policy, accountID, email)).toBe(false);
        expect(canPayBill({...approved, isWaitingOnBankAccount: true}, policy, accountID, email)).toBe(false);
    });

    it('lets the payer pay a bill again after its payment is canceled on a workspace with approvals turned off', () => {
        // Given a bill that a canceled payment left Submitted and Closed.
        const canceled = {...bill, stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.CLOSED};

        // Then the payer can pay it when approvals are turned off, but not when the workspace requires approval.
        expect(canPayBill(canceled, {...policy, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}, accountID, email)).toBe(true);
        expect(canPayBill(canceled, policy, accountID, email)).toBe(false);
    });

    it.each([
        [CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED, CONST.REPORT.PRIMARY_ACTIONS.APPROVE],
        [CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED, CONST.REPORT.PRIMARY_ACTIONS.PAY],
    ] as const)('shows the bill header action for state %s and status %s', (stateNum, statusNum, expectedAction) => {
        // Given an approver who is also the payer, only the bill's workflow stage determines the header action.
        const report: Report = {...bill, stateNum, statusNum};
        const transaction = createMock<Transaction>({transactionID: '300', reportID: bill.reportID, amount: 125, currency: CONST.CURRENCY.USD});

        // When the report header resolves its primary action with the bill transaction loaded.
        const action = getReportPrimaryAction({
            report,
            currentUserAccountID: accountID,
            currentUserLogin: email,
            policy,
            ownerLogin: email,
            reportTransactions: [transaction],
            violations: {},
            bankAccountList: {},
            chatReport: undefined,
            isChatReportArchived: false,
            rules: undefined,
        });

        // Then Submitted offers Approve and final approval replaces it with Pay.
        expect(action).toBe(expectedAction);
    });

    it('names the vendor when a bill payment waits for a bank account', () => {
        // Given an approved bill whose payment waits because its vendor has no deposit account.
        const vendorAccountID = 456;
        const waitingBill: Report = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED, billSenderAccountID: vendorAccountID};
        const queuedAction = createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED>>({
            actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
            originalMessage: {},
        });
        const personalDetails = {
            [accountID]: {accountID, login: email, displayName: 'Bill Owner'},
            [vendorAccountID]: {accountID: vendorAccountID, login: 'billing@vendor.com', displayName: 'Vendor'},
        };

        // When the bill shows the queued payment.
        const message = getReimbursementQueuedActionMessage({
            reportAction: queuedAction,
            report: waitingBill,
            translate: <TPath extends TranslationPaths>(key: TPath, ...parameters: TranslationParameters<TPath>) => translate(CONST.LOCALES.EN, key, ...parameters),
            formatPhoneNumber: (phone) => phone,
            personalDetails,
        });

        // Then it waits for the vendor, who receives the payment, to add a bank account, not for the bill's owner to add a personal one.
        expect(message).toBe('started payment, but is waiting for Vendor to add a bank account.');
    });

    it('does not offer Reject to the approver of a submitted bill', () => {
        // Given a submitted bill and an expense report in the same state, both waiting for the current user to approve.
        const expenseReport: Report = {...bill, type: CONST.REPORT.TYPE.EXPENSE};

        // When the approver opens their actions, then only the expense report offers Reject, because Auth can't reject bills.
        expect(canRejectReportAction(bill, accountID, policy)).toBe(false);
        expect(canRejectReportAction(expenseReport, accountID, policy)).toBe(true);
    });

    it('offers payment to the bill receiver, the reimburser, and the workspace and payments admins', () => {
        // Given an approved bill that its receiver owns, on a policy whose reimburser is another user
        const approved = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
        const memberPolicy: Policy = {...policy, role: CONST.POLICY.ROLE.USER, reimburser: 'reimburser@example.com'};
        const otherAccountID = 456;

        // When each user checks whether they can pay the bill
        // Then the receiver, the reimburser, a workspace admin and a payments admin can pay it, as in Classic
        expect(canPayBill(approved, memberPolicy, accountID, email)).toBe(true);
        expect(canPayBill(approved, memberPolicy, otherAccountID, 'reimburser@example.com')).toBe(true);
        expect(canPayBill(approved, {...memberPolicy, role: CONST.POLICY.ROLE.ADMIN}, otherAccountID, 'admin@example.com')).toBe(true);
        expect(canPayBill(approved, {...memberPolicy, role: CONST.POLICY.ROLE.PAYMENTS_ADMIN}, otherAccountID, 'payments@example.com')).toBe(true);

        // And other members of the policy can't
        expect(canPayBill(approved, memberPolicy, otherAccountID, 'member@example.com')).toBe(false);
    });

    it.each([CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO, CONST.POLICY.DEPRECATED_REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO])(
        'hides the report Pay action when workspace payments are disabled with %s',
        (reimbursementChoice) => {
            // Given an approved bill whose workspace payer can pay when payments are enabled.
            const approved: Report = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
            const params = {
                report: approved,
                currentUserAccountID: accountID,
                currentUserLogin: email,
                policy,
                ownerLogin: email,
                reportTransactions: [],
                violations: {},
                bankAccountList: {},
                chatReport: undefined,
                isChatReportArchived: false,
                rules: undefined,
            };
            expect(getReportPrimaryAction(params)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);

            // When the workspace disables payments using either its current or Classic setting.
            const disabledPolicy = {...policy, reimbursementChoice};

            // Then the same approved bill offers no Pay action.
            expect(canPayBill(approved, disabledPolicy, accountID, email)).toBe(false);
            expect(getReportPrimaryAction({...params, policy: disabledPolicy})).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        },
    );

    it('includes received standalone invoices without requiring a room', () => {
        const invoice: Report = {...bill, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: 456};
        expect(isBillPayReport(invoice, accountID)).toBe(true);
        expect(canPayBill(invoice, undefined, accountID, email)).toBe(true);
        expect(isBillPayReport(invoice, 456)).toBe(false);
        expect(isBillPayReport({...invoice, isHiddenForBillReceiver: true}, accountID)).toBe(false);
    });

    it('keeps business invoices visible to receivers identified by Auth', () => {
        const invoice: Report = {...bill, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: 456, managerID: 789, isBillPayReport: true};
        expect(isBillPayReport(invoice, accountID)).toBe(true);
        expect(canPayBill(invoice, undefined, accountID, email)).toBe(true);
    });
});
