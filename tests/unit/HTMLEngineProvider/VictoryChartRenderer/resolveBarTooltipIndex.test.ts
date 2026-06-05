import {findBarAtCursor} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/hooks/useVictoryChartBarTooltips';
import getBarTooltipKey from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/getBarTooltipKey';
import resolveBarTooltipIndex from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/resolveBarTooltipIndex';

describe('resolveBarTooltipIndex', () => {
    const tooltipKeyToIndex = {
        [getBarTooltipKey('y1', 1.13)]: 0,
        [getBarTooltipKey('y1', 2.13)]: 1,
        [getBarTooltipKey('y2', 'Alice')]: 2,
        [getBarTooltipKey('y2', 0)]: 2,
    };

    it('resolves vertical bars by xValue', () => {
        expect(resolveBarTooltipIndex('y1', {xValue: 1.13, yValue: 4500}, false, undefined, tooltipKeyToIndex)).toBe(0);
        expect(resolveBarTooltipIndex('y1', {xValue: 2.13, yValue: 3200}, false, undefined, tooltipKeyToIndex)).toBe(1);
    });

    it('resolves horizontal bars by category index alias', () => {
        const categories = ['Alice', 'Bob'];

        expect(resolveBarTooltipIndex('y2', {xValue: 5000, yValue: 0}, true, categories, tooltipKeyToIndex)).toBe(2);
    });

    it('resolves horizontal bars by category name', () => {
        const categories = ['Alice', 'Bob'];

        expect(resolveBarTooltipIndex('y2', {xValue: 5000, yValue: 0}, true, categories, tooltipKeyToIndex)).toBe(2);
        expect(resolveBarTooltipIndex('y2', {xValue: 'Alice', yValue: 0}, true, categories, tooltipKeyToIndex)).toBe(2);
    });

    it('returns undefined when no tooltip metadata matches', () => {
        expect(resolveBarTooltipIndex('y1', {xValue: 99, yValue: 0}, false, undefined, tooltipKeyToIndex)).toBeUndefined();
    });
});

describe('findBarAtCursor', () => {
    const targets = [
        {
            left: 0,
            right: 10,
            top: 0,
            bottom: 10,
            tooltipIndex: 0,
            centerX: 5,
            barTopY: 0,
        },
    ];

    it('returns the target when the cursor is inside the bar bounds', () => {
        expect(findBarAtCursor(targets, 5, 5)?.tooltipIndex).toBe(0);
    });

    it('returns null when the cursor is outside the bar bounds', () => {
        expect(findBarAtCursor(targets, 20, 5)).toBeNull();
    });

    it('prefers the closest bar when multiple grouped targets overlap horizontally', () => {
        const overlappingTargets = [
            {
                left: 0,
                right: 100,
                top: 90,
                bottom: 106,
                tooltipIndex: 0,
                centerX: 50,
                barTopY: 90,
            },
            {
                left: 0,
                right: 100,
                top: 110,
                bottom: 126,
                tooltipIndex: 1,
                centerX: 50,
                barTopY: 110,
            },
        ];

        expect(findBarAtCursor(overlappingTargets, 50, 95)?.tooltipIndex).toBe(0);
        expect(findBarAtCursor(overlappingTargets, 50, 120)?.tooltipIndex).toBe(1);
    });
});
