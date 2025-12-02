import React, {createContext} from 'react';
// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import SCREENS from '@src/SCREENS';
import defaultWideRHPContextValue from './default';
import type {WideRHPContextType} from './types';

const secondOverlayProgress = new Animated.Value(0);
const thirdOverlayProgress = new Animated.Value(0);

const animatedReceiptPaneRHPWidth = new Animated.Value(0);
const animatedWideRHPWidth = new Animated.Value(0);
const animatedSuperWideRHPWidth = new Animated.Value(0);

const modalStackOverlaySuperWideRHPPositionLeft = new Animated.Value(0);
const modalStackOverlayWideRHPPositionLeft = new Animated.Value(0);

const expandedRHPProgress = new Animated.Value(0);
const innerRHPProgress = new Animated.Value(0);

const WideRHPContext = createContext<WideRHPContextType>(defaultWideRHPContextValue);

const WIDE_RIGHT_MODALS = new Set<string>([SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT, SCREENS.RIGHT_MODAL.SEARCH_REPORT]);

const SUPER_WIDE_RIGHT_MODALS = new Set<string>([SCREENS.RIGHT_MODAL.SEARCH_MONEY_REQUEST_REPORT, SCREENS.RIGHT_MODAL.EXPENSE_REPORT]);

function WideRHPContextProvider({children}: React.PropsWithChildren) {
    return <WideRHPContext.Provider value={defaultWideRHPContextValue}>{children}</WideRHPContext.Provider>;
}

WideRHPContextProvider.displayName = 'WideRHPContextProvider';

export default WideRHPContextProvider;
export type {WideRHPContextType};
export {
    animatedReceiptPaneRHPWidth,
    animatedSuperWideRHPWidth,
    animatedWideRHPWidth,
    expandedRHPProgress,
    innerRHPProgress,
    modalStackOverlaySuperWideRHPPositionLeft,
    modalStackOverlayWideRHPPositionLeft,
    secondOverlayProgress,
    thirdOverlayProgress,
    WideRHPContext,
    WIDE_RIGHT_MODALS,
    SUPER_WIDE_RIGHT_MODALS,
};
