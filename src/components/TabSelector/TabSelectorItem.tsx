import Badge from '@components/Badge';
import PressableWithSecondaryInteraction from '@components/PressableWithSecondaryInteraction';
import Tooltip from '@components/Tooltip';

import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';

import React, {useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

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
    isDisabled = false,
    disabledAction,
    pendingAction,
}: TabSelectorItemProps) {
    const {isOffline} = useNetwork();

    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);

    const {onTabLayout, scrollToTab} = useTabSelectorActions();

    const accessibilityState = {selected: isActive};

    const isOfflineWithPendingAction = !!isOffline && !!pendingAction;
    const shouldTextHaveStrikeThrough = isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    // PressableWithSecondaryInteraction handles the web `contextmenu` (right-click) event directly and does not respect the
    // pressable's `disabled` prop, so gate the secondary interaction ourselves to match the primary press behavior below.
    const isPressableDisabled = !disabledAction && isDisabled;

    const children = (
        <AnimatedPressableWithSecondaryInteraction
            ref={tabRef}
            accessibilityLabel={title}
            accessibilityState={accessibilityState}
            accessibilityRole={CONST.ROLE.TAB}
            style={[
                styles.tabSelectorButton,
                styles.tabBackground(isHovered, isActive, isDisabled, backgroundColor),
                styles.userSelectNone,
                isOfflineWithPendingAction ? styles.offlineFeedbackPending : undefined,
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
            role={CONST.ROLE.TAB}
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
            {!!badgeText && (
                <Badge
                    text={badgeText}
                    success
                    isCondensed={isBadgeCondensed}
                    badgeStyles={badgeStyles}
                />
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
