import React, {useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import VictoryTheme from '@components/Charts/VictoryTheme';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

/** Clamps tooltip left position when placement is to the right of the anchor point. */
function clampRightPlacementTooltipLeft(anchorX: number, chartWidth: number, tooltipWidth: number): number {
    return Math.max(0, Math.min(chartWidth - tooltipWidth, anchorX));
}

type ChartTooltipProps = {
    /** Label text (e.g., "Airfare", "Amazon") */
    label: string;

    /** Formatted amount (e.g., "$1,820.00") */
    amount: string;

    /** Optional percentage to display (e.g., "12%") */
    percentage?: string;

    /** The width of the chart container */
    chartWidth: number;

    /** The initial tooltip position */
    initialTooltipPosition: SharedValue<{x: number; y: number}>;

    /** Where the tooltip sits relative to the anchor point */
    placement?: 'above' | 'right';
};

function ChartTooltip({label, amount, percentage, chartWidth, initialTooltipPosition, placement = 'above'}: ChartTooltipProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    /** Shared value to store the measured width of the tooltip container */
    const tooltipMeasuredWidth = useSharedValue(0);

    const content = percentage ? `${label} • ${amount} (${percentage})` : `${label} • ${amount}`;

    /**
     * Synchronously reset the width and hide the tooltip whenever the content changes.
     * This prevents the "old" dimensions from being used to calculate the position
     * of "new" content, avoiding visual jumps or "ghosting" effects.
     */
    const tooltipWrapperRef = useRef<View>(null);

    useLayoutEffect(() => {
        tooltipWrapperRef.current?.measure((x: number, y: number, width: number) => {
            if (width <= 0) {
                return;
            }
            tooltipMeasuredWidth.set(width);
        });
    }, [content, tooltipMeasuredWidth]);

    /** Calculate the center point, ensuring the box doesn't overflow the left or right edges */
    const clampedCenter = useDerivedValue(() => {
        const {x} = initialTooltipPosition.get();
        const width = tooltipMeasuredWidth.get();
        const halfWidth = width / 2;

        return Math.max(halfWidth, Math.min(chartWidth - halfWidth, x));
    }, [initialTooltipPosition, tooltipMeasuredWidth, chartWidth]);

    /**
     * Animated style for the main tooltip container.
     * Calculates the clamped center to keep the box within chart boundaries.
     */
    const tooltipStyle = useAnimatedStyle(() => {
        const {x, y} = initialTooltipPosition.get();

        if (placement === 'right') {
            const width = tooltipMeasuredWidth.get();
            const clampedLeft = clampRightPlacementTooltipLeft(x, chartWidth, width);

            return {
                position: 'absolute',
                left: clampedLeft,
                top: y,
                transform: [{translateY: '-50%'}],
                opacity: width > 0 ? 1 : 0,
            };
        }

        return {
            position: 'absolute',
            left: clampedCenter.get(),
            top: y,
            /** Center the wrapper horizontally and lift it entirely above the Y point */
            transform: [{translateX: '-50%'}, {translateY: '-100%'}],
            opacity: tooltipMeasuredWidth.get() > 0 ? 1 : 0,
        };
    }, [initialTooltipPosition, placement]);

    /**
     * Animated style for the pointer (triangle).
     * Calculates the relative offset to keep the pointer pinned to the data point (initialX)
     * even when the main container is clamped to the edges.
     */
    const pointerStyle = useAnimatedStyle(() => {
        const {x} = initialTooltipPosition.get();

        if (placement === 'right') {
            const width = tooltipMeasuredWidth.get();
            const clampedLeft = clampRightPlacementTooltipLeft(x, chartWidth, width);
            const relativeOffset = x - clampedLeft - VictoryTheme.tooltip.pointerWidth;

            return {
                transform: [{translateX: relativeOffset}],
            };
        }

        const relativeOffset = x - clampedCenter.get();

        return {
            transform: [{translateX: relativeOffset}],
        };
    }, [initialTooltipPosition, placement, chartWidth]);

    return (
        <Animated.View
            style={tooltipStyle}
            pointerEvents="none"
            ref={tooltipWrapperRef}
        >
            <View style={[styles.chartTooltipWrapper, placement === 'right' && styles.chartTooltipWrapperRight]}>
                {placement === 'right' && (
                    <Animated.View
                        style={[
                            styles.chartTooltipPointer,
                            {
                                borderTopWidth: VictoryTheme.tooltip.pointerWidth / 2,
                                borderBottomWidth: VictoryTheme.tooltip.pointerWidth / 2,
                                borderRightWidth: VictoryTheme.tooltip.pointerHeight,
                                borderTopColor: theme.transparent,
                                borderBottomColor: theme.transparent,
                                borderRightColor: theme.heading,
                            },
                            pointerStyle,
                        ]}
                    />
                )}
                <View style={styles.chartTooltipBox}>
                    <Text
                        style={styles.chartTooltipText}
                        numberOfLines={1}
                    >
                        {content}
                    </Text>
                </View>
                {placement === 'above' && (
                    <Animated.View
                        style={[
                            styles.chartTooltipPointer,
                            {
                                borderLeftWidth: VictoryTheme.tooltip.pointerWidth / 2,
                                borderRightWidth: VictoryTheme.tooltip.pointerWidth / 2,
                                borderTopWidth: VictoryTheme.tooltip.pointerHeight,
                                borderLeftColor: theme.transparent,
                                borderRightColor: theme.transparent,
                                borderTopColor: theme.heading,
                            },
                            pointerStyle,
                        ]}
                    />
                )}
            </View>
        </Animated.View>
    );
}

ChartTooltip.displayName = 'ChartTooltip';

export {clampRightPlacementTooltipLeft};
export default ChartTooltip;
