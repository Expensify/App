import type {ValueOf} from 'type-fest';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {getUrlWithParams} from '@libs/Url';
import type {Route} from '@src/ROUTES';
import type SCREENS from '@src/SCREENS';

type OnboardingScreen = ValueOf<typeof SCREENS.ONBOARDING>;

function getOnboardingRouteFromScreen(screen: OnboardingScreen, backTo?: string): Route | undefined {
    const path = normalizedConfigs[screen]?.path;
    if (!path) {
        return undefined;
    }

    if (backTo) {
        return getUrlWithParams(path, {backTo}) as Route;
    }

    return path as Route;
}

export default getOnboardingRouteFromScreen;
export type {OnboardingScreen};
