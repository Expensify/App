import type {TooltipRow} from '@components/Charts/hooks/useTooltipData';
import type {ChartTooltipPlacement} from '@components/Charts/types';
import VictoryTheme from '@components/Charts/VictoryTheme';
import Text from '@components/Text';

import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import type {ComponentRef} from 'react';
import type {SharedValue} from 'react-native-reanimated';

import React, {useLayoutEffect, useRef} from 'react';
import {View} from 'react-native';
import Animated, {useAnimatedStyle, useDerivedValue, useSharedValue} from 'react-native-reanimated';

type ChartTooltipProps = {
    /** The active point's label (e.g., "Airfare", "Amazon") */
    title: string;

    /** One row per plotted series, drawn under the title */
    rows: TooltipRow[];

    /** The width of the chart container */
    chartWidth: number;

    initialTooltipPosition: SharedValue<{x: number; y: number}>;

    /** Where the tooltip sits relative to `initialTooltipPosition`. Defaults to `above`. */
    placement?: ChartTooltipPlacement;
};

function getRowContent(row: TooltipRow): string {
    if (!row.amount) {
        return row.label ?? '';
    }

    return `${row.amount} (${row.percentage})`;
}

function ChartTooltip({title, rows, chartWidth, initialTooltipPosition, placement = 'above'}: ChartTooltipProps) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const isRightPlacement = placement === 'right';

    /** Shared value to store the measured width of the tooltip container */
    const tooltipMeasuredWidth = useSharedValue(0);

    const singleRow = rows.length === 1 ? rows.at(0) : undefined;
    const content = [title, ...rows.map(getRowContent)].join(' ');

    /**
     * Synchronously reset the width and hide the tooltip whenever the content changes.
     * This prevents the "old" dimensions from being used to calculate the position
     * of "new" content, avoiding visual jumps or "ghosting" effects.
     */
    const tooltipWrapperRef = useRef<ComponentRef<typeof View>>(null);

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
     * Clamps the box horizontally to keep it within chart boundaries.
     */
    const tooltipStyle = useAnimatedStyle(() => {
        const {x, y} = initialTooltipPosition.get();

        if (isRightPlacement) {
            const width = tooltipMeasuredWidth.get();

            return {
                position: 'absolute',
                left: Math.max(0, Math.min(chartWidth - width, x)),
                top: y,
                /** Start the wrapper at the X point and center it vertically on the Y point */
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
    }, [initialTooltipPosition, isRightPlacement, chartWidth]);

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

    const tooltipBox = (
        <View style={[styles.chartTooltipBox, !singleRow && styles.chartTooltipBoxMultiSeries]}>
            {singleRow ? (
                <Text
                    style={styles.chartTooltipText}
                    numberOfLines={1}
                >
                    {`${title} • ${getRowContent(singleRow)}`}
                </Text>
            ) : (
                <>
                    <Text
                        style={styles.chartTooltipTitle}
                        numberOfLines={1}
                    >
                        {title}
                    </Text>
                    <View style={styles.chartTooltipRows}>
                        {rows.map((row) => (
                            <Text
                                key={row.label}
                                style={styles.chartTooltipText}
                                numberOfLines={1}
                            >
                                {`${row.label} • ${getRowContent(row)}`}
                            </Text>
                        ))}
                    </View>
                </>
            )}
        </View>
    );

    return (
        <Animated.View
            style={tooltipStyle}
            pointerEvents="none"
            ref={tooltipWrapperRef}
        >
            {isRightPlacement ? (
                <View style={[styles.chartTooltipWrapper, styles.flexRow]}>
                    <View
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
                        ]}
                    />
                    {tooltipBox}
                </View>
            ) : (
                <View style={styles.chartTooltipWrapper}>
                    {tooltipBox}
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
                </View>
            )}
        </Animated.View>
    );
}

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;
