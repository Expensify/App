import {useWideRHPState, WideRHPStateContext} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {useRoute} from '@react-navigation/native';
import {use} from 'react';

import type ResponsiveLayoutOnWideRHPResult from './types';

/**
 * Reads the Wide RHP state only inside the RHP, so screens outside it don't re-render when that state changes.
 */
function useIsDisplayedInWideRHP({isSmallScreenWidth, isInNarrowPaneModal}: Pick<ResponsiveLayoutResult, 'isSmallScreenWidth' | 'isInNarrowPaneModal'>): boolean {
    const route = useRoute();

    if (isSmallScreenWidth || !isInNarrowPaneModal) {
        return false;
    }

    const {superWideRHPRouteKeys, wideRHPRouteKeys} = use(WideRHPStateContext);

    return wideRHPRouteKeys.includes(route?.key) || superWideRHPRouteKeys.includes(route?.key);
}

/**
 * useResponsiveLayoutOnWideRHP is a wrapper on useResponsiveLayout. shouldUseNarrowLayout on a wide screen is true when the screen is displayed in RHP.
 * In this hook this value is modified when the screen is displayed in Wide/Super Wide RHP, then in wide screen this value is false.
 */
export default function useResponsiveLayoutOnWideRHP(): ResponsiveLayoutOnWideRHPResult {
    const route = useRoute();

    const responsiveLayoutValues = useResponsiveLayout();

    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth, isInNarrowPaneModal} = responsiveLayoutValues;

    const {superWideRHPRouteKeys, wideRHPRouteKeys} = useWideRHPState();

    const isWideRHPDisplayedOnWideLayout = !isSmallScreenWidth && wideRHPRouteKeys.includes(route?.key);

    const isSuperWideRHPDisplayedOnWideLayout = !isSmallScreenWidth && superWideRHPRouteKeys.includes(route?.key);

    const shouldUseNarrowLayout = (isSmallScreenWidth || isInNarrowPaneModal) && !isSuperWideRHPDisplayedOnWideLayout && !isWideRHPDisplayedOnWideLayout;

    return {
        ...responsiveLayoutValues,
        shouldUseNarrowLayout,
        isWideRHPDisplayedOnWideLayout,
        isSuperWideRHPDisplayedOnWideLayout,
    };
}

export {useIsDisplayedInWideRHP};
