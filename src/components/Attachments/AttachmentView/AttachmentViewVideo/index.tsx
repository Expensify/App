import React from 'react';
import VideoPlayer from '@components/VideoPlayer';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type {AttachmentViewProps} from '..';

type AttachmentViewVideoProps = Pick<AttachmentViewProps, 'duration' | 'isHovered'> & {
    /** Video file source URL */
    source: string;

    shouldUseSharedVideoElement?: boolean;

    /** The reportID related to the attachment */
    reportID?: string;
};

function AttachmentViewVideo({source, isHovered = false, shouldUseSharedVideoElement = false, duration = 0, reportID}: AttachmentViewVideoProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    return (
        <VideoPlayer
            url={source}
            shouldUseSharedVideoElement={shouldUseSharedVideoElement && !shouldUseNarrowLayout}
            isVideoHovered={isHovered}
            videoDuration={duration}
            style={[styles.w100, styles.h100, styles.pb5]}
            reportID={reportID}
        />
    );
}

AttachmentViewVideo.displayName = 'AttachmentViewVideo';

export default React.memo(AttachmentViewVideo);
