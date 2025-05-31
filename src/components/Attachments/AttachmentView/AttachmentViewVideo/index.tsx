import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useRef} from 'react';
import VideoPlayer from '@components/VideoPlayer';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import navigationRef from '@libs/Navigation/navigationRef';
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
    const videoPlayerRef = useRef<VideoWithOnFullScreenUpdate | null>(null);
    const navigation = useNavigation();

    useEffect(() => {
        // Listen to state change to change the playing state of the video player
        return navigation.addListener('state', () => {
            const currentRoute = navigationRef.getCurrentRoute();
            if (currentRoute?.params && 'source' in currentRoute.params && currentRoute.params.source === source) {
                videoPlayerRef.current?.setStatusAsync({shouldPlay: true}).catch(() => {});
                return;
            }

            videoPlayerRef.current?.setStatusAsync({shouldPlay: false}).catch(() => {});
        });
    }, [navigation, source]);

    return (
        <VideoPlayer
            url={source}
            shouldUseSharedVideoElement={shouldUseSharedVideoElement && !shouldUseNarrowLayout}
            isVideoHovered={isHovered}
            videoDuration={duration}
            style={[styles.w100, styles.h100, styles.pb5]}
            reportID={reportID}
            ref={videoPlayerRef}
        />
    );
}

AttachmentViewVideo.displayName = 'AttachmentViewVideo';

export default React.memo(AttachmentViewVideo);
