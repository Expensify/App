import PropTypes from 'prop-types';
import React from 'react';
import VideoPlayer from '@components/VideoPlayer';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import * as Broswer from '@libs/Browser';

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
    const {isSmallScreen, isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();

    return (
        <VideoPlayer
            url={source}
            // On mWeb Android, fullscreen video player would automatically change orientation for landscape videos, causing isSmallScreenWidth to be false
            shouldUseSharedVideoElement={shouldUseSharedVideoElement && !(Broswer.isMobileChrome() ? isSmallScreen : isSmallScreenWidth)}
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
