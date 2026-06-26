/**
 * Regression test for dual-format reaction key reads in getEmojiReactionDetails.
 * Validates that hex-keyed, name-keyed, and mixed reaction maps all produce the
 * correct bubble props (emojiCodes + reactionCount), which is the data shape
 * consumed by EmojiReactionBubble.
 */
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import EmojiReactionBubble from '@components/Reactions/EmojiReactionBubble';
import {getEmojiReactionDetails, mergeReactionsByEmoji} from '@libs/EmojiUtils';
import type {ReportActionReaction} from '@src/types/onyx/ReportActionReactions';

const USER_ACCOUNT_ID = 12345;
const USER_ID_KEY = String(USER_ACCOUNT_ID);

const makeReaction = (): ReportActionReaction => ({
    createdAt: '2024-01-01 00:00:00',
    oldestTimestamp: '2024-01-01 00:00:00',
    users: {
        [USER_ID_KEY]: {
            id: USER_ID_KEY,
            oldestTimestamp: '2024-01-01 00:00:00',
            skinTones: {[-1]: '2024-01-01 00:00:00'},
        },
    },
});

function renderBubble(emojiKey: string) {
    const reaction = makeReaction();
    const {emoji, emojiCodes, reactionCount, hasUserReacted} = getEmojiReactionDetails(emojiKey, reaction, USER_ACCOUNT_ID);

    return {
        rendered: render(
            <EmojiReactionBubble
                emojiCodes={emojiCodes}
                count={reactionCount}
                hasUserReacted={hasUserReacted}
                onPress={jest.fn()}
            />,
        ),
        emoji,
        emojiCodes,
        reactionCount,
    };
}

describe('ReportActionItemEmojiReactions — dual-format reaction keys', () => {
    it('hex-keyed reaction renders the correct glyph and count', () => {
        const {emojiCodes, reactionCount} = renderBubble('1F44D');
        expect(reactionCount).toBe(1);
        expect(emojiCodes.length).toBeGreaterThan(0);
        expect(emojiCodes.at(0)).toBe('👍');
        expect(screen.getByLabelText('👍')).toBeTruthy();
    });

    it('name-keyed reaction (legacy) renders the correct glyph and count', () => {
        const {emojiCodes, reactionCount} = renderBubble('+1');
        expect(reactionCount).toBe(1);
        expect(emojiCodes.at(0)).toBe('👍');
        expect(screen.getByLabelText('👍')).toBeTruthy();
    });

    it('mixed reaction map: hex key and name key resolve to the same emoji', () => {
        const hexDetails = getEmojiReactionDetails('1F44D', makeReaction(), USER_ACCOUNT_ID);
        const nameDetails = getEmojiReactionDetails('+1', makeReaction(), USER_ACCOUNT_ID);
        expect(hexDetails.emoji?.name).toBe(nameDetails.emoji?.name);
        expect(hexDetails.emojiCodes).toEqual(nameDetails.emojiCodes);
        expect(hexDetails.reactionCount).toBe(nameDetails.reactionCount);
    });
});

describe('mergeReactionsByEmoji', () => {
    const THUMBSUP_HEX = '1F44D';
    const THUMBSUP_NAME = '+1';
    const JOY_HEX = '1F602';
    const USER_A = '111';
    const USER_B = '222';
    const JAN = '2024-01-01T00:00:00.000Z';
    const FEB = '2024-02-01T00:00:00.000Z';

    function makeTimestampedReaction(userID: string, timestamp: string): ReportActionReaction {
        return {
            createdAt: timestamp,
            oldestTimestamp: timestamp,
            users: {
                [userID]: {id: userID, oldestTimestamp: timestamp, skinTones: {[-1]: timestamp}},
            },
        };
    }

    it('collapses a hex-keyed and a name-keyed entry for the same emoji into one bubble', () => {
        const reactions = {
            [THUMBSUP_NAME]: makeTimestampedReaction(USER_A, JAN),
            [THUMBSUP_HEX]: makeTimestampedReaction(USER_B, FEB),
        };
        const merged = mergeReactionsByEmoji(reactions);
        expect(Object.keys(merged)).toHaveLength(1);
        const entry = Object.values(merged).at(0);
        expect(entry?.users?.[USER_A]).toBeDefined();
        expect(entry?.users?.[USER_B]).toBeDefined();
        expect(entry?.oldestTimestamp).toBe(JAN);
    });

    it('keeps distinct emojis as separate entries', () => {
        const reactions = {
            [THUMBSUP_HEX]: makeTimestampedReaction(USER_A, JAN),
            [JOY_HEX]: makeTimestampedReaction(USER_B, FEB),
        };
        const merged = mergeReactionsByEmoji(reactions);
        expect(Object.keys(merged)).toHaveLength(2);
    });

    it('is a no-op when all keys are already canonical', () => {
        const reactions = {
            [THUMBSUP_HEX]: makeTimestampedReaction(USER_A, JAN),
        };
        const merged = mergeReactionsByEmoji(reactions);
        expect(merged).toEqual(reactions);
    });

    it('merges per-user skinTones when the same user appears under both keys', () => {
        const SKIN_TONE_1 = 1;
        const SKIN_TONE_3 = 3;
        const hexReaction: ReportActionReaction = {
            createdAt: JAN,
            oldestTimestamp: JAN,
            users: {
                [USER_A]: {id: USER_A, oldestTimestamp: JAN, skinTones: {[SKIN_TONE_1]: JAN}},
            },
        };
        const nameReaction: ReportActionReaction = {
            createdAt: FEB,
            oldestTimestamp: FEB,
            users: {
                [USER_A]: {id: USER_A, oldestTimestamp: FEB, skinTones: {[SKIN_TONE_3]: FEB}},
            },
        };
        const merged = mergeReactionsByEmoji({[THUMBSUP_HEX]: hexReaction, [THUMBSUP_NAME]: nameReaction});
        expect(Object.keys(merged)).toHaveLength(1);
        const entry = Object.values(merged).at(0);
        const skinTones = entry?.users?.[USER_A]?.skinTones ?? {};
        expect(Object.keys(skinTones)).toHaveLength(2);
        expect(skinTones[SKIN_TONE_1]).toBeDefined();
        expect(skinTones[SKIN_TONE_3]).toBeDefined();
    });
});
