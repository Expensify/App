import PropTypes from 'prop-types';
import React from 'react';
import VideoPlayer from '@components/VideoPlayer';
import useWindowDimensions from '@hooks/useWindowDimensions';

const propTypes = {
    /** Video file source URL */
    source: PropTypes.string.isRequired,

    /** Whether the video is currently being hovered over */
    isHovered: PropTypes.bool,
};

const defaultProps = {
    isHovered: false,
};

function AttachmentViewVideo({source, isHovered}) {
    const {isSmallScreenWidth} = useWindowDimensions();

    return (
        <VideoPlayer
            url={source}
            shouldPlay={false}
            shouldUseSharedVideoElement={!isSmallScreenWidth}
            isHovered={isHovered}
        />
    );
}

AttachmentViewVideo.propTypes = propTypes;
AttachmentViewVideo.defaultProps = defaultProps;

export default React.memo(AttachmentViewVideo);
