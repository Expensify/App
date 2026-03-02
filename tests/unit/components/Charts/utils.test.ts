import {SIN_45} from '@components/Charts/constants';
import type {ChartDataPoint, PieSlice} from '@components/Charts/types';
import {
    edgeLabelsFit,
    edgeMaxLabelWidth,
    effectiveHeight,
    effectiveWidth,
    findSliceAtPosition,
    isAngleInSlice,
    labelOverhang,
    maxVisibleCount,
    normalizeAngle,
    processDataIntoSlices,
    truncateLabel,
} from '@components/Charts/utils';

const LINE_HEIGHT = 16;

describe('truncateLabel', () => {
    const ellipsisWidth = 21;

    it('returns label unchanged when it fits within maxWidth', () => {
        expect(truncateLabel('Hello', 35, 50, ellipsisWidth)).toBe('Hello');
    });

    it('truncates and adds ellipsis when label exceeds maxWidth', () => {
        // available = 40 - 21 = 19, maxChars = floor(9 * 19/63) = 2
        expect(truncateLabel('LongLabel', 63, 40, ellipsisWidth)).toBe('Lo...');
    });

    it('returns label unchanged when labelWidth exactly equals maxWidth', () => {
        expect(truncateLabel('Hello', 50, 50, ellipsisWidth)).toBe('Hello');
    });

    it('returns only ellipsis when available space is zero or negative', () => {
        expect(truncateLabel('Text', 28, 20, ellipsisWidth)).toBe('...');
    });

    it('keeps at least 1 character before ellipsis even when space is extremely tight', () => {
        // available = 25 - 21 = 4, maxChars = max(1, floor(6 * 4/42)) = 1
        // Note: the hook enforces MIN_TRUNCATED_CHARS (10) so this extreme case
        // only tests the pure function's floor behavior.
        expect(truncateLabel('ABCDEF', 42, 25, ellipsisWidth)).toBe('A...');
    });
});

describe('effectiveWidth', () => {
    it('returns labelWidth at 0°', () => {
        expect(effectiveWidth(100, LINE_HEIGHT, 0)).toBe(100);
    });

    it('returns labelWidth * sin(45°) at 45°', () => {
        expect(effectiveWidth(100, LINE_HEIGHT, 45)).toBeCloseTo(100 * SIN_45);
    });

    it('returns lineHeight at 90°', () => {
        expect(effectiveWidth(100, LINE_HEIGHT, 90)).toBe(LINE_HEIGHT);
    });
});

describe('effectiveHeight', () => {
    it('returns lineHeight at 0°', () => {
        expect(effectiveHeight(100, LINE_HEIGHT, 0)).toBe(LINE_HEIGHT);
    });

    it('returns (labelWidth + lineHeight) * sin(45°) at 45°', () => {
        expect(effectiveHeight(100, LINE_HEIGHT, 45)).toBeCloseTo((100 + LINE_HEIGHT) * SIN_45);
    });

    it('returns labelWidth at 90°', () => {
        expect(effectiveHeight(100, LINE_HEIGHT, 90)).toBe(100);
    });
});

describe('maxVisibleCount', () => {
    it('returns correct count for simple case', () => {
        // Each label takes 20px + 4px padding = 24px. 100 / 24 = 4.16 → floor = 4
        expect(maxVisibleCount(100, 20)).toBe(4);
    });

    it('returns 0 when area is smaller than one label', () => {
        expect(maxVisibleCount(10, 20)).toBe(0);
    });

    it('returns 0 when area is zero', () => {
        expect(maxVisibleCount(0, 20)).toBe(0);
    });
});

describe('labelOverhang', () => {
    it('returns symmetric halves at 0° (horizontal)', () => {
        const result = labelOverhang(100, LINE_HEIGHT, 0, false);
        expect(result.left).toBe(50);
        expect(result.right).toBe(50);
    });

    it('returns symmetric overhang at 45° when centered', () => {
        const result = labelOverhang(100, LINE_HEIGHT, 45, false);
        expect(result.left).toBeCloseTo(result.right);
    });

    it('returns asymmetric overhang at 45° when right-aligned', () => {
        const result = labelOverhang(100, LINE_HEIGHT, 45, true);
        expect(result.left).toBeGreaterThan(result.right);
    });

    it('returns lineHeight/2 on both sides at 90°', () => {
        const result = labelOverhang(100, LINE_HEIGHT, 90, false);
        expect(result.left).toBe(LINE_HEIGHT / 2);
        expect(result.right).toBe(LINE_HEIGHT / 2);
    });
});

describe('edgeLabelsFit', () => {
    const base = {firstLabelWidth: 40, lastLabelWidth: 40, lineHeight: LINE_HEIGHT, rotation: 0, firstTickLeftSpace: 30, lastTickRightSpace: 30, rightAligned: false};

    it('returns true when both edges have enough space', () => {
        expect(edgeLabelsFit(base)).toBe(true);
    });

    it('returns false when first label overflows left', () => {
        expect(edgeLabelsFit({...base, firstLabelWidth: 100})).toBe(false);
    });

    it('returns false when last label overflows right', () => {
        expect(edgeLabelsFit({...base, lastLabelWidth: 100})).toBe(false);
    });
});

describe('edgeMaxLabelWidth', () => {
    it('returns 2 * edgeSpace at 0°', () => {
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, 0, false, 'first')).toBe(100);
    });

    it('returns Infinity at 90° (overhang is constant)', () => {
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, 90, false, 'first')).toBe(Infinity);
    });

    it('returns finite value at 45° for first label when centered', () => {
        const result = edgeMaxLabelWidth(50, LINE_HEIGHT, 45, false, 'first');
        expect(result).toBeGreaterThan(0);
        expect(result).not.toBe(Infinity);
    });

    it('returns Infinity at 45° for last label when right-aligned', () => {
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, 45, true, 'last')).toBe(Infinity);
    });

    it('returns finite value at 45° for first label when right-aligned', () => {
        const result = edgeMaxLabelWidth(50, LINE_HEIGHT, 45, true, 'first');
        expect(result).toBeGreaterThan(0);
        expect(result).not.toBe(Infinity);
    });

    it('returns 0 when edgeSpace is too small at 45° centered', () => {
        // edgeSpace/SIN_45 - halfLH ≤ 0 → Math.max(0, ...) = 0
        expect(edgeMaxLabelWidth(1, LINE_HEIGHT, 45, false, 'first')).toBe(0);
    });
});

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
