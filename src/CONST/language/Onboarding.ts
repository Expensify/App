const ONBOARDING_CHOICES = {
    MANAGE_TEAM: 'newDotManageTeam',
    EMPLOYER: 'newDotEmployer',
    TRACK_BUSINESS: 'newDotTrackWorkspace',
    TRACK_PERSONAL: 'newDotTrackPersonalWorkspace',
    LOOKING_AROUND: 'newDotLookingAround',
    ADMIN: 'newDotAdmin',
    SUBMIT: 'newDotSubmit',
    TRACK_WORKSPACE: 'newDotTrackWorkspace',
    PERSONAL_SPEND: 'newDotPersonalSpend',
    CHAT_SPLIT: 'newDotSplitChat',
    TEST_DRIVE_RECEIVER: 'testDriveReceiver',
} as const;

const ONBOARDING_COMPANY_SIZE = {
    MICRO_SMALL: '1-4',
    MICRO_MEDIUM: '5-10',
    MICRO: '1-10',
    SMALL: '11-50',
    MEDIUM_SMALL: '51-100',
    MEDIUM: '101-1000',
    LARGE: '1001+',
} as const;

const ONBOARDING_PERSONAL_TRACK_GOALS = {
    INVESTMENT_TRACKING: 'InvestmentTracking',
    HOUSEHOLD_TRACKING: 'HouseholdTracking',
    SIDEPROJECT_TRACKING: 'SideprojectTracking',
    SOMETHING_ELSE: 'SomethingElse',
} as const;

const ONBOARDING_ACCOUNTING_MAPPING = {
    quickbooksOnline: 'QuickBooks Online',
    xero: 'Xero',
    netsuite: 'NetSuite',
    intacct: 'Sage Intacct',
    quickbooksDesktop: 'QuickBooks Desktop',
    sap: 'SAP',
    oracle: 'Oracle',
    microsoftDynamics: 'Microsoft Dynamics',
    other: 'accounting software',
} as const;

const ONBOARDING_TASK_TYPE = {
    CREATE_REPORT: 'createReport',
    CREATE_WORKSPACE: 'createWorkspace',
    VIEW_TOUR: 'viewTour',
    SETUP_CATEGORIES: 'setupCategories',
    SUBMIT_EXPENSE: 'submitExpense',
    TRACK_EXPENSE: 'trackExpense',
    ADD_ACCOUNTING_INTEGRATION: 'addAccountingIntegration',
    CONNECT_CORPORATE_CARD: 'connectCorporateCard',
    INVITE_TEAM: 'inviteTeam',
    SETUP_CATEGORIES_AND_TAGS: 'setupCategoriesAndTags',
    SETUP_TAGS: 'setupTags',
    START_CHAT: 'startChat',
    SPLIT_EXPENSE: 'splitExpense',
    REVIEW_WORKSPACE_SETTINGS: 'reviewWorkspaceSettings',
    INVITE_ACCOUNTANT: 'inviteAccountant',
    ADD_EXPENSE_APPROVALS: 'addExpenseApprovals',
} as const;

export {ONBOARDING_ACCOUNTING_MAPPING, ONBOARDING_CHOICES, ONBOARDING_COMPANY_SIZE, ONBOARDING_PERSONAL_TRACK_GOALS, ONBOARDING_TASK_TYPE};
