import type {ChartDataPoint, PieSlice} from '@components/Charts/types';
import {findSliceAtPosition, isAngleInSlice, normalizeAngle, processDataIntoSlices} from '@components/Charts/utils';

describe('normalizeAngle', () => {
    it('returns angle unchanged when within 0-360', () => {
        expect(normalizeAngle(90)).toBe(90);
        expect(normalizeAngle(0)).toBe(0);
        expect(normalizeAngle(359)).toBe(359);
    });

    it('wraps negative angles into 0-360 range', () => {
        expect(normalizeAngle(-90)).toBe(270);
        expect(normalizeAngle(-180)).toBe(180);
        expect(normalizeAngle(-1)).toBe(359);
    });

    it('wraps angles greater than 360', () => {
        expect(normalizeAngle(360)).toBe(0);
        expect(normalizeAngle(450)).toBe(90);
        expect(normalizeAngle(720)).toBe(0);
    });
});

describe('isAngleInSlice', () => {
    it('returns true when angle is inside the slice', () => {
        expect(isAngleInSlice(45, 0, 90)).toBe(true);
        expect(isAngleInSlice(0, 0, 90)).toBe(true);
    });

    it('returns false when angle is outside the slice', () => {
        expect(isAngleInSlice(100, 0, 90)).toBe(false);
        expect(isAngleInSlice(180, 0, 90)).toBe(false);
    });

    it('returns false when angle is at the exact endAngle (exclusive)', () => {
        expect(isAngleInSlice(90, 0, 90)).toBe(false);
    });

    it('handles wrap-around slices that cross 0 degrees', () => {
        expect(isAngleInSlice(355, 350, 10)).toBe(true);
        expect(isAngleInSlice(5, 350, 10)).toBe(true);
        expect(isAngleInSlice(180, 350, 10)).toBe(false);
    });

    it('handles negative input angles', () => {
        expect(isAngleInSlice(-90, 260, 280)).toBe(true);
        expect(isAngleInSlice(-90, 100, 200)).toBe(false);
    });

    it('matches any angle for a full-circle slice (360 degrees)', () => {
        expect(isAngleInSlice(0, -90, 270)).toBe(true);
        expect(isAngleInSlice(90, -90, 270)).toBe(true);
        expect(isAngleInSlice(-45, -90, 270)).toBe(true);
        expect(isAngleInSlice(269, -90, 270)).toBe(true);
    });

    it('rejects all angles for a zero-sweep slice where start equals end', () => {
        expect(isAngleInSlice(90, 90, 90)).toBe(false);
        expect(isAngleInSlice(0, 90, 90)).toBe(false);
    });
});

describe('findSliceAtPosition', () => {
    const makeSlices = (): PieSlice[] => [
        {label: 'A', value: 75, color: '#000', percentage: 75, startAngle: -90, endAngle: 180, originalIndex: 0},
        {label: 'B', value: 25, color: '#fff', percentage: 25, startAngle: 180, endAngle: 270, originalIndex: 1},
    ];

    const center = 100;
    const radius = 100;

    it('returns -1 when cursor is outside the pie radius', () => {
        const slices = makeSlices();
        expect(findSliceAtPosition(250, 100, center, center, radius, 0, slices)).toBe(-1);
    });

    it('returns -1 when cursor is inside the inner radius (donut hole)', () => {
        const slices = makeSlices();
        expect(findSliceAtPosition(100, 100, center, center, radius, 50, slices)).toBe(-1);
    });

    it('returns the correct slice index for the largest slice', () => {
        const slices = makeSlices();
        // Cursor at (150, 100) is to the right of center → 0° angle → inside slice A (-90 to 180)
        expect(findSliceAtPosition(150, 100, center, center, radius, 0, slices)).toBe(0);
    });

    it('returns the correct slice index for a smaller slice', () => {
        const slices = makeSlices();
        // Cursor at (50, 50): dx=-50, dy=-50 → atan2 = -135° → normalized 225° → inside slice B (180 to 270)
        expect(findSliceAtPosition(50, 50, center, center, radius, 0, slices)).toBe(1);
    });

    it('returns matching slice when cursor is exactly at center with zero inner radius', () => {
        const slices = makeSlices();
        // distance = 0, which is not < 0 (innerRadius) and not > 100 (radius)
        // atan2(0, 0) = 0° → inside slice A
        expect(findSliceAtPosition(100, 100, center, center, radius, 0, slices)).toBe(0);
    });
});

