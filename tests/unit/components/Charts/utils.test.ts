import {DIAGONAL_ANGLE_RADIAN_THRESHOLD, LABEL_ROTATIONS, SIN_45} from '@components/Charts/constants';
import type {ChartDataPoint, PieSlice} from '@components/Charts/types';
import {
    calculateMinDomainPadding,
    edgeLabelsFit,
    edgeMaxLabelWidth,
    effectiveHeight,
    effectiveWidth,
    findSliceAtPosition,
    getAdditionalOffset,
    getChartColor,
    getNiceLowerBound,
    getNiceUpperBound,
    isAngleInSlice,
    isCursorInSkewedLabel,
    isCursorOverChartLabel,
    labelOverhang,
    maxVisibleCount,
    normalizeAngle,
    processDataIntoSlices,
    rotatedLabelCenterCorrection,
    rotatedLabelYOffset,
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
        expect(effectiveWidth(100, LINE_HEIGHT, LABEL_ROTATIONS.HORIZONTAL)).toBe(100);
    });

    it('returns labelWidth * sin(45°) at 45°', () => {
        expect(effectiveWidth(100, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL)).toBeCloseTo(100 * SIN_45);
    });

    it('returns lineHeight at 90°', () => {
        expect(effectiveWidth(100, LINE_HEIGHT, LABEL_ROTATIONS.VERTICAL)).toBe(LINE_HEIGHT);
    });
});

describe('effectiveHeight', () => {
    it('returns lineHeight at 0°', () => {
        expect(effectiveHeight(100, LINE_HEIGHT, LABEL_ROTATIONS.HORIZONTAL)).toBe(LINE_HEIGHT);
    });

    it('returns (labelWidth + lineHeight) * sin(45°) at 45°', () => {
        expect(effectiveHeight(100, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL)).toBeCloseTo((100 + LINE_HEIGHT) * SIN_45);
    });

    it('returns labelWidth at 90°', () => {
        expect(effectiveHeight(100, LINE_HEIGHT, LABEL_ROTATIONS.VERTICAL)).toBe(100);
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
        const result = labelOverhang(100, LINE_HEIGHT, LABEL_ROTATIONS.HORIZONTAL, false);
        expect(result.left).toBe(50);
        expect(result.right).toBe(50);
    });

    it('returns symmetric overhang at 45° when centered', () => {
        const result = labelOverhang(100, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, false);
        expect(result.left).toBeCloseTo(result.right);
    });

    it('returns asymmetric overhang at 45° when right-aligned', () => {
        const result = labelOverhang(100, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, true);
        expect(result.left).toBeGreaterThan(result.right);
    });

    it('returns lineHeight/2 on both sides at 90°', () => {
        const result = labelOverhang(100, LINE_HEIGHT, LABEL_ROTATIONS.VERTICAL, false);
        expect(result.left).toBe(LINE_HEIGHT / 2);
        expect(result.right).toBe(LINE_HEIGHT / 2);
    });
});

