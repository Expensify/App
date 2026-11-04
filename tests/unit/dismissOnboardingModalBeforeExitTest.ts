import dismissOnboardingModalBeforeExit from '@libs/Navigation/helpers/OnboardingNavigationUtils/index';
import Navigation from '@libs/Navigation/Navigation';

describe('dismissOnboardingModalBeforeExit', () => {
    it('dismisses the web onboarding modal before running follow-up navigation', () => {
        // Given follow-up navigation that must wait for the onboarding modal to close.
        const afterTransition = jest.fn();
        const dismissModal = jest.spyOn(Navigation, 'dismissModal').mockImplementation(() => {});

        // When onboarding exits.
        dismissOnboardingModalBeforeExit(afterTransition);

        // Then the follow-up is attached to the modal transition instead of running alongside it.
        expect(dismissModal).toHaveBeenCalledWith({afterTransition});
    });
});
