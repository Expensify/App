import type {LinkToOptions} from '@libs/Navigation/helpers/linkTo/types';
import Navigation from '@libs/Navigation/Navigation';

function dismissOnboardingModalBeforeExit() {
    Navigation.dismissModal();
}

function getOnboardingExitNavigationOptions(): LinkToOptions | undefined {
    return undefined;
}

function resetOnboardingStackToRoot() {}

export {dismissOnboardingModalBeforeExit, getOnboardingExitNavigationOptions, resetOnboardingStackToRoot};
