/* eslint-disable @typescript-eslint/naming-convention */
import {cleanAndTransformState, transformNumericKeysToArray} from '@components/ImportOnyxState/utils';
import ONYXKEYS from '@src/ONYXKEYS';

describe('transformNumericKeysToArray', () => {
    it('converts object with numeric keys to array', () => {
        const input = {'0': 'a', '1': 'b', '2': 'c'};
        expect(transformNumericKeysToArray(input)).toEqual(['a', 'b', 'c']);
    });

    it('handles nested numeric objects', () => {
        const input = {
            '0': {'0': 'a', '1': 'b'},
            '1': {'0': 'c', '1': 'd'},
        };
        expect(transformNumericKeysToArray(input)).toEqual([
            ['a', 'b'],
            ['c', 'd'],
        ]);
    });

    it('preserves non-numeric keys', () => {
        const input = {foo: 'bar', baz: {'0': 'qux'}};
        expect(transformNumericKeysToArray(input)).toEqual({foo: 'bar', baz: ['qux']});
    });

    it('handles empty objects', () => {
        expect(transformNumericKeysToArray({})).toEqual({});
    });

    it('handles non-sequential numeric keys', () => {
        const input = {'0': 'a', '2': 'b', '5': 'c'};
        expect(transformNumericKeysToArray(input)).toEqual({'0': 'a', '2': 'b', '5': 'c'});
    });
});

describe('cleanAndTransformState', () => {
    it('removes omitted keys and transforms numeric objects', () => {
        const input = JSON.stringify({
            [ONYXKEYS.NETWORK]: 'should be removed',
            someKey: {'0': 'a', '1': 'b'},
            otherKey: 'value',
        });

        expect(cleanAndTransformState(input)).toEqual({
            someKey: ['a', 'b'],
            otherKey: 'value',
        });
    });

    it('handles empty state', () => {
        expect(cleanAndTransformState('{}')).toEqual({});
    });

    it('removes keys that start with omitted keys', () => {
        const input = JSON.stringify({
            [`${ONYXKEYS.NETWORK}_something`]: 'should be removed',
            validKey: 'keep this',
        });

        expect(cleanAndTransformState(input)).toEqual({
            validKey: 'keep this',
        });
    });

    it('throws on invalid JSON', () => {
        expect(() => cleanAndTransformState('invalid json')).toThrow();
    });

    it('removes all specified ONYXKEYS', () => {
        const input = JSON.stringify({
            [ONYXKEYS.ACTIVE_CLIENTS]: 'remove1',
            [ONYXKEYS.FREQUENTLY_USED_EMOJIS]: 'remove2',
            [ONYXKEYS.NETWORK]: 'remove3',
            [ONYXKEYS.CREDENTIALS]: 'remove4',
            [ONYXKEYS.PREFERRED_THEME]: 'remove5',
            keepThis: 'value',
        });

        const result = cleanAndTransformState(input);

        expect(result).toEqual({
            keepThis: 'value',
        });

        // Verify each key is removed
        expect(result).not.toHaveProperty(ONYXKEYS.ACTIVE_CLIENTS);
        expect(result).not.toHaveProperty(ONYXKEYS.FREQUENTLY_USED_EMOJIS);
        expect(result).not.toHaveProperty(ONYXKEYS.NETWORK);
        expect(result).not.toHaveProperty(ONYXKEYS.CREDENTIALS);
        expect(result).not.toHaveProperty(ONYXKEYS.PREFERRED_THEME);
    });
});
