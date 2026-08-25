const SEARCH = {
    BULK_DUPLICATE_LIMIT: 50,
    DATE_PRESETS: {
        NEVER: 'never',
        LAST_MONTH: 'last-month',
        THIS_MONTH: 'this-month',
        YEAR_TO_DATE: 'year-to-date',
        LAST_12_MONTHS: 'last-12-months',
        LAST_STATEMENT: 'last-statement',
    },
    SORT_ORDER: {
        ASC: 'asc',
        DESC: 'desc',
    },
    GROUP_BY: {
        FROM: 'from',
        CARD: 'card',
        WITHDRAWAL_ID: 'withdrawal-id',
        CATEGORY: 'category',
        MERCHANT: 'merchant',
        TAG: 'tag',
        MONTH: 'month',
        WEEK: 'week',
        YEAR: 'year',
        QUARTER: 'quarter',
    },
    WITHDRAWAL_TYPE: {
        EXPENSIFY_CARD: 'expensify-card',
        REIMBURSEMENT: 'reimbursement',
        TRAVEL_BILLING: 'central-travel-invoicing',
    },
    ACTION_FILTERS: {
        SUBMIT: 'submit',
        APPROVE: 'approve',
        PAY: 'pay',
        EXPORT: 'export',
    },
} as const;

// eslint-disable-next-line import/prefer-default-export -- Preserve the named API used by the extracted CONST module.
export {SEARCH};
