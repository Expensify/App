import {findFocusedRoute} from '@react-navigation/native';
import useRootNavigationState from '@hooks/useRootNavigationState';
import SCREENS from '@src/SCREENS';

/**
 * Whether the dynamic year-selector route is the currently focused screen.
 *
 * The year selector is a @react-navigation route, so opening it pushes a screen and selecting a year does a
 * `goBack` (a real browser history change). Wide-screen popover hosts that keep their date picker mounted use
 * this to (1) hide their whole popover frame while the selector is open and (2) suppress their
 * `shouldCloseWhenBrowserNavigationChanged` listener so the `goBack` doesn't tear the host down.
 */
function useIsYearSelectorOpen(): boolean {
    return useRootNavigationState((state) => (state ? findFocusedRoute(state)?.name === SCREENS.SETTINGS.DYNAMIC_YEAR_SELECTOR : false));
}

export default useIsYearSelectorOpen;
