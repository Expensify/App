import type {WideRHPContextType} from './types';

const defaultWideRHPContextValue: WideRHPContextType = {
    wideRHPRouteKeys: [],
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    cleanWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    dismissToFirstRHP: () => {},
    dismissToSecondRHP: () => {},
    isWideRHPClosing: false,
    setIsWideRHPClosing: () => {},
    isWideRHPFocused: false,
    shouldRenderTertiaryOverlay: false,
    superWideRHPRouteKeys: [],
    showSuperWideRHPVersion: () => {},
};

export default defaultWideRHPContextValue;
