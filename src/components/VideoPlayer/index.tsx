import React from 'react';
import uniqueIDForVideoWithoutReport from '@components/VideoPlayerContexts/PlaybackContext/uniqueID';
import BaseVideoPlayer from './BaseVideoPlayer';
import type {VideoPlayerProps} from './types';

function VideoPlayer(props: VideoPlayerProps) {
    const {fakeReportID} = uniqueIDForVideoWithoutReport();
    const {reportID} = props;

    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            reportID={reportID ?? fakeReportID}
        />
    );
}

export default VideoPlayer;
