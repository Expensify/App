import type {VideoReadyForDisplayEvent} from 'expo-av';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import useWindowDimensions from '@hooks/useWindowDimensions';
import VideoPlayerThumbnail from './VideoPlayerThumbnail';

type VideoDimensions = {
    width: number;
    height: number;
};

type VideoPlayerPreviewProps = {
    /** Url to a video. */
    videoUrl: string;

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
};

function VideoPlayerPreview({videoUrl, thumbnailUrl, fileName, videoDimensions, videoDuration, onShowModalPress}: VideoPlayerPreviewProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentlyPlayingURL, updateCurrentlyPlayingURL} = usePlaybackContext();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isThumbnail, setIsThumbnail] = useState(true);
    const [measuredDimensions, setMeasuredDimensions] = useState(videoDimensions);
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(measuredDimensions.width, measuredDimensions.height);

    // `onVideoLoaded` is passed to VideoPlayerPreview's `Video` element which is displayed only on web.
    // VideoReadyForDisplayEvent type is lacking srcElement, that's why it's added here
    const onVideoLoaded = (event: VideoReadyForDisplayEvent & {srcElement: HTMLVideoElement}) => {
        setMeasuredDimensions({width: event.srcElement.videoWidth, height: event.srcElement.videoHeight});
    };

    const handleOnPress = () => {
        updateCurrentlyPlayingURL(videoUrl);
        if (isSmallScreenWidth) {
            onShowModalPress();
        }
    };

    useEffect(() => {
        if (videoUrl !== currentlyPlayingURL) {
            return;
        }
        setIsThumbnail(false);
    }, [currentlyPlayingURL, updateCurrentlyPlayingURL, videoUrl]);

    return (
        <View style={[styles.webViewStyles.tagStyles.video, thumbnailDimensionsStyles]}>
            {isSmallScreenWidth || isThumbnail ? (
                <VideoPlayerThumbnail
                    thumbnailUrl={thumbnailUrl}
                    onPress={handleOnPress}
                    accessibilityLabel={fileName}
                />
            ) : (
                <>
                    <VideoPlayer
                        url={videoUrl}
                        onOpenInModalButtonPress={onShowModalPress}
                        onVideoLoaded={onVideoLoaded as (event: VideoReadyForDisplayEvent) => void}
                        videoDuration={videoDuration}
                        shouldUseSmallVideoControls
                        style={[styles.w100, styles.h100]}
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
                </>
            )}
        </View>
    );
}

VideoPlayerPreview.displayName = 'VideoPlayerPreview';

export default VideoPlayerPreview;
