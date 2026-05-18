import type {SearchQueryJSON} from '@components/Search/types';
import {parse} from '@libs/SearchParser/autocompleteParser';
import parserCommonTests from '../utils/fixtures/searchParsersCommonQueries';

const tests = [
    {
        query: parserCommonTests.simple,
        expected: {
            autocomplete: {key: 'type', value: 'expense', negated: false, start: 5, length: 7},
            ranges: [{key: 'type', value: 'expense', negated: false, start: 5, length: 7}],
        },
    },
    {
        query: parserCommonTests.userFriendlyNames,
        expected: {
            autocomplete: {
                key: 'reportID',
                value: '1234',
                negated: false,
                start: 59,
                length: 4,
            },
            ranges: [
                {key: 'taxRate', value: 'rate1', negated: false, start: 9, length: 5},
                {key: 'expenseType', value: 'card', negated: false, start: 28, length: 4},
                {key: 'cardID', value: 'Big Bank', negated: false, start: 38, length: 10},
                {key: 'reportID', value: '1234', negated: false, start: 59, length: 4},
            ],
        },
    },
    {
        query: parserCommonTests.oldNames,
        expected: {
            autocomplete: {
                key: 'reportID',
                value: '1234',
                negated: false,
                start: 59,
                length: 4,
            },
            ranges: [
                {key: 'taxRate', value: 'rate1', negated: false, start: 8, length: 5},
                {key: 'expenseType', value: 'card', negated: false, start: 26, length: 4},
                {key: 'cardID', value: 'Big Bank', negated: false, start: 38, length: 10},
                {key: 'reportID', value: '1234', negated: false, start: 59, length: 4},
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
                negated: false,
            },
            ranges: [
                {key: 'amount', length: 3, negated: false, start: 7, value: '200'},
                {key: 'expenseType', length: 4, negated: false, start: 24, value: 'cash'},
                {key: 'expenseType', length: 4, negated: false, start: 29, value: 'card'},
                {key: 'description', length: 17, negated: false, start: 46, value: 'Las Vegas party'},
                {key: 'date', length: 10, negated: false, start: 69, value: '2024-06-01'},
                {key: 'category', length: 6, negated: false, start: 89, value: 'travel'},
                {key: 'category', length: 5, negated: false, start: 96, value: 'hotel'},
                {key: 'category', length: 22, negated: false, start: 102, value: 'meal & entertainment'},
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
                negated: false,
            },
            ranges: [
                {key: 'type', value: 'expense', negated: false, start: 5, length: 7},
                {key: 'category', value: 'a b', negated: false, start: 22, length: 5},
            ],
        },
    },
    {
        query: 'date>2024-01-01 amount>100 merchant:"A B" description:A,B,C ,, report-id:123456789 word',
        expected: {
            autocomplete: null,
            ranges: [
                {key: 'date', length: 10, negated: false, start: 5, value: '2024-01-01'},
                {key: 'amount', length: 3, negated: false, start: 23, value: '100'},
                {key: 'merchant', length: 5, negated: false, start: 36, value: 'A B'},
                {key: 'description', length: 1, negated: false, start: 54, value: 'A'},
                {key: 'description', length: 1, negated: false, start: 56, value: 'B'},
                {key: 'description', length: 1, negated: false, start: 58, value: 'C'},
                {key: 'reportID', length: 9, negated: false, start: 73, value: '123456789'},
            ],
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
                negated: false,
            },
            ranges: [
                {key: 'in', value: '123456', negated: false, start: 3, length: 6},
                {key: 'currency', value: 'USD', negated: false, start: 19, length: 3},
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
                negated: false,
            },
            ranges: [
                {key: 'tag', value: 'aa', negated: false, start: 4, length: 2},
                {key: 'tag', value: 'bbb', negated: false, start: 7, length: 3},
                {key: 'tag', value: 'cccc', negated: false, start: 11, length: 4},
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
                negated: false,
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
                negated: false,
            },
            ranges: [{key: 'category', value: 'Advertising', negated: false, start: 9, length: 11}],
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
                negated: false,
            },
            ranges: [
                {key: 'in', value: 'Big Room', negated: false, start: 3, length: 10},
                {key: 'in', value: 'small room', negated: false, start: 14, length: 12},
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
                negated: false,
            },
            ranges: [{key: 'category', value: 'Car', negated: false, start: 12, length: 3}],
        },
    },
    {
        query: 'type:expense word',
        expected: {
            autocomplete: null,
            ranges: [{key: 'type', value: 'expense', negated: false, start: 5, length: 7}],
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
                negated: false,
            },
            ranges: [
                {key: 'in', value: 'Big Room', negated: false, start: 3, length: 10},
                {key: 'from', value: 'Friend', negated: false, start: 19, length: 6},
                {key: 'category', value: 'Car', negated: false, start: 35, length: 3},
                {key: 'category', value: 'Cell Phone', negated: false, start: 39, length: 12},
                {key: 'expenseType', value: 'card', negated: false, start: 65, length: 4},
                {key: 'expenseType', value: 'cash', negated: false, start: 70, length: 4},
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
                negated: false,
                length: 8,
            },
            ranges: [
                {key: 'currency', value: 'PLN', negated: false, start: 9, length: 3},
                {key: 'currency', value: 'USD', negated: false, start: 13, length: 3},
                {key: 'taxRate', value: 'tax', negated: false, start: 34, length: 3},
                {key: 'merchant', value: 'Expensify, Inc.', negated: false, start: 48, length: 17},
                {key: 'tag', value: 'General Overhead', negated: false, start: 70, length: 18},
                {key: 'tag', value: 'IT', negated: false, start: 89, length: 2},
                {key: 'expenseType', value: 'card', negated: false, start: 105, length: 4},
                {key: 'expenseType', value: 'distance', negated: false, start: 110, length: 8},
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
                negated: false,
            },
            ranges: [
                {key: 'from', value: '"Big Dog', negated: false, start: 5, length: 10},
                {key: 'from', value: 'Little Dog"', negated: false, start: 16, length: 13},
                {key: 'to', value: '"Mad" Dog', negated: false, start: 33, length: 11},
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
                negated: false,
            },
            ranges: [
                {key: 'from', value: '“Rag” Dog', negated: false, start: 5, length: 11},
                {key: 'from', value: 'Bag ”Dog“', negated: false, start: 17, length: 11},
                {key: 'to', value: '""Unruly"" “““Glad””” """Dog""', negated: false, start: 32, length: 32},
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
                negated: false,
            },
            ranges: [{key: 'expenseType', value: 'per-diem', negated: false, start: 13, length: 8}],
        },
    },
];

