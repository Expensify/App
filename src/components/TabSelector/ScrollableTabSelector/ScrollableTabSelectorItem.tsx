import React, {useContext, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import type {View} from 'react-native';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import Badge from '@components/Badge';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import TabIcon from '@components/TabSelector/TabIcon';
import TabLabel from '@components/TabSelector/TabLabel';
import type {TabSelectorItemProps} from '@components/TabSelector/types';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {ScrollableTabSelectorContext} from './ScrollableTabSelectorContext';

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

type ScrollableTabSelectorItemProps = TabSelectorItemProps & {tabKey: string};

function ScrollableTabSelectorItem({
    icon,
    tabKey,
    title = '',
    onPress = () => {},
    onLongPress,
    backgroundColor = '',
    activeOpacity = 0,
    inactiveOpacity = 1,
    isActive = false,
    shouldShowLabelWhenInactive = true,
    testID,
    equalWidth = false,
    sentryLabel,
    badgeText,
    disabled = false,
    pendingAction,
}: ScrollableTabSelectorItemProps) {
    const {isOffline} = useNetwork();

    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);

    const {onTabLayout, registerTab, scrollToTab} = useContext(ScrollableTabSelectorContext);

    const isOfflinePendingAction = !!isOffline && !!pendingAction;
    const needsStrikeThrough = isOffline && pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;

    return (
        <AnimatedPressableWithFeedback
            ref={(ref: HTMLDivElement | View | null) => registerTab(tabKey, ref)}
            accessibilityLabel={title}
            accessibilityState={{selected: isActive}}
            accessibilityRole={CONST.ROLE.TAB}
            sentryLabel={sentryLabel}
            style={[styles.tabSelectorButton, styles.tabBackground(isHovered, isActive, disabled, backgroundColor), styles.userSelectNone]}
            wrapperStyle={[equalWidth ? styles.flex1 : styles.flexGrow1, isOfflinePendingAction && styles.offlineFeedbackPending]}
            onPress={() => {
                scrollToTab(tabKey);
                onPress();
            }}
            onLongPress={onLongPress}
            onWrapperLayout={(event) => onTabLayout(tabKey, event)}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            role={CONST.ROLE.TAB}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            testID={testID}
            disabled={disabled}
        >
            <TabIcon
                icon={icon}
                activeOpacity={styles.tabOpacity(disabled, isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                inactiveOpacity={styles.tabOpacity(disabled, isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
            />
            {(shouldShowLabelWhenInactive || isActive) && (
                <TabLabel
                    textStyle={needsStrikeThrough && styles.offlineFeedbackDeleted}
                    title={title}
                    activeOpacity={styles.tabOpacity(disabled, isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                    inactiveOpacity={styles.tabOpacity(disabled, isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
                    hasIcon={!!icon}
                />
            )}
            {!!badgeText && (
                <Badge
                    text={badgeText}
                    success
                />
            )}
        </AnimatedPressableWithFeedback>
    );
}

export default ScrollableTabSelectorItem;
