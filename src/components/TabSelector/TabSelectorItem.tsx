import React, {useLayoutEffect, useRef, useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import type {View} from 'react-native';
import PressableWithFeedback from '@components/Pressable/PressableWithFeedback';
import Tooltip from '@components/Tooltip';
import EducationalTooltip from '@components/Tooltip/EducationalTooltip';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import CONST from '@src/CONST';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';
import type {TabSelectorItemProps as BaseTabSelectorItemProps} from './types';

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

type TabSelectorItemProps = BaseTabSelectorItemProps & {
    /** Parent horizontal location, for computing tooltip placement */
    parentX?: number;

    /** Parent width, for computing tooltip placement */
    parentWidth?: number;
};

function TabSelectorItem({
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
    parentX = 0,
    parentWidth = 0,
    equalWidth = false,
}: TabSelectorItemProps) {
    const styles = useThemeStyles();
    const [isHovered, setIsHovered] = useState(false);
    const childRef = useRef<View | null>(null);
    const shouldShowEducationalTooltip = shouldShowProductTrainingTooltip && isActive;
    // Store only the measured value from mobile measurement
    const [measuredShift, setMeasuredShift] = useState(0);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Derive effective shift: 0 on desktop, measured value on mobile
    const shiftHorizontal = isActive && !isSmallScreenWidth ? 0 : measuredShift;

    useLayoutEffect(() => {
        if (!isActive || !isSmallScreenWidth) {
            return;
        }

        const timerID = setTimeout(() => {
            childRef.current?.measureInWindow((x, _y, width) => {
                const parentCenter = parentX + parentWidth / 2;
                const currentCenter = x + width / 2;
                setMeasuredShift(parentCenter - currentCenter);
            });
        }, CONST.TOOLTIP_ANIMATION_DURATION);
        return () => {
            clearTimeout(timerID);
        };
    }, [isActive, isSmallScreenWidth, parentX, parentWidth]);

    const accessibilityState = {selected: isActive};

    const children = (
        <AnimatedPressableWithFeedback
            accessibilityLabel={title}
            accessibilityState={accessibilityState}
            accessibilityRole={CONST.ROLE.TAB}
            style={[styles.tabSelectorButton, styles.tabBackground(isHovered, isActive, backgroundColor), styles.userSelectNone]}
            wrapperStyle={[equalWidth ? styles.flex1 : styles.flexGrow1]}
            onPress={onPress}
            onHoverIn={() => setIsHovered(true)}
            onHoverOut={() => setIsHovered(false)}
            role={CONST.ROLE.TAB}
            dataSet={{[CONST.SELECTION_SCRAPER_HIDDEN_ELEMENT]: true}}
            testID={testID}
            sentryLabel={sentryLabel}
            ref={childRef}
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
            anchorAlignment={{
                horizontal: CONST.MODAL.ANCHOR_ORIGIN_HORIZONTAL.CENTER,
                vertical: CONST.MODAL.ANCHOR_ORIGIN_VERTICAL.TOP,
            }}
            wrapperStyle={[styles.productTrainingTooltipWrapper, styles.pAbsolute]}
            computeHorizontalShiftForNative
            shiftHorizontal={shiftHorizontal}
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
