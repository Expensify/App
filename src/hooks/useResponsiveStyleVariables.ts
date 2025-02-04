import useResponsiveLayout from './useResponsiveLayout';

export default function () {
    const {getFontScaleAdjustedSize} = useResponsiveLayout();
    return {
        contentHeaderHeight: getFontScaleAdjustedSize(72, 100),
        contentHeaderDesktopHeight: getFontScaleAdjustedSize(80, 100),
        componentSizeSmall: getFontScaleAdjustedSize(28, 32),
        breadcrumbsFontSize: getFontScaleAdjustedSize(19, 32),
        fontSizeSmall: getFontScaleAdjustedSize(11, 17),
        fontSizeLabel: getFontScaleAdjustedSize(13, 19),
        fontSizeNormal: getFontScaleAdjustedSize(15, 21),
        fontSizeMedium: getFontScaleAdjustedSize(16, 22),
        fontSizeLarge: getFontScaleAdjustedSize(17, 19),
        fontSizeXXXLarge: getFontScaleAdjustedSize(32, 37),
        fontSizeNormalHeight: getFontScaleAdjustedSize(20, 28),
        optionsListSectionHeaderHeight: getFontScaleAdjustedSize(32, 38),
        lineHeightXSmall: getFontScaleAdjustedSize(11, 17),
        lineHeightSmall: getFontScaleAdjustedSize(14, 16),
        lineHeightNormal: getFontScaleAdjustedSize(16, 21),
        lineHeightLarge: getFontScaleAdjustedSize(18, 24),
        lineHeightXLarge: getFontScaleAdjustedSize(20, 24),
        lineHeightXXLarge: getFontScaleAdjustedSize(27, 32),
        lineHeightXXXLarge: getFontScaleAdjustedSize(32, 37),
        lineHeightSizeh1: getFontScaleAdjustedSize(28, 32),
        lineHeightSizeh2: getFontScaleAdjustedSize(24, 28),
        lineHeightSignInHeroXSmall: getFontScaleAdjustedSize(32, 37),
        inputHeight: getFontScaleAdjustedSize(52, 72),
        formErrorLineHeight: getFontScaleAdjustedSize(18, 23),
        communicationsLinkHeight: getFontScaleAdjustedSize(20, 30),
        alternateTextHeight: getFontScaleAdjustedSize(20, 24),
        INACTIVE_LABEL_TRANSLATE_Y: getFontScaleAdjustedSize(16, 21),
        fontSizeToWidthRatio: getFontScaleAdjustedSize(0.8, 1),
        fontSizeEmojisWithinText: getFontScaleAdjustedSize(17, 19),
    };
}
