import {act, renderHook} from '@testing-library/react-native';

import useMoneyRequestReportPendingExpense from '@components/MoneyRequestReportView/useMoneyRequestReportPendingExpense';

import type {SubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

import type * as ReactNavigationNative from '@react-navigation/native';

import createRandomTransaction from '../utils/collections/transaction';

type FocusCallback = () => void | (() => void);

type PendingSubmit = {followUpAction: SubmitFollowUpAction; reportID?: string} | null;

const mockUseFocusEffect = jest.fn<void, [FocusCallback]>();

jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'),
    useFocusEffect: (callback: FocusCallback) => {
        mockUseFocusEffect(callback);
    },
}));

const mockGetPendingSubmitFollowUpAction = jest.fn<PendingSubmit, []>(() => null);

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: () => mockGetPendingSubmitFollowUpAction(),
}));

const mockIsReportOpenInSuperWideRHP = jest.fn(() => true);

jest.mock('@navigation/helpers/isReportOpenInSuperWideRHP', () => ({
    __esModule: true,
    default: () => mockIsReportOpenInSuperWideRHP(),
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    navigationRef: {
        getRootState: jest.fn(),
    },
}));

const REPORT_ID = '1';

let transactionSequence = 0;

function buildTransaction(pendingAction?: Transaction['pendingAction']): Transaction {
    transactionSequence += 1;
    return {
        ...createRandomTransaction(transactionSequence),
        transactionID: `${transactionSequence}`,
        reportID: REPORT_ID,
        pendingAction,
        pendingFields: undefined,
    };
}

function mockPendingSubmitThatWouldShowPlaceholder() {
    mockGetPendingSubmitFollowUpAction.mockReturnValue({
        followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
        reportID: REPORT_ID,
    });
}

function getFocusCallback(): FocusCallback {
    const callback = mockUseFocusEffect.mock.calls.at(-1)?.[0];
    if (!callback) {
        throw new Error('useFocusEffect was not called');
    }
    return callback;
}

function refocus() {
    act(() => {
        getFocusCallback()();
    });
}

beforeEach(() => {
    jest.clearAllMocks();
    transactionSequence = 0;
    mockGetPendingSubmitFollowUpAction.mockReturnValue(null);
    mockIsReportOpenInSuperWideRHP.mockReturnValue(true);
});

