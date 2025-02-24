import {useEffect} from 'react';
import type UseHandleNativeVideoControl from './types';

/**
 * Web implementation for managing native video controls.
 * This hook hides the download button on the native video player in full-screen mode
 * when playing a local or offline video.
 */
const useHandleNativeVideoControls: UseHandleNativeVideoControl = ({videoPlayerRef, isLocalFile, isOffline}) => {
    useEffect(() => {
        // @ts-expect-error Property '_video' does not exist on type VideoWithOnFullScreenUpdate
        // eslint-disable-next-line no-underscore-dangle
        const videoElement = videoPlayerRef?.current?._nativeRef?.current?._video as HTMLVideoElement;
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
