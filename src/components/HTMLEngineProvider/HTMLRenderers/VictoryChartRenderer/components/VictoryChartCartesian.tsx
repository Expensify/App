import React from 'react';
import {CartesianChart} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import type {VictoryChartScaleValue} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartScaleContext';
import {DEFAULT_SCALE} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartScaleContext';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';
import VictoryChartLabels from './VictoryChartLabels';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

function computeScale(canvasSize: {width: number; height: number}, designWidth?: number, designHeight?: number): VictoryChartScaleValue {
    if (!designWidth || !designHeight || canvasSize.width <= 0 || canvasSize.height <= 0) {
        return DEFAULT_SCALE;
    }
    return {
        x: Math.min(canvasSize.width / designWidth, 1),
        y: Math.min(canvasSize.height / designHeight, 1),
    };
}

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian() {
    const {data, xKey, yKeys, xAxis, yAxis, tnode, labelItems, legendItems, chartContentStyles} = useVictoryChartContext();
    const designWidth = typeof chartContentStyles.width === 'number' ? chartContentStyles.width : undefined;
    const designHeight = typeof chartContentStyles.height === 'number' ? chartContentStyles.height : undefined;

    return (
        <CartesianChart
            data={Object.values(data)}
            xKey={xKey}
            yKeys={yKeys}
            xAxis={xAxis}
            yAxis={yAxis}
            domain={parseAttribute(tnode.attributes.domain)}
            domainPadding={parseDomainPadding(tnode.attributes.domainpadding)}
            padding={parseAttribute(tnode.attributes.padding)}
            renderOutside={(renderArgs) => {
                const scale = computeScale(renderArgs.canvasSize, designWidth, designHeight);
                return (
                    <VictoryChartRenderArgsProvider value={renderArgs}>
                        <VictoryChartLabels
                            labelItems={labelItems}
                            scale={scale}
                        />
                        <VictoryChartLegend
                            legendItems={legendItems}
                            scale={scale}
                        />
                    </VictoryChartRenderArgsProvider>
                );
            }}
        >
            {(renderArgs) => (
                <VictoryChartRenderArgsProvider value={renderArgs}>
                    {tnode.children.map((child) => (
                        <VictoryChartSeries
                            key={`${child.tagName ?? 'node'}-${getYKey(child)}`}
                            tnode={child}
                        />
                    ))}
                </VictoryChartRenderArgsProvider>
            )}
        </CartesianChart>
    );
}

VictoryChartCartesian.displayName = 'VictoryChartCartesian';

export default VictoryChartCartesian;
