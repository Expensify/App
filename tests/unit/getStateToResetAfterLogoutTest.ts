import type {NavigationState} from '@react-navigation/native';
import getStateToResetAfterLogout from '@libs/Navigation/helpers/getStateToResetAfterLogout';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

/** Build a minimal root NavigationState from a list of `{name, params?}` routes. */
const buildRootState = (routes: Array<{name: string; params?: Record<string, unknown>}>): NavigationState => ({
    key: 'stack-root',
    index: routes.length - 1,
    routeNames: routes.map((route) => route.name),
    routes: routes.map((route, i) => ({key: `${route.name}-${i}`, name: route.name, params: route.params})),
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

    it('resets to SCREENS.HOME when a consumed magic-link is the last route, even if a host is mounted (post-logout reset always lands on the public HOME/SignInPage route)', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.TAB_NAVIGATOR, params: {deep: 'link'}}, {name: SCREENS.VALIDATE_LOGIN}]));

        expect(result).toEqual({index: 0, routes: [{name: SCREENS.HOME}]});
    });

    it('resets to SCREENS.HOME for a consumed magic-link with a ReportsSplit host too', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.REPORTS_SPLIT_NAVIGATOR}, {name: SCREENS.VALIDATE_LOGIN}]));

        expect(result).toEqual({index: 0, routes: [{name: SCREENS.HOME}]});
    });

    it('resets to SCREENS.HOME when a consumed magic-link is the only route (fresh session, no host mounted)', () => {
        const result = getStateToResetAfterLogout(buildRootState([{name: SCREENS.VALIDATE_LOGIN, params: {accountID: '1'}}]));

        expect(result).toEqual({index: 0, routes: [{name: SCREENS.HOME}]});
    });

    it('PRESERVES params and does NOT redirect to HOME for a non-magic-link login/logout route (TransitionBetweenApps — a29d2e24c6a)', () => {
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

    it('preserves params for a normal non-shared route on logout', () => {
        const params = {reportID: '123'};
        const result = getStateToResetAfterLogout(buildRootState([{name: NAVIGATORS.TAB_NAVIGATOR, params}]));

        expect(result?.routes[0].name).toBe(NAVIGATORS.TAB_NAVIGATOR);
        expect(result?.routes[0].params).toEqual(params);
    });
});