describe('edgeLabelsFit', () => {
    const base = {
        firstLabelWidth: 40,
        lastLabelWidth: 40,
        lineHeight: LINE_HEIGHT,
        rotation: LABEL_ROTATIONS.HORIZONTAL,
        firstTickLeftSpace: 30,
        lastTickRightSpace: 30,
        rightAligned: false,
    };

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
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.HORIZONTAL, false, 'first')).toBe(100);
    });

    it('returns Infinity at 90° (overhang is constant)', () => {
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.VERTICAL, false, 'first')).toBe(Infinity);
    });

    it('returns finite value at 45° for first label when centered', () => {
        const result = edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, false, 'first');
        expect(result).toBeGreaterThan(0);
        expect(result).not.toBe(Infinity);
    });

    it('returns Infinity at 45° for last label when right-aligned', () => {
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, true, 'last')).toBe(Infinity);
    });

    it('returns finite value at 45° for first label when right-aligned', () => {
        const result = edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, true, 'first');
        expect(result).toBeGreaterThan(0);
        expect(result).not.toBe(Infinity);
    });

    it('returns 0 when edgeSpace is too small at 45° centered', () => {
        // edgeSpace/SIN_45 - halfLH ≤ 0 → Math.max(0, ...) = 0
        expect(edgeMaxLabelWidth(1, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, false, 'first')).toBe(0);
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
        {label: 'A', value: 75, color: '#000', percentage: 75, startAngle: -90, endAngle: 180, originalIndex: 0, ordinalIndex: 0, tooltipPosition: {x: 0, y: 0}},
        {label: 'B', value: 25, color: '#fff', percentage: 25, startAngle: 180, endAngle: 270, originalIndex: 1, ordinalIndex: 1, tooltipPosition: {x: 0, y: 0}},
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
        expect(processDataIntoSlices([], 0, {centerX: 0, centerY: 0, radius: 0})).toEqual([]);
    });

    it('returns empty array when all values are zero', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', total: 0},
            {label: 'B', total: 0},
        ];
        expect(processDataIntoSlices(data, 0, {centerX: 0, centerY: 0, radius: 0})).toEqual([]);
    });

    it('creates a single slice covering 360 degrees for one data point', () => {
        const data: ChartDataPoint[] = [{label: 'Only', total: 100}];
        const slices = processDataIntoSlices(data, -90, {centerX: 0, centerY: 0, radius: 0});

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
        const slices = processDataIntoSlices(data, 0, {centerX: 0, centerY: 0, radius: 0});

        expect(slices.at(0)?.label).toBe('Large');
        expect(slices.at(1)?.label).toBe('Small');
    });

    it('treats negative values as positive for slice sizing', () => {
        const data: ChartDataPoint[] = [
            {label: 'Positive', total: 75},
            {label: 'Negative', total: -25},
        ];
        const slices = processDataIntoSlices(data, 0, {centerX: 0, centerY: 0, radius: 0});

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
        const slices = processDataIntoSlices(data, 0, {centerX: 0, centerY: 0, radius: 0});

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
        const slices = processDataIntoSlices(data, -90, {centerX: 0, centerY: 0, radius: 0});

        const totalSweep = slices.reduce((sum, s) => sum + (s.endAngle - s.startAngle), 0);
        expect(totalSweep).toBeCloseTo(360, 5);
    });

    it('chains consecutive angles without gaps', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', total: 50},
            {label: 'B', total: 30},
            {label: 'C', total: 20},
        ];
        const slices = processDataIntoSlices(data, -90, {centerX: 0, centerY: 0, radius: 0});

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
        const slices = processDataIntoSlices(data, 0, {centerX: 0, centerY: 0, radius: 0});
        const colors = slices.map((s) => s.color);
        const uniqueColors = new Set(colors);

        expect(uniqueColors.size).toBe(4);
    });
});

describe('isCursorInSkewedLabel', () => {
    // Axis-aligned unit square: clockwise rightUpper -> rightLower -> leftLower -> leftUpper
    const unitSquare = [
        {x: 1, y: 0},
        {x: 1, y: 1},
        {x: 0, y: 1},
        {x: 0, y: 0},
    ];

    it('returns true when cursor is inside the quadrilateral', () => {
        expect(isCursorInSkewedLabel(0.5, 0.5, unitSquare)).toBe(true);
    });

    it('returns false when cursor is to the left of the polygon', () => {
        expect(isCursorInSkewedLabel(-0.5, 0.5, unitSquare)).toBe(false);
    });

    it('returns false when cursor is to the right of the polygon', () => {
        expect(isCursorInSkewedLabel(1.5, 0.5, unitSquare)).toBe(false);
    });

    it('returns false when cursor is above the polygon', () => {
        expect(isCursorInSkewedLabel(0.5, -0.5, unitSquare)).toBe(false);
    });

    it('returns false when cursor is below the polygon', () => {
        expect(isCursorInSkewedLabel(0.5, 1.5, unitSquare)).toBe(false);
    });

    it('returns true when cursor is on an edge (boundary)', () => {
        expect(isCursorInSkewedLabel(1, 0.5, unitSquare)).toBe(true);
        expect(isCursorInSkewedLabel(0.5, 0, unitSquare)).toBe(true);
    });

    it('returns true when cursor is at a vertex', () => {
        expect(isCursorInSkewedLabel(0, 0, unitSquare)).toBe(true);
        expect(isCursorInSkewedLabel(1, 1, unitSquare)).toBe(true);
    });

    it('returns true when cursor is inside a skewed (45°) parallelogram', () => {
        // Parallelogram: rightUpper (5,0), rightLower (6,1), leftLower (1,1), leftUpper (0,0)
        const skewed = [
            {x: 5, y: 0},
            {x: 6, y: 1},
            {x: 1, y: 1},
            {x: 0, y: 0},
        ];
        expect(isCursorInSkewedLabel(3, 0.5, skewed)).toBe(true);
    });

    it('returns false when cursor is outside a skewed parallelogram', () => {
        const skewed = [
            {x: 5, y: 0},
            {x: 6, y: 1},
            {x: 1, y: 1},
            {x: 0, y: 0},
        ];
        expect(isCursorInSkewedLabel(10, 10, skewed)).toBe(false);
        expect(isCursorInSkewedLabel(-1, 0.5, skewed)).toBe(false);
    });

    it('returns true for empty corners (no edges to cross)', () => {
        expect(isCursorInSkewedLabel(0, 0, [])).toBe(true);
    });
});

