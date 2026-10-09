import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks';
import {pinChartTooltip, unpinChartTooltip} from '@components/Charts/utils/pinnedChartTooltip';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';
import useWindowDimensions from '@hooks/useWindowDimensions';

import PopoverWithMeasuredContentUtils from '@libs/PopoverWithMeasuredContentUtils';

import variables from '@styles/variables';

import type {ComponentRef} from 'react';
import type {LayoutChangeEvent} from 'react-native';
import type {DerivedValue, SharedValue} from 'react-native-reanimated';

import {useIsFocused} from '@react-navigation/native';
import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import {scheduleOnRN} from 'react-native-worklets';

import ChartTooltipAnchor from './ChartTooltipAnchor';
import ChartTooltipPortal from './ChartTooltipPortal';

type ChartTooltipProps = {
    /** Label text (e.g., "Airfare", "Amazon") */
    label: string;

    /** Formatted amount (e.g., "$1,820.00") */
    amount: string;

    /** Optional percentage to display (e.g., "12%") */
    percentage?: string;

    /** Optional translated expense count (e.g., "841 expenses") */
    expenseCount?: string;

    /** The width of the chart container */
    chartWidth: number;

    initialTooltipPosition: SharedValue<{x: number; y: number}>;

    /** Whether the tooltip should be shown, treated as always shown when omitted */
    isVisible?: DerivedValue<boolean>;

    /** Whether the rendered content belongs to the current target, so the old content is never drawn at the new position */
    isContentCurrent?: DerivedValue<boolean>;

    /** Updates the hovered point after the chart is moved in the window (e.g. via scroll) by the given offset */
    onChartMoved?: (deltaX: number, deltaY: number) => void;

    /** Hides a tooltip pinned by a touch tap, passed only while it is pinned; called on any touch on the screen or when the screen loses focus */
    onDismiss?: () => void;
};

function getAmountContent(amount: string, percentage?: string): string {
    if (!amount || !percentage) {
        return amount;
    }

    return `${amount} (${percentage})`;
}

function ChartTooltip({label, amount, percentage, expenseCount, chartWidth, initialTooltipPosition, isVisible, isContentCurrent, onChartMoved, onDismiss}: ChartTooltipProps) {
    const styles = useThemeStyles();
    const {windowWidth, windowHeight} = useWindowDimensions();

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

    const amountContent = getAmountContent(amount, percentage);
    const content = [label, amountContent, expenseCount].join('|');

    const tooltipWrapperRef = useRef<ComponentRef<typeof View>>(null);

    useLayoutEffect(() => {
        tooltipWrapperRef.current?.measure((x: number, y: number, width: number, height: number) => {
            if (width <= 0) {
                return;
            }
            tooltipMeasuredWidth.set(width);
            tooltipMeasuredHeight.set(height);
        });
    }, [content, chartWidth, tooltipMeasuredWidth, tooltipMeasuredHeight]);

    const updateMeasuredSize = (event: LayoutChangeEvent) => {
        const {width, height} = event.nativeEvent.layout;
        if (width <= 0) {
            return;
        }
        tooltipMeasuredWidth.set(width);
        tooltipMeasuredHeight.set(height);
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

    // A pinned tooltip has no hover to end it, so it is registered for the screen's touch start to hide it
    useEffect(() => {
        if (!isShown || !onDismiss) {
            return;
        }

        // The tooltip is drawn in a root portal, so it would stay on top of the next screen after navigating away
        if (!isFocused) {
            onDismiss();
            return;
        }
        pinChartTooltip(onDismiss);
        return () => unpinChartTooltip(onDismiss);
    }, [isShown, isFocused, onDismiss]);

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

    /** Animated window position of the tooltip, placed above the point and kept within the chart horizontally and within the window */
    const tooltipStyle = useAnimatedStyle(() => {
        const {y} = initialTooltipPosition.get();
        const {x: originX, y: originY} = origin.get();
        const width = tooltipMeasuredWidth.get();
        const height = tooltipMeasuredHeight.get();

        const left = originX + clampedCenter.get() - width / 2;
        const topAbove = originY + y - height;
        const shiftedLeft = left + PopoverWithMeasuredContentUtils.computeHorizontalShift(left, width, windowWidth);
        const shiftedTop = topAbove + PopoverWithMeasuredContentUtils.computeVerticalShift(topAbove, height, windowHeight, 2 * TOOLTIP_BAR_GAP, true);
        const isTooltipShown = (isVisible?.get() ?? true) && (isContentCurrent?.get() ?? true) && isOriginMeasured.get() && width > 0;

        return {
            left: Math.max(0, Math.min(windowWidth - width, shiftedLeft)),
            top: Math.max(0, Math.min(windowHeight - height, shiftedTop)),
            opacity: isTooltipShown ? 1 : 0,
        };
    }, [initialTooltipPosition, windowWidth, windowHeight]);

    return (
        <>
            <ChartTooltipAnchor
                isShown={isShown}
                onOriginChange={handleOriginChange}
            />
            <ChartTooltipPortal>
                <Animated.View
                    style={[styles.chartTooltipLayer, tooltipStyle]}
                    pointerEvents="none"
                    ref={tooltipWrapperRef}
                    onLayout={updateMeasuredSize}
                >
                    <View style={[styles.chartTooltipBox, {minWidth: Math.min(variables.chartTooltipMinWidth, chartWidth), maxWidth: chartWidth}]}>
                        <Text style={styles.chartTooltipTitle}>{label}</Text>
                        {!!amountContent && <Text style={styles.chartTooltipText}>{amountContent}</Text>}
                        {!!expenseCount && <Text style={styles.chartTooltipText}>{expenseCount}</Text>}
                    </View>
                </Animated.View>
            </ChartTooltipPortal>
        </>
    );
}

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;
