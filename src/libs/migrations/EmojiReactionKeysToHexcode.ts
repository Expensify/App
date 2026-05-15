import Onyx from 'react-native-onyx';
import {emojiCodeTableWithSkinTones, emojiNameTable} from '@assets/emojis';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type ReportActionReactions from '@src/types/onyx/ReportActionReactions';
import type CollectionDataSet from '@src/types/utils/CollectionDataSet';

const HEX_KEY_PATTERN = /^[0-9A-F]+(-[0-9A-F]+)*$/;

function resolveHexcode(key: string): string | undefined {
    if (HEX_KEY_PATTERN.test(key)) {
        return key;
    }
    const normalizedName = key.startsWith(':') && key.endsWith(':') ? key.slice(1, -1) : key;
    const byName = emojiNameTable[normalizedName];
    if (byName?.hexcode) {
        return byName.hexcode;
    }
    const byCode = emojiCodeTableWithSkinTones[key];
    if (byCode?.hexcode) {
        return byCode.hexcode;
    }
    return undefined;
}

export default function (): Promise<void> {
    return new Promise<void>((resolve) => {
        const flagConnection = Onyx.connectWithoutView({
            key: ONYXKEYS.EMOJI_REACTION_KEYS_TO_HEXCODE_MIGRATION_DONE,
            callback: (isDone) => {
                Onyx.disconnect(flagConnection);

                if (isDone) {
                    Log.info('[Migrate Onyx] Skipped EmojiReactionKeysToHexcode — already completed');
                    return resolve();
                }

                const connection = Onyx.connectWithoutView({
                    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
                    waitForCollectionCallback: true,
                    callback: (collection) => {
                        Onyx.disconnect(connection);

                        if (!collection) {
                            Log.info('[Migrate Onyx] Skipped EmojiReactionKeysToHexcode — no reactions collection');
                            Onyx.set(ONYXKEYS.EMOJI_REACTION_KEYS_TO_HEXCODE_MIGRATION_DONE, true).then(resolve);
                            return;
                        }

                        const updates: CollectionDataSet<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS> = {};
                        let migratedCount = 0;

                        for (const [collectionKey, reactions] of Object.entries(collection)) {
                            if (!reactions) {
                                continue;
                            }

                            const rebuilt: ReportActionReactions = {};
                            let changed = false;

                            for (const [oldKey, reaction] of Object.entries(reactions)) {
                                if (!reaction) {
                                    continue;
                                }

                                const hexcode = resolveHexcode(oldKey);
                                if (!hexcode) {
                                    Log.warn(`[Migrate Onyx] EmojiReactionKeysToHexcode: unknown reaction key "${oldKey}"; preserving`);
                                    rebuilt[oldKey] = reaction;
                                    continue;
                                }

                                const newKey = hexcode;
                                if (newKey !== oldKey) {
                                    changed = true;
                                }

                                const existing = rebuilt[newKey];
                                if (existing) {
                                    const earlierCreatedAt = existing.createdAt < reaction.createdAt ? existing.createdAt : reaction.createdAt;
                                    const earlierOldestTimestamp = existing.oldestTimestamp < reaction.oldestTimestamp ? existing.oldestTimestamp : reaction.oldestTimestamp;
                                    rebuilt[newKey] = {
                                        ...existing,
                                        createdAt: earlierCreatedAt,
                                        oldestTimestamp: earlierOldestTimestamp,
                                        users: {...existing.users, ...reaction.users},
                                    };
                                } else {
                                    rebuilt[newKey] = reaction;
                                }
                            }

                            if (changed) {
                                updates[collectionKey as `${typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${string}`] = rebuilt;
                                migratedCount++;
                            }
                        }

                        const finish = () => Onyx.set(ONYXKEYS.EMOJI_REACTION_KEYS_TO_HEXCODE_MIGRATION_DONE, true).then(resolve);

                        if (migratedCount === 0) {
                            Log.info('[Migrate Onyx] Skipped EmojiReactionKeysToHexcode — already all hex');
                            finish();
                            return;
                        }

                        Onyx.multiSet(updates).then(() => {
                            Log.info(`[Migrate Onyx] Ran EmojiReactionKeysToHexcode — migrated ${migratedCount} reportActions`);
                            finish();
                        });
                    },
                });
            },
        });
    });
}
