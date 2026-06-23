import {getOnboardingStepCounter} from '@libs/getOnboardingStepCounter';
import type {OnboardingFlowContext, OnboardingScreen, OnboardingStepResult} from '@libs/getOnboardingStepCounter';
import ONYXKEYS from '@src/ONYXKEYS';
import useOnyx from './useOnyx';

function useOnboardingStepCounter(page: OnboardingScreen, overrides: Partial<Pick<OnboardingFlowContext, 'isAccountingEnabled'>> = {}): OnboardingStepResult | undefined {
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [purposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isAccountingEnabled] = useOnyx(ONYXKEYS.ONBOARDING_ACCOUNTING_ENABLED);

    return getOnboardingStepCounter(page, {
        signupQualifier: onboarding?.signupQualifier,
        isFromPublicDomain: account?.isFromPublicDomain,
        hasAccessibleDomainPolicies: account?.hasAccessibleDomainPolicies,
        purposeSelected: purposeSelected ?? undefined,
        isMergeAccountStepSkipped: onboarding?.isMergeAccountStepSkipped,
        isAccountingEnabled: overrides.isAccountingEnabled ?? isAccountingEnabled ?? undefined,
        isAccountValidated: !!account?.validated,
    });
}

export default useOnboardingStepCounter;
