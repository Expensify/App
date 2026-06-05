import type {TNode} from 'react-native-render-html';
import type {BarGroupLayout, BarSeriesConfig, BarTooltipEntry, PieTooltipEntry, RawChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import {parseVictoryBarTooltips} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/buildBarTooltipEntries';
import getYKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getYKey';
import isNonNullObject from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/isNonNullObject';
import parseArrayAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseArrayAttribute';
import parseAttribute from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/parseAttribute';

type ExtractVictoryChartTooltipContext = {
    isHorizontal?: boolean;
    categories?: string[];
};

type VictoryChartTooltipData = {
    barTooltipEntries: BarTooltipEntry[];
    barYKeys: YKey[];
    barSeriesConfig: Partial<Record<YKey, BarSeriesConfig>>;
    barGroupLayouts: BarGroupLayout[];
    pieTooltipEntries: PieTooltipEntry[];
};

function extractVictoryBarGroupLayout(tnode: TNode): BarGroupLayout | null {
    const barChildren = tnode.children.filter((child) => child.tagName === 'victorybar');
    const firstBarChild = barChildren.at(0);

    if (!firstBarChild) {
        return null;
    }

    const barWidth = firstBarChild.attributes.barwidth !== undefined ? Number(parseAttribute(firstBarChild.attributes.barwidth)) : undefined;
    const offset = tnode.attributes.offset !== undefined ? Number(parseAttribute(tnode.attributes.offset)) : 0;

    return {
        yKeys: barChildren.map((child) => getYKey(child)),
        barWidth,
        offset,
    };
}

function extractVictoryPieTooltipEntries(tnode: TNode): PieTooltipEntry[] {
    const categories = parseArrayAttribute<RawChartData>(tnode.attributes.data).filter(isNonNullObject<RawChartData>);
    const labels = parseArrayAttribute<string>(tnode.attributes.labels);

    return categories.map((category, index) => {
        const explicitLabel = labels.at(index);
        return {
            label: explicitLabel ?? String(category.x),
            total: category.y,
            isLabelOnly: explicitLabel !== undefined,
        };
    });
}

function walkVictoryChartTreeForTooltips(tnode: TNode, context: ExtractVictoryChartTooltipContext, accumulator: VictoryChartTooltipData): void {
    const tagName = tnode.tagName ?? '';

    if (tagName === 'victorybar') {
        const {entries, yKey, seriesConfig} = parseVictoryBarTooltips(tnode, context.isHorizontal ?? false, context.categories);
        accumulator.barTooltipEntries.push(...entries);
        accumulator.barYKeys.push(yKey);
        accumulator.barSeriesConfig[yKey] = seriesConfig;
    }

    if (tagName === 'victorygroup') {
        const layout = extractVictoryBarGroupLayout(tnode);
        if (layout) {
            accumulator.barGroupLayouts.push(layout);
        }
    }

    if (tagName === 'victorypie') {
        accumulator.pieTooltipEntries.push(...extractVictoryPieTooltipEntries(tnode));
    }

    for (const child of tnode.children) {
        walkVictoryChartTreeForTooltips(child, context, accumulator);
    }
}

/**
 * Walks the HTML tnode tree once after chart config parsing to collect tooltip metadata.
 */
function extractVictoryChartTooltipData(tnode: TNode, context: ExtractVictoryChartTooltipContext): VictoryChartTooltipData {
    const accumulator: VictoryChartTooltipData = {
        barTooltipEntries: [],
        barYKeys: [],
        barSeriesConfig: {},
        barGroupLayouts: [],
        pieTooltipEntries: [],
    };

    walkVictoryChartTreeForTooltips(tnode, context, accumulator);
    return accumulator;
}

export default extractVictoryChartTooltipData;
export {extractVictoryBarGroupLayout, extractVictoryPieTooltipEntries};
export type {ExtractVictoryChartTooltipContext, VictoryChartTooltipData};
