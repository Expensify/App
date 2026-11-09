import {act, renderHook} from '@testing-library/react-native';

import useConciergeComposerPlaceholder from '@pages/inbox/report/ReportActionCompose/useConciergeComposerPlaceholder';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const REPORT_ID = '1';

// The full prompt list has 15 entries, so 15 evenly spaced seeds reach every slot of any shorter list too.
const SLOT_COUNT = 15;
const LAST_SLOT_SEED = 0.999;

const CREATE_EXPENSE = 'common.concierge.composerPlaceholders.createExpense';
const HELP = 'reportActionCompose.askConciergeForHelp';
const COMBINE = 'common.concierge.composerPlaceholders.combineExpenses';
const TOP_SPENDER = 'common.concierge.composerPlaceholders.topSpender';
const MISSING_CATEGORY = 'common.concierge.composerPlaceholders.missingCategory';
const AWAITING_APPROVAL = 'common.concierge.composerPlaceholders.awaitingApproval';
const LEFT_TO_PAY = 'common.concierge.composerPlaceholders.leftToPay';
const NOT_REIMBURSED = 'common.concierge.composerPlaceholders.notReimbursed';
const EXPORT_PDF = 'common.concierge.composerPlaceholders.exportPdf';

const BASE = [CREATE_EXPENSE, HELP];
const PERSONAL = [
    'common.concierge.composerPlaceholders.spendLastMonth',
    'common.concierge.composerPlaceholders.topExpenses',
    'common.concierge.composerPlaceholders.spendDrivers',
    'common.concierge.composerPlaceholders.travelSpendChange',
    'common.concierge.composerPlaceholders.unsubmitted',
    'common.concierge.composerPlaceholders.exportCsv',
];
const SPEND_INSIGHT = [TOP_SPENDER, MISSING_CATEGORY];
const PAYABLE = [AWAITING_APPROVAL, LEFT_TO_PAY];

const expenseReport: Report = {reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, ownerAccountID: ACCOUNT_ID, transactionCount: 1};
const otherUsersExpenseReport: Report = {...expenseReport, ownerAccountID: OTHER_ACCOUNT_ID, managerID: ACCOUNT_ID};
const receivedInvoice: Report = {...expenseReport, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: OTHER_ACCOUNT_ID, managerID: ACCOUNT_ID};
const sentInvoice: Report = {...expenseReport, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: ACCOUNT_ID, managerID: OTHER_ACCOUNT_ID};
// Bill intake records the bill under the receiver, so the receiver is its owner.
const receivedBill: Report = {...expenseReport, type: CONST.REPORT.UNSUPPORTED_TYPE.BILL, ownerAccountID: ACCOUNT_ID, managerID: ACCOUNT_ID};
const otherAdminsBill: Report = {...receivedBill, ownerAccountID: OTHER_ACCOUNT_ID, managerID: OTHER_ACCOUNT_ID};

const reportedTransaction: Transaction = {transactionID: '1', reportID: REPORT_ID, amount: 3000, currency: 'USD', merchant: 'Lunch', created: '2026-11-08'};
const unreportedTransaction: Transaction = {...reportedTransaction, reportID: CONST.REPORT.UNREPORTED_REPORT_ID};

async function setReport(report: Report | null, reportID = REPORT_ID) {
    await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, report);
}

async function setTransaction(transaction: Transaction | null, transactionID = '1') {
    await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction);
}

/** Mounts the hook once per slot and returns every prompt it can pick for the current Onyx data. */
async function getPossiblePlaceholders(isConciergeInboxDM = true) {
    const placeholders = new Set<string>();
    for (let slot = 0; slot < SLOT_COUNT; slot++) {
        jest.mocked(Math.random).mockReturnValue((slot + 0.5) / SLOT_COUNT);
        const {result, unmount} = renderHook(() => useConciergeComposerPlaceholder(isConciergeInboxDM));
        await waitForBatchedUpdates();
        placeholders.add(result.current);
        unmount();
    }
    return [...placeholders].sort();
}

function sorted(placeholders: string[]) {
    return [...placeholders].sort();
}

