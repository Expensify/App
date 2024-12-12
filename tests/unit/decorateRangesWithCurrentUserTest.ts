import type {MarkdownRange} from '@expensify/react-native-live-markdown';
import {decorateRangesWithCurrentUser} from '@components/RNMarkdownTextInput';

describe('decorateRangesWithCurrentUser', () => {
    test('returns empty list for empty text', () => {
        const result = decorateRangesWithCurrentUser([], '', '');
        expect(result).toEqual([]);
    });

    test('returns empty list when there are no mentions', () => {
        const text = 'Lorem ipsum';
        const result = decorateRangesWithCurrentUser([], text, '');
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
        const result = decorateRangesWithCurrentUser(ranges, text, '');
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
        ]);
    });

    test('returns ranges with current user type changed to "mention-here"', () => {
        const text = 'Lorem ipsum @myUser';
        const ranges: MarkdownRange[] = [
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-user',
                start: 12,
                length: 8,
            },
        ];
        const result = decorateRangesWithCurrentUser(ranges, text, 'myUser');
        expect(result).toEqual([
            {
                type: 'bold',
                start: 5,
                length: 3,
            },
            {
                type: 'mention-here',
                start: 12,
                length: 8,
            },
        ]);
    });
});
