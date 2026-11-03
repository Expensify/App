import Icon from '@components/Icon';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import TabBarLabel from './TabBarLabel';

type TabBarItemProps = {
    icon: IconAsset;
    label: string;
    isSelected: boolean;
    isHovered?: boolean;
    statusIndicatorColor?: string;
    numberOfLines?: number;
};

function getIconFill(isSelected: boolean, isHovered: boolean, theme: ReturnType<typeof useTheme>) {
    if (isSelected) {
        return theme.iconMenu;
    }
    if (isHovered) {
        return theme.success;
    }
    return theme.icon;
}

function TabBarItem({icon, label, isSelected, isHovered = false, statusIndicatorColor, numberOfLines = 2}: TabBarItemProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const iconSize = shouldUseNarrowLayout ? variables.iconFloatingTabBar : variables.iconBottomBar;

    return (
        <View style={[styles.navigationTabBarItem, shouldUseNarrowLayout && styles.navigationTabBarItemNarrow, shouldUseNarrowLayout && isSelected && styles.navigationTabBarItemSelected]}>
            <View>
                <Icon
                    src={icon}
                    fill={getIconFill(isSelected, isHovered, theme)}
                    width={iconSize}
                    height={iconSize}
                />
                {!!statusIndicatorColor && (
                    <View style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(statusIndicatorColor), isHovered && {borderColor: theme.sidebarHover}]} />
                )}
            </View>
            <TabBarLabel
                label={label}
                isSelected={isSelected}
                numberOfLines={numberOfLines}
                style={shouldUseNarrowLayout ? styles.mt1 : styles.mt1Half}
            />
        </View>
    );
}

export default TabBarItem;
