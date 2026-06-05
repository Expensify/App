import {useLayoutEffect} from 'react';
import type {CartesianChartRenderArg} from 'victory-native';
import type {BarHitTarget} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import type {BarGroupLayout, BarSeriesConfig, CartesianChartData, YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import buildBarHitTargets from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/buildBarHitTargets';

type VictoryChartBarHitTargetsSyncProps = {
    renderArgs: CartesianChartRenderArg<CartesianChartData, YKey>;
    updateHitTargets: (targets: BarHitTarget[]) => void;
    barYKeys: YKey[];
    barSeriesConfig: Partial<Record<YKey, BarSeriesConfig>>;
    barGroupLayouts: BarGroupLayout[];
    tooltipKeyToIndex: Record<string, number>;
    isHorizontal: boolean;
    categories?: string[];
};

/**
 * Syncs bar hit targets after render using layout effect, avoiding render-phase ref updates.
 */
function VictoryChartBarHitTargetsSync({
    renderArgs,
    updateHitTargets,
    barYKeys,
    barSeriesConfig,
    barGroupLayouts,
    tooltipKeyToIndex,
    isHorizontal,
    categories,
}: VictoryChartBarHitTargetsSyncProps) {
    const valueAxisZero = isHorizontal ? renderArgs.xScale(0) : renderArgs.yScale(0);

    useLayoutEffect(() => {
        updateHitTargets(
            buildBarHitTargets({
                points: renderArgs.points,
                barYKeys,
                barSeriesConfig,
                barGroupLayouts,
                tooltipKeyToIndex,
                isHorizontal,
                categories,
                valueAxisZero,
            }),
        );
    }, [barGroupLayouts, barSeriesConfig, barYKeys, categories, isHorizontal, renderArgs, tooltipKeyToIndex, updateHitTargets, valueAxisZero]);

    return null;
}

VictoryChartBarHitTargetsSync.displayName = 'VictoryChartBarHitTargetsSync';

export default VictoryChartBarHitTargetsSync;
