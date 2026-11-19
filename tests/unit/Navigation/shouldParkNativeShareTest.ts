import shouldParkNativeShare, {markOnboardingSettledForNativeShare} from '@libs/Navigation/helpers/shouldParkNativeShare';
import {runSessionCleanupCallbacks} from '@libs/SessionCleanup';
import {didUserLogInDuringSession} from '@libs/SessionUtils';

jest.mock('@libs/SessionUtils', () => ({
    didUserLogInDuringSession: jest.fn(() => true),
}));

const mockedDidUserLogInDuringSession = jest.mocked(didUserLogInDuringSession);

describe('shouldParkNativeShare', () => {
    beforeEach(() => {
        runSessionCleanupCallbacks();
        mockedDidUserLogInDuringSession.mockReturnValue(true);
    });

    it('parks a share that arrives while signed out', () => {
        // Given nobody is signed in when the share link arrives
        // When it is checked
        // Then it has to wait, because nothing can be shown and onboarding may still come first
        expect(shouldParkNativeShare(false)).toBe(true);
    });

    it('parks a share that arrives right after a sign-in during this session', () => {
        // Given the user signed in during this session and onboarding has not been settled yet, which is when HybridApp
        // hands the share link over (after sign-in, while OpenApp is still loading the account)
        // When it is checked
        // Then it has to wait: opened now, onboarding would tear the share flow down a moment later
        expect(shouldParkNativeShare(true)).toBe(true);
    });

    it('opens a share straight away once onboarding is settled', () => {
        // Given the user signed in during this session and onboarding has been ruled out or has finished
        markOnboardingSettledForNativeShare();

        // When a later share arrives
        // Then it opens straight away, as for any signed-in user
        expect(shouldParkNativeShare(true)).toBe(false);
    });

    it('opens a share straight away for a session that was already signed in at startup', () => {
        // Given a returning user whose session and onboarding status were already on disk when the app started
        mockedDidUserLogInDuringSession.mockReturnValue(false);

        // When a share arrives
        // Then it is not held back, so the existing signed-in share flow is unchanged
        expect(shouldParkNativeShare(true)).toBe(false);
    });

    it('starts parking again after sign-out', () => {
        // Given onboarding was settled for the previous session
        markOnboardingSettledForNativeShare();

        // When the session is cleaned up and the next user signs in
        runSessionCleanupCallbacks();

        // Then that user's shares wait for their own onboarding decision
        expect(shouldParkNativeShare(true)).toBe(true);
    });
});
