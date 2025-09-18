import type {SearchQueryJSON} from '@components/Search/types';
import {parse} from '@libs/SearchParser/autocompleteParser';
import parserCommonTests from '../utils/fixtures/searchParsersCommonQueries';

const tests = [
    {
        query: parserCommonTests.simple,
        expected: {
            autocomplete: {key: 'type', value: 'expense', start: 5, length: 7},
            ranges: [{key: 'type', value: 'expense', start: 5, length: 7}],
        },
    },
    {
        query: parserCommonTests.userFriendlyNames,
        expected: {
            autocomplete: null,
            ranges: [
                {key: 'taxRate', value: 'rate1', start: 9, length: 5},
                {key: 'expenseType', value: 'card', start: 28, length: 4},
                {key: 'cardID', value: 'Big Bank', start: 38, length: 10},
            ],
        },
    },
    {
        query: parserCommonTests.oldNames,
        expected: {
            autocomplete: null,
            ranges: [
                {key: 'taxRate', value: 'rate1', start: 8, length: 5},
                {key: 'expenseType', value: 'card', start: 26, length: 4},
                {key: 'cardID', value: 'Big Bank', start: 38, length: 10},
            ],
        },
    },
    {
        query: parserCommonTests.complex,
        expected: {
            autocomplete: {
                key: 'category',
                length: 22,
                start: 102,
                value: 'meal & entertainment',
            },
            ranges: [
                {key: 'expenseType', length: 4, start: 24, value: 'cash'},
                {key: 'expenseType', length: 4, start: 29, value: 'card'},
                {key: 'date', length: 10, start: 69, value: '2024-06-01'},
                {key: 'category', length: 6, start: 89, value: 'travel'},
                {key: 'category', length: 5, start: 96, value: 'hotel'},
                {key: 'category', length: 22, start: 102, value: 'meal & entertainment'},
            ],
        },
    },
    {
        query: parserCommonTests.quotesIOS,
        expected: {
            autocomplete: {
                key: 'category',
                length: 5,
                start: 22,
                value: 'a b',
            },
            ranges: [
                {key: 'type', value: 'expense', start: 5, length: 7},
                {key: 'category', value: 'a b', start: 22, length: 5},
            ],
        },
    },
    {
        query: 'date>2024-01-01 amount>100 merchant:"A B" description:A,B,C ,, report-id:123456789 word',
        expected: {
            autocomplete: null,
            ranges: [{key: 'date', length: 10, start: 5, value: '2024-01-01'}],
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
        query: 'type:expense word',
        expected: {
            autocomplete: null,
            ranges: [{key: 'type', value: 'expense', start: 5, length: 7}],
        },
    },
    {
        query: 'in:"Big Room" from:Friend category:Car,"Cell Phone" expense-type:card,cash',
        expected: {
            autocomplete: {
                key: 'expenseType',
                value: 'cash',
                start: 70,
                length: 4,
            },
            ranges: [
                {key: 'in', value: 'Big Room', start: 3, length: 10},
                {key: 'from', value: 'Friend', start: 19, length: 6},
                {key: 'category', value: 'Car', start: 35, length: 3},
                {key: 'category', value: 'Cell Phone', start: 39, length: 12},
                {key: 'expenseType', value: 'card', start: 65, length: 4},
                {key: 'expenseType', value: 'cash', start: 70, length: 4},
            ],
        },
    },
    {
        query: 'currency:PLN,USD keyword tax-rate:tax  merchant:"Expensify, Inc." tag:"General Overhead",IT expense-type:card,distance',
        expected: {
            autocomplete: {
                key: 'expenseType',
                value: 'distance',
                start: 110,
                length: 8,
            },
            ranges: [
                {key: 'currency', value: 'PLN', start: 9, length: 3},
                {key: 'currency', value: 'USD', start: 13, length: 3},
                {key: 'taxRate', value: 'tax', start: 34, length: 3},
                {key: 'tag', value: 'General Overhead', start: 70, length: 18},
                {key: 'tag', value: 'IT', start: 89, length: 2},
                {key: 'expenseType', value: 'card', start: 105, length: 4},
                {key: 'expenseType', value: 'distance', start: 110, length: 8},
            ],
        },
    },
    {
        query: 'from:""Big Dog","Little Dog"" to:""Mad" Dog"',
        expected: {
            autocomplete: {
                key: 'to',
                value: '"Mad" Dog',
                start: 33,
                length: 11,
            },
            ranges: [
                {key: 'from', value: '"Big Dog', start: 5, length: 10},
                {key: 'from', value: 'Little Dog"', start: 16, length: 13},
                {key: 'to', value: '"Mad" Dog', start: 33, length: 11},
            ],
        },
    },
    {
        query: 'from:““Rag” Dog”,"Bag ”Dog“" to:"""Unruly"" “““Glad””” """Dog"""',
        expected: {
            autocomplete: {
                key: 'to',
                value: '""Unruly"" “““Glad””” """Dog""',
                start: 32,
                length: 32,
            },
            ranges: [
                {key: 'from', value: '“Rag” Dog', start: 5, length: 11},
                {key: 'from', value: 'Bag ”Dog“', start: 17, length: 11},
                {key: 'to', value: '""Unruly"" “““Glad””” """Dog""', start: 32, length: 32},
            ],
        },
    },
    {
        query: 'expense-type:per-diem',
        expected: {
            autocomplete: {
                key: 'expenseType',
                value: 'per-diem',
                start: 13,
                length: 8,
            },
            ranges: [{key: 'expenseType', value: 'per-diem', start: 13, length: 8}],
        },
    },
];

const nameFieldContinuationTests = [
    {
        query: 'to:John Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
        },
        description: 'Basic partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'from:Jane Do',
        expected: {
            autocomplete: null,
            ranges: [{key: 'from', value: 'Jane', start: 5, length: 4}],
        },
        description: 'From field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'assignee:Bob Mar',
        expected: {
            autocomplete: null,
            ranges: [{key: 'assignee', value: 'Bob', start: 9, length: 3}],
        },
        description: 'Assignee field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'payer:Alice Wind',
        expected: {
            autocomplete: null,
            ranges: [{key: 'payer', value: 'Alice', start: 6, length: 5}],
        },
        description: 'Payer field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'exporter:Charlie Bro',
        expected: {
            autocomplete: null,
            ranges: [{key: 'exporter', value: 'Charlie', start: 9, length: 7}],
        },
        description: 'Exporter field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'to:John Smith Doe',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
        },
        description: 'Multiple word continuation - parser should only parse first token, rest is free text',
    },
    {
        query: 'from:Mary Jane Wat',
        expected: {
            autocomplete: null,
            ranges: [{key: 'from', value: 'Mary', start: 5, length: 4}],
        },
        description: 'Multiple word continuation with partial last name - parser should only parse first token',
    },
    {
        query: 'to:John  Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
        },
        description: 'Multiple spaces before continuation text',
    },
    {
        query: 'to:John\tSmi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
        },
        description: 'Tab character before continuation text',
    },
    {
        query: 'category:Travel Exp',
        expected: {
            autocomplete: null,
            ranges: [{key: 'category', value: 'Travel', start: 9, length: 6}],
        },
        description: 'Non-name field with space - parser treats space as separator, continuation logic applies in UI',
    },
    {
        query: 'tag:Office Sup',
        expected: {
            autocomplete: null,
            ranges: [{key: 'tag', value: 'Office', start: 4, length: 6}],
        },
        description: 'Tag field with space - parser treats space as separator, continuation logic applies in UI',
    },
    {
        query: 'type:expense to:John Smi amount>100',
        expected: {
            autocomplete: null,
            ranges: [
                {key: 'type', value: 'expense', start: 5, length: 7},
                {key: 'to', value: 'John', start: 16, length: 4},
            ],
        },
        description: 'Complex query with name field continuation should return null autocomplete',
    },
    {
        query: 'from:Jane Do category:Travel',
        expected: {
            autocomplete: {
                key: 'category',
                value: 'Travel',
                start: 22,
                length: 6,
            },
            ranges: [
                {key: 'from', value: 'Jane', start: 5, length: 4},
                {key: 'category', value: 'Travel', start: 22, length: 6},
            ],
        },
        description: 'Mixed query with name continuation and other field should autocomplete the other field',
    },
    {
        query: 'to:John',
        expected: {
            autocomplete: {
                key: 'to',
                value: 'John',
                start: 3,
                length: 4,
            },
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
        },
        description: 'Complete single name should still provide autocomplete',
    },
    {
        query: 'to:"John Smith"',
        expected: {
            autocomplete: {
                key: 'to',
                value: 'John Smith',
                start: 3,
                length: 12,
            },
            ranges: [{key: 'to', value: 'John Smith', start: 3, length: 12}],
        },
        description: 'Quoted complete name should provide autocomplete',
    },
    {
        query: "to:John O'Con",
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
        },
        description: 'Name continuation with apostrophe should return null autocomplete',
    },
    {
        query: 'to:John-Paul Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John-Paul', start: 3, length: 9}],
        },
        description: 'Hyphenated first name with continuation should return null autocomplete',
    },
    {
        query: 'to:John Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
        },
        description: 'Original issue scenario - to:John Smi should return null autocomplete for continuation detection',
    },
    {
        query: 'to:FirstName PartialLastName',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'FirstName', start: 3, length: 9}],
        },
        description: 'Test case scenario - to:FirstName PartialLastName should return null autocomplete',
    },
    {
        query: 'from:Alice Bob',
        expected: {
            autocomplete: null,
            ranges: [{key: 'from', value: 'Alice', start: 5, length: 5}],
        },
        description: 'From field with two names should return null autocomplete for continuation',
    },
    {
        query: 'assignee:Manager Partial',
        expected: {
            autocomplete: null,
            ranges: [{key: 'assignee', value: 'Manager', start: 9, length: 7}],
        },
        description: 'Assignee field with partial second name should return null autocomplete',
    },
    {
        query: 'to:John,Jane',
        expected: {
            autocomplete: {
                key: 'to',
                value: 'Jane',
                start: 8,
                length: 4,
            },
            ranges: [
                {key: 'to', value: 'John', start: 3, length: 4},
                {key: 'to', value: 'Jane', start: 8, length: 4},
            ],
        },
        description: 'Comma-separated names should provide autocomplete for last value',
    },
    {
        query: 'to:"John Smith"',
        expected: {
            autocomplete: {
                key: 'to',
                value: 'John Smith',
                start: 3,
                length: 12,
            },
            ranges: [{key: 'to', value: 'John Smith', start: 3, length: 12}],
        },
        description: 'Quoted full name should provide autocomplete normally',
    },
];

describe('autocomplete parser', () => {
    test.each(tests)(`parsing: $query`, ({query, expected}) => {
        const result = parse(query) as SearchQueryJSON;

        expect(result).toEqual(expected);
    });
});

describe('autocomplete parser - name field continuation detection', () => {
    test.each(nameFieldContinuationTests)(`$description: $query`, ({query, expected}) => {
        const result = parse(query) as SearchQueryJSON;

        expect(result).toEqual(expected);
    });
});
