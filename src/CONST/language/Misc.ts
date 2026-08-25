const DELEGATE_ROLE = {
    ALL: 'all',
    SUBMITTER: 'submitter',
} as const;

const DELEGATE = {
    DENIED_ACCESS_VARIANTS: {
        DELEGATE: 'delegate',
        SUBMITTER: 'submitter',
    },
} as const;

export {DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK} from './URLs';

const REFERRAL_PROGRAM = {
    CONTENT_TYPES: {
        SUBMIT_EXPENSE: 'submitExpense',
        START_CHAT: 'startChat',
        REFER_FRIEND: 'referralFriend',
        SHARE_CODE: 'shareCode',
    },
    LEARN_MORE_LINK: 'https://help.expensify.com/articles/new-expensify/expenses/Referral-Program',
    LINK: 'https://join.my.expensify.com',
} as const;

const EXIT_SURVEY = {
    REASONS: {
        FEATURE_NOT_AVAILABLE: 'featureNotAvailable',
        DONT_UNDERSTAND: 'dontUnderstand',
        PREFER_CLASSIC: 'preferClassic',
    },
    BENEFIT: {
        CHATTING_DIRECTLY: 'chattingDirectly',
        EVERYTHING_MOBILE: 'everythingMobile',
        TRAVEL_EXPENSE: 'travelExpense',
    },
} as const;

const CUSTOM_UNITS = {
    DISTANCE_UNIT_MILES: 'mi',
    DISTANCE_UNIT_KILOMETERS: 'km',
} as const;

const INTRO_CHOICES = {
    SUBMIT: 'newDotSubmit',
    MANAGE_TEAM: 'newDotManageTeam',
} as const;

const RTER_VIOLATION_TYPES = {
    BROKEN_CARD_CONNECTION: 'brokenCardConnection',
    BROKEN_CARD_CONNECTION_530: 'brokenCardConnection530',
    SEVEN_DAY_HOLD: 'sevenDayHold',
} as const;

const REPORT_VIOLATIONS = {
    FIELD_REQUIRED: 'fieldRequired',
    RBR_MESSAGE_MAX_CHARACTERS_FOR_PREVIEW: 40,
} as const;

const DOT_SEPARATOR = '•' as const;

const IMPORT_SPREADSHEET = {
    ICON_WIDTH: 180,
    ICON_HEIGHT: 160,
    CATEGORIES_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-categories#import-custom-categories',
    MEMBERS_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Invite-members-and-assign-roles#import-a-group-of-members',
    TAGS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags',
    MULTI_LEVEL_TAGS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags#import-multi-level-tags-from-a-spreadsheet',
    IMPORT_TRANSACTIONS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/Import-Personal-Card-Transactions-From-a-Spreadsheet',
} as const;

const COMPANY_CARDS = {
    STATEMENT_CLOSE_DATE: {
        LAST_DAY_OF_MONTH: 'LAST_DAY_OF_MONTH',
        LAST_BUSINESS_DAY_OF_MONTH: 'LAST_BUSINESS_DAY_OF_MONTH',
        CUSTOM_DAY_OF_MONTH: 'CUSTOM_DAY_OF_MONTH',
    },
} as const;

const UPGRADE_FEATURE_INTRO_MAPPING = {
    approvals: {
        id: 'approvals',
    },
    multiApprovalLevels: {
        id: 'multiApprovalLevels',
    },
} as const;

export {
    COMPANY_CARDS,
    CUSTOM_UNITS,
    DELEGATE,
    DELEGATE_ROLE,
    DOT_SEPARATOR,
    EXIT_SURVEY,
    IMPORT_SPREADSHEET,
    INTRO_CHOICES,
    REFERRAL_PROGRAM,
    REPORT_VIOLATIONS,
    RTER_VIOLATION_TYPES,
    UPGRADE_FEATURE_INTRO_MAPPING,
};
