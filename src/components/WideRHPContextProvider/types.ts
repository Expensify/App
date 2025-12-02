import type {NavigationRoute} from '@libs/Navigation/types';

type WideRHPContextType = {
    // Route keys of screens that should be displayed in wide format
    wideRHPRouteKeys: string[];

    // Route keys of screens that should be displayed in super wide format
    superWideRHPRouteKeys: string[];

    // If the secondary overlay should be rendered. This value takes into account the delay of closing transition.
    shouldRenderSecondaryOverlay: boolean;

    // If the tertiary overlay should be rendered. This value takes into account the delay of closing transition.
    shouldRenderTertiaryOverlay: boolean;

    // Show given route as in wide format
    showWideRHPVersion: (route: NavigationRoute) => void;

    // Show given route as in super wide format
    showSuperWideRHPVersion: (route: NavigationRoute) => void;

    // Remove given route from the array
    removeWideRHPRouteKey: (route: NavigationRoute) => void;

    // Remove given route from the array
    removeSuperWideRHPRouteKey: (route: NavigationRoute) => void;

    // Mark reportID as expense before condition check
    markReportIDAsExpense: (reportID: string) => void;

    // Mark reportID as multi-transaction expense before condition check
    markReportIDAsMultiTransactionExpense: (reportID: string) => void;

    // Unmark reportID as multi-transaction expense before condition check
    unmarkReportIDAsMultiTransactionExpense: (reportID: string) => void;

    // Check if reportID is marked as expense
    isReportIDMarkedAsExpense: (reportID: string) => boolean;

    // Check if reportID is marked as multi-transaction expense
    isReportIDMarkedAsMultiTransactionExpense: (reportID: string) => boolean;

    // Whether the currently focused route is inside the wide RHP set
    isWideRHPFocused: boolean;

    // Whether the wide rhp modal is closing
    isWideRHPClosing: boolean;

    // Mark that wide rhp is being closed
    setIsWideRHPClosing: (isClosing: boolean) => void;

    // Sync wide RHP keys with the visible RHP screens
    syncWideRHPKeys: () => void;

    // Sync super wide RHP keys with the visible RHP screens
    syncSuperWideRHPKeys: () => void;

    // Clear the arrays of wide and super wide rhp keys
    clearWideRHPKeys: () => void;
};

// eslint-disable-next-line import/prefer-default-export
export type {WideRHPContextType};
