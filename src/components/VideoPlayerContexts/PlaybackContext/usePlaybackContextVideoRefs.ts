import type {AVPlaybackStatus, AVPlaybackStatusToSet} from 'expo-av';
import {useCallback, useEffect, useRef} from 'react';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import Visibility from '@libs/Visibility';
import type {PlaybackContext, PlayVideoPromiseRef, StopVideo, UnloadVideo} from './types';

function usePlaybackContextVideoRefs(resetCallback: () => void) {
    const currentVideoPlayerRef: PlaybackContext['currentVideoPlayerRef'] = useRef(null);
    const videoResumeTryNumberRef: PlaybackContext['videoResumeTryNumberRef'] = useRef(0);
    const playVideoPromiseRef: PlayVideoPromiseRef = useRef();
    const isPlayPendingRef = useRef(false);

    const pauseVideo: PlaybackContext['pauseVideo'] = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false});
    }, [currentVideoPlayerRef]);

    const stopVideo: StopVideo = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false, positionMillis: 0});
    }, [currentVideoPlayerRef]);

    const playVideo: PlaybackContext['playVideo'] = useCallback(() => {
        if (!Visibility.isVisible()) {
            isPlayPendingRef.current = true;
            return;
        }
        currentVideoPlayerRef.current?.getStatusAsync?.().then((status) => {
            const newStatus: AVPlaybackStatusToSet = {shouldPlay: true};
            if ('durationMillis' in status && status.durationMillis === status.positionMillis) {
                newStatus.positionMillis = 0;
            }
            playVideoPromiseRef.current = currentVideoPlayerRef.current?.setStatusAsync(newStatus).catch((error: AVPlaybackStatus) => {
                return error;
            });
        });
    }, [currentVideoPlayerRef]);

    const unloadVideo: UnloadVideo = useCallback(() => {
        currentVideoPlayerRef.current?.unloadAsync?.();
    }, [currentVideoPlayerRef]);

    const checkVideoPlaying: PlaybackContext['checkVideoPlaying'] = useCallback(
        (statusCallback) => {
            currentVideoPlayerRef.current?.getStatusAsync?.().then((status) => {
                statusCallback('isPlaying' in status && status.isPlaying);
            });
        },
        [currentVideoPlayerRef],
    );

    const resetVideoPlayerData: PlaybackContext['resetVideoPlayerData'] = useCallback(() => {
        // Play video is an async operation and if we call stop video before the promise is completed,
        // it will throw a console error. So, we'll wait until the promise is resolved before stopping the video.
        (playVideoPromiseRef.current ?? Promise.resolve()).then(stopVideo).finally(() => {
            videoResumeTryNumberRef.current = 0;
            resetCallback();
            unloadVideo();
            currentVideoPlayerRef.current = null;
        });
    }, [resetCallback, stopVideo, unloadVideo]);

    useEffect(() => {
        return Visibility.onVisibilityChange(() => {
            if (!Visibility.isVisible() || !isPlayPendingRef.current) {
                return;
            }
            playVideo();
            isPlayPendingRef.current = false;
        });
    }, [playVideo]);

    const updateCurrentVideoPlayerRef = (ref: VideoWithOnFullScreenUpdate | null) => {
        currentVideoPlayerRef.current = ref;
    };

    return {
        resetPlayerData: resetVideoPlayerData,
        isPlaying: checkVideoPlaying,
        pause: pauseVideo,
        play: playVideo,
        ref: currentVideoPlayerRef,
        resumeTryNumberRef: videoResumeTryNumberRef,
        updateRef: updateCurrentVideoPlayerRef,
    };
}

export default usePlaybackContextVideoRefs;
