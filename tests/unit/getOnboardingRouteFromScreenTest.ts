import getOnboardingRouteFromScreen from '@libs/Navigation/helpers/getOnboardingRouteFromScreen';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';

import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

describe('getOnboardingRouteFromScreen', () => {
    it('returns the linking config path for an onboarding screen', () => {
        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.EMPLOYEES)).toBe(ROUTES.ONBOARDING_EMPLOYEES.route);
    });

    it('returns undefined for screens without a linking config path', () => {
        const screen = SCREENS.ONBOARDING.EMPLOYEES;
        const config = normalizedConfigs[screen];

        Reflect.deleteProperty(normalizedConfigs, screen);

        try {
            expect(getOnboardingRouteFromScreen(screen)).toBeUndefined();
        } finally {
            normalizedConfigs[screen] = config;
        }
    });

    it('matches ROUTES.getRoute when backTo is provided', () => {
        const backTo = ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();

        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.WORKSPACES, backTo)).toBe(ROUTES.ONBOARDING_WORKSPACES.getRoute(backTo));
    });
});
