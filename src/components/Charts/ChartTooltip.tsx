import React, { useCallback, useState } from 'react';
import type { LayoutChangeEvent } from 'react-native';
import { View } from 'react-native';
import Text from '@components/Text';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';
import { TOOLTIP_POINTER_HEIGHT, TOOLTIP_POINTER_WIDTH } from './constants';

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
    initialTooltipPosition: SharedValue<{ x: number; y: number }>;
};

function ChartTooltip({ label, amount, percentage, chartWidth, initialTooltipPosition }: ChartTooltipProps) {
    const theme = useTheme();
    const styles = useThemeStyles();

    /** Shared value to store the measured width of the tooltip container */
    const tooltipMeasuredWidth = useSharedValue(0);

    /** React state to track the content string that has been successfully measured */
    const [measuredContent, setMeasuredContent] = useState<string | null>(null);

    const content = percentage ? `${label} • ${amount} (${percentage})` : `${label} • ${amount}`;

    /** * Visibility gate: Only true when the currently rendered text matches 
     * the text we've already received a width measurement for.
     */
    const isReady = measuredContent === content;

    /**
     * Updates the shared width value and sets the measured content key.
     * This triggers the opacity flip once the layout engine confirms dimensions.
     */
    const handleTooltipLayout = useCallback(
        (event: LayoutChangeEvent) => {
            const { width } = event.nativeEvent.layout;
            if (width > 0) {
                tooltipMeasuredWidth.set(width);
                setMeasuredContent(content);
            }
        },
        [content, tooltipMeasuredWidth],
    );

    /**
     * Animated style for the main tooltip container.
     * Calculates the clamped center to keep the box within chart boundaries.
     */
    const tooltipStyle = useAnimatedStyle(() => {
        const { x, y } = initialTooltipPosition.get();
        const width = tooltipMeasuredWidth.get();
        const halfWidth = width / 2;

        /** Calculate the center point, ensuring the box doesn't overflow the left or right edges */
        const clampedCenter = Math.max(halfWidth, Math.min(chartWidth - halfWidth, x));

        return {
            position: 'absolute',
            left: clampedCenter,
            top: y,
            /** Center the wrapper horizontally and lift it entirely above the Y point */
            transform: [{ translateX: '-50%' }, { translateY: '-100%' }],
            /** Keep invisible until measurement for the current bar's content is ready */
            opacity: isReady ? 1 : 0,
        };
    }, [chartWidth, initialTooltipPosition, isReady]);

    /**
     * Animated style for the pointer (triangle).
     * Calculates the relative offset to keep the pointer pinned to the bar (initialX)
     * even when the main container is clamped to the edges.
     */
    const pointerStyle = useAnimatedStyle(() => {
        const { x } = initialTooltipPosition.get();
        const width = tooltipMeasuredWidth.get();
        const halfWidth = width / 2;

        /** Find the distance between the bar's X and the container's clamped center */
        const clampedCenter = Math.max(halfWidth, Math.min(chartWidth - halfWidth, x));
        const relativeOffset = x - clampedCenter;

        return {
            transform: [{ translateX: relativeOffset }],
        };
    }, [chartWidth, initialTooltipPosition]);

    return (
        <Animated.View style={tooltipStyle} onLayout={handleTooltipLayout} pointerEvents="none">
            <View style={styles.chartTooltipWrapper}>
                <View style={styles.chartTooltipBox}>
                    <Text style={styles.chartTooltipText} numberOfLines={1}>
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
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
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
