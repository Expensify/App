import type {SearchQueryJSON} from '@components/Search/types';
import {parse} from '@libs/SearchParser/searchParser';
import CONST from '@src/CONST';
import parserCommonTests from '../utils/fixtures/searchParsersCommonQueries';

const tests = [
    {
        query: parserCommonTests.simple,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: null,
        },
    },
    {
        query: parserCommonTests.userFriendlyNames,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'and',
                        left: {
                            operator: 'eq',
                            left: 'taxRate',
                            right: 'rate1',
                        },
                        right: {
                            operator: 'eq',
                            left: 'expenseType',
                            right: 'card',
                        },
                    },
                    right: {
                        operator: 'eq',
                        left: 'cardID',
                        right: 'Big Bank',
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'reportID',
                    right: '1234',
                },
            },
        },
    },
    {
        query: parserCommonTests.oldNames,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'and',
                        left: {
                            operator: 'eq',
                            left: 'taxRate',
                            right: 'rate1',
                        },
                        right: {
                            operator: 'eq',
                            left: 'expenseType',
                            right: 'card',
                        },
                    },
                    right: {
                        operator: 'eq',
                        left: 'cardID',
                        right: 'Big Bank',
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'reportID',
                    right: '1234',
                },
            },
        },
    },
    {
        query: parserCommonTests.complex,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'and',
                        left: {
                            operator: 'and',
                            left: {
                                operator: 'gt',
                                left: 'amount',
                                right: '200',
                            },
                            right: {
                                operator: 'eq',
                                left: 'expenseType',
                                right: ['cash', 'card'],
                            },
                        },
                        right: {
                            operator: 'eq',
                            left: 'description',
                            right: 'Las Vegas party',
                        },
                    },
                    right: {
                        operator: 'eq',
                        left: 'date',
                        right: '2024-06-01',
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'category',
                    right: ['travel', 'hotel', 'meal & entertainment'],
                },
            },
        },
    },
    {
        query: parserCommonTests.quotesIOS,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'category',
                right: 'a b',
            },
        },
    },
    {
        query: ',',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: [','],
            },
        },
    },
    {
        query: 'currency:,',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['currency:,'],
            },
        },
    },
    {
        query: 'tag:,,travel,',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'tag',
                right: 'travel',
            },
        },
    },
    {
        query: 'category:',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['category:'],
            },
        },
    },
    {
        query: 'in:123333 currency:USD merchant:marriott',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'eq',
                        left: 'in',
                        right: '123333',
                    },
                    right: {
                        operator: 'eq',
                        left: 'currency',
                        right: 'USD',
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'merchant',
                    right: 'marriott',
                },
            },
        },
    },
    {
        query: 'date>2024-01-01 date<2024-06-01 merchant:"McDonald\'s"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'gt',
                        left: 'date',
                        right: '2024-01-01',
                    },
                    right: {
                        operator: 'lt',
                        left: 'date',
                        right: '2024-06-01',
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'merchant',
                    right: "McDonald's",
                },
            },
        },
    },
    {
        query: 'from:usera@user.com to:userb@user.com date>2024-01-01',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'eq',
                        left: 'from',
                        right: 'usera@user.com',
                    },
                    right: {
                        operator: 'eq',
                        left: 'to',
                        right: 'userb@user.com',
                    },
                },
                right: {
                    operator: 'gt',
                    left: 'date',
                    right: '2024-01-01',
                },
            },
        },
    },
    {
        query: 'amount>100 amount<200 from:usera@user.com tax-rate:1234 card:1234 report-id:12345 tag:ecx date>2023-01-01',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'and',
                        left: {
                            operator: 'and',
                            left: {
                                operator: 'and',
                                left: {
                                    operator: 'and',
                                    left: {
                                        operator: 'and',
                                        left: {
                                            operator: 'gt',
                                            left: 'amount',
                                            right: '100',
                                        },
                                        right: {
                                            operator: 'lt',
                                            left: 'amount',
                                            right: '200',
                                        },
                                    },
                                    right: {
                                        operator: 'eq',
                                        left: 'from',
                                        right: 'usera@user.com',
                                    },
                                },
                                right: {
                                    operator: 'eq',
                                    left: 'taxRate',
                                    right: '1234',
                                },
                            },
                            right: {
                                operator: 'eq',
                                left: 'cardID',
                                right: '1234',
                            },
                        },
                        right: {
                            operator: 'eq',
                            left: 'reportID',
                            right: '12345',
                        },
                    },
                    right: {
                        operator: 'eq',
                        left: 'tag',
                        right: 'ecx',
                    },
                },
                right: {
                    operator: 'gt',
                    left: 'date',
                    right: '2023-01-01',
                },
            },
        },
    },
    {
        query: 'amount>200 las vegas',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'gt',
                    left: 'amount',
                    right: '200',
                },
                right: {
                    operator: 'eq',
                    left: 'keyword',
                    right: ['las', 'vegas'],
                },
            },
        },
    },
    {
        query: 'status:all',
        expected: {
            type: 'expense',
            status: '',
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: null,
        },
    },
    {
        query: 'amount>200 las vegas category:"Hotel : Marriott"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'gt',
                        left: 'amount',
                        right: '200',
                    },
                    right: {
                        operator: 'eq',
                        left: 'category',
                        right: 'Hotel : Marriott',
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'keyword',
                    right: ['las', 'vegas'],
                },
            },
        },
    },
    {
        query: 'amount>200 las vegas category:"Hotel : Marriott" date:2024-01-01,2024-02-01 merchant:"Expensify, Inc." tag:hotel,travel,"meals & entertainment"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'and',
                        left: {
                            operator: 'and',
                            left: {
                                operator: 'and',
                                left: {
                                    operator: 'gt',
                                    left: 'amount',
                                    right: '200',
                                },
                                right: {
                                    operator: 'eq',
                                    left: 'category',
                                    right: 'Hotel : Marriott',
                                },
                            },
                            right: {
                                operator: 'eq',
                                left: 'date',
                                right: ['2024-01-01', '2024-02-01'],
                            },
                        },
                        right: {
                            operator: 'eq',
                            left: 'merchant',
                            right: 'Expensify, Inc.',
                        },
                    },
                    right: {
                        operator: 'eq',
                        left: 'tag',
                        right: ['hotel', 'travel', 'meals & entertainment'],
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'keyword',
                    right: ['las', 'vegas'],
                },
            },
        },
    },
    {
        query: 'type:expense withdrawal-type:expensify-card',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
                right: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD,
            },
        },
    },
    {
        query: 'type:expense withdrawal-id:1234567890',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
                right: '1234567890',
            },
        },
    },
    {
        query: 'type:expense withdrawn:last-month',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
                right: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
            },
        },
    },
    {
        query: 'type:chat is:read',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: CONST.SEARCH.IS_VALUES.READ,
            },
        },
    },
    {
        query: 'type:chat is:unread',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: CONST.SEARCH.IS_VALUES.UNREAD,
            },
        },
    },
    {
        query: 'type:chat is:pinned',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: CONST.SEARCH.IS_VALUES.PINNED,
            },
        },
    },
    {
        query: 'type:chat is:pinned,read,unread',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: [CONST.SEARCH.IS_VALUES.PINNED, CONST.SEARCH.IS_VALUES.READ, CONST.SEARCH.IS_VALUES.UNREAD],
            },
        },
    },
    {
        query: 'type:chat has:attachment',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                right: CONST.SEARCH.HAS_VALUES.ATTACHMENT,
            },
        },
    },
    {
        query: 'type:chat has:link',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                right: CONST.SEARCH.HAS_VALUES.LINK,
            },
        },
    },
    {
        query: 'type:chat has:link,attachment',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                right: [CONST.SEARCH.HAS_VALUES.LINK, CONST.SEARCH.HAS_VALUES.ATTACHMENT],
            },
        },
    },
    {
        query: 'type:chat is:READ',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: 'READ', // Case is preserved as-is
            },
        },
    },
    {
        query: 'type:chat is:PINNED',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            view: 'table',
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: 'PINNED', // Case is preserved as-is
            },
        },
    },
];

