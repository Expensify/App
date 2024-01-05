import React, {forwardRef} from 'react';
import BaseVideoPlayer from './BaseVideoPlayer';

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

export default forwardRef(VideoPlayer);
