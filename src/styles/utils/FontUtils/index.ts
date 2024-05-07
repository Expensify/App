import fontFamily from './fontFamily';
import multiFontFamily from './fontFamily/multiFontFamily';
import singleFontFamily from './fontFamily/singleFontFamily';
import fontWeight from './fontWeight';

const FontUtils = {
    fontFamily: {
        platform: fontFamily,
        single: singleFontFamily,
        multi: multiFontFamily,
    },
    fontWeight,
} as const;

type FontUtilsType = typeof FontUtils;

export default FontUtils;
export type {FontUtilsType};
