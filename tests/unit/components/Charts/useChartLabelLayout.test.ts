import type {SkTypefaceFontProvider} from '@shopify/react-native-skia';
import {renderHook} from '@testing-library/react-native';
import {SIN_45} from '@components/Charts/constants';
import {useChartLabelLayout} from '@components/Charts/hooks/useChartLabelLayout';
import useChartLabelMeasurements from '@components/Charts/hooks/useChartLabelMeasurements';
import type {ChartDataPoint} from '@components/Charts/types';
import type * as ChartUtils from '@components/Charts/utils';

/**
 * Each glyph = PX_PER_CHAR wide. This gives deterministic widths:
 * "AAA" = 21px, "AAAAAA" = 42px, "A".repeat(16) = 112px, "..." = 21px
 */
const PX_PER_CHAR = 7;
const MOCK_ASCENT = 12;
const MOCK_DESCENT = 4;

jest.mock('@components/Charts/utils', () => {
    const actual = jest.requireActual<typeof ChartUtils>('@components/Charts/utils');
    return {
        ...actual,
        measureTextWidth: (text: string, ...rest: [SkTypefaceFontProvider, number]): number => text.length * PX_PER_CHAR + 0 * rest.length,
        getFontLineMetrics: (...args: [SkTypefaceFontProvider, number]): {ascent: number; descent: number} => ({
            ascent: MOCK_ASCENT + 0 * args.length,
            descent: MOCK_DESCENT,
        }),
    };
});

const mockFontMgr = {} as SkTypefaceFontProvider;
const FONT_SIZE = 12;

function makeData(...labels: string[]): ChartDataPoint[] {
    return labels.map((label, i) => ({label, total: (i + 1) * 100}));
}

type LayoutConfig = Omit<Parameters<typeof useChartLabelLayout>[0], 'measurements'>;

function renderLayout(config: LayoutConfig) {
    return renderHook(() => {
        const measurements = useChartLabelMeasurements(config.data, config.fontMgr, config.fontSize);
        return useChartLabelLayout({...config, measurements});
    });
}

const LINE_HEIGHT = MOCK_ASCENT + MOCK_DESCENT; // 16

