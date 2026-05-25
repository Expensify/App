import type {OnyxKey, OnyxUpdate} from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

const REACTIONS_PREFIX = ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS;

/**
 * When skin tone 0 is the only key in a user's skinTones record, PHP's json_encode
 * serializes {"0": "ts"} as ["ts"] (a JSON array). Onyx's fastMerge treats an array
 * as a replacement value, wiping sibling skin-tone entries that existed in the local store.
 *
 * This function converts any array-shaped skinTones back into an object map before the
 * update reaches Onyx, so that the merge preserves existing entries.
 */
function normalizeReactionUpdates<TKey extends OnyxKey>(updates: Array<OnyxUpdate<TKey>>): Array<OnyxUpdate<TKey>> {
    for (const update of updates) {
        if (!update.key || !(update.key as string).startsWith(REACTIONS_PREFIX) || !update.value || typeof update.value !== 'object') {
            continue;
        }

        const reactions = update.value as Record<string, unknown>;
        for (const emojiKey of Object.keys(reactions)) {
            const reaction = reactions[emojiKey];
            if (!reaction || typeof reaction !== 'object') {
                continue;
            }
            const users = (reaction as Record<string, unknown>).users;
            if (!users || typeof users !== 'object') {
                continue;
            }
            for (const accountID of Object.keys(users as Record<string, unknown>)) {
                const userReaction = (users as Record<string, unknown>)[accountID];
                if (!userReaction || typeof userReaction !== 'object') {
                    continue;
                }
                const skinTones = (userReaction as Record<string, unknown>).skinTones;
                if (!Array.isArray(skinTones)) {
                    continue;
                }
                // Convert array [val0, val1, ...] to object {0: val0, 1: val1, ...}
                const normalized: Record<number, string> = {};
                for (let i = 0; i < skinTones.length; i++) {
                    normalized[i] = skinTones.at(i) as string;
                }
                (userReaction as Record<string, unknown>).skinTones = normalized;
            }
        }
    }
    return updates;
}

// eslint-disable-next-line import/prefer-default-export
export {normalizeReactionUpdates};
