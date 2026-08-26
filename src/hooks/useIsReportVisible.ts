import getTopmostFullScreenRoute from '@navigation/helpers/getTopmostFullScreenRoute';

import NAVIGATORS from '@src/NAVIGATORS';

import {useIsFocused} from '@react-navigation/native';
import {useState} from 'react';

import useRootNavigationState from './useRootNavigationState';

/**
 * An RHP sits beside a wide pane rather than over it, so only another tab covers one outright.
 * Tabs switch inside the root's tab navigator, so which one this screen belongs to shows only while it holds focus.
 * Callers pass the narrow flag that applies to them: `shouldUseNarrowLayoutIgnoringWideRHP` where the screen cannot itself become a wide RHP.
 */
function useIsReportVisible(shouldUseNarrowLayout: boolean): boolean {
    const isFocused = useIsFocused();
    const isRHPTopmost = useRootNavigationState((state) => state?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
    const topmostTabRouteKey = useRootNavigationState(() => getTopmostFullScreenRoute()?.key);
    const [ownTabRouteKey, setOwnTabRouteKey] = useState(topmostTabRouteKey);

    if (isFocused && ownTabRouteKey !== topmostTabRouteKey) {
        setOwnTabRouteKey(topmostTabRouteKey);
    }

    if (shouldUseNarrowLayout) {
        return isFocused;
    }
    return isFocused || (isRHPTopmost && ownTabRouteKey === topmostTabRouteKey);
}

export default useIsReportVisible;
