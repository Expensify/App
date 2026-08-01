import {getVisibleRHPRouteWidth, subscribeToVisibleRHPRouteKeys} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {useRoute} from '@react-navigation/native';
import {useSyncExternalStore} from 'react';

import type ResponsiveLayoutOnWideRHPResult from './types';

/**
 * useResponsiveLayoutOnWideRHP is a wrapper on useResponsiveLayout. shouldUseNarrowLayout on a wide screen is true when the screen is displayed in RHP.
 * In this hook this value is modified when the screen is displayed in Wide/Super Wide RHP, then in wide screen this value is false.
 */
export default function useResponsiveLayoutOnWideRHP(): ResponsiveLayoutOnWideRHPResult {
    const route = useRoute();

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
