import fontFamily from './fontFamily';
import multiFontFamily from './fontFamily/multiFontFamily';
import singleFontFamily from './fontFamily/singleFontFamily';

const FontUtils = {
    fontFamily: {
        platform: fontFamily,
        single: singleFontFamily,
        multi: multiFontFamily,
    },
    fontWeight: {
        normal: '400',
        bold: '700',
    },
} as const;

type FontUtilsType = typeof FontUtils;

export default FontUtils;
export type {FontUtilsType};
