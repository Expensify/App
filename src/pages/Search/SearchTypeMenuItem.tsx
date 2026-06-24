import React, {useEffect} from 'react';
import {View} from 'react-native';
import type {GestureResponderEvent} from 'react-native';
import Animated, {Easing, useAnimatedStyle, useSharedValue, withTiming} from 'react-native-reanimated';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS, useSearchSidebarCollapse, useSearchSidebarCollapseFadeStyle} from '@components/Navigation/SearchSidebarCollapseStore';
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
    onPress: (event?: GestureResponderEvent | KeyboardEvent) => void | Promise<void>;
};

const COLLAPSED_BADGE_INITIAL_SCALE = 0.5;
const COLLAPSED_BADGE_EXIT_DURATION_MS = 90;

/**
 * Menu item row for Search type menu
 */
function SearchTypeMenuItem({title, icon, badgeText, focused = false, onPress}: SearchTypeMenuItemProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {isVisuallyCollapsed} = useSearchSidebarCollapse();
    const labelAnimatedStyle = useSearchSidebarCollapseFadeStyle();
    const inlineBadgeAnimatedStyle = useSearchSidebarCollapseFadeStyle();
    const collapsedBadgeProgress = useSharedValue(isVisuallyCollapsed ? 1 : 0);

    useEffect(() => {
        collapsedBadgeProgress.set(
            withTiming(isVisuallyCollapsed ? 1 : 0, {
                duration: isVisuallyCollapsed ? SEARCH_SIDEBAR_COLLAPSE_ANIMATION_DURATION_MS : COLLAPSED_BADGE_EXIT_DURATION_MS,
                easing: Easing.out(Easing.cubic),
            }),
        );
    }, [collapsedBadgeProgress, isVisuallyCollapsed]);

    const collapsedBadgeAnimatedStyle = useAnimatedStyle(() => {
        const progress = collapsedBadgeProgress.get();
        return {
            opacity: progress,
            transform: [{scale: COLLAPSED_BADGE_INITIAL_SCALE + (1 - COLLAPSED_BADGE_INITIAL_SCALE) * progress}],
        };
    });

    const pressable = (
        <PressableWithoutFeedback
            onPress={onPress}
            onHoverIn={isVisuallyCollapsed ? () => TooltipSense.activate() : undefined}
            accessibilityLabel={title}
            accessibilityState={{selected: focused}}
            role={CONST.ROLE.TAB}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.TYPE_MENU_ITEM}
            style={({hovered, pressed}) => [
                styles.flexRow,
                styles.sectionMenuItem(shouldUseNarrowLayout),
                styles.searchTypeMenuItemPadding,
                StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || hovered, pressed, false, false, true), true),
                hovered && !focused && !pressed && styles.hoveredComponentBG,
            ]}
        >
            {({hovered, pressed}) => (
                <>
                    {icon != null && (
                        <View style={[styles.popoverMenuIcon, styles.wAuto, styles.pRelative]}>
                            <Icon
                                src={icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                                fill={StyleUtils.getIconFillColor(getButtonState(focused || hovered, pressed, false, false, true), true, true)}
                            />
                            {!!badgeText && (
                                <Animated.View
                                    style={[styles.searchTypeMenuCollapsedBadge, collapsedBadgeAnimatedStyle]}
                                    pointerEvents="none"
                                >
                                    <Badge
                                        text={badgeText}
                                        badgeStyles={styles.ml0}
                                        success
                                        isCondensed
                                    />
                                </Animated.View>
                            )}
                        </View>
                    )}
                    <Animated.View style={[styles.justifyContentCenter, styles.flex1, styles.ml3, labelAnimatedStyle]}>
                        <Text
                            style={[styles.popoverMenuText, styles.textStrong]}
                            numberOfLines={1}
                        >
                            {title}
                        </Text>
                    </Animated.View>
                    {!!badgeText && (
                        <Animated.View style={[styles.searchTypeMenuAccessoryBox, inlineBadgeAnimatedStyle]}>
                            <Badge
                                text={badgeText}
                                badgeStyles={[styles.todoBadge, styles.ml0]}
                                success
                            />
                        </Animated.View>
                    )}
                </>
            )}
        </PressableWithoutFeedback>
    );

    if (isVisuallyCollapsed) {
        return <Tooltip text={title}>{pressable}</Tooltip>;
    }

    return pressable;
}

export default SearchTypeMenuItem;
