import _ from 'underscore';
import Emoji from '../../assets/emojis';
import * as EmojiUtils from '../../src/libs/EmojiUtils';
import baseAddEmojiToComposer from '../../src/libs/addEmojiToComposer';

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
        // Given an emoji that has the default Unicode representation when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('👉')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('😪️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('😎️')).toBe(true);

        // Given an emoji that different cross - platform variations when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('🔫️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🛍')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🕍')).toBe(true);

        // Given an emoji that is symbol/numerical when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('*️⃣')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('1️⃣')).toBe(true);

        // Given an emoji that has text-variant when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('❤️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('⁉️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('✳️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('☠️')).toBe(true);

        // Given an emoji that has skin tone attached when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('👶🏽')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👩🏾')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👊🏾')).toBe(true);

        // Given an emoji that is composite(family) with 4+ unicode pairs when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('👨‍👩‍👦️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('👩‍👩‍👧‍👦️')).toBe(true);

        // Given an emoji that has a length of 2 (flags) when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('🇺🇲')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🇮🇳')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🇺🇦️')).toBe(true);

        // Given an emoji that belongs to the new version of the dataset, when we check if it contains only emoji then it should return true
        expect(EmojiUtils.containsOnlyEmojis('🏋️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('🧚‍♀️')).toBe(true);
        expect(EmojiUtils.containsOnlyEmojis('⚰️')).toBe(true);

        // Given an input when we check only single emoji with text, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('😄 is smiley')).toBe(false);

        // Given an input when we check text and multiple emojis, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('Hi 😄👋')).toBe(false);

        // Given an input when we only multiple emojis, then it should return true
        expect(EmojiUtils.containsOnlyEmojis('😄👋')).toBe(true);

        // Given an input when we check only multiple emojis with additional whitespace, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('😄  👋')).toBe(true);

        // Given an emoji with an LTR unicode, when we check if it contains only emoji, then it should return true
        expect(EmojiUtils.containsOnlyEmojis('\u2066😄')).toBe(true);
    });

    it('will not match for non emoji', () => {
        // Given a non-emoji input, when we check if it contains only emoji, then it should return false
        expect(EmojiUtils.containsOnlyEmojis('1')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('a')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('~')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('𝕥𝕖𝕤𝕥')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('𝓣𝓮𝓼𝓽')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('𝕿𝖊𝖘𝖙')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('🆃🅴🆂🆃')).toBe(false);
        expect(EmojiUtils.containsOnlyEmojis('🅃🄴🅂🅃')).toBe(false);
    });

    it('replaces an emoji code with an emoji and a space on mobile', () => {
        const text = 'Hi :smile::wave:';
        const replacedResults = EmojiUtils.replaceEmojis(text);
        expect(replacedResults.newText).toBe('Hi 😄👋');
        expect(replacedResults.lastReplacedSelection.start).toEqual(5);
        expect(replacedResults.lastReplacedSelection.end).toEqual(11);
    });

    it('will not add a space after the last emoji if there is text after it', () => {
        const text = 'Hi :smile::wave:no space after last emoji';
        expect(EmojiUtils.replaceEmojis(text).newText).toBe('Hi 😄👋no space after last emoji');
    });

    it('will not add a space after the last emoji when there is text after it on mobile', () => {
        const text = 'Hi :smile::wave:no space after last emoji';
        expect(EmojiUtils.replaceEmojis(text, true)).toBe('Hi 😄👋no space after last emoji');
    });

    it('will not add a space after the last emoji if we\'re not on mobile', () => {
        const text = 'Hi :smile:';
        expect(EmojiUtils.replaceEmojis(text)).toBe('Hi 😄');
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

    it('should insert emoji correctly with a whitespace within a text given a selection', () => {
        const res = baseAddEmojiToComposer({
            emoji: '😄',
            text: 'add emoji here',
            textInput: {
                setText: jest.fn(),
            },
            selection: {
                start: 4,
                end: 4,
            },
        });

        expect(res.newText).toEqual('add 😄 emoji here');
        expect(res.newSelection).toEqual({start: 7, end: 7});
    });
});
