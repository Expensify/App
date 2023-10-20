import React, {memo} from 'react';
import VideoPlayer from '../../../VideoPlayer';
import withLocalize, {withLocalizePropTypes} from '../../../withLocalize';
import compose from '../../../../libs/compose';
import useWindowDimensions from '../../../../hooks/useWindowDimensions';
import {usePlaybackContext} from '../../../VideoPlayerContexts/PlaybackContext';

const propTypes = {
    ...withLocalizePropTypes,
};

function AttachmentViewVideo({source}) {
    const {currentlyPlayingURL} = usePlaybackContext();
    const {isSmallScreenWidth} = useWindowDimensions();

    const shouldUseSharedElementTransition = !isSmallScreenWidth && currentlyPlayingURL === source;

    return (
        <VideoPlayer
            url={source}
            shouldPlay={false}
            shouldUseSharedVideoElement={shouldUseSharedElementTransition}
        />
    );
}

AttachmentViewVideo.propTypes = propTypes;
AttachmentViewVideo.defaultProps = {};

export default compose(memo, withLocalize)(AttachmentViewVideo);
