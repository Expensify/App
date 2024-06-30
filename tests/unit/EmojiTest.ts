import {getUnixTime} from 'date-fns';
import Onyx from 'react-native-onyx';
import Emojis, {importEmojiLocale} from '@assets/emojis';
import type {Emoji} from '@assets/emojis/types';
import * as User from '@libs/actions/User';
import {buildEmojisTrie} from '@libs/EmojiTrie';
import * as EmojiUtils from '@libs/EmojiUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FrequentlyUsedEmoji} from '@src/types/onyx';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

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
        const thumbEmojis: Emoji[] = [
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

        expect(EmojiUtils.suggestEmojis(':thumb', 'en')).toEqual(thumbEmojis);

        expect(EmojiUtils.suggestEmojis(':thumb', 'es')).toEqual(thumbEmojis);

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
        ]);
    });

    describe('update frequently used emojis', () => {
        let spy: jest.SpyInstance;

        beforeAll(() => {
            Onyx.init({keys: ONYXKEYS});
            global.fetch = TestHelper.getGlobalFetchMock();
            spy = jest.spyOn(User, 'updateFrequentlyUsedEmojis');
        });

        beforeEach(() => {
            spy.mockClear();
            return Onyx.clear();
        });

        it('should put a less frequent and recent used emoji behind', () => {
            // Given an existing frequently used emojis list with count > 1
            const frequentlyEmojisList: FrequentlyUsedEmoji[] = [
                {
                    code: '👋',
                    name: 'wave',
                    count: 2,
                    lastUpdatedAt: 4,
                    types: ['👋🏿', '👋🏾', '👋🏽', '👋🏼', '👋🏻'],
                },
                {
                    code: '💤',
                    name: 'zzz',
                    count: 2,
                    lastUpdatedAt: 3,
                },
                {
                    code: '💯',
                    name: '100',
                    count: 2,
                    lastUpdatedAt: 2,
                },
                {
                    code: '👿',
                    name: 'imp',
                    count: 2,
                    lastUpdatedAt: 1,
                },
            ];
            Onyx.merge(ONYXKEYS.FREQUENTLY_USED_EMOJIS, frequentlyEmojisList);

            return waitForBatchedUpdates().then(() => {
                // When add a new emoji
                const currentTime = getUnixTime(new Date());
                const smileEmoji: Emoji = {code: '😄', name: 'smile'};
                const newEmoji = [smileEmoji];
                User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(newEmoji));

                // Then the new emoji should be at the last item of the list
                const expectedSmileEmoji: FrequentlyUsedEmoji = {...smileEmoji, count: 1, lastUpdatedAt: currentTime};

                const expectedFrequentlyEmojisList = [...frequentlyEmojisList, expectedSmileEmoji];
                expect(spy).toBeCalledWith(expectedFrequentlyEmojisList);
            });
        });

        it('should put more frequent and recent used emoji to the front', () => {
            // Given an existing frequently used emojis list
            const smileEmoji: Emoji = {code: '😄', name: 'smile'};
            const frequentlyEmojisList: FrequentlyUsedEmoji[] = [
                {
                    code: '😠',
                    name: 'angry',
                    count: 3,
                    lastUpdatedAt: 5,
                },
                {
                    code: '👋',
                    name: 'wave',
                    count: 2,
                    lastUpdatedAt: 4,
                    types: ['👋🏿', '👋🏾', '👋🏽', '👋🏼', '👋🏻'],
                },
                {
                    code: '💤',
                    name: 'zzz',
                    count: 2,
                    lastUpdatedAt: 3,
                },
                {
                    code: '💯',
                    name: '100',
                    count: 1,
                    lastUpdatedAt: 2,
                },
                {...smileEmoji, count: 1, lastUpdatedAt: 1},
            ];
            Onyx.merge(ONYXKEYS.FREQUENTLY_USED_EMOJIS, frequentlyEmojisList);

            return waitForBatchedUpdates().then(() => {
                // When add an emoji that exists in the list
                const currentTime = getUnixTime(new Date());
                const newEmoji = [smileEmoji];
                User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(newEmoji));

                // Then the count should be increased and put into the very front of the other emoji within the same count
                const expectedFrequentlyEmojisList = [frequentlyEmojisList[0], {...smileEmoji, count: 2, lastUpdatedAt: currentTime}, ...frequentlyEmojisList.slice(1, -1)];
                expect(spy).toBeCalledWith(expectedFrequentlyEmojisList);
            });
        });

        it('should sorted descending by count and lastUpdatedAt for multiple emoji added', () => {
            // Given an existing frequently used emojis list
            const smileEmoji: Emoji = {code: '😄', name: 'smile'};
            const zzzEmoji: Emoji = {code: '💤', name: 'zzz'};
            const impEmoji: Emoji = {code: '👿', name: 'imp'};
            const frequentlyEmojisList: FrequentlyUsedEmoji[] = [
                {
                    code: '😠',
                    name: 'angry',
                    count: 3,
                    lastUpdatedAt: 5,
                },
                {
                    code: '👋',
                    name: 'wave',
                    count: 2,
                    lastUpdatedAt: 4,
                    types: ['👋🏿', '👋🏾', '👋🏽', '👋🏼', '👋🏻'],
                },
                {...zzzEmoji, count: 2, lastUpdatedAt: 3},
                {
                    code: '💯',
                    name: '100',
                    count: 1,
                    lastUpdatedAt: 2,
                },
                {...smileEmoji, count: 1, lastUpdatedAt: 1},
            ];
            Onyx.merge(ONYXKEYS.FREQUENTLY_USED_EMOJIS, frequentlyEmojisList);

            return waitForBatchedUpdates().then(() => {
                // When add multiple emojis that either exist or not exist in the list
                const currentTime = getUnixTime(new Date());
                const newEmoji = [smileEmoji, zzzEmoji, impEmoji];
                User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(newEmoji));

                // Then the count should be increased for existing emoji and sorted descending by count and lastUpdatedAt
                const expectedFrequentlyEmojisList = [
                    {...zzzEmoji, count: 3, lastUpdatedAt: currentTime},
                    frequentlyEmojisList[0],
                    {...smileEmoji, count: 2, lastUpdatedAt: currentTime},
                    frequentlyEmojisList[1],
                    {...impEmoji, count: 1, lastUpdatedAt: currentTime},
                    frequentlyEmojisList[3],
                ];
                expect(spy).toBeCalledWith(expectedFrequentlyEmojisList);
            });
        });

        it('make sure the most recent new emoji is added to the list even it is full with count > 1', () => {
            // Given an existing full (24 items) frequently used emojis list
            const smileEmoji: Emoji = {code: '😄', name: 'smile'};
            const zzzEmoji: Emoji = {code: '💤', name: 'zzz'};
            const impEmoji: Emoji = {code: '👿', name: 'imp'};
            const bookEmoji: Emoji = {code: '📚', name: 'books'};
            const frequentlyEmojisList: FrequentlyUsedEmoji[] = [
                {
                    code: '😠',
                    name: 'angry',
                    count: 3,
                    lastUpdatedAt: 24,
                },
                {
                    code: '👋',
                    name: 'wave',
                    count: 3,
                    lastUpdatedAt: 23,
                    types: ['👋🏿', '👋🏾', '👋🏽', '👋🏼', '👋🏻'],
                },
                {
                    code: '😡',
                    name: 'rage',
                    count: 3,
                    lastUpdatedAt: 22,
                },
                {
                    code: '😤',
                    name: 'triumph',
                    count: 3,
                    lastUpdatedAt: 21,
                },
                {
                    code: '🥱',
                    name: 'yawning_face',
                    count: 3,
                    lastUpdatedAt: 20,
                },
                {
                    code: '😫',
                    name: 'tired_face',
                    count: 3,
                    lastUpdatedAt: 19,
                },
                {
                    code: '😩',
                    name: 'weary',
                    count: 3,
                    lastUpdatedAt: 18,
                },
                {
                    code: '😓',
                    name: 'sweat',
                    count: 3,
                    lastUpdatedAt: 17,
                },
                {
                    code: '😞',
                    name: 'disappointed',
                    count: 3,
                    lastUpdatedAt: 16,
                },
                {
                    code: '😣',
                    name: 'persevere',
                    count: 3,
                    lastUpdatedAt: 15,
                },
                {
                    code: '😖',
                    name: 'confounded',
                    count: 3,
                    lastUpdatedAt: 14,
                },
                {
                    code: '👶',
                    name: 'baby',
                    count: 3,
                    lastUpdatedAt: 13,
                    types: ['👶🏿', '👶🏾', '👶🏽', '👶🏼', '👶🏻'],
                },
                {
                    code: '👄',
                    name: 'lips',
                    count: 3,
                    lastUpdatedAt: 12,
                },
                {
                    code: '🐶',
                    name: 'dog',
                    count: 3,
                    lastUpdatedAt: 11,
                },
                {
                    code: '🦮',
                    name: 'guide_dog',
                    count: 3,
                    lastUpdatedAt: 10,
                },
                {
                    code: '🐱',
                    name: 'cat',
                    count: 3,
                    lastUpdatedAt: 9,
                },
                {
                    code: '🐈‍⬛',
                    name: 'black_cat',
                    count: 3,
                    lastUpdatedAt: 8,
                },
                {
                    code: '🕞',
                    name: 'clock330',
                    count: 3,
                    lastUpdatedAt: 7,
                },
                {
                    code: '🥎',
                    name: 'softball',
                    count: 3,
                    lastUpdatedAt: 6,
                },
                {
                    code: '🏀',
                    name: 'basketball',
                    count: 3,
                    lastUpdatedAt: 5,
                },
                {
                    code: '📟',
                    name: 'pager',
                    count: 3,
                    lastUpdatedAt: 4,
                },
                {
                    code: '🎬',
                    name: 'clapper',
                    count: 3,
                    lastUpdatedAt: 3,
                },
                {
                    code: '📺',
                    name: 'tv',
                    count: 3,
                    lastUpdatedAt: 2,
                },
                {...bookEmoji, count: 3, lastUpdatedAt: 1},
            ];
            expect(frequentlyEmojisList.length).toBe(CONST.EMOJI_FREQUENT_ROW_COUNT * CONST.EMOJI_NUM_PER_ROW);
            Onyx.merge(ONYXKEYS.FREQUENTLY_USED_EMOJIS, frequentlyEmojisList);

            return waitForBatchedUpdates().then(() => {
                // When add new emojis
                const currentTime = getUnixTime(new Date());
                const newEmoji = [bookEmoji, smileEmoji, zzzEmoji, impEmoji, smileEmoji];
                User.updateFrequentlyUsedEmojis(EmojiUtils.getFrequentlyUsedEmojis(newEmoji));

                // Then the last emojis from the list should be replaced with the most recent new emoji (smile)
                const expectedFrequentlyEmojisList = [
                    {...bookEmoji, count: 4, lastUpdatedAt: currentTime},
                    ...frequentlyEmojisList.slice(0, -2),
                    {...smileEmoji, count: 1, lastUpdatedAt: currentTime},
                ];
                expect(spy).toBeCalledWith(expectedFrequentlyEmojisList);
            });
        });
    });
});
