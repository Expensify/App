import React, {forwardRef} from 'react';
import CONST from '@src/CONST';
import BaseVideoPlayer from './BaseVideoPlayer';
import {videoPlayerDefaultProps, videoPlayerPropTypes} from './propTypes';

function VideoPlayer({videoControlsStyle, ...props}, ref) {
    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVideoHovered
            shouldUseSharedVideoElement={false}
            videoControlsStyle={[{bottom: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NATIVE}, videoControlsStyle]}
            ref={ref}
        />
    );
}

VideoPlayer.displayName = 'VideoPlayer';
VideoPlayer.propTypes = videoPlayerPropTypes;
VideoPlayer.defaultProps = videoPlayerDefaultProps;

export default forwardRef(VideoPlayer);
