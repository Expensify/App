/**
 * Tells the trial payment reminder whether the current account is still in its first session, meaning it went
 * through onboarding in this app runtime. The modal stays hidden for that whole session.
 */
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

    // A new user is recorded only while the onboarding flow is actually on screen. Invited, migrated or HybridApp users can keep
    // hasCompletedGuidedSetupFlow false without ever seeing onboarding, and checking the flag alone would hide the reminder from
    // them in every later session too. The selector answers true while the NVP is not loaded, so false can be trusted here.
    const isInOnboardingNow = currentUserAccountID !== undefined && !isLoadingApp && hasCompletedGuidedSetupFlow === false && isOnboardingFlowOnTop;

    // The record lives in a RAM-only key, so it survives a remount of the lazily loaded manager but is cleared by a reload,
    // a new tab or a cold start. That is where the user's second session begins.
    useEffect(() => {
        if (!isInOnboardingNow || firstSessionAccountIDs?.[currentUserAccountID]) {
            return;
        }
        markTrialReminderFirstSession(currentUserAccountID);
    }, [isInOnboardingNow, currentUserAccountID, firstSessionAccountIDs]);

    // isInOnboardingNow also counts on its own, so the reminder can't show in the render before the effect above writes the record.
    return isInOnboardingNow || (currentUserAccountID !== undefined && !!firstSessionAccountIDs?.[currentUserAccountID]);
}

export default useIsTrialReminderFirstSession;
