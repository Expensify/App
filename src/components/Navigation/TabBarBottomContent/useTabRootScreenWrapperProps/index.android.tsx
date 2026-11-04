import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

import type TabRootScreenWrapperProps from './types';

/**
 * Material's bar is drawn over the full-height tab screen, so a narrow tab root screen reserves the bar's row under its
 * content, and the ScreenWrapper adds the gesture inset the bar sits on below it.
 */
function useTabRootScreenWrapperProps(): TabRootScreenWrapperProps {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    if (!shouldUseNarrowLayout) {
        return {};
    }

    return {bottomContent: <View style={styles.androidNativeTabBarSpacer} />};
}

export default useTabRootScreenWrapperProps;
