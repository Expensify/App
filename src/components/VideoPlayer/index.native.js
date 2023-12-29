import React, {forwardRef} from 'react';
import CONST from '@src/CONST';
import VideoPlayer from './BaseVideoPlayer';

function BaseVideoPlayer(props, ref) {
    return (
        <VideoPlayer
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

BaseVideoPlayer.displayName = 'VideoPlayer';

export default forwardRef(BaseVideoPlayer);
