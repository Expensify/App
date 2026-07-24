import getStateToResetAfterLogout from '@libs/Navigation/helpers/getStateToResetAfterLogout';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

type RouteState = NavigationState['routes'][number]['state'];

/** Build a minimal root NavigationState from a list of `{name, params?, state?}` routes. */
const buildRootState = (routes: Array<{name: string; params?: Record<string, unknown>; state?: RouteState}>): NavigationState => ({
    key: 'stack-root',
    index: routes.length - 1,
    routeNames: routes.map((route) => route.name),
    routes: routes.map((route, i) => ({key: `${route.name}-${i}`, name: route.name, params: route.params, state: route.state})),
    type: 'stack',
    stale: false,
});

describe('getStateToResetAfterLogout', () => {
    it('returns undefined when there is no state', () => {
        expect(getStateToResetAfterLogout(undefined)).toBeUndefined();
    });

    it('returns undefined when the state has no routes', () => {
        expect(getStateToResetAfterLogout(buildRootState([]))).toBeUndefined();
    });

    it('resets to TAB_NAVIGATOR when a consumed magic-link is the last route, even if a host is mounted (post-logout reset always lands on the public TAB_NAVIGATOR/SignInPage route)', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.TAB_NAVIGATOR, params: {deep: 'link'}}, {name: SCREENS.VALIDATE_LOGIN}]));

        expect(result).toEqual({index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]});
    });

    it('resets to TAB_NAVIGATOR for a consumed magic-link with a ReportsSplit host too', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: SCREENS.VALIDATE_LOGIN}]));

        expect(result).toEqual({index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]});
    });

    it('resets to TAB_NAVIGATOR when a consumed magic-link is the only route (fresh session, no host mounted)', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: SCREENS.VALIDATE_LOGIN, params: {accountID: '1'}}]));

        expect(result).toEqual({index: 0, routes: [{name: NAVIGATORS.TAB_NAVIGATOR}]});
    });

    it('PRESERVES params and does NOT redirect to TAB_NAVIGATOR for a non-magic-link login/logout route (TransitionBetweenApps — a29d2e24c6a)', () => {
        const transitionParams = {shortLivedAuthToken: 'tok', exitTo: 'settings'};
        const result = getStateToResetAfterLogout(buildRootState([{name: SCREENS.TRANSITION_BETWEEN_APPS, params: transitionParams}]));

        expect(result?.routes).toHaveLength(1);
        expect(result?.routes[0].name).toBe(SCREENS.TRANSITION_BETWEEN_APPS);
        expect(result?.routes[0].params).toEqual(transitionParams);
    });

    it('clears params when ReportsSplit is the last route on a normal logout (shared logged-in/out navigator)', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR, params: {stale: 'auth'}}]));

        expect(result?.routes[0].name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
        expect(result?.routes[0].params).toBeUndefined();
    });

    it('clears params when logging out from TAB_NAVIGATOR (shared public/auth route; SignInPage must not inherit stale params)', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.TAB_NAVIGATOR, params: {reportID: '123'}}]));

        expect(result?.routes[0].name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(result?.routes[0].params).toBeUndefined();
    });

    it('drops the nested tab state when logging out from a TAB_NAVIGATOR tab, so the SignInPage lands on the root "/" (not "/home")', () => {
        // Simulate logging out while the Home tab is focused inside TAB_NAVIGATOR.
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.TAB_NAVIGATOR, state: {index: 0, routes: [{key: 'home', name: SCREENS.HOME}]}}]));

        expect(result?.routes[0].name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(result?.routes[0].state).toBeUndefined();
    });

    it('drops both route.state and params.state on TAB_NAVIGATOR logout (the real repro shape)', () => {
        // Jumping across tabs populates the focused subtree in route.state and seeds it in params.state — both must go.
        const result = getStateToResetAfterLogout(
            buildRootState([
                {
                    name: NAVIGATORS.TAB_NAVIGATOR,
                    params: {state: {index: 0, routes: [{name: SCREENS.HOME}]}},
                    state: {index: 0, routes: [{key: 'home', name: SCREENS.HOME}]},
                },
            ]),
        );

        expect(result?.routes).toHaveLength(1);
        expect(result?.routes[0].name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(result?.routes[0].params).toBeUndefined();
        expect(result?.routes[0].state).toBeUndefined();
    });
});
