import PropTypes from 'prop-types';
import React from 'react';
import VideoPlayer from '@components/VideoPlayer';
import useWindowDimensions from '@hooks/useWindowDimensions';

const propTypes = {
    source: PropTypes.string.isRequired,
};

function AttachmentViewVideo({source}) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <VideoPlayer
            url={source}
            shouldPlay={false}
            shouldUseSharedVideoElement={!isSmallScreenWidth}
        />
    );
}

AttachmentViewVideo.propTypes = propTypes;
AttachmentViewVideo.defaultProps = {};

export default React.memo(AttachmentViewVideo);
