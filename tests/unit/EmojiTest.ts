import Emojis, {importEmojiLocale} from '@assets/emojis';
import type {Emoji} from '@assets/emojis/types';
import {buildEmojisTrie} from '@libs/EmojiTrie';
import * as EmojiUtils from '@libs/EmojiUtils';

describe('EmojiTest', () => {
    beforeAll(async () => {
        await importEmojiLocale('en');
        buildEmojisTrie('en');
        await importEmojiLocale('es');
        buildEmojisTrie('es');
    });

    it('matches all the emojis in the list', () => {
        // Given the set of Emojis available in the application
        const emojiMatched = Emojis.every((emoji) => {
            if (('header' in emoji && emoji.header) || ('spacer' in emoji && emoji.spacer)) {
                return true;
            }

            // When we match every Emoji Code
            const isEmojiMatched = EmojiUtils.containsOnlyEmojis(emoji.code);

            let skinToneMatched = true;
            if ('types' in emoji && emoji.types) {
                // and every skin tone variant of the Emoji code
                skinToneMatched = emoji.types.every((emojiWithSkinTone) => EmojiUtils.containsOnlyEmojis(emojiWithSkinTone));
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

    it('replaces an emoji code with an emoji and a space', () => {
        const text = 'Hi :smile:';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄 ');
    });

    it('will add a space after the last emoji', () => {
        const text = 'Hi :smile::wave:';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 ');
    });

    it('will add a space after the last emoji if there is text after it', () => {
        const text = 'Hi :smile::wave:space after last emoji';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 space after last emoji');
    });

    it('will add a space after the last emoji if there is invalid emoji after it', () => {
        const text = 'Hi :smile::wave:space when :invalidemoji: present';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 space when :invalidemoji: present');
    });

    it('will not add a space after the last emoji if there if last emoji is immediately followed by a space', () => {
        const text = 'Hi :smile::wave: space after last emoji';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄👋 space after last emoji');
    });

    it('will return correct cursor position', () => {
        const text = 'Hi :smile: there :wave:!';
        expect(EmojiUtils.replaceEmojis(text).cursorPosition).toBe(15);
    });

    it('will return correct cursor position when space is not added by space follows last emoji', () => {
        const text = 'Hi :smile: there!';
        expect(EmojiUtils.replaceEmojis(text).cursorPosition).toBe(6);
    });

    it('will return undefined cursor position when no emoji is replaced', () => {
        const text = 'Hi there!';
        expect(EmojiUtils.replaceEmojis(text).cursorPosition).toBe(undefined);
    });

    it('suggests emojis when typing emojis prefix after colon', () => {
        const text = 'Hi :coffin';
        expect(EmojiUtils.suggestEmojis(text, 'en')).toEqual([{code: '⚰️', name: 'coffin'}]);
    });

    it('suggests a limited number of matching emojis', () => {
        const text = 'Hi :face';
        const limit = 3;
        expect(EmojiUtils.suggestEmojis(text, 'en', limit)?.length).toBe(limit);
    });

    it('correct suggests emojis accounting for keywords', () => {
        const thumbEmojisEn: Emoji[] = [
            {
                code: '👍',
                name: '+1',
                types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
            },
            {
                code: '👎',
                name: '-1',
                types: ['👎🏿', '👎🏾', '👎🏽', '👎🏼', '👎🏻'],
            },
            {
                name: 'hand_with_index_finger_and_thumb_crossed',
                code: '🫰',
                types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
            },
        ];

        const thumbEmojisEs: Emoji[] = [
            {
                code: '👍',
                name: '+1',
                types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
            },
            {
                code: '👎',
                name: '-1',
                types: ['👎🏿', '👎🏾', '👎🏽', '👎🏼', '👎🏻'],
            },
            {
                name: 'mano_con_dedos_cruzados',
                code: '🫰',
                types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
            },
        ];

        expect(EmojiUtils.suggestEmojis(':thumb', 'en')).toEqual(thumbEmojisEn);

        expect(EmojiUtils.suggestEmojis(':thumb', 'es')).toEqual(thumbEmojisEs);

        expect(EmojiUtils.suggestEmojis(':pulgar', 'es')).toEqual([
            {
                code: '🤙',
                name: 'mano_llámame',
                types: ['🤙🏿', '🤙🏾', '🤙🏽', '🤙🏼', '🤙🏻'],
            },
            {
                code: '👍',
                name: '+1',
                types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
            },
            {
                code: '👎',
                name: '-1',
                types: ['👎🏿', '👎🏾', '👎🏽', '👎🏼', '👎🏻'],
            },
            {
                name: 'mano_con_dedos_cruzados',
                code: '🫰',
                types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
            },
        ]);
    });
});
