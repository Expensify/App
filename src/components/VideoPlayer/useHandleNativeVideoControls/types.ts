import type {VideoView} from 'expo-video';
import type {MutableRefObject} from 'react';

type UseHandleNativeVideoControlParams = {
    videoViewRef: MutableRefObject<VideoView | null>;
    isLocalFile: boolean;
    isOffline: boolean
};
type UseHandleNativeVideoControl = (params: UseHandleNativeVideoControlParams) => void;

export default UseHandleNativeVideoControl;
