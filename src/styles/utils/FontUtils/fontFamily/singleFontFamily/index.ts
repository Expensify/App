// eslint-disable-next-line no-restricted-imports
import type FontFamilyStyles from '@styles/utils/FontUtils/fontFamily/types';
// eslint-disable-next-line no-restricted-imports
import fontWeight from '@styles/utils/FontUtils/fontWeight';

const fontFamily: FontFamilyStyles = {
    SYSTEM: {
        fontFamily: 'System',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },

    MONOSPACE: {
        fontFamily: 'ExpensifyMono-Regular',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    MONOSPACE_BOLD: {
        fontFamily: 'ExpensifyMono-Bold',
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },

    EXP_NEUE: {
        fontFamily: 'ExpensifyNeue-Regular',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD: {
        fontFamily: 'ExpensifyMono-Regular',
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },
    EXP_NEUE_ITALIC: {
        fontFamily: 'ExpensifyMono-Regular',
        fontStyle: 'italic',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD_ITALIC: {
        fontFamily: 'ExpensifyMono-Regular',
        fontStyle: 'italic',
        fontWeight: fontWeight.bold,
    },

    EXP_NEW_KANSAS_MEDIUM: {
        fontFamily: 'ExpensifyNewKansas-Medium',
        fontStyle: 'normal',
        fontWeight: fontWeight.medium,
    },
    EXP_NEW_KANSAS_MEDIUM_ITALIC: {
        fontFamily: 'ExpensifyNewKansas-MediumItalic',
        fontStyle: 'italic',
        fontWeight: fontWeight.medium,
    },
};

export default fontFamily;
