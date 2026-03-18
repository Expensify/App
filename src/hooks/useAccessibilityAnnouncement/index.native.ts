import type {ReactNode} from 'react';
import {useEffect, useRef} from 'react';
import {AccessibilityInfo} from 'react-native';
import type UseAccessibilityAnnouncementOptions from './types';

function useAccessibilityAnnouncement(message: string | ReactNode, shouldAnnounceMessage: boolean, options?: UseAccessibilityAnnouncementOptions) {
    const previousAnnouncedMessageRef = useRef('');
    const shouldAnnounceOnNative = options?.shouldAnnounceOnNative ?? false;

    useEffect(() => {
        if (!shouldAnnounceOnNative || !shouldAnnounceMessage || typeof message !== 'string' || !message.trim()) {
            previousAnnouncedMessageRef.current = '';
            return;
        }

        if (previousAnnouncedMessageRef.current === message) {
            return;
        }

        previousAnnouncedMessageRef.current = message;
        AccessibilityInfo.announceForAccessibility(message);
    }, [message, shouldAnnounceMessage, shouldAnnounceOnNative]);
}

export default useAccessibilityAnnouncement;
