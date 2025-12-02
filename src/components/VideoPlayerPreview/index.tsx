import {useNavigation} from '@react-navigation/native';
import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useEffect, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useCheckIfRouteHasRemainedUnchanged from '@hooks/useCheckIfRouteHasRemainedUnchanged';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import getPlatform from '@libs/getPlatform';
import Navigation from '@navigation/Navigation';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Dimensions} from '@src/types/utils/Layout';
import VideoPlayerThumbnail from './VideoPlayerThumbnail';

type VideoPlayerPreviewProps = {
    /** Url to a video. */
    videoUrl: string;

    /** reportID of the video */
    reportID: string | undefined;

    /** Dimension of a video. */
    videoDimensions: Dimensions;

    /** Duration of a video. */
    videoDuration: number;

    /** Url to a thumbnail image. */
    thumbnailUrl?: string;

    /** Name of a video file. */
    fileName: string;

    /** Callback executed when modal is pressed. */
    onShowModalPress: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;

    /** Whether the video is deleted */
    isDeleted?: boolean;
};

const isOnAttachmentRoute = () => Navigation.getActiveRouteWithoutParams() === `/${ROUTES.REPORT_ATTACHMENTS.route}`;

function VideoPlayerPreview({videoUrl, thumbnailUrl, reportID, fileName, videoDimensions, videoDuration, onShowModalPress, isDeleted}: VideoPlayerPreviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentlyPlayingURL, currentRouteReportID, updateCurrentURLAndReportID} = usePlaybackContext();

    /* This needs to be isSmallScreenWidth because we want to be able to play video in chat (not in attachment modal) when preview is inside an RHP */
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isThumbnail, setIsThumbnail] = useState(true);
    const [measuredDimensions, setMeasuredDimensions] = useState(videoDimensions);
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(measuredDimensions.width, measuredDimensions.height);
    const isOnSearch = useIsOnSearch();
    const navigation = useNavigation();

    useEffect(() => {
        const platform = getPlatform();
        // On web and desktop platforms, we can use the DOM video element to get accurate video dimensions
        // by loading the video metadata. On mobile platforms, we rely on the provided videoDimensions
        // since document.createElement is not available in React Native environments.
        if (videoUrl && (platform === CONST.PLATFORM.WEB || platform === CONST.PLATFORM.DESKTOP)) {
            const video = document.createElement('video');
            video.onloadedmetadata = () => {
                if (video.videoWidth === measuredDimensions.width && video.videoHeight === measuredDimensions.height) {
                    return;
                }
                setMeasuredDimensions({
                    width: video.videoWidth,
                    height: video.videoHeight,
                });
            };
            video.src = videoUrl;
            video.load();

            return () => {
                video.src = '';
            };
        }
        setMeasuredDimensions(videoDimensions);
    }, [videoUrl, measuredDimensions.width, measuredDimensions.height, videoDimensions]);

    // We want to play the video only when the user is on the page where it was initially rendered
    const doesUserRemainOnFirstRenderRoute = useCheckIfRouteHasRemainedUnchanged(videoUrl);

    // `onVideoLoaded` is passed to VideoPlayerPreview's `Video` element which is displayed only on web.
    // VideoReadyForDisplayEvent type is lacking srcElement, that's why it's added here
    const onVideoLoaded = (event: VideoReadyForDisplayEvent & {srcElement: HTMLVideoElement}) => {
        setMeasuredDimensions({width: event.srcElement.videoWidth, height: event.srcElement.videoHeight});
    };

    const handleOnPress = () => {
        updateCurrentURLAndReportID(videoUrl, reportID);
        if (isSmallScreenWidth) {
            onShowModalPress();
        }
    };

    useEffect(() => {
        return navigation.addListener('blur', () => !isOnAttachmentRoute() && setIsThumbnail(true));
    }, [navigation]);

    useEffect(() => {
        const isFocused = doesUserRemainOnFirstRenderRoute();
        if (videoUrl !== currentlyPlayingURL || reportID !== currentRouteReportID || !isFocused) {
            return;
        }
        setIsThumbnail(false);
    }, [currentlyPlayingURL, currentRouteReportID, updateCurrentURLAndReportID, videoUrl, reportID, doesUserRemainOnFirstRenderRoute, isOnSearch]);

    return (
        <View style={[styles.webViewStyles.tagStyles.video, thumbnailDimensionsStyles]}>
            {isSmallScreenWidth || isThumbnail || isDeleted ? (
                <VideoPlayerThumbnail
                    thumbnailUrl={thumbnailUrl}
                    onPress={handleOnPress}
                    accessibilityLabel={fileName}
                    isDeleted={isDeleted}
                />
            ) : (
                <View style={styles.flex1}>
                    <VideoPlayer
                        url={videoUrl}
                        onVideoLoaded={onVideoLoaded as (event: VideoReadyForDisplayEvent) => void}
                        videoDuration={videoDuration}
                        shouldUseSmallVideoControls
                        style={[styles.w100, styles.h100]}
                        isPreview
                        videoPlayerStyle={styles.videoPlayerPreview}
                        reportID={reportID}
                    />
                    <View style={[styles.pAbsolute, styles.w100]}>
                        <IconButton
                            src={Expensicons.Expand}
                            style={[styles.videoExpandButton]}
                            tooltipText={translate('videoPlayer.expand')}
                            onPress={onShowModalPress}
                            small
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

VideoPlayerPreview.displayName = 'VideoPlayerPreview';

export default VideoPlayerPreview;
