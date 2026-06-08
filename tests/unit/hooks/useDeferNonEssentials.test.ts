import {act, renderHook} from '@testing-library/react-native';
import useDeferNonEssentials from '@pages/inbox/hooks/useDeferNonEssentials';
import CONST from '@src/CONST';

type PendingAction = {followUpAction: string; reportID?: string} | null;

const mockGetPendingSubmitFollowUpAction = jest.fn<PendingAction, []>();
const mockRunAfterTransitions = jest.fn<{cancel: jest.Mock}, [unknown]>();
let focusEffectCleanup: (() => void) | undefined;

jest.mock('@react-navigation/native', () => ({
    useFocusEffect: (cb: () => (() => void) | undefined) => {
        focusEffectCleanup = cb();
    },
}));

jest.mock('@libs/telemetry/submitFollowUpAction', () => ({
    getPendingSubmitFollowUpAction: () => mockGetPendingSubmitFollowUpAction(),
}));

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    runAfterTransitions: (opts: unknown) => mockRunAfterTransitions(opts),
}));

describe('useDeferNonEssentials', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        focusEffectCleanup = undefined;
        mockRunAfterTransitions.mockReturnValue({cancel: jest.fn()});
    });

    it('returns true when pending action matches DISMISS_MODAL_AND_OPEN_REPORT and reportID matches', () => {
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
            reportID: 'report-1',
        });

        const {result} = renderHook(() => useDeferNonEssentials('report-1'));

        expect(result.current).toBe(true);
    });

    it('returns false when pending action is DISMISS_MODAL_ONLY', () => {
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
            reportID: 'report-1',
        });

        const {result} = renderHook(() => useDeferNonEssentials('report-1'));

        expect(result.current).toBe(false);
    });

    it('returns false when reportID does not match', () => {
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
            reportID: 'report-999',
        });

        const {result} = renderHook(() => useDeferNonEssentials('report-1'));

        expect(result.current).toBe(false);
    });

    it('returns false when there is no pending action', () => {
        mockGetPendingSubmitFollowUpAction.mockReturnValue(null);

        const {result} = renderHook(() => useDeferNonEssentials('report-1'));

        expect(result.current).toBe(false);
    });

    it('returns false when reportIDFromRoute is undefined', () => {
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
            reportID: 'report-1',
        });

        const {result} = renderHook(() => useDeferNonEssentials(undefined));

        expect(result.current).toBe(false);
    });

    it('schedules runAfterTransitions when deferring', () => {
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
            reportID: 'report-1',
        });

        renderHook(() => useDeferNonEssentials('report-1'));

        expect(mockRunAfterTransitions).toHaveBeenCalledWith(
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            expect.objectContaining({callback: expect.any(Function), waitForUpcomingTransition: true}),
        );
    });

    it('does not schedule runAfterTransitions when not deferring', () => {
        mockGetPendingSubmitFollowUpAction.mockReturnValue(null);

        renderHook(() => useDeferNonEssentials('report-1'));

        expect(mockRunAfterTransitions).not.toHaveBeenCalled();
    });

    it('lifts deferral via safety timeout', () => {
        jest.useFakeTimers();
        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
            reportID: 'report-1',
        });

        const {result} = renderHook(() => useDeferNonEssentials('report-1'));

        expect(result.current).toBe(true);

        act(() => {
            jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS * 3);
        });

        expect(result.current).toBe(false);
        jest.useRealTimers();
    });

    it('cancels handles on cleanup', () => {
        const mockCancel = jest.fn();
        mockRunAfterTransitions.mockReturnValue({cancel: mockCancel});

        mockGetPendingSubmitFollowUpAction.mockReturnValue({
            followUpAction: CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT,
            reportID: 'report-1',
        });

        renderHook(() => useDeferNonEssentials('report-1'));

        expect(typeof focusEffectCleanup).toBe('function');
        focusEffectCleanup?.();

        expect(mockCancel).toHaveBeenCalled();
    });
});
