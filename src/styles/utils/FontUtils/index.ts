import fontFamily from './fontFamily';
import multiFontFamily from './fontFamily/multiFontFamily';
import singleFontFamily from './fontFamily/singleFontFamily';
import fontWeightBold from './fontWeight/bold';

const FontUtils = {
    fontFamily: {
        platform: fontFamily,
        single: singleFontFamily,
        multi: multiFontFamily,
    },
    fontWeight: {
        bold: fontWeightBold,
        normal: '400',
    },
} as const;

type FontUtilsType = typeof FontUtils;

export default FontUtils;
export type {FontUtilsType};
