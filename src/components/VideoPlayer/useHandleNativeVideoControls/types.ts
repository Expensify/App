import type {VideoView} from 'expo-video';
import type {RefObject} from 'react';

type UseHandleNativeVideoControlParams = {
    /**
     * Reference to the VideoView component being handled.
     */
    videoViewRef: RefObject<VideoView | null>;

    /**
     * Whether the video source is a local file.
     */
    isLocalFile: boolean;

    /**
     * Whether the user is currently in offline mode.
     */
    isOffline: boolean;
};
type UseHandleNativeVideoControl = (params: UseHandleNativeVideoControlParams) => void;

export default UseHandleNativeVideoControl;
