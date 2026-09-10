import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

export default function useResponsiveLayout(): ResponsiveLayoutResult {
    return {
        shouldUseNarrowLayout: false,
        isSmallScreenWidth: false,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isExtraSmallScreenWidth: false,
        isMediumScreenWidth: false,
        onboardingIsMediumOrLargerScreenWidth: true,
        isLargeScreenWidth: true,
        isExtraLargeScreenWidth: true,
        isSmallScreen: false,
        isInLandscapeMode: false,
    };
}