describe('useMoneyRequestReportPendingExpense', () => {
    it('shows the placeholder on focus when a submit is awaiting its deferred write in a super-wide RHP', () => {
        // Given a report whose submit is waiting out the safety timeout before the IOU write is
        // forwarded, with transactions on screen but no new one yet
        mockPendingSubmitThatWouldShowPlaceholder();
        const {result} = renderHook(() => useMoneyRequestReportPendingExpense(REPORT_ID, [buildTransaction()]));

        // When the screen gains focus - the moment the user would otherwise see the approved report
        // without the expense they just submitted
        refocus();

        // Then a placeholder stands in for the expense the backend has accepted but the client
        // cannot render yet, so the list does not look like the submit was ignored
        expect(result.current).toBe(true);
    });

    it('does not show the placeholder when no submit is awaiting its deferred write', () => {
        // Given this report was opened normally, with no deferred submit pending
        mockGetPendingSubmitFollowUpAction.mockReturnValue(null);
        const {result} = renderHook(() => useMoneyRequestReportPendingExpense(REPORT_ID, [buildTransaction()]));

        // When
        refocus();

        // Then nothing is faked - the transactions reported by the backend are the whole truth
        expect(result.current).toBe(false);
    });

    it('does not show the placeholder for a deferred submit made on another report', () => {
        // Given a deferred submit exists, but for a different report than the one now focused
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
            reportID: '2',
        });
        const {result} = renderHook(() => useMoneyRequestReportPendingExpense(REPORT_ID, [buildTransaction()]));

        // When
        refocus();

        // Then this report stays clean rather than borrowing another report's pending expense
        expect(result.current).toBe(false);
    });

    it('does not show the placeholder for a follow-up action that forwards the write immediately', () => {
        // Given the dismissed modal was going to open the report or navigate to search, so the write
        // is forwarded instead of deferred
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
            reportID: REPORT_ID,
        });
        const {result} = renderHook(() => useMoneyRequestReportPendingExpense(REPORT_ID, [buildTransaction()]));

        // When
        refocus();

        // Then
        expect(result.current).toBe(false);
    });

    it('does not show the placeholder when the report is not open in a super-wide RHP', () => {
        // Given the deferred submit is pending, but the report is not visible next to the modal -
        // full-screen flows already hide the stale list behind the modal
        mockPendingSubmitThatWouldShowPlaceholder();
        mockIsReportOpenInSuperWideRHP.mockReturnValue(false);
        const {result} = renderHook(() => useMoneyRequestReportPendingExpense(REPORT_ID, [buildTransaction()]));

        // When
        refocus();

        // Then
        expect(result.current).toBe(false);
        expect(mockIsReportOpenInSuperWideRHP).toHaveBeenCalledTimes(1);
    });

    it('does not show the placeholder when an optimistically created transaction is already visible', () => {
        // Given the deferred submit is pending, but the user created a transaction that is already
        // on screen optimistically
        mockPendingSubmitThatWouldShowPlaceholder();
        const {result} = renderHook(() => useMoneyRequestReportPendingExpense(REPORT_ID, [buildTransaction(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)]));

        // When
        refocus();

        // Then no placeholder is added, because it would duplicate a transaction the user can see
        expect(result.current).toBe(false);
    });

    it('keeps the placeholder shown while the pending transaction has not arrived', () => {
        // Given the placeholder is up for a deferred submit
        mockPendingSubmitThatWouldShowPlaceholder();
        const transactions = [buildTransaction()];
        const {result, rerender} = renderHook(({transactions: current}) => useMoneyRequestReportPendingExpense(REPORT_ID, current), {
            initialProps: {transactions},
        });

        refocus();
        expect(result.current).toBe(true);

        // When the screen is refocused after the safety timeout expired without the backend sending
        // the new transaction, so the count has not grown
        mockGetPendingSubmitFollowUpAction.mockReturnValue(null);
        rerender({transactions: [...transactions]});
        refocus();

        // Then the placeholder stays: the hook cannot tell a lost write from a slow one, so it keeps
        // showing a pending expense rather than implying the submit failed
        expect(result.current).toBe(true);
    });

    it('removes the placeholder once an optimistically created transaction arrives', () => {
        // Given the placeholder is up for a deferred submit
        mockPendingSubmitThatWouldShowPlaceholder();
        const transactions = [buildTransaction()];
        const {result, rerender} = renderHook(({transactions: current}) => useMoneyRequestReportPendingExpense(REPORT_ID, current), {
            initialProps: {transactions},
        });

        refocus();
        expect(result.current).toBe(true);

        // When the user creates a transaction in the meantime, so a real row is now on screen
        rerender({transactions: [...transactions, buildTransaction(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD)]});
        refocus();

        // Then the placeholder yields to the real transaction instead of showing the expense twice
        expect(result.current).toBe(false);
    });

    it('removes the placeholder when the transaction count grows past the one captured at display time', () => {
        // Given the placeholder is up with one transaction on screen
        mockPendingSubmitThatWouldShowPlaceholder();
        const transactions = [buildTransaction()];
        const {result, rerender} = renderHook(({transactions: current}) => useMoneyRequestReportPendingExpense(REPORT_ID, current), {
            initialProps: {transactions},
        });

        refocus();
        expect(result.current).toBe(true);

        // When more transactions than were present at display time arrive without offline feedback -
        // the heuristic for "the deferred write landed, and there may be more"
        rerender({transactions: [...transactions, buildTransaction(), buildTransaction()]});
        refocus();

        // Then the real transactions are trusted over the placeholder
        expect(result.current).toBe(false);
    });
});
