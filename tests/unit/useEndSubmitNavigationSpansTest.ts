import useEndSubmitNavigationSpans from '@hooks/useEndSubmitNavigationSpans';

import {endSubmitFollowUpActionSpan, getPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';

import CONST from '@src/CONST';

import {renderHook} from '@testing-library/react-native';

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: jest.fn(),
    endSubmitFollowUpActionSpan: jest.fn(),
}));

const mockGetPending = jest.mocked(getPendingSubmitFollowUpAction);
const mockEndSpan = jest.mocked(endSubmitFollowUpActionSpan);

beforeEach(() => {
    jest.clearAllMocks();
});

describe('useEndSubmitNavigationSpans', () => {
    describe('requireLayout: true (narrow layout)', () => {
        it('ends span on focus alone when followUpAction is NAVIGATE_TO_SEARCH', () => {
            mockGetPending.mockReturnValue({followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH});

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: true}));
            result.current(false, 'focus');

            expect(mockEndSpan).toHaveBeenCalledWith(
                CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH,
                undefined,
                expect.objectContaining({[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true}),
            );
        });

        it('ends span on focus alone when followUpAction is DISMISS_MODAL_ONLY', () => {
            mockGetPending.mockReturnValue({followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY});

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: true}));
            result.current(true, 'focus');

            expect(mockEndSpan).toHaveBeenCalledWith(
                CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
                undefined,
                expect.objectContaining({[CONST.TELEMETRY.ATTRIBUTE_IS_WARM]: true, [CONST.TELEMETRY.ATTRIBUTE_WAS_LIST_EMPTY]: true}),
            );
        });

        it('does NOT end span on focus alone when followUpAction is DISMISS_MODAL_AND_OPEN_REPORT', () => {
            mockGetPending.mockReturnValue({followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT});

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: true}));
            result.current(false, 'focus');

            expect(mockEndSpan).not.toHaveBeenCalled();
        });

        it('does not end span even with both signals for DISMISS_MODAL_AND_OPEN_REPORT (report screen handles it)', () => {
            mockGetPending.mockReturnValue({followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT});

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: true}));
            result.current(false, 'focus');
            result.current(false, 'layout');

            expect(mockEndSpan).not.toHaveBeenCalled();
        });

        it('does not end span with only layout signal', () => {
            mockGetPending.mockReturnValue({followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT});

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: true}));
            result.current(false, 'layout');

            expect(mockEndSpan).not.toHaveBeenCalled();
        });

        it('does not end span when no pending action exists', () => {
            mockGetPending.mockReturnValue(null);

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: true}));
            result.current(false, 'focus');

            expect(mockEndSpan).not.toHaveBeenCalled();
        });
    });

    describe('requireLayout: false (wide layout)', () => {
        it('ends span immediately on any signal without gate', () => {
            mockGetPending.mockReturnValue({followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH});

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: false}));
            result.current(false, 'focus');

            expect(mockEndSpan).toHaveBeenCalled();
        });

        it('does not end span for DISMISS_MODAL_AND_OPEN_REPORT (filtered after gate)', () => {
            mockGetPending.mockReturnValue({followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT});

            const {result} = renderHook(() => useEndSubmitNavigationSpans({requireLayout: false}));
            result.current(false, 'layout');

            expect(mockEndSpan).not.toHaveBeenCalled();
        });
    });
});
