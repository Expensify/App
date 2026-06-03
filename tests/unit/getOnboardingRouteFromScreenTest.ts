import getOnboardingRouteFromScreen from '@libs/Navigation/helpers/getOnboardingRouteFromScreen';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

describe('getOnboardingRouteFromScreen', () => {
    it('returns the linking config path for an onboarding screen', () => {
        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.EMPLOYEES)).toBe(ROUTES.ONBOARDING_EMPLOYEES.route);
    });

    it('returns undefined for screens without a linking config path', () => {
        expect(getOnboardingRouteFromScreen('not-a-screen' as typeof SCREENS.ONBOARDING.EMPLOYEES)).toBeUndefined();
    });

    it('matches ROUTES.getRoute when backTo is provided', () => {
        const backTo = ROUTES.ONBOARDING_PERSONAL_DETAILS.getRoute();

        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.WORKSPACES, backTo)).toBe(ROUTES.ONBOARDING_WORKSPACES.getRoute(backTo));
        expect(getOnboardingRouteFromScreen(SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION, backTo)).toBe(ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.getRoute(backTo));
    });
});
