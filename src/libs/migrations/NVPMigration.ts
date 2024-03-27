import after from 'lodash/after';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

// These are the oldKeyName: newKeyName of the NVPs we can migrate without any processing
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
        // Resolve the migration when all the keys have been migrated. The number of keys is the size of the `migrations` object in addition to the ACCOUNT and OLD_POLICY_RECENTLY_USED_TAGS keys (which is why there is a +2).
        const resolveWhenDone = after(Object.entries(migrations).length + 2, () => resolve());

        for (const [oldKey, newKey] of Object.entries(migrations)) {
            const connectionID = Onyx.connect({
                // @ts-expect-error oldKey is a variable
                key: oldKey,
                callback: (value) => {
                    Onyx.disconnect(connectionID);
                    if (value === null) {
                        resolveWhenDone();
                        return;
                    }
                    // @ts-expect-error These keys are variables, so we can't check the type
                    Onyx.multiSet({
                        [newKey]: value,
                        [oldKey]: null,
                    }).then(resolveWhenDone);
                },
            });
        }
        const connectionIDAccount = Onyx.connect({
            key: ONYXKEYS.ACCOUNT,
            callback: (value) => {
                Onyx.disconnect(connectionIDAccount);
                // @ts-expect-error we are removing this property, so it is not in the type anymore
                if (!value?.activePolicyID) {
                    resolveWhenDone();
                    return;
                }
                // @ts-expect-error we are removing this property, so it is not in the type anymore
                const activePolicyID = value.activePolicyID;
                const newValue = {...value};
                // @ts-expect-error we are removing this property, so it is not in the type anymore
                delete newValue.activePolicyID;
                Onyx.multiSet({
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: activePolicyID,
                    [ONYXKEYS.ACCOUNT]: newValue,
                }).then(resolveWhenDone);
            },
        });
        const connectionIDRecentlyUsedTags = Onyx.connect({
            key: ONYXKEYS.COLLECTION.OLD_POLICY_RECENTLY_USED_TAGS,
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
                Onyx.multiSet(newValue).then(resolveWhenDone);
            },
        });
    });
}
