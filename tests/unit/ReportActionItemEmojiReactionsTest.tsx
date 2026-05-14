/**
 * Regression test for dual-format reaction key reads in getEmojiReactionDetails.
 * Validates that hex-keyed, name-keyed, and mixed reaction maps all produce the
 * correct bubble props (emojiCodes + reactionCount), which is the data shape
 * consumed by EmojiReactionBubble.
 */
import {render, screen} from '@testing-library/react-native';
import React from 'react';
import EmojiReactionBubble from '@components/Reactions/EmojiReactionBubble';
import {getEmojiReactionDetails} from '@libs/EmojiUtils';
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
