import React, {createContext} from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import defaultWideRHPContextValue from './default';
import type {WideRHPContextType} from './types';

const expandedRHPProgress = new Animated.Value(0);
const secondOverlayProgress = new Animated.Value(0);
const receiptPaneRHPWidth = new Animated.Value(0);

const WideRHPContext = createContext<WideRHPContextType>(defaultWideRHPContextValue);

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    return <WideRHPContext.Provider value={defaultWideRHPContextValue}>{children}</WideRHPContext.Provider>;
}

// Wide RHP is not displayed on native platforms
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function useShowWideRHPVersion(condition: boolean) {}

WideRHPContextProvider.displayName = 'WideRHPContextProvider';

export default WideRHPContextProvider;
export type {WideRHPContextType};
export {expandedRHPProgress, secondOverlayProgress, WideRHPContext, useShowWideRHPVersion, receiptPaneRHPWidth};
