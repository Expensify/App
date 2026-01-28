import type {WideRHPContextType} from './types';

const defaultWideRHPContextValue: WideRHPContextType = {
    wideRHPRouteKeys: [],
    shouldRenderSecondaryOverlayForWideRHP: false,
    shouldRenderSecondaryOverlayForRHPOnWideRHP: false,
    shouldRenderSecondaryOverlayForRHPOnSuperWideRHP: false,
    showWideRHPVersion: () => {},
    removeWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    markReportIDAsMultiTransactionExpense: () => {},
    unmarkReportIDAsMultiTransactionExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    isReportIDMarkedAsMultiTransactionExpense: () => false,
    isWideRHPFocused: false,
    isSuperWideRHPFocused: false,
    shouldRenderTertiaryOverlay: false,
    superWideRHPRouteKeys: [],
    showSuperWideRHPVersion: () => {},
    removeSuperWideRHPRouteKey: () => {},
    syncRHPKeys: () => {},
    clearWideRHPKeys: () => {},
};

export default defaultWideRHPContextValue;
