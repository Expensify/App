import type {VideoView} from 'expo-video';
import type {RefObject} from 'react';

type UseHandleNativeVideoControlParams = {
    videoViewRef: RefObject<VideoView | null>;
    isLocalFile: boolean;
    isOffline: boolean;
};
type UseHandleNativeVideoControl = (params: UseHandleNativeVideoControlParams) => void;

export default UseHandleNativeVideoControl;
