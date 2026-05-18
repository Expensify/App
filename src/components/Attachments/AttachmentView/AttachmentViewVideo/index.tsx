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

    /** Callback function to call when the video is tap */
    onTap?: (shouldShowArrows?: boolean) => void;

    /** Callback function to call when the video preview is ready */
    onLoad?: () => void;

    /** Callback function to call when the video fails to load */
    onError?: () => void;
};

function AttachmentViewVideo({source, isHovered = false, shouldUseSharedVideoElement = false, duration = 0, reportID, onTap, onLoad, onError}: AttachmentViewVideoProps) {
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
            onTap={onTap}
            onSourceLoaded={onLoad}
            onError={onError}
        />
    );
}

AttachmentViewVideo.displayName = 'AttachmentViewVideo';

export default React.memo(AttachmentViewVideo);
