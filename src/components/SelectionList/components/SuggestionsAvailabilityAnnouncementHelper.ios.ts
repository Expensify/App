import type React from 'react';
import {AccessibilityInfo} from 'react-native';

type SetLiveRegionAnnouncement = React.Dispatch<React.SetStateAction<string>>;

function announceSuggestionsAvailability(announcement: string, setLiveRegionAnnouncement: SetLiveRegionAnnouncement, setAnnouncementTimeout: (timeout: NodeJS.Timeout | null) => void) {
    setLiveRegionAnnouncement(announcement);
    setAnnouncementTimeout(null);
    AccessibilityInfo.announceForAccessibility(announcement);
}

export default announceSuggestionsAvailability;
