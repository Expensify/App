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
    caption: variables.fontSizeSmall,
    label: variables.fontSizeLabel,
    body: variables.fontSizeNormal,
    headline: variables.fontSizeXLarge,
    display: variables.fontSizeHero,
} as const;

const lineHeightScale = {
    caption: variables.lineHeightSmall,
    label: variables.lineHeightLarge,
    body: variables.fontSizeNormalHeight,
    headline: variables.lineHeightSizeH1,
    display: variables.lineHeightHero,
} as const;

const fontFamilyScale = {
    regular: FontUtils.fontFamily.platform.EXP_NEUE,
    strong: FontUtils.fontFamily.platform.EXP_NEUE_BOLD,
    heading: FontUtils.fontFamily.platform.EXP_NEW_KANSAS_MEDIUM,
} as const;

/**
 * Semantic text styles, named to match the Figma typography library. Type only — color is attached
 * where a variant is used (theme-aware styles or the `color` prop), never here.
 */
const textVariants = {
    caption: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.caption,
        lineHeight: lineHeightScale.caption,
    },
    label: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.label,
        lineHeight: lineHeightScale.label,
    },
    body: {
        ...fontFamilyScale.regular,
        fontSize: fontScale.body,
        lineHeight: lineHeightScale.body,
    },
    bodyStrong: {
        ...fontFamilyScale.strong,
        fontSize: fontScale.body,
        lineHeight: lineHeightScale.body,
    },
    headline: {
        ...fontFamilyScale.heading,
        ...whiteSpace.preWrap,
        fontSize: fontScale.headline,
        lineHeight: lineHeightScale.headline,
    },
    display: {
        ...fontFamilyScale.heading,
        fontSize: fontScale.display,
        lineHeight: lineHeightScale.display,
    },
} as const satisfies Record<string, TextStyle>;

type TextVariant = keyof typeof textVariants;

export {fontFamilyScale, fontScale, lineHeightScale, textVariants};
export type {TextVariant};
