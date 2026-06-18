import {CHART_FONT_FAMILY_NAMES} from '@components/Charts/utils/chartFontConstants';
import type VictoryThemeType from '@components/Charts/VictoryTheme';
import colors from '@styles/theme/colors';

/**
 * Loads VictoryTheme via require so individual tests can mock
 * `@styles/theme/colors` before the module's IIFE runs.
 */
function loadVictoryTheme(): typeof VictoryThemeType {
    const mod = require('@components/Charts/VictoryTheme') as {default: typeof VictoryThemeType};
    return mod.default;
}

describe('VictoryTheme', () => {
    beforeEach(() => {
        jest.resetModules();
    });

    describe('colors.palette', () => {
        it('contains 30 entries (5 shades × 6 hues)', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.palette).toHaveLength(30);
        });

        it('contains only hex color strings', () => {
            const VictoryTheme = loadVictoryTheme();
            for (const color of VictoryTheme.colors.palette) {
                expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            }
        });

        it('starts with the first shade row (400) in hue order: yellow, tangerine, pink, green, ice, blue', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.palette.slice(0, 6)).toEqual([colors.yellow400, colors.tangerine400, colors.pink400, colors.green400, colors.ice400, colors.blue400]);
        });

        it('contains all unique colors (no duplicates within the palette)', () => {
            const VictoryTheme = loadVictoryTheme();
            const unique = new Set(VictoryTheme.colors.palette);
            expect(unique.size).toBe(VictoryTheme.colors.palette.length);
        });
    });

    describe('colors.default', () => {
        it('equals the palette entry at the default index (green400)', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.default).toBe(colors.green400);
        });

        it('matches getColor(3)', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.default).toBe(VictoryTheme.colors.getColor(3));
        });
    });

    describe('colors.defaultDot', () => {
        it('equals the palette entry at the default dot index (green500)', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.defaultDot).toBe(colors.green500);
        });
    });

    describe('colors.getColor', () => {
        it('returns a non-empty hex string for index 0', () => {
            const VictoryTheme = loadVictoryTheme();
            const color = VictoryTheme.colors.getColor(0);
            expect(typeof color).toBe('string');
            expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
        });

        it('returns different colors for consecutive indices', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.getColor(0)).not.toBe(VictoryTheme.colors.getColor(1));
            expect(VictoryTheme.colors.getColor(1)).not.toBe(VictoryTheme.colors.getColor(2));
        });

        it('wraps around to the same color after the full palette (30 entries)', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.getColor(0)).toBe(VictoryTheme.colors.getColor(30));
            expect(VictoryTheme.colors.getColor(5)).toBe(VictoryTheme.colors.getColor(35));
        });

        it('handles large indices via modulo wrapping', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.getColor(0)).toBe(VictoryTheme.colors.getColor(300));
        });

        it('returns colors.black when the palette is empty (defensive fallback)', () => {
            jest.doMock('@styles/theme/colors', () => ({
                __esModule: true,
                default: {black: '#000000'},
            }));
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.colors.palette).toHaveLength(0);
            expect(VictoryTheme.colors.getColor(0)).toBe('#000000');
            expect(VictoryTheme.colors.getColor(99)).toBe('#000000');
        });

        it('skips missing shade/hue combinations when building the palette', () => {
            // Mock a partial palette: only blue400 and green400 are present.
            jest.doMock('@styles/theme/colors', () => ({
                __esModule: true,
                default: {
                    blue400: '#0185FF',
                    green400: '#03D47C',
                    black: '#000000',
                },
            }));
            const VictoryTheme = loadVictoryTheme();
            // Hue iteration order is yellow, tangerine, pink, green, ice, blue
            // so green400 comes before blue400 in the palette.
            expect(VictoryTheme.colors.palette).toEqual(['#03D47C', '#0185FF']);
        });
    });

    describe('static configuration values', () => {
        it('exposes the expected font families in order', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.fontFamilies).toEqual([...CHART_FONT_FAMILY_NAMES]);
        });

        it('exposes axis values', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.axis).toEqual({
                tickCount: 5,
                xLineWidth: 0,
                yLineWidth: 1,
                labelGap: 12,
                padding: {top: 5, left: 5, right: 5, bottom: 5},
            });
        });

        it('exposes tooltip values', () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.tooltip).toEqual({
                pointerHeight: 4,
                pointerWidth: 12,
            });
        });

        it("starts the pie chart at the 12 o'clock position (-90°)", () => {
            const VictoryTheme = loadVictoryTheme();
            expect(VictoryTheme.pie.startAngle).toBe(-90);
        });
    });
});
