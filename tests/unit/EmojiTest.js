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
            const isEmojiMatched = EmojiUtils.containsOnlyEmojis(emoji.code);

            let skinToneMatched = true;
            if (emoji.types) {
                // and every skin tone variant of the Emoji code
                skinToneMatched = _.every(emoji.types, emojiWithSkinTone => EmojiUtils.containsOnlyEmojis(emojiWithSkinTone));
            }
            return skinToneMatched && isEmojiMatched;
        });

        // Then it should return true for every Emoji Code
        expect(emojiMatched).toBe(true);
    });

    it('matches emojis for different variants', () => {
        // GIVEN an emoji that has the default Unicode representation WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('👉')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('😪️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('😎️')).toBe(true);

        // GIVEN an emoji that different cross - platform variations WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('🔫️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🛍')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🕍')).toBe(true);

        // GIVEN an emoji that is symbol/numerical WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('*️⃣')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('1️⃣')).toBe(true);

        // GIVEN an emoji that has text-variant WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('❤️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('⁉️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('✳️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('☠️')).toBe(true);

        // GIVEN an emoji that has skin tone attached WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('👶🏽')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👩🏾')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👊🏾')).toBe(true);

        // GIVEN an emoji that is composite(family) with 4+ unicode pairs WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('👨‍👩‍👦️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👩‍👩‍👧‍👦️')).toBe(true);

        // GIVEN an emoji that has a length of 2 (flags) WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('🇺🇲')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🇮🇳')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🇺🇦️')).toBe(true);

        // GIVEN an emoji that belongs to the new version of the dataset, WHEN we check if it contains only emoji THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('🏋️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🧚‍♀️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('⚰️')).toBe(true);

        // GIVEN an input WHEN we check only single emoji with text, THEN it should return false
        expect(EmojiUtils.containsOnlyEmojis('😄 is smiley')).toBe(false);

        // GIVEN an input WHEN we check text and multiple emojis, THEN it should return false
        expect(EmojiUtils.containsOnlyEmojis('Hi 😄👋')).toBe(false);

        // GIVEN an input WHEN we only multiple emojis, THEN it should return true
        expect(EmojiUtils.containsOnlyEmojis('😄👋')).toBe(true);

        // GIVEN an input WHEN we check only multiple emojis with additional whitespace, THEN it should return false
        expect(EmojiUtils.containsOnlyEmojis('😄  👋')).toBe(true);
    });

    it('replaces emoji codes with emojis inside a text', () => {
        const text = 'Hi :smile::wave:';
        expect(EmojiUtils.replaceEmojis(text)).toBe('Hi 😄👋');
    });

    it('suggests emojis when typing emojis prefix after colon', () => {
        const text = 'Hi :coffin';
        expect(EmojiUtils.suggestEmojis(text)).toEqual([{code: '⚰️', name: 'coffin'}]);
    });

    it('suggests a limited number of matching emojis', () => {
        const text = 'Hi :face';
        const limit = 3;
        expect(EmojiUtils.suggestEmojis(text, limit).length).toBe(limit);
    });

    it('correct suggests emojis accounting for keywords', () => {
        const text = ':thumb';
        expect(EmojiUtils.suggestEmojis(text)).toEqual([{code: '👍', name: '+1'}, {code: '👎', name: '-1'}]);
    });
});
