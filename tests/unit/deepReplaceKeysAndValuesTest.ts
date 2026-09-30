/* eslint-disable @typescript-eslint/naming-convention */
import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';

describe('deepReplaceKeysAndValues', () => {
    test('returns undefined for absent request data', () => {
        expect(deepReplaceKeysAndValues(undefined, 'oldVal', 'newVal')).toBeUndefined();
    });

    test.each([
        [{value: null}, {value: null}],
        [{value: 3}, {value: 3}],
        [{value: true}, {value: true}],
        [{value: 'someString'}, {value: 'someString'}],
        [{value: 'oldVal'}, {value: 'newVal'}],
        [{value: 'prefix_oldVal'}, {value: 'prefix_newVal'}],
        [{value: ['a', 'b', 'oldVal']}, {value: ['a', 'b', 'newVal']}],
        [{value: ['a', 'oldVal', 'c']}, {value: ['a', 'newVal', 'c']}],
        [{value: ['a', 'b', 'prefix_oldVal']}, {value: ['a', 'b', 'prefix_newVal']}],
        [
            {
                a: '1',
                b: 2,
                c: 'oldVal',
            },
            {
                a: '1',
                b: 2,
                c: 'newVal',
            },
        ],
        [
            {
                a: '1',
                b: 2,
                c: 'prefix_oldVal',
            },
            {
                a: '1',
                b: 2,
                c: 'prefix_newVal',
            },
        ],
        [
            {
                a: '1',
                b: ['a', 'oldVal'],
            },
            {
                a: '1',
                b: ['a', 'newVal'],
            },
        ],
        [
            {
                a: '1',
                b: ['a', 'prefix_oldVal'],
            },
            {
                a: '1',
                b: ['a', 'prefix_newVal'],
            },
        ],
        [
            {
                a: {
                    a: 1,
                    b: 'oldVal',
                },
                b: 2,
            },
            {
                a: {
                    a: 1,
                    b: 'newVal',
                },
                b: 2,
            },
        ],
        [
            {
                a: {
                    a: 1,
                    b: 'prefix_oldVal',
                    c: null,
                },
                b: 2,
                c: null,
            },
            {
                a: {
                    a: 1,
                    b: 'prefix_newVal',
                    c: null,
                },
                b: 2,
                c: null,
            },
        ],
        [
            {
                oldVal: 1,
                someOtherKey: 2,
            },
            {
                newVal: 1,
                someOtherKey: 2,
            },
        ],
        [
            {
                prefix_oldVal: 1,
                someOtherKey: 2,
            },
            {
                prefix_newVal: 1,
                someOtherKey: 2,
            },
        ],
    ])('transforms request-data record %#', (input: Record<string, unknown>, expected: Record<string, unknown>) => {
        expect(deepReplaceKeysAndValues(input, 'oldVal', 'newVal')).toStrictEqual(expected);
    });

    test('preserves a File property', () => {
        const file = new File(['content'], 'test.txt');

        expect(deepReplaceKeysAndValues({value: file}, 'oldVal', 'newVal')).toStrictEqual({value: file});
    });

    test('preserves a Blob property', () => {
        const blob = new Blob(['content']);

        expect(deepReplaceKeysAndValues({value: blob}, 'oldVal', 'newVal')).toStrictEqual({value: blob});
    });
});