describe('isCursorOverChartLabel', () => {
    const baseParams = {
        targetX: 10,
        labelY: 20,
        halfWidth: 5,
        padding: 2,
        yMin90: 15,
        yMax90: 25,
    };

    describe('0° (horizontal label)', () => {
        const params = () => ({...baseParams, angleRad: 0, cursorX: 10, cursorY: 20});

        it('returns true when cursor is inside the horizontal label box', () => {
            expect(isCursorOverChartLabel({...params()})).toBe(true);
            expect(isCursorOverChartLabel({...params(), cursorX: 12, cursorY: 21})).toBe(true);
        });

        it('returns false when cursor is to the left of the label', () => {
            expect(isCursorOverChartLabel({...params(), cursorX: 2})).toBe(false);
        });

        it('returns false when cursor is to the right of the label', () => {
            expect(isCursorOverChartLabel({...params(), cursorX: 18})).toBe(false);
        });

        it('returns false when cursor is above the label', () => {
            expect(isCursorOverChartLabel({...params(), cursorY: 15})).toBe(false);
        });

        it('returns false when cursor is below the label', () => {
            expect(isCursorOverChartLabel({...params(), cursorY: 25})).toBe(false);
        });

        it('returns true when cursor is on the horizontal boundary', () => {
            expect(isCursorOverChartLabel({...params(), cursorX: 5, cursorY: 20})).toBe(true);
            expect(isCursorOverChartLabel({...params(), cursorX: 15, cursorY: 20})).toBe(true);
        });

        it('returns true when cursor is on the vertical boundary', () => {
            expect(isCursorOverChartLabel({...params(), cursorX: 10, cursorY: 18})).toBe(true);
            expect(isCursorOverChartLabel({...params(), cursorX: 10, cursorY: 22})).toBe(true);
        });
    });

    describe('45° (skewed label)', () => {
        const unitSquare = [
            {x: 1, y: 0},
            {x: 1, y: 1},
            {x: 0, y: 1},
            {x: 0, y: 0},
        ];

        it('returns true when cursor is inside the skewed quadrilateral', () => {
            expect(
                isCursorOverChartLabel({
                    ...baseParams,
                    angleRad: Math.PI / 4,
                    cursorX: 0.5,
                    cursorY: 0.5,
                    corners45: unitSquare,
                }),
            ).toBe(true);
        });

        it('returns false when cursor is outside the skewed quadrilateral', () => {
            expect(
                isCursorOverChartLabel({
                    ...baseParams,
                    angleRad: Math.PI / 4,
                    cursorX: -1,
                    cursorY: 0.5,
                    corners45: unitSquare,
                }),
            ).toBe(false);
        });
    });

    describe('90° (vertical label)', () => {
        const params = () => ({...baseParams, angleRad: Math.PI / 2, cursorX: 10, cursorY: 20});

        it('returns true when cursor is inside the vertical label band', () => {
            expect(isCursorOverChartLabel({...params()})).toBe(true);
            expect(isCursorOverChartLabel({...params(), cursorY: 18})).toBe(true);
        });

        it('returns false when cursor is to the left of the label', () => {
            expect(isCursorOverChartLabel({...params(), cursorX: 5})).toBe(false);
        });

        it('returns false when cursor is to the right of the label', () => {
            expect(isCursorOverChartLabel({...params(), cursorX: 15})).toBe(false);
        });

        it('returns false when cursor is above the vertical bounds', () => {
            expect(isCursorOverChartLabel({...params(), cursorY: 10})).toBe(false);
        });

        it('returns false when cursor is below the vertical bounds', () => {
            expect(isCursorOverChartLabel({...params(), cursorY: 30})).toBe(false);
        });

        it('returns true when cursor is on vertical boundary', () => {
            expect(isCursorOverChartLabel({...params(), cursorY: 15})).toBe(true);
            expect(isCursorOverChartLabel({...params(), cursorY: 25})).toBe(true);
        });
    });
});

