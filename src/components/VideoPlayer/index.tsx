import React from 'react';
import BaseVideoPlayer from './BaseVideoPlayer';
import type {VideoPlayerProps} from './types';

function VideoPlayer(props: VideoPlayerProps) {
    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
        />
    );
}

VideoPlayer.displayName = 'VideoPlayer';

export default VideoPlayer;
