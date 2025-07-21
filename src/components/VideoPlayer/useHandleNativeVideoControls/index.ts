import {useEffect} from 'react';
import type UseHandleNativeVideoControl from './types';

/**
 * Web implementation for managing native video controls.
 * This hook hides the download button on the native video player in full-screen mode
 * when playing a local or offline video.
 */
const useHandleNativeVideoControls: UseHandleNativeVideoControl = ({videoViewRef, isLocalFile, isOffline}) => {
    useEffect(() => {
        // @ts-expect-error Property 'videoRef' does not exist on type VideoWithOnFullScreenUpdate
        const videoElement = videoViewRef?.current?.videoRef as HTMLVideoElement;
        if (!videoElement) {
            return;
        }

        if (isOffline || isLocalFile) {
            videoElement.setAttribute('controlsList', 'nodownload');
        } else {
            videoElement.removeAttribute('controlsList');
        }
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [isOffline, isLocalFile]);
};

export default useHandleNativeVideoControls;
