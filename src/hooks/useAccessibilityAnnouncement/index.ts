import type {ReactNode} from 'react';

type UseAccessibilityAnnouncementOptions = {
    shouldAnnounceOnNative?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useAccessibilityAnnouncement(_message: string | ReactNode, _shouldAnnounceMessage: boolean, _options?: UseAccessibilityAnnouncementOptions) {}

export default useAccessibilityAnnouncement;
