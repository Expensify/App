import {processFrequentlyUsedEmojis} from '@libs/EmojiUtils';
import type {FrequentlyUsedEmoji} from '@src/types/onyx';

// Mock the Emojis module
jest.mock('@assets/emojis', () => ({
    emojiCodeTableWithSkinTones: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '😀': {
            code: '😀',
            name: 'grinning_face',
            keywords: ['face', 'grin', 'grinning'],
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '😃': {
            code: '😃',
            name: 'grinning_face_with_big_eyes',
            keywords: ['face', 'grin', 'grinning'],
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '😄': {
            code: '😄',
            name: 'grinning_face_with_smiling_eyes',
            keywords: ['face', 'grin', 'grinning'],
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '👋': {
            code: '👋',
            name: 'waving_hand',
            keywords: ['hand', 'wave', 'waving'],
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        '👍': {
            code: '👍',
            name: 'thumbs_up',
            keywords: ['hand', 'thumb', 'up'],
        },
    },
    emojiNameTable: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        grinning_face: {
            code: '😀',
            name: 'grinning_face',
            keywords: ['face', 'grin', 'grinning'],
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        waving_hand: {
            code: '👋',
            name: 'waving_hand',
            keywords: ['hand', 'wave', 'waving'],
        },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        thumbs_up: {
            code: '👍',
            name: 'thumbs_up',
            keywords: ['hand', 'thumb', 'up'],
        },
    },
}));

describe('processFrequentlyUsedEmojis', () => {
    it('should return empty array when input is undefined', () => {
        const result = processFrequentlyUsedEmojis(undefined);
        expect(result).toEqual([]);
    });

    it('should return empty array when input is empty array', () => {
        const result = processFrequentlyUsedEmojis([]);
        expect(result).toEqual([]);
    });

    it('should process valid emoji list correctly', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '😀',
                name: 'grinning_face',
                count: 5,
                lastUpdatedAt: 1000,
            },
            {
                code: '👋',
                name: 'waving_hand',
                count: 3,
                lastUpdatedAt: 2000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(2);
        expect(result.at(0)).toEqual({
            code: '😀',
            name: 'grinning_face',
            keywords: ['face', 'grin', 'grinning'],
            count: 5,
            lastUpdatedAt: 1000,
        });
        expect(result.at(1)).toEqual({
            code: '👋',
            name: 'waving_hand',
            keywords: ['hand', 'wave', 'waving'],
            count: 3,
            lastUpdatedAt: 2000,
        });
    });

    it('should fill in missing code using name lookup', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '',
                name: 'grinning_face',
                count: 5,
                lastUpdatedAt: 1000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(1);
        expect(result.at(0)).toEqual({
            code: '😀',
            name: 'grinning_face',
            keywords: ['face', 'grin', 'grinning'],
            count: 5,
            lastUpdatedAt: 1000,
        });
    });

    it('should fill in missing name using code lookup', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '👋',
                name: '',
                count: 3,
                lastUpdatedAt: 2000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(1);
        expect(result.at(0)).toEqual({
            code: '👋',
            name: 'waving_hand',
            keywords: ['hand', 'wave', 'waving'],
            count: 3,
            lastUpdatedAt: 2000,
        });
    });

    it('should filter out emojis that do not exist in emojiCodeTableWithSkinTones', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '😀',
                name: 'grinning_face',
                count: 5,
                lastUpdatedAt: 1000,
            },
            {
                code: 'invalid_emoji',
                name: 'invalid_emoji',
                count: 3,
                lastUpdatedAt: 2000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(1);
        expect(result.at(0)?.code).toBe('😀');
    });

    it('should merge duplicate emojis and sum their counts', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '😀',
                name: 'grinning_face',
                count: 5,
                lastUpdatedAt: 1000,
            },
            {
                code: '😀',
                name: 'grinning_face',
                count: 3,
                lastUpdatedAt: 2000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(1);
        expect(result.at(0)).toEqual({
            code: '😀',
            name: 'grinning_face',
            keywords: ['face', 'grin', 'grinning'],
            count: 8,
            lastUpdatedAt: 2000,
        });
    });

    it('should sort by count in descending order', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '😀',
                name: 'grinning_face',
                count: 3,
                lastUpdatedAt: 1000,
            },
            {
                code: '👋',
                name: 'waving_hand',
                count: 5,
                lastUpdatedAt: 2000,
            },
            {
                code: '👍',
                name: 'thumbs_up',
                count: 1,
                lastUpdatedAt: 3000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(3);
        expect(result.at(0)?.code).toBe('👋');
        expect(result.at(1)?.code).toBe('😀');
        expect(result.at(2)?.code).toBe('👍');
    });

    it('should sort by lastUpdatedAt in descending order when counts are equal', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '😀',
                name: 'grinning_face',
                count: 5,
                lastUpdatedAt: 1000,
            },
            {
                code: '👋',
                name: 'waving_hand',
                count: 5,
                lastUpdatedAt: 3000,
            },
            {
                code: '👍',
                name: 'thumbs_up',
                count: 5,
                lastUpdatedAt: 2000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(3);
        expect(result.at(0)?.code).toBe('👋');
        expect(result.at(1)?.code).toBe('👍');
        expect(result.at(2)?.code).toBe('😀');
    });

    it('should handle complex scenario with mixed data quality', () => {
        const input: FrequentlyUsedEmoji[] = [
            {
                code: '😀',
                name: 'grinning_face',
                count: 5,
                lastUpdatedAt: 1000,
            },
            {
                code: '',
                name: 'waving_hand',
                count: 3,
                lastUpdatedAt: 2000,
            },
            {
                code: '👍',
                name: '',
                count: 7,
                lastUpdatedAt: 3000,
            },
            {
                code: '😀',
                name: 'grinning_face',
                count: 2,
                lastUpdatedAt: 1500,
            },
            {
                code: 'invalid_emoji',
                name: 'invalid_emoji',
                count: 1,
                lastUpdatedAt: 4000,
            },
        ];

        const result = processFrequentlyUsedEmojis(input);

        expect(result).toHaveLength(3);

        expect(result.at(0)?.code).toBe('👍');
        expect(result.at(1)?.code).toBe('😀');
        expect(result.at(2)?.code).toBe('👋');
        expect(result.at(1)?.count).toBe(7);
        expect(result.at(1)?.lastUpdatedAt).toBe(1500);
    });
});
