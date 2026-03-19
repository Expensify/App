import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

/**
 * Hook that computes whether the 2FA requirement page should be shown.
 *
 * This is a pure computation (no navigation side effects), safe to call from multiple components.
 */
function useShouldShowRequire2FAPage(): boolean {
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});

    return (!!account?.needsTwoFactorAuthSetup && !account?.requiresTwoFactorAuth) || (!!account?.twoFactorAuthSetupInProgress && !hasCompletedGuidedSetupFlow);
}

export default useShouldShowRequire2FAPage;
