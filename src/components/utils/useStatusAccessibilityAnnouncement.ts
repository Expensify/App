import {useEffect, useRef} from 'react';
import {AccessibilityInfo, Platform} from 'react-native';

const IOS_ANNOUNCEMENT_DELAY = 100;

function useStatusAccessibilityAnnouncement(message: string, shouldAnnounce: boolean, announcementKey = '') {
    const previousAnnouncementRef = useRef('');

    useEffect(() => {
        if (Platform.OS === 'web') {
            previousAnnouncementRef.current = '';
            return;
        }

        const trimmedMessage = message.trim();
        if (!shouldAnnounce || !trimmedMessage) {
            previousAnnouncementRef.current = '';
            return;
        }

        const composedAnnouncementKey = `${trimmedMessage}::${announcementKey}`;
        if (previousAnnouncementRef.current === composedAnnouncementKey) {
            return;
        }

        previousAnnouncementRef.current = composedAnnouncementKey;
        const timeout = setTimeout(() => AccessibilityInfo.announceForAccessibility(trimmedMessage), Platform.OS === 'ios' ? IOS_ANNOUNCEMENT_DELAY : 0);

        return () => clearTimeout(timeout);
    }, [announcementKey, message, shouldAnnounce]);
}

export default useStatusAccessibilityAnnouncement;
