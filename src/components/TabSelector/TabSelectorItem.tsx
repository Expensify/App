import React, {useContext, useMemo, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import type {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';
import {TabSelectorContext} from './TabSelectorContext';
import type {TabSelectorItemProps as BaseTabSelectorItemProps} from './types';

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

type TabSelectorItemProps = BaseTabSelectorItemProps;

function TabSelectorItem({
    tabKey,
    icon,
    title = '',
    onPress = () => {},
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
}: TabSelectorItemProps) {
    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);
    const shouldShowEducationalTooltip = shouldShowProductTrainingTooltip && isActive;

    const {onTabLayout, registerTab, scrollToTab} = useContext(TabSelectorContext);

    const accessibilityState = useMemo(() => ({selected: isActive}), [isActive]);

    const children = (
        <AnimatedPressableWithFeedback
            ref={(ref: HTMLDivElement | View | null) => registerTab(tabKey, ref)}
            accessibilityLabel={title}
            accessibilityState={accessibilityState}
            accessibilityRole={CONST.ROLE.TAB}
            style={[styles.tabSelectorButton, styles.tabBackground(isHovered, isActive, backgroundColor), styles.userSelectNone]}
            wrapperStyle={[equalWidth ? styles.flex1 : styles.flexGrow1]}
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
        >
            <TabIcon
                icon={icon}
                activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
            />
            {(shouldShowLabelWhenInactive || isActive) && (
                <TabLabel
                    title={title}
                    activeOpacity={styles.tabOpacity(isHovered, isActive, activeOpacity, inactiveOpacity).opacity}
                    inactiveOpacity={styles.tabOpacity(isHovered, isActive, inactiveOpacity, activeOpacity).opacity}
                    hasIcon={!!icon}
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
