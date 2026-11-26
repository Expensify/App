import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import getAppStateFromPath from '@libs/Navigation/helpers/getStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';

import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';

describe('linking configuration on a cold start', () => {
    it.each(['/workspaces/123/overview/name', '/settings/workspaces/123/overview/name'])('restores the workspace overview underneath %s', (path) => {
        // React Navigation falls back to its own parser if the configured callback is undefined.
        const parsePath = linkingConfig.getStateFromPath ?? getStateFromPath;
        const state = parsePath(path, linkingConfig.config);

        expect(state).toEqual(getAdaptedStateFromPath(path));
        expect(state?.routes.map((route) => route.name)).toEqual([NAVIGATORS.TAB_NAVIGATOR, NAVIGATORS.RIGHT_MODAL_NAVIGATOR]);
        const backgroundState = state?.routes.at(0)?.state;
        if (!state || !backgroundState) {
            throw new Error('The workspace name panel must have a background navigator');
        }
        expect(findFocusedRoute(backgroundState)).toMatchObject({name: SCREENS.WORKSPACE.PROFILE, params: {policyID: '123'}});
        expect(findFocusedRoute(state)?.name).toBe(SCREENS.WORKSPACE.NAME);
    });

    it.each(['/insights', '/insights/'])('matches %s without a legacy redirect', (path) => {
        // Given a direct Insights link without a dashboard in its path
        // When React Navigation parses it without App's legacy URL rewrites
        const state = getStateFromPath(path, linkingConfig.config);

        // Then Insights is selected and the tab can supply its default dashboard
        expect(state && findFocusedRoute(state)?.name).toBe(SCREENS.INSIGHTS);
    });

    it.each(['/insights', '/insight%73'])('serializes %s to Spend even before the authenticated tab mounts', (path) => {
        // Given a signed-out browser opening the Insights root
        // When the link is parsed before the tab can supply its default
        const state = getAdaptedStateFromPath(path);

        // Then the destination saved for sign-in is complete
        expect(getPathFromState(state)).toBe('/insights/spend');
    });

    it('does not preserve the alias as the address bar path after sign-in', () => {
        // Given a root link saved for replay after sign-in
        // When the in-app parser turns the link into a destination
        const state = getAppStateFromPath('/insights?backTo=/home');

        // Then browser history can use the canonical path with the original query
        expect(findFocusedRoute(state)?.path).toBeUndefined();
        expect(getPathFromState(state)).toBe(`/insights/spend?backTo=${encodeURIComponent('/home')}`);
    });

    it.each(['dashboardID=compliance', 'dashboardID', 'dashboardID=spend&dashboardID=compliance'])('keeps the root link on Spend with %s in the query', (dashboardQuery) => {
        // Given a root link with a dashboard in the query instead of the path
        // When opening it with the normal cold-start parser
        const state = getAdaptedStateFromPath(`/insights/?${dashboardQuery}&backTo=/home`);

        // Then only an explicit dashboard path can override Spend, and the back link is preserved
        expect(findFocusedRoute(state)).toMatchObject({
            name: SCREENS.INSIGHTS,
            params: {dashboardID: CONST.INSIGHTS.DASHBOARD.SPEND, backTo: '/home'},
        });
    });

    it('keeps an explicit Compliance link on Compliance', () => {
        // Given a direct link with a dashboard in the path
        // When opening it with the normal cold-start parser
        const state = getAdaptedStateFromPath('/insights/compliance');

        // Then the dashboard in the path wins over the default
        expect(findFocusedRoute(state)).toMatchObject({name: SCREENS.INSIGHTS, params: {dashboardID: CONST.INSIGHTS.DASHBOARD.COMPLIANCE}});
    });
});
