import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import {linkingConfig} from '@libs/Navigation/linkingConfig';

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
});
