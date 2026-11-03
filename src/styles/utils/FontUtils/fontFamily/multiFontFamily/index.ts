import getOperatingSystem from '@libs/getOperatingSystem';

// eslint-disable-next-line no-restricted-imports
import type FontFamilyStyles from '@styles/utils/FontUtils/fontFamily/types';
// eslint-disable-next-line no-restricted-imports
import fontWeight from '@styles/utils/FontUtils/fontWeight';

import CONST from '@src/CONST';

// Our brand fonts (Expensify Neue/Mono/New Kansas) and the emoji fonts only cover Latin script and emoji glyphs.
// Without a system font fallback at the end of the stack, any glyph missing from all of them (e.g. Greek, Cyrillic)
// falls through to the browser's own default font, which is typically a serif font.
const SYSTEM_FONT_FALLBACK = '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica, Arial, sans-serif';

// In windows and ubuntu, we need some extra system fonts for emojis to work properly
// otherwise few of them will appear as black and white
const fontFamily: FontFamilyStyles = {
    SYSTEM: {
        fontFamily: 'System',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },

    MONOSPACE: {
        fontFamily: `Expensify Mono, Segoe UI Emoji, Noto Color Emoji, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    MONOSPACE_BOLD: {
        fontFamily: `Expensify Mono, Segoe UI Emoji, Noto Color Emoji, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },
    MONOSPACE_ITALIC: {
        fontFamily: `Expensify Mono, Segoe UI Emoji, Noto Color Emoji, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'italic',
        fontWeight: fontWeight.normal,
    },
    MONOSPACE_BOLD_ITALIC: {
        fontFamily: `Expensify Mono, Segoe UI Emoji, Noto Color Emoji, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'italic',
        fontWeight: fontWeight.bold,
    },

    EXP_NEUE: {
        fontFamily: `Expensify Neue, Segoe UI Emoji, Noto Color Emoji, Custom Emoji Font, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD: {
        fontFamily: `Expensify Neue, Segoe UI Emoji, Noto Color Emoji, Custom Emoji Font, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },
    EXP_NEUE_ITALIC: {
        fontFamily: `Expensify Neue, Segoe UI Emoji, Noto Color Emoji, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'italic',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD_ITALIC: {
        fontFamily: `Expensify Neue, Segoe UI Emoji, Noto Color Emoji, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'italic',
        fontWeight: fontWeight.bold,
    },

    EXP_NEW_KANSAS_MEDIUM: {
        fontFamily: `Expensify New Kansas, Segoe UI Emoji, Noto Color Emoji, Custom Emoji Font, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'normal',
        fontWeight: fontWeight.medium,
    },
    EXP_NEW_KANSAS_MEDIUM_ITALIC: {
        fontFamily: `Expensify New Kansas, Segoe UI Emoji, Noto Color Emoji, ${SYSTEM_FONT_FALLBACK}`,
        fontStyle: 'italic',
        fontWeight: fontWeight.medium,
    },
    CUSTOM_EMOJI_FONT: {
        fontFamily: 'Custom Emoji Font',
    },
};

if (getOperatingSystem() === CONST.OS.WINDOWS) {
    for (const key of Object.keys(fontFamily)) {
        fontFamily[key as keyof FontFamilyStyles].fontFamily = fontFamily[key as keyof FontFamilyStyles].fontFamily.replace('Segoe UI Emoji', 'Windows Segoe UI Emoji');
    }
}

export default fontFamily;
