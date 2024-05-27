import React from 'react';
import VideoPlayer from '@components/VideoPlayer';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';
import type {AttachmentViewProps} from '..';

type AttachmentViewVideoProps = Pick<AttachmentViewProps, 'duration' | 'isHovered'> & {
    /** Video file source URL */
    source: string;

    shouldUseSharedVideoElement?: boolean;
};

function AttachmentViewVideo({source, isHovered = false, shouldUseSharedVideoElement = false, duration = 0}: AttachmentViewVideoProps) {
    const {isSmallScreenWidth} = useWindowDimensions();
    const styles = useThemeStyles();

    return (
        <VideoPlayer
            url={source}
            shouldUseSharedVideoElement={shouldUseSharedVideoElement && !isSmallScreenWidth}
            isVideoHovered={isHovered}
            videoDuration={duration}
            style={[styles.w100, styles.h100]}
        />
    );
}

AttachmentViewVideo.displayName = 'AttachmentViewVideo';

export default React.memo(AttachmentViewVideo);
