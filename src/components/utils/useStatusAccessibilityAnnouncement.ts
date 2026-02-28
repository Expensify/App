import {useEffect, useRef} from 'react';
import {AccessibilityInfo, Platform} from 'react-native';
import {announceStatusForWeb} from '@libs/StatusAccessibilityAnnouncement';

const IOS_ANNOUNCEMENT_DELAY = 100;

function useStatusAccessibilityAnnouncement(message: string, shouldAnnounce: boolean, announcementKey = '') {
    const previousAnnouncementRef = useRef('');

    useEffect(() => {
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

        if (Platform.OS === 'web') {
            announceStatusForWeb(trimmedMessage);
            return;
        }

        const timeout = setTimeout(() => AccessibilityInfo.announceForAccessibility(trimmedMessage), Platform.OS === 'ios' ? IOS_ANNOUNCEMENT_DELAY : 0);

        return () => clearTimeout(timeout);
    }, [announcementKey, message, shouldAnnounce]);
}

export default useStatusAccessibilityAnnouncement;
