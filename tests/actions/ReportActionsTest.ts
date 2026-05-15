/* eslint-disable @typescript-eslint/naming-convention */
import {afterEach, beforeAll, beforeEach, describe, expect, it} from '@jest/globals';
import Onyx from 'react-native-onyx';
import type {OnyxCollection} from 'react-native-onyx';
import type {AddEmojiReactionParams, RemoveEmojiReactionParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import CONST from '@src/CONST';
import {addEmojiReaction, removeEmojiReaction} from '@src/libs/actions/EmojiReactions';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

const REPORT_ID = 'report123';
const REPORT_ACTION_ID = 'action456';
const CURRENT_USER_ACCOUNT_ID = 1;

const THUMBS_UP_EMOJI = {
    code: '👍',
    name: '+1',
    hexcode: '1F44D',
    types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
};

describe('emoji reactions write hex', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(() => {
        global.fetch = TestHelper.getGlobalFetchMock();
        return Onyx.clear().then(() => waitForBatchedUpdates());
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('addEmojiReaction', () => {
        it('sends hex emojiCode to the API (not the legacy name)', async () => {
            addEmojiReaction(REPORT_ID, REPORT_ACTION_ID, THUMBS_UP_EMOJI, CONST.EMOJI_DEFAULT_SKIN_TONE, CURRENT_USER_ACCOUNT_ID);
            await waitForBatchedUpdates();

            TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.ADD_EMOJI_REACTION, 0, {emojiCode: THUMBS_UP_EMOJI.hexcode} as unknown as AddEmojiReactionParams);
        });

        it('stores optimistic data under hex key (not the legacy name)', async () => {
            const reactions: OnyxCollection<OnyxTypes.ReportActionReactions> = {};
            Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
                callback: (val, key) => {
                    if (!key) {
                        return;
                    }
                    reactions[key] = val;
                },
            });

            addEmojiReaction(REPORT_ID, REPORT_ACTION_ID, THUMBS_UP_EMOJI, CONST.EMOJI_DEFAULT_SKIN_TONE, CURRENT_USER_ACCOUNT_ID);
            await waitForBatchedUpdates();

            const reactionEntry = reactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`];
            expect(reactionEntry).toBeDefined();

            expect(reactionEntry).toHaveProperty(THUMBS_UP_EMOJI.hexcode);

            expect(reactionEntry).not.toHaveProperty(THUMBS_UP_EMOJI.name);
        });
    });

    describe('removeEmojiReaction', () => {
        it('sends hex emojiCode to the API (not the legacy name)', async () => {
            removeEmojiReaction(REPORT_ID, REPORT_ACTION_ID, THUMBS_UP_EMOJI, CURRENT_USER_ACCOUNT_ID);
            await waitForBatchedUpdates();

            TestHelper.expectAPICommandToHaveBeenCalledWith(WRITE_COMMANDS.REMOVE_EMOJI_REACTION, 0, {emojiCode: THUMBS_UP_EMOJI.hexcode} as unknown as RemoveEmojiReactionParams);
        });

        it('stores optimistic data under hex key (not the legacy name)', async () => {
            const reactions: OnyxCollection<OnyxTypes.ReportActionReactions> = {};
            Onyx.connect({
                key: ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS,
                callback: (val, key) => {
                    if (!key) {
                        return;
                    }
                    reactions[key] = val;
                },
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`, {
                [THUMBS_UP_EMOJI.hexcode]: {
                    createdAt: '2024-01-01 00:00:00',
                    users: {
                        [CURRENT_USER_ACCOUNT_ID]: {
                            skinTones: {'-1': '2024-01-01 00:00:00'},
                        },
                    },
                },
            });
            await waitForBatchedUpdates();

            removeEmojiReaction(REPORT_ID, REPORT_ACTION_ID, THUMBS_UP_EMOJI, CURRENT_USER_ACCOUNT_ID);
            await waitForBatchedUpdates();

            const reactionEntry = reactions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${REPORT_ACTION_ID}`];
            expect(reactionEntry).toBeDefined();

            const emojiEntry = reactionEntry?.[THUMBS_UP_EMOJI.hexcode];
            expect(emojiEntry).toBeDefined();
            expect(emojiEntry?.users?.[CURRENT_USER_ACCOUNT_ID]).toBeUndefined();
        });
    });
});
