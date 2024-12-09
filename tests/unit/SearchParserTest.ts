import type {SearchQueryJSON} from '@components/Search/types';
import * as searchParser from '@libs/SearchParser/searchParser';
import parserCommonTests from '../utils/fixtures/searchParsersCommonQueries';

const tests = [
    {
        query: parserCommonTests.simple,
        expected: {
            type: 'expense',
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
            filters: null,
        },
    },
    {
        query: parserCommonTests.userFriendlyNames,
        expected: {
            type: 'expense',
            status: 'all',
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
                    right: 'report',
                },
            },
        },
    },
    {
        query: parserCommonTests.oldNames,
        expected: {
            type: 'expense',
            status: 'all',
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
                    right: 'report',
                },
            },
        },
    },
    {
        query: parserCommonTests.complex,
        expected: {
            type: 'expense',
            status: 'all',
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
        },
    },
    {
        query: ',',
        expected: {
            type: 'expense',
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
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
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
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
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
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
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
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
            status: 'all',
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
        },
    },
    {
        query: 'date>2024-01-01 date<2024-06-01 merchant:"McDonald\'s"',
        expected: {
            type: 'expense',
            status: 'all',
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
        },
    },
    {
        query: 'from:usera@user.com to:userb@user.com date>2024-01-01',
        expected: {
            type: 'expense',
            status: 'all',
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
        },
    },
    {
        query: 'amount>100 amount<200 from:usera@user.com tax-rate:1234 card:1234 reportid:12345 tag:ecx date>2023-01-01',
        expected: {
            type: 'expense',
            status: 'all',
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
        },
    },
    {
        query: 'amount>200 las vegas',
        expected: {
            type: 'expense',
            status: 'all',
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
        },
    },
    {
        query: 'amount>200 las vegas category:"Hotel : Marriott"',
        expected: {
            type: 'expense',
            status: 'all',
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
        },
    },
    {
        query: 'amount>200 las vegas category:"Hotel : Marriott" date:2024-01-01,2024-02-01 merchant:"Expensify, Inc." tag:hotel,travel,"meals & entertainment"',
        expected: {
            type: 'expense',
            status: 'all',
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
        },
    },
];

describe('search parser', () => {
    test.each(tests)(`parsing: $query`, ({query, expected}) => {
        const result = searchParser.parse(query) as SearchQueryJSON;
        expect(result).toEqual(expected);
    });
});
