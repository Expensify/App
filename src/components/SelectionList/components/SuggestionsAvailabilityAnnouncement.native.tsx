import React, {useEffect, useRef} from 'react';
import {AccessibilityInfo} from 'react-native';

type SuggestionsAvailabilityAnnouncementProps = {
    /** The text announced to assistive technologies when suggestions become available */
    announcement: string;

    /** Delay the announcement to avoid interrupting text input focus changes */
    delayMS?: number;
};

function SuggestionsAvailabilityAnnouncement({announcement, delayMS = 0}: SuggestionsAvailabilityAnnouncementProps) {
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastAnnouncementRef = useRef('');

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }

        if (!announcement) {
            lastAnnouncementRef.current = '';
            return;
        }

        if (announcement === lastAnnouncementRef.current) {
            return;
        }

        lastAnnouncementRef.current = announcement;
        timeoutRef.current = setTimeout(() => {
            AccessibilityInfo.announceForAccessibility(announcement);
            timeoutRef.current = null;
        }, delayMS);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
        };
    }, [announcement, delayMS]);

    return null;
}

export default SuggestionsAvailabilityAnnouncement;
