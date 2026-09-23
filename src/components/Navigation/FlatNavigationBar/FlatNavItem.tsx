import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {useSearchSidebarCollapseFadeStyle} from '@components/Navigation/SearchSidebarCollapseStore';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

type FlatNavItemProps = {
    /** Translated row label */
    label: string;

    icon?: IconAsset;

    /** Rendered in place of the icon, e.g. the account avatar */
    leftElement?: React.ReactNode;

    isSelected: boolean;

    /** Indents the row so it reads as a child of the row above it */
    isSubItem?: boolean;

    /** Optional count shown on the right, e.g. the number of reports needing approval */
    badgeText?: string;

    /** Small colored dot drawn on the icon when the row needs the user's attention */
    statusIndicatorColor?: string;

    accessibilityLabel?: string;

    sentryLabel?: string;

    /** Applied after the row's own styles, for rows that need a different height or spacing */
    additionalStyle?: StyleProp<ViewStyle>;

    /** Control shown in the row's leading indent, such as a saved search's overflow menu. Only visible on hover. */
    hoverActionComponent?: React.ReactNode;

    /** Collapsed rows keep only their icon, so the bar can narrow to an icon rail */
    isCollapsed?: boolean;

    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void;
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

function getStatusIndicatorBorderStyle(isSelected: boolean, isHovered: boolean, styles: ReturnType<typeof useThemeStyles>) {
    if (isSelected) {
        return {borderColor: styles.navigationRowSelected.backgroundColor};
    }
    if (isHovered) {
        return {borderColor: styles.navigationRowHovered.backgroundColor};
    }
    return undefined;
}

function FlatNavItem({
    label,
    icon,
    leftElement,
    isSelected,
    isSubItem = false,
    badgeText,
    statusIndicatorColor,
    accessibilityLabel,
    sentryLabel,
    additionalStyle,
    hoverActionComponent,
    isCollapsed = false,
    onPress,
}: FlatNavItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    // The label and badge stay mounted and fade, rather than disappearing the moment the bar starts narrowing.
    const collapseFadeStyle = useSearchSidebarCollapseFadeStyle();

    // Collapsed rows have nowhere to put a badge, so a row that has one shows the same green dot the Inbox uses.
    const resolvedStatusIndicatorColor = statusIndicatorColor ?? (isCollapsed && !!badgeText ? theme.iconSuccessFill : undefined);

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{selected: isSelected}}
            sentryLabel={sentryLabel}
            style={({hovered}) => [
                styles.flatNavigationBarItem,
                isSubItem && !isCollapsed && styles.flatNavigationBarSubItem,
                isSelected && !isSubItem && styles.navigationRowSelected,
                hovered && !isSelected && !isSubItem && styles.navigationRowHovered,
                additionalStyle,
            ]}
        >
            {({hovered}) => (
                <>
                    {!!icon && (
                        <View>
                            <Icon
                                src={icon}
                                fill={getIconFill(isSelected, hovered, theme)}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                            />
                            {!!resolvedStatusIndicatorColor && (
                                <View
                                    style={[
                                        styles.navigationTabBarStatusIndicator,
                                        styles.flatNavigationBarStatusIndicator,
                                        styles.statusIndicatorColor(resolvedStatusIndicatorColor),
                                        // The dot's stroke reads as a gap punched out of the row, so it has to track the row's background.
                                        getStatusIndicatorBorderStyle(isSelected, hovered, styles),
                                    ]}
                                />
                            )}
                        </View>
                    )}
                    {leftElement}
                    <Animated.View style={[styles.flex1, collapseFadeStyle]}>
                        <Text
                            numberOfLines={1}
                            style={[styles.flatNavigationBarLabel, !isSelected && styles.flatNavigationBarLabelRegular, {color: isSelected || hovered ? theme.text : theme.textSupporting}]}
                        >
                            {label}
                        </Text>
                    </Animated.View>
                    {!!badgeText && (
                        <Animated.View style={collapseFadeStyle}>
                            <Badge
                                text={badgeText}
                                // todoBadge is left off deliberately: it fixes a 28x24 box that would override condensed sizing.
                                badgeStyles={styles.ml0}
                                success
                                isCondensed
                            />
                        </Animated.View>
                    )}
                    {/* Hidden rather than unmounted, so the menu it opens survives the pointer leaving the row. */}
                    {!isCollapsed && !!hoverActionComponent && <View style={[styles.flatNavigationBarRowAction, !hovered && styles.opacity0]}>{hoverActionComponent}</View>}
                </>
            )}
        </PressableWithFeedback>
    );
}

export default FlatNavItem;
