import React, {useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import Badge from '@components/Badge';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useNetwork from '@hooks/useNetwork';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';
import {useTabSelectorActions} from './TabSelectorContext';
import type {TabSelectorItemProps as BaseTabSelectorItemProps} from './types';

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
    shouldShowProductTrainingTooltip = false,
    renderProductTrainingTooltip,
    equalWidth = false,
    badgeText,
    isDisabled = false,
    pendingAction,
}: TabSelectorItemProps) {
    const {isOffline} = useNetwork();

    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);
    const shouldShowEducationalTooltip = shouldShowProductTrainingTooltip && isActive;

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
                />
            )}
        </AnimatedPressableWithFeedback>
    );

    return shouldShowEducationalTooltip ? (
        <EducationalTooltip
            shouldRender
            renderTooltipContent={renderProductTrainingTooltip}
            shouldHideOnNavigate
            shouldHideOnScroll
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            wrapperStyle={[styles.productTrainingTooltipWrapper, styles.pAbsolute]}
            computeHorizontalShiftForNative
            minWidth={variables.minScanTooltipWidth}
        >
            {children}
        </EducationalTooltip>
    ) : (
        <Tooltip
            shouldRender={!shouldShowLabelWhenInactive && !isActive}
            text={title}
        >
            {children}
        </Tooltip>
    );
}

export default TabSelectorItem;
