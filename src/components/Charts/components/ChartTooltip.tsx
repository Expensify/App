import {useMeasureChartTooltipBoundary} from '@components/Charts/context/ChartTooltipBoundaryContext';
import {TOOLTIP_BAR_GAP} from '@components/Charts/hooks';
import Text from '@components/Text';

import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import type {ComponentRef} from 'react';
import type {SharedValue} from 'react-native-reanimated';

import React, {useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';

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

    /** Changing this re-measures the room above the chart, e.g. each time the tooltip shows again after the page may have scrolled */
    measureKey?: number;
};

function getAmountContent(amount: string, percentage?: string): string {
    if (!amount || !percentage) {
        return amount;
    }

    return `${amount} (${percentage})`;
}

function ChartTooltip({label, amount, percentage, expenseCount, chartWidth, initialTooltipPosition, measureKey}: ChartTooltipProps) {
    const styles = useThemeStyles();
    const measureBoundary = useMeasureChartTooltipBoundary();

    /** Shared value to store the measured width of the tooltip container */
    const tooltipMeasuredWidth = useSharedValue(0);

    /** Shared value to store the measured height of the tooltip container */
    const tooltipMeasuredHeight = useSharedValue(0);

    /** Shared value to store the visible room between the top of the chart and the top edge of the clipping boundary */
    const spaceAbove = useSharedValue(0);

    const amountContent = getAmountContent(amount, percentage);
    const content = [label, amountContent, expenseCount].join('|');

    /**
     * Synchronously reset the width and hide the tooltip whenever the content changes.
     * This prevents the "old" dimensions from being used to calculate the position
     * of "new" content, avoiding visual jumps or "ghosting" effects.
     */
    const tooltipWrapperRef = useRef<ComponentRef<typeof View>>(null);

    /** Zero-size view pinned to the chart's top-left corner, used to find where the chart sits in the window */
    const originRef = useRef<ComponentRef<typeof View>>(null);

    useLayoutEffect(() => {
        tooltipWrapperRef.current?.measure((x: number, y: number, width: number, height: number) => {
            if (width <= 0) {
                return;
            }
            tooltipMeasuredWidth.set(width);
            tooltipMeasuredHeight.set(height);
        });
        originRef.current?.measureInWindow((originX: number, originY: number) => {
            if (!measureBoundary) {
                spaceAbove.set(Math.max(0, originY));
                return;
            }
            measureBoundary((boundaryX: number, boundaryY: number) => {
                spaceAbove.set(Math.max(0, originY - boundaryY));
            });
        });
    }, [content, chartWidth, measureKey, measureBoundary, tooltipMeasuredWidth, tooltipMeasuredHeight, spaceAbove]);

    /** Calculate the center point, ensuring the box doesn't overflow the left or right edges */
    const clampedCenter = useDerivedValue(() => {
        const {x} = initialTooltipPosition.get();
        const width = tooltipMeasuredWidth.get();
        const halfWidth = width / 2;

        return Math.max(halfWidth, Math.min(chartWidth - halfWidth, x));
    }, [initialTooltipPosition, tooltipMeasuredWidth, chartWidth]);

    /** True when the tooltip would stick out above the visible area, so it is drawn below the point instead */
    const shouldShowBelow = useDerivedValue(
        () => initialTooltipPosition.get().y - tooltipMeasuredHeight.get() < -spaceAbove.get(),
        [initialTooltipPosition, tooltipMeasuredHeight, spaceAbove],
    );

    /**
     * Animated style for the main tooltip container.
     * Calculates the clamped center to keep the box within chart boundaries, and lifts the box above the point,
     * or drops it below the point when there isn't enough room above, since clipping parents (e.g. a ScrollView) would cut it.
     */
    const tooltipStyle = useAnimatedStyle(() => {
        const {y} = initialTooltipPosition.get();
        const isBelow = shouldShowBelow.get();

        return {
            position: 'absolute',
            left: 0,
            top: isBelow ? y + 2 * TOOLTIP_BAR_GAP : y,
            transform: [{translateX: clampedCenter.get() - tooltipMeasuredWidth.get() / 2}, {translateY: isBelow ? 0 : -tooltipMeasuredHeight.get()}],
            opacity: tooltipMeasuredWidth.get() > 0 ? 1 : 0,
        };
    }, [initialTooltipPosition]);

    return (
        <>
            <View
                ref={originRef}
                style={styles.chartTooltipOrigin}
                pointerEvents="none"
            />
            <Animated.View
                style={tooltipStyle}
                pointerEvents="none"
                ref={tooltipWrapperRef}
            >
                <View style={[styles.chartTooltipBox, {minWidth: Math.min(variables.chartTooltipMinWidth, chartWidth), maxWidth: chartWidth}]}>
                    <Text style={styles.chartTooltipTitle}>{label}</Text>
                    {!!amountContent && <Text style={styles.chartTooltipText}>{amountContent}</Text>}
                    {!!expenseCount && <Text style={styles.chartTooltipText}>{expenseCount}</Text>}
                </View>
            </Animated.View>
        </>
    );
}

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;
