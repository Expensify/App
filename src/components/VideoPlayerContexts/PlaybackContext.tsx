import type {Video} from 'expo-av';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import useCurrentReportID from '@hooks/useCurrentReportID';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {PlaybackContext} from './types';

const Context = React.createContext<PlaybackContext | null>(null);

function PlaybackContextProvider({children}: ChildrenProps) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState<string | null>(null);
    const [sharedElement, setSharedElement] = useState<View | null>(null);
    const [originalParent, setOriginalParent] = useState<View | null>(null);
    const currentVideoPlayerRef = useRef<Video | null>(null);
    const {currentReportID} = useCurrentReportID() ?? {};

    const pauseVideo = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync({shouldPlay: false});
    }, [currentVideoPlayerRef]);

    const stopVideo = useCallback(() => {
        currentVideoPlayerRef.current?.stopAsync?.();
    }, [currentVideoPlayerRef]);

    const playVideo = useCallback(() => {
        currentVideoPlayerRef.current?.getStatusAsync?.().then((status) => {
            if ('durationMillis' in status && status.durationMillis === status.positionMillis) {
                currentVideoPlayerRef.current?.setStatusAsync({shouldPlay: true, positionMillis: 0});
            }
            currentVideoPlayerRef.current?.setStatusAsync({shouldPlay: true});
        });
    }, [currentVideoPlayerRef]);

    const unloadVideo = useCallback(() => {
        currentVideoPlayerRef.current?.unloadAsync?.();
    }, [currentVideoPlayerRef]);

    const updateCurrentlyPlayingURL = useCallback(
        (url: string) => {
            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                pauseVideo();
            }
            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, pauseVideo],
    );

    const shareVideoPlayerElements = useCallback(
        (ref: Video, parent: View, child: View) => {
            currentVideoPlayerRef.current = ref;
            setOriginalParent(parent);
            setSharedElement(child);
            playVideo();
        },
        [playVideo],
    );

    const checkVideoPlaying = useCallback(
        (statusCallback: (isPlaying: boolean) => void) => {
            currentVideoPlayerRef.current?.getStatusAsync().then((status) => {
                statusCallback('isPlaying' in status && status.isPlaying);
            });
        },
        [currentVideoPlayerRef],
    );

    const resetVideoPlayerData = useCallback(() => {
        stopVideo();
        unloadVideo();
        setCurrentlyPlayingURL(null);
        setSharedElement(null);
        setOriginalParent(null);
        currentVideoPlayerRef.current = null;
    }, [stopVideo, unloadVideo]);

    useEffect(() => {
        if (!currentReportID) {
            return;
        }
        resetVideoPlayerData();
    }, [currentReportID, resetVideoPlayerData]);

    const contextValue = useMemo(
        () => ({
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            originalParent,
            sharedElement,
            currentVideoPlayerRef,
            shareVideoPlayerElements,
            playVideo,
            pauseVideo,
            checkVideoPlaying,
        }),
        [updateCurrentlyPlayingURL, currentlyPlayingURL, originalParent, sharedElement, shareVideoPlayerElements, playVideo, pauseVideo, checkVideoPlaying],
    );
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}

function usePlaybackContext() {
    const playbackContext = useContext(Context);
    if (!playbackContext) {
        throw new Error('usePlaybackContext must be used within a PlaybackContextProvider');
    }
    return playbackContext;
}

PlaybackContextProvider.displayName = 'PlaybackContextProvider';

export {PlaybackContextProvider, usePlaybackContext};
