import {act, renderHook} from '@testing-library/react-native';

import useConciergeComposerPlaceholder, {
    getEligiblePlaceholderKeys,
    getReportEligibility,
    getUnreportedExpenseCount,
} from '@pages/inbox/report/ReportActionCompose/useConciergeComposerPlaceholder';
import type {PlaceholderEligibility} from '@pages/inbox/report/ReportActionCompose/useConciergeComposerPlaceholder';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';

import type {OnyxCollection} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const OTHER_ACCOUNT_ID = 2;
const REPORT_ID = '1';
const LAST_SLOT_SEED = 0.999;

const BASE_PROMPTS = ['common.concierge.composerPlaceholders.createExpense', 'reportActionCompose.askConciergeForHelp'];
const EXPENSE_PROMPTS = [
    'common.concierge.composerPlaceholders.spendLastMonth',
    'common.concierge.composerPlaceholders.topExpenses',
    'common.concierge.composerPlaceholders.spendDrivers',
    'common.concierge.composerPlaceholders.travelSpendChange',
    'common.concierge.composerPlaceholders.unsubmitted',
    'common.concierge.composerPlaceholders.exportCsv',
];
const MULTIPLE_EXPENSE_PROMPTS = ['common.concierge.composerPlaceholders.combineExpenses'];
const SPEND_INSIGHT_PROMPTS = ['common.concierge.composerPlaceholders.topSpender', 'common.concierge.composerPlaceholders.missingCategory'];
const PAYABLE_REPORT_PROMPTS = ['common.concierge.composerPlaceholders.awaitingApproval', 'common.concierge.composerPlaceholders.leftToPay'];
const OWN_EXPENSE_REPORT_PROMPTS = ['common.concierge.composerPlaceholders.notReimbursed'];
const OWN_REPORT_PROMPTS = ['common.concierge.composerPlaceholders.exportPdf'];

const NO_ELIGIBILITY: PlaceholderEligibility = {expenseCount: 0, hasAccessibleReports: false, hasOwnExpenseReports: false, hasOwnReports: false};
const EMPTY_REPORT_ELIGIBILITY = {ownReportedExpenseCount: 0, hasAccessibleReports: false, hasOwnExpenseReports: false, hasOwnReports: false};

const expenseReport: Report = {reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, ownerAccountID: ACCOUNT_ID, transactionCount: 1};
const otherUsersExpenseReport: Report = {...expenseReport, ownerAccountID: OTHER_ACCOUNT_ID, managerID: ACCOUNT_ID};
const receivedInvoice: Report = {...expenseReport, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: OTHER_ACCOUNT_ID, managerID: ACCOUNT_ID};
const sentInvoice: Report = {...expenseReport, type: CONST.REPORT.TYPE.INVOICE, ownerAccountID: ACCOUNT_ID, managerID: OTHER_ACCOUNT_ID};
// Bill intake records the bill under the receiver, so the receiver is its owner.
const receivedBill: Report = {...expenseReport, type: CONST.REPORT.UNSUPPORTED_TYPE.BILL, ownerAccountID: ACCOUNT_ID, managerID: ACCOUNT_ID};
const otherAdminsBill: Report = {...receivedBill, ownerAccountID: OTHER_ACCOUNT_ID, managerID: OTHER_ACCOUNT_ID};

const reportedTransaction: Transaction = {transactionID: '1', reportID: REPORT_ID, amount: 3000, currency: 'USD', merchant: 'Lunch', created: '2026-11-08'};
const unreportedTransaction: Transaction = {...reportedTransaction, reportID: CONST.REPORT.UNREPORTED_REPORT_ID};

function sorted(keys: readonly string[]) {
    return [...keys].sort();
}

function toReportCollection(...reports: Report[]): OnyxCollection<Report> {
    return Object.fromEntries(reports.map((report, index) => [`${ONYXKEYS.COLLECTION.REPORT}${index + 1}`, {...report, reportID: String(index + 1)}]));
}

