import {PixelRatio} from 'react-native';

/**
 * Calculate the fontSize, lineHeight and padding when the device font size is changed, In most cases users do not change their device font size so PixelRatio.getFontScale() = 1 and this
 * method always return defaultValue (first param). when device font size increases/decrease, PixelRatio.getFontScale() value increases/decrease as well. this means if you hava a text
 * and the 'fontSize' of it is 19, then the device font size changed to the 5th level on ios slider now the actual fontSize = 19 * PixelRatio.getFontScale() = 19 * 1.11 = 21.09 since we are
 * disallowing font scaling we need to calculate it manually, so we are using this equation : PixelRatio.getFontScale() * defaultValue > maxValue ? maxValue : defaultValue * PixelRatio.
 * getFontScale() this equation means increases/decreases the fontSize when the device font size increases/decreases but do not increase it if the fontSize value exceed maxValue (second
 * param).
 * @param {Number} defaultValue
 * @param {Number} maxValue
 * @returns {Number}
 */
function getValueUsingPixelRatio(defaultValue, maxValue) {
    return PixelRatio.getFontScale() * defaultValue > maxValue ? maxValue : defaultValue * PixelRatio.getFontScale();
}

export default {
    contentHeaderHeight: getValueUsingPixelRatio(65, 100),
    componentSizeSmall: getValueUsingPixelRatio(28, 32),
    componentSizeNormal: 40,
    inputComponentSizeNormal: 42,
    componentSizeLarge: 52,
    componentBorderRadius: 8,
    componentBorderRadiusSmall: 4,
    componentBorderRadiusNormal: 8,
    componentBorderRadiusCard: 12,
    buttonBorderRadius: 100,
    avatarSizeLarge: 80,
    avatarSizeNormal: 40,
    avatarSizeSmall: 28,
    avatarSizeSmaller: 24,
    avatarSizeSubscript: 20,
    avatarSizeSmallSubscript: 14,
    fontSizeOnlyEmojis: 30,
    fontSizeOnlyEmojisHeight: 35,
    fontSizeSmall: getValueUsingPixelRatio(11, 17),
    fontSizeExtraSmall: 9,
    fontSizeLabel: getValueUsingPixelRatio(13, 19),
    fontSizeNormal: getValueUsingPixelRatio(15, 21),
    fontSizeMedium: getValueUsingPixelRatio(16, 22),
    fontSizeLarge: getValueUsingPixelRatio(17, 19),
    fontSizeHero: 36,
    fontSizeh1: 19,
    fontSizeXXLarge: 28,
    fontSizeXXXLarge: 32,
    fontSizeNormalHeight: getValueUsingPixelRatio(20, 28),
    lineHeightHero: 40,
    iconSizeXXXSmall: 4,
    iconSizeXXSmall: 8,
    iconSizeExtraSmall: 12,
    iconSizeSmall: 16,
    iconSizeNormal: 20,
    iconSizeLarge: 24,
    iconSizeXLarge: 28,
    iconSizeExtraLarge: 40,
    iconSizeSuperLarge: 60,
    emojiSize: 20,
    emojiLineHeight: 28,
    iouAmountTextSize: 40,
    mobileResponsiveWidthBreakpoint: 800,
    tabletResponsiveWidthBreakpoint: 1024,
    safeInsertPercentage: 0.7,
    sideBarWidth: 375,
    pdfPageMaxWidth: 992,
    tooltipzIndex: 10050,
    gutterWidth: 16,
    popoverMenuShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.06)',
    minHeightToShowGraphics: 854, // Login form layout breaks below this height due to insufficient space to show the form and graphics
    optionRowHeight: 64,
    optionRowHeightCompact: 52,
    optionsListSectionHeaderHeight: getValueUsingPixelRatio(54, 60),
    lineHeightSmall: getValueUsingPixelRatio(14, 16),
    lineHeightNormal: getValueUsingPixelRatio(16, 21),
    lineHeightLarge: getValueUsingPixelRatio(18, 24),
    lineHeightXLarge: getValueUsingPixelRatio(20, 24),
    inputHeight: getValueUsingPixelRatio(50, 72),
    formErrorLineHeight: getValueUsingPixelRatio(18, 23),
    communicationsLinkHeight: getValueUsingPixelRatio(20, 30),
    alternateTextHeight: getValueUsingPixelRatio(20, 24),
    INACTIVE_LABEL_TRANSLATE_Y: getValueUsingPixelRatio(16, 21),
    sliderBarHeight: 8,
    sliderKnobSize: 26,
};
