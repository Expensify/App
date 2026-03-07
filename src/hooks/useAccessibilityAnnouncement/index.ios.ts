import type {ReactNode} from 'react';
import {useEffect, useRef} from 'react';
import {AccessibilityInfo} from 'react-native';

const DELAY_FOR_ACCESSIBILITY_TREE_SYNC = 100;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useAccessibilityAnnouncement(message: string | ReactNode, shouldAnnounceMessage: boolean, _shouldUsePersistentLiveRegionOnWeb = false) {
    const previousAnnouncedMessageRef = useRef('');

    useEffect(() => {
        if (!shouldAnnounceMessage || typeof message !== 'string' || !message.trim()) {
            previousAnnouncedMessageRef.current = '';
            return;
        }

        if (previousAnnouncedMessageRef.current === message) {
            return;
        }

        previousAnnouncedMessageRef.current = message;

        // On iOS real devices, a brief delay helps the accessibility tree sync before announcing.
        const timeout = setTimeout(() => {
            AccessibilityInfo.announceForAccessibility(message);
        }, DELAY_FOR_ACCESSIBILITY_TREE_SYNC);

        return () => clearTimeout(timeout);
    }, [message, shouldAnnounceMessage]);

    return {liveRegionMessage: '', shouldUsePersistentLiveRegion: false} as const;
}

export default useAccessibilityAnnouncement;
