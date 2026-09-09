import {getVisibleRHPRouteWidth, subscribeToVisibleRHPRouteKeys} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type {Route} from '@react-navigation/native';

import {NavigationRouteContext} from '@react-navigation/native';
import {createContext, useContext, useSyncExternalStore} from 'react';

import type ResponsiveLayoutOnWideRHPResult from './types';

// Dozens of suites replace @react-navigation/native with a partial factory, leaving this undefined, so fall back to a noop context to keep useContext valid.
const FallbackRouteContext = createContext<Route<string> | undefined>(undefined);

/**
 * useResponsiveLayoutOnWideRHP is a wrapper on useResponsiveLayout. shouldUseNarrowLayout on a wide screen is true when the screen is displayed in RHP.
 * In this hook this value is modified when the screen is displayed in Wide/Super Wide RHP, then in wide screen this value is false.
 */
export default function useResponsiveLayoutOnWideRHP(): ResponsiveLayoutOnWideRHPResult {
    // Read from context rather than useRoute, which throws when a caller renders outside a navigator screen.
    const route = useContext(NavigationRouteContext ?? FallbackRouteContext);

    const responsiveLayoutValues = useResponsiveLayout();

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInNarrowPaneModal} = responsiveLayoutValues;

    const displayedRHPWidth = useSyncExternalStore(subscribeToVisibleRHPRouteKeys, () => getVisibleRHPRouteWidth(route?.key));

    const isWideRHPDisplayedOnWideLayout = !isSmallScreenWidth && displayedRHPWidth === 'wide';

    const isSuperWideRHPDisplayedOnWideLayout = !isSmallScreenWidth && displayedRHPWidth === 'super-wide';

    const shouldUseNarrowLayout = (isSmallScreenWidth || isInNarrowPaneModal) && !isSuperWideRHPDisplayedOnWideLayout && !isWideRHPDisplayedOnWideLayout;

    return {
        ...responsiveLayoutValues,
        shouldUseNarrowLayout,
        shouldUseNarrowLayoutIgnoringWideRHP: responsiveLayoutValues.shouldUseNarrowLayout,
        isWideRHPDisplayedOnWideLayout,
        isSuperWideRHPDisplayedOnWideLayout,
    };
}
