import getOperatingSystem from '@libs/getOperatingSystem';
// eslint-disable-next-line no-restricted-imports
import type FontFamilyStyles from '@styles/utils/FontUtils/fontFamily/types';
// eslint-disable-next-line no-restricted-imports
import fontWeight from '@styles/utils/FontUtils/fontWeight';
import CONST from '@src/CONST';

// In windows and ubuntu, we need some extra system fonts for emojis to work properly
// otherwise few of them will appear as black and white
const fontFamily: FontFamilyStyles = {
    SYSTEM: {
        fontFamily: 'System',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },

    MONOSPACE: {
        fontFamily: 'ExpensifyMono-Regular, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    MONOSPACE_BOLD: {
        fontFamily: 'ExpensifyMono-Bold, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },

    EXP_NEUE: {
        fontFamily: 'ExpensifyNeue-Regular, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD: {
        fontFamily: 'ExpensifyNeue-Regular, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },
    EXP_NEUE_ITALIC: {
        fontFamily: 'ExpensifyNeue-Regular, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'italic',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD_ITALIC: {
        fontFamily: 'ExpensifyNeue-Regular, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'italic',
        fontWeight: fontWeight.bold,
    },

    EXP_NEW_KANSAS_MEDIUM: {
        fontFamily: 'ExpensifyNewKansas-Medium, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'normal',
        fontWeight: fontWeight.medium,
    },
    EXP_NEW_KANSAS_MEDIUM_ITALIC: {
        fontFamily: 'ExpensifyNewKansas-MediumItalic, Segoe UI Emoji, Noto Color Emoji',
        fontStyle: 'italic',
        fontWeight: fontWeight.medium,
    },
};

if (getOperatingSystem() === CONST.OS.WINDOWS) {
    Object.keys(fontFamily).forEach((key) => {
        fontFamily[key as keyof FontFamilyStyles].fontFamily = fontFamily[key as keyof FontFamilyStyles].fontFamily.replace('Segoe UI Emoji', 'Windows Segoe UI Emoji');
    });
}

export default fontFamily;
