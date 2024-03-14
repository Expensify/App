import React from 'react';
import VideoPlayer from '@components/VideoPlayer';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

type AttachmentViewVideoProps = {
    /** Video file source URL */
    source: string;

    /** Whether the video is currently being hovered over */
    isHovered?: boolean;

    shouldUseSharedVideoElement?: boolean;

    videoDuration?: number;
};

function AttachmentViewVideo({source, isHovered = false, shouldUseSharedVideoElement = false, videoDuration = 0}: AttachmentViewVideoProps) {
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

AttachmentViewVideo.displayName = 'AttachmentViewVideo';

export default React.memo(AttachmentViewVideo);
