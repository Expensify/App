import type React from 'react';

type SetLiveRegionAnnouncement = React.Dispatch<React.SetStateAction<string>>;

function announceSuggestionsAvailability(announcement: string, setLiveRegionAnnouncement: SetLiveRegionAnnouncement, setAnnouncementTimeout: (timeout: NodeJS.Timeout | null) => void) {
    // TalkBack reacts more reliably when an existing live region's text changes.
    setLiveRegionAnnouncement('');
    const timeout = setTimeout(() => {
        setLiveRegionAnnouncement(announcement);
        setAnnouncementTimeout(null);
    }, 50);
    setAnnouncementTimeout(timeout);
}

export default announceSuggestionsAvailability;
