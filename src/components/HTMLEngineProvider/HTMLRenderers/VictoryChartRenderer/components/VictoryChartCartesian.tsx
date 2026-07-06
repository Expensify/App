import ChartFontsLoaderProvider from '@components/Charts/context/ChartFontsLoaderProvider';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import type {CartesianChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getChartDesignWidth from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartDesignWidth';
import getChartLayoutModeProps from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getChartLayoutModeProps';
import getHierarchyID from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getHierarchyID';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import {parseAttributeAsNumber} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import resolveChartThemeColor from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveChartThemeColor';

import useCurrentTimezone from '@hooks/useCurrentTimezone';
import useTheme from '@hooks/useTheme';

import ThemeContext from '@styles/theme/context/ThemeContext';

import type {TNode} from 'react-native-render-html';
import type {CartesianChartRenderArg} from 'victory-native';

import React, {useRef} from 'react';
import {CartesianChart} from 'victory-native';

import VictoryChartLabel from './VictoryChartLabel';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';
import VictoryChartTooltipOverlay from './VictoryChartTooltipOverlay';

type VictoryChartCartesianProps = {
    explicitSize?: {width: number; height: number};
    headless?: boolean;
};

function collectSeriesGeometry(children: readonly TNode[]): {barWidthByYKey: Partial<Record<YKey, number>>; isLineMode: Partial<Record<YKey, boolean>>} {
    const barWidthByYKey: Partial<Record<YKey, number>> = {};
    const isLineMode: Partial<Record<YKey, boolean>> = {};

    const visit = (node: TNode) => {
        const tag = node.tagName ?? '';
        if (tag === 'victorybar') {
            const yKey = getYKey(node);
            const width = parseAttributeAsNumber(node.attributes.barwidth);
            if (width !== undefined) {
                barWidthByYKey[yKey] = width;
            }
            return;
        }
        if (tag === 'victoryline') {
            isLineMode[getYKey(node)] = true;
            return;
        }
        if (tag === 'victorygroup') {
            for (const child of node.children) {
                visit(child);
            }
        }
    };

    for (const child of children) {
        visit(child);
    }

    return {barWidthByYKey, isLineMode};
}

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 * The chart is wrapped in `VictoryChartTooltipOverlay` so `<victorybar labels>` and `<victoryline labels>`
 * surface a tap/hover tooltip via the shared `ChartTooltip` component.
 */
function VictoryChartCartesian({explicitSize, headless}: VictoryChartCartesianProps) {
    const {tnode, data, xKey, yKeys, xAxis, yAxis, domain, domainPadding, padding, isHorizontal, labelItems, legendItems, labelsByYKey, chartContentStyles} = useVictoryChartContext();
    const theme = useTheme();
    const timezone = useCurrentTimezone();
    const designWidth = getChartDesignWidth(explicitSize, chartContentStyles.width);
    const renderArgsRef = useRef<CartesianChartRenderArg<CartesianChartData, YKey> | null>(null);
    const {barWidthByYKey, isLineMode} = collectSeriesGeometry(tnode.children);

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
        <VictoryChartTooltipOverlay
            renderArgsRef={renderArgsRef}
            yKeys={yKeys}
            isHorizontal={isHorizontal}
            barWidthByYKey={barWidthByYKey}
            isLineMode={isLineMode}
            labelsByYKey={labelsByYKey}
            chartWidth={designWidth ?? 0}
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
                    // Mutating a ref during render is allowed (idempotent — always reflects current render-args)
                    // and lets the RN-side tooltip overlay read points/chartBounds for hit-testing.
                    renderArgsRef.current = renderArgs;
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
        </VictoryChartTooltipOverlay>
    );
}

export default VictoryChartCartesian;
