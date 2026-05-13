import React from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import Badge from '@components/Badge';
import Icon from '@components/Icon';
import {collapseProgress, peekProgress, useSidebarCollapse} from '@components/Navigation/SidebarCollapseStore';
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
    const {isVisuallyCollapsed} = useSidebarCollapse();

    const labelAnimatedStyle = useAnimatedStyle(() => {
        const visualExpansion = 1 - collapseProgress.get() * (1 - peekProgress.get());
        return {
            opacity: visualExpansion,
            transform: [{translateX: -8 * (1 - visualExpansion)}],
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
                StyleUtils.getButtonBackgroundColorStyle(getButtonState(focused || hovered, pressed, false, false, true), true),
                hovered && !focused && !pressed && styles.hoveredComponentBG,
            ]}
        >
            {({hovered, pressed}) => (
                <>
                    {icon != null && (
                        <View style={[styles.popoverMenuIcon, styles.wAuto]}>
                            <Icon
                                src={icon}
                                width={variables.iconSizeNormal}
                                height={variables.iconSizeNormal}
                                fill={StyleUtils.getIconFillColor(getButtonState(focused || hovered, pressed, false, false, true), true, true)}
                            />
                        </View>
                    )}
                    {!isVisuallyCollapsed && (
                        <Animated.View style={[styles.justifyContentCenter, styles.flex1, styles.ml3, labelAnimatedStyle]}>
                            <Text
                                style={[styles.popoverMenuText, styles.textStrong]}
                                numberOfLines={1}
                            >
                                {title}
                            </Text>
                        </Animated.View>
                    )}
                    {!isVisuallyCollapsed && !!badgeText && (
                        <Animated.View style={labelAnimatedStyle}>
                            <Badge
                                text={badgeText}
                                badgeStyles={styles.todoBadge}
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
