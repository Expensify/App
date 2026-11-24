import Badge from '@components/Badge';
import Icon from '@components/Icon';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';

import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
import useNetwork from '@hooks/useNetwork';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import getGroupItemAccessibilityLabel from '@libs/Accessibility/getGroupItemAccessibilityLabel';

import CONST from '@src/CONST';

import React, {useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, View} from 'react-native';

import type {TabSelectorItemProps as BaseTabSelectorItemProps} from './types';

import TabIcon from './TabIcon';
import TabLabel from './TabLabel';
import {useTabSelectorActions} from './TabSelectorContext';

// Use PressableWithSecondaryInteraction so the tab responds to both a long-press (touch) and a
// right-click / context-menu (web). PressableWithFeedback's onLongPress alone never fires on a
// right-click, so the desktop-web menu could not be opened.
const AnimatedPressableWithSecondaryInteraction = Animated.createAnimatedComponent(PressableWithSecondaryInteraction);

type TabSelectorItemProps = BaseTabSelectorItemProps;

function TabSelectorItem({
    tabKey,
    tabRef,
    icon,
    title = '',
    onPress = () => {},
    onLongPress,
    backgroundColor = '',
    activeOpacity = 0,
    inactiveOpacity = 1,
    isActive = false,
    shouldShowLabelWhenInactive = true,
    testID,
    sentryLabel,
    equalWidth = false,
    badgeText,
    isBadgeCondensed = false,
    badgeStyles,
    isBadgeError = false,
    shouldShowRedDotIndicator = false,
    isDisabled = false,
    disabledAction,
    pendingAction,
    badgeEducationalTooltipProps,
    tabButtonStyles,
    role = CONST.ROLE.TAB,
    groupAccessibilityLabel,
}: TabSelectorItemProps) {
    const {isOffline} = useNetwork();
    const {translate} = useLocalize();

    const styles = useThemeStyles();
    const theme = useTheme();
    const icons = useMemoizedLazyExpensifyIcons(['DotIndicator']);
    const [isHovered, setIsHovered] = useState(false);

    const {onTabLayout, scrollToTab} = useTabSelectorActions();

    const accessibilityState = role === CONST.ROLE.RADIO ? {checked: isActive} : {selected: isActive};

    const isOfflineWithPendingAction = !!isOffline && !!pendingAction;
    const shouldTextHaveStrikeThrough = isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    // PressableWithSecondaryInteraction handles the web `contextmenu` (right-click) event directly and does not respect the
    // pressable's `disabled` prop, so gate the secondary interaction ourselves to match the primary press behavior below.
    const isPressableDisabled = !disabledAction && isDisabled;
    const tabAccessibilityTitle = shouldShowRedDotIndicator ? `${title}. ${translate('common.yourReviewIsRequired')}` : title;

    const children = (
        <AnimatedPressableWithSecondaryInteraction
            ref={tabRef}
            accessibilityLabel={getGroupItemAccessibilityLabel(tabAccessibilityTitle, groupAccessibilityLabel)}
            accessibilityState={accessibilityState}
            accessibilityRole={role}
            style={[
                styles.tabSelectorButton,
                styles.tabBackground(isHovered, isActive, isDisabled, backgroundColor),
                styles.userSelectNone,
                isOfflineWithPendingAction ? styles.offlineFeedbackPending : undefined,
                tabButtonStyles,
            ]}
            wrapperStyle={equalWidth ? styles.flex1 : styles.flexGrow1}
            onSecondaryInteraction={isPressableDisabled ? undefined : onLongPress}
            onPress={() => {
                scrollToTab(tabKey);
                onPress();
            }}
            onWrapperLayout={(event) => onTabLayout(tabKey, event)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            role={role}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            testID={testID}
            sentryLabel={sentryLabel}
            disabled={isPressableDisabled}
        >
            <TabIcon
                icon={icon}
                activeOpacity={styles.tabOpacity(isDisabled, isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                inactiveOpacity={styles.tabOpacity(isDisabled, isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
            />
            {(shouldShowLabelWhenInactive || isActive) && (
                <TabLabel
                    textStyle={shouldTextHaveStrikeThrough ? styles.offlineFeedbackDeleted : undefined}
                    title={title}
                    activeOpacity={styles.tabOpacity(isDisabled, isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                    inactiveOpacity={styles.tabOpacity(isDisabled, isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
                    hasIcon={!!icon}
                />
            )}
            {shouldShowRedDotIndicator && (
                <Icon
                    src={icons.DotIndicator}
                    fill={theme.danger}
                    size={CONST.ICON_SIZE.EXTRA_SMALL}
                    additionalStyles={styles.ml2}
                    accessibilityLabel={CONST.ACCESSIBILITY_LABELS.ERROR}
                />
            )}
            {!!badgeText && (
                <EducationalTooltip {...badgeEducationalTooltipProps}>
                    <View style={styles.ml2}>
                        <Badge
                            text={badgeText}
                            success={!isBadgeError}
                            error={isBadgeError}
                            isCondensed={isBadgeCondensed}
                            badgeStyles={[badgeStyles, styles.ml0]}
                        />
                    </View>
                </EducationalTooltip>
            )}
        </AnimatedPressableWithSecondaryInteraction>
    );

    return (
        <Tooltip
            shouldRender={!shouldShowLabelWhenInactive && !isActive}
            text={title}
        >
            {children}
        </Tooltip>
    );
}

export default TabSelectorItem;
