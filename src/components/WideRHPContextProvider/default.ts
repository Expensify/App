// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';
import type {WideRHPContextType} from './types';

const getDefaultWideRHPContextValue: () => WideRHPContextType = () => ({
    wideRHPRouteKeys: [],
    expandedRHPProgress: new Animated.Value(0),
    secondOverlayProgress: new Animated.Value(0),
    shouldRenderSecondaryOverlay: false,
    showWideRHPVersion: () => {},
    cleanWideRHPRouteKey: () => {},
    markReportIDAsExpense: () => {},
    isReportIDMarkedAsExpense: () => false,
    dismissToWideReport: () => {},
});

export default getDefaultWideRHPContextValue;
