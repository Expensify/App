/**
 * Actions for the trial payment reminder ("Stay ahead of the deadline") modal.
 */
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Records that this account went through onboarding in the current app runtime, so the trial payment reminder
 * stays hidden for the rest of the user's first session.
 */
function markTrialReminderFirstSession(accountID: number) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_TRIAL_REMINDER_FIRST_SESSION_ACCOUNT_IDS, {
        [accountID]: true,
    });
}

export default markTrialReminderFirstSession;
