import ChartTooltip from '@components/Charts/components/ChartTooltip';
import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import useVictoryChartTooltip from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartTooltip';
import getChartDesignWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartDesignWidth';
import getChartLayoutModeProps from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartLayoutModeProps';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useCurrentTimezone from '@hooks/useCurrentTimezone';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import ThemeContext from '@styles/theme/context/ThemeContext';

import React, {useRef, useState} from 'react';
import {View} from 'react-native';
import {GestureDetector} from 'react-native-gesture-handler';
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
 * The chart is wrapped in a `GestureDetector` powered by `useVictoryChartTooltip` so
 * `<victorybar labels>` / `<victoryline labels>` surface a tap/hover tooltip via `<ChartTooltip>`.
 */
function VictoryChartCartesian({explicitSize, headless}: VictoryChartCartesianProps) {
    const {tnode, data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, labelItems, legendItems, chartContentStyles} = useVictoryChartContext();
    const styles = useThemeStyles();
    const theme = useTheme();
    const timezone = useCurrentTimezone();
    const designWidth = getChartDesignWidth(explicitSize, chartContentStyles.width);
    const ref = useRef<View>(null);
    // Track the container's actual layout width so <ChartTooltip>'s edge-clamp uses the real width,
    // not the design width (which is `undefined` when the chart is authored with width: '100%').
    const [containerCssWidth, setContainerCssWidth] = useState(0);
    const {gestures, handleRender, hasAnyLabels, activeLabel, isTooltipActive, initialTooltipPosition} = useVictoryChartTooltip(ref);

    const tooltipWrapperStyle = useAnimatedStyle(() => ({
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        opacity: isTooltipActive.get() ? 1 : 0,
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
        <GestureDetector gesture={gestures}>
            <Animated.View
                style={[styles.w100, styles.h100]}
                ref={ref}
                onLayout={(e) => setContainerCssWidth(e.nativeEvent.layout.width)}
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
                        // Push victory-native's live rendered pixel positions into the tooltip hook so
                        // the hit-test always uses the coord space the chart just drew with, even after resizes.
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
                {hasAnyLabels && (
                    <Animated.View
                        style={tooltipWrapperStyle}
                        pointerEvents="none"
                    >
                        <ChartTooltip
                            label={activeLabel ?? ''}
                            amount=""
                            chartWidth={containerCssWidth || designWidth || 0}
                            initialTooltipPosition={initialTooltipPosition}
                        />
                    </Animated.View>
                )}
            </Animated.View>
        </GestureDetector>
    );
}

export default VictoryChartCartesian;
