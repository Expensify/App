import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

export default function useResponsiveLayout(): ResponsiveLayoutResult {
    return {
        shouldUseNarrowLayout: true,
        isSmallScreenWidth: true,
        isInNarrowPaneModal: false,
        isExtraSmallScreenHeight: false,
        isExtraSmallScreenWidth: false,
        isMediumScreenWidth: false,
        onboardingIsMediumOrLargerScreenWidth: false,
        isLargeScreenWidth: false,
        isExtraLargeScreenWidth: false,
        isSmallScreen: true,
        isInLandscapeMode: false,
    };
}
