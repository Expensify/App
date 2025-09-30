// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';
import type {NavigationRoute} from '@libs/Navigation/types';

type WideRHPContextType = {
    // Route keys of screens that should be displayed in wide format
    wideRHPRouteKeys: string[];

    // Progress of changing format: 0 - narrow, 1 - wide
    expandedRHPProgress: Animated.Value;

    // Progress of the secondary overlay, the one covering wider RHP screen
    secondOverlayProgress: Animated.Value;

    // If the secondary overlay should be rendered. This value takes into account the delay of closing transition.
    shouldRenderSecondaryOverlay: boolean;

    // Show given route as in wide format
    showWideRHPVersion: (route: NavigationRoute) => void;

    // Remove given route from the array
    cleanWideRHPRouteKey: (route: NavigationRoute) => void;

    // Mark reportID as expense before condition check
    markReportIDAsExpense: (reportID: string) => void;

    // Check if reportID is marked as expense
    isReportIDMarkedAsExpense: (reportID: string) => boolean;

    // Navigate to the last element in wideRHPRouteKeys array
    dismissToWideReport: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {WideRHPContextType};
