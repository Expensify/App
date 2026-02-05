import fontFamily from './fontFamily';
import multiFontFamily from './fontFamily/multiFontFamily';
import singleFontFamily from './fontFamily/singleFontFamily';
import fontWeight from './fontWeight';

const FontUtils = {
    fontFamily: {
        /**
         * Set of font families that can either have fallback fonts (if web) or not (if native).
         */
        platform: fontFamily,

        /**
         * Set of font families that don't include any fallback fonts, normally used on native platforms.
         */
        single: singleFontFamily,

        /**
         * Set of font families that include fallback fonts, normally used on web platform.
         */
        multi: multiFontFamily,
    },
    fontWeight,
} as const;

type FontUtilsType = typeof FontUtils;

export default FontUtils;
export type {FontUtilsType};
