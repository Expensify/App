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

    // ValidateLogin's /v/ code is spent by logout; keeping it strands the user (#89545).
    // Only this route is special-cased — others (e.g. TransitionBetweenApps) keep their
    // live auth params.
    const isConsumedMagicLink = lastRoute.name === SCREENS.VALIDATE_LOGIN;
    const signInHostRoute = isConsumedMagicLink ? rootState.routes.find((route) => route.name === NAVIGATORS.TAB_NAVIGATOR || route.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR) : undefined;

    // Fresh magic-link session: no host mounted and PublicScreens is active, so reset to
    // SCREENS.HOME (PublicScreens maps "/" → SignInPage); a TabNavigator/ReportsSplit reset
    // would fail since they aren't registered there.
    if (isConsumedMagicLink && !signInHostRoute) {
        return {index: 0, routes: [{name: SCREENS.HOME}]};
    }

    // ReportsSplit & the consumed magic-link host must drop stale params; others keep theirs.
    const targetRoute = signInHostRoute ?? lastRoute;
    const shouldClearParams = isConsumedMagicLink || targetRoute.name === NAVIGATORS.REPORTS_SPLIT_NAVIGATOR;
    return {
        ...rootState,
        index: 0,
        routes: [{...targetRoute, params: shouldClearParams ? undefined : targetRoute.params}],
    };
}

export default getStateToResetAfterLogout;
