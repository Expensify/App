import type {PointsArray} from 'victory-native';
import type {BarHitTarget} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import {DEFAULT_BAR_WIDTH} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import type {BarGroupLayout, BarSeriesConfig, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import {getBarGroupSeriesLayout, getGroupedBarCenterY} from './getBarGroupSeriesLayout';
import resolveBarTooltipIndex from './resolveBarTooltipIndex';

type BuildBarHitTargetsParams = {
    points: Record<string, PointsArray>;
    barYKeys: YKey[];
    barSeriesConfig: Partial<Record<YKey, BarSeriesConfig>>;
    barGroupLayouts: BarGroupLayout[];
    tooltipKeyToIndex: Record<string, number>;
    isHorizontal: boolean;
    categories?: string[];
    valueAxisZero: number;
};

function buildHitTargetFromPoint({
    point,
    barWidth,
    valueAxisZero,
    isHorizontal,
    tooltipIndex,
    groupedCenterY,
}: {
    point: PointsArray[number];
    barWidth: number;
    valueAxisZero: number;
    isHorizontal: boolean;
    tooltipIndex: number;
    groupedCenterY?: number;
}): BarHitTarget | null {
    if (point.x == null || point.y == null) {
        return null;
    }

    if (isHorizontal) {
        const centerY = groupedCenterY ?? point.y;
        const barStart = Math.min(point.x, valueAxisZero);
        const barEnd = Math.max(point.x, valueAxisZero);
        const halfHeight = barWidth / 2;

        return {
            left: barStart,
            right: barEnd,
            top: centerY - halfHeight,
            bottom: centerY + halfHeight,
            tooltipIndex,
            centerX: (barStart + barEnd) / 2,
            barTopY: centerY - halfHeight,
        };
    }

    const centerX = point.x;
    const barTop = Math.min(point.y, valueAxisZero);
    const barBottom = Math.max(point.y, valueAxisZero);
    const halfWidth = barWidth / 2;

    return {
        left: centerX - halfWidth,
        right: centerX + halfWidth,
        top: barTop,
        bottom: barBottom,
        tooltipIndex,
        centerX,
        barTopY: barTop,
    };
}

/**
 * Computes canvas hit targets for each bar from Victory render args.
 */
function buildBarHitTargets({points, barYKeys, barSeriesConfig, barGroupLayouts, tooltipKeyToIndex, isHorizontal, categories, valueAxisZero}: BuildBarHitTargetsParams): BarHitTarget[] {
    const targets: BarHitTarget[] = [];

    for (const yKey of barYKeys) {
        const seriesPoints = points[yKey] ?? [];
        const barWidth = barSeriesConfig[yKey]?.barWidth ?? DEFAULT_BAR_WIDTH;
        const groupLayout = isHorizontal ? getBarGroupSeriesLayout(yKey, barGroupLayouts) : null;

        for (const point of seriesPoints) {
            const tooltipIndex = resolveBarTooltipIndex(yKey, point, isHorizontal, categories, tooltipKeyToIndex);
            if (tooltipIndex === undefined) {
                continue;
            }

            const groupedCenterY = groupLayout && point.y != null ? getGroupedBarCenterY(point.y, groupLayout) : undefined;

            const hitTarget = buildHitTargetFromPoint({
                point,
                barWidth,
                valueAxisZero,
                isHorizontal,
                tooltipIndex,
                groupedCenterY,
            });

            if (hitTarget) {
                targets.push(hitTarget);
            }
        }
    }

    return targets;
}

export default buildBarHitTargets;
