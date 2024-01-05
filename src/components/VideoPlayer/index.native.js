import React, {forwardRef} from 'react';
import CONST from '@src/CONST';
import BaseVideoPlayer from './BaseVideoPlayer';

function VideoPlayer(props, ref) {
    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVideoHovered
            shouldUseSharedVideoElement={false}
            // eslint-disable-next-line react/prop-types
            videoControlsStyle={[{bottom: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NATIVE}, props.style]}
            ref={ref}
        />
    );
}

VideoPlayer.displayName = 'VideoPlayer';

export default forwardRef(VideoPlayer);
