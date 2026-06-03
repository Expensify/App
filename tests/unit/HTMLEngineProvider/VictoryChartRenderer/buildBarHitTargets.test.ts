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
            barGroupLayouts: [],
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
            barGroupLayouts: [],
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

    it('offsets grouped horizontal bars so each series has a distinct hit target', () => {
        const thisMonthKey = 'y-this-month';
        const lastMonthKey = 'y-last-month';
        const tooltipKeyToIndex = {
            [getBarTooltipKey(thisMonthKey, 'Carlos Martins')]: 0,
            [getBarTooltipKey(lastMonthKey, 'Carlos Martins')]: 1,
        };

        const targets = buildBarHitTargets({
            points: {
                [thisMonthKey]: [createPoint(220, 200, 220, 0)],
                [lastMonthKey]: [createPoint(140, 200, 140, 0)],
            },
            barYKeys: [thisMonthKey, lastMonthKey],
            barSeriesConfig: {
                [thisMonthKey]: {barWidth: 16},
                [lastMonthKey]: {barWidth: 16},
            },
            barGroupLayouts: [
                {
                    yKeys: [thisMonthKey, lastMonthKey],
                    barWidth: 16,
                    offset: 18,
                },
            ],
            tooltipKeyToIndex,
            isHorizontal: true,
            categories: ['Carlos Martins'],
            valueAxisZero: 96,
        });

        expect(targets).toHaveLength(2);
        expect(targets.at(0)?.tooltipIndex).toBe(0);
        expect(targets.at(1)?.tooltipIndex).toBe(1);
        expect(targets.at(0)?.top).toBeLessThan(targets.at(1)?.top ?? 0);
        expect(targets.at(0)?.bottom).toBeLessThan(targets.at(1)?.top ?? 0);
    });
});
