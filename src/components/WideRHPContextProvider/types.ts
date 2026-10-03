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
    // 'narrow' drops the route's registration.
    setRHPWidth: (route: NavigationRoute, width: RHPWidth) => void;

    // Called on unmount, which ends a dismissing screen's width hold.
    removeRHPRouteKey: (route: NavigationRoute) => void;

    // Leaves a width for the screen this press opens. The latest mark wins.
    markReportRHPWidth: (reportID: string | undefined, width: RHPWidthHint) => void;
};

export type {RHPWidth, RHPWidthHint, WideRHPStateContextType, WideRHPActionsContextType};
