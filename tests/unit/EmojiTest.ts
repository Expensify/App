import Emojis, {importEmojiLocale} from '@assets/emojis';
import type {Emoji} from '@assets/emojis/types';
// eslint-disable-next-line no-restricted-syntax
import * as Browser from '@libs/Browser';
import {buildEmojisTrie} from '@libs/EmojiTrie';
// eslint-disable-next-line no-restricted-syntax
import * as EmojiUtils from '@libs/EmojiUtils';

// Unmock to use real parseExpensiMark for code block detection tests
jest.unmock('@expensify/react-native-live-markdown');

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

    it('will add emoji after preceeding emoji with space between them', () => {
        const text = 'Hi 😄 :wave:';
        expect(EmojiUtils.replaceEmojis(text).text).toBe('Hi 😄 👋 ');
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

    describe('code block handling', () => {
        it('should not replace emoji shortcode inside inline code block', () => {
            const text = '`:smile:`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:smile:`');
        });

        it('should not replace emoji shortcode inside code fence', () => {
            const text = '```\n:smile:\n```';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('```\n:smile:\n```');
        });

        it('should replace emoji shortcode outside code block but not inside', () => {
            const text = ':smile: and `:wave:`';
            // Note: trailing space is added after the emoji, code block content stays unchanged
            expect(EmojiUtils.replaceEmojis(text).text).toBe('😄 and `:wave:`');
        });

        it('should revert emoji unicode to shortcode when inside code block (Slack behavior)', () => {
            const text = '`😄`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:smile:`');
        });

        it('should revert multiple emojis inside code block', () => {
            const text = '`😄👋`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:smile::wave:`');
        });

        it('should not revert emoji outside code block', () => {
            const text = '😄 and `test`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('😄 and `test`');
        });

        it('should handle mixed scenario with emoji inside and outside code blocks', () => {
            const text = ':wave: hello `😄` world';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('👋 hello `:smile:` world');
        });

        it('should handle same shortcode both inside and outside code block', () => {
            // Regression test: indexOf was returning the first occurrence for both,
            // causing the shortcode outside to not be converted
            const text = 'hello `:joy:` world :joy:';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('hello `:joy:` world 😂 ');
        });

        it('should revert skin-tone emoji without orphaned modifier', () => {
            // Regression test: character-by-character iteration was splitting 👍🏽 into 👍 + 🏽
            const text = '`👍🏽`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:+1:`');
        });

        it('should handle code fence with emoji correctly', () => {
            // Regression test: overlapping codeblock and pre ranges were causing extra colons
            const text = '```\n😂\n```';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('```\n:joy:\n```');
        });

        it('should handle multiple same shortcodes with some inside code blocks', () => {
            const text = ':joy: `:joy:` :joy:';
            // First and third :joy: should convert, second should stay as shortcode
            expect(EmojiUtils.replaceEmojis(text).text).toBe('😂 `:joy:` 😂 ');
        });

        it('should handle multiple consecutive code blocks', () => {
            const text = '`:joy:` `:wave:`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:joy:` `:wave:`');
        });

        it('should handle code block at beginning with shortcode at end', () => {
            const text = '`:joy:` and :wave:';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:joy:` and 👋 ');
        });

        it('should handle code fence with language specifier', () => {
            // Note: parseExpensiMark doesn't recognize code fences with language specifiers (```js)
            // so the shortcode gets converted. This is a limitation of the markdown parser.
            const text = '```js\n:joy:\n```';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('```js\n😂 \n```');
        });

        it('should keep unknown shortcode inside code block unchanged', () => {
            const text = '`:unknown_emoji:`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:unknown_emoji:`');
        });

        it('should handle empty code block without crashing', () => {
            const text = '`` and :joy:';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`` and 😂 ');
        });

        it('should revert different skin-tone variations correctly', () => {
            // Light skin tone
            const text1 = '`👍🏻`';
            expect(EmojiUtils.replaceEmojis(text1).text).toBe('`:+1:`');

            // Dark skin tone
            const text2 = '`👍🏿`';
            expect(EmojiUtils.replaceEmojis(text2).text).toBe('`:+1:`');
        });

        it('should handle emoji and shortcode in same code block', () => {
            // Emoji gets reverted, shortcode stays as-is
            const text = '`😄 :wave:`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:smile: :wave:`');
        });

        it('should handle multiple code fences with content between', () => {
            const text = '```\n:joy:\n```\nhello :wave:\n```\n:smile:\n```';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('```\n:joy:\n```\nhello 👋 \n```\n:smile:\n```');
        });

        it('should revert emojis in multiple inline code blocks correctly', () => {
            // Regression test: forward processing caused position shifts when emoji→shortcode changed length
            const text = '`😄` hello `👋`';
            expect(EmojiUtils.replaceEmojis(text).text).toBe('`:smile:` hello `:wave:`');
        });

        it('should handle shortcode spanning across would-be code block boundary', () => {
            // Backtick in the middle of shortcode - not a valid code block
            const text = ':jo`y:';
            expect(EmojiUtils.replaceEmojis(text).text).toBe(':jo`y:');
        });
    });

    describe('isPositionInsideCodeBlock', () => {
        it('should return true for position inside inline code', () => {
            const text = '`:joy:`';
            // Position 1 is the colon after the backtick
            expect(EmojiUtils.isPositionInsideCodeBlock(text, 1)).toBe(true);
        });

        it('should return false for position outside code block', () => {
            const text = 'hello `:joy:`';
            // Position 0 is 'h' which is outside
            expect(EmojiUtils.isPositionInsideCodeBlock(text, 0)).toBe(false);
        });

        it('should return false for empty text', () => {
            expect(EmojiUtils.isPositionInsideCodeBlock('', 0)).toBe(false);
        });

        it('should return true for position inside code fence', () => {
            const text = '```\ncode\n```';
            // Position 4 is inside the code fence content
            expect(EmojiUtils.isPositionInsideCodeBlock(text, 4)).toBe(true);
        });
    });

    describe('getEmojiCodeForInsertion', () => {
        it('should return shortcode when inside code block', () => {
            const emoji = {code: '😄', name: 'smile', types: ['😄', '😄🏻', '😄🏼', '😄🏽', '😄🏾', '😄🏿']};
            expect(EmojiUtils.getEmojiCodeForInsertion(emoji, 0, true)).toBe(':smile:');
        });

        it('should return emoji code when not inside code block', () => {
            const emoji = {code: '😄', name: 'smile'};
            expect(EmojiUtils.getEmojiCodeForInsertion(emoji, 0, false)).toBe('😄');
        });

        it('should return skin-toned emoji when preferred skin tone is set and not in code block', () => {
            const emoji = {code: '👍', name: '+1', types: ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']};
            expect(EmojiUtils.getEmojiCodeForInsertion(emoji, 3, false)).toBe('👍🏽');
        });

        it('should return shortcode even with skin tone preference when inside code block', () => {
            const emoji = {code: '👍', name: '+1', types: ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']};
            expect(EmojiUtils.getEmojiCodeForInsertion(emoji, 3, true)).toBe(':+1:');
        });

        it('should return base emoji code when skin tone is -1', () => {
            const emoji = {code: '👍', name: '+1', types: ['👍', '👍🏻', '👍🏼', '👍🏽', '👍🏾', '👍🏿']};
            expect(EmojiUtils.getEmojiCodeForInsertion(emoji, -1, false)).toBe('👍');
        });
    });

    it('suggests emojis when typing emojis prefix after colon', () => {
        const text = 'Hi :coffin';
        expect(EmojiUtils.suggestEmojis(text, 'en')).toEqual([{code: '⚰️', name: 'coffin'}]);
    });

    it('suggests emojis when typing emojis prefix after colon, preceeded by another emoji ', () => {
        const text = 'Hi :ok: :coffin';
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

    describe('insertZWNJBetweenDigitAndEmoji', () => {
        // ZWNJ character for comparison
        const ZWNJ = '\u200C';

        // Mock isSafari to return true for these tests since the function only applies on Safari
        beforeEach(() => {
            jest.spyOn(Browser, 'isSafari').mockReturnValue(true);
        });

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('should insert ZWNJ between a single digit and emoji', () => {
            // Given a digit immediately followed by an emoji
            const input = '1😄';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then ZWNJ should be inserted between the digit and emoji
            expect(result).toBe(`1${ZWNJ}😄`);
        });

        it('should insert ZWNJ between multiple digits and emoji', () => {
            // Given multiple digits immediately followed by an emoji
            const input = '234😄';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then ZWNJ should be inserted only between the last digit and emoji
            expect(result).toBe(`234${ZWNJ}😄`);
        });

        it('should handle multiple digit-emoji pairs in the same string', () => {
            // Given a string with multiple digit-emoji pairs
            const input = '1😄 2🚀 3👍';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then ZWNJ should be inserted for each pair
            expect(result).toBe(`1${ZWNJ}😄 2${ZWNJ}🚀 3${ZWNJ}👍`);
        });

        it('should not modify text with space between digit and emoji', () => {
            // Given a digit followed by a space and then an emoji
            const input = '1 😄';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then the text should remain unchanged
            expect(result).toBe('1 😄');
        });

        it('should not modify text with only digits', () => {
            // Given text with only digits
            const input = '12345';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then the text should remain unchanged
            expect(result).toBe('12345');
        });

        it('should not modify text with only emojis', () => {
            // Given text with only emojis
            const input = '😄🚀👍';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then the text should remain unchanged
            expect(result).toBe('😄🚀👍');
        });

        it('should not modify emoji followed by digit', () => {
            // Given an emoji followed by a digit
            const input = '😄1';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then the text should remain unchanged
            expect(result).toBe('😄1');
        });

        it('should handle empty string', () => {
            // Given an empty string
            const input = '';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then the result should be an empty string
            expect(result).toBe('');
        });

        it('should handle text without digits or emojis', () => {
            // Given regular text without digits or emojis
            const input = 'Hello World';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then the text should remain unchanged
            expect(result).toBe('Hello World');
        });

        it('should handle mixed content with digit-emoji pairs', () => {
            // Given mixed content with text, digits, and emojis
            const input = 'Hello 5😄 World';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then ZWNJ should be inserted only between digit and emoji
            expect(result).toBe(`Hello 5${ZWNJ}😄 World`);
        });

        it('should handle all digit types (0-9)', () => {
            // Given all digit types followed by emojis
            const inputs = ['0😄', '1😄', '2😄', '3😄', '4😄', '5😄', '6😄', '7😄', '8😄', '9😄'];
            // When we process each with insertZWNJBetweenDigitAndEmoji
            // Then ZWNJ should be inserted for each
            for (const input of inputs) {
                const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
                expect(result).toBe(`${input[0]}${ZWNJ}${input.slice(1)}`);
            }
        });

        it('should handle various emoji types from different Unicode ranges', () => {
            // Given digits followed by emojis from different Unicode ranges
            // Miscellaneous Symbols (U+2600-U+27BF)
            expect(EmojiUtils.insertZWNJBetweenDigitAndEmoji('1☀')).toBe(`1${ZWNJ}☀`);
            // Miscellaneous Symbols and Pictographs (U+1F300-U+1F5FF)
            expect(EmojiUtils.insertZWNJBetweenDigitAndEmoji('1🌟')).toBe(`1${ZWNJ}🌟`);
            // Emoticons (U+1F600-U+1F64F)
            expect(EmojiUtils.insertZWNJBetweenDigitAndEmoji('1😀')).toBe(`1${ZWNJ}😀`);
            // Transport and Map Symbols (U+1F680-U+1F6FF)
            expect(EmojiUtils.insertZWNJBetweenDigitAndEmoji('1🚀')).toBe(`1${ZWNJ}🚀`);
        });

        it('should handle consecutive digit-emoji pairs without spaces', () => {
            // Given consecutive digit-emoji pairs
            const input = '1😄2🚀3👍';
            // When we process it with insertZWNJBetweenDigitAndEmoji
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then ZWNJ should be inserted for each pair
            expect(result).toBe(`1${ZWNJ}😄2${ZWNJ}🚀3${ZWNJ}👍`);
        });

        it('should simulate the Safari keycap bug scenario - typing "234:smile:"', () => {
            // Given the scenario where a user types "234" then adds :smile: emoji
            // After emoji shortcode conversion, we get "234😄"
            const afterEmojiConversion = '234😄';
            // When we apply the ZWNJ fix
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(afterEmojiConversion);
            // Then ZWNJ should be inserted to prevent Safari's keycap sequence detection
            expect(result).toBe(`234${ZWNJ}😄`);
            // Verify the ZWNJ is actually in the string
            expect(result.includes(ZWNJ)).toBe(true);
            // Verify the result is different from input (ZWNJ was added)
            expect(result.length).toBe(afterEmojiConversion.length + 1);
        });

        it('should return input unchanged on non-Safari browsers', () => {
            // Given we're not on Safari
            jest.spyOn(Browser, 'isSafari').mockReturnValue(false);
            // When we process a digit + emoji string
            const input = '234😄';
            const result = EmojiUtils.insertZWNJBetweenDigitAndEmoji(input);
            // Then the text should remain unchanged (no ZWNJ inserted)
            expect(result).toBe('234😄');
            expect(result.includes(ZWNJ)).toBe(false);
        });
    });
});
