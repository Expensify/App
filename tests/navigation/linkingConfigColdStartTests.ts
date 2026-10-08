import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute, getStateFromPath} from '@react-navigation/native';

describe('linking configuration on a cold start', () => {
    it.each([
        [ROUTES.REPORT_SETTINGS_FIELDS.getRoute('123'), SCREENS.REPORT_SETTINGS.FIELDS],
        [ROUTES.REPORT_SETTINGS_COLUMNS.getRoute('123'), SCREENS.REPORT_SETTINGS.COLUMNS],
    ])('restores the correct report configuration screen for %s', (path, screen) => {
        // Given separate links to expense fields and report table columns.
        const parsePath = linkingConfig.getStateFromPath ?? getStateFromPath;

        // When a saved link is opened or the browser is refreshed.
        const state = parsePath(path, linkingConfig.config);

        // Then the shared picker can determine its mode without a query parameter.
        expect(state).toBeDefined();
        if (!state) {
            throw new Error('The report configuration route must resolve');
        }
        expect(findFocusedRoute(state)).toMatchObject({name: screen, params: {reportID: '123'}});
    });

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
});
