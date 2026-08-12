import type {TextStyle} from 'react-native';

import FontUtils from './utils/FontUtils';
import whiteSpace from './utils/whiteSpace';
import variables from './variables';

/**
 * Primitive typography scale. These are the only sizes, line heights, and families the app uses.
 * Everything else composes them. Do not add raw `fontSize`/`lineHeight` literals outside this file
 * and variables.ts (enforced by the `rulesdir/no-raw-typography` lint rule).
 */
const fontScale = {
    finePrint: variables.fontSizeExtraSmall,
    micro: variables.fontSizeSmall,
    label: variables.fontSizeLabel,
    text: variables.fontSizeNormal,
    pageHeader: variables.fontSizeLarge,
    h2: variables.fontSizeH2,
    h1: variables.fontSizeXLarge,
    introHeadline: variables.fontSizeHero,
} as const;

const lineHeightScale = {
    finePrint: variables.lineHeightFinePrint,
    micro: variables.lineHeightSmall,
    label: variables.lineHeightNormal,
    text: variables.fontSizeNormalHeight,
    pageHeader: variables.lineHeightXLarge,
    h2: variables.lineHeightSizeH2,
    h1: variables.lineHeightSizeH1,
    introHeadline: variables.lineHeightHero,
} as const;

const fontFamilyScale = {
    regular: FontUtils.fontFamily.platform.EXP_NEUE,
    strong: FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
    heading: FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
    mono: FontUtils.fontFamily.platform.MONOSPACE,
    monoStrong: FontUtils.fontFamily.platform.MONOSPACE_BOLD,
} as const;

/**
 * Semantic text styles, named 1:1 after the `Product/*` text styles in the Figma library.
 * These carry type only. Color is attached where a variant is used (theme-aware styles or the
 * `color` prop), never here.
 */
const textVariants = {
    finePrint: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.finePrint,
        lineHeight: lineHeightScale.finePrint,
    },
    finePrintStrong: {
        ...fontFamilyScale.strong,
        fontSize: fontScale.finePrint,
        lineHeight: lineHeightScale.finePrint,
    },
    micro: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.micro,
        lineHeight: lineHeightScale.micro,
    },
    microStrong: {
        ...fontFamilyScale.strong,
        fontSize: fontScale.micro,
        lineHeight: lineHeightScale.micro,
    },
    label: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.label,
        lineHeight: lineHeightScale.label,
    },
    labelStrong: {
        ...fontFamilyScale.strong,
        fontSize: fontScale.label,
        lineHeight: lineHeightScale.label,
    },
    text: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.text,
        lineHeight: lineHeightScale.text,
    },
    textStrong: {
        ...fontFamilyScale.strong,
        fontSize: fontScale.text,
        lineHeight: lineHeightScale.text,
    },
    mono: {
        ...fontFamilyScale.mono,
        fontSize: fontScale.text,
        lineHeight: lineHeightScale.text,
    },
    monoStrong: {
        ...fontFamilyScale.monoStrong,
        fontSize: fontScale.text,
        lineHeight: lineHeightScale.text,
    },
    pageHeader: {
        ...fontFamilyScale.strong,
        ...whiteSpace.preWrap,
        fontSize: fontScale.pageHeader,
        lineHeight: lineHeightScale.pageHeader,
    },
    h2: {
        ...fontFamilyScale.heading,
        ...whiteSpace.preWrap,
        fontSize: fontScale.h2,
        lineHeight: lineHeightScale.h2,
    },
    h1: {
        ...fontFamilyScale.heading,
        ...whiteSpace.preWrap,
        fontSize: fontScale.h1,
        lineHeight: lineHeightScale.h1,
    },
    introHeadline: {
        ...fontFamilyScale.heading,
        fontSize: fontScale.introHeadline,
        lineHeight: lineHeightScale.introHeadline,
    },
} as const satisfies Record<string, TextStyle>;

type TextVariant = keyof typeof textVariants;

export {fontFamilyScale, fontScale, lineHeightScale, textVariants};
export type {TextVariant};
