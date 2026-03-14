import React, {useEffect, useRef, useState} from 'react';
import Text from '@components/Text';
import useThemeStyles from '@hooks/useThemeStyles';
import announceSuggestionsAvailability from './SuggestionsAvailabilityAnnouncementHelper';

type SuggestionsAvailabilityAnnouncementProps = {
    /** The text announced to assistive technologies when suggestions become available */
    announcement: string;

    /** Delay the announcement to avoid interrupting text input focus changes */
    delayMS?: number;
};

function SuggestionsAvailabilityAnnouncement({announcement, delayMS = 0}: SuggestionsAvailabilityAnnouncementProps) {
    const styles = useThemeStyles();
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const androidAnnouncementTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const lastAnnouncementRef = useRef('');
    const [liveRegionAnnouncement, setLiveRegionAnnouncement] = useState('');
    const setAndroidAnnouncementTimeout = (timeout: NodeJS.Timeout | null) => {
        androidAnnouncementTimeoutRef.current = timeout;
    };

    useEffect(() => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
            timeoutRef.current = null;
        }
        if (androidAnnouncementTimeoutRef.current) {
            clearTimeout(androidAnnouncementTimeoutRef.current);
            androidAnnouncementTimeoutRef.current = null;
        }

        if (!announcement) {
            lastAnnouncementRef.current = '';
            timeoutRef.current = setTimeout(() => {
                setLiveRegionAnnouncement('');
                timeoutRef.current = null;
            }, 0);
            return;
        }

        if (announcement === lastAnnouncementRef.current) {
            return;
        }

        lastAnnouncementRef.current = announcement;
        timeoutRef.current = setTimeout(() => {
            announceSuggestionsAvailability(announcement, setLiveRegionAnnouncement, setAndroidAnnouncementTimeout);
            timeoutRef.current = null;
        }, delayMS);

        return () => {
            if (!timeoutRef.current) {
                if (!androidAnnouncementTimeoutRef.current) {
                    return;
                }
            }

            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
                timeoutRef.current = null;
            }
            if (androidAnnouncementTimeoutRef.current) {
                clearTimeout(androidAnnouncementTimeoutRef.current);
                androidAnnouncementTimeoutRef.current = null;
            }
        };
    }, [announcement, delayMS]);

    return (
        <Text
            accessible
            accessibilityLiveRegion="polite"
            importantForAccessibility="yes"
            style={[styles.invisible, {height: 1, width: 1}]}
        >
            {liveRegionAnnouncement}
        </Text>
    );
}

export default SuggestionsAvailabilityAnnouncement;
