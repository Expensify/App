/**
 * Values that CONST needs from platform-specific modules, plus Bun-safe fallbacks.
 * Keep this shape runtime-agnostic so translation tooling can import the full CONST barrel.
 */
type ConstRuntime = {
    NEW_EXPENSIFY_URL: string;
    KEY_COMMANDS: {
        keyModifierControl: string;
        keyModifierCommand: string;
        keyModifierShift: string;
        keyModifierShiftControl: string;
        keyModifierShiftCommand: string;
        keyInputEscape: string;
        keyInputEnter: string;
        keyInputUpArrow: string;
        keyInputDownArrow: string;
        keyInputLeftArrow: string;
        keyInputRightArrow: string;
    };
    STYLE_VARIABLES: {
        componentSizeNormal: number;
        navigationTabBarSize: number;
        receiptPreviewMaxWidth: number;
    };
    EXPENSIFY_ACCOUNT_IDS: {
        ACCOUNTING: number;
        ACCOUNTS_PAYABLE: number;
        ADMIN: number;
        BILLS: number;
        CHRONOS: number;
        CONCIERGE: number;
        CONTRIBUTORS: number;
        FIRST_RESPONDER: number;
        HELP: number;
        INTEGRATION_TESTING_CREDS: number;
        NOTIFICATIONS: number;
        PAYROLL: number;
        QA: number;
        QA_TRAVIS: number;
        RECEIPTS: number;
        REWARDS: number;
        STUDENT_AMBASSADOR: number;
        SVFG: number;
        QA_GUIDE: number;
    };
    SEARCH_SNAPSHOT_ONYX_KEYS: readonly string[];
    EXCLUDE_FROM_LAST_VISITED_PATH: readonly string[];
};

const CONST_RUNTIME_DEFAULTS: ConstRuntime = {
    NEW_EXPENSIFY_URL: 'https://new.expensify.com/',
    KEY_COMMANDS: {
        keyModifierControl: 'keyModifierControl',
        keyModifierCommand: 'keyModifierCommand',
        keyModifierShift: 'keyModifierShift',
        keyModifierShiftControl: 'keyModifierShiftControl',
        keyModifierShiftCommand: 'keyModifierShiftCommand',
        keyInputEscape: 'keyInputEscape',
        keyInputEnter: 'keyInputEnter',
        keyInputUpArrow: 'keyInputUpArrow',
        keyInputDownArrow: 'keyInputDownArrow',
        keyInputLeftArrow: 'keyInputLeftArrow',
        keyInputRightArrow: 'keyInputRightArrow',
    },
    STYLE_VARIABLES: {
        componentSizeNormal: 40,
        navigationTabBarSize: 72,
        receiptPreviewMaxWidth: 440,
    },
    EXPENSIFY_ACCOUNT_IDS: {
        ACCOUNTING: 9645353,
        ACCOUNTS_PAYABLE: 10903701,
        ADMIN: -1,
        BILLS: 1371,
        CHRONOS: 10027416,
        CONCIERGE: 8392101,
        CONTRIBUTORS: 9675014,
        FIRST_RESPONDER: 9375152,
        HELP: -1,
        INTEGRATION_TESTING_CREDS: -1,
        NOTIFICATIONS: 11665625,
        PAYROLL: 9679724,
        QA: 3126513,
        QA_TRAVIS: 8595733,
        RECEIPTS: -1,
        REWARDS: 11023767,
        STUDENT_AMBASSADOR: 10476956,
        SVFG: 2012843,
        QA_GUIDE: 14365522,
    },
    SEARCH_SNAPSHOT_ONYX_KEYS: ['report_', 'policy_', 'transactions_', 'transactionViolations_', 'reportActions_', 'personalDetailsList', 'reportNameValuePairs_'],
    EXCLUDE_FROM_LAST_VISITED_PATH: [
        'not-found',
        'SAMLSignIn',
        'ValidateLogin',
        'Dynamic_MigratedUserWelcomeModal_Root',
        'Dynamic_SubmitPlanWelcomeModal_Root',
        'Dynamic_AIFeaturesPromoModal_Root',
        'Money_Request_Step_Scan',
        'Members_Move_To_Group',
        'Multifactor_Authentication_Validate_Code',
        'Multifactor_Authentication_Outcome_Success',
        'Multifactor_Authentication_Outcome_Failure',
        'Multifactor_Authentication_Prompt',
        'Multifactor_Authentication_Revoke',
        'Multifactor_Authentication_Authorize_Transaction',
    ],
};

export default CONST_RUNTIME_DEFAULTS;
export type {ConstRuntime};
