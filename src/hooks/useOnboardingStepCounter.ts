import {getOnboardingStepCounter} from '@libs/getOnboardingStepCounter';
import type {OnboardingScreen, OnboardingStepResult} from '@libs/getOnboardingStepCounter';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useOnboardingStepCounter(page: OnboardingScreen): OnboardingStepResult | undefined {
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [purposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const canUseSubmit2026 = betas?.includes(CONST.BETAS.SUBMIT_2026) ?? false;

    return getOnboardingStepCounter(page, {
        signupQualifier: onboarding?.signupQualifier,
        isFromPublicDomain: account?.isFromPublicDomain,
        hasAccessibleDomainPolicies: account?.hasAccessibleDomainPolicies,
        purposeSelected: purposeSelected ?? undefined,
        isMergeAccountStepSkipped: onboarding?.isMergeAccountStepSkipped,
        canUseSubmit2026,
    });
}

export default useOnboardingStepCounter;