/*
 * Test keywords with special characters and wrapped in quotes
 */

const keywordTests = [
    {
        query: '" " "  "', // Multiple whitespaces wrapped in quotes
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: [' ', '  '],
            },
        },
    },
    {
        query: '"https://expensify.com" "https://new.expensify.com"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['https://expensify.com', 'https://new.expensify.com'],
            },
        },
    },
    {
        query: '""https://expensify.com"" to ""https://new.expensify.com""', // Nested quotes with a colon
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['"https://expensify.com"', 'to', '"https://new.expensify.com"'],
            },
        },
    },
    {
        query: '"""https://expensify.com" to "https://new.expensify.com"""', // Mismatched quotes
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['""https://expensify.com', 'to', 'https://new.expensify.com""'],
            },
        },
    },
    {
        query: 'date>2024-01-01 from:usera@user.com "https://expensify.com" "https://new.expensify.com"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'and',
                    left: {
                        operator: 'gt',
                        left: 'date',
                        right: '2024-01-01',
                    },
                    right: {
                        operator: 'eq',
                        left: 'from',
                        right: 'usera@user.com',
                    },
                },
                right: {
                    operator: 'eq',
                    left: 'keyword',
                    right: ['https://expensify.com', 'https://new.expensify.com'],
                },
            },
        },
    },
    {
        query: 'from:““Rag” Dog”,"Bag ”Dog“",email@gmail.com,1605423 to:"""Unruly"" “““Glad””” """Dog"""',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'and',
                left: {
                    operator: 'eq',
                    left: 'from',
                    right: ['“Rag” Dog', 'Bag ”Dog“', 'email@gmail.com', '1605423'],
                },
                right: {
                    operator: 'eq',
                    left: 'to',
                    right: '""Unruly"" “““Glad””” """Dog""',
                },
            },
        },
    },
    {
        query: 'expense-type:per-diem',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'expenseType',
                right: 'perDiem',
            },
        },
    },
    {
        query: 'columns:original-amount,tax,report-id',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            columns: ['originalamount', 'taxAmount', 'base62ReportID'],
            filters: null,
        },
    },
    {
        query: 'columns:tax',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            columns: 'taxAmount',
            filters: null,
        },
    },
    {
        query: 'merchant:tax',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: {
                operator: 'eq',
                left: 'merchant',
                right: 'tax',
            },
        },
    },
    {
        query: 'type:expense action:submit columns:group-bank-account,group-from',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            columns: ['groupBankAccount', 'groupFrom'],
            filters: {
                left: 'action',
                operator: 'eq',
                right: 'submit',
            },
        },
    },
    // View parameter tests
    {
        query: 'type:expense view:bar',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'bar',
            filters: null,
        },
    },
    {
        query: 'type:expense view:table',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: null,
        },
    },
    {
        query: 'type:expense status:all', // default view should be 'table'
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            filters: null,
        },
    },
    {
        query: 'type:expense view:bar category:travel',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'bar',
            filters: {
                operator: 'eq',
                left: 'category',
                right: 'travel',
            },
        },
    },
];

