import React from 'react';
import {View} from 'react-native';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import type TabBarBottomContentProps from './types';

/**
 * On web there's no swipe-back gesture, so we don't need a second tab bar instance.
 * Instead, we render a spacer matching the tab bar height in narrow layout so content
 * isn't hidden behind the overlaid tab bar (which uses negative marginTop).
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function TabBarBottomContent(props: TabBarBottomContentProps) {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const styles = useThemeStyles();

    if (!shouldUseNarrowLayout) {
        return null;
    }

    return <View style={styles.bottomTabBarSpacer} />;
}

export default TabBarBottomContent;
