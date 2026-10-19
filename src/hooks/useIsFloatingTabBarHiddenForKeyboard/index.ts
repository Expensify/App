import useIsSoftKeyboardOpen from '@hooks/useIsSoftKeyboardOpen';

/**
 * Whether the floating navigation tab bar should hide because the soft keyboard is open.
 *
 * The floating bar and its buttons hover over the content rather than sitting in the layout, so when the soft keyboard
 * opens they get pushed up with the shrinking viewport and end up riding on top of it. Hiding them for as long as the
 * keyboard is up keeps them out of the way behind it. On mobile web in landscape, the space left above the keyboard is
 * too short to share with the bar, so the keyboard is only tracked there.
 */
function useIsFloatingTabBarHiddenForKeyboard(shouldTrackKeyboard: boolean): boolean {
    return useIsSoftKeyboardOpen(shouldTrackKeyboard);
}

export default useIsFloatingTabBarHiddenForKeyboard;
