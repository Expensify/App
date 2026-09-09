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
    // Register the route at the given width. 'narrow' drops its registration.
    setRHPWidth: (route: NavigationRoute, width: RHPWidth) => void;

    // Called on screen unmount, which is what bounds how long a dismissing screen holds its width.
    removeRHPRouteKey: (route: NavigationRoute) => void;

    // Set an optimistic width hint for a reportID before navigation. The latest mark wins.
    markReportRHPWidth: (reportID: string | undefined, width: RHPWidthHint) => void;

    // Clear the hint for a reportID. Pass `width` to clear only that one.
    unmarkReportRHPWidth: (reportID: string, width?: RHPWidthHint) => void;

    // Read the optimistic width hint for a reportID. Consumed by the screen it was marked for.
    getReportRHPWidthHint: (reportID: string) => RHPWidthHint | undefined;
};

export type {RHPWidth, RHPWidthHint, WideRHPStateContextType, WideRHPActionsContextType};