describe('useConciergeComposerPlaceholder', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        jest.spyOn(Math, 'random').mockReturnValue(LAST_SLOT_SEED);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    describe('prompts each kind of account can get', () => {
        it('offers only the safe prompts to an account with just a chat', async () => {
            // Given a new account whose only report is a chat, which is the state right after onboarding
            await setReport({reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then no prompt asks about expenses or reports the account does not have
            expect(placeholders).toEqual(sorted(BASE));
        });

        it('offers personal and spend prompts for one unreported expense', async () => {
            // Given an unreported expense, which has a Category field but no report to approve, pay or export
            await setTransaction(unreportedTransaction);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then expense prompts are offered, but report-only and combine prompts are not
            expect(placeholders).toEqual(sorted([...BASE, ...PERSONAL, ...SPEND_INSIGHT]));
        });

        it('adds the combine prompt once there are two unreported expenses', async () => {
            // Given two unreported expenses, since combining needs at least two
            await setTransaction(unreportedTransaction);
            await setTransaction({...unreportedTransaction, transactionID: '2'}, '2');

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then combining becomes available on top of the single-expense prompts
            expect(placeholders).toEqual(sorted([...BASE, ...PERSONAL, COMBINE, ...SPEND_INSIGHT]));
        });

        it('offers every prompt except combine for an owned report with one expense', async () => {
            // Given the user's own report with one expense, which can be reimbursed and exported
            await setReport(expenseReport);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then all report and expense prompts are offered, but one expense cannot be combined
            expect(placeholders).toEqual(sorted([...BASE, ...PERSONAL, ...SPEND_INSIGHT, ...PAYABLE, NOT_REIMBURSED, EXPORT_PDF]));
        });

        it('offers all prompts for an owned report with two expenses', async () => {
            // Given the user's own report with two expenses, so every prerequisite is met
            await setReport({...expenseReport, transactionCount: 2});

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then the list matches the full set that main always offered
            expect(placeholders).toEqual(sorted([...BASE, ...PERSONAL, COMBINE, ...SPEND_INSIGHT, ...PAYABLE, NOT_REIMBURSED, EXPORT_PDF]));
        });

        it("offers team and payment prompts but no personal ones to an approver of another user's report", async () => {
            // Given another user's report and two of their expenses loaded by the approver
            await setReport(otherUsersExpenseReport);
            await setTransaction(reportedTransaction);
            await setTransaction({...reportedTransaction, transactionID: '2'}, '2');

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then prompts about "my" expenses or reports stay hidden because none of them belong to the approver
            expect(placeholders).toEqual(sorted([...BASE, ...SPEND_INSIGHT, ...PAYABLE]));
        });

        it('offers payment prompts to an invoice recipient', async () => {
            // Given only an invoice sent to the user, which they have to pay
            await setReport(receivedInvoice);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then payment prompts are offered without treating the invoice as the user's expenses or report
            expect(placeholders).toEqual(sorted([...BASE, ...SPEND_INSIGHT, ...PAYABLE]));
        });

        it('offers the PDF prompt to an invoice sender', async () => {
            // Given only an invoice the user sent, which they can download as a PDF
            await setReport(sentInvoice);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then PDF export is offered, but invoice items are sales and do not unlock expense or reimbursement prompts
            expect(placeholders).toEqual(sorted([...BASE, ...SPEND_INSIGHT, ...PAYABLE, EXPORT_PDF]));
        });

        it('offers payment and PDF prompts to a bill receiver', async () => {
            // Given only a bill recorded under the user, which they approve, pay and can download
            await setReport(receivedBill);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then payment and PDF prompts are offered, but vendor charges do not unlock expense or reimbursement prompts
            expect(placeholders).toEqual(sorted([...BASE, ...SPEND_INSIGHT, ...PAYABLE, EXPORT_PDF]));
        });

        it("offers payment prompts but no PDF prompt for another admin's bill", async () => {
            // Given a bill recorded under another admin, so it is not the user's own report
            await setReport(otherAdminsBill);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then the user can ask about paying it but not about exporting their own report
            expect(placeholders).toEqual(sorted([...BASE, ...SPEND_INSIGHT, ...PAYABLE]));
        });

        it.each([
            ['an empty expense report', {...expenseReport, transactionCount: 0}],
            ['an expense report without a count', {...expenseReport, transactionCount: undefined}],
            ['an expense report pending deletion', {...expenseReport, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
            ['an inaccessible expense report', {...expenseReport, errorFields: {notFound: {[ACCOUNT_ID]: 'Report not found'}}}],
            ['an empty invoice', {...sentInvoice, transactionCount: 0}],
            ['an invoice pending deletion', {...receivedInvoice, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
            ['an empty bill', {...receivedBill, transactionCount: 0}],
            ['a bill pending deletion', {...receivedBill, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
            ['a task', {...expenseReport, type: CONST.REPORT.TYPE.TASK}],
        ])('offers only the safe prompts for %s', async (_description, report) => {
            // Given a report the user cannot act on, with a loaded transaction that points at it
            await setReport(report);
            await setTransaction(reportedTransaction);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then neither the report nor its transaction unlocks any history-dependent prompt
            expect(placeholders).toEqual(sorted(BASE));
        });

        it("counts only the user's own expenses toward combining", async () => {
            // Given one own unreported expense and another user's expense on a report with no counted expenses
            await setReport({...otherUsersExpenseReport, transactionCount: 0});
            await setTransaction(unreportedTransaction);
            await setTransaction({...reportedTransaction, transactionID: '2'}, '2');

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then the other user's expense does not make a second expense to combine
            expect(placeholders).toEqual(sorted([...BASE, ...PERSONAL, ...SPEND_INSIGHT]));
        });

        it('does not count a reported expense twice when its transaction is also loaded', async () => {
            // Given an owned report with one expense whose transaction is also in Onyx
            await setReport(expenseReport);
            await setTransaction(reportedTransaction);

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then the report count and the loaded transaction are one expense, so combine stays hidden
            expect(placeholders).not.toContain(COMBINE);
        });

        it('sums expenses across owned reports and unreported expenses', async () => {
            // Given one expense on an owned report and one unreported expense
            await setReport(expenseReport);
            await setTransaction({...unreportedTransaction, transactionID: '2'}, '2');

            // When every random slot is sampled
            const placeholders = await getPossiblePlaceholders();

            // Then both sources add up to two expenses, which can be combined
            expect(placeholders).toContain(COMBINE);
        });

        it('offers only the safe prompts outside the Concierge inbox DM', async () => {
            // Given an account with every prerequisite met
            await setReport({...expenseReport, transactionCount: 2});

            // When the composer belongs to another chat or the side panel
            const placeholders = await getPossiblePlaceholders(false);

            // Then the hook skips the eligibility work and falls back to the safe prompts
            expect(placeholders).toEqual(sorted(BASE));
        });
    });

    describe('updates while Concierge is open', () => {
        it('adapts when a report loads after mount and when it is deleted', async () => {
            // Given a composer mounted before any report data arrives, with the seed on the last slot
            const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
            await waitForBatchedUpdates();
            expect(result.current).toBe(HELP);

            // When an owned report arrives without remounting
            await act(async () => {
                await setReport(expenseReport);
            });

            // Then the same seed can now land on PDF export, the last eligible prompt
            expect(result.current).toBe(EXPORT_PDF);

            // When the report is marked for deletion
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
            });

            // Then the composer goes back to a safe prompt instead of keeping a stale one
            expect(result.current).toBe(HELP);
        });

        it('rechecks ownership when the report owner changes', async () => {
            // Given an owned report, so the last slot is PDF export
            await setReport(expenseReport);
            const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
            await waitForBatchedUpdates();
            expect(result.current).toBe(EXPORT_PDF);

            // When the report now belongs to another user
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {ownerAccountID: OTHER_ACCOUNT_ID});
            });

            // Then personal prompts drop out and the last slot is the payment prompt
            expect(result.current).toBe(LEFT_TO_PAY);
        });

        it('keeps category help when deleting a report leaves its expense unreported', async () => {
            // Given an owned report and its expense
            await setReport(expenseReport);
            await setTransaction(reportedTransaction);
            const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
            await waitForBatchedUpdates();

            // When the report is deleted and its expense becomes unreported, as Delete report does
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
            });

            // Then the last slot is category help, which still applies to the unreported expense
            expect(result.current).toBe(MISSING_CATEGORY);
        });

        it('waits for the report count instead of counting loaded transactions early', async () => {
            // Given an owned report whose count has not arrived yet and its loaded transaction
            await setReport({...expenseReport, transactionCount: 0});
            await setTransaction(reportedTransaction);
            const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
            await waitForBatchedUpdates();
            expect(result.current).toBe(HELP);

            // When the count arrives without a transaction update
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {transactionCount: 1});
            });

            // Then the report unlocks its prompts from the count alone
            expect(result.current).toBe(EXPORT_PDF);
        });

        it('keeps the selection across unrelated updates and rerenders', async () => {
            // Given an owned report and a mounted composer
            await setReport(expenseReport);
            const {result, rerender} = renderHook(() => useConciergeComposerPlaceholder(true));
            await waitForBatchedUpdates();
            expect(result.current).toBe(EXPORT_PDF);

            // When unrelated report data changes and a new random value would differ
            jest.mocked(Math.random).mockReturnValue(0);
            await act(async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportName: 'Updated report'});
            });
            rerender({});

            // Then the seed picked at mount is kept, so the prompt does not change
            expect(result.current).toBe(EXPORT_PDF);
        });
    });
});
