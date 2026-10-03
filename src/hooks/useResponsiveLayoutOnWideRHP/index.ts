import {getRHPRouteWidth, subscribeToRHPRouteKeys} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import type {Route} from '@react-navigation/native';

import {NavigationRouteContext} from '@react-navigation/native';
import {createContext, useContext, useSyncExternalStore} from 'react';

import type ResponsiveLayoutOnWideRHPResult from './types';

// Tests that mock @react-navigation/native partially leave this undefined.
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

    const rhpWidth = useSyncExternalStore(subscribeToRHPRouteKeys, () => getRHPRouteWidth(route?.key));

    const isWideRHPDisplayedOnWideLayout = !isSmallScreenWidth && rhpWidth === 'wide';

    const isSuperWideRHPDisplayedOnWideLayout = !isSmallScreenWidth && rhpWidth === 'super-wide';

    const shouldUseNarrowLayout = (isSmallScreenWidth || isInNarrowPaneModal) && !isSuperWideRHPDisplayedOnWideLayout && !isWideRHPDisplayedOnWideLayout;

    return {
        ...responsiveLayoutValues,
        shouldUseNarrowLayout,
        isWideRHPDisplayedOnWideLayout,
        isSuperWideRHPDisplayedOnWideLayout,
    };
}
