import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose} from '@src/types/onyx';

import {hasCompletedGuidedSetupFlowSelector} from '@selectors/Onboarding';

import useOnyx from './useOnyx';

/**
 * Returns the resolved onboarding intent.
 *
 * Before onboarding completes, prefer the local intent just selected by the user over stale server state. After
 * completion, use the persisted intent so Concierge task links survive reloads.
 */
export default function useOnboardingIntent(): OnboardingPurpose | undefined {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboardingPurpose] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    const [onboardingValues] = useOnyx(ONYXKEYS.NVP_ONBOARDING);
    const hasCompletedGuidedSetupFlow = hasCompletedGuidedSetupFlowSelector(onboardingValues);

    return hasCompletedGuidedSetupFlow ? (introSelected?.choice ?? onboardingPurpose) : (onboardingPurpose ?? introSelected?.choice);
}
