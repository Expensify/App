import PropTypes from 'prop-types';
import React, {useEffect, useState} from 'react';
import {View} from 'react-native';
import * as Expensicons from '@components/Icon/Expensicons';
import VideoPlayer from '@components/VideoPlayer';
import IconButton from '@components/VideoPlayer/IconButton';
import {usePlaybackContext} from '@components/VideoPlayerContexts/PlaybackContext';
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
    thumbnailUrl: 'https://d33v4339jhl8k0.cloudfront.net/docs/assets/591c8a010428634b4a33375c/images/5ab4866b2c7d3a56d8873f4c/file-MrylO8jADD.png',
};

function VideoPlayerPreview({videoUrl, thumbnailUrl, fileName, videoDimensions, showModal}) {
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
        <View style={[styles.overflowHidden, styles.webViewStyles.tagStyles.img, thumbnailDimensionsStyles]}>
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
                        videoPlayerStyles={{borderRadius: 10}}
                        shouldPlay={false}
                        onOpenInModalButtonPress={showModal}
                        onVideoLoaded={onVideoLoaded}
                    />

                    <IconButton
                        src={Expensicons.Expand}
                        fill="white"
                        style={{position: 'absolute', top: 10, right: 10, backgroundColor: '#061B09CC', borderRadius: 5}}
                        accessibilityLabel="open in modal"
                        onPress={showModal}
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
