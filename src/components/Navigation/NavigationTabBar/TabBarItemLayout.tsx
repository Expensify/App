/** A tab bar item: its icon over its label, or beside it in landscape, on the selected capsule of the narrow bar. */
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ReactNode} from 'react';

import React from 'react';
import {View} from 'react-native';

import TabBarLabel from './TabBarLabel';

type TabBarItemLayoutProps = {
    /** The icon of the item, such as a TabBarItemIcon */
    icon: ReactNode;
    label: string;
    isSelected: boolean;
    numberOfLines?: number;
};

function TabBarItemLayout({icon, label, isSelected, numberOfLines = 2}: TabBarItemLayoutProps) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();

    return (
        <View
            style={[
                styles.navigationTabBarItem,
                shouldUseNarrowLayout && styles.navigationTabBarItemNarrow,
                shouldUseNarrowLayout && isSelected && styles.navigationTabBarItemSelected,
                isInLandscapeMode && [styles.flexRow, styles.gap1Half],
            ]}
        >
            {icon}
            <TabBarLabel
                label={label}
                isSelected={isSelected}
                numberOfLines={numberOfLines}
                style={!isInLandscapeMode && (shouldUseNarrowLayout ? styles.mt1 : styles.mt1Half)}
            />
        </View>
    );
}

export default TabBarItemLayout;
