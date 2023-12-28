import React, {forwardRef} from 'react';
import VideoPlayer from './BaseVideoPlayer';

function BaseVideoPlayer(props, ref) {
    return (
        <VideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            shouldUseSharedVideoElement={false}
            ref={ref}
        />
    );
}

BaseVideoPlayer.displayName = 'VideoPlayer';

export default forwardRef(BaseVideoPlayer);
