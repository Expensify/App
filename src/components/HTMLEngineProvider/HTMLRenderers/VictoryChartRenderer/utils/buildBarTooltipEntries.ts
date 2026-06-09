import type {TNode} from 'react-native-render-html';
import type {BarSeriesConfig, BarTooltipEntry, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import formatBarTooltipLabel from './formatBarTooltipLabel';
import getBarTooltipKey from './getBarTooltipKey';
import getYKey from './getYKey';
import {parseAttributeAsNumber, parseAttributeAsStringArray} from './parseAttribute';
import parseRawChartData from './parseRawChartData';

type BuildBarTooltipEntriesParams = {
    tnode: TNode;
    yKey: YKey;
    isHorizontal: boolean;
    categories?: string[];
};

/**
 * Parses tooltip labels and values from a `<victorybar>` node.
 */
function buildBarTooltipEntries({tnode, yKey, isHorizontal, categories}: BuildBarTooltipEntriesParams): {
    entries: BarTooltipEntry[];
    seriesConfig: BarSeriesConfig;
} {
    const points = parseRawChartData(tnode.attributes.data);
    const labels = parseAttributeAsStringArray(tnode.attributes.labels) ?? [];
    const barWidth = parseAttributeAsNumber(tnode.attributes.barwidth);

    const entries: BarTooltipEntry[] = points.map((point, index) => {
        const explicitLabel = labels.at(index);
        const keyAliases: string[] = [];

        if (isHorizontal && categories && typeof point.x === 'string') {
            const categoryIndex = categories.indexOf(point.x);
            if (categoryIndex >= 0) {
                keyAliases.push(getBarTooltipKey(yKey, categoryIndex));
            }
        }

        return {
            key: getBarTooltipKey(yKey, point.x),
            keyAliases,
            label: explicitLabel ?? formatBarTooltipLabel(point, isHorizontal),
            total: point.y,
            isLabelOnly: explicitLabel !== undefined,
        };
    });

    return {
        entries,
        seriesConfig: {
            barWidth,
        },
    };
}

/**
 * Parses tooltip metadata from a `<victorybar>` node, including yKey assignment.
 */
function parseVictoryBarTooltips(
    tnode: TNode,
    isHorizontal: boolean,
    categories?: string[],
): {
    entries: BarTooltipEntry[];
    yKey: YKey;
    seriesConfig: BarSeriesConfig;
} {
    const yKey = getYKey(tnode);
    const {entries, seriesConfig} = buildBarTooltipEntries({tnode, yKey, isHorizontal, categories});

    return {entries, yKey, seriesConfig};
}

export {buildBarTooltipEntries, parseVictoryBarTooltips};
