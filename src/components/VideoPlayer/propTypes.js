import {ResizeMode} from 'expo-av';
import PropTypes from 'prop-types';
import stylePropTypes from '@styles/stylePropTypes';

const videoPlayerPropTypes = {
    url: PropTypes.string.isRequired,

    onVideoLoaded: PropTypes.func,

    resizeMode: PropTypes.string,

    isLooping: PropTypes.bool,

    style: stylePropTypes,

    videoPlayerStyle: stylePropTypes,

    videoStyle: stylePropTypes,

    videoControlsStyle: stylePropTypes,

    shouldUseSharedVideoElement: PropTypes.bool,

    shouldUseSmallVideoControls: PropTypes.bool,

    isVideoHovered: PropTypes.bool,
};

const videoPlayerDefaultProps = {
    onVideoLoaded: () => {},
    resizeMode: ResizeMode.CONTAIN,
    isLooping: false,
    style: undefined,
    videoPlayerStyle: undefined,
    videoStyle: undefined,
    videoControlsStyle: undefined,
    shouldUseSharedVideoElement: false,
    shouldUseSmallVideoControls: false,
    isVideoHovered: false,
};

export {videoPlayerDefaultProps, videoPlayerPropTypes};
