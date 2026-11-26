import Badge from '@components/Badge';
import Icon from '@components/Icon';
import getTabIconFill from '@components/Navigation/NavigationTabBar/getTabIconFill';
import {getCollapseFadeStyle} from '@components/Navigation/SearchSidebarCollapseStore';
import {PressableWithFeedback} from '@components/Pressable';
import type {PressableRef} from '@components/Pressable/GenericPressable/types';
import Text from '@components/Text';

import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import type IconAsset from '@src/types/utils/IconAsset';
import type {SentryLabel} from '@src/types/utils/SentryLabel';

import type {ColorValue, Role} from 'react-native';

import React from 'react';
import {View} from 'react-native';
import Animated from 'react-native-reanimated';

import FlatNavMarqueeLabel from './FlatNavMarqueeLabel';
import FlatNavRowActionBackdrop from './FlatNavRowActionBackdrop';

type FlatNavItemProps = {
    /** Lets the row be measured, e.g. to anchor a popover it opens */
    ref?: PressableRef;

    /** Translated row label */
    label: string;

    icon?: IconAsset;

    /** Draws what goes in place of the icon, e.g. the account avatar. Gets the row's current background, undefined when the row shows the bar's own. */
    renderLeftElement?: (rowState: {backgroundColor: ColorValue | undefined}) => React.ReactNode;

    /** Drawn after the label, at the row's end */
    rightElement?: React.ReactNode;

    isSelected: boolean;

    /** Role of the row, a tab unless it does something else, like opening a popover */
    role?: Role;

    /** Whether the popover the row opens is showing. Leave it out for a row that does not open one. */
    isExpanded?: boolean;

    /** Whether the row keeps only its icon, so the bar can narrow to an icon rail */
    isCollapsed?: boolean;

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

    /** Draws the row taller than the destination rows, as the Account row is */
    isTall?: boolean;

    /** Dot drawn on the icon when the destination needs the user's attention */
    statusIndicatorColor?: string;

    /** Count shown at the row's end, such as the reports waiting on the user */
    badgeText?: string;

    /** Whether a collapsed row stands in for its badge with a dot, since a narrow row has nowhere to put a count */
    hasCollapsedStatusIndicator?: boolean;

    /** Spoken name of the row, defaults to label */
    accessibilityLabel?: string;

    sentryLabel: SentryLabel;

    onPress: () => void;

    /** Route of the destination, so the row can be opened in a new browser tab */
    linkRoute?: Route;

    /** Called when the pointer moves onto the row */
    onHoverIn?: () => void;

    /** Called when the pointer leaves the row */
    onHoverOut?: () => void;
};

/** Full-width row of the flat navigation bar: an icon or avatar, then the destination's label. */
function FlatNavItem({
    ref,
    label,
    icon,
    renderLeftElement,
    rightElement,
    isSelected,
    role = CONST.ROLE.TAB,
    isExpanded,
    isCollapsed = false,
    isSubItem = false,
    isFirstSubItem = false,
    isLastSubItem = false,
    shouldShowTooltipWhenTruncated = false,
    hoverActionComponent,
    isTall = false,
    statusIndicatorColor,
    badgeText,
    hasCollapsedStatusIndicator = false,
    accessibilityLabel,
    sentryLabel,
    onPress,
    linkRoute,
    onHoverIn,
    onHoverOut,
}: FlatNavItemProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const StyleUtils = useStyleUtils();

    const getRowBackgroundStyle = (isHovered: boolean) => {
        if (isSelected) {
            return styles.hoveredComponentBG;
        }
        return isHovered ? styles.highlightBG : undefined;
    };

    // The label stays mounted and fades, rather than disappearing the moment the bar starts narrowing.
    const collapseFadeStyle = getCollapseFadeStyle(isCollapsed);

    // A collapsed row has nowhere to put a badge, so it shows the same green dot the Inbox row uses.
    const resolvedStatusIndicatorColor = statusIndicatorColor ?? (isCollapsed && hasCollapsedStatusIndicator ? theme.iconSuccessFill : undefined);

    return (
        <PressableWithFeedback
            ref={ref}
            onPress={onPress}
            linkRoute={linkRoute}
            role={role}
            accessibilityLabel={accessibilityLabel ?? label}
            accessibilityHasPopup={isExpanded === undefined ? undefined : 'dialog'}
            accessibilityState={isExpanded === undefined ? {selected: isSelected} : {expanded: isExpanded}}
            sentryLabel={sentryLabel}
            onHoverIn={onHoverIn}
            onHoverOut={onHoverOut}
            style={({hovered}) => [
                styles.flatNavigationBarItem,
                isTall && styles.flatNavigationBarAccountItem,
                // A child row is marked by the marker on the group's rule, so it takes no background of its own.
                !isSubItem && getRowBackgroundStyle(hovered),
                isSubItem && !isCollapsed && styles.flatNavigationBarSubItem,
            ]}
        >
            {({hovered}) => {
                const rowBackgroundColor = isSubItem ? undefined : getRowBackgroundStyle(hovered)?.backgroundColor;
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
                                {!!resolvedStatusIndicatorColor && (
                                    <View
                                        testID="FlatNavItemStatusIndicator"
                                        style={[
                                            styles.navigationTabBarStatusIndicator,
                                            styles.statusIndicatorColor(resolvedStatusIndicatorColor),
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
                        {!!badgeText && !isCollapsed && (
                            <Animated.View style={collapseFadeStyle}>
                                <Badge
                                    text={badgeText}
                                    // todoBadge fixes a 28x24 box, which would override the condensed sizing this row needs.
                                    badgeStyles={styles.ml0}
                                    success
                                    isCondensed
                                />
                            </Animated.View>
                        )}
                        {/* Hidden rather than unmounted, so the menu it opens survives the pointer leaving the row. */}
                        {!isCollapsed && !!hoverActionComponent && (
                            <View style={[styles.flatNavigationBarRowAction, !hovered && styles.flatNavigationBarRowActionHidden]}>
                                <FlatNavRowActionBackdrop />
                                {hoverActionComponent}
                            </View>
                        )}
                        {rightElement}
                    </>
                );
            }}
        </PressableWithFeedback>
    );
}

export default FlatNavItem;
