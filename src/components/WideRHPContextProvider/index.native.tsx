import React, {createContext} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import defaultWideRHPContextValue from './default';
import type {WideRHPContextType} from './types';

const secondOverlayWideRHPProgress = new Animated.Value(0);
const secondOverlayRHPOnWideRHPProgress = new Animated.Value(0);
const secondOverlayRHPOnSuperWideRHPProgress = new Animated.Value(0);
const thirdOverlayProgress = new Animated.Value(0);

const animatedReceiptPaneRHPWidth = new Animated.Value(0);
const animatedWideRHPWidth = new Animated.Value(0);
const animatedSuperWideRHPWidth = new Animated.Value(0);

const modalStackOverlaySuperWideRHPPositionLeft = new Animated.Value(0);
const modalStackOverlayWideRHPPositionLeft = new Animated.Value(0);

const expandedRHPProgress = new Animated.Value(0);

const WideRHPContext = createContext<WideRHPContextType>(defaultWideRHPContextValue);

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    return <WideRHPContext.Provider value={defaultWideRHPContextValue}>{children}</WideRHPContext.Provider>;
}

export default WideRHPContextProvider;
export {
    animatedReceiptPaneRHPWidth,
    animatedSuperWideRHPWidth,
    animatedWideRHPWidth,
    expandedRHPProgress,
    modalStackOverlaySuperWideRHPPositionLeft,
    modalStackOverlayWideRHPPositionLeft,
    secondOverlayRHPOnSuperWideRHPProgress,
    secondOverlayRHPOnWideRHPProgress,
    secondOverlayWideRHPProgress,
    thirdOverlayProgress,
    WideRHPContext,
};
export type {WideRHPContextType};
