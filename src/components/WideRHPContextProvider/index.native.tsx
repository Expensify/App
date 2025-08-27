import React, {createContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import type {WideRHPContextType} from './types';

const expandedRHPProgress = new Animated.Value(0);
const secondOverlayProgress = new Animated.Value(0);
const receiptPaneRHPWidth = new Animated.Value(0);

const WideRHPContext = createContext<WideRHPContextType>({
    wideRHPRouteKeys: [],
    expandedRHPProgress,
    secondOverlayProgress,
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    cleanWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    dismissToWideReport: () => {},
});

const value: WideRHPContextType = {
    wideRHPRouteKeys: [],
    expandedRHPProgress,
    secondOverlayProgress,
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    cleanWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    dismissToWideReport: () => {},
};

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    return <WideRHPContext.Provider value={value}>{children}</WideRHPContext.Provider>;
}

// Wide RHP is not displayed on native platforms
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useShowWideRHPVersion(condition: boolean) {}

export default WideRHPContextProvider;
export type {WideRHPContextType};
export {expandedRHPProgress, secondOverlayProgress, WideRHPContext, useShowWideRHPVersion, receiptPaneRHPWidth};
