import React from 'react';
import CONST from '@src/CONST';
import BaseVideoPlayer from './BaseVideoPlayer';
import type {VideoPlayerProps} from './types';

function VideoPlayer({videoControlsStyle, shouldUseControlsBottomMargin = true, ...props}: VideoPlayerProps) {
    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVideoHovered
            shouldUseSharedVideoElement={false}
            videoControlsStyle={[shouldUseControlsBottomMargin ? {bottom: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NATIVE} : undefined, videoControlsStyle]}
        />
    );
}

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
