import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose} from '@src/types/onyx';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';

import useOnyx from './useOnyx';

/**
 * Returns the resolved onboarding intent.
 *
 * Before onboarding completes, prefer the local intent just selected by the user over stale server state. After
 * completion, use the persisted intent so Concierge task links survive reloads. A marked Join Workspace task route
 * takes precedence because a merge can switch to an account whose persisted intent differs from the task being resumed.
 */
type UseOnboardingIntentOptions = {
    /** Whether the current route was opened by a Join Workspace Concierge task link. */
    isJoinWorkspaceTask?: boolean;
};

export default function useOnboardingIntent({isJoinWorkspaceTask = false}: UseOnboardingIntentOptions = {}): OnboardingPurpose | undefined {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboardingPurpose] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(onboardingValues);

    if (isJoinWorkspaceTask) {
        return CONST.ONBOARDING_CHOICES.JOIN_WORKSPACE;
    }

    return hasCompletedGuidedSetupFlow ? (introSelected?.choice ?? onboardingPurpose) : (onboardingPurpose ?? introSelected?.choice);
}
