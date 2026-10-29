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
