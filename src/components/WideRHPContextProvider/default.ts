import type {WideRHPActionsContextType, WideRHPStateContextType} from './types';

const defaultWideRHPStateContextValue: WideRHPStateContextType = {
    wideRHPRouteKeys: [],
    superWideRHPRouteKeys: [],
    shouldRenderSecondaryOverlayForWideRHP: false,
    shouldRenderSecondaryOverlayForRHPOnWideRHP: false,
    shouldRenderSecondaryOverlayForRHPOnSuperWideRHP: false,
    shouldRenderTertiaryOverlay: false,
    isWideRHPFocused: false,
    isSuperWideRHPFocused: false,
};

const defaultWideRHPActionsContextValue: WideRHPActionsContextType = {
    setRHPWidth: () => {},
    removeRHPRouteKey: () => {},
    markReportRHPWidth: () => {},
};

export {defaultWideRHPStateContextValue, defaultWideRHPActionsContextValue};
