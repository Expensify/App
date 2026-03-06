import React, {useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';
import type {SharedValue} from 'react-native-reanimated';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

/** The height of the chart tooltip pointer */
const TOOLTIP_POINTER_HEIGHT = 4;

/** The width of the chart tooltip pointer */
const TOOLTIP_POINTER_WIDTH = 12;

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
};

function ChartTooltip({label, amount, percentage, chartWidth, initialTooltipPosition}: ChartTooltipProps) {
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
        const {y} = initialTooltipPosition.get();

        return {
            position: 'absolute',
            left: clampedCenter.get(),
            top: y,
            /** Center the wrapper horizontally and lift it entirely above the Y point */
            transform: [{translateX: '-50%'}, {translateY: '-100%'}],
            opacity: tooltipMeasuredWidth.get() > 0 ? 1 : 0,
        };
    }, [initialTooltipPosition]);

    /**
     * Animated style for the pointer (triangle).
     * Calculates the relative offset to keep the pointer pinned to the data point (initialX)
     * even when the main container is clamped to the edges.
     */
    const pointerStyle = useAnimatedStyle(() => {
        const {x} = initialTooltipPosition.get();

        const relativeOffset = x - clampedCenter.get();

        return {
            transform: [{translateX: relativeOffset}],
        };
    }, [initialTooltipPosition]);

    return (
        <Animated.View
            style={tooltipStyle}
            pointerEvents="none"
            ref={tooltipWrapperRef}
        >
            <View style={styles.chartTooltipWrapper}>
                <View style={styles.chartTooltipBox}>
                    <Text
                        style={styles.chartTooltipText}
                        numberOfLines={1}
                    >
                        {content}
                    </Text>
                </View>
                <Animated.View
                    style={[
                        styles.chartTooltipPointer,
                        {
                            borderLeftWidth: TOOLTIP_POINTER_WIDTH / 2,
                            borderRightWidth: TOOLTIP_POINTER_WIDTH / 2,
                            borderTopWidth: TOOLTIP_POINTER_HEIGHT,
                            borderLeftColor: theme.transparent,
                            borderRightColor: theme.transparent,
                            borderTopColor: theme.heading,
                        },
                        pointerStyle,
                    ]}
                />
            </View>
        </Animated.View>
    );
}

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;
