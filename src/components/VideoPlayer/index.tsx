import React from 'react';
import uniqueIDForVideoWithoutReport from '@components/VideoPlayerContexts/PlaybackContext/uniqueID';
import BaseVideoPlayer from './BaseVideoPlayer';
import type {VideoPlayerProps, VideoWithOnFullScreenUpdate} from './types';

function VideoPlayer(props: VideoPlayerProps, ref: React.ForwardedRef<VideoWithOnFullScreenUpdate | null>) {
    const {fakeReportID} = uniqueIDForVideoWithoutReport();
    const {reportID} = props;

    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            reportID={reportID ?? fakeReportID}
            ref={ref}
        />
    );
}

VideoPlayer.displayName = 'VideoPlayer';

export default React.forwardRef(VideoPlayer);
