import createDynamicRoute from '@libs/Navigation/helpers/dynamicRoutesUtils/createDynamicRoute';
import getAdaptedStateFromPath from '@libs/Navigation/helpers/getAdaptedStateFromPath';

import NAVIGATORS from '@src/NAVIGATORS';
import ROUTES, {DYNAMIC_ROUTES} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

import type {NavigationState, PartialState} from '@react-navigation/native';

import {findFocusedRoute} from '@react-navigation/native';

function getFullScreenRouteUnderRHP(state: PartialState<NavigationState>) {
    const rootRoutes = state.routes;
    const fullScreenRoute = rootRoutes.at(-2);
    const tabState = fullScreenRoute?.state;
    return tabState?.routes.at(tabState.index ?? tabState.routes.length - 1);
}

describe('beta overrides dynamic route', () => {
    it('keeps the report the Test Tools modal was opened from underneath after a reload', () => {
        // Given the URL created when the Beta overrides page is opened from the Test Tools modal on a report
        const path = createDynamicRoute(DYNAMIC_ROUTES.BETA_OVERRIDES.path, ROUTES.REPORT_WITH_ID.getRoute('1'));

        // When the state is rebuilt from that URL, as on a page reload
        const state = getAdaptedStateFromPath(path, undefined);

        // Then the Beta overrides page is focused and the report stays underneath instead of Settings > Troubleshoot
        expect(findFocusedRoute(state)?.name).toBe(SCREENS.SETTINGS.DYNAMIC_BETA_OVERRIDES);
        expect(state.routes.at(-1)?.name).toBe(NAVIGATORS.RIGHT_MODAL_NAVIGATOR);
        expect(getFullScreenRouteUnderRHP(state)?.name).toBe(NAVIGATORS.REPORTS_SPLIT_NAVIGATOR);
    });

    it('keeps Troubleshoot underneath when opened inline from the Troubleshoot page', () => {
        // Given the URL created when the Beta overrides page is opened from the Troubleshoot page
        const path = createDynamicRoute(DYNAMIC_ROUTES.BETA_OVERRIDES.path, ROUTES.SETTINGS_TROUBLESHOOT);

        // When the state is rebuilt from that URL
        const state = getAdaptedStateFromPath(path, undefined);

        // Then the Beta overrides page is focused over the Settings tab
        expect(findFocusedRoute(state)?.name).toBe(SCREENS.SETTINGS.DYNAMIC_BETA_OVERRIDES);
        expect(getFullScreenRouteUnderRHP(state)?.name).toBe(NAVIGATORS.SETTINGS_SPLIT_NAVIGATOR);
    });
});
