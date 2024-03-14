import {ResizeMode} from 'expo-av';
import PropTypes from 'prop-types';
import stylePropTypes from '@styles/stylePropTypes';
import CONST from '@src/CONST';
import _ from 'underscore';

const videoPlayerPropTypes = {
    url: PropTypes.string.isRequired,

    onVideoLoaded: PropTypes.func,

    resizeMode: PropTypes.string,

    isLooping: PropTypes.bool,

    // style for the whole video player component
    style: stylePropTypes,

    // style for the video player inside the component
    videoPlayerStyle: stylePropTypes,

    // style for the video element inside the video player
    videoStyle: stylePropTypes,

    videoControlsStyle: stylePropTypes,

    videoDuration: PropTypes.number,

    shouldUseSharedVideoElement: PropTypes.bool,

    shouldUseSmallVideoControls: PropTypes.bool,

    controlsStatus: PropTypes.oneOf(_.values(CONST.VIDEO_PLAYER.CONTROLS_STATUS)),

    isVideoHovered: PropTypes.bool,

    onFullscreenUpdate: PropTypes.func,

    onPlaybackStatusUpdate: PropTypes.func,
};

const videoPlayerDefaultProps = {
    onVideoLoaded: () => {},
    resizeMode: ResizeMode.CONTAIN,
    isLooping: false,
    style: undefined,
    videoPlayerStyle: undefined,
    videoStyle: undefined,
    videoControlsStyle: undefined,
    videoDuration: 0,
    shouldUseSharedVideoElement: false,
    shouldUseSmallVideoControls: false,
    controlsStatus: CONST.VIDEO_PLAYER.CONTROLS_STATUS.SHOW,
    isVideoHovered: false,
    onFullscreenUpdate: () => {},
    onPlaybackStatusUpdate: () => {},
};

export {videoPlayerDefaultProps, videoPlayerPropTypes};
