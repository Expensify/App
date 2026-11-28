import IconWithStatusIndicator from '@components/Navigation/IconWithStatusIndicator';
import StatusIndicator from '@components/Navigation/StatusIndicator';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

import getTabIconFill from './getTabIconFill';
import TabBarLabel from './TabBarLabel';

type TabBarItemProps = {
    icon: IconAsset;
    label: string;
    isSelected: boolean;
    isHovered?: boolean;
    statusIndicatorColor?: string;
    numberOfLines?: number;
};

function TabBarItem({icon, label, isSelected, isHovered = false, statusIndicatorColor, numberOfLines = 2}: TabBarItemProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isInLandscapeMode} = useResponsiveLayout();
    const iconSize = shouldUseNarrowLayout ? variables.iconFloatingTabBar : variables.iconBottomBar;

    return (
        <View
            style={[
                styles.navigationTabBarItem,
                shouldUseNarrowLayout && styles.navigationTabBarItemNarrow,
                shouldUseNarrowLayout && isSelected && styles.navigationTabBarItemSelected,
                isInLandscapeMode && [styles.flexRow, styles.gap1Half],
            ]}
        >
            <IconWithStatusIndicator
                src={icon}
                fill={getTabIconFill(isSelected, isHovered, theme)}
                size={iconSize}
            >
                {!!statusIndicatorColor && (
                    <StatusIndicator
                        color={statusIndicatorColor}
                        borderColor={isHovered ? theme.sidebarHover : undefined}
                    />
                )}
            </IconWithStatusIndicator>
            <TabBarLabel
                label={label}
                isSelected={isSelected}
                numberOfLines={numberOfLines}
                style={!isInLandscapeMode && (shouldUseNarrowLayout ? styles.mt1 : styles.mt1Half)}
            />
        </View>
    );
}

export default TabBarItem;
