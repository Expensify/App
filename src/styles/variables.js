import {PixelRatio} from 'react-native';

/**
 * Calculate the fontSize, lineHeight and padding when the device font size is changed, In most cases users do not change their device font size so PixelRatio.getFontScale() = 1 and this
 * method always returns the defaultValue (first param). When the device font size increases/decreases, the PixelRatio.getFontScale() value increases/decreases as well.
 * This means that if you have text and its 'fontSize' is 19, the device font size changed to the 5th level on the iOS slider and the actual fontSize is 19 * PixelRatio.getFontScale()
 * = 19 * 1.11 = 21.09. Since we are disallowing font scaling we need to calculate it manually. We calculate it with: PixelRatio.getFontScale() * defaultValue > maxValue ? maxValue :
 * defaultValue * PixelRatio getFontScale() This means that the fontSize is increased/decreased when the device font size changes up to maxValue (second param)
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
    componentBorderRadiusRounded: 20,
    buttonBorderRadius: 100,
    avatarSizeLarge: 80,
    avatarSizeMedium: 52,
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
    fontSizeXLarge: 22,
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
    modalFullscreenBackdropOpacity: 0.5,
    tabletResponsiveWidthBreakpoint: 1024,
    safeInsertPercentage: 0.7,
    sideBarWidth: 375,
    pdfPageMaxWidth: 992,
    tooltipzIndex: 10050,
    gutterWidth: 16,
    popoverMenuShadow: '0px 4px 12px 0px rgba(0, 0, 0, 0.06)',
    optionRowHeight: 64,
    optionRowHeightCompact: 52,
    optionsListSectionHeaderHeight: getValueUsingPixelRatio(54, 60),
    overlayOpacity: 0.6,
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
    checkboxLabelActiveOpacity: 0.7,
};
