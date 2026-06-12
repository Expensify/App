import type {ReactNode} from 'react';
import {useEffect, useRef} from 'react';
import {AccessibilityInfo} from 'react-native';
import type UseAccessibilityAnnouncementOptions from './types';

function useAccessibilityAnnouncement(message: string | ReactNode, shouldAnnounceMessage: boolean, options?: UseAccessibilityAnnouncementOptions) {
    const previousAnnouncedMessageRef = useRef('');
    const previousKeyRef = useRef(options?.announcementKey);
    const shouldAnnounceOnNative = options?.shouldAnnounceOnNative ?? false;

    useEffect(() => {
        if (!shouldAnnounceOnNative || !shouldAnnounceMessage || typeof message !== 'string' || !message.trim()) {
            previousAnnouncedMessageRef.current = '';
            return;
        }

        const keyChanged = options?.announcementKey !== undefined && options.announcementKey !== previousKeyRef.current;
        previousKeyRef.current = options?.announcementKey;

        if (!keyChanged && previousAnnouncedMessageRef.current === message) {
            return;
        }

        previousAnnouncedMessageRef.current = message;
        AccessibilityInfo.announceForAccessibility(message);
    }, [message, shouldAnnounceMessage, shouldAnnounceOnNative, options?.announcementKey]);
}

export default useAccessibilityAnnouncement;
