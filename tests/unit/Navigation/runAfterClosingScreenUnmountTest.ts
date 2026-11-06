import runAfterClosingScreenUnmount from '@libs/Navigation/helpers/runAfterClosingScreenUnmount';

import CONST from '@src/CONST';

// The mock mirrors the scheduler package's unstable_* export names and runs the task right away.
jest.mock('scheduler', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention -- must match the package export name
    unstable_LowPriority: 4,
    // eslint-disable-next-line @typescript-eslint/naming-convention -- must match the package export name
    unstable_scheduleCallback: (priority: number, callback: () => void) => callback(),
}));

describe('runAfterClosingScreenUnmount', () => {
    beforeEach(() => {
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('runs the callback once after two frames', () => {
        // Given animation frames that fire normally
        const frames: FrameRequestCallback[] = [];
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation((frame) => {
            frames.push(frame);
            return frames.length;
        });
        const callback = jest.fn();

        // When the callback is scheduled and two frames pass
        runAfterClosingScreenUnmount(callback);
        frames.shift()?.(0);
        expect(callback).not.toHaveBeenCalled();
        frames.shift()?.(0);

        // Then it runs right after the second frame, and the fallback timer does not run it again
        expect(callback).toHaveBeenCalledTimes(1);
        jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS);
        expect(callback).toHaveBeenCalledTimes(1);
    });

    it('still runs the callback when animation frames never fire, e.g. in a background browser tab', () => {
        // Given a background tab where the browser delivers no animation frames
        jest.spyOn(global, 'requestAnimationFrame').mockImplementation(() => 0);
        const callback = jest.fn();

        // When the callback is scheduled and the fallback time passes
        runAfterClosingScreenUnmount(callback);
        jest.advanceTimersByTime(CONST.MAX_TRANSITION_DURATION_MS);

        // Then it runs anyway, so a deferred expense write is not stuck until the user returns to the tab
        expect(callback).toHaveBeenCalledTimes(1);
    });
});
