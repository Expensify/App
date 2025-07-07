"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Expensicons = require("@components/Icon/Expensicons");
var SearchContext_1 = require("@components/Search/SearchContext");
var VideoPlayer_1 = require("@components/VideoPlayer");
var IconButton_1 = require("@components/VideoPlayer/IconButton");
var PlaybackContext_1 = require("@components/VideoPlayerContexts/PlaybackContext");
var useCheckIfRouteHasRemainedUnchanged_1 = require("@hooks/useCheckIfRouteHasRemainedUnchanged");
var useFirstRenderRoute_1 = require("@hooks/useFirstRenderRoute");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var useThumbnailDimensions_1 = require("@hooks/useThumbnailDimensions");
var Navigation_1 = require("@navigation/Navigation");
var ROUTES_1 = require("@src/ROUTES");
var VideoPlayerThumbnail_1 = require("./VideoPlayerThumbnail");
var isOnAttachmentRoute = function () { return Navigation_1.default.getActiveRouteWithoutParams() === "/".concat(ROUTES_1.default.ATTACHMENTS.route); };
function VideoPlayerPreview(_a) {
    var videoUrl = _a.videoUrl, thumbnailUrl = _a.thumbnailUrl, reportID = _a.reportID, fileName = _a.fileName, videoDimensions = _a.videoDimensions, videoDuration = _a.videoDuration, onShowModalPress = _a.onShowModalPress, isDeleted = _a.isDeleted;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, PlaybackContext_1.usePlaybackContext)(), currentlyPlayingURL = _b.currentlyPlayingURL, currentRouteReportID = _b.currentRouteReportID, updateCurrentURLAndReportID = _b.updateCurrentURLAndReportID;
    /* This needs to be isSmallScreenWidth because we want to be able to play video in chat (not in attachment modal) when preview is inside an RHP */
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var isSmallScreenWidth = (0, useResponsiveLayout_1.default)().isSmallScreenWidth;
    var _c = (0, react_1.useState)(true), isThumbnail = _c[0], setIsThumbnail = _c[1];
    var _d = (0, react_1.useState)(videoDimensions), measuredDimensions = _d[0], setMeasuredDimensions = _d[1];
    var thumbnailDimensionsStyles = (0, useThumbnailDimensions_1.default)(measuredDimensions.width, measuredDimensions.height).thumbnailDimensionsStyles;
    var isOnSearch = (0, SearchContext_1.useSearchContext)().isOnSearch;
    var navigation = (0, native_1.useNavigation)();
    var didUserNavigateOutOfReportScreen = (0, useCheckIfRouteHasRemainedUnchanged_1.default)();
    // We want to play the video only when the user is on the page where it was rendered
    var firstRenderRoute = (0, useFirstRenderRoute_1.default)(didUserNavigateOutOfReportScreen);
    // `onVideoLoaded` is passed to VideoPlayerPreview's `Video` element which is displayed only on web.
    // VideoReadyForDisplayEvent type is lacking srcElement, that's why it's added here
    var onVideoLoaded = function (event) {
        setMeasuredDimensions({ width: event.srcElement.videoWidth, height: event.srcElement.videoHeight });
    };
    var handleOnPress = function () {
        updateCurrentURLAndReportID(videoUrl, reportID);
        if (isSmallScreenWidth) {
            onShowModalPress();
        }
    };
    (0, react_1.useEffect)(function () {
        return navigation.addListener('blur', function () { return !isOnAttachmentRoute() && setIsThumbnail(true); });
    }, [navigation, firstRenderRoute]);
    (0, react_1.useEffect)(function () {
        if (videoUrl !== currentlyPlayingURL || reportID !== currentRouteReportID || !firstRenderRoute.isFocused) {
            return;
        }
        setIsThumbnail(false);
    }, [currentlyPlayingURL, currentRouteReportID, updateCurrentURLAndReportID, videoUrl, reportID, firstRenderRoute, isOnSearch]);
    return (<react_native_1.View style={[styles.webViewStyles.tagStyles.video, thumbnailDimensionsStyles]}>
            {isSmallScreenWidth || isThumbnail || isDeleted ? (<VideoPlayerThumbnail_1.default thumbnailUrl={thumbnailUrl} onPress={handleOnPress} accessibilityLabel={fileName} isDeleted={isDeleted}/>) : (<react_native_1.View style={styles.flex1}>
                    <VideoPlayer_1.default url={videoUrl} onVideoLoaded={onVideoLoaded} videoDuration={videoDuration} shouldUseSmallVideoControls style={[styles.w100, styles.h100]} isPreview videoPlayerStyle={styles.videoPlayerPreview} reportID={reportID}/>
                    <react_native_1.View style={[styles.pAbsolute, styles.w100]}>
                        <IconButton_1.default src={Expensicons.Expand} style={[styles.videoExpandButton]} tooltipText={translate('videoPlayer.expand')} onPress={onShowModalPress} small/>
                    </react_native_1.View>
                </react_native_1.View>)}
        </react_native_1.View>);
}
VideoPlayerPreview.displayName = 'VideoPlayerPreview';
exports.default = VideoPlayerPreview;
