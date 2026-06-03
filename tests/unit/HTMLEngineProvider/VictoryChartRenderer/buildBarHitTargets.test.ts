import type {PointsArray} from 'victory-native';
import buildBarHitTargets from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/buildBarHitTargets';
import getBarTooltipKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getBarTooltipKey';

function createPoint(x: number, y: number, xValue: number, yValue: number): PointsArray[number] {
    return {x, y, xValue, yValue};
}

describe('buildBarHitTargets', () => {
    it('builds vertical bar hit targets from render points', () => {
        const yKey = 'y1';
        const tooltipKeyToIndex = {
            [getBarTooltipKey(yKey, 1.13)]: 0,
        };

        const targets = buildBarHitTargets({
            points: {
                [yKey]: [createPoint(100, 50, 1.13, 320)],
            },
            barYKeys: [yKey],
            barSeriesConfig: {[yKey]: {barWidth: 11}},
            tooltipKeyToIndex,
            isHorizontal: false,
            valueAxisZero: 200,
        });

        expect(targets).toHaveLength(1);
        expect(targets.at(0)).toMatchObject({
            left: 94.5,
            right: 105.5,
            top: 50,
            bottom: 200,
            tooltipIndex: 0,
            centerX: 100,
            barTopY: 50,
        });
    });

    it('builds horizontal bar hit targets using category aliases', () => {
        const yKey = 'y2';
        const tooltipKeyToIndex = {
            [getBarTooltipKey(yKey, 0)]: 1,
        };

        const targets = buildBarHitTargets({
            points: {
                [yKey]: [createPoint(180, 120, 180, 0)],
            },
            barYKeys: [yKey],
            barSeriesConfig: {[yKey]: {barWidth: 16}},
            tooltipKeyToIndex,
            isHorizontal: true,
            categories: ['Carlos Martins'],
            valueAxisZero: 96,
        });

        expect(targets).toHaveLength(1);
        expect(targets.at(0)).toMatchObject({
            left: 96,
            right: 180,
            top: 112,
            bottom: 128,
            tooltipIndex: 1,
        });
    });
});
