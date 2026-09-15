import variables from '@styles/variables';

import useResponsiveLayout from './useResponsiveLayout';
import useWindowDimensions from './useWindowDimensions';

/**
 * Returns whether the Account page header should stack a large centered avatar, name, login and Switch button
 * in a column, instead of laying them out in a single compact row.
 *
 * Gated on the available viewport height rather than on orientation: the stacked header is ~236dp tall, and
 * `isInLandscapeMode` is a poor proxy for "there is room for it" — it lags a rotation because it is derived from
 * `useSafeAreaFrame`, and it is always false on tablets. Comparing the height directly also fails safe, because an
 * unknown (0) height reads as "not enough room" and renders the compact row, which fits everywhere. The breakpoint
 * sits between the tallest phone in landscape (~480dp) and the shortest phone in portrait (~568dp), so phones stack
 * in portrait and never in landscape.
 */
function useShouldStackAccountHeader(): boolean {
    const {shouldUseNarrowLayout} = useResponsiveLayout();
    const {windowHeight} = useWindowDimensions();

    return shouldUseNarrowLayout && windowHeight >= variables.stackedAccountHeaderMinHeightBreakpoint;
}

export default useShouldStackAccountHeader;
