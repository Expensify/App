import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks';
import {pinChartTooltip, unpinChartTooltip} from '@components/Charts/utils/pinnedChartTooltip';
import Text from '@components/Text';

import useSafeAreaInsets from '@hooks/useSafeAreaInsets';
import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import PopoverWithMeasuredContentUtils from '@libs/PopoverWithMeasuredContentUtils';

import variables from '@styles/variables';

import type {ReactNode} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import type {DerivedValue, SharedValue} from 'react-native-reanimated';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useEffectEvent, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import ChartTooltipAnchor from './ChartTooltipAnchor';
import ChartTooltipPortal from './ChartTooltipPortal';

type ChartTooltipProps = {
    /** Label text (e.g., "Airfare", "Amazon") */
    label: string;

    /** Shown under the label, like ChartTooltipSummary */
    children: ReactNode;

    /** The width of the chart container as displayed in the window */
    chartWidth: number;

    initialTooltipPosition: SharedValue<{x: number; y: number}>;

    /** Whether the tooltip should be shown, treated as always shown when omitted */
    isVisible?: DerivedValue<boolean>;

    /** Whether the rendered content belongs to the current target, so the old content is never drawn at the new position */
    isContentCurrent?: DerivedValue<boolean>;

    /** Updates the hovered point after the chart is moved in the window (e.g. via scroll) by the given offset */
    onChartMoved?: (deltaX: number, deltaY: number) => void;

    /** Hides the tooltip */
    onDismiss: () => void;

    /** Identifies the item the content belongs to, so the content is mounted again and laid out on each change of the item */
    contentKey?: number;

    /** Called once the content is laid out, which is the first moment it is on screen on native */
    onContentLayout?: () => void;
};

function ChartTooltip({label, children, chartWidth, initialTooltipPosition, isVisible, isContentCurrent, onChartMoved, onDismiss, contentKey, onContentLayout}: ChartTooltipProps) {
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();
    const {top: safeAreaTop, bottom: safeAreaBottom} = useSafeAreaInsets();

    /** Shared value to store the measured width of the tooltip container */
    const tooltipMeasuredWidth = useSharedValue(0);

    /** Shared value to store the measured height of the tooltip container */
    const tooltipMeasuredHeight = useSharedValue(0);

    /** Window position of the chart's top-left corner, since the tooltip is drawn in a portal in window coordinates */
    const origin = useSharedValue({x: 0, y: 0});

    /** False until the origin is measured for the current showing, so the tooltip is never drawn at a stale position */
    const isOriginMeasured = useSharedValue(false);

    /** JS mirror of isVisible, which turns the anchor's position tracking on and off */
    const [isShown, setIsShown] = useState(false);

    // The size is set before the content is reported as laid out, so the tooltip is never revealed with the previous content's size
    const handleContentLayout = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        if (width <= 0) {
            return;
        }
        tooltipMeasuredWidth.set(width);
        tooltipMeasuredHeight.set(height);
        onContentLayout?.();
    };

    useAnimatedReaction(
        () => isVisible?.get() ?? true,
        (isCurrentlyShown, wasShown) => {
            if (isCurrentlyShown === wasShown) {
                return;
            }
            if (!isCurrentlyShown) {
                isOriginMeasured.set(false);
            }
            scheduleOnRN(setIsShown, isCurrentlyShown);
        },
    );

    const isFocused = useIsFocused();

    // The tooltip is hidden when the screen loses focus or when the screen is touched
    useEffect(() => {
        if (!isShown) {
            return;
        }

        if (!isFocused) {
            onDismiss();
            return;
        }
        pinChartTooltip(onDismiss);
        return () => unpinChartTooltip(onDismiss);
    }, [isShown, isFocused, onDismiss]);

    const dismissOnWindowResize = useEffectEvent(() => {
        if (!isShown) {
            return;
        }
        onDismiss();
    });

    // The tooltip is hidden when the window is resized (e.g. on rotation)
    useEffect(() => {
        dismissOnWindowResize();
    }, [windowWidth, windowHeight]);

    const handleOriginChange = (x: number, y: number) => {
        const previousOrigin = origin.get();
        const wasOriginMeasured = isOriginMeasured.get();
        origin.set({x, y});
        isOriginMeasured.set(true);

        // The cursor stays still while the page scrolls, so the chart moving under it is reported for the hover to be checked again
        if (!wasOriginMeasured || (previousOrigin.x === x && previousOrigin.y === y)) {
            return;
        }
        onChartMoved?.(x - previousOrigin.x, y - previousOrigin.y);
    };

    /** Calculate the center point, ensuring the box doesn't overflow the left or right edges */
    const clampedCenter = useDerivedValue(() => {
        const {x} = initialTooltipPosition.get();
        const width = tooltipMeasuredWidth.get();
        const halfWidth = width / 2;

        return Math.max(halfWidth, Math.min(chartWidth - halfWidth, x));
    }, [initialTooltipPosition, tooltipMeasuredWidth, chartWidth]);

    /** Animated window position of the tooltip, placed above the point and kept within the chart horizontally and within the window's safe area, since the portal also spans the status bar */
    const tooltipStyle = useAnimatedStyle(() => {
        const {y} = initialTooltipPosition.get();
        const {x: originX, y: originY} = origin.get();
        const width = tooltipMeasuredWidth.get();
        const height = tooltipMeasuredHeight.get();

        const left = originX + clampedCenter.get() - width / 2;
        const minTop = safeAreaTop;
        const maxBottom = windowHeight - safeAreaBottom;
        const topAbove = originY + y - height;
        const shiftedLeft = left + PopoverWithMeasuredContentUtils.computeHorizontalShift(left, width, windowWidth);
        const shiftedTop = topAbove + PopoverWithMeasuredContentUtils.computeVerticalShift(topAbove - minTop, height, maxBottom - minTop, 2 * TOOLTIP_BAR_GAP, true);
        const isTooltipShown = (isVisible?.get() ?? true) && (isContentCurrent?.get() ?? true) && isOriginMeasured.get() && width > 0;

        return {
            left: Math.max(0, Math.min(windowWidth - width, shiftedLeft)),
            top: Math.max(minTop, Math.min(maxBottom - height, shiftedTop)),
            opacity: isTooltipShown ? 1 : 0,
        };
    }, [initialTooltipPosition, windowWidth, windowHeight, safeAreaTop, safeAreaBottom]);

    return (
        <>
            <ChartTooltipAnchor
                isShown={isShown}
                onOriginChange={handleOriginChange}
            />
            {isFocused && (
                <ChartTooltipPortal>
                    <Animated.View
                        style={[styles.chartTooltipLayer, tooltipStyle]}
                        pointerEvents="none"
                    >
                        <View
                            key={contentKey}
                            style={[styles.chartTooltipBox, {minWidth: Math.min(variables.chartTooltipMinWidth, chartWidth), maxWidth: chartWidth}]}
                            onLayout={handleContentLayout}
                        >
                            <Text style={styles.chartTooltipTitle}>{label}</Text>
                            {children}
                        </View>
                    </Animated.View>
                </ChartTooltipPortal>
            )}
        </>
    );
}

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;
