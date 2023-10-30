import React, {memo} from 'react';
import VideoPlayer from '@components/VideoPlayer';
import withLocalize, {withLocalizePropTypes} from '@components/withLocalize';
import useWindowDimensions from '@hooks/useWindowDimensions';
import compose from '@libs/compose';

const propTypes = {
    ...withLocalizePropTypes,
};

function AttachmentViewVideo({source}) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const shouldUseSharedElementTransition = !isSmallScreenWidth;

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
