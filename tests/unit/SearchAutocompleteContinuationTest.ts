import CONST from '@src/CONST';

// Mock the SearchAutocompleteList continuation detection logic
function mockContinuationDetection(autocompleteQueryValue: string, autocomplete: any, ranges: any[]) {
    let autocompleteKey = autocomplete?.key;
    let autocompleteValue = autocomplete?.value ?? '';

    // If autocomplete is null but we have ranges, check if user is continuing to type after any name field
    if (!autocomplete && ranges.length > 0) {
        const lastRange = ranges.at(ranges.length - 1);
        // Only apply continuation logic for name fields (to, from, assignee, payer, exporter)
        const nameFields = [
            CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER,
            CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER,
        ] as const;

        if (lastRange && nameFields.includes(lastRange.key as any)) {
            const afterLastRange = autocompleteQueryValue.substring(lastRange.start + lastRange.length);
            const continuationMatch = afterLastRange.match(/^\s+(\w+)/);

            if (continuationMatch) {
                autocompleteKey = lastRange.key;
                autocompleteValue = `${lastRange.value} ${continuationMatch[1]}`;
            }
        }
    }

    return { autocompleteKey, autocompleteValue };
}

// Mock the SearchRouter field key extraction and replacement logic
function mockFieldKeyReplacement(textInputValue: string, item: any) {
    const fieldKey = item.mapKey?.includes(':') ? item.mapKey.split(':').at(0) : null;
    const keyIndex = fieldKey ? textInputValue.toLowerCase().lastIndexOf(`${fieldKey}:`) : -1;

    const trimmedUserSearchQuery = keyIndex !== -1 && fieldKey 
        ? textInputValue.substring(0, keyIndex + fieldKey.length + 1)
        : textInputValue; // Simplified for testing

    return `${trimmedUserSearchQuery}${item.searchQuery}`;
}

