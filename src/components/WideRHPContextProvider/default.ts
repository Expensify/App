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
    showWideRHPVersion: () => {},
    showSuperWideRHPVersion: () => {},
    removeWideRHPRouteKey: () => {},
    removeSuperWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    markReportIDAsMultiTransactionExpense: () => {},
    unmarkReportIDAsMultiTransactionExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    isReportIDMarkedAsMultiTransactionExpense: () => false,
    syncRHPKeys: () => {},
    clearWideRHPKeys: () => {},
    setIsWideRHPClosing: () => {},
    setIsSuperWideRHPClosing: () => {},
};

export {defaultWideRHPStateContextValue, defaultWideRHPActionsContextValue};
