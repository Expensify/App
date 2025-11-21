import type {WideRHPContextType} from './types';

const defaultWideRHPContextValue: WideRHPContextType = {
    wideRHPRouteKeys: [],
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    cleanWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    markReportIDAsMultiTransactionExpense: () => {},
    unmarkReportIDAsMultiTransactionExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    isReportIDMarkedAsMultiTransactionExpense: () => false,
    dismissToFirstRHP: () => {},
    dismissToSecondRHP: () => {},
    isWideRHPClosing: false,
    setIsWideRHPClosing: () => {},
    isWideRHPFocused: false,
    shouldRenderTertiaryOverlay: false,
    superWideRHPRouteKeys: [],
    showSuperWideRHPVersion: () => {},
    syncWideRHPKeys: () => {},
    syncSuperWideRHPKeys: () => {},
    clearWideRHPKeys: () => {},
};

export default defaultWideRHPContextValue;
