import type {ReactNode} from 'react';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useAccessibilityAnnouncement(_message: string | ReactNode, _shouldAnnounceMessage: boolean, _shouldUsePersistentLiveRegionOnWeb = false) {
    return {liveRegionMessage: '', shouldUsePersistentLiveRegion: false} as const;
}

export default useAccessibilityAnnouncement;
