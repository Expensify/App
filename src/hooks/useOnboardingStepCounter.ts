import {getOnboardingStepCounter} from '@libs/getOnboardingStepCounter';
import type {OnboardingScreen, OnboardingStepResult} from '@libs/getOnboardingStepCounter';
import {getVisibleJoinablePoliciesCount} from '@libs/OnboardingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';
import usePermissions from './usePermissions';

function useOnboardingStepCounter(page: OnboardingScreen): OnboardingStepResult | undefined {
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [purposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const {isBetaEnabled} = usePermissions();

    return getOnboardingStepCounter(page, {
        signupQualifier: onboarding?.signupQualifier,
        isFromPublicDomain: account?.isFromPublicDomain,
        hasAccessibleDomainPolicies: account?.hasAccessibleDomainPolicies,
        purposeSelected: purposeSelected ?? undefined,
        isMergeAccountStepSkipped: onboarding?.isMergeAccountStepSkipped,
        isAccountValidated: !!account?.validated,
        hasJoinablePolicies: getVisibleJoinablePoliciesCount(joinablePolicies, isBetaEnabled(CONST.BETAS.SUBMIT_2026)) > 0,
    });
}

export default useOnboardingStepCounter;
