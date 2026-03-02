import type {SkFont} from '@shopify/react-native-skia';
import {renderHook} from '@testing-library/react-native';
import {SIN_45} from '@components/Charts/constants';
import {useChartLabelLayout} from '@components/Charts/hooks/useChartLabelLayout';
import type {ChartDataPoint} from '@components/Charts/types';

/**
 * Each glyph = PX_PER_CHAR wide. This gives deterministic widths:
 * "AAA" = 21px, "AAAAAA" = 42px, "A".repeat(16) = 112px, "..." = 21px
 */
const PX_PER_CHAR = 7;

function createMockFont(): SkFont {
    return {
        getMetrics: () => ({ascent: -12, descent: 4, leading: 0}),
        getGlyphIDs: (text: string) => [...text].map((_, i) => i + 1),
        getGlyphWidths: (glyphIDs: number[]) => glyphIDs.map(() => PX_PER_CHAR),
        getSize: () => 12,
    } as unknown as SkFont;
}

function makeData(...labels: string[]): ChartDataPoint[] {
    return labels.map((label, i) => ({label, total: (i + 1) * 100}));
}

const LINE_HEIGHT = 16; // |ascent(12)| + |descent(4)|

describe('useChartLabelLayout', () => {
    const font = createMockFont();

    describe('early returns', () => {
        const defaults = {labelRotation: 0, labelSkipInterval: 1, truncatedLabels: []};

        it('returns defaults when font is null', () => {
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('A', 'B'), font: null, tickSpacing: 50, labelAreaWidth: 100}));
            expect(result.current).toEqual(defaults);
        });

        it('returns defaults when data is empty', () => {
            const {result} = renderHook(() => useChartLabelLayout({data: [], font, tickSpacing: 50, labelAreaWidth: 100}));
            expect(result.current).toEqual(defaults);
        });

        it('returns defaults when tickSpacing is 0', () => {
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('A', 'B'), font, tickSpacing: 0, labelAreaWidth: 100}));
            expect(result.current).toEqual(defaults);
        });

        it('returns defaults when labelAreaWidth is 0', () => {
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('A', 'B'), font, tickSpacing: 50, labelAreaWidth: 0}));
            expect(result.current).toEqual(defaults);
        });
    });

    describe('rotation selection without edge constraints', () => {
        it('picks 0° when labels fit horizontally', () => {
            // "AAA" = 21px. 21+4=25 ≤ tickSpacing(30). maxVisibleCount(90,21)=3 ≥ 3
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('AAA', 'BBB', 'CCC'), font, tickSpacing: 30, labelAreaWidth: 90}));
            expect(result.current.labelRotation).toBe(-0);
            expect(result.current.truncatedLabels).toEqual(['AAA', 'BBB', 'CCC']);
            expect(result.current.xAxisLabelHeight).toBe(LINE_HEIGHT);
            expect(result.current.labelSkipInterval).toBe(1);
        });

        it('picks 45° when labels overflow horizontally but fit diagonally', () => {
            // "AAAAAA" = 42px. 42+4=46 > tickSpacing(40) → 0° fails.
            // At 45°: 42*SIN_45 ≈ 29.7, 29.7+4 ≤ 40 ✓
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('AAAAAA', 'BBBBBB'), font, tickSpacing: 40, labelAreaWidth: 400}));
            expect(result.current.labelRotation).toBe(-45);
            expect(result.current.truncatedLabels).toEqual(['AAAAAA', 'BBBBBB']);
            expect(result.current.xAxisLabelHeight).toBeCloseTo((42 + LINE_HEIGHT) * SIN_45, 5);
            expect(result.current.labelSkipInterval).toBe(1);
        });

        it('picks 45° when labelAreaWidth is too narrow for 0° despite sufficient tickSpacing', () => {
            // "AAA" = 21px. tickSpacing=30: 21+4=25 ≤ 30 ✓ (tick check passes).
            // BUT labelAreaWidth=40: maxVisibleCount(40,21) = floor(40/25) = 1 < 3 → 0° fails.
            // At 45°: 21*SIN_45 ≈ 14.85, 14.85+4=18.85 ≤ 30 ✓ → 45° selected.
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('AAA', 'BBB', 'CCC'), font, tickSpacing: 30, labelAreaWidth: 40}));
            expect(result.current.labelRotation).toBe(-45);
        });

        it('picks 90° when labels overflow at all rotations', () => {
            // tickSpacing=20: 0° fails (46>20), 45° fails (29.7+4=33.7>20)
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('AAAAAA', 'BBBBBB'), font, tickSpacing: 20, labelAreaWidth: 400}));
            expect(result.current.labelRotation).toBe(-90);
            expect(result.current.truncatedLabels).toEqual(['AAAAAA', 'BBBBBB']);
        });
    });

    describe('backward compatibility', () => {
        it('produces identical result whether edge params are omitted or set to Infinity', () => {
            const config = {data: makeData('AAAAAA', 'BBBBBB'), font, tickSpacing: 40, labelAreaWidth: 400};
            const {result: withoutEdge} = renderHook(() => useChartLabelLayout(config));
            const {result: withEdge} = renderHook(() => useChartLabelLayout({...config, firstTickLeftSpace: Infinity, lastTickRightSpace: Infinity}));
            expect(withoutEdge.current).toEqual(withEdge.current);
        });

        it('Infinity edge space never constrains rotation', () => {
            const {result} = renderHook(() =>
                useChartLabelLayout({
                    data: makeData('AAAAAA', 'BBBBBB', 'CCCCCC'),
                    font,
                    tickSpacing: 50,
                    labelAreaWidth: 150,
                    firstTickLeftSpace: Infinity,
                    lastTickRightSpace: Infinity,
                }),
            );
            expect(result.current.labelRotation).toBe(-0);
        });
    });

    describe('edge-constrained rotation', () => {
        it('same data picks 0° without edge constraint but 45° with edge constraint', () => {
            // "A".repeat(16) = 112px. At 0°: overhang = 56px.
            const config = {data: makeData('A'.repeat(16), 'BB', 'CC'), font, tickSpacing: 120, labelAreaWidth: 360};

            const {result: noEdge} = renderHook(() => useChartLabelLayout(config));
            expect(noEdge.current.labelRotation).toBe(-0);

            // firstTickLeftSpace=40 < 56 → 0° edge fails → escalates to 45°
            const {result: withEdge} = renderHook(() => useChartLabelLayout({...config, firstTickLeftSpace: 40, lastTickRightSpace: 200}));
            expect(withEdge.current.labelRotation).toBe(-45);
        });

        it('escalates to 90° when edge space is too small for both 0° and 45°', () => {
            // firstTickLeftSpace=5: at 45° centered edgeMax = max(0, 2*(5/SIN_45-8)) ≈ 0 → fails
            const {result} = renderHook(() =>
                useChartLabelLayout({data: makeData('AAAAAA', 'BBBBBB'), font, tickSpacing: 50, labelAreaWidth: 200, firstTickLeftSpace: 5, lastTickRightSpace: 5}),
            );
            expect(result.current.labelRotation).toBe(-90);
        });

        it('allowTightDiagonalPacking enables 45° at tighter tick spacing', () => {
            // "AAAAAA" = 42px. tickSpacing=30.
            // Without packing: minDiagWidth = 42*SIN_45 ≈ 29.7, 29.7+4=33.7 > 30 → 45° fails
            // With packing: diagonalOverlap = 16*SIN_45 ≈ 11.3, minDiagWidth = 29.7-11.3=18.4, 18.4+4=22.4 ≤ 30 ✓
            const base = {data: makeData('AAAAAA', 'BBBBBB'), font, tickSpacing: 30, labelAreaWidth: 400, firstTickLeftSpace: 100, lastTickRightSpace: 100};

            const {result: noPacking} = renderHook(() => useChartLabelLayout({...base, allowTightDiagonalPacking: false}));
            expect(noPacking.current.labelRotation).toBe(-90);

            const {result: withPacking} = renderHook(() => useChartLabelLayout({...base, allowTightDiagonalPacking: true}));
            expect(withPacking.current.labelRotation).toBe(-45);
        });
    });

    describe('edge-aware truncation', () => {
        it('truncates first label due to edge constraint while middle labels remain full (centered)', () => {
            // First label: 16 chars = 112px. tickMaxWidth ≈ 164. edgeMax ≈ 97 (stricter).
            // Truncated to 10 chars + "..."
            const {result} = renderHook(() =>
                useChartLabelLayout({
                    data: makeData('A'.repeat(16), 'BB', 'CC'),
                    font,
                    tickSpacing: 120,
                    labelAreaWidth: 360,
                    firstTickLeftSpace: 40,
                    lastTickRightSpace: 200,
                }),
            );
            expect(result.current.labelRotation).toBe(-45);
            expect(result.current.truncatedLabels?.at(0)).toBe(`${'A'.repeat(10)}...`);
            expect(result.current.truncatedLabels?.at(1)).toBe('BB');
            expect(result.current.truncatedLabels?.at(2)).toBe('CC');
        });

        it('truncates first label due to edge constraint (right-aligned)', () => {
            // Right-aligned first label: edgeMax = 72/SIN_45 - 8 ≈ 93.8. tickMax ≈ 95.2.
            // Edge is stricter → first label truncated to 10 chars + "..."
            const {result} = renderHook(() =>
                useChartLabelLayout({
                    data: makeData('A'.repeat(16), 'BB', 'CC'),
                    font,
                    tickSpacing: 60,
                    labelAreaWidth: 360,
                    firstTickLeftSpace: 72,
                    lastTickRightSpace: 200,
                    allowTightDiagonalPacking: true,
                }),
            );
            expect(result.current.labelRotation).toBe(-45);
            expect(result.current.truncatedLabels?.at(0)).toBe(`${'A'.repeat(10)}...`);
            expect(result.current.truncatedLabels?.at(1)).toBe('BB');
        });

        it('truncates last label when centered due to symmetric overhang', () => {
            // Centered: last label right overhang = (W/2+halfLH)*SIN_45 ≈ 45.6 for W=112
            // lastTickRightSpace=40: edgeMax = 2*(40/SIN_45-8) ≈ 97.1 < 112 → truncated
            const {result} = renderHook(() =>
                useChartLabelLayout({
                    data: makeData('AA', 'BB', 'A'.repeat(16)),
                    font,
                    tickSpacing: 200,
                    labelAreaWidth: 600,
                    firstTickLeftSpace: 200,
                    lastTickRightSpace: 40,
                }),
            );
            expect(result.current.labelRotation).toBe(-45);
            expect(result.current.truncatedLabels?.at(2)).toBe(`${'A'.repeat(10)}...`);
        });

        it('does NOT truncate last label when right-aligned despite tight right edge', () => {
            // Right-aligned: last label right overhang = halfLH*SIN_45 ≈ 5.6 (constant, tiny).
            // lastTickRightSpace=40 >> 5.6 → edgeMax = Infinity → no edge truncation.
            // tickMaxWidth = (200-4)/SIN_45+16 ≈ 293 > 112 → no tick truncation either.
            const {result} = renderHook(() =>
                useChartLabelLayout({
                    data: makeData('AA', 'BB', 'A'.repeat(16)),
                    font,
                    tickSpacing: 200,
                    labelAreaWidth: 600,
                    firstTickLeftSpace: 200,
                    lastTickRightSpace: 40,
                    allowTightDiagonalPacking: true,
                }),
            );
            expect(result.current.labelRotation).toBe(-45);
            expect(result.current.truncatedLabels?.at(2)).toBe('A'.repeat(16));
        });
    });

    describe('skip interval', () => {
        it('computes skip interval > 1 at 90° when too many labels for the area', () => {
            // 10 labels, forced to 90°. At 90°, effectiveWidth = lineHeight = 16.
            // maxVisibleCount(100, 16) = floor(100/20) = 5 < 10 → skip = ceil(10/5) = 2
            const labels = Array.from({length: 10}, (_, i) => `L${String(i).padStart(4, '0')}`);
            const {result} = renderHook(() => useChartLabelLayout({data: makeData(...labels), font, tickSpacing: 10, labelAreaWidth: 100}));
            expect(result.current.labelRotation).toBe(-90);
            expect(result.current.labelSkipInterval).toBe(2);
        });

        it('returns skip interval 1 at 90° when labels fit', () => {
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('AAAAAA', 'BBBBBB'), font, tickSpacing: 10, labelAreaWidth: 400}));
            expect(result.current.labelRotation).toBe(-90);
            expect(result.current.labelSkipInterval).toBe(1);
            expect(result.current.truncatedLabels).toEqual(['AAAAAA', 'BBBBBB']);
            expect(result.current.xAxisLabelHeight).toBe(42);
        });
    });

    describe('edge cases', () => {
        it('handles single data point', () => {
            const {result} = renderHook(() => useChartLabelLayout({data: makeData('AAA'), font, tickSpacing: 50, labelAreaWidth: 50}));
            expect(result.current.labelRotation).toBe(-0);
            expect(result.current.truncatedLabels).toEqual(['AAA']);
            expect(result.current.labelSkipInterval).toBe(1);
        });
    });
});
