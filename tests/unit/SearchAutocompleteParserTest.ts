import type {SearchQueryJSON} from '@components/Search/types';
import * as autocompleteParser from '@libs/SearchParser/autocompleteParser';

const tests = [
    {
        query: 'date>2024-01-01 amount>100 merchant:"A B" description:A,B,C ,, reportID:123456789 word',
        expected: {
            autocomplete: null,
            ranges: [],
        },
    },
    {
        query: ',',
        expected: {
            autocomplete: null,
            ranges: [],
        },
    },
    {
        query: 'tag:,,',
        expected: {
            autocomplete: null,
            ranges: [],
        },
    },
    {
        query: 'type:expense status:all',
        expected: {
            autocomplete: {
                key: 'status',
                value: 'all',
                start: 20,
                length: 3,
            },
            ranges: [
                {key: 'type', value: 'expense', start: 5, length: 7},
                {key: 'status', value: 'all', start: 20, length: 3},
            ],
        },
    },
    {
        query: 'in:123456 currency:USD      ',
        expected: {
            autocomplete: {
                key: 'currency',
                value: 'USD',
                start: 19,
                length: 3,
            },
            ranges: [
                {key: 'in', value: '123456', start: 3, length: 6},
                {key: 'currency', value: 'USD', start: 19, length: 3},
            ],
        },
    },
    {
        query: 'tag:aa,bbb,cccc',
        expected: {
            autocomplete: {
                key: 'tag',
                value: 'cccc',
                start: 11,
                length: 4,
            },
            ranges: [
                {key: 'tag', value: 'aa', start: 4, length: 2},
                {key: 'tag', value: 'bbb', start: 7, length: 3},
                {key: 'tag', value: 'cccc', start: 11, length: 4},
            ],
        },
    },
    {
        query: 'category:',
        expected: {
            autocomplete: {
                key: 'category',
                value: '',
                start: 9,
                length: 0,
            },
            ranges: [],
        },
    },
    {
        query: 'category:Advertising,',
        expected: {
            autocomplete: {
                key: 'category',
                value: '',
                start: 21,
                length: 0,
            },
            ranges: [{key: 'category', value: 'Advertising', start: 9, length: 11}],
        },
    },
    {
        query: 'in:"Big Room","small room"',
        expected: {
            autocomplete: {
                key: 'in',
                value: 'small room',
                start: 14,
                length: 12,
            },
            ranges: [
                {key: 'in', value: 'Big Room', start: 3, length: 10},
                {key: 'in', value: 'small room', start: 14, length: 12},
            ],
        },
    },
    {
        query: 'category:   Car',
        expected: {
            autocomplete: {
                key: 'category',
                value: 'Car',
                start: 12,
                length: 3,
            },
            ranges: [{key: 'category', value: 'Car', start: 12, length: 3}],
        },
    },
    {
        query: 'type:expense status:all word',
        expected: {
            autocomplete: null,
            ranges: [
                {key: 'type', value: 'expense', start: 5, length: 7},
                {key: 'status', value: 'all', start: 20, length: 3},
            ],
        },
    },
    {
        query: 'in:"Big Room" from:Friend category:Car,"Cell Phone" status:all expenseType:card,cash',
        expected: {
            autocomplete: {
                key: 'expenseType',
                value: 'cash',
                start: 80,
                length: 4,
            },
            ranges: [
                {key: 'in', value: 'Big Room', start: 3, length: 10},
                {key: 'from', value: 'Friend', start: 19, length: 6},
                {key: 'category', value: 'Car', start: 35, length: 3},
                {key: 'category', value: 'Cell Phone', start: 39, length: 12},
                {key: 'status', value: 'all', start: 59, length: 3},
                {key: 'expenseType', value: 'card', start: 75, length: 4},
                {key: 'expenseType', value: 'cash', start: 80, length: 4},
            ],
        },
    },
    {
        query: 'currency:PLN,USD keyword taxRate:tax  merchant:"Expensify, Inc." tag:"General Overhead",IT expenseType:card,distance',
        expected: {
            autocomplete: {
                key: 'expenseType',
                value: 'distance',
                start: 108,
                length: 8,
            },
            ranges: [
                {key: 'currency', value: 'PLN', start: 9, length: 3},
                {key: 'currency', value: 'USD', start: 13, length: 3},
                {key: 'taxRate', value: 'tax', start: 33, length: 3},
                {key: 'tag', value: 'General Overhead', start: 69, length: 18},
                {key: 'tag', value: 'IT', start: 88, length: 2},
                {key: 'expenseType', value: 'card', start: 103, length: 4},
                {key: 'expenseType', value: 'distance', start: 108, length: 8},
            ],
        },
    },
];

describe('autocomplete parser', () => {
    test.each(tests)(`parsing: $query`, ({query, expected}) => {
        const result = autocompleteParser.parse(query) as SearchQueryJSON;

        expect(result).toEqual(expected);
    });
});
