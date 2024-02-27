import PropTypes from 'prop-types';
import React from 'react';
import VideoPlayer from '@components/VideoPlayer';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

const propTypes = {
    /** Video file source URL */
    source: PropTypes.string.isRequired,

    /** Whether the video is currently being hovered over */
    isHovered: PropTypes.bool,

    shouldUseSharedVideoElement: PropTypes.bool,

    videoDuration: PropTypes.number,
};

const defaultProps = {
    isHovered: false,
    shouldUseSharedVideoElement: false,
    videoDuration: 0,
};

function AttachmentViewVideo({source, isHovered, shouldUseSharedVideoElement, videoDuration}) {
    const {isSmallScreen} = useWindowDimensions();
    const styles = useThemeStyles();

    return (
        <VideoPlayer
            url={source}
            shouldUseSharedVideoElement={shouldUseSharedVideoElement && !isSmallScreen}
            isVideoHovered={isHovered}
            videoDuration={videoDuration}
            style={[styles.w100, styles.h100]}
        />
    );
}

AttachmentViewVideo.propTypes = propTypes;
AttachmentViewVideo.defaultProps = defaultProps;
AttachmentViewVideo.displayName = 'AttachmentViewVideo';

export default React.memo(AttachmentViewVideo);
