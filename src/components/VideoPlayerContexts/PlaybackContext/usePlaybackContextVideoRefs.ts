import type {VideoPlayer} from 'expo-video';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import Visibility from '@libs/Visibility';
import type {PlaybackContextVideoRefs, StopVideo} from './types';

function usePlaybackContextVideoRefs(resetCallback: () => void) {
    const currentVideoPlayerRef: PlaybackContextVideoRefs['ref'] = useRef(null);
    const videoResumeTryNumberRef: PlaybackContextVideoRefs['resumeTryNumberRef'] = useRef(0);
    const isPlayPendingRef = useRef(false);

    const pauseVideo: PlaybackContextVideoRefs['pause'] = useCallback(() => {
        currentVideoPlayerRef.current?.pause();
    }, [currentVideoPlayerRef]);

    const stopVideo: StopVideo = useCallback(() => {
        currentVideoPlayerRef.current?.pause();
        if (currentVideoPlayerRef.current) {
            currentVideoPlayerRef.current.currentTime = 0;
        }
    }, [currentVideoPlayerRef]);

    const playVideo: PlaybackContextVideoRefs['play'] = useCallback(() => {
        if (!Visibility.isVisible()) {
            isPlayPendingRef.current = true;
            return;
        }
        if (currentVideoPlayerRef.current && currentVideoPlayerRef.current.currentTime === currentVideoPlayerRef.current.duration) {
            currentVideoPlayerRef.current.replay();
        } else {
            currentVideoPlayerRef.current?.play();
        }
    }, [currentVideoPlayerRef]);

    const checkIfVideoIsPlaying: (statusCallback: (isPlaying: boolean) => void) => void = useCallback(
        (statusCallback) => statusCallback(currentVideoPlayerRef.current?.playing ?? false),
        [currentVideoPlayerRef],
    );

    const resetVideoPlayerData: PlaybackContextVideoRefs['resetPlayerData'] = useCallback(() => {
        stopVideo();
        videoResumeTryNumberRef.current = 0;
        resetCallback();
        currentVideoPlayerRef.current = null;
    }, [resetCallback, stopVideo]);

    useEffect(() => {
        return Visibility.onVisibilityChange(() => {
            if (!Visibility.isVisible() || !isPlayPendingRef.current) {
                return;
            }
            playVideo();
            isPlayPendingRef.current = false;
        });
    }, [playVideo]);

    const updateCurrentVideoPlayerRef: (videoPlayerRef: VideoPlayer | null) => void = (ref) => {
        currentVideoPlayerRef.current = ref;
    };

    return useMemo(
        (): PlaybackContextVideoRefs => ({
            resetPlayerData: resetVideoPlayerData,
            isPlaying: checkIfVideoIsPlaying,
            pause: pauseVideo,
            play: playVideo,
            ref: currentVideoPlayerRef,
            resumeTryNumberRef: videoResumeTryNumberRef,
            updateRef: updateCurrentVideoPlayerRef,
        }),
        [checkIfVideoIsPlaying, pauseVideo, playVideo, resetVideoPlayerData],
    );
}

export default usePlaybackContextVideoRefs;
