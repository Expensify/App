import {useWideRHPState, WideRHPStateContext} from '@components/WideRHPContextProvider';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import {useRoute} from '@react-navigation/native';
import {use} from 'react';

import type ResponsiveLayoutOnWideRHPResult from './types';

/**
 * Whether the caller's screen is shown in a Wide/Super Wide RHP. Reads the Wide RHP state only inside the RHP, so screens
 * outside it don't re-render every time that state changes.
 */
function useIsDisplayedInWideRHP(isInNarrowPaneModal: boolean): boolean {
    const route = useRoute();

    if (!isInNarrowPaneModal) {
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
