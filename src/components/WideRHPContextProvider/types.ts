// eslint-disable-next-line no-restricted-imports
import type {Animated} from 'react-native';
import type {NavigationRoute} from '@libs/Navigation/types';

type WideRHPContextType = {
    // Route keys of screens that should be displayed in wide format
    wideRHPRouteKeys: string[];

    // Route keys of screens that should be displayed in super wide format
    superWideRHPRouteKeys: string[];

    // Progress of changing format: 0 - narrow, 1 - wide, 2 - super-wide
    expandedRHPProgress: Animated.Value;

    // Progress of the secondary overlay, the one covering wider RHP screen
    secondOverlayProgress: Animated.Value;

    // Progress of the tertiary overlay, the one covering wider RHP screen
    thirdOverlayProgress: Animated.Value;

    // If the secondary overlay should be rendered. This value takes into account the delay of closing transition.
    shouldRenderSecondaryOverlay: boolean;

    // If the tertiary overlay should be rendered. This value takes into account the delay of closing transition.
    shouldRenderTertiaryOverlay: boolean;

    // Show given route as in wide format
    showWideRHPVersion: (route: NavigationRoute) => void;

    // Show given route as in super wide format
    showSuperWideRHPVersion: (route: NavigationRoute) => void;

    // Remove given route from the array
    cleanWideRHPRouteKey: (route: NavigationRoute) => void;

    // Mark reportID as expense before condition check
    markReportIDAsExpense: (reportID: string) => void;

    // Check if reportID is marked as expense
    isReportIDMarkedAsExpense: (reportID: string) => boolean;

    // Navigate to the first visible RHP 
    dismissToFirstRHP: () => void;

    // Navigate to the second visible RHP
    dismissToSecondRHP: () => void;

    // Whether the currently focused route is inside the wide RHP set
    isWideRHPFocused: boolean;

    // Whether the wide rhp modal is closing
    isWideRHPClosing: boolean;

    // Mark that wide rhp is being closed
    setIsWideRHPClosing: (isClosing: boolean) => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {WideRHPContextType};
