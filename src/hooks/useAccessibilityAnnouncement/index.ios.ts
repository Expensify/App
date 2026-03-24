import type {ReactNode} from 'react';
import {useEffect, useRef} from 'react';
import {AccessibilityInfo} from 'react-native';
import type UseAccessibilityAnnouncementOptions from './types';

const DELAY_FOR_ACCESSIBILITY_TREE_SYNC = 100;

function useAccessibilityAnnouncement(message: string | ReactNode, shouldAnnounceMessage: boolean, options?: UseAccessibilityAnnouncementOptions) {
    const previousAnnouncedMessageRef = useRef('');
    const delay = options?.delay ?? DELAY_FOR_ACCESSIBILITY_TREE_SYNC;
    const previousKeyRef = useRef(_options?.announcementKey);

    useEffect(() => {
        if (!shouldAnnounceMessage || typeof message !== 'string' || !message.trim()) {
            previousAnnouncedMessageRef.current = '';
            return;
        }

        const keyChanged = _options?.announcementKey !== undefined && _options.announcementKey !== previousKeyRef.current;
        previousKeyRef.current = _options?.announcementKey;

        if (!keyChanged && previousAnnouncedMessageRef.current === message) {
            return;
        }

        previousAnnouncedMessageRef.current = message;

        // On iOS real devices, a brief delay helps the accessibility tree sync before announcing.
        const timeout = setTimeout(() => {
            AccessibilityInfo.announceForAccessibility(message);
        }, delay);

        // eslint-disable-next-line consistent-return
        return () => clearTimeout(timeout);
    }, [message, shouldAnnounceMessage, delay, _options?.announcementKey]);
}

export default useAccessibilityAnnouncement;
