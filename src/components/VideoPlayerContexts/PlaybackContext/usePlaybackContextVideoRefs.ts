import {useCallback, useMemo, useRef} from 'react';
import type {PlaybackContextVideoRefs, StopVideo} from './types';

function usePlaybackContextVideoRefs(resetCallback: () => void) {
    const currentVideoPlayerRef: PlaybackContextVideoRefs['playerRef'] = useRef(null);
    const currentVideoViewRef: PlaybackContextVideoRefs['viewRef'] = useRef(null);

    const playVideo: PlaybackContextVideoRefs['play'] = useCallback(() => {
        currentVideoPlayerRef.current?.play();
    }, []);

    const pauseVideo: PlaybackContextVideoRefs['pause'] = useCallback(() => {
        currentVideoPlayerRef.current?.pause();
    }, []);

    const replayVideo: PlaybackContextVideoRefs['replay'] = useCallback(() => {
        currentVideoPlayerRef.current?.replay();
    }, []);

    const stopVideo: StopVideo = useCallback(() => {
        if (!currentVideoPlayerRef.current) {
            return;
        }
        currentVideoPlayerRef.current.pause();
        currentVideoPlayerRef.current.currentTime = 0;
    }, [currentVideoPlayerRef]);

    const checkIfVideoIsPlaying: PlaybackContextVideoRefs['isPlaying'] = useCallback(
        (statusCallback) => statusCallback(currentVideoPlayerRef.current?.playing ?? false),
        [currentVideoPlayerRef],
    );

    const resetVideoPlayerData: PlaybackContextVideoRefs['resetPlayerData'] = useCallback(() => {
        stopVideo();
        currentVideoPlayerRef.current = null;
        currentVideoViewRef.current = null;
        resetCallback();
    }, [resetCallback, stopVideo]);

    const updateCurrentVideoPlayerRefs: PlaybackContextVideoRefs['updateRefs'] = (playerRef, viewRef) => {
        currentVideoPlayerRef.current = playerRef;
        currentVideoViewRef.current = viewRef;
    };

    return useMemo(
        (): PlaybackContextVideoRefs => ({
            playerRef: currentVideoPlayerRef,
            viewRef: currentVideoViewRef,
            play: playVideo,
            pause: pauseVideo,
            replay: replayVideo,
            stop: stopVideo,
            isPlaying: checkIfVideoIsPlaying,
            resetPlayerData: resetVideoPlayerData,
            updateRefs: updateCurrentVideoPlayerRefs,
        }),
        [checkIfVideoIsPlaying, pauseVideo, playVideo, replayVideo, resetVideoPlayerData, stopVideo],
    );
}

export default usePlaybackContextVideoRefs;