describe('getChartColor', () => {
    it('returns a non-empty string for index 0', () => {
        const color = getChartColor(0);
        expect(typeof color).toBe('string');
        expect(color.length).toBeGreaterThan(0);
    });

    it('returns different colors for consecutive indices', () => {
        expect(getChartColor(0)).not.toBe(getChartColor(1));
        expect(getChartColor(1)).not.toBe(getChartColor(2));
    });

    it('wraps around to the same color after the full palette (30 entries)', () => {
        expect(getChartColor(0)).toBe(getChartColor(30));
        expect(getChartColor(5)).toBe(getChartColor(35));
    });

    it('handles large indices via modulo wrapping', () => {
        expect(getChartColor(0)).toBe(getChartColor(300));
    });
});

describe('getAdditionalOffset', () => {
    // variables.iconSizeExtraSmall = 12
    it('returns iconSizeExtraSmall / 3 for 0° (horizontal)', () => {
        expect(getAdditionalOffset(0)).toBeCloseTo(12 / 3);
    });

    it('returns iconSizeExtraSmall / 1.5 for diagonal angles (0 < angle < DIAGONAL_ANGLE_RADIAN_THRESHOLD)', () => {
        expect(getAdditionalOffset(Math.PI / 4)).toBeCloseTo(12 / 1.5);
        // Just below the threshold
        expect(getAdditionalOffset(DIAGONAL_ANGLE_RADIAN_THRESHOLD - 0.001)).toBeCloseTo(12 / 1.5);
    });

    it('returns iconSizeExtraSmall / 3 for 90° (vertical, angle >= DIAGONAL_ANGLE_RADIAN_THRESHOLD)', () => {
        expect(getAdditionalOffset(Math.PI / 2)).toBeCloseTo(12 / 3);
        expect(getAdditionalOffset(DIAGONAL_ANGLE_RADIAN_THRESHOLD)).toBeCloseTo(12 / 3);
    });
});

describe('rotatedLabelCenterCorrection', () => {
    const ascent = 12;
    const descent = 4;

    it('returns 0 at 0° because sin(0) = 0', () => {
        expect(rotatedLabelCenterCorrection(ascent, descent, 0)).toBe(0);
    });

    it('returns (ascent - descent) / 2 at 90° because sin(90°) = 1', () => {
        expect(rotatedLabelCenterCorrection(ascent, descent, Math.PI / 2)).toBeCloseTo((ascent - descent) / 2);
    });

    it('returns a positive value at 45° when ascent > descent', () => {
        const result = rotatedLabelCenterCorrection(ascent, descent, Math.PI / 4);
        expect(result).toBeCloseTo(((ascent - descent) * SIN_45) / 2);
        expect(result).toBeGreaterThan(0);
    });

    it('returns 0 when ascent equals descent (symmetric font metrics)', () => {
        expect(rotatedLabelCenterCorrection(10, 10, Math.PI / 4)).toBeCloseTo(0);
    });

    it('returns a negative value when descent > ascent', () => {
        expect(rotatedLabelCenterCorrection(4, 12, Math.PI / 2)).toBeLessThan(0);
    });
});

describe('rotatedLabelYOffset', () => {
    const ascent = 12;
    const descent = 4;

    it('returns ascent at 0°', () => {
        expect(rotatedLabelYOffset(ascent, descent, 0)).toBe(ascent);
    });

    it('returns descent at 90°', () => {
        expect(rotatedLabelYOffset(ascent, descent, Math.PI / 2)).toBe(descent);
    });

    it('returns ascent * cos(angle) for intermediate angles', () => {
        expect(rotatedLabelYOffset(ascent, descent, Math.PI / 4)).toBeCloseTo(ascent * Math.cos(Math.PI / 4));
    });

    it('is always smaller at 45° than at 0° for positive ascent', () => {
        expect(rotatedLabelYOffset(ascent, descent, Math.PI / 4)).toBeLessThan(rotatedLabelYOffset(ascent, descent, 0));
    });
});

