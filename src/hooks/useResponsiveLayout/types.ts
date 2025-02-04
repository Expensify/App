type ResponsiveLayoutResult = {
    shouldUseNarrowLayout: boolean;
    isSmallScreenWidth: boolean;
    isInNarrowPaneModal: boolean;
    isExtraSmallScreenHeight: boolean;
    isMediumScreenWidth: boolean;
    isLargeScreenWidth: boolean;
    isExtraSmallScreenWidth: boolean;
    isSmallScreen: boolean;
    onboardingIsMediumOrLargerScreenWidth: boolean;
    fontScale: number;
    getFontScaleAdjustedSize: (defaultValue: number, maxValue: number) => number;
};
export default ResponsiveLayoutResult;