const limitAutocompleteTests = [
    {
        description: 'basic limit filter autocomplete',
        query: 'limit:10',
        expected: {
            autocomplete: {key: 'limit', value: '10', negated: false, start: 6, length: 2},
            ranges: [{key: 'limit', value: '10', negated: false, start: 6, length: 2}],
        },
    },
    {
        description: 'empty limit value shows autocomplete suggestion',
        query: 'limit:',
        expected: {
            autocomplete: {key: 'limit', value: '', start: 6, length: 0, negated: false},
            ranges: [],
        },
    },
    {
        description: 'limit filter in complex query',
        query: 'type:expense limit:100 merchant:test',
        expected: {
            autocomplete: {key: 'merchant', value: 'test', negated: false, start: 32, length: 4},
            ranges: [
                {key: 'type', value: 'expense', negated: false, start: 5, length: 7},
                {key: 'limit', value: '100', negated: false, start: 19, length: 3},
                {key: 'merchant', value: 'test', negated: false, start: 32, length: 4},
            ],
        },
    },
    {
        description: 'limit filter is case-insensitive',
        query: 'LIMIT:50',
        expected: {
            autocomplete: {key: 'limit', value: '50', negated: false, start: 6, length: 2},
            ranges: [{key: 'limit', value: '50', negated: false, start: 6, length: 2}],
        },
    },
];

