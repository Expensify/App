/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/no-unused-vars */
// eslint-disable-next-line no-restricted-imports
import React, {forwardRef, useRef} from 'react';
import type {ForwardedRef} from 'react';
import {View} from 'react-native';
import type {ViewProps} from 'react-native';

type MutedChangeEventPayload = {
    isMuted: boolean;
};

type PlayingChangeEventPayload = {
    isPlaying: boolean;
};

type StatusChangeEventPayload = {
    status: string;
};

type TimeUpdateEventPayload = {
    currentTime: number;
};

type VideoPlayer = {
    /** lightweight “state” */
    isPlaying: boolean;
    isMuted: boolean;
    currentTime: number;

    /** controls */
    play: jest.Mock<void, []>;
    pause: jest.Mock<void, []>;
    replace: jest.Mock<void, [unknown?]>;
    seekTo: jest.Mock<void, [number]>;
    setIsMuted: jest.Mock<void, [boolean]>;

    /** simple event API */
    addListener: jest.Mock<{remove: () => void}, [string, (payload: unknown) => void]>;
};

function createMockPlayer(): VideoPlayer {
    let _isPlaying = false;
    let _isMuted = false;
    let _currentTime = 0;

    return {
        get isPlaying() {
            return _isPlaying;
        },
        get isMuted() {
            return _isMuted;
        },
        get currentTime() {
            return _currentTime;
        },

        play: jest.fn(() => {
            _isPlaying = true;
        }),
        pause: jest.fn(() => {
            _isPlaying = false;
        }),
        replace: jest.fn((_opts?: unknown) => {
            // no-op; exist to satisfy code that calls it
        }),
        seekTo: jest.fn((time: number) => {
            _currentTime = time;
        }),
        setIsMuted: jest.fn((muted: boolean) => {
            _isMuted = muted;
        }),

        addListener: jest.fn((_event: string, _cb: (payload: unknown) => void) => {
            // minimal, enough for code that calls .remove()
            return {remove: () => {}};
        }),
    };
}

/**
 * Mocked hook – returns a stable mock player instance.
 * Signature accepts any args to match real API calls.
 */
function useVideoPlayer(..._args: unknown[]): VideoPlayer {
    const ref = useRef<VideoPlayer | null>(null);
    if (!ref.current) {
        ref.current = createMockPlayer();
    }
    return ref.current;
}

/**
 * Simple stand-in for the native VideoView.
 * Accepts a `player` prop to mirror the real component.
 */
type VideoViewProps = ViewProps & {player?: VideoPlayer};

const VideoView = forwardRef((props: VideoViewProps, ref: ForwardedRef<View>) => (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <View
        ref={ref}
        accessibilityLabel="MockVideoView"
        // eslint-disable-next-line react/jsx-props-no-spreading
        {...props}
    />
));

export {useVideoPlayer, VideoView};
export type {MutedChangeEventPayload, PlayingChangeEventPayload, StatusChangeEventPayload, TimeUpdateEventPayload};
