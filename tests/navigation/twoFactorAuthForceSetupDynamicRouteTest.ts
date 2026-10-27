import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import stripDynamicRouteSuffixFromPath from '@libs/Navigation/helpers/dynamicRoutesUtils/stripDynamicRouteSuffixFromPath';
import getStateFromPath from '@libs/Navigation/helpers/getStateFromPath';

import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

type FocusedRoute = {name?: string; params?: unknown};

function getFocusedRoute(state: PartialState<NavigationState>): FocusedRoute {
    let current: PartialState<NavigationState> | undefined = state;
    let route: FocusedRoute = {};

    while (current?.routes) {
        const nextRoute = current.routes.at(current.index ?? current.routes.length - 1);
        route = {name: nextRoute?.name, params: nextRoute?.params};
        current = nextRoute?.state;
    }

    return route;
}

/** Builds each 2FA step URL the way the pages do: the next step is appended to the back path of the current one. */
function getTwoFactorAuthStepPaths(basePath: string) {
    const setupPath = createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path, basePath);
    const verifyPath = createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY.path, stripDynamicRouteSuffixFromPath(setupPath, DYNAMIC_ROUTES.TWO_FACTOR_AUTH_ROOT.path));
    const successPath = createDynamicRoute(DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path, stripDynamicRouteSuffixFromPath(verifyPath, DYNAMIC_ROUTES.TWO_FACTOR_AUTH_VERIFY.path));
    return {setupPath, verifyPath, successPath};
}

describe('2FA forceSetup dynamic route params', () => {
    it('carries forceSetup from the Security base into the params of every 2FA step', () => {
        // Given the require-2FA overlay opens setup on the Security base with forceSetup
        const {setupPath, verifyPath, successPath} = getTwoFactorAuthStepPaths(ROUTES.SETTINGS_SECURITY.getRoute(true));

        // When each step's URL is resolved to navigation state
        const setupRoute = getFocusedRoute(getStateFromPath(setupPath));
        const verifyRoute = getFocusedRoute(getStateFromPath(verifyPath));
        const successRoute = getFocusedRoute(getStateFromPath(successPath));

        // Then forceSetup reaches the success screen's params, which DynamicSuccessPage reads to send the user Home
        expect(setupRoute.name).toBe(SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT);
        expect(setupRoute.params).toMatchObject({forceSetup: 'true'});
        expect(verifyRoute.name).toBe(SCREENS.TWO_FACTOR_AUTH.DYNAMIC_VERIFY);
        expect(verifyRoute.params).toMatchObject({forceSetup: 'true'});
        expect(successRoute.name).toBe(SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS);
        expect(successRoute.params).toMatchObject({forceSetup: 'true'});
    });

    it('keeps the Security base as the back path of the forced success screen', () => {
        // Given the forced setup reached the success step
        const {successPath} = getTwoFactorAuthStepPaths(ROUTES.SETTINGS_SECURITY.getRoute(true));

        // When the success screen computes its back path
        const backPath = stripDynamicRouteSuffixFromPath(successPath, DYNAMIC_ROUTES.TWO_FACTOR_AUTH_SUCCESS.path);

        // Then it still resolves to Settings > Security, so DynamicSuccessPage treats it as the Security flow
        expect(getFocusedRoute(getStateFromPath(backPath)).name).toBe(SCREENS.SETTINGS.SECURITY);
    });

    it('does not add forceSetup to the success screen params for voluntary setup from Settings > Security', () => {
        // Given setup was opened from Settings > Security without forceSetup
        const {successPath} = getTwoFactorAuthStepPaths(ROUTES.SETTINGS_SECURITY.getRoute());

        // When the success step's URL is resolved to navigation state
        const successRoute = getFocusedRoute(getStateFromPath(successPath));

        // Then forceSetup is absent, so the user stays on the Enabled page after "Got it"
        expect(successRoute.name).toBe(SCREENS.TWO_FACTOR_AUTH.DYNAMIC_SUCCESS);
        expect(successRoute.params ?? {}).not.toHaveProperty('forceSetup');
    });
});