const nameFieldContinuationTests = [
    {
        query: 'to:John Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', negated: false, start: 3, length: 4}],
        },
        description: 'Basic partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'from:Jane Do',
        expected: {
            autocomplete: null,
            ranges: [{key: 'from', value: 'Jane', negated: false, start: 5, length: 4}],
        },
        description: 'From field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'assignee:Bob Mar',
        expected: {
            autocomplete: null,
            ranges: [{key: 'assignee', value: 'Bob', negated: false, start: 9, length: 3}],
        },
        description: 'Assignee field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'payer:Alice Wind',
        expected: {
            autocomplete: null,
            ranges: [{key: 'payer', value: 'Alice', negated: false, start: 6, length: 5}],
        },
        description: 'Payer field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'exporter:Charlie Bro',
        expected: {
            autocomplete: null,
            ranges: [{key: 'exporter', value: 'Charlie', negated: false, start: 9, length: 7}],
        },
        description: 'Exporter field partial name - parser should return null autocomplete for continuation text',
    },
    {
        query: 'to:John Smith Doe',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', negated: false, start: 3, length: 4}],
        },
        description: 'Multiple word continuation - parser should only parse first token, rest is free text',
    },
    {
        query: 'from:Mary Jane Wat',
        expected: {
            autocomplete: null,
            ranges: [{key: 'from', value: 'Mary', negated: false, start: 5, length: 4}],
        },
        description: 'Multiple word continuation with partial last name - parser should only parse first token',
    },
    {
        query: 'to:John  Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', negated: false, start: 3, length: 4}],
        },
        description: 'Multiple spaces before continuation text',
    },
    {
        query: 'to:John\tSmi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', negated: false, start: 3, length: 4}],
        },
        description: 'Tab character before continuation text',
    },
    {
        query: 'category:Travel Exp',
        expected: {
            autocomplete: null,
            ranges: [{key: 'category', value: 'Travel', negated: false, start: 9, length: 6}],
        },
        description: 'Non-name field with space - parser treats space as separator, continuation logic applies in UI',
    },
    {
        query: 'tag:Office Sup',
        expected: {
            autocomplete: null,
            ranges: [{key: 'tag', value: 'Office', negated: false, start: 4, length: 6}],
        },
        description: 'Tag field with space - parser treats space as separator, continuation logic applies in UI',
    },
    {
        query: 'type:expense to:John Smi amount>100',
        expected: {
            autocomplete: {
                key: 'amount',
                value: '100',
                start: 32,
                length: 3,
                negated: false,
            },
            ranges: [
                {key: 'type', value: 'expense', negated: false, start: 5, length: 7},
                {key: 'to', value: 'John', negated: false, start: 16, length: 4},
                {key: 'amount', value: '100', negated: false, start: 32, length: 3},
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
                negated: false,
            },
            ranges: [
                {key: 'from', value: 'Jane', negated: false, start: 5, length: 4},
                {key: 'category', value: 'Travel', negated: false, start: 22, length: 6},
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
                negated: false,
            },
            ranges: [{key: 'to', value: 'John', negated: false, start: 3, length: 4}],
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
                negated: false,
            },
            ranges: [{key: 'to', value: 'John Smith', negated: false, start: 3, length: 12}],
        },
        description: 'Quoted complete name should provide autocomplete',
    },
    {
        query: "to:John O'Con",
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', negated: false, start: 3, length: 4}],
        },
        description: 'Name continuation with apostrophe should return null autocomplete',
    },
    {
        query: 'to:John-Paul Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John-Paul', negated: false, start: 3, length: 9}],
        },
        description: 'Hyphenated first name with continuation should return null autocomplete',
    },
    {
        query: 'to:John Smi',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', negated: false, start: 3, length: 4}],
        },
        description: 'Original issue scenario - to:John Smi should return null autocomplete for continuation detection',
    },
    {
        query: 'to:FirstName PartialLastName',
        expected: {
            autocomplete: null,
            ranges: [{key: 'to', value: 'FirstName', negated: false, start: 3, length: 9}],
        },
        description: 'Test case scenario - to:FirstName PartialLastName should return null autocomplete',
    },
    {
        query: 'from:Alice Bob',
        expected: {
            autocomplete: null,
            ranges: [{key: 'from', value: 'Alice', negated: false, start: 5, length: 5}],
        },
        description: 'From field with two names should return null autocomplete for continuation',
    },
    {
        query: 'assignee:Manager Partial',
        expected: {
            autocomplete: null,
            ranges: [{key: 'assignee', value: 'Manager', negated: false, start: 9, length: 7}],
        },
        description: 'Assignee field with partial second name should return null autocomplete',
    },
    {
        query: 'to:John,Jane',
        expected: {
            autocomplete: {
                key: 'to',
                value: 'Jane',
                negated: false,
                start: 8,
                length: 4,
            },
            ranges: [
                {key: 'to', value: 'John', negated: false, start: 3, length: 4},
                {key: 'to', value: 'Jane', negated: false, start: 8, length: 4},
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
                negated: false,
                start: 3,
                length: 12,
            },
            ranges: [{key: 'to', value: 'John Smith', negated: false, start: 3, length: 12}],
        },
        description: 'Quoted full name should provide autocomplete normally',
    },
    {
        query: 'type:chat is:read',
        expected: {
            autocomplete: {
                key: 'is',
                value: 'read',
                negated: false,
                start: 13,
                length: 4,
            },
            ranges: [
                {key: 'type', value: 'chat', negated: false, start: 5, length: 4},
                {key: 'is', value: 'read', negated: false, start: 13, length: 4},
            ],
        },
        description: 'Is field with read value should provide autocomplete',
    },
    {
        query: 'type:chat is:unread',
        expected: {
            autocomplete: {
                key: 'is',
                value: 'unread',
                negated: false,
                start: 13,
                length: 6,
            },
            ranges: [
                {key: 'type', value: 'chat', negated: false, start: 5, length: 4},
                {key: 'is', value: 'unread', negated: false, start: 13, length: 6},
            ],
        },
        description: 'Is field with unread value should provide autocomplete',
    },
    {
        query: 'type:chat is:pinned',
        expected: {
            autocomplete: {
                key: 'is',
                value: 'pinned',
                start: 13,
                length: 6,
                negated: false,
            },
            ranges: [
                {key: 'type', value: 'chat', negated: false, start: 5, length: 4},
                {key: 'is', value: 'pinned', negated: false, start: 13, length: 6},
            ],
        },
        description: 'Is field with pinned value should provide autocomplete',
    },
    {
        query: 'type:chat is:pinned,read,unread',
        expected: {
            autocomplete: {
                key: 'is',
                value: 'unread',
                start: 25,
                negated: false,
                length: 6,
            },
            ranges: [
                {key: 'type', value: 'chat', negated: false, start: 5, length: 4},
                {key: 'is', value: 'pinned', negated: false, start: 13, length: 6},
                {key: 'is', value: 'read', negated: false, start: 20, length: 4},
                {key: 'is', value: 'unread', negated: false, start: 25, length: 6},
            ],
        },
        description: 'Is field with pinned,read,unread values should provide autocomplete',
    },
    {
        query: 'type:chat has:attachment',
        expected: {
            autocomplete: {
                key: 'has',
                value: 'attachment',
                start: 14,
                negated: false,
                length: 10,
            },
            ranges: [
                {key: 'type', value: 'chat', negated: false, start: 5, length: 4},
                {key: 'has', value: 'attachment', negated: false, start: 14, length: 10},
            ],
        },
        description: 'Has field with attachment value should provide autocomplete',
    },
    {
        query: 'type:chat has:link',
        expected: {
            autocomplete: {
                key: 'has',
                value: 'link',
                negated: false,
                start: 14,
                length: 4,
            },
            ranges: [
                {key: 'type', value: 'chat', negated: false, start: 5, length: 4},
                {key: 'has', value: 'link', negated: false, start: 14, length: 4},
            ],
        },
        description: 'Has field with link value should provide autocomplete',
    },
    {
        query: 'type:chat has:link,attachment',
        expected: {
            autocomplete: {
                key: 'has',
                value: 'attachment',
                negated: false,
                start: 19,
                length: 10,
            },
            ranges: [
                {key: 'type', value: 'chat', negated: false, start: 5, length: 4},
                {key: 'has', value: 'link', negated: false, start: 14, length: 4},
                {key: 'has', value: 'attachment', negated: false, start: 19, length: 10},
            ],
        },
        description: 'Has field with link,attachment values should provide autocomplete',
    },
    {
        query: 'type:expense -from:me,jack@test.com',
        expected: {
            autocomplete: {
                key: 'from',
                length: 13,
                negated: true,
                start: 22,
                value: 'jack@test.com',
            },
            ranges: [
                {key: 'type', value: 'expense', negated: false, start: 5, length: 7},
                {key: 'from', value: 'me', negated: true, start: 19, length: 2},
                {key: 'from', value: 'jack@test.com', negated: true, start: 22, length: 13},
            ],
        },
        description: 'Negates multiple from values',
    },
    {
        query: 'type:expense -from:me -has:receipt',
        expected: {
            autocomplete: {
                key: 'has',
                length: 7,
                negated: true,
                start: 27,
                value: 'receipt',
            },
            ranges: [
                {key: 'type', value: 'expense', negated: false, start: 5, length: 7},
                {key: 'from', value: 'me', negated: true, start: 19, length: 2},
                {key: 'has', value: 'receipt', negated: true, start: 27, length: 7},
            ],
        },
        description: 'Negates multiple from and has values',
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

describe('autocomplete parser - limit filter', () => {
    test.each(limitAutocompleteTests)('$description: $query', ({query, expected}) => {
        const result = parse(query) as SearchQueryJSON;

        expect(result).toEqual(expected);
    });
});
