import React, {createContext, useContext} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import {defaultWideRHPActionsContextValue, defaultWideRHPStateContextValue} from './default';
import type {WideRHPActionsContextType, WideRHPStateContextType} from './types';

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

const WideRHPStateContext = createContext<WideRHPStateContextType>(defaultWideRHPStateContextValue);
const WideRHPActionsContext = createContext<WideRHPActionsContextType>(defaultWideRHPActionsContextValue);

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    return (
        <WideRHPStateContext.Provider value={defaultWideRHPStateContextValue}>
            <WideRHPActionsContext.Provider value={defaultWideRHPActionsContextValue}>{children}</WideRHPActionsContext.Provider>
        </WideRHPStateContext.Provider>
    );
}

function useWideRHPState() {
    return useContext(WideRHPStateContext);
}

function useWideRHPActions() {
    return useContext(WideRHPActionsContext);
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
    WideRHPStateContext,
    WideRHPActionsContext,
    useWideRHPState,
    useWideRHPActions,
};
export type {WideRHPStateContextType, WideRHPActionsContextType};
