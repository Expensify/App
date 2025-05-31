import {useNavigation} from '@react-navigation/native';
import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useEffect, useRef, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import {useSearchContext} from '@components/Search/SearchContext';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useCheckIfRouteHasRemainedUnchanged from '@hooks/useCheckIfRouteHasRemainedUnchanged';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import Navigation from '@libs/Navigation/Navigation';
import navigationRef from '@libs/Navigation/navigationRef';
import ROUTES from '@src/ROUTES';
import VideoPlayerThumbnail from './VideoPlayerThumbnail';

type VideoDimensions = {
    width: number;
    height: number;
};

type VideoPlayerPreviewProps = {
    /** Url to a video. */
    videoUrl: string;

    /** reportID of the video */
    reportID: string | undefined;

    /** Dimension of a video. */
    videoDimensions: VideoDimensions;

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

const isOnAttachmentRoute = () => Navigation.getActiveRouteWithoutParams() === `/${ROUTES.ATTACHMENTS.route}`;

function VideoPlayerPreview({videoUrl, thumbnailUrl, reportID, fileName, videoDimensions, videoDuration, onShowModalPress, isDeleted}: VideoPlayerPreviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentlyPlayingURL, currentRouteReportID, updateCurrentURLAndReportID} = usePlaybackContext();
    const videoPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);

    /* This needs to be isSmallScreenWidth because we want to be able to play video in chat (not in attachment modal) when preview is inside an RHP */
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isThumbnail, setIsThumbnail] = useState(true);
    const [measuredDimensions, setMeasuredDimensions] = useState(videoDimensions);
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(measuredDimensions.width, measuredDimensions.height);
    const {isOnSearch} = useSearchContext();
    const navigation = useNavigation();

    // We want to play the video only when the user is on the page where it was rendered
    const isUserRemainOnReportScreen = useCheckIfRouteHasRemainedUnchanged(videoUrl);

    // `onVideoLoaded` is passed to VideoPlayerPreview's `Video` element which is displayed only on web.
    // VideoReadyForDisplayEvent type is lacking srcElement, that's why it's added here
    const onVideoLoaded = (event: VideoReadyForDisplayEvent & {srcElement: HTMLVideoElement}) => {
        setMeasuredDimensions({width: event.srcElement.videoWidth, height: event.srcElement.videoHeight});
    };

    const handleOnPress = () => {
        setIsThumbnail(false);
        updateCurrentURLAndReportID(videoUrl, reportID);
        if (isSmallScreenWidth) {
            onShowModalPress();
        }
    };

    useEffect(() => {
        // We want to pause the video when the attachment modal is open and only keep playing when the modal is closed and the video is playing on it
        return navigationRef.addListener('state', () => {
            const {isFocused, isOnAttachModal} = isUserRemainOnReportScreen();
            if (isFocused) {
                // Resume video playback when navigating to it in the attachment modal or keep after closing the modal
                if (!!videoPlayerRef.current?.isPlay || isOnAttachModal) {
                    videoPlayerRef.current?.setStatusAsync({shouldPlay: true}).catch(() => {});
                }
                return;
            }

            videoPlayerRef.current?.setStatusAsync({shouldPlay: false}).catch(() => {});
        });
    }, [isUserRemainOnReportScreen]);

    useEffect(() => {
        return navigation.addListener('blur', () => !isOnAttachmentRoute() && setIsThumbnail(true));
    }, [navigation]);

    useEffect(() => {
        const {isFocused} = isUserRemainOnReportScreen();
        if (videoUrl !== currentlyPlayingURL || reportID !== currentRouteReportID || !isFocused) {
            return;
        }
        setIsThumbnail(false);
    }, [currentlyPlayingURL, currentRouteReportID, updateCurrentURLAndReportID, videoUrl, reportID, isUserRemainOnReportScreen, isOnSearch]);

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
                        ref={videoPlayerRef}
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