function toTransactionCollection(...transactions: Transaction[]): OnyxCollection<Transaction> {
    return Object.fromEntries(transactions.map((transaction, index) => [`${ONYXKEYS.COLLECTION.TRANSACTION}${index + 1}`, {...transaction, transactionID: String(index + 1)}]));
}

function getLastEligibleKey(eligibility: PlaceholderEligibility) {
    return getEligiblePlaceholderKeys(eligibility).at(-1);
}

/** Mounts the hook once per expected slot, so a list of a different length or order fails on the first mismatched slot. */
async function expectHookToOffer(eligibility: PlaceholderEligibility, isConciergeInboxDM = true) {
    const expectedKeys = getEligiblePlaceholderKeys(eligibility);
    for (const [slot, expectedKey] of expectedKeys.entries()) {
        jest.mocked(Math.random).mockReturnValue((slot + 0.5) / expectedKeys.length);
        const {result, unmount} = renderHook(() => useConciergeComposerPlaceholder(isConciergeInboxDM));
        await waitForBatchedUpdates();
        expect(result.current).toBe(expectedKey);
        unmount();
    }
}

describe('getEligiblePlaceholderKeys', () => {
    it.each([
        ['an account with no expenses or reports', NO_ELIGIBILITY, BASE_PROMPTS],
        ['one unreported expense', {...NO_ELIGIBILITY, expenseCount: 1}, [...BASE_PROMPTS, ...EXPENSE_PROMPTS, ...SPEND_INSIGHT_PROMPTS]],
        ['two unreported expenses', {...NO_ELIGIBILITY, expenseCount: 2}, [...BASE_PROMPTS, ...EXPENSE_PROMPTS, ...MULTIPLE_EXPENSE_PROMPTS, ...SPEND_INSIGHT_PROMPTS]],
        ["an approver of another user's report", {...NO_ELIGIBILITY, hasAccessibleReports: true}, [...BASE_PROMPTS, ...SPEND_INSIGHT_PROMPTS, ...PAYABLE_REPORT_PROMPTS]],
        [
            'an invoice sender or bill receiver',
            {...NO_ELIGIBILITY, hasAccessibleReports: true, hasOwnReports: true},
            [...BASE_PROMPTS, ...SPEND_INSIGHT_PROMPTS, ...PAYABLE_REPORT_PROMPTS, ...OWN_REPORT_PROMPTS],
        ],
        [
            'an owned report with one expense',
            {expenseCount: 1, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true},
            [...BASE_PROMPTS, ...EXPENSE_PROMPTS, ...SPEND_INSIGHT_PROMPTS, ...PAYABLE_REPORT_PROMPTS, ...OWN_EXPENSE_REPORT_PROMPTS, ...OWN_REPORT_PROMPTS],
        ],
        [
            'an owned report with two expenses',
            {expenseCount: 2, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true},
            [...BASE_PROMPTS, ...EXPENSE_PROMPTS, ...MULTIPLE_EXPENSE_PROMPTS, ...SPEND_INSIGHT_PROMPTS, ...PAYABLE_REPORT_PROMPTS, ...OWN_EXPENSE_REPORT_PROMPTS, ...OWN_REPORT_PROMPTS],
        ],
    ])('offers the prompts that %s can act on', (_description, eligibility, expectedKeys) => {
        // Given the eligibility that state produces
        // When the eligible prompts are listed
        const keys = getEligiblePlaceholderKeys(eligibility);

        // Then only the prompts the user can act on are offered, and the full state matches what main offered to everyone
        expect(sorted(keys)).toEqual(sorted(expectedKeys));
    });

    it('lists spend insight prompts once when both an own expense and an accessible report unlock them', () => {
        // Given two sources that each unlock the spend insight prompts
        const eligibility = {...NO_ELIGIBILITY, expenseCount: 1, hasAccessibleReports: true};

        // When the eligible prompts are listed
        const keys = getEligiblePlaceholderKeys(eligibility);

        // Then no prompt appears twice, so none gets a higher chance of being picked
        expect(new Set(keys).size).toBe(keys.length);
    });
});

