import type {RHPWidth} from '@components/WideRHPContextProvider/types';

type GetIsScreenVisibleParams = {
    isFocused: boolean;
    isSmallScreenWidth: boolean;
    isSidebarOfFocusedSplitNavigator: boolean;

    /** `undefined` unless this is a wide or super-wide RHP screen on display. */
    displayedRHPWidth: Exclude<RHPWidth, 'narrow'> | undefined;
};

/**
 * Whether the user can see a screen: the focused one, and on a wide layout also a split navigator's sidebar and a wide RHP screen
 * displayed under a narrower panel. A central-pane screen counts only when focused, since a super-wide RHP can cover it in the
 * same update that makes one of its rows new.
 */
function getIsScreenVisible({isFocused, isSmallScreenWidth, isSidebarOfFocusedSplitNavigator, displayedRHPWidth}: GetIsScreenVisibleParams): boolean {
    return isFocused || (!isSmallScreenWidth && (isSidebarOfFocusedSplitNavigator || displayedRHPWidth !== undefined));
}

export default getIsScreenVisible;
