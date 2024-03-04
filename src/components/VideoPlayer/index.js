import React, {forwardRef} from 'react';
import BaseVideoPlayer from './BaseVideoPlayer';
import {videoPlayerDefaultProps, videoPlayerPropTypes} from './propTypes';

function VideoPlayer(props, ref) {
    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            ref={ref}
        />
    );
}

VideoPlayer.displayName = 'VideoPlayer';
VideoPlayer.propTypes = videoPlayerPropTypes;
VideoPlayer.defaultProps = videoPlayerDefaultProps;

export default forwardRef(VideoPlayer);
