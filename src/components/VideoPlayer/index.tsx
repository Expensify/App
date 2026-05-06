import React, {useState} from 'react';
import * as PopoverMenu from '@components/PopoverMenu/v2';
import uniqueIDForVideoWithoutReport from '@components/VideoPlayerContexts/PlaybackContext/uniqueID';
import BaseVideoPlayer from './BaseVideoPlayer';
import type VideoPlayerProps from './types';

function VideoPlayer(props: VideoPlayerProps) {
    // `fakeReportID` is a getter that increments each access — freeze it per instance.
    const [fakeReportID] = useState(() => uniqueIDForVideoWithoutReport().fakeReportID);
    const {reportID} = props;

    return (
        <PopoverMenu.Root>
            <BaseVideoPlayer
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
                reportID={reportID ?? fakeReportID}
            />
        </PopoverMenu.Root>
    );
}

export default VideoPlayer;
