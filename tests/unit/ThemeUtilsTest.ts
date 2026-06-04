import {getBaseTheme, getContrastTheme, isHighContrastTheme} from '@styles/theme/utils';
import CONST from '@src/CONST';

describe('ThemeUtils', () => {
    describe('getBaseTheme', () => {
        it('should return light for light-contrast', () => {
            expect(getBaseTheme(CONST.THEME.LIGHT_CONTRAST)).toBe(CONST.THEME.LIGHT);
        });

        it('should return dark for dark-contrast', () => {
            expect(getBaseTheme(CONST.THEME.DARK_CONTRAST)).toBe(CONST.THEME.DARK);
        });

        it('should return system for system-contrast', () => {
            expect(getBaseTheme(CONST.THEME.SYSTEM_CONTRAST)).toBe(CONST.THEME.SYSTEM);
        });

        it('should return light unchanged for light', () => {
            expect(getBaseTheme(CONST.THEME.LIGHT)).toBe(CONST.THEME.LIGHT);
        });

        it('should return dark unchanged for dark', () => {
            expect(getBaseTheme(CONST.THEME.DARK)).toBe(CONST.THEME.DARK);
        });

        it('should return system unchanged for system', () => {
            expect(getBaseTheme(CONST.THEME.SYSTEM)).toBe(CONST.THEME.SYSTEM);
        });
    });

    describe('getContrastTheme', () => {
        it('should return light-contrast for light', () => {
            expect(getContrastTheme(CONST.THEME.LIGHT)).toBe(CONST.THEME.LIGHT_CONTRAST);
        });

        it('should return dark-contrast for dark', () => {
            expect(getContrastTheme(CONST.THEME.DARK)).toBe(CONST.THEME.DARK_CONTRAST);
        });

        it('should return system-contrast for system', () => {
            expect(getContrastTheme(CONST.THEME.SYSTEM)).toBe(CONST.THEME.SYSTEM_CONTRAST);
        });

        it('should return contrast themes unchanged when already contrast', () => {
            expect(getContrastTheme(CONST.THEME.LIGHT_CONTRAST)).toBe(CONST.THEME.LIGHT_CONTRAST);
            expect(getContrastTheme(CONST.THEME.DARK_CONTRAST)).toBe(CONST.THEME.DARK_CONTRAST);
            expect(getContrastTheme(CONST.THEME.SYSTEM_CONTRAST)).toBe(CONST.THEME.SYSTEM_CONTRAST);
        });
    });

    describe('isHighContrastTheme', () => {
        it('should return true for light-contrast', () => {
            expect(isHighContrastTheme(CONST.THEME.LIGHT_CONTRAST)).toBe(true);
        });

        it('should return true for dark-contrast', () => {
            expect(isHighContrastTheme(CONST.THEME.DARK_CONTRAST)).toBe(true);
        });

        it('should return true for system-contrast', () => {
            expect(isHighContrastTheme(CONST.THEME.SYSTEM_CONTRAST)).toBe(true);
        });

        it('should return false for light', () => {
            expect(isHighContrastTheme(CONST.THEME.LIGHT)).toBe(false);
        });

        it('should return false for dark', () => {
            expect(isHighContrastTheme(CONST.THEME.DARK)).toBe(false);
        });

        it('should return false for system', () => {
            expect(isHighContrastTheme(CONST.THEME.SYSTEM)).toBe(false);
        });
    });

    describe('getBaseTheme and getContrastTheme are inverses', () => {
        it('should round-trip base → contrast → base for all base themes', () => {
            const baseThemes = [CONST.THEME.LIGHT, CONST.THEME.DARK, CONST.THEME.SYSTEM] as const;
            for (const base of baseThemes) {
                expect(getBaseTheme(getContrastTheme(base))).toBe(base);
            }
        });

        it('should round-trip contrast → base → contrast for all contrast themes', () => {
            const contrastThemes = [CONST.THEME.LIGHT_CONTRAST, CONST.THEME.DARK_CONTRAST, CONST.THEME.SYSTEM_CONTRAST] as const;
            for (const contrast of contrastThemes) {
                expect(getContrastTheme(getBaseTheme(contrast))).toBe(contrast);
            }
        });
    });
});
