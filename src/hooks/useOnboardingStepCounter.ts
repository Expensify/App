import {getOnboardingStepCounter} from '@libs/getOnboardingStepCounter';
import type {OnboardingScreen, OnboardingStepResult} from '@libs/getOnboardingStepCounter';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useOnboardingStepCounter(page: OnboardingScreen): OnboardingStepResult | undefined {
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [purposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);

    return getOnboardingStepCounter(page, {
        signupQualifier: onboarding?.signupQualifier,
        isFromPublicDomain: account?.isFromPublicDomain,
        hasAccessibleDomainPolicies: account?.hasAccessibleDomainPolicies,
        purposeSelected: purposeSelected ?? undefined,
        isMergeAccountStepSkipped: onboarding?.isMergeAccountStepSkipped,
    });
}

export default useOnboardingStepCounter;
