import type {SearchQueryJSON} from '@components/Search/types';
import * as searchParser from '@libs/SearchParser/searchParser';

const tests = [
    {
        query: 'type:expense status:all',
        expected: {
            type: 'expense',
            status: 'all',
            sortBy: 'date',
            sortOrder: 'desc',
            filters: null,
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
        query: 'amount>100 amount<200 from:usera@user.com taxRate:1234 cardID:1234 reportID:12345 tag:ecx date>2023-01-01',
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
        query: 'amount>200 expenseType:cash,card description:"Las Vegas party" date:2024-06-01 category:travel,hotel,"meal & entertainment"',
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
                                operator: 'or',
                                left: {
                                    operator: 'eq',
                                    left: 'expenseType',
                                    right: 'cash',
                                },
                                right: {
                                    operator: 'eq',
                                    left: 'expenseType',
                                    right: 'card',
                                },
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
                    operator: 'or',
                    left: {
                        operator: 'or',
                        left: {
                            operator: 'eq',
                            left: 'category',
                            right: 'travel',
                        },
                        right: {
                            operator: 'eq',
                            left: 'category',
                            right: 'hotel',
                        },
                    },
                    right: {
                        operator: 'eq',
                        left: 'category',
                        right: 'meal & entertainment',
                    },
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
                    operator: 'or',
                    left: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'las',
                    },
                    right: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'vegas',
                    },
                },
                right: {
                    operator: 'gt',
                    left: 'amount',
                    right: '200',
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
                    operator: 'or',
                    left: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'las',
                    },
                    right: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'vegas',
                    },
                },
                right: {
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
                    operator: 'or',
                    left: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'las',
                    },
                    right: {
                        operator: 'eq',
                        left: 'keyword',
                        right: 'vegas',
                    },
                },
                right: {
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
                                operator: 'or',
                                left: {
                                    operator: 'eq',
                                    left: 'date',
                                    right: '2024-01-01',
                                },
                                right: {
                                    operator: 'eq',
                                    left: 'date',
                                    right: '2024-02-01',
                                },
                            },
                        },
                        right: {
                            operator: 'or',
                            left: {
                                operator: 'eq',
                                left: 'merchant',
                                right: 'Expensify',
                            },
                            right: {
                                operator: 'eq',
                                left: 'merchant',
                                right: 'Inc.',
                            },
                        },
                    },
                    right: {
                        operator: 'or',
                        left: {
                            operator: 'or',
                            left: {
                                operator: 'eq',
                                left: 'tag',
                                right: 'hotel',
                            },
                            right: {
                                operator: 'eq',
                                left: 'tag',
                                right: 'travel',
                            },
                        },
                        right: {
                            operator: 'eq',
                            left: 'tag',
                            right: 'meals & entertainment',
                        },
                    },
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
