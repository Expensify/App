import type {YKey} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import {getVictoryBarInteractionGeometry, isCursorInVerticalBar} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getVictoryBarInteractionGeometry';

import type {ChartBounds, PointsArray} from 'victory-native';

const chartBounds: ChartBounds = {
    left: 0,
    right: 400,
    top: 0,
    bottom: 300,
};

function buildPoint(x: number, y: number): PointsArray[number] {
    return {
        x,
        xValue: 'Jan',
        y,
        yValue: 10,
    };
}

describe('getVictoryBarInteractionGeometry', () => {
    it('should scale an explicit bar width with the scale the chart is rendered at', () => {
        // Given a bar series that declares a 20px bar width, in a chart rendered at half its design size
        const seriesConfig = {barWidth: 20};

        // When the hit-test geometry is computed for the rendered chart
        const geometry = getVictoryBarInteractionGeometry(buildPoint(100, 80), chartBounds, 5, seriesConfig, 0.5);

        // Then the hit area is as wide as the bar that is drawn, which is scaled the same way
        expect(geometry?.width).toBe(10);
    });

    it('should scale grouped bar widths and offsets with the scale the chart is rendered at', () => {
        // Given two grouped bars that declare a width and a group offset in design pixels
        const yKeys = ['y0', 'y1'] as YKey[];
        const group = {yKeys, index: 1, barWidth: 20, offsetAttribute: '24'};
        const designGeometry = getVictoryBarInteractionGeometry(buildPoint(200, 80), chartBounds, 2, {group});

        // When the same chart is rendered at half its design size, with its bounds and points halved
        const scaledBounds: ChartBounds = {left: 0, right: 200, top: 0, bottom: 150};
        const scaledGeometry = getVictoryBarInteractionGeometry(buildPoint(100, 40), scaledBounds, 2, {group}, 0.5);

        // Then the hit area is the design one at half size, so it stays on the drawn bar
        expect(scaledGeometry?.width).toBeCloseTo((designGeometry?.width ?? 0) / 2);
        expect(scaledGeometry?.x).toBeCloseTo((designGeometry?.x ?? 0) / 2);
    });

    it('uses the same fallback width formula as victory-native Bar', () => {
        const geometry = getVictoryBarInteractionGeometry(buildPoint(100, 80), chartBounds, 5);

        expect(geometry?.width).toBe(70);
        expect(geometry?.x).toBe(100);
    });

    it('offsets grouped bars to their rendered side-by-side centers', () => {
        const yKeys = ['y0', 'y1'] as YKey[];
        const firstGeometry = getVictoryBarInteractionGeometry(buildPoint(100, 80), chartBounds, 2, {
            group: {
                yKeys,
                index: 0,
            },
        });
        const secondGeometry = getVictoryBarInteractionGeometry(buildPoint(100, 120), chartBounds, 2, {
            group: {
                yKeys,
                index: 1,
            },
        });

        expect(firstGeometry?.x).toBeLessThan(100);
        expect(secondGeometry?.x).toBeGreaterThan(100);
        expect(firstGeometry?.x).not.toBe(secondGeometry?.x);
        expect(firstGeometry?.width).toBe(secondGeometry?.width);
    });

    it('mirrors explicit grouped bar width and offset attributes', () => {
        const yKeys = ['y0', 'y1'] as YKey[];
        const firstGeometry = getVictoryBarInteractionGeometry(buildPoint(100, 80), chartBounds, 2, {
            group: {
                yKeys,
                index: 0,
                barWidth: 20,
                offsetAttribute: '30',
            },
        });
        const secondGeometry = getVictoryBarInteractionGeometry(buildPoint(100, 120), chartBounds, 2, {
            group: {
                yKeys,
                index: 1,
                barWidth: 20,
                offsetAttribute: '30',
            },
        });

        expect(firstGeometry?.x).toBe(85);
        expect(secondGeometry?.x).toBe(115);
        expect(firstGeometry?.width).toBe(20);
        expect(secondGeometry?.width).toBe(20);
    });

    it('hit-tests negative bars against the zero baseline instead of the chart bottom', () => {
        expect(isCursorInVerticalBar(100, 225, 100, 250, 40, 200)).toBe(true);
        expect(isCursorInVerticalBar(100, 275, 100, 250, 40, 200)).toBe(false);
    });
});
