import type {NavigationState, PartialState} from '@react-navigation/native';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/**
 * Pure decision logic for the NavigationRoot post-logout reset (kept out of the effect so it
 * stays unit-testable). Returns the state to pass to `navigationRef.reset`, or
 * `undefined` when there is nothing to reset.
 */
function getStateToResetAfterLogout(rootState: NavigationState | undefined): NavigationState | PartialState<NavigationState> | undefined {
    const lastRoute = rootState?.routes.at(-1);
    if (!rootState || !lastRoute) {
        return undefined;
    }

    // ValidateLogin's /v/ code is spent by logout; keeping it strands the user. Reset to
    // TAB_NAVIGATOR — this runs only post-logout (NavigationRoot gates on !authenticated), when
    // PublicScreens is mounted and TAB_NAVIGATOR (SignInPage) is its top-level route.
    if (lastRoute.name === SCREENS.VALIDATE_LOGIN) {
        return {index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]};
    }

    // ReportsSplit is shared between logged-in & logged-out; its params can carry stale auth.
    const shouldClearParams = lastRoute.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;

    // TAB_NAVIGATOR hosts the public SignInPage at the root. Drop nested tab focus carried over from the
    // authenticated session so the post-logout URL lands on "/" instead of a tab path like "/home".
    const shouldClearNestedState = lastRoute.name === NAVIGATORS.TAB_NAVIGATOR;
    return {
        ...rootState,
        index: 0,
        routes: [{...lastRoute, params: shouldClearParams ? undefined : lastRoute.params, state: shouldClearNestedState ? undefined : lastRoute.state}],
    };
}

export default getStateToResetAfterLogout;
