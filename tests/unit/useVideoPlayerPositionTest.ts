/** Regression coverage for controls waiting for asynchronous video seeks. */
import {act, renderHook} from '@testing-library/react-native';

import useVideoPlayerPosition from '@components/VideoPlayer/useVideoPlayerPosition';

import type {VideoPlayer} from 'expo-video';

import {useEvent, useEventListener} from 'expo';

import createMock from '../utils/createMock';

jest.mock('expo', () => ({useEvent: jest.fn(), useEventListener: jest.fn()}));

const player = createMock<VideoPlayer>({});
const mockUseEvent = jest.mocked(useEvent);
const mockUseEventListener = jest.mocked(useEventListener);

function reportTime(currentTime: number) {
    const event = {currentTime, bufferedPosition: 0, currentLiveTimestamp: null, currentOffsetFromLive: null};
    mockUseEvent.mockReturnValue(event);
    const listener = mockUseEventListener.mock.calls.findLast((call) => call[1] === 'timeUpdate')?.[2];
    if (!listener) {
        throw new Error('Missing timeUpdate listener');
    }
    listener(event);
}

describe('useVideoPlayerPosition', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockUseEvent.mockReturnValue({currentTime: 0, bufferedPosition: 0, currentLiveTimestamp: null, currentOffsetFromLive: null});
    });

    it('keeps a paused seek visible through stale updates, then follows playback after catch-up', () => {
        // Given a paused player whose last reported time is the start of the video
        const {result, rerender} = renderHook(() => useVideoPlayerPosition(player));

        // When the user seeks ahead without receiving a player update
        act(() => result.current.setSeekTargetPosition(35));
        rerender({});

        // Then both controls can use the requested position while raw playback time remains unchanged
        expect(result.current.position).toBe(35);
        expect(result.current.currentTime).toBe(0);

        // When a pre-pause update arrives after release
        act(() => reportTime(0.1));
        rerender({});

        // Then it must not flash the controls back to the pre-drag position
        expect(result.current.position).toBe(35);

        // When the player catches up, and then advances beyond the seek target
        act(() => reportTime(35.1));
        rerender({});
        act(() => reportTime(36));
        rerender({});

        // Then ordinary playback updates are no longer hidden by the optimistic target
        expect(result.current.position).toBe(36);
    });

    it('replaces a pending seek and supports seeking backward to zero', () => {
        // Given a seek that has not yet completed
        const {result, rerender} = renderHook(() => useVideoPlayerPosition(player));
        act(() => result.current.setSeekTargetPosition(50));

        // When a second drag seeks back to zero before the earlier update arrives
        act(() => result.current.setSeekTargetPosition(0));
        act(() => reportTime(50));
        rerender({});

        // Then zero is retained, rather than falling back to the earlier player's time
        expect(result.current.position).toBe(0);

        // When the backward seek completes and playback resumes
        act(() => reportTime(0));
        rerender({});
        act(() => reportTime(1));
        rerender({});

        // Then the controls follow the new playback timeline
        expect(result.current.position).toBe(1);
    });

    it.each(['playToEnd', 'sourceLoad'] as const)('clears a pending seek on %s', (eventName) => {
        // Given a pending seek
        const {result, rerender} = renderHook(() => useVideoPlayerPosition(player));
        act(() => result.current.setSeekTargetPosition(35));

        // When the player ends or loads another source
        const listener = mockUseEventListener.mock.calls.findLast((call) => call[1] === eventName)?.[2];
        if (!listener) {
            throw new Error(`Missing ${eventName} listener`);
        }
        act(() => {
            listener();
        });
        act(() => reportTime(60));
        rerender({});

        // Then the old seek cannot mask subsequent player updates
        expect(result.current.position).toBe(60);
    });

    it('follows native controls after handing off a pending custom seek', () => {
        // Given a paused custom seek whose target has not been reported yet
        const {result, rerender} = renderHook(() => useVideoPlayerPosition(player));
        act(() => result.current.setSeekTargetPosition(35));

        // When fullscreen hands seeking to native controls, which seek backward
        act(() => result.current.setSeekTargetPosition(null));
        act(() => reportTime(10));
        rerender({});

        // Then the earlier custom seek cannot hide the native seek or subsequent playback
        expect(result.current.position).toBe(10);
        act(() => reportTime(11));
        rerender({});
        expect(result.current.position).toBe(11);
    });
});
