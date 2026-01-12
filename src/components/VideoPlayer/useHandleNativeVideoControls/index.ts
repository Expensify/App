import {useEffect} from 'react';
import type UseHandleNativeVideoControl from './types';

/**
 * Web implementation for managing native video controls.
 * This hook hides the download button on the native video player in full-screen mode
 * when playing a local or offline video.
 */
const useHandleNativeVideoControls: UseHandleNativeVideoControl = ({videoViewRef, isLocalFile, isOffline}) => {
    useEffect(() => {
        const videoElement = videoViewRef?.current?.nativeRef.current as HTMLVideoElement;
        if (!videoElement) {
            return;
        }

        if (isOffline || isLocalFile) {
            videoElement.setAttribute('controlsList', 'nodownload');
        } else {
            videoElement.removeAttribute('controlsList');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOffline, isLocalFile]);
};

export default useHandleNativeVideoControls;
