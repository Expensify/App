import {emojiCodeTableWithSkinTones, importEmojiLocale} from '@assets/emojis';

import emojiTrieForLocale from '@libs/EmojiTrie';
import {containsEmojiCodePoint, containsOnlyEmojis, containsOnlyEmojisInDraft, replaceEmojis, suggestEmojis} from '@libs/EmojiUtils';
import Parser from '@libs/Parser';

import CONST from '@src/CONST';

// replaceEmojis needs the real parser to find code spans
jest.unmock('@expensify/react-native-live-markdown');

// Fragments that markdown rules, entity decoding, whitespace stripping or emoji sequences could combine into an emoji
const FRAGMENTS = [
    'a',
    'Hello',
    ' ',
    '\n',
    '*',
    '_',
    '~',
    '`',
    '```',
    '> ',
    '# ',
    '@user@example.com',
    '@here',
    '#room',
    'https://www.example.com/path',
    '[link](https://example.com)',
    '![alt](https://example.com/a.png)',
    '&#x1F600;',
    '&#128512;',
    '&amp;',
    '&lt;emoji&gt;',
    '<emoji>😀</emoji>',
    '1',
    '#',
    '⃣',
    '️',
    '‍',
    '​',
    '\u{1F3FD}',
    '\u{E0067}',
    '\u{1F1FA}',
    '\u{1F1F8}',
    '',
    '😀',
    '👍🏽',
    '❤️',
    '1️⃣',
    '🇺🇸',
    '👨‍👩‍👧',
    '©',
    ':smile:',
];

/** Deterministic generator, so a failing draft can be reproduced from the seed */
function createRandom(seed: number) {
    let state = seed;
    return () => {
        state = (state * 1103515245 + 12345) % 2147483648;
        return state / 2147483648;
    };
}

function generateDrafts(count: number): string[] {
    const random = createRandom(42);
    const drafts: string[] = [];
    for (let i = 0; i < count; i++) {
        const length = 1 + Math.floor(random() * 8);
        let draft = '';
        for (let j = 0; j < length; j++) {
            draft += FRAGMENTS.at(Math.floor(random() * FRAGMENTS.length)) ?? '';
        }
        drafts.push(draft);
    }
    return drafts;
}

const emojiCodes = Object.keys(emojiCodeTableWithSkinTones);
const drafts = [...FRAGMENTS, ...generateDrafts(5000), ...emojiCodes];

describe('containsOnlyEmojisInDraft', () => {
    it('gives the same answer as parsing every draft', () => {
        // Given drafts built from markdown, entities, mentions and emoji parts, including every emoji and skin tone variant
        // When the helper, which skips parsing drafts without emoji code points, is compared with always parsing the draft
        const mismatched = drafts.filter((draft) => containsOnlyEmojisInDraft(draft) !== containsOnlyEmojis(Parser.htmlToText(Parser.replace(draft))));

        // Then the answers match, so skipping the parse never changes the composer style
        expect(mismatched).toEqual([]);
    });
});

describe('containsEmojiCodePoint', () => {
    it('is true for every draft that ALL_EMOJIS matches', () => {
        // Given the same drafts
        // When ALL_EMOJIS finds an emoji in a draft
        const missed = drafts.filter((draft) => !!draft.match(CONST.REGEX.ALL_EMOJIS) && !containsEmojiCodePoint(draft));

        // Then the cheap check is true for it too, so revertEmojisInCodeBlocks can skip the Markdown parse when it is false
        expect(missed).toEqual([]);
    });

    it('is false for plain text', () => {
        // Given typed text with markdown, links, mentions and digits, but no emoji
        const text = 'Hey @user@example.com, see *bold* `code` https://example.com #room 1 2 3';

        // When the cheap check runs on it
        // Then it is false, which is the case the composer skips the Markdown parse for
        expect(containsEmojiCodePoint(text)).toBe(false);
    });
});

describe('replaceEmojis', () => {
    it('builds the emoji trie only once a shortcode is typed', async () => {
        // Given a session where the English emoji names have not loaded yet
        // When text with an emoji in a code span is typed
        // Then it is returned unchanged, the same as before the trie moved behind the shortcode check
        expect(replaceEmojis('`😀`').text).toBe('`😀`');

        // When the names have loaded and plain text goes through the composer's emoji handling
        await importEmojiLocale('en');
        replaceEmojis('hello');
        suggestEmojis('hello');

        // Then the trie is still not built, because only shortcodes need it
        expect(emojiTrieForLocale.en).toBeUndefined();

        // When text with an emoji in a code span is typed again
        // Then the emoji is reverted to its shortcode, without building the trie
        expect(replaceEmojis('`😀`').text).toBe('`:grinning:`');
        expect(emojiTrieForLocale.en).toBeUndefined();

        // When a shortcode is typed
        // Then the trie is built and the shortcode is converted
        expect(replaceEmojis('hi :smile:').text).not.toBe('hi :smile:');
        expect(emojiTrieForLocale.en).toBeDefined();
    });
});
