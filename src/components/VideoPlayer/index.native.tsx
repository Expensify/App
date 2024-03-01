import React, {forwardRef} from 'react';
import CONST from '@src/CONST';
import BaseVideoPlayer from './BaseVideoPlayer';
import type VideoPlayerProps from './types';

function VideoPlayer({videoControlsStyle, ...props}: VideoPlayerProps) {
    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVideoHovered
            shouldUseSharedVideoElement={false}
            videoControlsStyle={[{bottom: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NATIVE}, videoControlsStyle]}
        />
    );
}

VideoPlayer.displayName = 'VideoPlayer';

export default forwardRef(VideoPlayer);
