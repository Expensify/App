import NAVIGATORS from '@src/NAVIGATORS';

import {useIsFocused} from '@react-navigation/native';

import useRootNavigationState from './useRootNavigationState';

/**
 * An RHP sits beside a wide pane rather than over it, so only another tab covers one outright.
 * Callers pass the narrow flag that applies to them: `shouldUseNarrowLayoutIgnoringWideRHP` where the screen cannot itself become a wide RHP.
 */
function useIsReportVisible(shouldUseNarrowLayout: boolean): boolean {
    const isFocused = useIsFocused();
    const isRHPTopmost = useRootNavigationState((state) => state?.routes?.at(-1)?.name === NAVIGATORS.RIGHT_MODAL_NAVIGATOR);

    return shouldUseNarrowLayout ? isFocused : isFocused || isRHPTopmost;
}

export default useIsReportVisible;
