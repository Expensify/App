/** Whether the current account is still in its first session, so the trial reminder can stay hidden. */
import markTrialReminderFirstSession from '@libs/actions/TrialPaymentReminder';

import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import {hasCompletedGuidedSetupFlowSelector} from '@src/selectors/Onboarding';

import {useEffect} from 'react';

import useOnyx from './useOnyx';
import useRootNavigationState from './useRootNavigationState';

function useIsTrialReminderFirstSession(currentUserAccountID: number | undefined): boolean {
    const [isLoadingApp = true] = useOnyx(ONYXKEYS.IS_LOADING_APP);
    const [hasCompletedGuidedSetupFlow] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasCompletedGuidedSetupFlowSelector});
    const [firstSessionAccountIDs] = useOnyx(ONYXKEYS.RAM_ONLY_TRIAL_REMINDER_FIRST_SESSION_ACCOUNT_IDS);
    const isOnboardingFlowOnTop = useRootNavigationState((state) => state?.routes?.at(-1)?.name === NAVIGATORS.ONBOARDING_MODAL_NAVIGATOR);

    // Invited or migrated users can have onboarding incomplete without ever seeing it, so we also check the flow is open
    const isInOnboardingNow = currentUserAccountID !== undefined && !isLoadingApp && hasCompletedGuidedSetupFlow === false && isOnboardingFlowOnTop;

    // The key is RAM-only, so a reload or relaunch starts the second session
    useEffect(() => {
        if (!isInOnboardingNow || firstSessionAccountIDs?.[currentUserAccountID]) {
            return;
        }
        markTrialReminderFirstSession(currentUserAccountID);
    }, [isInOnboardingNow, currentUserAccountID, firstSessionAccountIDs]);

    // Checking isInOnboardingNow too so the reminder can't flash before the effect saves the account
    return isInOnboardingNow || (currentUserAccountID !== undefined && !!firstSessionAccountIDs?.[currentUserAccountID]);
}

export default useIsTrialReminderFirstSession;
