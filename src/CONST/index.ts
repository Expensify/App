import type {SearchFilterKey} from '@components/Search/types';

import type ResponsiveLayoutResult from '@hooks/useResponsiveLayout/types';

import {
    ANIMATED_TRANSITION as ANIMATION_TIMING_ANIMATED_TRANSITION,
    DEFAULT_IN as ANIMATION_TIMING_DEFAULT_IN,
    DEFAULT_OUT as ANIMATION_TIMING_DEFAULT_OUT,
    DEFAULT_RIGHT_DOCKED_IOS_IN as ANIMATION_TIMING_DEFAULT_RIGHT_DOCKED_IOS_IN,
    DEFAULT_RIGHT_DOCKED_IOS_OUT as ANIMATION_TIMING_DEFAULT_RIGHT_DOCKED_IOS_OUT,
    FAB_IN as ANIMATION_TIMING_FAB_IN,
    FAB_OUT as ANIMATION_TIMING_FAB_OUT,
    MENU_ANIMATION_DURATION as ANIMATION_TIMING_MENU_ANIMATION_DURATION,
} from '@libs/Animation/animationTiming';
import MULTIFACTOR_AUTHENTICATION_VALUES from '@libs/MultifactorAuthentication/VALUES';
import addTrailingForwardSlash from '@libs/UrlUtils';

import variables from '@styles/variables';

import ONYXKEYS from '@src/ONYXKEYS';
import SCREENS from '@src/SCREENS';
import type {PolicyTagLists} from '@src/types/onyx';
import type PlaidBankAccount from '@src/types/onyx/PlaidBankAccount';

import type {ValueOf} from 'type-fest';

/* eslint-disable @typescript-eslint/naming-convention */
import {add as dateAdd} from 'date-fns';
import {sub as dateSubtract} from 'date-fns/sub';
import Config from 'react-native-config';
import * as KeyCommand from 'react-native-key-command';

import CI from './CI';
import {LOCALES} from './LOCALES';

// Creating a default array and object this way because objects ({}) and arrays ([]) are not stable types.
// Freezing the array ensures that it cannot be unintentionally modified.
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});
// Shared immutable map used in hot paths that only read from the instance.
const EMPTY_MAP = new Map<string, string>();

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
const XERO_PARTNER_LINK = 'https://referrals.xero.com/uzfjy4uegog2-v0pj1v';
const UBER_TERMS_LINK = 'https://www.uber.com/us/en/business/sign-up/terms/expense-partners/';
const PLATFORM_OS_MACOS = 'Mac OS';
const PLATFORM_IOS = 'iOS';
const ANDROID_PACKAGE_NAME = 'org.me.mobiexpensifyg';
const CURRENT_YEAR = new Date().getFullYear();
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

// Explicit type annotation is required
const cardActiveStates: number[] = [2, 3, 4, 7];

const brokenConnectionScrapeStatuses: number[] = [200, 434, 531, 530, 500, 666];

// Hide not issued or not activated cards (states 2, 4) from card filter options in search, as no transactions can be made on cards in these states
const cardHiddenFromSearchStates: number[] = [2, 4];

const selectableOnboardingChoices = {
    MANAGE_TEAM: 'newDotManageTeam',
    EMPLOYER: 'newDotEmployer',
    TRACK_BUSINESS: 'newDotTrackWorkspace',
    TRACK_PERSONAL: 'newDotTrackPersonalWorkspace',
    LOOKING_AROUND: 'newDotLookingAround',
} as const;

const backendOnboardingChoices = {
    ADMIN: 'newDotAdmin',
    SUBMIT: 'newDotSubmit',
    TRACK_WORKSPACE: 'newDotTrackWorkspace',
    PERSONAL_SPEND: 'newDotPersonalSpend',
    CHAT_SPLIT: 'newDotSplitChat',
    TEST_DRIVE_RECEIVER: 'testDriveReceiver',
} as const;

const onboardingChoices = {
    ...selectableOnboardingChoices,
    ...backendOnboardingChoices,
} as const;

const createExpenseOnboardingChoices = {
    PERSONAL_SPEND: backendOnboardingChoices.PERSONAL_SPEND,
    EMPLOYER: selectableOnboardingChoices.EMPLOYER,
    SUBMIT: backendOnboardingChoices.SUBMIT,
} as const;

const signupQualifiers = {
    INDIVIDUAL: 'individual',
    VSB: 'vsb',
    SMB: 'smb',
} as const;

type NoneAccountingKey = 'none';

type OnboardingAccounting = keyof typeof CONST.POLICY.CONNECTIONS.NAME_USER_FRIENDLY | NoneAccountingKey | null;

const onboardingInviteTypes = {
    IOU: 'iou',
    INVOICE: 'invoice',
    CHAT: 'chat',
    WORKSPACE: 'workspace',
} as const;

const onboardingCompanySize = {
    MICRO_SMALL: '1-4',
    MICRO_MEDIUM: '5-10',

    // This range is deprecated in favor of the smaller ranges above, but the constant is kept to compare against saved data for backwards compatibility.
    MICRO: '1-10',

    SMALL: '11-50',
    MEDIUM_SMALL: '51-100',
    MEDIUM: '101-1000',
    LARGE: '1001+',
} as const;

