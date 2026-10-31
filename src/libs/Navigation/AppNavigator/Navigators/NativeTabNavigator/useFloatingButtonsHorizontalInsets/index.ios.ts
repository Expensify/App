import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import type FloatingButtonsHorizontalInsets from './types';

/** The tab host spans the whole window, so the floating buttons keep out of the horizontal safe area themselves. */
function useFloatingButtonsHorizontalInsets(): FloatingButtonsHorizontalInsets {
    const {left, right} = useSafeAreaInsets();
    return {left, right};
}

export default useFloatingButtonsHorizontalInsets;
