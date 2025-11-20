import type {AVPlaybackStatus, AVPlaybackStatusToSet} from 'expo-av';
import {useCallback, useEffect, useMemo, useRef} from 'react';
import Visibility from '@libs/Visibility';
import type {PlaybackContextVideoRefs, PlayVideoPromiseRef, StopVideo, UnloadVideo} from './types';

function usePlaybackContextVideoRefs(resetCallback: () => void) {
    const currentVideoPlayerRef: PlaybackContextVideoRefs['ref'] = useRef(null);
    const videoResumeTryNumberRef: PlaybackContextVideoRefs['resumeTryNumberRef'] = useRef(0);
    const playVideoPromiseRef: PlayVideoPromiseRef = useRef(undefined);
    const isPlayPendingRef = useRef(false);

    const pauseVideo: PlaybackContextVideoRefs['pause'] = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false});
    }, [currentVideoPlayerRef]);

    const stopVideo: StopVideo = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false, positionMillis: 0});
    }, [currentVideoPlayerRef]);

    const playVideo: PlaybackContextVideoRefs['play'] = useCallback(() => {
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

    const checkIfVideoIsPlaying: PlaybackContextVideoRefs['isPlaying'] = useCallback(
        (statusCallback) => {
            currentVideoPlayerRef.current?.getStatusAsync?.().then((status) => {
                statusCallback('isPlaying' in status && status.isPlaying);
            });
        },
        [currentVideoPlayerRef],
    );

    const resetVideoPlayerData: PlaybackContextVideoRefs['resetPlayerData'] = useCallback(() => {
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

    const updateCurrentVideoPlayerRef: PlaybackContextVideoRefs['updateRef'] = (ref) => {
        currentVideoPlayerRef.current = ref;
    };

    return useMemo(
        (): PlaybackContextVideoRefs => ({
            resetPlayerData: resetVideoPlayerData,
            isPlaying: checkIfVideoIsPlaying,
            pause: pauseVideo,
            stop: stopVideo,
            play: playVideo,
            ref: currentVideoPlayerRef,
            resumeTryNumberRef: videoResumeTryNumberRef,
            updateRef: updateCurrentVideoPlayerRef,
        }),
        [checkIfVideoIsPlaying, pauseVideo, playVideo, resetVideoPlayerData, stopVideo],
    );
}

export default usePlaybackContextVideoRefs;
