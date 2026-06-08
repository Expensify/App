import {DEFAULT_BAR_WIDTH} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import type {BarGroupLayout, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';

type BarGroupSeriesLayout = {
    seriesIndex: number;
    groupSize: number;
    barWidth: number;
    offset: number;
};

/**
 * Returns grouped-bar layout metadata for a series, when the series belongs to a `<victorygroup>`.
 */
function getBarGroupSeriesLayout(yKey: YKey, barGroupLayouts: BarGroupLayout[]): BarGroupSeriesLayout | null {
    for (const layout of barGroupLayouts) {
        const seriesIndex = layout.yKeys.indexOf(yKey);
        if (seriesIndex >= 0 && layout.yKeys.length > 1) {
            return {
                seriesIndex,
                groupSize: layout.yKeys.length,
                barWidth: layout.barWidth ?? DEFAULT_BAR_WIDTH,
                offset: layout.offset,
            };
        }
    }

    return null;
}

/**
 * Offsets the canvas Y position for bars rendered inside a grouped horizontal chart.
 */
function getGroupedBarCenterY(centerY: number, groupLayout: BarGroupSeriesLayout): number {
    const spacing = groupLayout.barWidth + groupLayout.offset;

    return centerY + (groupLayout.seriesIndex - (groupLayout.groupSize - 1) / 2) * spacing;
}

export {getBarGroupSeriesLayout, getGroupedBarCenterY};
