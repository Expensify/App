import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';

import {isLookingAroundSearchRoutingActive} from '@libs/IOUUtils';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

/** The onboarding choice flags that decide where a submitted expense lands. */
function useSubmissionOnboardingIntent() {
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const {isOffline} = useNetwork();

    return {
        introSelected,
        isTrackIntentUser: isTrackOnboardingChoice(introSelected?.choice),
        isLookingAroundUser: isLookingAroundSearchRoutingActive(introSelected?.choice === CONST.ONBOARDING_CHOICES.LOOKING_AROUND, isOffline),
    };
}

export default useSubmissionOnboardingIntent;
