import type {WideRHPContextType} from './types';

const defaultWideRHPContextValue: WideRHPContextType = {
    wideRHPRouteKeys: [],
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    removeWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    markReportIDAsMultiTransactionExpense: () => {},
    unmarkReportIDAsMultiTransactionExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    isReportIDMarkedAsMultiTransactionExpense: () => false,
    isWideRHPClosing: false,
    setIsWideRHPClosing: () => {},
    isWideRHPFocused: false,
    shouldRenderTertiaryOverlay: false,
    superWideRHPRouteKeys: [],
    showSuperWideRHPVersion: () => {},
    removeSuperWideRHPRouteKey: () => {},
    syncWideRHPKeys: () => {},
    syncSuperWideRHPKeys: () => {},
    clearWideRHPKeys: () => {},
};

export default defaultWideRHPContextValue;
