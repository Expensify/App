import React from 'react';
import useThemeStyles from '@hooks/useThemeStyles';
import Text from './Text';

type AccessibilityLiveRegionProps = {
    message: string;
};

function AccessibilityLiveRegion({message}: AccessibilityLiveRegionProps) {
    const styles = useThemeStyles();

    return (
        <Text
            style={[styles.accessibilityLiveRegionSROnly]}
            accessibilityLiveRegion="polite"
        >
            {message}
        </Text>
    );
}

export default AccessibilityLiveRegion;
