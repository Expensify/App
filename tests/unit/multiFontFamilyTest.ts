import type {FontUtilsType} from '@styles/utils/FontUtils';

import CONST from '@src/CONST';

type FontFamilyStyles = FontUtilsType['fontFamily']['multi'];

function loadFonts(os: string): FontFamilyStyles {
    jest.resetModules();
    jest.doMock('@libs/getOperatingSystem', () => ({
        __esModule: true,
        default: () => os,
    }));
    // Module evaluation applies the Windows replacement, so each case needs a fresh module instance.
    const module = jest.requireActual<{default: FontFamilyStyles}>('@styles/utils/FontUtils/fontFamily/multiFontFamily/index.ts');
    return module.default;
}
describe('multiFontFamily', () => {
    const unchangedFonts = loadFonts(CONST.OS.LINUX);
    it.each([CONST.OS.WINDOWS, CONST.OS.LINUX, CONST.OS.MAC_OS])('preserves every font entry on %s', (os) => {
        // Given a real multi-family dictionary initialized for the selected operating system
        // When the module applies its platform-specific setup
        const fonts = loadFonts(os);
        // Then every entry retains its style and weight, and only Windows gets its emoji name replacement
        expect(Object.keys(fonts)).toHaveLength(12);
        for (const [index, font] of Object.values(fonts).entries()) {
            const original = Object.values(unchangedFonts).at(index);
            if (!original) {
                throw new Error('Original font entry missing');
            }
            expect(font).toEqual({
                ...original,
                fontFamily: os === CONST.OS.WINDOWS ? original.fontFamily.replace('Segoe UI Emoji', 'Windows Segoe UI Emoji') : original.fontFamily,
            });
        }
        expect(fonts.MONOSPACE.fontFamily).toContain('sans-serif');
        expect(fonts.MONOSPACE_BOLD.fontWeight).toBe('700');
        expect(fonts.MONOSPACE_ITALIC.fontStyle).toBe('italic');
        expect(fonts.EXP_NEW_KANSAS_MEDIUM.fontWeight).toBe('500');
    });
});
