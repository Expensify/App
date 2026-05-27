import type {ValueOf} from 'type-fest';
import {normalizedConfigs} from '@libs/Navigation/linkingConfig/config';
import {getUrlWithParams} from '@libs/Url';
import type SCREENS from '@src/SCREENS';

type OnboardingScreen = ValueOf<typeof SCREENS.ONBOARDING>;

function getOnboardingRouteFromScreen(screen: OnboardingScreen, backTo?: string): string | undefined {
    const path = normalizedConfigs[screen]?.path;
    if (!path) {
        return undefined;
    }

    if (backTo) {
        return getUrlWithParams(path, {backTo});
    }

    return path;
}

export default getOnboardingRouteFromScreen;
export type {OnboardingScreen};
