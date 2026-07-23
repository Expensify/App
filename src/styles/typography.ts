import type {TextStyle} from 'react-native';

import FontUtils from './utils/FontUtils';
import whiteSpace from './utils/whiteSpace';
import variables from './variables';

/**
 * Primitive typography scale. These are the only sizes, line heights, and families the app uses;
 * everything else composes them. Do not add raw `fontSize`/`lineHeight` literals outside this file
 * and variables.ts (enforced by the `rulesdir/no-raw-typography` lint rule).
 */
const fontScale = {
    micro: variables.fontSizeSmall,
    label: variables.fontSizeLabel,
    text: variables.fontSizeNormal,
    pageHeader: variables.fontSizeLarge,
    h2: variables.fontSizeH2,
    h1: variables.fontSizeXLarge,
    hero: variables.fontSizeHero,
} as const;

const lineHeightScale = {
    micro: variables.lineHeightSmall,
    label: variables.lineHeightLarge,
    text: variables.fontSizeNormalHeight,
    pageHeader: variables.lineHeightXLarge,
    h2: variables.lineHeightSizeH2,
    h1: variables.lineHeightSizeH1,
    hero: variables.lineHeightHero,
} as const;

const fontFamilyScale = {
    regular: FontUtils.fontFamily.platform.EXP_NEUE,
    strong: FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
    heading: FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
} as const;

/**
 * Semantic text styles, named 1:1 after the `Product/*` text styles in the Figma library
 * (`hero` is code-only; it has no Figma counterpart yet). Type only — color is attached where a
 * variant is used (theme-aware styles or the `color` prop), never here.
 */
const textVariants = {
    micro: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.micro,
        lineHeight: lineHeightScale.micro,
    },
    label: {
        ...fontFamilyScale.regular,
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
    hero: {
        ...fontFamilyScale.heading,
        fontSize: fontScale.hero,
        lineHeight: lineHeightScale.hero,
    },
} as const satisfies Record<string, TextStyle>;

type TextVariant = keyof typeof textVariants;

export {fontFamilyScale, fontScale, lineHeightScale, textVariants};
export type {TextVariant};
