import React, {useState} from 'react';
import uniqueIDForVideoWithoutReport from '@components/VideoPlayerContexts/PlaybackContext/uniqueID';
import CONST from '@src/CONST';
import BaseVideoPlayer from './BaseVideoPlayer';
import type VideoPlayerProps from './types';

function VideoPlayer({videoControlsStyle, shouldUseControlsBottomMargin = true, ...props}: VideoPlayerProps) {
    // `fakeReportID` is a getter that increments each access — freeze it per instance.
    const [fakeReportID] = useState(() => uniqueIDForVideoWithoutReport().fakeReportID);
    const {reportID} = props;

    return (
        <BaseVideoPlayer
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            isVideoHovered
            shouldUseSharedVideoElement={false}
            videoControlsStyle={[shouldUseControlsBottomMargin ? {bottom: CONST.VIDEO_PLAYER.CONTROLS_POSITION.NATIVE} : undefined, videoControlsStyle]}
            reportID={reportID ?? fakeReportID}
        />
    );
}

export default VideoPlayer;
