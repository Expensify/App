import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import {decorateRangesWithShortMentions} from '@libs/ParsingUtils';

describe('decorateRangesWithShortMentions', () => {
    test('returns empty list for empty text', () => {
        const result = decorateRangesWithShortMentions([], '', [], []);
        expect(result).toEqual([]);
    });

    test('returns empty list when there are no relevant mentions', () => {
        const text = 'Lorem ipsum';
        const result = decorateRangesWithShortMentions([], text, [], []);
        expect(result).toEqual([]);
    });

    test('returns unchanged ranges when there are other markups than user-mentions', () => {
        const text = 'Lorem ipsum';
        const ranges: MarkdownRange[] = [
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
        ];
        const result = decorateRangesWithShortMentions(ranges, text, []);
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
        ]);
    });

    test('returns ranges with current user type changed to "mention-here" for short-mention', () => {
        const text = 'Lorem ipsum @myUser';
        const ranges: MarkdownRange[] = [
            {
                type: 'mention-short',
                start: 12,
                length: 8,
            },
        ];
        const result = decorateRangesWithShortMentions(ranges, text, [], ['@myUser']);
        expect(result).toEqual([
            {
                type: 'mention-here',
                start: 12,
                length: 8,
            },
        ]);
    });

    test('returns ranges with current user type changed to "mention-here" for full mention', () => {
        const text = 'Lorem ipsum @myUser.email.com';
        const ranges: MarkdownRange[] = [
            {
                type: 'mention-user',
                start: 12,
                length: 17,
            },
        ];
        const result = decorateRangesWithShortMentions(ranges, text, [], ['@myUser.email.com']);
        expect(result).toEqual([
            {
                type: 'mention-here',
                start: 12,
                length: 17,
            },
        ]);
    });

    test('returns ranges with correct short-mentions', () => {
        const text = 'Lorem ipsum @steven.mock';
        const ranges: MarkdownRange[] = [
            {
                type: 'mention-short',
                start: 12,
                length: 12,
            },
        ];
        const availableMentions = ['@johnDoe', '@steven.mock'];

        const result = decorateRangesWithShortMentions(ranges, text, availableMentions, []);
        expect(result).toEqual([
            {
                type: 'mention-user',
                start: 12,
                length: 12,
            },
        ]);
    });

    test('returns ranges with removed short-mentions when they do not match', () => {
        const text = 'Lorem ipsum @steven.mock';
        const ranges: MarkdownRange[] = [
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-short',
                start: 12,
                length: 12,
            },
        ];
        const availableMentions = ['@other.person'];

        const result = decorateRangesWithShortMentions(ranges, text, availableMentions, []);
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
        ]);
    });

    test('returns ranges with both types of mentions handled', () => {
        const text = 'Lorem ipsum @steven.mock @John.current @test';
        const ranges: MarkdownRange[] = [
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-short',
                start: 12,
                length: 12,
            },
            {
                type: 'mention-short',
                start: 25,
                length: 13,
            },
        ];
        const availableMentions = ['@johnDoe', '@steven.mock', '@John.current'];
        const currentUsers = ['@John.current'];

        const result = decorateRangesWithShortMentions(ranges, text, availableMentions, currentUsers);
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-user',
                start: 12,
                length: 12,
            },
            {
                type: 'mention-here',
                start: 25,
                length: 13,
            },
        ]);
    });
});
