export default function useResponsiveLayout() {
    return {
        shouldUseNarrowLayout: false,
        isSmallScreenWidth: false,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isExtraSmallScreenWidth: false,
        isMediumScreenWidth: false,
        onboardingIsMediumOrLargerScreenWidth: true,
        isLargeScreenWidth: true,
        isSmallScreen: false,
        isSmallScreenHeight: false,
    };
}
