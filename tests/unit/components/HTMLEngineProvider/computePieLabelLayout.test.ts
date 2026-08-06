import type {ChartDefaultTypeface} from '@components/Charts/types/chartSkiaTypefaceTypes';
import type {LabelItem} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/types';
import computePieLabelLayout, {
    assignColumnSide,
    computeLabelBlockHeight,
    computeSliceAngles,
} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieLabelLayout';
import type {PieSliceAngle, PieSliceValue, PlotBounds} from '@components/HTMLEngineProvider/HTMLRenderers/VictoryChartRenderer/utils/computePieLabelLayout';

// Deterministic stand-in for a Skia font: every glyph line reports a 10px line height.
const MOCK_LINE_HEIGHT = 10;

jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Font: jest.fn(() => ({
            getMetrics: () => ({ascent: MOCK_LINE_HEIGHT / 2, descent: MOCK_LINE_HEIGHT / 2, leading: 0}),
        })),
    },
}));

// Any non-null value satisfies `getChartSkiaTypeface`'s lookup for this test — its resolved font size/height is stubbed above.
// eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
const STUB_TYPEFACES = new Proxy({}, {get: () => ({})}) as unknown as ChartDefaultTypeface;

// Actual production data from `server/victory-chart-renderer/tests/fixtures/top-categories-10.xml`,
// used as a documented regression case: "Purchases" and "Dues & Subscriptions" land within ~0.15 of
// the `cos(midAngle) = 0` column seam.
const TOP_CATEGORIES_10_VALUES: PieSliceValue[] = [
    {label: 'Other', value: 481500},
    {label: 'Rent or Lease', value: 375700},
    {label: 'Postage And Delivery', value: 352100},
    {label: 'Purchases', value: 341400},
    {label: 'Unapplied Cash Bill Payment Expense', value: 295000},
    {label: 'Penalties & Settlements', value: 264600},
    {label: 'Testing ñ', value: 195000},
    {label: 'Not the Expensify Credit Card Fees', value: 156500},
    {label: 'Expensify Invoice Payment Fees', value: 117700},
    {label: 'Dues & Subscriptions', value: 55500},
];

const START_ANGLE = 270;

describe('computeSliceAngles', () => {
    it('splits four equal slices into two clean right/left pairs', () => {
        const values: PieSliceValue[] = [
            {label: 'A', value: 1},
            {label: 'B', value: 1},
            {label: 'C', value: 1},
            {label: 'D', value: 1},
        ];
        const slices = computeSliceAngles(values, 0);

        expect(slices.map((slice) => assignColumnSide(slice.midAngle))).toEqual(['right', 'left', 'left', 'right']);
    });

    it('does not produce NaN when total value is zero', () => {
        const values: PieSliceValue[] = [
            {label: 'A', value: 0},
            {label: 'B', value: 0},
        ];
        const slices = computeSliceAngles(values, START_ANGLE);

        expect(slices.every((slice) => Number.isFinite(slice.midAngle))).toBe(true);
    });

    it('assigns a single 100%-value slice to a definite, non-NaN side', () => {
        const slices = computeSliceAngles([{label: 'Only', value: 100}], START_ANGLE);

        const midAngle = slices.at(0)?.midAngle ?? NaN;
        expect(Number.isFinite(midAngle)).toBe(true);
        expect(['left', 'right']).toContain(assignColumnSide(midAngle));
    });

    it('anchors a single 100%-value slice to 3 o’clock instead of diametrically opposite the seam', () => {
        // Regression test: a full-circle slice's start and end angle are the same point, so the naive
        // (start + end) / 2 "midpoint" used for every other slice lands at the bottom of the ring
        // (opposite this codebase's 12-o'clock start angle) — an unhelpful spot for the only label.
        const slices = computeSliceAngles([{label: 'Only', value: 100}], START_ANGLE);

        expect(slices.at(0)?.midAngle).toBe(0);
    });

    it('produces a definite side for every real category in the 10-slice production fixture', () => {
        const slices = computeSliceAngles(TOP_CATEGORIES_10_VALUES, START_ANGLE);

        expect(slices).toHaveLength(TOP_CATEGORIES_10_VALUES.length);
        expect(slices.every((slice) => Number.isFinite(slice.midAngle))).toBe(true);
        expect(slices.every((slice) => ['left', 'right'].includes(assignColumnSide(slice.midAngle)))).toBe(true);
    });
});

