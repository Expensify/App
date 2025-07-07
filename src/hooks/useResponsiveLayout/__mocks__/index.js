"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useResponsiveLayout;
function useResponsiveLayout() {
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
    };
}
