import type {AVPlaybackStatusToSet} from 'expo-av';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import useCurrentReportID from '@hooks/useCurrentReportID';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {PlaybackContext, StatusCallback} from './types';

const Context = React.createContext<PlaybackContext | null>(null);

function PlaybackContextProvider({children}: ChildrenProps) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState<string | null>(null);
    const [sharedElement, setSharedElement] = useState<View | HTMLDivElement | null>(null);
    const [originalParent, setOriginalParent] = useState<View | HTMLDivElement | null>(null);
    const currentVideoPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);
    const {currentReportID} = useCurrentReportID() ?? {};
    const videoResumeTryNumber = useRef<number>(0);

    const pauseVideo = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false});
    }, [currentVideoPlayerRef]);

    const stopVideo = useCallback(() => {
        currentVideoPlayerRef.current?.stopAsync?.();
    }, [currentVideoPlayerRef]);

    const playVideo = useCallback(() => {
        currentVideoPlayerRef.current?.getStatusAsync?.().then((status) => {
            const newStatus: AVPlaybackStatusToSet = {shouldPlay: true};
            if ('durationMillis' in status && status.durationMillis === status.positionMillis) {
                newStatus.positionMillis = 0;
            }
            currentVideoPlayerRef.current?.setStatusAsync(newStatus);
        });
    }, [currentVideoPlayerRef]);

    const unloadVideo = useCallback(() => {
        currentVideoPlayerRef.current?.unloadAsync?.();
    }, [currentVideoPlayerRef]);

    const updateCurrentlyPlayingURL = useCallback(
        (url: string | null) => {
            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                pauseVideo();
            }
            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, pauseVideo],
    );

    const shareVideoPlayerElements = useCallback(
        (ref: VideoWithOnFullScreenUpdate | null, parent: View | HTMLDivElement | null, child: View | HTMLDivElement | null, isUploading: boolean) => {
            currentVideoPlayerRef.current = ref;
            setOriginalParent(parent);
            setSharedElement(child);
            // Prevents autoplay when uploading the attachment
            if (!isUploading) {
                playVideo();
            }
        },
        [playVideo],
    );

    const checkVideoPlaying = useCallback(
        (statusCallback: StatusCallback) => {
            currentVideoPlayerRef.current?.getStatusAsync?.().then((status) => {
                statusCallback('isPlaying' in status && status.isPlaying);
            });
        },
        [currentVideoPlayerRef],
    );

    const resetVideoPlayerData = useCallback(() => {
        videoResumeTryNumber.current = 0;
        stopVideo();
        setCurrentlyPlayingURL(null);
        setSharedElement(null);
        setOriginalParent(null);
        currentVideoPlayerRef.current = null;
        unloadVideo();
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
            setCurrentlyPlayingURL,
            playVideo,
            pauseVideo,
            checkVideoPlaying,
            videoResumeTryNumber,
        }),
        [updateCurrentlyPlayingURL, currentlyPlayingURL, originalParent, sharedElement, shareVideoPlayerElements, playVideo, pauseVideo, checkVideoPlaying, setCurrentlyPlayingURL],
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

export {Context as PlaybackContext, PlaybackContextProvider, usePlaybackContext};
