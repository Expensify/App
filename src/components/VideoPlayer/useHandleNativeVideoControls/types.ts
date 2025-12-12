import type {MutableRefObject} from 'react';
import type {VideoWithOnFullScreenUpdate} from '@components/VideoPlayer/types';

type UseHandleNativeVideoControlParams = {
    videoPlayerRef: MutableRefObject<VideoWithOnFullScreenUpdate | null>;
    isLocalFile: boolean;
    isOffline: boolean;
};
type UseHandleNativeVideoControl = (params: UseHandleNativeVideoControlParams) => void;

export default UseHandleNativeVideoControl;
