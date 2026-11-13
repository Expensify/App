import Icon from '@components/Icon';
import getTabIconFill from '@components/Navigation/NavigationTabBar/getTabIconFill';
import {useSearchSidebarCollapseFadeStyle} from '@components/Navigation/SearchSidebarCollapseStore';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ColorValue} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import FlatNavMarqueeLabel from './FlatNavMarqueeLabel';

type FlatNavItemProps = {
    /** Translated row label */
    label: string;

    icon?: IconAsset;

    /** Draws what goes in place of the icon, e.g. the account avatar. Gets the row's current background, undefined when the row shows the bar's own. */
    renderLeftElement?: (rowState: {backgroundColor: ColorValue | undefined}) => React.ReactNode;

    /** Drawn after the label, at the row's end */
    rightElement?: React.ReactNode;

    isSelected: boolean;

    /** Draws the row taller than the destination rows, as the Account row is */
    isTall?: boolean;

    /** Dot drawn on the icon when the destination needs the user's attention */
    statusIndicatorColor?: string;

    /** Spoken name of the row, defaults to label */
    accessibilityLabel?: string;

    sentryLabel: SentryLabel;

    onPress: () => void;

    /** Called when the pointer moves onto the row */
    onHoverIn?: () => void;

    /** Called when the pointer leaves the row */
    onHoverOut?: () => void;

    /** Draws the row as a child of the group above it, indented against the group's shared rule */
    isSubItem?: boolean;

    /** Trims the rule above the first child so it starts inside the group rather than at the parent row */
    isFirstSubItem?: boolean;

    /** Trims the rule below the last child so it stops inside the group */
    isLastSubItem?: boolean;

    /** Scrolls a label too long for its row on hover, and names it in full in a tooltip. For rows the user named. */
    shouldShowTooltipWhenTruncated?: boolean;

    /** Control revealed at the row's end while it is hovered, such as a saved search's menu */
    hoverActionComponent?: React.ReactNode;

    /** Narrows the row to its icon, as the collapsed bar does. The label stays mounted and fades. */
    isCollapsed?: boolean;
};

/** Full-width row of the flat navigation bar: an icon or avatar, then the destination's label. */
function FlatNavItem({
    label,
    icon,
    renderLeftElement,
    rightElement,
    isSelected,
    isTall = false,
    statusIndicatorColor,
    accessibilityLabel,
    sentryLabel,
    onPress,
    onHoverIn,
    onHoverOut,
    isSubItem = false,
    isFirstSubItem = false,
    isLastSubItem = false,
    shouldShowTooltipWhenTruncated = false,
    hoverActionComponent,
    isCollapsed = false,
}: FlatNavItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();
    // The label stays mounted while the bar narrows, so it fades out rather than disappearing on the first frame.
    const collapseFadeStyle = useSearchSidebarCollapseFadeStyle();

    const getRowBackgroundStyle = (isHovered: boolean) => {
        if (isSelected) {
            return styles.hoveredComponentBG;
        }
        return isHovered ? styles.highlightBG : undefined;
    };

    return (
        <PressableWithFeedback
            onPress={onPress}
            role={CONST.ROLE.TAB}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityState={{selected: isSelected}}
            sentryLabel={sentryLabel}
            onHoverIn={onHoverIn}
            onHoverOut={onHoverOut}
            style={({hovered}) => [styles.flatNavigationBarItem, isTall && styles.flatNavigationBarAccountItem, isSubItem && styles.flatNavigationBarSubItem, getRowBackgroundStyle(hovered)]}
        >
            {({hovered}) => {
                const rowBackgroundColor = getRowBackgroundStyle(hovered)?.backgroundColor;
                return (
                    <>
                        {isSubItem && !isCollapsed && (
                            <View
                                style={[
                                    styles.flatNavigationBarSubItemRule,
                                    isFirstSubItem && styles.flatNavigationBarSubItemRuleFirst,
                                    isLastSubItem && styles.flatNavigationBarSubItemRuleLast,
                                ]}
                            />
                        )}
                        {!!icon && (
                            <View>
                                <Icon
                                    src={icon}
                                    fill={getTabIconFill(isSelected, hovered, theme)}
                                    width={variables.iconSizeNormal}
                                    height={variables.iconSizeNormal}
                                />
                                {!!statusIndicatorColor && (
                                    <View
                                        testID="FlatNavItemStatusIndicator"
                                        style={[
                                            styles.navigationTabBarStatusIndicator,
                                            styles.statusIndicatorColor(statusIndicatorColor),
                                            // The dot's stroke reads as a gap cut out of the row, so it takes the row's background.
                                            !!rowBackgroundColor && StyleUtils.getBorderColorStyle(rowBackgroundColor),
                                        ]}
                                    />
                                )}
                            </View>
                        )}
                        {renderLeftElement?.({backgroundColor: rowBackgroundColor})}
                        <Animated.View style={[styles.flex1, collapseFadeStyle]}>
                            {shouldShowTooltipWhenTruncated ? (
                                <FlatNavMarqueeLabel
                                    text={label}
                                    isHovered={hovered}
                                    style={[styles.flex1, !isSelected && styles.flatNavigationBarLabelRegular, {color: isSelected || hovered ? theme.text : theme.textSupporting}]}
                                />
                            ) : (
                                <Text
                                    variant={isSelected ? 'textStrong' : 'text'}
                                    color={isSelected || hovered ? theme.text : theme.textSupporting}
                                    numberOfLines={1}
                                >
                                    {label}
                                </Text>
                            )}
                        </Animated.View>
                        {!isCollapsed && !!hoverActionComponent && (
                            <View style={hovered ? styles.flatNavigationBarRowAction : styles.flatNavigationBarRowActionHidden}>{hoverActionComponent}</View>
                        )}
                        {!isCollapsed && rightElement}
                    </>
                );
            }}
        </PressableWithFeedback>
    );
}

export default FlatNavItem;
