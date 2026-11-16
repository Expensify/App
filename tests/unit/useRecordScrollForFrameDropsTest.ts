import {renderHook} from '@testing-library/react-native';

import useRecordScrollForFrameDrops from '@hooks/useRecordScrollForFrameDrops/index.native';

import {clear, getTimeline, setRecording} from '@libs/telemetry/frameDrops/frameDropTimeline';

import CONST from '@src/CONST';

let now = 0;

beforeEach(() => {
    jest.useFakeTimers();
    now = 0;
    jest.spyOn(performance, 'now').mockImplementation(() => now);
    clear();
    setRecording(true);
});

afterEach(() => {
    setRecording(false);
    clear();
    jest.restoreAllMocks();
    jest.useRealTimers();
});

describe('useRecordScrollForFrameDrops', () => {
    it('records one scroll interaction for a burst of scroll events and ends it once they stop', () => {
        // Given a list that reports a burst of scroll events
        const {result} = renderHook(() => useRecordScrollForFrameDrops());

        // When the events arrive closer together than the scroll end delay
        now = 100;
        result.current();
        now = 200;
        jest.advanceTimersByTime(100);
        result.current();

        // Then a single scroll interaction is open
        expect(getTimeline().interactions).toEqual([expect.objectContaining({label: CONST.TELEMETRY.FRAME_DROPS.INTERACTION_SCROLL, start: 100})]);
        expect(getTimeline().interactions.at(0)?.end).toBeUndefined();

        // When no event arrives for the scroll end delay
        now = 200 + CONST.TELEMETRY.FRAME_DROPS.SCROLL_END_DELAY_MS;
        jest.advanceTimersByTime(CONST.TELEMETRY.FRAME_DROPS.SCROLL_END_DELAY_MS);

        // Then the scroll interaction ends
        expect(getTimeline().interactions).toEqual([expect.objectContaining({start: 100, end: 200 + CONST.TELEMETRY.FRAME_DROPS.SCROLL_END_DELAY_MS})]);
    });

    it('ends the scroll when the list unmounts while scrolling', () => {
        // Given a list that is scrolling
        const {result, unmount} = renderHook(() => useRecordScrollForFrameDrops());
        result.current();

        // When the list unmounts before the scroll end delay passes
        now = 50;
        unmount();

        // Then the scroll interaction ends right away
        expect(getTimeline().interactions).toEqual([expect.objectContaining({start: 0, end: 50})]);
    });
});
