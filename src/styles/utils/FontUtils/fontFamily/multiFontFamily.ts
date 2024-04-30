import getOperatingSystem from '@libs/getOperatingSystem';
import CONST from '@src/CONST';
import {multiBold} from './bold';
import type FontFamilyStyles from './types';

// In windows and ubuntu, we need some extra system fonts for emojis to work properly
// otherwise few of them will appear as black and white
const fontFamily: FontFamilyStyles = {
    EXP_NEUE_ITALIC: 'ExpensifyNeue-Italic, Segoe UI Emoji, Noto Color Emoji',
    EXP_NEUE_BOLD: multiBold,
    EXP_NEUE: 'ExpensifyNeue-Regular, Segoe UI Emoji, Noto Color Emoji',
    EXP_NEW_KANSAS_MEDIUM: 'ExpensifyNewKansas-Medium, Segoe UI Emoji, Noto Color Emoji',
    EXP_NEW_KANSAS_MEDIUM_ITALIC: 'ExpensifyNewKansas-MediumItalic, Segoe UI Emoji, Noto Color Emoji',
    SYSTEM: 'System',
    MONOSPACE: 'ExpensifyMono-Regular, Segoe UI Emoji, Noto Color Emoji',
    MONOSPACE_ITALIC: 'ExpensifyMono-Regular, Segoe UI Emoji, Noto Color Emoji',
    MONOSPACE_BOLD: 'ExpensifyMono-Bold, Segoe UI Emoji, Noto Color Emoji',
    MONOSPACE_BOLD_ITALIC: 'ExpensifyMono-Bold, Segoe UI Emoji, Noto Color Emoji',
};

if (getOperatingSystem() === CONST.OS.WINDOWS) {
    Object.keys(fontFamily).forEach((key) => {
        fontFamily[key as keyof FontFamilyStyles] = fontFamily[key as keyof FontFamilyStyles].replace('Segoe UI Emoji', 'Windows Segoe UI Emoji');
    });
}

export default fontFamily;
