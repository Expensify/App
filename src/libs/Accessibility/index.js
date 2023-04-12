import {useEffect, useState} from 'react';
import {AccessibilityInfo} from 'react-native';
import moveAccessibilityFocus from './moveAccessibilityFocus';

const useScreenReaderStatus = () => {
    const [isScreenReaderEnabled, setIsScreenReaderEnabled] = useState(false);
    useEffect(() => {
        const unsubscribe = AccessibilityInfo.addEventListener('screenReaderChanged', (isEnabled) => {
            setIsScreenReaderEnabled(isEnabled);
        });

        return () => {
            unsubscribe();
        };
    }, []);

    return isScreenReaderEnabled;
};

export default {
    moveAccessibilityFocus,
    useScreenReaderStatus,
};
