import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import {BlurView} from 'expo-blur';
import React from 'react';

/**
 * Blurs whatever the floating tab bar covers, so the bar reads as a glass capsule the way UIKit draws it on iOS.
 * Android has no backdrop filter of its own, so the blur comes from a native view behind the row.
 */
function TabBarBlur() {
    const styles = useThemeStyles();
    const theme = useTheme();

    return (
        <BlurView
            intensity={variables.floatingTabBarBlurIntensity}
            tint={theme.colorScheme}
            style={styles.navigationTabBarBlur}
        />
    );
}

export default TabBarBlur;
