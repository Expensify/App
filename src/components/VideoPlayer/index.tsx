import React, {useState} from 'react';
import {Root as PopoverMenuRoot} from '@components/PopoverMenu/v2';
import uniqueIDForVideoWithoutReport from '@components/VideoPlayerContexts/PlaybackContext/uniqueID';
import BaseVideoPlayer from './BaseVideoPlayer';
import type VideoPlayerProps from './types';

function VideoPlayer(props: VideoPlayerProps) {
    // `fakeReportID` is a getter that increments each access — freeze it per instance.
    const [fakeReportID] = useState(() => uniqueIDForVideoWithoutReport().fakeReportID);
    const {reportID} = props;

    return (
        <PopoverMenuRoot>
            <BaseVideoPlayer
                {...props}
                reportID={reportID ?? fakeReportID}
            />
        </PopoverMenuRoot>
    );
}

export default VideoPlayer;
