import React, {useEffect} from 'react';
import {View} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {collapseProgress, peekProgress, useSearchSidebarCollapse} from '@components/Navigation/SearchSidebarCollapseStore';
import PressableWithoutFeedback from '@components/Pressable/PressableWithoutFeedback';
import Text from '@components/Text';
import Tooltip from '@components/Tooltip';
import TooltipSense from '@components/Tooltip/TooltipSense';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getButtonState from '@libs/getButtonState';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';

type SearchTypeMenuItemProps = {
    /** Translated title */
    title: string;

    /** Icon component or asset */
    icon: IconAsset | undefined;

    /** Optional badge text (e.g. count) */
    badgeText?: string;

    /** Whether the item is focused (keyboard nav) */
    focused?: boolean;

    /** Press handler */
    onPress: () => void;
};

/**
 * Menu item row for Search type menu
 */
function SearchTypeMenuItem({title, icon, badgeText, focused = false, onPress}: SearchTypeMenuItemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();

    const labelAnimatedStyle = useAnimatedStyle(() => {
        const visualExpansion = 1 - collapseProgress.get() * (1 - peekProgress.get());
        return {
            opacity: visualExpansion,
            transform: [{translateX: -8 * (1 - visualExpansion)}],
        };
    });

    const collapsedBadgeProgress = useSharedValue(isVisuallyCollapsed ? 1 : 0);

    useEffect(() => {
        collapsedBadgeProgress.set(
            withTiming(isVisuallyCollapsed ? 1 : 0, {
                duration: isVisuallyCollapsed ? 220 : 90,
                easing: Easing.out(Easing.cubic),
            }),
        );
    }, [isVisuallyCollapsed, collapsedBadgeProgress]);

    const collapsedBadgeAnimatedStyle = useAnimatedStyle(() => {
        const progress = collapsedBadgeProgress.get();
        return {
            opacity: progress,
            transform: [{scale: 0.85 + 0.15 * progress}],
        };
    });

    const content = (
        <PressableWithoutFeedback
            onPress={onPress}
            accessibilityLabel={title}
            accessibilityState={{selected: focused}}
            role={CONST.ROLE.TAB}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_ITEM}
            style={({hovered, pressed}) => [
                styles.flexRow,
                styles.sectionMenuItem(shouldUseNarrowLayout),
                StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || hovered, pressed, false, false, true), true),
                hovered && !focused && !pressed && styles.hoveredComponentBG,
            ]}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.flex1, styles.gap3]}>
                <View style={styles.searchTypeMenuIconContainer}>
                    <Icon
                        src={icon}
                        width={variables.iconSizeNormal}
                        height={variables.iconSizeNormal}
                        fill={focused ? styles.textBlue.color : styles.textSupporting.color}
                    />
                    {/* Collapsed badge — anchored to icon */}
                    {!!badgeText && (
                        <Animated.View
                            style={[
                                {
                                    position: 'absolute',
                                    top: -6,
                                    right: -8,
                                    zIndex: 1,
                                },
                                collapsedBadgeAnimatedStyle,
                            ]}
                        >
                            <Badge
                                text={badgeText}
                                badgeStyles={styles.searchTypeMenuItemBadge}
                            />
                        </Animated.View>
                    )}
                </View>
                {/* Label and trailing badge — animated out when collapsed */}
                <Animated.View style={[styles.flex1, styles.flexRow, styles.gap2, styles.alignItemsCenter, labelAnimatedStyle]}>
                    <Text
                        numberOfLines={1}
                        style={[styles.textMicroBold, focused ? styles.textBlue : styles.textSupporting]}
                    >
                        {title}
                    </Text>
                    {!!badgeText && (
                        <Badge
                            text={badgeText}
                            badgeStyles={styles.searchTypeMenuItemBadge}
                        />
                    )}
                </Animated.View>
            </View>
        </PressableWithoutFeedback>
    );

    if (isVisuallyCollapsed) {
        return (
            <Tooltip text={title}>
                <View
                    onMouseEnter={() => TooltipSense.activate()}
                    onMouseLeave={() => TooltipSense.deactivate()}
                >
                    {content}
                </View>
            </Tooltip>
        );
    }

    return content;
}

export default SearchTypeMenuItem;
