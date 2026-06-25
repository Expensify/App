import ONYXKEYS from '@src/ONYXKEYS';
import type {OnboardingPurpose} from '@src/types/onyx';
import useOnyx from './useOnyx';

/**
 * Returns the resolved onboarding intent.
 *
 * Priority: NVP_INTRO_SELECTED.choice (server-persisted NVP) →
 *           ONBOARDING_PURPOSE_SELECTED (local-only key set during onboarding before the NVP is written).
 */
export default function useOnboardingIntent(): OnboardingPurpose | undefined {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [onboardingPurpose] = useOnyx(ONYXKEYS.ONBOARDING_PURPOSE_SELECTED);
    return introSelected?.choice ?? onboardingPurpose;
}
