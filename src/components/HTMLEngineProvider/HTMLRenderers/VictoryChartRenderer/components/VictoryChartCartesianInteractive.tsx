/**
 * Interactive wrapper around VictoryChartCartesian that adds hover tooltips
 * and tap-to-navigate behaviour for bar chart series.
 */
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import useVictoryBarInteractions from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryBarInteractions';
import getChartDesignWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartDesignWidth';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import VictoryChartCartesian from './VictoryChartCartesian';

const styles = StyleSheet.create({
    container: {
        height: '100%',
        position: 'relative',
        width: '100%',
    },
});

function VictoryChartCartesianInteractive() {
    const {chartContentStyles} = useVictoryChartContext();
    const designWidth = getChartDesignWidth(undefined, chartContentStyles.width);
    const [chartWidth, setChartWidth] = useState(designWidth ?? 0);
    const {customGestures, syncBarPositions, activeLabel, hasTooltipLabels, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useVictoryBarInteractions();

    const updateChartWidth = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    const tooltipWrapperStyle = useAnimatedStyle(() => ({
        bottom: 0,
        left: 0,
        opacity: isTooltipActive.get() ? 1 : 0,
        position: 'absolute',
        right: 0,
        top: 0,
    }));

    return (
        <Animated.View
            style={[styles.container, cursorStyle]}
            onLayout={updateChartWidth}
        >
            <VictoryChartCartesian
                customGestures={customGestures}
                onRenderArgs={syncBarPositions}
            />
            {!!activeLabel && hasTooltipLabels && chartWidth > 0 && (
                <Animated.View
                    style={tooltipWrapperStyle}
                    pointerEvents="none"
                >
                    <ChartTooltip
                        label={activeLabel}
                        amount=""
                        chartWidth={chartWidth}
                        initialTooltipPosition={initialTooltipPosition}
                    />
                </Animated.View>
            )}
        </Animated.View>
    );
}

export default VictoryChartCartesianInteractive;
