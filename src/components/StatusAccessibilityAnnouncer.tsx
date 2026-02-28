import React, {useEffect, useRef, useState} from 'react';
import {Platform, View} from 'react-native';
import useThemeStyles from '@hooks/useThemeStyles';
import {addStatusAnnouncementListener} from '@libs/StatusAccessibilityAnnouncement';
import Text from './Text';

const WEB_ANNOUNCEMENT_DELAY = 100;
const WEB_CLEAR_ANNOUNCEMENT_DELAY = 500;

function StatusAccessibilityAnnouncer() {
    const styles = useThemeStyles();
    const [announcement, setAnnouncement] = useState('');
    const updateTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (Platform.OS !== 'web') {
            return;
        }

        return addStatusAnnouncementListener((message) => {
            const trimmedMessage = message.trim();
            if (!trimmedMessage) {
                setAnnouncement('');
                return;
            }

            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }

            if (clearTimeoutRef.current) {
                clearTimeout(clearTimeoutRef.current);
            }

            // Reset to force a content change in the persistent live region.
            setAnnouncement('\u00A0');
            updateTimeoutRef.current = setTimeout(() => {
                setAnnouncement(`${trimmedMessage}\u200B`);
            }, WEB_ANNOUNCEMENT_DELAY);

            clearTimeoutRef.current = setTimeout(() => {
                setAnnouncement('');
            }, WEB_ANNOUNCEMENT_DELAY + WEB_CLEAR_ANNOUNCEMENT_DELAY);
        });
    }, []);

    useEffect(() => {
        return () => {
            if (updateTimeoutRef.current) {
                clearTimeout(updateTimeoutRef.current);
            }
            if (clearTimeoutRef.current) {
                clearTimeout(clearTimeoutRef.current);
            }
        };
    }, []);

    if (Platform.OS !== 'web') {
        return null;
    }

    return (
        <View
            style={styles.screenReaderOnly}
            role="status"
            accessibilityLiveRegion="polite"
        >
            <Text>{announcement}</Text>
        </View>
    );
}

export default StatusAccessibilityAnnouncer;
