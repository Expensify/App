import after from 'lodash/after';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const migrations = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    nvp_lastPaymentMethod: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
    isFirstTimeNewExpensifyUser: ONYXKEYS.NVP_IS_FIRST_TIME_NEW_EXPENSIFY_USER,
    preferredLocale: ONYXKEYS.NVP_PREFERRED_LOCALE,
    preferredEmojiSkinTone: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    frequentlyUsedEmojis: ONYXKEYS.FREQUENTLY_USED_EMOJIS,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private_blockedFromConcierge: ONYXKEYS.NVP_BLOCKED_FROM_CONCIERGE,
    // eslint-disable-next-line @typescript-eslint/naming-convention
    private_pushNotificationID: ONYXKEYS.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
    tryFocusMode: ONYXKEYS.NVP_TRY_FOCUS_MODE,
    introSelected: ONYXKEYS.NVP_INTRO_SELECTED,
    hasDismissedIdlePanel: ONYXKEYS.NVP_HAS_DISMISSED_IDLE_PANEL,
};

// This migration changes the keys of all the NVP related keys so that they are standardized
export default function () {
    return new Promise<void>((resolve) => {
        // It's 1 more because activePolicyID is not in the migrations object above as it is nested inside an object
        const resolveWhenDone = after(Object.entries(migrations).length + 1, () => resolve());

        for (const [oldKey, newKey] of Object.entries(migrations)) {
            const connectionID = Onyx.connect({
                // @ts-expect-error oldKey is a variable
                key: oldKey,
                callback: (value) => {
                    Onyx.disconnect(connectionID);
                    if (value !== null) {
                        // @ts-expect-error These keys are variables, so we can't check the type
                        Onyx.multiSet({
                            [newKey]: value,
                            [oldKey]: null,
                        });
                    }
                    resolveWhenDone();
                },
            });
        }
        const connectionID = Onyx.connect({
            key: ONYXKEYS.ACCOUNT,
            callback: (value) => {
                Onyx.disconnect(connectionID);
                if (value?.activePolicyID) {
                    const activePolicyID = value.activePolicyID;
                    const newValue = value;
                    delete newValue.activePolicyID;
                    Onyx.multiSet({
                        [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: activePolicyID,
                        [ONYXKEYS.ACCOUNT]: newValue,
                    });
                }
                resolveWhenDone();
            },
        });
    });
}
