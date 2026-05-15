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
    const makeReaction = (userID: string, timestamp: string): ReportActionReaction => ({
        createdAt: timestamp,
        oldestTimestamp: timestamp,
        users: {
            [userID]: {id: userID, oldestTimestamp: timestamp, skinTones: {[-1]: timestamp}},
        },
    });

    it('collapses a hex-keyed and a name-keyed entry for the same emoji into one bubble', () => {
        const reactions = {
            '+1': makeReaction('111', '2024-01-01T00:00:00.000Z'),
            '1F44D': makeReaction('222', '2024-02-01T00:00:00.000Z'),
        };
        const merged = mergeReactionsByEmoji(reactions);
        expect(Object.keys(merged)).toHaveLength(1);
        const entry = Object.values(merged).at(0)!;
        expect(entry.users?.['111']).toBeDefined();
        expect(entry.users?.['222']).toBeDefined();
        expect(entry.oldestTimestamp).toBe('2024-01-01T00:00:00.000Z');
    });

    it('keeps distinct emojis as separate entries', () => {
        const reactions = {
            '1F44D': makeReaction('111', '2024-01-01T00:00:00.000Z'),
            '1F602': makeReaction('222', '2024-02-01T00:00:00.000Z'),
        };
        const merged = mergeReactionsByEmoji(reactions);
        expect(Object.keys(merged)).toHaveLength(2);
    });

    it('is a no-op when all keys are already canonical', () => {
        const reactions = {
            '1F44D': makeReaction('111', '2024-01-01T00:00:00.000Z'),
        };
        const merged = mergeReactionsByEmoji(reactions);
        expect(merged).toEqual(reactions);
    });

    it('merges per-user skinTones when the same user appears under both keys', () => {
        const hexReaction: ReportActionReaction = {
            createdAt: '2024-01-01T00:00:00.000Z',
            oldestTimestamp: '2024-01-01T00:00:00.000Z',
            users: {
                '111': {id: '111', oldestTimestamp: '2024-01-01T00:00:00.000Z', skinTones: {[1]: '2024-01-01T00:00:00.000Z'}},
            },
        };
        const nameReaction: ReportActionReaction = {
            createdAt: '2024-02-01T00:00:00.000Z',
            oldestTimestamp: '2024-02-01T00:00:00.000Z',
            users: {
                '111': {id: '111', oldestTimestamp: '2024-02-01T00:00:00.000Z', skinTones: {[3]: '2024-02-01T00:00:00.000Z'}},
            },
        };
        const merged = mergeReactionsByEmoji({'1F44D': hexReaction, '+1': nameReaction});
        expect(Object.keys(merged)).toHaveLength(1);
        const entry = Object.values(merged).at(0)!;
        expect(Object.keys(entry.users?.['111']?.skinTones ?? {})).toHaveLength(2);
        expect(entry.users?.['111']?.skinTones?.[1]).toBeDefined();
        expect(entry.users?.['111']?.skinTones?.[3]).toBeDefined();
    });
});
