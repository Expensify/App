/** Actions for the trial payment reminder modal. */
import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/** Remembers that this account is in its first session, so the trial reminder stays hidden. */
function markTrialReminderFirstSession(accountID: number) {
    Onyx.merge(ONYXKEYS.RAM_ONLY_TRIAL_REMINDER_FIRST_SESSION_ACCOUNT_IDS, {
        [accountID]: true,
    });
}

export default markTrialReminderFirstSession;
