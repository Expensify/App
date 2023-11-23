import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
import useLocalize from '@hooks/useLocalize';
import useThumbnailDimensions from '@hooks/useThumbnailDimensions';
import useWindowDimensions from '@hooks/useWindowDimensions';
import styles from '@styles/styles';
import VideoPlayerThumbnail from './VideoPlayerThumbnail';

const propTypes = {
    videoUrl: PropTypes.string.isRequired,

    // eslint-disable-next-line react/forbid-prop-types
    videoDimensions: PropTypes.object,

    thumbnailUrl: PropTypes.string,

    fileName: PropTypes.string.isRequired,

    showModal: PropTypes.func.isRequired,
};

const defaultProps = {
    videoDimensions: {width: 1900, height: 1400},
    thumbnailUrl: null,
};

function VideoPlayerPreview({videoUrl, thumbnailUrl, fileName, videoDimensions, showModal}) {
    const {translate} = useLocalize();
    const {currentlyPlayingURL, updateCurrentlyPlayingURL} = usePlaybackContext();
    const {isSmallScreenWidth} = useWindowDimensions();
    const [isThumbnail, setIsThumbnail] = useState(true);
    const [measuredDimenstions, setMeasuredDimenstions] = useState(videoDimensions);
    const {thumbnailDimensionsStyles} = useThumbnailDimensions(measuredDimenstions.width, measuredDimenstions.height);

    const onVideoLoaded = (e) => {
        setMeasuredDimenstions({width: e.srcElement.videoWidth, height: e.srcElement.videoHeight});
    };

    const handleOnPress = () => {
        updateCurrentlyPlayingURL(videoUrl);
        if (isSmallScreenWidth) {
            showModal();
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
                        shouldPlay={false}
                        onOpenInModalButtonPress={showModal}
                        onVideoLoaded={onVideoLoaded}
                        shouldUseSmallVideoControls
                    />

                    <IconButton
                        src={Expensicons.Expand}
                        style={styles.videoExpandButton}
                        accessibilityLabel={translate('videoPlayer.openInAttachmentModal')}
                        onPress={showModal}
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