describe('getReportEligibility', () => {
    it.each([
        ['an owned expense report', [expenseReport], {ownReportedExpenseCount: 1, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true}],
        ["another user's expense report", [otherUsersExpenseReport], {...EMPTY_REPORT_ELIGIBILITY, hasAccessibleReports: true}],
        ['a received invoice', [receivedInvoice], {...EMPTY_REPORT_ELIGIBILITY, hasAccessibleReports: true}],
        ['a sent invoice', [sentInvoice], {...EMPTY_REPORT_ELIGIBILITY, hasAccessibleReports: true, hasOwnReports: true}],
        ['a received bill', [receivedBill], {...EMPTY_REPORT_ELIGIBILITY, hasAccessibleReports: true, hasOwnReports: true}],
        ["another admin's bill", [otherAdminsBill], {...EMPTY_REPORT_ELIGIBILITY, hasAccessibleReports: true}],
        [
            'two owned reports with one expense each',
            [expenseReport, expenseReport],
            {ownReportedExpenseCount: 2, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true},
        ],
        [
            'an owned report with many expenses',
            [{...expenseReport, transactionCount: 100}],
            {ownReportedExpenseCount: 2, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true},
        ],
    ])('derives eligibility from %s', (_description, reports, expectedEligibility) => {
        // Given only that report data in Onyx
        // When eligibility is derived in the Concierge inbox DM
        const eligibility = getReportEligibility(toReportCollection(...reports), true, ACCOUNT_ID);

        // Then ownership and report type decide which flags are set, and the count stops at the cap
        expect(eligibility).toEqual(expectedEligibility);
    });

    it.each([
        ['a chat', {...expenseReport, type: CONST.REPORT.TYPE.CHAT}],
        ['a task', {...expenseReport, type: CONST.REPORT.TYPE.TASK}],
        ['an empty expense report', {...expenseReport, transactionCount: 0}],
        ['an expense report without a count', {...expenseReport, transactionCount: undefined}],
        ['an expense report pending deletion', {...expenseReport, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
        ['an inaccessible expense report', {...expenseReport, errorFields: {notFound: {[ACCOUNT_ID]: 'Report not found'}}}],
        ['an empty invoice', {...sentInvoice, transactionCount: 0}],
        ['an invoice pending deletion', {...receivedInvoice, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
        ['an empty bill', {...receivedBill, transactionCount: 0}],
        ['a bill pending deletion', {...receivedBill, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
    ])('ignores %s', (_description, report) => {
        // Given a report the user cannot act on
        // When eligibility is derived in the Concierge inbox DM
        const eligibility = getReportEligibility(toReportCollection(report), true, ACCOUNT_ID);

        // Then it unlocks nothing, so the composer falls back to the safe prompts
        expect(eligibility).toEqual(EMPTY_REPORT_ELIGIBILITY);
    });

    it.each([
        ['outside the Concierge inbox DM', false, ACCOUNT_ID],
        ['before the session has an account ID', true, undefined],
    ])('skips the scan %s', (_description, isConciergeInboxDM, accountID) => {
        // Given an owned report with expenses
        // When the composer is not the Concierge inbox DM or the user is unknown
        const eligibility = getReportEligibility(toReportCollection(expenseReport), isConciergeInboxDM, accountID);

        // Then no flags are set, so other chats keep their constant selector output
        expect(eligibility).toEqual(EMPTY_REPORT_ELIGIBILITY);
    });
});

describe('getUnreportedExpenseCount', () => {
    it.each([
        ['one unreported expense', [unreportedTransaction], 1],
        ['two unreported expenses', [unreportedTransaction, unreportedTransaction], 2],
        ['three unreported expenses', [unreportedTransaction, unreportedTransaction, unreportedTransaction], 2],
        ['a reported expense', [reportedTransaction], 0],
        ['an unreported expense pending deletion', [{...unreportedTransaction, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}], 0],
    ])('counts %s', (_description, transactions, expectedCount) => {
        // Given only those transactions in Onyx
        // When unreported expenses are counted in the Concierge inbox DM
        const count = getUnreportedExpenseCount(toTransactionCollection(...transactions), true, ACCOUNT_ID);

        // Then reported expenses are left to their report count, deleted ones are skipped and counting stops at the cap
        expect(count).toBe(expectedCount);
    });

    it('skips the scan outside the Concierge inbox DM', () => {
        // Given an unreported expense
        // When the composer is not the Concierge inbox DM
        const count = getUnreportedExpenseCount(toTransactionCollection(unreportedTransaction), false, ACCOUNT_ID);

        // Then nothing is counted, so other chats keep their constant selector output
        expect(count).toBe(0);
    });
});

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

    it('does not count a reported expense twice when its transaction is also loaded', async () => {
        // Given an owned report with one expense whose transaction is also in Onyx
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, reportedTransaction);

        // When every slot of the expected list is picked
        // Then the report count and the loaded transaction are one expense, so combine stays hidden
        await expectHookToOffer({expenseCount: 1, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true});
    });

    it('adds reported and unreported expenses together', async () => {
        // Given one expense on an owned report and one unreported expense
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, {...unreportedTransaction, transactionID: '2'});

        // When every slot of the expected list is picked
        // Then both sources add up to two expenses, which can be combined
        await expectHookToOffer({expenseCount: 2, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true});
    });

    it('offers only the safe prompts outside the Concierge inbox DM', async () => {
        // Given an account with every prerequisite met
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...expenseReport, transactionCount: 2});

        // When the composer belongs to another chat or the side panel
        // Then the hook skips the eligibility work and falls back to the safe prompts
        await expectHookToOffer(NO_ELIGIBILITY, false);
    });

    it('adapts when a report loads after mount and when it is deleted', async () => {
        // Given a composer mounted before any report data arrives, with the seed on the last slot
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();
        expect(result.current).toBe(getLastEligibleKey(NO_ELIGIBILITY));

        // When an owned report arrives without remounting
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        });

        // Then the same seed picks from the longer list
        expect(result.current).toBe(getLastEligibleKey({expenseCount: 1, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true}));

        // When the report is marked for deletion
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        });

        // Then the composer goes back to a safe prompt instead of keeping a stale one
        expect(result.current).toBe(getLastEligibleKey(NO_ELIGIBILITY));
    });

    it('rechecks ownership when the report owner changes', async () => {
        // Given an owned report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // When the report now belongs to another user
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {ownerAccountID: OTHER_ACCOUNT_ID});
        });

        // Then only the prompts for a report the user can see remain
        expect(result.current).toBe(getLastEligibleKey({...NO_ELIGIBILITY, hasAccessibleReports: true}));
    });

    it('keeps expense prompts when deleting a report leaves its expense unreported', async () => {
        // Given an owned report and its expense
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, reportedTransaction);
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // When the report is deleted and its expense becomes unreported, as Delete report does
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
        });

        // Then the unreported expense still unlocks the prompts about the user's own expenses
        expect(result.current).toBe(getLastEligibleKey({...NO_ELIGIBILITY, expenseCount: 1}));
    });

    it('waits for the report count instead of counting loaded transactions early', async () => {
        // Given an owned report whose count has not arrived yet and its loaded transaction
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...expenseReport, transactionCount: 0});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, reportedTransaction);
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();
        expect(result.current).toBe(getLastEligibleKey(NO_ELIGIBILITY));

        // When the count arrives without a transaction update
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {transactionCount: 1});
        });

        // Then the report unlocks its prompts from the count alone
        expect(result.current).toBe(getLastEligibleKey({expenseCount: 1, hasAccessibleReports: true, hasOwnExpenseReports: true, hasOwnReports: true}));
    });

    it('keeps the selection across unrelated updates and rerenders', async () => {
        // Given an owned report and a mounted composer
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        const {result, rerender} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();
        const initialKey = result.current;

        // When unrelated report data changes and a new random value would differ
        jest.mocked(Math.random).mockReturnValue(0);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportName: 'Updated report'});
        });
        rerender({});

        // Then the seed picked at mount is kept, so the prompt does not change
        expect(result.current).toBe(initialKey);
    });
});
