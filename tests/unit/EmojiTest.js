import _ from 'underscore';
import Emoji from '../../assets/emojis';
import * as EmojiUtils from '../../src/libs/EmojiUtils';

describe('EmojiTest', () => {
    it('matches all the emojis in the list', () => {
        // Given the set of Emojis available in the application
        const emojiMatched = _.every(Emoji, (emoji) => {
            if (emoji.header === true || emoji.spacer) {
                return true;
            }

            // When we match every Emoji Code
            const isEmojiMatched = EmojiUtils.isSingleEmoji(emoji.code);
            let skinToneMatched = true;
            if (emoji.types) {
                // and every skin tone variant of the Emoji code
                skinToneMatched = _.every(emoji.types, emojiWithSkinTone => EmojiUtils.isSingleEmoji(emojiWithSkinTone));
            }
            return skinToneMatched && isEmojiMatched;
        });

        // Then it should return true for every Emoji Code
        expect(emojiMatched).toBe(true);
    });

    it('matches single emojis variants for size', () => {
        // GIVEN an emoji that has the default Unicode representation WHEN we check if it's a single emoji THEN it should return true
        expect(EmojiUtils.isSingleEmoji('👉')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('😪️')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('😎️')).toBe(true);

        // GIVEN an emoji that different cross-platform variations WHEN we check if it's a single emoji THEN it should return true
        expect(EmojiUtils.isSingleEmoji('🔫️')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('🛍')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('🕍')).toBe(true);

        // GIVEN an emoji that is symbol/numerical WHEN we check if it's a single emoji THEN it should return true
        expect(EmojiUtils.isSingleEmoji('*️⃣')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('1️⃣️')).toBe(true);

        // GIVEN an emoji that has text-variant WHEN we check if it's a single emoji THEN it should return true
        expect(EmojiUtils.isSingleEmoji('❤️')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('⁉️')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('✳️')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('☠️')).toBe(true);

        // GIVEN an emoji that has skin tone attached WHEN we check if it's a single emoji THEN it should return true
        expect(EmojiUtils.isSingleEmoji('👶🏽')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('👩🏾')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('👊🏾')).toBe(true);

        // GIVEN an emoji that is composite(family) with 4+ unicode pairs WHEN we check if it's a single emoji THEN it should return true
        expect(EmojiUtils.isSingleEmoji('👨‍👩‍👦️')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('👩‍👩‍👧‍👦️')).toBe(true);

        // GIVEN an emoji that has a length of 2 (flags) WHEN we check if it's a single emoji THEN it should return true
        expect(EmojiUtils.isSingleEmoji('🇺🇲')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('🇮🇳')).toBe(true);
        expect(EmojiUtils.isSingleEmoji('🇺🇦️')).toBe(true);
    });

    it('replaces emoji codes with emojis inside a text', () => {
        const text = 'Hi :smile::wave:';
        expect(EmojiUtils.replaceEmojis(text)).toBe('Hi 😄👋');
    });

    it('suggests emojis when typing emojis prefix after colon', () => {
        const text = 'Hi :happy';
        expect(EmojiUtils.suggestEmojis(text)).toEqual([{code: '🙋', name: 'raising_hand'}]);
    });

    it('suggests a limited number of matching emojis', () => {
        const text = 'Hi :face';
        const limit = 3;
        expect(EmojiUtils.suggestEmojis(text, limit).length).toBe(limit);
    });
});
