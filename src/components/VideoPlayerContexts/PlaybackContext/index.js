"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlaybackContext = void 0;
exports.PlaybackContextProvider = PlaybackContextProvider;
exports.usePlaybackContext = usePlaybackContext;
var react_1 = require("react");
var ReportUtils_1 = require("@libs/ReportUtils");
var Navigation_1 = require("@navigation/Navigation");
var playbackContextReportIDUtils_1 = require("./playbackContextReportIDUtils");
var usePlaybackContextVideoRefs_1 = require("./usePlaybackContextVideoRefs");
var Context = react_1.default.createContext(null);
exports.PlaybackContext = Context;
function PlaybackContextProvider(_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)(null), currentlyPlayingURL = _b[0], setCurrentlyPlayingURL = _b[1];
    var _c = (0, react_1.useState)(null), sharedElement = _c[0], setSharedElement = _c[1];
    var _d = (0, react_1.useState)(null), originalParent = _d[0], setOriginalParent = _d[1];
    var _e = (0, react_1.useState)(playbackContextReportIDUtils_1.NO_REPORT_ID), currentRouteReportID = _e[0], setCurrentRouteReportID = _e[1];
    var resetContextProperties = function () {
        setSharedElement(null);
        setOriginalParent(null);
        setCurrentlyPlayingURL(null);
        setCurrentRouteReportID(playbackContextReportIDUtils_1.NO_REPORT_ID);
    };
    var video = (0, usePlaybackContextVideoRefs_1.default)(resetContextProperties);
    var updateCurrentURLAndReportID = (0, react_1.useCallback)(function (url, reportID) {
        var _a;
        if (!url || !reportID) {
            return;
        }
        if (currentlyPlayingURL && url !== currentlyPlayingURL) {
            video.pause();
        }
        var report = (0, ReportUtils_1.getReportOrDraftReport)(reportID);
        var isReportAChatThread = (0, ReportUtils_1.isChatThread)(report);
        var reportIDtoSet;
        if (isReportAChatThread) {
            reportIDtoSet = (_a = (0, playbackContextReportIDUtils_1.findURLInReportOrAncestorAttachments)(report, url)) !== null && _a !== void 0 ? _a : playbackContextReportIDUtils_1.NO_REPORT_ID;
        }
        else {
            reportIDtoSet = reportID;
        }
        var routeReportID = (0, playbackContextReportIDUtils_1.getCurrentRouteReportID)(url);
        if (reportIDtoSet === routeReportID || routeReportID === playbackContextReportIDUtils_1.NO_REPORT_ID_IN_PARAMS) {
            setCurrentRouteReportID(reportIDtoSet);
        }
        setCurrentlyPlayingURL(url);
    }, [currentlyPlayingURL, video]);
    var shareVideoPlayerElements = (0, react_1.useCallback)(function (ref, parent, child, shouldNotAutoPlay, _a) {
        var shouldUseSharedVideoElement = _a.shouldUseSharedVideoElement, url = _a.url, reportID = _a.reportID;
        if (shouldUseSharedVideoElement || url !== currentlyPlayingURL || reportID !== currentRouteReportID) {
            return;
        }
        video.updateRef(ref);
        setOriginalParent(parent);
        setSharedElement(child);
        // Prevents autoplay when uploading the attachment
        if (!shouldNotAutoPlay) {
            video.play();
        }
    }, [currentRouteReportID, currentlyPlayingURL, video]);
    (0, react_1.useEffect)(function () {
        Navigation_1.default.isNavigationReady().then(function () {
            // This logic ensures that resetVideoPlayerData is only called when currentReportID
            // changes from one valid value (i.e., not an empty string or '-1') to another valid value.
            // This prevents the video that plays when the app opens from being interrupted when currentReportID
            // is initially empty or '-1', or when it changes from empty/'-1' to another value
            // after the report screen in the central pane is mounted on the large screen.
            var routeReportID = currentlyPlayingURL ? (0, playbackContextReportIDUtils_1.getCurrentRouteReportID)(currentlyPlayingURL) : undefined;
            var isSameReportID = routeReportID === currentRouteReportID || routeReportID === playbackContextReportIDUtils_1.NO_REPORT_ID;
            var isOnRouteWithoutReportID = !!currentlyPlayingURL && (0, playbackContextReportIDUtils_1.getCurrentRouteReportID)(currentlyPlayingURL) === playbackContextReportIDUtils_1.NO_REPORT_ID_IN_PARAMS;
            if (isSameReportID || isOnRouteWithoutReportID) {
                return;
            }
            // We call another setStatusAsync inside useLayoutEffect on the video component,
            // so we add a delay here to prevent the error from appearing.
            setTimeout(function () {
                video.resetPlayerData();
            }, 0);
        });
    }, [currentRouteReportID, currentlyPlayingURL, video, video.resetPlayerData]);
    var contextValue = (0, react_1.useMemo)(function () { return ({
        updateCurrentURLAndReportID: updateCurrentURLAndReportID,
        currentlyPlayingURL: currentlyPlayingURL,
        currentRouteReportID: (0, playbackContextReportIDUtils_1.normalizeReportID)(currentRouteReportID),
        originalParent: originalParent,
        sharedElement: sharedElement,
        shareVideoPlayerElements: shareVideoPlayerElements,
        setCurrentlyPlayingURL: setCurrentlyPlayingURL,
        currentVideoPlayerRef: video.ref,
        playVideo: video.play,
        pauseVideo: video.pause,
        checkIfVideoIsPlaying: video.isPlaying,
        videoResumeTryNumberRef: video.resumeTryNumberRef,
        resetVideoPlayerData: video.resetPlayerData,
    }); }, [updateCurrentURLAndReportID, currentlyPlayingURL, currentRouteReportID, originalParent, sharedElement, video, shareVideoPlayerElements]);
    return <Context.Provider value={contextValue}>{children}</Context.Provider>;
}
function usePlaybackContext() {
    var playbackContext = (0, react_1.useContext)(Context);
    if (!playbackContext) {
        throw new Error('usePlaybackContext must be used within a PlaybackContextProvider');
    }
    return playbackContext;
}
PlaybackContextProvider.displayName = 'PlaybackContextProvider';
