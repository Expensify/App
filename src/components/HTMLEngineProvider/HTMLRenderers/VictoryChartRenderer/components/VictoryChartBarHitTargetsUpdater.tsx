import {useLayoutEffect} from 'react';
import type {PointsArray} from 'victory-native';
import {useVictoryChartRenderArgs} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartRenderArgsContext';
import {useVictoryChartContext} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/context/VictoryChartContext';
import type {BarHitTarget} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import {DEFAULT_BAR_WIDTH} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import resolveBarTooltipIndex from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveBarTooltipIndex';

type VictoryChartBarHitTargetsUpdaterProps = {
    valueAxisZero: number;
    updateHitTargets: (targets: BarHitTarget[]) => void;
};

function buildHitTargetFromPoint({
    point,
    barWidth,
    valueAxisZero,
    isHorizontal,
    tooltipIndex,
}: {
    point: PointsArray[number];
    barWidth: number;
    valueAxisZero: number;
    isHorizontal: boolean;
    tooltipIndex: number;
}): BarHitTarget | null {
    if (point.x == null || point.y == null) {
        return null;
    }

    if (isHorizontal) {
        const centerY = point.y;
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
 * Computes canvas hit targets for each bar and registers them with the tooltip gesture hook.
 */
function VictoryChartBarHitTargetsUpdater({valueAxisZero, updateHitTargets}: VictoryChartBarHitTargetsUpdaterProps) {
    const {points} = useVictoryChartRenderArgs();
    const {barYKeys, barSeriesConfig, tooltipKeyToIndex, isHorizontal, categories} = useVictoryChartContext();

    useLayoutEffect(() => {
        const targets: BarHitTarget[] = [];

        for (const yKey of barYKeys) {
            const seriesPoints = points[yKey] ?? [];
            const barWidth = barSeriesConfig[yKey]?.barWidth ?? DEFAULT_BAR_WIDTH;

            for (const point of seriesPoints) {
                const tooltipIndex = resolveBarTooltipIndex(yKey, point, isHorizontal ?? false, categories, tooltipKeyToIndex);
                if (tooltipIndex === undefined) {
                    continue;
                }

                const hitTarget = buildHitTargetFromPoint({
                    point,
                    barWidth,
                    valueAxisZero,
                    isHorizontal: isHorizontal ?? false,
                    tooltipIndex,
                });

                if (hitTarget) {
                    targets.push(hitTarget);
                }
            }
        }

        updateHitTargets(targets);
    }, [barSeriesConfig, barYKeys, categories, isHorizontal, points, tooltipKeyToIndex, updateHitTargets, valueAxisZero]);

    return null;
}

VictoryChartBarHitTargetsUpdater.displayName = 'VictoryChartBarHitTargetsUpdater';

export default VictoryChartBarHitTargetsUpdater;
