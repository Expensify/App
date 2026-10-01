import Icon from '@components/Icon';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type IconAsset from '@src/types/utils/IconAsset';

import React from 'react';
import {View} from 'react-native';

type TabBarItemProps = {
    icon: IconAsset;
    label: string;
    isSelected: boolean;
    isHovered?: boolean;
    statusIndicatorColor?: string;
    numberOfLines?: number;

    /** Whether the item is rendered inside the floating (mWeb landscape) tab bar, which lays the label out beside the icon */
    isFloating?: boolean;
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

function TabBarItem({icon, label, isSelected, isHovered = false, statusIndicatorColor, numberOfLines = 2, isFloating = false}: TabBarItemProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    return (
        <>
            <View>
                <Icon
                    src={icon}
                    fill={getIconFill(isSelected, isHovered, theme)}
                    width={variables.iconBottomBar}
                    height={variables.iconBottomBar}
                />
                {!!statusIndicatorColor && (
                    <View style={[styles.navigationTabBarStatusIndicator, styles.statusIndicatorColor(statusIndicatorColor), isHovered && {borderColor: theme.sidebarHover}]} />
                )}
            </View>
            <Text
                numberOfLines={isFloating ? 1 : numberOfLines}
                style={[
                    styles.textSmall,
                    isSelected ? styles.textBold : styles.textSupporting,
                    isFloating ? styles.navigationTabBarFloatingLabel : [styles.textAlignCenter, styles.mt1Half, styles.navigationTabBarLabel],
                ]}
            >
                {label}
            </Text>
        </>
    );
}

export default TabBarItem;
