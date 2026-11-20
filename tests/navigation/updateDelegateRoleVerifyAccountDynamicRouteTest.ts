/** Verifies that account validation can return to the same copilot access page. */
import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getPathWithoutDynamicSuffix from '@libs/Navigation/helpers/dynamicRoutesUtils/getPathWithoutDynamicSuffix';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import CONST from '@src/CONST';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import {findFocusedRoute} from '@react-navigation/native';

describe('Copilot access account verification route', () => {
    it('opens account verification and preserves the copilot when returning', () => {
        // Given the access page for a specific copilot and its current role
        const basePath = ROUTES.SETTINGS_UPDATE_DELEGATE_ROLE.getRoute('agent@example.com', CONST.DELEGATE_ROLE.ALL);
        const suffix = DYNAMIC_ROUTES.VERIFY_ACCOUNT.path;

        // When verification is opened from the access page
        const verifyPath = createDynamicRoute(suffix, basePath);
        const focused = findFocusedRoute(getStateFromPath(verifyPath));

        // Then the account verification screen opens and returns to that same copilot's access page
        expect(focused?.name).toBe(SCREENS.SETTINGS.DYNAMIC_VERIFY_ACCOUNT);
        const backPath = getPathWithoutDynamicSuffix(verifyPath, suffix, suffix);
        expect(backPath).toBe(basePath);
        const backRoute = findFocusedRoute(getStateFromPath(backPath));
        expect(backRoute?.name).toBe(SCREENS.SETTINGS.DELEGATE.UPDATE_DELEGATE_ROLE);
        expect(backRoute?.params).toEqual(expect.objectContaining({login: 'agent@example.com', currentRole: CONST.DELEGATE_ROLE.ALL}));
    });
});
