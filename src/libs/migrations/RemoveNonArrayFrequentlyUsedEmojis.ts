import Log from '@libs/Log';
import readOnceOnyxValue from '@libs/readOnceOnyxValue';

import ONYXKEYS from '@src/ONYXKEYS';

import Onyx from 'react-native-onyx';

/**
 * Some devices store an object instead of a list for the frequently used emojis. Onyx refuses to write a list over
 * an object, so those devices log an alert each time the server sends the list, and the list never updates.
 * Removing the object lets the next list from the server be stored. This is temporary and can be removed once those
 * caches have had time to refresh.
 */
export default async function RemoveNonArrayFrequentlyUsedEmojis(): Promise<void> {
    const frequentlyUsedEmojis: unknown = await readOnceOnyxValue(ONYXKEYS.FREQUENTLY_USED_EMOJIS);

    // Onyx only blocks a list from replacing a value that is set and is not a list, so nothing else needs removing
    if (!frequentlyUsedEmojis || Array.isArray(frequentlyUsedEmojis)) {
        return;
    }

    // A migration runs before the app starts, so it writes to Onyx directly instead of through an action
    // eslint-disable-next-line rulesdir/prefer-actions-set-data
    await Onyx.set(ONYXKEYS.FREQUENTLY_USED_EMOJIS, null);
    Log.info('[Migrate Onyx] Ran RemoveNonArrayFrequentlyUsedEmojis migration');
}
