import type {SearchQueryJSON} from '@components/Search/types';
import * as autocompleteParser from '@libs/SearchParser/autocompleteParser';
import CONST from '@src/CONST';

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
                key: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS,
                value: 'all',
                start: 20,
                length: 3,
            },
            ranges: [
                {key: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, value: 'expense', start: 5, length: 7},
                {key: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, value: 'all', start: 20, length: 3},
            ],
        },
    },
    {
        query: 'in:123456 currency:USD      ',
        expected: {
            autocomplete: {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY,
                value: 'USD',
                start: 19,
                length: 3,
            },
            ranges: [
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN, value: '123456', start: 3, length: 6},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY, value: 'USD', start: 19, length: 3},
            ],
        },
    },
    {
        query: 'tag:aa,bbb,cccc',
        expected: {
            autocomplete: {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG,
                value: 'cccc',
                start: 11,
                length: 4,
            },
            ranges: [
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: 'aa', start: 4, length: 2},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: 'bbb', start: 7, length: 3},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: 'cccc', start: 11, length: 4},
            ],
        },
    },
    {
        query: 'category:',
        expected: {
            autocomplete: {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
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
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
                value: '',
                start: 21,
                length: 0,
            },
            ranges: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, value: 'Advertising', start: 9, length: 11}],
        },
    },
    {
        query: 'in:"Big Room","small room"',
        expected: {
            autocomplete: {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN,
                value: 'small room',
                start: 14,
                length: 12,
            },
            ranges: [
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN, value: 'Big Room', start: 3, length: 10},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN, value: 'small room', start: 14, length: 12},
            ],
        },
    },
    {
        query: 'category:   Car',
        expected: {
            autocomplete: {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY,
                value: 'Car',
                start: 12,
                length: 3,
            },
            ranges: [{key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, value: 'Car', start: 12, length: 3}],
        },
    },
    {
        query: 'type:expense status:all word',
        expected: {
            autocomplete: null,
            ranges: [
                {key: CONST.SEARCH.SYNTAX_ROOT_KEYS.TYPE, value: 'expense', start: 5, length: 7},
                {key: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, value: 'all', start: 20, length: 3},
            ],
        },
    },
    {
        query: 'in:"Big Room" from:Friend category:Car,"Cell Phone" status:all expenseType:card,cash',
        expected: {
            autocomplete: {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
                value: 'cash',
                start: 80,
                length: 4,
            },
            ranges: [
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.IN, value: 'Big Room', start: 3, length: 10},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM, value: 'Friend', start: 19, length: 6},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, value: 'Car', start: 35, length: 3},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CATEGORY, value: 'Cell Phone', start: 39, length: 12},
                {key: CONST.SEARCH.SYNTAX_ROOT_KEYS.STATUS, value: 'all', start: 59, length: 3},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE, value: 'card', start: 75, length: 4},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE, value: 'cash', start: 80, length: 4},
            ],
        },
    },
    {
        query: 'currency:PLN,USD keyword taxRate:tax  merchant:"Expensify, Inc." tag:"General Overhead",IT expenseType:card,distance',
        expected: {
            autocomplete: {
                key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE,
                value: 'distance',
                start: 108,
                length: 8,
            },
            ranges: [
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY, value: 'PLN', start: 9, length: 3},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.CURRENCY, value: 'USD', start: 13, length: 3},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAX_RATE, value: 'tax', start: 33, length: 3},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: 'General Overhead', start: 69, length: 18},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.TAG, value: 'IT', start: 88, length: 2},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE, value: 'card', start: 103, length: 4},
                {key: CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPENSE_TYPE, value: 'distance', start: 108, length: 8},
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
