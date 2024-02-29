import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import useWindowDimensions from '@hooks/useWindowDimensions';
import CONST from '@src/CONST';
import VideoPlayerThumbnail from './VideoPlayerThumbnail';

const propTypes = {
    videoUrl: PropTypes.string.isRequired,

    videoDimensions: PropTypes.shape({
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired,
    }),

    videoDuration: PropTypes.number,

    thumbnailUrl: PropTypes.string,

    fileName: PropTypes.string.isRequired,

    onShowModalPress: PropTypes.func.isRequired,
};

const defaultProps = {
    videoDimensions: CONST.VIDEO_PLAYER.DEFAULT_VIDEO_DIMENSIONS,
    thumbnailUrl: undefined,
    videoDuration: 0,
};

function VideoPlayerPreview({videoUrl, thumbnailUrl, fileName, videoDimensions, videoDuration, onShowModalPress}) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currentlyPlayingURL, updateCurrentlyPlayingURL} = usePlaybackContext();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isThumbnail, setIsThumbnail] = useState(true);
    const [measuredDimensions, setMeasuredDimensions] = useState(videoDimensions);
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(measuredDimensions.width, measuredDimensions.height);

    const onVideoLoaded = (e) => {
        setMeasuredDimensions({width: e.srcElement.videoWidth, height: e.srcElement.videoHeight});
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
                        onVideoLoaded={onVideoLoaded}
                        videoDuration={videoDuration}
                        shouldUseSmallVideoControls
                        style={[styles.w100, styles.h100]}
                    />

                    <IconButton
                        src={Expensicons.Expand}
                        style={styles.videoExpandButton}
                        tooltipText={translate('videoPlayer.expand')}
                        onPress={onShowModalPress}
                        small
                    />
                </>
            )}
        </View>
    );
}

VideoPlayerPreview.propTypes = propTypes;
VideoPlayerPreview.defaultProps = defaultProps;
VideoPlayerPreview.displayName = 'VideoPlayerPreview';

export default VideoPlayerPreview;
