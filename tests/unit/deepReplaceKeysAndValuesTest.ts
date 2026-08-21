/* eslint-disable @typescript-eslint/naming-convention */
import deepReplaceKeysAndValues from '@libs/deepReplaceKeysAndValues';
import type {ReplaceableValue} from '@libs/deepReplaceKeysAndValues';

describe('deepReplaceKeysAndValues', () => {
    test.each([
        [undefined, undefined],
        [null, null],
        [3, 3],
        [true, true],
        ['someString', 'someString'],
        ['oldVal', 'newVal'],
        ['prefix_oldVal', 'prefix_newVal'],
        [
            ['a', 'b', 'oldVal'],
            ['a', 'b', 'newVal'],
        ],
        [
            ['a', 'oldVal', 'c'],
            ['a', 'newVal', 'c'],
        ],
        [
            ['a', 'b', 'prefix_oldVal'],
            ['a', 'b', 'prefix_newVal'],
        ],
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
    ])('transforms scenario value %s through the request-data record boundary', (input: ReplaceableValue, expected: ReplaceableValue) => {
        expect(
            input === undefined || (typeof input === 'object' && input !== null && !Array.isArray(input))
                ? deepReplaceKeysAndValues(input, 'oldVal', 'newVal')
                : deepReplaceKeysAndValues({value: input}, 'oldVal', 'newVal'),
        ).toStrictEqual(expected === undefined || (typeof expected === 'object' && expected !== null && !Array.isArray(expected)) ? expected : {value: expected});
    });
});
