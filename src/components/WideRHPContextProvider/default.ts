// We use Animated for all functionality related to wide RHP to make it easier
// to interact with react-navigation components (e.g., CardContainer, interpolator), which also use Animated.
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import type {WideRHPContextType} from './types';

const defaultWideRHPContextValue: WideRHPContextType = {
    wideRHPRouteKeys: [],
    expandedRHPProgress: new Animated.Value(0),
    secondOverlayProgress: new Animated.Value(0),
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    cleanWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    dismissToWideReport: () => {},
};

export default defaultWideRHPContextValue;
