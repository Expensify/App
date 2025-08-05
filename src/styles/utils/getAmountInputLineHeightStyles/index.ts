import type AmountInputLineHeightStyle from './type';

/**
 * On iOS (React Native), when the device Dynamic Type font size is set to minimum,
 * the underlying CoreText/TextKit engine and React Native's `lineHeight` calculation
 * cause numeric input text to be vertically misaligned relative to the currency symbol.
 * This is due to React Native computing a forced `lineHeight` based on font metrics
 * (e.g., fontSize * defaultLineHeightMultiplier) that can round half-pixel values,
 * leading to inconsistent baseline alignment at smaller accessibility font sizes.
 * By explicitly setting `lineHeight: undefined`, we remove the style override and
 * allow the native text layout engine to apply its default line height, which
 * preserves correct alignment between the amount input and the currency symbol.
 *
 * Proof / References:
 * - https://github.com/facebook/react-native/issues/28012
 * - https://github.com/facebook/react-native/issues/45268
 *
 * This adjustment is only required on iOS native builds; on web, mWeb, and Android,
 * the default text layout correctly aligns glyphs without further intervention.
 */
function getAmountInputLineHeightStyles(): AmountInputLineHeightStyle {
    return {};
}

export default getAmountInputLineHeightStyles;
