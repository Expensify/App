import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import type IconAsset from '@src/types/utils/IconAsset';

type TabBarItemProps = {
    icon: IconAsset;
    label: string;
    isSelected: boolean;
    isHovered?: boolean;
    statusIndicatorColor?: string;
    statusIndicatorBorderColor?: string;
    numberOfLines?: number;
    isHorizontal?: boolean;
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

function TabBarItem({icon, label, isSelected, isHovered = false, statusIndicatorColor, statusIndicatorBorderColor, numberOfLines = 2, isHorizontal = false}: TabBarItemProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    const iconSize = isHorizontal ? variables.iconSizeNormal : variables.iconBottomBar;
    const iconNode = (
        <View>
            <Icon
                src={icon}
                fill={getIconFill(isSelected, isHovered, theme)}
                width={iconSize}
                height={iconSize}
            />
            {!!statusIndicatorColor && (
                <View
                    style={[
                        styles.navigationTabBarStatusIndicator,
                        styles.statusIndicatorColor(statusIndicatorColor),
                        !!statusIndicatorBorderColor && {borderColor: statusIndicatorBorderColor},
                        isHovered && {borderColor: theme.sidebarHover},
                    ]}
                />
            )}
        </View>
    );

    if (isHorizontal) {
        return (
            <>
                {iconNode}
                <Text
                    numberOfLines={1}
                    style={[styles.flex1, isSelected ? styles.textBold : styles.textSupporting]}
                >
                    {label}
                </Text>
            </>
        );
    }

    return (
        <>
            {iconNode}
            <Text
                numberOfLines={numberOfLines}
                style={[styles.textSmall, styles.textAlignCenter, styles.mt1Half, isSelected ? styles.textBold : styles.textSupporting, styles.navigationTabBarLabel]}
            >
                {label}
            </Text>
        </>
    );
}

export default TabBarItem;
