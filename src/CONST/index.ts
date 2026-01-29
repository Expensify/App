/* eslint-disable @typescript-eslint/naming-convention */
import {add as dateAdd} from 'date-fns';
import {sub as dateSubtract} from 'date-fns/sub';
import Config from 'react-native-config';
import * as KeyCommand from 'react-native-key-command';
import type {ValueOf} from 'type-fest';
import type {SearchFilterKey} from '@components/Search/types';
import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';
import type {MileageRate} from '@libs/DistanceRequestUtils';
import MULTIFACTOR_AUTHENTICATION_VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import addTrailingForwardSlash from '@libs/UrlUtils';
import variables from '@styles/variables';
import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';
import {LOCALES} from './LOCALES';

// Creating a default array and object this way because objects ({}) and arrays ([]) are not stable types.
// Freezing the array ensures that it cannot be unintentionally modified.
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

// Using 28 days to align with OldDot and because all months are guaranteed to be at least 28 days.
const MONTH_DAYS = Object.freeze([...Array(28).keys()].map((i) => i + 1));

const DEFAULT_NUMBER_ID = 0;
const DEFAULT_MISSING_ID = -1;
const DEFAULT_COUNTRY_CODE = 1;
const CLOUDFRONT_DOMAIN = 'cloudfront.net';
const CLOUDFRONT_URL = `https://d2k5nsl2zxldvw.${CLOUDFRONT_DOMAIN}`;
const ACTIVE_EXPENSIFY_URL = addTrailingForwardSlash(Config?.NEW_EXPENSIFY_URL ?? 'https://new.expensify.com');
const USE_EXPENSIFY_URL = 'https://use.expensify.com';
const EXPENSIFY_MOBILE_URL = 'https://expensify.com/mobile';
const EXPENSIFY_URL = 'https://www.expensify.com';
const UBER_CONNECT_URL = 'https://business-integrations.uber.com/connect';
const XERO_PARTNER_LINK = 'https://xero5440.partnerlinks.io/uzfjy4uegog2-v0pj1v';
const UBER_TERMS_LINK = 'https://www.uber.com/us/en/business/sign-up/terms/expense-partners/';
const PLATFORM_OS_MACOS = 'Mac OS';
const PLATFORM_IOS = 'iOS';
const ANDROID_PACKAGE_NAME = 'org.me.mobiexpensifyg';
const CURRENT_YEAR = new Date().getFullYear();
const PULL_REQUEST_NUMBER = Config?.PULL_REQUEST_NUMBER ?? '';
const MAX_DATE = dateAdd(new Date(), {years: 1});
const MIN_DATE = dateSubtract(new Date(), {years: 20});
const EXPENSIFY_POLICY_DOMAIN = 'expensify-policy';
const EXPENSIFY_POLICY_DOMAIN_EXTENSION = '.exfy';

const keyModifierControl = KeyCommand?.constants?.keyModifierControl ?? 'keyModifierControl';
const keyModifierCommand = KeyCommand?.constants?.keyModifierCommand ?? 'keyModifierCommand';
const keyModifierShift = KeyCommand?.constants?.keyModifierShift ?? 'keyModifierShift';
const keyModifierShiftControl = KeyCommand?.constants?.keyModifierShiftControl ?? 'keyModifierShiftControl';
const keyModifierShiftCommand = KeyCommand?.constants?.keyModifierShiftCommand ?? 'keyModifierShiftCommand';
const keyInputEscape = KeyCommand?.constants?.keyInputEscape ?? 'keyInputEscape';
const keyInputEnter = KeyCommand?.constants?.keyInputEnter ?? 'keyInputEnter';
const keyInputUpArrow = KeyCommand?.constants?.keyInputUpArrow ?? 'keyInputUpArrow';
const keyInputDownArrow = KeyCommand?.constants?.keyInputDownArrow ?? 'keyInputDownArrow';
const keyInputLeftArrow = KeyCommand?.constants?.keyInputLeftArrow ?? 'keyInputLeftArrow';
const keyInputRightArrow = KeyCommand?.constants?.keyInputRightArrow ?? 'keyInputRightArrow';
const keyInputSpace = ' ';

// describes if a shortcut key can cause navigation
const KEYBOARD_SHORTCUT_NAVIGATION_TYPE = 'NAVIGATION_SHORTCUT';

const chatTypes = {
    POLICY_ANNOUNCE: 'policyAnnounce',
    POLICY_ADMINS: 'policyAdmins',
    TRIP_ROOM: 'tripRoom',
    GROUP: 'group',
    DOMAIN_ALL: 'domainAll',
    POLICY_ROOM: 'policyRoom',
    POLICY_EXPENSE_CHAT: 'policyExpenseChat',
    SELF_DM: 'selfDM',
    INVOICE: 'invoice',
    SYSTEM: 'system',
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
};

const connectionsVideoPaths = {
    [ONBOARDING_ACCOUNTING_MAPPING.quickbooksOnline]: 'videos/walkthrough-connect_to_qbo-v2.mp4',
    [ONBOARDING_ACCOUNTING_MAPPING.xero]: 'videos/walkthrough-connect_to_xero-v2.mp4',
    [ONBOARDING_ACCOUNTING_MAPPING.netsuite]: 'videos/walkthrough-connect_to_netsuite-v2.mp4',
};

// Explicit type annotation is required
const cardActiveStates: number[] = [2, 3, 4, 7];

const brokenConnectionScrapeStatuses: number[] = [200, 531, 530, 500, 666];

// Hide not issued or not activated cards (states 2, 4) from card filter options in search, as no transactions can be made on cards in these states
const cardHiddenFromSearchStates: number[] = [2, 4];

const selectableOnboardingChoices = {
    PERSONAL_SPEND: 'newDotPersonalSpend',
    MANAGE_TEAM: 'newDotManageTeam',
    EMPLOYER: 'newDotEmployer',
    CHAT_SPLIT: 'newDotSplitChat',
    LOOKING_AROUND: 'newDotLookingAround',
} as const;

const backendOnboardingChoices = {
    ADMIN: 'newDotAdmin',
    SUBMIT: 'newDotSubmit',
    TRACK_WORKSPACE: 'newDotTrackWorkspace',
    TEST_DRIVE_RECEIVER: 'testDriveReceiver',
} as const;

const onboardingChoices = {
    ...selectableOnboardingChoices,
    ...backendOnboardingChoices,
} as const;

const createExpenseOnboardingChoices = {
    PERSONAL_SPEND: selectableOnboardingChoices.PERSONAL_SPEND,
    EMPLOYER: selectableOnboardingChoices.EMPLOYER,
    SUBMIT: backendOnboardingChoices.SUBMIT,
} as const;

const signupQualifiers = {
    INDIVIDUAL: 'individual',
    VSB: 'vsb',
    SMB: 'smb',
} as const;

type OnboardingAccounting = keyof typeof CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY | null;

const onboardingInviteTypes = {
    IOU: 'iou',
    INVOICE: 'invoice',
    CHAT: 'chat',
    WORKSPACE: 'workspace',
} as const;

const onboardingCompanySize = {
    MICRO: '1-10',
    SMALL: '11-50',
    MEDIUM_SMALL: '51-100',
    MEDIUM: '101-1000',
    LARGE: '1001+',
} as const;

type OnboardingInvite = ValueOf<typeof onboardingInviteTypes>;

const EMAIL_WITH_OPTIONAL_DOMAIN =
    /(?=((?=[\w'#%+-]+(?:\.[\w'#%+-]+)*@?)[\w.'#%+-]{1,64}(?:@(?:(?=[a-z\d]+(?:-+[a-z\d]+)*\.)(?:[a-z\d-]{1,63}\.)+[a-z]{2,63}))?(?= |_|\b))(?<end>.*))\S{3,254}(?=\k<end>$)/;

const EMAIL = {
    ACCOUNTING: 'accounting@expensify.com',
    ACCOUNTS_PAYABLE: 'accountspayable@expensify.com',
    ADMIN: 'admin@expensify.com',
    BILLS: 'bills@expensify.com',
    CHRONOS: 'chronos@expensify.com',
    CONCIERGE: 'concierge@expensify.com',
    CONTRIBUTORS: 'contributors@expensify.com',
    FIRST_RESPONDER: 'firstresponders@expensify.com',
    GUIDES_DOMAIN: 'team.expensify.com',
    QA_DOMAIN: 'applause.expensifail.com',
    HELP: 'help@expensify.com',
    INTEGRATION_TESTING_CREDS: 'integrationtestingcreds@expensify.com',
    NOTIFICATIONS: 'notifications@expensify.com',
    PAYROLL: 'payroll@expensify.com',
    QA: 'qa@expensify.com',
    QA_TRAVIS: 'qa+travisreceipts@expensify.com',
    RECEIPTS: 'receipts@expensify.com',
    STUDENT_AMBASSADOR: 'studentambassadors@expensify.com',
    SVFG: 'svfg@expensify.com',
    EXPENSIFY_EMAIL_DOMAIN: '@expensify.com',
    EXPENSIFY_TEAM_EMAIL_DOMAIN: '@team.expensify.com',
    TEAM: 'team@expensify.com',
    MANAGER_MCTEST: 'manager_mctest@expensify.com',
    QA_GUIDE: 'qa.guide@team.expensify.com',
};

const CONST = {
    HEIC_SIGNATURES: [
        '6674797068656963', // 'ftypheic' - Indicates standard HEIC file
        '6674797068656978', // 'ftypheix' - Indicates a variation of HEIC
        '6674797068657631', // 'ftyphevc' - Typically for HEVC encoded media (common in HEIF)
        '667479706d696631', // 'ftypmif1' - Multi-Image Format part of HEIF, broader usage
    ],
    RECENT_WAYPOINTS_NUMBER: 20,
    DEFAULT_DB_NAME: 'OnyxDB',
    DEFAULT_TABLE_NAME: 'keyvaluepairs',
    DEFAULT_ONYX_DUMP_FILE_NAME: 'onyx-state.txt',
    DEFAULT_POLICY_ROOM_CHAT_TYPES: [chatTypes.POLICY_ADMINS, chatTypes.POLICY_ANNOUNCE, chatTypes.DOMAIN_ALL],
    DEFAULT_IMAGE_FILE_NAME: 'image',
    DISABLED_MAX_EXPENSE_VALUE: 10000000000,
    POLICY_BILLABLE_MODES: {
        BILLABLE: 'billable',
        NON_BILLABLE: 'nonBillable',
    },
    TASK_TITLE_DISABLED_RULES: ['image'],
    // Note: Group and Self-DM excluded as these are not tied to a Workspace
    WORKSPACE_ROOM_TYPES: [chatTypes.POLICY_ADMINS, chatTypes.POLICY_ANNOUNCE, chatTypes.DOMAIN_ALL, chatTypes.POLICY_ROOM, chatTypes.POLICY_EXPENSE_CHAT, chatTypes.INVOICE],
    CUSTOM_FIELD_KEYS: {customField1: 'employeeUserID', customField2: 'employeePayrollID'},
    ANDROID_PACKAGE_NAME,
    WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY: 100,
    ANIMATED_HIGHLIGHT_ENTRY_DELAY: 50,
    ANIMATED_HIGHLIGHT_ENTRY_DURATION: 300,
    ANIMATED_HIGHLIGHT_START_DELAY: 10,
    ANIMATED_HIGHLIGHT_START_DURATION: 300,
    ANIMATED_HIGHLIGHT_WORKSPACE_FEATURE_ITEM_END_DELAY: 7000,
    ANIMATED_HIGHLIGHT_WORKSPACE_FEATURE_ITEM_END_DURATION: 3000,
    ANIMATED_HIGHLIGHT_END_DELAY: 800,
    ANIMATED_HIGHLIGHT_END_DURATION: 2000,
    ANIMATED_TRANSITION: 300,
    SIDE_PANEL_ANIMATED_TRANSITION: 300,
    ANIMATED_TRANSITION_FROM_VALUE: 100,
    ANIMATED_PROGRESS_BAR_DELAY: 300,
    ANIMATED_PROGRESS_BAR_OPACITY_DURATION: 300,
    ANIMATED_PROGRESS_BAR_DURATION: 750,
    ANIMATION_IN_TIMING: 100,
    COMPOSER_FOCUS_DELAY: 150,
    ANIMATION_DIRECTION: {
        IN: 'in',
        OUT: 'out',
    },
    ELEMENT_NAME: {
        DIV: 'DIV',
        INPUT: 'INPUT',
        TEXTAREA: 'TEXTAREA',
    },
    POPOVER_ACCOUNT_SWITCHER_POSITION: {
        horizontal: 12 + variables.navigationTabBarSize,
        vertical: 72,
    },
    POPOVER_DROPDOWN_WIDTH: 334,
    POPOVER_DROPDOWN_MIN_HEIGHT: 0,
    POPOVER_DROPDOWN_MAX_HEIGHT: 416,
    POPOVER_MENU_MAX_HEIGHT: 496,
    POPOVER_MENU_MAX_HEIGHT_MOBILE: 432,
    POPOVER_DATE_WIDTH: 338,
    POPOVER_DATE_MAX_HEIGHT: 366,
    POPOVER_DATE_MIN_HEIGHT: 322,
    TOOLTIP_ANIMATION_DURATION: 500,
    DROPDOWN_SCROLL_THRESHOLD: 5,
    // Multiplier for gyroscope animation in order to make it a bit more subtle
    ANIMATION_GYROSCOPE_VALUE: 0.4,
    ANIMATION_PAID_DURATION: 200,
    ANIMATION_SUBMIT_DURATION: 200,
    ANIMATION_SUBMIT_LOADING_STATE_DURATION: 1000,
    ANIMATION_SUBMIT_SUBMITTED_STATE_VISIBLE_DURATION: 1500,
    ANIMATION_PAID_CHECKMARK_DELAY: 300,
    ANIMATION_THUMBS_UP_DURATION: 250,
    ANIMATION_SUBMITTED_DURATION: 250,
    ANIMATION_THUMBS_UP_DELAY: 200,
    ANIMATION_PAID_BUTTON_HIDE_DELAY: 300,
    BACKGROUND_IMAGE_TRANSITION_DURATION: 1000,
    SCREEN_TRANSITION_END_TIMEOUT: 1000,
    LIMIT_TIMEOUT: 2147483647,
    ARROW_HIDE_DELAY: 3000,
    MAX_IMAGE_CANVAS_AREA: 16777216,
    CHUNK_LOAD_ERROR: 'ChunkLoadError',

    API_ATTACHMENT_VALIDATIONS: {
        // 24 megabytes in bytes, this is limit set on servers, do not update without wider internal discussion
        MAX_SIZE: 25165824,

        // 10 megabytes in bytes, this is limit set on servers for receipt images, do not update without wider internal discussion
        RECEIPT_MAX_SIZE: 10485760,

        // An arbitrary size, but the same minimum as in the PHP layer
        MIN_SIZE: 240,

        // Allowed extensions for receipts
        ALLOWED_RECEIPT_EXTENSIONS: ['heif', 'heic', 'jpg', 'jpeg', 'gif', 'png', 'pdf', 'htm', 'html', 'text', 'rtf', 'doc', 'tif', 'tiff', 'msword', 'zip', 'xml', 'message'],

        MAX_FILE_LIMIT: 30,
    },

    // Allowed extensions for spreadsheets import
    ALLOWED_SPREADSHEET_EXTENSIONS: ['xls', 'xlsx', 'csv', 'txt'],

    // Allowed extensions for multilevel tag spreadsheets
    MULTILEVEL_TAG_ALLOWED_SPREADSHEET_EXTENSIONS: ['csv', 'tsv'],

    // Allowed extensions for text files that are used as spreadsheets
    TEXT_SPREADSHEET_EXTENSIONS: ['txt', 'csv'],

    // This is limit set on servers, do not update without wider internal discussion
    API_TRANSACTION_CATEGORY_MAX_LENGTH: 255,

    API_TRANSACTION_TAG_MAX_LENGTH: 255,

    AUTO_AUTH_STATE: {
        NOT_STARTED: 'not-started',
        SIGNING_IN: 'signing-in',
        JUST_SIGNED_IN: 'just-signed-in',
        FAILED: 'failed',
    },

    AUTH_TOKEN_TYPES: {
        ANONYMOUS: 'anonymousAccount',
        SUPPORT: 'support',
    },

    AVATAR_MAX_ATTACHMENT_SIZE: 6291456,

    AVATAR_ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],

    // Minimum width and height size in px for a selected image
    AVATAR_MIN_WIDTH_PX: 80,
    AVATAR_MIN_HEIGHT_PX: 80,

    REPORT_ACTION_AVATARS: {
        TYPE: {
            MULTIPLE: 'multiple',
            MULTIPLE_DIAGONAL: 'multipleDiagonal',
            MULTIPLE_HORIZONTAL: 'multipleHorizontal',
            SUBSCRIPT: 'subscript',
            SINGLE: 'single',
        },
        SORT_BY: {
            ID: 'id',
            NAME: 'name',
            REVERSE: 'reverse',
        },
    },

    // Maximum width and height size in px for a selected image
    AVATAR_MAX_WIDTH_PX: 4096,
    AVATAR_MAX_HEIGHT_PX: 4096,

    LOGO_MAX_SCALE: 1.5,

    MAX_IMAGE_DIMENSION: 2400,

    BREADCRUMB_TYPE: {
        ROOT: 'root',
        STRONG: 'strong',
        NORMAL: 'normal',
    },

    DEFAULT_GROUP_AVATAR_COUNT: 18,
    DEFAULT_AVATAR_COUNT: 24,
    OLD_DEFAULT_AVATAR_COUNT: 8,

    DISPLAY_NAME: {
        // This value is consistent with the BE display name max length limit.
        MAX_LENGTH: 100,
        RESERVED_NAMES: ['Expensify', 'Concierge'],
        EXPENSIFY_CONCIERGE: 'Expensify Concierge',
    },

    GPS: {
        // It's OK to get a cached location that is up to an hour old because the only accuracy needed is the country the user is in
        MAX_AGE: 3600000,

        // 15 seconds, don't wait too long because the server can always fall back to using the IP address
        TIMEOUT: 15000,
    },

    LEGAL_NAME: {
        MAX_LENGTH: 40,
    },

    NAME: {
        MAX_LENGTH: 50,
    },

    REPORT_DESCRIPTION: {
        MAX_LENGTH: 1000,
    },

    PULL_REQUEST_NUMBER,

    // Regex to get link in href prop inside of <a/> component
    REGEX_LINK_IN_ANCHOR: /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi,

    // Regex to read violation value from string given by backend
    VIOLATION_LIMIT_REGEX: /[^0-9]+/g,

    // Validates phone numbers with digits, '+', '-', '()', '.', and spaces
    ACCEPTED_PHONE_CHARACTER_REGEX: /^[0-9+\-().\s]+$/,

    // Prevents consecutive special characters or spaces like '--', '..', '((', '))', or '  '.
    REPEATED_SPECIAL_CHAR_PATTERN: /([-\s().])\1+/,

    MERCHANT_NAME_MAX_BYTES: 255,

    MASKED_PAN_PREFIX: 'XXXXXXXXXXXX',

    REQUEST_PREVIEW: {
        MAX_LENGTH: 83,
    },

    EXPORT_LABELS: {
        NETSUITE: 'NetSuite',
        QBO: 'QuickBooks Online',
        QBD: 'QuickBooks Desktop',
        XERO: 'Xero',
        INTACCT: 'Intacct',
        SAGE_INTACCT: 'Sage Intacct',
        CERTINIA: 'FinancialForce',
        BILLCOM: 'Bill.com',
        ZENEFITS: 'Zenefits',
    },

    REVERSED_TRANSACTION_ATTRIBUTE: 'is-reversed-transaction',
    HIDDEN_MESSAGE_ATTRIBUTE: 'is-hidden-message',

    CALENDAR_PICKER: {
        // Numbers were arbitrarily picked.
        MIN_YEAR: CURRENT_YEAR - 100,
        MAX_YEAR: CURRENT_YEAR + 100,
        MAX_DATE,
        MIN_DATE,
    },

    DATE_BIRTH: {
        MIN_AGE: 0,
        MIN_AGE_FOR_PAYMENT: 18,
        MAX_AGE: 150,
    },

    MULTIFACTOR_AUTHENTICATION: MULTIFACTOR_AUTHENTICATION_VALUES,

    DESKTOP_SHORTCUT_ACCELERATOR: {
        PASTE_AND_MATCH_STYLE: 'Option+Shift+CmdOrCtrl+V',
        PASTE_AS_PLAIN_TEXT: 'CmdOrCtrl+Shift+V',
    },

    // This is used to enable a rotation/transform style to any component.
    DIRECTION: {
        LEFT: 'left',
        RIGHT: 'right',
    },

    ASSIGN_CARD_BUTTON_TEST_ID: 'assignCardButtonTestID',
    // Sizes needed for report empty state background image handling
    EMPTY_STATE_BACKGROUND: {
        ASPECT_RATIO: 3.72,
        OVERLAP: 60,
        SMALL_SCREEN: {
            IMAGE_HEIGHT: 300,
        },
        WIDE_SCREEN: {
            IMAGE_HEIGHT: 450,
        },
    },

    NEW_EXPENSIFY_URL: ACTIVE_EXPENSIFY_URL,
    UBER_CONNECT_URL,
    XERO_PARTNER_LINK,
    UBER_TERMS_LINK,
    APP_DOWNLOAD_LINKS: {
        ANDROID: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
        IOS: 'https://apps.apple.com/us/app/expensify-travel-expense/id471713959',
        OLD_DOT_ANDROID: 'https://play.google.com/store/apps/details?id=org.me.mobiexpensifyg&hl=en_US&pli=1',
        OLD_DOT_IOS: 'https://apps.apple.com/us/app/expensify-expense-tracker/id471713959',
    },
    COMPANY_WEBSITE_DEFAULT_SCHEME: 'http',
    DATE: {
        SQL_DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
        FNS_FORMAT_STRING: 'yyyy-MM-dd',
        FNS_DATE_TIME_FORMAT_STRING: 'yyyy-MM-dd HH:mm:ss',
        LOCAL_TIME_FORMAT: 'h:mm a',
        YEAR_MONTH_FORMAT: 'yyyyMM',
        MONTH_FORMAT: 'MMMM',
        WEEKDAY_TIME_FORMAT: 'eeee',
        MONTH_DAY_ABBR_FORMAT: 'MMM d',
        SHORT_DATE_FORMAT: 'MM-dd',
        MONTH_DAY_YEAR_ABBR_FORMAT: 'MMM d, yyyy',
        MONTH_DAY_YEAR_FORMAT: 'MMMM d, yyyy',
        FNS_TIMEZONE_FORMAT_STRING: "yyyy-MM-dd'T'HH:mm:ssXXX",
        FNS_DB_FORMAT_STRING: 'yyyy-MM-dd HH:mm:ss.SSS',
        LONG_DATE_FORMAT_WITH_WEEKDAY: 'eeee, MMMM d, yyyy',
        UNIX_EPOCH: '1970-01-01 00:00:00.000',
        MAX_DATE: '9999-12-31',
        MIN_DATE: '0001-01-01',
        ORDINAL_DAY_OF_MONTH: 'do',
        MONTH_DAY_YEAR_ORDINAL_FORMAT: 'MMMM do, yyyy',
        SECONDS_PER_DAY: 24 * 60 * 60,
        MONTH_DAYS,
    },
    SMS: {
        DOMAIN: '@expensify.sms',
        RECEIPTS_PHONE_NUMBER: '47777',
    },
    DOCUSIGN_POWERFORM_LINK: {
        US: 'https://powerforms.docusign.net/ddc56dcb-9cc7-4b36-997c-fea9327f570e?env=na1&acct=cf4cc39a-1c3e-4c19-bbf9-71844e1bcbde&accountId=cf4cc39a-1c3e-4c19-bbf9-71844e1bcbde',
        CA: 'https://powerforms.docusign.net/efc57fcc-0d5d-43c3-a175-1687ad456242?env=na1&acct=cf4cc39a-1c3e-4c19-bbf9-71844e1bcbde&accountId=cf4cc39a-1c3e-4c19-bbf9-71844e1bcbde',
        AU: 'https://powerforms.docusign.net/2ff347bb-172a-4138-b1cd-4001a7c319b5?env=na1&acct=cf4cc39a-1c3e-4c19-bbf9-71844e1bcbde&accountId=cf4cc39a-1c3e-4c19-bbf9-71844e1bcbde',
    },
    BANK_ACCOUNT: {
        BENEFICIAL_OWNER_INFO_STEP: {
            SUBSTEP: {
                IS_USER_UBO: 1,
                IS_ANYONE_ELSE_UBO: 2,
                UBO_DETAILS_FORM: 3,
                ARE_THERE_MORE_UBOS: 4,
                UBOS_LIST: 5,
            },
            BENEFICIAL_OWNER_DATA: {
                BENEFICIAL_OWNER_KEYS: 'beneficialOwnerKeys',
                PREFIX: 'beneficialOwner',
                FIRST_NAME: 'firstName',
                LAST_NAME: 'lastName',
                DOB: 'dob',
                SSN_LAST_4: 'ssnLast4',
                STREET: 'street',
                CITY: 'city',
                STATE: 'state',
                ZIP_CODE: 'zipCode',
            },
        },
        PLAID: {
            ALLOWED_THROTTLED_COUNT: 2,
            ERROR: {
                TOO_MANY_ATTEMPTS: 'Too many attempts',
            },
            EVENTS_NAME: {
                OPEN: 'OPEN',
                EXIT: 'EXIT',
            },
        },
        ERROR: {
            MISSING_ROUTING_NUMBER: '402 Missing routingNumber',
            MAX_ROUTING_NUMBER: '402 Maximum Size Exceeded routingNumber',
            MISSING_INCORPORATION_STATE: '402 Missing incorporationState in additionalData',
            MISSING_INCORPORATION_TYPE: '402 Missing incorporationType in additionalData',
        },
        STEP: {
            // In the order they appear in the VBA flow
            COUNTRY: 'CountryStep',
            BANK_ACCOUNT: 'BankAccountStep',
            REQUESTOR: 'RequestorStep',
            COMPANY: 'CompanyStep',
            BENEFICIAL_OWNERS: 'BeneficialOwnersStep',
            ACH_CONTRACT: 'ACHContractStep',
            VALIDATION: 'ValidationStep',
            ENABLE: 'EnableStep',
        },
        STEP_NAMES: ['1', '2', '3', '4', '5', '6'],
        SUBSTEP: {
            MANUAL: 'manual',
            PLAID: 'plaid',
        },
        STEPS_HEADER_HEIGHT: 40,
        VERIFICATIONS: {
            ERROR_MESSAGE: 'verifications.errorMessage',
            THROTTLED: 'verifications.throttled',
        },
        FIELDS_TYPE: {
            LOCAL: 'local',
        },
        ONFIDO_RESPONSE: {
            SDK_TOKEN: 'apiResult.sdkToken',
            PASS: 'pass',
        },
        QUESTIONS: {
            QUESTION: 'apiResult.questions.question',
            DIFFERENTIATOR_QUESTION: 'apiResult.differentiator-question',
        },
        SETUP_TYPE: {
            MANUAL: 'manual',
            PLAID: 'plaid',
            NONE: '',
        },
        REGEX: {
            US_ACCOUNT_NUMBER: /^[0-9]{4,17}$/,

            // The back-end is always returning account number with 4 last digits and mask the rest with X
            MASKED_US_ACCOUNT_NUMBER: /^[X]{0,13}[0-9]{4}$/,
            SWIFT_BIC: /^[A-Za-z0-9]{8,11}$/,
        },
        VERIFICATION_MAX_ATTEMPTS: 7,
        STATE: {
            VERIFYING: 'VERIFYING',
            VALIDATING: 'VALIDATING',
            SETUP: 'SETUP',
            PENDING: 'PENDING',
            OPEN: 'OPEN',
            DELETED: 'DELETED',
            LOCKED: 'LOCKED',
        },
        MAX_LENGTH: {
            FULL_SSN: 9,
            SSN: 4,
            ZIP_CODE: 10,
        },
        TYPE: {
            BUSINESS: 'BUSINESS',
            PERSONAL: 'PERSONAL',
        },
    },
    NON_USD_BANK_ACCOUNT: {
        ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png'],
        FILE_LIMIT: 1,
        TOTAL_FILES_SIZE_LIMIT: 5242880,
        PURPOSE_OF_TRANSACTION_ID: 'Intercompany_Payment',
        CURRENT_USER_KEY: 'currentUser',
        CORPAY_UNDEFINED_OPTION_VALUE: 'Undefined',
        STEP: {
            COUNTRY: 'CountryStep',
            BANK_INFO: 'BankInfoStep',
            BUSINESS_INFO: 'BusinessInfoStep',
            BENEFICIAL_OWNER_INFO: 'BeneficialOwnerInfoStep',
            SIGNER_INFO: 'SignerInfoStep',
            AGREEMENTS: 'AgreementsStep',
            DOCUSIGN: 'DocusignStep',
            FINISH: 'FinishStep',
        },
        BANK_INFO_STEP_ACH_DATA_INPUT_IDS: {
            ACCOUNT_HOLDER_NAME: 'addressName',
            ACCOUNT_HOLDER_REGION: 'addressState',
            ACCOUNT_HOLDER_CITY: 'addressCity',
            ACCOUNT_HOLDER_ADDRESS: 'addressStreet',
            ACCOUNT_HOLDER_POSTAL_CODE: 'addressZipCode',
            ROUTING_CODE: 'routingNumber',
        },
        BUSINESS_INFO_STEP: {
            PICKLIST: {
                ANNUAL_VOLUME_RANGE: 'AnnualVolumeRange',
                APPLICANT_TYPE: 'ApplicantType',
                NATURE_OF_BUSINESS: 'NatureOfBusiness',
                PURPOSE_OF_TRANSACTION: 'PurposeOfTransaction',
                TRADE_VOLUME_RANGE: 'TradeVolumeRange',
                BUSINESS_TYPE: 'BusinessType',
            },
        },
        BENEFICIAL_OWNER_INFO_STEP: {
            SUBSTEP: {
                IS_USER_BENEFICIAL_OWNER: 1,
                IS_ANYONE_ELSE_BENEFICIAL_OWNER: 2,
                BENEFICIAL_OWNER_DETAILS_FORM: 3,
                ARE_THERE_MORE_BENEFICIAL_OWNERS: 4,
                BENEFICIAL_OWNERS_LIST: 5,
            },
            BENEFICIAL_OWNER_DATA: {
                BENEFICIAL_OWNER_KEYS: 'beneficialOwnerKeys',
                PREFIX: 'beneficialOwner',
                FIRST_NAME: 'firstName',
                LAST_NAME: 'lastName',
                NATIONALITY: 'nationality',
                OWNERSHIP_PERCENTAGE: 'ownershipPercentage',
                DOB: 'dob',
                SSN_LAST_4: 'ssnLast4',
                STREET: 'street',
                CITY: 'city',
                STATE: 'state',
                ZIP_CODE: 'zipCode',
                COUNTRY: 'country',
                PROOF_OF_OWNERSHIP: 'proofOfBeneficialOwner',
                COPY_OF_ID: 'copyOfIDForBeneficialOwner',
                ADDRESS_PROOF: 'addressProofForBeneficialOwner',
                CODICE_FISCALE: 'codiceFisclaleTaxID',
                FULL_NAME: 'fullName',
                RESIDENTIAL_ADDRESS: 'residentialAddress',
            },
        },
        STEP_NAMES: ['1', '2', '3', '4', '5', '6'],
        DOCUSIGN_REQUIRED_STEP_NAMES: ['1', '2', '3', '4', '5', '6', '7'],
        STEP_HEADER_HEIGHT: 40,
        SIGNER_INFO_STEP: {
            SUBSTEP: {
                IS_DIRECTOR: 1,
                ENTER_EMAIL: 2,
                SIGNER_DETAILS_FORM: 3,
                DIRECTOR_DETAILS_FORM: 4,
                HANG_TIGHT: 5,
            },
            SIGNER_INFO_DATA: {
                SIGNER_PREFIX: 'signer',
                FULL_NAME: 'signerFullName',
                DATE_OF_BIRTH: 'signerDateOfBirth',
                JOB_TITLE: 'signerJobTitle',
                EMAIL: 'signerEmail',
                ADDRESS: 'signerCompleteResidentialAddress',
                STREET: 'signer_street',
                CITY: 'signer_city',
                STATE: 'signer_state',
                ZIP_CODE: 'signer_zipCode',
                COUNTRY: 'signer_nationality',
                PROOF_OF_DIRECTORS: 'proofOfDirectors',
                COPY_OF_ID: 'signerCopyOfID',
                ADDRESS_PROOF: 'signerAddressProof',
                CODICE_FISCALE: 'signerCodiceFiscale',
                DOWNLOADED_PDS_AND_FSG: 'downloadedPDSandFSG',
            },
        },
        BANK_INFO_STEP_ACCOUNT_HOLDER_KEY_PREFIX: 'accountHolder',
        STATE: {
            VERIFYING: 'VERIFYING',
            VALIDATING: 'VALIDATING',
            SETUP: 'SETUP',
            PENDING: 'PENDING',
            OPEN: 'OPEN',
            DELETED: 'DELETED',
            LOCKED: 'LOCKED',
        },
    },
    ENABLE_GLOBAL_REIMBURSEMENTS: {
        STEP_NAMES: ['1', '2', '3'],
        STEP: {
            BUSINESS_INFO: 'BusinessInfoStep',
            AGREEMENTS: 'AgreementsStep',
            DOCUSIGN: 'DocusignStep',
        },
        ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    ENTER_SIGNER_INFO: {
        ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png'],
    },
    INCORPORATION_TYPES: {
        LLC: 'LLC',
        CORPORATION: 'Corp',
        PARTNERSHIP: 'Partnership',
        COOPERATIVE: 'Cooperative',
        SOLE_PROPRIETORSHIP: 'Sole Proprietorship',
        OTHER: 'Other',
    },
    BETAS: {
        ALL: 'all',
        ASAP_SUBMIT: 'asapSubmit',
        DEFAULT_ROOMS: 'defaultRooms',
        PREVENT_SPOTNANA_TRAVEL: 'preventSpotnanaTravel',
        REPORT_FIELDS_FEATURE: 'reportFieldsFeature',
        NETSUITE_USA_TAX: 'netsuiteUsaTax',
        PER_DIEM: 'newDotPerDiem',
        NEWDOT_MANAGER_MCTEST: 'newDotManagerMcTest',
        CUSTOM_RULES: 'customRules',
        IS_TRAVEL_VERIFIED: 'isTravelVerified',
        TRAVEL_INVOICING: 'travelInvoicing',
        EXPENSIFY_CARD_EU_UK: 'expensifyCardEuUk',
        TIME_TRACKING: 'timeTracking',
        EUR_BILLING: 'eurBilling',
        NO_OPTIMISTIC_TRANSACTION_THREADS: 'noOptimisticTransactionThreads',
        UBER_FOR_BUSINESS: 'uberForBusiness',
        CUSTOM_REPORT_NAMES: 'newExpensifyCustomReportNames',
        ZERO_EXPENSES: 'zeroExpenses',
        NEW_DOT_DEW: 'newDotDEW',
        GPS_MILEAGE: 'gpsMileage',
        NEW_DOT_HOME: 'newDotHome',
    },
    BUTTON_STATES: {
        DEFAULT: 'default',
        ACTIVE: 'active',
        PRESSED: 'pressed',
        COMPLETE: 'complete',
        DISABLED: 'disabled',
    },
    BANK_ACCOUNT_TYPES: {
        WALLET: 'WALLET',
    },
    COUNTRY: {
        US: 'US',
        MX: 'MX',
        AU: 'AU',
        CA: 'CA',
        GB: 'GB',
        IT: 'IT',
        PR: 'PR',
        GU: 'GU',
        VI: 'VI',
    },
    SWIPE_DIRECTION: {
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right',
        UP: 'up',
    },
    DESKTOP_DEEPLINK_APP_STATE: {
        CHECKING: 'checking',
        INSTALLED: 'installed',
        NOT_INSTALLED: 'not-installed',
    },
    TAX_RATES: {
        CUSTOM_NAME_MAX_LENGTH: 8,
        NAME_MAX_LENGTH: 50,
    },
    PLATFORM: {
        IOS: 'ios',
        ANDROID: 'android',
        WEB: 'web',
        MOBILE_WEB: 'mobileweb',
    },
    PLATFORM_SPECIFIC_KEYS: {
        CTRL: {
            DEFAULT: 'control',
            [PLATFORM_OS_MACOS]: 'meta',
            [PLATFORM_IOS]: 'meta',
        },
        SHIFT: {
            DEFAULT: 'shift',
        },
        ENTER: {
            DEFAULT: 'enter',
        },
    },
    KEYBOARD_SHORTCUTS: {
        MARK_ALL_MESSAGES_AS_READ: {
            descriptionKey: 'markAllMessagesAsRead',
            shortcutKey: 'Escape',
            modifiers: ['SHIFT'],
            trigger: {
                DEFAULT: {input: keyInputEscape, modifierFlags: keyModifierShift},
            },
        },
        SEARCH: {
            descriptionKey: 'search',
            shortcutKey: 'K',
            modifiers: ['CTRL'],
            trigger: {
                DEFAULT: {input: 'k', modifierFlags: keyModifierControl},
                [PLATFORM_OS_MACOS]: {input: 'k', modifierFlags: keyModifierCommand},
                [PLATFORM_IOS]: {input: 'k', modifierFlags: keyModifierCommand},
            },
            type: KEYBOARD_SHORTCUT_NAVIGATION_TYPE,
        },
        NEW_CHAT: {
            descriptionKey: 'newChat',
            shortcutKey: 'K',
            modifiers: ['CTRL', 'SHIFT'],
            trigger: {
                DEFAULT: {input: 'k', modifierFlags: keyModifierShiftControl},
                [PLATFORM_OS_MACOS]: {input: 'k', modifierFlags: keyModifierShiftCommand},
                [PLATFORM_IOS]: {input: 'k', modifierFlags: keyModifierShiftCommand},
            },
            type: KEYBOARD_SHORTCUT_NAVIGATION_TYPE,
        },
        SHORTCUTS: {
            descriptionKey: 'openShortcutDialog',
            shortcutKey: 'J',
            modifiers: ['CTRL'],
            trigger: {
                DEFAULT: {input: 'j', modifierFlags: keyModifierControl},
                [PLATFORM_OS_MACOS]: {input: 'j', modifierFlags: keyModifierCommand},
                [PLATFORM_IOS]: {input: 'j', modifierFlags: keyModifierCommand},
            },
        },
        ESCAPE: {
            descriptionKey: 'escape',
            shortcutKey: 'Escape',
            modifiers: [],
            trigger: {
                DEFAULT: {input: keyInputEscape},
                [PLATFORM_OS_MACOS]: {input: keyInputEscape},
                [PLATFORM_IOS]: {input: keyInputEscape},
            },
        },
        ENTER: {
            descriptionKey: null,
            shortcutKey: 'Enter',
            modifiers: [],
            trigger: {
                DEFAULT: {input: keyInputEnter},
                [PLATFORM_OS_MACOS]: {input: keyInputEnter},
                [PLATFORM_IOS]: {input: keyInputEnter},
            },
        },
        CTRL_ENTER: {
            descriptionKey: null,
            shortcutKey: 'Enter',
            modifiers: ['CTRL'],
            trigger: {
                DEFAULT: {input: keyInputEnter, modifierFlags: keyModifierControl},
                [PLATFORM_OS_MACOS]: {input: keyInputEnter, modifierFlags: keyModifierCommand},
                [PLATFORM_IOS]: {input: keyInputEnter, modifierFlags: keyModifierCommand},
            },
        },
        COPY: {
            descriptionKey: 'copy',
            shortcutKey: 'C',
            modifiers: ['CTRL'],
            trigger: {
                DEFAULT: {input: 'c', modifierFlags: keyModifierControl},
                [PLATFORM_OS_MACOS]: {input: 'c', modifierFlags: keyModifierCommand},
                [PLATFORM_IOS]: {input: 'c', modifierFlags: keyModifierCommand},
            },
        },
        ARROW_UP: {
            descriptionKey: null,
            shortcutKey: 'ArrowUp',
            modifiers: [],
            trigger: {
                DEFAULT: {input: keyInputUpArrow},
                [PLATFORM_OS_MACOS]: {input: keyInputUpArrow},
                [PLATFORM_IOS]: {input: keyInputUpArrow},
            },
        },
        ARROW_DOWN: {
            descriptionKey: null,
            shortcutKey: 'ArrowDown',
            modifiers: [],
            trigger: {
                DEFAULT: {input: keyInputDownArrow},
                [PLATFORM_OS_MACOS]: {input: keyInputDownArrow},
                [PLATFORM_IOS]: {input: keyInputDownArrow},
            },
        },
        ARROW_LEFT: {
            descriptionKey: null,
            shortcutKey: 'ArrowLeft',
            modifiers: [],
            trigger: {
                DEFAULT: {input: keyInputLeftArrow},
                [PLATFORM_OS_MACOS]: {input: keyInputLeftArrow},
                [PLATFORM_IOS]: {input: keyInputLeftArrow},
            },
        },
        ARROW_RIGHT: {
            descriptionKey: null,
            shortcutKey: 'ArrowRight',
            modifiers: [],
            trigger: {
                DEFAULT: {input: keyInputRightArrow},
                [PLATFORM_OS_MACOS]: {input: keyInputRightArrow},
                [PLATFORM_IOS]: {input: keyInputRightArrow},
            },
        },
        TAB: {
            descriptionKey: null,
            shortcutKey: 'Tab',
            modifiers: [],
        },
        DEBUG: {
            descriptionKey: 'openDebug',
            shortcutKey: 'D',
            modifiers: ['CTRL'],
            trigger: {
                DEFAULT: {input: 'd', modifierFlags: keyModifierControl},
                [PLATFORM_OS_MACOS]: {input: 'd', modifierFlags: keyModifierCommand},
                [PLATFORM_IOS]: {input: 'd', modifierFlags: keyModifierCommand},
            },
        },
        BACKSPACE: {
            descriptionKey: null,
            shortcutKey: 'Backspace',
            modifiers: [],
        },
        SPACE: {
            descriptionKey: null,
            shortcutKey: 'Space',
            modifiers: [],
            trigger: {
                DEFAULT: {input: keyInputSpace},
            },
        },
    },
    KEYBOARD_SHORTCUTS_TYPES: {
        NAVIGATION_SHORTCUT: KEYBOARD_SHORTCUT_NAVIGATION_TYPE,
    },
    KEYBOARD_SHORTCUT_KEY_DISPLAY_NAME: {
        CONTROL: 'CTRL',
        ESCAPE: 'ESC',
        META: 'CMD',
        SHIFT: 'Shift',
    },
    CURRENCY: {
        USD: 'USD',
        AUD: 'AUD',
        CAD: 'CAD',
        GBP: 'GBP',
        NZD: 'NZD',
        EUR: 'EUR',
    },
    SCA_CURRENCIES: new Set(['GBP', 'EUR']),
    get DIRECT_REIMBURSEMENT_CURRENCIES() {
        return [this.CURRENCY.USD, this.CURRENCY.AUD, this.CURRENCY.CAD, this.CURRENCY.GBP, this.CURRENCY.EUR];
    },
    TRIAL_DURATION_DAYS: 8,
    EXAMPLE_PHONE_NUMBER: '+15005550006',
    FORMATTED_EXAMPLE_PHONE_NUMBER: '+1-(201)-867-5309',
    CONCIERGE_CHAT_NAME: 'Concierge',
    CLOUDFRONT_URL,
    connectionsVideoPaths,
    EMPTY_ARRAY,
    EMPTY_OBJECT,
    DEFAULT_NUMBER_ID,
    DEFAULT_MISSING_ID,
    DEFAULT_COUNTRY_CODE,
    FAKE_REPORT_ID: 'FAKE_REPORT_ID',
    USE_EXPENSIFY_URL,
    EXPENSIFY_URL,
    EXPENSIFY_MOBILE_URL,
    GOOGLE_MEET_URL_ANDROID: 'https://meet.google.com',
    GOOGLE_DOC_IMAGE_LINK_MATCH: 'googleusercontent.com',
    IMAGE_BASE64_MATCH: 'base64',
    DEEPLINK_BASE_URL: 'new-expensify://',
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    CLOUDFRONT_DOMAIN_REGEX: /^https:\/\/\w+\.cloudfront\.net/i,
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    CONCIERGE_ICON_URL_2021: `${CLOUDFRONT_URL}/images/icons/concierge_2021.png`,
    CONCIERGE_ICON_URL: `${CLOUDFRONT_URL}/images/icons/concierge_2022.png`,
    COMPANY_CARD_PLAID: `${CLOUDFRONT_URL}/images/plaid/`,
    UPWORK_URL: 'https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22',
    DEEP_DIVE_EXPENSIFY_CARD: 'https://community.expensify.com/discussion/4848/deep-dive-expensify-card-and-quickbooks-online-auto-reconciliation-how-it-works',
    DEEP_DIVE_ERECEIPTS: 'https://community.expensify.com/discussion/5542/deep-dive-what-are-ereceipts/',
    DEEP_DIVE_PER_DIEM: 'https://community.expensify.com/discussion/4772/how-to-add-a-single-rate-per-diem',
    SET_NOTIFICATION_LINK: 'https://community.expensify.com/discussion/5651/deep-dive-best-practices-when-youre-running-into-trouble-receiving-emails-from-expensify',
    GITHUB_URL: 'https://github.com/Expensify/App',
    HELP_LINK_URL: `${USE_EXPENSIFY_URL}/usa-patriot-act`,
    REGISTRATION_NUMBER_HELP_URL: {
        AU: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-Australia',
        CA: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-Canada',
        EU: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-Europe',
        UK: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-United-Kingdom',
        US: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Global-Reimbursement-United-States',
    },
    ELECTRONIC_DISCLOSURES_URL: `${USE_EXPENSIFY_URL}/esignagreement`,
    GITHUB_RELEASE_URL: 'https://api.github.com/repos/expensify/app/releases/latest',
    ADD_SECONDARY_LOGIN_URL: encodeURI('settings?param={"section":"account","openModal":"secondaryLogin"}'),
    MANAGE_CARDS_URL: 'domain_companycards',
    FEES_URL: `${EXPENSIFY_URL}/fees`,
    SAVE_WITH_EXPENSIFY_URL: `${USE_EXPENSIFY_URL}/savings-calculator`,
    CFPB_PREPAID_URL: 'https://cfpb.gov/prepaid',
    STAGING_NEW_EXPENSIFY_URL: 'https://staging.new.expensify.com',
    PR_TESTING_NEW_EXPENSIFY_URL: `https://${Config?.PULL_REQUEST_NUMBER}.pr-testing.expensify.com`,
    NEWHELP_URL: 'https://help.expensify.com',
    WHATS_NEW_URL: `${USE_EXPENSIFY_URL}/blog?category=Product%20Updates`,
    INTERNAL_DEV_EXPENSIFY_URL: 'https://www.expensify.com.dev',
    IMPORT_TAGS_EXPENSIFY_URL: 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-tags#import-a-spreadsheet-1',
    IMPORT_TAGS_EXPENSIFY_URL_DEPENDENT_TAGS: 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-tags#multi-level-tags',
    STAGING_EXPENSIFY_URL: 'https://staging.expensify.com',
    DENIED_CAMERA_ACCESS_INSTRUCTIONS_URL:
        'https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-an-Expense#how-do-i-enable-camera-access-for-mobile-browsers-so-i-can-take-photos-of-my-receipts',
    BANK_ACCOUNT_PERSONAL_DOCUMENTATION_INFO_URL:
        'https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account',
    PERSONAL_DATA_PROTECTION_INFO_URL: 'https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information',
    ONFIDO_FACIAL_SCAN_POLICY_URL: 'https://onfido.com/facial-scan-policy-and-release/',
    ONFIDO_PRIVACY_POLICY_URL: 'https://onfido.com/privacy/',
    ONFIDO_TERMS_OF_SERVICE_URL: 'https://onfido.com/terms-of-service/',
    LIST_OF_RESTRICTED_BUSINESSES:
        'https://help.expensify.com/articles/expensify-classic/bank-accounts-and-payments/bank-accounts/Connect-US-Business-Bank-Account#are-there-certain-industries-or-businesses-for-which-expensify-cannot-process-automatic-in-app-payments',
    TRAVEL_TERMS_URL: `${EXPENSIFY_URL}/travelterms`,
    EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT: 'https://www.expensify.com/tools/integrations/downloadPackage',
    EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT_FILE_NAME: 'ExpensifyPackageForSageIntacct',
    SAGE_INTACCT_INSTRUCTIONS: 'https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/Sage-Intacct',
    HOW_TO_CONNECT_TO_SAGE_INTACCT: 'https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/Sage-Intacct#how-to-connect-to-sage-intacct',
    PRICING: `https://www.expensify.com/pricing`,
    COMPANY_CARDS_HELP: 'https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Commercial-Card-Feeds',
    COMPANY_CARDS_MASTERCARD_COMMERCIAL_CARDS:
        'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#how-to-set-up-a-mastercard-commercial-feed',
    COMPANY_CARDS_DELIVERY_FILE_HELP: {
        cdf: 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#steps-to-add-a-mastercard-commercial-feed',
        vcf: 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#steps-to-add-a-visa-commercial-feed',
        gl1025: 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#steps-to-add-an-american-express-corporate-feed',
    },
    COMPANY_CARDS_VISA_COMMERCIAL_CARD_HELP: 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#how-to-set-up-a-visa-commercial-feed',
    COMPANY_CARDS_AMEX_COMMERCIAL_CARD_HELP:
        'https://help.expensify.com/articles/new-expensify/connect-credit-cards/company-cards/Commercial-feeds#how-to-set-up-an-american-express-corporate-feed',
    COMPANY_CARDS_STRIPE_HELP: 'https://dashboard.stripe.com/login?redirect=%2Fexpenses%2Fsettings',
    COMPANY_CARDS_CONNECT_CREDIT_CARDS_HELP_URL: 'https://help.expensify.com/new-expensify/hubs/connect-credit-cards/',
    CUSTOM_REPORT_NAME_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#formulas',
    CONFIGURE_REIMBURSEMENT_SETTINGS_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/workspaces/Configure-Reimbursement-Settings',
    CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL: 'https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules',
    SELECT_WORKFLOWS_HELP_URL: 'https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows',
    COPILOT_HELP_URL: 'https://help.expensify.com/articles/new-expensify/settings/Add-or-Act-As-a-Copilot',
    BULK_UPLOAD_HELP_URL: 'https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-an-Expense#option-4-bulk-upload-receipts-desktop-only',
    ENCRYPTION_AND_SECURITY_HELP_URL: 'https://help.expensify.com/articles/new-expensify/settings/Encryption-and-Data-Security',
    PLAN_TYPES_AND_PRICING_HELP_URL: 'https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Plan-types-and-pricing',
    COLLECT_UPGRADE_HELP_URL: 'https://help.expensify.com/Hidden/collect-upgrade',
    MERGE_ACCOUNT_HELP_URL: 'https://help.expensify.com/articles/new-expensify/settings/Merge-Accounts',
    CONNECT_A_BUSINESS_BANK_ACCOUNT_HELP_URL: 'https://help.expensify.com/articles/new-expensify/expenses-&-payments/Connect-a-Business-Bank-Account',
    DOMAIN_VERIFICATION_HELP_URL: 'https://help.expensify.com/articles/new-expensify/workspaces/Claim-and-Verify-a-Domain',
    SAML_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/domains/Managing-Single-Sign-On-(SSO)-in-Expensify',
    REGISTER_FOR_WEBINAR_URL: 'https://events.zoom.us/eo/Aif1I8qCi1GZ7KnLnd1vwGPmeukSRoPjFpyFAZ2udQWn0-B86e1Z~AggLXsr32QYFjq8BlYLZ5I06Dg',
    TEST_RECEIPT_URL: `${CLOUDFRONT_URL}/images/fake-receipt__tacotodds.png`,
    // Use Environment.getEnvironmentURL to get the complete URL with port number
    DEV_NEW_EXPENSIFY_URL: 'https://dev.new.expensify.com:',
    STORYLANE: {
        ADMIN_TOUR: 'https://app.storylane.io/demo/bbcreg8vccag?embed=inline',
        ADMIN_TOUR_MOBILE: 'https://app.storylane.io/demo/b6faqcdsxgww?embed=inline',
        ADMIN_MIGRATED: 'https://app.storylane.io/share/qlgnexxbsdtp',
        ADMIN_MIGRATED_MOBILE: 'https://app.storylane.io/share/fgireksbt2oh',
        TRACK_WORKSPACE_TOUR: 'https://app.storylane.io/share/mqzy3huvtrhx?embed=inline',
        TRACK_WORKSPACE_TOUR_MOBILE: 'https://app.storylane.io/share/wq4hiwsqvoho?embed=inline',
        EMPLOYEE_TOUR: 'https://app.storylane.io/share/izmryscwurdd?embed=inline',
        EMPLOYEE_TOUR_MOBILE: 'https://app.storylane.io/share/wckqdetaacgy?embed=inline',
        EMPLOYEE_MIGRATED: 'https://app.storylane.io/share/v9dr1rjqsd9y',
        EMPLOYEE_MIGRATED_MOBILE: 'https://app.storylane.io/share/qbbob6zvapqo',
    },
    OLD_DOT_PUBLIC_URLS: {
        TERMS_URL: `${EXPENSIFY_URL}/terms`,
        PRIVACY_URL: `${EXPENSIFY_URL}/privacy`,
        LICENSES_URL: `${USE_EXPENSIFY_URL}/licenses`,
        ACH_TERMS_URL: `${EXPENSIFY_URL}/achterms`,
        WALLET_AGREEMENT_URL: `${EXPENSIFY_URL}/expensify-payments-wallet-terms-of-service`,
        BANCORP_WALLET_AGREEMENT_URL: `${EXPENSIFY_URL}/bancorp-bank-wallet-terms-of-service`,
        EXPENSIFY_APPROVED_PROGRAM_URL: `${USE_EXPENSIFY_URL}/accountants-program`,
        TRAVEL_TERMS_URL: `${EXPENSIFY_URL}/travelterms`,
    },
    OLDDOT_URLS: {
        ADMIN_POLICIES_URL: 'admin_policies',
        ADMIN_DOMAINS_URL: 'admin_domains',
        INBOX: 'inbox',
        POLICY_CONNECTIONS_URL: (policyID: string) => `policy?param={"policyID":"${policyID}"}#connections`,
        POLICY_CONNECTIONS_URL_ENCODED: (policyID: string) => `policy?param=%7B%22policyID%22%3A%22${policyID}%22%7D#connections`,
        SIGN_OUT: 'signout',
        SUPPORTAL_RESTORE_STASHED_LOGIN: '_support/index?action=restoreStashedLogin',
    },

    EXPENSIFY_POLICY_DOMAIN,
    EXPENSIFY_POLICY_DOMAIN_EXTENSION,

    SIGN_IN_FORM_WIDTH: 300,

    REQUEST_CODE_DELAY: 30,

    SIGN_IN_METHOD: {
        APPLE: 'Apple',
        GOOGLE: 'Google',
    },

    OPTION_TYPE: {
        REPORT: 'report',
        PERSONAL_DETAIL: 'personalDetail',
    },

    QUICK_ACTIONS: {
        REQUEST_MANUAL: 'requestManual',
        REQUEST_SCAN: 'requestScan',
        REQUEST_DISTANCE: 'requestDistance',
        PER_DIEM: 'perDiem',
        SPLIT_MANUAL: 'splitManual',
        SPLIT_SCAN: 'splitScan',
        SPLIT_DISTANCE: 'splitDistance',
        TRACK_MANUAL: 'trackManual',
        TRACK_SCAN: 'trackScan',
        TRACK_DISTANCE: 'trackDistance',
        ASSIGN_TASK: 'assignTask',
        SEND_MONEY: 'sendMoney',
    },

    RECEIPT: {
        ICON_SIZE: 164,
        PERMISSION_GRANTED: 'granted',
        HAND_ICON_HEIGHT: 152,
        HAND_ICON_WIDTH: 200,
        SHUTTER_SIZE: 90,
        MAX_REPORT_PREVIEW_RECEIPTS: 3,
    },
    RECEIPT_PREVIEW_TOP_BOTTOM_MARGIN: 120,
    REPORT: {
        ROLE: {
            ADMIN: 'admin',
            MEMBER: 'member',
        },
        MAX_COUNT_BEFORE_FOCUS_UPDATE: 30,
        MIN_INITIAL_REPORT_ACTION_COUNT: 15,
        UNREPORTED_REPORT_ID: '0',
        SPLIT_REPORT_ID: '-2',
        SECONDARY_ACTIONS: {
            SUBMIT: 'submit',
            APPROVE: 'approve',
            REMOVE_HOLD: 'removeHold',
            UNAPPROVE: 'unapprove',
            CANCEL_PAYMENT: 'cancelPayment',
            HOLD: 'hold',
            DOWNLOAD_PDF: 'downloadPDF',
            CHANGE_WORKSPACE: 'changeWorkspace',
            CHANGE_APPROVER: 'changeApprover',
            VIEW_DETAILS: 'viewDetails',
            DELETE: 'delete',
            RETRACT: 'retract',
            ADD_EXPENSE: 'addExpense',
            REJECT: 'reject',
            SPLIT: 'split',
            REOPEN: 'reopen',
            EXPORT: 'export',
            PAY: 'pay',
            MERGE: 'merge',
            REPORT_LAYOUT: 'reportLayout',
            DUPLICATE: 'duplicate',
        },
        PRIMARY_ACTIONS: {
            SUBMIT: 'submit',
            APPROVE: 'approve',
            PAY: 'pay',
            EXPORT_TO_ACCOUNTING: 'exportToAccounting',
            REMOVE_HOLD: 'removeHold',
            REVIEW_DUPLICATES: 'reviewDuplicates',
            MARK_AS_CASH: 'markAsCash',
            MARK_AS_RESOLVED: 'markAsResolved',
        },
        TRANSACTION_PRIMARY_ACTIONS: {
            REMOVE_HOLD: 'removeHold',
            REVIEW_DUPLICATES: 'reviewDuplicates',
            KEEP_THIS_ONE: 'keepThisOne',
            MARK_AS_CASH: 'markAsCash',
            MARK_AS_RESOLVED: 'markAsResolved',
        },
        REPORT_PREVIEW_ACTIONS: {
            VIEW: 'view',
            ADD_EXPENSE: 'addExpense',
            SUBMIT: 'submit',
            APPROVE: 'approve',
            PAY: 'pay',
            EXPORT_TO_ACCOUNTING: 'exportToAccounting',
        },
        TRANSACTION_SECONDARY_ACTIONS: {
            HOLD: 'hold',
            REMOVE_HOLD: 'removeHold',
            SPLIT: 'split',
            VIEW_DETAILS: 'viewDetails',
            DELETE: 'delete',
            REJECT: 'reject',
            REJECT_BULK: 'rejectBulk',
            MERGE: 'merge',
            DUPLICATE: 'duplicate',
        },
        ADD_EXPENSE_OPTIONS: {
            CREATE_NEW_EXPENSE: 'createNewExpense',
            ADD_UNREPORTED_EXPENSE: 'addUnreportedExpense',
            TRACK_DISTANCE_EXPENSE: 'trackDistanceExpense',
        },
        ACTIONS: {
            LIMIT: 50,
            // OldDot Actions render getMessage from Web-Expensify/lib/Report/Action PHP files via getMessageOfOldDotReportAction in ReportActionsUtils.ts
            TYPE: {
                ACTIONABLE_ADD_PAYMENT_CARD: 'ACTIONABLEADDPAYMENTCARD',
                ACTIONABLE_CARD_FRAUD_ALERT: 'ACTIONABLECARDFRAUDALERT',
                ACTIONABLE_JOIN_REQUEST: 'ACTIONABLEJOINREQUEST',
                ACTIONABLE_MENTION_WHISPER: 'ACTIONABLEMENTIONWHISPER',
                ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER: 'ACTIONABLEMENTIONINVITETOSUBMITEXPENSECONFIRMWHISPER',
                ACTIONABLE_REPORT_MENTION_WHISPER: 'ACTIONABLEREPORTMENTIONWHISPER',
                ACTIONABLE_TRACK_EXPENSE_WHISPER: 'ACTIONABLETRACKEXPENSEWHISPER',
                POLICY_EXPENSE_CHAT_WELCOME_WHISPER: 'POLICYEXPENSECHATWELCOMEWHISPER',
                ADD_COMMENT: 'ADDCOMMENT',
                APPROVED: 'APPROVED',
                CARD_MISSING_ADDRESS: 'CARDMISSINGADDRESS',
                CARD_ISSUED: 'CARDISSUED',
                CARD_ISSUED_VIRTUAL: 'CARDISSUEDVIRTUAL',
                CARD_REPLACED_VIRTUAL: 'CARDREPLACEDVIRTUAL',
                CARD_REPLACED: 'CARDREPLACED',
                CARD_ASSIGNED: 'CARDASSIGNED',
                CHANGE_FIELD: 'CHANGEFIELD', // OldDot Action
                CHANGE_POLICY: 'CHANGEPOLICY',
                CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS: 'CREATEDREPORTFORUNAPPROVEDTRANSACTIONS',
                CHANGE_TYPE: 'CHANGETYPE', // OldDot Action
                CHRONOS_OOO_LIST: 'CHRONOSOOOLIST',
                CLOSED: 'CLOSED',
                CREATED: 'CREATED',
                DELETED_ACCOUNT: 'DELETEDACCOUNT', // Deprecated OldDot Action
                DELETED_TRANSACTION: 'DELETEDTRANSACTION',
                DEW_SUBMIT_FAILED: 'DEWSUBMITFAILED',
                DISMISSED_VIOLATION: 'DISMISSEDVIOLATION',
                DONATION: 'DONATION', // Deprecated OldDot Action
                DYNAMIC_EXTERNAL_WORKFLOW_ROUTED: 'DYNAMICEXTERNALWORKFLOWROUTED',
                EXPENSIFY_CARD_SYSTEM_MESSAGE: 'EXPENSIFYCARDSYSTEMMESSAGE',
                EXPORTED_TO_CSV: 'EXPORTCSV', // OldDot Action
                EXPORTED_TO_INTEGRATION: 'EXPORTINTEGRATION', // OldDot Action
                EXPORTED_TO_QUICK_BOOKS: 'EXPORTED', // Deprecated OldDot Action
                FIX_VIOLATION: 'FIXVIOLATION',
                FORWARDED: 'FORWARDED', // OldDot Action
                HOLD: 'HOLD',
                HOLD_COMMENT: 'HOLDCOMMENT',
                INTEGRATION_SYNC_FAILED: 'INTEGRATIONSYNCFAILED',
                COMPANY_CARD_CONNECTION_BROKEN: 'COMPANYCARDCONNECTIONBROKEN',
                IOU: 'IOU',
                INTEGRATIONS_MESSAGE: 'INTEGRATIONSMESSAGE', // OldDot Action
                MANAGER_ATTACH_RECEIPT: 'MANAGERATTACHRECEIPT', // OldDot Action
                MANAGER_DETACH_RECEIPT: 'MANAGERDETACHRECEIPT', // OldDot Action
                MARKED_REIMBURSED: 'MARKEDREIMBURSED', // OldDot Action
                MARK_REIMBURSED_FROM_INTEGRATION: 'MARKREIMBURSEDFROMINTEGRATION', // OldDot Action
                MERGED_WITH_CASH_TRANSACTION: 'MERGEDWITHCASHTRANSACTION',
                MODIFIED_EXPENSE: 'MODIFIEDEXPENSE',
                MOVED: 'MOVED',
                MOVED_TRANSACTION: 'MOVEDTRANSACTION',
                UNREPORTED_TRANSACTION: 'UNREPORTEDTRANSACTION',
                OUTDATED_BANK_ACCOUNT: 'OUTDATEDBANKACCOUNT', // OldDot Action
                REIMBURSED: 'REIMBURSED',
                REIMBURSEMENT_ACH_BOUNCE: 'REIMBURSEMENTACHBOUNCE', // OldDot Action
                REIMBURSEMENT_ACH_CANCELED: 'REIMBURSEMENTACHCANCELED', // OldDot Action
                REIMBURSEMENT_ACCOUNT_CHANGED: 'REIMBURSEMENTACCOUNTCHANGED', // OldDot Action
                REIMBURSEMENT_DELAYED: 'REIMBURSEMENTDELAYED', // OldDot Action
                REIMBURSEMENT_QUEUED: 'REIMBURSEMENTQUEUED',
                REIMBURSEMENT_DEQUEUED: 'REIMBURSEMENTDEQUEUED',
                REIMBURSEMENT_REQUESTED: 'REIMBURSEMENTREQUESTED', // Deprecated OldDot Action
                REIMBURSEMENT_SETUP: 'REIMBURSEMENTSETUP', // Deprecated OldDot Action
                REIMBURSEMENT_SETUP_REQUESTED: 'REIMBURSEMENTSETUPREQUESTED', // Deprecated OldDot Action
                REIMBURSEMENT_DIRECTOR_INFORMATION_REQUIRED: 'DIRECTORINFORMATIONREQUIRED',
                REJECTED: 'REJECTED',
                REMOVED_FROM_APPROVAL_CHAIN: 'REMOVEDFROMAPPROVALCHAIN',
                DEMOTED_FROM_WORKSPACE: 'DEMOTEDFROMWORKSPACE',
                RENAMED: 'RENAMED',
                RETRACTED: 'RETRACTED',
                REOPENED: 'REOPENED',
                REPORT_PREVIEW: 'REPORTPREVIEW',
                REROUTE: 'REROUTE',
                SELECTED_FOR_RANDOM_AUDIT: 'SELECTEDFORRANDOMAUDIT', // OldDot Action
                SHARE: 'SHARE', // OldDot Action
                STRIPE_PAID: 'STRIPEPAID', // OldDot Action
                SUBMITTED: 'SUBMITTED',
                SUBMITTED_AND_CLOSED: 'SUBMITTEDCLOSED',
                TAKE_CONTROL: 'TAKECONTROL', // OldDot Action
                TASK_CANCELLED: 'TASKCANCELLED',
                TASK_COMPLETED: 'TASKCOMPLETED',
                TASK_EDITED: 'TASKEDITED',
                TASK_REOPENED: 'TASKREOPENED',
                TRAVEL_UPDATE: 'TRAVEL_TRIP_ROOM_UPDATE',
                TRIP_PREVIEW: 'TRIPPREVIEW',
                UNAPPROVED: 'UNAPPROVED',
                UNHOLD: 'UNHOLD',
                UNSHARE: 'UNSHARE', // OldDot Action
                UPDATE_GROUP_CHAT_MEMBER_ROLE: 'UPDATEGROUPCHATMEMBERROLE',
                CONCIERGE_CATEGORY_OPTIONS: 'CONCIERGECATEGORYOPTIONS',
                CONCIERGE_DESCRIPTION_OPTIONS: 'CONCIERGEDESCRIPTIONOPTIONS',
                CONCIERGE_AUTO_MAP_MCC_GROUPS: 'CONCIERGEAUTOMAPMCCGROUPS',
                POLICY_CHANGE_LOG: {
                    ADD_APPROVER_RULE: 'POLICYCHANGELOG_ADD_APPROVER_RULE',
                    ADD_BUDGET: 'POLICYCHANGELOG_ADD_BUDGET',
                    ADD_CATEGORY: 'POLICYCHANGELOG_ADD_CATEGORY',
                    ADD_CUSTOM_UNIT: 'POLICYCHANGELOG_ADD_CUSTOM_UNIT',
                    ADD_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_ADD_CUSTOM_UNIT_RATE',
                    ADD_EMPLOYEE: 'POLICYCHANGELOG_ADD_EMPLOYEE',
                    ADD_INTEGRATION: 'POLICYCHANGELOG_ADD_INTEGRATION',
                    ADD_REPORT_FIELD: 'POLICYCHANGELOG_ADD_REPORT_FIELD',
                    ADD_TAG: 'POLICYCHANGELOG_ADD_TAG',
                    ADD_TAX: 'POLICYCHANGELOG_ADD_TAX',
                    DELETE_TAX: 'POLICYCHANGELOG_DELETE_TAX',
                    UPDATE_TAX: 'POLICYCHANGELOG_UPDATE_TAX',
                    DELETE_ALL_TAGS: 'POLICYCHANGELOG_DELETE_ALL_TAGS',
                    DELETE_APPROVER_RULE: 'POLICYCHANGELOG_DELETE_APPROVER_RULE',
                    DELETE_BUDGET: 'POLICYCHANGELOG_DELETE_BUDGET',
                    DELETE_CATEGORY: 'POLICYCHANGELOG_DELETE_CATEGORY',
                    DELETE_CATEGORIES: 'POLICYCHANGELOG_DELETE_CATEGORIES',
                    DELETE_CUSTOM_UNIT: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT',
                    DELETE_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT_RATE',
                    DELETE_CUSTOM_UNIT_SUB_RATE: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT_SUB_RATE',
                    DELETE_EMPLOYEE: 'POLICYCHANGELOG_DELETE_EMPLOYEE',
                    DELETE_INTEGRATION: 'POLICYCHANGELOG_DELETE_INTEGRATION',
                    DELETE_REPORT_FIELD: 'POLICYCHANGELOG_DELETE_REPORT_FIELD',
                    DELETE_TAG: 'POLICYCHANGELOG_DELETE_TAG',
                    DELETE_MULTIPLE_TAGS: 'POLICYCHANGELOG_DELETE_MULTIPLE_TAGS',
                    IMPORT_CUSTOM_UNIT_RATES: 'POLICYCHANGELOG_IMPORT_CUSTOM_UNIT_RATES',
                    IMPORT_TAGS: 'POLICYCHANGELOG_IMPORT_TAGS',
                    INDIVIDUAL_BUDGET_NOTIFICATION: 'POLICYCHANGELOG_INDIVIDUAL_BUDGET_NOTIFICATION',
                    INVITE_TO_ROOM: 'POLICYCHANGELOG_INVITETOROOM',
                    REMOVE_FROM_ROOM: 'POLICYCHANGELOG_REMOVEFROMROOM',
                    LEAVE_ROOM: 'POLICYCHANGELOG_LEAVEROOM',
                    REPLACE_CATEGORIES: 'POLICYCHANGELOG_REPLACE_CATEGORIES',
                    SET_AUTO_REIMBURSEMENT: 'POLICYCHANGELOG_SET_AUTOREIMBURSEMENT',
                    SET_AUTO_JOIN: 'POLICYCHANGELOG_SET_AUTO_JOIN',
                    SET_CATEGORY_NAME: 'POLICYCHANGELOG_SET_CATEGORY_NAME',
                    SHARED_BUDGET_NOTIFICATION: 'POLICYCHANGELOG_SHARED_BUDGET_NOTIFICATION',
                    UPDATE_ACH_ACCOUNT: 'POLICYCHANGELOG_UPDATE_ACH_ACCOUNT',
                    UPDATE_APPROVER_RULE: 'POLICYCHANGELOG_UPDATE_APPROVER_RULE',
                    UPDATE_AUDIT_RATE: 'POLICYCHANGELOG_UPDATE_AUDIT_RATE',
                    UPDATE_AUTO_HARVESTING: 'POLICYCHANGELOG_UPDATE_AUTOHARVESTING',
                    UPDATE_AUTO_REIMBURSEMENT: 'POLICYCHANGELOG_UPDATE_AUTOREIMBURSEMENT',
                    UPDATE_AUTO_REPORTING_FREQUENCY: 'POLICYCHANGELOG_UPDATE_AUTOREPORTING_FREQUENCY',
                    UPDATE_BUDGET: 'POLICYCHANGELOG_UPDATE_BUDGET',
                    UPDATE_CATEGORY: 'POLICYCHANGELOG_UPDATE_CATEGORY',
                    UPDATE_CATEGORIES: 'POLICYCHANGELOG_UPDATE_CATEGORIES',
                    UPDATE_CURRENCY: 'POLICYCHANGELOG_UPDATE_CURRENCY',
                    UPDATE_CUSTOM_UNIT: 'POLICYCHANGELOG_UPDATE_CUSTOM_UNIT',
                    UPDATE_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_UPDATE_CUSTOM_UNIT_RATE',
                    UPDATE_CUSTOM_UNIT_SUB_RATE: 'POLICYCHANGELOG_UPDATE_CUSTOM_UNIT_SUB_RATE',
                    UPDATE_DEFAULT_BILLABLE: 'POLICYCHANGELOG_UPDATE_DEFAULT_BILLABLE',
                    UPDATE_DEFAULT_REIMBURSABLE: 'POLICYCHANGELOG_UPDATE_DEFAULT_REIMBURSABLE',
                    UPDATE_DEFAULT_TITLE: 'POLICYCHANGELOG_UPDATE_DEFAULT_TITLE',
                    UPDATE_DEFAULT_TITLE_ENFORCED: 'POLICYCHANGELOG_UPDATE_DEFAULT_TITLE_ENFORCED',
                    UPDATE_DISABLED_FIELDS: 'POLICYCHANGELOG_UPDATE_DISABLED_FIELDS',
                    UPDATE_EMPLOYEE: 'POLICYCHANGELOG_UPDATE_EMPLOYEE',
                    UPDATE_FIELD: 'POLICYCHANGELOG_UPDATE_FIELD',
                    UPDATE_ADDRESS: 'POLICYCHANGELOG_UPDATE_ADDRESS',
                    UPDATE_FEATURE_ENABLED: 'POLICYCHANGELOG_UPDATE_FEATURE_ENABLED',
                    UPDATE_IS_ATTENDEE_TRACKING_ENABLED: 'POLICYCHANGELOG_UPDATE_IS_ATTENDEE_TRACKING_ENABLED',
                    UPDATE_DEFAULT_APPROVER: 'POLICYCHANGELOG_UPDATE_DEFAULT_APPROVER',
                    UPDATE_SUBMITS_TO: 'POLICYCHANGELOG_UPDATE_SUBMITS_TO',
                    UPDATE_FORWARDS_TO: 'POLICYCHANGELOG_UPDATE_FORWARDS_TO',
                    UPDATE_INVOICE_COMPANY_NAME: 'POLICYCHANGELOG_UPDATE_INVOICE_COMPANY_NAME',
                    UPDATE_INVOICE_COMPANY_WEBSITE: 'POLICYCHANGELOG_UPDATE_INVOICE_COMPANY_WEBSITE',
                    UPDATE_MANUAL_APPROVAL_THRESHOLD: 'POLICYCHANGELOG_UPDATE_MANUAL_APPROVAL_THRESHOLD',
                    UPDATE_MAX_EXPENSE_AMOUNT: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AMOUNT',
                    UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT',
                    UPDATE_MAX_EXPENSE_AGE: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AGE',
                    UPDATE_MULTIPLE_TAGS_APPROVER_RULES: 'POLICYCHANGELOG_UPDATE_MULTIPLE_TAGS_APPROVER_RULES',
                    UPDATE_NAME: 'POLICYCHANGELOG_UPDATE_NAME',
                    UPDATE_DESCRIPTION: 'POLICYCHANGELOG_UPDATE_DESCRIPTION',
                    UPDATE_OWNERSHIP: 'POLICYCHANGELOG_UPDATE_OWNERSHIP',
                    UPDATE_REIMBURSER: 'POLICYCHANGELOG_UPDATE_REIMBURSER',
                    UPDATE_PROHIBITED_EXPENSES: 'POLICYCHANGELOG_UPDATE_PROHIBITED_EXPENSES',
                    UPDATE_REIMBURSEMENT_CHOICE: 'POLICYCHANGELOG_UPDATE_REIMBURSEMENT_CHOICE',
                    UPDATE_REIMBURSEMENT_ENABLED: 'POLICYCHANGELOG_UPDATE_REIMBURSEMENT_ENABLED',
                    UPDATE_REPORT_FIELD: 'POLICYCHANGELOG_UPDATE_REPORT_FIELD',
                    UPDATE_TAG: 'POLICYCHANGELOG_UPDATE_TAG',
                    UPDATE_TAG_ENABLED: 'POLICYCHANGELOG_UPDATE_TAG_ENABLED',
                    UPDATE_TAG_LIST: 'POLICYCHANGELOG_UPDATE_TAG_LIST',
                    UPDATE_TAG_LIST_NAME: 'POLICYCHANGELOG_UPDATE_TAG_LIST_NAME',
                    UPDATE_TAG_LIST_REQUIRED: 'POLICYCHANGELOG_UPDATE_TAG_LIST_REQUIRED',
                    UPDATE_TAG_NAME: 'POLICYCHANGELOG_UPDATE_TAG_NAME',
                    UPDATE_TIME_ENABLED: 'POLICYCHANGELOG_UPDATE_TIME_ENABLED',
                    UPDATE_TIME_RATE: 'POLICYCHANGELOG_UPDATE_TIME_RATE',
                    LEAVE_POLICY: 'POLICYCHANGELOG_LEAVE_POLICY',
                    CORPORATE_UPGRADE: 'POLICYCHANGELOG_CORPORATE_UPGRADE',
                    CORPORATE_FORCE_UPGRADE: 'POLICYCHANGELOG_CORPORATE_FORCE_UPGRADE',
                    TEAM_DOWNGRADE: 'POLICYCHANGELOG_TEAM_DOWNGRADE',
                },
                RECEIPT_SCAN_FAILED: 'RECEIPTSCANFAILED',
                RESOLVED_DUPLICATES: 'RESOLVEDDUPLICATES',
                ROOM_CHANGE_LOG: {
                    INVITE_TO_ROOM: 'INVITETOROOM',
                    REMOVE_FROM_ROOM: 'REMOVEFROMROOM',
                    LEAVE_ROOM: 'LEAVEROOM',
                    UPDATE_ROOM_DESCRIPTION: 'UPDATEROOMDESCRIPTION',
                    UPDATE_ROOM_AVATAR: 'UPDATEROOMAVATAR',
                },
                REJECTEDTRANSACTION_THREAD: 'REJECTEDTRANSACTION_THREAD',
                REJECTED_TRANSACTION_MARKASRESOLVED: 'REJECTEDTRANSACTIONMARKASRESOLVED',
            },
            THREAD_DISABLED: ['CREATED'],
            LATEST_MESSAGES_PILL_SCROLL_OFFSET_THRESHOLD: 2000,
            ACTION_VISIBLE_THRESHOLD: 250,
            MAX_GROUPING_TIME: 300000,
        },
        CANCEL_PAYMENT_REASONS: {
            ADMIN: 'CANCEL_REASON_ADMIN',
            USER: 'CANCEL_REASON_USER',
        },
        ACTIONABLE_MENTION_WHISPER_RESOLUTION: {
            INVITE: 'invited',
            INVITE_TO_SUBMIT_EXPENSE: 'inviteToSubmitExpense',
            NOTHING: 'nothing',
        },
        ACTIONABLE_MENTION_INVITE_TO_SUBMIT_EXPENSE_CONFIRM_WHISPER: {
            DONE: 'done',
        },
        ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION: {
            NOTHING: 'nothing',
        },
        ACTIONABLE_REPORT_MENTION_WHISPER_RESOLUTION: {
            CREATE: 'created',
            NOTHING: 'nothing',
        },
        ACTIONABLE_MENTION_JOIN_WORKSPACE_RESOLUTION: {
            ACCEPT: 'accept',
            DECLINE: 'decline',
        },
        ARCHIVE_REASON: {
            DEFAULT: 'default',
            ACCOUNT_CLOSED: 'accountClosed',
            ACCOUNT_MERGED: 'accountMerged',
            REMOVED_FROM_POLICY: 'removedFromPolicy',
            POLICY_DELETED: 'policyDeleted',
            INVOICE_RECEIVER_POLICY_DELETED: 'invoiceReceiverPolicyDeleted',
            BOOKING_END_DATE_HAS_PASSED: 'bookingEndDateHasPassed',
        },
        MESSAGE: {
            TYPE: {
                COMMENT: 'COMMENT',
                TEXT: 'TEXT',
            },
        },
        TYPE: {
            CHAT: 'chat',
            EXPENSE: 'expense',
            IOU: 'iou',
            TASK: 'task',
            INVOICE: 'invoice',
        },
        UNSUPPORTED_TYPE: {
            PAYCHECK: 'paycheck',
            BILL: 'bill',
        },
        CHAT_TYPE: chatTypes,
        HELP_TYPE: {
            ...chatTypes,
            CHAT_CONCIERGE: 'concierge',
            EXPENSE_REPORT: 'expenseReport',
            EXPENSE: 'expense',
            CHAT: 'chat',
            IOU: 'iou',
            TASK: 'task',
            INVOICE: 'invoice',
        },
        WORKSPACE_CHAT_ROOMS: {
            ANNOUNCE: '#announce',
            ADMINS: '#admins',
        },
        STATE_NUM: {
            OPEN: 0,
            SUBMITTED: 1,
            APPROVED: 2,
            BILLING: 3,
            AUTOREIMBURSED: 6,
        },
        STATUS_NUM: {
            OPEN: 0,
            SUBMITTED: 1,
            CLOSED: 2,
            APPROVED: 3,
            REIMBURSED: 4,
        },
        NOTIFICATION_PREFERENCE: {
            MUTE: 'mute',
            DAILY: 'daily',
            ALWAYS: 'always',
            HIDDEN: 'hidden',
        },
        // Options for which room members can post
        WRITE_CAPABILITIES: {
            ALL: 'all',
            ADMINS: 'admins',
        },
        VISIBILITY: {
            PUBLIC: 'public',
            PUBLIC_ANNOUNCE: 'public_announce',
            PRIVATE: 'private',
            RESTRICTED: 'restricted',
        },
        RESERVED_ROOM_NAMES: ['#admins', '#announce'],
        MAX_PREVIEW_AVATARS: 4,
        TRANSACTION_PREVIEW: {
            CAROUSEL: {
                MIN_WIDE_WIDTH: 303,
                WIDE_HEIGHT: 269,
                MIN_NARROW_WIDTH: 256,
            },
            DUPLICATE: {
                WIDE_HEIGHT: 347,
            },
        },
        CAROUSEL_MAX_WIDTH_WIDE: 680,
        MAX_ROOM_NAME_LENGTH: 99,
        LAST_MESSAGE_TEXT_MAX_LENGTH: 200,
        MIN_LENGTH_LAST_MESSAGE_WITH_ELLIPSIS: 20,
        OWNER_EMAIL_FAKE: '__FAKE__',
        OWNER_ACCOUNT_ID_FAKE: 0,
        DEFAULT_REPORT_NAME: 'Chat Report',
        PERMISSIONS: {
            READ: 'read',
            WRITE: 'write',
            SHARE: 'share',
            OWN: 'own',
            AUDITOR: 'auditor',
        },
        INVOICE_RECEIVER_TYPE: {
            INDIVIDUAL: 'individual',
            BUSINESS: 'policy',
        },
        EXPORT_OPTIONS: {
            EXPORT_TO_INTEGRATION: 'exportToIntegration',
            MARK_AS_EXPORTED: 'markAsExported',
            DOWNLOAD_CSV: 'downloadCSV',
            REPORT_LEVEL_EXPORT: 'report_level_export',
            EXPENSE_LEVEL_EXPORT: 'detailed_export',
        },
        EXPORT_OPTION_LABELS: {
            REPORT_LEVEL_EXPORT: 'All Data - Report Level Export',
            EXPENSE_LEVEL_EXPORT: 'All Data - Expense Level Export',
            DEFAULT_CSV: 'Default CSV',
        },
        ROOM_MEMBERS_BULK_ACTION_TYPES: {
            REMOVE: 'remove',
        },
        MOVE_TYPE: {
            FROM: 'from',
            TO: 'to',
        },
    },
    EXPORT_TEMPLATE_TYPES: {
        INTEGRATIONS: 'integrations',
        IN_APP: 'in-app',
    },
    EXPORT_TEMPLATE: 'exportTemplate',
    NEXT_STEP: {
        MESSAGE_KEY: {
            WAITING_TO_ADD_TRANSACTIONS: 'waitingToAddTransactions',
            WAITING_TO_SUBMIT: 'waitingToSubmit',
            NO_FURTHER_ACTION: 'noFurtherAction',
            WAITING_FOR_SUBMITTER_ACCOUNT: 'waitingForSubmitterAccount',
            WAITING_FOR_AUTOMATIC_SUBMIT: 'waitingForAutomaticSubmit',
            WAITING_TO_FIX_ISSUES: 'waitingToFixIssues',
            WAITING_TO_APPROVE: 'waitingToApprove',
            WAITING_TO_PAY: 'waitingToPay',
            WAITING_FOR_POLICY_BANK_ACCOUNT: 'waitingForPolicyBankAccount',
            WAITING_FOR_PAYMENT: 'waitingForPayment',
            WAITING_TO_EXPORT: 'waitingToExport',
            SUBMITTING_TO_SELF: 'submittingToSelf',
        },
        ICONS: {
            HOURGLASS: 'hourglass',
            CHECKMARK: 'checkmark',
            STOPWATCH: 'stopwatch',
            DOT_INDICATOR: 'dotIndicator',
        },
        ETA_KEY: {
            SHORTLY: 'shortly',
            TODAY: 'today',
            END_OF_WEEK: 'endOfWeek',
            SEMI_MONTHLY: 'semiMonthly',
            LAST_BUSINESS_DAY_OF_MONTH: 'lastBusinessDayOfMonth',
            LAST_DAY_OF_MONTH: 'lastDayOfMonth',
            END_OF_TRIP: 'endOfTrip',
        },
        ACTOR_TYPE: {
            CURRENT_USER: 'currentUser',
            OTHER_USER: 'otherUser',
            UNSPECIFIED_ADMIN: 'unspecifiedAdmin',
        },
        ETA_TYPE: {
            KEY: 'key',
            DATE_TIME: 'dateTime',
        },
    },
    REPORT_LAYOUT: {
        GROUP_BY: {
            CATEGORY: 'mcc',
            TAG: 'tag',
        },
    } as const,
    UNREPORTED_EXPENSES_PAGE_SIZE: 50,
    COMPOSER: {
        NATIVE_ID: 'composer',
        MAX_LINES: 16,
        MAX_LINES_SMALL_SCREEN: 6,
        MAX_LINES_FULL: -1,
        // The minimum height needed to enable the full screen composer
        FULL_COMPOSER_MIN_HEIGHT: 60,
    },
    MODAL: {
        MODAL_TYPE: {
            CONFIRM: 'confirm',
            CENTERED: 'centered',
            CENTERED_SWIPEABLE_TO_RIGHT: 'centered_swipable_to_right',
            CENTERED_UNSWIPEABLE: 'centered_unswipeable',
            CENTERED_SMALL: 'centered_small',
            BOTTOM_DOCKED: 'bottom_docked',
            POPOVER: 'popover',
            RIGHT_DOCKED: 'right_docked',
            FULLSCREEN: 'fullscreen',
        },
        ANCHOR_ORIGIN_VERTICAL: {
            TOP: 'top',
            CENTER: 'center',
            BOTTOM: 'bottom',
        },
        ANCHOR_ORIGIN_HORIZONTAL: {
            LEFT: 'left',
            CENTER: 'center',
            RIGHT: 'right',
        },
        POPOVER_MENU_PADDING: 8,
        RESTORE_FOCUS_TYPE: {
            DEFAULT: 'default',
            DELETE: 'delete',
            PRESERVE: 'preserve',
        },
        ANIMATION_TIMING: {
            DEFAULT_IN: 300,
            DEFAULT_OUT: 200,
            DEFAULT_RIGHT_DOCKED_IOS_IN: 500,
            DEFAULT_RIGHT_DOCKED_IOS_OUT: 400,
            FAB_IN: 350,
            FAB_OUT: 200,
        },
    },
    TIMING: {
        GET_ORDERED_REPORT_IDS: 'get_ordered_report_ids',
        CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION: 'calc_most_recent_last_modified_action',
        SPLASH_SCREEN: 'splash_screen',
        OPEN_SEARCH: 'open_search',
        OPEN_REPORT: 'open_report',
        OPEN_REPORT_FROM_PREVIEW: 'open_report_from_preview',
        OPEN_REPORT_THREAD: 'open_report_thread',
        OPEN_REPORT_SEARCH: 'open_report_search',
        SIDEBAR_LOADED: 'sidebar_loaded',
        LOAD_SEARCH_OPTIONS: 'load_search_options',
        SEND_MESSAGE: 'send_message',
        OPEN_CREATE_EXPENSE: 'open_create_expense',
        OPEN_CREATE_EXPENSE_CONTACT: 'open_create_expense_contact',
        OPEN_CREATE_EXPENSE_APPROVE: 'open_create_expense_approve',
        APPLY_AIRSHIP_UPDATES: 'apply_airship_updates',
        APPLY_PUSHER_UPDATES: 'apply_pusher_updates',
        APPLY_HTTPS_UPDATES: 'apply_https_updates',
        COLD: 'cold',
        WARM: 'warm',
        REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME: 1500,
        SHOW_LOADING_SPINNER_DEBOUNCE_TIME: 250,
        TEST_TOOLS_MODAL_THROTTLE_TIME: 800,
        TOOLTIP_SENSE: 1000,
        TRIE_INITIALIZATION: 'trie_initialization',
        COMMENT_LENGTH_DEBOUNCE_TIME: 1500,
        SEARCH_OPTION_LIST_DEBOUNCE_TIME: 300,
        SUGGESTION_DEBOUNCE_TIME: 100,
        RESIZE_DEBOUNCE_TIME: 100,
        UNREAD_UPDATE_DEBOUNCE_TIME: 300,
        SEARCH_FILTER_OPTIONS: 'search_filter_options',
        USE_DEBOUNCED_STATE_DELAY: 300,
        LIST_SCROLLING_DEBOUNCE_TIME: 200,
        PUSHER_PING_PONG: 'pusher_ping_pong',
        LOCATION_UPDATE_INTERVAL: 5000,
        PLAY_SOUND_MESSAGE_DEBOUNCE_TIME: 500,
        NOTIFY_NEW_ACTION_DELAY: 700,
        SKELETON_ANIMATION_SPEED: 3,
        SEARCH_MOST_RECENT_OPTIONS: 'search_most_recent_options',
        DEBOUNCE_HANDLE_SEARCH: 'debounce_handle_search',
        FAST_SEARCH_TREE_CREATION: 'fast_search_tree_creation',
        SHOW_HOVER_PREVIEW_DELAY: 270,
        SHOW_HOVER_PREVIEW_ANIMATION_DURATION: 250,
        ACTIVITY_INDICATOR_TIMEOUT: 10000,
    },
    TELEMETRY: {
        CONTEXT_FULLSTORY: 'Fullstory',
        CONTEXT_POLICIES: 'Policies',
        TAG_ACTIVE_POLICY: 'active_policy_id',
        TAG_POLICIES_COUNT: 'policies',
        TAG_REPORTS_COUNT: 'reports',
        TAG_NUDGE_MIGRATION_COHORT: 'nudge_migration_cohort',
        TAG_AUTHENTICATION_FUNCTION: 'authentication_function',
        TAG_AUTHENTICATION_ERROR_TYPE: 'authentication_error_type',
        TAG_AUTHENTICATION_JSON_CODE: 'authentication_json_code',
        // Span names
        SPAN_OPEN_REPORT: 'ManualOpenReport',
        SPAN_APP_STARTUP: 'ManualAppStartup',
        SPAN_NAVIGATE_TO_REPORTS_TAB: 'ManualNavigateToReportsTab',
        SPAN_NAVIGATE_TO_REPORTS_TAB_RENDER: 'ManualNavigateToReportsTabRender',
        SPAN_ON_LAYOUT_SKELETON_REPORTS: 'ManualOnLayoutSkeletonReports',
        SPAN_NAVIGATE_TO_INBOX_TAB: 'ManualNavigateToInboxTab',
        SPAN_OD_ND_TRANSITION: 'ManualOdNdTransition',
        SPAN_OPEN_SEARCH_ROUTER: 'ManualOpenSearchRouter',
        SPAN_OPEN_CREATE_EXPENSE: 'ManualOpenCreateExpense',
        SPAN_SEND_MESSAGE: 'ManualSendMessage',
        SPAN_NOT_FOUND_PAGE: 'ManualNotFoundPage',
        SPAN_SKELETON: 'ManualSkeleton',
        SPAN_BOOTSPLASH: {
            ROOT: 'BootsplashVisible',
            NAVIGATION: 'BootsplashVisibleNavigation',
            ONYX: 'BootsplashVisibleOnyx',
            LOCALE: 'BootsplashVisibleLocale',
            SPLASH_HIDER: 'BootsplashVisibleHider',
        },
        // Attribute names
        ATTRIBUTE_IOU_TYPE: 'iou_type',
        ATTRIBUTE_IS_ONE_TRANSACTION_REPORT: 'is_one_transaction_report',
        ATTRIBUTE_IS_TRANSACTION_THREAD: 'is_transaction_thread',
        ATTRIBUTE_REPORT_TYPE: 'report_type',
        ATTRIBUTE_CHAT_TYPE: 'chat_type',
        ATTRIBUTE_IOU_REQUEST_TYPE: 'iou_request_type',
        ATTRIBUTE_REPORT_ID: 'report_id',
        ATTRIBUTE_MESSAGE_LENGTH: 'message_length',
        ATTRIBUTE_CANCELED: 'canceled',
        ATTRIBUTE_ROUTE_FROM: 'route_from',
        ATTRIBUTE_ROUTE_TO: 'route_to',
        ATTRIBUTE_MIN_DURATION: 'min_duration',
        ATTRIBUTE_FINISHED_MANUALLY: 'finished_manually',
        CONFIG: {
            SKELETON_MIN_DURATION: 10_000,
        },
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    THEME: {
        DEFAULT: 'system',
        FALLBACK: 'dark',
        DARK: 'dark',
        LIGHT: 'light',
        SYSTEM: 'system',
    },
    COLOR_SCHEME: {
        LIGHT: 'light',
        DARK: 'dark',
    },
    STATUS_BAR_STYLE: {
        LIGHT_CONTENT: 'light-content',
        DARK_CONTENT: 'dark-content',
    },
    NAVIGATION_BAR_BUTTONS_STYLE: {
        LIGHT: 'light',
        DARK: 'dark',
    },
    NAVIGATION_BAR_TYPE: {
        // We consider there to be no navigation bar in one of these cases:
        // 1. The device has physical navigation buttons
        // 2. The device uses gesture navigation without a gesture bar.
        // 3. The device uses hidden (auto-hiding) soft keys.
        NONE: 'none',
        SOFT_KEYS: 'soft-keys',
        GESTURE_BAR: 'gesture-bar',
    },
    // Currently, in Android there is no native API to detect the type of navigation bar (soft keys vs. gesture).
    // The navigation bar on (standard) Android devices is around 30-50dpi tall. (Samsung: 40dpi, Huawei: ~34dpi)
    // To leave room to detect soft-key navigation bars on non-standard Android devices,
    // we set this height threshold to 30dpi, since gesture bars will never be taller than that. (Samsung & Huawei: ~14-15dpi)
    NAVIGATION_BAR_ANDROID_SOFT_KEYS_MINIMUM_HEIGHT_THRESHOLD: 30,
    TRANSACTION: {
        RESULTS_PAGE_SIZE: 20,
        DEFAULT_MERCHANT: 'Expense',
        UNKNOWN_MERCHANT: 'Unknown Merchant',
        PARTIAL_TRANSACTION_MERCHANT: '(none)',
        TYPE: {
            CUSTOM_UNIT: 'customUnit',
            TIME: 'time',
        },
        STATUS: {
            PENDING: 'Pending',
            POSTED: 'Posted',
        },
        STATE: {
            CURRENT: 'current',
            DRAFT: 'draft',
            BACKUP: 'backup',
        },
        LIABILITY_TYPE: {
            RESTRICT: 'corporate',
            ALLOW: 'personal',
        },
    },
    TIME_TRACKING: {
        UNIT: {
            HOUR: 'h',
        },
    },
    MCC_GROUPS: {
        AIRLINES: 'Airlines',
        COMMUTER: 'Commuter',
        GAS: 'Gas',
        GOODS: 'Goods',
        GROCERIES: 'Groceries',
        HOTEL: 'Hotel',
        MAIL: 'Mail',
        MEALS: 'Meals',
        RENTAL: 'Rental',
        SERVICES: 'Services',
        TAXI: 'Taxi',
        MISCELLANEOUS: 'Miscellaneous',
        UTILITIES: 'Utilities',
    },
    JSON_CODE: {
        SUCCESS: 200,
        BAD_REQUEST: 400,
        INVALID_SEARCH_QUERY: 401,
        NOT_AUTHENTICATED: 407,
        EXP_ERROR: 666,
        UNABLE_TO_RETRY: 'unableToRetry',
        UPDATE_REQUIRED: 426,
        INCORRECT_MAGIC_CODE: 451,
        POLICY_DIFF_WARNING: 305,
    },
    HTTP_STATUS: {
        // When Cloudflare throttles
        TOO_MANY_REQUESTS: 429,
        INTERNAL_SERVER_ERROR: 500,
        BAD_GATEWAY: 502,
        GATEWAY_TIMEOUT: 504,
        UNKNOWN_ERROR: 520,
    },
    ERROR: {
        XHR_FAILED: 'xhrFailed',
        THROTTLED: 'throttled',
        UNKNOWN_ERROR: 'Unknown error',
        REQUEST_CANCELLED: 'AbortError',
        FAILED_TO_FETCH: 'Failed to fetch',
        ENSURE_BUG_BOT: 'ENSURE_BUGBOT',
        PUSHER_ERROR: 'PusherError',
        WEB_SOCKET_ERROR: 'WebSocketError',
        NETWORK_REQUEST_FAILED: 'Network request failed',
        SAFARI_DOCUMENT_LOAD_ABORTED: 'cancelled',
        FIREFOX_DOCUMENT_LOAD_ABORTED: 'NetworkError when attempting to fetch resource.',
        IOS_NETWORK_CONNECTION_LOST: 'The network connection was lost.',
        IOS_NETWORK_CONNECTION_LOST_RUSSIAN: 'Сетевое соединение потеряно.',
        IOS_NETWORK_CONNECTION_LOST_SWEDISH: 'Nätverksanslutningen förlorades.',
        IOS_NETWORK_CONNECTION_LOST_SPANISH: 'La conexión a Internet parece estar desactivada.',
        IOS_LOAD_FAILED: 'Load failed',
        SAFARI_CANNOT_PARSE_RESPONSE: 'cannot parse response',
        GATEWAY_TIMEOUT: 'Gateway Timeout',
        EXPENSIFY_SERVICE_INTERRUPTED: 'Expensify service interrupted',
        DUPLICATE_RECORD: 'A record already exists with this ID',

        // The "Upgrade" is intentional as the 426 HTTP code means "Upgrade Required" and sent by the API. We use the "Update" language everywhere else in the front end when this gets returned.
        UPDATE_REQUIRED: 'Upgrade Required',
        INTEGRATION_MESSAGE_INVALID_CREDENTIALS: 'Invalid credentials',

        BANK_ACCOUNT_SAME_DEPOSIT_AND_WITHDRAWAL_ERROR: 'The deposit and withdrawal accounts are the same.',
    },
    ERROR_TYPE: {
        SOCKET: 'Expensify\\Auth\\Error\\Socket',
    },
    ERROR_TITLE: {
        SOCKET: 'Issue connecting to database',
        DUPLICATE_RECORD: '400 Unique Constraints Violation',
    },
    NETWORK: {
        METHOD: {
            POST: 'post',
        },
        MIN_RETRY_WAIT_TIME_MS: 10,
        MAX_RANDOM_RETRY_WAIT_TIME_MS: 100,
        MAX_RETRY_WAIT_TIME_MS: 10 * 1000,
        PROCESS_REQUEST_DELAY_MS: 1000,
        MAX_PENDING_TIME_MS: 10 * 1000,
        RECHECK_INTERVAL_MS: 60 * 1000,
        MAX_REQUEST_RETRIES: 10,
        MAX_OPEN_APP_REQUEST_RETRIES: 2,
        NETWORK_STATUS: {
            ONLINE: 'online',
            OFFLINE: 'offline',
            UNKNOWN: 'unknown',
        },
    },
    // The number of milliseconds for an idle session to expire
    SESSION_EXPIRATION_TIME_MS: 2 * 3600 * 1000, // 2 hours
    WEEK_STARTS_ON: 1, // Monday
    DEFAULT_TIME_ZONE: {automatic: true, selected: 'America/Los_Angeles'},
    DEFAULT_ACCOUNT_DATA: {errors: null, success: '', isLoading: false},
    DEFAULT_CLOSE_ACCOUNT_DATA: {errors: null, success: '', isLoading: false},
    DEFAULT_NETWORK_DATA: {isOffline: false},
    FORMS: {
        LOGIN_FORM: 'LoginForm',
        VALIDATE_CODE_FORM: 'ValidateCodeForm',
        VALIDATE_TFA_CODE_FORM: 'ValidateTfaCodeForm',
        RESEND_VALIDATION_FORM: 'ResendValidationForm',
        UNLINK_LOGIN_FORM: 'UnlinkLoginForm',
        RESEND_VALIDATE_CODE_FORM: 'ResendValidateCodeForm',
    },
    APP_STATE: {
        ACTIVE: 'active',
        BACKGROUND: 'background',
        INACTIVE: 'inactive',
    },

    // at least 8 characters, 1 capital letter, 1 lowercase number, 1 number
    PASSWORD_COMPLEXITY_REGEX_STRING: '^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$',

    // We allow either 6 digits for validated users or 9-character base26 for unvalidated users
    VALIDATE_CODE_REGEX_STRING: /^\d{6}$|^[A-Z]{9}$/,

    // 8 alphanumeric characters
    RECOVERY_CODE_REGEX_STRING: /^[a-zA-Z0-9]{8}$/,

    // The server has a WAF (Web Application Firewall) which will strip out HTML/XML tags.
    VALIDATE_FOR_HTML_TAG_REGEX: /<\/?\w*((\s+\w+(\s*=\s*(?:"(.|\n)*?"|'(.|\n)*?'|[^'">\s]+))?)+\s*|\s*)\/?>/g,

    // Matches any content enclosed in angle brackets, including non-standard or symbolic tags like <✓>, <123>, etc.
    // This is a stricter version of VALIDATE_FOR_HTML_TAG_REGEX, used to detect and block inputs that resemble HTML-like tags,
    // even if they are not valid HTML, to match backend validation behavior.
    STRICT_VALIDATE_FOR_HTML_TAG_REGEX: /<([^>\s]+)(?:[^>]*?)>/g,

    // The regex below is used to remove dots only from the local part of the user email (local-part@domain)
    // so when we are using search, we can match emails that have dots without explicitly writing the dots (e.g: fistlast@domain will match first.last@domain)
    // More info https://github.com/Expensify/App/issues/8007
    EMAIL_SEARCH_REGEX: /\.(?=[^\s@]*@)/g,

    VALIDATE_FOR_LEADING_SPACES_HTML_TAG_REGEX: /<([\s]+.+[\s]*)>/g,

    WHITELISTED_TAGS: [/<>/, /< >/, /<->/, /<-->/, /<br>/, /<br\/>/],

    PASSWORD_PAGE: {
        ERROR: {
            ALREADY_VALIDATED: 'Account already validated',
            VALIDATE_CODE_FAILED: 'Validate code failed',
        },
    },

    PUSHER: {
        PRIVATE_USER_CHANNEL_PREFIX: 'private-encrypted-user-accountID-',
        PRIVATE_REPORT_CHANNEL_PREFIX: 'private-report-reportID-',
        STATE: {
            CONNECTING: 'CONNECTING',
            CONNECTED: 'CONNECTED',
            DISCONNECTING: 'DISCONNECTING',
            DISCONNECTED: 'DISCONNECTED',
            RECONNECTING: 'RECONNECTING',
        },
        CHANNEL_STATUS: {
            SUBSCRIBING: 'SUBSCRIBING',
            SUBSCRIBED: 'SUBSCRIBED',
        },
    },

    EMOJI_SPACER: 'SPACER',

    // This is the number of columns in each row of the picker.
    // Because of how flatList implements these rows, each row is an index rather than each element
    // For this reason to make headers work, we need to have the header be the only rendered element in its row
    // If this number is changed, emojis.js will need to be updated to have the proper number of spacer elements
    // around each header.
    EMOJI_NUM_PER_ROW: 8,

    EMOJI_DEFAULT_SKIN_TONE: -1,
    DISPLAY_PARTICIPANTS_LIMIT: 5,

    // Amount of emojis to render ahead at the end of the update cycle
    EMOJI_DRAW_AMOUNT: 100,

    CUSTOM_EMOJIS: {
        GLOBAL_CREATE: '\uE100',
    },

    INVISIBLE_CODEPOINTS: ['fe0f', '200d', '2066'],

    UNICODE: {
        LTR: '\u2066',
    },

    TOOLTIP_MAX_LINES: 3,

    LOGIN_TYPE: {
        PHONE: 'phone',
        EMAIL: 'email',
    },

    MAGIC_CODE_LENGTH: 6,
    MAGIC_CODE_EMPTY_CHAR: ' ',

    KEYBOARD_TYPE: {
        VISIBLE_PASSWORD: 'visible-password',
        ASCII_CAPABLE: 'ascii-capable',
        NUMBER_PAD: 'number-pad',
        DECIMAL_PAD: 'decimal-pad',
        NUMBERS_AND_PUNCTUATION: 'numbers-and-punctuation',
    },

    INPUT_MODE: {
        NONE: 'none',
        TEXT: 'text',
        DECIMAL: 'decimal',
        NUMERIC: 'numeric',
        TEL: 'tel',
        SEARCH: 'search',
        EMAIL: 'email',
        URL: 'url',
    },

    INPUT_AUTOGROW_DIRECTION: {
        LEFT: 'left',
        RIGHT: 'right',
    },

    YOUR_LOCATION_TEXT: 'Your Location',

    ATTACHMENT_MESSAGE_TEXT: '[Attachment]',
    ATTACHMENT_REGEX: /<video |<img /,
    ATTACHMENT_SOURCE_ATTRIBUTE: 'data-expensify-source',
    ATTACHMENT_ID_ATTRIBUTE: 'data-attachment-id',
    ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE: 'data-optimistic-src',
    ATTACHMENT_PREVIEW_ATTRIBUTE: 'src',
    ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE: 'data-name',
    ATTACHMENT_LOCAL_URL_PREFIX: ['blob:', 'file:'],
    ATTACHMENT_OR_RECEIPT_LOCAL_URL: /^https:\/\/(www\.)?([a-z0-9_-]+\.)*expensify.com(:[0-9]+)?\/(chat-attachments|receipts)/,
    ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE: 'data-expensify-thumbnail-url',
    ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE: 'data-expensify-width',
    ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE: 'data-expensify-height',
    ATTACHMENT_DURATION_ATTRIBUTE: 'data-expensify-duration',
    ATTACHMENT_IMAGE_DEFAULT_NAME: 'shared_image.png',
    ATTACHMENT_PICKER_TYPE: {
        FILE: 'file',
        IMAGE: 'image',
    },

    ATTACHMENT_FILE_TYPE: {
        FILE: 'file',
        IMAGE: 'image',
        VIDEO: 'video',
    },

    IMAGE_FILE_FORMAT: {
        PNG: 'image/png',
        WEBP: 'image/webp',
        JPEG: 'image/jpeg',
        JPG: 'image/jpg',
        GIF: 'image/gif',
        TIF: 'image/tif',
        TIFF: 'image/tiff',
    },

    RECEIPT_ALLOWED_FILE_TYPES: {
        PNG: 'image/png',
        WEBP: 'image/webp',
        JPEG: 'image/jpeg',
        JPG: 'image/jpg',
        GIF: 'image/gif',
        TIF: 'image/tif',
        TIFF: 'image/tiff',
        IMG: 'image/*',
        HTML: 'text/html',
        XML: 'text/xml',
        RTF: 'application/rtf',
        PDF: 'application/pdf',
        OFFICE: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        MSWORD: 'application/msword',
        ZIP: 'application/zip',
        RFC822: 'message/rfc822',
        HEIC: 'image/heic',
    },

    SHARE_FILE_MIMETYPE: {
        JPG: 'image/jpg',
        JPEG: 'image/jpeg',
        GIF: 'image/gif',
        PNG: 'image/png',
        WEBP: 'image/webp',
        TIF: 'image/tif',
        TIFF: 'image/tiff',
        HEIC: 'image/heic',
        IMG: 'image/*',
        PDF: 'application/pdf',
        MSWORD: 'application/msword',
        OFFICE: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        RTF: 'application/rtf',
        ZIP: 'application/zip',
        APP_TEXT: 'application/txt',
        RFC822: 'message/rfc822',
        TEXT: 'text/plain',
        HTML: 'text/html',
        XML: 'text/xml',
        MPEG: 'audio/mpeg',
        AAC: 'audio/aac',
        FLAC: 'audio/flac',
        WAV: 'audio/wav',
        XWAV: 'audio/x-wav',
        MP3: 'audio/mp3',
        VORBIS: 'audio/vorbis',
        XVORBIS: 'audio/x-vorbis',
        OPUS: 'audio/opus',
        MP4: 'video/mp4',
        MP2T: 'video/mp2t',
        WEBM: 'video/webm',
        VIDEO_MPEG: 'video/mpeg',
        AVC: 'video/avc',
        HEVC: 'video/hevc',
        XVND8: 'video/x-vnd.on2.vp8',
        XVND9: 'video/x-vnd.on2.vp9',
        AV01: 'video/av01',
        VIDEO: 'video/*',
        TXT: 'txt',
        CSV: 'text/csv',
    },

    MULTI_LEVEL_TAGS_FILE_NAME: 'MultiLevelTags.csv',

    ATTACHMENT_TYPE: {
        REPORT: 'r',
        NOTE: 'n',
        SEARCH: 's',
        ONBOARDING: 'o',
    },

    IMAGE_HIGH_RESOLUTION_THRESHOLD: 7000,

    IMAGE_OBJECT_POSITION: {
        TOP: 'top',
        INITIAL: 'initial',
    },

    FILE_TYPE_REGEX: {
        // Image MimeTypes allowed by iOS photos app.
        IMAGE: /\.(jpg|jpeg|png|webp|gif|tiff|bmp|heic|heif)$/,
        // Video MimeTypes allowed by iOS photos app.
        VIDEO: /\.(mov|mp4)$/,
    },

    FILE_VALIDATION_ERRORS: {
        WRONG_FILE_TYPE: 'wrongFileType',
        WRONG_FILE_TYPE_MULTIPLE: 'wrongFileTypeMultiple',
        FILE_TOO_LARGE: 'fileTooLarge',
        FILE_TOO_LARGE_MULTIPLE: 'fileTooLargeMultiple',
        FILE_TOO_SMALL: 'fileTooSmall',
        FILE_CORRUPTED: 'fileCorrupted',
        FOLDER_NOT_ALLOWED: 'folderNotAllowed',
        MAX_FILE_LIMIT_EXCEEDED: 'fileLimitExceeded',
        PROTECTED_FILE: 'protectedFile',
    },

    IOS_CAMERA_ROLL_ACCESS_ERROR: 'Access to photo library was denied',
    ADD_PAYMENT_MENU_POSITION_Y: 226,
    ADD_PAYMENT_MENU_POSITION_X: 356,
    EMOJI_PICKER_ITEM_TYPES: {
        HEADER: 'header',
        EMOJI: 'emoji',
        SPACER: 'spacer',
    },
    EMOJI_PICKER_SIZE: {
        WIDTH: 320,
        HEIGHT: 416,
    },
    SEARCH_ITEM_LIMIT: 15,
    CATEGORY_SHORTCUT_BAR_HEIGHT: 32,
    SMALL_EMOJI_PICKER_SIZE: {
        WIDTH: '100%',
    },
    MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM: 83,
    NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT: 300,
    NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT_WEB: 200,
    EMOJI_PICKER_ITEM_HEIGHT: 32,
    EMOJI_PICKER_HEADER_HEIGHT: 32,
    RECIPIENT_LOCAL_TIME_HEIGHT: 25,
    AUTO_COMPLETE_SUGGESTER: {
        SUGGESTER_PADDING: 6,
        SUGGESTER_INNER_PADDING: 8,
        SUGGESTION_ROW_HEIGHT: 40,
        SMALL_CONTAINER_HEIGHT_FACTOR: 2.5,
        MAX_AMOUNT_OF_SUGGESTIONS: 20,
        MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER: 5,
        HERE_TEXT: '@here',
        SUGGESTION_BOX_MAX_SAFE_DISTANCE: 10,
        BIG_SCREEN_SUGGESTION_WIDTH: 300,
    },
    COMPOSER_MAX_HEIGHT: 125,
    CHAT_FOOTER_SECONDARY_ROW_HEIGHT: 15,
    CHAT_FOOTER_SECONDARY_ROW_PADDING: 5,
    CHAT_FOOTER_MIN_HEIGHT: 65,
    CHAT_FOOTER_HORIZONTAL_PADDING: 40,
    CHAT_SKELETON_VIEW: {
        AVERAGE_ROW_HEIGHT: 80,
        HEIGHT_FOR_ROW_COUNT: {
            1: 60,
            2: 80,
            3: 100,
        },
    },
    CENTRAL_PANE_ANIMATION_HEIGHT: 200,
    LHN_SKELETON_VIEW_ITEM_HEIGHT: 64,
    LHN_VIEWPORT_ITEM_COUNT: 20,
    SEARCH_SKELETON_VIEW_ITEM_HEIGHT: 108,
    SEARCH_SKELETON_VIEW_ITEM_HEIGHT_SMALL: 96,
    EXPENSIFY_PARTNER_NAME: 'expensify.com',
    EXPENSIFY_MERCHANT: 'Expensify',
    EMAIL,

    FULLSTORY: {
        CLASS: {
            MASK: 'fs-mask',
            UNMASK: 'fs-unmask',
            EXCLUDE: 'fs-exclude',
        },
        OPERATION: {
            TRACK_EVENT: 'trackEvent',
            GET_SESSION: 'getSession',
            INIT: 'init',
            LOG: 'log',
            SOURCE: 'source',
            OBSERVE: 'observe',
            RESTART: 'restart',
            SET_IDENTITY: 'setIdentity',
            SET_CONFIG: 'setConfig',
            SET_PAGE: 'setPage',
            SET_PROPERTIES: 'setProperties',
            SHUTDOWN: 'shutdown',
            START: 'start',
            STAT: 'stat',
        },
    },

    CONCIERGE_DISPLAY_NAME: 'Concierge',

    INTEGRATION_ENTITY_MAP_TYPES: {
        DEFAULT: 'DEFAULT',
        NONE: 'NONE',
        TAG: 'TAG',
        REPORT_FIELD: 'REPORT_FIELD',
        NOT_IMPORTED: 'NOT_IMPORTED',
        IMPORTED: 'IMPORTED',
        NETSUITE_DEFAULT: 'NETSUITE_DEFAULT',
    },
    QUICKBOOKS_ONLINE: 'quickbooksOnline',

    QUICKBOOKS_DESKTOP_CONFIG: {
        EXPORT_DATE: 'exportDate',
        EXPORTER: 'exporter',
        MARK_CHECKS_TO_BE_PRINTED: 'markChecksToBePrinted',
        REIMBURSABLE_ACCOUNT: 'reimbursableAccount',
        NON_REIMBURSABLE_ACCOUNT: 'nonReimbursableAccount',
        REIMBURSABLE: 'reimbursable',
        NON_REIMBURSABLE: 'nonReimbursable',
        SHOULD_AUTO_CREATE_VENDOR: 'shouldAutoCreateVendor',
        NON_REIMBURSABLE_BILL_DEFAULT_VENDOR: 'nonReimbursableBillDefaultVendor',
        AUTO_SYNC: 'autoSync',
        ENABLE_NEW_CATEGORIES: 'enableNewCategories',
        MAPPINGS: {
            CLASSES: 'classes',
            CUSTOMERS: 'customers',
        },
        IMPORT_ITEMS: 'importItems',
        AUTO_SYNC_ENABLED: 'enabled',
        ACCOUNTING_METHOD: 'accountingMethod',
    },

    QUICKBOOKS_CONFIG: {
        ENABLE_NEW_CATEGORIES: 'enableNewCategories',
        SYNC_CLASSES: 'syncClasses',
        SYNC_CUSTOMERS: 'syncCustomers',
        SYNC_LOCATIONS: 'syncLocations',
        SYNC_TAX: 'syncTax',
        EXPORT: 'export',
        EXPORTER: 'exporter',
        EXPORT_DATE: 'exportDate',
        NON_REIMBURSABLE_EXPENSES_ACCOUNT: 'nonReimbursableExpensesAccount',
        NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'nonReimbursableExpensesExportDestination',
        REIMBURSABLE_EXPENSES_ACCOUNT: 'reimbursableExpensesAccount',
        REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'reimbursableExpensesExportDestination',
        NON_REIMBURSABLE_BILL_DEFAULT_VENDOR: 'nonReimbursableBillDefaultVendor',
        NON_REIMBURSABLE_EXPENSE_EXPORT_DESTINATION: 'nonReimbursableExpensesExportDestination',
        NON_REIMBURSABLE_EXPENSE_ACCOUNT: 'nonReimbursableExpensesAccount',
        RECEIVABLE_ACCOUNT: 'receivableAccount',
        AUTO_SYNC: 'autoSync',
        ENABLED: 'enabled',
        SYNC_PEOPLE: 'syncPeople',
        AUTO_CREATE_VENDOR: 'autoCreateVendor',
        REIMBURSEMENT_ACCOUNT_ID: 'reimbursementAccountID',
        COLLECTION_ACCOUNT_ID: 'collectionAccountID',
        ACCOUNTING_METHOD: 'accountingMethod',
    },

    XERO_CONFIG: {
        AUTO_SYNC: 'autoSync',
        ENABLED: 'enabled',
        REIMBURSEMENT_ACCOUNT_ID: 'reimbursementAccountID',
        INVOICE_COLLECTIONS_ACCOUNT_ID: 'invoiceCollectionsAccountID',
        SYNC: 'sync',
        SYNC_REIMBURSED_REPORTS: 'syncReimbursedReports',
        ENABLE_NEW_CATEGORIES: 'enableNewCategories',
        EXPORT: 'export',
        EXPORTER: 'exporter',
        BILL_DATE: 'billDate',
        BILL_STATUS: 'billStatus',
        NON_REIMBURSABLE_ACCOUNT: 'nonReimbursableAccount',
        TENANT_ID: 'tenantID',
        IMPORT_CUSTOMERS: 'importCustomers',
        IMPORT_TAX_RATES: 'importTaxRates',
        INVOICE_STATUS: {
            DRAFT: 'DRAFT',
            AWAITING_APPROVAL: 'AWT_APPROVAL',
            AWAITING_PAYMENT: 'AWT_PAYMENT',
        },
        IMPORT_TRACKING_CATEGORIES: 'importTrackingCategories',
        MAPPINGS: 'mappings',
        TRACKING_CATEGORY_PREFIX: 'trackingCategory_',
        TRACKING_CATEGORY_FIELDS: {
            COST_CENTERS: 'cost centers',
            REGION: 'region',
        },
        TRACKING_CATEGORY_OPTIONS: {
            DEFAULT: 'DEFAULT',
            TAG: 'TAG',
            REPORT_FIELD: 'REPORT_FIELD',
        },
        ACCOUNTING_METHOD: 'accountingMethod',
    },

    SAGE_INTACCT_MAPPING_VALUE: {
        NONE: 'NONE',
        DEFAULT: 'DEFAULT',
        TAG: 'TAG',
        REPORT_FIELD: 'REPORT_FIELD',
    },

    SAGE_INTACCT_CONFIG: {
        MAPPINGS: {
            DEPARTMENTS: 'departments',
            CLASSES: 'classes',
            LOCATIONS: 'locations',
            CUSTOMERS: 'customers',
            PROJECTS: 'projects',
        },
        SYNC_ITEMS: 'syncItems',
        TAX: 'tax',
        TAX_SOLUTION_ID: 'taxSolutionID',
        EXPORT: 'export',
        EXPORT_DATE: 'exportDate',
        NON_REIMBURSABLE_CREDIT_CARD_VENDOR: 'nonReimbursableCreditCardChargeDefaultVendor',
        NON_REIMBURSABLE_VENDOR: 'nonReimbursableVendor',
        REIMBURSABLE_VENDOR: 'reimbursableExpenseReportDefaultVendor',
        NON_REIMBURSABLE_ACCOUNT: 'nonReimbursableAccount',
        NON_REIMBURSABLE: 'nonReimbursable',
        EXPORTER: 'exporter',
        REIMBURSABLE: 'reimbursable',
        AUTO_SYNC: 'autoSync',
        AUTO_SYNC_ENABLED: 'enabled',
        IMPORT_EMPLOYEES: 'importEmployees',
        APPROVAL_MODE: 'approvalMode',
        SYNC: 'sync',
        SYNC_REIMBURSED_REPORTS: 'syncReimbursedReports',
        REIMBURSEMENT_ACCOUNT_ID: 'reimbursementAccountID',
        ENTITY: 'entity',
        DIMENSION_PREFIX: 'dimension_',
        ACCOUNTING_METHOD: 'accountingMethod',
    },

    SAGE_INTACCT: {
        APPROVAL_MODE: {
            APPROVAL_MANUAL: 'APPROVAL_MANUAL',
        },
    },

    QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE: {
        VENDOR_BILL: 'bill',
        CHECK: 'check',
        JOURNAL_ENTRY: 'journal_entry',
    },

    QUICKBOOKS_NON_REIMBURSABLE_ACCOUNT_TYPE: {
        CREDIT_CARD: 'credit_card',
        DEBIT_CARD: 'debit_card',
        VENDOR_BILL: 'bill',
    },

    QUICKBOOKS_DESKTOP_REIMBURSABLE_ACCOUNT_TYPE: {
        VENDOR_BILL: 'VENDOR_BILL',
        CHECK: 'CHECK',
        JOURNAL_ENTRY: 'JOURNAL_ENTRY',
    },

    SAGE_INTACCT_REIMBURSABLE_EXPENSE_TYPE: {
        EXPENSE_REPORT: 'EXPENSE_REPORT',
        VENDOR_BILL: 'VENDOR_BILL',
    },

    SAGE_INTACCT_NON_REIMBURSABLE_EXPENSE_TYPE: {
        CREDIT_CARD_CHARGE: 'CREDIT_CARD_CHARGE',
        VENDOR_BILL: 'VENDOR_BILL',
    },

    XERO_EXPORT_DATE: {
        LAST_EXPENSE: 'LAST_EXPENSE',
        REPORT_EXPORTED: 'REPORT_EXPORTED',
        REPORT_SUBMITTED: 'REPORT_SUBMITTED',
    },

    SAGE_INTACCT_EXPORT_DATE: {
        LAST_EXPENSE: 'LAST_EXPENSE',
        EXPORTED: 'EXPORTED',
        SUBMITTED: 'SUBMITTED',
    },

    NETSUITE_CONFIG: {
        SUBSIDIARY: 'subsidiary',
        EXPORTER: 'exporter',
        EXPORT_DATE: 'exportDate',
        REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'reimbursableExpensesExportDestination',
        NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'nonreimbursableExpensesExportDestination',
        DEFAULT_VENDOR: 'defaultVendor',
        REIMBURSABLE_PAYABLE_ACCOUNT: 'reimbursablePayableAccount',
        PAYABLE_ACCT: 'payableAcct',
        JOURNAL_POSTING_PREFERENCE: 'journalPostingPreference',
        RECEIVABLE_ACCOUNT: 'receivableAccount',
        INVOICE_ITEM_PREFERENCE: 'invoiceItemPreference',
        INVOICE_ITEM: 'invoiceItem',
        TAX_POSTING_ACCOUNT: 'taxPostingAccount',
        PROVINCIAL_TAX_POSTING_ACCOUNT: 'provincialTaxPostingAccount',
        ALLOW_FOREIGN_CURRENCY: 'allowForeignCurrency',
        EXPORT_TO_NEXT_OPEN_PERIOD: 'exportToNextOpenPeriod',
        IMPORT_FIELDS: ['departments', 'classes', 'locations'],
        AUTO_SYNC: 'autoSync',
        ACCOUNTING_METHOD: 'accountingMethod',
        REIMBURSEMENT_ACCOUNT_ID: 'reimbursementAccountID',
        COLLECTION_ACCOUNT: 'collectionAccount',
        AUTO_CREATE_ENTITIES: 'autoCreateEntities',
        APPROVAL_ACCOUNT: 'approvalAccount',
        CUSTOM_FORM_ID_OPTIONS: 'customFormIDOptions',
        TOKEN_INPUT_STEP_NAMES: ['1', '2', '3', '4', '5'],
        TOKEN_INPUT_STEP_KEYS: {
            0: 'installBundle',
            1: 'enableTokenAuthentication',
            2: 'enableSoapServices',
            3: 'createAccessToken',
            4: 'enterCredentials',
        },
        IMPORT_CUSTOM_FIELDS: {
            CUSTOM_SEGMENTS: 'customSegments',
            CUSTOM_LISTS: 'customLists',
        },
        CUSTOM_SEGMENT_FIELDS: ['segmentName', 'internalID', 'scriptID', 'mapping'],
        CUSTOM_LIST_FIELDS: ['listName', 'internalID', 'transactionFieldID', 'mapping'],
        CUSTOM_FORM_ID_ENABLED: 'enabled',
        CUSTOM_FORM_ID_TYPE: {
            REIMBURSABLE: 'reimbursable',
            NON_REIMBURSABLE: 'nonReimbursable',
        },
        SYNC_OPTIONS: {
            SYNC_REIMBURSED_REPORTS: 'syncReimbursedReports',
            SYNC_PEOPLE: 'syncPeople',
            ENABLE_NEW_CATEGORIES: 'enableNewCategories',
            EXPORT_REPORTS_TO: 'exportReportsTo',
            EXPORT_VENDOR_BILLS_TO: 'exportVendorBillsTo',
            EXPORT_JOURNALS_TO: 'exportJournalsTo',
            SYNC_TAX: 'syncTax',
            CROSS_SUBSIDIARY_CUSTOMERS: 'crossSubsidiaryCustomers',
            CUSTOMER_MAPPINGS: {
                CUSTOMERS: 'customers',
                JOBS: 'jobs',
            },
        },
        NETSUITE_ADD_CUSTOM_LIST_STEP_NAMES: ['1', '2,', '3', '4'],
        NETSUITE_ADD_CUSTOM_SEGMENT_STEP_NAMES: ['1', '2,', '3', '4', '5', '6,'],
    },

    NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES: {
        CUSTOM_LISTS: {
            CUSTOM_LIST_PICKER: 0,
            TRANSACTION_FIELD_ID: 1,
            MAPPING: 2,
            CONFIRM: 3,
        },
        CUSTOM_SEGMENTS: {
            SEGMENT_TYPE: 0,
            SEGMENT_NAME: 1,
            INTERNAL_ID: 2,
            SCRIPT_ID: 3,
            MAPPING: 4,
            CONFIRM: 5,
        },
    },

    NETSUITE_CUSTOM_RECORD_TYPES: {
        CUSTOM_SEGMENT: 'customSegment',
        CUSTOM_RECORD: 'customRecord',
    },

    NETSUITE_FORM_STEPS_HEADER_HEIGHT: 40,

    NETSUITE_IMPORT: {
        HELP_LINKS: {
            CUSTOM_SEGMENTS: 'https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/NetSuite#custom-segments',
            CUSTOM_LISTS: 'https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/NetSuite#custom-lists',
        },
    },

    NETSUITE_EXPORT_DATE: {
        LAST_EXPENSE: 'LAST_EXPENSE',
        EXPORTED: 'EXPORTED',
        SUBMITTED: 'SUBMITTED',
    },

    NETSUITE_EXPORT_DESTINATION: {
        EXPENSE_REPORT: 'EXPENSE_REPORT',
        VENDOR_BILL: 'VENDOR_BILL',
        JOURNAL_ENTRY: 'JOURNAL_ENTRY',
    },

    NETSUITE_MAP_EXPORT_DESTINATION: {
        EXPENSE_REPORT: 'expenseReport',
        VENDOR_BILL: 'vendorBill',
        JOURNAL_ENTRY: 'journalEntry',
    },

    NETSUITE_INVOICE_ITEM_PREFERENCE: {
        CREATE: 'create',
        SELECT: 'select',
    },

    NETSUITE_JOURNAL_POSTING_PREFERENCE: {
        JOURNALS_POSTING_INDIVIDUAL_LINE: 'JOURNALS_POSTING_INDIVIDUAL_LINE',
        JOURNALS_POSTING_TOTAL_LINE: 'JOURNALS_POSTING_TOTAL_LINE',
    },

    NETSUITE_EXPENSE_TYPE: {
        REIMBURSABLE: 'reimbursable',
        NON_REIMBURSABLE: 'nonreimbursable',
    },

    NETSUITE_REPORTS_APPROVAL_LEVEL: {
        REPORTS_APPROVED_NONE: 'REPORTS_APPROVED_NONE',
        REPORTS_SUPERVISOR_APPROVED: 'REPORTS_SUPERVISOR_APPROVED',
        REPORTS_ACCOUNTING_APPROVED: 'REPORTS_ACCOUNTING_APPROVED',
        REPORTS_APPROVED_BOTH: 'REPORTS_APPROVED_BOTH',
    },

    NETSUITE_VENDOR_BILLS_APPROVAL_LEVEL: {
        VENDOR_BILLS_APPROVED_NONE: 'VENDOR_BILLS_APPROVED_NONE',
        VENDOR_BILLS_APPROVAL_PENDING: 'VENDOR_BILLS_APPROVAL_PENDING',
        VENDOR_BILLS_APPROVED: 'VENDOR_BILLS_APPROVED',
    },

    NETSUITE_JOURNALS_APPROVAL_LEVEL: {
        JOURNALS_APPROVED_NONE: 'JOURNALS_APPROVED_NONE',
        JOURNALS_APPROVAL_PENDING: 'JOURNALS_APPROVAL_PENDING',
        JOURNALS_APPROVED: 'JOURNALS_APPROVED',
    },

    NETSUITE_ACCOUNT_TYPE: {
        ACCOUNTS_PAYABLE: '_accountsPayable',
        ACCOUNTS_RECEIVABLE: '_accountsReceivable',
        OTHER_CURRENT_LIABILITY: '_otherCurrentLiability',
        CREDIT_CARD: '_creditCard',
        BANK: '_bank',
        OTHER_CURRENT_ASSET: '_otherCurrentAsset',
        LONG_TERM_LIABILITY: '_longTermLiability',
        EXPENSE: '_expense',
    },

    NETSUITE_APPROVAL_ACCOUNT_DEFAULT: 'APPROVAL_ACCOUNT_DEFAULT',

    NETSUITE_PAYABLE_ACCOUNT_DEFAULT_VALUE: '',

    /**
     * Countries where tax setting is permitted (Strings are in the format of Netsuite's Country type/enum)
     *
     * Should mirror the list on the OldDot.
     */
    NETSUITE_TAX_COUNTRIES: [
        '_argentina',
        '_australia',
        '_austria',
        '_azerbaijan',
        '_belgium',
        '_brazil',
        '_bulgaria',
        '_canada',
        '_chile',
        '_china',
        '_costaRica',
        '_croatia',
        '_croatiaHrvatska',
        '_cyprus',
        '_czechRepublic',
        '_denmark',
        '_egypt',
        '_estonia',
        '_finland',
        '_france',
        '_georgia',
        '_germany',
        '_ghana',
        '_greece',
        '_hongKong',
        '_hungary',
        '_india',
        '_indonesia',
        '_iranIslamicRepublicOf',
        '_ireland',
        '_israel',
        '_italy',
        '_japan',
        '_jordan',
        '_kenya',
        '_koreaRepublicOf',
        '_koreaTheRepublicOf',
        '_kuwait',
        '_latvia',
        '_lebanon',
        '_lithuania',
        '_luxembourg',
        '_malaysia',
        '_malta',
        '_mexico',
        '_morocco',
        '_myanmar',
        '_netherlands',
        '_newZealand',
        '_nigeria',
        '_norway',
        '_pakistan',
        '_philippines',
        '_poland',
        '_portugal',
        '_romania',
        '_saudiArabia',
        '_serbia',
        '_singapore',
        '_slovakRepublic',
        '_slovakia',
        '_slovenia',
        '_southAfrica',
        '_spain',
        '_sriLanka',
        '_sweden',
        '_switzerland',
        '_taiwan',
        '_thailand',
        '_turkey',
        '_turkiye',
        '_ukraine',
        '_unitedArabEmirates',
        '_unitedKingdom',
        '_unitedKingdomGB',
        '_vietnam',
        '_vietNam',
    ] as string[],

    QUICKBOOKS_EXPORT_DATE: {
        LAST_EXPENSE: 'LAST_EXPENSE',
        REPORT_EXPORTED: 'REPORT_EXPORTED',
        REPORT_SUBMITTED: 'REPORT_SUBMITTED',
    },

    QUICKBOOKS_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE: {
        CREDIT_CARD: 'credit_card',
        DEBIT_CARD: 'debit_card',
        VENDOR_BILL: 'bill',
    },

    QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPORT_ACCOUNT_TYPE: {
        CREDIT_CARD: 'CREDIT_CARD_CHARGE',
        CHECK: 'CHECK',
        VENDOR_BILL: 'VENDOR_BILL',
    },

    MISSING_PERSONAL_DETAILS: {
        STEP_INDEX_LIST: ['1', '2', '3', '4'],
        PAGE_NAME: {
            LEGAL_NAME: 'legal-name',
            DATE_OF_BIRTH: 'date-of-birth',
            ADDRESS: 'address',
            PHONE_NUMBER: 'phone-number',
            CONFIRM: 'confirm',
        },
    },
    MISSING_PERSONAL_DETAILS_INDEXES: {
        MAPPING: {
            LEGAL_NAME: 0,
            DATE_OF_BIRTH: 1,
            ADDRESS: 2,
            PHONE_NUMBER: 3,
            CONFIRM: 4,
        },
        INDEX_LIST: ['1', '2', '3', '4'],
    },

    ACCOUNT_ID: {
        ACCOUNTING: Number(Config?.EXPENSIFY_ACCOUNT_ID_ACCOUNTING ?? 9645353),
        ACCOUNTS_PAYABLE: Number(Config?.EXPENSIFY_ACCOUNT_ID_ACCOUNTS_PAYABLE ?? 10903701),
        ADMIN: Number(Config?.EXPENSIFY_ACCOUNT_ID_ADMIN ?? -1),
        BILLS: Number(Config?.EXPENSIFY_ACCOUNT_ID_BILLS ?? 1371),
        CHRONOS: Number(Config?.EXPENSIFY_ACCOUNT_ID_CHRONOS ?? 10027416),
        CONCIERGE: Number(Config?.EXPENSIFY_ACCOUNT_ID_CONCIERGE ?? 8392101),
        CONTRIBUTORS: Number(Config?.EXPENSIFY_ACCOUNT_ID_CONTRIBUTORS ?? 9675014),
        FIRST_RESPONDER: Number(Config?.EXPENSIFY_ACCOUNT_ID_FIRST_RESPONDER ?? 9375152),
        HELP: Number(Config?.EXPENSIFY_ACCOUNT_ID_HELP ?? -1),
        INTEGRATION_TESTING_CREDS: Number(Config?.EXPENSIFY_ACCOUNT_ID_INTEGRATION_TESTING_CREDS ?? -1),
        NOTIFICATIONS: Number(Config?.EXPENSIFY_ACCOUNT_ID_NOTIFICATIONS ?? 11665625),
        PAYROLL: Number(Config?.EXPENSIFY_ACCOUNT_ID_PAYROLL ?? 9679724),
        QA: Number(Config?.EXPENSIFY_ACCOUNT_ID_QA ?? 3126513),
        QA_TRAVIS: Number(Config?.EXPENSIFY_ACCOUNT_ID_QA_TRAVIS ?? 8595733),
        RECEIPTS: Number(Config?.EXPENSIFY_ACCOUNT_ID_RECEIPTS ?? -1),
        REWARDS: Number(Config?.EXPENSIFY_ACCOUNT_ID_REWARDS ?? 11023767), // rewards@expensify.com
        STUDENT_AMBASSADOR: Number(Config?.EXPENSIFY_ACCOUNT_ID_STUDENT_AMBASSADOR ?? 10476956),
        SVFG: Number(Config?.EXPENSIFY_ACCOUNT_ID_SVFG ?? 2012843),
        MANAGER_MCTEST: Number(Config?.EXPENSIFY_ACCOUNT_ID_MANAGER_MCTEST ?? 18964612),
        QA_GUIDE: Number(Config?.EXPENSIFY_ACCOUNT_ID_QA_GUIDE ?? 14365522),
    },

    ENVIRONMENT: {
        DEV: 'development',
        STAGING: 'staging',
        PRODUCTION: 'production',
        ADHOC: 'adhoc',
    },

    // Used to delay the initial fetching of reportActions when the app first inits or reconnects (e.g. returning
    // from backgound). The times are based on how long it generally seems to take for the app to become interactive
    // in each scenario.
    FETCH_ACTIONS_DELAY: {
        STARTUP: 8000,
        RECONNECT: 1000,
    },

    WALLET: {
        TRANSFER_METHOD_TYPE: {
            INSTANT: 'instant',
            ACH: 'ach',
        },
        TRANSFER_METHOD_TYPE_FEE: {
            INSTANT: {
                RATE: 1.5,
                MINIMUM_FEE: 25,
            },
            ACH: {
                RATE: 0,
                MINIMUM_FEE: 0,
            },
        },
        ERROR: {
            // If these get updated, we need to update the codes on the Web side too
            SSN: 'ssnError',
            KBA: 'kbaNeeded',
            KYC: 'kycFailed',
            FULL_SSN_NOT_FOUND: 'Full SSN not found',
            MISSING_FIELD: 'Missing required additional details fields',
            WRONG_ANSWERS: 'Wrong answers',
            ONFIDO_FIXABLE_ERROR: 'Onfido returned a fixable error',
            ONFIDO_USER_CONSENT_DENIED: 'user_consent_denied',

            // KBA stands for Knowledge Based Answers (requiring us to show Idology questions)
            KBA_NEEDED: 'KBA needed',
            NO_ACCOUNT_TO_LINK: '405 No account to link to wallet',
            INVALID_WALLET: '405 Invalid wallet account',
            NOT_OWNER_OF_BANK_ACCOUNT: '401 User does not own bank account',
            INVALID_BANK_ACCOUNT: '405 Bank account is not eligible for wallet transfers',
            NOT_OWNER_OF_FUND: '401 User does not own fund',
            INVALID_FUND: '405 Fund is not eligible for wallet transfers',
        },
        STEP: {
            // In the order they appear in the Wallet flow
            ADD_BANK_ACCOUNT: 'AddBankAccountStep',
            ADDITIONAL_DETAILS: 'AdditionalDetailsStep',
            ADDITIONAL_DETAILS_KBA: 'AdditionalDetailsKBAStep',
            ONFIDO: 'OnfidoStep',
            TERMS: 'TermsStep',
            ACTIVATE: 'ActivateStep',
        },
        STEP_REFACTOR: {
            ADD_BANK_ACCOUNT: 'AddBankAccountStep',
            ADDITIONAL_DETAILS: 'AdditionalDetailsStep',
            VERIFY_IDENTITY: 'VerifyIdentityStep',
            TERMS_AND_FEES: 'TermsAndFeesStep',
        },
        STEP_NAMES: ['1', '2', '3', '4'],
        SUBSTEP_INDEXES: {
            BANK_ACCOUNT: {
                ACCOUNT_NUMBERS: 0,
            },
            PERSONAL_INFO: {
                LEGAL_NAME: 0,
                DATE_OF_BIRTH: 1,
                ADDRESS: 2,
                PHONE_NUMBER: 3,
                SSN: 4,
            },
        },
        TIER_NAME: {
            PLATINUM: 'PLATINUM',
            GOLD: 'GOLD',
            SILVER: 'SILVER',
            BRONZE: 'BRONZE',
        },
        WEB_MESSAGE_TYPE: {
            STATEMENT: 'STATEMENT_NAVIGATE',
            CONCIERGE: 'CONCIERGE_NAVIGATE',
        },
        MTL_WALLET_PROGRAM_ID: '760',
        BANCORP_WALLET_PROGRAM_ID: '660',
        PROGRAM_ISSUERS: {
            EXPENSIFY_PAYMENTS: 'Expensify Payments LLC',
            BANCORP_BANK: 'The Bancorp Bank, N.A.',
        },
        STATEMENT_ACTIONS: {
            SUBMIT_EXPENSE: 'start/submit/manual',
            PAY_SOMEONE: 'start/pay/manual',
            SPLIT_EXPENSE: 'start/split/manual',
        },
    },

    PLAID: {
        EVENT: {
            ERROR: 'ERROR',
            EXIT: 'EXIT',
        },
        DEFAULT_DATA: {
            bankName: '',
            plaidAccessToken: '',
            bankAccounts: [] as PlaidBankAccount[],
            isLoading: false,
            errors: {},
        },
    },

    ONFIDO: {
        CONTAINER_ID: 'onfido-mount',
        TYPE: {
            DOCUMENT: 'document',
            FACE: 'face',
        },
        VARIANT: {
            VIDEO: 'video',
        },
        SMS_NUMBER_COUNTRY_CODE: 'US',
        ERROR: {
            USER_CANCELLED: 'User canceled flow.',
            USER_TAPPED_BACK: 'User exited by clicking the back button.',
            USER_EXITED: 'User exited by manual action.',
        },
    },

    KYC_WALL_SOURCE: {
        REPORT: 'REPORT', // The user attempted to pay an expense
        ENABLE_WALLET: 'ENABLE_WALLET', // The user clicked on the `Enable wallet` button on the Wallet page
        TRANSFER_BALANCE: 'TRANSFER_BALANCE', // The user attempted to transfer their wallet balance to their bank account or debit card
    },

    OS: {
        WINDOWS: 'Windows',
        MAC_OS: PLATFORM_OS_MACOS,
        ANDROID: 'Android',
        IOS: PLATFORM_IOS,
        LINUX: 'Linux',
        NATIVE: 'Native',
    },

    BROWSER: {
        CHROME: 'chrome',
        FIREFOX: 'firefox',
        IE: 'ie',
        EDGE: 'edge',
        Opera: 'opera',
        SAFARI: 'safari',
        OTHER: 'other',
    },

    PAYMENT_METHODS: {
        DEBIT_CARD: 'debitCard',
        PERSONAL_BANK_ACCOUNT: 'bankAccount',
        BUSINESS_BANK_ACCOUNT: 'businessBankAccount',
    },

    PAYMENT_SELECTED: {
        BBA: 'BBA',
        PBA: 'PBA',
    },

    PAYMENT_METHOD_ID_KEYS: {
        DEBIT_CARD: 'fundID',
        BANK_ACCOUNT: 'bankAccountID',
    },

    IOU: {
        MAX_RECENT_REPORTS_TO_SHOW: 5,
        // This will guranatee that the quantity input will not exceed 9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER).
        QUANTITY_MAX_LENGTH: 12,
        // This is the transactionID used when going through the create expense flow so that it mimics a real transaction (like the edit flow)
        OPTIMISTIC_TRANSACTION_ID: '1',
        // Note: These payment types are used when building IOU reportAction message values in the server and should
        // not be changed.
        LOCATION_PERMISSION_PROMPT_THRESHOLD_DAYS: 7,
        // Maximum number of splits allowed for expenses
        SPLITS_LIMIT: 30,
        PAYMENT_TYPE: {
            ELSEWHERE: 'Elsewhere',
            EXPENSIFY: 'Expensify',
            VBBA: 'ACH',
        },
        ACTION: {
            EDIT: 'edit',
            CREATE: 'create',
            SUBMIT: 'submit',
            CATEGORIZE: 'categorize',
            SHARE: 'share',
        },
        DEFAULT_AMOUNT: 0,
        TYPE: {
            SEND: 'send',
            PAY: 'pay',
            SPLIT: 'split',
            SPLIT_EXPENSE: 'split-expense',
            REQUEST: 'request',
            INVOICE: 'invoice',
            SUBMIT: 'submit',
            TRACK: 'track',
            CREATE: 'create',
        },
        REQUEST_TYPE: {
            DISTANCE: 'distance',
            MANUAL: 'manual',
            SCAN: 'scan',
            PER_DIEM: 'per-diem',
            DISTANCE_MAP: 'distance-map',
            DISTANCE_MANUAL: 'distance-manual',
            DISTANCE_GPS: 'distance-gps',
            DISTANCE_ODOMETER: 'distance-odometer',
            TIME: 'time',
        },
        EXPENSE_TYPE: {
            DISTANCE: 'distance',
            MANUAL: 'manual',
            SCAN: 'scan',
            PER_DIEM: 'per-diem',
            EXPENSIFY_CARD: 'expensifyCard',
            PENDING_EXPENSIFY_CARD: 'pendingExpensifyCard',
            DISTANCE_MAP: 'distance-map',
            DISTANCE_MANUAL: 'distance-manual',
            DISTANCE_GPS: 'distance-gps',
            DISTANCE_ODOMETER: 'distance-odometer',
            TIME: 'time',
        },

        REPORT_ACTION_TYPE: {
            PAY: 'pay',
            CREATE: 'create',
            SPLIT: 'split',
            REJECT: 'reject',
            CANCEL: 'cancel',
            DELETE: 'delete',
            APPROVE: 'approve',
            TRACK: 'track',
        },
        AMOUNT_MAX_LENGTH: 8,
        DISTANCE_REQUEST_AMOUNT_MAX_LENGTH: 14,
        RECEIPT_STATE: {
            SCAN_READY: 'SCANREADY',
            OPEN: 'OPEN',
            SCANNING: 'SCANNING',
            SCAN_COMPLETE: 'SCANCOMPLETE',
            SCAN_FAILED: 'SCANFAILED',
        },
        FILE_TYPES: {
            HTML: 'html',
            DOC: 'doc',
            DOCX: 'docx',
            SVG: 'svg',
        },
        RECEIPT_ERROR: 'receiptError',
        CANCEL_REASON: {
            PAYMENT_EXPIRED: 'CANCEL_REASON_PAYMENT_EXPIRED',
        },
        SHARE: {
            ROLE: {
                ACCOUNTANT: 'accountant',
            },
        },
        ACCESS_VARIANTS: {
            CREATE: 'create',
        },
        PAGE_INDEX: {
            CONFIRM: 'confirm',
        },
        PAYMENT_SELECTED: {
            BBA: 'BBA',
            PBA: 'PBA',
        },
        ACTION_PARAMS: {
            START_SPLIT_BILL: 'startSplitBill',
            TRACK_EXPENSE: 'trackExpense',
            MONEY_REQUEST: 'moneyRequest',
            REPLACE_RECEIPT: 'replaceReceipt',
        },
    },

    CATEGORY_SOURCE: {
        AI: 'agentZero',
        MCC: 'mccMapping',
        MANUAL: 'manual',
    } as const,

    GROWL: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        DURATION: 2000,
        DURATION_LONG: 3500,
    },

    LOCALES,

    PRONOUNS_LIST: [
        'coCos',
        'eEyEmEir',
        'heHimHis',
        'heHimHisTheyThemTheirs',
        'sheHerHers',
        'sheHerHersTheyThemTheirs',
        'merMers',
        'neNirNirs',
        'neeNerNers',
        'perPers',
        'theyThemTheirs',
        'thonThons',
        'veVerVis',
        'viVir',
        'xeXemXyr',
        'zeZieZirHir',
        'zeHirHirs',
        'callMeByMyName',
    ],

    POLICY: {
        TYPE: {
            PERSONAL: 'personal',

            // Often referred to as "control" workspaces
            CORPORATE: 'corporate',

            // Often referred to as "collect" workspaces
            TEAM: 'team',
        },
        RULE_CONDITIONS: {
            MATCHES: 'matches',
        },
        FIELDS: {
            TAG: 'tag',
            CATEGORY: 'category',
            FIELD_LIST_TITLE: 'text_title',
            TAX: 'tax',
        },
        DEFAULT_REPORT_NAME_PATTERN: '{report:type} {report:startdate}',
        DEFAULT_FIELD_LIST_TYPE: 'formula',
        DEFAULT_FIELD_LIST_TARGET: 'expense',
        DEFAULT_FIELD_LIST_NAME: 'title',
        ROLE: {
            ADMIN: 'admin',
            AUDITOR: 'auditor',
            USER: 'user',
        },
        AUTO_REIMBURSEMENT_MAX_LIMIT_CENTS: 2000000,

        // Auto-reimbursement and auto-approval defaults are 0, but when enabled will use the suggested limit
        AUTO_REIMBURSEMENT_LIMIT_DEFAULT_CENTS: 0,
        AUTO_REIMBURSEMENT_LIMIT_SUGGESTED_CENTS: 10000,
        AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS: 0,
        AUTO_APPROVE_REPORTS_UNDER_SUGGESTED_CENTS: 10000,
        RANDOM_AUDIT_DEFAULT_PERCENTAGE: 0.0,
        RANDOM_AUDIT_SUGGESTED_PERCENTAGE: 0.05,

        AUTO_REPORTING_FREQUENCIES: {
            INSTANT: 'instant',
            IMMEDIATE: 'immediate',
            WEEKLY: 'weekly',
            SEMI_MONTHLY: 'semimonthly',
            MONTHLY: 'monthly',
            TRIP: 'trip',
            MANUAL: 'manual',
        },
        AUTO_REPORTING_OFFSET: {
            LAST_BUSINESS_DAY_OF_MONTH: 'lastBusinessDayOfMonth',
            LAST_DAY_OF_MONTH: 'lastDayOfMonth',
        },
        APPROVAL_MODE: {
            OPTIONAL: 'OPTIONAL',
            BASIC: 'BASIC',
            ADVANCED: 'ADVANCED',
            DYNAMICEXTERNAL: 'DYNAMIC_EXTERNAL',
            SMARTREPORT: 'SMARTREPORT',
            BILLCOM: 'BILLCOM',
        },
        APPROVAL_MODE_TRANSLATION_KEYS: {
            OPTIONAL: 'submitAndClose',
            BASIC: 'submitAndApprove',
            ADVANCED: 'advanced',
            DYNAMICEXTERNAL: 'dynamicExternal',
            SMARTREPORT: 'smartReport',
            BILLCOM: 'billcom',
        },
        ROOM_PREFIX: '#',
        CUSTOM_UNIT_RATE_BASE_OFFSET: 100,
        OWNER_EMAIL_FAKE: '_FAKE_',
        OWNER_ACCOUNT_ID_FAKE: 0,
        REIMBURSEMENT_CHOICES: {
            REIMBURSEMENT_YES: 'reimburseYes', // Direct
            REIMBURSEMENT_NO: 'reimburseNo', // None
            REIMBURSEMENT_MANUAL: 'reimburseManual', // Indirect
        },
        CASH_EXPENSE_REIMBURSEMENT_CHOICES: {
            REIMBURSABLE_DEFAULT: 'reimbursableDefault', // Reimbursable by default
            NON_REIMBURSABLE_DEFAULT: 'nonReimbursableDefault', // Non-reimbursable by default
            ALWAYS_REIMBURSABLE: 'alwaysReimbursable', // Always Reimbursable
            ALWAYS_NON_REIMBURSABLE: 'alwaysNonReimbursable', // Always Non Reimbursable
        },
        ID_FAKE: '_FAKE_',
        EMPTY: 'EMPTY',
        SECONDARY_ACTIONS: {
            IMPORT_SPREADSHEET: 'importSpreadsheet',
            DOWNLOAD_CSV: 'downloadCSV',
            SETTINGS: 'settings',
        },
        MEMBERS_BULK_ACTION_TYPES: {
            REMOVE: 'remove',
            MAKE_MEMBER: 'makeMember',
            MAKE_ADMIN: 'makeAdmin',
            MAKE_AUDITOR: 'makeAuditor',
        },
        BULK_ACTION_TYPES: {
            DELETE: 'delete',
            DISABLE: 'disable',
            ENABLE: 'enable',
            REQUIRE: 'require',
            NOT_REQUIRED: 'notRequired',
        },
        MORE_FEATURES: {
            ARE_CATEGORIES_ENABLED: 'areCategoriesEnabled',
            ARE_TAGS_ENABLED: 'areTagsEnabled',
            ARE_DISTANCE_RATES_ENABLED: 'areDistanceRatesEnabled',
            ARE_WORKFLOWS_ENABLED: 'areWorkflowsEnabled',
            ARE_REPORT_FIELDS_ENABLED: 'areReportFieldsEnabled',
            ARE_CONNECTIONS_ENABLED: 'areConnectionsEnabled',
            ARE_RECEIPT_PARTNERS_ENABLED: 'receiptPartners',
            ARE_COMPANY_CARDS_ENABLED: 'areCompanyCardsEnabled',
            ARE_EXPENSIFY_CARDS_ENABLED: 'areExpensifyCardsEnabled',
            ARE_INVOICES_ENABLED: 'areInvoicesEnabled',
            ARE_TAXES_ENABLED: 'tax',
            ARE_RULES_ENABLED: 'areRulesEnabled',
            ARE_PER_DIEM_RATES_ENABLED: 'arePerDiemRatesEnabled',
            IS_ATTENDEE_TRACKING_ENABLED: 'isAttendeeTrackingEnabled',
            IS_TRAVEL_ENABLED: 'isTravelEnabled',
            REQUIRE_COMPANY_CARDS_ENABLED: 'requireCompanyCardsEnabled',
            IS_TIME_TRACKING_ENABLED: 'isTimeTrackingEnabled',
        },
        DEFAULT_CATEGORIES: {
            ADVERTISING: 'Advertising',
            BENEFITS: 'Benefits',
            CAR: 'Car',
            EQUIPMENT: 'Equipment',
            FEES: 'Fees',
            HOME_OFFICE: 'Home Office',
            INSURANCE: 'Insurance',
            INTEREST: 'Interest',
            LABOR: 'Labor',
            MAINTENANCE: 'Maintenance',
            MATERIALS: 'Materials',
            MEALS_AND_ENTERTAINMENT: 'Meals and Entertainment',
            OFFICE_SUPPLIES: 'Office Supplies',
            OTHER: 'Other',
            PROFESSIONAL_SERVICES: 'Professional Services',
            RENT: 'Rent',
            TAXES: 'Taxes',
            TRAVEL: 'Travel',
            UTILITIES: 'Utilities',
        },
        OWNERSHIP_ERRORS: {
            NO_BILLING_CARD: 'noBillingCard',
            AMOUNT_OWED: 'amountOwed',
            HAS_FAILED_SETTLEMENTS: 'hasFailedSettlements',
            OWNER_OWES_AMOUNT: 'ownerOwesAmount',
            SUBSCRIPTION: 'subscription',
            DUPLICATE_SUBSCRIPTION: 'duplicateSubscription',
            FAILED_TO_CLEAR_BALANCE: 'failedToClearBalance',
        },
        COLLECTION_KEYS: {
            DESCRIPTION: 'description',
            REIMBURSER: 'reimburser',
            REIMBURSEMENT_CHOICE: 'reimbursementChoice',
            APPROVAL_MODE: 'approvalMode',
            AUTOREPORTING: 'autoReporting',
            AUTOREPORTING_FREQUENCY: 'autoReportingFrequency',
            AUTOREPORTING_OFFSET: 'autoReportingOffset',
            GENERAL_SETTINGS: 'generalSettings',
        },
        EXPENSE_REPORT_RULES: {
            PREVENT_SELF_APPROVAL: 'preventSelfApproval',
            MAX_EXPENSE_AGE: 'maxExpenseAge',
        },
        PROHIBITED_EXPENSES: {
            ALCOHOL: 'alcohol',
            HOTEL_INCIDENTALS: 'hotelIncidentals',
            GAMBLING: 'gambling',
            TOBACCO: 'tobacco',
            ADULT_ENTERTAINMENT: 'adultEntertainment',
        },
        RECEIPT_PARTNERS: {
            NAME: {UBER: 'uber'},
            NAME_USER_FRIENDLY: {
                uber: 'Uber for Business',
            },
            UBER_EMPLOYEE_STATUS: {
                CREATED: 'CREATED',
                INVITED: 'INVITED',
                LINKED_PENDING_APPROVAL: 'LINKED_PENDING_APPROVAL',
                LINKED: 'LINKED',
                SUSPENDED: 'SUSPENDED',
                DELETED: 'DELETED',
                NONE: 'NONE',
            },
        },
        CONNECTIONS: {
            NAME: {
                // Here we will add other connections names when we add support for them
                QBO: 'quickbooksOnline',
                QBD: 'quickbooksDesktop',
                XERO: 'xero',
                NETSUITE: 'netsuite',
                SAGE_INTACCT: 'intacct',
            },
            SUPPORTED_ONLY_ON_OLDDOT: {
                FINANCIALFORCE: 'financialForce',
            },
            UNSUPPORTED_NAMES: {
                GENERIC_INDIRECT_CONNECTION: 'generic_indirect_connection',
            },
            ROUTE: {
                QBO: 'quickbooks-online',
                XERO: 'xero',
                NETSUITE: 'netsuite',
                SAGE_INTACCT: 'sage-intacct',
                QBD: 'quickbooks-desktop',
            },
            NAME_USER_FRIENDLY: {
                netsuite: 'NetSuite',
                quickbooksOnline: 'QuickBooks Online',
                quickbooksDesktop: 'QuickBooks Desktop',
                xero: 'Xero',
                intacct: 'Sage Intacct',
                financialForce: 'FinancialForce',
                billCom: 'Bill.com',
                zenefits: 'Zenefits',
                sap: 'SAP',
                oracle: 'Oracle',
                microsoftDynamics: 'Microsoft Dynamics',
                other: 'Other',
            },
            CORPORATE: ['quickbooksDesktop', 'netsuite', 'intacct', 'oracle', 'sap', 'microsoftDynamics', 'other'],
            AUTH_HELP_LINKS: {
                intacct:
                    "https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Sage-Intacct-Troubleshooting#:~:text=First%20make%20sure%20that%20you,your%20company's%20Web%20Services%20authorizations.",
                netsuite:
                    'https://help.expensify.com/articles/expensify-classic/connections/netsuite/Netsuite-Troubleshooting#expensierror-ns0109-failed-to-login-to-netsuite-please-verify-your-credentials',
            },
            SYNC_STAGE_NAME: {
                STARTING_IMPORT_QBO: 'startingImportQBO',
                STARTING_IMPORT_XERO: 'startingImportXero',
                STARTING_IMPORT_QBD: 'startingImportQBD',
                QBO_IMPORT_MAIN: 'quickbooksOnlineImportMain',
                QBO_IMPORT_CUSTOMERS: 'quickbooksOnlineImportCustomers',
                QBO_IMPORT_EMPLOYEES: 'quickbooksOnlineImportEmployees',
                QBO_IMPORT_ACCOUNTS: 'quickbooksOnlineImportAccounts',
                QBO_IMPORT_CLASSES: 'quickbooksOnlineImportClasses',
                QBO_IMPORT_LOCATIONS: 'quickbooksOnlineImportLocations',
                QBO_IMPORT_PROCESSING: 'quickbooksOnlineImportProcessing',
                QBO_SYNC_PAYMENTS: 'quickbooksOnlineSyncBillPayments',
                QBO_IMPORT_TAX_CODES: 'quickbooksOnlineSyncTaxCodes',
                QBO_CHECK_CONNECTION: 'quickbooksOnlineCheckConnection',
                QBO_SYNC_TITLE: 'quickbooksOnlineSyncTitle',
                QBO_SYNC_LOAD_DATA: 'quickbooksOnlineSyncLoadData',
                QBO_SYNC_APPLY_CATEGORIES: 'quickbooksOnlineSyncApplyCategories',
                QBO_SYNC_APPLY_CUSTOMERS: 'quickbooksOnlineSyncApplyCustomers',
                QBO_SYNC_APPLY_PEOPLE: 'quickbooksOnlineSyncApplyEmployees',
                QBO_SYNC_APPLY_CLASSES_LOCATIONS: 'quickbooksOnlineSyncApplyClassesLocations',
                QBD_IMPORT_TITLE: 'quickbooksDesktopImportTitle',
                QBD_IMPORT_ACCOUNTS: 'quickbooksDesktopImportAccounts',
                QBD_IMPORT_APPROVE_CERTIFICATE: 'quickbooksDesktopImportApproveCertificate',
                QBD_IMPORT_DIMENSIONS: 'quickbooksDesktopImportDimensions',
                QBD_IMPORT_CLASSES: 'quickbooksDesktopImportClasses',
                QBD_IMPORT_CUSTOMERS: 'quickbooksDesktopImportCustomers',
                QBD_IMPORT_VENDORS: 'quickbooksDesktopImportVendors',
                QBD_IMPORT_EMPLOYEES: 'quickbooksDesktopImportEmployees',
                QBD_IMPORT_MORE: 'quickbooksDesktopImportMore',
                QBD_IMPORT_GENERIC: 'quickbooksDesktopImportSavePolicy',
                QBD_WEB_CONNECTOR_REMINDER: 'quickbooksDesktopWebConnectorReminder',
                JOB_DONE: 'jobDone',
                XERO_SYNC_STEP: 'xeroSyncStep',
                XERO_SYNC_XERO_REIMBURSED_REPORTS: 'xeroSyncXeroReimbursedReports',
                XERO_SYNC_EXPENSIFY_REIMBURSED_REPORTS: 'xeroSyncExpensifyReimbursedReports',
                XERO_SYNC_IMPORT_CHART_OF_ACCOUNTS: 'xeroSyncImportChartOfAccounts',
                XERO_SYNC_IMPORT_CATEGORIES: 'xeroSyncImportCategories',
                XERO_SYNC_IMPORT_TRACKING_CATEGORIES: 'xeroSyncImportTrackingCategories',
                XERO_SYNC_IMPORT_CUSTOMERS: 'xeroSyncImportCustomers',
                XERO_SYNC_IMPORT_BANK_ACCOUNTS: 'xeroSyncImportBankAccounts',
                XERO_SYNC_IMPORT_TAX_RATES: 'xeroSyncImportTaxRates',
                XERO_CHECK_CONNECTION: 'xeroCheckConnection',
                XERO_SYNC_TITLE: 'xeroSyncTitle',
                NETSUITE_SYNC_CONNECTION: 'netSuiteSyncConnection',
                NETSUITE_SYNC_CUSTOMERS: 'netSuiteSyncCustomers',
                NETSUITE_SYNC_INIT_DATA: 'netSuiteSyncInitData',
                NETSUITE_SYNC_IMPORT_TAXES: 'netSuiteSyncImportTaxes',
                NETSUITE_SYNC_IMPORT_ITEMS: 'netSuiteSyncImportItems',
                NETSUITE_SYNC_DATA: 'netSuiteSyncData',
                NETSUITE_SYNC_ACCOUNTS: 'netSuiteSyncAccounts',
                NETSUITE_SYNC_CURRENCIES: 'netSuiteSyncCurrencies',
                NETSUITE_SYNC_CATEGORIES: 'netSuiteSyncCategories',
                NETSUITE_SYNC_IMPORT_CUSTOM_LISTS: 'netSuiteSyncImportCustomLists',
                NETSUITE_SYNC_IMPORT_EMPLOYEES: 'netSuiteSyncImportEmployees',
                NETSUITE_SYNC_IMPORT_SUBSIDIARIES: 'netSuiteSyncImportSubsidiaries',
                NETSUITE_SYNC_IMPORT_VENDORS: 'netSuiteSyncImportVendors',
                NETSUITE_SYNC_REPORT_FIELDS: 'netSuiteSyncReportFields',
                NETSUITE_SYNC_TAGS: 'netSuiteSyncTags',
                NETSUITE_SYNC_UPDATE_DATA: 'netSuiteSyncUpdateConnectionData',
                NETSUITE_SYNC_NETSUITE_REIMBURSED_REPORTS: 'netSuiteSyncNetSuiteReimbursedReports',
                NETSUITE_SYNC_EXPENSIFY_REIMBURSED_REPORTS: 'netSuiteSyncExpensifyReimbursedReports',
                NETSUITE_SYNC_IMPORT_VENDORS_TITLE: 'netSuiteImportVendorsTitle',
                NETSUITE_SYNC_IMPORT_CUSTOM_LISTS_TITLE: 'netSuiteImportCustomListsTitle',
                SAGE_INTACCT_SYNC_CHECK_CONNECTION: 'intacctCheckConnection',
                SAGE_INTACCT_SYNC_IMPORT_TITLE: 'intacctImportTitle',
                SAGE_INTACCT_SYNC_IMPORT_DATA: 'intacctImportData',
                SAGE_INTACCT_SYNC_IMPORT_EMPLOYEES: 'intacctImportEmployees',
                SAGE_INTACCT_SYNC_IMPORT_DIMENSIONS: 'intacctImportDimensions',
                SAGE_INTACCT_SYNC_IMPORT_SYNC_REIMBURSED_REPORTS: 'intacctImportSyncBillPayments',
            },
            SYNC_STAGE_TIMEOUT_MINUTES: 20,
        },
        ACCESS_VARIANTS: {
            PAID: 'paid',
            ADMIN: 'admin',
            CONTROL: 'control',
        },
        DEFAULT_MAX_EXPENSE_AGE: 90,
        DISABLED_MAX_EXPENSE_AGE: 10000000000,
        DEFAULT_MAX_EXPENSE_AMOUNT: 200000,
        DEFAULT_MAX_AMOUNT_NO_RECEIPT: 2500,
        DEFAULT_MAX_AMOUNT_NO_ITEMIZED_RECEIPT: 7500,
        DEFAULT_TAG_LIST: {
            Tag: {
                name: 'Tag',
                orderWeight: 0,
                required: false,
                tags: {},
            },
        } as PolicyTagLists,
        DEFAULT_TAG_NAME: 'Tag',
        REQUIRE_RECEIPTS_OVER_OPTIONS: {
            DEFAULT: 'default',
            NEVER: 'never',
            ALWAYS: 'always',
        },
        EXPENSE_LIMIT_TYPES: {
            EXPENSE: 'expense',
            DAILY: 'daily',
        },
    },

    HELP_DOC_LINKS: {
        'QuickBooks Online': 'https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Configure-Quickbooks-Online',
        'QuickBooks Desktop': '',
        quickbooks: 'https://help.expensify.com/articles/new-expensify/connections/quickbooks-online/Configure-Quickbooks-Online',
        NetSuite: 'https://help.expensify.com/articles/new-expensify/connections/netsuite/Configure-Netsuite',
        Xero: 'https://help.expensify.com/articles/new-expensify/connections/xero/Configure-Xero',
        Intacct: 'https://help.expensify.com/articles/new-expensify/connections/sage-intacct/Configure-Sage-Intacct',
        FinancialForce: 'https://help.expensify.com/articles/expensify-classic/connections/certinia/Connect-To-Certinia',
        'Sage Intacct': 'https://help.expensify.com/articles/new-expensify/connections/sage-intacct/Configure-Sage-Intacct',
        Certinia: 'https://help.expensify.com/articles/expensify-classic/connections/certinia/Connect-To-Certinia',
        MERGE_EXPENSES: 'https://help.expensify.com/articles/new-expensify/reports-and-expenses/Merging-expenses',
    },

    CUSTOM_UNITS: {
        NAME_DISTANCE: 'Distance',
        NAME_PER_DIEM_INTERNATIONAL: 'Per Diem International',
        DISTANCE_UNIT_MILES: 'mi',
        DISTANCE_UNIT_KILOMETERS: 'km',
        MILEAGE_IRS_RATE: 0.7,
        // The first created rate is called "Default rate", others are called "New Rate `i`"
        DEFAULT_RATE: 'Default Rate',
        NEW_RATE: 'New Rate',
        RATE_DECIMALS: 3,
        FAKE_P2P_ID: '_FAKE_P2P_ID_',
        MILES_TO_KILOMETERS: 1.609344,
        KILOMETERS_TO_MILES: 0.621371,
    },

    TERMS: {
        CFPB_PREPAID: 'cfpb.gov/prepaid',
        CFPB_COMPLAINT: 'cfpb.gov/complaint',
        FDIC_PREPAID: 'fdic.gov/deposit/deposits/prepaid.html',
    },

    LAYOUT_WIDTH: {
        WIDE: 'wide',
        NARROW: 'narrow',
        NONE: 'none',
    },

    ICON_TYPE_ICON: 'icon',
    ICON_TYPE_AVATAR: 'avatar',
    ICON_TYPE_WORKSPACE: 'workspace',
    ICON_TYPE_PLAID: 'plaid',

    ACTIVITY_INDICATOR_SIZE: {
        LARGE: 'large',
        SMALL: 'small',
    },

    QR_CODE_SIZE: {
        APP_DOWNLOAD_LINKS: 172,
    },

    AVATAR_SIZE: {
        X_LARGE: 'xlarge',
        LARGE: 'large',
        MEDIUM: 'medium',
        DEFAULT: 'default',
        SMALL: 'small',
        SMALLER: 'smaller',
        SUBSCRIPT: 'subscript',
        SMALL_SUBSCRIPT: 'small-subscript',
        MID_SUBSCRIPT: 'mid-subscript',
        LARGE_BORDERED: 'large-bordered',
        MEDIUM_LARGE: 'medium-large',
        HEADER: 'header',
        MENTION_ICON: 'mention-icon',
        SMALL_NORMAL: 'small-normal',
        LARGE_NORMAL: 'large-normal',
    },
    COMPANY_CARD: {
        FEED_BANK_NAME: {
            MASTER_CARD: 'cdf',
            VISA: 'vcf',
            AMEX: 'gl1025',
            AMEX_1205: 'gl1205',
            STRIPE: 'stripe',
            CITIBANK: 'oauth.citibank.com',
            CAPITAL_ONE: 'oauth.capitalone.com',
            BANK_OF_AMERICA: 'oauth.bankofamerica.com',
            CHASE: 'oauth.chase.com',
            BREX: 'oauth.brex.com',
            PEX: 'admin.pexcard.com',
            WELLS_FARGO: 'oauth.wellsfargo.com',
            AMEX_DIRECT: 'oauth.americanexpressfdx.com',
            AMEX_FILE_DOWNLOAD: 'americanexpressfd.us',
            CSV: 'ccupload',
        },
        FEED_KEY_SEPARATOR: '#',
        CARD_NUMBER_MASK_CHAR: 'X',
        STEP_NAMES: ['1', '2', '3', '4'],
        STEP: {
            BANK_CONNECTION: 'BankConnection',
            PLAID_CONNECTION: 'PlaidConnection',
            ASSIGNEE: 'Assignee',
            CARD: 'Card',
            CARD_NAME: 'CardName',
            TRANSACTION_START_DATE: 'TransactionStartDate',
            CONFIRMATION: 'Confirmation',
            INVITE_NEW_MEMBER: 'InviteNewMember',
        },
        TRANSACTION_START_DATE_OPTIONS: {
            FROM_BEGINNING: 'fromBeginning',
            CUSTOM: 'custom',
        },
    },
    EXPENSIFY_CARD: {
        NAME: 'expensifyCard',
        BANK: 'Expensify Card',
        ROUTE: 'expensify-card',
        FRAUD_TYPES: {
            DOMAIN: 'domain',
            INDIVIDUAL: 'individual',
            NONE: 'none',
        },
        VERIFICATION_STATE: {
            LOADING: 'loading',
            VERIFIED: 'verified',
            ON_WAITLIST: 'onWaitlist',
        },
        STATE: {
            STATE_NOT_ISSUED: 2,
            OPEN: 3,
            NOT_ACTIVATED: 4,
            STATE_DEACTIVATED: 5,
            CLOSED: 6,
            STATE_SUSPENDED: 7,
        },
        ACTIVE_STATES: cardActiveStates,
        HIDDEN_FROM_SEARCH_STATES: cardHiddenFromSearchStates,
        LIMIT_TYPES: {
            SMART: 'smart',
            MONTHLY: 'monthly',
            FIXED: 'fixed',
        },
        LIMIT_VALUE: 21474836,
        STEP_NAMES: ['1', '2', '3', '4', '5'],
        ASSIGNEE_EXCLUDED_STEP_NAMES: ['1', '2', '3', '4'],
        STEP: {
            ASSIGNEE: 'Assignee',
            CARD_TYPE: 'CardType',
            LIMIT_TYPE: 'LimitType',
            LIMIT: 'Limit',
            CARD_NAME: 'CardName',
            CONFIRMATION: 'Confirmation',
            INVITE_NEW_MEMBER: 'InviteNewMember',
        },
        CARD_TYPE: {
            PHYSICAL: 'physical',
            VIRTUAL: 'virtual',
        },
        FREQUENCY_SETTING: {
            DAILY: 'daily',
            MONTHLY: 'monthly',
        },
        TERMINATION_REASON: {
            LOST: 'lost',
            STOLEN: 'stolen',
            DAMAGED: 'damaged',
        },
        MANAGE_EXPENSIFY_CARDS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/expensify-card/Manage-Expensify-Cards',
    },
    COMPANY_CARDS: {
        BROKEN_CONNECTION_IGNORED_STATUSES: brokenConnectionScrapeStatuses,
        CONNECTION_ERROR: 'connectionError',
        STEP: {
            SELECT_BANK: 'SelectBank',
            SELECT_FEED_TYPE: 'SelectFeedType',
            CARD_TYPE: 'CardType',
            CARD_INSTRUCTIONS: 'CardInstructions',
            CARD_NAME: 'CardName',
            CARD_DETAILS: 'CardDetails',
            BANK_CONNECTION: 'BankConnection',
            AMEX_CUSTOM_FEED: 'AmexCustomFeed',
            SELECT_COUNTRY: 'SelectCountry',
            PLAID_CONNECTION: 'PlaidConnection',
            SELECT_STATEMENT_CLOSE_DATE: 'SelectStatementCloseDate',
            SELECT_DIRECT_STATEMENT_CLOSE_DATE: 'SelectDirectStatementCloseDate',
        },
        CARD_TYPE: {
            AMEX: 'amex',
            VISA: 'visa',
            MASTERCARD: 'mastercard',
            STRIPE: 'stripe',
            CSV: 'CSV',
        },
        FEED_TYPE: {
            CUSTOM: 'customFeed',
            DIRECT: 'directFeed',
        },
        BANKS: {
            AMEX: 'American Express',
            BANK_OF_AMERICA: 'Bank of America',
            BREX: 'Brex',
            CAPITAL_ONE: 'Capital One',
            CHASE: 'Chase',
            CITI_BANK: 'Citibank',
            STRIPE: 'Stripe',
            WELLS_FARGO: 'Wells Fargo',
            OTHER: 'Other',
        },
        BANK_CONNECTIONS: {
            WELLS_FARGO: 'wellsfargo',
            BANK_OF_AMERICA: 'bankofamerica',
            CHASE: 'chase',
            BREX: 'brex',
            CAPITAL_ONE: 'capitalone',
            CITI_BANK: 'citibank',
            AMEX: 'americanexpressfdx',
        },
        AMEX_CUSTOM_FEED: {
            CORPORATE: 'American Express Corporate Cards',
            BUSINESS: 'American Express Business Cards',
            PERSONAL: 'American Express Personal Cards',
        },
        DELETE_TRANSACTIONS: {
            RESTRICT: 'corporate',
            ALLOW: 'personal',
        },
        STATEMENT_CLOSE_DATE: {
            LAST_DAY_OF_MONTH: 'LAST_DAY_OF_MONTH',
            LAST_BUSINESS_DAY_OF_MONTH: 'LAST_BUSINESS_DAY_OF_MONTH',
            CUSTOM_DAY_OF_MONTH: 'CUSTOM_DAY_OF_MONTH',
        },
        CARD_NAME: {
            CASH: '__CASH__',
        },
        BANK_NAME: {
            UPLOAD: 'upload',
        },
        CARD_LIST_THRESHOLD: 8,
        DEFAULT_EXPORT_TYPE: 'default',
        EXPORT_CARD_TYPES: {
            /**
             * Name of Card NVP for QBO custom export accounts
             */
            NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT: 'quickbooks_online_export_account',
            NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT: 'quickbooks_online_export_account_debit',

            /**
             * Name of Card NVP for NetSuite custom export accounts
             */
            NVP_NETSUITE_EXPORT_ACCOUNT: 'netsuite_export_payable_account',

            /**
             * Name of Card NVP for NetSuite custom vendors
             */
            NVP_NETSUITE_EXPORT_VENDOR: 'netsuite_export_vendor',

            /**
             * Name of Card NVP for Xero custom export accounts
             */
            NVP_XERO_EXPORT_BANK_ACCOUNT: 'xero_export_bank_account',

            /**
             * Name of Card NVP for Intacct custom export accounts
             */
            NVP_INTACCT_EXPORT_CHARGE_CARD: 'intacct_export_charge_card',

            /**
             * Name of card NVP for Intacct custom vendors
             */
            NVP_INTACCT_EXPORT_VENDOR: 'intacct_export_vendor',

            /**
             * Name of Card NVP for QuickBooks Desktop custom export accounts
             */
            NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT: 'quickbooks_desktop_export_account_credit',

            /**
             * Name of Card NVP for QuickBooks Desktop custom export accounts
             */
            NVP_FINANCIALFORCE_EXPORT_VENDOR: 'financialforce_export_vendor',
        },
        EXPORT_CARD_POLICY_TYPES: {
            /**
             * Name of Card NVP for QBO custom export accounts
             */
            NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_POLICY_ID: 'quickbooks_online_export_account_policy_id',
            NVP_QUICKBOOKS_ONLINE_EXPORT_ACCOUNT_DEBIT_POLICY_ID: 'quickbooks_online_export_account_debit_policy_id',

            /**
             * Name of Card NVP for NetSuite custom export accounts
             */
            NVP_NETSUITE_EXPORT_ACCOUNT_POLICY_ID: 'netsuite_export_payable_account_policy_id',

            /**
             * Name of Card NVP for NetSuite custom vendors
             */
            NVP_NETSUITE_EXPORT_VENDOR_POLICY_ID: 'netsuite_export_vendor_policy_id',

            /**
             * Name of Card NVP for Xero custom export accounts
             */
            NVP_XERO_EXPORT_BANK_ACCOUNT_POLICY_ID: 'xero_export_bank_account_policy_id',

            /**
             * Name of Card NVP for Intacct custom export accounts
             */
            NVP_INTACCT_EXPORT_CHARGE_CARD_POLICY_ID: 'intacct_export_charge_card_policy_id',

            /**
             * Name of card NVP for Intacct custom vendors
             */
            NVP_INTACCT_EXPORT_VENDOR_POLICY_ID: 'intacct_export_vendor_policy_id',

            /**
             * Name of Card NVP for QuickBooks Desktop custom export accounts
             */
            NVP_QUICKBOOKS_DESKTOP_EXPORT_ACCOUNT_CREDIT_POLICY_ID: 'quickbooks_desktop_export_account_credit_policy_id',

            /**
             * Name of Card NVP for QuickBooks Desktop custom export accounts
             */
            NVP_FINANCIALFORCE_EXPORT_VENDOR_POLICY_ID: 'financialforce_export_vendor_policy_id',
        },
    },
    AVATAR_ROW_SIZE: {
        DEFAULT: 4,
        LARGE_SCREEN: 8,
    },
    OPTION_MODE: {
        COMPACT: 'compact',
        DEFAULT: 'default',
    },
    SUBSCRIPTION: {
        TEAM_2025_PRICING_START_DATE: new Date(2025, 3, 1),
        PRICING_TYPE_2025: 'team2025Pricing',
        TYPE: {
            ANNUAL: 'yearly2018',
            PAY_PER_USE: 'monthly2018',
            INVOICING: 'invoicing2018',
        },
    },
    EXPENSE_RULES: {
        FIELDS: {
            BILLABLE: 'billable',
            CATEGORY: 'category',
            DESCRIPTION: 'comment',
            CREATE_REPORT: 'createReport',
            MERCHANT: 'merchantToMatch',
            RENAME_MERCHANT: 'merchant',
            REIMBURSABLE: 'reimbursable',
            REPORT: 'report',
            TAG: 'tag',
            TAX: 'tax',
        },
        BULK_ACTION_TYPES: {
            EDIT: 'edit',
            DELETE: 'delete',
        },
    },

    get SUBSCRIPTION_PRICES() {
        return {
            [this.PAYMENT_CARD_CURRENCY.USD]: {
                [this.POLICY.TYPE.CORPORATE]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 900,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 1800,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
                [this.POLICY.TYPE.TEAM]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 500,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 1000,
                    [this.SUBSCRIPTION.PRICING_TYPE_2025]: 500,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
            },
            [this.PAYMENT_CARD_CURRENCY.AUD]: {
                [this.POLICY.TYPE.CORPORATE]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 1500,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 3000,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
                [this.POLICY.TYPE.TEAM]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 700,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 1400,
                    [this.SUBSCRIPTION.PRICING_TYPE_2025]: 800,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
            },
            [this.PAYMENT_CARD_CURRENCY.GBP]: {
                [this.POLICY.TYPE.CORPORATE]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 700,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 1400,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
                [this.POLICY.TYPE.TEAM]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 400,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 800,
                    [this.SUBSCRIPTION.PRICING_TYPE_2025]: 500,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
            },
            [this.PAYMENT_CARD_CURRENCY.NZD]: {
                [this.POLICY.TYPE.CORPORATE]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 1600,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 3200,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
                [this.POLICY.TYPE.TEAM]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 800,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 1600,
                    [this.SUBSCRIPTION.PRICING_TYPE_2025]: 900,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
            },
            [this.PAYMENT_CARD_CURRENCY.EUR]: {
                [this.POLICY.TYPE.CORPORATE]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 800,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 1600,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
                [this.POLICY.TYPE.TEAM]: {
                    [this.SUBSCRIPTION.TYPE.ANNUAL]: 500,
                    [this.SUBSCRIPTION.TYPE.PAY_PER_USE]: 1000,
                    [this.SUBSCRIPTION.PRICING_TYPE_2025]: 500,
                    [this.SUBSCRIPTION.TYPE.INVOICING]: 0,
                },
            },
        };
    },
    REGEX: {
        SPECIAL_CHARS_WITHOUT_NEWLINE: /((?!\n)[()-\s\t])/g,
        DIGITS_AND_PLUS: /^\+?[0-9]*$/,
        ALPHABETIC_AND_LATIN_CHARS: /^[\p{Script=Latin} ]*$/u,
        NON_ALPHABETIC_AND_NON_LATIN_CHARS: /[^\p{Script=Latin}]/gu,
        POSITIVE_INTEGER: /^\d+$/,
        PO_BOX: /\b[P|p]?(OST|ost)?\.?\s*[O|o|0]?(ffice|FFICE)?\.?\s*[B|b][O|o|0]?[X|x]?\.?\s+[#]?(\d+)\b/,
        ANY_VALUE: /^.+$/,
        ZIP_CODE: /^[0-9]{5}(?:[- ][0-9]{4})?$/,
        INDUSTRY_CODE: /^[0-9]{6}$/,
        SSN_LAST_FOUR: /^(?!0000)[0-9]{4}$/,
        SSN_FULL_NINE: /^(?!0000)[0-9]{9}$/,
        NUMBER: /^[0-9]+$/,
        PHONE_NUMBER: /^\+?[0-9]{4,17}$/,
        CARD_NUMBER: /^[0-9]{15,16}$/,
        CARD_SECURITY_CODE: /^[0-9]{3,4}$/,
        CARD_EXPIRATION_DATE: /^(0[1-9]|1[0-2])([^0-9])?([0-9]{4}|([0-9]{2}))$/,
        ROOM_NAME: /^#[\p{Ll}0-9-]{1,100}$/u,
        ROOM_NAME_WITHOUT_LIMIT: /^#[\p{Ll}0-9-]+$/u,
        DOMAIN_BASE: '^(?:https?:\\/\\/)?(?:www\\.)?([^\\/]+)',
        ALPHANUMERIC_WITH_SPACE_AND_HYPHEN: /^[A-Za-z0-9 -]+$/,

        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJI: /[\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3/gu,
        // eslint-disable-next-line max-len, no-misleading-character-class, no-empty-character-class
        EMOJIS: /[\p{Extended_Pictographic}\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}](\u200D[\p{Extended_Pictographic}\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|[\u{1F3FB}-\u{1F3FF}]|[\u{E0020}-\u{E007F}]|\uFE0F|\u20E3)*|[\u{1F1E6}-\u{1F1FF}]{2}|[#*0-9]\uFE0F?\u20E3/du,
        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJI_SKIN_TONES: /[\u{1f3fb}-\u{1f3ff}]/gu,

        PRIVATE_USER_AREA: /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/u,

        ONLY_PRIVATE_USER_AREA: /^[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]+$/u,

        // Regex pattern to match a digit followed by an emoji (used for Safari ZWNJ insertion)
        DIGIT_FOLLOWED_BY_EMOJI: /(\d)([\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F9FF}\u2600-\u27BF])/gu,

        TAX_ID: /^\d{9}$/,
        NON_NUMERIC: /\D/g,
        ANY_SPACE: /\s/g,

        // Extract attachment's source from the data's html string
        ATTACHMENT_DATA: /(data-expensify-source|data-name)="([^"]+)"/g,

        EMOJI_NAME: /(?<=^|[\s\S]):[\p{L}0-9_+-]+:/gu,
        EMOJI_SUGGESTIONS: /(?<=^|[\s\S]):[\p{L}0-9_+-]{1,40}$/u,
        AFTER_FIRST_LINE_BREAK: /\n.*/g,
        LINE_BREAK: /\r\n|\r|\n|\u2028/g,
        CODE_2FA: /^\d{6}$/,
        ATTACHMENT_ID: /chat-attachments\/(\d+)/,
        HAS_COLON_ONLY_AT_THE_BEGINNING: /^:[^:]+$/,
        HAS_AT_MOST_TWO_AT_SIGNS: /^@[^@]*@?[^@]*$/,
        EMPTY_COMMENT: /^(\s)*$/,
        SPECIAL_CHAR_MENTION_BREAKER: /[,/?"{}[\]()&^%;`$=<>!*]/g,
        SPECIAL_CHAR: /[,/?"{}[\]()&^%;`$=#<>!*]/g,
        FIRST_SPACE: /.+?(?=\s)/,

        get SPECIAL_CHAR_OR_EMOJI() {
            return new RegExp(`[~\\n\\s]|(_\\b(?!$))|${this.SPECIAL_CHAR.source}|${this.EMOJI.source}`, 'gu');
        },

        get SPACE_OR_EMOJI() {
            return new RegExp(`(\\s+|(?:${this.EMOJI.source})+)`, 'gu');
        },

        // Define the regular expression pattern to find a potential end of a mention suggestion:
        // It might be a space, a newline character, an emoji, or a special character (excluding underscores & tildes, which might be used in usernames)
        get MENTION_BREAKER() {
            // currently breaks on newline **or** whitespace **or** punctuation/emojis
            return new RegExp(`[\\n\\s]|${this.SPECIAL_CHAR_MENTION_BREAKER.source}|${this.EMOJI.source}`, 'gu');
        },

        get ALL_EMOJIS() {
            return new RegExp(this.EMOJIS, this.EMOJIS.flags.concat('g'));
        },

        MERGED_ACCOUNT_PREFIX: /^(MERGED_\d+@)/g,
        ROUTES: {
            VALIDATE_LOGIN: /\/v($|(\/\/*))/,
            UNLINK_LOGIN: /\/u($|(\/\/*))/,
            REDUNDANT_SLASHES: /(\/{2,})|(\/$)/g,
        },
        TIME_STARTS_01: /^01:\d{2} [AP]M$/,
        TIME_FORMAT: /^\d{2}:\d{2} [AP]M$/,
        DATE_TIME_FORMAT: /^\d{2}-\d{2} \d{2}:\d{2} [AP]M$/,
        ILLEGAL_FILENAME_CHARACTERS: /\/|<|>|\*|"|:|#|\?|\\|\|/g,
        ENCODE_PERCENT_CHARACTER: /%(25)+/g,
        INVISIBLE_CHARACTERS_GROUPS: /[\p{C}\p{Z}]/gu,
        OTHER_INVISIBLE_CHARACTERS: /[\u3164]/g,
        REPORT_FIELD_TITLE: /{report:([a-zA-Z]+)}/g,
        SHORT_MENTION_HTML: /<mention-short>(.*?)<\/mention-short>/g,
        REPORT_ID_FROM_PATH: /(?<!\/search)\/r\/(\d+)/,
        DISTANCE_MERCHANT: /^[0-9.]+ \w+ @ (-|-\()?[^0-9.\s]{1,3} ?[0-9.]+\)? \/ \w+$/,
        WHITESPACE: /\s+/g,

        get EXPENSIFY_POLICY_DOMAIN_NAME() {
            return new RegExp(`${EXPENSIFY_POLICY_DOMAIN}([a-zA-Z0-9]+)\\${EXPENSIFY_POLICY_DOMAIN_EXTENSION}`);
        },

        /**
         * Matching task rule by group
         * Group 1: Start task rule with []
         * Group 2: Optional email group between \s+....\s* start rule with @+valid email or short mention
         * Group 3: Title is remaining characters
         */
        TASK_TITLE_WITH_OPTIONAL_SHORT_MENTION: `^\\[\\]\\s+(?:@(?:${EMAIL_WITH_OPTIONAL_DOMAIN.source}))?\\s*([\\s\\S]*)`,
    },

    PRONOUNS: {
        PREFIX: '__predefined_',
        SELF_SELECT: '__predefined_selfSelect',
    },

    EXPENSIFY_EMAILS_OBJECT: Object.entries(EMAIL).reduce(
        (prev, [, email]) => {
            // eslint-disable-next-line no-param-reassign
            prev[email] = true;
            return prev;
        },
        {} as Record<string, boolean>,
    ),
    EXPENSIFY_EMAILS: [
        EMAIL.ACCOUNTING,
        EMAIL.ACCOUNTS_PAYABLE,
        EMAIL.ADMIN,
        EMAIL.BILLS,
        EMAIL.CHRONOS,
        EMAIL.CONCIERGE,
        EMAIL.CONTRIBUTORS,
        EMAIL.FIRST_RESPONDER,
        EMAIL.HELP,
        EMAIL.INTEGRATION_TESTING_CREDS,
        EMAIL.NOTIFICATIONS,
        EMAIL.PAYROLL,
        EMAIL.QA,
        EMAIL.QA_TRAVIS,
        EMAIL.RECEIPTS,
        EMAIL.STUDENT_AMBASSADOR,
        EMAIL.SVFG,
        EMAIL.TEAM,
        EMAIL.MANAGER_MCTEST,
        EMAIL.QA_GUIDE,
    ] as string[],
    get EXPENSIFY_ACCOUNT_IDS() {
        return [
            this.ACCOUNT_ID.ACCOUNTING,
            this.ACCOUNT_ID.ACCOUNTS_PAYABLE,
            this.ACCOUNT_ID.ADMIN,
            this.ACCOUNT_ID.BILLS,
            this.ACCOUNT_ID.CHRONOS,
            this.ACCOUNT_ID.CONCIERGE,
            this.ACCOUNT_ID.CONTRIBUTORS,
            this.ACCOUNT_ID.FIRST_RESPONDER,
            this.ACCOUNT_ID.HELP,
            this.ACCOUNT_ID.INTEGRATION_TESTING_CREDS,
            this.ACCOUNT_ID.PAYROLL,
            this.ACCOUNT_ID.QA,
            this.ACCOUNT_ID.QA_TRAVIS,
            this.ACCOUNT_ID.RECEIPTS,
            this.ACCOUNT_ID.REWARDS,
            this.ACCOUNT_ID.STUDENT_AMBASSADOR,
            this.ACCOUNT_ID.SVFG,
            this.ACCOUNT_ID.MANAGER_MCTEST,
        ].filter((id) => id !== -1);
    },

    // Emails that profile view is prohibited
    get RESTRICTED_EMAILS(): readonly string[] {
        return [this.EMAIL.NOTIFICATIONS];
    },
    // Account IDs that profile view is prohibited
    get RESTRICTED_ACCOUNT_IDS() {
        return [this.ACCOUNT_ID.NOTIFICATIONS];
    },

    // Auth limit is 60k for the column but we store edits and other metadata along the html so let's use a lower limit to accommodate for it.
    MAX_COMMENT_LENGTH: 15000,

    // Use the same value as MAX_COMMENT_LENGTH to ensure the entire comment is parsed. Note that applying markup is very resource-consuming.
    MAX_MARKUP_LENGTH: 10000,

    MAX_THREAD_REPLIES_PREVIEW: 99,

    // Character Limits
    FORM_CHARACTER_LIMIT: 50,
    STANDARD_LENGTH_LIMIT: 100,
    STANDARD_LIST_ITEM_LIMIT: 12,
    LEGAL_NAMES_CHARACTER_LIMIT: 150,
    LOGIN_CHARACTER_LIMIT: 254,
    CATEGORY_NAME_LIMIT: 256,
    WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH: 256,
    REPORT_NAME_LIMIT: 100,
    TITLE_CHARACTER_LIMIT: 100,
    TASK_TITLE_CHARACTER_LIMIT: 10000,
    DESCRIPTION_LIMIT: 1000,
    SEARCH_QUERY_LIMIT: 1000,
    WORKSPACE_NAME_CHARACTER_LIMIT: 80,
    STATE_CHARACTER_LIMIT: 32,
    REPORT_TITLE_FORMULA_LIMIT: 500,

    // Test receipt data
    TEST_RECEIPT: {
        AMOUNT: 1800,
        CURRENCY: 'USD',
        MERCHANT: "Taco Todd's",
        FILENAME: 'test_receipt',
        FILE_TYPE: 'image/png',
    },

    AVATAR_CROP_MODAL: {
        // The next two constants control what is min and max value of the image crop scale.
        // Values define in how many times the image can be bigger than its container.
        // Notice: that values less than 1 mean that the image won't cover the container fully.
        MAX_SCALE: 3, // 3x scale is used commonly in different apps.
        MIN_SCALE: 1, // 1x min scale means that the image covers the container completely

        // This const defines the initial container size, before layout measurement.
        // Since size cant be null, we have to define some initial value.
        INITIAL_SIZE: 1, // 1 was chosen because there is a very low probability that initialized component will have such size.

        // This constant sets a margin equal to the rotate button's height (medium-sized Button (40px)), which is the tallest element in the controls row.
        // It ensures the controls row isn't cropped if the browser height is reduced too much.
        CONTAINER_VERTICAL_MARGIN: variables.componentSizeNormal,
    },
    MICROSECONDS_PER_MS: 1000,
    RED_BRICK_ROAD_PENDING_ACTION: {
        ADD: 'add',
        DELETE: 'delete',
        UPDATE: 'update',
    },
    EXPENSE_PENDING_ACTION: {
        SUBMIT: 'SUBMIT',
        APPROVE: 'APPROVE',
    },
    BRICK_ROAD_INDICATOR_STATUS: {
        ERROR: 'error',
        INFO: 'info',
    },
    REPORT_DETAILS_MENU_ITEM: {
        MEMBERS: 'member',
        INVITE: 'invite',
        SETTINGS: 'settings',
        LEAVE_ROOM: 'leaveRoom',
        PRIVATE_NOTES: 'privateNotes',
        DOWNLOAD_CSV: 'downloadCSV',
        DOWNLOAD_PDF: 'downloadPDF',
        EXPORT: 'export',
        DELETE: 'delete',
        MARK_AS_INCOMPLETE: 'markAsIncomplete',
        CANCEL_PAYMENT: 'cancelPayment',
        UNAPPROVE: 'unapprove',
        DEBUG: 'debug',
        GO_TO_WORKSPACE: 'goToWorkspace',
        ERROR: 'error',
        TRACK: {
            SUBMIT: 'submit',
            CATEGORIZE: 'categorize',
            SHARE: 'share',
        },
    },
    EDIT_REQUEST_FIELD: {
        AMOUNT: 'amount',
        CURRENCY: 'currency',
        DATE: 'date',
        DESCRIPTION: 'description',
        MERCHANT: 'merchant',
        CATEGORY: 'category',
        RECEIPT: 'receipt',
        DISTANCE: 'distance',
        DISTANCE_RATE: 'distanceRate',
        TAG: 'tag',
        TAX_RATE: 'taxRate',
        TAX_AMOUNT: 'taxAmount',
        REIMBURSABLE: 'reimbursable',
        REPORT: 'report',
    },
    FOOTER: {
        EXPENSE_MANAGEMENT_URL: `${USE_EXPENSIFY_URL}/expense-management`,
        SPEND_MANAGEMENT_URL: `${USE_EXPENSIFY_URL}/spend-management`,
        EXPENSE_REPORTS_URL: `${USE_EXPENSIFY_URL}/expense-reports`,
        COMPANY_CARD_URL: `${USE_EXPENSIFY_URL}/company-credit-card`,
        RECEIPT_SCANNING_URL: `${USE_EXPENSIFY_URL}/receipt-scanning-app`,
        BILL_PAY_URL: `${USE_EXPENSIFY_URL}/bills`,
        INVOICES_URL: `${USE_EXPENSIFY_URL}/invoices`,
        PAYROLL_URL: `${USE_EXPENSIFY_URL}/payroll`,
        TRAVEL_URL: `${USE_EXPENSIFY_URL}/travel`,
        EXPENSIFY_APPROVED_URL: `${USE_EXPENSIFY_URL}/accountants`,
        PRESS_KIT_URL: 'https://we.are.expensify.com/press-kit',
        SUPPORT_URL: `${USE_EXPENSIFY_URL}/support`,
        TERMS_URL: `${EXPENSIFY_URL}/terms`,
        PRIVACY_URL: `${EXPENSIFY_URL}/privacy`,
        ABOUT_URL: 'https://we.are.expensify.com/how-we-got-here',
        BLOG_URL: 'https://blog.expensify.com/',
        JOBS_URL: 'https://we.are.expensify.com/apply',
        ORG_URL: 'https://expensify.org/',
        INVESTOR_RELATIONS_URL: 'https://ir.expensify.com/',
    },

    SOCIALS: {
        PODCAST: 'https://we.are.expensify.com/podcast',
        TWITTER: 'https://www.twitter.com/expensify',
        INSTAGRAM: 'https://www.instagram.com/expensify',
        FACEBOOK: 'https://www.facebook.com/expensify',
        LINKEDIN: 'https://www.linkedin.com/company/expensify',
    },

    // These split the maximum decimal value of a signed 64-bit number (9,223,372,036,854,775,807) into parts where none of them are too big to fit into a 32-bit number, so that we can
    // generate them each with a random number generator with only 32-bits of precision.
    MAX_64BIT_LEFT_PART: 92233,
    MAX_64BIT_MIDDLE_PART: 7203685,
    MAX_64BIT_RIGHT_PART: 4775807,
    INVALID_CATEGORY_NAME: '###',

    // When generating a random value to fit in 7 digits (for the `middle` or `right` parts above), this is the maximum value to multiply by Math.random().
    MAX_INT_FOR_RANDOM_7_DIGIT_VALUE: 10000000,
    IOS_KEYBOARD_SPACE_OFFSET: -30,

    API_REQUEST_TYPE: {
        READ: 'read',
        WRITE: 'write',
        MAKE_REQUEST_WITH_SIDE_EFFECTS: 'makeRequestWithSideEffects',
    },

    ERECEIPT_COLORS: {
        YELLOW: 'Yellow',
        ICE: 'Ice',
        BLUE: 'Blue',
        GREEN: 'Green',
        TANGERINE: 'Tangerine',
        PINK: 'Pink',
    },

    MAP_MARKER_SIZE: 20,

    QUICK_REACTIONS: [
        {
            name: '+1',
            code: '👍',
            types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
        },
        {
            name: 'heart',
            code: '❤️',
        },
        {
            name: 'joy',
            code: '😂',
        },
        {
            name: 'fire',
            code: '🔥',
        },
    ],

    TFA_CODE_LENGTH: 6,
    CHAT_ATTACHMENT_TOKEN_KEY: 'X-Chat-Attachment-Token',

    SPACE_LENGTH: 1,

    ALL_COUNTRIES: {
        AF: 'Afghanistan',
        AX: 'Åland Islands',
        AL: 'Albania',
        DZ: 'Algeria',
        AS: 'American Samoa',
        AD: 'Andorra',
        AO: 'Angola',
        AI: 'Anguilla',
        AQ: 'Antarctica',
        AG: 'Antigua & Barbuda',
        AR: 'Argentina',
        AM: 'Armenia',
        AW: 'Aruba',
        AC: 'Ascension Island',
        AU: 'Australia',
        AT: 'Austria',
        AZ: 'Azerbaijan',
        BS: 'Bahamas',
        BH: 'Bahrain',
        BD: 'Bangladesh',
        BB: 'Barbados',
        BY: 'Belarus',
        BE: 'Belgium',
        BZ: 'Belize',
        BJ: 'Benin',
        BM: 'Bermuda',
        BT: 'Bhutan',
        BO: 'Bolivia',
        BA: 'Bosnia & Herzegovina',
        BW: 'Botswana',
        BR: 'Brazil',
        IO: 'British Indian Ocean Territory',
        VG: 'British Virgin Islands',
        BN: 'Brunei',
        BG: 'Bulgaria',
        BF: 'Burkina Faso',
        BI: 'Burundi',
        KH: 'Cambodia',
        CM: 'Cameroon',
        CA: 'Canada',
        CV: 'Cape Verde',
        BQ: 'Caribbean Netherlands',
        KY: 'Cayman Islands',
        CF: 'Central African Republic',
        TD: 'Chad',
        CL: 'Chile',
        CN: 'China',
        CX: 'Christmas Island',
        CC: 'Cocos (Keeling) Islands',
        CO: 'Colombia',
        KM: 'Comoros',
        CG: 'Congo - Brazzaville',
        CD: 'Congo - Kinshasa',
        CK: 'Cook Islands',
        CR: 'Costa Rica',
        CI: "Côte d'Ivoire",
        HR: 'Croatia',
        CU: 'Cuba',
        CW: 'Curaçao',
        CY: 'Cyprus',
        CZ: 'Czech Republic',
        DK: 'Denmark',
        DJ: 'Djibouti',
        DM: 'Dominica',
        DO: 'Dominican Republic',
        EC: 'Ecuador',
        EG: 'Egypt',
        SV: 'El Salvador',
        GQ: 'Equatorial Guinea',
        ER: 'Eritrea',
        EE: 'Estonia',
        ET: 'Ethiopia',
        FK: 'Falkland Islands',
        FO: 'Faroe Islands',
        FJ: 'Fiji',
        FI: 'Finland',
        FR: 'France',
        GF: 'French Guiana',
        PF: 'French Polynesia',
        TF: 'French Southern Territories',
        GA: 'Gabon',
        GM: 'Gambia',
        GE: 'Georgia',
        DE: 'Germany',
        GH: 'Ghana',
        GI: 'Gibraltar',
        GR: 'Greece',
        GL: 'Greenland',
        GD: 'Grenada',
        GP: 'Guadeloupe',
        GU: 'Guam',
        GT: 'Guatemala',
        GG: 'Guernsey',
        GN: 'Guinea',
        GW: 'Guinea-Bissau',
        GY: 'Guyana',
        HT: 'Haiti',
        HN: 'Honduras',
        HK: 'Hong Kong',
        HU: 'Hungary',
        IS: 'Iceland',
        IN: 'India',
        ID: 'Indonesia',
        IR: 'Iran',
        IQ: 'Iraq',
        IE: 'Ireland',
        IM: 'Isle of Man',
        IL: 'Israel',
        IT: 'Italy',
        JM: 'Jamaica',
        JP: 'Japan',
        JE: 'Jersey',
        JO: 'Jordan',
        KZ: 'Kazakhstan',
        KE: 'Kenya',
        KI: 'Kiribati',
        XK: 'Kosovo',
        KW: 'Kuwait',
        KG: 'Kyrgyzstan',
        LA: 'Laos',
        LV: 'Latvia',
        LB: 'Lebanon',
        LS: 'Lesotho',
        LR: 'Liberia',
        LY: 'Libya',
        LI: 'Liechtenstein',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        MO: 'Macau',
        MK: 'Macedonia',
        MG: 'Madagascar',
        MW: 'Malawi',
        MY: 'Malaysia',
        MV: 'Maldives',
        ML: 'Mali',
        MT: 'Malta',
        MH: 'Marshall Islands',
        MQ: 'Martinique',
        MR: 'Mauritania',
        MU: 'Mauritius',
        YT: 'Mayotte',
        MX: 'Mexico',
        FM: 'Micronesia',
        MD: 'Moldova',
        MC: 'Monaco',
        MN: 'Mongolia',
        ME: 'Montenegro',
        MS: 'Montserrat',
        MA: 'Morocco',
        MZ: 'Mozambique',
        MM: 'Myanmar (Burma)',
        NA: 'Namibia',
        NR: 'Nauru',
        NP: 'Nepal',
        NL: 'Netherlands',
        NC: 'New Caledonia',
        NZ: 'New Zealand',
        NI: 'Nicaragua',
        NE: 'Niger',
        NG: 'Nigeria',
        NU: 'Niue',
        NF: 'Norfolk Island',
        KP: 'North Korea',
        MP: 'Northern Mariana Islands',
        NO: 'Norway',
        OM: 'Oman',
        PK: 'Pakistan',
        PW: 'Palau',
        PS: 'Palestinian Territories',
        PA: 'Panama',
        PG: 'Papua New Guinea',
        PY: 'Paraguay',
        PE: 'Peru',
        PH: 'Philippines',
        PN: 'Pitcairn Islands',
        PL: 'Poland',
        PT: 'Portugal',
        PR: 'Puerto Rico',
        QA: 'Qatar',
        RE: 'Réunion',
        RO: 'Romania',
        RU: 'Russia',
        RW: 'Rwanda',
        BL: 'Saint Barthélemy',
        WS: 'Samoa',
        SM: 'San Marino',
        ST: 'São Tomé & Príncipe',
        SA: 'Saudi Arabia',
        SN: 'Senegal',
        RS: 'Serbia',
        SC: 'Seychelles',
        SL: 'Sierra Leone',
        SG: 'Singapore',
        SX: 'Sint Maarten',
        SK: 'Slovakia',
        SI: 'Slovenia',
        SB: 'Solomon Islands',
        SO: 'Somalia',
        ZA: 'South Africa',
        GS: 'South Georgia & South Sandwich Islands',
        KR: 'South Korea',
        SS: 'South Sudan',
        ES: 'Spain',
        LK: 'Sri Lanka',
        SH: 'St. Helena',
        KN: 'St. Kitts & Nevis',
        LC: 'St. Lucia',
        MF: 'St. Martin',
        PM: 'St. Pierre & Miquelon',
        VC: 'St. Vincent & Grenadines',
        SD: 'Sudan',
        SR: 'Suriname',
        SJ: 'Svalbard & Jan Mayen',
        SZ: 'Swaziland',
        SE: 'Sweden',
        CH: 'Switzerland',
        SY: 'Syria',
        TW: 'Taiwan',
        TJ: 'Tajikistan',
        TZ: 'Tanzania',
        TH: 'Thailand',
        TL: 'Timor-Leste',
        TG: 'Togo',
        TK: 'Tokelau',
        TO: 'Tonga',
        TT: 'Trinidad & Tobago',
        TA: 'Tristan da Cunha',
        TN: 'Tunisia',
        TR: 'Turkey',
        TM: 'Turkmenistan',
        TC: 'Turks & Caicos Islands',
        TV: 'Tuvalu',
        UM: 'U.S. Outlying Islands',
        VI: 'U.S. Virgin Islands',
        UG: 'Uganda',
        UA: 'Ukraine',
        AE: 'United Arab Emirates',
        GB: 'United Kingdom',
        US: 'United States',
        UY: 'Uruguay',
        UZ: 'Uzbekistan',
        VU: 'Vanuatu',
        VA: 'Vatican City',
        VE: 'Venezuela',
        VN: 'Vietnam',
        WF: 'Wallis & Futuna',
        EH: 'Western Sahara',
        YE: 'Yemen',
        ZM: 'Zambia',
        ZW: 'Zimbabwe',
    },

    ALL_EUROPEAN_UNION_COUNTRIES: {
        AT: 'Austria',
        BE: 'Belgium',
        BG: 'Bulgaria',
        HR: 'Croatia',
        CY: 'Cyprus',
        CZ: 'Czech Republic',
        DK: 'Denmark',
        EE: 'Estonia',
        FI: 'Finland',
        FR: 'France',
        DE: 'Germany',
        GR: 'Greece',
        HU: 'Hungary',
        IE: 'Ireland',
        IT: 'Italy',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        LV: 'Latvia',
        MT: 'Malta',
        NL: 'Netherlands',
        PL: 'Poland',
        PT: 'Portugal',
        RO: 'Romania',
        SK: 'Slovakia',
        SI: 'Slovenia',
        ES: 'Spain',
        SE: 'Sweden',
    },
    EUROPEAN_UNION_COUNTRIES_WITH_GB: {
        AT: 'Austria',
        BE: 'Belgium',
        BG: 'Bulgaria',
        HR: 'Croatia',
        CY: 'Cyprus',
        CZ: 'Czech Republic',
        DK: 'Denmark',
        EE: 'Estonia',
        FI: 'Finland',
        FR: 'France',
        DE: 'Germany',
        GB: 'United Kingdom',
        GI: 'Gibraltar',
        GR: 'Greece',
        HU: 'Hungary',
        IE: 'Ireland',
        IT: 'Italy',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        LV: 'Latvia',
        MT: 'Malta',
        NL: 'Netherlands',
        PL: 'Poland',
        PT: 'Portugal',
        RO: 'Romania',
        SK: 'Slovakia',
        SI: 'Slovenia',
        ES: 'Spain',
        SE: 'Sweden',
    },

    EXPENSIFY_UK_EU_SUPPORTED_COUNTRIES: ['BE', 'CY', 'EE', 'FI', 'DE', 'GR', 'IE', 'LV', 'LT', 'LU', 'MT', 'NL', 'PT', 'SK', 'SI', 'ES', 'GB', 'GI'],

    EU_REGISTRATION_NUMBER_REGEX: {
        AT: /^FN\d{6}[a-z]?$/i,
        BE: /^0\d{3}\.\d{3}\.\d{3}$/,
        BG: /^\d{9}|\d{13}$/,
        HR: /^\d{11}$/,
        CY: /^HE\d{1,6}$/,
        CZ: /^\d{8}$/,
        DK: /^\d{8}$/,
        EE: /^\d{7,8}$/,
        FI: /^\d{7}-\d$/,
        FR: /^(\d{9}|\d{14})$/,
        DE: /^(HRB|HRA)\s?\d+$/,
        GR: /^\d{12}$/,
        HU: /^\d{2}-\d{6,7}$/,
        IE: /^([A-Z]?\d{1,6})$/,
        IT: /^(MI-\d+|R\d+|\d{11})$/,
        LV: /^\d{11}$/,
        LT: /^\d{7}|\d{9}$/,
        LU: /^B\d{1,6}$/,
        MT: /^C\d+$/,
        NL: /^\d{8}$/,
        PL: /^\d{10}$/,
        PT: /^\d{9}$/,
        RO: /^J\d{2}\/\d{4}\/\d+$/,
        SK: /^\d{8}$/,
        SI: /^\d{8}$/,
        ES: /^[A-Z]\d{8}$/,
        SE: /^\d{10}$/,
    },

    PLAID_EXCLUDED_COUNTRIES: ['IR', 'CU', 'SY', 'UA', 'KP'] as string[],
    PLAID_SUPPORT_COUNTRIES: ['US', 'CA', 'GB', 'AT', 'BE', 'DK', 'EE', 'FI', 'FR', 'DE', 'IE', 'IT', 'LV', 'LT', 'NL', 'NO', 'PL', 'PT', 'ES', 'SE'] as string[],

    // Sources: https://github.com/Expensify/App/issues/14958#issuecomment-1442138427
    // https://github.com/Expensify/App/issues/14958#issuecomment-1456026810
    COUNTRY_ZIP_REGEX_DATA: {
        AC: {
            regex: /^ASCN 1ZZ$/,
            samples: 'ASCN 1ZZ',
        },
        AD: {
            regex: /^AD[1-7]0\d$/,
            samples: 'AD206, AD403, AD106, AD406',
        },

        // We have kept the empty object for the countries which do not have any zip code validation
        // to ensure consistency so that the amount of countries displayed and in this object are same
        AE: {},
        AF: {
            regex: /^\d{4}$/,
            samples: '9536, 1476, 3842, 7975',
        },
        AG: {},
        AI: {
            regex: /^AI-2640$/,
            samples: 'AI-2640',
        },
        AL: {
            regex: /^\d{4}$/,
            samples: '1631, 9721, 2360, 5574',
        },
        AM: {
            regex: /^\d{4}$/,
            samples: '5581, 7585, 8434, 2492',
        },
        AO: {},
        AQ: {},
        AR: {
            regex: /^((?:[A-HJ-NP-Z])?\d{4})([A-Z]{3})?$/,
            samples: 'Q7040GFQ, K2178ZHR, P6240EJG, J6070IAE',
        },
        AS: {
            regex: /^96799$/,
            samples: '96799',
        },
        AT: {
            regex: /^\d{4}$/,
            samples: '4223, 2052, 3544, 5488',
        },
        AU: {
            regex: /^\d{4}$/,
            samples: '7181, 7735, 9169, 8780',
        },
        AW: {},
        AX: {
            regex: /^22\d{3}$/,
            samples: '22270, 22889, 22906, 22284',
        },
        AZ: {
            regex: /^(AZ) (\d{4})$/,
            samples: 'AZ 6704, AZ 5332, AZ 3907, AZ 6892',
        },
        BA: {
            regex: /^\d{5}$/,
            samples: '62722, 80420, 44595, 74614',
        },
        BB: {
            regex: /^BB\d{5}$/,
            samples: 'BB64089, BB17494, BB73163, BB25752',
        },
        BD: {
            regex: /^\d{4}$/,
            samples: '8585, 8175, 7381, 0154',
        },
        BE: {
            regex: /^\d{4}$/,
            samples: '7944, 5303, 6746, 7921',
        },
        BF: {},
        BG: {
            regex: /^\d{4}$/,
            samples: '6409, 7657, 1206, 7908',
        },
        BH: {
            regex: /^\d{3}\d?$/,
            samples: '047, 1116, 490, 631',
        },
        BI: {},
        BJ: {},
        BL: {
            regex: /^97133$/,
            samples: '97133',
        },
        BM: {
            regex: /^[A-Z]{2} ?[A-Z0-9]{2}$/,
            samples: 'QV9P, OSJ1, PZ 3D, GR YK',
        },
        BN: {
            regex: /^[A-Z]{2} ?\d{4}$/,
            samples: 'PF 9925, TH1970, SC 4619, NF0781',
        },
        BO: {},
        BQ: {},
        BR: {
            regex: /^\d{5}-?\d{3}$/,
            samples: '18816-403, 95177-465, 43447-782, 39403-136',
        },
        BS: {},
        BT: {
            regex: /^\d{5}$/,
            samples: '28256, 52484, 30608, 93524',
        },
        BW: {},
        BY: {
            regex: /^\d{6}$/,
            samples: '504154, 360246, 741167, 895047',
        },
        BZ: {},
        CA: {
            regex: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/,
            samples: 'S1A7K8, Y5H 4G6, H9V0P2, H1A1B5',
        },
        CC: {
            regex: /^6799$/,
            samples: '6799',
        },
        CD: {},
        CF: {},
        CG: {},
        CH: {
            regex: /^\d{4}$/,
            samples: '6370, 5271, 7873, 8220',
        },
        CI: {},
        CK: {},
        CL: {
            regex: /^\d{7}$/,
            samples: '7565829, 8702008, 3161669, 1607703',
        },
        CM: {},
        CN: {
            regex: /^\d{6}$/,
            samples: '240543, 870138, 295528, 861683',
        },
        CO: {
            regex: /^\d{6}$/,
            samples: '678978, 775145, 823943, 913970',
        },
        CR: {
            regex: /^\d{5}$/,
            samples: '28256, 52484, 30608, 93524',
        },
        CU: {
            regex: /^(?:CP)?(\d{5})$/,
            samples: '28256, 52484, 30608, 93524',
        },
        CV: {
            regex: /^\d{4}$/,
            samples: '9056, 8085, 0491, 4627',
        },
        CW: {},
        CX: {
            regex: /^6798$/,
            samples: '6798',
        },
        CY: {
            regex: /^\d{4}$/,
            samples: '9301, 2478, 1981, 6162',
        },
        CZ: {
            regex: /^\d{3} ?\d{2}$/,
            samples: '150 56, 50694, 229 08, 82811',
        },
        DE: {
            regex: /^\d{5}$/,
            samples: '33185, 37198, 81711, 44262',
        },
        DJ: {},
        DK: {
            regex: /^\d{4}$/,
            samples: '1429, 2457, 0637, 5764',
        },
        DM: {},
        DO: {
            regex: /^\d{5}$/,
            samples: '11877, 95773, 93875, 98032',
        },
        DZ: {
            regex: /^\d{5}$/,
            samples: '26581, 64621, 57550, 72201',
        },
        EC: {
            regex: /^\d{6}$/,
            samples: '541124, 873848, 011495, 334509',
        },
        EE: {
            regex: /^\d{5}$/,
            samples: '87173, 01127, 73214, 52381',
        },
        EG: {
            regex: /^\d{5}$/,
            samples: '98394, 05129, 91463, 77359',
        },
        EH: {
            regex: /^\d{5}$/,
            samples: '30577, 60264, 16487, 38593',
        },
        ER: {},
        ES: {
            regex: /^\d{5}$/,
            samples: '03315, 00413, 23179, 89324',
        },
        ET: {
            regex: /^\d{4}$/,
            samples: '6269, 8498, 4514, 7820',
        },
        FI: {
            regex: /^\d{5}$/,
            samples: '21859, 72086, 22422, 03774',
        },
        FJ: {},
        FK: {
            regex: /^FIQQ 1ZZ$/,
            samples: 'FIQQ 1ZZ',
        },
        FM: {
            regex: /^(9694[1-4])(?:[ -](\d{4}))?$/,
            samples: '96942-9352, 96944-4935, 96941 9065, 96943-5369',
        },
        FO: {
            regex: /^\d{3}$/,
            samples: '334, 068, 741, 787',
        },
        FR: {
            regex: /^\d{2} ?\d{3}$/,
            samples: '25822, 53 637, 55354, 82522',
        },
        GA: {},
        GB: {
            regex: /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*([0-9][ABD-HJLNP-UW-Z]{2})?$/,
            samples: 'LA102UX, BL2F8FX, BD1S9LU, WR4G 6LH, W1U',
        },
        GD: {},
        GE: {
            regex: /^\d{4}$/,
            samples: '1232, 9831, 4717, 9428',
        },
        GF: {
            regex: /^9[78]3\d{2}$/,
            samples: '98380, 97335, 98344, 97300',
        },
        GG: {
            regex: /^GY\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}$/,
            samples: 'GY757LD, GY6D 6XL, GY3Y2BU, GY85 1YO',
        },
        GH: {},
        GI: {
            regex: /^GX11 1AA$/,
            samples: 'GX11 1AA',
        },
        GL: {
            regex: /^39\d{2}$/,
            samples: '3964, 3915, 3963, 3956',
        },
        GM: {},
        GN: {
            regex: /^\d{3}$/,
            samples: '465, 994, 333, 078',
        },
        GP: {
            regex: /^9[78][01]\d{2}$/,
            samples: '98069, 97007, 97147, 97106',
        },
        GQ: {},
        GR: {
            regex: /^\d{3} ?\d{2}$/,
            samples: '98654, 319 78, 127 09, 590 52',
        },
        GS: {
            regex: /^SIQQ 1ZZ$/,
            samples: 'SIQQ 1ZZ',
        },
        GT: {
            regex: /^\d{5}$/,
            samples: '30553, 69925, 09376, 83719',
        },
        GU: {
            regex: /^((969)[1-3][0-2])$/,
            samples: '96922, 96932, 96921, 96911',
        },
        GW: {
            regex: /^\d{4}$/,
            samples: '1742, 7941, 4437, 7728',
        },
        GY: {},
        HK: {
            regex: /^999077$|^$/,
            samples: '999077',
        },
        HN: {
            regex: /^\d{5}$/,
            samples: '86238, 78999, 03594, 30406',
        },
        HR: {
            regex: /^\d{5}$/,
            samples: '85240, 80710, 78235, 98766',
        },
        HT: {
            regex: /^(?:HT)?(\d{4})$/,
            samples: '5101, HT6991, HT3871, 1126',
        },
        HU: {
            regex: /^\d{4}$/,
            samples: '0360, 2604, 3362, 4775',
        },
        ID: {
            regex: /^\d{5}$/,
            samples: '60993, 52656, 16521, 34931',
        },
        IE: {},
        IL: {
            regex: /^\d{5}(?:\d{2})?$/,
            samples: '74213, 6978354, 2441689, 4971551',
        },
        IM: {
            regex: /^IM\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}$/,
            samples: 'IM2X1JP, IM4V 9JU, IM3B1UP, IM8E 5XF',
        },
        IN: {
            regex: /^\d{6}$/,
            samples: '946956, 143659, 243258, 938385',
        },
        IO: {
            regex: /^BBND 1ZZ$/,
            samples: 'BBND 1ZZ',
        },
        IQ: {
            regex: /^\d{5}$/,
            samples: '63282, 87817, 38580, 47725',
        },
        IR: {
            regex: /^\d{5}-?\d{5}$/,
            samples: '0666174250, 6052682188, 02360-81920, 25102-08646',
        },
        IS: {
            regex: /^\d{3}$/,
            samples: '408, 013, 001, 936',
        },
        IT: {
            regex: /^\d{5}$/,
            samples: '31701, 61341, 92781, 45609',
        },
        JE: {
            regex: /^JE\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}$/,
            samples: 'JE0D 2EX, JE59 2OF, JE1X1ZW, JE0V 1SO',
        },
        JM: {},
        JO: {
            regex: /^\d{5}$/,
            samples: '20789, 02128, 52170, 40284',
        },
        JP: {
            regex: /^\d{3}-?\d{4}$/,
            samples: '5429642, 046-1544, 6463599, 368-5362',
        },
        KE: {
            regex: /^\d{5}$/,
            samples: '33043, 98830, 59324, 42876',
        },
        KG: {
            regex: /^\d{6}$/,
            samples: '500371, 176592, 184133, 225279',
        },
        KH: {
            regex: /^\d{5,6}$/,
            samples: '220281, 18824, 35379, 09570',
        },
        KI: {
            regex: /^KI\d{4}$/,
            samples: 'KI0104, KI0109, KI0112, KI0306',
        },
        KM: {},
        KN: {
            regex: /^KN\d{4}(-\d{4})?$/,
            samples: 'KN2522, KN2560-3032, KN3507, KN4440',
        },
        KP: {},
        KR: {
            regex: /^\d{5}$/,
            samples: '67417, 66648, 08359, 93750',
        },
        KW: {
            regex: /^\d{5}$/,
            samples: '74840, 53309, 71276, 59262',
        },
        KY: {
            regex: /^KY\d-\d{4}$/,
            samples: 'KY0-3078, KY1-7812, KY8-3729, KY3-4664',
        },
        KZ: {
            regex: /^\d{6}$/,
            samples: '129113, 976562, 226811, 933781',
        },
        LA: {
            regex: /^\d{5}$/,
            samples: '08875, 50779, 87756, 75932',
        },
        LB: {
            regex: /^(?:\d{4})(?: ?(?:\d{4}))?$/,
            samples: '5436 1302, 9830 7470, 76911911, 9453 1306',
        },
        LC: {
            regex: /^(LC)?\d{2} ?\d{3}$/,
            samples: '21080, LC99127, LC24 258, 51 740',
        },
        LI: {
            regex: /^\d{4}$/,
            samples: '6644, 2852, 4630, 4541',
        },
        LK: {
            regex: /^\d{5}$/,
            samples: '44605, 27721, 90695, 65514',
        },
        LR: {
            regex: /^\d{4}$/,
            samples: '6644, 2852, 4630, 4541',
        },
        LS: {
            regex: /^\d{3}$/,
            samples: '779, 803, 104, 897',
        },
        LT: {
            regex: /^((LT)[-])?(\d{5})$/,
            samples: 'LT-22248, LT-12796, 69822, 37280',
        },
        LU: {
            regex: /^((L)[-])?(\d{4})$/,
            samples: '5469, L-4476, 6304, 9739',
        },
        LV: {
            regex: /^((LV)[-])?\d{4}$/,
            samples: '9344, LV-5030, LV-0132, 8097',
        },
        LY: {},
        MA: {
            regex: /^\d{5}$/,
            samples: '50219, 95871, 80907, 79804',
        },
        MC: {
            regex: /^980\d{2}$/,
            samples: '98084, 98041, 98070, 98062',
        },
        MD: {
            regex: /^(MD[-]?)?(\d{4})$/,
            samples: '6250, MD-9681, MD3282, MD-0652',
        },
        ME: {
            regex: /^\d{5}$/,
            samples: '87622, 92688, 23129, 59566',
        },
        MF: {
            regex: /^9[78][01]\d{2}$/,
            samples: '97169, 98180, 98067, 98043',
        },
        MG: {
            regex: /^\d{3}$/,
            samples: '854, 084, 524, 064',
        },
        MH: {
            regex: /^((969)[6-7][0-9])(-\d{4})?/,
            samples: '96962, 96969, 96970-8530, 96960-3226',
        },
        MK: {
            regex: /^\d{4}$/,
            samples: '8299, 6904, 6144, 9753',
        },
        ML: {},
        MM: {
            regex: /^\d{5}$/,
            samples: '59188, 93943, 40829, 69981',
        },
        MN: {
            regex: /^\d{5}$/,
            samples: '94129, 29906, 53374, 80141',
        },
        MO: {},
        MP: {
            regex: /^(9695[012])(?:[ -](\d{4}))?$/,
            samples: '96952 3162, 96950 1567, 96951 2994, 96950 8745',
        },
        MQ: {
            regex: /^9[78]2\d{2}$/,
            samples: '98297, 97273, 97261, 98282',
        },
        MR: {},
        MS: {
            regex: /^[Mm][Ss][Rr]\s{0,1}\d{4}$/,
            samples: 'MSR1110, MSR1230, MSR1250, MSR1330',
        },
        MT: {
            regex: /^[A-Z]{3} [0-9]{4}|[A-Z]{2}[0-9]{2}|[A-Z]{2} [0-9]{2}|[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9]{2}|[A-Z]{3} [0-9]{2}$/,
            samples: 'DKV 8196, KSU9264, QII0259, HKH 1020',
        },
        MU: {
            regex: /^([0-9A-R]\d{4})$/,
            samples: 'H8310, 52591, M9826, F5810',
        },
        MV: {
            regex: /^\d{5}$/,
            samples: '16354, 20857, 50991, 72527',
        },
        MW: {},
        MX: {
            regex: /^\d{5}$/,
            samples: '71530, 76424, 73811, 50503',
        },
        MY: {
            regex: /^\d{5}$/,
            samples: '75958, 15826, 86715, 37081',
        },
        MZ: {
            regex: /^\d{4}$/,
            samples: '0902, 6258, 7826, 7150',
        },
        NA: {
            regex: /^\d{5}$/,
            samples: '68338, 63392, 21820, 61211',
        },
        NC: {
            regex: /^988\d{2}$/,
            samples: '98865, 98813, 98820, 98855',
        },
        NE: {
            regex: /^\d{4}$/,
            samples: '9790, 3270, 2239, 0400',
        },
        NF: {
            regex: /^2899$/,
            samples: '2899',
        },
        NG: {
            regex: /^\d{6}$/,
            samples: '289096, 223817, 199970, 840648',
        },
        NI: {
            regex: /^\d{5}$/,
            samples: '86308, 60956, 49945, 15470',
        },
        NL: {
            regex: /^\d{4} ?[A-Z]{2}$/,
            samples: '6998 VY, 5390 CK, 2476 PS, 8873OX',
        },
        NO: {
            regex: /^\d{4}$/,
            samples: '0711, 4104, 2683, 5015',
        },
        NP: {
            regex: /^\d{5}$/,
            samples: '42438, 73964, 66400, 33976',
        },
        NR: {
            regex: /^(NRU68)$/,
            samples: 'NRU68',
        },
        NU: {
            regex: /^(9974)$/,
            samples: '9974',
        },
        NZ: {
            regex: /^\d{4}$/,
            samples: '7015, 0780, 4109, 1422',
        },
        OM: {
            regex: /^(?:PC )?\d{3}$/,
            samples: 'PC 851, PC 362, PC 598, PC 499',
        },
        PA: {
            regex: /^\d{4}$/,
            samples: '0711, 4104, 2683, 5015',
        },
        PE: {
            regex: /^\d{5}$/,
            samples: '10013, 12081, 14833, 24615',
        },
        PF: {
            regex: /^987\d{2}$/,
            samples: '98755, 98710, 98748, 98791',
        },
        PG: {
            regex: /^\d{3}$/,
            samples: '193, 166, 880, 553',
        },
        PH: {
            regex: /^\d{4}$/,
            samples: '0137, 8216, 2876, 0876',
        },
        PK: {
            regex: /^\d{5}$/,
            samples: '78219, 84497, 62102, 12564',
        },
        PL: {
            regex: /^\d{2}-\d{3}$/,
            samples: '63-825, 26-714, 05-505, 15-200',
        },
        PM: {
            regex: /^(97500)$/,
            samples: '97500',
        },
        PN: {
            regex: /^PCRN 1ZZ$/,
            samples: 'PCRN 1ZZ',
        },
        PR: {
            regex: /^(00[679]\d{2})(?:[ -](\d{4}))?$/,
            samples: '00989 3603, 00639 0720, 00707-9803, 00610 7362',
        },
        PS: {
            regex: /^(00[679]\d{2})(?:[ -](\d{4}))?$/,
            samples: '00748, 00663, 00779-4433, 00934 1559',
        },
        PT: {
            regex: /^\d{4}-\d{3}$/,
            samples: '0060-917, 4391-979, 5551-657, 9961-093',
        },
        PW: {
            regex: /^(969(?:39|40))(?:[ -](\d{4}))?$/,
            samples: '96940, 96939, 96939 6004, 96940-1871',
        },
        PY: {
            regex: /^\d{4}$/,
            samples: '7895, 5835, 8783, 5887',
        },
        QA: {},
        RE: {
            regex: /^9[78]4\d{2}$/,
            samples: '98445, 97404, 98421, 98434',
        },
        RO: {
            regex: /^\d{6}$/,
            samples: '935929, 407608, 637434, 174574',
        },
        RS: {
            regex: /^\d{5,6}$/,
            samples: '929863, 259131, 687739, 07011',
        },
        RU: {
            regex: /^\d{6}$/,
            samples: '138294, 617323, 307906, 981238',
        },
        RW: {},
        SA: {
            regex: /^\d{5}(-{1}\d{4})?$/,
            samples: '86020-1256, 72375, 70280, 96328',
        },
        SB: {},
        SC: {},
        SD: {
            regex: /^\d{5}$/,
            samples: '78219, 84497, 62102, 12564',
        },
        SE: {
            regex: /^\d{3} ?\d{2}$/,
            samples: '095 39, 41052, 84687, 563 66',
        },
        SG: {
            regex: /^\d{6}$/,
            samples: '606542, 233985, 036755, 265255',
        },
        SH: {
            regex: /^(?:ASCN|TDCU|STHL) 1ZZ$/,
            samples: 'STHL 1ZZ, ASCN 1ZZ, TDCU 1ZZ',
        },
        SI: {
            regex: /^\d{4}$/,
            samples: '6898, 3413, 2031, 5732',
        },
        SJ: {
            regex: /^\d{4}$/,
            samples: '7616, 3163, 5769, 0237',
        },
        SK: {
            regex: /^\d{3} ?\d{2}$/,
            samples: '594 52, 813 34, 867 67, 41814',
        },
        SL: {},
        SM: {
            regex: /^4789\d$/,
            samples: '47894, 47895, 47893, 47899',
        },
        SN: {
            regex: /^[1-8]\d{4}$/,
            samples: '48336, 23224, 33261, 82430',
        },
        SO: {},
        SR: {},
        SS: {
            regex: /^[A-Z]{2} ?\d{5}$/,
            samples: 'JQ 80186, CU 46474, DE33738, MS 59107',
        },
        ST: {},
        SV: {},
        SX: {},
        SY: {},
        SZ: {
            regex: /^[HLMS]\d{3}$/,
            samples: 'H458, L986, M477, S916',
        },
        TA: {
            regex: /^TDCU 1ZZ$/,
            samples: 'TDCU 1ZZ',
        },
        TC: {
            regex: /^TKCA 1ZZ$/,
            samples: 'TKCA 1ZZ',
        },
        TD: {},
        TF: {},
        TG: {},
        TH: {
            regex: /^\d{5}$/,
            samples: '30706, 18695, 21044, 42496',
        },
        TJ: {
            regex: /^\d{6}$/,
            samples: '381098, 961344, 519925, 667883',
        },
        TK: {},
        TL: {},
        TM: {
            regex: /^\d{6}$/,
            samples: '544985, 164362, 425224, 374603',
        },
        TN: {
            regex: /^\d{4}$/,
            samples: '6075, 7340, 2574, 8988',
        },
        TO: {},
        TR: {
            regex: /^\d{5}$/,
            samples: '42524, 81057, 50859, 42677',
        },
        TT: {
            regex: /^\d{6}$/,
            samples: '041238, 033990, 763476, 981118',
        },
        TV: {},
        TW: {
            regex: /^\d{3}(?:\d{2})?$/,
            samples: '21577, 76068, 68698, 08912',
        },
        TZ: {},
        UA: {
            regex: /^\d{5}$/,
            samples: '10629, 81138, 15668, 30055',
        },
        UG: {},
        UM: {},
        US: {
            regex: /^[0-9]{5}(?:[- ][0-9]{4})?$/,
            samples: '12345, 12345-1234, 12345 1234',
        },
        UY: {
            regex: /^\d{5}$/,
            samples: '40073, 30136, 06583, 00021',
        },
        UZ: {
            regex: /^\d{6}$/,
            samples: '205122, 219713, 441699, 287471',
        },
        VA: {
            regex: /^(00120)$/,
            samples: '00120',
        },
        VC: {
            regex: /^VC\d{4}$/,
            samples: 'VC0600, VC0176, VC0616, VC4094',
        },
        VE: {
            regex: /^\d{4}$/,
            samples: '9692, 1953, 6680, 8302',
        },
        VG: {
            regex: /^VG\d{4}$/,
            samples: 'VG1204, VG7387, VG3431, VG6021',
        },
        VI: {
            regex: /^(008(?:(?:[0-4]\d)|(?:5[01])))(?:[ -](\d{4}))?$/,
            samples: '00820, 00804 2036, 00825 3344, 00811-5900',
        },
        VN: {
            regex: /^\d{6}$/,
            samples: '133836, 748243, 894060, 020597',
        },
        VU: {},
        WF: {
            regex: /^986\d{2}$/,
            samples: '98692, 98697, 98698, 98671',
        },
        WS: {
            regex: /^WS[1-2]\d{3}$/,
            samples: 'WS1349, WS2798, WS1751, WS2090',
        },
        XK: {
            regex: /^[1-7]\d{4}$/,
            samples: '56509, 15863, 46644, 21896',
        },
        YE: {},
        YT: {
            regex: /^976\d{2}$/,
            samples: '97698, 97697, 97632, 97609',
        },
        ZA: {
            regex: /^\d{4}$/,
            samples: '6855, 5179, 6956, 7147',
        },
        ZM: {
            regex: /^\d{5}$/,
            samples: '77603, 97367, 80454, 94484',
        },
        ZW: {},
    },

    GENERIC_ZIP_CODE_REGEX: /^(?:(?![\s-])[\w -]{0,9}[\w])?$/,

    // Values for checking if polyfill is required on a platform
    POLYFILL_TEST: {
        STYLE: 'currency',
        CURRENCY: 'XAF',
        FORMAT: 'symbol',
        SAMPLE_INPUT: '123456.789',
        EXPECTED_OUTPUT: 'FCFA 123,457',
    },

    PATHS_TO_TREAT_AS_EXTERNAL: ['NewExpensify.dmg', 'docs/index.html'],

    // Test tool menu parameters
    TEST_TOOL: {
        // Number of concurrent taps to open then the Test modal menu
        NUMBER_OF_TAPS: 4,
    },

    MENU_HELP_URLS: {
        LEARN_MORE: 'https://www.expensify.com',
        DOCUMENTATION: 'https://github.com/Expensify/App/blob/main/README.md',
        COMMUNITY_DISCUSSIONS: 'https://expensify.slack.com/archives/C01GTK53T8Q',
        SEARCH_ISSUES: 'https://github.com/Expensify/App/issues',
    },

    BOOK_TRAVEL_DEMO_URL: 'https://calendly.com/d/ck2z-xsh-q97/expensify-travel-demo-travel-page',
    TRAVEL_DOT_URL: 'https://travel.expensify.com',
    STAGING_TRAVEL_DOT_URL: 'https://staging.travel.expensify.com',
    TRIP_ID_PATH: (tripID?: string) => (tripID ? `trips/${tripID}` : undefined),
    TRIP_SUPPORT: '/support',
    SPOTNANA_TMC_ID: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
    STAGING_SPOTNANA_TMC_ID: '7a290c6e-5328-4107-aff6-e48765845b81',
    SCREEN_READER_STATES: {
        ALL: 'all',
        ACTIVE: 'active',
        DISABLED: 'disabled',
    },
    SPACE_CHARACTER_WIDTH: 4,
    CHARACTER_WIDTH: 8,

    // The attribute used in the SelectionScraper.js helper to query all the DOM elements
    // that should be removed from the copied contents in the getHTMLOfSelection() method
    SELECTION_SCRAPER_HIDDEN_ELEMENT: 'selection-scrapper-hidden-element',
    INNER_BOX_SHADOW_ELEMENT: 'inner-box-shadow-element',
    MODERATION: {
        MODERATOR_DECISION_PENDING: 'pending',
        MODERATOR_DECISION_PENDING_HIDE: 'pendingHide',
        MODERATOR_DECISION_PENDING_REMOVE: 'pendingRemove',
        MODERATOR_DECISION_APPROVED: 'approved',
        MODERATOR_DECISION_HIDDEN: 'hidden',
        FLAG_SEVERITY_SPAM: 'spam',
        FLAG_SEVERITY_INCONSIDERATE: 'inconsiderate',
        FLAG_SEVERITY_INTIMIDATION: 'intimidation',
        FLAG_SEVERITY_BULLYING: 'bullying',
        FLAG_SEVERITY_HARASSMENT: 'harassment',
        FLAG_SEVERITY_ASSAULT: 'assault',
    },
    EMOJI_PICKER_TEXT_INPUT_SIZES: 152,
    TEXT_INPUT_SYMBOL_POSITION: {
        PREFIX: 'prefix',
        SUFFIX: 'suffix',
    },
    QR: {
        DEFAULT_LOGO_SIZE_RATIO: 0.25,
        DEFAULT_LOGO_MARGIN_RATIO: 0.02,
        EXPENSIFY_LOGO_SIZE_RATIO: 0.22,
        EXPENSIFY_LOGO_MARGIN_RATIO: 0.03,
    },

    ACCESSIBILITY_LABELS: {
        COLLAPSE: 'Collapse',
        EXPAND: 'Expand',
    },

    /**
     * Acceptable values for the `role` attribute on react native components.
     *
     * **IMPORTANT:** Not for use with the `accessibilityRole` prop, as it accepts different values, and new components
     * should use the `role` prop instead.
     */
    ROLE: {
        /** Use for elements with important, time-sensitive information. */
        ALERT: 'alert',
        /** Use for elements that act as buttons. */
        BUTTON: 'button',
        /** Use for elements representing checkboxes. */
        CHECKBOX: 'checkbox',
        /** Use for elements that allow a choice from multiple options. */
        COMBOBOX: 'combobox',
        /** Use with scrollable lists to represent a grid layout. */
        GRID: 'grid',
        /** Use for section headers or titles. */
        HEADING: 'heading',
        /** Use for image elements. */
        IMG: 'img',
        /** Use for elements that navigate to other pages or content. */
        LINK: 'link',
        /** Use to identify a list of items. */
        LIST: 'list',
        /** Use for a list of choices or options. */
        MENU: 'menu',
        /** Use for a container of multiple menus. */
        MENUBAR: 'menubar',
        /** Use for items within a menu. */
        MENUITEM: 'menuitem',
        /** Use when no specific role is needed. */
        NONE: 'none',
        /** Use for elements that don't require a specific role. */
        PRESENTATION: 'presentation',
        /** Use for elements showing progress of a task. */
        PROGRESSBAR: 'progressbar',
        /** Use for radio buttons. */
        RADIO: 'radio',
        /** Use for groups of radio buttons. */
        RADIOGROUP: 'radiogroup',
        /** Use for scrollbar elements. */
        SCROLLBAR: 'scrollbar',
        /** Use for text fields that are used for searching. */
        SEARCHBOX: 'searchbox',
        /** Use for adjustable elements like sliders. */
        SLIDER: 'slider',
        /** Use for a button that opens a list of choices. */
        SPINBUTTON: 'spinbutton',
        /** Use for elements providing a summary of app conditions. */
        SUMMARY: 'summary',
        /** Use for on/off switch elements. */
        SWITCH: 'switch',
        /** Use for tab elements in a tab list. */
        TAB: 'tab',
        /** Use for a list of tabs. */
        TABLIST: 'tablist',
        /** Use for timer elements. */
        TIMER: 'timer',
        /** Use for toolbars containing action buttons or components. */
        TOOLBAR: 'toolbar',
        /** Use for navigation elements */
        NAVIGATION: 'navigation',
        /** Use for Tooltips */
        TOOLTIP: 'tooltip',
    },
    TRANSLATION_KEYS: {
        ATTACHMENT: 'common.attachment',
    },
    TEACHERS_UNITE: {
        PROD_PUBLIC_ROOM_ID: '7470147100835202',
        PROD_POLICY_ID: 'B795B6319125BDF2',
        TEST_PUBLIC_ROOM_ID: '207591744844000',
        TEST_POLICY_ID: 'ABD1345ED7293535',
        POLICY_NAME: 'Expensify.org / Teachers Unite!',
        PUBLIC_ROOM_NAME: '#teachers-unite',
    },
    CUSTOM_STATUS_TYPES: {
        NEVER: 'never',
        THIRTY_MINUTES: 'thirtyMinutes',
        ONE_HOUR: 'oneHour',
        AFTER_TODAY: 'afterToday',
        AFTER_WEEK: 'afterWeek',
        CUSTOM: 'custom',
    },
    TWO_FACTOR_AUTH_STEPS: {
        COPY_CODES: 'COPY_CODES',
        VERIFY: 'VERIFY',
        SUCCESS: 'SUCCESS',
        ENABLED: 'ENABLED',
        DISABLED: 'DISABLED',
        DISABLE: 'DISABLE',
    },
    MULTIFACTOR_AUTHENTICATION_OUTCOME_TYPE: {
        SUCCESS: 'success',
        FAILURE: 'failure',
    },
    MERGE_ACCOUNT_RESULTS: {
        SUCCESS: 'success',
        ERR_2FA: 'err_2fa',
        ERR_NO_EXIST: 'err_no_exist',
        ERR_SMART_SCANNER: 'err_smart_scanner',
        ERR_INVOICING: 'err_invoicing',
        ERR_SAML_PRIMARY_LOGIN: 'err_saml_primary_login',
        ERR_SAML_DOMAIN_CONTROL: 'err_saml_domain_control',
        ERR_SAML_NOT_SUPPORTED: 'err_saml_not_supported',
        ERR_ACCOUNT_LOCKED: 'err_account_locked',
        ERR_MERGE_SELF: 'err_merge_self',
        TOO_MANY_ATTEMPTS: 'too_many_attempts',
        ACCOUNT_UNVALIDATED: 'account_unvalidated',
    },
    DELEGATE_ROLE: {
        ALL: 'all',
        SUBMITTER: 'submitter',
    },
    DELEGATE: {
        DENIED_ACCESS_VARIANTS: {
            DELEGATE: 'delegate',
            SUBMITTER: 'submitter',
        },
    },
    DELEGATE_ROLE_HELP_DOT_ARTICLE_LINK: 'https://help.expensify.com/expensify-classic/hubs/copilots-and-delegates/',
    STRIPE_SCA_AUTH_STATUSES: {
        SUCCEEDED: 'succeeded',
        CARD_AUTHENTICATION_REQUIRED: 'authentication_required',
    },
    TAB: {
        DEBUG_TAB_ID: 'DebugTab',
        NEW_CHAT_TAB_ID: 'NewChatTab',
        NEW_CHAT: 'chat',
        NEW_ROOM: 'room',
        RECEIPT_TAB_ID: 'ReceiptTab',
        IOU_REQUEST_TYPE: 'iouRequestType',
        DISTANCE_REQUEST_TYPE: 'distanceRequestType',
        SPLIT_EXPENSE_TAB_TYPE: 'splitExpenseTabType',
        SPLIT: {
            AMOUNT: 'amount',
            PERCENTAGE: 'percentage',
            DATE: 'date',
        },
        SHARE: {
            NAVIGATOR_ID: 'ShareNavigatorID',
            SHARE: 'ShareTab',
            SUBMIT: 'SubmitTab',
        },
        RECEIPT_PARTNERS: {
            NAVIGATOR_ID: 'ReceiptPartnersID',
            ALL: 'ReceiptPartnersAllTab',
            LINKED: 'ReceiptPartnersLinkedTab',
            OUTSTANDING: 'ReceiptPartnersOutstandingTab',
        },
    },
    TAB_REQUEST: {
        MANUAL: 'manual',
        SCAN: 'scan',
        DISTANCE: 'distance',
        PER_DIEM: 'per-diem',
        DISTANCE_MAP: 'distance-map',
        DISTANCE_MANUAL: 'distance-manual',
        DISTANCE_GPS: 'distance-gps',
        DISTANCE_ODOMETER: 'distance-odometer',
        TIME: 'time',
    },

    STATUS_TEXT_MAX_LENGTH: 100,

    DROPDOWN_BUTTON_SIZE: {
        EXTRA_SMALL: 'extra-small',
        LARGE: 'large',
        MEDIUM: 'medium',
        SMALL: 'small',
    },

    SF_COORDINATES: [-122.4194, 37.7749],

    NAVIGATION: {
        CUSTOM_HISTORY_ENTRY_SIDE_PANEL: 'CUSTOM_HISTORY-SIDE_PANEL',
        ACTION_TYPE: {
            REPLACE: 'REPLACE',
            PUSH: 'PUSH',
            NAVIGATE: 'NAVIGATE',
            SET_PARAMS: 'SET_PARAMS',
            PRELOAD: 'PRELOAD',
            POP_TO: 'POP_TO',
            GO_BACK: 'GO_BACK',

            /** These action types are custom for RootNavigator */
            DISMISS_MODAL: 'DISMISS_MODAL',
            OPEN_WORKSPACE_SPLIT: 'OPEN_WORKSPACE_SPLIT',
            OPEN_DOMAIN_SPLIT: 'OPEN_DOMAIN_SPLIT',
            SET_HISTORY_PARAM: 'SET_HISTORY_PARAM',
            REPLACE_PARAMS: 'REPLACE_PARAMS',
            TOGGLE_SIDE_PANEL_WITH_HISTORY: 'TOGGLE_SIDE_PANEL_WITH_HISTORY',
        },
    },
    TIME_PERIOD: {
        AM: 'AM',
        PM: 'PM',
    },
    INDENTS: '    ',
    PARENT_CHILD_SEPARATOR: ': ',
    DISTANCE_MERCHANT_SEPARATOR: '@',
    COLON: ':',
    MAPBOX: {
        PADDING: 32,
        DEFAULT_ZOOM: 15,
        SINGLE_MARKER_ZOOM: 15,
        DEFAULT_COORDINATE: [-122.4021, 37.7911] as [number, number],
        STYLE_URL: 'mapbox://styles/expensify/cllcoiqds00cs01r80kp34tmq',
        ANIMATION_DURATION_ON_CENTER_ME: 1000,
        CENTER_BUTTON_FADE_DURATION: 300,
    },
    ONYX_UPDATE_TYPES: {
        HTTPS: 'https',
        PUSHER: 'pusher',
        AIRSHIP: 'airship',
    },
    EVENTS: {
        SCROLLING: 'scrolling',
    },
    SELECTION_LIST_WITH_MODAL_TEST_ID: 'selectionListWithModalMenuItem',

    ICON_TEST_ID: 'Icon',
    IMAGE_TEST_ID: 'Image',
    IMAGE_SVG_TEST_ID: 'ImageSVG',
    VIDEO_PLAYER_TEST_ID: 'VideoPlayer',
    LOTTIE_VIEW_TEST_ID: 'LottieView',

    DOT_INDICATOR_TEST_ID: 'DotIndicator',
    ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID: 'animated-collapsible-content',

    CHAT_HEADER_LOADER_HEIGHT: 36,

    HORIZONTAL_SPACER: {
        DEFAULT_BORDER_BOTTOM_WIDTH: 1,
        DEFAULT_MARGIN_VERTICAL: 8,
        HIDDEN_MARGIN_VERTICAL: 4,
        HIDDEN_BORDER_BOTTOM_WIDTH: 0,
    },

    LIST_COMPONENTS: {
        HEADER: 'header',
        FOOTER: 'footer',
    },

    MISSING_TRANSLATION: 'MISSING TRANSLATION',
    SEARCH_MAX_LENGTH: 500,

    /**
     * The count of characters we'll allow the user to type after reaching SEARCH_MAX_LENGTH in an input.
     */
    ADDITIONAL_ALLOWED_CHARACTERS: 20,

    VALIDATION_REIMBURSEMENT_INPUT_LIMIT: 20,

    REFERRAL_PROGRAM: {
        CONTENT_TYPES: {
            SUBMIT_EXPENSE: 'submitExpense',
            START_CHAT: 'startChat',
            REFER_FRIEND: 'referralFriend',
            SHARE_CODE: 'shareCode',
        },
        LEARN_MORE_LINK: 'https://help.expensify.com/articles/new-expensify/expenses/Referral-Program',
        LINK: 'https://join.my.expensify.com',
    },

    FEATURE_TRAINING: {
        CONTENT_TYPES: {
            TRACK_EXPENSE: 'track-expenses',
        },
        'track-expenses': {
            VIDEO_URL: `${CLOUDFRONT_URL}/videos/guided-setup-track-business-v2.mp4`,
            LEARN_MORE_LINK: `${USE_EXPENSIFY_URL}/track-expenses`,
        },
        TEST_DRIVE_COVER_ASPECT_RATIO: 1000 / 508,
    },

    /**
     * native IDs for close buttons in Overlay component
     */
    OVERLAY: {
        TOP_BUTTON_NATIVE_ID: 'overLayTopButton',
        BOTTOM_BUTTON_NATIVE_ID: 'overLayBottomButton',
    },

    BACK_BUTTON_NATIVE_ID: 'backButton',
    EMOJI_PICKER_BUTTON_NATIVE_ID: 'emojiPickerButton',

    /**
     * The maximum count of items per page for SelectionList.
     * When paginate, it multiplies by page number.
     */
    MAX_SELECTION_LIST_PAGE_LENGTH: 50,

    /**
     * Bank account names
     */
    BANK_NAMES: {
        EXPENSIFY: 'expensify',
        AMERICAN_EXPRESS: 'americanexpress',
        BANK_OF_AMERICA: 'bank of america',
        BB_T: 'bbt',
        CAPITAL_ONE: 'capital one',
        CHASE: 'chase',
        CHARLES_SCHWAB: 'charles schwab',
        CITIBANK: 'citibank',
        CITIZENS_BANK: 'citizens bank',
        DISCOVER: 'discover',
        FIDELITY: 'fidelity',
        GENERIC_BANK: 'generic bank',
        HUNTINGTON_BANK: 'huntington bank',
        HUNTINGTON_NATIONAL: 'huntington national',
        NAVY_FEDERAL_CREDIT_UNION: 'navy federal credit union',
        PNC: 'pnc',
        REGIONS_BANK: 'regions bank',
        SUNTRUST: 'suntrust',
        TD_BANK: 'td bank',
        US_BANK: 'us bank',
        USAA: 'usaa',
    },

    /**
     * Bank account names (user friendly)
     */
    get BANK_NAMES_USER_FRIENDLY() {
        return {
            [this.BANK_NAMES.EXPENSIFY]: 'Expensify',
            [this.BANK_NAMES.AMERICAN_EXPRESS]: 'American Express',
            [this.BANK_NAMES.BANK_OF_AMERICA]: 'Bank of America',
            [this.BANK_NAMES.BB_T]: 'Truist',
            [this.BANK_NAMES.CAPITAL_ONE]: 'Capital One',
            [this.BANK_NAMES.CHASE]: 'Chase',
            [this.BANK_NAMES.CHARLES_SCHWAB]: 'Charles Schwab',
            [this.BANK_NAMES.CITIBANK]: 'Citibank',
            [this.BANK_NAMES.CITIZENS_BANK]: 'Citizens',
            [this.BANK_NAMES.DISCOVER]: 'Discover',
            [this.BANK_NAMES.FIDELITY]: 'Fidelity',
            [this.BANK_NAMES.GENERIC_BANK]: 'Bank',
            [this.BANK_NAMES.HUNTINGTON_BANK]: 'Huntington',
            [this.BANK_NAMES.HUNTINGTON_NATIONAL]: 'Huntington National',
            [this.BANK_NAMES.NAVY_FEDERAL_CREDIT_UNION]: 'Navy Federal Credit Union',
            [this.BANK_NAMES.PNC]: 'PNC',
            [this.BANK_NAMES.REGIONS_BANK]: 'Regions',
            [this.BANK_NAMES.SUNTRUST]: 'SunTrust',
            [this.BANK_NAMES.TD_BANK]: 'TD Bank',
            [this.BANK_NAMES.US_BANK]: 'U.S. Bank',
            [this.BANK_NAMES.USAA]: 'USAA',
        };
    },

    /**
     * Constants for maxToRenderPerBatch parameter that is used for FlatList or SectionList. This controls the amount of items rendered per batch, which is the next chunk of items
     * rendered on every scroll.
     */
    MAX_TO_RENDER_PER_BATCH: {
        DEFAULT: 5,
        CAROUSEL: 3,
    },

    /**
     * Feature flag to enable the missingAttendees violation feature.
     * Currently enabled only on staging for testing.
     * When true:
     * - Enables new missingAttendees violations to be created
     * - Shows existing missingAttendees violations in transaction lists
     * - Shows "Require attendees" toggle in category settings
     * Note: Config?.ENVIRONMENT is undefined in local dev when .env doesn't set it, so we treat undefined as dev
     */
    // We can't use nullish coalescing for boolean comparison
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    IS_ATTENDEES_REQUIRED_ENABLED: !Config?.ENVIRONMENT || Config?.ENVIRONMENT === 'staging' || Config?.ENVIRONMENT === 'development',

    /**
     * Constants for types of violation.
     */
    VIOLATION_TYPES: {
        VIOLATION: 'violation',
        NOTICE: 'notice',
        WARNING: 'warning',
    },

    /**
     * Constant for prefix of violations.
     */
    VIOLATIONS_PREFIX: 'violations.',

    /**
     * Constants with different types for the modifiedAmount violation
     */
    MODIFIED_AMOUNT_VIOLATION_DATA: {
        DISTANCE: 'distance',
        CARD: 'card',
        SMARTSCAN: 'smartscan',
    },

    /**
     * Constants for types of violation names.
     * Defined here because they need to be referenced by the type system to generate the
     * ViolationNames type.
     */
    VIOLATIONS: {
        ALL_TAG_LEVELS_REQUIRED: 'allTagLevelsRequired',
        AUTO_REPORTED_REJECTED_EXPENSE: 'autoReportedRejectedExpense',
        BILLABLE_EXPENSE: 'billableExpense',
        CASH_EXPENSE_WITH_NO_RECEIPT: 'cashExpenseWithNoReceipt',
        CATEGORY_OUT_OF_POLICY: 'categoryOutOfPolicy',
        CONVERSION_SURCHARGE: 'conversionSurcharge',
        CUSTOM_UNIT_OUT_OF_POLICY: 'customUnitOutOfPolicy',
        DUPLICATED_TRANSACTION: 'duplicatedTransaction',
        FIELD_REQUIRED: 'fieldRequired',
        FUTURE_DATE: 'futureDate',
        INVOICE_MARKUP: 'invoiceMarkup',
        MAX_AGE: 'maxAge',
        MISSING_CATEGORY: 'missingCategory',
        MISSING_COMMENT: 'missingComment',
        MISSING_TAG: 'missingTag',
        MODIFIED_AMOUNT: 'modifiedAmount',
        MODIFIED_DATE: 'modifiedDate',
        PROHIBITED_EXPENSE: 'prohibitedExpense',
        NON_EXPENSIWORKS_EXPENSE: 'nonExpensiworksExpense',
        OVER_AUTO_APPROVAL_LIMIT: 'overAutoApprovalLimit',
        OVER_CATEGORY_LIMIT: 'overCategoryLimit',
        OVER_LIMIT: 'overLimit',
        OVER_LIMIT_ATTENDEE: 'overLimitAttendee',
        PER_DAY_LIMIT: 'perDayLimit',
        RECEIPT_NOT_SMART_SCANNED: 'receiptNotSmartScanned',
        RECEIPT_REQUIRED: 'receiptRequired',
        ITEMIZED_RECEIPT_REQUIRED: 'itemizedReceiptRequired',
        CUSTOM_RULES: 'customRules',
        RTER: 'rter',
        SMARTSCAN_FAILED: 'smartscanFailed',
        SOME_TAG_LEVELS_REQUIRED: 'someTagLevelsRequired',
        TAG_OUT_OF_POLICY: 'tagOutOfPolicy',
        TAX_AMOUNT_CHANGED: 'taxAmountChanged',
        TAX_OUT_OF_POLICY: 'taxOutOfPolicy',
        TAX_RATE_CHANGED: 'taxRateChanged',
        TAX_REQUIRED: 'taxRequired',
        HOLD: 'hold',
        RECEIPT_GENERATED_WITH_AI: 'receiptGeneratedWithAI',
        OVER_TRIP_LIMIT: 'overTripLimit',
        COMPANY_CARD_REQUIRED: 'companyCardRequired',
        NO_ROUTE: 'noRoute',
        MISSING_ATTENDEES: 'missingAttendees',
    },
    RTER_VIOLATION_TYPES: {
        BROKEN_CARD_CONNECTION: 'brokenCardConnection',
        BROKEN_CARD_CONNECTION_530: 'brokenCardConnection530',
        SEVEN_DAY_HOLD: 'sevenDayHold',
    },
    REVIEW_DUPLICATES_ORDER: ['merchant', 'category', 'tag', 'description', 'taxCode', 'billable', 'reimbursable'],

    REPORT_VIOLATIONS: {
        FIELD_REQUIRED: 'fieldRequired',
        RBR_MESSAGE_MAX_CHARACTERS_FOR_PREVIEW: 40,
    },

    REPORT_VIOLATIONS_EXCLUDED_FIELDS: {
        TEXT_TITLE: 'text_title',
    },

    /** Context menu types */
    CONTEXT_MENU_TYPES: {
        LINK: 'LINK',
        REPORT_ACTION: 'REPORT_ACTION',
        EMAIL: 'EMAIL',
        REPORT: 'REPORT',
        TEXT: 'TEXT',
    },

    PROMOTED_ACTIONS: {
        PIN: 'pin',
        SHARE: 'share',
        JOIN: 'join',
        MESSAGE: 'message',
        HOLD: 'hold',
    },

    THUMBNAIL_IMAGE: {
        SMALL_SCREEN: {
            SIZE: 250,
        },
        WIDE_SCREEN: {
            SIZE: 350,
        },
        NAN_ASPECT_RATIO: 1.5,
    },

    VIDEO_PLAYER: {
        POPOVER_Y_OFFSET: -30,
        PLAYBACK_SPEEDS: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        HIDE_TIME_TEXT_WIDTH: 250,
        MIN_WIDTH: 170,
        MIN_HEIGHT: 120,
        CONTROLS_STATUS: {
            SHOW: 'show',
            HIDE: 'hide',
            VOLUME_ONLY: 'volumeOnly',
        },
        CONTROLS_POSITION: {
            NATIVE: 32,
            NORMAL: 8,
        },
        DEFAULT_VIDEO_DIMENSIONS: {width: 1900, height: 1400},
    },

    INTRO_CHOICES: {
        SUBMIT: 'newDotSubmit',
        MANAGE_TEAM: 'newDotManageTeam',
        CHAT_SPLIT: 'newDotSplitChat',
    },

    MANAGE_TEAMS_CHOICE: {
        MULTI_LEVEL: 'multiLevelApproval',
        CUSTOM_EXPENSE: 'customExpenseCoding',
        CARD_TRACKING: 'companyCardTracking',
        ACCOUNTING: 'accountingIntegrations',
        RULE: 'ruleEnforcement',
    },

    MINI_CONTEXT_MENU_MAX_ITEMS: 4,

    EXPENSIFY_ICON_NAME: 'Expensify',

    WELCOME_VIDEO_URL: `${CLOUDFRONT_URL}/videos/intro-1280.mp4`,

    ONBOARDING_CHOICES: {...onboardingChoices},
    SELECTABLE_ONBOARDING_CHOICES: {...selectableOnboardingChoices},
    CREATE_EXPENSE_ONBOARDING_CHOICES: {...createExpenseOnboardingChoices},
    ONBOARDING_SIGNUP_QUALIFIERS: {...signupQualifiers},
    ONBOARDING_INVITE_TYPES: {...onboardingInviteTypes},
    ONBOARDING_COMPANY_SIZE: {...onboardingCompanySize},
    ONBOARDING_RHP_VARIANT: {
        RHP_CONCIERGE_DM: 'rhpConciergeDm',
        RHP_ADMINS_ROOM: 'rhpAdminsRoom',
        CONTROL: 'control',
    },
    ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE: 'What would you like to do with this expense?',
    ONBOARDING_ACCOUNTING_MAPPING,

    REPORT_FIELD_TITLE_FIELD_ID: 'text_title',

    MOBILE_PAGINATION_SIZE: 15,
    WEB_PAGINATION_SIZE: 30,

    /** Dimensions for illustration shown in Confirmation Modal */
    CONFIRM_CONTENT_SVG_SIZE: {
        HEIGHT: 220,
        WIDTH: 130,
    },

    DEBUG_CONSOLE: {
        LEVELS: {
            INFO: 'INFO',
            ERROR: 'ERROR',
            RESULT: 'RESULT',
            DEBUG: 'DEBUG',
        },
    },

    // We need to store this server side error in order to not show the blocking screen when the error is for invalid code
    MERGE_ACCOUNT_INVALID_CODE_ERROR: '401 Not authorized - Invalid validateCode',
    REIMBURSEMENT_ACCOUNT: {
        DEFAULT_DATA: {
            achData: {
                state: 'SETUP',
            },
            isLoading: false,
            errorFields: {},
            errors: {},
            maxAttemptsReached: false,
            shouldShowResetModal: false,
        },
        SUBSTEP_INDEX: {
            BANK_ACCOUNT: {
                ACCOUNT_NUMBERS: 0,
            },
            PERSONAL_INFO: {
                LEGAL_NAME: 0,
                DATE_OF_BIRTH: 1,
                SSN: 2,
                ADDRESS: 3,
            },
            BUSINESS_INFO: {
                BUSINESS_NAME: 0,
                TAX_ID_NUMBER: 1,
                COMPANY_WEBSITE: 2,
                PHONE_NUMBER: 3,
                COMPANY_ADDRESS: 4,
                COMPANY_TYPE: 5,
                INCORPORATION_DATE: 6,
                INCORPORATION_STATE: 7,
                INCORPORATION_CODE: 8,
            },
            UBO: {
                LEGAL_NAME: 0,
                DATE_OF_BIRTH: 1,
                SSN: 2,
                ADDRESS: 3,
            },
        },
    },

    /* If we update these values, let's ensure this logic is consistent with the logic in the backend (Auth), since we're using the same method to calculate the rate value in distance requests created via Concierge. */
    CURRENCY_TO_DEFAULT_MILEAGE_RATE: JSON.parse(`{
        "AED": {
            "rate": 428.5,
            "unit": "km"
        },
        "AFN": {
            "rate": 7703.93,
            "unit": "km"
        },
        "ALL": {
            "rate": 9633.54,
            "unit": "km"
        },
        "AMD": {
            "rate": 44504.28,
            "unit": "km"
        },
        "ANG": {
            "rate": 208.86,
            "unit": "km"
        },
        "AOA": {
            "rate": 106762.22,
            "unit": "km"
        },
        "ARS": {
            "rate": 171174.53,
            "unit": "km"
        },
        "AUD": {
            "rate": 88,
            "unit": "km"
        },
        "AWG": {
            "rate": 210.31,
            "unit": "km"
        },
        "AZN": {
            "rate": 198.35,
            "unit": "km"
        },
        "BAM": {
            "rate": 194.86,
            "unit": "km"
        },
        "BBD": {
            "rate": 233.35,
            "unit": "km"
        },
        "BDT": {
            "rate": 14251.98,
            "unit": "km"
        },
        "BGN": {
            "rate": 195.25,
            "unit": "km"
        },
        "BHD": {
            "rate": 43.98,
            "unit": "km"
        },
        "BIF": {
            "rate": 345436.14,
            "unit": "km"
        },
        "BMD": {
            "rate": 116.68,
            "unit": "km"
        },
        "BND": {
            "rate": 149.25,
            "unit": "km"
        },
        "BOB": {
            "rate": 807.7,
            "unit": "km"
        },
        "BRL": {
            "rate": 626.95,
            "unit": "km"
        },
        "BSD": {
            "rate": 116.68,
            "unit": "km"
        },
        "BTN": {
            "rate": 10516.86,
            "unit": "km"
        },
        "BWP": {
            "rate": 1619.97,
            "unit": "km"
        },
        "BYN": {
            "rate": 342.9,
            "unit": "km"
        },
        "BYR": {
            "rate": 2336612.1,
            "unit": "km"
        },
        "BZD": {
            "rate": 234.56,
            "unit": "km"
        },
        "CAD": {
            "rate": 72,
            "unit": "km"
        },
        "CDF": {
            "rate": 264869.39,
            "unit": "km"
        },
        "CHF": {
            "rate": 76,
            "unit": "km"
        },
        "CLP": {
            "rate": 104301.62,
            "unit": "km"
        },
        "CNY": {
            "rate": 814.84,
            "unit": "km"
        },
        "COP": {
            "rate": 439901.44,
            "unit": "km"
        },
        "CRC": {
            "rate": 57973.09,
            "unit": "km"
        },
        "CUC": {
            "rate": 116.68,
            "unit": "km"
        },
        "CUP": {
            "rate": 3004.45,
            "unit": "km"
        },
        "CVE": {
            "rate": 11004.01,
            "unit": "km"
        },
        "CZK": {
            "rate": 2413.34,
            "unit": "km"
        },
        "DJF": {
            "rate": 20752.5,
            "unit": "km"
        },
        "DKK": {
            "rate": 394,
            "unit": "km"
        },
        "DOP": {
            "rate": 7398.54,
            "unit": "km"
        },
        "DZD": {
            "rate": 15153.28,
            "unit": "km"
        },
        "EEK": {
            "rate": 1704.36,
            "unit": "km"
        },
        "EGP": {
            "rate": 5512.97,
            "unit": "km"
        },
        "ERN": {
            "rate": 1750.16,
            "unit": "km"
        },
        "ETB": {
            "rate": 18077.09,
            "unit": "km"
        },
        "EUR": {
            "rate": 30,
            "unit": "km"
        },
        "FJD": {
            "rate": 265.25,
            "unit": "km"
        },
        "FKP": {
            "rate": 86.44,
            "unit": "km"
        },
        "GBP": {
            "rate": 45,
            "unit": "mi"
        },
        "GEL": {
            "rate": 313.87,
            "unit": "km"
        },
        "GHS": {
            "rate": 1246.23,
            "unit": "km"
        },
        "GIP": {
            "rate": 86.44,
            "unit": "km"
        },
        "GMD": {
            "rate": 8575.79,
            "unit": "km"
        },
        "GNF": {
            "rate": 1019841.61,
            "unit": "km"
        },
        "GTQ": {
            "rate": 893.94,
            "unit": "km"
        },
        "GYD": {
            "rate": 24400.12,
            "unit": "km"
        },
        "HKD": {
            "rate": 908.6,
            "unit": "km"
        },
        "HNL": {
            "rate": 3080.03,
            "unit": "km"
        },
        "HRK": {
            "rate": 752.16,
            "unit": "km"
        },
        "HTG": {
            "rate": 15266.76,
            "unit": "km"
        },
        "HUF": {
            "rate": 38407.92,
            "unit": "km"
        },
        "IDR": {
            "rate": 1954232.16,
            "unit": "km"
        },
        "ILS": {
            "rate": 540,
            "unit": "km"
        },
        "INR": {
            "rate": 10518.19,
            "unit": "km"
        },
        "IQD": {
            "rate": 152781.51,
            "unit": "km"
        },
        "IRR": {
            "rate": 4910488.26,
            "unit": "km"
        },
        "ISK": {
            "rate": 14694.92,
            "unit": "km"
        },
        "JMD": {
            "rate": 18515.8,
            "unit": "km"
        },
        "JOD": {
            "rate": 82.72,
            "unit": "km"
        },
        "JPY": {
            "rate": 18278.93,
            "unit": "km"
        },
        "KES": {
            "rate": 15058.57,
            "unit": "km"
        },
        "KGS": {
            "rate": 10202.68,
            "unit": "km"
        },
        "KHR": {
            "rate": 468558.4,
            "unit": "km"
        },
        "KMF": {
            "rate": 49237.89,
            "unit": "km"
        },
        "KPW": {
            "rate": 105009.73,
            "unit": "km"
        },
        "KRW": {
            "rate": 168722.07,
            "unit": "km"
        },
        "KWD": {
            "rate": 35.82,
            "unit": "km"
        },
        "KYD": {
            "rate": 97.19,
            "unit": "km"
        },
        "KZT": {
            "rate": 59441.07,
            "unit": "km"
        },
        "LAK": {
            "rate": 2520371.89,
            "unit": "km"
        },
        "LBP": {
            "rate": 10444573.37,
            "unit": "km"
        },
        "LKR": {
            "rate": 36161.18,
            "unit": "km"
        },
        "LRD": {
            "rate": 20916.15,
            "unit": "km"
        },
        "LSL": {
            "rate": 1909.99,
            "unit": "km"
        },
        "LTL": {
            "rate": 376.1,
            "unit": "km"
        },
        "LVL": {
            "rate": 76.56,
            "unit": "km"
        },
        "LYD": {
            "rate": 631.41,
            "unit": "km"
        },
        "MAD": {
            "rate": 1070.73,
            "unit": "km"
        },
        "MDL": {
            "rate": 1950.82,
            "unit": "km"
        },
        "MGA": {
            "rate": 537347.25,
            "unit": "km"
        },
        "MKD": {
            "rate": 6144.12,
            "unit": "km"
        },
        "MMK": {
            "rate": 245011.43,
            "unit": "km"
        },
        "MNT": {
            "rate": 415371.81,
            "unit": "km"
        },
        "MOP": {
            "rate": 935.53,
            "unit": "km"
        },
        "MRO": {
            "rate": 41653.05,
            "unit": "km"
        },
        "MRU": {
            "rate": 4631.69,
            "unit": "km"
        },
        "MUR": {
            "rate": 5402.17,
            "unit": "km"
        },
        "MVR": {
            "rate": 1803.83,
            "unit": "km"
        },
        "MWK": {
            "rate": 202409.9,
            "unit": "km"
        },
        "MXN": {
            "rate": 93,
            "unit": "km"
        },
        "MYR": {
            "rate": 472.6,
            "unit": "km"
        },
        "MZN": {
            "rate": 7456.85,
            "unit": "km"
        },
        "NAD": {
            "rate": 1910.94,
            "unit": "km"
        },
        "NGN": {
            "rate": 166247.91,
            "unit": "km"
        },
        "NIO": {
            "rate": 4291.54,
            "unit": "km"
        },
        "NOK": {
            "rate": 350,
            "unit": "km"
        },
        "NPR": {
            "rate": 16827.52,
            "unit": "km"
        },
        "NZD": {
            "rate": 117,
            "unit": "km"
        },
        "OMR": {
            "rate": 44.87,
            "unit": "km"
        },
        "PAB": {
            "rate": 116.68,
            "unit": "km"
        },
        "PEN": {
            "rate": 392.29,
            "unit": "km"
        },
        "PGK": {
            "rate": 501.36,
            "unit": "km"
        },
        "PHP": {
            "rate": 6917.8,
            "unit": "km"
        },
        "PKR": {
            "rate": 32652.84,
            "unit": "km"
        },
        "PLN": {
            "rate": 89,
            "unit": "km"
        },
        "PYG": {
            "rate": 787561.7,
            "unit": "km"
        },
        "QAR": {
            "rate": 424.92,
            "unit": "km"
        },
        "RON": {
            "rate": 508.07,
            "unit": "km"
        },
        "RSD": {
            "rate": 11713.4,
            "unit": "km"
        },
        "RUB": {
            "rate": 9392.54,
            "unit": "km"
        },
        "RWF": {
            "rate": 169805.16,
            "unit": "km"
        },
        "SAR": {
            "rate": 437.58,
            "unit": "km"
        },
        "SBD": {
            "rate": 948.61,
            "unit": "km"
        },
        "SCR": {
            "rate": 1615.27,
            "unit": "km"
        },
        "SDG": {
            "rate": 70123.16,
            "unit": "km"
        },
        "SEK": {
            "rate": 250,
            "unit": "km"
        },
        "SGD": {
            "rate": 149.43,
            "unit": "km"
        },
        "SHP": {
            "rate": 86.44,
            "unit": "km"
        },
        "SLL": {
            "rate": 2446668.74,
            "unit": "km"
        },
        "SLE": {
            "rate": 2800.26,
            "unit": "km"
        },
        "SOS": {
            "rate": 66591.46,
            "unit": "km"
        },
        "SRD": {
            "rate": 4468.75,
            "unit": "km"
        },
        "STD": {
            "rate": 2599784.99,
            "unit": "km"
        },
        "STN": {
            "rate": 2440.86,
            "unit": "km"
        },
        "SVC": {
            "rate": 1020.49,
            "unit": "km"
        },
        "SYP": {
            "rate": 1517040.54,
            "unit": "km"
        },
        "SZL": {
            "rate": 1910.2,
            "unit": "km"
        },
        "THB": {
            "rate": 3641.51,
            "unit": "km"
        },
        "TJS": {
            "rate": 1077.65,
            "unit": "km"
        },
        "TMT": {
            "rate": 408.37,
            "unit": "km"
        },
        "TND": {
            "rate": 336.58,
            "unit": "km"
        },
        "TOP": {
            "rate": 280.93,
            "unit": "km"
        },
        "TRY": {
            "rate": 5022.36,
            "unit": "km"
        },
        "TTD": {
            "rate": 791.64,
            "unit": "km"
        },
        "TWD": {
            "rate": 3676.16,
            "unit": "km"
        },
        "TZS": {
            "rate": 288716.35,
            "unit": "km"
        },
        "UAH": {
            "rate": 4966.74,
            "unit": "km"
        },
        "UGX": {
            "rate": 422422.35,
            "unit": "km"
        },
        "USD": {
            "rate": 72.5,
            "unit": "mi"
        },
        "UYU": {
            "rate": 4544.27,
            "unit": "km"
        },
        "UZS": {
            "rate": 1395513.79,
            "unit": "km"
        },
        "VEB": {
            "rate": 735113.61,
            "unit": "km"
        },
        "VEF": {
            "rate": 28992910.93,
            "unit": "km"
        },
        "VES": {
            "rate": 35909.77,
            "unit": "km"
        },
        "VND": {
            "rate": 3065619.41,
            "unit": "km"
        },
        "VUV": {
            "rate": 14152.58,
            "unit": "km"
        },
        "WST": {
            "rate": 322.95,
            "unit": "km"
        },
        "XAF": {
            "rate": 65490.66,
            "unit": "km"
        },
        "XCD": {
            "rate": 315.32,
            "unit": "km"
        },
        "XCG": {
            "rate": 210.2,
            "unit": "km"
        },
        "XOF": {
            "rate": 65490.66,
            "unit": "km"
        },
        "XPF": {
            "rate": 11913.98,
            "unit": "km"
        },
        "YER": {
            "rate": 27815.91,
            "unit": "km"
        },
        "ZAR": {
            "rate": 476,
            "unit": "km"
        },
        "ZMK": {
            "rate": 612915.63,
            "unit": "km"
        },
        "ZMW": {
            "rate": 2440.41,
            "unit": "km"
        },
        "ZWG": {
            "rate": 3023.59,
            "unit": "km"
        }
    }`) as Record<string, MileageRate>,

    EXIT_SURVEY: {
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
        BOOK_MEETING_LINK: 'https://calendly.com/d/cqsm-2gm-fxr/expensify-product-team',
    },

    SESSION_STORAGE_KEYS: {
        INITIAL_URL: 'INITIAL_URL',
        ACTIVE_WORKSPACE_ID: 'ACTIVE_WORKSPACE_ID',
        RETRY_LAZY_REFRESHED: 'RETRY_LAZY_REFRESHED',
        LAST_REFRESH_TIMESTAMP: 'LAST_REFRESH_TIMESTAMP',
        LAST_VISITED_PATH: {
            WORKSPACES_TAB: 'LAST_VISITED_PATH_WORKSPACES_TAB',
            SETTINGS_TAB: 'LAST_VISITED_PATH_SETTINGS_TAB',
        },
    },

    RESERVATION_TYPE: {
        CAR: 'car',
        HOTEL: 'hotel',
        FLIGHT: 'flight',
        TRAIN: 'train',
    },

    RESERVATION_ADDRESS_TEST_ID: 'ReservationAddress',

    FLIGHT_SEAT_TEST_ID: 'FlightSeat',

    CANCELLATION_POLICY: {
        UNKNOWN: 'UNKNOWN',
        NON_REFUNDABLE: 'NON_REFUNDABLE',
        FREE_CANCELLATION_UNTIL: 'FREE_CANCELLATION_UNTIL',
        PARTIALLY_REFUNDABLE: 'PARTIALLY_REFUNDABLE',
    },

    DOT_SEPARATOR: '•',
    BULLET: '●',

    DEFAULT_TAX: {
        defaultExternalID: 'id_TAX_EXEMPT',
        defaultValue: '0%',
        foreignTaxDefault: 'id_TAX_EXEMPT',
        name: 'Tax',
        taxes: {
            id_TAX_EXEMPT: {
                name: 'Tax exempt',
                value: '0%',
            },
            id_TAX_RATE_1: {
                name: 'Tax Rate 1',
                value: '5%',
            },
        },
    },

    MAX_TAX_RATE_INTEGER_PLACES: 4,
    MAX_TAX_RATE_DECIMAL_PLACES: 4,
    MIN_TAX_RATE_DECIMAL_PLACES: 2,
    DISTANCE_DECIMAL_PLACES: 2,
    HOURS_DECIMAL_PLACES: 2,

    DOWNLOADS_PATH: '/Downloads',
    DOWNLOADS_TIMEOUT: 5000,
    NEW_EXPENSIFY_PATH: '/New Expensify',
    RECEIPTS_UPLOAD_PATH: '/Receipts-Upload',

    ENVIRONMENT_SUFFIX: {
        DEV: ' Dev',
        ADHOC: ' AdHoc',
    },

    SEARCH: {
        RESULTS_PAGE_SIZE: 50,
        EXITING_ANIMATION_DURATION: 200,
        ME: 'me',
        DATA_TYPES: {
            EXPENSE: 'expense',
            EXPENSE_REPORT: 'expense-report',
            INVOICE: 'invoice',
            TASK: 'task',
            TRIP: 'trip',
            CHAT: 'chat',
        },
        ACTION_FILTERS: {
            SUBMIT: 'submit',
            APPROVE: 'approve',
            PAY: 'pay',
            EXPORT: 'export',
        },
        ACTION_TYPES: {
            VIEW: 'view',
            SUBMIT: 'submit',
            APPROVE: 'approve',
            PAY: 'pay',
            DONE: 'done',
            EXPORT_TO_ACCOUNTING: 'exportToAccounting',
            PAID: 'paid',
        },
        HAS_VALUES: {
            RECEIPT: 'receipt',
            ATTACHMENT: 'attachment',
            LINK: 'link',
            CATEGORY: 'category',
            TAG: 'tag',
        },
        BULK_ACTION_TYPES: {
            EXPORT: 'export',
            APPROVE: 'approve',
            PAY: 'pay',
            SUBMIT: 'submit',
            HOLD: 'hold',
            MERGE: 'merge',
            UNHOLD: 'unhold',
            DELETE: 'delete',
            REJECT: 'reject',
            CHANGE_REPORT: 'changeReport',
            SPLIT: 'split',
        },
        TRANSACTION_TYPE: {
            CASH: 'cash',
            CARD: 'card',
            DISTANCE: 'distance',
            PER_DIEM: 'perDiem',
            TIME: 'time',
        },
        WITHDRAWAL_TYPE: {
            EXPENSIFY_CARD: 'expensify-card',
            REIMBURSEMENT: 'reimbursement',
        },
        SETTLEMENT_STATUS: {
            PENDING: 'pending',
            CLEARED: 'cleared',
            FAILED: 'failed',
        },
        IS_VALUES: {
            READ: 'read',
            UNREAD: 'unread',
            PINNED: 'pinned',
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
        },
        get TYPE_CUSTOM_COLUMNS() {
            return {
                EXPENSE: {
                    RECEIPT: this.TABLE_COLUMNS.RECEIPT,
                    DATE: this.TABLE_COLUMNS.DATE,
                    SUBMITTED: this.TABLE_COLUMNS.SUBMITTED,
                    APPROVED: this.TABLE_COLUMNS.APPROVED,
                    POSTED: this.TABLE_COLUMNS.POSTED,
                    EXPORTED: this.TABLE_COLUMNS.EXPORTED,
                    MERCHANT: this.TABLE_COLUMNS.MERCHANT,
                    DESCRIPTION: this.TABLE_COLUMNS.DESCRIPTION,
                    FROM: this.TABLE_COLUMNS.FROM,
                    TO: this.TABLE_COLUMNS.TO,
                    POLICY_NAME: this.TABLE_COLUMNS.POLICY_NAME,
                    CARD: this.TABLE_COLUMNS.CARD,
                    CATEGORY: this.TABLE_COLUMNS.CATEGORY,
                    TAG: this.TABLE_COLUMNS.TAG,
                    EXCHANGE_RATE: this.TABLE_COLUMNS.EXCHANGE_RATE,
                    ORIGINAL_AMOUNT: this.TABLE_COLUMNS.ORIGINAL_AMOUNT,
                    REPORT_ID: this.TABLE_COLUMNS.REPORT_ID,
                    BASE_62_REPORT_ID: this.TABLE_COLUMNS.BASE_62_REPORT_ID,
                    REIMBURSABLE: this.TABLE_COLUMNS.REIMBURSABLE,
                    BILLABLE: this.TABLE_COLUMNS.BILLABLE,
                    TAX_RATE: this.TABLE_COLUMNS.TAX_RATE,
                    TAX_AMOUNT: this.TABLE_COLUMNS.TAX_AMOUNT,
                    STATUS: this.TABLE_COLUMNS.STATUS,
                    TITLE: this.TABLE_COLUMNS.TITLE,
                    AMOUNT: this.TABLE_COLUMNS.TOTAL_AMOUNT,
                    EXPORTED_TO: this.TABLE_COLUMNS.EXPORTED_TO,
                    ACTION: this.TABLE_COLUMNS.ACTION,
                },
                EXPENSE_REPORT: {
                    DATE: this.TABLE_COLUMNS.DATE,
                    SUBMITTED: this.TABLE_COLUMNS.SUBMITTED,
                    APPROVED: this.TABLE_COLUMNS.APPROVED,
                    EXPORTED: this.TABLE_COLUMNS.EXPORTED,
                    STATUS: this.TABLE_COLUMNS.STATUS,
                    TITLE: this.TABLE_COLUMNS.TITLE,
                    FROM: this.TABLE_COLUMNS.FROM,
                    TO: this.TABLE_COLUMNS.TO,
                    POLICY_NAME: this.TABLE_COLUMNS.POLICY_NAME,
                    REIMBURSABLE_TOTAL: this.TABLE_COLUMNS.REIMBURSABLE_TOTAL,
                    NON_REIMBURSABLE_TOTAL: this.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL,
                    REPORT_ID: this.TABLE_COLUMNS.REPORT_ID,
                    BASE_62_REPORT_ID: this.TABLE_COLUMNS.BASE_62_REPORT_ID,
                    AMOUNT: this.TABLE_COLUMNS.TOTAL,
                    EXPORTED_ICON: this.TABLE_COLUMNS.EXPORTED_TO,
                    ACTION: this.TABLE_COLUMNS.ACTION,
                },
                INVOICE: {},
                TASK: {},
                TRIP: {},
                CHAT: {},
            };
        },
        get GROUP_CUSTOM_COLUMNS() {
            return {
                FROM: {
                    FROM: this.TABLE_COLUMNS.GROUP_FROM,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                CARD: {
                    CARD: this.TABLE_COLUMNS.GROUP_CARD,
                    FEED: this.TABLE_COLUMNS.GROUP_FEED,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                WITHDRAWAL_ID: {
                    BANK_ACCOUNT: this.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
                    WITHDRAWN: this.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    WITHDRAWAL_ID: this.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                CATEGORY: {
                    CATEGORY: this.TABLE_COLUMNS.GROUP_CATEGORY,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
            };
        },
        get TYPE_DEFAULT_COLUMNS() {
            return {
                EXPENSE: [
                    this.TABLE_COLUMNS.RECEIPT,
                    this.TABLE_COLUMNS.DATE,
                    this.TABLE_COLUMNS.MERCHANT,
                    this.TABLE_COLUMNS.FROM,
                    this.TABLE_COLUMNS.TO,
                    this.TABLE_COLUMNS.CATEGORY,
                    this.TABLE_COLUMNS.TAG,
                    this.TABLE_COLUMNS.TOTAL_AMOUNT,
                    this.TABLE_COLUMNS.ACTION,
                ],
                EXPENSE_REPORT: [
                    this.TABLE_COLUMNS.DATE,
                    this.TABLE_COLUMNS.STATUS,
                    this.TABLE_COLUMNS.TITLE,
                    this.TABLE_COLUMNS.FROM,
                    this.TABLE_COLUMNS.TO,
                    this.TABLE_COLUMNS.TOTAL,
                    this.TABLE_COLUMNS.ACTION,
                ],
                INVOICE: [],
                TASK: [],
                TRIP: [],
                CHAT: [],
            };
        },
        get GROUP_DEFAULT_COLUMNS() {
            return {
                FROM: [this.TABLE_COLUMNS.GROUP_FROM, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                CARD: [this.TABLE_COLUMNS.GROUP_CARD, this.TABLE_COLUMNS.GROUP_FEED, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                WITHDRAWAL_ID: [
                    this.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
                    this.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    this.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
                    this.TABLE_COLUMNS.GROUP_EXPENSES,
                    this.TABLE_COLUMNS.GROUP_TOTAL,
                ],
                CATEGORY: [this.TABLE_COLUMNS.GROUP_CATEGORY, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
            };
        },
        BOOLEAN: {
            YES: 'yes',
            NO: 'no',
        },
        TABLE_COLUMN_SIZES: {
            NORMAL: 'normal',
            WIDE: 'wide',
        },
        STATUS: {
            EXPENSE: {
                ALL: '',
                UNREPORTED: 'unreported',
                DRAFTS: 'drafts',
                OUTSTANDING: 'outstanding',
                APPROVED: 'approved',
                DONE: 'done',
                PAID: 'paid',
            },
            EXPENSE_REPORT: {
                ALL: '',
                DRAFTS: 'drafts',
                OUTSTANDING: 'outstanding',
                APPROVED: 'approved',
                DONE: 'done',
                PAID: 'paid',
            },
            INVOICE: {
                ALL: '',
                OUTSTANDING: 'outstanding',
                PAID: 'paid',
            },
            TRIP: {
                ALL: '',
                CURRENT: 'current',
                PAST: 'past',
            },
            CHAT: {},
            TASK: {
                ALL: '',
                OUTSTANDING: 'outstanding',
                COMPLETED: 'completed',
            },
        },
        GROUP_COLUMN_PREFIX: 'group',
        TABLE_COLUMNS: {
            RECEIPT: 'receipt',
            DATE: 'date',
            SUBMITTED: 'submitted',
            APPROVED: 'approved',
            POSTED: 'posted',
            EXPORTED: 'exported',
            MERCHANT: 'merchant',
            DESCRIPTION: 'description',
            FROM: 'from',
            TO: 'to',
            CATEGORY: 'category',
            TAG: 'tag',
            ORIGINAL_AMOUNT: 'originalamount',
            REIMBURSABLE: 'reimbursable',
            BILLABLE: 'billable',
            TAX_RATE: 'taxrate',
            TOTAL_AMOUNT: 'amount',
            TOTAL: 'total',
            TYPE: 'type',
            ACTION: 'action',
            TAX_AMOUNT: 'taxAmount',
            TITLE: 'title',
            ASSIGNEE: 'assignee',
            IN: 'in',
            COMMENTS: 'comments',
            CARD: 'card',
            POLICY_NAME: 'policyname',
            WITHDRAWAL_ID: 'withdrawalID',
            AVATAR: 'avatar',
            STATUS: 'status',
            EXPENSES: 'expenses',
            FEED: 'feed',
            WITHDRAWN: 'withdrawn',
            BANK_ACCOUNT: 'bankAccount',
            REPORT_ID: 'reportID',
            BASE_62_REPORT_ID: 'base62ReportID',
            EXPORTED_TO: 'exportedto',
            EXCHANGE_RATE: 'exchangeRate',
            REIMBURSABLE_TOTAL: 'reimbursableTotal',
            NON_REIMBURSABLE_TOTAL: 'nonReimbursableTotal',
            GROUP_FROM: 'groupFrom',
            GROUP_EXPENSES: 'groupExpenses',
            GROUP_TOTAL: 'groupTotal',
            GROUP_CARD: 'groupCard',
            GROUP_FEED: 'groupFeed',
            GROUP_BANK_ACCOUNT: 'groupBankAccount',
            GROUP_WITHDRAWN: 'groupWithdrawn',
            GROUP_WITHDRAWAL_ID: 'groupWithdrawalID',
            GROUP_CATEGORY: 'groupCategory',
        },
        SYNTAX_OPERATORS: {
            AND: 'and',
            OR: 'or',
            EQUAL_TO: 'eq',
            NOT_EQUAL_TO: 'neq',
            GREATER_THAN: 'gt',
            GREATER_THAN_OR_EQUAL_TO: 'gte',
            LOWER_THAN: 'lt',
            LOWER_THAN_OR_EQUAL_TO: 'lte',
        },
        SYNTAX_ROOT_KEYS: {
            TYPE: 'type',
            STATUS: 'status',
            SORT_BY: 'sortBy',
            SORT_ORDER: 'sortOrder',
            GROUP_BY: 'groupBy',
            COLUMNS: 'columns',
            LIMIT: 'limit',
        },
        SYNTAX_FILTER_KEYS: {
            TYPE: 'type',
            STATUS: 'status',
            DATE: 'date',
            AMOUNT: 'amount',
            EXPENSE_TYPE: 'expenseType',
            CURRENCY: 'currency',
            GROUP_CURRENCY: 'groupCurrency',
            MERCHANT: 'merchant',
            DESCRIPTION: 'description',
            FROM: 'from',
            TO: 'to',
            PAYER: 'payer',
            EXPORTER: 'exporter',
            CATEGORY: 'category',
            TAG: 'tag',
            TAX_RATE: 'taxRate',
            CARD_ID: 'cardID',
            FEED: 'feed',
            REPORT_ID: 'reportID',
            KEYWORD: 'keyword',
            IN: 'in',
            SUBMITTED: 'submitted',
            APPROVED: 'approved',
            PAID: 'paid',
            EXPORTED: 'exported',
            POSTED: 'posted',
            WITHDRAWAL_TYPE: 'withdrawalType',
            WITHDRAWN: 'withdrawn',
            TOTAL: 'total',
            TITLE: 'title',
            ASSIGNEE: 'assignee',
            REIMBURSABLE: 'reimbursable',
            BILLABLE: 'billable',
            POLICY_ID: 'policyID',
            ACTION: 'action',
            HAS: 'has',
            PURCHASE_AMOUNT: 'purchaseAmount',
            PURCHASE_CURRENCY: 'purchaseCurrency',
            WITHDRAWAL_ID: 'withdrawalID',
            ATTENDEE: 'attendee',
            IS: 'is',
            REPORT_FIELD: 'reportField',
        },
        REPORT_FIELD: {
            // All report fields start with this, so use this to check if a search key is a report field
            GLOBAL_PREFIX: 'reportField',
            DEFAULT_PREFIX: 'reportField-',
            NOT_PREFIX: 'reportFieldNot-',
            ON_PREFIX: 'reportFieldOn-',
            AFTER_PREFIX: 'reportFieldAfter-',
            BEFORE_PREFIX: 'reportFieldBefore-',
        },
        TAG_EMPTY_VALUE: 'none',
        CATEGORY_EMPTY_VALUE: 'none',
        CATEGORY_DEFAULT_VALUE: 'Uncategorized',
        SEARCH_ROUTER_ITEM_TYPE: {
            CONTEXTUAL_SUGGESTION: 'contextualSuggestion',
            AUTOCOMPLETE_SUGGESTION: 'autocompleteSuggestion',
            SEARCH: 'searchItem',
        },
        SEARCH_USER_FRIENDLY_KEYS: {
            TYPE: 'type',
            STATUS: 'status',
            SORT_BY: 'sort-by',
            SORT_ORDER: 'sort-order',
            POLICY_ID: 'workspace',
            GROUP_BY: 'group-by',
            DATE: 'date',
            AMOUNT: 'amount',
            TOTAL: 'total',
            EXPENSE_TYPE: 'expense-type',
            CURRENCY: 'currency',
            GROUP_CURRENCY: 'group-currency',
            MERCHANT: 'merchant',
            DESCRIPTION: 'description',
            FROM: 'from',
            TO: 'to',
            PAYER: 'payer',
            EXPORTER: 'exporter',
            CATEGORY: 'category',
            TAG: 'tag',
            TAX_RATE: 'tax-rate',
            CARD_ID: 'card',
            FEED: 'feed',
            REPORT_ID: 'report-id',
            KEYWORD: 'keyword',
            IN: 'in',
            SUBMITTED: 'submitted',
            APPROVED: 'approved',
            PAID: 'paid',
            EXPORTED: 'exported',
            POSTED: 'posted',
            WITHDRAWAL_TYPE: 'withdrawal-type',
            WITHDRAWN: 'withdrawn',
            TITLE: 'title',
            ASSIGNEE: 'assignee',
            REIMBURSABLE: 'reimbursable',
            BILLABLE: 'billable',
            ACTION: 'action',
            HAS: 'has',
            PURCHASE_AMOUNT: 'purchase-amount',
            PURCHASE_CURRENCY: 'purchase-currency',
            WITHDRAWAL_ID: 'withdrawal-id',
            ATTENDEE: 'attendee',
            IS: 'is',
            REPORT_FIELD: 'report-field',
            COLUMNS: 'columns',
            LIMIT: 'limit',
        },
        get SEARCH_USER_FRIENDLY_VALUES_MAP() {
            return {
                [this.TRANSACTION_TYPE.PER_DIEM]: 'per-diem',
                [this.STATUS.EXPENSE.DRAFTS]: 'draft',
                [this.TABLE_COLUMNS.RECEIPT]: 'receipt',
                [this.TABLE_COLUMNS.DATE]: 'date',
                [this.TABLE_COLUMNS.SUBMITTED]: 'submitted',
                [this.TABLE_COLUMNS.APPROVED]: 'approved',
                [this.TABLE_COLUMNS.POSTED]: 'posted',
                [this.TABLE_COLUMNS.EXPORTED]: 'exported',
                [this.TABLE_COLUMNS.MERCHANT]: 'merchant',
                [this.TABLE_COLUMNS.DESCRIPTION]: 'description',
                [this.TABLE_COLUMNS.FROM]: 'from',
                [this.TABLE_COLUMNS.TO]: 'to',
                [this.TABLE_COLUMNS.CATEGORY]: 'category',
                [this.TABLE_COLUMNS.TAG]: 'tag',
                [this.TABLE_COLUMNS.ORIGINAL_AMOUNT]: 'original-amount',
                [this.TABLE_COLUMNS.REIMBURSABLE]: 'reimbursable',
                [this.TABLE_COLUMNS.BILLABLE]: 'billable',
                [this.TABLE_COLUMNS.TAX_RATE]: 'tax-rate',
                [this.TABLE_COLUMNS.TOTAL_AMOUNT]: 'amount',
                [this.TABLE_COLUMNS.TOTAL]: 'total',
                [this.TABLE_COLUMNS.TYPE]: 'type',
                [this.TABLE_COLUMNS.ACTION]: 'action',
                [this.TABLE_COLUMNS.TAX_AMOUNT]: 'tax',
                [this.TABLE_COLUMNS.TITLE]: 'title',
                [this.TABLE_COLUMNS.ASSIGNEE]: 'assignee',
                [this.TABLE_COLUMNS.IN]: 'in',
                [this.TABLE_COLUMNS.COMMENTS]: 'comments',
                [this.TABLE_COLUMNS.CARD]: 'card',
                [this.TABLE_COLUMNS.POLICY_NAME]: 'policy-name',
                [this.TABLE_COLUMNS.WITHDRAWAL_ID]: 'withdrawal-id',
                [this.TABLE_COLUMNS.AVATAR]: 'avatar',
                [this.TABLE_COLUMNS.STATUS]: 'status',
                [this.TABLE_COLUMNS.EXPENSES]: 'expenses',
                [this.TABLE_COLUMNS.FEED]: 'feed',
                [this.TABLE_COLUMNS.WITHDRAWN]: 'withdrawn',
                [this.TABLE_COLUMNS.BANK_ACCOUNT]: 'bank-account',
                [this.TABLE_COLUMNS.REPORT_ID]: 'long-report-id',
                [this.TABLE_COLUMNS.BASE_62_REPORT_ID]: 'report-id',
                [this.TABLE_COLUMNS.EXPORTED_TO]: 'exported-to',
                [this.TABLE_COLUMNS.EXCHANGE_RATE]: 'exchange-rate',
                [this.TABLE_COLUMNS.REIMBURSABLE_TOTAL]: 'reimbursable-total',
                [this.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL]: 'non-reimbursable-total',
                [this.TABLE_COLUMNS.GROUP_FROM]: 'group-from',
                [this.TABLE_COLUMNS.GROUP_EXPENSES]: 'group-expenses',
                [this.TABLE_COLUMNS.GROUP_TOTAL]: 'group-total',
                [this.TABLE_COLUMNS.GROUP_CARD]: 'group-card',
                [this.TABLE_COLUMNS.GROUP_FEED]: 'group-feed',
                [this.TABLE_COLUMNS.GROUP_BANK_ACCOUNT]: 'group-bank-account',
                [this.TABLE_COLUMNS.GROUP_WITHDRAWN]: 'group-withdrawn',
                [this.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID]: 'group-withdrawal-id',
                [this.TABLE_COLUMNS.GROUP_CATEGORY]: 'group-category',
            };
        },
        NOT_MODIFIER: 'Not',
        DATE_MODIFIERS: {
            ON: 'On',
            AFTER: 'After',
            BEFORE: 'Before',
        },
        AMOUNT_MODIFIERS: {
            LESS_THAN: 'LessThan',
            GREATER_THAN: 'GreaterThan',
            EQUAL_TO: 'EqualTo',
        },
        DATE_PRESETS: {
            NEVER: 'never',
            LAST_MONTH: 'last-month',
            THIS_MONTH: 'this-month',
            LAST_STATEMENT: 'last-statement',
        },
        SNAPSHOT_ONYX_KEYS: [
            ONYXKEYS.COLLECTION.REPORT,
            ONYXKEYS.COLLECTION.POLICY,
            ONYXKEYS.COLLECTION.TRANSACTION,
            ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
            ONYXKEYS.COLLECTION.REPORT_ACTIONS,
            ONYXKEYS.PERSONAL_DETAILS_LIST,
            ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
        ],
        SEARCH_KEYS: {
            EXPENSES: 'expenses',
            REPORTS: 'reports',
            CHATS: 'chats',
            SUBMIT: 'submit',
            APPROVE: 'approve',
            PAY: 'pay',
            EXPORT: 'export',
            STATEMENTS: 'statements',
            UNAPPROVED_CASH: 'unapprovedCash',
            UNAPPROVED_CARD: 'unapprovedCard',
            RECONCILIATION: 'reconciliation',
            TOP_SPENDERS: 'topSpenders',
            TOP_CATEGORIES: 'topCategories',
        },
        GROUP_PREFIX: 'group_',
        ANIMATION: {
            FADE_DURATION: 200,
        },
        TODO_BADGE_MAX_COUNT: 50,
        TOP_SEARCH_LIMIT: 10,
    },
    SEARCH_SELECTOR: {
        SELECTION_MODE_SINGLE: 'single',
        SELECTION_MODE_MULTI: 'multi',
        SEARCH_CONTEXT_GENERAL: 'general',
        SEARCH_CONTEXT_SEARCH: 'search',
        SEARCH_CONTEXT_MEMBER_INVITE: 'memberInvite',
        SEARCH_CONTEXT_SHARE_LOG: 'shareLog',
        SEARCH_CONTEXT_SHARE_DESTINATION: 'shareDestination',
        SEARCH_CONTEXT_ATTENDEES: 'attendees',
    },
    EXPENSE: {
        TYPE: {
            CASH_CARD_NAME: 'Cash Expense',
        },
    },

    REFERRER: {
        NOTIFICATION: 'notification',
    },

    SUBSCRIPTION_SIZE_LIMIT: 20000,

    PAGINATION_START_ID: '-1',
    PAGINATION_END_ID: '-2',

    PAYMENT_CARD_CURRENCY: {
        USD: 'USD',
        AUD: 'AUD',
        GBP: 'GBP',
        NZD: 'NZD',
        EUR: 'EUR',
    },
    SCA_AUTHENTICATION_COMPLETE: '3DS-authentication-complete',

    SUBSCRIPTION_PRICE_FACTOR: 2,
    FEEDBACK_SURVEY_OPTIONS: {
        TOO_LIMITED: {
            ID: 'tooLimited',
            TRANSLATION_KEY: 'feedbackSurvey.tooLimited',
        },
        TOO_EXPENSIVE: {
            ID: 'tooExpensive',
            TRANSLATION_KEY: 'feedbackSurvey.tooExpensive',
        },
        INADEQUATE_SUPPORT: {
            ID: 'inadequateSupport',
            TRANSLATION_KEY: 'feedbackSurvey.inadequateSupport',
        },
        BUSINESS_CLOSING: {
            ID: 'businessClosing',
            TRANSLATION_KEY: 'feedbackSurvey.businessClosing',
        },
    },

    MAX_LENGTH_256: 256,
    WORKSPACE_CARDS_LIST_LABEL_TYPE: {
        CURRENT_BALANCE: 'currentBalance',
        REMAINING_LIMIT: 'remainingLimit',
        CASH_BACK: 'earnedCashback',
    },

    EXCLUDE_FROM_LAST_VISITED_PATH: [SCREENS.NOT_FOUND, SCREENS.SAML_SIGN_IN, SCREENS.VALIDATE_LOGIN, SCREENS.MIGRATED_USER_WELCOME_MODAL.ROOT, SCREENS.MONEY_REQUEST.STEP_SCAN] as string[],

    CANCELLATION_TYPE: {
        MANUAL: 'manual',
        AUTOMATIC: 'automatic',
        NONE: 'none',
    },
    EMPTY_STATE_MEDIA: {
        ANIMATION: 'animation',
        ILLUSTRATION: 'illustration',
        VIDEO: 'video',
    },
    REPORT_FIELDS_FEATURE: {
        qbo: {
            classes: 'report-fields-qbo-classes',
            customers: 'report-fields-qbo-customers',
            locations: 'report-fields-qbo-locations',
        },
        xero: {
            mapping: 'report-fields-mapping',
        },
    },
    DEFAULT_REPORT_METADATA: {isLoadingInitialReportActions: true},
    UPGRADE_PATHS: {
        CATEGORIES: 'categories',
        REPORTS: 'reports',
        DISTANCE_RATES: 'distance-rates',
    },
    get UPGRADE_FEATURE_INTRO_MAPPING() {
        return {
            reportFields: {
                id: 'reportFields' as const,
                alias: 'report-fields',
                name: 'Report Fields',
                title: 'workspace.upgrade.reportFields.title' as const,
                description: 'workspace.upgrade.reportFields.description' as const,
                icon: 'Pencil',
            },
            policyPreventMemberChangingTitle: {
                id: 'policyPreventMemberChangingTitle' as const,
                alias: 'policy-prevent-member-changing-title',
                name: undefined,
                icon: undefined,
            },
            preventSelfApproval: {
                id: 'preventSelfApproval' as const,
                alias: 'prevent-self-approval',
                name: 'Advanced Approvals' as const,
                title: `workspace.upgrade.approvals.title` as const,
                description: `workspace.upgrade.approvals.description` as const,
                icon: 'AdvancedApprovalsSquare',
            },
            autoApproveCompliantReports: {
                id: 'autoApproveCompliantReports' as const,
                alias: 'auto-approve-compliant-reports',
                name: 'Advanced Approvals' as const,
                title: `workspace.upgrade.approvals.title` as const,
                description: `workspace.upgrade.approvals.description` as const,
                icon: 'AdvancedApprovalsSquare',
            },
            autoPayApprovedReports: {
                id: 'autoPayApprovedReports' as const,
                alias: 'auto-pay-approved-reports',
                name: 'Advanced Approvals' as const,
                title: `workspace.upgrade.approvals.title` as const,
                description: `workspace.upgrade.approvals.description` as const,
                icon: 'AdvancedApprovalsSquare',
            },
            categories: {
                id: 'categories' as const,
                alias: 'categories',
                name: 'Categories',
                title: 'workspace.upgrade.categories.title' as const,
                description: 'workspace.upgrade.categories.description' as const,
                icon: 'FolderOpen',
            },
            multiLevelTags: {
                id: 'multiLevelTags' as const,
                alias: 'multiLevelTags',
                name: 'Multi-level tags',
                title: 'workspace.upgrade.multiLevelTags.title' as const,
                description: 'workspace.upgrade.multiLevelTags.description' as const,
                icon: 'Tag',
            },

            [this.POLICY.CONNECTIONS.NAME.NETSUITE]: {
                id: this.POLICY.CONNECTIONS.NAME.NETSUITE,
                alias: 'netsuite',
                name: this.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.netsuite,
                title: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.NETSUITE}.title` as const,
                description: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.NETSUITE}.description` as const,
                icon: 'NetSuiteSquare',
            },
            [this.POLICY.CONNECTIONS.NAME.SAGE_INTACCT]: {
                id: this.POLICY.CONNECTIONS.NAME.SAGE_INTACCT,
                alias: 'sage-intacct',
                name: this.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.intacct,
                title: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}.title` as const,
                description: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.SAGE_INTACCT}.description` as const,
                icon: 'IntacctSquare',
            },
            [this.POLICY.CONNECTIONS.NAME.QBD]: {
                id: this.POLICY.CONNECTIONS.NAME.QBD,
                alias: 'qbd',
                name: this.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.quickbooksDesktop,
                title: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.QBD}.title` as const,
                description: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.QBD}.description` as const,
                icon: 'QBDSquare',
            },
            approvals: {
                id: 'approvals' as const,
                alias: 'approvals' as const,
                name: 'Advanced Approvals' as const,
                title: `workspace.upgrade.approvals.title` as const,
                description: `workspace.upgrade.approvals.description` as const,
                icon: 'AdvancedApprovalsSquare',
            },
            multiApprovalLevels: {
                id: 'multiApprovalLevels' as const,
                alias: 'multi-approval-levels' as const,
                name: 'Multiple approval levels' as const,
                title: `workspace.upgrade.multiApprovalLevels.title` as const,
                description: `workspace.upgrade.multiApprovalLevels.description` as const,
                icon: 'AdvancedApprovalsSquare',
            },
            glCodes: {
                id: 'glCodes' as const,
                alias: 'gl-codes',
                name: 'GL codes',
                title: 'workspace.upgrade.glCodes.title' as const,
                description: 'workspace.upgrade.glCodes.description' as const,
                icon: 'Tag',
            },
            glAndPayrollCodes: {
                id: 'glAndPayrollCodes' as const,
                alias: 'gl-and-payroll-codes',
                name: 'GL & Payroll codes',
                title: 'workspace.upgrade.glAndPayrollCodes.title' as const,
                description: 'workspace.upgrade.glAndPayrollCodes.description' as const,
                icon: 'FolderOpen',
            },
            taxCodes: {
                id: 'taxCodes' as const,
                alias: 'tax-codes',
                name: 'Tax codes',
                title: 'workspace.upgrade.taxCodes.title' as const,
                description: 'workspace.upgrade.taxCodes.description' as const,
                icon: 'Coins',
            },
            companyCards: {
                id: 'companyCards' as const,
                alias: 'company-cards',
                name: 'Company Cards',
                title: 'workspace.upgrade.companyCards.title' as const,
                description: 'workspace.upgrade.companyCards.description' as const,
                icon: 'CompanyCard',
            },
            rules: {
                id: 'rules' as const,
                alias: 'rules',
                name: 'Rules',
                title: 'workspace.upgrade.rules.title' as const,
                description: 'workspace.upgrade.rules.description' as const,
                icon: 'Rules',
            },
            perDiem: {
                id: 'perDiem' as const,
                alias: 'per-diem',
                name: 'Per diem',
                title: 'workspace.upgrade.perDiem.title' as const,
                description: 'workspace.upgrade.perDiem.description' as const,
                icon: 'PerDiem',
            },
            travel: {
                id: 'travel' as const,
                alias: 'travel',
                name: 'Travel',
                title: 'workspace.upgrade.travel.title' as const,
                description: 'workspace.upgrade.travel.description' as const,
                icon: 'Luggage',
            },
            distanceRates: {
                id: 'distanceRates' as const,
                alias: 'distance-rates',
                name: 'Distance Rates',
                title: 'workspace.upgrade.distanceRates.title' as const,
                description: 'workspace.upgrade.distanceRates.description' as const,
                icon: 'CarIce',
            },
            auditor: {
                id: 'auditor' as const,
                alias: 'auditor',
                name: 'Auditor',
                title: 'workspace.upgrade.auditor.title' as const,
                description: 'workspace.upgrade.auditor.description' as const,
                icon: 'BlueShield',
            },
            reports: {
                id: 'reports' as const,
                alias: 'reports',
                name: 'Reports',
                title: 'workspace.upgrade.reports.title' as const,
                description: 'workspace.upgrade.reports.description' as const,
                icon: 'ReportReceipt',
            },
        };
    },
    REPORT_FIELD_TYPES: {
        TEXT: 'text',
        DATE: 'date',
        LIST: 'dropdown',
        FORMULA: 'formula',
    },

    NAVIGATION_ACTIONS: {
        RESET: 'RESET',
    },

    APPROVAL_WORKFLOW: {
        ACTION: {
            CREATE: 'create',
            EDIT: 'edit',
        },
        TYPE: {
            CREATE: 'create',
            UPDATE: 'update',
            REMOVE: 'remove',
        },
    },

    BOOT_SPLASH_STATE: {
        VISIBLE: 'visible',
        READY_TO_BE_HIDDEN: 'readyToBeHidden',
        HIDDEN: `hidden`,
    },

    CSV_IMPORT_COLUMNS: {
        EMAIL: 'email',
        NAME: 'name',
        GL_CODE: 'glCode',
        SUBMIT_TO: 'submitTo',
        APPROVE_TO: 'approveTo',
        CUSTOM_FIELD_1: 'customField1',
        CUSTOM_FIELD_2: 'customField2',
        ROLE: 'role',
        REPORT_THRESHHOLD: 'reportThreshold',
        APPROVE_TO_ALTERNATE: 'approveToAlternate',
        SUBRATE: 'subRate',
        AMOUNT: 'amount',
        CURRENCY: 'currency',
        RATE_ID: 'rateID',
        ENABLED: 'enabled',
        IGNORE: 'ignore',
        DESTINATION: 'destination',
    },

    IMPORT_SPREADSHEET: {
        ICON_WIDTH: 180,
        ICON_HEIGHT: 160,

        CATEGORIES_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-categories#import-custom-categories',
        MEMBERS_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Invite-members-and-assign-roles#import-a-group-of-members',
        TAGS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags',
        MULTI_LEVEL_TAGS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags#import-multi-level-tags-from-a-spreadsheet',
    },

    // The timeout duration (1 minute) (in milliseconds) before the window reloads due to an error.
    ERROR_WINDOW_RELOAD_TIMEOUT: 60000,

    INDICATOR_STATUS: {
        HAS_USER_WALLET_ERRORS: 'hasUserWalletErrors',
        HAS_PAYMENT_METHOD_ERROR: 'hasPaymentMethodError',
        HAS_POLICY_ERRORS: 'hasPolicyError',
        HAS_CUSTOM_UNITS_ERROR: 'hasCustomUnitsError',
        HAS_EMPLOYEE_LIST_ERROR: 'hasEmployeeListError',
        HAS_QBO_EXPORT_ERROR: 'hasQBOExportError',
        HAS_SYNC_ERRORS: 'hasSyncError',
        HAS_SUBSCRIPTION_ERRORS: 'hasSubscriptionError',
        HAS_REIMBURSEMENT_ACCOUNT_ERRORS: 'hasReimbursementAccountErrors',
        HAS_LOGIN_LIST_ERROR: 'hasLoginListError',
        HAS_WALLET_TERMS_ERRORS: 'hasWalletTermsErrors',
        HAS_LOGIN_LIST_INFO: 'hasLoginListInfo',
        HAS_SUBSCRIPTION_INFO: 'hasSubscriptionInfo',
        HAS_PHONE_NUMBER_ERROR: 'hasPhoneNumberError',
        HAS_PENDING_CARD_INFO: 'hasPendingCardInfo',
        HAS_UBER_CREDENTIALS_ERROR: 'hasUberCredentialsError',
        HAS_PARTIALLY_SETUP_BANK_ACCOUNT_INFO: 'hasPartiallySetupBankAccountInfo',
        HAS_EMPLOYEE_CARD_FEED_ERRORS: 'hasEmployeeCardFeedErrors',
        HAS_POLICY_ADMIN_CARD_FEED_ERRORS: 'hasPolicyAdminCardFeedErrors',
    },

    DEBUG: {
        FORMS: {
            REPORT: 'report',
            REPORT_ACTION: 'reportAction',
            TRANSACTION: 'transaction',
            TRANSACTION_VIOLATION: 'transactionViolation',
        },
        DETAILS: 'details',
        JSON: 'json',
        REPORT_ACTIONS: 'actions',
        REPORT_ACTION_PREVIEW: 'preview',
        TRANSACTION_VIOLATIONS: 'violations',
    },

    REPORT_IN_LHN_REASONS: {
        HAS_DRAFT_COMMENT: 'hasDraftComment',
        HAS_GBR: 'hasGBR',
        PINNED_BY_USER: 'pinnedByUser',
        HAS_IOU_VIOLATIONS: 'hasIOUViolations',
        HAS_ADD_WORKSPACE_ROOM_ERRORS: 'hasAddWorkspaceRoomErrors',
        IS_UNREAD: 'isUnread',
        IS_ARCHIVED: 'isArchived',
        IS_SELF_DM: 'isSelfDM',
        IS_FOCUSED: 'isFocused',
        DEFAULT: 'default',
    },

    REQUIRES_ATTENTION_REASONS: {
        HAS_JOIN_REQUEST: 'hasJoinRequest',
        IS_UNREAD_WITH_MENTION: 'isUnreadWithMention',
        IS_WAITING_FOR_ASSIGNEE_TO_COMPLETE_ACTION: 'isWaitingForAssigneeToCompleteAction',
        HAS_CHILD_REPORT_AWAITING_ACTION: 'hasChildReportAwaitingAction',
        HAS_MISSING_INVOICE_BANK_ACCOUNT: 'hasMissingInvoiceBankAccount',
        HAS_UNRESOLVED_CARD_FRAUD_ALERT: 'hasUnresolvedCardFraudAlert',
    },

    CARD_FRAUD_ALERT_RESOLUTION: {
        RECOGNIZED: 'recognized',
        FRAUD: 'fraud',
    },

    RBR_REASONS: {
        HAS_ERRORS: 'hasErrors',
        HAS_VIOLATIONS: 'hasViolations',
        HAS_TRANSACTION_THREAD_VIOLATIONS: 'hasTransactionThreadViolations',
    },

    ANALYTICS: {
        EVENT: {
            SIGN_UP: 'sign_up',
            WORKSPACE_CREATED: 'workspace_created',
            PAID_ADOPTION: 'paid_adoption',
        },
    },

    CORPAY_FIELDS: {
        EXCLUDED_COUNTRIES: ['IR', 'CU', 'SY', 'UA', 'KP', 'RU'] as string[],
        EXCLUDED_CURRENCIES: ['IRR', 'CUP', 'SYP', 'UAH', 'KPW', 'RUB'] as string[],
        BANK_ACCOUNT_DETAILS_FIELDS: ['accountNumber', 'localAccountNumber', 'routingCode', 'localRoutingCode', 'swiftBicCode'] as string[],
        ACCOUNT_TYPE_KEY: 'BeneficiaryAccountType',
        ACCOUNT_HOLDER_COUNTRY_KEY: 'accountHolderCountry',
        BANK_INFORMATION_FIELDS: ['bankName', 'bankAddressLine1', 'bankAddressLine2', 'bankCity', 'bankRegion', 'bankPostal', 'BeneficiaryBankBranchName'] as string[],
        ACCOUNT_HOLDER_FIELDS: [
            'accountHolderName',
            'accountHolderAddress1',
            'accountHolderAddress2',
            'accountHolderCity',
            'accountHolderRegion',
            'accountHolderCountry',
            'accountHolderPostal',
            'accountHolderPhoneNumber',
            'accountHolderEmail',
            'ContactName',
            'BeneficiaryCPF',
            'BeneficiaryRUT',
            'BeneficiaryCedulaID',
            'BeneficiaryTaxID',
        ] as string[],
        SPECIAL_LIST_REGION_KEYS: ['bankRegion', 'accountHolderRegion'] as string[],
        SPECIAL_LIST_ADDRESS_KEYS: ['bankAddressLine1', 'accountHolderAddress1'] as string[],
        STEPS_NAME: {
            COUNTRY_SELECTOR: 'CountrySelector',
            BANK_ACCOUNT_DETAILS: 'BankAccountDetails',
            ACCOUNT_TYPE: 'AccountType',
            BANK_INFORMATION: 'BankInformation',
            ACCOUNT_HOLDER_INFORMATION: 'AccountHolderInformation',
            CONFIRMATION: 'Confirmation',
            SUCCESS: 'Success',
        },
        INDEXES: {
            MAPPING: {
                COUNTRY_SELECTOR: 0,
                BANK_ACCOUNT_DETAILS: 1,
                ACCOUNT_TYPE: 2,
                BANK_INFORMATION: 3,
                ACCOUNT_HOLDER_INFORMATION: 4,
                CONFIRMATION: 5,
                SUCCESS: 6,
            },
        },
    },

    MIGRATED_USER_WELCOME_MODAL: 'migratedUserWelcomeModal',

    BASE_LIST_ITEM_TEST_ID: 'base-list-item-',
    PRODUCT_TRAINING_TOOLTIP_NAMES: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        CONCIERGE_LHN_GBR: 'conciergeLHNGBR',
        RENAME_SAVED_SEARCH: 'renameSavedSearch',
        SCAN_TEST_TOOLTIP: 'scanTestTooltip',
        SCAN_TEST_TOOLTIP_MANAGER: 'scanTestTooltipManager',
        SCAN_TEST_CONFIRMATION: 'scanTestConfirmation',
        OUTSTANDING_FILTER: 'outstandingFilter',
        ACCOUNT_SWITCHER: 'accountSwitcher',
        SCAN_TEST_DRIVE_CONFIRMATION: 'scanTestDriveConfirmation',
        MULTI_SCAN_EDUCATIONAL_MODAL: 'multiScanEducationalModal',
        GPS_TOOLTIP: 'gpsTooltip',
    },
    CHANGE_POLICY_TRAINING_MODAL: 'changePolicyModal',
    SMART_BANNER_HEIGHT: 152,

    NAVIGATION_TESTS: {
        DEFAULT_PARENT_ROUTE: {key: 'parentRouteKey', name: 'ParentNavigator'},
        DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE: {
            shouldUseNarrowLayout: true,
            isSmallScreenWidth: true,
            isInNarrowPaneModal: false,
            isExtraSmallScreenHeight: false,
            isMediumScreenWidth: false,
            isLargeScreenWidth: false,
            isExtraSmallScreenWidth: false,
            isSmallScreen: false,
            onboardingIsMediumOrLargerScreenWidth: false,
        } as ResponsiveLayoutResult,
    },

    TRAVEL: {
        DEFAULT_DOMAIN: 'domain',
        STEPS: {
            GET_STARTED_TRAVEL: 'GetStartedTravel',
            BOOK_OR_MANAGE_YOUR_TRIP: 'BookOrManageYourTrip',
            REVIEWING_REQUEST: 'ReviewingRequest',
        },
        PROVISIONING: {
            ERROR_PERMISSION_DENIED: 'permissionDenied',
            ERROR_ADDITIONAL_VERIFICATION_REQUIRED: 'additionalVerificationRequired',
        },
        UPDATE_OPERATION_TYPE: {
            BOOKING_TICKETED: 'BOOKING_TICKETED',
            TICKET_VOIDED: 'TICKET_VOIDED',
            TICKET_REFUNDED: 'TICKET_REFUNDED',
            FLIGHT_CANCELLED: 'FLIGHT_CANCELLED',
            FLIGHT_SCHEDULE_CHANGE_PENDING: 'FLIGHT_SCHEDULE_CHANGE_PENDING',
            FLIGHT_SCHEDULE_CHANGE_CLOSED: 'FLIGHT_SCHEDULE_CHANGE_CLOSED',
            FLIGHT_CHANGED: 'FLIGHT_CHANGED',
            FLIGHT_CABIN_CHANGED: 'FLIGHT_CABIN_CHANGED',
            FLIGHT_SEAT_CONFIRMED: 'FLIGHT_SEAT_CONFIRMED',
            FLIGHT_SEAT_CHANGED: 'FLIGHT_SEAT_CHANGED',
            FLIGHT_SEAT_CANCELLED: 'FLIGHT_SEAT_CANCELLED',
            PAYMENT_DECLINED: 'PAYMENT_DECLINED',
            BOOKING_CANCELED_BY_TRAVELER: 'BOOKING_CANCELED_BY_TRAVELER',
            BOOKING_CANCELED_BY_VENDOR: 'BOOKING_CANCELED_BY_VENDOR',
            BOOKING_REBOOKED: 'BOOKING_REBOOKED',
            BOOKING_UPDATED: 'BOOKING_UPDATED',
            TRIP_UPDATED: 'TRIP_UPDATED',
            BOOKING_OTHER_UPDATE: 'BOOKING_OTHER_UPDATE',
            REFUND: 'REFUND',
            EXCHANGE: 'EXCHANGE',
        },
        /**
         * The Travel Invoicing feed type constant.
         * This feed is used for Travel Invoicing cards which are separate from regular Expensify Cards.
         */
        PROGRAM_TRAVEL_US: 'TRAVEL_US',
    },
    LAST_PAYMENT_METHOD: {
        LAST_USED: 'lastUsed',
        IOU: 'iou',
        EXPENSE: 'expense',
        INVOICE: 'invoice',
    },
    SKIPPABLE_COLLECTION_MEMBER_IDS: [String(DEFAULT_NUMBER_ID), '-1', 'undefined', 'null', 'NaN'] as string[],
    SETUP_SPECIALIST_LOGIN: 'Setup Specialist',

    CALENDAR_PICKER_DAY_HEIGHT: 45,
    MAX_CALENDAR_PICKER_ROWS: 6,

    ILLUSTRATION_ASPECT_RATIO: 39 / 22,

    OFFLINE_INDICATOR_HEIGHT: 25,

    BILLING: {
        TYPE_FAILED_2018: 'failed_2018',
        TYPE_STRIPE_FAILED_AUTHENTICATION: 'failed_stripe_authentication',
    },

    ONBOARDING_HELP: {
        SCHEDULE_CALL: 'scheduleCall',
        EVENT_TIME: 'eventTime',
        RESCHEDULE: 'reschedule',
        CANCEL: 'cancel',
        REGISTER_FOR_WEBINAR: 'registerForWebinar',
    },

    SCHEDULE_CALL_STATUS: {
        CREATED: 'created',
        RESCHEDULED: 'rescheduled',
        CANCELLED: 'cancelled',
    },

    SIGNIN_ROUTE: '/signin',

    ONBOARDING_TASK_TYPE: {
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
    },

    MODAL_EVENTS: {
        CLOSED: 'modalClosed',
    },

    LIST_BEHAVIOR: {
        REGULAR: 'regular',
        INVERTED: 'inverted',
    },

    VIOLATION_DISMISSAL: {
        rter: {
            manual: 'marked this receipt as cash',
        },
        duplicatedTransaction: {
            manual: 'resolved the duplicate',
        },
    },

    SENTRY_LABEL: {
        NAVIGATION_TAB_BAR: {
            EXPENSIFY_LOGO: 'NavigationTabBar-ExpensifyLogo',
            INBOX: 'NavigationTabBar-Inbox',
            REPORTS: 'NavigationTabBar-Reports',
            WORKSPACES: 'NavigationTabBar-Workspaces',
            ACCOUNT: 'NavigationTabBar-Account',
            FLOATING_ACTION_BUTTON: 'NavigationTabBar-FloatingActionButton',
            FLOATING_RECEIPT_BUTTON: 'NavigationTabBar-FloatingReceiptButton',
        },
        FAB_MENU: {
            CREATE_EXPENSE: 'FABMenu-CreateExpense',
            TRACK_DISTANCE: 'FABMenu-TrackDistance',
            CREATE_REPORT: 'FABMenu-CreateReport',
            START_CHAT: 'FABMenu-StartChat',
            SEND_INVOICE: 'FABMenu-SendInvoice',
            BOOK_TRAVEL: 'FABMenu-BookTravel',
            TEST_DRIVE: 'FABMenu-TestDrive',
            NEW_WORKSPACE: 'FABMenu-NewWorkspace',
            QUICK_ACTION: 'FABMenu-QuickAction',
        },
        ATTACHMENT_CAROUSEL: {
            PREVIOUS_BUTTON: 'AttachmentCarousel-PreviousButton',
            NEXT_BUTTON: 'AttachmentCarousel-NextButton',
            ITEM: 'AttachmentCarousel-Item',
            MODERATION_BUTTON: 'AttachmentCarousel-ModerationButton',
            RETRY_BUTTON: 'AttachmentView-RetryButton',
        },
        ATTACHMENT_MODAL: {
            SEND_BUTTON: 'AttachmentModal-SendButton',
            IMAGE_ZOOM: 'AttachmentModal-ImageZoom',
        },
        HEADER: {
            BACK_BUTTON: 'Header-BackButton',
            DOWNLOAD_BUTTON: 'Header-DownloadButton',
            CLOSE_BUTTON: 'Header-CloseButton',
            MORE_BUTTON: 'Header-MoreButton',
        },
        VIDEO_PLAYER: {
            PLAY_PAUSE_BUTTON: 'VideoPlayer-PlayPauseButton',
            FULLSCREEN_BUTTON: 'VideoPlayer-FullscreenButton',
            MORE_BUTTON: 'VideoPlayer-MoreButton',
            EXPAND_BUTTON: 'VideoPlayer-ExpandButton',
            THUMBNAIL: 'VideoPlayer-Thumbnail',
            MUTE_BUTTON: 'VideoPlayer-MuteButton',
            VIDEO: 'VideoPlayer-Video',
        },
        HTML_RENDERER: {
            IMAGE: 'HTMLRenderer-Image',
        },
        RECEIPT: {
            IMAGE: 'Receipt-Image',
        },
        RECEIPT_MODAL: {
            REPLACE_RECEIPT: 'ReceiptModal-ReplaceReceipt',
            DOWNLOAD_RECEIPT: 'ReceiptModal-DownloadReceipt',
            DELETE_RECEIPT: 'ReceiptModal-DeleteReceipt',
        },
        HEADER_VIEW: {
            BACK_BUTTON: 'HeaderView-BackButton',
            DETAILS_BUTTON: 'HeaderView-DetailsButton',
        },
        SEARCH: {
            SEARCH_BUTTON: 'Search-SearchButton',
        },
        REPORT: {
            FLOATING_MESSAGE_COUNTER: 'Report-FloatingMessageCounter',
            LIST_BOUNDARY_LOADER_RETRY: 'Report-ListBoundaryLoaderRetry',
            SEND_BUTTON: 'Report-SendButton',
            ATTACHMENT_PICKER_CREATE_BUTTON: 'Report-AttachmentPickerCreateButton',
            ATTACHMENT_PICKER_EXPAND_BUTTON: 'Report-AttachmentPickerExpandButton',
            ATTACHMENT_PICKER_COLLAPSE_BUTTON: 'Report-AttachmentPickerCollapseButton',
            ATTACHMENT_PICKER_MENU_CREATE_EXPENSE: 'Report-AttachmentPickerMenuCreateExpense',
            ATTACHMENT_PICKER_MENU_TRACK_DISTANCE: 'Report-AttachmentPickerMenuTrackDistance',
            ATTACHMENT_PICKER_MENU_SPLIT_EXPENSE: 'Report-AttachmentPickerMenuSplitExpense',
            ATTACHMENT_PICKER_MENU_PAY_SOMEONE: 'Report-AttachmentPickerMenuPaySomeone',
            ATTACHMENT_PICKER_MENU_SEND_INVOICE: 'Report-AttachmentPickerMenuSendInvoice',
            ATTACHMENT_PICKER_MENU_CREATE_REPORT: 'Report-AttachmentPickerMenuCreateReport',
            ATTACHMENT_PICKER_MENU_ASSIGN_TASK: 'Report-AttachmentPickerMenuAssignTask',
            ATTACHMENT_PICKER_MENU_ADD_ATTACHMENT: 'Report-AttachmentPickerMenuAddAttachment',
            REPORT_ACTION_ITEM_CREATED: 'Report-ReportActionItemCreated',
            REPORT_ACTION_ITEM_MESSAGE_ENTER_SIGNER_INFO: 'Report-ReportActionItemMessageEnterSignerInfo',
            REPORT_ACTION_ITEM_MESSAGE_ADD_BANK_ACCOUNT: 'Report-ReportActionItemMessageAddBankAccount',
            REPORT_ACTION_ITEM_MESSAGE_EDIT_CANCEL_BUTTON: 'Report-ReportActionItemMessageEditCancelButton',
            REPORT_ACTION_ITEM_MESSAGE_EDIT_SAVE_BUTTON: 'Report-ReportActionItemMessageEditSaveButton',
            REPORT_ACTION_ITEM_SINGLE_AVATAR_BUTTON: 'Report-ReportActionItemSingleAvatarButton',
            REPORT_ACTION_ITEM_SINGLE_ACTOR_BUTTON: 'Report-ReportActionItemSingleActorButton',
            REPORT_ACTION_ITEM_THREAD: 'Report-ReportActionItemThread',
            THREAD_DIVIDER: 'Report-ThreadDivider',
            PURE_REPORT_ACTION_ITEM: 'Report-PureReportActionItem',
            MODERATION_BUTTON: 'Report-ModerationButton',
        },
        SIDEBAR: {
            SIGN_IN_BUTTON: 'Sidebar-SignInButton',
        },
        LHN: {
            OPTION_ROW: 'LHN-OptionRow',
        },
        CONTEXT_MENU: {
            REPLY_IN_THREAD: 'ContextMenu-ReplyInThread',
            MARK_AS_UNREAD: 'ContextMenu-MarkAsUnread',
            MARK_AS_READ: 'ContextMenu-MarkAsRead',
            EDIT_COMMENT: 'ContextMenu-EditComment',
            UNHOLD: 'ContextMenu-Unhold',
            HOLD: 'ContextMenu-Hold',
            JOIN_THREAD: 'ContextMenu-JoinThread',
            LEAVE_THREAD: 'ContextMenu-LeaveThread',
            COPY_URL: 'ContextMenu-CopyUrl',
            COPY_TO_CLIPBOARD: 'ContextMenu-CopyToClipboard',
            COPY_EMAIL: 'ContextMenu-CopyEmail',
            COPY_MESSAGE: 'ContextMenu-CopyMessage',
            COPY_LINK: 'ContextMenu-CopyLink',
            PIN: 'ContextMenu-Pin',
            UNPIN: 'ContextMenu-Unpin',
            FLAG_AS_OFFENSIVE: 'ContextMenu-FlagAsOffensive',
            DOWNLOAD: 'ContextMenu-Download',
            COPY_ONYX_DATA: 'ContextMenu-CopyOnyxData',
            DEBUG: 'ContextMenu-Debug',
            DELETE: 'ContextMenu-Delete',
            MENU: 'ContextMenu-Menu',
        },
        MORE_MENU: {
            MORE_BUTTON: 'MoreMenu-MoreButton',
            VIEW_DETAILS: 'MoreMenu-ViewDetails',
            EXPORT: 'MoreMenu-Export',
            EXPORT_FILE: 'MoreMenu-ExportFile',
            DOWNLOAD_PDF: 'MoreMenu-DownloadPDF',
            SUBMIT: 'MoreMenu-Submit',
            APPROVE: 'MoreMenu-Approve',
            UNAPPROVE: 'MoreMenu-Unapprove',
            CANCEL_PAYMENT: 'MoreMenu-CancelPayment',
            HOLD: 'MoreMenu-Hold',
            REMOVE_HOLD: 'MoreMenu-RemoveHold',
            SPLIT: 'MoreMenu-Split',
            MERGE: 'MoreMenu-Merge',
            CHANGE_WORKSPACE: 'MoreMenu-ChangeWorkspace',
            CHANGE_APPROVER: 'MoreMenu-ChangeApprover',
            REPORT_LAYOUT: 'MoreMenu-ReportLayout',
            DELETE: 'MoreMenu-Delete',
            RETRACT: 'MoreMenu-Retract',
            REOPEN: 'MoreMenu-Reopen',
            REJECT: 'MoreMenu-Reject',
            ADD_EXPENSE: 'MoreMenu-AddExpense',
            ADD_EXPENSE_CREATE: 'MoreMenu-AddExpenseCreate',
            ADD_EXPENSE_TRACK_DISTANCE: 'MoreMenu-AddExpenseTrackDistance',
            ADD_EXPENSE_UNREPORTED: 'MoreMenu-AddExpenseUnreported',
            PAY: 'MoreMenu-Pay',
        },
        REPORT_PREVIEW: {
            CARD: 'ReportPreview-Card',
            CAROUSEL_PREVIOUS: 'ReportPreview-CarouselPrevious',
            CAROUSEL_NEXT: 'ReportPreview-CarouselNext',
            SUBMIT_BUTTON: 'ReportPreview-SubmitButton',
            APPROVE_BUTTON: 'ReportPreview-ApproveButton',
            PAY_BUTTON: 'ReportPreview-PayButton',
            EXPORT_BUTTON: 'ReportPreview-ExportButton',
            VIEW_BUTTON: 'ReportPreview-ViewButton',
            ADD_EXPENSE_BUTTON: 'ReportPreview-AddExpenseButton',
        },
        TRANSACTION_PREVIEW: {
            CARD: 'TransactionPreview-Card',
        },
        EMOJI_PICKER: {
            BUTTON: 'EmojiPicker-Button',
            BUTTON_DROPDOWN: 'EmojiPicker-ButtonDropdown',
            MENU_ITEM: 'EmojiPicker-MenuItem',
            SKIN_TONE_TOGGLE: 'EmojiPicker-SkinToneToggle',
            SKIN_TONE_ITEM: 'EmojiPicker-SkinToneItem',
            CATEGORY_SHORTCUT: 'EmojiPicker-CategoryShortcut',
            SEARCH_INPUT: 'EmojiPicker-SearchInput',
        },
        EMOJI_REACTIONS: {
            REACTION_BUBBLE: 'EmojiReactions-ReactionBubble',
            ADD_REACTION_BUBBLE: 'EmojiReactions-AddReactionBubble',
        },
        MINI_CONTEXT_MENU: {
            QUICK_REACTION: 'MiniContextMenu-QuickReaction',
            EMOJI_PICKER_BUTTON: 'MiniContextMenu-EmojiPickerButton',
        },
        TASK: {
            PREVIEW_CARD: 'Task-PreviewCard',
            PREVIEW_CHECKBOX: 'Task-PreviewCheckbox',
            VIEW_TITLE: 'Task-ViewTitle',
            VIEW_CHECKBOX: 'Task-ViewCheckbox',
            VIEW_DESCRIPTION: 'Task-ViewDescription',
            VIEW_ASSIGNEE: 'Task-ViewAssignee',
            HEADER_ACTION_BUTTON: 'Task-HeaderActionButton',
        },
    },

    DOMAIN: {
        /** Onyx prefix for domain admin account IDs */
        EXPENSIFY_ADMIN_ACCESS_PREFIX: 'expensify_adminPermissions_',
        /** Onyx prefix for domain security groups */
        DOMAIN_SECURITY_GROUP_PREFIX: 'domain_securityGroup_',
    },

    SECTION_LIST_ITEM_TYPE: {
        HEADER: 'header',
        ROW: 'row',
    },
} as const;

const CONTINUATION_DETECTION_SEARCH_FILTER_KEYS = [
    CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE,
] as SearchFilterKey[];

const TASK_TO_FEATURE: Record<string, string> = {
    [CONST.ONBOARDING_TASK_TYPE.SETUP_CATEGORIES]: CONST.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED,
    [CONST.ONBOARDING_TASK_TYPE.ADD_ACCOUNTING_INTEGRATION]: CONST.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED,
    [CONST.ONBOARDING_TASK_TYPE.CONNECT_CORPORATE_CARD]: CONST.POLICY.MORE_FEATURES.ARE_COMPANY_CARDS_ENABLED,
    [CONST.ONBOARDING_TASK_TYPE.SETUP_TAGS]: CONST.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED,
};

const FRAUD_PROTECTION_EVENT = {
    START_SUPPORT_SESSION: 'StartSupportSession',
    STOP_SUPPORT_SESSION: 'StopSupportSession',
    START_COPILOT_SESSION: 'StartCopilotSession',
    STOP_COPILOT_SESSION: 'StopCopilotSession',
    ISSUE_EXPENSIFY_CARD: 'IssueExpensifyCard',
    EDIT_EXPENSIFY_CARD_LIMIT: 'EditExpensifyCardLimit',
    ISSUE_ADMIN_ISSUED_VIRTUAL_CARD: 'IssueAdminIssuedVirtualCard',
    EDIT_LIMIT_ADMIN_ISSUE_VIRTUAL_CARD: 'EditLimitAdminIssueVirtualCard',
    REQUEST_NEW_PHYSICAL_EXPENSIFY_CARD: 'RequestNewPhysicalExpensifyCard',
    REQUEST_NEW_VIRTUAL_EXPENSIFY_CARD: 'RequestNewVirtualExpensifyCard',
    MERGE_ACCOUNT: 'MergeAccount',
    TOGGLE_TWO_FACTOR_AUTH: 'ToggleTwoFactorAuth',
    ADD_SECONDARY_LOGIN: 'AddSecondaryLogin',
    ADD_BILLING_CARD: 'AddBillingCard',
    VIEW_VIRTUAL_CARD_PAN: 'ViewVirtualCardPAN',
    BUSINESS_BANK_ACCOUNT_SETUP: 'BusinessBankAccountSetup',
    PERSONAL_BANK_ACCOUNT_SETUP: 'PersonalBankAccountSetup',
    NEW_EMAILS_INVITED: 'NewEmailsInvited',
};

const COUNTRIES_US_BANK_FLOW: string[] = [CONST.COUNTRY.US, CONST.COUNTRY.PR, CONST.COUNTRY.GU, CONST.COUNTRY.VI];

type Country = keyof typeof CONST.ALL_COUNTRIES;

type IOUType = ValueOf<typeof CONST.IOU.TYPE>;
type IOUAction = ValueOf<typeof CONST.IOU.ACTION>;
type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;
type FeedbackSurveyOptionID = ValueOf<Pick<ValueOf<typeof CONST.FEEDBACK_SURVEY_OPTIONS>, 'ID'>>;
type IOUActionParams = ValueOf<typeof CONST.IOU.ACTION_PARAMS>;

type SubscriptionType = ValueOf<typeof CONST.SUBSCRIPTION.TYPE>;
type CancellationType = ValueOf<typeof CONST.CANCELLATION_TYPE>;

export type {Country, IOUAction, IOUType, IOURequestType, SubscriptionType, FeedbackSurveyOptionID, CancellationType, OnboardingInvite, OnboardingAccounting, IOUActionParams};

export {CONTINUATION_DETECTION_SEARCH_FILTER_KEYS, TASK_TO_FEATURE, FRAUD_PROTECTION_EVENT, COUNTRIES_US_BANK_FLOW};

export default CONST;
