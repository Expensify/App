/** Whether the RHP's focused card is single-width, so the user can drag it to resize, and whether it floats alone or stacks on a wide or super-wide card. */
import {useWideRHPState} from '@components/WideRHPContextProvider';

import useResponsiveLayout from './useResponsiveLayout';

type ResizableSingleRHP = {
    /** Only on a wide layout, and never while a wide or super-wide card is the focused one. */
    isResizable: boolean;

    /** Resizable with no wide or super-wide card underneath, so the RHP frame itself is the card. */
    isFloating: boolean;
};

function useResizableSingleRHP(): ResizableSingleRHP {
    const {wideRHPRouteKeys, superWideRHPRouteKeys, isWideRHPFocused, isSuperWideRHPFocused} = useWideRHPState();

    // The window's width, because inside the RHP shouldUseNarrowLayout is always true.
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();

    const isResizable = !isSmallScreenWidth && !isWideRHPFocused && !isSuperWideRHPFocused;

    return {isResizable, isFloating: isResizable && wideRHPRouteKeys.length === 0 && superWideRHPRouteKeys.length === 0};
}

export default useResizableSingleRHP;
