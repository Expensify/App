import {cancelTracking, getPendingSubmitFollowUpAction, isTracking, setPendingSubmitFollowUpAction, startTracking} from '@libs/telemetry/submitFollowUpAction';
import type {SubmitExpenseContext} from '@libs/telemetry/submitFollowUpAction';
import CONST from '@src/CONST';

const mockCancelSpan = jest.fn();

jest.mock('@libs/telemetry/activeSpans', () => ({
    cancelSpan: (...args: unknown[]) => {
        mockCancelSpan(...args);
    },
    endSpanWithAttributes: jest.fn(),
    getSpan: jest.fn(() => ({setAttribute: jest.fn()})),
    startSpan: jest.fn(() => ({setAttributes: jest.fn()})),
}));

jest.mock('@libs/Navigation/navigationRef', () => ({
    __esModule: true,
    default: {addListener: jest.fn(), getRootState: jest.fn(() => ({routes: []}))},
}));

jest.mock('@libs/Navigation/helpers/getActiveTabName', () => jest.fn());
jest.mock('@libs/Navigation/helpers/isNavigatorName', () => ({isFullScreenName: jest.fn()}));
jest.mock('@libs/Log', () => ({info: jest.fn(), warn: jest.fn()}));

const MOCK_CONTEXT: SubmitExpenseContext = {
    scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.REQUEST_MONEY_MANUAL,
    iouType: CONST.IOU.TYPE.SUBMIT,
    requestType: CONST.IOU.REQUEST_TYPE.MANUAL,
    isFromGlobalCreate: true,
    hasReceipt: false,
};

/**
 * Simulates the useEffect cleanup logic from IOURequestStepConfirmation (fallback
 * for gesture/hardware back that bypasses navigateBack).
 */
function simulateConfirmationUnmount() {
    if (!isTracking() || getPendingSubmitFollowUpAction()) {
        return;
    }
    cancelTracking();
}

/**
 * Simulates navigateBack being called (user presses the back button explicitly).
 * This always cancels regardless of pending state.
 */
function simulateNavigateBack() {
    cancelTracking();
}

beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    cancelTracking();
});

afterEach(() => {
    jest.useRealTimers();
});

describe('cancelTracking on confirmation discard', () => {
    it('isTracking returns true after startTracking is called', () => {
        expect(isTracking()).toBe(false);
        startTracking(MOCK_CONTEXT);
        expect(isTracking()).toBe(true);
    });

    it('isTracking returns false after cancelTracking is called', () => {
        startTracking(MOCK_CONTEXT);
        cancelTracking();
        expect(isTracking()).toBe(false);
    });

    it('cancelTracking is safe to call when no session is active', () => {
        expect(isTracking()).toBe(false);
        expect(() => cancelTracking()).not.toThrow();
        expect(isTracking()).toBe(false);
    });

    describe('navigateBack (explicit back button)', () => {
        it('cancels tracking even when pending follow-up action is set', () => {
            startTracking(MOCK_CONTEXT);
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);
            mockCancelSpan.mockClear();

            simulateNavigateBack();

            expect(isTracking()).toBe(false);
            expect(mockCancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
            expect(mockCancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
        });

        it('is a no-op when no tracking is active', () => {
            mockCancelSpan.mockClear();
            simulateNavigateBack();
            expect(isTracking()).toBe(false);
            expect(mockCancelSpan).not.toHaveBeenCalled();
        });

        it('cancels when submit hung after DEFAULT handler (pending not set)', () => {
            startTracking(MOCK_CONTEXT);
            mockCancelSpan.mockClear();

            simulateNavigateBack();

            expect(isTracking()).toBe(false);
            expect(mockCancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
            expect(mockCancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
        });
    });

    describe('useEffect cleanup (fallback for gesture back)', () => {
        it('cancels tracking when unmounting without a pending follow-up action', () => {
            startTracking(MOCK_CONTEXT);
            mockCancelSpan.mockClear();

            simulateConfirmationUnmount();

            expect(isTracking()).toBe(false);
            expect(mockCancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);
            expect(mockCancelSpan).toHaveBeenCalledWith(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
        });

        it('does NOT cancel when a pending follow-up action is set (orchestrator dismiss)', () => {
            startTracking(MOCK_CONTEXT);
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH);

            simulateConfirmationUnmount();

            expect(isTracking()).toBe(true);
            cancelTracking();
        });

        it('does NOT cancel when no tracking is active', () => {
            simulateConfirmationUnmount();

            expect(isTracking()).toBe(false);
        });

        it('preserves tracking for sendMoney flow where pending is set synchronously', () => {
            startTracking(MOCK_CONTEXT);
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, '12345');

            simulateConfirmationUnmount();

            expect(isTracking()).toBe(true);
            cancelTracking();
        });
    });
});
