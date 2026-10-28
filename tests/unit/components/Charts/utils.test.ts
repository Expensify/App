import BAR_INNER_PADDING, {BAR_MAX_WIDTH, VERTICAL_BAR_DOMAIN_PADDING} from '@components/Charts/barChartConstants';
import type {ChartDataPoint, PieSlice} from '@components/Charts/types';
import {
    edgeLabelsFit,
    edgeMaxLabelWidth,
    effectiveHeight,
    effectiveWidth,
    findSliceAtPosition,
    getAxisLabelStep,
    getBarLayout,
    getAdditionalOffset,
    getDomainPaddingForEdgeSpace,
    getNiceYAxisTicks,
    getCartesianPlotBounds,
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
import {getBarChartHeight, getBarChartLoadingHeight, getCartesianChartHeight, getPieChartLoadingHeight} from '@components/Charts/utils/chartHeights';
import VictoryTheme, {
    CHART_CONTENT_MIN_HEIGHT,
    CHART_Y_SCALE_HEIGHT,
    DIAGONAL_ANGLE_RADIAN_THRESHOLD,
    LABEL_ROTATIONS,
    MAX_BAR_LABEL_LINES,
    SIN_45,
    X_AXIS_LABEL_MIN_HEIGHT,
} from '@components/Charts/VictoryTheme';
import {CHART_SERIES_KEY} from '@components/Search/buildChartSeries';

import variables from '@styles/variables';

import CONST from '@src/CONST';

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
        const result = labelOverhang(100, LINE_HEIGHT, LABEL_ROTATIONS.HORIZONTAL);
        expect(result.left).toBe(50);
        expect(result.right).toBe(50);
    });

    it('returns asymmetric overhang at 45°', () => {
        const result = labelOverhang(100, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL);
        expect(result.left).toBeGreaterThan(result.right);
    });

    it('returns lineHeight/2 on both sides at 90°', () => {
        const result = labelOverhang(100, LINE_HEIGHT, LABEL_ROTATIONS.VERTICAL);
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
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.HORIZONTAL, 'first')).toBe(100);
    });

    it('returns Infinity at 90° (overhang is constant)', () => {
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.VERTICAL, 'first')).toBe(Infinity);
    });

    it('returns finite value at 45° for first label', () => {
        const result = edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, 'first');
        expect(result).toBeGreaterThan(0);
        expect(result).not.toBe(Infinity);
    });

    it('returns Infinity at 45° for last label (right-aligned labels never overhang right)', () => {
        expect(edgeMaxLabelWidth(50, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, 'last')).toBe(Infinity);
    });

    it('returns 0 when edgeSpace is too small at 45°', () => {
        // edgeSpace/SIN_45 - halfLH ≤ 0 → Math.max(0, ...) = 0
        expect(edgeMaxLabelWidth(1, LINE_HEIGHT, LABEL_ROTATIONS.DIAGONAL, 'first')).toBe(0);
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
        expect(processDataIntoSlices([], CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0})).toEqual([]);
    });

    it('returns empty array when all values are zero', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', values: {[CHART_SERIES_KEY.PRIMARY]: 0}},
            {label: 'B', values: {[CHART_SERIES_KEY.PRIMARY]: 0}},
        ];
        expect(processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0})).toEqual([]);
    });

    it('creates a single slice covering 360 degrees for one data point', () => {
        const data: ChartDataPoint[] = [{label: 'Only', values: {[CHART_SERIES_KEY.PRIMARY]: 100}}];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0}, -90);

        expect(slices).toHaveLength(1);
        expect(slices.at(0)?.label).toBe('Only');
        expect(slices.at(0)?.value).toBe(100);
        expect(slices.at(0)?.percentage).toBe(100);
        expect(slices.at(0)?.startAngle).toBe(-90);
        expect(slices.at(0)?.endAngle).toBe(270);
        expect(slices.at(0)?.originalIndex).toBe(0);
    });

    it('uses the provided startAngle for the first slice', () => {
        const data: ChartDataPoint[] = [{label: 'Only', values: {[CHART_SERIES_KEY.PRIMARY]: 100}}];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0}, 45);

        expect(slices.at(0)?.startAngle).toBe(45);
        expect(slices.at(0)?.endAngle).toBe(405);
    });

    it('defaults to VictoryTheme.pie.startAngle when no startAngle is provided', () => {
        const data: ChartDataPoint[] = [{label: 'Only', values: {[CHART_SERIES_KEY.PRIMARY]: 100}}];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0});

        expect(slices.at(0)?.startAngle).toBe(VictoryTheme.pie.startAngle);
    });

    it('sorts slices by absolute value descending', () => {
        const data: ChartDataPoint[] = [
            {label: 'Small', values: {[CHART_SERIES_KEY.PRIMARY]: 10}},
            {label: 'Large', values: {[CHART_SERIES_KEY.PRIMARY]: 90}},
        ];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0});

        expect(slices.at(0)?.label).toBe('Large');
        expect(slices.at(1)?.label).toBe('Small');
    });

    it('treats negative values as positive for slice sizing', () => {
        const data: ChartDataPoint[] = [
            {label: 'Positive', values: {[CHART_SERIES_KEY.PRIMARY]: 75}},
            {label: 'Negative', values: {[CHART_SERIES_KEY.PRIMARY]: -25}},
        ];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0});

        expect(slices).toHaveLength(2);
        expect(slices.at(0)?.value).toBe(75);
        expect(slices.at(1)?.value).toBe(25);
        expect(slices.at(0)?.percentage).toBe(75);
        expect(slices.at(1)?.percentage).toBe(25);
    });

    it('preserves originalIndex mapping after sorting', () => {
        const data: ChartDataPoint[] = [
            {label: 'Small', values: {[CHART_SERIES_KEY.PRIMARY]: 10}},
            {label: 'Medium', values: {[CHART_SERIES_KEY.PRIMARY]: 50}},
            {label: 'Large', values: {[CHART_SERIES_KEY.PRIMARY]: 100}},
        ];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0});

        expect(slices.at(0)?.originalIndex).toBe(2); // Large was at index 2
        expect(slices.at(1)?.originalIndex).toBe(1); // Medium was at index 1
        expect(slices.at(2)?.originalIndex).toBe(0); // Small was at index 0
    });

    it('produces angles that sum to 360 degrees', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', values: {[CHART_SERIES_KEY.PRIMARY]: 33}},
            {label: 'B', values: {[CHART_SERIES_KEY.PRIMARY]: 33}},
            {label: 'C', values: {[CHART_SERIES_KEY.PRIMARY]: 34}},
        ];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0});

        const totalSweep = slices.reduce((sum, s) => sum + (s.endAngle - s.startAngle), 0);
        expect(totalSweep).toBeCloseTo(360, 5);
    });

    it('chains consecutive angles without gaps', () => {
        const data: ChartDataPoint[] = [
            {label: 'A', values: {[CHART_SERIES_KEY.PRIMARY]: 50}},
            {label: 'B', values: {[CHART_SERIES_KEY.PRIMARY]: 30}},
            {label: 'C', values: {[CHART_SERIES_KEY.PRIMARY]: 20}},
        ];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0});

        for (let i = 1; i < slices.length; i++) {
            expect(slices.at(i)?.startAngle).toBeCloseTo(slices.at(i - 1)?.endAngle ?? 0, 10);
        }
    });

    it('draws each slice in the color of its point', () => {
        // Given points that each carry the color their slice is drawn in
        const data: ChartDataPoint[] = [
            {label: 'A', values: {[CHART_SERIES_KEY.PRIMARY]: 10}, color: '#111'},
            {label: 'B', values: {[CHART_SERIES_KEY.PRIMARY]: 30}, color: '#222'},
        ];

        // When the data is turned into slices
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 0, centerY: 0, radius: 0, innerRadius: 0});

        // Then each slice keeps its point's color, even after the slices are sorted by size
        expect(slices.map((slice) => [slice.label, slice.color])).toEqual([
            ['B', '#222'],
            ['A', '#111'],
        ]);
    });

    it('places tooltipPosition at the ring midpoint along each slice mid-angle', () => {
        // Two equal slices from -90° produce mid-angles 0° (right) and 180° (left).
        // tooltipRadius = (innerRadius + radius) / 2 = (60 + 100) / 2 = 80.
        const data: ChartDataPoint[] = [
            {label: 'Right', values: {[CHART_SERIES_KEY.PRIMARY]: 50}},
            {label: 'Left', values: {[CHART_SERIES_KEY.PRIMARY]: 50}},
        ];
        const slices = processDataIntoSlices(data, CHART_SERIES_KEY.PRIMARY, {centerX: 200, centerY: 150, radius: 100, innerRadius: 60}, -90);

        expect(slices.at(0)?.tooltipPosition.x).toBeCloseTo(280, 5);
        expect(slices.at(0)?.tooltipPosition.y).toBeCloseTo(150, 5);

        expect(slices.at(1)?.tooltipPosition.x).toBeCloseTo(120, 5);
        expect(slices.at(1)?.tooltipPosition.y).toBeCloseTo(150, 5);
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

const {top: BAR_PAD_TOP, bottom: BAR_PAD_BOTTOM} = VERTICAL_BAR_DOMAIN_PADDING;

describe('getNiceYAxisTicks', () => {
    it('expands a flat series by ±1 and runs D3 nice/ticks so results are always nice values', () => {
        expect(getNiceYAxisTicks(-1, -1, 5)).toEqual([-2, -1.5, -1, -0.5, 0]);
    });

    it('produces nice ticks even when the singular value is not itself nice', () => {
        expect(getNiceYAxisTicks(-3.7, -3.7, 5)).toEqual([-4.5, -4, -3.5, -3]);
    });

    it('treats flat positive series as range [0, value] using bar chart padding', () => {
        expect(getNiceYAxisTicks(3, 3, 5, BAR_PAD_TOP, BAR_PAD_BOTTOM, CHART_Y_SCALE_HEIGHT)).toEqual([0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5]);
    });

    it('returns correct ticks for varied positive data with bar chart padding', () => {
        expect(getNiceYAxisTicks(90, 0, 5, BAR_PAD_TOP, BAR_PAD_BOTTOM, CHART_Y_SCALE_HEIGHT)).toEqual([0, 20, 40, 60, 80, 100]);
    });

    it('clamps positive rawDataMin to 0 so the y-axis floor matches Victory', () => {
        expect(getNiceYAxisTicks(90, 10, 5, BAR_PAD_TOP, BAR_PAD_BOTTOM, CHART_Y_SCALE_HEIGHT)).toEqual([0, 20, 40, 60, 80, 100]);
    });

    it('returns correct ticks for a high positive-only range with bar chart padding', () => {
        expect(getNiceYAxisTicks(9000, 0, 5, BAR_PAD_TOP, BAR_PAD_BOTTOM, CHART_Y_SCALE_HEIGHT)).toEqual([0, 2000, 4000, 6000, 8000, 10000]);
    });

    it('includes the next nice tick when data max sits near a tick boundary with bar chart padding', () => {
        expect(getNiceYAxisTicks(795, 0, 5, BAR_PAD_TOP, BAR_PAD_BOTTOM, CHART_Y_SCALE_HEIGHT)).toEqual([0, 200, 400, 600, 800, 1000]);
    });

    it('returns correct ticks for mixed positive and negative data with bar chart padding', () => {
        expect(getNiceYAxisTicks(100, -50, 5, BAR_PAD_TOP, BAR_PAD_BOTTOM, CHART_Y_SCALE_HEIGHT)).toEqual([-50, 0, 50, 100]);
    });

    it('returns correct ticks for varied negative data with bar chart padding', () => {
        expect(getNiceYAxisTicks(-10, -90, 5, BAR_PAD_TOP, BAR_PAD_BOTTOM, CHART_Y_SCALE_HEIGHT)).toEqual([-80, -60, -40, -20, 0]);
    });

    it('rounds intermediate ticks to eliminate floating-point noise', () => {
        expect(getNiceYAxisTicks(0, -1.11, 5)).toEqual([-1.2, -1, -0.8, -0.6, -0.4, -0.2, 0]);
    });
});

describe('getBarLayout', () => {
    it('keeps a 16px gap and fills the rest of the plot with bars', () => {
        // Given a 300px plot with 4 bars, wide enough for the full gap
        // When computing the bar layout
        const layout = getBarLayout(300, 4);

        // Then the gaps take 3 * 16px and the bars split the remaining width evenly
        expect(layout.gap).toBe(16);
        expect(layout.barWidth).toBe((300 - 3 * 16) / 4);
    });

    it('puts the outer bars flush with the plot edges', () => {
        // Given a 300px plot with 4 bars
        const plotWidth = 300;
        const {barWidth, xDomain} = getBarLayout(plotWidth, 4);

        // When mapping the x-domain onto the plot width
        const pxPerUnit = plotWidth / (xDomain[1] - xDomain[0]);

        // Then the first bar starts at the left edge and the last one ends at the right edge
        expect((0 - xDomain[0]) * pxPerUnit - barWidth / 2).toBeCloseTo(0, 5);
        expect((3 - xDomain[0]) * pxPerUnit + barWidth / 2).toBeCloseTo(plotWidth, 5);
    });

    it('caps the bar width and centers the bars when there are only a few', () => {
        // Given 2 bars in a plot wide enough that, uncapped, each would be well over BAR_MAX_WIDTH
        const plotWidth = 4 * BAR_MAX_WIDTH;

        // When computing the bar layout
        const {barWidth, gap, edgeSpace, xDomain} = getBarLayout(plotWidth, 2);

        // Then the bars stop at BAR_MAX_WIDTH, keep the 16px gap, and the leftover width is split evenly on both sides
        expect(barWidth).toBe(BAR_MAX_WIDTH);
        expect(gap).toBe(16);
        expect(edgeSpace).toBe((plotWidth - 2 * BAR_MAX_WIDTH - 16) / 2 + BAR_MAX_WIDTH / 2);
        const pxPerUnit = plotWidth / (xDomain[1] - xDomain[0]);
        expect((0 - xDomain[0]) * pxPerUnit).toBeCloseTo(edgeSpace, 5);
        expect((xDomain[1] - 1) * pxPerUnit).toBeCloseTo(edgeSpace, 5);
    });

    it('shrinks the gap when there are too many bars for it', () => {
        // Given 50 bars in a 300px plot, where 16px gaps alone would be wider than the plot
        // When computing the bar layout
        const layout = getBarLayout(300, 50);

        // Then the gap takes the same share of each slot as BAR_INNER_PADDING, so bars keep a positive width
        expect(layout.gap).toBeCloseTo((300 / 50) * BAR_INNER_PADDING, 5);
        expect(layout.barWidth).toBeGreaterThan(0);
    });

    it('does not count a gap when there is only one bar', () => {
        // Given one bar, which has no neighbor to keep a gap from
        // When computing the bar layout
        const layout = getBarLayout(300, 1);

        // Then the gap is 0, so the bar stays centered in the plot instead of being offset by a gap that isn't drawn
        expect(layout.gap).toBe(0);
        expect(layout.xDomain[0]).toBeCloseTo(-layout.xDomain[1], 5);
    });

    it('keeps every bar inside the plot before the plot is measured', () => {
        // Given a plot width of 0 (chart not yet laid out)
        // When computing the bar layout
        // Then barWidth is 0 so victory-native sizes the bars itself, and the domain gives each bar a slot centered on its x value
        expect(getBarLayout(0, 3)).toEqual({barWidth: 0, gap: 0, edgeSpace: 0, xDomain: [-0.5, 2.5]});
    });
});

describe('getCartesianChartHeight', () => {
    const ROTATED_LABEL_HEIGHT = 120;

    it('should give the loading box and a chart with one line of labels the same height', () => {
        // Given the loading box, which has no labels to measure, and a loaded chart whose labels fit on one line
        const loadingHeight = getCartesianChartHeight();

        // When the loaded chart sizes its box from the measured label strip
        const loadedHeight = getCartesianChartHeight(X_AXIS_LABEL_MIN_HEIGHT - 1);

        // Then both heights match, so the card does not jump when the chart replaces the spinner
        expect(loadedHeight).toBe(loadingHeight);
    });

    it('should grow the box when rotated labels need more room than one line', () => {
        // Given labels rotated so their strip is taller than one line of text
        // When the chart sizes its box
        const height = getCartesianChartHeight(ROTATED_LABEL_HEIGHT);

        // Then the box makes room for the whole strip, since clipping the labels would be worse than a jump
        expect(height).toBe(CHART_CONTENT_MIN_HEIGHT + VictoryTheme.axis.xAxisLabelGap + ROTATED_LABEL_HEIGHT);
    });
});

describe('getBarChartLoadingHeight', () => {
    // ExpensifyNeue's ascent plus descent at the 12px label size, (950 + 230) / 1000 of the em, which Skia measures for each label line
    const SKIA_LABEL_LINE_HEIGHT = 14.16;

    it('should give the loading box the height of a chart whose labels wrap', () => {
        // Given a bar chart with wrapped labels, which keeps two lines of label space whatever the names are
        const loadedHeight = getBarChartHeight(true, MAX_BAR_LABEL_LINES * SKIA_LABEL_LINE_HEIGHT);

        // When the loading box is sized before the chart has measured anything
        const loadingHeight = getBarChartLoadingHeight(true, true);

        // Then both heights match, so the card does not jump when the chart replaces the spinner
        expect(loadingHeight).toBeCloseTo(loadedHeight, 5);
    });
});

describe('getPieChartLoadingHeight', () => {
    // The narrowest card that fits the side legend: the 250px donut, the 24px gap and the 180px legend column
    const SIDE_LEGEND_MIN_CARD_WIDTH = 454;

    it('should reserve the donut height for a side legend once the card is measured', () => {
        // Given a responsive legend in a card just wide enough for it to sit beside the donut, on the narrow layout
        // When the loading box is sized from the measured card width
        const height = getPieChartLoadingHeight(SIDE_LEGEND_MIN_CARD_WIDTH, true, true, true);

        // Then it keeps the donut's height, since five legend rows fit beside it, and the measured width wins over the layout
        expect(height).toBe(CHART_CONTENT_MIN_HEIGHT);
    });

    it('should reserve a full stacked legend under the donut when the card is too narrow for a side legend', () => {
        // Given a responsive legend in a card 1px too narrow for the side legend, on the wide layout
        // When the loading box is sized from the measured card width, before the slice count is known
        const height = getPieChartLoadingHeight(SIDE_LEGEND_MIN_CARD_WIDTH - 1, false, true, true);

        // Then it reserves one row per slice Home can show, under the donut and the stack gap, since most cards fill the cap
        const rowCount = CONST.SEARCH.TOP_SEARCH_LIMIT;
        const legendHeight = rowCount * variables.fontSizeNormalHeight + (rowCount - 1) * VictoryTheme.pie.legendRowGap;
        expect(height).toBe(CHART_CONTENT_MIN_HEIGHT + VictoryTheme.pie.legendStackGap + legendHeight);
    });

    it('should reserve only the donut when the legend is hidden', () => {
        // Given a responsive pie with its legend turned off, in a card too narrow for a side legend
        // When the loading box is sized
        const height = getPieChartLoadingHeight(SIDE_LEGEND_MIN_CARD_WIDTH - 1, true, false, true);

        // Then it keeps the donut's height alone, since the chart draws no legend to stack
        expect(height).toBe(CHART_CONTENT_MIN_HEIGHT);
    });

    it('should assume a stacked legend on the narrow layout until the card is measured', () => {
        // Given a responsive legend whose card has not reported its width yet, on the narrow layout, where phone cards are too narrow for a side legend
        // When the loading box is sized before the width lands
        const height = getPieChartLoadingHeight(null, true, true, true);

        // Then it matches the stacked height a phone card measures into, so the box does not change when the width lands
        const stackedHeight = getPieChartLoadingHeight(SIDE_LEGEND_MIN_CARD_WIDTH - 1, true, true, true);
        expect(height).toBe(stackedHeight);
    });

    it('should assume a side legend on the wide layout until the card is measured', () => {
        // Given a responsive legend whose card has not reported its width yet, on the wide layout, where a typical desktop card fits a side legend
        // When the loading box is sized before the width lands
        const height = getPieChartLoadingHeight(null, false, true, true);

        // Then it keeps the donut's height that a desktop card measures into, so the box does not change when the width lands
        expect(height).toBe(CHART_CONTENT_MIN_HEIGHT);
    });
});

describe('getCartesianPlotBounds', () => {
    const PADDING_LEFT = VictoryTheme.axis.padding.left;

    it('reserves the right gutter for labels and the left base padding', () => {
        // Given a 300px container with a 30px right gutter
        // When computing the plot bounds
        // Then the plot spans from the left padding to the gutter, where victory-native puts it,
        // so labels laid out before the chart mounts line up with the plot it draws
        expect(getCartesianPlotBounds(300, 30)).toEqual({left: PADDING_LEFT, right: 300 - 30, width: 300 - 30 - PADDING_LEFT});
    });

    it('clamps to a zero-width plot when the container is too small for the gutters', () => {
        // Given a container narrower than the right gutter itself
        // When computing the plot bounds
        // Then the plot collapses to zero width at the left padding, because a negative width would break the bar and
        // label layouts that are sized from it
        const bounds = getCartesianPlotBounds(10, 30);
        expect(bounds.left).toBe(PADDING_LEFT);
        expect(bounds.right).toBe(PADDING_LEFT);
        expect(bounds.width).toBe(0);
    });
});

describe('getDomainPaddingForEdgeSpace', () => {
    it('returns the padding victory-native shrinks back to the requested edge space', () => {
        // Given a 200px plot and the space wanted before the first and after the last point
        const plotWidth = 200;
        const edgeSpace = {left: 40, right: 10};

        // When converting it to domain padding
        const padding = getDomainPaddingForEdgeSpace(edgeSpace, plotWidth);

        // Then victory-native's scaling (padding * plotWidth / (plotWidth + both paddings)) lands back on the requested space
        const scale = plotWidth / (plotWidth + padding.left + padding.right);
        expect(padding.left * scale).toBeCloseTo(edgeSpace.left, 5);
        expect(padding.right * scale).toBeCloseTo(edgeSpace.right, 5);
    });

    it('returns the edge space unchanged when it leaves no room for the points', () => {
        // Given edge space that covers the whole plot (or a plot that is not measured yet)
        // When converting it to domain padding
        // Then it is returned as is instead of dividing by zero or going negative
        expect(getDomainPaddingForEdgeSpace({left: 30, right: 0}, 0)).toEqual({left: 30, right: 0});
    });
});

describe('getAxisLabelStep', () => {
    const MIN_GAP = 24;

    const getEvenPointXs = (count: number, spacing: number) => Array.from({length: count}, (_, index) => index * spacing);

    it('labels every point when neighboring labels keep the minimum gap', () => {
        // Given 20px labels on points 50px apart, which leaves a 30px gap between neighbors
        const pointXs = getEvenPointXs(5, 50);

        // When picking the label step
        const step = getAxisLabelStep({labelWidths: Array<number>(5).fill(20), pointXs, steps: [1, 2, 7, 14], minGap: MIN_GAP});

        // Then the smallest step is used, so no label is hidden needlessly
        expect(step).toBe(1);
    });

    it('moves to the next listed step when neighboring labels are too close', () => {
        // Given 30px labels on points 50px apart, which leaves only a 20px gap between neighbors
        const pointXs = getEvenPointXs(5, 50);

        // When picking the label step
        const step = getAxisLabelStep({labelWidths: Array<number>(5).fill(30), pointXs, steps: [1, 2, 7, 14], minGap: MIN_GAP});

        // Then every other point is labeled, which widens the gap to 70px
        expect(step).toBe(2);
    });

    it('accepts a gap exactly equal to the minimum gap', () => {
        // Given 26px labels on points 50px apart, which leaves exactly a 24px gap between neighbors
        const pointXs = getEvenPointXs(5, 50);

        // When picking the label step
        const step = getAxisLabelStep({labelWidths: Array<number>(5).fill(26), pointXs, steps: [1, 2], minGap: MIN_GAP});

        // Then the minimum gap counts as enough room, so every point stays labeled
        expect(step).toBe(1);
    });

    it('tries multiples of the last listed step when no listed step fits', () => {
        // Given 30px labels on points 10px apart, too dense for steps 1 and 2
        const pointXs = getEvenPointXs(10, 10);

        // When picking the label step
        const step = getAxisLabelStep({labelWidths: Array<number>(10).fill(30), pointXs, steps: [1, 2], minGap: MIN_GAP});

        // Then 4 is still too tight (10px gap), and 6 is the first multiple of 2 that leaves a 30px gap
        expect(step).toBe(6);
    });

    it('labels only the first point when no step fits', () => {
        // Given 3 points 10px apart with 30px labels, where even the first and last labels overlap
        const pointXs = getEvenPointXs(3, 10);

        // When picking the label step
        const step = getAxisLabelStep({labelWidths: Array<number>(3).fill(30), pointXs, steps: [1], minGap: MIN_GAP});

        // Then the step reaches past the last point, so only the first label is drawn instead of overlapping ones
        expect(step).toBe(3);
    });

    it('labels only the first and last points when the only step spans the whole axis', () => {
        // Given 5 points and the single step the narrow layout passes, points.length - 1
        const pointXs = getEvenPointXs(5, 50);

        // When picking the label step
        const step = getAxisLabelStep({labelWidths: Array<number>(5).fill(30), pointXs, steps: [4], minGap: MIN_GAP});

        // Then that step is used, so the first and last points are labeled
        expect(step).toBe(4);
    });

    it("checks each label's own width", () => {
        // Given a wide first label that reaches the second label but clears the third
        const pointXs = [0, 50, 100];

        // When picking the label step
        const step = getAxisLabelStep({labelWidths: [80, 20, 20], pointXs, steps: [1, 2], minGap: MIN_GAP});

        // Then step 1 is rejected because of the first label's width, even though the narrow labels would fit
        expect(step).toBe(2);
    });

    it('labels a single point with the smallest step', () => {
        // Given one point, which has no neighbor its label could overlap
        // When picking the label step
        const step = getAxisLabelStep({labelWidths: [30], pointXs: [0], steps: [1, 2], minGap: MIN_GAP});

        // Then the smallest step is used and the point stays labeled
        expect(step).toBe(1);
    });
});
