import useIsSoftKeyboardOpen from '@hooks/useIsSoftKeyboardOpen';

/**
 * Whether the floating navigation tab bar should hide because the soft keyboard is open.
 *
 * The floating bar and its buttons hover over the content rather than sitting in the layout, so when the soft keyboard
 * opens they get pushed up with the shrinking viewport and end up riding on top of it. Hiding them for as long as the
 * keyboard is up keeps them out of the way behind it. The full width bar needs no such treatment: it takes real space
 * in the layout, which the keyboard simply covers — so the keyboard is only tracked while the bar is floating.
 */
function useIsFloatingTabBarHiddenForKeyboard(isFloating: boolean): boolean {
    return useIsSoftKeyboardOpen(isFloating);
}

export default useIsFloatingTabBarHiddenForKeyboard;
