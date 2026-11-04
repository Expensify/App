import {maybeUpdateReportNameForFormulaTitle} from '@libs/actions/IOU/MoneyRequestBuilder';
import isBillReport from '@libs/isBillReport';
import {navigationRef} from '@libs/Navigation/Navigation';
import getReportPreviewAction from '@libs/ReportPreviewActionUtils';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {getSecondaryReportActions, getSecondaryTransactionThreadActions} from '@libs/ReportSecondaryActionUtils';
import {
    canAddTransaction,
    canApproveBill,
    canDeleteMoneyRequestReport,
    canDeleteTransaction,
    canEditFieldOfMoneyRequest,
    canHoldUnholdReportAction,
    canIOUBePaid,
    canPayBill,
    canRejectReportAction,
    isExpenseReport,
    isReportOutstanding,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import createMock from '../utils/createMock';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const accountID = 123;
const email = 'payer@example.com';
const policy: Policy = {
    id: 'billPolicy',
    name: 'Bills',
    type: CONST.POLICY.TYPE.CORPORATE,
    role: CONST.POLICY.ROLE.ADMIN,
    owner: email,
    ownerAccountID: accountID,
    approver: email,
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
const expenseReport: Report = {...bill, reportID: '200', type: CONST.REPORT.TYPE.EXPENSE};
const approvedBill: Report = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
const approvedExpenseReport: Report = {...approvedBill, reportID: expenseReport.reportID, type: CONST.REPORT.TYPE.EXPENSE};

function createTransaction(report: Report): Transaction {
    return createMock<Transaction>({
        transactionID: `${report.reportID}1`,
        reportID: report.reportID,
        amount: -125,
        currency: CONST.CURRENCY.USD,
        merchant: 'Vendor',
        created: '2026-11-01',
        reimbursable: true,
    });
}

function createIOUAction(report: Report): ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> {
    return createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>({
        reportActionID: `${report.reportID}2`,
        reportID: report.reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: accountID,
        childReportID: `${report.reportID}3`,
        created: '2026-11-01 00:00:00.000',
        message: {
            IOUTransactionID: `${report.reportID}1`,
            IOUReportID: report.reportID,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount: 125,
            currency: CONST.CURRENCY.USD,
        },
    });
}

function getPrimaryAction(report: Report, reportNameValuePairs?: ReportNameValuePairs) {
    return getReportPrimaryAction({
        report,
        reportNameValuePairs,
        currentUserAccountID: accountID,
        currentUserLogin: email,
        policy,
        ownerLogin: email,
        reportTransactions: [createTransaction(report)],
        violations: {},
        bankAccountList: {},
        chatReport: undefined,
        isChatReportArchived: false,
        rules: undefined,
    });
}

function getSecondaryActions(report: Report) {
    const transaction = createTransaction(report);
    return getSecondaryReportActions({
        currentUserLogin: email,
        currentUserAccountID: accountID,
        submitterLogin: email,
        report,
        chatReport: undefined,
        reportTransactions: [transaction],
        originalTransaction: undefined,
        violations: {},
        bankAccountList: {},
        policy,
        reportActions: [createIOUAction(report)],
        policies: {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy},
        rules: undefined,
        cardList: undefined,
    });
}

function getTransactionThreadActions(report: Report) {
    const iouAction = createIOUAction(report);
    return getSecondaryTransactionThreadActions({
        currentUserLogin: email,
        currentUserAccountID: accountID,
        parentReport: report,
        parentReportOwnerLogin: email,
        parentReportActions: {[iouAction.reportActionID]: iouAction},
        reportTransaction: createTransaction(report),
        reportAction: iouAction,
        originalTransaction: undefined,
        policy,
        isChatReportArchived: false,
        rules: undefined,
        cardList: undefined,
    });
}

describe('Bill Pay', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});
        await IntlStore.load(CONST.LOCALES.EN);

        // isReportOutstanding reads the current route, and these tests render no navigation container.
        jest.spyOn(navigationRef, 'getCurrentRoute').mockReturnValue(undefined);
    });

    beforeEach(async () => {
        await Onyx.clear();
        await Onyx.set(ONYXKEYS.SESSION, {accountID, email});
        await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, {[accountID]: {accountID, login: email}});
        await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`, policy);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${bill.reportID}`, bill);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
        await waitForBatchedUpdates();
    });

    it('opens bills in the expense report view', () => {
        // Given a bill
        // When the app checks its type
        // Then it treats the bill as an expense report, so the expense report view opens it
        expect(isBillReport(bill)).toBe(true);
        expect(isExpenseReport(bill)).toBe(true);
        expect(isBillReport(expenseReport)).toBe(false);
    });

    it('lets only the approver approve a submitted bill', () => {
        // Given a submitted bill waiting on its approver
        // When the approver and another user check whether they can approve it, before and after approval
        // Then only the approver can, and only while the bill is submitted
        const transactions = [createTransaction(bill)];
        expect(canApproveBill(bill, policy, undefined, accountID, transactions)).toBe(true);
        expect(canApproveBill(bill, policy, undefined, 456, transactions)).toBe(false);
        expect(canApproveBill(approvedBill, policy, undefined, accountID, transactions)).toBe(false);
        expect(canApproveBill(expenseReport, policy, undefined, accountID, transactions)).toBe(false);
    });

    it('shows Approve as the primary action of a submitted bill for its approver', () => {
        // Given a submitted bill and the bill's approver
        // When the report header resolves its primary action
        // Then the approver sees Approve
        expect(getPrimaryAction(bill)).toBe(CONST.REPORT.PRIMARY_ACTIONS.APPROVE);
    });

    it('shows Pay on an approved bill', () => {
        // Given an approved bill that the current user can pay
        const transactions = [createTransaction(approvedBill)];

        // When the header and the settlement check look for Pay
        // Then the bill offers Pay as its primary action only, because only BillPaymentButton pays a bill
        expect(getPrimaryAction(approvedBill)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(canIOUBePaid(approvedBill, undefined, policy, {}, email, accountID, transactions, false, false)).toBe(true);
        expect(
            getReportPreviewAction({
                isReportArchived: false,
                currentUserAccountID: accountID,
                currentUserLogin: email,
                report: approvedBill,
                policy,
                transactions,
                bankAccountList: {},
                reportMetadata: undefined,
                ownerLogin: email,
                rules: undefined,
            }),
        ).toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
        expect(getSecondaryActions(approvedBill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.PAY);

        // And the owner can't mark it as a received payment, because the owner pays the vendor
        expect(getSecondaryActions(approvedBill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT);
    });

    it('keeps Pay as the primary action on a bill whose expenses are on hold', () => {
        // Given an approved bill whose only expense was put on hold, for example in Classic, and an expense report in the same state
        const heldBillTransaction: Transaction = {...createTransaction(approvedBill), comment: {hold: '999'}};
        const heldExpenseTransaction: Transaction = {...createTransaction(approvedExpenseReport), comment: {hold: '998'}};
        const getHeldPrimaryAction = (report: Report, transaction: Transaction) =>
            getReportPrimaryAction({
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

        // When the header resolves its primary action
        // Then the bill still offers Pay, because the More menu has no Pay on bills and Auth pays a bill in full
        expect(getHeldPrimaryAction(approvedBill, heldBillTransaction)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(getHeldPrimaryAction(approvedExpenseReport, heldExpenseTransaction)).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(getSecondaryActions(approvedBill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.PAY);
    });

    it('hides Pay on a bill whose linked invoice was deleted', () => {
        // Given an approved bill whose name value pairs loaded without an invoiceID, because the vendor deleted the invoice
        const unlinkedPairs: ReportNameValuePairs = {};
        const linkedPairs: ReportNameValuePairs = {invoiceID: 4321};

        // When the header resolves its primary action, with the pairs missing, linked and unlinked
        // Then Pay shows unless the loaded pairs have no invoice, because PayMoneyRequest pays the owner of the linked invoice
        expect(getPrimaryAction(approvedBill, unlinkedPairs)).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(canPayBill(approvedBill, policy, accountID, email, unlinkedPairs)).toBe(false);
        expect(getPrimaryAction(approvedBill, linkedPairs)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(canPayBill(approvedBill, policy, accountID, email, linkedPairs)).toBe(true);

        // And a bill whose pairs haven't loaded yet keeps Pay, so Pay doesn't flash off and on while the bill opens
        expect(getPrimaryAction(approvedBill)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
    });

    it('moves a bill from approval to payment only after final approval', () => {
        // Given a submitted bill
        // When it moves through approval and payment
        // Then the payer can pay it only after final approval, and not after it's paid or while a payment waits for a bank account
        expect(canPayBill(bill, policy, accountID, email)).toBe(false);
        expect(canPayBill(approvedBill, policy, accountID, email)).toBe(true);
        expect(canPayBill({...approvedBill, statusNum: CONST.REPORT.STATUS_NUM.CLOSED}, policy, accountID, email)).toBe(true);
        expect(canPayBill({...approvedBill, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}, policy, accountID, email)).toBe(false);
        expect(canPayBill({...approvedBill, isWaitingOnBankAccount: true}, policy, accountID, email)).toBe(false);
        expect(canPayBill({...approvedBill, total: 0}, policy, accountID, email)).toBe(false);
        expect(canPayBill(approvedExpenseReport, policy, accountID, email)).toBe(false);
    });

    it('lets the payer pay a bill again after its payment is canceled on a policy with approvals turned off', () => {
        // Given a bill that a canceled payment left submitted and closed
        const canceledBill: Report = {...bill, stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.CLOSED};

        // When the payer checks whether they can pay it
        // Then they can when approvals are turned off, but not when the policy requires approval
        expect(canPayBill(canceledBill, {...policy, approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL}, accountID, email)).toBe(true);
        expect(canPayBill(canceledBill, policy, accountID, email)).toBe(false);
    });

    it('lets the bill owner, the reimburser, and the policy and payments admins pay the bill', () => {
        // Given an approved bill that its owner received, on a policy whose reimburser is another user
        const memberPolicy: Policy = {...policy, role: CONST.POLICY.ROLE.USER, reimburser: 'reimburser@example.com'};
        const otherAccountID = 456;

        // When each user checks whether they can pay the bill
        // Then the owner, the reimburser, a policy admin and a payments admin can pay it, as in Classic
        expect(canPayBill(approvedBill, memberPolicy, accountID, email)).toBe(true);
        expect(canPayBill(approvedBill, memberPolicy, otherAccountID, 'reimburser@example.com')).toBe(true);
        expect(canPayBill(approvedBill, {...memberPolicy, role: CONST.POLICY.ROLE.ADMIN}, otherAccountID, 'admin@example.com')).toBe(true);
        expect(canPayBill(approvedBill, {...memberPolicy, role: CONST.POLICY.ROLE.PAYMENTS_ADMIN}, otherAccountID, 'payments@example.com')).toBe(true);

        // And other members of the policy can't
        expect(canPayBill(approvedBill, memberPolicy, otherAccountID, 'member@example.com')).toBe(false);
    });

    it.each([CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO, CONST.POLICY.DEPRECATED_REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO])(
        'hides Pay on a bill when the policy disables payments with %s',
        (reimbursementChoice) => {
            // Given an approved bill on a policy that disables payments with its current or its Classic setting
            const disabledPolicy: Policy = {...policy, reimbursementChoice};

            // When the payer checks whether they can pay the bill
            // Then they can't
            expect(canPayBill(approvedBill, disabledPolicy, accountID, email)).toBe(false);
        },
    );

    it('hides Pay on a bill of a policy that is being deleted', () => {
        // Given an approved bill on a policy that is being deleted
        // When the payer checks whether they can pay the bill
        // Then they can't, because payments can't go out from a deleted policy
        expect(canPayBill(approvedBill, {...policy, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}, accountID, email)).toBe(false);
    });

    it('keeps Unapprove on an approved bill', () => {
        // Given an approved bill
        // When its approver opens the More menu
        // Then they can still send it back with Unapprove
        expect(getSecondaryActions(approvedBill)).toContain(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE);
    });

    it('shows Cancel payment on a bill marked as paid', () => {
        // Given a bill that its payer marked as paid
        const paidBill: Report = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED};

        // When the payer opens the More menu
        // Then they can cancel the payment, like on an expense report
        expect(getSecondaryActions(paidBill)).toContain(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    });

    it('shows Cancel payment on a bill paid by bank only when Auth allows it', async () => {
        // Given a bill paid from a bank account
        const paidBill: Report = {...bill, stateNum: CONST.REPORT.STATE_NUM.BILLING, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED};
        const bankPayAction = createMock<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>>({
            reportActionID: '1004',
            reportID: paidBill.reportID,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            created: '2026-11-02 00:00:00.000',
            message: {type: CONST.IOU.REPORT_ACTION_TYPE.PAY, paymentType: CONST.IOU.PAYMENT_TYPE.VBBA, amount: 125, currency: CONST.CURRENCY.USD},
        });
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${paidBill.reportID}`, {[bankPayAction.reportActionID]: bankPayAction});
        await waitForBatchedUpdates();

        // When the payer opens the More menu, before and after Auth says the payment can be canceled
        // Then Cancel payment shows only when Auth allows it, because only Auth knows whether the bank payment went out
        expect(getSecondaryActions(paidBill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
        expect(getSecondaryActions({...paidBill, canCancelReimbursement: true})).toContain(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    });

    it('hides Cancel payment on a paid bill from users who cannot pay it', () => {
        // Given a bill marked as paid, and a member of the policy who isn't its owner, reimburser or admin
        const paidBill: Report = {...bill, ownerAccountID: 456, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED};
        const memberPolicy: Policy = {...policy, role: CONST.POLICY.ROLE.USER, reimburser: 'reimburser@example.com'};

        // When the member opens the More menu
        const actions = getSecondaryReportActions({
            currentUserLogin: email,
            currentUserAccountID: accountID,
            submitterLogin: 'owner@example.com',
            report: paidBill,
            chatReport: undefined,
            reportTransactions: [createTransaction(paidBill)],
            originalTransaction: undefined,
            violations: {},
            bankAccountList: {},
            policy: memberPolicy,
            reportActions: [createIOUAction(paidBill)],
            policies: {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: memberPolicy},
            rules: undefined,
            cardList: undefined,
        });

        // Then they can't cancel the payment, because they couldn't have paid the bill
        expect(actions).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
    });

    it('hides Reject on a submitted bill', () => {
        // Given a submitted bill and an expense report in the same state, both waiting on the current user's approval
        // When the approver checks whether they can reject them
        // Then only the expense report offers Reject, because Auth's RejectExpenseReport doesn't support bills yet
        expect(canRejectReportAction(expenseReport, accountID, policy)).toBe(true);
        expect(canRejectReportAction(bill, accountID, policy)).toBe(false);
        expect(getSecondaryActions(bill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.REJECT);
        expect(getTransactionThreadActions(bill)).not.toContain(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.REJECT);
    });

    it('blocks deleting a bill and its expenses', () => {
        // Given a submitted bill and an expense report in the same state, both owned by the current user
        const billTransaction = createTransaction(bill);
        const expenseTransaction = createTransaction(expenseReport);

        // When the owner checks whether they can delete the report or its expenses
        // Then only the expense report allows it, because a bill must keep the expenses of the vendor's invoice
        expect(canDeleteTransaction(expenseReport, undefined)).toBe(true);
        expect(canDeleteTransaction(bill, undefined)).toBe(false);
        expect(canDeleteMoneyRequestReport(expenseReport, [expenseTransaction], [createIOUAction(expenseReport)], accountID, undefined, email, policy, undefined, true)).toBe(true);
        expect(canDeleteMoneyRequestReport(bill, [billTransaction], [createIOUAction(bill)], accountID, undefined, email, policy, undefined, true)).toBe(false);
        expect(canDeleteMoneyRequestReport(bill, [billTransaction], [createIOUAction(bill)], accountID, undefined, email, policy, undefined, false)).toBe(false);
        expect(getSecondaryActions(bill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.DELETE);
        expect(getTransactionThreadActions(bill)).not.toContain(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DELETE);
    });

    it('blocks adding expenses to a bill and moving expenses into or out of it', () => {
        // Given a submitted bill and an expense report in the same state
        const billTransaction = createTransaction(bill);

        // When the owner tries to add an expense, move one out, or pick the report as a destination
        // Then the bill allows none of them, because its expenses come only from the vendor's invoice
        expect(canAddTransaction(expenseReport, undefined)).toBe(true);
        expect(canAddTransaction(bill, undefined)).toBe(false);
        expect(isReportOutstanding(expenseReport, policy.id, undefined, undefined)).toBe(true);
        expect(isReportOutstanding(bill, policy.id, undefined, undefined)).toBe(false);
        expect(
            canEditFieldOfMoneyRequest({
                reportAction: createIOUAction(bill),
                fieldToEdit: CONST.EDIT_REQUEST_FIELD.REPORT,
                transaction: billTransaction,
                report: bill,
                policy,
                reportNameValuePairs: undefined,
                rules: undefined,
            }),
        ).toBe(false);
        expect(getSecondaryActions(bill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.ADD_EXPENSE);
        expect(getSecondaryActions(bill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.MOVE_EXPENSE);
        expect(getTransactionThreadActions(bill)).not.toContain(CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MOVE_EXPENSE);
    });

    it('blocks report actions that change a bill or copy its expenses', () => {
        // Given a submitted bill and an expense report in the same state, both owned, approved and administered by the current user
        const billTransaction = createTransaction(bill);
        const reportActionsToBlock = [
            CONST.REPORT.SECONDARY_ACTIONS.RETRACT,
            CONST.REPORT.SECONDARY_ACTIONS.SPLIT,
            CONST.REPORT.SECONDARY_ACTIONS.MERGE,
            CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_EXPENSE,
            CONST.REPORT.SECONDARY_ACTIONS.DUPLICATE_REPORT,
        ];
        const expenseActionsToBlock = [
            CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.HOLD,
            CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.SPLIT,
            CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.MERGE,
            CONST.REPORT.TRANSACTION_SECONDARY_ACTIONS.DUPLICATE,
        ];

        // When they open the More menu on each report and on its expense
        const expenseReportActions = getSecondaryActions(expenseReport);
        const billActions = getSecondaryActions(bill);
        const expenseReportExpenseActions = getTransactionThreadActions(expenseReport);
        const billExpenseActions = getTransactionThreadActions(bill);

        // Then only the expense report offers them, because they would take the bill out of submitted or change the expenses of the vendor's invoice
        expect(expenseReportActions).toEqual(expect.arrayContaining(reportActionsToBlock));
        expect(expenseReportExpenseActions).toEqual(expect.arrayContaining(expenseActionsToBlock));
        for (const action of [...reportActionsToBlock, CONST.REPORT.SECONDARY_ACTIONS.HOLD, CONST.REPORT.SECONDARY_ACTIONS.CHANGE_WORKSPACE]) {
            expect(billActions).not.toContain(action);
        }
        for (const action of expenseActionsToBlock) {
            expect(billExpenseActions).not.toContain(action);
        }
        expect(canHoldUnholdReportAction(bill, createIOUAction(bill), undefined, billTransaction, policy, accountID, undefined).canHoldRequest).toBe(false);
    });

    it('keeps the stored bill name when the policy title is a formula', async () => {
        // Given a bill and an expense report whose title fields follow the policy title formula
        const formulaPolicy: Policy = {
            ...policy,
            fieldList: {
                // eslint-disable-next-line @typescript-eslint/naming-convention -- text_title is the backend field ID
                text_title: createMock<PolicyReportField>({fieldID: 'text_title', name: 'title', type: CONST.REPORT_FIELD_TYPES.FORMULA, defaultValue: '{report:type}', target: 'expense'}),
            },
        };
        const formulaTitle = createMock<PolicyReportField>({fieldID: 'text_title', name: 'title', type: CONST.REPORT_FIELD_TYPES.FORMULA, defaultValue: '{report:type}'});
        const namedBill: Report = {...bill, reportName: 'Bill #R00000001upZ'};
        const namedExpenseReport: Report = {...expenseReport, reportName: 'Old name'};
        // eslint-disable-next-line @typescript-eslint/naming-convention -- expensify_text_title is the backend's NVP name
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${bill.reportID}`, {expensify_text_title: formulaTitle});
        // eslint-disable-next-line @typescript-eslint/naming-convention -- expensify_text_title is the backend's NVP name
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReport.reportID}`, {expensify_text_title: formulaTitle});
        await waitForBatchedUpdates();

        // When an expense change recomputes the report names optimistically
        const getCurrencyDecimals = () => 2;
        const updatedBill = maybeUpdateReportNameForFormulaTitle(namedBill, formulaPolicy, getCurrencyDecimals);
        const updatedExpenseReport = maybeUpdateReportNameForFormulaTitle(namedExpenseReport, formulaPolicy, getCurrencyDecimals);

        // Then only the expense report follows the formula, and the bill keeps the name that Auth or the user gave it
        expect(updatedExpenseReport.reportName).toBe('Expense Report');
        expect(updatedBill.reportName).toBe('Bill #R00000001upZ');
    });
});
