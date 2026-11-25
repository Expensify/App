const FLAT_NAV = {
    SECTION: {
        EXPENSES: 'expenses',
        REPORTS: 'reports',
        ACCOUNTING: 'accounting',
        TRAVEL: 'travel',
        SAVED: 'saved',
    },
    SUBNAV_GROUP: {
        EXPENSE_REPORTS: 'expenseReports',
        ACCOUNTING: 'accounting',
        TRAVEL: 'travel',
        SAVED: 'saved',
    },
    ITEM_TYPE: {
        CANNED_SEARCH: 'cannedSearch',
        SAVED_SEARCH: 'savedSearch',
    },
} as const;

export default FLAT_NAV;
