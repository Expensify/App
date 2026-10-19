import Navigation from '@libs/Navigation/Navigation';

function dismissOnboardingModalBeforeExit(afterTransition: () => void) {
    Navigation.dismissModal({afterTransition});
}

export default dismissOnboardingModalBeforeExit;
