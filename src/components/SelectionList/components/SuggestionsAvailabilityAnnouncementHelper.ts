import type React from 'react';

type SetLiveRegionAnnouncement = React.Dispatch<React.SetStateAction<string>>;

function announceSuggestionsAvailability(announcement: string, setLiveRegionAnnouncement: SetLiveRegionAnnouncement, setAnnouncementTimeout: (timeout: NodeJS.Timeout | null) => void) {
    setLiveRegionAnnouncement(announcement);
    setAnnouncementTimeout(null);
}

export default announceSuggestionsAvailability;
