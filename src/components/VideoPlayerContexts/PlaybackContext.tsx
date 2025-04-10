import type {NavigationState, Route} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import type {AVPlaybackStatus, AVPlaybackStatusToSet} from 'expo-av';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import usePrevious from '@hooks/usePrevious';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import Navigation from '@libs/Navigation/Navigation';
import {getAllReportActions, getReportActionHtml} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, isChatThread} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import type {SearchFullscreenNavigatorParamList} from '@navigation/types';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {PlaybackContext, StatusCallback} from './types';

const Context = React.createContext<PlaybackContext | null>(null);

type SearchRoute = Omit<Route<string>, 'key'> | undefined;
type MoneyRequestReportState = {
    params: SearchFullscreenNavigatorParamList[typeof SCREENS.SEARCH.MONEY_REQUEST_REPORT];
} & SearchRoute;

function isMoneyRequestReportRouteWithReportIDInParams(route: SearchRoute): route is MoneyRequestReportState {
    return !!route && !!route.params && route.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT && 'reportID' in route.params;
}

function findUrlInReportOrAncestorAttachments(currentReport: OnyxEntry<Report>, url: string | null): string | undefined {
    const {parentReportID, reportID} = currentReport ?? {};

    const reportActions = getAllReportActions(reportID);
    const hasUrlInAttachments = Object.values(reportActions).some((action) => {
        const {sourceURL, previewSourceURL} = getAttachmentDetails(getReportActionHtml(action));
        return sourceURL === url || previewSourceURL === url;
    });

    if (hasUrlInAttachments) {
        return reportID;
    }

    if (parentReportID) {
        const parentReport = getReportOrDraftReport(parentReportID);
        return findUrlInReportOrAncestorAttachments(parentReport, url);
    }

    return undefined;
}

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
            const focusedRoute = findFocusedRoute(state);
            let {reportID} = getReportOrDraftReport(Navigation.getTopmostReportId()) ?? {};

            // We need to handle a case where a report is selected via search and is therefore not a topmost report,
            // but we still want to be able to play videos in it
            if (isMoneyRequestReportRouteWithReportIDInParams(focusedRoute)) {
                reportID = focusedRoute.params.reportID;
            }

            reportID = Navigation.getActiveRouteWithoutParams() === `/${ROUTES.ATTACHMENTS.route}` ? prevCurrentReportID : reportID;

            setCurrentReportID(reportID);
        },
        [setCurrentReportID, prevCurrentReportID],
    );

    const updateCurrentlyPlayingURL = useCallback(
        (url: string | null) => {
            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                pauseVideo();
            }

            // Used for /attachment route
            const topMostReport = getReportOrDraftReport(Navigation.getTopmostReportId());
            const reportIDFromUrlParams = new URLSearchParams(Navigation.getActiveRoute()).get('reportID') ?? undefined;
            const attachmentReportID = Navigation.getActiveRouteWithoutParams() === `/${ROUTES.ATTACHMENTS.route}` ? prevCurrentReportID ?? reportIDFromUrlParams : undefined;
            const reportIDWithUrl = isChatThread(topMostReport) ? findUrlInReportOrAncestorAttachments(topMostReport, url) : undefined;

            // - if it is a chat thread, use chat thread ID or any ascentor ID since the video could have originally been sent on report many levels up
            // - report ID in which we are currently, if it is not a chat thread
            // - if it is an attachment route, then we take report ID from the URL params
            const currentPlayReportID = [attachmentReportID, reportIDWithUrl, currentReportID].find((id) => id !== undefined);

            setCurrentlyPlayingURLReportID(currentPlayReportID);
            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, currentReportID, prevCurrentReportID, pauseVideo],
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
            resetVideoPlayerData,
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
            resetVideoPlayerData,
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
