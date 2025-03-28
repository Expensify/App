import type {NavigationState} from '@react-navigation/native';
import type {AVPlaybackStatus, AVPlaybackStatusToSet} from 'expo-av';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import usePrevious from '@hooks/usePrevious';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import Visibility from '@libs/Visibility';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {PlaybackContext, StatusCallback} from './types';

const Context = React.createContext<PlaybackContext | null>(null);

function PlaybackContextProvider({children}: ChildrenProps) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState<string | null>(null);
    const [currentlyPlayingURLReportID, setCurrentlyPlayingURLReportID] = useState<string | undefined>();
    const [sharedElement, setSharedElement] = useState<View | HTMLDivElement | null>(null);
    const [originalParent, setOriginalParent] = useState<View | HTMLDivElement | null>(null);
    const currentVideoPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);
    const [currentReportID, setCurrentReportID] = useState<string | undefined>();
    const prevCurrentReportID = usePrevious(currentReportID);
    const videoResumeTryNumberRef = useRef<number>(0);
    const playVideoPromiseRef = useRef<Promise<AVPlaybackStatus>>();
    const isPlayPendingRef = useRef(false);

    const pauseVideo = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false});
    }, [currentVideoPlayerRef]);

    const stopVideo = useCallback(() => {
        currentVideoPlayerRef.current?.setStatusAsync?.({shouldPlay: false, positionMillis: 0});
    }, [currentVideoPlayerRef]);

    const playVideo = useCallback(() => {
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

    const unloadVideo = useCallback(() => {
        currentVideoPlayerRef.current?.unloadAsync?.();
    }, [currentVideoPlayerRef]);

    /**
     * This function is used to update the currentReportID
     * @param state root navigation state
     */
    const updateCurrentPlayingReportID = useCallback(
        (state: NavigationState) => {
            if (!isReportTopmostSplitNavigator()) {
                setCurrentReportID(undefined);
                return;
            }
            const reportID = Navigation.getTopmostReportId(state);
            setCurrentReportID(reportID);
        },
        [setCurrentReportID],
    );

    const updateCurrentlyPlayingURL = useCallback(
        (url: string | null) => {
            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                pauseVideo();
            }
            setCurrentlyPlayingURLReportID(currentReportID);
            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, currentReportID, pauseVideo],
    );

    const shareVideoPlayerElements = useCallback(
        (ref: VideoWithOnFullScreenUpdate | null, parent: View | HTMLDivElement | null, child: View | HTMLDivElement | null, shouldNotAutoPlay: boolean) => {
            currentVideoPlayerRef.current = ref;
            setOriginalParent(parent);
            setSharedElement(child);
            // Prevents autoplay when uploading the attachment
            if (!shouldNotAutoPlay) {
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
        // Play video is an async operation and if we call stop video before the promise is completed,
        // it will throw a console error. So, we'll wait until the promise is resolved before stopping the video.
        (playVideoPromiseRef.current ?? Promise.resolve()).then(stopVideo).finally(() => {
            videoResumeTryNumberRef.current = 0;
            setCurrentlyPlayingURL(null);
            setSharedElement(null);
            setOriginalParent(null);
            setCurrentlyPlayingURLReportID(undefined);
            unloadVideo();
            currentVideoPlayerRef.current = null;
        });
    }, [stopVideo, unloadVideo]);

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            // This logic ensures that resetVideoPlayerData is only called when currentReportID
            // changes from one valid value (i.e., not an empty string or '-1') to another valid value.
            // This prevents the video that plays when the app opens from being interrupted when currentReportID
            // is initially empty or '-1', or when it changes from empty/'-1' to another value
            // after the report screen in the central pane is mounted on the large screen.
            if ((!currentReportID && isReportTopmostSplitNavigator()) || (!prevCurrentReportID && !isReportTopmostSplitNavigator()) || currentReportID === prevCurrentReportID) {
                return;
            }

            // We call another setStatusAsync inside useLayoutEffect on the video component,
            // so we add a delay here to prevent the error from appearing.
            setTimeout(() => {
                resetVideoPlayerData();
            }, 0);
        });
    }, [currentReportID, prevCurrentReportID, resetVideoPlayerData]);

    useEffect(() => {
        const unsubscribeVisibilityListener = Visibility.onVisibilityChange(() => {
            if (!Visibility.isVisible() || !isPlayPendingRef.current) {
                return;
            }
            playVideo();
            isPlayPendingRef.current = false;
        });
        return unsubscribeVisibilityListener;
    }, [playVideo]);

    const contextValue = useMemo(
        () => ({
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            currentlyPlayingURLReportID,
            originalParent,
            sharedElement,
            currentVideoPlayerRef,
            shareVideoPlayerElements,
            setCurrentlyPlayingURL,
            playVideo,
            pauseVideo,
            checkVideoPlaying,
            videoResumeTryNumberRef,
            updateCurrentPlayingReportID,
        }),
        [
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            currentlyPlayingURLReportID,
            originalParent,
            sharedElement,
            shareVideoPlayerElements,
            playVideo,
            pauseVideo,
            checkVideoPlaying,
            setCurrentlyPlayingURL,
            updateCurrentPlayingReportID,
        ],
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
