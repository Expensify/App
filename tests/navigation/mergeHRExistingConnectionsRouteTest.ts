import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';
import getPathFromState from '@libs/Navigation/helpers/getPathFromState';
import {RHP_TO_WORKSPACE} from '@libs/Navigation/linkingConfig/RELATIONS';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

describe('Merge HR existing connections route', () => {
    it.each(['workday', 'bamboohr'] as const)('round trips the %s picker with its workspace and provider params', (providerSlug) => {
        const path = ROUTES.WORKSPACE_HR_MERGE_EXISTING_CONNECTIONS.getRoute('123', providerSlug);
        const state = getAdaptedStateFromPath(path, undefined);

        expect(findFocusedRoute(state)).toEqual(
            expect.objectContaining({
                name: SCREENS.WORKSPACE.HR_MERGE_EXISTING_CONNECTIONS,
                params: expect.objectContaining({policyID: '123', providerSlug}),
            }),
        );
        expect(getPathFromState(state)).toBe(`/${path}`);
    });

    it('keeps the HR workspace page behind the picker', () => {
        expect(RHP_TO_WORKSPACE[SCREENS.WORKSPACE.HR_MERGE_EXISTING_CONNECTIONS]).toBe(SCREENS.WORKSPACE.HR);
    });
});
