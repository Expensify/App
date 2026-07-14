import ChartTooltip from '@components/Charts/components/ChartTooltip';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import useVictoryBarInteractions from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryBarInteractions';
import getChartDesignWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartDesignWidth';
import getChartLayoutModeProps from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartLayoutModeProps';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useCurrentTimezone from '@hooks/useCurrentTimezone';
import useTheme from '@hooks/useTheme';

import ThemeContext from '@styles/theme/context/ThemeContext';

import type {LayoutChangeEvent} from 'react-native';

import React, {useState} from 'react';
import {StyleSheet} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';
import {CartesianChart} from 'victory-native';

import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

type VictoryChartCartesianProps = {
    explicitSize?: {width: number; height: number};
    headless?: boolean;
};

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian({explicitSize, headless}: VictoryChartCartesianProps) {
    const {tnode, data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, labelItems, legendItems, chartContentStyles} = useVictoryChartContext();
    const theme = useTheme();
    const timezone = useCurrentTimezone();
    const designWidth = getChartDesignWidth(explicitSize, chartContentStyles.width);
    const [chartWidth, setChartWidth] = useState(designWidth ?? 0);
    const {customGestures, handleRender, activeLabel, hasTooltipLabels, isTooltipActive, isCursorOverClickable, initialTooltipPosition} = useVictoryBarInteractions();

    const handleLayout = (event: LayoutChangeEvent) => {
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

    const resolvedXAxis = xAxis
        ? {
              ...xAxis,
              lineColor: typeof xAxis.lineColor === 'string' ? resolveChartThemeColor(xAxis.lineColor, theme) : xAxis.lineColor,
              labelColor: typeof xAxis.labelColor === 'string' ? resolveChartThemeColor(xAxis.labelColor, theme) : xAxis.labelColor,
          }
        : xAxis;
    const resolvedYAxis = yAxis?.map((axis) => ({
        ...axis,
        lineColor: typeof axis.lineColor === 'string' ? resolveChartThemeColor(axis.lineColor, theme) : axis.lineColor,
        labelColor: typeof axis.labelColor === 'string' ? resolveChartThemeColor(axis.labelColor, theme) : axis.labelColor,
    }));

    return (
        <Animated.View
            style={[styles.container, cursorStyle]}
            onLayout={handleLayout}
        >
            <CartesianChart
                data={Object.values(data)}
                xKey={xKey}
                yKeys={yKeys}
                xAxis={resolvedXAxis}
                yAxis={resolvedYAxis}
                domain={domain}
                domainPadding={domainPadding}
                padding={padding}
                customGestures={customGestures}
                {...getChartLayoutModeProps(explicitSize, headless)}
                renderOutside={(renderArgs) => {
                    const overlayContent = (
                        <VictoryChartRenderArgsProvider value={renderArgs}>
                            {labelItems.map((labelItem) => (
                                <VictoryChartLabel
                                    key={`label-${labelItem.x}-${labelItem.y}-${timezone}`}
                                    {...labelItem}
                                    timezone={timezone}
                                />
                            ))}
                            {legendItems.map((legendItem) => (
                                <VictoryChartLegend
                                    key={`legend-${legendItem.x}-${legendItem.y}`}
                                    {...legendItem}
                                    chartWidth={designWidth}
                                />
                            ))}
                        </VictoryChartRenderArgsProvider>
                    );

                    if (headless) {
                        return <ThemeContext.Provider value={theme}>{overlayContent}</ThemeContext.Provider>;
                    }

                    // React context does not propagate across the Skia renderOutside boundary.
                    return (
                        <ThemeContext.Provider value={theme}>
                            <ChartFontsLoaderProvider>{overlayContent}</ChartFontsLoaderProvider>
                        </ThemeContext.Provider>
                    );
                }}
            >
                {(renderArgs) => {
                    handleRender(renderArgs);

                    return (
                        <VictoryChartRenderArgsProvider value={renderArgs}>
                            {tnode.children.map((child) => (
                                <VictoryChartSeries
                                    key={`${child.tagName ?? 'node'}-${getHierarchyID(child)}`}
                                    tnode={child}
                                    isHorizontal={isHorizontal}
                                />
                            ))}
                        </VictoryChartRenderArgsProvider>
                    );
                }}
            </CartesianChart>
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

const styles = StyleSheet.create({
    container: {
        height: '100%',
        position: 'relative',
        width: '100%',
    },
});

export default VictoryChartCartesian;