describe('computeLabelBlockHeight', () => {
    // Mirrors the real `labelcomponent` template: two styled lines (bold name + gray amount). Its own
    // `text` is always empty — the real per-slice text is substituted later — so line count must come
    // from the style maps, not from `.text`. Built via bracket assignment (not an object literal) so
    // the per-line numeric keys don't trip the naming-convention lint rule.
    function buildTwoLineLabelItem(lineHeightValues?: number[]): Pick<LabelItem, 'fontSize' | 'fontFamily' | 'fontStyle' | 'fontWeight' | 'lineHeight'> {
        const fontSize: Record<number, number> = {};
        const fontFamily: Record<number, string> = {};
        const fontWeight: Record<number, 'normal' | 'bold'> = {};
        const lineHeight: Record<number, number> = {};

        for (const index of [0, 1]) {
            fontSize[index] = 11;
            fontFamily[index] = 'Expensify Neue';
            fontWeight[index] = index === 0 ? 'bold' : 'normal';
            const authoredLineHeight = lineHeightValues?.at(index);
            if (authoredLineHeight !== undefined) {
                lineHeight[index] = authoredLineHeight;
            }
        }

        return {fontSize, fontFamily, fontStyle: {}, fontWeight, lineHeight};
    }

    it('sums both lines, not just one, when the label template has an empty `text`', () => {
        const height = computeLabelBlockHeight(buildTwoLineLabelItem(), STUB_TYPEFACES);

        expect(height).toBeCloseTo(MOCK_LINE_HEIGHT * 2);
    });

    it('uses an authored lineheight multiplier instead of font metrics when present', () => {
        const height = computeLabelBlockHeight(buildTwoLineLabelItem([1.2, 1.4]), STUB_TYPEFACES);

        // 1.2 * 11 + 1.4 * 11, not 2 * MOCK_LINE_HEIGHT.
        expect(height).toBeCloseTo(1.2 * 11 + 1.4 * 11);
    });
});

describe('assignColumnSide', () => {
    it('assigns 0 radians (3 o’clock) to the right column', () => {
        expect(assignColumnSide(0)).toBe('right');
    });

    it('assigns π radians (9 o’clock) to the left column', () => {
        expect(assignColumnSide(Math.PI)).toBe('left');
    });

    it('assigns exactly π/2 (top seam) to a side without throwing', () => {
        expect(['left', 'right']).toContain(assignColumnSide(Math.PI / 2));
    });
});

