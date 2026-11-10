/**
 * How far a view right inside a screen's horizontal safe area, or right inside the screen's own scroll view, has to
 * reach out on each side to get to the screen edge. Zero where it shouldn't: outside such a screen, in a box within it,
 * or on a wide layout, where the panes sit side by side and a view in one pane would reach into the next.
 */
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useSafeAreaInsets from '@hooks/useSafeAreaInsets';

import type {ViewStyle} from 'react-native';

import {useContext} from 'react';

import HorizontalSafeAreaContext, {HORIZONTAL_SAFE_AREA_PLACEMENT} from './HorizontalSafeAreaContext';

type HorizontalSafeAreaReach = {
    left: number;
    right: number;
};

const NO_REACH: HorizontalSafeAreaReach = {left: 0, right: 0};

function useHorizontalSafeAreaReach(): HorizontalSafeAreaReach {
    const placement = useContext(HorizontalSafeAreaContext);
    const isInScreen = placement === HORIZONTAL_SAFE_AREA_PLACEMENT.SCREEN || placement === HORIZONTAL_SAFE_AREA_PLACEMENT.SCREEN_SCROLL_CONTENT;
    const {left, right} = useSafeAreaInsets();
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    if (!isInScreen || !shouldUseNarrowLayout) {
        return NO_REACH;
    }
    return {left, right};
}

/**
 * Lets a box that clips its content (overflow hidden) reach the screen edge, with its content still laid out inside the
 * safe area, so a horizontal scroll view inside it isn't cut off at the safe area (see useHorizontalSafeAreaBleed).
 */
function useHorizontalSafeAreaClipBleed(): ViewStyle | undefined {
    const {left, right} = useHorizontalSafeAreaReach();
    if (!left && !right) {
        return undefined;
    }
    return {marginLeft: -left, marginRight: -right, paddingLeft: left, paddingRight: right};
}

export default useHorizontalSafeAreaReach;
export {useHorizontalSafeAreaClipBleed};
