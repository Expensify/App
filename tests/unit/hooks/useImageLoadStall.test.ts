import {act, renderHook} from '@testing-library/react-native';

import useImageLoadStall from '@hooks/useImageLoadStall';

import CONST from '@src/CONST';

const {IMAGE_LOAD_CEILING_TIMEOUT, IMAGE_LOAD_STALL_TIMEOUT} = CONST.TIMING;

function renderStallWatch(onStalled = jest.fn()) {
    const {result, rerender} = renderHook(({isActive}: {isActive: boolean}) => useImageLoadStall(isActive, onStalled), {
        initialProps: {isActive: true},
    });
    return {onStalled, reportActivity: result.current, rerender};
}

describe('useImageLoadStall', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('reports once after the ceiling when no activity is ever reported', () => {
        // Given an active load with no progress signal available
        const {onStalled} = renderStallWatch();

        // When the ceiling passes
        act(() => {
            jest.advanceTimersByTime(IMAGE_LOAD_CEILING_TIMEOUT);
        });

        // Then the load is reported as stalled exactly once
        expect(onStalled).toHaveBeenCalledTimes(1);
        act(() => {
            jest.advanceTimersByTime(IMAGE_LOAD_CEILING_TIMEOUT);
        });
        expect(onStalled).toHaveBeenCalledTimes(1);
    });

    it('keeps a slow load alive while activity keeps arriving', () => {
        // Given an active load that reports progress in steps smaller than both windows
        const {onStalled, reportActivity} = renderStallWatch();

        for (let i = 0; i < 6; i++) {
            act(() => {
                jest.advanceTimersByTime(IMAGE_LOAD_CEILING_TIMEOUT - 1000);
                reportActivity();
            });
        }
        act(() => {
            jest.advanceTimersByTime(IMAGE_LOAD_CEILING_TIMEOUT - 1000);
        });

        // Then no stall is reported even though the total span exceeds both windows
        expect(onStalled).not.toHaveBeenCalled();
    });

    it('arms the longer stall window once activity has been seen', () => {
        // Given a load that has already reported activity
        const {onStalled, reportActivity} = renderStallWatch();
        act(() => {
            reportActivity();
        });

        // When the ceiling (and a bit more) passes without further activity
        act(() => {
            jest.advanceTimersByTime(IMAGE_LOAD_CEILING_TIMEOUT + 1000);
        });

        // Then nothing fired yet: the active window is the longer stall timeout
        expect(onStalled).not.toHaveBeenCalled();

        // When the remaining stall window elapses
        act(() => {
            jest.advanceTimersByTime(IMAGE_LOAD_STALL_TIMEOUT - IMAGE_LOAD_CEILING_TIMEOUT - 1000);
        });

        // Then the stall is reported
        expect(onStalled).toHaveBeenCalledTimes(1);
    });

    it('does not watch an inactive load', () => {
        // Given the watch goes inactive (cached image, offline, or load finished)
        const onStalled = jest.fn();
        const {rerender} = renderStallWatch(onStalled);
        rerender({isActive: false});

        // When both windows pass
        act(() => {
            jest.advanceTimersByTime(IMAGE_LOAD_CEILING_TIMEOUT + IMAGE_LOAD_STALL_TIMEOUT);
        });

        // Then nothing was reported
        expect(onStalled).not.toHaveBeenCalled();
    });
});
