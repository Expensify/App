import Navigation from '@libs/Navigation/Navigation';

function dismissOnboardingModalBeforeExit() {
    Navigation.dismissModal();
}

function resetOnboardingStackToRoot() {}

export {dismissOnboardingModalBeforeExit, resetOnboardingStackToRoot};
