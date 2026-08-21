import {getOnboardingStepCounter} from '@libs/getOnboardingStepCounter';
import type {OnboardingFlowContext, OnboardingScreen, OnboardingStepResult} from '@libs/getOnboardingStepCounter';
import {expensifyLoginsSelector, isCurrentUserValidated} from '@libs/UserUtils';

import ONYXKEYS from '@src/ONYXKEYS';

import useOnyx from './useOnyx';

function useOnboardingStepCounter(page: OnboardingScreen, overrides: Partial<Pick<OnboardingFlowContext, 'isAccountingEnabled'>> = {}): OnboardingStepResult | undefined {
    const [onboarding] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const [purposeSelected] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [account] = useOnyx(ONYXKEYS.ACCOUNT);
    const [isAccountingEnabled] = useOnyx(ONYXKEYS.ONBOARDING_ACCOUNTING_ENABLED);
    const [joinablePolicies] = useOnyx(ONYXKEYS.JOINABLE_POLICIES);
    const [loginList] = useOnyx(ONYXKEYS.LOGINS, {selector: expensifyLoginsSelector});
    const [session] = useOnyx(ONYXKEYS.SESSION);

    return getOnboardingStepCounter(page, {
        signupQualifier: onboarding?.signupQualifier,
        isFromPublicDomain: account?.isFromPublicDomain,
        hasAccessibleDomainPolicies: account?.hasAccessibleDomainPolicies,
        purposeSelected: purposeSelected ?? undefined,
        isMergeAccountStepSkipped: onboarding?.isMergeAccountStepSkipped,
        isAccountingEnabled: overrides.isAccountingEnabled ?? isAccountingEnabled ?? undefined,
        isAccountValidated: isCurrentUserValidated(loginList, session?.email),
        hasJoinablePolicies: Object.keys(joinablePolicies ?? {}).length > 0,
    });
}

export default useOnboardingStepCounter;
