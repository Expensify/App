import {canApproveBill, canPayBill, isBillPayReport} from '@libs/BillPayUtils';
import {translate} from '@libs/Localize';
import {getReportPrimaryAction} from '@libs/ReportPrimaryActionUtils';
import {canRejectReportAction, getReimbursementQueuedActionMessage} from '@libs/ReportUtils';
import {buildSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchSuggestionUtils';
import {createTypeMenuSections, getSections, isTransactionReportGroupListItemType} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Policy, Report, ReportAction, SearchResults, Transaction} from '@src/types/onyx';

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

    it.each([
        [CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED, CONST.SEARCH.ACTION_TYPES.APPROVE],
        [CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED, CONST.SEARCH.ACTION_TYPES.PAY],
    ] as const)('shows the Bills table action for state %s and status %s', (stateNum, statusNum, expectedAction) => {
        // Given an accessible bill with an approver who can pay after final approval.
        const vendorAccountID = 456;
        const report: Report = {...bill, stateNum, statusNum, billSenderAccountID: vendorAccountID, transactionCount: 1};
        const transaction = createMock<Transaction>({transactionID: '300', reportID: bill.reportID, amount: 125, currency: CONST.CURRENCY.USD});
        const data = createMock<SearchResults['data']>({
            personalDetailsList: {
                [accountID]: {accountID, login: email, displayName: 'Receiver'},
                [vendorAccountID]: {accountID: vendorAccountID, login: 'billing@vendor.com', displayName: 'Vendor'},
            },
        });
        data[`${ONYXKEYS.COLLECTION.REPORT}${bill.reportID}`] = report;
        data[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
        data[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`] = policy;

        // When Bills builds its report row using the current workflow stage.
        const [sections] = getSections({
            type: CONST.SEARCH.DATA_TYPES.BILL,
            data,
            currentAccountID: accountID,
            currentUserEmail: email,
            queryJSON: buildSearchQueryJSON('type:bill'),
            translate: <TPath extends TranslationPaths>(key: TPath, ...parameters: TranslationParameters<TPath>) => translate(CONST.LOCALES.EN, key, ...parameters),
            formatPhoneNumber: (phone) => phone,
            convertToDisplayString: (amount) => String(amount),
            bankAccountList: {},
            rules: undefined,
            conciergeReportID: undefined,
            dateFnsLocale: undefined,
            reportAttributesDerivedValue: {},
        });

        // Then the table offers Approve before approval and Pay only after approval.
        expect(sections.filter(isTransactionReportGroupListItemType)).toEqual([expect.objectContaining({reportID: bill.reportID, action: expectedAction})]);
    });

    it('only offers payment to the authorized payer, even when another user is an admin', () => {
        const approved = {...bill, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED};
        expect(canPayBill(approved, policy, 456, 'admin@example.com')).toBe(false);
        expect(canPayBill(approved, {...policy, reimburser: undefined}, accountID, email)).toBe(true);
        expect(canPayBill(approved, {...policy, reimburser: undefined, owner: email}, 456, 'admin@example.com')).toBe(true);
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

    it.each([CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO, CONST.POLICY.DEPRECATED_REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO])(
        'omits Ready to pay from Bills navigation when workspace payments are disabled with %s',
        (reimbursementChoice) => {
            // Given Bills content in a workspace with payments disabled.
            const params = {
                currentUserEmail: email,
                currentUserAccountID: accountID,
                cardFeedsByPolicy: {},
                defaultCardFeed: undefined,
                policies: {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: {...policy, reimbursementChoice}},
                savedSearches: undefined,
                isOffline: false,
                defaultExpensifyCard: undefined,
                draftTransactionIDs: undefined,
                isTrackIntentUser: false,
                hasBills: true,
            };

            // When the menu builds the suggested searches from the workspace settings.
            const disabledSection = createTypeMenuSections(params).find((section) => section.translationPath === 'billPay.bills');

            // Then Bills and Needs approval remain available, while Ready to pay requires payments enabled.
            expect(disabledSection?.menuItems.map((item) => item.key)).toEqual([CONST.SEARCH.SEARCH_KEYS.BILLS, CONST.SEARCH.SEARCH_KEYS.BILLS_APPROVE]);
            const enabledSection = createTypeMenuSections({...params, policies: {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy}}).find(
                (section) => section.translationPath === 'billPay.bills',
            );
            expect(enabledSection?.menuItems.map((item) => item.key)).toContain(CONST.SEARCH.SEARCH_KEYS.BILLS_PAY);
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

    it('builds distinct Bills searches with the payer filter on Ready to pay', () => {
        const searches = getSuggestedSearches(accountID);
        const bills = buildSearchQueryJSON(searches[CONST.SEARCH.SEARCH_KEYS.BILLS].searchQuery);
        const approval = buildSearchQueryJSON(searches[CONST.SEARCH.SEARCH_KEYS.BILLS_APPROVE].searchQuery);
        const payment = buildSearchQueryJSON(searches[CONST.SEARCH.SEARCH_KEYS.BILLS_PAY].searchQuery);
        expect(bills?.type).toBe(CONST.SEARCH.DATA_TYPES.BILL);
        expect(approval?.type).toBe(CONST.SEARCH.DATA_TYPES.BILL);
        expect(payment?.type).toBe(CONST.SEARCH.DATA_TYPES.BILL);
        expect(searches[CONST.SEARCH.SEARCH_KEYS.BILLS_PAY].searchQuery).toContain(`payer:${accountID}`);
        expect(new Set([bills?.hash, approval?.hash, payment?.hash]).size).toBe(3);
    });

    it('renders the bill with sender and receiver emails and suppresses its invoice', () => {
        const vendorAccountID = 456;
        const approved: Report = {
            ...bill,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            billSenderAccountID: 456,
            managerID: 789,
        };
        const data = createMock<SearchResults['data']>({
            personalDetailsList: {
                [accountID]: {accountID, login: email, displayName: 'Receiver'},
                [vendorAccountID]: {accountID: vendorAccountID, login: 'billing@vendor.com', displayName: 'Vendor'},
            },
        });
        data[`${ONYXKEYS.COLLECTION.REPORT}100`] = approved;
        data[`${ONYXKEYS.COLLECTION.REPORT}200`] = {...approved, reportID: '200', type: CONST.REPORT.TYPE.INVOICE, isHiddenForBillReceiver: true};
        data[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`] = policy;
        const [sections] = getSections({
            type: CONST.SEARCH.DATA_TYPES.BILL,
            data,
            currentAccountID: accountID,
            currentUserEmail: email,
            queryJSON: buildSearchQueryJSON('type:bill'),
            translate: <TPath extends TranslationPaths>(key: TPath, ...parameters: TranslationParameters<TPath>) => translate(CONST.LOCALES.EN, key, ...parameters),
            formatPhoneNumber: (phone) => phone,
            convertToDisplayString: (amount) => String(amount),
            bankAccountList: {},
            rules: undefined,
            conciergeReportID: undefined,
            dateFnsLocale: undefined,
            reportAttributesDerivedValue: {},
        });
        const reports = sections.filter(isTransactionReportGroupListItemType);
        expect(reports).toHaveLength(1);
        expect(reports.at(0)).toMatchObject({reportID: '100', formattedFrom: 'billing@vendor.com', formattedTo: email, action: CONST.SEARCH.ACTION_TYPES.PAY});
    });
});
