import after from 'lodash/after';
import Onyx from 'react-native-onyx';
import type {KeyValueMapping, OnyxEntry} from 'react-native-onyx';
import type {Account} from 'src/types/onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxKey} from '@src/ONYXKEYS';

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
};

// This migration changes the keys of all the NVP related keys so that they are standardized
export default function () {
    return new Promise<void>((resolve) => {
        // Resolve the migration when all the keys have been migrated. The number of keys is the size of the `migrations` object in addition to the ACCOUNT and OLD_POLICY_RECENTLY_USED_TAGS keys (which is why there is a +2).
        const resolveWhenDone = after(Object.entries(migrations).length + 2, () => resolve());

        for (const [oldKey, newKey] of Object.entries(migrations)) {
            const connection = Onyx.connect({
                key: oldKey as OnyxKey,
                callback: (value) => {
                    Onyx.disconnect(connection);
                    if (value === undefined) {
                        resolveWhenDone();
                        return;
                    }
                    Onyx.multiSet({
                        [newKey]: value,
                        [oldKey]: null,
                    } as KeyValueMapping).then(resolveWhenDone);
                },
            });
        }
        const accountConnection = Onyx.connect({
            key: ONYXKEYS.ACCOUNT,
            callback: (value: OnyxEntry<Account & {activePolicyID?: string}>) => {
                Onyx.disconnect(accountConnection);
                if (!value?.activePolicyID) {
                    resolveWhenDone();
                    return;
                }
                const activePolicyID = value.activePolicyID;
                const newValue = {...value};
                delete newValue.activePolicyID;
                Onyx.multiSet({
                    [ONYXKEYS.NVP_ACTIVE_POLICY_ID]: activePolicyID,
                    [ONYXKEYS.ACCOUNT]: newValue,
                }).then(resolveWhenDone);
            },
        });
        const recentlyUsedTagsConnection = Onyx.connect({
            key: ONYXKEYS.COLLECTION.OLD_POLICY_RECENTLY_USED_TAGS,
            waitForCollectionCallback: true,
            callback: (value) => {
                Onyx.disconnect(recentlyUsedTagsConnection);
                if (!value) {
                    resolveWhenDone();
                    return;
                }
                const newValue = {} as Record<string, unknown>;
                for (const key of Object.keys(value)) {
                    newValue[`nvp_${key}`] = value[key];
                    newValue[key] = null;
                }
                Onyx.multiSet(newValue as KeyValueMapping).then(resolveWhenDone);
            },
        });
    });
}
