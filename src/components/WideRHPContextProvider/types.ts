import type {NavigationRoute} from '@libs/Navigation/types';

type RHPWidth = 'narrow' | 'wide' | 'super-wide';

type RHPWidthHint = Exclude<RHPWidth, 'narrow'>;

type WideRHPStateContextType = {
    // Route keys of screens that should be displayed in wide format
    wideRHPRouteKeys: string[];

    // Route keys of screens that should be displayed in super wide format
    superWideRHPRouteKeys: string[];

    // If the secondary overlay for wide RHP on super wide RHP should be rendered. This value takes into account the delay of closing transition.
    shouldRenderSecondaryOverlayForWideRHP: boolean;

    // If the secondary overlay for single RHP on wide RHP should be rendered. This value takes into account the delay of closing transition.
    shouldRenderSecondaryOverlayForRHPOnWideRHP: boolean;

    // If the secondary overlay for single RHP on super wide RHP should be rendered. This value takes into account the delay of closing transition.
    shouldRenderSecondaryOverlayForRHPOnSuperWideRHP: boolean;

    // If the tertiary overlay should be rendered. This value takes into account the delay of closing transition.
    shouldRenderTertiaryOverlay: boolean;

    // Whether the currently focused route is inside the wide RHP set
    isWideRHPFocused: boolean;

    // Whether the currently focused route is inside the super wide RHP set
    isSuperWideRHPFocused: boolean;
};

type WideRHPActionsContextType = {
    // Register the route at the given width. 'narrow' removes from both sets.
    setRHPWidth: (route: NavigationRoute, width: RHPWidth) => void;

    // Remove the route from both sets (used on screen unmount).
    removeRHPRouteKey: (route: NavigationRoute) => void;

    // Set an optimistic width hint for a reportID before navigation.
    markReportRHPWidth: (reportID: string | undefined, width: RHPWidthHint) => void;

    // Clear the hint(s) for a reportID. Pass `width` to clear only that one.
    unmarkReportRHPWidth: (reportID: string, width?: RHPWidthHint) => void;

    // Read the optimistic width hint for a reportID.
    getReportRHPWidthHint: (reportID: string) => RHPWidthHint | undefined;

    // Sync super wide and wide RHP keys with the visible RHP screens
    syncRHPKeys: () => void;

    // Clear the arrays of wide and super wide rhp keys
    clearWideRHPKeys: () => void;

    // Set that wide rhp is closing
    setIsWideRHPClosing: (isClosing: boolean) => void;

    // Set that super wide rhp is closing
    setIsSuperWideRHPClosing: (isClosing: boolean) => void;
};

export type {RHPWidth, RHPWidthHint, WideRHPStateContextType, WideRHPActionsContextType};