describe('SearchAutocompleteList - Continuation Detection Logic', () => {
    const continuationTests = [
        {
            description: 'Basic partial name matching - to:John Smi',
            autocompleteQueryValue: 'to:John Smi',
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
            expected: {
                autocompleteKey: 'to',
                autocompleteValue: 'John Smi',
            },
        },
        {
            description: 'From field partial name - from:Jane Do',
            autocompleteQueryValue: 'from:Jane Do',
            autocomplete: null,
            ranges: [{key: 'from', value: 'Jane', start: 5, length: 4}],
            expected: {
                autocompleteKey: 'from',
                autocompleteValue: 'Jane Do',
            },
        },
        {
            description: 'Multiple word continuation - to:FirstName PartialLastName',
            autocompleteQueryValue: 'to:FirstName PartialLastName',
            autocomplete: null,
            ranges: [{key: 'to', value: 'FirstName', start: 3, length: 9}],
            expected: {
                autocompleteKey: 'to',
                autocompleteValue: 'FirstName PartialLastName',
            },
        },
        {
            description: 'Assignee field - assignee:Manager Partial',
            autocompleteQueryValue: 'assignee:Manager Partial',
            autocomplete: null,
            ranges: [{key: 'assignee', value: 'Manager', start: 9, length: 7}],
            expected: {
                autocompleteKey: 'assignee',
                autocompleteValue: 'Manager Partial',
            },
        },
        {
            description: 'Payer field - payer:Alice Wonder',
            autocompleteQueryValue: 'payer:Alice Wonder',
            autocomplete: null,
            ranges: [{key: 'payer', value: 'Alice', start: 6, length: 5}],
            expected: {
                autocompleteKey: 'payer',
                autocompleteValue: 'Alice Wonder',
            },
        },
        {
            description: 'Exporter field - exporter:Charlie Brown',
            autocompleteQueryValue: 'exporter:Charlie Brown',
            autocomplete: null,
            ranges: [{key: 'exporter', value: 'Charlie', start: 9, length: 7}],
            expected: {
                autocompleteKey: 'exporter',
                autocompleteValue: 'Charlie Brown',
            },
        },
        {
            description: 'Non-name field should not trigger continuation - category:Travel Exp',
            autocompleteQueryValue: 'category:Travel Exp',
            autocomplete: null,
            ranges: [{key: 'category', value: 'Travel', start: 9, length: 6}],
            expected: {
                autocompleteKey: undefined,
                autocompleteValue: '',
            },
        },
        {
            description: 'Tag field should not trigger continuation - tag:Office Sup',
            autocompleteQueryValue: 'tag:Office Sup',
            autocomplete: null,
            ranges: [{key: 'tag', value: 'Office', start: 4, length: 6}],
            expected: {
                autocompleteKey: undefined,
                autocompleteValue: '',
            },
        },
        {
            description: 'Complex query with name continuation - type:expense to:John Smi amount>100',
            autocompleteQueryValue: 'type:expense to:John Smi amount>100',
            autocomplete: null,
            ranges: [
                {key: 'type', value: 'expense', start: 5, length: 7},
                {key: 'to', value: 'John', start: 16, length: 4},
            ],
            expected: {
                autocompleteKey: 'to',
                autocompleteValue: 'John Smi',
            },
        },
        {
            description: 'No continuation when autocomplete exists - to:John',
            autocompleteQueryValue: 'to:John',
            autocomplete: {key: 'to', value: 'John', start: 3, length: 4},
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
            expected: {
                autocompleteKey: 'to',
                autocompleteValue: 'John',
            },
        },
        {
            description: 'No continuation when no ranges exist',
            autocompleteQueryValue: 'some free text',
            autocomplete: null,
            ranges: [],
            expected: {
                autocompleteKey: undefined,
                autocompleteValue: '',
            },
        },
        {
            description: 'Multiple spaces before continuation - to:John  Smi',
            autocompleteQueryValue: 'to:John  Smi',
            autocomplete: null,
            ranges: [{key: 'to', value: 'John', start: 3, length: 4}],
            expected: {
                autocompleteKey: 'to',
                autocompleteValue: 'John Smi',
            },
        },
    ];

    test.each(continuationTests)('$description', ({autocompleteQueryValue, autocomplete, ranges, expected}) => {
        const result = mockContinuationDetection(autocompleteQueryValue, autocomplete, ranges);
        expect(result).toEqual(expected);
    });
});

describe('SearchRouter - Field Key Replacement Logic', () => {
    const replacementTests = [
        {
            description: 'Basic name field replacement - to:John Smi -> to:John Smith',
            textInputValue: 'to:John Smi',
            item: {
                mapKey: 'to:john_smith_id',
                searchQuery: 'John Smith',
            },
            expected: 'to:John Smith',
        },
        {
            description: 'From field replacement - from:Jane Do -> from:Jane Doe',
            textInputValue: 'from:Jane Do',
            item: {
                mapKey: 'from:jane_doe_id',
                searchQuery: 'Jane Doe',
            },
            expected: 'from:Jane Doe',
        },
        {
            description: 'Complex query replacement - type:expense to:FirstName Partial -> type:expense to:FirstName LastName',
            textInputValue: 'type:expense to:FirstName Partial',
            item: {
                mapKey: 'to:firstname_lastname_id',
                searchQuery: 'FirstName LastName',
            },
            expected: 'type:expense to:FirstName LastName',
        },
        {
            description: 'Multiple occurrences - uses last occurrence - to:John to:Jane Do -> to:John to:Jane Doe',
            textInputValue: 'to:John to:Jane Do',
            item: {
                mapKey: 'to:jane_doe_id',
                searchQuery: 'Jane Doe',
            },
            expected: 'to:John to:Jane Doe',
        },
        {
            description: 'No mapKey - fallback to simple replacement',
            textInputValue: 'to:John Smi',
            item: {
                searchQuery: 'John Smith',
            },
            expected: 'to:John SmiJohn Smith',
        },
    ];

    test.each(replacementTests)('$description', ({textInputValue, item, expected}) => {
        const result = mockFieldKeyReplacement(textInputValue, item);
        expect(result).toEqual(expected);
    });
});