describe('processDataIntoSlices', () => {
    it('returns empty array for empty data', () => {
        expect(processDataIntoSlices([], 0)).toEqual([]);
    });

    it('returns empty array when all values are zero', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', total: 0},
            {label: 'B', total: 0},
        ];
        expect(processDataIntoSlices(data, 0)).toEqual([]);
    });

    it('creates a single slice covering 360 degrees for one data point', () => {
        const data: ChartDataPoint[] = [{label: 'Only', total: 100}];
        const slices = processDataIntoSlices(data, -90);

        expect(slices).toHaveLength(1);
        expect(slices.at(0)?.label).toBe('Only');
        expect(slices.at(0)?.value).toBe(100);
        expect(slices.at(0)?.percentage).toBe(100);
        expect(slices.at(0)?.startAngle).toBe(-90);
        expect(slices.at(0)?.endAngle).toBe(270);
        expect(slices.at(0)?.originalIndex).toBe(0);
    });

    it('sorts slices by absolute value descending', () => {
        const data: ChartDataPoint[] = [
            {label: 'Small', total: 10},
            {label: 'Large', total: 90},
        ];
        const slices = processDataIntoSlices(data, 0);

        expect(slices.at(0)?.label).toBe('Large');
        expect(slices.at(1)?.label).toBe('Small');
    });

    it('treats negative values as positive for slice sizing', () => {
        const data: ChartDataPoint[] = [
            {label: 'Positive', total: 75},
            {label: 'Negative', total: -25},
        ];
        const slices = processDataIntoSlices(data, 0);

        expect(slices).toHaveLength(2);
        expect(slices.at(0)?.value).toBe(75);
        expect(slices.at(1)?.value).toBe(25);
        expect(slices.at(0)?.percentage).toBe(75);
        expect(slices.at(1)?.percentage).toBe(25);
    });

    it('preserves originalIndex mapping after sorting', () => {
        const data: ChartDataPoint[] = [
            {label: 'Small', total: 10},
            {label: 'Medium', total: 50},
            {label: 'Large', total: 100},
        ];
        const slices = processDataIntoSlices(data, 0);

        expect(slices.at(0)?.originalIndex).toBe(2); // Large was at index 2
        expect(slices.at(1)?.originalIndex).toBe(1); // Medium was at index 1
        expect(slices.at(2)?.originalIndex).toBe(0); // Small was at index 0
    });

    it('produces angles that sum to 360 degrees', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', total: 33},
            {label: 'B', total: 33},
            {label: 'C', total: 34},
        ];
        const slices = processDataIntoSlices(data, -90);

        const totalSweep = slices.reduce((sum, s) => sum + (s.endAngle - s.startAngle), 0);
        expect(totalSweep).toBeCloseTo(360, 5);
    });

    it('chains consecutive angles without gaps', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', total: 50},
            {label: 'B', total: 30},
            {label: 'C', total: 20},
        ];
        const slices = processDataIntoSlices(data, -90);

        for (let i = 1; i < slices.length; i++) {
            expect(slices.at(i)?.startAngle).toBeCloseTo(slices.at(i - 1)?.endAngle ?? 0, 10);
        }
    });

    it('assigns distinct colors from the chart palette', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', total: 40},
            {label: 'B', total: 30},
            {label: 'C', total: 20},
            {label: 'D', total: 10},
        ];
        const slices = processDataIntoSlices(data, 0);
        const colors = slices.map((s) => s.color);
        const uniqueColors = new Set(colors);

        expect(uniqueColors.size).toBe(4);
    });
});
