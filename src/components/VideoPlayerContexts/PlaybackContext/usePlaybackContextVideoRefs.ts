import {useRef} from 'react';
import type {PlaybackContextVideoRefs, StopVideo} from './types';

function usePlaybackContextVideoRefs(resetCallback: () => void) {
    const currentVideoPlayerRef: PlaybackContextVideoRefs['playerRef'] = useRef(null);
    const currentVideoViewRef: PlaybackContextVideoRefs['viewRef'] = useRef(null);

    const playVideo: PlaybackContextVideoRefs['play'] = () => {
        currentVideoPlayerRef.current?.play();
    };

    const pauseVideo: PlaybackContextVideoRefs['pause'] = () => {
        currentVideoPlayerRef.current?.pause();
    };

    const replayVideo: PlaybackContextVideoRefs['replay'] = () => {
        currentVideoPlayerRef.current?.replay();
    };

    const stopVideo: StopVideo = () => {
        if (!currentVideoPlayerRef.current) {
            return;
        }
        currentVideoPlayerRef.current.pause();
        currentVideoPlayerRef.current.currentTime = 0;
    };

    const checkIfVideoIsPlaying: PlaybackContextVideoRefs['isPlaying'] = (statusCallback) => statusCallback(currentVideoPlayerRef.current?.playing ?? false);

    const resetVideoPlayerData: PlaybackContextVideoRefs['resetPlayerData'] = () => {
        stopVideo();
        currentVideoPlayerRef.current = null;
        currentVideoViewRef.current = null;
        resetCallback();
    };

    const updateCurrentVideoPlayerRefs: PlaybackContextVideoRefs['updateRefs'] = (playerRef, viewRef) => {
        currentVideoPlayerRef.current = playerRef;
        currentVideoViewRef.current = viewRef;
    };

    return {
        playerRef: currentVideoPlayerRef,
        viewRef: currentVideoViewRef,
        play: playVideo,
        pause: pauseVideo,
        replay: replayVideo,
        stop: stopVideo,
        isPlaying: checkIfVideoIsPlaying,
        resetPlayerData: resetVideoPlayerData,
        updateRefs: updateCurrentVideoPlayerRefs,
    };
}

export default usePlaybackContextVideoRefs;
