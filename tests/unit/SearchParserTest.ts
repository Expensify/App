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
            filters: null,
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
            ],
        },
    },
    {
        query: parserCommonTests.userFriendlyNames,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'taxRate',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'taxRate',
                        right: 'rate1',
                    },
                },
                {
                    type: 'filter',
                    key: 'expenseType',
                    position: 15,
                    node: {
                        operator: 'eq',
                        left: 'expenseType',
                        right: 'card',
                    },
                },
                {
                    type: 'filter',
                    key: 'cardID',
                    position: 33,
                    node: {
                        operator: 'eq',
                        left: 'cardID',
                        right: 'Big Bank',
                    },
                },
                {
                    type: 'filter',
                    key: 'reportID',
                    position: 49,
                    node: {
                        operator: 'eq',
                        left: 'reportID',
                        right: '1234',
                    },
                },
            ],
        },
    },
    {
        query: parserCommonTests.oldNames,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'taxRate',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'taxRate',
                        right: 'rate1',
                    },
                },
                {
                    type: 'filter',
                    key: 'expenseType',
                    position: 14,
                    node: {
                        operator: 'eq',
                        left: 'expenseType',
                        right: 'card',
                    },
                },
                {
                    type: 'filter',
                    key: 'cardID',
                    position: 31,
                    node: {
                        operator: 'eq',
                        left: 'cardID',
                        right: 'Big Bank',
                    },
                },
                {
                    type: 'filter',
                    key: 'reportID',
                    position: 49,
                    node: {
                        operator: 'eq',
                        left: 'reportID',
                        right: '1234',
                    },
                },
            ],
        },
    },
    {
        query: parserCommonTests.complex,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'amount',
                    position: 0,
                    node: {
                        operator: 'gt',
                        left: 'amount',
                        right: '200',
                    },
                },
                {
                    type: 'filter',
                    key: 'expenseType',
                    position: 11,
                    node: {
                        operator: 'eq',
                        left: 'expenseType',
                        right: ['cash', 'card'],
                    },
                },
                {
                    type: 'filter',
                    key: 'description',
                    position: 34,
                    node: {
                        operator: 'eq',
                        left: 'description',
                        right: 'Las Vegas party',
                    },
                },
                {
                    type: 'filter',
                    key: 'date',
                    position: 64,
                    node: {
                        operator: 'eq',
                        left: 'date',
                        right: '2024-06-01',
                    },
                },
                {
                    type: 'filter',
                    key: 'category',
                    position: 80,
                    node: {
                        operator: 'eq',
                        left: 'category',
                        right: ['travel', 'hotel', 'meal & entertainment'],
                    },
                },
            ],
        },
    },
    {
        query: parserCommonTests.quotesIOS,
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'category',
                right: 'a b',
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'category',
                    position: 13,
                    node: {
                        operator: 'eq',
                        left: 'category',
                        right: 'a b',
                    },
                },
            ],
        },
    },
    {
        query: ',',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: [','],
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: ',',
                    },
                },
            ],
        },
    },
    {
        query: 'currency:,',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['currency:,'],
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'currency:,',
                    },
                },
            ],
        },
    },
    {
        query: 'tag:,,travel,',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'tag',
                right: 'travel',
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'tag',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'tag',
                        right: 'travel',
                    },
                },
            ],
        },
    },
    {
        query: 'category:',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['category:'],
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'category:',
                    },
                },
            ],
        },
    },
    {
        query: 'in:123333 currency:USD merchant:marriott',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'in',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'in',
                        right: '123333',
                    },
                },
                {
                    type: 'filter',
                    key: 'currency',
                    position: 10,
                    node: {
                        operator: 'eq',
                        left: 'currency',
                        right: 'USD',
                    },
                },
                {
                    type: 'filter',
                    key: 'merchant',
                    position: 23,
                    node: {
                        operator: 'eq',
                        left: 'merchant',
                        right: 'marriott',
                    },
                },
            ],
        },
    },
    {
        query: 'date>2024-01-01 date<2024-06-01 merchant:"McDonald\'s"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'date',
                    position: 0,
                    node: {
                        operator: 'gt',
                        left: 'date',
                        right: '2024-01-01',
                    },
                },
                {
                    type: 'filter',
                    key: 'date',
                    position: 16,
                    node: {
                        operator: 'lt',
                        left: 'date',
                        right: '2024-06-01',
                    },
                },
                {
                    type: 'filter',
                    key: 'merchant',
                    position: 32,
                    node: {
                        operator: 'eq',
                        left: 'merchant',
                        right: "McDonald's",
                    },
                },
            ],
        },
    },
    {
        query: 'from:usera@user.com to:userb@user.com date>2024-01-01',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'from',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'from',
                        right: 'usera@user.com',
                    },
                },
                {
                    type: 'filter',
                    key: 'to',
                    position: 20,
                    node: {
                        operator: 'eq',
                        left: 'to',
                        right: 'userb@user.com',
                    },
                },
                {
                    type: 'filter',
                    key: 'date',
                    position: 38,
                    node: {
                        operator: 'gt',
                        left: 'date',
                        right: '2024-01-01',
                    },
                },
            ],
        },
    },
    {
        query: 'amount>100 amount<200 from:usera@user.com tax-rate:1234 card:1234 report-id:12345 tag:ecx date>2023-01-01',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'amount',
                    position: 0,
                    node: {
                        operator: 'gt',
                        left: 'amount',
                        right: '100',
                    },
                },
                {
                    type: 'filter',
                    key: 'amount',
                    position: 11,
                    node: {
                        operator: 'lt',
                        left: 'amount',
                        right: '200',
                    },
                },
                {
                    type: 'filter',
                    key: 'from',
                    position: 22,
                    node: {
                        operator: 'eq',
                        left: 'from',
                        right: 'usera@user.com',
                    },
                },
                {
                    type: 'filter',
                    key: 'taxRate',
                    position: 42,
                    node: {
                        operator: 'eq',
                        left: 'taxRate',
                        right: '1234',
                    },
                },
                {
                    type: 'filter',
                    key: 'cardID',
                    position: 56,
                    node: {
                        operator: 'eq',
                        left: 'cardID',
                        right: '1234',
                    },
                },
                {
                    type: 'filter',
                    key: 'reportID',
                    position: 66,
                    node: {
                        operator: 'eq',
                        left: 'reportID',
                        right: '12345',
                    },
                },
                {
                    type: 'filter',
                    key: 'tag',
                    position: 82,
                    node: {
                        operator: 'eq',
                        left: 'tag',
                        right: 'ecx',
                    },
                },
                {
                    type: 'filter',
                    key: 'date',
                    position: 90,
                    node: {
                        operator: 'gt',
                        left: 'date',
                        right: '2023-01-01',
                    },
                },
            ],
        },
    },
    {
        query: 'amount>200 las vegas',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'amount',
                    position: 0,
                    node: {
                        operator: 'gt',
                        left: 'amount',
                        right: '200',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 11,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'las',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 15,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'vegas',
                    },
                },
            ],
        },
    },
    {
        query: 'status:all',
        expected: {
            type: 'expense',
            status: '',
            sortBy: 'date',
            sortOrder: 'desc',
            filters: null,
            positionInfo: [
                {
                    type: 'root',
                    key: 'status',
                    position: 0,
                },
            ],
        },
    },
    {
        query: 'amount>200 las vegas category:"Hotel : Marriott"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'amount',
                    position: 0,
                    node: {
                        operator: 'gt',
                        left: 'amount',
                        right: '200',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 11,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'las',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 15,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'vegas',
                    },
                },
                {
                    type: 'filter',
                    key: 'category',
                    position: 21,
                    node: {
                        operator: 'eq',
                        left: 'category',
                        right: 'Hotel : Marriott',
                    },
                },
            ],
        },
    },
    {
        query: 'amount>200 las vegas category:"Hotel : Marriott" date:2024-01-01,2024-02-01 merchant:"Expensify, Inc." tag:hotel,travel,"meals & entertainment"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'amount',
                    position: 0,
                    node: {
                        operator: 'gt',
                        left: 'amount',
                        right: '200',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 11,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'las',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 15,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'vegas',
                    },
                },
                {
                    type: 'filter',
                    key: 'category',
                    position: 21,
                    node: {
                        operator: 'eq',
                        left: 'category',
                        right: 'Hotel : Marriott',
                    },
                },
                {
                    type: 'filter',
                    key: 'date',
                    position: 49,
                    node: {
                        operator: 'eq',
                        left: 'date',
                        right: ['2024-01-01', '2024-02-01'],
                    },
                },
                {
                    type: 'filter',
                    key: 'merchant',
                    position: 76,
                    node: {
                        operator: 'eq',
                        left: 'merchant',
                        right: 'Expensify, Inc.',
                    },
                },
                {
                    type: 'filter',
                    key: 'tag',
                    position: 103,
                    node: {
                        operator: 'eq',
                        left: 'tag',
                        right: ['hotel', 'travel', 'meals & entertainment'],
                    },
                },
            ],
        },
    },
    {
        query: 'type:expense withdrawal-type:expensify-card',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
                right: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD,
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'withdrawalType',
                    position: 13,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_TYPE,
                        right: CONST.SEARCH.WITHDRAWAL_TYPE.EXPENSIFY_CARD,
                    },
                },
            ],
        },
    },
    {
        query: 'type:expense withdrawal-id:1234567890',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
                right: '1234567890',
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'withdrawalID',
                    position: 13,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWAL_ID,
                        right: '1234567890',
                    },
                },
            ],
        },
    },
    {
        query: 'type:expense withdrawn:last-month',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.EXPENSE,
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
                right: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'withdrawn',
                    position: 13,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.WITHDRAWN,
                        right: CONST.SEARCH.DATE_PRESETS.LAST_MONTH,
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat is:read',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: CONST.SEARCH.IS_VALUES.READ,
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'is',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                        right: CONST.SEARCH.IS_VALUES.READ,
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat is:unread',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: CONST.SEARCH.IS_VALUES.UNREAD,
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'is',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                        right: CONST.SEARCH.IS_VALUES.UNREAD,
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat is:pinned',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: CONST.SEARCH.IS_VALUES.PINNED,
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'is',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                        right: CONST.SEARCH.IS_VALUES.PINNED,
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat is:pinned,read,unread',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: [CONST.SEARCH.IS_VALUES.PINNED, CONST.SEARCH.IS_VALUES.READ, CONST.SEARCH.IS_VALUES.UNREAD],
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'is',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                        right: [CONST.SEARCH.IS_VALUES.PINNED, CONST.SEARCH.IS_VALUES.READ, CONST.SEARCH.IS_VALUES.UNREAD],
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat has:attachment',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                right: CONST.SEARCH.HAS_VALUES.ATTACHMENT,
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'has',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                        right: CONST.SEARCH.HAS_VALUES.ATTACHMENT,
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat has:link',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                right: CONST.SEARCH.HAS_VALUES.LINK,
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'has',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                        right: CONST.SEARCH.HAS_VALUES.LINK,
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat has:link,attachment',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                right: [CONST.SEARCH.HAS_VALUES.LINK, CONST.SEARCH.HAS_VALUES.ATTACHMENT],
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'has',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.HAS,
                        right: [CONST.SEARCH.HAS_VALUES.LINK, CONST.SEARCH.HAS_VALUES.ATTACHMENT],
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat is:READ',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: 'READ', // Case is preserved as-is
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'is',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                        right: 'READ',
                    },
                },
            ],
        },
    },
    {
        query: 'type:chat is:PINNED',
        expected: {
            type: CONST.SEARCH.DATA_TYPES.CHAT,
            status: '',
            sortBy: CONST.SEARCH.SYNTAX_FILTER_KEYS.DATE,
            sortOrder: CONST.SEARCH.SORT_ORDER.DESC,
            filters: {
                operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                right: 'PINNED', // Case is preserved as-is
            },
            positionInfo: [
                {
                    type: 'root',
                    key: 'type',
                    position: 0,
                },
                {
                    type: 'filter',
                    key: 'is',
                    position: 10,
                    node: {
                        operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO,
                        left: CONST.SEARCH.SYNTAX_FILTER_KEYS.IS,
                        right: 'PINNED',
                    },
                },
            ],
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
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: [' ', '  '],
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '" "',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 4,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '"  "',
                    },
                },
            ],
        },
    },
    {
        query: '"https://expensify.com" "https://new.expensify.com"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['https://expensify.com', 'https://new.expensify.com'],
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '"https://expensify.com"',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 24,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '"https://new.expensify.com"',
                    },
                },
            ],
        },
    },
    {
        query: '""https://expensify.com"" to ""https://new.expensify.com""', // Nested quotes with a colon
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['"https://expensify.com"', 'to', '"https://new.expensify.com"'],
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '""https://expensify.com""',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 26,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'to',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 29,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '""https://new.expensify.com""',
                    },
                },
            ],
        },
    },
    {
        query: '"""https://expensify.com" to "https://new.expensify.com"""', // Mismatched quotes
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'keyword',
                right: ['""https://expensify.com', 'to', 'https://new.expensify.com""'],
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '"""https://expensify.com"',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 26,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'to',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 29,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '"https://new.expensify.com"""',
                    },
                },
            ],
        },
    },
    {
        query: 'date>2024-01-01 from:usera@user.com "https://expensify.com" "https://new.expensify.com"',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'date',
                    position: 0,
                    node: {
                        operator: 'gt',
                        left: 'date',
                        right: '2024-01-01',
                    },
                },
                {
                    type: 'filter',
                    key: 'from',
                    position: 16,
                    node: {
                        operator: 'eq',
                        left: 'from',
                        right: 'usera@user.com',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 36,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '"https://expensify.com"',
                    },
                },
                {
                    type: 'filter',
                    key: 'keyword',
                    position: 60,
                    node: {
                        operator: 'eq',
                        left: 'keyword',
                        right: '"https://new.expensify.com"',
                    },
                },
            ],
        },
    },
    {
        query: 'from:““Rag” Dog”,"Bag ”Dog“",email@gmail.com,1605423 to:"""Unruly"" “““Glad””” """Dog"""',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
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
            positionInfo: [
                {
                    type: 'filter',
                    key: 'from',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'from',
                        right: ['“Rag” Dog', 'Bag ”Dog“', 'email@gmail.com', '1605423'],
                    },
                },
                {
                    type: 'filter',
                    key: 'to',
                    position: 53,
                    node: {
                        operator: 'eq',
                        left: 'to',
                        right: '""Unruly"" “““Glad””” """Dog""',
                    },
                },
            ],
        },
    },
    {
        query: 'expense-type:per-diem',
        expected: {
            type: 'expense',
            status: CONST.SEARCH.STATUS.EXPENSE.ALL,
            sortBy: 'date',
            sortOrder: 'desc',
            filters: {
                operator: 'eq',
                left: 'expenseType',
                right: 'perDiem',
            },
            positionInfo: [
                {
                    type: 'filter',
                    key: 'expenseType',
                    position: 0,
                    node: {
                        operator: 'eq',
                        left: 'expenseType',
                        right: 'perDiem',
                    },
                },
            ],
        },
    },
];

describe('search parser', () => {
    test.each(tests)(`parsing: $query`, ({query, expected}) => {
        const result = parse(query) as SearchQueryJSON;
        expect(result).toEqual(expected);
    });
});

describe('Testing search parser with special characters and wrapped in quotes.', () => {
    test.each(keywordTests)(`parsing: $query`, ({query, expected}) => {
        const result = parse(query) as SearchQueryJSON;
        expect(result).toEqual(expected);
    });
});
