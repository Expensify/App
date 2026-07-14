/* eslint-disable @typescript-eslint/naming-convention -- The scheduler package exposes unstable_* named exports, so the mock must mirror those exact names. */
import {Scheduler} from '@libs/Scheduler';

import CONST from '@src/CONST';

import {unstable_cancelCallback as cancelScheduledCallback, unstable_IdlePriority as IdlePriority, unstable_scheduleCallback as scheduleCallback} from 'scheduler';

let mockScheduledCallback: (() => void) | undefined;

jest.mock('scheduler', () => ({
    unstable_IdlePriority: 5,
    unstable_scheduleCallback: jest.fn((priorityLevel: number, callback: () => void) => {
        mockScheduledCallback = callback;

        return {
            callback: null,
            expirationTime: 0,
            id: 1,
            priorityLevel,
            sortIndex: 0,
        };
    }),
    unstable_cancelCallback: jest.fn(),
}));

describe('Scheduler.scheduleWhenIdle', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
        mockScheduledCallback = undefined;
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it('schedules idle work without an unsupported scheduler timeout option', () => {
        const callback = jest.fn();

        Scheduler.scheduleWhenIdle(callback);

        expect(scheduleCallback).toHaveBeenCalledWith(IdlePriority, expect.any(Function));
        expect(jest.mocked(scheduleCallback).mock.calls.at(0)).toHaveLength(2);
    });

    it('runs the callback once from the idle queue and clears the fallback timer', () => {
        const callback = jest.fn();

        Scheduler.scheduleWhenIdle(callback);
        mockScheduledCallback?.();
        jest.advanceTimersByTime(CONST.PRE_INSERT_FULLSCREEN_DELAY);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(cancelScheduledCallback).toHaveBeenCalledTimes(1);
    });

    it('runs the callback from the fallback timer if idle work is starved', () => {
        const callback = jest.fn();

        Scheduler.scheduleWhenIdle(callback);
        jest.advanceTimersByTime(CONST.PRE_INSERT_FULLSCREEN_DELAY - 1);
        expect(callback).not.toHaveBeenCalled();

        jest.advanceTimersByTime(1);

        expect(callback).toHaveBeenCalledTimes(1);
        expect(cancelScheduledCallback).toHaveBeenCalledTimes(1);
    });

    it('cancels both the idle task and fallback timer', () => {
        const callback = jest.fn();

        const task = Scheduler.scheduleWhenIdle(callback);
        task.cancel();
        mockScheduledCallback?.();
        jest.advanceTimersByTime(CONST.PRE_INSERT_FULLSCREEN_DELAY);

        expect(callback).not.toHaveBeenCalled();
        expect(cancelScheduledCallback).toHaveBeenCalledTimes(1);
    });
});
