import {useSession} from '@components/OnyxListItemProvider';
import {useIsOnSearch} from '@components/Search/SearchScopeProvider';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import {usePlaybackActionsContext, usePlaybackStateContext} from '@components/VideoPlayerContexts/PlaybackContext';

import useCheckIfRouteHasRemainedUnchanged from '@hooks/useCheckIfRouteHasRemainedUnchanged';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useReportOrReportDraft from '@hooks/useReportOrReportDraft';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';

import getPlatform from '@libs/getPlatform';

import Navigation from '@navigation/Navigation';

import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {Dimensions} from '@src/types/utils/Layout';

import type {SourceLoadEventPayload} from 'expo-video';
import type {GestureResponderEvent} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useMemo, useState} from 'react';
import {View} from 'react-native';

import {areVideoDimensionsValid, cacheVideoDimensions, getAuthenticatedVideoSourceURL, getCachedVideoDimensions, isLocalVideoURL} from './videoDimensionUtils';
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
    const report = useReportOrReportDraft(reportID);
    const session = useSession();
    const encryptedAuthToken = session?.encryptedAuthToken ?? '';

    /* This needs to be isSmallScreenWidth because we want to be able to play video in chat (not in attachment modal) when preview is inside an RHP */
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const [isThumbnail, setIsThumbnail] = useState(true);

    // Uploaded videos are often persisted with 0/0 dimensions, so the real dimensions are measured on web. Seed the state
    // from the module-level cache so a remount (edit, LHN navigation, refresh) restores the correct orientation immediately.
    const [webMeasuredDimensions, setWebMeasuredDimensions] = useState<Dimensions | null>(() => getCachedVideoDimensions(videoUrl));
    const hasValidStoredDimensions = areVideoDimensionsValid(videoDimensions);
    const isWeb = getPlatform() === CONST.PLATFORM.WEB;

    // Stored dimensions win when they are valid; the measured dimensions are only used as a fallback when they are absent (0/0).
    const measuredDimensions = isWeb && videoUrl && !hasValidStoredDimensions && areVideoDimensionsValid(webMeasuredDimensions) ? webMeasuredDimensions : videoDimensions;
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(measuredDimensions.width, measuredDimensions.height);

    // Probe URL used to measure the video metadata. Server attachments require the auth token, otherwise `onloadedmetadata` never fires.
    const metadataProbeURL = useMemo(() => getAuthenticatedVideoSourceURL(videoUrl, encryptedAuthToken), [videoUrl, encryptedAuthToken]);
    const isOnSearch = useIsOnSearch();
    const navigation = useNavigation();
    const {isOffline} = useNetwork();

    // While offline, render BaseVideoPlayer instead of the thumbnail so the existing player-level offline state is shown consistently.
    const shouldRenderVideoPlayer = !isDeleted && (isOffline || (!isSmallScreenWidth && !isThumbnail));

    // When the video URL changes, adjust the measured dimensions during render (the recommended pattern for deriving
    // state from props): restore any cached measurement for the new URL, carry the measurement across the blob -> server
    // URL swap that happens once an upload completes, or reset otherwise so the probe below can re-measure.
    const [prevVideoUrl, setPrevVideoUrl] = useState(videoUrl);
    if (prevVideoUrl !== videoUrl) {
        setPrevVideoUrl(videoUrl);
        const cached = getCachedVideoDimensions(videoUrl);
        if (cached) {
            setWebMeasuredDimensions(cached);
        } else if (!hasValidStoredDimensions && areVideoDimensionsValid(webMeasuredDimensions) && isLocalVideoURL(prevVideoUrl) && !isLocalVideoURL(videoUrl)) {
            // Keep the measurement from the just-completed local upload and persist it under the new server URL.
            cacheVideoDimensions(videoUrl, webMeasuredDimensions);
        } else {
            setWebMeasuredDimensions(null);
        }
    }

    useEffect(() => {
        if (!videoUrl || !isWeb || hasValidStoredDimensions) {
            return;
        }
        const video = document.createElement('video');
        video.onloadedmetadata = () => {
            const dimensions = {width: video.videoWidth, height: video.videoHeight};
            if (!areVideoDimensionsValid(dimensions)) {
                return;
            }
            cacheVideoDimensions(videoUrl, dimensions);
            setWebMeasuredDimensions(dimensions);
        };
        video.src = metadataProbeURL;
        video.load();
        return () => {
            video.src = '';
        };
    }, [videoUrl, isWeb, hasValidStoredDimensions, metadataProbeURL]);

    // We want to play the video only when the user is on the page where it was initially rendered
    const doesUserRemainOnFirstRenderRoute = useCheckIfRouteHasRemainedUnchanged(videoUrl);

    // `onSourceLoaded` is passed to VideoPlayerPreview's `Video` element which is displayed only on web.
    // VideoReadyForDisplayEvent type is lacking srcElement, that's why it's added here
    const onSourceLoaded = (event: SourceLoadEventPayload) => {
        const track = event.availableVideoTracks.at(0);

        if (!track || hasValidStoredDimensions) {
            return;
        }

        const dimensions = {width: track.size.width, height: track.size.height};
        if (!areVideoDimensionsValid(dimensions)) {
            return;
        }
        cacheVideoDimensions(videoUrl, dimensions);
        setWebMeasuredDimensions(dimensions);
    };

    const handleOnPress = () => {
        updateCurrentURLAndReportID(videoUrl, report, reportID);
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
            {!shouldRenderVideoPlayer ? (
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
