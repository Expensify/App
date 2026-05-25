import React from 'react';
import type {TNode} from 'react-native-render-html';
import {CartesianChart} from 'victory-native';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import {VictoryChartRenderArgsProvider} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import type {CartesianChartProps} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';
import parseDomainPadding from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseDomainPadding';
import VictoryChartLabels from './VictoryChartLabels';
import VictoryChartLegend from './VictoryChartLegend';
import VictoryChartSeries from './VictoryChartSeries';

/** Series tags whose node represents a data series we render in the chart's children. */
const SERIES_TAGS = new Set(['victorybar', 'victoryline']);

/** Container tags that don't render themselves; their children are flattened into the parent. */
const TRANSPARENT_CONTAINER_TAGS = new Set(['victorygroup']);

type SeriesEntry = {
    /** The `<victorybar>` / `<victoryline>` node to render. */
    node: TNode;

    /**
     * Pixel offset along the category axis, applied per series within a `<victorygroup>` so its
     * bars sit side-by-side instead of overlapping. 0 for ungrouped series. In horizontal mode
     * this becomes a Y-pixel shift; in vertical mode the renderer currently ignores it.
     */
    groupOffset: number;
};

/**
 * Walk the root `<victorychart>`'s subtree and collect every series node. Descends through
 * transparent containers like `<victorygroup>` and computes the per-series pixel offset that
 * keeps grouped bars from overlapping (Victory's `offset` attribute on `<victorygroup>`).
 *
 * For a group of N series with offset O, series at index i gets a shift of
 *   `(i - (N - 1) / 2) * O`
 * — so a 2-series group with offset 18 produces shifts of −9 and +9, centering the pair on the
 * row tick. Currently only one level of grouping is supported; nested groups aren't honored.
 */
function collectSeriesNodes(tnode: TNode): SeriesEntry[] {
    const result: SeriesEntry[] = [];
    for (const child of tnode.children) {
        const tagName = child.tagName ?? '';
        if (SERIES_TAGS.has(tagName)) {
            result.push({node: child, groupOffset: 0});
            continue;
        }
        if (!TRANSPARENT_CONTAINER_TAGS.has(tagName)) {
            continue;
        }
        const groupOffset = Number(parseAttribute<number>(child.attributes.offset) ?? 0);
        const seriesInGroup: TNode[] = [];
        for (const grandchild of child.children) {
            if (SERIES_TAGS.has(grandchild.tagName ?? '')) {
                seriesInGroup.push(grandchild);
            }
        }
        const groupSize = seriesInGroup.length;
        for (let i = 0; i < seriesInGroup.length; i++) {
            const seriesNode = seriesInGroup.at(i);
            if (!seriesNode) {
                continue;
            }
            const shift = (i - (groupSize - 1) / 2) * groupOffset;
            result.push({node: seriesNode, groupOffset: shift});
        }
    }
    return result;
}

/**
 * In horizontal mode the value axis becomes X and the category axis becomes Y, so the
 * top-level `domain` and `domainPadding` attributes from the HTML need their x/y components
 * swapped to match the new orientation.
 */
function swapDomain(domain: CartesianChartProps['domain']): CartesianChartProps['domain'] {
    if (!domain) {
        return domain;
    }
    return {x: domain.y, y: domain.x};
}

function swapDomainPadding(padding: CartesianChartProps['domainPadding']): CartesianChartProps['domainPadding'] {
    if (padding === undefined || typeof padding === 'number') {
        return padding;
    }
    return {
        left: padding.top,
        right: padding.bottom,
        top: padding.left,
        bottom: padding.right,
    };
}

/**
 * Renders the CartesianChart with data, axes, and domain config drawn from context.
 * Labels and legend overlays are handled internally via `renderOutside`.
 */
function VictoryChartCartesian() {
    // Context providers mounted outside the Skia canvas (like VictoryChartProvider) are not
    // visible to components rendered inside CartesianChart's children fn — Skia canvases use a
    // separate reconciler. We snapshot the values we need here and pass them through props.
    const {data, xKey, yKeys, xAxis, yAxis, tnode, labelItems, legendItems, horizontal} = useVictoryChartContext();

    const rawDomain = parseAttribute<CartesianChartProps['domain']>(tnode.attributes.domain);
    const rawDomainPadding = parseDomainPadding(tnode.attributes.domainpadding);

    return (
        <CartesianChart
            data={Object.values(data)}
            xKey={xKey}
            yKeys={yKeys}
            xAxis={xAxis}
            yAxis={yAxis}
            domain={horizontal ? swapDomain(rawDomain) : rawDomain}
            domainPadding={horizontal ? swapDomainPadding(rawDomainPadding) : rawDomainPadding}
            padding={parseAttribute(tnode.attributes.padding)}
            renderOutside={(renderArgs) => (
                <VictoryChartRenderArgsProvider value={renderArgs}>
                    <VictoryChartLabels labelItems={labelItems} />
                    <VictoryChartLegend legendItems={legendItems} />
                </VictoryChartRenderArgsProvider>
            )}
        >
            {(renderArgs) => (
                <VictoryChartRenderArgsProvider value={renderArgs}>
                    {collectSeriesNodes(tnode).map(({node, groupOffset}) => (
                        <VictoryChartSeries
                            key={`${node.tagName ?? 'node'}-${getYKey(node)}`}
                            tnode={node}
                            horizontal={horizontal}
                            groupOffset={groupOffset}
                        />
                    ))}
                </VictoryChartRenderArgsProvider>
            )}
        </CartesianChart>
    );
}

VictoryChartCartesian.displayName = 'VictoryChartCartesian';

export default VictoryChartCartesian;
