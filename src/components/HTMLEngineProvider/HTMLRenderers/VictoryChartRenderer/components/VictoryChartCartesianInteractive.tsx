/**
 * Interactive wrapper around VictoryChartCartesian that adds hover tooltips
 * and tap-to-navigate behaviour for bar chart series.
 */
import ChartTooltip from '@components/Charts/components/ChartTooltip';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {useVictoryChartLayoutScale} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartLayoutContext';
import useVictoryBarInteractions from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryBarInteractions';
import getChartDesignWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartDesignWidth';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
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
    const coordinateScale = useVictoryChartLayoutScale();
    const {customGestures, syncBarPositions, activeTooltipData, hasInteractiveBars, hasTooltipLabels, isTooltipActive, isCursorOverClickable, initialTooltipPosition, onChartMoved} =
        useVictoryBarInteractions();

    const updateChartWidth = (event: LayoutChangeEvent) => {
        setChartWidth(event.nativeEvent.layout.width);
    };

    const cursorStyle = useAnimatedStyle(() => ({
        cursor: isCursorOverClickable.get() ? 'pointer' : 'auto',
    }));

    if (!hasInteractiveBars) {
        return <VictoryChartCartesian />;
    }

    return (
        <GestureDetector gesture={customGestures}>
            <Animated.View
                style={[styles.container, cursorStyle]}
                onLayout={updateChartWidth}
            >
                <VictoryChartCartesian onRenderArgs={syncBarPositions} />
                {!!activeTooltipData && hasTooltipLabels && chartWidth > 0 && (
                    <ChartTooltip
                        label={activeTooltipData.label}
                        amount={activeTooltipData.amount}
                        percentage={activeTooltipData.percentage}
                        chartWidth={chartWidth * coordinateScale}
                        initialTooltipPosition={initialTooltipPosition}
                        isVisible={isTooltipActive}
                        onChartMoved={onChartMoved}
                    />
                )}
            </Animated.View>
        </GestureDetector>
    );
}

export default VictoryChartCartesianInteractive;
