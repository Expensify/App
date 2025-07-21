import {useCallback, useEffect, useMemo, useRef} from 'react';
import Visibility from '@libs/Visibility';
import type {PlaybackContextVideoRefs, StopVideo} from './types';

function usePlaybackContextVideoRefs(resetCallback: () => void) {
    const currentVideoPlayerRef: PlaybackContextVideoRefs['playerRef'] = useRef(null);
    const currentVideoViewRef: PlaybackContextVideoRefs['viewRef'] = useRef(null);
    const videoResumeTryNumberRef: PlaybackContextVideoRefs['resumeTryNumberRef'] = useRef(0);
    const isPlayPendingRef = useRef(false);

    const playVideo: PlaybackContextVideoRefs['play'] = useCallback(() => {
        if (!Visibility.isVisible()) {
            isPlayPendingRef.current = true;
            return;
        }
        currentVideoPlayerRef.current?.play();
    }, [currentVideoPlayerRef]);

    const pauseVideo: PlaybackContextVideoRefs['pause'] = useCallback(() => {
        currentVideoPlayerRef.current?.pause();
    }, [currentVideoPlayerRef]);

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
        videoResumeTryNumberRef.current = 0;
        currentVideoPlayerRef.current = null;
        currentVideoViewRef.current = null;
        resetCallback();
    }, [resetCallback, stopVideo]);

    // Visibility.isVisible
    // Jak okno nie jest widoczne i zostanie wywołany playVideo() to nie playuj tylko ustaw pending == true
    // Jak okno się zrobi widoczne i pending był ustawiony wcześniej na true to play()
    // czy to jest dalej osiągalne?

    useEffect(() => {
        return Visibility.onVisibilityChange(() => {
            if (!(Visibility.isVisible() && isPlayPendingRef.current)) {
                return;
            }
            playVideo();
            isPlayPendingRef.current = false;
        });
    }, [playVideo]);

    const updateCurrentVideoPlayerRefs: PlaybackContextVideoRefs['updateRefs'] = (playerRef, viewRef) => {
        currentVideoPlayerRef.current = playerRef;
        currentVideoViewRef.current = viewRef;
    };

    return useMemo(
        (): PlaybackContextVideoRefs => ({
            playerRef: currentVideoPlayerRef,
            viewRef: currentVideoViewRef,
            resumeTryNumberRef: videoResumeTryNumberRef,
            play: playVideo,
            pause: pauseVideo,
            isPlaying: checkIfVideoIsPlaying,
            resetPlayerData: resetVideoPlayerData,
            updateRefs: updateCurrentVideoPlayerRefs,
        }),
        [checkIfVideoIsPlaying, pauseVideo, playVideo, resetVideoPlayerData],
    );
}

export default usePlaybackContextVideoRefs;
