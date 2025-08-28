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

    describe('containsOnlyEmojis - various emoji formats', () => {
        test.each([
            // Given an emoji that has the default Unicode representation when we check if it contains only emoji then it should return true
            ['👉', true],
            ['😪️', true],
            ['😎️', true],

            // Given an emoji that different cross - platform variations when we check if it contains only emoji then it should return true
            ['🔫️', true],
            ['🛍', true],
            ['🕍', true],

            // Given an emoji that is symbol/numerical when we check if it contains only emoji then it should return true
            ['*️⃣', true],
            ['1️⃣', true],

            // Given an emoji that has text-variant when we check if it contains only emoji then it should return true
            ['❤️', true],
            ['⁉️', true],
            ['✳️', true],
            ['☠️', true],

            // Given an emoji that has skin tone attached when we check if it contains only emoji then it should return true
            ['👶🏽', true],
            ['👩🏾', true],
            ['👊🏾', true],

            // Given an emoji that is composite(family) with 4+ unicode pairs when we check if it contains only emoji then it should return true
            ['👨‍👩‍👦️', true],
            ['👩‍👩‍👧‍👦️', true],

            // Given an emoji that has a length of 2 (flags) when we check if it contains only emoji then it should return true
            ['🇺🇲', true],
            ['🇮🇳', true],
            ['🇺🇦️', true],

            // Given an emoji that belongs to the new version of the dataset, when we check if it contains only emoji then it should return true
            ['🏋️', true],
            ['🧚‍♀️', true],
            ['⚰️', true],

            // Mixed emoji + text (false cases)
            ['😄 is smiley', false],
            ['Hi 😄👋', false],

            // Multiple emojis (true case)
            ['😄👋', true],

            // Multiple emojis with extra whitespace (still true)
            ['😄  👋', true],

            // Given an emoji with an LTR unicode, when we check if it contains only emoji, then it should return true
            ['\u2066😄', true],
        ])('should return %s => %s', (input, expected) => {
            expect(EmojiUtils.containsOnlyEmojis(input)).toBe(expected);
        });
    });

    test.each([
        ['😄 is smiley'],
        ['Hi 😄👋'],
        ['1'],
        ['a'],
        ['~'],
        ['𝕥𝕖𝕤𝕥'],
        ['𝓣𝓮𝓼𝓽'],
        ['𝕿𝖊𝖘𝖙'],
        ['🆃🅴🆂🆃'],
        ['🅃🄴🅂🅃'],
    ])('returns false for invalid emoji string "%s"', (input) => {
        expect(EmojiUtils.containsOnlyEmojis(input)).toBe(false);
    });


    describe('EmojiUtils.replaceEmojis text output', () => {
        test.each([
            ['Hi :smile:', 'Hi 😄 '],
            ['Hi :smile::wave:', 'Hi 😄👋 '],
            ['Hi :smile::wave:space after last emoji', 'Hi 😄👋 space after last emoji'],
            ['Hi :smile::wave: space after last emoji', 'Hi 😄👋 space after last emoji'],
            ['Hi :smile::wave:space when :invalidemoji: present', 'Hi 😄👋 space when :invalidemoji: present'],
        ])('replaces emoji codes in "%s"', (input, expected) => {
            expect(EmojiUtils.replaceEmojis(input).text).toBe(expected);
        });
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
                name: 'hand_with_index_finger_and_thumb_crossed',
                code: '🫰',
                types: ['🫰🏿', '🫰🏾', '🫰🏽', '🫰🏼', '🫰🏻'],
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

    describe('splitTextWithEmojis', () => {
        it('should return empty array if no text provided', () => {
            const processedTextArray = EmojiUtils.splitTextWithEmojis(undefined);
            expect(processedTextArray).toEqual([]);
        });

        it('should return empty array if there are no emojis in the text', () => {
            const text = 'Simple text example with several words without emojis.';
            const processedTextArray = EmojiUtils.splitTextWithEmojis(text);
            expect(processedTextArray).toEqual([]);
        });

        it('should split the text with emojis into array', () => {
            const textWithOnlyEmojis = '🙂🙂🙂';
            const textWithEmojis = 'Hello world 🙂🙂🙂 ! 🚀🚀 test2 👍👍🏿 test';
            const textStartsAndEndsWithEmojis = '🙂 Hello world 🙂🙂🙂 ! 🚀🚀️ test2 👍👍🏿 test 🙂';

            expect(EmojiUtils.splitTextWithEmojis(textWithOnlyEmojis)).toEqual([
                {text: '🙂', isEmoji: true},
                {text: '🙂', isEmoji: true},
                {text: '🙂', isEmoji: true},
            ]);
            expect(EmojiUtils.splitTextWithEmojis(textWithEmojis)).toEqual([
                {text: 'Hello world ', isEmoji: false},
                {text: '🙂', isEmoji: true},
                {text: '🙂', isEmoji: true},
                {text: '🙂', isEmoji: true},
                {text: ' ! ', isEmoji: false},
                {text: '🚀', isEmoji: true},
                {text: '🚀', isEmoji: true},
                {text: ' test2 ', isEmoji: false},
                {text: '👍', isEmoji: true},
                {text: '👍🏿', isEmoji: true},
                {text: ' test', isEmoji: false},
            ]);
            expect(EmojiUtils.splitTextWithEmojis(textStartsAndEndsWithEmojis)).toEqual([
                {text: '🙂', isEmoji: true},
                {text: ' Hello world ', isEmoji: false},
                {text: '🙂', isEmoji: true},
                {text: '🙂', isEmoji: true},
                {text: '🙂', isEmoji: true},
                {text: ' ! ', isEmoji: false},
                {text: '🚀', isEmoji: true},
                {text: '🚀️', isEmoji: true},
                {text: ' test2 ', isEmoji: false},
                {text: '👍', isEmoji: true},
                {text: '👍🏿', isEmoji: true},
                {text: ' test ', isEmoji: false},
                {text: '🙂', isEmoji: true},
            ]);
        });
    });
});