const limitTests = [
    {
        description: 'basic limit filter',
        query: 'type:expense limit:10',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            limit: '10',
            filters: null,
        },
    },
    {
        description: 'limit filter combined with other filters',
        query: 'type:expense limit:50 merchant:Amazon',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            limit: '50',
            filters: {
                operator: 'eq',
                left: 'merchant',
                right: 'Amazon',
            },
        },
    },
    {
        description: 'limit filter is case-insensitive',
        query: 'type:expense LIMIT:25',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            limit: '25',
            filters: null,
        },
    },
    {
        description: 'limit filter at the beginning of query',
        query: 'limit:100 category:travel,hotel',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            view: 'table',
            limit: '100',
            filters: {
                operator: 'eq',
                left: 'category',
                right: ['travel', 'hotel'],
            },
        },
    },
];

describe('search parser', () => {
    test.each(tests)(`parsing: $query`, ({query, expected}) => {
        const {rawFilterList, ...resultWithoutRawFilters} = parse(query) as SearchQueryJSON;
        expect(resultWithoutRawFilters).toEqual(expected);
    });
});

describe('Testing search parser with special characters and wrapped in quotes.', () => {
    test.each(keywordTests)(`parsing: $query`, ({query, expected}) => {
        const {rawFilterList, ...resultWithoutRawFilters} = parse(query) as SearchQueryJSON;
        expect(resultWithoutRawFilters).toEqual(expected);
    });
});

describe('search parser - limit filter', () => {
    test.each(limitTests)('$description: $query', ({query, expected}) => {
        const {rawFilterList, ...resultWithoutRawFilters} = parse(query) as SearchQueryJSON;
        expect(resultWithoutRawFilters).toEqual(expected);
    });
});