describe('calculateMinDomainPadding', () => {
    it('returns 0 for a single data point', () => {
        expect(calculateMinDomainPadding(400, 1)).toBe(0);
    });

    it('returns 0 for zero data points', () => {
        expect(calculateMinDomainPadding(400, 0)).toBe(0);
    });

    it('returns half the chart width for 2 points with no inner padding (line chart)', () => {
        // minPaddingRatio = 1 / (2 * (1 + 0)) = 0.5 → ceil(100 * 0.5) = 50
        expect(calculateMinDomainPadding(100, 2, 0)).toBe(50);
    });

    it('returns correct padding for multiple equally spaced points', () => {
        // 5 points, no innerPadding: ratio = 1 / (2 * 4) = 0.125 → ceil(400 * 0.125) = 50
        expect(calculateMinDomainPadding(400, 5, 0)).toBe(50);
    });

    it('uses innerPadding=0 as default', () => {
        expect(calculateMinDomainPadding(400, 5)).toBe(calculateMinDomainPadding(400, 5, 0));
    });

    it('produces a smaller padding with inner padding (bar chart)', () => {
        // innerPadding reduces the effective spacing between bars
        const withoutPadding = calculateMinDomainPadding(400, 5, 0);
        const withPadding = calculateMinDomainPadding(400, 5, 0.3);
        expect(withPadding).toBeLessThan(withoutPadding);
    });
});

describe('getNiceUpperBound', () => {
    it('returns rawMax unchanged when range is zero', () => {
        expect(getNiceUpperBound(0, 5)).toBe(0);
        expect(getNiceUpperBound(100, 5, 100)).toBe(100);
    });

    it('returns rawMax unchanged when tickCount <= 1', () => {
        expect(getNiceUpperBound(100, 1)).toBe(100);
        expect(getNiceUpperBound(90, 0)).toBe(90);
    });

    it('rounds up to next step boundary when rawMax is already on a step', () => {
        // range=100, step=20 → ceil(100/20)*20=100
        expect(getNiceUpperBound(100, 5)).toBe(100);
    });

    it('rounds up when rawMax falls between step boundaries', () => {
        // range=90, step=20 → ceil(90/20)*20=ceil(4.5)*20=5*20=100
        expect(getNiceUpperBound(90, 5)).toBe(100);
    });

    it('scales correctly for larger values', () => {
        // range=1000, step=200 → ceil(1000/200)*200=1000
        expect(getNiceUpperBound(1000, 5)).toBe(1000);
        // range=900, step=200 → ceil(900/200)*200=ceil(4.5)*200=1000
        expect(getNiceUpperBound(900, 5)).toBe(1000);
    });

    it('uses rawMin to compute the range when negative values are present', () => {
        // rawMax=100, rawMin=-100 → range=200, roughStep=50, magnitude=10, normalized=5 → step=50
        // ceil(100/50)*50=100
        expect(getNiceUpperBound(100, 5, -100)).toBe(100);
    });
});

describe('getNiceLowerBound', () => {
    it('returns rawMin unchanged for non-negative values', () => {
        expect(getNiceLowerBound(0, 5)).toBe(0);
        expect(getNiceLowerBound(10, 5)).toBe(10);
        expect(getNiceLowerBound(100, 5)).toBe(100);
    });

    it('returns rawMin unchanged when range is zero or tickCount <= 1', () => {
        expect(getNiceLowerBound(-100, 1, 0)).toBe(-100);
        expect(getNiceLowerBound(-100, 5, -100)).toBe(-100);
    });

    it('returns rawMin unchanged when rawMin is already on a step boundary', () => {
        // range=100, step=20 → floor(-100/20)*20=-5*20=-100
        expect(getNiceLowerBound(-100, 5, 0)).toBe(-100);
    });

    it('rounds down when rawMin falls between step boundaries', () => {
        // range=90, step=20 → floor(-90/20)*20=floor(-4.5)*20=-5*20=-100
        expect(getNiceLowerBound(-90, 5, 0)).toBe(-100);
    });

    it('uses rawMax to compute the range for mixed positive/negative data', () => {
        // rawMin=-50, rawMax=100 → range=150, roughStep=37.5, magnitude=10, normalized=3.75 >= 2 → step=20
        // floor(-50/20)*20=floor(-2.5)*20=-3*20=-60
        expect(getNiceLowerBound(-50, 5, 100)).toBe(-60);
    });
});