describe('computePieLabelLayout', () => {
    const WIDE_BOUNDS: PlotBounds = {top: -200, bottom: 200};

    function slice(label: string, midAngle: number): PieSliceAngle {
        return {label, midAngle};
    }

    /** Most tests don't care about per-side bounds — apply the same bounds to both columns. */
    function sameBounds(bounds: PlotBounds): Record<'left' | 'right', PlotBounds> {
        return {left: bounds, right: bounds};
    }

    it('leaves well-separated labels at their natural position (no collision)', () => {
        // Right side (cos >= 0): angles near 3 o'clock, far apart.
        const slices = [slice('Top', 0.1), slice('Bottom', Math.PI / 2 - 0.1)];
        const result = computePieLabelLayout({slices, rowHeight: 10, labelRadius: 100, plotBounds: sameBounds(WIDE_BOUNDS)});

        expect(result.Top.relativeY).toBeCloseTo(100 * Math.sin(0.1));
        expect(result.Bottom.relativeY).toBeCloseTo(100 * Math.sin(Math.PI / 2 - 0.1));
        expect(result.Top.relativeX).toBe(100);
        expect(result.Top.textAnchor).toBe('start');
    });

    it('pushes an overlapping label down by exactly rowHeight', () => {
        // Two right-side slices whose natural Y values are nearly identical.
        const slices = [slice('First', 0.01), slice('Second', 0.02)];
        const result = computePieLabelLayout({slices, rowHeight: 40, labelRadius: 100, plotBounds: sameBounds(WIDE_BOUNDS)});

        expect(result.Second.relativeY - result.First.relativeY).toBeCloseTo(40);
    });

    it('compacts a column back up when the forward pass would overflow the bottom bound', () => {
        const tightBounds: PlotBounds = {top: -100, bottom: 60};
        // Three right-side slices clustered near the bottom (large positive sin).
        const slices = [slice('A', 1.3), slice('B', 1.35), slice('C', 1.4)];
        const result = computePieLabelLayout({slices, rowHeight: 40, labelRadius: 100, plotBounds: sameBounds(tightBounds)});

        expect(result.C.relativeY).toBeCloseTo(tightBounds.bottom);
        expect(result.B.relativeY).toBeCloseTo(result.C.relativeY - 40);
        expect(result.A.relativeY).toBeCloseTo(result.B.relativeY - 40);
    });

    it('evenly redistributes as a last resort when more labels than the column can fit even at minimum spacing', () => {
        const narrowBounds: PlotBounds = {top: -50, bottom: 50};
        // Five right-side slices, all clustered together, with a rowHeight too large to fit five rows in [−50, 50].
        const slices = [slice('A', 1.0), slice('B', 1.05), slice('C', 1.1), slice('D', 1.15), slice('E', 1.2)];
        const result = computePieLabelLayout({slices, rowHeight: 40, labelRadius: 100, plotBounds: sameBounds(narrowBounds)});

        expect(result.A.relativeY).toBeCloseTo(narrowBounds.top);
        expect(result.E.relativeY).toBeCloseTo(narrowBounds.bottom);
        const step = (narrowBounds.bottom - narrowBounds.top) / 4;
        expect(result.C.relativeY).toBeCloseTo(narrowBounds.top + step * 2);
    });

    it('assigns left-side slices a negative relativeX and end text anchor', () => {
        const slices = [slice('LeftSide', Math.PI)];
        const result = computePieLabelLayout({slices, rowHeight: 10, labelRadius: 100, plotBounds: sameBounds(WIDE_BOUNDS)});

        expect(result.LeftSide.relativeX).toBe(-100);
        expect(result.LeftSide.textAnchor).toBe('end');
    });

    it('honors independent per-side bounds instead of sharing one top across both columns', () => {
        // Symmetric angles either side of straight-up (12 o'clock): both slices have the same natural
        // Y (~-99.5), differing only in which column they land in.
        const slices = [slice('Right', -(Math.PI / 2 - 0.1)), slice('Left', -(Math.PI / 2 + 0.1))];
        const naturalY = 100 * Math.sin(-(Math.PI / 2 - 0.1));
        // Right gets a permissive top (its natural position fits); left gets a much tighter one (its
        // identical natural position must get pushed down) — proving the two columns don't share a bound.
        const plotBounds = {left: {top: -50, bottom: 200}, right: {top: -150, bottom: 200}};
        const result = computePieLabelLayout({slices, rowHeight: 10, labelRadius: 100, plotBounds});

        expect(result.Right.relativeY).toBeCloseTo(naturalY);
        expect(result.Left.relativeY).toBeCloseTo(-50);
    });

    it('resolves a single 100%-value slice within bounds, vertically centered rather than at the bottom', () => {
        const slices = computeSliceAngles([{label: 'Only', value: 100}], START_ANGLE);
        const result = computePieLabelLayout({slices, rowHeight: 20, labelRadius: 100, plotBounds: sameBounds(WIDE_BOUNDS)});

        expect(result.Only.relativeY).toBeGreaterThanOrEqual(WIDE_BOUNDS.top);
        expect(result.Only.relativeY).toBeLessThanOrEqual(WIDE_BOUNDS.bottom);
        expect(result.Only.relativeY).toBeCloseTo(0);
        // The indicator line anchors to this same midAngle (not its own `(startAngle + endAngle) / 2`),
        // so it must match the slice's overridden angle exactly, not just produce a safe Y position.
        expect(result.Only.midAngle).toBe(0);
        expect(result.Only.relativeX).toBe(100);
    });

    it('resolves every category in the real 10-slice production fixture without collisions or NaN', () => {
        const slices = computeSliceAngles(TOP_CATEGORIES_10_VALUES, START_ANGLE);
        const rowHeight = 32;
        const plotBounds: PlotBounds = {top: -195, bottom: 195};
        const result = computePieLabelLayout({slices, rowHeight, labelRadius: 195, plotBounds: sameBounds(plotBounds)});

        expect(Object.keys(result)).toHaveLength(TOP_CATEGORIES_10_VALUES.length);

        const bySide: Record<'left' | 'right', number[]> = {left: [], right: []};
        for (const value of TOP_CATEGORIES_10_VALUES) {
            const layout = result[value.label];
            expect(Number.isFinite(layout.relativeY)).toBe(true);
            expect(layout.relativeY).toBeGreaterThanOrEqual(plotBounds.top - 1e-6);
            expect(layout.relativeY).toBeLessThanOrEqual(plotBounds.bottom + 1e-6);
            bySide[layout.relativeX >= 0 ? 'right' : 'left'].push(layout.relativeY);
        }

        for (const columnYs of Object.values(bySide)) {
            const sorted = [...columnYs].sort((a, b) => a - b);
            for (let index = 1; index < sorted.length; index++) {
                const gap = (sorted.at(index) ?? 0) - (sorted.at(index - 1) ?? 0);
                expect(gap).toBeGreaterThanOrEqual(rowHeight - 1e-6);
            }
        }
    });
});
