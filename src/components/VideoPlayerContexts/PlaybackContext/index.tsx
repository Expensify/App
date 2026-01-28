import type {VideoPlayer, VideoPlayerStatus, VideoView} from 'expo-video';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import {getReportOrDraftReport, isChatThread} from '@libs/ReportUtils';
import Navigation from '@navigation/Navigation';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {ProtectedCurrentRouteReportID} from './playbackContextReportIDUtils';
import {findURLInReportOrAncestorAttachments, getCurrentRouteReportID, NO_REPORT_ID, NO_REPORT_ID_IN_PARAMS, normalizeReportID} from './playbackContextReportIDUtils';
import type {OriginalParent, PlaybackContext, PlaybackContextValues} from './types';
import usePlaybackContextVideoRefs from './usePlaybackContextVideoRefs';

const Context = React.createContext<PlaybackContext | null>(null);

function PlaybackContextProvider({children}: ChildrenProps) {
    const [currentlyPlayingURL, setCurrentlyPlayingURL] = useState<PlaybackContextValues['currentlyPlayingURL']>(null);
    const [sharedElement, setSharedElement] = useState<PlaybackContextValues['sharedElement']>(null);
    const [originalParent, setOriginalParent] = useState<OriginalParent>(null);
    const [currentRouteReportID, setCurrentRouteReportID] = useState<ProtectedCurrentRouteReportID>(NO_REPORT_ID);
    const mountedVideoPlayersRef = useRef<string[]>([]);
    const playerStatus = useRef<VideoPlayerStatus>('loading');

    const resetContextProperties = () => {
        setSharedElement(null);
        setOriginalParent(null);
        setCurrentlyPlayingURL(null);
        setCurrentRouteReportID(NO_REPORT_ID);
    };

    const video = usePlaybackContextVideoRefs(resetContextProperties);

    const updateCurrentURLAndReportID: PlaybackContextValues['updateCurrentURLAndReportID'] = useCallback(
        (url, reportID) => {
            if (!reportID) {
                return;
            }

            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                video.pause();
            }

            // If there's no URL (image case), pause the player by setting currentlyPlayingURL
            // without triggering the resetPlayerData in useEffect below
            if (!url) {
                setCurrentlyPlayingURL(reportID);
                return;
            }

            const report = getReportOrDraftReport(reportID);
            const isReportAChatThread = isChatThread(report);
            let reportIDtoSet;
            if (isReportAChatThread) {
                reportIDtoSet = findURLInReportOrAncestorAttachments(report, url) ?? NO_REPORT_ID;
            } else {
                reportIDtoSet = reportID;
            }

            const routeReportID = getCurrentRouteReportID(url);

            if (reportIDtoSet === routeReportID || routeReportID === NO_REPORT_ID_IN_PARAMS) {
                setCurrentRouteReportID(reportIDtoSet);
            }

            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, video],
    );

    const updatePlayerStatus = useCallback((newStatus: VideoPlayerStatus) => {
        playerStatus.current = newStatus;
    }, []);

    const shareVideoPlayerElements: PlaybackContextValues['shareVideoPlayerElements'] = useCallback(
        (
            videoPlayerRef: VideoPlayer | null,
            videoViewRef: VideoView | null,
            parent: View | HTMLDivElement | null,
            child: View | HTMLDivElement | null,
            shouldNotAutoPlay: boolean,
            {shouldUseSharedVideoElement, url, reportID},
        ) => {
            if (shouldUseSharedVideoElement || url !== currentlyPlayingURL || reportID !== currentRouteReportID) {
                return;
            }

            video.updateRefs(videoPlayerRef, videoViewRef);
            setOriginalParent(parent);
            setSharedElement(child);
            // Prevents autoplay when uploading the attachment
            if (!shouldNotAutoPlay) {
                video.play();
            }
        },
        [currentRouteReportID, currentlyPlayingURL, video],
    );

    useEffect(() => {
        Navigation.isNavigationReady().then(() => {
            // This logic ensures that resetVideoPlayerData is only called when currentReportID
            // changes from one valid value (i.e., not an empty string or '-1') to another valid value.
            // This prevents the video that plays when the app opens from being interrupted when currentReportID
            // is initially empty or '-1', or when it changes from empty/'-1' to another value
            // after the report screen in the central pane is mounted on the large screen.
            const routeReportID = currentlyPlayingURL ? getCurrentRouteReportID(currentlyPlayingURL) : undefined;

            const isSameReportID = routeReportID === currentRouteReportID || routeReportID === NO_REPORT_ID;
            const isOnRouteWithoutReportID = !!currentlyPlayingURL && getCurrentRouteReportID(currentlyPlayingURL) === NO_REPORT_ID_IN_PARAMS;

            if (isSameReportID || isOnRouteWithoutReportID) {
                return;
            }

            // We call another setStatusAsync inside useLayoutEffect on the video component,
            // so we add a delay here to prevent the error from appearing.
            setTimeout(() => {
                video.resetPlayerData();
            }, 0);
        });
    }, [currentRouteReportID, currentlyPlayingURL, video, video.resetPlayerData]);

    const contextValue: PlaybackContext = useMemo(
        () => ({
            updateCurrentURLAndReportID,
            currentlyPlayingURL,
            currentRouteReportID: normalizeReportID(currentRouteReportID),
            originalParent,
            sharedElement,
            shareVideoPlayerElements,
            setCurrentlyPlayingURL,
            currentVideoPlayerRef: video.playerRef,
            currentVideoViewRef: video.viewRef,
            playVideo: video.play,
            pauseVideo: video.pause,
            replayVideo: video.replay,
            stopVideo: video.stop,
            checkIfVideoIsPlaying: video.isPlaying,
            resetVideoPlayerData: video.resetPlayerData,
            mountedVideoPlayersRef,
            playerStatus,
            updatePlayerStatus,
        }),
        [
            updateCurrentURLAndReportID,
            currentlyPlayingURL,
            currentRouteReportID,
            originalParent,
            sharedElement,
            shareVideoPlayerElements,
            video.playerRef,
            video.viewRef,
            video.play,
            video.pause,
            video.replay,
            video.stop,
            video.isPlaying,
            video.resetPlayerData,
            updatePlayerStatus,
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

export {Context as PlaybackContext, PlaybackContextProvider, usePlaybackContext};
