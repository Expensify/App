import getOnboardingRouteFromScreen from '@libs/Navigation/helpers/getOnboardingRouteFromScreen';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

describe('getOnboardingRouteFromScreen', () => {
    it('returns the linking config path for an onboarding screen', () => {
        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.EMPLOYEES)).toBe(ROUTES.ONBOARDING_EMPLOYEES.route);
    });

    it('matches ROUTES.getRoute when backTo is provided', () => {
        const backTo = ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();

        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.WORKSPACES, backTo)).toBe(ROUTES.ONBOARDING_WORKSPACES.getRoute(backTo));
    });
});
