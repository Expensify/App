import React, {useLayoutEffect, useMemo, useRef, useState} from 'react';
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
import type IconAsset from '@src/types/utils/IconAsset';
import TabIcon from './TabIcon';
import TabLabel from './TabLabel';

const AnimatedPressableWithFeedback = Animated.createAnimatedComponent(PressableWithFeedback);

type TabSelectorItemProps = {
    /** Function to call when onPress */
    onPress?: () => void;

    /** Icon to display on tab */
    icon?: IconAsset;

    /** Title of the tab */
    title?: string;

    /** Animated background color value for the tab button */
    backgroundColor?: string | Animated.AnimatedInterpolation<string>;

    /** Animated opacity value while the tab is in inactive state */
    inactiveOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Animated opacity value while the tab is in active state */
    activeOpacity?: number | Animated.AnimatedInterpolation<number>;

    /** Whether this tab is active */
    isActive?: boolean;

    /** Whether to show the label when the tab is inactive */
    shouldShowLabelWhenInactive?: boolean;

    /** Test identifier used to find elements in unit and e2e tests */
    testID?: string;

    /** Determines whether the product training tooltip should be displayed to the user. */
    shouldShowProductTrainingTooltip?: boolean;

    /** Function to render the content of the product training tooltip. */
    renderProductTrainingTooltip?: () => React.JSX.Element;

    /** Parent horizontal location, for computing tooltip placement */
    parentX?: number;

    /** Parent width, for computing tooltip placement */
    parentWidth?: number;

    /** Whether tabs should have equal width */
    equalWidth?: boolean;
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
    const [shiftHorizontal, setShiftHorizontal] = useState(0);
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    // Compute horizontal shift for EducationalTooltip:
    //  - on desktop, ignore RHP bounds and center tooltip on the tab (no shift needed)
    //  - on mobile (aka small screen) center tooltip within the panel
    useLayoutEffect(() => {
        // only active tab gets tooltip
        if (!isActive) {
            return;
        }

        if (!isSmallScreenWidth) {
            // no shift needed on desktop (note: not "shouldUseNarrowLayout")
            setShiftHorizontal(0);
            return;
        }

        // must allow animation to complete before taking measurement
        const timerID = setTimeout(() => {
            childRef.current?.measureInWindow((x, _y, width) => {
                // To center tooltip in parent:
                const parentCenter = parentX + parentWidth / 2; // ... where it should be...
                const currentCenter = x + width / 2; // ... minus where it is now...
                setShiftHorizontal(parentCenter - currentCenter); // ...equals the shift needed
            });
        }, CONST.TOOLTIP_ANIMATION_DURATION);
        return () => {
            clearTimeout(timerID);
        };
    }, [isActive, childRef, isSmallScreenWidth, parentX, parentWidth]);

    const accessibilityState = useMemo(() => ({selected: isActive}), [isActive]);

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
