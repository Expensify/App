import _ from 'underscore';
import Emoji from '../../assets/emojis';
import CONST from '../../src/CONST';
import * as EmojiUtils from '../../src/libs/EmojiUtils';

describe('EmojiRegexTest', () => {
    it('matches all the emojis in the list', () => {
        // Given the set of Emojis available in the application
        const emojiMatched = _.every(Emoji, (emoji) => {
            if (emoji.header === true || emoji.code === CONST.EMOJI_SPACER) {
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

    it('extracts text with emojis to array of elements', () => {
        // Text containing various emojis of various lengths
        const textWithEmojis1 = "Lorem 😪️ ipsum😎️😂 dolor 😋sit amet. 👨‍👩‍👦️ ";
        const textWithEmojis2 = "😪️😎️😂Duis aute 😂irure dolor in 👩‍👩‍👧‍👦️reprehenderit.";
        const textWithEmojis3 = "Excepteur 😂sint😂 occaecat cupidatat non proident.";
        const textWithEmojis4 = "🇺🇲Egestas quis ipsum suspendisse ultrices gravida dictum fusce ut.🇺🇲";
        const textWithEmojis5 = "Vestibulum ❤️lectus☠️ mauris ultrices eros in cursus.";
        const textWithEmojis6 = "Ullamcorper morbi tincidunt ornare massa.😂";

        expect(EmojiUtils.escapeEmojiFromText(textWithEmojis1)).toHaveLength(11);
        expect(EmojiUtils.escapeEmojiFromText(textWithEmojis2)).toHaveLength(11);
        expect(EmojiUtils.escapeEmojiFromText(textWithEmojis3)).toHaveLength(5);
        expect(EmojiUtils.escapeEmojiFromText(textWithEmojis4)).toHaveLength(5);
        expect(EmojiUtils.escapeEmojiFromText(textWithEmojis5)).toHaveLength(5);
        expect(EmojiUtils.escapeEmojiFromText(textWithEmojis6)).toHaveLength(3);
    });

    it ('returns same text if it doesnt contain emojis', () => {
        // Text that doesn't contain any emojis
        const textWithoutEmojis1 = "Vestibulum lectus mauris ultrices eros in cursus.";
        const textWithoutEmojis2 = "Amet venenatis urna cursus eget nunc scelerisque viverra mauris in.";
        const textWithoutEmojis3 = "Ullamcorper morbi tincidunt ornare massa.";

        expect(EmojiUtils.escapeEmojiFromText(textWithoutEmojis1)).toBe(textWithoutEmojis1);
        expect(EmojiUtils.escapeEmojiFromText(textWithoutEmojis2)).toBe(textWithoutEmojis2);
        expect(EmojiUtils.escapeEmojiFromText(textWithoutEmojis3)).toBe(textWithoutEmojis3);
    });
});
