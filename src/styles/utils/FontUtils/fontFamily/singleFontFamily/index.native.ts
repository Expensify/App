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
        fontFamily: 'Expensify Mono',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    MONOSPACE_BOLD: {
        fontFamily: 'Expensify Mono',
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },

    EXP_NEUE: {
        fontFamily: 'Expensify Neue',
        fontStyle: 'normal',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD: {
        fontFamily: 'Expensify Neue',
        fontStyle: 'normal',
        fontWeight: fontWeight.bold,
    },
    EXP_NEUE_ITALIC: {
        fontFamily: 'Expensify Neue',
        fontStyle: 'italic',
        fontWeight: fontWeight.normal,
    },
    EXP_NEUE_BOLD_ITALIC: {
        fontFamily: 'Expensify Neue',
        fontStyle: 'italic',
        fontWeight: fontWeight.bold,
    },

    EXP_NEW_KANSAS_MEDIUM: {
        fontFamily: 'Expensify New Kansas',
        fontStyle: 'normal',
        fontWeight: fontWeight.medium,
    },
    EXP_NEW_KANSAS_MEDIUM_ITALIC: {
        fontFamily: 'Expensify New Kansas',
        fontStyle: 'italic',
        fontWeight: fontWeight.medium,
    },
};

export default fontFamily;