const onboardingPersonalTrackGoals = {
    INVESTMENT_TRACKING: 'InvestmentTracking',
    HOUSEHOLD_TRACKING: 'HouseholdTracking',
    SIDEPROJECT_TRACKING: 'SideprojectTracking',
    SOMETHING_ELSE: 'SomethingElse',
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
    CUSTOM_FIELD_KEYS: {
        customField1: 'employeeUserID',
        customField2: 'employeePayrollID',
    },
    WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY: 100,
    ANIMATED_HIGHLIGHT_ENTRY_DELAY: 50,
    ANIMATED_HIGHLIGHT_ENTRY_DURATION: 300,
    ANIMATED_HIGHLIGHT_START_DELAY: 10,
    ANIMATED_HIGHLIGHT_START_DURATION: 300,
    ANIMATED_HIGHLIGHT_WORKSPACE_FEATURE_ITEM_END_DELAY: 7000,
    ANIMATED_HIGHLIGHT_WORKSPACE_FEATURE_ITEM_END_DURATION: 3000,
    ANIMATED_HIGHLIGHT_END_DELAY: 800,
    ANIMATED_HIGHLIGHT_END_DURATION: 2000,
    ANIMATED_TRANSITION: ANIMATION_TIMING_ANIMATED_TRANSITION,
    MENU_ANIMATION_DURATION: ANIMATION_TIMING_MENU_ANIMATION_DURATION,
    KEYBOARD_RESTORATION_FLAG_RESET_DELAY: 100,
    SIDE_PANEL_ANIMATED_TRANSITION: 300,
    ANIMATED_PROGRESS_BAR_DELAY: 300,
    ANIMATED_PROGRESS_BAR_OPACITY_DURATION: 300,
    ANIMATED_PROGRESS_BAR_DURATION: 750,
    PULSE_ANIMATION: {
        FADE_OUT_DURATION: 400,
        FADE_IN_DURATION: 350,
        PAUSE_DURATION: 250,
        RECOVERY_DURATION: 150,
    },
    ANIMATION_IN_TIMING: 100,
    COMPOSER_FOCUS_DELAY: 150,
    MAX_TRANSITION_DURATION_MS: 1000,
    MAX_TRANSITION_START_WAIT_MS: 1000,
    EXPENSE_REPORT_DELETE_DELAY_MS: 300,
    ELEMENT_NAME: {
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
    POPOVER_REPORT_SUBMIT_TO_CONTENT_HEIGHT: 416,
    POPOVER_MENU_MAX_HEIGHT: 496,
    POPOVER_MENU_MAX_HEIGHT_MOBILE: 432,
    POPOVER_DATE_WIDTH: 338,
    POPOVER_DATE_RANGE_WIDTH: 672,
    POPOVER_DATE_MAX_HEIGHT: 366,
    POPOVER_DATE_MIN_HEIGHT: 322,
    ADVANCED_FILTERS_POPOVER_HEIGHT: 520,
    ADVANCED_FILTERS_POPOVER_WIDTH: 582,
    ADVANCED_FILTERS_CONTENT_WIDTH: 331,
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
    PENDING_TRANSACTION_DELETION_DELAY: 4000,
    PENDING_TRANSACTION_SCROLL_DELAY: 1000,

    // Delay before pre-inserting the Search fullscreen route under the RHP on the confirmation screen.
    // Chosen to be long enough for the RHP entrance animation to complete (~250ms) and avoid jank
    // from concurrent navigation state mutations, but short enough to finish well before most users
    // tap submit. If the user submits before this fires, the fallback (non-pre-insert) path is used.
    PRE_INSERT_FULLSCREEN_DELAY: 300,
    LIMIT_TIMEOUT: 2147483647,
    ARROW_HIDE_DELAY: 3000,

    // Maximum pixel count (width × height) for processing images. Prevents memory crashes with extremely large images.
    MAX_IMAGE_PIXEL_COUNT: 50000000,
    CHUNK_LOAD_ERROR: 'ChunkLoadError',

    CHRONOS: {
        TIMER_COMMAND: {
            START: 'start',
            STOP: 'stop',
        },
        OOO_DURATION_UNITS: {
            HOUR: 'hours',
            DAY: 'days',
            WEEK: 'weeks',
            MONTH: 'months',
        },
    },

    RECEIPT_CAMERA: {
        PHOTO_WIDTH: 2880,
        PHOTO_HEIGHT: 2160,
        PHOTO_ASPECT_RATIO: 4 / 3,
        // Limit how long the shutter handler waits for thumbnail pre-generation before navigating
        // to the confirmation screen. Past this, we navigate and let the confirm-side hook
        // generate the thumbnail lazily (brief source swap is acceptable).
    },

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

    TRANSACTION_TAG_AND_CATEGORY_PICKER_MAX_TITLE_LINES: 5,

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

    AUTH_METHOD: {
        SAML: 'saml',
        SHORT_LIVED_AUTH_TOKEN: 'shortLivedAuthToken',
        INFINITE_SESSION: 'infiniteSession',
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

    // Used to track the editing state of report action messages in the ReportActionEditMessageContext provider.
    REPORT_ACTION_EDIT_MESSAGE_STATE: {
        OFF: 'off',
        EDITING: 'editing',
        SUBMITTED: 'submitted',
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

    GENERATED_LETTER_AVATAR_PATH: '/images/avatars/generated/letter/',

    DISPLAY_NAME: {
        // This value is consistent with the BE display name max length limit.
        MAX_LENGTH: 100,
        RESERVED_NAMES: ['Expensify', 'Concierge'],
        EXPENSIFY_CONCIERGE: 'Expensify Concierge',
    },

    GPS: {
        // It's OK to get a cached location that is up to an hour old because the only accuracy needed is the country the user is in

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

    PULL_REQUEST_NUMBER: CI.PULL_REQUEST_NUMBER,

    // Regex to get link in href prop inside of <a/> component
    REGEX_LINK_IN_ANCHOR: /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi,

    // Validates phone numbers with digits, '+', '-', '()', '.', and spaces
    ACCEPTED_PHONE_CHARACTER_REGEX: /^[0-9+\-().\s]+$/,

    // Prevents consecutive special characters or spaces like '--', '..', '((', '))', or '  '.
    REPEATED_SPECIAL_CHAR_PATTERN: /([-\s().])\1+/,

    MERCHANT_NAME_MAX_BYTES: 255,

    MASKED_PAN_PREFIX: 'XXXXXXXXXXXX',

    REQUEST_PREVIEW: {
        MAX_LENGTH: 83,
    },

    EXPORT_DOWNLOAD: {
        STATE: {
            PREPARING: 'preparing',
            READY: 'ready',
            FAILED: 'failed',
        },
        TYPE: {
            CSV: 'csv',
            PDF: 'pdf',
        },
    },

    SECURE_DOWNLOAD_TYPE: {
        CSV_EXPORT: 'csvexport',
        PDF_REPORT: 'pdfreport',
    },

    EXPORT_LABELS: {
        NETSUITE: 'NetSuite',
        QBO: 'QuickBooks Online',
        QBD: 'QuickBooks Desktop',
        XERO: 'Xero',
        INTACCT: 'Intacct',
        SAGE_INTACCT: 'Sage Intacct',
        CERTINIA: 'FinancialForce',
        RILLET: 'Rillet',
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
        MIN_AGE_FOR_PAYMENT: 18,
        MAX_AGE: 150,
    },

    MULTIFACTOR_AUTHENTICATION: MULTIFACTOR_AUTHENTICATION_VALUES,

    /**
     * COSE algorithm identifiers used in WebAuthn credential registration.
     * @see https://www.iana.org/assignments/cose/cose.xhtml#algorithms
     */
    COSE_ALGORITHM: {
        /** EdDSA (ED25519) */
        /** ES256 (ECDSA w/ SHA-256, P-256 curve) */
        ES256: -7,
        /** RS256 (RSASSA-PKCS1-v1_5 w/ SHA-256) */
    },

    /** WebAuthn/Passkey credential type */
    PASSKEY_CREDENTIAL_TYPE: 'public-key',

    /**
     * WebAuthn AuthenticatorTransport values.
     * Describes how the client communicates with a particular authenticator
     * to perform a WebAuthn credential registration or authentication ceremony.
     * @see https://www.w3.org/TR/webauthn-3/#enum-transport
     */
    PASSKEY_TRANSPORT: {
        /** Authenticator can be contacted over removable USB */
        USB: 'usb',
        /** Authenticator can be contacted over Near Field Communication (NFC) */
        NFC: 'nfc',
        /** Authenticator can be contacted over Bluetooth Low Energy (BLE) */
        BLE: 'ble',
        /** Authenticator can be contacted over ISO/IEC 7816 smart card with contacts */
        SMART_CARD: 'smart-card',
        /** Authenticator can be contacted using a combination of data-transport and proximity mechanisms (e.g. desktop auth via smartphone) */
        HYBRID: 'hybrid',
        /** Authenticator is a platform authenticator contacted via client device-specific transport (not removable) */
        INTERNAL: 'internal',
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
            EVENTS_NAME: {
                OPEN: 'OPEN',
                EXIT: 'EXIT',
            },
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
            KYB_DOCS: 'UploadKYBDocs',
        },
        PAGE_NAMES: {
            COUNTRY: 'currency-and-country',
            BANK_ACCOUNT: 'bank-info',
            REQUESTOR: 'personal-info',
            VERIFY_IDENTITY: 'verify-identity',
            COMPANY: 'company',
            BENEFICIAL_OWNERS: 'business-owner',
            ACH_CONTRACT: 'ach-contract',
            VALIDATION: 'validation',
            ENABLE: 'enable',
            KYB_DOCS: 'upload-kyb-documents',
        },
        STEP_NAMES: ['1', '2', '3', '4', '5', '6'],
        BANK_INFO_STEP: {
            SUB_PAGE_NAMES: {
                MANUAL: 'manual',
                PLAID: 'plaid',
            },
        },
        PERSONAL_INFO_STEP: {
            SUB_PAGE_NAMES: {
                FULL_NAME: 'full-name',
                DATE_OF_BIRTH: 'date-of-birth',
                SSN: 'ssn',
                ADDRESS: 'address',
                CONFIRMATION: 'confirmation',
            },
        },
        BUSINESS_INFO_STEP: {
            SUB_PAGE_NAMES: {
                NAME: 'name',
                TAX_ID: 'tax-id',
                WEBSITE: 'website',
                PHONE: 'phone',
                ADDRESS: 'address',
                TYPE: 'type',
                INCORPORATION_DATE: 'start-date',
                INCORPORATION_STATE: 'state',
                INCORPORATION_CODE: 'code',
                CONFIRMATION: 'confirmation',
            },
        },
        BENEFICIAL_OWNERS_STEP: {
            SUB_PAGE_NAMES: {
                IS_USER_UBO: 'is-user-ubo',
                IS_ANYONE_ELSE_UBO: 'is-anyone-else-ubo',
                ARE_THERE_MORE_UBOS: 'are-there-more-ubos',
                UBOS_LIST: 'ubos-list',
                LEGAL_NAME: 'legal-name',
                DATE_OF_BIRTH: 'date-of-birth',
                SSN: 'ssn',
                ADDRESS: 'address',
                CONFIRMATION: 'confirmation',
            },
        },
        COMPLETE_VERIFICATION_STEP: {
            SUB_PAGE_NAMES: {
                CONFIRM_AGREEMENTS: 'confirm-agreements',
            },
        },
        SUBSTEP: {
            MANUAL: 'manual',
            PLAID: 'plaid',
        },
        STEPS_HEADER_HEIGHT: 40,
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
        KYB_STATUS: {
            PASS: 'pass',
        },
        KYB_REQUESTOR_IDENTITY_ERROR: {
            ADDRESS: [
                'resultcode.address.does.not.match',
                'resultcode.street.name.does.not.match',
                'resultcode.street.number.does.not.match',
                'resultcode.zip.does.not.match',
                'resultcode.state.does.not.match',
                'resultcode.alternate.address.alert',
                'resultcode.input.address.is.po.box',
                'resultcode.located.address.is.po.box',
                'resultcode.warm.address.alert',
            ],
            DOB: [
                'resultcode.coppa.alert',
                'resultcode.age.below.minimum',
                'resultcode.dob.does.not.match',
                'resultcode.yob.does.not.match',
                'resultcode.yob.within.one.year',
                'resultcode.mob.does.not.match',
                'resultcode.no.mob.available',
                'resultcode.no.dob.available',
                'resultcode.ssn.issued.prior.to.dob',
            ],
        },
    },
    CORPAY_DOCUMENT: {
        ALLOWED_FILE_TYPES: ['pdf', 'jpg', 'jpeg', 'png'],
        FILE_LIMIT: 1,
        MAX_FILE_SIZE: 2097152,
    },
    NON_USD_BANK_ACCOUNT: {
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
        PAGE_NAME: {
            CURRENCY_AND_COUNTRY: 'currency-and-country',
            BANK_INFO: 'bank-info',
            BUSINESS_INFO: 'business-info',
            BENEFICIAL_OWNER_INFO: 'beneficial-owner-info',
            SIGNER_INFO: 'signer-info',
            AGREEMENTS: 'agreements',
            DOCUSIGN: 'docusign',
            FINISH: 'finish',
        },
        BANK_INFO_STEP_ACH_DATA_INPUT_IDS: {
            ACCOUNT_HOLDER_NAME: 'addressName',
            ACCOUNT_HOLDER_REGION: 'addressState',
            ACCOUNT_HOLDER_CITY: 'addressCity',
            ACCOUNT_HOLDER_ADDRESS: 'addressStreet',
            ACCOUNT_HOLDER_POSTAL_CODE: 'addressZipCode',
            ROUTING_CODE: 'routingNumber',
        },
        BANK_INFO_STEP: {
            SUB_PAGE_NAMES: {
                BANK_ACCOUNT_DETAILS: 'bank-account-details',
                ACCOUNT_HOLDER_DETAILS: 'account-holder-details',
                CONFIRMATION: 'confirmation',
            },
        },
        BUSINESS_INFO_STEP: {
            SUB_PAGE_NAMES: {
                NAME: 'name',
                WEBSITE: 'website',
                ADDRESS: 'address',
                CONTACT_INFORMATION: 'contact-information',
                REGISTRATION_NUMBER: 'registration-number',
                TAX_ID_EIN_NUMBER: 'tax-id-ein-number',
                INCORPORATION_LOCATION: 'incorporation-location',
                BUSINESS_TYPE: 'business-type',
                PAYMENT_VOLUME: 'payment-volume',
                AVERAGE_REIMBURSEMENT: 'average-reimbursement',
                CONFIRMATION: 'confirmation',
            },
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
            SUB_PAGE_NAMES: {
                IS_USER_BENEFICIAL_OWNER: 'is-user-beneficial-owner',
                IS_ANYONE_ELSE_BENEFICIAL_OWNER: 'is-anyone-else-beneficial-owner',
                ARE_THERE_MORE_BENEFICIAL_OWNERS: 'are-there-more-beneficial-owners',
                BENEFICIAL_OWNERS_LIST: 'beneficial-owners-list',
                NAME: 'name',
                NATIONALITY: 'nationality',
                OWNERSHIP_PERCENTAGE: 'ownership-percentage',
                DATE_OF_BIRTH: 'date-of-birth',
                ADDRESS: 'address',
                LAST_4_SSN: 'last-4-ssn',
                DOCUMENTS: 'documents',
                CONFIRMATION: 'confirmation',
            },
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
            SUB_PAGE_NAMES: {
                IS_DIRECTOR: 'is-director',
                NAME: 'name',
                JOB_TITLE: 'job-title',
                DATE_OF_BIRTH: 'date-of-birth',
                ADDRESS: 'address',
                UPLOAD_DOCUMENTS: 'upload-documents',
                CONFIRMATION: 'confirmation',
                ENTER_EMAIL: 'enter-email',
                HANG_TIGHT: 'hang-tight',
            },
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
        STEP_INDEX_LIST: ['1', '2', '3'],
        PAGE_NAME: {
            BUSINESS_INFO: {
                REGISTRATION_NUMBER: 'registration-number',
                TYPE: 'type',
                PAYMENT_VOLUME: 'payment-volume',
                AVERAGE_REIMBURSEMENT: 'average-reimbursement',
                CONFIRM: 'confirm',
            },
        },
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
        CUSTOM_AGENT: 'customAgent',
        DEFAULT_ROOMS: 'defaultRooms',
        PREVENT_SPOTNANA_TRAVEL: 'preventSpotnanaTravel',
        REPORT_FIELDS_FEATURE: 'reportFieldsFeature',
        NETSUITE_USA_TAX: 'netsuiteUsaTax',
        PER_DIEM: 'newDotPerDiem',
        IS_TRAVEL_VERIFIED: 'isTravelVerified',
        EXPENSIFY_CARD_EU_UK: 'expensifyCardEuUk',
        EUR_BILLING: 'eurBilling',
        PAY_INVOICE_VIA_EXPENSIFY: 'payInvoiceViaExpensify',
        SUGGESTED_FOLLOWUPS: 'suggestedFollowups',
        BULK_EDIT: 'bulkEdit',
        BULK_EDIT_WORKSPACES: 'bulkEditWorkspaces',
        NEW_MANUAL_EXPENSE_FLOW: 'newManualExpenseFlow',
        SUBMIT_2026: 'submit2026',
        BULK_SUBMIT_APPROVE_PAY: 'bulkSubmitApprovePay',
        WORKSPACE_ROOMS_PAGE: 'workspaceRoomsPage',
        CERTINIA: 'financialForceNewDot',
        VENDOR_MATCHING: 'vendorMatching',
        RILLET: 'rillet',
        RULES_REVAMP: 'rulesRevamp',
        COMMUTER_EXCLUSIONS: 'commuterExclusions',
        MULTIPLE_APPROVERS: 'multipleApprovers',
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
        AS: 'AS',
        AU: 'AU',
        CA: 'CA',
        FI: 'FI',
        FR: 'FR',
        GB: 'GB',
        GI: 'GI',
        GU: 'GU',
        IE: 'IE',
        IL: 'IL',
        IS: 'IS',
        IT: 'IT',
        MP: 'MP',
        MX: 'MX',
        PR: 'PR',
        US: 'US',
        VI: 'VI',
    },
    SWIPE_DIRECTION: {
        DOWN: 'down',
        LEFT: 'left',
        RIGHT: 'right',
        UP: 'up',
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
                [PLATFORM_OS_MACOS]: {
                    input: 'k',
                    modifierFlags: keyModifierShiftCommand,
                },
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
                [PLATFORM_OS_MACOS]: {
                    input: keyInputEnter,
                    modifierFlags: keyModifierCommand,
                },
                [PLATFORM_IOS]: {
                    input: keyInputEnter,
                    modifierFlags: keyModifierCommand,
                },
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
        EXPENSE_REPORT_SEARCH: {
            descriptionKey: 'expenseReportSearch',
            shortcutKey: 'G',
            modifiers: ['CTRL', 'SHIFT'],
            trigger: {
                DEFAULT: {input: 'g', modifierFlags: keyModifierShiftControl},
                [PLATFORM_OS_MACOS]: {
                    input: 'g',
                    modifierFlags: keyModifierShiftCommand,
                },
                [PLATFORM_IOS]: {input: 'g', modifierFlags: keyModifierShiftCommand},
            },
            type: KEYBOARD_SHORTCUT_NAVIGATION_TYPE,
        },
        GO_TO_WORKSPACE: {
            descriptionKey: 'goToWorkspace',
            shortcutKey: 'P',
            modifiers: ['CTRL', 'SHIFT'],
            trigger: {
                DEFAULT: {input: 'p', modifierFlags: keyModifierShiftControl},
                [PLATFORM_OS_MACOS]: {
                    input: 'p',
                    modifierFlags: keyModifierShiftCommand,
                },
                [PLATFORM_IOS]: {input: 'p', modifierFlags: keyModifierShiftCommand},
            },
            type: KEYBOARD_SHORTCUT_NAVIGATION_TYPE,
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
    DEFAULT_CURRENCY_DECIMALS: 2,
    SCA_CURRENCIES: new Set(['GBP', 'EUR']),
    get DIRECT_REIMBURSEMENT_CURRENCIES() {
        return [this.CURRENCY.USD, this.CURRENCY.AUD, this.CURRENCY.CAD, this.CURRENCY.GBP, this.CURRENCY.EUR];
    },
    TRIAL_DURATION_DAYS: 8,
    EXAMPLE_PHONE_NUMBER: '+15005550006',
    FORMATTED_EXAMPLE_PHONE_NUMBER: '+1-(201)-867-5309',
    CONCIERGE_CHAT_NAME: 'Concierge',
    CONCIERGE_SESSION_EXPIRATION_MS: 2 * 3600 * 1000, // 2 hours
    CLOUDFRONT_URL,
    EMPTY_ARRAY,
    EMPTY_OBJECT,
    EMPTY_MAP,
    DEFAULT_NUMBER_ID,
    DEFAULT_MISSING_ID,
    DEFAULT_COUNTRY_CODE,
    FAKE_REPORT_ID: 'FAKE_REPORT_ID',
    EXPENSIFY_URL,
    EXPENSIFY_MOBILE_URL,
    GOOGLE_DOC_IMAGE_LINK_MATCH: 'googleusercontent.com',
    GOOGLE_SEARCH_URL: 'https://www.google.com/search?q=',
    IMAGE_BASE64_MATCH: 'base64',
    DEEPLINK_BASE_URL: 'new-expensify://',
    SAML_REDIRECT_URL: 'expensify://open',
    CLOUDFRONT_DOMAIN_REGEX: /^https:\/\/\w+\.cloudfront\.net/i,
    CONCIERGE_ICON_URL_2021: `${CLOUDFRONT_URL}/images/icons/concierge_2021.png`,
    CONCIERGE_ICON_URL: `${CLOUDFRONT_URL}/images/icons/concierge_2022.png`,
    NOTIFICATIONS_ICON_URL: `${CLOUDFRONT_URL}/images/expensify__favicon.png`,
    COMPANY_CARD_PLAID: `${CLOUDFRONT_URL}/images/plaid/`,
    // The version below must stay in sync with the `@lottiefiles/dotlottie-web` version pinned in package-lock.json.
    DOTLOTTIE_WASM_URL: 'https://cdn.expensify.com/cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web@0.44.0/dist/dotlottie-player.wasm',
    CONCIERGE_EXPLAIN_LINK_PATH: '/concierge/explain',
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
    FEES_URL: `${EXPENSIFY_URL}/fees`,
    SAVE_WITH_EXPENSIFY_URL: `${USE_EXPENSIFY_URL}/savings-calculator`,
    CFPB_PREPAID_URL: 'https://cfpb.gov/prepaid',
    STAGING_NEW_EXPENSIFY_URL: 'https://staging.new.expensify.com',
    PR_TESTING_NEW_EXPENSIFY_URL: `https://${CI.PULL_REQUEST_NUMBER}.pr-testing.expensify.com`,
    NEWHELP_URL: 'https://help.expensify.com',
    CHASE_ACCOUNT_NUMBER_HELP_URL: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Connect-a-Personal-Bank-Account',
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
    COMPANY_CARDS_CREATE_FILE_FEED_HELP_URL: 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/Import-Company-Card-Transactions-From-a-Spreadsheet',
    CUSTOM_REPORT_NAME_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/spending-insights/Export-Expenses-And-Reports#formulas',
    CONFIGURE_EXPENSE_REPORT_RULES_HELP_URL: 'https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules',
    CONFIGURE_APPROVAL_WORKFLOWS_HELP_URL: 'https://help.expensify.com/articles/new-expensify/workspaces/Add-Approvals#configure-approval-workflows',
    SELECT_WORKFLOWS_HELP_URL: 'https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows',
    COPILOT_HELP_URL: 'https://help.expensify.com/articles/new-expensify/settings/Add-or-Act-As-a-Copilot',
    CUSTOM_AGENTS_HELP_URL: 'https://help.expensify.com/articles/new-expensify/ai-agents/Create-and-Use-Custom-Agents',
    BULK_UPLOAD_HELP_URL: 'https://help.expensify.com/articles/new-expensify/reports-and-expenses/Create-an-Expense#option-4-bulk-upload-receipts-desktop-only',
    ENCRYPTION_AND_SECURITY_HELP_URL: 'https://help.expensify.com/articles/new-expensify/settings/Encryption-and-Data-Security',
    PLAN_TYPES_AND_PRICING_HELP_URL: 'https://help.expensify.com/articles/new-expensify/billing-and-subscriptions/Plan-types-and-pricing',
    PERSONAL_AND_CORPORATE_KARMA_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/expensify-billing/Personal-and-Corporate-Karma',
    COLLECT_UPGRADE_HELP_URL: 'https://help.expensify.com/Hidden/collect-upgrade',
    MERGE_ACCOUNT_HELP_URL: 'https://help.expensify.com/articles/new-expensify/settings/Merge-Accounts',
    ENABLE_GLOBAL_REIMBURSEMENT_HELP_URL: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Enable-Global-Reimbursement',
    DOMAIN_VERIFICATION_HELP_URL: 'https://help.expensify.com/articles/new-expensify/workspaces/Claim-and-Verify-a-Domain',
    SAML_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/domains/Set-Up-SAML-SSO',
    TRAVEL_INVOICING_HELP_URL: 'https://help.expensify.com/articles/travel/consolidated-travel-billing/Enable-Consolidated-Travel-Billing-in-a-Workspace',
    REGISTER_FOR_WEBINAR_URL: 'https://events.zoom.us/eo/Aif1I8qCi1GZ7KnLnd1vwGPmeukSRoPjFpyFAZ2udQWn0-B86e1Z~AggLXsr32QYFjq8BlYLZ5I06Dg',
    UNLOCK_BANK_ACCOUNT_HELP_URL: 'https://help.expensify.com/articles/new-expensify/wallet-and-payments/Unlock-a-Business-Bank-Account',
    // Use Environment.getEnvironmentURL to get the complete URL with port number
    DEV_NEW_EXPENSIFY_URL: 'https://dev.new.expensify.com:',
    STORYLANE: {
        ADMIN_TOUR: 'https://expensify.storylane.io/share/nfrgmfpppolt',
        ADMIN_TOUR_MOBILE: 'https://expensify.storylane.io/share/7t9urrrcqk5k',
        ADMIN_MIGRATED: 'https://app.storylane.io/share/qlgnexxbsdtp',
        ADMIN_MIGRATED_MOBILE: 'https://app.storylane.io/share/fgireksbt2oh',
        TRACK_WORKSPACE_TOUR: 'https://app.storylane.io/share/mqzy3huvtrhx?embed=inline',
        TRACK_WORKSPACE_TOUR_MOBILE: 'https://app.storylane.io/share/wq4hiwsqvoho?embed=inline',
        EMPLOYEE_TOUR: 'https://expensify.storylane.io/share/ohsppww6qi71',
        EMPLOYEE_TOUR_MOBILE: 'https://expensify.storylane.io/share/v8uwkznocw0g',
        EMPLOYEE_MIGRATED: 'https://app.storylane.io/share/v9dr1rjqsd9y',
        EMPLOYEE_MIGRATED_MOBILE: 'https://app.storylane.io/share/qbbob6zvapqo',
        IFRAME_SANDBOX: 'allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox',
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
        FEES_URL: `${EXPENSIFY_URL}/fees`,
    },
    OLDDOT_URLS: {
        INBOX: 'inbox',
        POLICY_CONNECTIONS_URL: (policyID: string) => `policy?param={"policyID":"${policyID}"}#connections`,
        POLICY_CONNECTIONS_URL_ENCODED: (policyID: string) => `policy?param=%7B%22policyID%22%3A%22${policyID}%22%7D#connections`,
        PRINTABLE_REPORT: (reportID: string) => `printablereport.php?promptPrint=true&reportID=${reportID}`,
        SIGN_OUT: 'signout',
        SUPPORTAL_RESTORE_STASHED_LOGIN: '_support/index?action=restoreStashedLogin',
        AGENT_ZERO_TRACER: (agentZeroRequestID: string, shouldLoadFromLocalLogs: boolean) =>
            `_devportal/tools/tracer/?agentZeroRequestID=${encodeURIComponent(agentZeroRequestID)}${shouldLoadFromLocalLogs ? '&mode=locallogs' : ''}`,
    },

    EXPENSIFY_POLICY_DOMAIN,
    EXPENSIFY_POLICY_DOMAIN_EXTENSION,

    SIGN_IN_FORM_WIDTH: 300,

    REQUEST_CODE_DELAY: 30,

    SIGN_IN_METHOD: {
        APPLE: 'Apple',
        GOOGLE: 'Google',
    },

    QUICK_ACTIONS: {
        REQUEST_MANUAL: 'requestManual',
        REQUEST_SCAN: 'requestScan',
        REQUEST_DISTANCE: 'requestDistance',
        REQUEST_TIME: 'requestTime',
        PER_DIEM: 'perDiem',
        SPLIT_MANUAL: 'splitManual',
        SPLIT_SCAN: 'splitScan',
        SPLIT_DISTANCE: 'splitDistance',
        TRACK_MANUAL: 'trackManual',
        TRACK_SCAN: 'trackScan',
        TRACK_PER_DIEM: 'trackPerDiem',
        TRACK_DISTANCE: 'trackDistance',
        ASSIGN_TASK: 'assignTask',
        SEND_MONEY: 'sendMoney',
    },

    RECEIPT: {
        ICON_SIZE: 164,
        HAND_ICON_HEIGHT: 152,
        HAND_ICON_WIDTH: 200,
        SHUTTER_SIZE: 90,
        FLASH_DELAY_MS: 2000,
        // Maximum magnification applied while hover-zooming a receipt (see ReceiptHoverZoom).
        // Remote PDFs are rendered at this multiple of their on-screen size so the magnified
        // view shows real pixels instead of an upscaled low-resolution raster.
        HOVER_ZOOM_SCALE: 2.5,
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
        TRASH_REPORT_ID: '-1',
        SPLIT_REPORT_ID: '-2',
        SECONDARY_ACTIONS: {
            SUBMIT: 'submit',
            APPROVE: 'approve',
            RECEIVED_PAYMENT: 'receivedPayment',
            REMOVE_HOLD: 'removeHold',
            UNAPPROVE: 'unapprove',
            CANCEL_PAYMENT: 'cancelPayment',
            HOLD: 'hold',
            DOWNLOAD_PDF: 'downloadPDF',
            PRINT: 'print',
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
            DUPLICATE_EXPENSE: 'duplicateExpense',
            DUPLICATE_REPORT: 'duplicateReport',
            MOVE_EXPENSE: 'moveExpense',
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
        STATUS_BAR_TYPE: {
            MARK_AS_RESOLVED: 'markAsResolved',
            BOOKING_PENDING: 'bookingPending',
            BOOKING_ARCHIVED: 'bookingArchived',
            ON_HOLD: 'onHold',
            DUPLICATES: 'duplicates',
            BROKEN_CONNECTION: 'brokenConnection',
            PENDING_RTER: 'pendingRTER',
            PENDING_TRANSACTIONS: 'pendingTransactions',
            SCANNING_RECEIPT: 'scanningReceipt',
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
            REJECT_REPORT: 'rejectReport',
            MERGE: 'merge',
            DUPLICATE: 'duplicate',
            MOVE_EXPENSE: 'moveExpense',
        },
        SELECTED_TRANSACTIONS_BULK_ACTION_TYPES: {
            HOLD: 'hold',
            UNHOLD: 'unhold',
            MOVE: 'move',
            MERGE: 'merge',
            SPLIT: 'split',
            DUPLICATE: 'duplicate',
        },
        ADD_EXPENSE_OPTIONS: {
            CREATE_NEW_EXPENSE: 'createNewExpense',
            ADD_EXISTING_EXPENSE: 'addExistingExpense',
            TRACK_DISTANCE_EXPENSE: 'trackDistanceExpense',
        },
        ACTION_BADGE: {
            SUBMIT: 'submit',
            APPROVE: 'approve',
            PAY: 'pay',
            FIX: 'fix',
            TASK: 'task',
        },
        ACTION_TYPES_FOR_ASSIGNEE_TO_COMPLETE: {
            EXPENSE: 'expense',
            TASK: 'task',
        },
        ACTIONS: {
            // OldDot Actions render getMessage from Web-Expensify/lib/Report/Action PHP files via getMessageOfOldDotReportAction in ReportActionsUtils.ts
            TYPE: {
                ACTIONABLE_ADD_PAYMENT_CARD: 'ACTIONABLEADDPAYMENTCARD',
                // Concierge message informing the user of a 3DS challenge - custom reportAction type because we want to translate it
                ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL: 'ACTIONABLE_CARD_3DS_TRANSACTION_APPROVAL',
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
                CARD_FROZEN: 'CARDFROZEN',
                CARD_UNFROZEN: 'CARDUNFROZEN',
                CARD_DEACTIVATED: 'CARDDEACTIVATED',
                PERSONAL_CARD_CONNECTION_BROKEN: 'PERSONALCARDCONNECTIONBROKEN',
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
                DEW_APPROVE_FAILED: 'DEWAPPROVEFAILED',
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
                PLAID_BALANCE_FAILURE: 'PLAIDBALANCEFAILURE',
                IOU: 'IOU',
                INTEGRATIONS_MESSAGE: 'INTEGRATIONSMESSAGE', // OldDot Action
                MANAGER_ATTACH_RECEIPT: 'MANAGERATTACHRECEIPT', // OldDot Action
                MANAGER_DETACH_RECEIPT: 'MANAGERDETACHRECEIPT', // OldDot Action
                MARKED_REIMBURSED: 'MARKEDREIMBURSED', // OldDot Action
                MARK_REIMBURSED_FROM_INTEGRATION: 'ACTIONMARKEDREIMBURSEDFROMINTEGRATION', // OldDot Action
                MERGED_WITH_CASH_TRANSACTION: 'MERGEDWITHCASHTRANSACTION',
                MODIFIED_EXPENSE: 'MODIFIEDEXPENSE',
                CONCIERGE_AUTO_MATCH_VENDOR: 'CONCIERGEAUTOMATCHVENDOR',
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
                REJECTED_TO_SUBMITTER: 'REJECTEDTOSUBMITTER',
                REMOVED_FROM_APPROVAL_CHAIN: 'REMOVEDFROMAPPROVALCHAIN',
                DEMOTED_FROM_WORKSPACE: 'DEMOTEDFROMWORKSPACE',
                RENAMED: 'RENAMED',
                RETRACTED: 'RETRACTED',
                REOPENED: 'REOPENED',
                REPORT_PREVIEW: 'REPORTPREVIEW',
                REASSIGN_APPROVER: 'REASSIGNAPPROVER',
                REROUTE: 'REROUTE',
                SELECTED_FOR_RANDOM_AUDIT: 'SELECTEDFORRANDOMAUDIT', // OldDot Action
                SETTLEMENT_ACCOUNT_LOCKED: 'SETTLEMENTACCOUNTLOCKED',
                SHARE: 'SHARE', // OldDot Action
                STRIPE_PAID: 'STRIPEPAID', // OldDot Action
                SUBMITTED: 'SUBMITTED',
                SUBMITTED_AND_CLOSED: 'SUBMITTEDCLOSED',
                ACTION_DELEGATE_SUBMIT: 'DELEGATESUBMIT',
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
                    ADD_CARD_FEED: 'POLICYCHANGELOG_ADD_CARD_FEED',
                    ADD_EXPENSIFY_CARD_RULE: 'POLICYCHANGELOG_ADD_EXPENSIFY_CARD_RULE',
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
                    DELETE_CARD_FEED: 'POLICYCHANGELOG_DELETE_CARD_FEED',
                    DELETE_INTEGRATION: 'POLICYCHANGELOG_DELETE_INTEGRATION',
                    DELETE_REPORT_FIELD: 'POLICYCHANGELOG_DELETE_REPORT_FIELD',
                    DELETE_TAG: 'POLICYCHANGELOG_DELETE_TAG',
                    DELETE_MULTIPLE_TAGS: 'POLICYCHANGELOG_DELETE_MULTIPLE_TAGS',
                    IMPORT_CUSTOM_UNIT_RATES: 'POLICYCHANGELOG_IMPORT_CUSTOM_UNIT_RATES',
                    IMPORT_TAGS: 'POLICYCHANGELOG_IMPORT_TAGS',
                    INDIVIDUAL_BUDGET_NOTIFICATION: 'POLICYCHANGELOG_INDIVIDUAL_BUDGET_NOTIFICATION',
                    INVITE_TO_ROOM: 'POLICYCHANGELOG_INVITETOROOM',
                    REMOVE_FROM_ROOM: 'POLICYCHANGELOG_REMOVEFROMROOM',
                    REMOVE_EXPENSIFY_CARD_RULE: 'POLICYCHANGELOG_REMOVE_EXPENSIFY_CARD_RULE',
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
                    UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED: 'POLICYCHANGELOG_UPDATE_AUTO_PAY_APPROVED_REPORTS_ENABLED',
                    UPDATE_MCC_GROUP_CATEGORY: 'POLICYCHANGELOG_UPDATE_MCC_GROUP_CATEGORY',
                    UPDATE_AUTO_REPORTING_FREQUENCY: 'POLICYCHANGELOG_UPDATE_AUTOREPORTING_FREQUENCY',
                    UPDATE_BUDGET: 'POLICYCHANGELOG_UPDATE_BUDGET',
                    UPDATE_CATEGORY: 'POLICYCHANGELOG_UPDATE_CATEGORY',
                    UPDATE_CATEGORY_TAX_RATE: 'POLICYCHANGELOG_UPDATE_CATEGORY_TAX_RATE',
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
                    UPDATE_EXPENSIFY_CARD_RULE: 'POLICYCHANGELOG_UPDATE_EXPENSIFY_CARD_RULE',
                    UPDATE_FIELD: 'POLICYCHANGELOG_UPDATE_FIELD',
                    UPDATE_ADDRESS: 'POLICYCHANGELOG_UPDATE_ADDRESS',
                    UPDATE_FEATURE_ENABLED: 'POLICYCHANGELOG_UPDATE_FEATURE_ENABLED',
                    UPDATE_IS_ATTENDEE_TRACKING_ENABLED: 'POLICYCHANGELOG_UPDATE_IS_ATTENDEE_TRACKING_ENABLED',
                    UPDATE_REQUIRE_COMPANY_CARDS_ENABLED: 'POLICYCHANGELOG_UPDATE_REQUIRE_COMPANY_CARDS_ENABLED',
                    UPDATE_DEFAULT_APPROVER: 'POLICYCHANGELOG_UPDATE_DEFAULT_APPROVER',
                    UPDATE_SUBMITS_TO: 'POLICYCHANGELOG_UPDATE_SUBMITS_TO',
                    UPDATE_FORWARDS_TO: 'POLICYCHANGELOG_UPDATE_FORWARDS_TO',
                    UPDATE_CUSTOM_TAX_NAME: 'POLICYCHANGELOG_UPDATE_CUSTOM_TAX_NAME',
                    UPDATE_CURRENCY_DEFAULT_TAX: 'POLICYCHANGELOG_UPDATE_CURRENCY_DEFAULT_TAX',
                    UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX: 'POLICYCHANGELOG_UPDATE_FOREIGN_CURRENCY_DEFAULT_TAX',
                    UPDATE_INVOICE_COMPANY_NAME: 'POLICYCHANGELOG_UPDATE_INVOICE_COMPANY_NAME',
                    UPDATE_INVOICE_COMPANY_WEBSITE: 'POLICYCHANGELOG_UPDATE_INVOICE_COMPANY_WEBSITE',
                    UPDATE_MANUAL_APPROVAL_THRESHOLD: 'POLICYCHANGELOG_UPDATE_MANUAL_APPROVAL_THRESHOLD',
                    UPDATE_MAX_EXPENSE_AMOUNT: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AMOUNT',
                    UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT',
                    UPDATE_MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AMOUNT_NO_ITEMIZED_RECEIPT',
                    UPDATE_MAX_EXPENSE_AGE: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AGE',
                    UPDATE_MULTIPLE_TAGS_APPROVER_RULES: 'POLICYCHANGELOG_UPDATE_MULTIPLE_TAGS_APPROVER_RULES',
                    UPDATE_NAME: 'POLICYCHANGELOG_UPDATE_NAME',
                    UPDATE_DESCRIPTION: 'POLICYCHANGELOG_UPDATE_DESCRIPTION',
                    UPDATE_OWNERSHIP: 'POLICYCHANGELOG_UPDATE_OWNERSHIP',
                    UPDATE_REIMBURSER: 'POLICYCHANGELOG_UPDATE_REIMBURSER',
                    UPDATE_PROHIBITED_EXPENSES: 'POLICYCHANGELOG_UPDATE_PROHIBITED_EXPENSES',
                    UPDATE_COMMUTER_EXCLUSIONS: 'POLICYCHANGELOG_UPDATE_COMMUTER_EXCLUSIONS',
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
                    RENAME_CARD_FEED: 'POLICYCHANGELOG_RENAME_CARD_FEED',
                    ASSIGN_COMPANY_CARD: 'POLICYCHANGELOG_ASSIGN_COMPANY_CARD',
                    UNASSIGN_COMPANY_CARD: 'POLICYCHANGELOG_UNASSIGN_COMPANY_CARD',
                    UPDATE_CARD_FEED_LIABILITY: 'POLICYCHANGELOG_UPDATE_CARD_FEED_LIABILITY',
                    UPDATE_CARD_FEED_STATEMENT_PERIOD: 'POLICYCHANGELOG_UPDATE_CARD_FEED_STATEMENT_PERIOD',
                    LEAVE_POLICY: 'POLICYCHANGELOG_LEAVE_POLICY',
                    CORPORATE_UPGRADE: 'POLICYCHANGELOG_CORPORATE_UPGRADE',
                    CORPORATE_FORCE_UPGRADE: 'POLICYCHANGELOG_CORPORATE_FORCE_UPGRADE',
                    TEAM_DOWNGRADE: 'POLICYCHANGELOG_TEAM_DOWNGRADE',
                    COPY_OVERVIEW: 'POLICYCHANGELOG_COPY_OVERVIEW',
                    COPY_EMPLOYEES: 'POLICYCHANGELOG_COPY_EMPLOYEES',
                    COPY_REPORT_FIELDS: 'POLICYCHANGELOG_COPY_REPORT_FIELDS',
                    COPY_ACCOUNTING: 'POLICYCHANGELOG_COPY_ACCOUNTING',
                    COPY_RECEIPT_PARTNERS: 'POLICYCHANGELOG_COPY_RECEIPT_PARTNERS',
                    COPY_HR: 'POLICYCHANGELOG_COPY_HR',
                    COPY_CATEGORIES: 'POLICYCHANGELOG_COPY_CATEGORIES',
                    COPY_TAGS: 'POLICYCHANGELOG_COPY_TAGS',
                    COPY_TAXES: 'POLICYCHANGELOG_COPY_TAXES',
                    COPY_TIME_TRACKING: 'POLICYCHANGELOG_COPY_TIME_TRACKING',
                    COPY_WORKFLOWS: 'POLICYCHANGELOG_COPY_WORKFLOWS',
                    COPY_RULES: 'POLICYCHANGELOG_COPY_RULES',
                    COPY_CODING_RULES: 'POLICYCHANGELOG_COPY_CODING_RULES',
                    COPY_DISTANCE: 'POLICYCHANGELOG_COPY_DISTANCE',
                    COPY_PER_DIEM: 'POLICYCHANGELOG_COPY_PER_DIEM',
                    COPY_INVOICES: 'POLICYCHANGELOG_COPY_INVOICES',
                    COPY_TRAVEL: 'POLICYCHANGELOG_COPY_TRAVEL',
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
            LINKED_MESSAGE_OFFSET: 40,
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
        },
        CAROUSEL_MAX_WIDTH_WIDE: 680,
        LAST_MESSAGE_TEXT_MAX_LENGTH: 200,
        MIN_LENGTH_LAST_MESSAGE_WITH_ELLIPSIS: 20,
        OWNER_EMAIL_FAKE: '__FAKE__',
        OWNER_ACCOUNT_ID_FAKE: 0,
        DEFAULT_REPORT_NAME: 'Chat Report',
        // Not translated because default report names are not translated on the backend (matches Expensify Classic behavior)
        DEFAULT_EXPENSE_REPORT_NAME: 'New Report',
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
            WAITING_TO_MARK_AS_DONE: 'waitingToMarkAsDone',
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
            REJECTED_REPORT: 'rejectedReport',
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
        LAYOUT_OPTION: {
            DETAILED: 'detailed',
            MATRIX: 'matrix',
        },
    } as const,
    UNREPORTED_EXPENSES_PAGE_SIZE: 50,
    COMPOSER: {
        NATIVE_ID: 'composer',
        MAX_LINES: 16,
        MAX_LINES_SMALL_SCREEN: 6,
        MAX_LINES_LANDSCAPE_MODE: 2,
        // The minimum height needed to enable the full screen composer
        FULL_COMPOSER_MIN_HEIGHT: 60,
        // Max number of animation frames to wait for the composer's clearWorklet ref to re-attach before giving up.
        // The composer lives on an RNSScreen that react-native-screens freezes while another screen (e.g. the
        // attachment preview) is on top, so its imperative handle can be briefly missing right after navigating back.
        CLEAR_WORKLET_MAX_RETRIES: 60,
        /**
         * TestIDs for the main report composer vs inline message editor (E2E / integration tests only).
         * See tests/ui/ReportActionMessageEditLayoutTest.tsx
         */
        TEST_ID: {
            REPORT_ACTION_COMPOSE: 'reportActionCompose',
            DRAFT_MESSAGE_ACTION_ROW: 'reportActionCompose_draftMessageActionRow',
            EDITING_MESSAGE_ACTION_ROW: 'reportActionCompose_editingMessageActionRow',
            REPORT_ACTION_ITEM_MESSAGE_EDIT: 'reportActionItemMessageEdit',
            MESSAGE_EDIT_CANCEL_MAIN_COMPOSER: 'messageEditCancel_mainComposer',
            MESSAGE_EDIT_CANCEL_INLINE: 'messageEditCancel_inlineMessageEdit',
        },
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
            DEFAULT_IN: ANIMATION_TIMING_DEFAULT_IN,
            DEFAULT_OUT: ANIMATION_TIMING_DEFAULT_OUT,
            DEFAULT_RIGHT_DOCKED_IOS_IN: ANIMATION_TIMING_DEFAULT_RIGHT_DOCKED_IOS_IN,
            DEFAULT_RIGHT_DOCKED_IOS_OUT: ANIMATION_TIMING_DEFAULT_RIGHT_DOCKED_IOS_OUT,
            FAB_IN: ANIMATION_TIMING_FAB_IN,
            FAB_OUT: ANIMATION_TIMING_FAB_OUT,
            RHP_DURATION_IN_WEB: 150,
            RHP_DURATION_OUT_WEB: 100,
            CENTERED_DURATION_IN_WEB: 120,
            CENTERED_DURATION_OUT_WEB: 80,
            NARROW_SLIDE_DURATION_IN_WEB: 300,
            NARROW_SLIDE_DURATION_OUT_WEB: 200,
        },
        RHP_ENTER_OFFSET_PX_WEB: 60,
    },
    FAB_MENU_ITEM_IDS: {
        QUICK_ACTION: 'quick-action',
        EXPENSE: 'expense',
        TRACK_DISTANCE: 'track-distance',
        CREATE_REPORT: 'create-report',
        NEW_CHAT: 'new-chat',
        INVOICE: 'invoice',
        TRAVEL: 'travel',
        NEW_WORKSPACE: 'new-workspace',
    },
    TIMING: {
        SHOW_LOADING_SPINNER_DEBOUNCE_TIME: 250,
        TEST_TOOLS_MODAL_THROTTLE_TIME: 800,
        TOOLTIP_SENSE: 1000,
        COMMENT_LENGTH_DEBOUNCE_TIME: 1500,
        DRAFT_SAVE_DEBOUNCE_TIME: 1000,
        SEARCH_OPTION_LIST_DEBOUNCE_TIME: 300,
        ACCESSIBILITY_ANNOUNCEMENT_DEBOUNCE_TIME: 1000,
        SUGGESTION_DEBOUNCE_TIME: 100,
        RESIZE_DEBOUNCE_TIME: 100,
        UNREAD_UPDATE_DEBOUNCE_TIME: 300,
        USE_DEBOUNCED_STATE_DELAY: 300,
        LIST_SCROLLING_DEBOUNCE_TIME: 200,
        LOCATION_UPDATE_INTERVAL: 5000,
        PLAY_SOUND_MESSAGE_DEBOUNCE_TIME: 500,
        NOTIFY_NEW_ACTION_DELAY: 700,
        SKELETON_ANIMATION_SPEED: 3,
        SHOW_HOVER_PREVIEW_DELAY: 270,
        SHOW_HOVER_PREVIEW_ANIMATION_DURATION: 250,
        ACTIVITY_INDICATOR_TIMEOUT: 10000,
        GET_INITIAL_URL_TIMEOUT: 10000,
        MIN_SMOOTH_SCROLL_EVENT_THROTTLE: 16,
    },
    DEFERRED_LAYOUT_WRITE_KEYS: {
        SEARCH: 'search',
        DISMISS_MODAL: 'dismiss_modal',
    },
    TELEMETRY: {
        CONTEXT_FULLSTORY: 'Fullstory',
        CONTEXT_MEMORY: 'Memory',
        CONTEXT_POLICIES: 'Policies',
        // Breadcrumb names
        BREADCRUMB_CATEGORY_MEMORY: 'system.memory',
        BREADCRUMB_CATEGORY_MFA: 'mfa',
        BREADCRUMB_CATEGORY_3DS_NAVIGATION: '3ds.navigation',
        BREADCRUMB_CATEGORY_3DS_AUTHORIZE: '3ds.authorize',
        BREADCRUMB_CATEGORY_BOOTSPLASH_FLOW: 'bootsplash.flow',
        BREADCRUMB_CATEGORY_MODULE_INIT: 'module.init',
        BREADCRUMB_CATEGORY_SCRIPT_LOAD: 'script.load',
        BREADCRUMB_MEMORY_PERIODIC: 'Periodic memory check',
        BREADCRUMB_MEMORY_FOREGROUND: 'App foreground - memory check',
        TAGS: {
            ACTIVE_POLICY: 'active_policy_id',
            POLICIES_COUNT: 'policies_count',
            REPORTS_COUNT: 'reports_count',
            PERSONAL_DETAILS_COUNT: 'personal_details_count',
            USER_ROLE: 'user_role',
            NUDGE_MIGRATION_COHORT: 'nudge_migration_cohort',
            AUTHENTICATION_FUNCTION: 'authentication_function',
            AUTHENTICATION_ERROR_TYPE: 'authentication_error_type',
            AUTHENTICATION_JSON_CODE: 'authentication_json_code',
            EXPENSE_ERROR_TYPE: 'expense_error_type',
            EXPENSE_ERROR_SOURCE: 'expense_error_source',
            EXPENSE_IS_REQUEST_PENDING: 'expense_is_request_pending',
            EXPENSE_HAS_RECEIPT: 'expense_has_receipt',
            EXPENSE_COMMAND: 'expense_command',
            EXPENSE_JSON_CODE: 'expense_json_code',
            MFA_SCENARIO: 'mfa_scenario',
            MFA_ERROR_REASON: 'mfa_error_reason',
            BUILD_TYPE: 'build_type',
        },
        EXPENSE_ERROR_TYPE: {
            REPORT_CREATION_FAILED: 'report_creation_failed',
            TRANSACTION_MISSING: 'transaction_missing',
            API_ERROR: 'api_error',
            OPEN_REPORT_FAILED: 'open_report_failed',
        },
        EXPENSE_ERROR_SOURCE: {
            TRANSACTION: 'transaction',
            REPORT_ACTION: 'report_action',
            REPORT_CREATION: 'report_creation',
            API_RESPONSE: 'api_response',
        },
        BUILD_TYPE_HYBRID_APP: 'hybrid_app',
        BUILD_TYPE_STANDALONE: 'standalone',
        // Span names
        SPAN_OPEN_REPORT: 'ManualOpenReport',
        SPAN_APP_STARTUP: 'ManualAppStartup',
        SPAN_APP_STARTUP_NETWORK_REQUEST: 'ManualAppStartupNetworkRequest',
        SPAN_NAVIGATE_TO_REPORTS: 'ManualNavigateToReports',
        SPAN_NAVIGATE_TO_REPORTS_FIRST_PAINT: 'ManualNavigateToReportsFirstPaint',
        SPAN_NAVIGATE_TO_REPORTS_CONTENT_LOAD: 'ManualNavigateToReportsContentLoad',
        SPAN_NAVIGATE_TO_INBOX_TAB: 'ManualNavigateToInboxTab',
        SPAN_OD_ND_TRANSITION: 'ManualOdNdTransition',
        SPAN_OD_ND_TRANSITION_LOGGED_OUT: 'ManualOdNdTransitionLoggedOut',
        SPAN_OPEN_SEARCH_ROUTER: 'ManualOpenSearchRouter',
        SPAN_SEARCH_ROUTER_MODAL_CLOSE_WAIT: 'SearchRouter.ModalCloseWait',
        SPAN_SEARCH_ROUTER_LIST_RENDER: 'SearchRouter.ListRender',
        SPAN_SEARCH_PAGE_VISIBLE: 'ManualOpenSearchRouterPageVisible',
        SPAN_OPEN_CREATE_EXPENSE: 'ManualOpenCreateExpense',
        SPAN_SHARE_EXTENSION_OPEN_SUBMIT_FLOW: 'ShareExtensionOpenSubmitFlow',
        SPAN_CAMERA_INIT: 'ManualCameraInit',
        SPAN_ENTRY_TO_SCAN: 'ManualEntryToScan',
        SPAN_ENTRY_TO_SCAN_NAVIGATION: 'ManualEntryToScanNavigation',
        SPAN_ENTRY_TO_SCAN_READY: 'ManualEntryToScanReady',
        SPAN_SHUTTER_TO_CONFIRMATION: 'ManualShutterToConfirmation',
        SPAN_THUMBNAIL_GATE: 'ManualThumbnailGate',
        SPAN_RECEIPT_CAPTURE: 'ManualReceiptCapture',
        SPAN_SCAN_PROCESS_AND_NAVIGATE: 'ManualScanProcessAndNavigate',
        SPAN_CONFIRMATION_MOUNT: 'ManualConfirmationMount',
        SPAN_CONFIRMATION_LIST_READY: 'ManualConfirmationListReady',
        SPAN_CONFIRMATION_RECEIPT_LOAD: 'ManualConfirmationReceiptLoad',
        SPAN_SUBMIT_EXPENSE: 'ManualCreateExpenseSubmit',
        SPAN_SUBMIT_TO_DESTINATION_VISIBLE: 'ManualSubmitToDestinationVisible',
        SPAN_EXPENSE_SERVER_RESPONSE: 'ManualCreateExpenseServerResponse',
        SPAN_GEOLOCATION_WAIT: 'ManualGeolocationWait',
        SPAN_SEND_MESSAGE: 'ManualSendMessage',
        SPAN_NOT_FOUND_PAGE: 'ManualNotFoundPage',
        SPAN_SKELETON: 'ManualSkeleton',
        SPAN_ODOMETER_TO_CONFIRMATION: 'ManualOdometerToConfirmation',
        SPAN_ODOMETER_IMAGE_STITCH: 'ManualOdometerImageStitch',
        SPAN_ODOMETER_IMAGE_CAPTURE: 'ManualOdometerImageCapture',
        SPAN_NAVIGATION_ROOT_READY: 'NavigationRootReady',
        SPAN_BOOTSPLASH: {
            ROOT: 'BootsplashVisible',
            ONYX: 'BootsplashVisibleOnyx',
            ONYX_MIGRATIONS: 'BootsplashVisibleOnyxMigrations',
            PUBLIC_ROOM_CHECK: 'BootsplashVisiblePublicRoomCheck',
            PUBLIC_ROOM_API: 'BootsplashVisiblePublicRoomAPI',
            NAVIGATION: 'BootsplashVisibleNavigation',
            LOCALE: 'BootsplashVisibleLocale',
            DEEP_LINK: 'BootsplashVisibleDeepLink',
            SPLASH_HIDER: 'BootsplashVisibleHider',
        },
        SPAN_LOCALE: {
            ROOT: 'BootsplashVisibleLocale',
            TRANSLATIONS_LOAD: 'LocaleTranslationsLoad',
            EMOJI_IMPORT: 'LocaleEmojiImport',
            EMOJI_TRIE_BUILD: 'LocaleEmojiTrieBuild',
        },
        SPAN_ONYX_DERIVED_COMPUTE: 'OnyxDerivedCompute',
        SPAN_NAVIGATION: {
            ROOT: 'BootsplashVisibleNavigation',
            PUSHER_INIT: 'NavigationPusherInit',
            APP_OPEN: 'NavigationAppOpen',
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
        ATTRIBUTE_CANCELED_BY_SKELETON: 'canceled_by_skeleton',
        ATTRIBUTE_ROUTE_FROM: 'route_from',
        ATTRIBUTE_ROUTE_TO: 'route_to',
        ATTRIBUTE_MIN_DURATION: 'min_duration',
        ATTRIBUTE_FINISHED_MANUALLY: 'finished_manually',
        ATTRIBUTE_IS_WARM: 'is_warm',
        ATTRIBUTE_LAZY_TAB_FALLBACK_SHOWN: 'lazy_tab_fallback_shown',
        // Stamped on the navigate-to-inbox-tab span: wide-layout navigations mount the central report
        // pane in the same commit as the sidebar, so they measure a much bigger workload than narrow ones.
        ATTRIBUTE_WIDE_LAYOUT: 'wide_layout',
        // Stamped on the navigate-to-inbox-tab span when the app-loading skeleton was shown instead of the
        // report list, so durations that include the openApp wait can be excluded from render measurements.
        ATTRIBUTE_SKELETON_SHOWN: 'skeleton_shown',
        ATTRIBUTE_WAS_LIST_EMPTY: 'was_list_empty',
        ATTRIBUTE_SKELETON_PREFIX: 'skeleton.',
        ATTRIBUTE_SCENARIO: 'scenario',
        // Start type stamped on the navigate-to-reports spans: cold, warm_first, or warm_subsequent.
        ATTRIBUTE_START_TYPE: 'start_type',
        // Search query fields parsed from the route, stamped on the navigate-to-reports spans.
        ATTRIBUTE_SEARCH_TYPE: 'search_type',
        ATTRIBUTE_SEARCH_VIEW: 'search_view',
        ATTRIBUTE_SEARCH_GROUP_BY: 'search_group_by',
        ATTRIBUTE_HAS_RECEIPT: 'has_receipt',
        ATTRIBUTE_IS_FROM_GLOBAL_CREATE: 'is_from_global_create',
        /** Sentry span attribute: follow-up action taken after submit (e.g. dismiss_modal_and_open_report, navigate_to_search). */
        ATTRIBUTE_SUBMIT_FOLLOW_UP_ACTION: 'submit_follow_up_action',
        ATTRIBUTE_FAST_PATH_HANDLER: 'fast_path_handler',
        ATTRIBUTE_COMMAND: 'command',
        ATTRIBUTE_JSON_CODE: 'json_code',
        ATTRIBUTE_COLD_START: 'cold_start',
        ATTRIBUTE_TRIGGER: 'trigger',
        ATTRIBUTE_PLATFORM: 'platform',
        ATTRIBUTE_IS_MULTI_SCAN: 'is_multi_scan',
        ATTRIBUTE_SOURCE: 'source',
        ATTRIBUTE_ODOMETER_IMAGE_TYPE: 'odometer_image_type',
        ATTRIBUTE_DURATION_SINCE_NATIVE_APP_STARTUP_MS: 'duration_since_native_app_startup_ms',
        /** Which report-actions skeleton cancelled a send-message span (value of the canceled_by_skeleton attribute). */
        CANCELED_BY_SKELETON: {
            REPORT_ACTIONS_REPORT_DATA_LOADING: 'report_actions_report_data_loading',
            REPORT_ACTIONS_APP_LOAD: 'report_actions_app_load',
            SKELETON_GUARD_LOADING: 'skeleton_guard_loading',
            SKELETON_GUARD_DERIVED_TIMING: 'skeleton_guard_derived_timing',
        },
        /** Follow-up action after expense submit (action-based; used as submit_follow_up_action in span). */
        SUBMIT_FOLLOW_UP_ACTION: {
            DISMISS_MODAL_AND_OPEN_REPORT: 'dismiss_modal_and_open_report',
            NAVIGATE_TO_SEARCH: 'navigate_to_search',
            DISMISS_MODAL_ONLY: 'dismiss_modal_only',
        },
        FAST_PATH_HANDLER: {
            SEARCH_PRE_INSERT: 'search_pre_insert',
            REPORT_PRE_INSERT: 'report_pre_insert',
            DISMISS_MODAL: 'dismiss_modal',
            DISMISS_TO_REPORT: 'dismiss_to_report',
            REPORT_IN_RHP_DISMISS: 'report_in_rhp_dismiss',
            SEARCH_DISMISS: 'search_dismiss',
            DEFAULT: 'default',
        },
        SUBMIT_OPTIMIZATION: {
            PRE_INSERT: 'pre_insert',
            DISMISS_FIRST: 'dismiss_first',
            DEFERRED_WRITE: 'deferred_write',
        },
        /** Trigger for useSubmitToDestinationVisible: end span on focus vs on layout. */
        SUBMIT_TO_DESTINATION_VISIBLE_TRIGGER: {
            FOCUS: 'focus',
            LAYOUT: 'layout',
        },
        SUBMIT_EXPENSE_SCENARIO: {
            REQUEST_MONEY_MANUAL: 'request_money_manual',
            REQUEST_MONEY_SCAN: 'request_money_scan',
            DISTANCE: 'distance',
            TRACK_EXPENSE: 'track_expense',
            SPLIT: 'split',
            SPLIT_RECEIPT: 'split_receipt',
            SPLIT_GLOBAL: 'split_global',
            INVOICE: 'invoice',
            PER_DIEM: 'per_diem',
            SEND_MONEY: 'send_money',
        },
        // Start type stamped on the navigate-to-reports spans: cold, warm on the first render (warm_first),
        // or warm on a cached re-visit (warm_subsequent). UNKNOWN is a fallback that signals a bug.
        NAVIGATE_TO_REPORTS_START_TYPE: {
            COLD: 'cold',
            WARM_FIRST: 'warm_first',
            WARM_SUBSEQUENT: 'warm_subsequent',
            UNKNOWN: 'unknown',
        },
        // Event names
        EVENT_SKELETON_ATTRIBUTES_UPDATE: 'skeleton_attributes_updated',
        CONFIG: {
            SKELETON_MIN_DURATION: 10_000,
            MEMORY_TRACKING_INTERVAL: 2 * 60 * 1000,

            // Web Memory Thresholds (% of jsHeapSizeLimit)
            MEMORY_THRESHOLD_WEB_CRITICAL: 85,
            MEMORY_THRESHOLD_WEB_WARNING: 70,

            // Android Memory Thresholds (% of device RAM - temporary solution)
            MEMORY_THRESHOLD_ANDROID_CRITICAL: 85, // > 85% of device RAM
            MEMORY_THRESHOLD_ANDROID_WARNING: 70, // > 70% of device RAM

            // iOS Memory Thresholds (absolute MB - no heap limit API available)
            MEMORY_THRESHOLD_IOS_CRITICAL_MB: 600, // > 600MB approaching jetsam on older devices
            MEMORY_THRESHOLD_IOS_WARNING_MB: 300, // > 300MB monitor closely
        },
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    INBOX_TAB: {
        ALL: 'all',
        TODO: 'todo',
        UNREAD: 'unread',
    },
    THEME: {
        DEFAULT: 'system',
        FALLBACK: 'dark',
        DARK: 'dark',
        LIGHT: 'light',
        SYSTEM: 'system',
        DARK_CONTRAST: 'dark-contrast',
        LIGHT_CONTRAST: 'light-contrast',
        SYSTEM_CONTRAST: 'system-contrast',
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
            SPLIT_DRAFT: 'splitDraft',
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
        ALREADY_CREATED: 'AlreadyCreated',

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
        ALREADY_CREATED_TRANSACTION: 'Transaction already created.',
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
        MAX_REQUEST_RETRIES: 10,
        MAX_OPEN_APP_REQUEST_RETRIES: 2,
        SUSTAINED_FAILURE_THRESHOLD_COUNT: 3,
        SUSTAINED_FAILURE_WINDOW_MS: 10 * 1000,
        RECONNECT_STAMPEDE_JITTER_MS: 5000,
        STALLED_UPDATES_FETCH_BACKOFF_TIME_MS: 60 * 1000,
    },
    // The number of milliseconds for an idle session to expire
    SESSION_EXPIRATION_TIME_MS: 2 * 3600 * 1000, // 2 hours
    WEEK_STARTS_ON: 1, // Monday
    DEFAULT_TIME_ZONE: {automatic: true, selected: 'America/Los_Angeles'},
    DEFAULT_ACCOUNT_DATA: {errors: null, success: '', isLoading: false},
    DEFAULT_CLOSE_ACCOUNT_DATA: {errors: null, success: '', isLoading: false},
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

    PUSHER: {
        PRIVATE_USER_CHANNEL_PREFIX: 'private-encrypted-user-accountID-',
        PRIVATE_REPORT_CHANNEL_PREFIX: 'private-report-reportID-',
        STATE: {
            CONNECTED: 'CONNECTED',
            DISCONNECTED: 'DISCONNECTED',
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

    MAGIC_CODE_LENGTH: 6,
    MAGIC_CODE_EMPTY_CHAR: ' ',

    KEYBOARD_TYPE: {
        VISIBLE_PASSWORD: 'visible-password',
        ASCII_CAPABLE: 'ascii-capable',
        PHONE_PAD: 'phone-pad',
        NUMBER_PAD: 'number-pad',
        DECIMAL_PAD: 'decimal-pad',
        NUMBERS_AND_PUNCTUATION: 'numbers-and-punctuation',
    },

    KEYBOARD_SUBMIT_BEHAVIOR: {
        DISMISS_THEN_SUBMIT: 'dismiss-then-submit',
        SUBMIT_AND_DISMISS: 'submit-and-dismiss',
        SUBMIT_ONLY: 'submit-only',
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

    YOUR_LOCATION_TEXT: 'Your Location',

    ATTACHMENT_MESSAGE_TEXT: '[Attachment]',
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

    IMAGE_CACHE_FILE_TYPES: {
        'image/webp': 'webp',
        'image/png': 'png',
        'image/apng': 'png',
        'image/avif': 'avif',
        'image/jpeg': 'jpg',
        'image/jpg': 'jpg',
        'image/gif': 'gif',
        'image/svg+xml': 'svg',
        'image/x-icon': 'ico',
        'image/vnd.microsoft.icon': 'ico',
        'image/heic': 'heic',
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
        HEIF: 'image/heif',
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

    DEFAULT_ATTACHMENT_FILENAME: 'chat_attachment',

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

    IMAGE_LOADING_PRIORITY: {
        LOW: 'low',
        NORMAL: 'normal',
        HIGH: 'high',
    },

    FILE_TYPE_REGEX: {
        // Image MimeTypes allowed by iOS photos app.
        IMAGE: /\.(jpg|jpeg|png|webp|gif|tiff|bmp|heic|heif)$/,
        // Video MimeTypes allowed by iOS photos app.
        VIDEO: /\.(mov|mp4)$/,
    },

    FILE_VALIDATION_ERRORS: {
        FILE_INVALID: 'fileInvalid',
        WRONG_FILE_TYPE: 'wrongFileType',
        FILE_TOO_LARGE: 'fileTooLarge',
        FILE_TOO_SMALL: 'fileTooSmall',
        FILE_CORRUPTED: 'fileCorrupted',
        PROTECTED_FILE: 'protectedFile',
        HEIC_OR_HEIF_IMAGE: 'heicOrHeifImage',
        IMAGE_DIMENSIONS_TOO_LARGE: 'imageDimensionsTooLarge',
        FOLDER_NOT_ALLOWED: 'folderNotAllowed',
        MAX_FILE_LIMIT_EXCEEDED: 'maxFileLimitExceeded',
    },

    IOS_CAMERA_ROLL_ACCESS_ERROR: 'Access to photo library was denied',
    EMOJI_PICKER_ITEM_TYPES: {
        HEADER: 'header',
        EMOJI: 'emoji',
        SPACER: 'spacer',
    },
    EMOJI_PICKER_SIZE: {
        WIDTH: 320,
        HEIGHT: 416,
    },
    CATEGORY_SHORTCUT_BAR_HEIGHT: 32,
    SMALL_EMOJI_PICKER_SIZE: {
        WIDTH: '100%',
    },
    MENU_POSITION_REPORT_ACTION_COMPOSE_BOTTOM: 83,
    NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT: 300,
    EMOJI_PICKER_ITEM_HEIGHT: 32,
    EMOJI_PICKER_HEADER_HEIGHT: 32,
    AUTO_COMPLETE_SUGGESTER: {
        SUGGESTER_INNER_PADDING: 8,
        SUGGESTION_ROW_HEIGHT: 40,
        SMALL_CONTAINER_HEIGHT_FACTOR: 2.5,
        SMALL_CONTAINER_HEIGHT_FACTOR_LANDSCAPE_MODE: 1.5,
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
    EXPENSIFY_PARTNER_NAME: 'expensify.com',
    EXPENSIFY_MERCHANT: 'Expensify, Inc.',
    EMAIL,

    FULLSTORY: {
        CLASS: {
            MASK: 'fs-mask',
            UNMASK: 'fs-unmask',
            EXCLUDE: 'fs-exclude',
        },
        OPERATION: {
            TRACK_EVENT: 'trackEvent',
            OBSERVE: 'observe',
            RESTART: 'restart',
            SET_IDENTITY: 'setIdentity',
            SET_PROPERTIES: 'setProperties',
            SHUTDOWN: 'shutdown',
        },
    },

    CONCIERGE_DISPLAY_NAME: 'Concierge',
    CONCIERGE_GREETING_ACTION_ID: 'concierge-greeting',

    INTEGRATION_ENTITY_MAP_TYPES: {
        DEFAULT: 'DEFAULT',
        NONE: 'NONE',
        TAG: 'TAG',
        REPORT_FIELD: 'REPORT_FIELD',
        NOT_IMPORTED: 'NOT_IMPORTED',
        IMPORTED: 'IMPORTED',
        NETSUITE_DEFAULT: 'NETSUITE_DEFAULT',
    },

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
        TRAVEL_INVOICING_PAYABLE_ACCOUNT: 'travelInvoicingPayableAccountID',
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
        SYNC_ITEMS: 'syncItems',
        SYNC_TAX: 'syncTax',
        EXPORT: 'export',
        EXPORTER: 'exporter',
        EXPORT_DATE: 'exportDate',
        NON_REIMBURSABLE_EXPENSES_ACCOUNT: 'nonReimbursableExpensesAccount',
        NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'nonReimbursableExpensesExportDestination',
        REIMBURSABLE_EXPENSES_ACCOUNT: 'reimbursableExpensesAccount',
        REIMBURSABLE_EXPENSES_EXPORT_DESTINATION: 'reimbursableExpensesExportDestination',
        NON_REIMBURSABLE_BILL_DEFAULT_VENDOR: 'nonReimbursableBillDefaultVendor',
        NON_REIMBURSABLE_CREDIT_CARD_DEFAULT_VENDOR: 'nonReimbursableCreditCardDefaultVendor',
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
        TRAVEL_INVOICING_VENDOR: 'travelInvoicingVendorID',
        TRAVEL_INVOICING_PAYABLE_ACCOUNT: 'travelInvoicingPayableAccountID',
    },

    XERO_CONFIG: {
        AUTO_SYNC: 'autoSync',
        ENABLED: 'enabled',
        REIMBURSEMENT_ACCOUNT_ID: 'reimbursementAccountID',
        INVOICE_COLLECTIONS_ACCOUNT_ID: 'invoiceCollectionsAccountID',
        SYNC_REIMBURSED_REPORTS: 'syncReimbursedReports',
        ENABLE_NEW_CATEGORIES: 'enableNewCategories',
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
        TRACKING_CATEGORY_OPTIONS: {
            DEFAULT: 'DEFAULT',
            TAG: 'TAG',
            REPORT_FIELD: 'REPORT_FIELD',
        },
        ACCOUNTING_METHOD: 'accountingMethod',
        TRAVEL_INVOICING_PAYABLE_ACCOUNT: 'travelInvoicingPayableAccountID',
    },

    SAGE_INTACCT_MAPPING_VALUE: {
        NONE: 'NONE',
        DEFAULT: 'DEFAULT',
        TAG: 'TAG',
        REPORT_FIELD: 'REPORT_FIELD',
    },

    CERTINIA_PREREQUISITES: {
        PAGE_NAME: {
            INSTALL_BUNDLE: 'installBundle',
            SETUP_CONTACTS: 'setupContacts',
            OAUTH: 'oauth',
        },
        STEP_INDEX_LIST: ['1', '2', '3'],
    },

    /** Salesforce package install URLs for the Certinia Expensify bundles (see help: Connect to Certinia). */
    CERTINIA_PSA_BUNDLE_INSTALL_URL: {
        PRODUCTION: 'https://login.salesforce.com/packaging/installPackage.apexp?p0=04t2M000002J0BH',
        SANDBOX: 'https://test.salesforce.com/packaging/installPackage.apexp?p0=04t2M000002J0BH',
    },
    CERTINIA_FFA_BUNDLE_INSTALL_URL: {
        PRODUCTION: 'https://login.salesforce.com/packaging/installPackage.apexp?p0=04t4p000001UQVo',
        SANDBOX: 'https://test.salesforce.com/packaging/installPackage.apexp?p0=04t4p000001UQVo',
    },

    CERTINIA_PSA_BUNDLE_VERSION: '1.3',
    CERTINIA_FFA_BUNDLE_VERSION: '1.4',

    CERTINIA_CONFIG: {
        COMPANY_ID: 'companyID',
        EXPORTER: 'exporter',
        EXPORT_STATUS: 'exportStatus',
        EXPORT_DATE: 'exportDate',
        VENDOR_ACCOUNT: 'vendorAccount',
        REIMBURSABLE: 'reimbursable',
        NON_REIMBURSABLE: 'nonReimbursable',
        CODING_DIMENSION1: 'dimension1',
        CODING_DIMENSION2: 'dimension2',
        CODING_DIMENSION3: 'dimension3',
        CODING_DIMENSION4: 'dimension4',
        SYNC_TAX: 'syncTax',
        AUTO_SYNC_ENABLED: 'autoSyncEnabled',
        SYNC_REIMBURSED_REPORTS: 'syncReimbursedReports',
        PARENT_TAG_MAPPING: 'parentTagMapping',
        SYNC_MILESTONES: 'syncMilestones',
        TAX_NON_BILLABLE: 'taxNonBillable',
        EXPORT_FOREIGN_CURRENCY: 'exportForeignCurrency',
        COMPANY: 'company',
    },

    // These are the native values stored in the connection's export.exportStatus config, shared with
    // OldDot and pushed to Certinia at export time. COMPLETE/IN_PROGRESS apply to FFA, APPROVED/SUBMITTED to PSA.
    CERTINIA_EXPORT_STATUS: {
        COMPLETE: 'Complete',
        IN_PROGRESS: 'In Progress',
        APPROVED: 'Approved',
        SUBMITTED: 'Submitted',
    },

    CERTINIA_REPORT_EXPORT_STATUS: {
        APPROVED: 'Approved',
        SUBMITTED: 'Submitted',
    },

    CERTINIA_EXPORT_DATE: {
        LAST_EXPENSE: 'LAST_EXPENSE',
        REPORT_SUBMITTED: 'REPORT_SUBMITTED',
        REPORT_EXPORTED: 'REPORT_EXPORTED',
    },

    CERTINIA_MAPPING_VALUE: {
        DEFAULT: 'DEFAULT',
        TAG: 'TAG',
        REPORT_FIELD: 'REPORT_FIELD',
    },

    /** FFA vs PSA expense export destination */
    CERTINIA_EXPORT_DESTINATION: {
        PAYABLE_INVOICE: 'PAYABLE_INVOICE',
        EXPENSE_REPORT: 'EXPENSE_REPORT',
    },

    /** PSA parent tag mapping mode */
    CERTINIA_PARENT_TAG_MAPPING: {
        PARENT_TAG_PROJECTS_AND_ASSIGNMENTS: 'PROJECTS_AND_ASSIGNMENTS',
        PARENT_TAG_PROJECTS: 'PROJECTS',
        PARENT_TAG_ASSIGNMENTS: 'ASSIGNMENTS',
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
        SYNC_REIMBURSED_REPORTS: 'syncReimbursedReports',
        REIMBURSEMENT_ACCOUNT_ID: 'reimbursementAccountID',
        ENTITY: 'entity',
        DIMENSION_PREFIX: 'dimension_',
        ACCOUNTING_METHOD: 'accountingMethod',
        TRAVEL_INVOICING_PAYABLE_ACCOUNT: 'travelInvoicingPayableAccountID',
    },

    SAGE_INTACCT: {
        APPROVAL_MODE: {
            APPROVAL_MANUAL: 'APPROVAL_MANUAL',
        },
    },

    GUSTO: {
        APPROVAL_MODE: {
            BASIC: 'APPROVAL_SUBMIT_AND_APPROVE',
            MANAGER: 'APPROVAL_ADVANCED',
            CUSTOM: 'APPROVAL_MANUAL',
        },
    },

    ZENEFITS: {
        APPROVAL_MODE: {
            BASIC: 'APPROVAL_SUBMIT_AND_APPROVE',
            MANAGER: 'APPROVAL_ADVANCED',
            CUSTOM: 'APPROVAL_MANUAL',
        },
    },

    MERGE_HR: {
        APPROVAL_MODE: {
            BASIC: 'basic',
            MANAGER: 'manager',
            CUSTOM: 'custom',
        },
        COOKIE_CLEAR_DELAY_MS: 500,
        SYNC_STATUS: {
            SYNCING: 'SYNCING',
            DONE: 'DONE',
            FAILED: 'FAILED',
            DISABLED: 'DISABLED',
        },
        SYNC_TYPE: {
            INITIAL: 'initial',
            MANUAL: 'manual',
            AUTO: 'auto',
            WEBHOOK: 'webhook',
        },

        /** Maximum number of manual syncs ("Sync now") allowed within the rolling window */
        MANUAL_SYNC_LIMIT: 2,

        /** Rolling window (in milliseconds) over which manual syncs are counted against MANUAL_SYNC_LIMIT (24 hours) */
        MANUAL_SYNC_WINDOW_MS: 24 * 60 * 60 * 1000,
    },

    QUICKBOOKS_REIMBURSABLE_ACCOUNT_TYPE: {
        VENDOR_BILL: 'bill',
        CHECK: 'check',
        JOURNAL_ENTRY: 'journal_entry',
    },

    QUICKBOOKS_NON_REIMBURSABLE_ACCOUNT_TYPE: {
        CREDIT_CARD: 'credit_card',
        DEBIT_CARD: 'debit_card',
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
        TRAVEL_INVOICING_PAYABLE_ACCOUNT: 'travelInvoicingPayableAccountID',
        TRAVEL_INVOICING_JOURNAL_POSTING_PREFERENCE: 'travelInvoicingJournalPostingPreference',
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
        TOKEN_INPUT: {
            STEP_INDEX_LIST: ['1', '2', '3', '4'],
            PAGE_NAME: {
                INSTALL: 'install',
                AUTHENTICATION: 'authentication',
                SOAP: 'soap',
                ACCESS_TOKEN: 'access-token',
                CREDENTIALS: 'credentials',
            },
            STEP_KEYS: {
                install: 'installBundle',
                authentication: 'enableTokenAuthentication',
                soap: 'enableSoapServices',
                'access-token': 'createAccessToken',
                credentials: 'enterCredentials',
            },
        },
        IMPORT_CUSTOM_FIELDS: {
            CUSTOM_SEGMENTS: 'customSegments',
            CUSTOM_LISTS: 'customLists',
        },
        CUSTOM_SEGMENT_FIELDS: ['segmentName', 'internalID', 'scriptID', 'mapping'],
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
        NETSUITE_ADD_CUSTOM_SEGMENT: {
            STEP_INDEX_LIST: ['1', '2', '3', '4', '5', '6'],
            PAGE_NAME: {
                TYPE: 'type',
                NAME: 'name',
                INTERNAL_ID: 'internal-id',
                SCRIPT_ID: 'script-id',
                MAPPING_TITLE: 'mapping-title',
                CONFIRM: 'confirm',
            },
        },
        NETSUITE_ADD_CUSTOM_LIST: {
            STEP_INDEX_LIST: ['1', '2', '3', '4'],
            PAGE_NAME: {
                NAME: 'name',
                FIELD_ID: 'field-id',
                MAPPING_TITLE: 'mapping-title',
                CONFIRM: 'confirm',
            },
        },
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

    RILLET_CONFIG: {
        SUBSIDIARY_ID: 'subsidiaryID',
        ENABLE_NEW_CATEGORIES: 'enableNewCategories',
        SYNC_TAX_RATES: 'syncTaxRates',
        EXPORTER: 'exporter',
        EXPORT_DATE: 'exportDate',
        REIMBURSABLE: 'reimbursable',
        COMPANY_CARD: 'companyCard',
        DEFAULT_VENDORID: 'defaultVendorID',
        CREDIT_CARD_ACCOUNTCODE: 'creditCardAccountCode',
        EXPORT_TO_MULTIPLE_ACCOUNTS: 'exportToMultipleAccounts',
        CARD_PROGRAM_ACCOUNTS: 'cardProgramAccounts',
        ACCOUNTING_METHOD: 'accountingMethod',
        AUTO_SYNC: 'autoSync',
        SYNC_REIMBURSED_REPORTS: 'syncReimbursedReports',
        BILL_PAYMENT_ACCOUNT_CODE: 'billPaymentAccountCode',
        SYNC_EXPENSIFY_CARD_SETTLEMENTS: 'syncExpensifyCardSettlements',
        SETTLEMENTS_BANK_ACCOUNT_ID: 'settlementsBankAccountID',
        SYNC_TRAVEL_INVOICING_SETTLEMENTS: 'syncTravelInvoicingSettlements',
        TRAVEL_INVOICING_SETTLEMENTS_BANK_ACCOUNT_ID: 'travelInvoicingSettlementsBankAccountID',
        FIELD_MAPPING_PREFIX: 'fieldMapping_',
    },

    RILLET_MAPPING_VALUE: {
        NONE: 'NONE',
        TAG: 'TAG',
    },

    RILLET_EXPORT_REIMBURSABLE: {
        VENDOR_BILL: 'VENDOR_BILL',
    },

    RILLET_EXPORT_COMPANY_CARD: {
        CREDIT_CARD: 'CREDIT_CARD',
    },

    RILLET_EXPORT_DATE: {
        LAST_EXPENSE: 'LAST_EXPENSE',
        REPORT_EXPORTED: 'REPORT_EXPORTED',
        REPORT_SUBMITTED: 'REPORT_SUBMITTED',
    },

    RILLET_ACCOUNT_STATUS: {
        ACTIVE: 'ACTIVE',
        INACTIVE: 'INACTIVE',
    },

    RILLET_ACCOUNT_TYPE: {
        ASSET: 'ASSET',
        LIABILITY: 'LIABILITY',
        EQUITY: 'EQUITY',
        EXPENSE: 'EXPENSE',
        INCOME: 'INCOME',
    },

    RILLET_ACCOUNT_SUBTYPE: {
        CREDIT_CARD: 'Credit Card',
    },

    UPDATE_PERSONAL_BANK_ACCOUNT: {
        PAGE_NAME: {
            LEGAL_NAME: 'legal-name',
            ADDRESS: 'address',
            PHONE_NUMBER: 'phone-number',
        },
    },

    MISSING_PERSONAL_DETAILS: {
        STEP_INDEX_LIST: ['1', '2', '3', '4'],
        STEP_INDEX_LIST_WITH_PIN: ['1', '2', '3', '4', '5'],
        PAGE_NAME: {
            LEGAL_NAME: 'legal-name',
            DATE_OF_BIRTH: 'date-of-birth',
            ADDRESS: 'address',
            PHONE_NUMBER: 'phone-number',
            PIN: 'pin',
            CONFIRM: 'confirm',
        },
    },

    SUBSCRIPTION_SIZE: {
        PAGE_NAME: {
            SIZE: 'size',
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
        MAPPING_WITH_PIN: {
            LEGAL_NAME: 0,
            DATE_OF_BIRTH: 1,
            ADDRESS: 2,
            PHONE_NUMBER: 3,
            PIN: 4,
            CONFIRM: 5,
        },
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
        QA_GUIDE: Number(Config?.EXPENSIFY_ACCOUNT_ID_QA_GUIDE ?? 14365522),
    },

    ENVIRONMENT: {
        DEV: 'development',
        STAGING: 'staging',
        PRODUCTION: 'production',
        ADHOC: 'adhoc',
    },

    ENABLE_PAYMENTS: {
        PAGE_NAMES: {
            ADD_BANK_ACCOUNT: 'add-bank-account',
            PERSONAL_INFO: 'personal-info',
            VERIFY_IDENTITY: 'verify-identity',
            FEES_AND_TERMS: 'fees-and-terms',
        },
        ADD_BANK_ACCOUNT_STEP: {
            SUB_PAGE_NAMES: {
                PLAID: 'plaid',
                CONFIRMATION: 'confirmation',
            },
        },
        PERSONAL_INFO_STEP: {
            SUB_PAGE_NAMES: {
                LEGAL_NAME: 'legal-name',
                DATE_OF_BIRTH: 'date-of-birth',
                ADDRESS: 'address',
                PHONE_NUMBER: 'phone-number',
                SSN: 'ssn',
                CONFIRMATION: 'confirmation',
            },
        },
        FEES_AND_TERMS_STEP: {
            SUB_PAGE_NAMES: {
                FEES: 'fees',
                TERMS: 'terms',
            },
        },
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
        DEFAULT_DATA: {
            bankName: '',
            plaidAccessToken: '',
            bankAccounts: [] as PlaidBankAccount[],
            isLoading: false,
            errors: {},
        },
        // Redirect URI used by the native Plaid SDK on iOS. It is not a registered app route —
        // the SDK handles the OAuth callback itself, so deep-link handlers must ignore this path.
        OAUTH_REDIRECT_PATH_IOS: 'partners/plaid/oauth_ios',
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
        MAX_RECENT_ATTENDEES: 40,

        // This will guranatee that the quantity input will not exceed 9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER).
        QUANTITY_MAX_LENGTH: 12,
        // This is the transactionID used when going through the create expense flow so that it mimics a real transaction (like the edit flow)
        OPTIMISTIC_TRANSACTION_ID: '1',
        // This is the transactionID used when bulk editing multiple expenses
        OPTIMISTIC_BULK_EDIT_TRANSACTION_ID: 'optimisticBulkEditTransactionID',
        // This is the transactionID used when going through the distance split expense flow so that it mimics a draft transaction
        OPTIMISTIC_DISTANCE_SPLIT_TRANSACTION_ID: '2',
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
        // Destination chosen from the track-expense "Submit" whisper on the Submit (submit2026) plan.
        SUBMIT_DESTINATION: {
            FRIEND: 'friend',
            EMPLOYER: 'employer',
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
        ODOMETER_IMAGE_TYPE: {
            START: 'start',
            END: 'end',
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
        AMOUNT_MAX_LENGTH: 10,
        DISTANCE_REQUEST_AMOUNT_MAX_LENGTH: 14,
        ODOMETER_MAX_VALUE: 9999999.9,
        MAX_SAFE_AMOUNT: 999999999999,
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
        COMPACT_RECEIPT: {
            MAX_WIDTH: variables.receiptPreviewMaxWidth,
            DEFAULT_ASPECT_RATIO: 16 / 9,
            MAX_HEIGHT_PIXEL_ADJUSTMENT: 5,
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
        // Longer duration for growls with an actionable button (e.g. "View"), giving the user enough time to tap it.
        DURATION_WITH_ACTION: 6000,
        // Pixel distance used to park the growl fully offscreen before it slides in. It only needs to
        // exceed the growl's height + margins; the exact value isn't tied to a measured dimension.
        OFFSCREEN_OFFSET: 255,
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

            // Often referred to as "submit" workspaces
            SUBMIT: 'submit2026',
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
            OWNER: 'owner',
            ADMIN: 'admin',
            AUDITOR: 'auditor',
            USER: 'user',
            EDITOR: 'editor',
            CARD_ADMIN: 'cardAdmin',
            PEOPLE_ADMIN: 'peopleAdmin',
            PAYMENTS_ADMIN: 'paymentsAdmin',
        },
        THREE_DOT_MENU_ACTION: {
            LEAVE: 'leave',
            TRANSFER_OWNERSHIP: 'transferOwnership',
        },
        POLICY_FEATURE: {
            OVERVIEW: 'overview',
            MEMBERS: 'members',
            ASSIGN_ELEVATED_ROLES: 'assignElevatedRoles',
            WORKFLOWS: 'workflows',
            WORKFLOWS_APPROVALS: 'workflowsApprovals',
            WORKFLOWS_PAYMENTS: 'workflowsPayments',
            EXPENSIFY_CARD: 'expensifyCard',
            COMPANY_CARDS: 'companyCards',
            CATEGORIES: 'categories',
            TAGS: 'tags',
            TAXES: 'taxes',
            RULES: 'rules',
            DISTANCE_RATES: 'distanceRates',
            PER_DIEM: 'perDiem',
            REPORT_FIELDS: 'reportFields',
            ACCOUNTING: 'accounting',
            MORE_FEATURES: 'moreFeatures',
        },
        POLICY_FEATURE_ACCESS: {
            READ: 'read',
            WRITE: 'write',
        },
        COPY_SETTINGS_MODAL_STEP: {
            LOADING: 'loading',
            COMPLETE: 'complete',
        },
        COPY_SETTINGS_NVP_STATE: {
            IN_PROGRESS: 'in-progress',
            COMPLETE: 'complete',
            FAILED: 'failed',
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
        SECONDARY_ACTIONS: {
            IMPORT_SPREADSHEET: 'importSpreadsheet',
            DOWNLOAD_CSV: 'downloadCSV',
            SETTINGS: 'settings',
            EXPORT: 'export',
            SYNC_WITH_HR: 'syncWithHR',
        },
        MEMBERS_BULK_ACTION_TYPES: {
            REMOVE: 'remove',
            MAKE_MEMBER: 'makeMember',
            MAKE_ADMIN: 'makeAdmin',
            MAKE_AUDITOR: 'makeAuditor',
            MAKE_CARD_ADMIN: 'makeCardAdmin',
            MAKE_PEOPLE_ADMIN: 'makePeopleAdmin',
            MAKE_PAYMENTS_ADMIN: 'makePaymentsAdmin',
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
            IS_HR_ENABLED: 'isHREnabled',
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
        DEFAULT_MCC_GROUPS: {
            airlines: {
                category: 'Travel',
                groupID: 'airlines',
            },
            commuter: {
                category: 'Car',
                groupID: 'commuter',
            },
            gas: {
                category: 'Car',
                groupID: 'gas',
            },
            goods: {
                category: 'Materials',
                groupID: 'goods',
            },
            groceries: {
                category: 'Meals and Entertainment',
                groupID: 'groceries',
            },
            hotel: {
                category: 'Travel',
                groupID: 'hotel',
            },
            mail: {
                category: 'Office Supplies',
                groupID: 'mail',
            },
            meals: {
                category: 'Meals and Entertainment',
                groupID: 'meals',
            },
            rental: {
                category: 'Travel',
                groupID: 'rental',
            },
            services: {
                category: 'Professional Services',
                groupID: 'services',
            },
            taxi: {
                category: 'Travel',
                groupID: 'taxi',
            },
            uncategorized: {
                category: 'Other',
                groupID: 'uncategorized',
            },
            utilities: {
                category: 'Utilities',
                groupID: 'utilities',
            },
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
            GIFT_CARD: 'giftCard',
            HANDWRITTEN_RECEIPT: 'handwrittenReceipt',
        },
        COMMUTER_EXCLUSION_METHOD: {
            FIXED_DISTANCE: 'fixedDistance',
            // R2 will add HOME_AND_OFFICE: 'homeAndOffice'
        },
        // Upper bound for the commuter exclusion fixed distance. Matches the length of the longest road in the world
        COMMUTER_EXCLUSION_MAX_DISTANCE: 19000,
        COMMUTER_EXCLUSION_TYPE: {
            METHOD: 'method',
            FIXED_DISTANCE: 'fixedDistance',
            DISABLED: 'disabled',
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
                CERTINIA: 'financialforce',
                RILLET: 'rillet',
                GUSTO: 'gusto',
                ZENEFITS: 'zenefits',
                MERGE_HR: 'merge_hris',
            },
            SUPPORTED_ONLY_ON_OLDDOT: {
                FINANCIALFORCE: 'financialforce',
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
                CERTINIA: 'certinia',
                RILLET: 'rillet',
                GUSTO: 'gusto',
                ZENEFITS: 'zenefits',
                MERGE_HR: 'merge-hr',
            },
            NAME_USER_FRIENDLY: {
                netsuite: 'NetSuite',
                quickbooksOnline: 'QuickBooks Online',
                quickbooksDesktop: 'QuickBooks Desktop',
                xero: 'Xero',
                intacct: 'Sage Intacct',
                financialforce: 'Certinia',
                rillet: 'Rillet',
                gusto: 'Gusto',
                billCom: 'Bill.com',
                zenefits: 'TriNet',
                merge_hris: 'Merge HR',
                sap: 'SAP',
                oracle: 'Oracle',
                microsoftDynamics: 'Microsoft Dynamics',
                other: 'Other',
            },
            get ACCOUNTING_CONNECTION_NAMES() {
                return [this.NAME.QBO, this.NAME.QBD, this.NAME.XERO, this.NAME.NETSUITE, this.NAME.SAGE_INTACCT, this.NAME.CERTINIA, this.NAME.RILLET] as const;
            },
            get HR_CONNECTION_NAMES() {
                return [this.NAME.GUSTO, this.NAME.ZENEFITS, this.NAME.MERGE_HR] as const;
            },
            get EXPORTED_TO_INTEGRATION_DISPLAY_NAMES(): string[] {
                return this.ACCOUNTING_CONNECTION_NAMES.map((name) => this.NAME_USER_FRIENDLY[name as keyof typeof this.NAME_USER_FRIENDLY]);
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
                GUSTO_SYNC_TITLE: 'gustoSyncTitle',
                GUSTO_SYNC_LOAD_DATA: 'gustoSyncLoadData',
                GUSTO_SYNC_PROVISIONING: 'gustoSyncProvisioning',
                ZENEFITS_SYNC_TITLE: 'zenefitsSyncTitle',
                ZENEFITS_SYNC_LOAD_DATA: 'zenefitsSyncLoadData',
                ZENEFITS_SYNC_PROVISIONING: 'zenefitsSyncProvisioning',
                FINANCIAL_FORCE_SYNC_TITLE: 'financialForceSyncTitle',
                FINANCIAL_FORCE_SYNC_STEP: 'financialForceSyncStep',
                FINANCIAL_FORCE_SYNC_CATEGORIES: 'financialForceSyncCategories',
                FINANCIAL_FORCE_SYNC_TAGS: 'financialForceSyncTags',
                FINANCIAL_FORCE_SYNC_VENDORS: 'financialForceSyncVendors',
                FINANCIAL_FORCE_SYNC_CONTACTS: 'financialForceSyncContacts',
                FINANCIAL_FORCE_SYNC_COMPANIES: 'financialForceSyncCompanies',
                FINANCIAL_FORCE_SYNC_USERS: 'financialForceSyncUsers',
                FINANCIAL_FORCE_SYNC_DIMENSIONS: 'financialForceSyncDimensions',
                FINANCIAL_FORCE_SYNC_MARK_REIMBURSED: 'financialForceMarkAsReimbursed',
                RILLET_SYNC_TITLE: 'rilletSyncTitle',
                RILLET_SYNC_CONNECTION: 'rilletSyncConnection',
                RILLET_SYNC_IMPORT_DATA: 'rilletSyncImportData',
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
        DEFAULT_PROHIBITED_EXPENSES: {
            alcohol: false,
            hotelIncidentals: false,
            gambling: true,
            tobacco: false,
            adultEntertainment: true,
            giftCard: false,
            handwrittenReceipt: false,
        },
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
        UNSET_DISTANCE_RATE_ID: '-1',
        MILES_TO_KILOMETERS: 1.609344,
        KILOMETERS_TO_MILES: 0.621371,
        RATE_STATUS: {
            ACTIVE: 'active',
            FUTURE: 'future',
            EXPIRED: 'expired',
            INACTIVE: 'inactive',
        },
        RATE_FIELD: {
            START_DATE: 'startDate',
            END_DATE: 'endDate',
        },
        RATE_CHANGELOG_UPDATED_FIELD: {
            NAME: 'name',
            RATE: 'rate',
            TAX_RATE_EXTERNAL_ID: 'taxRateExternalID',
            TAX_CLAIMABLE_PERCENTAGE: 'taxClaimablePercentage',
            ENABLED: 'enabled',
            DATE_RANGE: 'dateRange',
        },
    },

    TERMS: {
        CFPB_PREPAID: 'cfpb.gov/prepaid',
        CFPB_COMPLAINT: 'cfpb.gov/complaint',
        FDIC_PREPAID: 'fdic.gov/deposit/deposits/prepaid.html',
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
        // Mostly used for feed details
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
            CSV_CLASSIC: 'csv',
            MOCK_BANK: 'oauth.mockbank.com',
            UPLOAD: 'upload',
        },
        LINK_FEED_TYPE: {
            COMPANY_CARD: 'CompanyCard',
            EXPENSIFY_CARD: 'ExpensifyCard',
        },
        CARD_LIST: 'cardList',
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
        // Countries where the most terminals are "offline," so users must
        // change their PIN at an ATM rather than via the in-app online flow.
        // - Offline-only: GB, IE
        // - Mostly offline: FR
        // - Many offline terminals: FI, IL, IS
        OFFLINE_PIN_MARKETS: ['GB', 'IE', 'FR', 'FI', 'IL', 'IS'] as string[],
        CARD_PROGRAM: {
            CURRENT: 'CURRENT',
        },
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
            SINGLE_USE: 'singleUse',
        },
        LIMIT_VALUE: 21474836,
        STEP_NAMES: ['1', '2', '3', '4', '5'],
        ASSIGNEE_EXCLUDED_STEP_NAMES: ['1', '2', '3', '4'],
        STEP: {
            ASSIGNEE: 'Assignee',
            CARD_TYPE: 'CardType',
            LIMIT_TYPE: 'LimitType',
            CARD_NAME: 'CardName',
            CONFIRMATION: 'Confirmation',
            INVITE_NEW_MEMBER: 'InviteNewMember',
            SPEND_RULES: 'SpendRules',
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
        SPEND_RULE_OPTION: {
            COPY_EXISTING: 'copy',
            CREATE_NEW: 'create',
        },
        MANAGE_EXPENSIFY_CARDS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/expensify-card/Manage-Expensify-Cards',
        PIN: {
            LENGTH: 4,
            INVALID_PINS: [
                '0000',
                '1111',
                '2222',
                '3333',
                '4444',
                '5555',
                '6666',
                '7777',
                '8888',
                '9999',
                '1234',
                '2345',
                '3456',
                '4567',
                '5678',
                '6789',
                '7890',
                '0123',
                '0987',
                '9876',
                '8765',
                '7654',
                '6543',
                '5432',
                '4321',
                '3210',
                '1212',
                '1004',
                '6969',
                '2000',
                '2015',
            ],
        },
        BULK_ACTIONS: {
            EXPORT_CSV: 'exportCSV',
        },
    },
    PERSONAL_CARDS: {
        STEP: {
            SELECT_BANK: 'SelectBank',
            BANK_CONNECTION: 'BankConnection',
            SELECT_COUNTRY: 'SelectCountry',
            PLAID_CONNECTION: 'PlaidConnection',
            SUCCESS: 'Success',
        },
        // Mostly used for get bank details
        BANKS: {
            AMEX: 'American Express',
            BANK_OF_AMERICA: 'Bank of America',
            CAPITAL_ONE: 'Capital One',
            CHASE: 'Chase',
            CITI_BANK: 'Citibank',
            WELLS_FARGO: 'Wells Fargo',
            MOCK_BANK: 'Mock Bank',
            OTHER: 'Other',
        },
        // Mostly used for API calls
        BANK_CONNECTIONS: {
            WELLS_FARGO: 'wellsfargo',
            BANK_OF_AMERICA: 'bankofamerica',
            CHASE: 'chase',
            CAPITAL_ONE: 'capitalone',
            CITI_BANK: 'citibank',
            AMEX: 'americanexpressfdx',
            MOCK_BANK: 'mockbank',
        },
        // Mostly used for feed details
        BANK_NAME: {
            CITIBANK: 'oauth.citibank.com',
            CAPITAL_ONE: 'oauth.capitalone.com',
            BANK_OF_AMERICA: 'oauth.bankofamerica.com',
            CHASE: 'oauth.chase.com',
            WELLS_FARGO: 'oauth.wellsfargo.com',
            AMEX_DIRECT: 'oauth.americanexpressfdx.com',
            AMEX_FILE_DOWNLOAD: 'americanexpressfd.us',
            CSV: 'upload',
        },
    },
    COMPANY_CARDS: {
        BROKEN_CONNECTION_IGNORED_STATUSES: brokenConnectionScrapeStatuses,
        // After a card connection has been broken and unresolved for this many days, stop actively
        // prompting the user: the time-sensitive home task and the RBR are removed (the error itself is kept).
        BROKEN_CONNECTION_DISMISS_AFTER_DAYS: 90,
        WORKSPACE_FEEDS_LOAD_ERROR: 'workspaceFeedsLoadError',
        FEED_LOAD_ERROR: 'feedLoadError',
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
            IMPORT_FROM_FILE: 'ImportFromFile',
        },
        CARD_TYPE: {
            VISA: 'visa',
            CSV: 'CSV',
        },
        CARD_TYPE_NAMES: {
            AMEX: 'American Express',
            VISA: 'Visa',
            MASTERCARD: 'Mastercard',
            STRIPE: 'Stripe',
            CSV: 'CSV',
        },
        FEED_TYPE: {
            CUSTOM: 'customFeed',
            DIRECT: 'directFeed',
            FILE_IMPORT: 'fileImport',
        },
        // Mostly used for get bank details
        BANKS: {
            AMEX: 'American Express',
            BANK_OF_AMERICA: 'Bank of America',
            BREX: 'Brex',
            CAPITAL_ONE: 'Capital One',
            CHASE: 'Chase',
            CITI_BANK: 'Citibank',
            STRIPE: 'Stripe',
            WELLS_FARGO: 'Wells Fargo',
            MOCK_BANK: 'Mock Bank',
            OTHER: 'Other',
            FILE_IMPORT: 'Import transactions from file',
        },
        NON_CONNECTABLE_BANKS: {
            PEX: 'PEX',
        },
        // Mostly used for API calls
        BANK_CONNECTIONS: {
            WELLS_FARGO: 'wellsfargo',
            BANK_OF_AMERICA: 'bankofamerica',
            CHASE: 'chase',
            BREX: 'brex',
            CAPITAL_ONE: 'capitalone',
            CITI_BANK: 'citibank',
            AMEX: 'americanexpressfdx',
            MOCK_BANK: 'mockbank',
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
        BULK_ACTION_TYPES: {
            EDIT: 'edit',
            DELETE: 'delete',
        },
    },
    REQUIRE_FIELDS_RULE_TYPES: {
        REQUIRE_DESCRIPTION: 'requireDescription',
        REQUIRE_ATTENDEES: 'requireAttendees',
        REQUIRE_RECEIPTS_OVER: 'requireReceiptsOver',
        REQUIRE_ITEMIZED_RECEIPTS_OVER: 'requireItemizedReceiptsOver',
    },
    SPEND_RULES: {
        BADGE_VARIANTS: {
            SUCCESS: 'success',
            ERROR: 'error',
            NEUTRAL: 'neutral',
        },
        CATEGORIES: {
            AIRLINES: 'airlines',
            ALCOHOL_AND_BARS: 'alcoholAndBars',
            AMAZON_AND_BOOKSTORES: 'amazonAndBookstores',
            AUTOMOTIVE: 'automotive',
            CAR_RENTALS: 'carRentals',
            DINING: 'dining',
            FUEL_AND_GAS: 'fuelAndGas',
            GOVERNMENT_AND_NON_PROFITS: 'governmentAndNonProfits',
            GROCERIES: 'groceries',
            GYMS_AND_FITNESS: 'gymsAndFitness',
            HEALTHCARE: 'healthcare',
            HOTELS: 'hotels',
            INTERNET_AND_PHONE: 'internetAndPhone',
            OFFICE_SUPPLIES: 'officeSupplies',
            PARKING_AND_TOLLS: 'parkingAndTolls',
            PROFESSIONAL_SERVICES: 'professionalServices',
            RETAIL: 'retail',
            SHIPPING_AND_DELIVERY: 'shippingAndDelivery',
            SOFTWARE: 'software',
            TRANSIT_AND_RIDESHARE: 'transitAndRideshare',
            TRAVEL_AGENCIES: 'travelAgencies',
        },
        ACTION: {
            ALLOW: 'allow',
            BLOCK: 'block',
        },
        NOUN: {
            CURRENCY: 'currency',
            MERCHANT: 'merchant',
            SPEND_CATEGORY: 'spendCategory',
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
        PO_BOX: /\b[P|p]?(OST|ost)?\.?\s*[O|o|0]?(ffice|FFICE)?\.?\s*[B|b][O|o|0]?[X|x]?\.?\s+[#]?(\d+)\b/,
        PMB: /\b(?:p\.?\s*m\.?\s*b|private\s*mail\s*?box)\.?\s*#?\s*(\d+)\b/i,
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

        // eslint-disable-next-line no-misleading-character-class
        EMOJI: /[\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3/gu,

        EMOJIS: /[\p{Extended_Pictographic}\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}](\u200D[\p{Extended_Pictographic}\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]|[\u{1F3FB}-\u{1F3FF}]|[\u{E0020}-\u{E007F}]|\uFE0F|\u20E3)*|[\u{1F1E6}-\u{1F1FF}]{2}|[#*0-9]\uFE0F?\u20E3/du,

        EMOJI_SKIN_TONES: /[\u{1f3fb}-\u{1f3ff}]/gu,

        PRIVATE_USER_AREA: /[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]/u,

        ONLY_PRIVATE_USER_AREA: /^[\uE000-\uF8FF\u{F0000}-\u{FFFFD}\u{100000}-\u{10FFFD}]+$/u,

        // Regex pattern to match a digit (#, *, or 0-9) followed by an emoji (used for Safari FE0E insertion to prevent keycap corruption)
        DIGIT_OR_SYMBOL_FOLLOWED_BY_EMOJI: /([\d#*])([\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F9FF}\u2600-\u27BF])/gu,
        // Regex pattern to match a corrupted keycap sequence followed by an emoji
        CORRUPTED_KEYCAP_FOLLOWED_BY_EMOJI: /([\d#*])\uFE0F?\u20E3([\u{1F300}-\u{1FAFF}\u{1F000}-\u{1F9FF}\u2600-\u27BF])/gu,

        TAX_ID: /^\d{9}$/,
        NON_NUMERIC: /\D/g,
        ANY_SPACE: /\s/g,
        NON_BREAKING_SPACE: /\u00A0/g,

        EMOJI_NAME: /(?<=^|[\s\S]):[\p{L}0-9_+-]+:/gu,
        EMOJI_SUGGESTIONS: /(?<=^|[\s\S]):[\p{L}0-9_+-]{1,40}$/u,
        LINE_BREAK: /\r\n|\r|\n|\u2028/g,
        CODE_2FA: /^\d{6}$/,

        ATTACHMENT: {
            // Match any attachment tag inside the markdown text i.e only: <img or <video
            ATTACHMENT_REGEX: /<video |<img /g,
            // Extract all attachments including all atributes and values from markdown text
            ATTACHMENT: /<(img|video)[^>]*>/gi,
            // Retrieve the attachment id value from data-attachment-id attribute
            ATTACHMENT_ID: /data-attachment-id=(["'])(.*?)\1/,
            // Retrive attachment source id from attachment source url link
            ATTACHMENT_SOURCE_ID: /chat-attachments\/(\d+)/,
            // Retrieve attachment source either local or remote
            ATTACHMENT_SOURCE: /(src|data-expensify-source|data-optimistic-src)="([^"]+)"/i,
        },

        HAS_COLON_ONLY_AT_THE_BEGINNING: /^:[^:]+$/,
        HAS_AT_MOST_TWO_AT_SIGNS: /^@[^@]*@?[^@]*$/,
        EMPTY_COMMENT: /^(\s)*$/,
        SPECIAL_CHAR_MENTION_BREAKER: /[,/?"{}[\]()&^%;`$=<>!*]/g,
        SPECIAL_CHAR: /[,/?"{}[\]()&^%;`$=#<>!*]/g,
        TRAILING_DOTS: /\.$/,
        STARTS_WITH_PUNCTUATION: /^[.,!?]/,

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
            REDUNDANT_SLASHES: /(\/{2,})|(\/$)/g,
        },
        TIME_STARTS_01: /^01:\d{2} [AP]M$/,
        TIME_FORMAT: /^\d{2}:\d{2} [AP]M$/,
        DATE_TIME_FORMAT: /^\d{2}-\d{2} \d{2}:\d{2} [AP]M$/,
        ILLEGAL_FILENAME_CHARACTERS: /\/|<|>|\*|"|:|#|\?|\\|\|/g,
        ENCODE_PERCENT_CHARACTER: /%(25)+/g,
        INVISIBLE_CHARACTERS_GROUPS: /[\p{C}\p{Z}]/gu,
        OTHER_INVISIBLE_CHARACTERS: /[\u3164]/g,
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
    SEARCH_BAR_THRESHOLD: 3,
    // Number of approval workflow cards rendered before the "Load more" affordance on Workspace → Workflows.
    WORKFLOW_APPROVALS_INITIAL_BATCH: 5,
    LOGIN_CHARACTER_LIMIT: 254,
    CATEGORY_NAME_LIMIT: 256,
    WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH: 256,
    REPORT_NAME_LIMIT: 100,
    TITLE_CHARACTER_LIMIT: 100,
    TASK_TITLE_CHARACTER_LIMIT: 10000,
    DESCRIPTION_LIMIT: 1000,
    SEARCH_QUERY_LIMIT: 1000,
    STATE_CHARACTER_LIMIT: 32,
    REPORT_TITLE_FORMULA_LIMIT: 500,
    AGENT_PROMPT_LIMIT: 300,

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
    MILLISECONDS_PER_SECOND: 1000,
    RED_BRICK_ROAD_PENDING_ACTION: {
        ADD: 'add',
        DELETE: 'delete',
        UPDATE: 'update',
    },
    EXPENSE_PENDING_ACTION: {
        SUBMIT: 'SUBMIT',
        SUBMIT_FAILED: 'SUBMIT_FAILED',
        APPROVE: 'APPROVE',
    },
    BRICK_ROAD_INDICATOR_STATUS: {
        ERROR: 'error',
        INFO: 'info',
    },
    REPORT_DETAILS_MENU_ITEM: {
        GO_TO_ROOM: 'goToRoom',
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
        BILLABLE: 'billable',
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

    INVALID_CATEGORY_NAME: '###',

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

    MAP_MARKER_SIZES: {
        CURRENT_LOCATION: {width: 48, height: 48},
        START_WAYPOINT: {width: 48, height: 48},
        STOP_WAYPOINT: {width: 48, height: 53},
        WAYPOINT: {width: 40, height: 40},
    },

    MAP_VIEW_COMPASS_SIZE: {width: 44, height: 44},

    QUICK_REACTIONS: [
        {
            name: '+1',
            code: '👍',
            hexcode: '1F44D',
            types: ['👍🏿', '👍🏾', '👍🏽', '👍🏼', '👍🏻'],
        },
        {
            name: 'heart',
            code: '❤️',
            hexcode: '2764',
        },
        {
            name: 'joy',
            code: '😂',
            hexcode: '1F602',
        },
        {
            name: 'fire',
            code: '🔥',
            hexcode: '1F525',
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
    PLAID_SUPPORT_COUNTRIES: ['AT', 'BE', 'CA', 'DE', 'DK', 'EE', 'ES', 'FI', 'FR', 'GB', 'IE', 'IT', 'LT', 'LV', 'NL', 'NO', 'PL', 'PT', 'SE', 'US'] as string[],

    BBA_SUPPORTED_COUNTRIES: [
        'AT',
        'AU',
        'BE',
        'BG',
        'CA',
        'CY',
        'CZ',
        'DE',
        'DK',
        'EE',
        'ES',
        'FI',
        'FR',
        'GR',
        'HR',
        'HU',
        'IE',
        'IT',
        'LT',
        'LU',
        'LV',
        'MT',
        'NL',
        'PL',
        'PT',
        'RO',
        'SE',
        'SI',
        'SK',
        'GB',
        'US',
    ] as string[],

    BBA_COUNTRY_CURRENCY_MAP: {
        AT: 'EUR',
        AU: 'AUD',
        BE: 'EUR',
        BG: 'EUR',
        CA: 'CAD',
        CY: 'EUR',
        CZ: 'EUR',
        DE: 'EUR',
        DK: 'EUR',
        EE: 'EUR',
        ES: 'EUR',
        FI: 'EUR',
        FR: 'EUR',
        GR: 'EUR',
        HR: 'EUR',
        HU: 'EUR',
        IE: 'EUR',
        IT: 'EUR',
        LT: 'EUR',
        LU: 'EUR',
        LV: 'EUR',
        MT: 'EUR',
        NL: 'EUR',
        PL: 'EUR',
        PT: 'EUR',
        RO: 'EUR',
        SE: 'EUR',
        SI: 'EUR',
        SK: 'EUR',
        GB: 'GBP',
        US: 'USD',
    } as Record<string, string>,

    // Maps actual local currencies to their respective countries (not BBA currencies)
    // Used to determine country selection based on personal policy outputCurrency
    // Only includes currencies used by a single country (EUR excluded as it's used by multiple countries)
    BBA_EU_ORIGINAL_CURRENCY_COUNTRY_MAP: {
        BGN: 'BG',
        CZK: 'CZ',
        DKK: 'DK',
        GBP: 'GB',
        HUF: 'HU',
        PLN: 'PL',
        RON: 'RO',
        SEK: 'SE',
    } as Record<string, string>,

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
    EMOJI_PICKER_SKIN_TONE_LIST_HEIGHT: 56,
    TEXT_INPUT_SYMBOL_POSITION: {
        PREFIX: 'prefix',
        SUFFIX: 'suffix',
    },
    QR: {
        DEFAULT_LOGO_SIZE: 120,
        DEFAULT_LOGO_SIZE_RATIO: 0.25,
        DEFAULT_LOGO_MARGIN_RATIO: 0.02,
        EXPENSIFY_LOGO_SIZE_RATIO: 0.22,
        EXPENSIFY_LOGO_MARGIN_RATIO: 0.03,
    },

    ACCESSIBILITY_LABELS: {
        COLLAPSE: 'Collapse',
        EXPAND: 'Expand',
        ERROR: 'Error',
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
        /** Use for elements with advisory information that should be announced without interrupting the user. */
        STATUS: 'status',
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
        /** Use for elements that serve as a page or section header (e.g. top bar title). */
        HEADER: 'header',
        /** Use for image elements. */
        IMG: 'img',
        /** Use for elements that navigate to other pages or content. */
        LINK: 'link',
        /** Use to identify a list of items. */
        LIST: 'list',
        /** Use for a list of selectable options (single or multi-select). */
        LISTBOX: 'listbox',
        /** Use for individual items within a list. */
        LISTITEM: 'listitem',
        /** Use for a list of choices or options. */
        MENU: 'menu',
        /** Use for a container of multiple menus. */
        MENUBAR: 'menubar',
        /** Use for items within a menu. */
        MENUITEM: 'menuitem',
        /** Use for selectable options within a listbox. */
        OPTION: 'option',
        /** Use to group related elements together for assistive technology. */
        GROUP: 'group',
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
        /** Use for dialog/modal elements */
        DIALOG: 'dialog',
        /** Use for data table containers. */
        TABLE: 'table',
        /** Use for table rows. */
        ROW: 'row',
        /** Use for column header cells in a table. */
        COLUMNHEADER: 'columnheader',
        /** Use for data cells in a table row. */
        CELL: 'cell',
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
        REPLACE_VERIFY_OLD: 'REPLACE_VERIFY_OLD',
        REPLACE_VERIFY_NEW: 'REPLACE_VERIFY_NEW',
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
        IOU_REQUEST_TYPE: 'iouRequestType',
        DISTANCE_REQUEST_TYPE: 'distanceRequestType',
        DISTANCE_EDIT_TYPE: 'distanceEditType',
        SPLIT_EXPENSE_TAB_TYPE: 'splitExpenseTabType',
        RULES_TAB_TYPE: 'rulesTabType',
        RULES: {
            GENERAL: 'general',
            CARD_RESTRICTIONS: 'cardRestrictions',
            EXPENSE_DEFAULTS: 'expenseDefaults',
            REQUIRE_FIELDS: 'requireFields',
            FLAG_FOR_REVIEW: 'flagForReview',
        },
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

    BUTTON_SIZE: {
        LARGE: 'large',
        MEDIUM: 'medium',
        SMALL: 'small',
    },

    BUTTON_VARIANT: {
        SUCCESS: 'success',
        DANGER: 'danger',
    },

    BUTTON_REMOVE_BORDER_RADIUS: {
        LEFT: 'left',
        RIGHT: 'right',
        ALL: 'all',
    },

    ICON_SIZE: {
        EXTRA_SMALL: 'extra-small',
        SMALL: 'small',
        MEDIUM: 'medium',
        LARGE: 'large',
    },

    NAVIGATION: {
        CUSTOM_HISTORY_ENTRY_SIDE_PANEL: 'CUSTOM_HISTORY-SIDE_PANEL',
        CUSTOM_HISTORY_ENTRY_MFA_MODAL_NAVIGATOR: 'CUSTOM_HISTORY-MFA_MODAL_NAVIGATOR',
        // Fake history entry used to keep browser Back behavior correct after revealing a route under an RHP.
        // addRootHistoryRouterExtension owns when this is added, carried forward, and removed.
        CUSTOM_HISTORY_ENTRY_REVEAL_PADDING: 'CUSTOM_HISTORY-REVEAL_PADDING',
        // Prefix for the back-guard history entry pushed by a `shouldHandleNavigationBack` Modal. Each
        // modal instance appends `${CUSTOM_HISTORY_ENTRY_MODAL}:${modalId}` to the root state.history so
        // browser Back closes the modal; the per-instance tag lets nested modals close one at a time.
        CUSTOM_HISTORY_ENTRY_MODAL: 'CUSTOM_HISTORY-MODAL',
        ACTION_TYPE: {
            REPLACE: 'REPLACE',
            PUSH: 'PUSH',
            NAVIGATE: 'NAVIGATE',
            SET_PARAMS: 'SET_PARAMS',
            PRELOAD: 'PRELOAD',
            POP: 'POP',
            POP_TO: 'POP_TO',
            GO_BACK: 'GO_BACK',
            RESET: 'RESET',

            /** These action types are custom for RootNavigator */
            DISMISS_MODAL: 'DISMISS_MODAL',
            REPLACE_FULLSCREEN_UNDER_RHP: 'REPLACE_FULLSCREEN_UNDER_RHP',
            REMOVE_FULLSCREEN_UNDER_RHP: 'REMOVE_FULLSCREEN_UNDER_RHP',
            PUSH_PARAMS: 'PUSH_PARAMS',
            REPLACE_PARAMS: 'REPLACE_PARAMS',
            TOGGLE_SIDE_PANEL_WITH_HISTORY: 'TOGGLE_SIDE_PANEL_WITH_HISTORY',
            TOGGLE_MFA_MODAL_NAVIGATOR_WITH_HISTORY: 'TOGGLE_MFA_MODAL_NAVIGATOR_WITH_HISTORY',
            TOGGLE_MODAL_WITH_HISTORY: 'TOGGLE_MODAL_WITH_HISTORY',
        },
    },
    TIME_PERIOD: {
        AM: 'AM',
        PM: 'PM',
    },
    INDENTS: '    ',
    PARENT_CHILD_SEPARATOR: ':',
    DISTANCE_MERCHANT_SEPARATOR: '@',
    COLON: ':',
    MAPBOX: {
        PADDING: 32,
        DEFAULT_ZOOM: 15,
        SINGLE_MARKER_ZOOM: 15,
        DEFAULT_COORDINATE: [-122.4021, 37.7911] as [number, number],
        STYLE_URL: 'mapbox://styles/expensify/cllcoiqds00cs01r80kp34tmq',
        ANIMATION_DURATION_ON_CENTER_ME: 1000,
        GPS_ROUTE_ANIMATION_DURATION_MS: 1000,
    },
    ONYX_UPDATE_TYPES: {
        HTTPS: 'https',
        PUSHER: 'pusher',
        AIRSHIP: 'airship',
    },
    EVENTS: {
        SCROLLING: 'scrolling',
        TRANSITION_END_SCREEN_WRAPPER: 'transitionEndScreenWrapper',
    },
    SELECTION_BUTTON_POSITION: {
        LEFT: 'left',
        RIGHT: 'right',
    },
    SELECTION_LIST_WITH_MODAL_TEST_ID: 'selectionListWithModalMenuItem',

    ICON_TEST_ID: 'Icon',
    IMAGE_SVG_TEST_ID: 'ImageSVG',
    VIDEO_PLAYER_TEST_ID: 'VideoPlayer',
    LOTTIE_VIEW_TEST_ID: 'LottieView',

    DOT_INDICATOR_TEST_ID: 'DotIndicator',
    ANIMATED_COLLAPSIBLE_CONTENT_TEST_ID: 'animated-collapsible-content',
    SWITCH_LOCK_ICON_TEST_ID: 'SwitchLockIcon',

    HORIZONTAL_SPACER: {
        DEFAULT_BORDER_BOTTOM_WIDTH: 1,
        DEFAULT_MARGIN_VERTICAL: 8,
        HIDDEN_MARGIN_VERTICAL: 4,
        HIDDEN_BORDER_BOTTOM_WIDTH: 0,
    },

    MISSING_TRANSLATION: 'MISSING TRANSLATION',

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
     * Constants for maxToRenderPerBatch parameter that is used for FlatList. This controls the amount of items rendered per batch, which is the next chunk of items
     * rendered on every scroll.
     */
    MAX_TO_RENDER_PER_BATCH: {
        CAROUSEL: 3,
    },

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
        CUSTOM_UNIT_RATE_OUT_OF_DATE_RANGE: 'customUnitRateOutOfDateRange',
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
        INCREASED_DISTANCE: 'increasedDistance',
        INACTIVE_VENDOR: 'inactiveVendor',
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
        OFFLINE_THRESHOLD: 7000,
    },

    INTRO_CHOICES: {
        SUBMIT: 'newDotSubmit',
        MANAGE_TEAM: 'newDotManageTeam',
    },

    MINI_CONTEXT_MENU_MAX_ITEMS: 4,

    EXPENSIFY_ICON_NAME: 'Expensify',

    ONBOARDING_CHOICES: {...onboardingChoices},
    SELECTABLE_ONBOARDING_CHOICES: {...selectableOnboardingChoices},
    CREATE_EXPENSE_ONBOARDING_CHOICES: {...createExpenseOnboardingChoices},
    ONBOARDING_SIGNUP_QUALIFIERS: {...signupQualifiers},
    ONBOARDING_INVITE_TYPES: {...onboardingInviteTypes},
    ONBOARDING_COMPANY_SIZE: {...onboardingCompanySize},
    ONBOARDING_PERSONAL_TRACK_GOALS: {...onboardingPersonalTrackGoals},
    ONBOARDING_RHP_VARIANT: {
        RHP_CONCIERGE_DM: 'rhpConciergeDm',
        RHP_ADMINS_ROOM: 'rhpAdminsRoom',
        RHP_HOME_PAGE: 'rhpHomePage',
        TRACK_EXPENSES_WITH_CONCIERGE: 'trackExpensesWithConcierge',
        INBOX_ADMINS_BESPOKE: 'inboxAdminsBespoke',
    },
    ONBOARDING_JOINABLE_WORKSPACES_LIMIT: 5,
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

    // We need to store this server side error in order to not show the blocking screen when the error is for invalid code
    MERGE_ACCOUNT_INVALID_CODE_ERROR: '401 Not authorized - Invalid validateCode',
    MERGE_ACCOUNT_2FA_ERROR: 'is a login for an Expensify account with Two-Factor Authentication (2FA) enabled',
    MERGE_ACCOUNT_SINGLE_SIGN_ON_ERROR: 'is a login for an Expensify account with Single Sign-On (SSO/SAML) enabled',

    // Returned when a user tries to add a work email tied to a closed work account, so we can show a specific error message instead of the generic blocking screen subtitle
    WORK_ACCOUNT_CLOSED_ERROR: '401 work account is closed',
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
    },

    CACHE_API_KEYS: {
        ATTACHMENTS: 'attachments',
    },

    SESSION_STORAGE_KEYS: {
        INITIAL_URL: 'INITIAL_URL',
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

    PNR_STATUS: {
        CANCELLED: 'CANCELLED',
        CANCELLED_STATUS: 'CANCELLED_STATUS',
        VOIDED: 'VOIDED',
    },

    LEG_STATUS: {
        CANCELLED: 'CANCELLED_STATUS',
    },

    UPCOMING_TRAVEL_WINDOW_DAYS: 7,

    RESERVATION_ADDRESS_TEST_ID: 'ReservationAddress',

    FLIGHT_SEAT_TEST_ID: 'FlightSeat',

    CANCELLATION_POLICY: {
        UNKNOWN: 'UNKNOWN',
        NON_REFUNDABLE: 'NON_REFUNDABLE',
        FREE_CANCELLATION_UNTIL: 'FREE_CANCELLATION_UNTIL',
        PARTIALLY_REFUNDABLE: 'PARTIALLY_REFUNDABLE',
    },

    DOT_SEPARATOR: '•',

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

    RECEIPTS_UPLOAD_PATH: '/Receipts-Upload',

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
            CHANGE_APPROVER: 'changeApprover',
            PAY: 'pay',
            DONE: 'done',
            EXPORT_TO_ACCOUNTING: 'exportToAccounting',
            PAID: 'paid',
            UNDELETE: 'undelete',
        },
        HAS_VALUES: {
            RECEIPT: 'receipt',
            ATTACHMENT: 'attachment',
            LINK: 'link',
            CATEGORY: 'category',
            TAG: 'tag',
        },
        BULK_ACTION_TYPES: {
            EDIT: 'edit',
            EXPORT: 'export',
            DOWNLOAD_PDF: 'downloadPDF',
            APPROVE: 'approve',
            CHANGE_APPROVER: 'changeApprover',
            PAY: 'pay',
            SUBMIT: 'submit',
            HOLD: 'hold',
            MERGE: 'merge',
            UNHOLD: 'unhold',
            DELETE: 'delete',
            REJECT: 'reject',
            CHANGE_REPORT: 'changeReport',
            SPLIT: 'split',
            DUPLICATE: 'duplicate',
            DUPLICATE_REPORT: 'duplicateReport',
            UNDELETE: 'undelete',
        },
        BULK_DUPLICATE_LIMIT: 50,
        TRANSACTION_TYPE: {
            CASH: 'cash',
            CARD: 'card',
            DISTANCE: 'distance',
            PER_DIEM: 'perDiem',
            TIME: 'time',
        },
        RECEIPT_TYPE: {
            ERECEIPT: 'ereceipt',
            ITEMIZED: 'itemized',
            HOTEL: 'hotel',
        },
        WITHDRAWAL_TYPE: {
            EXPENSIFY_CARD: 'expensify-card',
            REIMBURSEMENT: 'reimbursement',
            CENTRAL_TRAVEL_INVOICING: 'central-travel-invoicing',
        },
        SETTLEMENT_STATUS: {
            PENDING: 'pending',
            CLEARED: 'cleared',
            FAILED: 'failed',
            NEVER: 'never',
        },
        PAID_STATUS: {
            MARKED_AS_PAID: 'markedAsPaid',
            WITHDRAWING: 'withdrawing',
            CONFIRMED: 'confirmed',
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
        SORT_BY_COLUMNS: {
            CATEGORY_GL_CODE: 'glcode',
            TAG_GL_CODE: 'tagglcode',
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
        /**
         * Single source of truth for which transaction-level columns are available in each column-picker surface:
         * - `search`: the Spend/Search picker (`/search` → Display → Edit columns), read via `TYPE_CUSTOM_COLUMNS.EXPENSE`.
         * - `reportView`: the single-report picker (`r/:reportID/settings/columns`), read via `REPORT_DETAILS_CUSTOM_COLUMNS`.
         *
         * Both `TYPE_CUSTOM_COLUMNS.EXPENSE` and `REPORT_DETAILS_CUSTOM_COLUMNS` are derived from this map (preserving
         * this declaration order), so adding a new column forces a single, deliberate availability decision here instead
         * of silently drifting between two hand-maintained lists. A guard test (`tests/unit/Search/ColumnAvailabilityTest.ts`)
         * asserts every expense-relevant `TABLE_COLUMNS` value is classified here or explicitly owned by another surface.
         *
         * Rule of thumb for `reportView`: a column belongs in the single-report view only if its value can differ between
         * expenses within the same report. Report-level values (identical on every row) stay Search-only.
         */
        get COLUMN_AVAILABILITY() {
            return {
                RECEIPT: {
                    column: this.TABLE_COLUMNS.RECEIPT,
                    search: true,
                    reportView: true,
                },
                DATE: {
                    column: this.TABLE_COLUMNS.DATE,
                    search: true,
                    reportView: true,
                },
                STATUS: {
                    column: this.TABLE_COLUMNS.STATUS,
                    search: true,
                    reportView: false,
                },
                SUBMITTED: {
                    column: this.TABLE_COLUMNS.SUBMITTED,
                    search: true,
                    reportView: false,
                },
                APPROVED: {
                    column: this.TABLE_COLUMNS.APPROVED,
                    search: true,
                    reportView: false,
                },
                POSTED: {
                    column: this.TABLE_COLUMNS.POSTED,
                    search: true,
                    reportView: true,
                },
                EXPORTED: {
                    column: this.TABLE_COLUMNS.EXPORTED,
                    search: true,
                    reportView: false,
                },
                MERCHANT: {
                    column: this.TABLE_COLUMNS.MERCHANT,
                    search: true,
                    reportView: true,
                },
                DESCRIPTION: {
                    column: this.TABLE_COLUMNS.DESCRIPTION,
                    search: true,
                    reportView: true,
                },
                FROM: {
                    column: this.TABLE_COLUMNS.FROM,
                    search: true,
                    reportView: false,
                },
                TO: {column: this.TABLE_COLUMNS.TO, search: true, reportView: false},
                POLICY_NAME: {
                    column: this.TABLE_COLUMNS.POLICY_NAME,
                    search: true,
                    reportView: false,
                },
                CARD: {
                    column: this.TABLE_COLUMNS.CARD,
                    search: true,
                    reportView: true,
                },
                CATEGORY: {
                    column: this.TABLE_COLUMNS.CATEGORY,
                    search: true,
                    reportView: true,
                },
                CATEGORY_GL_CODE: {
                    column: this.TABLE_COLUMNS.CATEGORY_GL_CODE,
                    search: true,
                    reportView: true,
                },
                ATTENDEES: {
                    column: this.TABLE_COLUMNS.ATTENDEES,
                    search: true,
                    reportView: true,
                },
                TOTAL_PER_ATTENDEE: {
                    column: this.TABLE_COLUMNS.TOTAL_PER_ATTENDEE,
                    search: true,
                    reportView: true,
                },
                TAG: {column: this.TABLE_COLUMNS.TAG, search: true, reportView: true},
                TAG_GL_CODE: {
                    column: this.TABLE_COLUMNS.TAG_GL_CODE,
                    search: true,
                    reportView: true,
                },
                EXCHANGE_RATE: {
                    column: this.TABLE_COLUMNS.EXCHANGE_RATE,
                    search: true,
                    reportView: true,
                },
                ORIGINAL_AMOUNT: {
                    column: this.TABLE_COLUMNS.ORIGINAL_AMOUNT,
                    search: true,
                    reportView: true,
                },
                REPORT_ID: {
                    column: this.TABLE_COLUMNS.REPORT_ID,
                    search: true,
                    reportView: false,
                },
                BASE_62_REPORT_ID: {
                    column: this.TABLE_COLUMNS.BASE_62_REPORT_ID,
                    search: true,
                    reportView: false,
                },
                REIMBURSABLE: {
                    column: this.TABLE_COLUMNS.REIMBURSABLE,
                    search: true,
                    reportView: true,
                },
                BILLABLE: {
                    column: this.TABLE_COLUMNS.BILLABLE,
                    search: true,
                    reportView: true,
                },
                MCC: {column: this.TABLE_COLUMNS.MCC, search: true, reportView: true},
                TAX_CODE: {
                    column: this.TABLE_COLUMNS.TAX_CODE,
                    search: true,
                    reportView: true,
                },
                TAX_RATE: {
                    column: this.TABLE_COLUMNS.TAX_RATE,
                    search: true,
                    reportView: true,
                },
                TAX_AMOUNT: {
                    column: this.TABLE_COLUMNS.TAX_AMOUNT,
                    search: true,
                    reportView: true,
                },
                TITLE: {
                    column: this.TABLE_COLUMNS.TITLE,
                    search: true,
                    reportView: false,
                },
                AMOUNT: {
                    column: this.TABLE_COLUMNS.TOTAL_AMOUNT,
                    search: true,
                    reportView: true,
                },
                TOTAL: {
                    column: this.TABLE_COLUMNS.TOTAL,
                    search: false,
                    reportView: true,
                },
                EXPORTED_TO: {
                    column: this.TABLE_COLUMNS.EXPORTED_TO,
                    search: true,
                    reportView: false,
                },
                ACTION: {
                    column: this.TABLE_COLUMNS.ACTION,
                    search: true,
                    reportView: false,
                },
                WITHDRAWAL_ID: {
                    column: this.TABLE_COLUMNS.WITHDRAWAL_ID,
                    search: true,
                    reportView: true,
                },
                SUBMITTER_USER_ID: {
                    column: this.TABLE_COLUMNS.SUBMITTER_USER_ID,
                    search: true,
                    reportView: true,
                },
                SUBMITTER_PAYROLL_ID: {
                    column: this.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID,
                    search: true,
                    reportView: true,
                },
                ORDER_DEAL_NUMBERS: {
                    column: this.TABLE_COLUMNS.ORDER_DEAL_NUMBERS,
                    search: true,
                    reportView: true,
                },
            };
        },
        get TYPE_CUSTOM_COLUMNS() {
            return {
                // Derived from COLUMN_AVAILABILITY: every column flagged `search`, in declaration order.
                EXPENSE: Object.fromEntries(
                    Object.entries(this.COLUMN_AVAILABILITY)
                        .filter(([, availability]) => availability.search)
                        .map(([key, availability]) => [key, availability.column] as const),
                ),
                EXPENSE_REPORT: {
                    AVATAR: this.TABLE_COLUMNS.AVATAR,
                    DATE: this.TABLE_COLUMNS.DATE,
                    SUBMITTED: this.TABLE_COLUMNS.SUBMITTED,
                    APPROVED: this.TABLE_COLUMNS.APPROVED,
                    FIRST_APPROVER: this.TABLE_COLUMNS.FIRST_APPROVER,
                    FIRST_APPROVED: this.TABLE_COLUMNS.FIRST_APPROVED,
                    EXPORTED: this.TABLE_COLUMNS.EXPORTED,
                    STATUS: this.TABLE_COLUMNS.STATUS,
                    PAID_STATUS: this.TABLE_COLUMNS.PAID_STATUS,
                    TITLE: this.TABLE_COLUMNS.TITLE,
                    FROM: this.TABLE_COLUMNS.FROM,
                    TO: this.TABLE_COLUMNS.TO,
                    POLICY_NAME: this.TABLE_COLUMNS.POLICY_NAME,
                    REIMBURSABLE_TOTAL: this.TABLE_COLUMNS.REIMBURSABLE_TOTAL,
                    NON_REIMBURSABLE_TOTAL: this.TABLE_COLUMNS.NON_REIMBURSABLE_TOTAL,
                    REPORT_ID: this.TABLE_COLUMNS.REPORT_ID,
                    BASE_62_REPORT_ID: this.TABLE_COLUMNS.BASE_62_REPORT_ID,
                    AMOUNT: this.TABLE_COLUMNS.TOTAL,
                    SUBMITTER_USER_ID: this.TABLE_COLUMNS.SUBMITTER_USER_ID,
                    SUBMITTER_PAYROLL_ID: this.TABLE_COLUMNS.SUBMITTER_PAYROLL_ID,
                    ORDER_DEAL_NUMBERS: this.TABLE_COLUMNS.ORDER_DEAL_NUMBERS,
                    EXPORTED_ICON: this.TABLE_COLUMNS.EXPORTED_TO,
                    ACTION: this.TABLE_COLUMNS.ACTION,
                },
                INVOICE: {},
                TASK: {},
                TRIP: {},
                CHAT: {},
            };
        },
        // Derived from COLUMN_AVAILABILITY: every column flagged `reportView`, in declaration order.
        get REPORT_DETAILS_CUSTOM_COLUMNS() {
            return Object.fromEntries(
                Object.entries(this.COLUMN_AVAILABILITY)
                    .filter(([, availability]) => availability.reportView)
                    .map(([key, availability]) => [key, availability.column] as const),
            );
        },
        get GROUP_CUSTOM_COLUMNS() {
            return {
                FROM: {
                    AVATAR: this.TABLE_COLUMNS.AVATAR,
                    FROM: this.TABLE_COLUMNS.GROUP_FROM,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                CARD: {
                    AVATAR: this.TABLE_COLUMNS.AVATAR,
                    CARD: this.TABLE_COLUMNS.GROUP_CARD,
                    FEED: this.TABLE_COLUMNS.GROUP_FEED,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                WITHDRAWAL_ID: {
                    AVATAR: this.TABLE_COLUMNS.AVATAR,
                    WITHDRAWN: this.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    WITHDRAWAL_STATUS: this.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
                    BANK_ACCOUNT: this.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
                    WITHDRAWAL_ID: this.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                CATEGORY: {
                    CATEGORY: this.TABLE_COLUMNS.GROUP_CATEGORY,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                MERCHANT: {
                    MERCHANT: this.TABLE_COLUMNS.GROUP_MERCHANT,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                TAG: {
                    TAG: this.TABLE_COLUMNS.GROUP_TAG,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                MONTH: {
                    MONTH: this.TABLE_COLUMNS.GROUP_MONTH,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                WEEK: {
                    WEEK: this.TABLE_COLUMNS.GROUP_WEEK,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                YEAR: {
                    YEAR: this.TABLE_COLUMNS.GROUP_YEAR,
                    EXPENSES: this.TABLE_COLUMNS.GROUP_EXPENSES,
                    TOTAL: this.TABLE_COLUMNS.GROUP_TOTAL,
                },
                QUARTER: {
                    QUARTER: this.TABLE_COLUMNS.GROUP_QUARTER,
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
                    this.TABLE_COLUMNS.STATUS,
                    this.TABLE_COLUMNS.MERCHANT,
                    this.TABLE_COLUMNS.FROM,
                    this.TABLE_COLUMNS.CATEGORY,
                    this.TABLE_COLUMNS.TAG,
                    this.TABLE_COLUMNS.TOTAL_AMOUNT,
                ],
                EXPENSE_REPORT: [
                    this.TABLE_COLUMNS.AVATAR,
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
                FROM: [this.TABLE_COLUMNS.AVATAR, this.TABLE_COLUMNS.GROUP_FROM, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                CARD: [this.TABLE_COLUMNS.AVATAR, this.TABLE_COLUMNS.GROUP_CARD, this.TABLE_COLUMNS.GROUP_FEED, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                WITHDRAWAL_ID: [
                    this.TABLE_COLUMNS.AVATAR,
                    this.TABLE_COLUMNS.GROUP_WITHDRAWN,
                    this.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS,
                    this.TABLE_COLUMNS.GROUP_BANK_ACCOUNT,
                    this.TABLE_COLUMNS.GROUP_WITHDRAWAL_ID,
                    this.TABLE_COLUMNS.GROUP_EXPENSES,
                    this.TABLE_COLUMNS.GROUP_TOTAL,
                ],
                CATEGORY: [this.TABLE_COLUMNS.GROUP_CATEGORY, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                MERCHANT: [this.TABLE_COLUMNS.GROUP_MERCHANT, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                TAG: [this.TABLE_COLUMNS.GROUP_TAG, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                MONTH: [this.TABLE_COLUMNS.GROUP_MONTH, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                WEEK: [this.TABLE_COLUMNS.GROUP_WEEK, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                YEAR: [this.TABLE_COLUMNS.GROUP_YEAR, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
                QUARTER: [this.TABLE_COLUMNS.GROUP_QUARTER, this.TABLE_COLUMNS.GROUP_EXPENSES, this.TABLE_COLUMNS.GROUP_TOTAL],
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
                UNREPORTED: 'unreported',
                DRAFTS: 'drafts',
                OUTSTANDING: 'outstanding',
                APPROVED: 'approved',
                DONE: 'done',
                PAID: 'paid',
                DELETED: 'deleted',
            },
            EXPENSE_REPORT: {
                DRAFTS: 'drafts',
                OUTSTANDING: 'outstanding',
                APPROVED: 'approved',
                DONE: 'done',
                PAID: 'paid',
            },
            INVOICE: {
                OUTSTANDING: 'outstanding',
                PAID: 'paid',
            },
            TRIP: {
                CURRENT: 'current',
                PAST: 'past',
            },
            CHAT: {},
            TASK: {
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
            FIRST_APPROVER: 'firstapprover',
            FIRST_APPROVED: 'firstapproved',
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
            ATTENDEES: 'attendees',
            TOTAL_PER_ATTENDEE: 'totalPerAttendee',
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
            MCC: 'mcc',
            TAX_CODE: 'taxCode',
            CATEGORY_GL_CODE: 'categoryGLCode',
            TAG_GL_CODE: 'tagGLCode',
            WITHDRAWAL_ID: 'withdrawalID',
            SUBMITTER_USER_ID: 'submitterUserID',
            SUBMITTER_PAYROLL_ID: 'submitterPayrollID',
            ORDER_DEAL_NUMBERS: 'orderDealNumbers',
            AVATAR: 'avatar',
            STATUS: 'status',
            PAID_STATUS: 'paidstatus',
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
            GROUP_MERCHANT: 'groupMerchant',
            GROUP_TAG: 'groupTag',
            GROUP_MONTH: 'groupmonth',
            GROUP_WEEK: 'groupweek',
            GROUP_YEAR: 'groupyear',
            GROUP_QUARTER: 'groupquarter',
            GROUP_WITHDRAWAL_STATUS: 'groupWithdrawalStatus',
        },
        SYNTAX_OPERATORS: {
            AND: 'and',
            OR: 'or',
            EQUAL_TO: 'eq',
            CONTAINS: 'contains',
            NOT_EQUAL_TO: 'neq',
            RANGE: 'range',
            GREATER_THAN: 'gt',
            GREATER_THAN_OR_EQUAL_TO: 'gte',
            LOWER_THAN: 'lt',
            LOWER_THAN_OR_EQUAL_TO: 'lte',
        },
        SYNTAX_ROOT_KEYS: {
            TYPE: 'type',
            SORT_BY: 'sortBy',
            SORT_ORDER: 'sortOrder',
            VIEW: 'view',
            GROUP_BY: 'groupBy',
            COLUMNS: 'columns',
            LIMIT: 'limit',
        },
        VIEW: {
            TABLE: 'table',
            BAR: 'bar',
            LINE: 'line',
            PIE: 'pie',
        },
        SYNTAX_FILTER_KEYS: {
            TYPE: 'type',
            STATUS: 'status',
            DATE: 'date',
            AMOUNT: 'amount',
            EXPENSE_TYPE: 'expenseType',
            RECEIPT_TYPE: 'receiptType',
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
            BANK_ACCOUNT: 'bankAccount',
            REPORT_ID: 'reportID',
            KEYWORD: 'keyword',
            IN: 'in',
            SUBMITTED: 'submitted',
            APPROVED: 'approved',
            PAID: 'paid',
            EXPORTED: 'exported',
            POSTED: 'posted',
            WITHDRAWAL_TYPE: 'withdrawalType',
            WITHDRAWAL_STATUS: 'withdrawalStatus',
            PAID_STATUS: 'paidStatus',
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
            EXPORTED_TO: 'exportedTo',
            PREVIOUS_APPROVER: 'previousApprover',
        },
        REPORT_FIELD: {
            // All report fields start with this, so use this to check if a search key is a report field
            GLOBAL_PREFIX: 'reportField',
            DEFAULT_PREFIX: 'reportField-',
            NOT_PREFIX: 'reportFieldNot-',
            ON_PREFIX: 'reportFieldOn-',
            AFTER_PREFIX: 'reportFieldAfter-',
            BEFORE_PREFIX: 'reportFieldBefore-',
            RANGE_PREFIX: 'reportFieldRange-',
        },
        NONE_OPTION_KEY: '\x00__none__',
        TAG_EMPTY_VALUE: 'none',
        TAG_UNTAGGED_VALUE: '(untagged)',
        CATEGORY_EMPTY_VALUE: 'none',
        CATEGORY_DEFAULT_VALUE: 'Uncategorized',
        MERCHANT_EMPTY_VALUE: 'none',
        SEARCH_ROUTER_ITEM_TYPE: {
            CONTEXTUAL_SUGGESTION: 'contextualSuggestion',
            AUTOCOMPLETE_SUGGESTION: 'autocompleteSuggestion',
            SEARCH: 'searchItem',
            FIND_ITEM: 'findItem',
            ASK_CONCIERGE: 'askConcierge',
        },
        SEARCH_USER_FRIENDLY_KEYS: {
            TYPE: 'type',
            STATUS: 'status',
            SORT_BY: 'sort-by',
            SORT_ORDER: 'sort-order',
            POLICY_ID: 'workspace',
            GROUP_BY: 'group-by',
            VIEW: 'view',
            DATE: 'date',
            AMOUNT: 'amount',
            TOTAL: 'total',
            EXPENSE_TYPE: 'expense-type',
            RECEIPT_TYPE: 'receipt-type',
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
            BANK_ACCOUNT: 'bank-account',
            REPORT_ID: 'report-id',
            KEYWORD: 'keyword',
            IN: 'in',
            SUBMITTED: 'submitted',
            APPROVED: 'approved',
            PAID: 'paid',
            EXPORTED: 'exported',
            POSTED: 'posted',
            WITHDRAWAL_TYPE: 'withdrawal-type',
            WITHDRAWAL_STATUS: 'withdrawal-status',
            PAID_STATUS: 'paid-status',
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
            EXPORTED_TO: 'exported-to',
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
                [this.TABLE_COLUMNS.ORIGINAL_AMOUNT]: 'purchase-amount',
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
                [this.TABLE_COLUMNS.MCC]: 'mcc',
                [this.TABLE_COLUMNS.TAX_CODE]: 'tax-code',
                [this.TABLE_COLUMNS.CATEGORY_GL_CODE]: 'category-gl-code',
                [this.TABLE_COLUMNS.TAG_GL_CODE]: 'tag-gl-code',
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
                [this.TABLE_COLUMNS.GROUP_MERCHANT]: 'group-merchant',
                [this.TABLE_COLUMNS.GROUP_TAG]: 'group-tag',
                [this.TABLE_COLUMNS.GROUP_MONTH]: 'group-month',
                [this.TABLE_COLUMNS.GROUP_WEEK]: 'group-week',
                [this.TABLE_COLUMNS.GROUP_YEAR]: 'group-year',
                [this.TABLE_COLUMNS.GROUP_QUARTER]: 'group-quarter',
                [this.TABLE_COLUMNS.GROUP_WITHDRAWAL_STATUS]: 'group-withdrawal-status',
            };
        },
        NOT_MODIFIER: 'Not',
        DATE_MODIFIERS: {
            ON: 'On',
            AFTER: 'After',
            BEFORE: 'Before',
            RANGE: 'Range',
        },
        get CUSTOM_DATE_MODIFIERS() {
            return [this.DATE_MODIFIERS.ON, this.DATE_MODIFIERS.BEFORE, this.DATE_MODIFIERS.AFTER] as const;
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
            YEAR_TO_DATE: 'year-to-date',
            LAST_12_MONTHS: 'last-12-months',
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
            TOP_MERCHANTS: 'topMerchants',
            SPEND_OVER_TIME: 'spendOverTime',
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

    EXCLUDE_FROM_LAST_VISITED_PATH: [
        SCREENS.NOT_FOUND,
        SCREENS.SAML_SIGN_IN,
        SCREENS.VALIDATE_LOGIN,
        SCREENS.MIGRATED_USER_WELCOME_MODAL.DYNAMIC_ROOT,
        SCREENS.AI_FEATURES_PROMO_MODAL.DYNAMIC_ROOT,
        SCREENS.MONEY_REQUEST.STEP_SCAN,
        SCREENS.DOMAIN.MEMBERS_MOVE_TO_GROUP,
        ...Object.values(SCREENS.MULTIFACTOR_AUTHENTICATION),
    ] as string[],

    CANCELLATION_TYPE: {
        MANUAL: 'manual',
        AUTOMATIC: 'automatic',
        NONE: 'none',
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
    DEFAULT_REPORT_LOADING_STATE: {isLoadingInitialReportActions: true},
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
                requiredPlan: this.POLICY.TYPE.CORPORATE,
            },
            autoApproveCompliantReports: {
                id: 'autoApproveCompliantReports' as const,
                alias: 'auto-approve-compliant-reports',
                name: 'Advanced Approvals' as const,
                title: `workspace.upgrade.approvals.title` as const,
                description: `workspace.upgrade.approvals.description` as const,
                icon: 'AdvancedApprovalsSquare',
                requiredPlan: this.POLICY.TYPE.CORPORATE,
            },
            autoPayApprovedReports: {
                id: 'autoPayApprovedReports' as const,
                alias: 'auto-pay-approved-reports',
                name: 'Advanced Approvals' as const,
                title: `workspace.upgrade.approvals.title` as const,
                description: `workspace.upgrade.approvals.description` as const,
                icon: 'AdvancedApprovalsSquare',
                requiredPlan: this.POLICY.TYPE.CORPORATE,
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
            [this.POLICY.CONNECTIONS.NAME.CERTINIA]: {
                id: this.POLICY.CONNECTIONS.NAME.CERTINIA,
                alias: 'certinia',
                name: this.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.financialforce,
                title: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.CERTINIA}.title` as const,
                description: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.CERTINIA}.description` as const,
                icon: 'CertiniaSquare',
            },
            [this.POLICY.CONNECTIONS.NAME.RILLET]: {
                id: this.POLICY.CONNECTIONS.NAME.RILLET,
                alias: 'rillet',
                name: this.POLICY.CONNECTIONS.NAME_USER_FRIENDLY.rillet,
                title: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.RILLET}.title` as const,
                description: `workspace.upgrade.${this.POLICY.CONNECTIONS.NAME.RILLET}.description` as const,
                icon: 'RilletSquare',
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
                requiredPlan: this.POLICY.TYPE.CORPORATE,
            },
            perDiem: {
                id: 'perDiem' as const,
                alias: 'per-diem',
                name: 'Per diem',
                title: 'workspace.upgrade.perDiem.title' as const,
                description: 'workspace.upgrade.perDiem.description' as const,
                icon: 'PerDiem',
                requiredPlan: this.POLICY.TYPE.CORPORATE,
            },
            hr: {
                id: 'hr' as const,
                alias: 'hr',
                name: 'HR',
                title: 'workspace.upgrade.hr.title' as const,
                description: 'workspace.upgrade.hr.description' as const,
                icon: 'Members',
                requiredPlan: this.POLICY.TYPE.CORPORATE,
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
            controlPolicyRoles: {
                id: 'controlPolicyRoles' as const,
                alias: 'control-policy-roles',
                name: 'Control policy roles',
                title: 'workspace.upgrade.controlPolicyRoles.title' as const,
                description: 'workspace.upgrade.controlPolicyRoles.description' as const,
                icon: 'BlueShield',
                requiredPlan: this.POLICY.TYPE.CORPORATE,
            },
            reports: {
                id: 'reports' as const,
                alias: 'reports',
                name: 'Reports',
                title: 'workspace.upgrade.reports.title' as const,
                description: 'workspace.upgrade.reports.description' as const,
                icon: 'ReportReceipt',
            },
            roles: {
                id: 'roles' as const,
                alias: 'roles',
                name: 'Roles',
                title: 'workspace.upgrade.roles.title' as const,
                description: 'workspace.upgrade.roles.description' as const,
                icon: 'BlueShield',
            },
            payments: {
                id: 'payments' as const,
                alias: 'payments',
                name: 'Payments',
                title: 'workspace.upgrade.payments.title' as const,
                description: 'workspace.upgrade.payments.description' as const,
                icon: 'Workflows',
            },
            accounting: {
                id: 'accounting' as const,
                alias: 'accounting',
                name: 'Accounting',
                title: 'workspace.upgrade.accounting.title' as const,
                description: 'workspace.upgrade.accounting.description' as const,
                icon: 'Accounting',
            },
            expensifyCard: {
                id: 'expensifyCard' as const,
                alias: 'expensify-card',
                name: 'Expensify Card',
                title: 'workspace.upgrade.expensifyCard.title' as const,
                description: 'workspace.upgrade.expensifyCard.description' as const,
                icon: 'HandCard',
            },
            invoicing: {
                id: 'invoicing' as const,
                alias: 'invoicing',
                name: 'Invoicing',
                title: 'workspace.upgrade.invoicing.title' as const,
                description: 'workspace.upgrade.invoicing.description' as const,
                icon: 'InvoiceBlue',
            },
            companyCardSubmit: {
                id: 'companyCardSubmit' as const,
                alias: 'company-card-submit',
                name: 'Company cards',
                title: 'workspace.upgrade.companyCardSubmit.title' as const,
                description: 'workspace.upgrade.companyCardSubmit.description' as const,
                icon: 'CompanyCard',
            },
            travelSubmit: {
                id: 'travelSubmit' as const,
                alias: 'travel-submit',
                name: 'Travel',
                title: 'workspace.upgrade.travelSubmit.title' as const,
                description: 'workspace.upgrade.travelSubmit.description' as const,
                icon: 'Luggage',
            },
            approvalSubmit: {
                id: 'approvalSubmit' as const,
                alias: 'approval-submit',
                name: 'Approvals',
                title: 'workspace.upgrade.approvalSubmit.title' as const,
                description: 'workspace.upgrade.approvalSubmit.description' as const,
                icon: 'AdvancedApprovalsSquare',
            },
            approvalSubmitReport: {
                id: 'approvalSubmitReport' as const,
                alias: 'approval-submit-report',
                name: 'Approve reports',
                title: 'workspace.upgrade.approvalSubmitReport.title' as const,
                description: 'workspace.upgrade.approvalSubmitReport.description' as const,
                icon: 'Approval',
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
        REPORT_THRESHOLD: 'reportThreshold',
        APPROVE_TO_ALTERNATE: 'approveToAlternate',
        SUBRATE: 'subRate',
        AMOUNT: 'amount',
        CURRENCY: 'currency',
        RATE_ID: 'rateID',
        ENABLED: 'enabled',
        IGNORE: 'ignore',
        DESTINATION: 'destination',
        CATEGORY: 'category',
        DATE: 'date',
        MERCHANT: 'merchant',
        TRANSACTION_FIELDS: ['date', 'merchant', 'amount', 'category'] as const,
        CARD_NUMBER: 'cardNumber',
        POSTED_DATE: 'postedDate',
        TAG: 'tag',
        COMMENT: 'comment',
        ORIGINAL_TRANSACTION_DATE: 'originalTransactionDate',
        ORIGINAL_AMOUNT: 'originalAmount',
        ORIGINAL_CURRENCY: 'originalCurrency',
        EXTERNAL_ID: 'externalID',
        MAX_AMOUNT_NO_RECEIPT: 'maxAmountNoReceipt',
        MAX_AMOUNT_NO_ITEMIZED_RECEIPT: 'maxAmountNoItemizedReceipt',
    },

    IMPORT_SPREADSHEET: {
        ICON_WIDTH: 180,
        ICON_HEIGHT: 160,

        CATEGORIES_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-categories#import-custom-categories',
        MEMBERS_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Invite-members-and-assign-roles#import-a-group-of-members',
        TAGS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags',
        MULTI_LEVEL_TAGS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/workspaces/Create-expense-tags#import-multi-level-tags-from-a-spreadsheet',
        IMPORT_TRANSACTIONS_ARTICLE_LINK: 'https://help.expensify.com/articles/new-expensify/connect-credit-cards/Import-Personal-Card-Transactions-From-a-Spreadsheet',
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
        HAS_DOMAIN_ERRORS: 'hasDomainErrors',
        HAS_LOCKED_BANK_ACCOUNT: 'hasLockedBankAccount',
        HAS_DEVICE_MANAGEMENT_ERROR: 'hasDeviceManagementError',
        HAS_MERGE_HR_SETUP_NEEDED: 'hasMergeHRSetupNeeded',
        HAS_HR_CONNECTION_ERROR: 'hasHRConnectionError',
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
        HAS_DEW_APPROVE_FAILED: 'hasDEWApproveFailed',
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
            SIGN_UP: {
                NAME: 'sign_up',
                META: 'CompleteRegistration',
            },
            // Fired for workspace creations that don't match the "sales-eligible" profile. Uses a custom Meta event
            // so the lower-value, higher-volume conversions don't dilute the standard "Lead" optimization below.
            WORKSPACE_CREATED: {
                NAME: 'workspace_created',
                META: 'workspace_created',
                IS_CUSTOM_PIXEL_EVENT: true,
            },
            // Fired for workspace creations that match the "sales-eligible" profile (see getWorkspaceCreatedAnalyticsEvent).
            // Uses the standard "Lead" event so Meta can optimize bids toward these higher-value leads.
            WORKSPACE_CREATED_SALES_ELIGIBLE: {
                NAME: 'workspace_created_sales_eligible',
                META: 'Lead',
            },
            PAID_ADOPTION: {
                NAME: 'paid_adoption',
                META: 'Purchase',
            },
        },
    },

    CORPAY_FIELDS: {
        EXCLUDED_COUNTRIES: ['IR', 'CU', 'SY', 'UA', 'KP', 'RU'] as string[],
        EXCLUDED_CURRENCIES: ['IRR', 'CUP', 'SYP', 'UAH', 'KPW', 'RUB'] as string[],
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
        PAGE_NAME: {
            COUNTRY: 'country',
            ACCOUNT_DETAILS: 'account-details',
            ACCOUNT_TYPE: 'account-type',
            BANK_INFORMATION: 'bank-information',
            ACCOUNT_HOLDER_DETAILS: 'account-holder-details',
            CONFIRM: 'confirm',
            SUCCESS: 'success',
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

    AI_FEATURES_PROMO_MODAL: 'aiFeaturesPromoModal',

    AI_FEATURES_PROMO_LEARN_MORE_URLS: {
        SPEND_ANALYSIS: 'https://help.expensify.com/articles/new-expensify/concierge-ai/How-Concierge-Analyzes-Spend',
        EXPENSE_ASSISTANT: 'https://help.expensify.com/articles/new-expensify/concierge-ai/Expense-Assistant',
        BUILD_AGENTS: 'https://help.expensify.com/articles/new-expensify/ai-agents/Create-Agent-Rules',
    },

    BASE_LIST_ITEM_TEST_ID: 'base-list-item-',
    SELECTION_BUTTON_TEST_ID: 'selection-button-',
    PRODUCT_TRAINING_TOOLTIP_NAMES: {
        // TODO: CONCIERGE_LHN_GBR tooltip will be replaced by a tooltip in the #admins room
        // https://github.com/Expensify/App/issues/57045#issuecomment-2701455668
        CONCIERGE_LHN_GBR: 'conciergeLHNGBR',
        RENAME_SAVED_SEARCH: 'renameSavedSearch',
        OUTSTANDING_FILTER: 'outstandingFilter',
        ACCOUNT_SWITCHER: 'accountSwitcher',
        SCAN_TEST_DRIVE_CONFIRMATION: 'scanTestDriveConfirmation',
        MULTI_SCAN_EDUCATIONAL_MODAL: 'multiScanEducationalModal',
        GPS_TOOLTIP: 'gpsTooltip',
        HAS_FILTER_NEGATION: 'hasFilterNegation',
        MILEAGE_RATE_AUTO_UPDATED: 'mileageRateAutoUpdated',
    },
    CHANGE_POLICY_TRAINING_MODAL: 'changePolicyModal',
    AGENTS_RULES_BANNER: 'agentsRulesBanner',
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
            isInLandscapeMode: false,
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
        MONTHLY_SETTLEMENT_DATE: 'monthlySettlementDate',
    },
    LAST_PAYMENT_METHOD: {
        LAST_USED: 'lastUsed',
        IOU: 'iou',
        EXPENSE: 'expense',
        INVOICE: 'invoice',
    },
    SKIPPABLE_COLLECTION_MEMBER_IDS: [String(DEFAULT_NUMBER_ID), '-1', 'undefined', 'null', 'NaN'] as string[],
    ACCOUNT_EXECUTIVE_LOGIN: 'Account Executive',
    // Legacy fallback login kept so personal details persisted in Onyx before the "Setup Specialist" → "Account Executive" rename are still excluded after users upgrade
    ACCOUNT_EXECUTIVE_LEGACY_LOGIN: 'Setup Specialist',

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
        DISABLE_RHP_ANIMATION: 'disableRHPAnimation',
        RESTORE_RHP_ANIMATION: 'restoreRHPAnimation',
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

    TABLES: {
        FILTER_TYPE: {
            SINGLE_SELECT: 'singleSelect',
            MULTI_SELECT: 'multiSelect',
        },
    },

    SENTRY_LABEL: {
        BILLING_BANNER: {
            RIGHT_ICON: 'BillingBanner-RightIcon',
        },
        HIGH_CONTRAST_MODE_SWITCHER: {
            TOGGLE: 'HighContrastModeSwitcher-Toggle',
        },
        AGENTS_RULES_BANNER: {
            CTA: 'AgentsRulesBanner-CTA',
            DISMISS: 'AgentsRulesBanner-Dismiss',
        },
        NAVIGATION_TAB_BAR: {
            EXPENSIFY_LOGO: 'NavigationTabBar-ExpensifyLogo',
            INBOX: 'NavigationTabBar-Inbox',
            REPORTS: 'NavigationTabBar-Reports',
            WORKSPACES: 'NavigationTabBar-Workspaces',
            ACCOUNT: 'NavigationTabBar-Account',
            HOME: 'NavigationTabBar-Home',
            FLOATING_ACTION_BUTTON: 'NavigationTabBar-FloatingActionButton',
            FLOATING_RECEIPT_BUTTON: 'NavigationTabBar-FloatingReceiptButton',
            FLOATING_GPS_BUTTON: 'NavigationTabBar-FloatingGpsButton',
            FLOATING_CAMERA_BUTTON: 'NavigationTabBar-FloatingCameraButton',
        },
        FAB_MENU: {
            CREATE_EXPENSE: 'FABMenu-CreateExpense',
            TRACK_DISTANCE: 'FABMenu-TrackDistance',
            CREATE_REPORT: 'FABMenu-CreateReport',
            START_CHAT: 'FABMenu-StartChat',
            SEND_INVOICE: 'FABMenu-SendInvoice',
            BOOK_TRAVEL: 'FABMenu-BookTravel',
            NEW_WORKSPACE: 'FABMenu-NewWorkspace',
            QUICK_ACTION: 'FABMenu-QuickAction',
        },
        ODOMETER_EXPENSE: {
            CAPTURE_IMAGE_START: 'IOURequestStepDistanceOdometer-CaptureStartImage',
            CAPTURE_IMAGE_END: 'IOURequestStepDistanceOdometer-CaptureEndImage',
        },
        OPTION_CARD_PICKER: {
            OPTION_ITEM: 'OptionCardPicker-OptionItem',
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
        MODAL: {
            DISMISS_DIALOG: 'Modal-DismissDialog',
        },
        ATTACHMENT_PREVIEW: {
            VIDEO_THUMBNAIL: 'AttachmentPreview-VideoThumbnail',
            IMAGE_THUMBNAIL: 'AttachmentPreview-ImageThumbnail',
            PDF_THUMBNAIL: 'AttachmentPreview-PDFThumbnail',
        },
        HEADER: {
            BACK_BUTTON: 'Header-BackButton',
            DOWNLOAD_BUTTON: 'Header-DownloadButton',
            ROTATE_BUTTON: 'Header-RotateButton',
            CLOSE_BUTTON: 'Header-CloseButton',
            MORE_BUTTON: 'Header-MoreButton',
        },
        TOP_BAR: {
            CANCEL_BUTTON: 'TopBar-CancelButton',
        },
        COLLAPSIBLE_SECTION: {
            TOGGLE: 'CollapsibleSection-Toggle',
        },
        ACCORDION_SECTION: {
            TOGGLE: 'AccordionSection-Toggle',
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
            PRE: 'HTMLRenderer-Pre',
        },
        RECEIPT: {
            IMAGE: 'Receipt-Image',
            ENLARGE_BUTTON: 'Receipt-EnlargeButton',
            ADD_ATTACHMENT_BUTTON: 'Receipt-AddAttachmentButton',
        },
        RECEIPT_MODAL: {
            DOWNLOAD_RECEIPT: 'ReceiptModal-DownloadReceipt',
            DELETE_RECEIPT: 'ReceiptModal-DeleteReceipt',
        },
        AVATAR_WITH_DISPLAY_NAME: {
            SHOW_ACTOR_DETAILS: 'AvatarWithDisplayName-ShowActorDetails',
            GO_TO_DETAILS_PAGE: 'AvatarWithDisplayName-GoToDetailsPage',
        },
        HEADER_VIEW: {
            BACK_BUTTON: 'HeaderView-BackButton',
            CHRONOS_TIMER_BUTTON: 'HeaderView-ChronosTimerButton',
            DETAILS_BUTTON: 'HeaderView-DetailsButton',
        },
        SEARCH: {
            SEARCH_BUTTON: 'Search-SearchButton',
            TRANSACTION_GROUP_LIST_ITEM: 'Search-TransactionGroupListItem',
            TRANSACTION_LIST_ITEM: 'Search-TransactionListItem',
            REPORT_EXPAND_COLLAPSE: 'Search-ReportExpandCollapse',
            SELECT_ALL_BUTTON: 'Search-SelectAllButton',
            FILTER_DISPLAY: 'Search-FilterDisplay',
            FILTER_GROUP_BY: 'Search-FilterGroupBy',
            FILTER_SORT_BY: 'Search-FilterSortBy',
            FILTER_GROUP_CURRENCY: 'Search-FilterGroupCurrency',
            FILTER_VIEW: 'Search-FilterView',
            FILTER_LIMIT: 'Search-FilterLimit',
            ADVANCED_FILTERS_BUTTON: 'Search-AdvancedFiltersButton',
            COLUMNS_BUTTON: 'Search-ColumnsButton',
            BULK_ACTIONS_DROPDOWN: 'Search-BulkActionsDropdown',
            SELECT_ALL_CHECKBOX: 'Search-SelectAllCheckbox',
            SELECTION_MODE_MENU_ITEM: 'Search-SelectionModeMenuItem',
            FILTER_RESET_BUTTON: 'Search-FilterResetButton',
            FILTER_SAVE_BUTTON: 'Search-FilterSaveButton',
            NARROW_BULK_ACTIONS_DROPDOWN: 'Search-NarrowBulkActionsDropdown',
            SAVED_SEARCH_THREE_DOT_MENU: 'Search-SavedSearchThreeDotMenu',
            FILTER_POPUP_RESET_SINGLE_SELECT: 'Search-FilterPopupResetSingleSelect',
            FILTER_POPUP_APPLY_SINGLE_SELECT: 'Search-FilterPopupApplySingleSelect',
            FILTER_POPUP_RESET_MULTI_SELECT: 'Search-FilterPopupResetMultiSelect',
            FILTER_POPUP_APPLY_MULTI_SELECT: 'Search-FilterPopupApplyMultiSelect',
            FILTER_POPUP_RESET_TEXT_INPUT: 'Search-FilterPopupResetTextInput',
            FILTER_POPUP_APPLY_TEXT_INPUT: 'Search-FilterPopupApplyTextInput',
            FILTER_POPUP_APPLY_AMOUNT: 'Search-FilterPopupApplyAmount',
            FILTER_POPUP_APPLY_DATE: 'Search-FilterPopupApplyDate',
            FILTER_POPUP_APPLY_REPORT_FIELD: 'Search-FilterPopupApplyReportField',
            TRANSACTION_LIST_ITEM_CHECKBOX: 'Search-TransactionListItemCheckbox',
            EXPANDED_TRANSACTION_ROW: 'Search-ExpandedTransactionRow',
            EXPANDED_TRANSACTION_ROW_CHECKBOX: 'Search-ExpandedTransactionRowCheckbox',
            SIDEBAR_TOGGLE: 'Search-SidebarToggle',
            TYPE_MENU_ITEM: 'Search-TypeMenuItem',
            SAVED_SEARCH_MENU_ITEM: 'Search-SavedSearchMenuItem',
            SAVE_VIEW_BUTTON: 'Search-SaveViewButton',
            CLEAR_FILTERS_BUTTON: 'Search-ClearFiltersButton',
            ACTION_CELL_VIEW: 'Search-ActionCellView',
            ACTION_CELL_PAY: 'Search-ActionCellPay',
            ACTION_CELL_ACTION: 'Search-ActionCellAction',
            EXPENSE_REPORT_CHECKBOX: 'Search-ExpenseReportCheckbox',
            GROUP_EXPAND_TOGGLE: 'Search-GroupExpandToggle',
            GROUP_SELECT_ALL_CHECKBOX: 'Search-GroupSelectAllCheckbox',
            SORTABLE_HEADER: 'Search-SortableHeader',
            UNREPORTED_EXPENSE_LIST_ITEM: 'UnreportedExpenseListItem',
        },
        EXPENSE_RULES: {
            TABLE_ROW: 'ExpenseRules-TableRow',
        },
        TABLE: {
            FILTERS: 'Table-Filters',
            EDITABLE_CELL: 'Table-EditableCell',
        },
        REPORT: {
            FLOATING_MESSAGE_COUNTER: 'Report-FloatingMessageCounter',
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
            REPORT_ACTION_ITEM_MESSAGE_EDIT_CANCEL_BUTTON: 'Report-ReportActionItemMessageEditCancelButton',
            REPORT_ACTION_ITEM_MESSAGE_EDIT_SAVE_BUTTON: 'Report-ReportActionItemMessageEditSaveButton',
            REPORT_ACTION_ITEM_SINGLE_AVATAR_BUTTON: 'Report-ReportActionItemSingleAvatarButton',
            REPORT_ACTION_ITEM_SINGLE_ACTOR_BUTTON: 'Report-ReportActionItemSingleActorButton',
            REPORT_ACTION_ITEM_THREAD: 'Report-ReportActionItemThread',
            THREAD_DIVIDER: 'Report-ThreadDivider',
            REPORT_ACTION_ITEM: 'Report-ReportActionItem',
            MODERATION_BUTTON: 'Report-ModerationButton',
            MONEY_REQUEST_REPORT_ACTIONS_LIST_SELECT_ALL: 'MoneyRequestReportActionsList-SelectAll',
            MONEY_REQUEST_REPORT_TRANSACTION_ITEM: 'MoneyRequestReportTransactionItem',
            REPORT_ACTION_AVATAR: 'Report-ReportActionAvatar',
        },
        SIDEBAR: {
            SIGN_IN_BUTTON: 'Sidebar-SignInButton',
        },
        LHN: {
            OPTION_ROW: 'LHN-OptionRow',
        },
        OPTION_ROW: {
            BASE_LIST_ITEM: 'OptionRow-BaseListItem',
        },
        TABLE_HEADER: {
            SORTABLE_COLUMN: 'TableHeader-SortableColumn',
        },
        SELECTION_LIST: {
            BASE_LIST_ITEM: 'SelectionList-BaseListItem',
            SPLIT_LIST_ITEM_EDIT_BUTTON: 'SplitListItem-EditButton',
            LIST_HEADER_SELECT_ALL: 'SelectionList-ListHeader-SelectAll',
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
            VIEW_AGENT_ZERO_TRACE: 'ContextMenu-ViewAgentZeroTrace',
            DEBUG: 'ContextMenu-Debug',
            DELETE: 'ContextMenu-Delete',
            MENU: 'ContextMenu-Menu',
            EXPLAIN: 'ContextMenu-Explain',
        },
        MORE_MENU: {
            MORE_BUTTON: 'MoreMenu-MoreButton',
            VIEW_DETAILS: 'MoreMenu-ViewDetails',
            EXPORT: 'MoreMenu-Export',
            EXPORT_FILE: 'MoreMenu-ExportFile',
            DOWNLOAD_PDF: 'MoreMenu-DownloadPDF',
            PRINT: 'MoreMenu-Print',
            CLOSE_PDF_MODAL: 'MoreMenu-ClosePDFModal',
            SUBMIT: 'MoreMenu-Submit',
            APPROVE: 'MoreMenu-Approve',
            RECEIVED_PAYMENT: 'MoreMenu-ReceivedPayment',
            UNAPPROVE: 'MoreMenu-Unapprove',
            CANCEL_PAYMENT: 'MoreMenu-CancelPayment',
            HOLD: 'MoreMenu-Hold',
            REMOVE_HOLD: 'MoreMenu-RemoveHold',
            SPLIT: 'MoreMenu-Split',
            MERGE: 'MoreMenu-Merge',
            CHANGE_WORKSPACE: 'MoreMenu-ChangeWorkspace',
            CHANGE_APPROVER: 'MoreMenu-ChangeApprover',
            DELETE: 'MoreMenu-Delete',
            RETRACT: 'MoreMenu-Retract',
            REOPEN: 'MoreMenu-Reopen',
            REJECT: 'MoreMenu-Reject',
            ADD_EXPENSE: 'MoreMenu-AddExpense',
            ADD_EXPENSE_CREATE: 'MoreMenu-AddExpenseCreate',
            ADD_EXPENSE_TRACK_DISTANCE: 'MoreMenu-AddExpenseTrackDistance',
            ADD_EXPENSE_EXISTING: 'MoreMenu-AddExpenseExisting',
            PAY: 'MoreMenu-Pay',
            DUPLICATE_REPORT: 'MoreMenu-DuplicateReport',
            MOVE_EXPENSE: 'MoreMenu-MoveExpense',
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
        REQUEST_CONFIRMATION_LIST: {
            RESET_SPLIT_SHARES: 'RequestConfirmationList-ResetSplitShares',
            RECEIPT_THUMBNAIL: 'RequestConfirmationList-ReceiptThumbnail',
            PDF_RECEIPT_THUMBNAIL: 'RequestConfirmationList-PDFReceiptThumbnail',
            AMOUNT_FIELD: 'RequestConfirmationList-AmountField',
            DESCRIPTION_FIELD: 'RequestConfirmationList-DescriptionField',
            DISTANCE_FIELD: 'RequestConfirmationList-DistanceField',
            RATE_FIELD: 'RequestConfirmationList-RateField',
            MERCHANT_FIELD: 'RequestConfirmationList-MerchantField',
            HOURS_FIELD: 'RequestConfirmationList-HoursField',
            TIME_RATE_FIELD: 'RequestConfirmationList-TimeRateField',
            CATEGORY_FIELD: 'RequestConfirmationList-CategoryField',
            DATE_FIELD: 'RequestConfirmationList-DateField',
            TAG_FIELD: 'RequestConfirmationList-TagField',
            TAX_RATE_FIELD: 'RequestConfirmationList-TaxRateField',
            TAX_AMOUNT_FIELD: 'RequestConfirmationList-TaxAmountField',
            ATTENDEES_FIELD: 'RequestConfirmationList-AttendeesField',
            REPORT_FIELD: 'RequestConfirmationList-ReportField',
            DESTINATION_FIELD: 'RequestConfirmationList-DestinationField',
            TIME_FIELD: 'RequestConfirmationList-TimeField',
            SUBRATE_FIELD: 'RequestConfirmationList-SubrateField',
            SEND_FROM_FIELD: 'RequestConfirmationList-SendFromField',
        },
        TRANSACTION_PREVIEW: {
            CARD: 'TransactionPreview-Card',
        },
        TRIP_ROOM_PREVIEW: {
            CARD: 'TripRoomPreview-Card',
        },
        TRANSACTION_ITEM_ROW: {
            ARROW_RIGHT: 'TransactionItemRow-ArrowRight',
        },
        PDF_VIEW: {
            DOCUMENT: 'PDFView-Document',
        },
        AVATAR_CROP_MODAL: {
            ZOOM_SLIDER: 'AvatarCropModal-ZoomSlider',
        },
        PAYMENT_METHOD_LIST_ITEM: {
            CHASE_ACCOUNT_HELP: 'PaymentMethodListItem-ChaseAccountHelp',
        },
        EMOJI_PICKER: {
            BUTTON: 'EmojiPicker-Button',
            BUTTON_DROPDOWN: 'EmojiPicker-ButtonDropdown',
            MENU_ITEM: 'EmojiPicker-MenuItem',
            SKIN_TONE_TOGGLE: 'EmojiPicker-SkinToneToggle',
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
        ACCOUNT: {
            PROFILE: 'Account-Profile',
            WALLET: 'Account-Wallet',
            AGENTS: 'Account-Agents',
            RULES: 'Account-Rules',
            PREFERENCES: 'Account-Preferences',
            COPILOT: 'Account-Copilot',
            SECURITY: 'Account-Security',
            SUBSCRIPTION: 'Account-Subscription',
            STATUS_PICKER: 'Account-StatusPicker',
        },
        DISCOVER_SECTION: {
            TEST_DRIVE: 'DiscoverSection-TestDrive',
        },
        HOME_PAGE: {
            WIDGET_ITEM: 'HomePage-WidgetItem',
            GETTING_STARTED_ROW: 'HomePage-GettingStartedRow',
            GETTING_STARTED_FOOTER_HELP: 'HomePage-GettingStartedFooterHelp',
        },
        CALENDAR_PICKER: {
            YEAR_PICKER: 'CalendarPicker-YearPicker',
            MONTH_PICKER: 'CalendarPicker-MonthPicker',
            PREV_MONTH: 'CalendarPicker-PrevMonth',
            NEXT_MONTH: 'CalendarPicker-NextMonth',
            PREV_YEAR: 'CalendarPicker-PrevYear',
            NEXT_YEAR: 'CalendarPicker-NextYear',
            DAY: 'CalendarPicker-Day',
        },
        PREV_NEXT_BUTTONS: {
            PREV_BUTTON: 'PrevNextButtons-PrevButton',
            NEXT_BUTTON: 'PrevNextButtons-NextButton',
        },
        REANIMATED_MODAL: {
            BACKDROP: 'ReanimatedModal-Backdrop',
        },
        SHARE_DETAIL: {
            DISMISS_KEYBOARD_BUTTON: 'ShareDetail-DismissKeyboardButton',
        },
        MAP_VIEW: {
            COMPASS: 'compass',
        },
        MONEY_REQUEST: {
            AMOUNT_NEXT_BUTTON: 'MoneyRequest-AmountNextButton',
            AMOUNT_PAY_BUTTON: 'MoneyRequest-AmountPayButton',
            PARTICIPANTS_NEXT_BUTTON: 'MoneyRequest-ParticipantsNextButton',
            PARTICIPANTS_NEW_WORKSPACE_BUTTON: 'MoneyRequest-ParticipantsNewWorkspaceButton',
            PARTICIPANTS_IMPORT_CONTACTS_ITEM: 'MoneyRequest-ParticipantsImportContacts',
            ATTENDEES_SAVE_BUTTON: 'MoneyRequest-AttendeesSaveButton',
            CONFIRMATION_SUBMIT_BUTTON: 'MoneyRequest-ConfirmationSubmitButton',
            CONFIRMATION_REMOVE_EXPENSE_BUTTON: 'MoneyRequest-ConfirmationRemoveExpenseButton',
            CONFIRMATION_PAY_BUTTON: 'MoneyRequest-ConfirmationPayButton',
            GOOGLE_MERCHANT_SEARCH_BUTTON: 'MoneyRequest-GoogleMerchantSearchButton',
        },
        SPLIT_EXPENSE: {
            ADD_SPLIT_BUTTON: 'SplitExpense-AddSplitButton',
            MAKE_SPLITS_EVEN_BUTTON: 'SplitExpense-MakeSplitsEvenButton',
            SAVE_BUTTON: 'SplitExpense-SaveButton',
            REMOVE_SPLIT_BUTTON: 'SplitExpense-RemoveSplitButton',
            EDIT_SAVE_BUTTON: 'SplitExpense-EditSaveButton',
        },
        MERGE_EXPENSE: {
            MERGE_TRANSACTION_ITEM: 'MergeExpense-MergeTransactionItem',
            RECEIPT_ITEM: 'MergeExpense-ReceiptItem',
            FIELD_VALUE_OPTION: 'MergeExpense-FieldValueOption',
        },
        IOU_REQUEST_STEP: {
            DISTANCE_MAP_NEXT_BUTTON: 'IOURequestStep-DistanceMapNextButton',
            DISTANCE_MANUAL_NEXT_BUTTON: 'IOURequestStep-DistanceManualNextButton',
            DISTANCE_ODOMETER_NEXT_BUTTON: 'IOURequestStep-DistanceOdometerNextButton',
            DISTANCE_ODOMETER_SAVE_FOR_LATER_BUTTON: 'IOURequestStep-DistanceOdometerSaveForLaterButton',
            ODOMETER_CHOOSE_FILE_BUTTON: 'IOURequestStep-OdometerChooseFileButton',
            GPS_START_STOP_BUTTON: 'IOURequestStep-GPSStartStopButton',
            GPS_DISCARD_BUTTON: 'IOURequestStep-GPSDiscardButton',
            GPS_NEXT_BUTTON: 'IOURequestStep-GPSNextButton',
            GPS_OPEN_MOBILE_BUTTON: 'IOURequestStep-GPSOpenMobileButton',
            WAYPOINT_REMOVE_BUTTON: 'IOURequestStep-WaypointRemoveButton',
            WAYPOINT_START_MENU_ITEM: 'IOURequestStep-WaypointStartMenuItem',
            WAYPOINT_STOP_MENU_ITEM: 'IOURequestStep-WaypointStopMenuItem',
            EDIT_CATEGORIES_BUTTON: 'IOURequestStep-CategoryEditButton',
            EDIT_TAGS_BUTTON: 'IOURequestStep-TagEditButton',
            EDIT_PER_DIEM_RATES_BUTTON: 'IOURequestStep-EditPerDiemRatesButton',
            HOURS_NEXT_BUTTON: 'IOURequestStep-HoursNextButton',
            SCAN_SUBMIT_BUTTON: 'IOURequestStep-ScanSubmitButton',
            RECEIPT_DELETE_BUTTON: 'IOURequestStep-ReceiptDeleteButton',
            RECEIPT_PREVIEW_ITEM: 'IOURequestStep-ReceiptPreviewItem',
            RECEIPT_PREVIEW_SUBMIT_BUTTON: 'IOURequestStep-ReceiptPreviewSubmitButton',
        },
        TAB_SELECTOR: {
            MANUAL_TAB: 'TabSelector-ManualTab',
            SCAN_TAB: 'TabSelector-ScanTab',
            DISTANCE_TAB: 'TabSelector-DistanceTab',
            PER_DIEM_TAB: 'TabSelector-PerDiemTab',
            TIME_TAB: 'TabSelector-TimeTab',
            DISTANCE_MAP_TAB: 'TabSelector-DistanceMapTab',
            DISTANCE_MANUAL_TAB: 'TabSelector-DistanceManualTab',
            DISTANCE_GPS_TAB: 'TabSelector-DistanceGPSTab',
            DISTANCE_ODOMETER_TAB: 'TabSelector-DistanceOdometerTab',
            CHAT_TAB: 'TabSelector-ChatTab',
            ROOM_TAB: 'TabSelector-RoomTab',
            SHARE_TAB: 'TabSelector-ShareTab',
            SUBMIT_TAB: 'TabSelector-SubmitTab',
            SPLIT_AMOUNT_TAB: 'TabSelector-SplitAmountTab',
            SPLIT_PERCENTAGE_TAB: 'TabSelector-SplitPercentageTab',
            SPLIT_DATE_TAB: 'TabSelector-SplitDateTab',
        },
        REQUEST_STEP: {
            SCAN: {
                MULTI_SCAN: 'Scan-MultiScan',
                FLASH: 'Scan-Flash',
                CHOOSE_FILE: 'Scan-ChooseFile',
                CHOOSE_FILES: 'Scan-ChooseFiles',
                SHUTTER: 'Scan-Shutter',
            },
            ODOMETER_IMAGE: {
                FLASH: 'OdometerImage-Flash',
                GALLERY: 'OdometerImage-Gallery',
                SHUTTER: 'OdometerImage-Shutter',
                CHOOSE_FILE: 'OdometerImage-ChooseFile',
                CONTINUE_BUTTON: 'OdometerImage-ContinueButton',
            },
        },
        WORKSPACE_EXPENSIFY_CARD: {
            BULK_ACTIONS_DROPDOWN: 'WorkspaceExpensifyCard-BulkActionsDropdown',
            CARD_LIST_ROW: 'WorkspaceExpensifyCard-CardListRow',
        },
        WORKSPACE: {
            APPROVAL_WORKFLOW_SECTION: 'Workspace-ApprovalWorkflowSection',
            TOGGLE_SETTINGS_ROW: 'Workspace-ToggleSettingsRow',
            DUPLICATE_SELECT_FEATURES_SELECT_ALL: 'WorkspaceDuplicate-SelectFeaturesSelectAll',
            COPY_SETTINGS_SELECT_FEATURES_SELECT_ALL: 'WorkspaceCopySettings-SelectFeaturesSelectAll',
            INVITE_MESSAGE_PRIVACY_LINK: 'WorkspaceInviteMessage-PrivacyLink',
            IMPORTED_MEMBERS_CONFIRMATION_PRIVACY_LINK: 'ImportedMembersConfirmation-PrivacyLink',
            COMPANY_CARDS: {
                TABLE_ITEM: 'Workspace-CompanyCards-TableItem',
                MORE_DROPDOWN: 'WorkspaceCompanyCards-MoreDropdown',
                CARD_NAME: 'WorkspaceCompanyCards-CardName',
                CARD_EXPORT: 'WorkspaceCompanyCards-CardExport',
                UNASSIGN_CARD: 'WorkspaceCompanyCards-UnassignCard',
                TRANSACTION_START_DATE: 'WorkspaceCompanyCards-TransactionStartDate',
            },
            LIST: {
                NEW_WORKSPACE_BUTTON: 'WorkspaceList-NewWorkspaceButton',
                NEW_DOMAIN_BUTTON: 'WorkspaceList-NewDomainButton',
                THREE_DOT_MENU: 'WorkspaceList-ThreeDotMenu',
                ROW: 'WorkspaceList-Row',
            },
            INITIAL: {
                PROFILE: 'WorkspaceInitial-Profile',
                MEMBERS: 'WorkspaceInitial-Members',
                ROOMS: 'WorkspaceInitial-Rooms',
                REPORTS: 'WorkspaceInitial-Reports',
                ACCOUNTING: 'WorkspaceInitial-Accounting',
                HR: 'WorkspaceInitial-HR',
                RECEIPT_PARTNERS: 'WorkspaceInitial-ReceiptPartners',
                CATEGORIES: 'WorkspaceInitial-Categories',
                TAGS: 'WorkspaceInitial-Tags',
                TAXES: 'WorkspaceInitial-Taxes',
                WORKFLOWS: 'WorkspaceInitial-Workflows',
                RULES: 'WorkspaceInitial-Rules',
                DISTANCE_RATES: 'WorkspaceInitial-DistanceRates',
                TRAVEL: 'WorkspaceInitial-Travel',
                EXPENSIFY_CARD: 'WorkspaceInitial-ExpensifyCard',
                COMPANY_CARDS: 'WorkspaceInitial-CompanyCards',
                PER_DIEM: 'WorkspaceInitial-PerDiem',
                TIME_TRACKING: 'WorkspaceInitial-TimeTracking',
                INVOICES: 'WorkspaceInitial-Invoices',
                MORE_FEATURES: 'WorkspaceInitial-MoreFeatures',
            },
            OVERVIEW: {
                AVATAR: 'WorkspaceOverview-Avatar',
                NAME: 'WorkspaceOverview-Name',
                DESCRIPTION: 'WorkspaceOverview-Description',
                CURRENCY: 'WorkspaceOverview-Currency',
                ADDRESS: 'WorkspaceOverview-Address',
                PLAN_TYPE: 'WorkspaceOverview-PlanType',
                SHARE: 'WorkspaceOverview-Share',
                CUSTOM_RULES: 'WorkspaceOverview-CustomRules',
                RULES_DOCUMENT: 'WorkspaceOverview-RulesDocument',
                INVITE_BUTTON: 'WorkspaceOverview-InviteButton',
                MORE_DROPDOWN: 'WorkspaceOverview-MoreDropdown',
            },
            MEMBERS: {
                INVITE_BUTTON: 'WorkspaceMembers-InviteButton',
                BULK_ACTIONS_DROPDOWN: 'WorkspaceMembers-BulkActionsDropdown',
                MORE_DROPDOWN: 'WorkspaceMembers-MoreDropdown',
                LIST_ROW: 'WorkspaceMembers-ListRow',
            },
            CATEGORIES: {
                ROW: 'WorkspaceCategories-Row',
                ADD_BUTTON: 'WorkspaceCategories-AddButton',
                MORE_DROPDOWN: 'WorkspaceCategories-MoreDropdown',
                BULK_ACTIONS_DROPDOWN: 'WorkspaceCategories-BulkActionsDropdown',
            },
            TAGS: {
                ROW: 'WorkspaceTags-Row',
                ADD_BUTTON: 'WorkspaceTags-AddButton',
                MORE_DROPDOWN: 'WorkspaceTags-MoreDropdown',
                BULK_ACTIONS_DROPDOWN: 'WorkspaceTags-BulkActionsDropdown',
            },
            TAXES: {
                ROW: 'WorkspaceTaxes-Row',
                ADD_BUTTON: 'WorkspaceTaxes-AddButton',
                MORE_DROPDOWN: 'WorkspaceTaxes-MoreDropdown',
                BULK_ACTIONS_DROPDOWN: 'WorkspaceTaxes-BulkActionsDropdown',
            },
            DISTANCE_RATES: {
                ROW: 'WorkspaceDistanceRates-Row',
                ADD_BUTTON: 'WorkspaceDistanceRates-AddButton',
                MORE_DROPDOWN: 'WorkspaceDistanceRates-MoreDropdown',
                BULK_ACTIONS_DROPDOWN: 'WorkspaceDistanceRates-BulkActionsDropdown',
                UNIT_SELECTOR: 'WorkspaceDistanceRates-UnitSelector',
            },
            WORKFLOWS: {
                AUTO_REPORTING_FREQUENCY: 'WorkspaceWorkflows-AutoReportingFrequency',
                ADD_APPROVAL: 'WorkspaceWorkflows-AddApproval',
                LOAD_MORE_APPROVALS: 'WorkspaceWorkflows-LoadMoreApprovals',
                BANK_ACCOUNT: 'WorkspaceWorkflows-BankAccount',
                ADD_BANK_ACCOUNT: 'WorkspaceWorkflows-AddBankAccount',
                AUTHORIZED_PAYER: 'WorkspaceWorkflows-AuthorizedPayer',
                APPROVALS_EDIT_SAVE: 'WorkspaceWorkflows-ApprovalsEditSave',
                APPROVAL_EDITOR_MEMBERS: 'WorkspaceWorkflows-ApprovalEditorMembers',
                APPROVAL_EDITOR_APPROVER: 'WorkspaceWorkflows-ApprovalEditorApprover',
                APPROVAL_SECTION_EXPENSES_FROM: 'WorkspaceWorkflows-ApprovalSectionExpensesFrom',
                APPROVAL_SECTION_APPROVER: 'WorkspaceWorkflows-ApprovalSectionApprover',
                APPROVAL_SECTION_SHOW_ALL_MEMBERS: 'WorkspaceWorkflows-ApprovalSectionShowAllMembers',
            },
            ACCOUNTING: {
                SETUP_BUTTON: 'WorkspaceAccounting-SetupButton',
                CARD_SECTION_ADD_BUTTON: 'WorkspaceAccounting-CardSectionAddButton',
                THREE_DOT_MENU: 'WorkspaceAccounting-ThreeDotMenu',
            },
            RULES: {
                ADD_SPEND_RULE: 'WorkspaceRules-AddSpendRule',
                INDIVIDUAL_EXPENSES_MENU_ITEM: 'WorkspaceRules-IndividualExpensesMenuItem',
                SPEND_RULE_ITEM: 'WorkspaceRules-SpendRuleItem',
                MERCHANT_RULE_ITEM: 'WorkspaceRules-MerchantRuleItem',
                REQUIRE_FIELDS_RULE_ITEM: 'WorkspaceRules-RequireFieldsRuleItem',
                REQUIRE_FIELDS_RULE_SAVE: 'WorkspaceRules-RequireFieldsRuleSave',
                REQUIRE_FIELDS_RULE_CATEGORY: 'WorkspaceRules-RequireFieldsRuleCategory',
                REQUIRE_FIELDS_RULE_FIELD_TOGGLE: 'WorkspaceRules-RequireFieldsRuleFieldToggle',
                FLAG_FOR_REVIEW_RULE_ITEM: 'WorkspaceRules-FlagForReviewRuleItem',
                FLAG_FOR_REVIEW_RULE_SAVE: 'WorkspaceRules-FlagForReviewRuleSave',
                FLAG_FOR_REVIEW_RULE_CATEGORY: 'WorkspaceRules-FlagForReviewRuleCategory',
                FLAG_FOR_REVIEW_RULE_AMOUNT: 'WorkspaceRules-FlagForReviewRuleAmount',
                FLAG_FOR_REVIEW_RULE_EXPENSE_LIMIT_TYPE: 'WorkspaceRules-FlagForReviewRuleExpenseLimitType',
                MERCHANT_TYPE_RULE_ITEM: 'WorkspaceRules-MerchantTypeRuleItem',
                MERCHANT_TYPE_RULE_SAVE: 'WorkspaceRules-MerchantTypeRuleSave',
                MERCHANT_TYPE_RULE_CATEGORY: 'WorkspaceRules-MerchantTypeRuleCategory',
                ADD_MERCHANT_RULE: 'WorkspaceRules-AddMerchantRule',
                MERCHANT_RULE_SECTION_ITEM: 'WorkspaceRules-MerchantRuleSectionItem',
                MERCHANT_RULE_SAVE: 'WorkspaceRules-MerchantRuleSave',
                MERCHANT_RULE_PREVIEW_MATCHES: 'WorkspaceRules-MerchantRulePreviewMatches',
                MERCHANT_RULE_DELETE: 'WorkspaceRules-MerchantRuleDelete',
                CATEGORY_SELECTOR: 'WorkspaceRules-CategorySelector',
                CURRENCY_SELECTOR: 'WorkspaceRules-CurrencySelector',
                SPEND_RULE_SECTION_ITEM: 'WorkspaceRules-SpendRuleSectionItem',
                SPEND_RULE_SAVE: 'WorkspaceRules-SpendRuleSave',
                SPEND_RULE_RESTRICTION_TYPE: 'WorkspaceRules-SpendRuleRestrictionType',
                AGENT_RULE_ITEM: 'WorkspaceRules-AgentRuleItem',
                ADD_AGENT_RULE: 'WorkspaceRules-AddAgentRule',
                AGENT_RULE_DELETE: 'WorkspaceRules-AgentRuleDelete',
                NEW_RULE_MENU_ITEM: 'WorkspaceRules-NewRuleMenuItem',
                NEW_RULE_MENU_ITEM_RESTRICT_CARD_SPEND: 'WorkspaceRules-NewRuleMenuItem-RestrictCardSpend',
                NEW_RULE_MENU_ITEM_FLAG_FOR_REVIEW: 'WorkspaceRules-NewRuleMenuItem-FlagForReview',
                NEW_RULE_MENU_ITEM_REQUIRE_FIELDS: 'WorkspaceRules-NewRuleMenuItem-RequireFields',
                NEW_RULE_MENU_ITEM_APPLY_EXPENSE_DEFAULTS: 'WorkspaceRules-NewRuleMenuItem-ApplyExpenseDefaults',
                REQUIRE_RECEIPTS_SAVE: 'WorkspaceRules-RequireReceiptsSave',
                REQUIRE_FIELDS_SAVE: 'WorkspaceRules-RequireFieldsSave',
                FLAG_RECEIPT_LINE_ITEMS_SAVE: 'WorkspaceRules-FlagReceiptLineItemsSave',
                BULK_ACTIONS_DROPDOWN: 'WorkspaceRules-BulkActionsDropdown',
            },
            EXPENSIFY_CARD: {
                ROW: 'WorkspaceExpensifyCard-Row',
                ISSUE_CARD_BUTTON: 'WorkspaceExpensifyCard-IssueCardButton',
                MORE_DROPDOWN: 'WorkspaceExpensifyCard-MoreDropdown',
                CHOOSE_SPEND_RULE: 'WorkspaceExpensifyCard-ChooseSpendRule',
            },
            PER_DIEM: {
                ROW: 'WorkspacePerDiem-Row',
                MORE_DROPDOWN: 'WorkspacePerDiem-MoreDropdown',
                BULK_ACTIONS_DROPDOWN: 'WorkspacePerDiem-BulkActionsDropdown',
            },
            TRAVEL: {
                BOOK_TRAVEL_BUTTON: 'WorkspaceTravel-BookTravelButton',
                GET_STARTED_BUTTON: 'WorkspaceTravel-GetStartedButton',
            },
            INVOICES: {
                COMPANY_NAME: 'WorkspaceInvoices-CompanyName',
                COMPANY_WEBSITE: 'WorkspaceInvoices-CompanyWebsite',
            },
            FEATURE_LIST: {
                CTA_BUTTON: 'WorkspaceFeatureList-CtaButton',
            },
        },
        ACCOUNT_SWITCHER: {
            SHOW_ACCOUNTS: 'AccountSwitcher-ShowAccounts',
        },
        SIDE_PANEL: {
            HELP: 'SidePanel-Help',
        },
        PRODUCT_TRAINING: {
            TOOLTIP: 'ProductTraining-Tooltip',
        },
        FORM: {
            SUBMIT_BUTTON: 'Form-SubmitButton',
        },
        ONBOARDING: {
            INTERESTED_FEATURES_ITEM: 'Onboarding-InterestedFeaturesItem',
            ACCOUNTING_SELECT_INTEGRATION: 'OnboardingAccounting-SelectIntegration',
            PURPOSE_ITEM: 'Onboarding-PurposeItem',
            CONTINUE: 'Onboarding-Continue',
            SKIP: 'Onboarding-Skip',
            JOIN_WORKSPACE: 'Onboarding-JoinWorkspace',
        },
        BASE_ANCHOR_FOR_ATTACHMENTS_ONLY: {
            DOWNLOAD_BUTTON: 'BaseAnchorForAttachmentsOnly-DownloadButton',
        },
        REPORT_HEADER_SKELETON: {
            GO_BACK: 'ReportHeaderSkeleton-GoBack',
        },
        TWO_FACTOR_AUTH: {
            RESEND_CODE: 'TwoFactorAuth-ResendCode',
            SWITCH_BETWEEN_METHODS: 'TwoFactorAuth-SwitchBetweenMethods',
            COPY: 'TwoFactorAuth-Copy',
            COPY_CODES: 'TwoFactorAuth-CopyCodes',
        },
        VALIDATE_CODE: {
            RESEND_CODE: 'ValidateCode-ResendCode',
            SKIP: 'ValidateCode-Skip',
            VERIFY: 'ValidateCode-Verify',
        },
        INTERACTIVE_STEP_SUB_HEADER: {
            STEP_BUTTON: 'InteractiveStepSubHeader-StepButton',
        },
        SOCIALS: {
            LINK: 'Socials',
        },
        CONFIRM_CONTENT: {
            DISMISS_BUTTON: 'ConfirmContent-DismissButton',
        },
        COPY_TEXT_TO_CLIPBOARD: {
            COPY_BUTTON: 'CopyTextToClipboard-CopyButton',
        },
        LOCATION_ERROR: {
            CLOSE_BUTTON: 'LocationError-CloseButton',
        },
        PIN_BUTTON: {
            TOGGLE: 'PinButton-Toggle',
        },
        PRESSABLE_WITH_DELAY_TOGGLE: {
            BUTTON: 'PressableWithDelayToggle-Button',
        },
        RADIO_BUTTON: {
            BUTTON: 'RadioButton-Button',
        },
        REFERRAL_PROGRAM: {
            CTA: 'ReferralProgram-CTA',
            DISMISS_BUTTON: 'ReferralProgram-DismissButton',
        },
        USER_LIST_ITEM: {
            CHECKBOX: 'UserListItem-Checkbox',
        },
        UPLOAD_FILE: {
            REMOVE_BUTTON: 'UploadFile-RemoveButton',
        },
        BANK_ACCOUNT: {
            DATA_SECURE_LINK: 'BankAccount-DataSecureLink',
        },
        EARLY_DISCOUNT_BANNER: {
            DISMISS_BUTTON: 'EarlyDiscountBanner-DismissButton',
        },
        WORKSPACE_CARDS_LIST: {
            INFO_BUTTON: 'WorkspaceCardsList-InfoButton',
        },
        RECEIPT_PARTNERS: {
            INVITE_RESEND_BUTTON: 'ReceiptPartners-InviteResendButton',
        },
        SIGN_IN: {
            CONTINUE: 'SignIn-Continue',
            SIGN_IN_BUTTON: 'SignIn-SignInButton',
            JOIN: 'SignIn-Join',
            SSO: 'SignIn-SSO',
            MAGIC_CODE: 'SignIn-MagicCode',
            UNLINK: 'SignIn-Unlink',
            GO_BACK: 'SignIn-GoBack',
            VALIDATE: 'SignIn-Validate',
            SEND: 'SignIn-Send',
            CONFIRM: 'SignIn-Confirm',
        },
        SETTINGS_GENERAL: {
            HELP: 'SettingsGeneral-Help',
            WHATS_NEW: 'SettingsGeneral-WhatsNew',
            ABOUT: 'SettingsGeneral-About',
            TROUBLESHOOT: 'SettingsGeneral-Troubleshoot',
            SAVE_THE_WORLD: 'SettingsGeneral-SaveTheWorld',
            SIGN_OUT: 'SettingsGeneral-SignOut',
            GO_TO_CLASSIC: 'SettingsGeneral-GoToExpensifyClassic',
        },
        ADD_AGENT_PAGE: {
            AVATAR: 'AddAgentPage-Avatar',
        },
        EDIT_AGENT_PAGE: {
            AVATAR: 'EditAgentPage-Avatar',
        },
        SETTINGS_PROFILE: {
            AVATAR: 'SettingsProfile-Avatar',
            DISPLAY_NAME: 'SettingsProfile-DisplayName',
            CONTACT_METHODS: 'SettingsProfile-ContactMethods',
            STATUS: 'SettingsProfile-Status',
            PRONOUNS: 'SettingsProfile-Pronouns',
            TIMEZONE: 'SettingsProfile-Timezone',
            SHARE_CODE: 'SettingsProfile-ShareCode',
            LEGAL_NAME: 'SettingsProfile-LegalName',
            DATE_OF_BIRTH: 'SettingsProfile-DateOfBirth',
            PHONE_NUMBER: 'SettingsProfile-PhoneNumber',
            ADDRESS: 'SettingsProfile-Address',
        },
        SETTINGS_PREFERENCES: {
            PRIORITY_MODE: 'SettingsPreferences-PriorityMode',
            LANGUAGE: 'SettingsPreferences-Language',
            PAYMENT_CURRENCY: 'SettingsPreferences-PaymentCurrency',
            THEME: 'SettingsPreferences-Theme',
        },
        SETTINGS_SECURITY: {
            TWO_FACTOR_AUTH: 'SettingsSecurity-TwoFactorAuth',
            REVOKE_MFA: 'SettingsSecurity-RevokeMFA',
            MERGE_ACCOUNTS: 'SettingsSecurity-MergeAccounts',
            LOCK_UNLOCK_ACCOUNT: 'SettingsSecurity-LockUnlockAccount',
            DEVICE_MANAGEMENT: 'SettingsSecurity-DeviceManagement',
            CLOSE_ACCOUNT: 'SettingsSecurity-CloseAccount',
            ADD_COPILOT: 'SettingsSecurity-AddCopilot',
            DELEGATE_ITEM: 'SettingsSecurity-DelegateItem',
            DELEGATE_CHANGE_ACCESS: 'SettingsSecurity-DelegateChangeAccess',
            DELEGATE_REMOVE: 'SettingsSecurity-DelegateRemove',
            DELEGATOR_ITEM: 'SettingsSecurity-DelegatorItem',
            DELEGATOR_REMOVE: 'SettingsSecurity-DelegatorRemove',
        },
        SETTINGS_WALLET: {
            ADD_BANK_ACCOUNT: 'SettingsWallet-AddBankAccount',
            ADD_PERSONAL_CARD: 'SettingsWallet-AddPersonalCard',
            IMPORT_TRANSACTIONS: 'SettingsWallet-ImportTransactions',
            TRANSFER_BALANCE: 'SettingsWallet-TransferBalance',
            ENABLE_WALLET: 'SettingsWallet-EnableWallet',
        },
        SETTINGS_RULES: {
            NEW_RULE: 'SettingsRules-NewRule',
        },
        SETTINGS_TEACHERS_UNITE: {
            I_KNOW_A_TEACHER: 'SettingsTeachersUnite-IKnowATeacher',
            I_AM_A_TEACHER: 'SettingsTeachersUnite-IAmATeacher',
        },
        SETTINGS_SUBSCRIPTION: {
            EXPLORE_PLANS: 'SettingsSubscription-ExplorePlans',
            SAVE_WITH_EXPENSIFY: 'SettingsSubscription-SaveWithExpensify',
            RETRY_PAYMENT: 'SettingsSubscription-RetryPayment',
            AUTHENTICATE_PAYMENT: 'SettingsSubscription-AuthenticatePayment',
            VIEW_PAYMENT_HISTORY: 'SettingsSubscription-ViewPaymentHistory',
            REQUEST_REFUND: 'SettingsSubscription-RequestRefund',
            CANCEL_SUBSCRIPTION: 'SettingsSubscription-CancelSubscription',
        },
        SETTINGS_HELP: {
            CONCIERGE_CHAT: 'SettingsHelp-ConciergeChat',
            HELP_DOCS: 'SettingsHelp-HelpDocs',
            ACCOUNT_MANAGER: 'SettingsHelp-AccountManager',
            PARTNER_MANAGER: 'SettingsHelp-PartnerManager',
            GUIDE: 'SettingsHelp-Guide',
        },
        SETTINGS_ABOUT: {
            APP_DOWNLOAD_LINKS: 'SettingsAbout-AppDownloadLinks',
            VIEW_KEYBOARD_SHORTCUTS: 'SettingsAbout-ViewKeyboardShortcuts',
            VIEW_THE_CODE: 'SettingsAbout-ViewTheCode',
            VIEW_OPEN_JOBS: 'SettingsAbout-ViewOpenJobs',
            REPORT_A_BUG: 'SettingsAbout-ReportABug',
        },
        SETTINGS_TROUBLESHOOT: {
            CLEAR_CACHE: 'SettingsTroubleshoot-ClearCache',
            EXPORT_ONYX: 'SettingsTroubleshoot-ExportOnyx',
            GO_TO_CLASSIC: 'SettingsTroubleshoot-GoToExpensifyClassic',
        },
        SETTINGS_EXIT_SURVEY: {
            GO_TO_CLASSIC: 'SettingsExitSurvey-GoToExpensifyClassic',
        },
        MESSAGES_ROW: {
            DISMISS: 'MessagesRow-Dismiss',
        },
        PROFILE_PAGE: {
            AVATAR: 'ProfilePage-Avatar',
        },
        BASE_AUTO_COMPLETE_SUGGESTIONS: {
            MENU_ITEM: 'BaseAutoCompleteSuggestions-MenuItem',
        },
        SAFE_AREA: {
            DISMISS_KEYBOARD_LANDSCAPE_MODE: 'SafeArea-DismissKeyboardLandscapeMode',
        },
        MFA_OVERLAY: {
            BACKDROP: 'MfaOverlay-Backdrop',
        },
        AGENTS: {
            TABLE_ROW: 'Agents-TableRow',
            CHAT: 'Agents-Chat',
            COPILOT: 'Agents-Copilot',
            EDIT: 'Agents-Edit',
        },
        DOMAIN: {
            ADMINS: {
                ROW: 'DomainAdmins-Row',
            },
            GROUPS: {
                CREATE_GROUP_BUTTON: 'DomainGroups-CreateGroupButton',
                ROW: 'DomainGroups-Row',
            },
            MEMBERS: {
                ROW: 'DomainMembers-Row',
            },
        },
        FEATURE_TRAINING: {
            CLOSE_BUTTON: 'FeatureTraining-CloseButton',
            BACK_BUTTON: 'FeatureTraining-BackButton',
        },
        AI_FEATURES_PROMO_MODAL: {
            CONFIRM_BUTTON: 'AIFeaturesPromoModal-ConfirmButton',
            HELP_BUTTON: 'AIFeaturesPromoModal-HelpButton',
        },
    },

    DOMAIN: {
        /** Onyx prefix for domain admin account IDs */
        EXPENSIFY_ADMIN_ACCESS_PREFIX: 'expensify_adminPermissions_',
        /** Onyx prefix for domain security groups */
        DOMAIN_SECURITY_GROUP_PREFIX: 'domain_securityGroup_',
        /** Onyx prefix for vacation delegate */
        PRIVATE_VACATION_DELEGATE_PREFIX: 'private_vacationDelegate_',
        /** Onyx prefix for lock account IDs */
        PRIVATE_LOCKED_ACCOUNT_PREFIX: 'private_lockAccountDetails_',

        MEMBERS: {
            SECONDARY_ACTIONS: {
                SETTINGS: 'settings',
                SAVE_TO_CSV: 'saveToCSV',
            },
            BULK_ACTION_TYPES: {
                CLOSE_ACCOUNT: 'closeAccount',
                MOVE_TO_GROUP: 'moveToGroup',
            },
        },
    },

    AUTO_COMPLETE_VARIANTS: {
        SMS_OTP: 'sms-otp',
        ONE_TIME_CODE: 'one-time-code',
        OFF: 'off',
    },

    HOME: {
        // Maximum number of items in TimeSensitiveSection and YourSpendSection. Any extra items are revealed via the expand toggle button.
        SECTION_VISIBLE_LIMIT: 5,

        // Cutoff for the "For You" new-vs-old segment: users whose free trial started on/after this date have the empty section hidden.
        FOR_YOU_NEW_USER_CUTOFF_DATE: '2026-06-26',
        ANNOUNCEMENTS: [
            {
                title: 'More Concierge AI upgrades, plus agent beta',
                subtitle: 'Press release',
                url: 'https://www.businesswire.com/news/home/20260701645763/en/Expensifys-AI-Expands-to-Expense-Automation-Spend-Insights-and-Agents',
                publishedDate: '2026-07-01',
            },
            {
                title: 'Ask Concierge AI: charts, insights & more',
                subtitle: 'Newsletter',
                url: 'https://use.expensify.com/blog/ask-expensify-ai-anything',
                publishedDate: '2026-06-30',
            },
            {
                title: 'AI agents, Concierge upgrades, and smarter card controls',
                subtitle: 'Product update',
                url: 'https://use.expensify.com/blog/expensify-june-2026-product-update',
                publishedDate: '2026-06-24',
            },
        ],
    },

    SECTION_LIST_ITEM_TYPE: {
        HEADER: 'header',
        ROW: 'row',
    },

    CACHE_NAME: {
        AUTH_IMAGES: 'auth-images',
    },

    MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO: 0.9,
    MODAL_MAX_HEIGHT_TO_WINDOW_HEIGHT_RATIO_LANDSCAPE_MODE: 0.75,

    MAP_VIEW_LAYERS: {
        USER_LOCATION: 'user-location',
        ROUTE_SOURCE: 'route-source',
        ROUTE_FILL: 'route-fill',
        ROUTE_BORDER: 'route-border',
        WAYPOINTS_SOURCE: 'waypoints-source',
        WAYPOINTS: 'waypoints',
    },

    MAP_CURRENT_LOCATION_FILL_COLOR: '#0185FF',

    PARTNER_ID: {
        EXPENSIFY: 1,
        IPHONE: 14,
        ANDROID: 16,
        NEWDOT: 83,
        OAUTH: 86,
    },
} as const;

/** Upgrade intro feature ids from UPGRADE_FEATURE_INTRO_MAPPING for Submit workspace */
const SUBMIT_FEATURE_IDS: ReadonlySet<string> = new Set([
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.companyCardSubmit.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.travelSubmit.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmit.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.approvalSubmitReport.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.roles.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.payments.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.accounting.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.expensifyCard.id,
    CONST.UPGRADE_FEATURE_INTRO_MAPPING.invoicing.id,
]);

const CONTINUATION_DETECTION_SEARCH_FILTER_KEYS = [
    CONST.SEARCH.SYNTAX_FILTER_KEYS.TO,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ASSIGNEE,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.PAYER,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.EXPORTER,
    CONST.SEARCH.SYNTAX_FILTER_KEYS.ATTENDEE,
] as SearchFilterKey[];

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
type OdometerImageType = ValueOf<typeof CONST.IOU.ODOMETER_IMAGE_TYPE>;
type FeedbackSurveyOptionID = ValueOf<Pick<ValueOf<typeof CONST.FEEDBACK_SURVEY_OPTIONS>, 'ID'>>;
type IOUActionParams = ValueOf<typeof CONST.IOU.ACTION_PARAMS>;

type SubscriptionType = ValueOf<typeof CONST.SUBSCRIPTION.TYPE>;
type CancellationType = ValueOf<typeof CONST.CANCELLATION_TYPE>;

/** Valid `page` values for the Enable Payments flow */
type EnablePaymentsPageType = ValueOf<typeof CONST.ENABLE_PAYMENTS.PAGE_NAMES>;

/** Valid `subPage` values for the Enable Payments flow */
type EnablePaymentsSubPageType =
    | ValueOf<typeof CONST.ENABLE_PAYMENTS.ADD_BANK_ACCOUNT_STEP.SUB_PAGE_NAMES>
    | ValueOf<typeof CONST.ENABLE_PAYMENTS.PERSONAL_INFO_STEP.SUB_PAGE_NAMES>
    | ValueOf<typeof CONST.ENABLE_PAYMENTS.FEES_AND_TERMS_STEP.SUB_PAGE_NAMES>;

export type {
    Country,
    IOUAction,
    IOUType,
    IOURequestType,
    OdometerImageType,
    SubscriptionType,
    FeedbackSurveyOptionID,
    CancellationType,
    OnboardingInvite,
    OnboardingAccounting,
    IOUActionParams,
    EnablePaymentsPageType,
    EnablePaymentsSubPageType,
};

export {CONTINUATION_DETECTION_SEARCH_FILTER_KEYS, FRAUD_PROTECTION_EVENT, COUNTRIES_US_BANK_FLOW, SUBMIT_FEATURE_IDS};

export default CONST;
