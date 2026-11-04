import {maybeUpdateReportNameForFormulaTitle} from '@libs/actions/IOU/MoneyRequestBuilder';
import {isBillReport} from '@libs/BillPayUtils';
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
    canRejectReportAction,
    isExpenseReport,
    isReportOutstanding,
} from '@libs/ReportUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, PolicyReportField, Report, ReportAction, Transaction} from '@src/types/onyx';

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

function getPrimaryAction(report: Report) {
    return getReportPrimaryAction({
        report,
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

    it('hides Pay on an approved bill', () => {
        // Given an approved bill and an approved expense report that the same admin can pay
        const transactions = [createTransaction(approvedBill)];

        // When the header, the report preview and the settlement button check for Pay
        // Then only the expense report offers Pay, because bills can't be paid in NewDot yet
        expect(getPrimaryAction(approvedExpenseReport)).toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(getPrimaryAction(approvedBill)).not.toBe(CONST.REPORT.PRIMARY_ACTIONS.PAY);
        expect(canIOUBePaid(approvedExpenseReport, undefined, policy, {}, email, accountID, transactions, false, false)).toBe(true);
        expect(canIOUBePaid(approvedBill, undefined, policy, {}, email, accountID, transactions, false, false)).toBe(false);
        expect(canIOUBePaid(approvedBill, undefined, policy, {}, email, accountID, transactions, true, false)).toBe(false);
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
        ).not.toBe(CONST.REPORT.REPORT_PREVIEW_ACTIONS.PAY);
        expect(getSecondaryActions(approvedBill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.PAY);
        expect(getSecondaryActions(approvedBill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.RECEIVED_PAYMENT);
    });

    it('keeps Unapprove on an approved bill', () => {
        // Given an approved bill
        // When its approver opens the More menu
        // Then they can still send it back with Unapprove
        expect(getSecondaryActions(approvedBill)).toContain(CONST.REPORT.SECONDARY_ACTIONS.UNAPPROVE);
    });

    it('hides Cancel payment on a bill paid in Classic', () => {
        // Given a bill and an expense report that were both marked as paid
        const paidBill: Report = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED};
        const paidExpenseReport: Report = {...paidBill, reportID: expenseReport.reportID, type: CONST.REPORT.TYPE.EXPENSE};

        // When the payer opens the More menu
        // Then only the expense report offers Cancel payment, because bills can't cancel payments in NewDot yet
        expect(getSecondaryActions(paidExpenseReport)).toContain(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
        expect(getSecondaryActions(paidBill)).not.toContain(CONST.REPORT.SECONDARY_ACTIONS.CANCEL_PAYMENT);
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
                // eslint-disable-next-line @typescript-eslint/naming-convention
                text_title: createMock<PolicyReportField>({fieldID: 'text_title', name: 'title', type: CONST.REPORT_FIELD_TYPES.FORMULA, defaultValue: '{report:type}', target: 'expense'}),
            },
        };
        const formulaTitle = createMock<PolicyReportField>({fieldID: 'text_title', name: 'title', type: CONST.REPORT_FIELD_TYPES.FORMULA, defaultValue: '{report:type}'});
        const namedBill: Report = {...bill, reportName: 'Bill #R00UehkbSWnw'};
        const namedExpenseReport: Report = {...expenseReport, reportName: 'Old name'};
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${bill.reportID}`, {expensify_text_title: formulaTitle});
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${expenseReport.reportID}`, {expensify_text_title: formulaTitle});
        await waitForBatchedUpdates();

        // When an expense change recomputes the report names optimistically
        const getCurrencyDecimals = () => 2;
        const updatedBill = maybeUpdateReportNameForFormulaTitle(namedBill, formulaPolicy, getCurrencyDecimals);
        const updatedExpenseReport = maybeUpdateReportNameForFormulaTitle(namedExpenseReport, formulaPolicy, getCurrencyDecimals);

        // Then only the expense report follows the formula, and the bill keeps the name that Auth or the user gave it
        expect(updatedExpenseReport.reportName).toBe('Expense Report');
        expect(updatedBill.reportName).toBe('Bill #R00UehkbSWnw');
    });
});
