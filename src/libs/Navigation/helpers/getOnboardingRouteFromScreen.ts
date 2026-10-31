import type {OnboardingScreen} from '@libs/getOnboardingStepCounter';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {getUrlWithParams} from '@libs/Url';

import ROUTES from '@src/ROUTES';
import type {Route} from '@src/ROUTES';
import SCREENS from '@src/SCREENS';

const onboardingRoutes = {
    [SCREENS.ONBOARDING.PERSONAL_DETAILS]: ROUTES.ONBOARDING_PERSONAL_DETAILS.route,
    [SCREENS.ONBOARDING.PRIVATE_DOMAIN]: ROUTES.ONBOARDING_PRIVATE_DOMAIN.route,
    [SCREENS.ONBOARDING.EMPLOYEES]: ROUTES.ONBOARDING_EMPLOYEES.route,
    [SCREENS.ONBOARDING.ACCOUNTING]: ROUTES.ONBOARDING_ACCOUNTING.route,
    [SCREENS.ONBOARDING.INTERESTED_FEATURES]: ROUTES.ONBOARDING_INTERESTED_FEATURES.route,
    [SCREENS.ONBOARDING.PURPOSE]: ROUTES.ONBOARDING_PURPOSE.route,
    [SCREENS.ONBOARDING.WORKSPACES]: ROUTES.ONBOARDING_WORKSPACES.route,
    [SCREENS.ONBOARDING.WORK_EMAIL]: ROUTES.ONBOARDING_WORK_EMAIL.route,
    [SCREENS.ONBOARDING.WORK_EMAIL_VALIDATION]: ROUTES.ONBOARDING_WORK_EMAIL_VALIDATION.route,
    [SCREENS.ONBOARDING.PERSONAL_TRACK_GOAL]: ROUTES.ONBOARDING_PERSONAL_TRACK_GOAL.route,
} satisfies Record<OnboardingScreen, Route>;

function getOnboardingRouteFromScreen(screen: OnboardingScreen, backTo?: string): Route | undefined {
    const path = normalizedConfigs[screen]?.path;
    if (!path) {
        return undefined;
    }

    if (backTo) {
        return getUrlWithParams(onboardingRoutes[screen], {backTo});
    }

    return onboardingRoutes[screen];
}

export default getOnboardingRouteFromScreen;
