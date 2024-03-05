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
        // We add the number of manual connections we add below
        const resolveWhenDone = after(Object.entries(migrations).length + 2, () => resolve());

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
        const connectionIDAccount = Onyx.connect({
            key: ONYXKEYS.ACCOUNT,
            callback: (value) => {
                Onyx.disconnect(connectionIDAccount);
                // @ts-expect-error we are removing this property, so it is not in the type anymore
                if (value?.activePolicyID) {
                    // @ts-expect-error we are removing this property, so it is not in the type anymore
                    const activePolicyID = value.activePolicyID;
                    const newValue = {...value};
                    // @ts-expect-error we are removing this property, so it is not in the type anymore
                    delete newValue.activePolicyID;
                    Onyx.multiSet({
                        [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: activePolicyID,
                        [ONYXKEYS.ACCOUNT]: newValue,
                    });
                }
                resolveWhenDone();
            },
        });
        const connectionIDRecentlyUsedTags = Onyx.connect({
            // @ts-expect-error The key was renamed, so it does not exist in the type definition
            key: 'policyRecentlyUsedTags_',
            waitForCollectionCallback: true,
            callback: (value) => {
                Onyx.disconnect(connectionIDRecentlyUsedTags);
                if (!value) {
                    resolveWhenDone();
                    return;
                }
                const newValue = {};
                for (const key of Object.keys(value)) {
                    // @ts-expect-error We have no fixed types here
                    newValue[`nvp_${key}`] = value[key];
                    // @ts-expect-error We have no fixed types here
                    newValue[key] = null;
                }
                Onyx.multiSet(newValue);
                resolveWhenDone();
            },
        });
    });
}
