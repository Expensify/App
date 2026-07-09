import Badge from '@components/Badge';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
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

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

type TabSelectorItemProps = BaseTabSelectorItemProps;

function TabSelectorItem({
    tabKey,
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
    pendingAction,
}: TabSelectorItemProps) {
    const {isOffline} = useNetwork();

    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);

    const {onTabLayout, scrollToTab} = useTabSelectorActions();

    const accessibilityState = {selected: isActive};

    const isOfflineWithPendingAction = !!isOffline && !!pendingAction;
    const shouldTextHaveStrikeThrough = isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    const children = (
        <AnimatedPressableWithFeedback
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
            onLongPress={onLongPress}
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
            disabled={isDisabled}
            shouldUseSingleExecution={false}
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
        </AnimatedPressableWithFeedback>
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
