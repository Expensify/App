import type {Route} from '@react-navigation/native';
import {findFocusedRoute} from '@react-navigation/native';
import type {AVPlaybackStatus, AVPlaybackStatusToSet} from 'expo-av';
import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import type {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import getAttachmentDetails from '@libs/fileDownload/getAttachmentDetails';
import Navigation from '@libs/Navigation/Navigation';
import {getAllReportActions, getReportActionHtml} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, isChatThread} from '@libs/ReportUtils';
import Visibility from '@libs/Visibility';
import getStateFromPath from '@navigation/helpers/getStateFromPath';
import type {ReportDetailsNavigatorParamList} from '@navigation/types';
import type {Route as ActiveRoute} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type {Report} from '@src/types/onyx';
import type ChildrenProps from '@src/types/utils/ChildrenProps';
import type {PlaybackContext, StatusCallback} from './types';

const Context = React.createContext<PlaybackContext | null>(null);

type SearchRoute = Omit<Route<string>, 'key'> | undefined;

const NO_REPORT_ID = undefined;

type RouteWithReportIDInParams<T> = T & {params: ReportDetailsNavigatorParamList[typeof SCREENS.REPORT_DETAILS.ROOT]};

const screensWithReportID = [SCREENS.SEARCH.REPORT_RHP, SCREENS.REPORT, SCREENS.SEARCH.MONEY_REQUEST_REPORT, SCREENS.ATTACHMENTS];

function isARouteWithReportIDInParams(route: SearchRoute): route is RouteWithReportIDInParams<SearchRoute> {
    return !!route && !!route.params && !!screensWithReportID.find((screen) => screen === route.name) && 'reportID' in route.params;
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
    const [sharedElement, setSharedElement] = useState<View | HTMLDivElement | null>(null);
    const [originalParent, setOriginalParent] = useState<View | HTMLDivElement | null>(null);
    const currentVideoPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);
    const videoResumeTryNumberRef = useRef<number>(0);
    const playVideoPromiseRef = useRef<Promise<AVPlaybackStatus>>();
    const isPlayPendingRef = useRef(false);
    const [currentRouteReportID, setCurrentRouteReportID] = useState<string | typeof NO_REPORT_ID>(NO_REPORT_ID);

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

    const getCurrentRouteReportID = useCallback((url: string) => {
        const route = Navigation.getActiveRouteWithoutParams() as ActiveRoute;
        const focusedRoute = findFocusedRoute(getStateFromPath(route));
        const reportIDFromUrlParams = new URLSearchParams(Navigation.getActiveRoute()).get('reportID');

        const focusedRouteReportID = isARouteWithReportIDInParams(focusedRoute) ? focusedRoute.params.reportID : reportIDFromUrlParams;

        if (!focusedRouteReportID) {
            return false;
        }

        const report = getReportOrDraftReport(focusedRouteReportID);
        const isFocusedRouteAChatThread = isChatThread(report);
        const firstReportThatHasURLInAttachments = findUrlInReportOrAncestorAttachments(report, url);

        return isFocusedRouteAChatThread ? firstReportThatHasURLInAttachments : focusedRouteReportID;
    }, []);

    const updateCurrentlyPlayingURL = useCallback(
        (url: string | undefined, reportID: string | undefined) => {
            if (!url || !reportID) {
                return;
            }
            if (currentlyPlayingURL && url !== currentlyPlayingURL) {
                pauseVideo();
            }

            const report = getReportOrDraftReport(reportID);
            const firstReportIDThatHasURLInAttachments = findUrlInReportOrAncestorAttachments(report, url) ?? NO_REPORT_ID;
            const isReportAChatThread = isChatThread(report);

            const reportIDtoSet = isReportAChatThread ? firstReportIDThatHasURLInAttachments : reportID;

            const routeReportID = getCurrentRouteReportID(url);

            if (reportIDtoSet === routeReportID || routeReportID === false) {
                setCurrentRouteReportID(reportIDtoSet);
            }
            setCurrentlyPlayingURL(url);
        },
        [currentlyPlayingURL, getCurrentRouteReportID, pauseVideo],
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
            setSharedElement(null);
            setOriginalParent(null);
            setCurrentlyPlayingURL(null);
            setCurrentRouteReportID(NO_REPORT_ID);
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
            const routeReportID = currentlyPlayingURL ? getCurrentRouteReportID(currentlyPlayingURL) : undefined;

            const isReportIDTheSame = routeReportID === currentRouteReportID || routeReportID === false;
            const isOnRouteWithoutReportID = !!currentlyPlayingURL && getCurrentRouteReportID(currentlyPlayingURL) === 'SEARCH_ROOT';

            if (isReportIDTheSame || isOnRouteWithoutReportID) {
                return;
            }

            // We call another setStatusAsync inside useLayoutEffect on the video component,
            // so we add a delay here to prevent the error from appearing.
            setTimeout(() => {
                resetVideoPlayerData();
            }, 0);
        });
    }, [currentRouteReportID, currentlyPlayingURL, getCurrentRouteReportID, resetVideoPlayerData]);

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
            currentRouteReportID,
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
        }),
        [
            updateCurrentlyPlayingURL,
            currentlyPlayingURL,
            currentRouteReportID,
            originalParent,
            sharedElement,
            shareVideoPlayerElements,
            playVideo,
            pauseVideo,
            checkVideoPlaying,
            setCurrentlyPlayingURL,
            resetVideoPlayerData,
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