describe('useChartLabelLayout', () => {
    describe('early returns', () => {
        const defaults = {
            labelRotation: 0,
            labelSkipInterval: 1,
            labelMaxWidths: [],
            truncatedLabelWidths: [],
            xAxisLabelHeight: 0,
            regularLabelMaxWidth: Infinity,
            firstLabelMaxWidth: Infinity,
            lastLabelMaxWidth: Infinity,
            ellipsisWidth: 0,
        };

        it('returns defaults when fontMgr is null', () => {
            const {result} = renderLayout({data: makeData('A', 'B'), fontMgr: null, fontSize: FONT_SIZE, tickSpacing: 50, labelAreaWidth: 100});
            expect(result.current).toEqual(defaults);
        });

        it('returns defaults when data is empty', () => {
            const {result} = renderLayout({data: [], fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 50, labelAreaWidth: 100});
            expect(result.current).toEqual(defaults);
        });

        it('returns defaults when tickSpacing is 0', () => {
            const {result} = renderLayout({data: makeData('A', 'B'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 0, labelAreaWidth: 100});
            expect(result.current).toEqual(defaults);
        });

        it('returns defaults when labelAreaWidth is 0', () => {
            const {result} = renderLayout({data: makeData('A', 'B'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 50, labelAreaWidth: 0});
            expect(result.current).toEqual(defaults);
        });
    });

    describe('rotation selection without edge constraints', () => {
        it('picks 0° when labels fit horizontally', () => {
            // "AAA" = 21px. 21+4=25 ≤ tickSpacing(30). maxVisibleCount(90,21)=3 ≥ 3
            const {result} = renderLayout({data: makeData('AAA', 'BBB', 'CCC'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 30, labelAreaWidth: 90});
            expect(result.current.labelRotation).toBe(0);
            expect(result.current.xAxisLabelHeight).toBe(LINE_HEIGHT);
            expect(result.current.labelSkipInterval).toBe(1);
        });

        it('picks 45° when labels overflow horizontally but fit diagonally', () => {
            // "AAAAAA" = 42px. 42+4=46 > tickSpacing(40) → 0° fails.
            // At 45°: 42*SIN_45 ≈ 29.7, 29.7+4 ≤ 40 ✓
            const {result} = renderLayout({data: makeData('AAAAAA', 'BBBBBB'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 40, labelAreaWidth: 400});
            expect(result.current.labelRotation).toBe(45);
            expect(result.current.xAxisLabelHeight).toBeCloseTo((42 + LINE_HEIGHT) * SIN_45, 5);
            expect(result.current.labelSkipInterval).toBe(1);
        });

        it('picks 45° when labelAreaWidth is too narrow for 0° despite sufficient tickSpacing', () => {
            // "AAA" = 21px. tickSpacing=30: 21+4=25 ≤ 30 ✓ (tick check passes).
            // BUT labelAreaWidth=40: maxVisibleCount(40,21) = floor(40/25) = 1 < 3 → 0° fails.
            // At 45°: 21*SIN_45 ≈ 14.85, 14.85+4=18.85 ≤ 30 ✓ → 45° selected.
            const {result} = renderLayout({data: makeData('AAA', 'BBB', 'CCC'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 30, labelAreaWidth: 40});
            expect(result.current.labelRotation).toBe(45);
        });

        it('picks 90° when labels overflow at all rotations', () => {
            // tickSpacing=20: 0° fails (46>20), 45° fails (29.7+4=33.7>20)
            const {result} = renderLayout({data: makeData('AAAAAA', 'BBBBBB'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 20, labelAreaWidth: 400});
            expect(result.current.labelRotation).toBe(90);
        });
    });

    describe('backward compatibility', () => {
        it('produces identical result whether edge params are omitted or set to Infinity', () => {
            const config = {data: makeData('AAAAAA', 'BBBBBB'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 40, labelAreaWidth: 400};
            const {result: withoutEdge} = renderLayout(config);
            const {result: withEdge} = renderLayout({...config, firstTickLeftSpace: Infinity, lastTickRightSpace: Infinity});
            expect(withoutEdge.current).toEqual(withEdge.current);
        });

        it('Infinity edge space never constrains rotation', () => {
            const {result} = renderLayout({
                data: makeData('AAAAAA', 'BBBBBB', 'CCCCCC'),
                fontMgr: mockFontMgr,
                fontSize: FONT_SIZE,
                tickSpacing: 50,
                labelAreaWidth: 150,
                firstTickLeftSpace: Infinity,
                lastTickRightSpace: Infinity,
            });
            expect(result.current.labelRotation).toBe(0);
        });
    });

    describe('edge-constrained rotation', () => {
        it('same data picks 0° without edge constraint but 45° with edge constraint', () => {
            // "A".repeat(22) = 154px. firstMinTrunc = (10+3)*7 = 91px.
            // At 0°: centered overhang = 77px. firstTickLeftSpace=72 < 77 → 0° edge fails.
            // At 45° right-aligned: edgeMax = 72/SIN_45−8 ≈ 93.8 ≥ 91 → 45° edge fits.
            const config = {data: makeData('A'.repeat(22), 'BB', 'CC'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 160, labelAreaWidth: 480};

            const {result: noEdge} = renderLayout(config);
            expect(noEdge.current.labelRotation).toBe(0);

            // firstTickLeftSpace=72 < 77 → 0° edge fails → escalates to 45°
            const {result: withEdge} = renderLayout({...config, firstTickLeftSpace: 72, lastTickRightSpace: 200});
            expect(withEdge.current.labelRotation).toBe(45);
        });

        it('escalates to 90° when edge space is too small for both 0° and 45°', () => {
            // "AAAAAA" = 42px (6 chars <= MIN_TRUNCATED_CHARS=10), so firstMinTrunc = 42.
            // firstTickLeftSpace=5: at 45° right-aligned edgeMax = max(0, 5/SIN_45−8) = 0 < 42 → fails
            const {result} = renderLayout({
                data: makeData('AAAAAA', 'BBBBBB'),
                fontMgr: mockFontMgr,
                fontSize: FONT_SIZE,
                tickSpacing: 50,
                labelAreaWidth: 200,
                firstTickLeftSpace: 5,
                lastTickRightSpace: 5,
            });
            expect(result.current.labelRotation).toBe(90);
        });
    });

    describe('edge-aware max-width constraints', () => {
        it('constrains first label below full width when right-aligned and edge is tight', () => {
            // Right-aligned first label: edgeMax = 72/SIN_45 - 8 ≈ 93.8 < 112 → constrained.
            const {result} = renderLayout({
                data: makeData('A'.repeat(16), 'BB', 'CC'),
                fontMgr: mockFontMgr,
                fontSize: FONT_SIZE,
                tickSpacing: 60,
                labelAreaWidth: 360,
                firstTickLeftSpace: 72,
                lastTickRightSpace: 200,
            });
            expect(result.current.labelRotation).toBe(45);
            expect(result.current.labelMaxWidths.at(0)).toBeLessThan(16 * PX_PER_CHAR);
            expect(result.current.labelMaxWidths.at(1)).toBeGreaterThanOrEqual(2 * PX_PER_CHAR);
        });

        it('does NOT constrain last label when right-aligned despite tight right edge', () => {
            // Right-aligned: last label right overhang = halfLH*SIN_45 ≈ 5.6 (constant, tiny).
            // lastTickRightSpace=40 >> 5.6 → edgeMax = Infinity → no edge constraint.
            // tickMaxWidth = (200-4)/SIN_45+16 ≈ 293 > 112 → no tick constraint either.
            const {result} = renderLayout({
                data: makeData('AA', 'BB', 'A'.repeat(16)),
                fontMgr: mockFontMgr,
                fontSize: FONT_SIZE,
                tickSpacing: 200,
                labelAreaWidth: 600,
                firstTickLeftSpace: 200,
                lastTickRightSpace: 40,
            });
            expect(result.current.labelRotation).toBe(45);
            expect(result.current.labelMaxWidths.at(2)).toBeGreaterThanOrEqual(16 * PX_PER_CHAR);
        });
    });

    describe('skip interval', () => {
        it('computes skip interval > 1 at 90° when too many labels for the area', () => {
            // 10 labels, forced to 90°. At 90°, effectiveWidth = lineHeight = 16.
            // maxVisibleCount(100, 16) = floor(100/20) = 5 < 10 → skip = ceil(10/5) = 2
            const labels = Array.from({length: 10}, (_, i) => `L${String(i).padStart(4, '0')}`);
            const {result} = renderLayout({data: makeData(...labels), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 10, labelAreaWidth: 100});
            expect(result.current.labelRotation).toBe(90);
            expect(result.current.labelSkipInterval).toBe(2);
        });

        it('returns skip interval 1 at 90° when labels fit', () => {
            const {result} = renderLayout({data: makeData('AAAAAA', 'BBBBBB'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 10, labelAreaWidth: 400});
            expect(result.current.labelRotation).toBe(90);
            expect(result.current.labelSkipInterval).toBe(1);
            expect(result.current.xAxisLabelHeight).toBe(42);
        });
    });

    describe('edge cases', () => {
        it('handles single data point', () => {
            const {result} = renderLayout({data: makeData('AAA'), fontMgr: mockFontMgr, fontSize: FONT_SIZE, tickSpacing: 50, labelAreaWidth: 50});
            expect(result.current.labelRotation).toBe(0);
            expect(result.current.labelSkipInterval).toBe(1);
        });
    });
});
