import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';

import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';

/**
 * Returns the report route to pre-mount behind skip-confirmation RHP steps on narrow layout,
 * or undefined when pre-insert is not eligible.
 *
 * Unlike getSubmitExpensePreMountDestinationRoute, this deliberately does not gate on getIsNarrowLayout():
 * usePreMountDestination owns the narrow-only gate (it skips the actual pre-insert on wide layout), and
 * skip-confirmation callers never invoke reveal(), so returning a route on wide layout is a harmless no-op.
 *
 * Callers pass the result straight to usePreMountDestination without manual memoization (the React Compiler compiles those
 * screens). The impure isSearchTopmostFullScreenRoute() read is safe to run per render: the topmost fullscreen route can't
 * change beneath an open RHP, so it's invariant for the screen's lifetime, and the string result is value-compared by the
 * hook's [route] effect - so recomputing it is a no-op.
 *
 * A LOOKING_AROUND self-DM skip-confirmation create routes to Search, so don't pre-insert the self-DM behind the RHP -
 * it would flash Personal Space before the replace to Search. Mirrors the guard in getSubmitExpensePreMountDestinationRoute.
 */
function getSkipConfirmationPreMountDestinationRoute(
    shouldSkipConfirmation: boolean,
    reportID: string | undefined,
    isLookingAroundUser = false,
    isSelfDMDestination = false,
): Route | undefined {
    if (!shouldSkipConfirmation || isSearchTopmostFullScreenRoute() || !reportID || (isLookingAroundUser && isSelfDMDestination)) {
        return undefined;
    }

    return ROUTES.REPORT_WITH_ID.getRoute(reportID);
}

export default getSkipConfirmationPreMountDestinationRoute;
