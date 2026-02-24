import {useNavigation} from '@react-navigation/native';
import type {SourceLoadEventPayload} from 'expo-video';
import React, {useEffect, useState} from 'react';
import type {GestureResponderEvent} from 'react-native';
import {View} from 'react-native';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import {usePlaybackActionsContext, usePlaybackStateContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useCheckIfRouteHasRemainedUnchanged from '@hooks/useCheckIfRouteHasRemainedUnchanged';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
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
    const icons = useMemoizedLazyExpensifyIcons(['Expand']);
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentlyPlayingURL, currentRouteReportID} = usePlaybackStateContext();
    const {updateCurrentURLAndReportID} = usePlaybackActionsContext();

    /* This needs to be isSmallScreenWidth because we want to be able to play video in chat (not in attachment modal) when preview is inside an RHP */
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isThumbnail, setIsThumbnail] = useState(true);
    const [webMeasuredDimensions, setWebMeasuredDimensions] = useState<Dimensions | null>(null);
    const measuredDimensions = getPlatform() === CONST.PLATFORM.WEB && videoUrl && webMeasuredDimensions ? webMeasuredDimensions : videoDimensions;
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(measuredDimensions.width, measuredDimensions.height);
    const isOnSearch = useIsOnSearch();
    const navigation = useNavigation();

    useEffect(() => {
        if (!videoUrl || getPlatform() !== CONST.PLATFORM.WEB) {
            return;
        }
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            if (video.videoWidth === videoDimensions.width && video.videoHeight === videoDimensions.height) {
                return;
            }
            setWebMeasuredDimensions({
                width: video.videoWidth,
                height: video.videoHeight,
            });
        };
        video.src = videoUrl;
        video.load();
        return () => {
            video.src = '';
        };
    }, [videoUrl, videoDimensions.width, videoDimensions.height]);

    // We want to play the video only when the user is on the page where it was initially rendered
    const doesUserRemainOnFirstRenderRoute = useCheckIfRouteHasRemainedUnchanged(videoUrl);

    // `onSourceLoaded` is passed to VideoPlayerPreview's `Video` element which is displayed only on web.
    // VideoReadyForDisplayEvent type is lacking srcElement, that's why it's added here
    const onSourceLoaded = (event: SourceLoadEventPayload) => {
        const track = event.availableVideoTracks.at(0);

        if (!track) {
            return;
        }

        setWebMeasuredDimensions({width: track.size.width, height: track.size.height});
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

    const playbackKey = `${currentlyPlayingURL}|${currentRouteReportID}|${videoUrl}|${reportID}|${isOnSearch}`;
    const [prevPlaybackKey, setPrevPlaybackKey] = useState(playbackKey);
    if (prevPlaybackKey !== playbackKey) {
        setPrevPlaybackKey(playbackKey);
        const isFocused = doesUserRemainOnFirstRenderRoute();
        if (videoUrl === currentlyPlayingURL && reportID === currentRouteReportID && isFocused) {
            setIsThumbnail(false);
        }
    }

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
                        onSourceLoaded={onSourceLoaded}
                        videoDuration={videoDuration}
                        shouldUseSmallVideoControls
                        style={[styles.w100, styles.h100]}
                        isPreview
                        videoPlayerStyle={styles.videoPlayerPreview}
                        reportID={reportID}
                    />
                    <View style={[styles.pAbsolute, styles.w100]}>
                        <IconButton
                            src={icons.Expand}
                            style={[styles.videoExpandButton]}
                            tooltipText={translate('videoPlayer.expand')}
                            onPress={onShowModalPress}
                            small
                            sentryLabel={CONST.SENTRY_LABEL.VIDEO_PLAYER.EXPAND_BUTTON}
                        />
                    </View>
                </View>
            )}
        </View>
    );
}

export default VideoPlayerPreview;
