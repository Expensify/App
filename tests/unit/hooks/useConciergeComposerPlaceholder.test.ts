import {act, renderHook} from '@testing-library/react-native';
import useConciergeComposerPlaceholder from '@pages/inbox/report/ReportActionCompose/useConciergeComposerPlaceholder';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report, Transaction} from '@src/types/onyx';
import Onyx from 'react-native-onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

const ACCOUNT_ID = 1;
const REPORT_ID = '1';
const PDF_PLACEHOLDER = 'common.concierge.composerPlaceholders.exportPdf';
const HELP_PLACEHOLDER = 'reportActionCompose.askConciergeForHelp';
const BASE_PLACEHOLDERS = ['common.concierge.composerPlaceholders.createExpense', HELP_PLACEHOLDER];
const expenseReport: Report = {reportID: REPORT_ID, type: CONST.REPORT.TYPE.EXPENSE, ownerAccountID: ACCOUNT_ID, transactionCount: 1};
const transaction: Transaction = {transactionID: '1', reportID: REPORT_ID, amount: 3000, currency: 'USD', merchant: 'Lunch', created: '2026-11-08'};

describe('useConciergeComposerPlaceholder', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        await Onyx.set(ONYXKEYS.SESSION, {accountID: ACCOUNT_ID});
        jest.spyOn(Math, 'random').mockReturnValue(0.999);
        await waitForBatchedUpdates();
    });

    afterEach(async () => {
        await act(async () => {
            await Onyx.clear();
        });
        jest.restoreAllMocks();
    });

    it.each(Array.from({length: 15}, (_, index) => index / 15))('only offers safe prompts to a new user for random seed %s', async (seed) => {
        // Given an account with only a Concierge chat, not an expense report
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportID: REPORT_ID, type: CONST.REPORT.TYPE.CHAT});
        jest.mocked(Math.random).mockReturnValue(seed);

        // When Concierge picks any of the original random slots
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // Then no history-dependent prompt can be selected
        expect(BASE_PLACEHOLDERS).toContain(result.current);
    });

    it('allows the PDF prompt when a nonempty report belongs to the user', async () => {
        // Given a user-owned expense report with expenses
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);

        // When the random seed selects the PDF slot
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // Then the PDF prompt is available
        expect(result.current).toBe(PDF_PLACEHOLDER);
    });

    it.each([
        ['empty', {...expenseReport, transactionCount: 0}],
        ['pending deletion', {...expenseReport, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}],
        ['chat', {...expenseReport, type: CONST.REPORT.TYPE.CHAT}],
    ])('does not offer PDF export for an %s report', async (_description, report) => {
        // Given a report that cannot establish the user's export eligibility
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, report);

        // When the random seed would otherwise select PDF export
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // Then only a generic prompt is offered
        expect(result.current).toBe(HELP_PLACEHOLDER);
    });

    it('updates after delayed report loading and removes a stale PDF prompt on deletion', async () => {
        // Given a mounted composer before report data arrives
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();
        expect(result.current).toBe(HELP_PLACEHOLDER);

        // When an eligible report arrives after mount
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        });

        // Then the existing composer can select PDF export without remounting
        expect(result.current).toBe(PDF_PLACEHOLDER);

        // When the last eligible report is marked for deletion
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        });

        // Then the stored random seed resolves to a safe prompt instead of retaining PDF export
        expect(result.current).toBe(HELP_PLACEHOLDER);
    });

    it('does not treat a tracked expense without a report as PDF eligibility', async () => {
        // Given a tracked expense that has no money-request report
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {...transaction, reportID: CONST.REPORT.UNREPORTED_REPORT_ID});

        // When Concierge selects from expense-dependent prompts
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // Then expense CSV is available but report PDF is not
        expect(result.current).toBe('common.concierge.composerPlaceholders.exportCsv');
    });

    it('only offers combining expenses when at least two expenses remain', async () => {
        // Given two expenses and a seed selecting the combine prompt
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {...transaction, reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, {...transaction, transactionID: '2', reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();
        expect(result.current).toBe('common.concierge.composerPlaceholders.combineExpenses');

        // When one expense is marked for deletion
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        });

        // Then the combine prompt is no longer eligible
        expect(result.current).toBe('common.concierge.composerPlaceholders.exportCsv');

        // When the last expense is removed
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, null);
        });

        // Then a pending-deleted expense does not keep history-dependent prompts eligible
        expect(result.current).toBe(HELP_PLACEHOLDER);
    });

    it.each([
        [0.5, 'common.concierge.composerPlaceholders.awaitingApproval'],
        [0.999, 'common.concierge.composerPlaceholders.leftToPay'],
    ])('offers approver and payer prompts without owned reports for seed %s', async (seed, expectedPlaceholder) => {
        // Given another user's submitted report and its loaded expense, but no own expenses
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...expenseReport, ownerAccountID: 2});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, transaction);
        jest.mocked(Math.random).mockReturnValue(seed);

        // When Concierge selects from accessible-report prompts
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // Then approval/payment prompts are available without enabling personal report prompts
        expect(result.current).toBe(expectedPlaceholder);
    });

    it.each(Array.from({length: 15}, (_, index) => index / 15))('never offers personal prompts for others\' expenses with seed %s', async (seed) => {
        // Given only another user's report and two of their expenses loaded by an approver
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...expenseReport, ownerAccountID: 2});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, transaction);
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, {...transaction, transactionID: '2'});
        jest.mocked(Math.random).mockReturnValue(seed);

        // When any random slot is selected
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // Then only safe defaults and accessible-report prompts are eligible, never CSV, PDF or combining
        expect([...BASE_PLACEHOLDERS, 'common.concierge.composerPlaceholders.awaitingApproval', 'common.concierge.composerPlaceholders.leftToPay']).toContain(result.current);
    });

    it('requires two own expenses rather than one own and one other expense to combine', async () => {
        // Given one unreported own expense and another user's reported expense
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...expenseReport, ownerAccountID: 2, transactionCount: 0});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, {...transaction, reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, {...transaction, transactionID: '2'});
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();

        // When the other expense is visible
        // Then it does not enable combining personal expenses
        expect(result.current).toBe('common.concierge.composerPlaceholders.exportCsv');

        // When the second expense becomes an own unreported expense
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}2`, {reportID: CONST.REPORT.UNREPORTED_REPORT_ID});
        });

        // Then combining becomes eligible
        expect(result.current).toBe('common.concierge.composerPlaceholders.combineExpenses');
    });

    it('rechecks expense ownership when reports load, change owner or are deleted', async () => {
        // Given an expense whose report has not loaded yet
        await Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION}1`, transaction);
        const {result} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();
        expect(result.current).toBe(HELP_PLACEHOLDER);

        // When its owned report loads before its transaction count
        await act(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {...expenseReport, transactionCount: 0});
        });

        // Then personal expense prompts become eligible without a transaction update
        expect(result.current).toBe('common.concierge.composerPlaceholders.exportCsv');

        // When ownership changes without modifying the transaction
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {ownerAccountID: 2});
        });

        // Then the other user's expense no longer enables personal prompts
        expect(result.current).toBe(HELP_PLACEHOLDER);

        // When ownership is restored but the report is pending deletion
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {ownerAccountID: ACCOUNT_ID, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE});
        });

        // Then the deleted report cannot establish expense ownership
        expect(result.current).toBe(HELP_PLACEHOLDER);
    });

    it('keeps the selection stable across unrelated updates and rerenders', async () => {
        // Given an eligible report and a mounted composer
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);
        const {result, rerender} = renderHook(() => useConciergeComposerPlaceholder(true));
        await waitForBatchedUpdates();
        expect(result.current).toBe(PDF_PLACEHOLDER);

        // When unrelated report data changes and a different random value would be returned
        jest.mocked(Math.random).mockReturnValue(0);
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, {reportName: 'Updated report'});
        });
        rerender({});

        // Then the per-mount random seed remains unchanged
        expect(result.current).toBe(PDF_PLACEHOLDER);
    });

    it('does not enable history-dependent prompts outside the Concierge inbox DM', async () => {
        // Given eligible report data outside the main Concierge conversation
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${REPORT_ID}`, expenseReport);

        // When eligibility is disabled for a regular chat or side panel
        const {result} = renderHook(() => useConciergeComposerPlaceholder(false));
        await waitForBatchedUpdates();

        // Then the hook does not select a report-dependent prompt
        expect(result.current).toBe(HELP_PLACEHOLDER);
    });
});
