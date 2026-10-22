import {act, renderHook} from '@testing-library/react-native';

import type useRestoreFocusAfterDiscardHook from '@pages/iou/request/useRestoreFocusAfterDiscard';

import CONST from '@src/CONST';

const mockRunAfterTransitions = jest.fn();

jest.mock('@libs/Navigation/TransitionTracker', () => ({
    __esModule: true,
    default: {
        runAfterTransitions: mockRunAfterTransitions,
    },
}));

type UseRestoreFocusAfterDiscard = typeof useRestoreFocusAfterDiscardHook;
const useRestoreFocusAfterDiscard = jest.requireActual<{default: UseRestoreFocusAfterDiscard}>('@pages/iou/request/useRestoreFocusAfterDiscard').default;

describe('useRestoreFocusAfterDiscard', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        mockRunAfterTransitions.mockImplementation(({callback}: {callback: () => void}) => {
            callback();
            return {cancel: jest.fn()};
        });
    });

    afterEach(() => {
        jest.useRealTimers();
        jest.clearAllMocks();
    });

    it('restores the focused input after a header-back blur and discard cancellation', () => {
        const restoreFocus = jest.fn();
        const {result} = renderHook(() => useRestoreFocusAfterDiscard());

        act(() => {
            result.current.captureFocusedInput(restoreFocus);
            result.current.prepareForDiscardNavigation();
            result.current.clearFocusedInput();
            result.current.setDiscardModalVisibility(true);
            result.current.setDiscardModalVisibility(false);
            result.current.restoreLastFocusedInput();
            jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION);
        });

        expect(restoreFocus).toHaveBeenCalledTimes(1);
    });

    it('does not restore focus after a confirmed discard', () => {
        const restoreFocus = jest.fn();
        const {result, unmount} = renderHook(() => useRestoreFocusAfterDiscard());

        act(() => {
            result.current.captureFocusedInput(restoreFocus);
            result.current.prepareForDiscardNavigation();
            result.current.clearFocusedInput();
            result.current.setDiscardModalVisibility(true);
            result.current.clearDiscardFocus();
            unmount();
            jest.runAllTimers();
        });

        expect(restoreFocus).not.toHaveBeenCalled();
    });

    it('cancels a pending focus restoration when the hook unmounts', () => {
        const restoreFocus = jest.fn();
        const {result, unmount} = renderHook(() => useRestoreFocusAfterDiscard());

        act(() => {
            result.current.captureFocusedInput(restoreFocus);
            result.current.setDiscardModalVisibility(true);
            result.current.setDiscardModalVisibility(false);
            result.current.restoreLastFocusedInput();
        });

        act(() => {
            unmount();
        });

        act(() => {
            jest.advanceTimersByTime(CONST.ANIMATED_TRANSITION);
        });

        expect(restoreFocus).not.toHaveBeenCalled();
    });
});
