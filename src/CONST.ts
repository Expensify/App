/* eslint-disable @typescript-eslint/naming-convention */
import dateAdd from 'date-fns/add';
import dateSubtract from 'date-fns/sub';
import Config from 'react-native-config';
import * as KeyCommand from 'react-native-key-command';
import type {ValueOf} from 'type-fest';
import type {Video} from './libs/actions/Report';
import BankAccount from './libs/models/BankAccount';
import * as Url from './libs/Url';
import SCREENS from './SCREENS';
import type PlaidBankAccount from './types/onyx/PlaidBankAccount';
import type {Unit} from './types/onyx/Policy';

type RateAndUnit = {
    unit: Unit;
    rate: number;
    currency: string;
};
type CurrencyDefaultMileageRate = Record<string, RateAndUnit>;

// Creating a default array and object this way because objects ({}) and arrays ([]) are not stable types.
// Freezing the array ensures that it cannot be unintentionally modified.
const EMPTY_ARRAY = Object.freeze([]);
const EMPTY_OBJECT = Object.freeze({});

const CLOUDFRONT_DOMAIN = 'cloudfront.net';
const CLOUDFRONT_URL = `https://d2k5nsl2zxldvw.${CLOUDFRONT_DOMAIN}`;
const ACTIVE_EXPENSIFY_URL = Url.addTrailingForwardSlash(Config?.NEW_EXPENSIFY_URL ?? 'https://new.expensify.com');
const USE_EXPENSIFY_URL = 'https://use.expensify.com';
const PLATFORM_OS_MACOS = 'Mac OS';
const PLATFORM_IOS = 'iOS';
const ANDROID_PACKAGE_NAME = 'com.expensify.chat';
const CURRENT_YEAR = new Date().getFullYear();
const PULL_REQUEST_NUMBER = Config?.PULL_REQUEST_NUMBER ?? '';
const MAX_DATE = dateAdd(new Date(), {years: 1});
const MIN_DATE = dateSubtract(new Date(), {years: 20});
const EXPENSIFY_POLICY_DOMAIN = 'expensify-policy';
const EXPENSIFY_POLICY_DOMAIN_EXTENSION = '.exfy';

const keyModifierControl = KeyCommand?.constants?.keyModifierControl ?? 'keyModifierControl';
const keyModifierCommand = KeyCommand?.constants?.keyModifierCommand ?? 'keyModifierCommand';
const keyModifierShiftControl = KeyCommand?.constants?.keyModifierShiftControl ?? 'keyModifierShiftControl';
const keyModifierShiftCommand = KeyCommand?.constants?.keyModifierShiftCommand ?? 'keyModifierShiftCommand';
const keyInputEscape = KeyCommand?.constants?.keyInputEscape ?? 'keyInputEscape';
const keyInputEnter = KeyCommand?.constants?.keyInputEnter ?? 'keyInputEnter';
const keyInputUpArrow = KeyCommand?.constants?.keyInputUpArrow ?? 'keyInputUpArrow';
const keyInputDownArrow = KeyCommand?.constants?.keyInputDownArrow ?? 'keyInputDownArrow';
const keyInputLeftArrow = KeyCommand?.constants?.keyInputLeftArrow ?? 'keyInputLeftArrow';
const keyInputRightArrow = KeyCommand?.constants?.keyInputRightArrow ?? 'keyInputRightArrow';

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

// Explicit type annotation is required
const cardActiveStates: number[] = [2, 3, 4, 7];

const selectableOnboardingChoices = {
    PERSONAL_SPEND: 'newDotPersonalSpend',
    MANAGE_TEAM: 'newDotManageTeam',
    EMPLOYER: 'newDotEmployer',
    CHAT_SPLIT: 'newDotSplitChat',
    LOOKING_AROUND: 'newDotLookingAround',
} as const;

const backendOnboardingChoices = {
    SUBMIT: 'newDotSubmit',
} as const;

const onboardingChoices = {
    ...selectableOnboardingChoices,
    ...backendOnboardingChoices,
} as const;

const onboardingEmployerOrSubmitMessage: OnboardingMessageType = {
    message: 'Getting paid back is as easy as sending a message. Let’s go over the basics.',
    video: {
        url: `${CLOUDFRONT_URL}/videos/guided-setup-get-paid-back-v2.mp4`,
        thumbnailUrl: `${CLOUDFRONT_URL}/images/guided-setup-get-paid-back.jpg`,
        duration: 55,
        width: 1280,
        height: 960,
    },
    tasks: [
        {
            type: 'submitExpense',
            autoCompleted: false,
            title: 'Submit an expense',
            description:
                '*Submit an expense* by entering an amount or scanning a receipt.\n' +
                '\n' +
                'Here’s how to submit an expense:\n' +
                '\n' +
                '1. Click the green *+* button.\n' +
                '2. Choose *Submit expense*.\n' +
                '3. Enter an amount or scan a receipt.\n' +
                '4. Add your reimburser to the request.\n' +
                '\n' +
                'Then, send your request and wait for that sweet “Cha-ching!” when it’s complete.',
        },
        {
            type: 'addBankAccount',
            autoCompleted: false,
            title: 'Add personal bank account',
            description:
                'You’ll need to add your personal bank account to get paid back. Don’t worry, it’s easy!\n' +
                '\n' +
                'Here’s how to set up your bank account:\n' +
                '\n' +
                '1. Click your profile picture.\n' +
                '2. Click *Wallet* > *Bank accounts* > *+ Add bank account*.\n' +
                '3. Connect your bank account.\n' +
                '\n' +
                'Once that’s done, you can request money from anyone and get paid back right into your personal bank account.',
        },
    ],
};

type OnboardingPurposeType = ValueOf<typeof onboardingChoices>;

const onboardingInviteTypes = {
    IOU: 'iou',
    INVOICE: 'invoice',
    CHAT: 'chat',
} as const;

type OnboardingInviteType = ValueOf<typeof onboardingInviteTypes>;

type OnboardingTaskType = {
    type: string;
    autoCompleted: boolean;
    title: string;
    description: string | ((params: Partial<{adminsRoomLink: string; workspaceCategoriesLink: string; workspaceMoreFeaturesLink: string; workspaceMembersLink: string}>) => string);
};

type OnboardingMessageType = {
    message: string;
    video?: Video;
    tasks: OnboardingTaskType[];
    type?: string;
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
    DISABLED_MAX_EXPENSE_VALUE: 10000000000,
    POLICY_BILLABLE_MODES: {
        BILLABLE: 'billable',
        NON_BILLABLE: 'nonBillable',
    },

    // Note: Group and Self-DM excluded as these are not tied to a Workspace
    WORKSPACE_ROOM_TYPES: [chatTypes.POLICY_ADMINS, chatTypes.POLICY_ANNOUNCE, chatTypes.DOMAIN_ALL, chatTypes.POLICY_ROOM, chatTypes.POLICY_EXPENSE_CHAT],
    ANDROID_PACKAGE_NAME,
    WORKSPACE_ENABLE_FEATURE_REDIRECT_DELAY: 100,
    ANIMATED_HIGHLIGHT_ENTRY_DELAY: 50,
    ANIMATED_HIGHLIGHT_ENTRY_DURATION: 300,
    ANIMATED_HIGHLIGHT_START_DELAY: 10,
    ANIMATED_HIGHLIGHT_START_DURATION: 300,
    ANIMATED_HIGHLIGHT_END_DELAY: 800,
    ANIMATED_HIGHLIGHT_END_DURATION: 2000,
    ANIMATED_TRANSITION: 300,
    ANIMATED_TRANSITION_FROM_VALUE: 100,
    ANIMATION_IN_TIMING: 100,
    ANIMATION_DIRECTION: {
        IN: 'in',
        OUT: 'out',
    },
    // Multiplier for gyroscope animation in order to make it a bit more subtle
    ANIMATION_GYROSCOPE_VALUE: 0.4,
    ANIMATION_PAID_DURATION: 200,
    ANIMATION_PAID_CHECKMARK_DELAY: 300,
    ANIMATION_PAID_BUTTON_HIDE_DELAY: 1000,
    BACKGROUND_IMAGE_TRANSITION_DURATION: 1000,
    SCREEN_TRANSITION_END_TIMEOUT: 1000,
    ARROW_HIDE_DELAY: 3000,
    MAX_IMAGE_CANVAS_AREA: 16777216,

    API_ATTACHMENT_VALIDATIONS: {
        // 24 megabytes in bytes, this is limit set on servers, do not update without wider internal discussion
        MAX_SIZE: 25165824,

        // An arbitrary size, but the same minimum as in the PHP layer
        MIN_SIZE: 240,

        // Allowed extensions for receipts
        ALLOWED_RECEIPT_EXTENSIONS: ['jpg', 'jpeg', 'gif', 'png', 'pdf', 'htm', 'html', 'text', 'rtf', 'doc', 'tif', 'tiff', 'msword', 'zip', 'xml', 'message'],
    },

    // Allowed extensions for spreadsheets import
    ALLOWED_SPREADSHEET_EXTENSIONS: ['xls', 'xlsx', 'csv', 'txt'],

    // This is limit set on servers, do not update without wider internal discussion
    API_TRANSACTION_CATEGORY_MAX_LENGTH: 255,

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
        MAX_LENGTH: 50,
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

    REPORT_DESCRIPTION: {
        MAX_LENGTH: 1000,
    },

    PULL_REQUEST_NUMBER,

    // Regex to get link in href prop inside of <a/> component
    REGEX_LINK_IN_ANCHOR: /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi,

    MERCHANT_NAME_MAX_LENGTH: 255,

    MASKED_PAN_PREFIX: 'XXXXXXXXXXXX',

    REQUEST_PREVIEW: {
        MAX_LENGTH: 83,
    },

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

    DESKTOP_SHORTCUT_ACCELERATOR: {
        PASTE_AND_MATCH_STYLE: 'Option+Shift+CmdOrCtrl+V',
        PASTE_AS_PLAIN_TEXT: 'CmdOrCtrl+Shift+V',
    },

    // This is used to enable a rotation/transform style to any component.
    DIRECTION: {
        LEFT: 'left',
        RIGHT: 'right',
    },

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
    APP_DOWNLOAD_LINKS: {
        ANDROID: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
        IOS: 'https://apps.apple.com/us/app/expensify-cash/id1530278510',
        DESKTOP: `${ACTIVE_EXPENSIFY_URL}NewExpensify.dmg`,
        OLD_DOT_ANDROID: 'https://play.google.com/store/apps/details?id=org.me.mobiexpensifyg&hl=en_US&pli=1',
        OLD_DOT_IOS: 'https://apps.apple.com/us/app/expensify-expense-tracker/id471713959',
    },
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
    },
    SMS: {
        DOMAIN: '@expensify.sms',
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
            BANK_ACCOUNT: 'BankAccountStep',
            REQUESTOR: 'RequestorStep',
            COMPANY: 'CompanyStep',
            BENEFICIAL_OWNERS: 'BeneficialOwnersStep',
            ACH_CONTRACT: 'ACHContractStep',
            VALIDATION: 'ValidationStep',
            ENABLE: 'EnableStep',
        },
        STEP_NAMES: ['1', '2', '3', '4', '5'],
        STEPS_HEADER_HEIGHT: 40,
        SUBSTEP: {
            MANUAL: 'manual',
            PLAID: 'plaid',
        },
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
        DEFAULT_ROOMS: 'defaultRooms',
        DUPE_DETECTION: 'dupeDetection',
        P2P_DISTANCE_REQUESTS: 'p2pDistanceRequests',
        SPOTNANA_TRAVEL: 'spotnanaTravel',
        REPORT_FIELDS_FEATURE: 'reportFieldsFeature',
        WORKSPACE_FEEDS: 'workspaceFeeds',
        COMPANY_CARD_FEEDS: 'companyCardFeeds',
        NETSUITE_USA_TAX: 'netsuiteUsaTax',
        NEW_DOT_COPILOT: 'newDotCopilot',
        WORKSPACE_RULES: 'workspaceRules',
        COMBINED_TRACK_SUBMIT: 'combinedTrackSubmit',
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
        DESKTOP: 'desktop',
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
    },
    KEYBOARD_SHORTCUTS: {
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
    get DIRECT_REIMBURSEMENT_CURRENCIES() {
        return [this.CURRENCY.USD, this.CURRENCY.AUD, this.CURRENCY.CAD, this.CURRENCY.GBP, this.CURRENCY.EUR];
    },
    EXAMPLE_PHONE_NUMBER: '+15005550006',
    CONCIERGE_CHAT_NAME: 'Concierge',
    CLOUDFRONT_URL,
    EMPTY_ARRAY,
    EMPTY_OBJECT,
    USE_EXPENSIFY_URL,
    GOOGLE_MEET_URL_ANDROID: 'https://meet.google.com',
    GOOGLE_DOC_IMAGE_LINK_MATCH: 'googleusercontent.com',
    IMAGE_BASE64_MATCH: 'base64',
    DEEPLINK_BASE_URL: 'new-expensify://',
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    CLOUDFRONT_DOMAIN_REGEX: /^https:\/\/\w+\.cloudfront\.net/i,
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    CONCIERGE_ICON_URL_2021: `${CLOUDFRONT_URL}/images/icons/concierge_2021.png`,
    CONCIERGE_ICON_URL: `${CLOUDFRONT_URL}/images/icons/concierge_2022.png`,
    UPWORK_URL: 'https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22',
    DEEP_DIVE_EXPENSIFY_CARD: 'https://community.expensify.com/discussion/4848/deep-dive-expensify-card-and-quickbooks-online-auto-reconciliation-how-it-works',
    DEEP_DIVE_ERECEIPTS: 'https://community.expensify.com/discussion/5542/deep-dive-what-are-ereceipts/',
    GITHUB_URL: 'https://github.com/Expensify/App',
    TERMS_URL: `${USE_EXPENSIFY_URL}/terms`,
    PRIVACY_URL: `${USE_EXPENSIFY_URL}/privacy`,
    LICENSES_URL: `${USE_EXPENSIFY_URL}/licenses`,
    ACH_TERMS_URL: `${USE_EXPENSIFY_URL}/achterms`,
    WALLET_AGREEMENT_URL: `${USE_EXPENSIFY_URL}/walletagreement`,
    BANCORP_WALLET_AGREEMENT_URL: `${USE_EXPENSIFY_URL}/bancorp-bank-wallet-terms-of-service`,
    HELP_LINK_URL: `${USE_EXPENSIFY_URL}/usa-patriot-act`,
    ELECTRONIC_DISCLOSURES_URL: `${USE_EXPENSIFY_URL}/esignagreement`,
    GITHUB_RELEASE_URL: 'https://api.github.com/repos/expensify/app/releases/latest',
    ADD_SECONDARY_LOGIN_URL: encodeURI('settings?param={"section":"account","openModal":"secondaryLogin"}'),
    MANAGE_CARDS_URL: 'domain_companycards',
    FEES_URL: `${USE_EXPENSIFY_URL}/fees`,
    SAVE_WITH_EXPENSIFY_URL: `${USE_EXPENSIFY_URL}/savings-calculator`,
    CFPB_PREPAID_URL: 'https://cfpb.gov/prepaid',
    STAGING_NEW_EXPENSIFY_URL: 'https://staging.new.expensify.com',
    NEWHELP_URL: 'https://help.expensify.com',
    INTERNAL_DEV_EXPENSIFY_URL: 'https://www.expensify.com.dev',
    STAGING_EXPENSIFY_URL: 'https://staging.expensify.com',
    EXPENSIFY_URL: 'https://www.expensify.com',
    BANK_ACCOUNT_PERSONAL_DOCUMENTATION_INFO_URL:
        'https://community.expensify.com/discussion/6983/faq-why-do-i-need-to-provide-personal-documentation-when-setting-up-updating-my-bank-account',
    PERSONAL_DATA_PROTECTION_INFO_URL: 'https://community.expensify.com/discussion/5677/deep-dive-security-how-expensify-protects-your-information',
    ONFIDO_FACIAL_SCAN_POLICY_URL: 'https://onfido.com/facial-scan-policy-and-release/',
    ONFIDO_PRIVACY_POLICY_URL: 'https://onfido.com/privacy/',
    ONFIDO_TERMS_OF_SERVICE_URL: 'https://onfido.com/terms-of-service/',
    LIST_OF_RESTRICTED_BUSINESSES: 'https://community.expensify.com/discussion/6191/list-of-restricted-businesses',
    TRAVEL_TERMS_URL: `${USE_EXPENSIFY_URL}/travelterms`,
    EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT: 'https://www.expensify.com/tools/integrations/downloadPackage',
    EXPENSIFY_PACKAGE_FOR_SAGE_INTACCT_FILE_NAME: 'ExpensifyPackageForSageIntacct',
    SAGE_INTACCT_INSTRUCTIONS: 'https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/Sage-Intacct',
    HOW_TO_CONNECT_TO_SAGE_INTACCT: 'https://help.expensify.com/articles/expensify-classic/integrations/accounting-integrations/Sage-Intacct#how-to-connect-to-sage-intacct',
    PRICING: `https://www.expensify.com/pricing`,
    COMPANY_CARDS_HELP: 'https://help.expensify.com/articles/expensify-classic/connect-credit-cards/company-cards/Commercial-Card-Feeds',
    CUSTOM_REPORT_NAME_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/spending-insights/Custom-Templates',
    COPILOT_HELP_URL: 'https://help.expensify.com/articles/expensify-classic/copilots-and-delegates/Assign-or-remove-a-Copilot',
    // Use Environment.getEnvironmentURL to get the complete URL with port number
    DEV_NEW_EXPENSIFY_URL: 'https://dev.new.expensify.com:',
    OLDDOT_URLS: {
        ADMIN_POLICIES_URL: 'admin_policies',
        ADMIN_DOMAINS_URL: 'admin_domains',
        INBOX: 'inbox',
        POLICY_CONNECTIONS_URL: (policyID: string) => `policy?param={"policyID":"${policyID}"}#connections`,
    },

    EXPENSIFY_POLICY_DOMAIN,
    EXPENSIFY_POLICY_DOMAIN_EXTENSION,

    SIGN_IN_FORM_WIDTH: 300,

    REQUEST_CODE_DELAY: 30,

    DEEPLINK_PROMPT_DENYLIST: [SCREENS.HOME, SCREENS.SIGN_IN_WITH_APPLE_DESKTOP, SCREENS.SIGN_IN_WITH_GOOGLE_DESKTOP],

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
    REPORT: {
        ROLE: {
            ADMIN: 'admin',
            MEMBER: 'member',
        },
        MAX_COUNT_BEFORE_FOCUS_UPDATE: 30,
        MIN_INITIAL_REPORT_ACTION_COUNT: 15,
        UNREPORTED_REPORTID: '0',
        SPLIT_REPORTID: '-2',
        ACTIONS: {
            LIMIT: 50,
            // OldDot Actions render getMessage from Web-Expensify/lib/Report/Action PHP files via getMessageOfOldDotReportAction in ReportActionsUtils.ts
            TYPE: {
                ACTIONABLE_ADD_PAYMENT_CARD: 'ACTIONABLEADDPAYMENTCARD',
                ACTIONABLE_JOIN_REQUEST: 'ACTIONABLEJOINREQUEST',
                ACTIONABLE_MENTION_WHISPER: 'ACTIONABLEMENTIONWHISPER',
                ACTIONABLE_REPORT_MENTION_WHISPER: 'ACTIONABLEREPORTMENTIONWHISPER',
                ACTIONABLE_TRACK_EXPENSE_WHISPER: 'ACTIONABLETRACKEXPENSEWHISPER',
                ADD_COMMENT: 'ADDCOMMENT',
                APPROVED: 'APPROVED',
                CARD_MISSING_ADDRESS: 'CARDMISSINGADDRESS',
                CARD_ISSUED: 'CARDISSUED',
                CARD_ISSUED_VIRTUAL: 'CARDISSUEDVIRTUAL',
                CHANGE_FIELD: 'CHANGEFIELD', // OldDot Action
                CHANGE_POLICY: 'CHANGEPOLICY', // OldDot Action
                CHANGE_TYPE: 'CHANGETYPE', // OldDot Action
                CHRONOS_OOO_LIST: 'CHRONOSOOOLIST',
                CLOSED: 'CLOSED',
                CREATED: 'CREATED',
                DELEGATE_SUBMIT: 'DELEGATESUBMIT', // OldDot Action
                DELETED_ACCOUNT: 'DELETEDACCOUNT', // Deprecated OldDot Action
                DISMISSED_VIOLATION: 'DISMISSEDVIOLATION',
                DONATION: 'DONATION', // Deprecated OldDot Action
                EXPORTED_TO_CSV: 'EXPORTCSV', // OldDot Action
                EXPORTED_TO_INTEGRATION: 'EXPORTINTEGRATION', // OldDot Action
                EXPORTED_TO_QUICK_BOOKS: 'EXPORTED', // Deprecated OldDot Action
                FORWARDED: 'FORWARDED', // OldDot Action
                HOLD: 'HOLD',
                HOLD_COMMENT: 'HOLDCOMMENT',
                INTEGRATION_SYNC_FAILED: 'INTEGRATIONSYNCFAILED',
                IOU: 'IOU',
                INTEGRATIONS_MESSAGE: 'INTEGRATIONSMESSAGE', // OldDot Action
                MANAGER_ATTACH_RECEIPT: 'MANAGERATTACHRECEIPT', // OldDot Action
                MANAGER_DETACH_RECEIPT: 'MANAGERDETACHRECEIPT', // OldDot Action
                MARKED_REIMBURSED: 'MARKEDREIMBURSED', // OldDot Action
                MARK_REIMBURSED_FROM_INTEGRATION: 'MARKREIMBURSEDFROMINTEGRATION', // OldDot Action
                MERGED_WITH_CASH_TRANSACTION: 'MERGEDWITHCASHTRANSACTION',
                MODIFIED_EXPENSE: 'MODIFIEDEXPENSE',
                MOVED: 'MOVED',
                OUTDATED_BANK_ACCOUNT: 'OUTDATEDBANKACCOUNT', // OldDot Action
                REIMBURSEMENT_ACH_BOUNCE: 'REIMBURSEMENTACHBOUNCE', // OldDot Action
                REIMBURSEMENT_ACH_CANCELLED: 'REIMBURSEMENTACHCANCELLED', // OldDot Action
                REIMBURSEMENT_ACCOUNT_CHANGED: 'REIMBURSEMENTACCOUNTCHANGED', // OldDot Action
                REIMBURSEMENT_DELAYED: 'REIMBURSEMENTDELAYED', // OldDot Action
                REIMBURSEMENT_QUEUED: 'REIMBURSEMENTQUEUED',
                REIMBURSEMENT_DEQUEUED: 'REIMBURSEMENTDEQUEUED',
                REIMBURSEMENT_REQUESTED: 'REIMBURSEMENTREQUESTED', // Deprecated OldDot Action
                REIMBURSEMENT_SETUP: 'REIMBURSEMENTSETUP', // Deprecated OldDot Action
                REIMBURSEMENT_SETUP_REQUESTED: 'REIMBURSEMENTSETUPREQUESTED', // Deprecated OldDot Action
                REJECTED: 'REJECTED',
                REMOVED_FROM_APPROVAL_CHAIN: 'REMOVEDFROMAPPROVALCHAIN',
                RENAMED: 'RENAMED',
                REPORT_PREVIEW: 'REPORTPREVIEW',
                SELECTED_FOR_RANDOM_AUDIT: 'SELECTEDFORRANDOMAUDIT', // OldDot Action
                SHARE: 'SHARE', // OldDot Action
                STRIPE_PAID: 'STRIPEPAID', // OldDot Action
                SUBMITTED: 'SUBMITTED',
                TAKE_CONTROL: 'TAKECONTROL', // OldDot Action
                TASK_CANCELLED: 'TASKCANCELLED',
                TASK_COMPLETED: 'TASKCOMPLETED',
                TASK_EDITED: 'TASKEDITED',
                TASK_REOPENED: 'TASKREOPENED',
                TRIPPREVIEW: 'TRIPPREVIEW',
                UNAPPROVED: 'UNAPPROVED',
                UNHOLD: 'UNHOLD',
                UNSHARE: 'UNSHARE', // OldDot Action
                UPDATE_GROUP_CHAT_MEMBER_ROLE: 'UPDATEGROUPCHATMEMBERROLE',
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
                    DELETE_ALL_TAGS: 'POLICYCHANGELOG_DELETE_ALL_TAGS',
                    DELETE_APPROVER_RULE: 'POLICYCHANGELOG_DELETE_APPROVER_RULE',
                    DELETE_BUDGET: 'POLICYCHANGELOG_DELETE_BUDGET',
                    DELETE_CATEGORY: 'POLICYCHANGELOG_DELETE_CATEGORY',
                    DELETE_CUSTOM_UNIT: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT',
                    DELETE_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT_RATE',
                    DELETE_CUSTOM_UNIT_SUB_RATE: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT_SUB_RATE',
                    DELETE_EMPLOYEE: 'POLICYCHANGELOG_DELETE_EMPLOYEE',
                    DELETE_INTEGRATION: 'POLICYCHANGELOG_DELETE_INTEGRATION',
                    DELETE_REPORT_FIELD: 'POLICYCHANGELOG_DELETE_REPORT_FIELD',
                    DELETE_TAG: 'POLICYCHANGELOG_DELETE_TAG',
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
                    UPDATE_MANUAL_APPROVAL_THRESHOLD: 'POLICYCHANGELOG_UPDATE_MANUAL_APPROVAL_THRESHOLD',
                    UPDATE_MAX_EXPENSE_AMOUNT: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AMOUNT',
                    UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT: 'POLICYCHANGELOG_UPDATE_MAX_EXPENSE_AMOUNT_NO_RECEIPT',
                    UPDATE_NAME: 'POLICYCHANGELOG_UPDATE_NAME',
                    UPDATE_DESCRIPTION: 'POLICYCHANGELOG_UPDATE_DESCRIPTION',
                    UPDATE_OWNERSHIP: 'POLICYCHANGELOG_UPDATE_OWNERSHIP',
                    UPDATE_REIMBURSEMENT_CHOICE: 'POLICYCHANGELOG_UPDATE_REIMBURSEMENT_CHOICE',
                    UPDATE_REPORT_FIELD: 'POLICYCHANGELOG_UPDATE_REPORT_FIELD',
                    UPDATE_TAG: 'POLICYCHANGELOG_UPDATE_TAG',
                    UPDATE_TAG_ENABLED: 'POLICYCHANGELOG_UPDATE_TAG_ENABLED',
                    UPDATE_TAG_LIST: 'POLICYCHANGELOG_UPDATE_TAG_LIST',
                    UPDATE_TAG_LIST_NAME: 'POLICYCHANGELOG_UPDATE_TAG_LIST_NAME',
                    UPDATE_TAG_NAME: 'POLICYCHANGELOG_UPDATE_TAG_NAME',
                    UPDATE_TIME_ENABLED: 'POLICYCHANGELOG_UPDATE_TIME_ENABLED',
                    UPDATE_TIME_RATE: 'POLICYCHANGELOG_UPDATE_TIME_RATE',
                    LEAVE_POLICY: 'POLICYCHANGELOG_LEAVE_POLICY',
                    CORPORATE_UPGRADE: 'POLICYCHANGELOG_CORPORATE_UPGRADE',
                },
                ROOM_CHANGE_LOG: {
                    INVITE_TO_ROOM: 'INVITETOROOM',
                    REMOVE_FROM_ROOM: 'REMOVEFROMROOM',
                    LEAVE_ROOM: 'LEAVEROOM',
                    UPDATE_ROOM_DESCRIPTION: 'UPDATEROOMDESCRIPTION',
                },
            },
            THREAD_DISABLED: ['CREATED'],
        },
        CANCEL_PAYMENT_REASONS: {
            ADMIN: 'CANCEL_REASON_ADMIN',
        },
        ACTIONABLE_MENTION_WHISPER_RESOLUTION: {
            INVITE: 'invited',
            NOTHING: 'nothing',
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
        MAX_ROOM_NAME_LENGTH: 99,
        LAST_MESSAGE_TEXT_MAX_LENGTH: 200,
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
        },
        ROOM_MEMBERS_BULK_ACTION_TYPES: {
            REMOVE: 'remove',
        },
    },
    NEXT_STEP: {
        ICONS: {
            HOURGLASS: 'hourglass',
            CHECKMARK: 'checkmark',
            STOPWATCH: 'stopwatch',
        },
    },
    COMPOSER: {
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
            CENTERED_UNSWIPEABLE: 'centered_unswipeable',
            CENTERED_SMALL: 'centered_small',
            BOTTOM_DOCKED: 'bottom_docked',
            POPOVER: 'popover',
            RIGHT_DOCKED: 'right_docked',
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
    },
    TIMING: {
        CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION: 'calc_most_recent_last_modified_action',
        CHAT_FINDER_RENDER: 'search_render',
        CHAT_RENDER: 'chat_render',
        OPEN_REPORT: 'open_report',
        HOMEPAGE_INITIAL_RENDER: 'homepage_initial_render',
        REPORT_INITIAL_RENDER: 'report_initial_render',
        SWITCH_REPORT: 'switch_report',
        OPEN_REPORT_FROM_PREVIEW: 'open_report_from_preview',
        OPEN_REPORT_THREAD: 'open_report_thread',
        SIDEBAR_LOADED: 'sidebar_loaded',
        LOAD_SEARCH_OPTIONS: 'load_search_options',
        MESSAGE_SENT: 'message_sent',
        COLD: 'cold',
        WARM: 'warm',
        REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME: 1500,
        SHOW_LOADING_SPINNER_DEBOUNCE_TIME: 250,
        TEST_TOOLS_MODAL_THROTTLE_TIME: 800,
        TOOLTIP_SENSE: 1000,
        TRIE_INITIALIZATION: 'trie_initialization',
        COMMENT_LENGTH_DEBOUNCE_TIME: 500,
        SEARCH_OPTION_LIST_DEBOUNCE_TIME: 300,
        RESIZE_DEBOUNCE_TIME: 100,
        UNREAD_UPDATE_DEBOUNCE_TIME: 300,
        SEARCH_FILTER_OPTIONS: 'search_filter_options',
        USE_DEBOUNCED_STATE_DELAY: 300,
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
    TRANSACTION: {
        DEFAULT_MERCHANT: 'Expense',
        UNKNOWN_MERCHANT: 'Unknown Merchant',
        PARTIAL_TRANSACTION_MERCHANT: '(none)',
        TYPE: {
            CUSTOM_UNIT: 'customUnit',
        },
        STATUS: {
            PENDING: 'Pending',
            POSTED: 'Posted',
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
        NOT_AUTHENTICATED: 407,
        EXP_ERROR: 666,
        UNABLE_TO_RETRY: 'unableToRetry',
        UPDATE_REQUIRED: 426,
        INCORRECT_MAGIC_CODE: 451,
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
        ENSURE_BUGBOT: 'ENSURE_BUGBOT',
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
        NETWORK_STATUS: {
            ONLINE: 'online',
            OFFLINE: 'offline',
            UNKNOWN: 'unknown',
        },
    },
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

    // 6 numeric digits
    VALIDATE_CODE_REGEX_STRING: /^\d{6}$/,

    // 8 alphanumeric characters
    RECOVERY_CODE_REGEX_STRING: /^[a-zA-Z0-9]{8}$/,

    // The server has a WAF (Web Application Firewall) which will strip out HTML/XML tags using this regex pattern.
    // It's copied here so that the same regex pattern can be used in form validations to be consistent with the server.
    VALIDATE_FOR_HTML_TAG_REGEX: /<([^>\s]+)(?:[^>]*?)>/g,

    // The regex below is used to remove dots only from the local part of the user email (local-part@domain)
    // so when we are using search, we can match emails that have dots without explicitly writing the dots (e.g: fistlast@domain will match first.last@domain)
    // More info https://github.com/Expensify/App/issues/8007
    EMAIL_SEARCH_REGEX: /\.(?=[^\s@]*@)/g,

    VALIDATE_FOR_LEADINGSPACES_HTML_TAG_REGEX: /<([\s]+.+[\s]*)>/g,

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
        PRESENCE_ACTIVE_GUIDES: 'presence-activeGuides',
    },

    EMOJI_SPACER: 'SPACER',

    // This is the number of columns in each row of the picker.
    // Because of how flatList implements these rows, each row is an index rather than each element
    // For this reason to make headers work, we need to have the header be the only rendered element in its row
    // If this number is changed, emojis.js will need to be updated to have the proper number of spacer elements
    // around each header.
    EMOJI_NUM_PER_ROW: 8,

    EMOJI_DEFAULT_SKIN_TONE: -1,

    // Amount of emojis to render ahead at the end of the update cycle
    EMOJI_DRAW_AMOUNT: 250,

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
    ATTACHMENT_SOURCE_ATTRIBUTE: 'data-expensify-source',
    ATTACHMENT_OPTIMISTIC_SOURCE_ATTRIBUTE: 'data-optimistic-src',
    ATTACHMENT_PREVIEW_ATTRIBUTE: 'src',
    ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE: 'data-name',
    ATTACHMENT_LOCAL_URL_PREFIX: ['blob:', 'file:'],
    ATTACHMENT_THUMBNAIL_URL_ATTRIBUTE: 'data-expensify-thumbnail-url',
    ATTACHMENT_THUMBNAIL_WIDTH_ATTRIBUTE: 'data-expensify-width',
    ATTACHMENT_THUMBNAIL_HEIGHT_ATTRIBUTE: 'data-expensify-height',
    ATTACHMENT_DURATION_ATTRIBUTE: 'data-expensify-duration',

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
    },
    ATTACHMENT_TYPE: {
        REPORT: 'r',
        NOTE: 'n',
        SEARCH: 's',
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
    IOS_CAMERAROLL_ACCESS_ERROR: 'Access to photo library was denied',
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
    DESKTOP_HEADER_PADDING: 12,
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
    SEARCH_SKELETON_VIEW_ITEM_HEIGHT: 108,
    EXPENSIFY_PARTNER_NAME: 'expensify.com',
    EXPENSIFY_MERCHANT: 'Expensify, Inc.',
    EMAIL: {
        ACCOUNTING: 'accounting@expensify.com',
        ADMIN: 'admin@expensify.com',
        BILLS: 'bills@expensify.com',
        CHRONOS: 'chronos@expensify.com',
        CONCIERGE: 'concierge@expensify.com',
        CONTRIBUTORS: 'contributors@expensify.com',
        FIRST_RESPONDER: 'firstresponders@expensify.com',
        GUIDES_DOMAIN: 'team.expensify.com',
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
        },
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
        REIMBURSEMENT_ACCOUNT_ID: 'reimbursementAccountID',
        COLLECTION_ACCOUNT: 'collectionAccount',
        AUTO_CREATE_ENTITIES: 'autoCreateEntities',
        APPROVAL_ACCOUNT: 'approvalAccount',
        CUSTOM_FORM_ID_OPTIONS: 'customFormIDOptions',
        TOKEN_INPUT_STEP_NAMES: ['1', '2,', '3', '4', '5'],
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
        NETSUITE_CUSTOM_LIST_LIMIT: 8,
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

    /**
     * Countries where tax setting is permitted (Strings are in the format of Netsuite's Country type/enum)
     *
     * Should mirror the list on the OldDot.
     */
    NETSUITE_TAX_COUNTRIES: [
        '_canada',
        '_unitedKingdomGB',
        '_unitedKingdom',
        '_australia',
        '_southAfrica',
        '_india',
        '_france',
        '_netherlands',
        '_germany',
        '_singapore',
        '_spain',
        '_ireland',
        '_denmark',
        '_brazil',
        '_japan',
        '_philippines',
        '_china',
        '_argentina',
        '_newZealand',
        '_switzerland',
        '_sweden',
        '_portugal',
        '_mexico',
        '_israel',
        '_thailand',
        '_czechRepublic',
        '_egypt',
        '_ghana',
        '_indonesia',
        '_iranIslamicRepublicOf',
        '_jordan',
        '_kenya',
        '_kuwait',
        '_lebanon',
        '_malaysia',
        '_morocco',
        '_myanmar',
        '_nigeria',
        '_pakistan',
        '_saudiArabia',
        '_sriLanka',
        '_unitedArabEmirates',
        '_vietnam',
        '_austria',
        '_bulgaria',
        '_greece',
        '_cyprus',
        '_norway',
        '_romania',
        '_poland',
        '_hongKong',
        '_luxembourg',
        '_lithuania',
        '_malta',
        '_finland',
        '_koreaRepublicOf',
        '_italy',
        '_georgia',
        '_hungary',
        '_latvia',
        '_estonia',
        '_slovenia',
        '_serbia',
        '_croatiaHrvatska',
        '_belgium',
        '_turkey',
        '_taiwan',
        '_azerbaijan',
        '_slovakRepublic',
        '_costaRica',
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

    MISSING_PERSONAL_DETAILS_INDEXES: {
        MAPPING: {
            LEGAL_NAME: 0,
            DATE_OF_BIRTH: 1,
            ADDRESS: 2,
            PHONE_NUMBER: 3,
        },
        INDEX_LIST: ['1', '2', '3', '4'],
    },

    ACCOUNT_ID: {
        ACCOUNTING: Number(Config?.EXPENSIFY_ACCOUNT_ID_ACCOUNTING ?? 9645353),
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
            NOT_OWNER_OF_BANK_ACCOUNT: '401 Wallet owner does not own linked bank account',
            INVALID_BANK_ACCOUNT: '405 Attempting to link an invalid bank account to a wallet',
            NOT_OWNER_OF_FUND: '401 Wallet owner does not own linked fund',
            INVALID_FUND: '405 Attempting to link an invalid fund to a wallet',
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
            BANCORP_BANK: 'The Bancorp Bank',
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
        // This is the transactionID used when going through the create expense flow so that it mimics a real transaction (like the edit flow)
        OPTIMISTIC_TRANSACTION_ID: '1',
        // Note: These payment types are used when building IOU reportAction message values in the server and should
        // not be changed.
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
            REQUEST: 'request',
            INVOICE: 'invoice',
            SUBMIT: 'submit',
            TRACK: 'track',
        },
        REQUEST_TYPE: {
            DISTANCE: 'distance',
            MANUAL: 'manual',
            SCAN: 'scan',
        },
        REPORT_ACTION_TYPE: {
            PAY: 'pay',
            CREATE: 'create',
            SPLIT: 'split',
            DECLINE: 'decline',
            CANCEL: 'cancel',
            DELETE: 'delete',
            APPROVE: 'approve',
            TRACK: 'track',
        },
        AMOUNT_MAX_LENGTH: 8,
        RECEIPT_STATE: {
            SCANREADY: 'SCANREADY',
            OPEN: 'OPEN',
            SCANNING: 'SCANNING',
            SCANCOMPLETE: 'SCANCOMPLETE',
            SCANFAILED: 'SCANFAILED',
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
    },

    GROWL: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        DURATION: 2000,
        DURATION_LONG: 3500,
    },

    LOCALES: {
        EN: 'en',
        ES: 'es',
        ES_ES: 'es-ES',
        ES_ES_ONFIDO: 'es_ES',

        DEFAULT: 'en',
    },

    LANGUAGES: ['en', 'es'],

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

    // Map updated pronouns key to deprecated pronouns
    DEPRECATED_PRONOUNS_LIST: {
        heHimHis: 'He/him',
        sheHerHers: 'She/her',
        theyThemTheirs: 'They/them',
        zeHirHirs: 'Ze/hir',
        callMeByMyName: 'Call me by my name',
    },

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
        ROLE: {
            ADMIN: 'admin',
            AUDITOR: 'auditor',
            USER: 'user',
        },
        AUTO_REIMBURSEMENT_MAX_LIMIT_CENTS: 2000000,
        AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS: 10000,
        AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS: 10000,
        RANDOM_AUDIT_DEFAULT_PERCENTAGE: 5,

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
        ROOM_PREFIX: '#',
        CUSTOM_UNIT_RATE_BASE_OFFSET: 100,
        OWNER_EMAIL_FAKE: '_FAKE_',
        OWNER_ACCOUNT_ID_FAKE: 0,
        REIMBURSEMENT_CHOICES: {
            REIMBURSEMENT_YES: 'reimburseYes', // Direct
            REIMBURSEMENT_NO: 'reimburseNo', // None
            REIMBURSEMENT_MANUAL: 'reimburseManual', // Indirect
        },
        ID_FAKE: '_FAKE_',
        EMPTY: 'EMPTY',
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
        },
        MORE_FEATURES: {
            ARE_CATEGORIES_ENABLED: 'areCategoriesEnabled',
            ARE_TAGS_ENABLED: 'areTagsEnabled',
            ARE_DISTANCE_RATES_ENABLED: 'areDistanceRatesEnabled',
            ARE_WORKFLOWS_ENABLED: 'areWorkflowsEnabled',
            ARE_REPORT_FIELDS_ENABLED: 'areReportFieldsEnabled',
            ARE_CONNECTIONS_ENABLED: 'areConnectionsEnabled',
            ARE_COMPANY_CARDS_ENABLED: 'areCompanyCardsEnabled',
            ARE_EXPENSIFY_CARDS_ENABLED: 'areExpensifyCardsEnabled',
            ARE_INVOICES_ENABLED: 'areInvoicesEnabled',
            ARE_TAXES_ENABLED: 'tax',
            ARE_RULES_ENABLED: 'areRulesEnabled',
        },
        DEFAULT_CATEGORIES: [
            'Advertising',
            'Benefits',
            'Car',
            'Equipment',
            'Fees',
            'Home Office',
            'Insurance',
            'Interest',
            'Labor',
            'Maintenance',
            'Materials',
            'Meals and Entertainment',
            'Office Supplies',
            'Other',
            'Professional Services',
            'Rent',
            'Taxes',
            'Travel',
            'Utilities',
        ],
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
        CONNECTIONS: {
            NAME: {
                // Here we will add other connections names when we add support for them
                QBO: 'quickbooksOnline',
                XERO: 'xero',
                NETSUITE: 'netsuite',
                SAGE_INTACCT: 'intacct',
            },
            ROUTE: {
                QBO: 'quickbooks-online',
                XERO: 'xero',
                NETSUITE: 'netsuite',
                SAGE_INTACCT: 'sage-intacct',
            },
            NAME_USER_FRIENDLY: {
                netsuite: 'NetSuite',
                quickbooksOnline: 'Quickbooks Online',
                quickbooksDesktop: 'Quickbooks Desktop',
                xero: 'Xero',
                intacct: 'Sage Intacct',
                financialForce: 'FinancialForce',
                billCom: 'Bill.com',
                zenefits: 'Zenefits',
            },
            AUTH_HELP_LINKS: {
                intacct:
                    "https://help.expensify.com/articles/expensify-classic/connections/sage-intacct/Sage-Intacct-Troubleshooting#:~:text=First%20make%20sure%20that%20you,your%20company's%20Web%20Services%20authorizations.",
                netsuite:
                    'https://help.expensify.com/articles/expensify-classic/connections/netsuite/Netsuite-Troubleshooting#expensierror-ns0109-failed-to-login-to-netsuite-please-verify-your-credentials',
            },
            SYNC_STAGE_NAME: {
                STARTING_IMPORT_QBO: 'startingImportQBO',
                STARTING_IMPORT_XERO: 'startingImportXero',
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
        DEFAULT_MAX_EXPENSE_AMOUNT: 200000,
        DEFAULT_MAX_AMOUNT_NO_RECEIPT: 2500,
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

    CUSTOM_UNITS: {
        NAME_DISTANCE: 'Distance',
        DISTANCE_UNIT_MILES: 'mi',
        DISTANCE_UNIT_KILOMETERS: 'km',
        MILEAGE_IRS_RATE: 0.67,
        DEFAULT_RATE: 'Default Rate',
        RATE_DECIMALS: 3,
        FAKE_P2P_ID: '_FAKE_P2P_ID_',
    },

    TERMS: {
        CFPB_PREPAID: 'cfpb.gov/prepaid',
        CFPB_COMPLAINT: 'cfpb.gov/complaint',
        FDIC_PREPAID: 'fdic.gov/deposit/deposits/prepaid.html',
        USE_EXPENSIFY_FEES: 'use.expensify.com/fees',
    },

    LAYOUT_WIDTH: {
        WIDE: 'wide',
        NARROW: 'narrow',
        NONE: 'none',
    },

    ICON_TYPE_ICON: 'icon',
    ICON_TYPE_AVATAR: 'avatar',
    ICON_TYPE_WORKSPACE: 'workspace',

    ACTIVITY_INDICATOR_SIZE: {
        LARGE: 'large',
    },

    AVATAR_SIZE: {
        XLARGE: 'xlarge',
        LARGE: 'large',
        MEDIUM: 'medium',
        DEFAULT: 'default',
        SMALL: 'small',
        SMALLER: 'smaller',
        SUBSCRIPT: 'subscript',
        SMALL_SUBSCRIPT: 'small-subscript',
        MID_SUBSCRIPT: 'mid-subscript',
        LARGE_BORDERED: 'large-bordered',
        HEADER: 'header',
        MENTION_ICON: 'mention-icon',
        SMALL_NORMAL: 'small-normal',
    },
    COMPANY_CARD: {
        FEED_BANK_NAME: {
            MASTER_CARD: 'cdf',
            VISA: 'vcf',
            AMEX: 'gl1025',
        },
        STEP_NAMES: ['1', '2', '3', '4'],
        STEP: {
            ASSIGNEE: 'Assignee',
            CARD: 'Card',
            TRANSACTION_START_DATE: 'TransactionStartDate',
            CONFIRMATION: 'Confirmation',
        },
        TRANSACTION_START_DATE_OPTIONS: {
            FROM_BEGINNING: 'fromBeginning',
            CUSTOM: 'custom',
        },
    },
    EXPENSIFY_CARD: {
        NAME: 'expensifyCard',
        BANK: 'Expensify Card',
        FRAUD_TYPES: {
            DOMAIN: 'domain',
            INDIVIDUAL: 'individual',
            NONE: 'none',
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
        LIMIT_TYPES: {
            SMART: 'smart',
            MONTHLY: 'monthly',
            FIXED: 'fixed',
        },
        STEP_NAMES: ['1', '2', '3', '4', '5', '6'],
        STEP: {
            ASSIGNEE: 'Assignee',
            CARD_TYPE: 'CardType',
            LIMIT_TYPE: 'LimitType',
            LIMIT: 'Limit',
            CARD_NAME: 'CardName',
            CONFIRMATION: 'Confirmation',
        },
        CARD_TYPE: {
            PHYSICAL: 'physical',
            VIRTUAL: 'virtual',
        },
        FREQUENCY_SETTING: {
            DAILY: 'daily',
            MONTHLY: 'monthly',
        },
        CARD_TITLE_INPUT_LIMIT: 255,
    },
    COMPANY_CARDS: {
        STEP: {
            CARD_TYPE: 'CardType',
            CARD_INSTRUCTIONS: 'CardInstructions',
            CARD_NAME: 'CardName',
            CARD_DETAILS: 'CardDetails',
        },
        CARD_TYPE: {
            AMEX: 'amex',
            VISA: 'visa',
            MASTERCARD: 'mastercard',
        },
        DELETE_TRANSACTIONS: {
            RESTRICT: 'corporate',
            ALLOW: 'personal',
        },
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
        TYPE: {
            ANNUAL: 'yearly2018',
            PAYPERUSE: 'monthly2018',
        },
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
        CARD_NUMBER: /^[0-9]{15,16}$/,
        CARD_SECURITY_CODE: /^[0-9]{3,4}$/,
        CARD_EXPIRATION_DATE: /^(0[1-9]|1[0-2])([^0-9])?([0-9]{4}|([0-9]{2}))$/,
        ROOM_NAME: /^#[\p{Ll}0-9-]{1,100}$/u,
        DOMAIN_BASE: '^(?:https?:\\/\\/)?(?:www\\.)?([^\\/]+)',

        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJI: /[\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3/gu,
        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJIS: /[\p{Extended_Pictographic}](\u200D[\p{Extended_Pictographic}]|[\u{1F3FB}-\u{1F3FF}]|[\u{E0020}-\u{E007F}]|\uFE0F|\u20E3)*|[\u{1F1E6}-\u{1F1FF}]{2}|[#*0-9]\uFE0F?\u20E3/gu,
        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJI_SKIN_TONES: /[\u{1f3fb}-\u{1f3ff}]/gu,

        TAX_ID: /^\d{9}$/,
        NON_NUMERIC: /\D/g,
        ANY_SPACE: /\s/g,

        // Extract attachment's source from the data's html string
        ATTACHMENT_DATA: /(data-expensify-source|data-name)="([^"]+)"/g,

        EMOJI_NAME: /:[\p{L}0-9_+-]+:/gu,
        EMOJI_SUGGESTIONS: /:[\p{L}0-9_+-]{1,40}$/u,
        AFTER_FIRST_LINE_BREAK: /\n.*/g,
        LINE_BREAK: /\r\n|\r|\n/g,
        CODE_2FA: /^\d{6}$/,
        ATTACHMENT_ID: /chat-attachments\/(\d+)/,
        HAS_COLON_ONLY_AT_THE_BEGINNING: /^:[^:]+$/,
        HAS_AT_MOST_TWO_AT_SIGNS: /^@[^@]*@?[^@]*$/,
        EMPTY_COMMENT: /^(\s)*$/,
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
            return new RegExp(`[\\n\\s]|${this.SPECIAL_CHAR.source}|${this.EMOJI.source}`, 'gu');
        },

        MERGED_ACCOUNT_PREFIX: /^(MERGED_\d+@)/,
        ROUTES: {
            VALIDATE_LOGIN: /\/v($|(\/\/*))/,
            UNLINK_LOGIN: /\/u($|(\/\/*))/,
            REDUNDANT_SLASHES: /(\/{2,})|(\/$)/g,
        },
        TIME_STARTS_01: /^01:\d{2} [AP]M$/,
        TIME_FORMAT: /^\d{2}:\d{2} [AP]M$/,
        DATE_TIME_FORMAT: /^\d{2}-\d{2} \d{2}:\d{2} [AP]M$/,
        ILLEGAL_FILENAME_CHARACTERS: /\/|<|>|\*|"|:|\?|\\|\|/g,
        ENCODE_PERCENT_CHARACTER: /%(25)+/g,
        INVISIBLE_CHARACTERS_GROUPS: /[\p{C}\p{Z}]/gu,
        OTHER_INVISIBLE_CHARACTERS: /[\u3164]/g,
        REPORT_FIELD_TITLE: /{report:([a-zA-Z]+)}/g,
        PATH_WITHOUT_POLICY_ID: /\/w\/[a-zA-Z0-9]+(\/|$)/,
        POLICY_ID_FROM_PATH: /\/w\/([a-zA-Z0-9]+)(\/|$)/,
        SHORT_MENTION: new RegExp(`@[\\w\\-\\+\\'#@]+(?:\\.[\\w\\-\\'\\+]+)*(?![^\`]*\`)`, 'gim'),
        REPORT_ID_FROM_PATH: /\/r\/(\d+)/,
        DISTANCE_MERCHANT: /^[0-9.]+ \w+ @ (-|-\()?[^0-9.\s]{1,3} ?[0-9.]+\)? \/ \w+$/,

        get EXPENSIFY_POLICY_DOMAIN_NAME() {
            return new RegExp(`${EXPENSIFY_POLICY_DOMAIN}([a-zA-Z0-9]+)\\${EXPENSIFY_POLICY_DOMAIN_EXTENSION}`);
        },
    },

    PRONOUNS: {
        PREFIX: '__predefined_',
        SELF_SELECT: '__predefined_selfSelect',
    },
    GUIDES_CALL_TASK_IDS: {
        CONCIERGE_DM: 'NewExpensifyConciergeDM',
        WORKSPACE_INITIAL: 'WorkspaceHome',
        WORKSPACE_PROFILE: 'WorkspaceProfile',
        WORKSPACE_INVOICES: 'WorkspaceSendInvoices',
        WORKSPACE_MEMBERS: 'WorkspaceManageMembers',
        WORKSPACE_EXPENSIFY_CARD: 'WorkspaceExpensifyCard',
        WORKSPACE_WORKFLOWS: 'WorkspaceWorkflows',
        WORKSPACE_COMPANY_CARDS: 'WorkspaceCompanyCards',
        WORKSPACE_BANK_ACCOUNT: 'WorkspaceBankAccount',
        WORKSPACE_SETTINGS: 'WorkspaceSettings',
        WORKSPACE_FEATURES: 'WorkspaceFeatures',
        WORKSPACE_RULES: 'WorkspaceRules',
    },
    get EXPENSIFY_EMAILS() {
        return [
            this.EMAIL.ACCOUNTING,
            this.EMAIL.ADMIN,
            this.EMAIL.BILLS,
            this.EMAIL.CHRONOS,
            this.EMAIL.CONCIERGE,
            this.EMAIL.CONTRIBUTORS,
            this.EMAIL.FIRST_RESPONDER,
            this.EMAIL.HELP,
            this.EMAIL.INTEGRATION_TESTING_CREDS,
            this.EMAIL.NOTIFICATIONS,
            this.EMAIL.PAYROLL,
            this.EMAIL.QA,
            this.EMAIL.QA_TRAVIS,
            this.EMAIL.RECEIPTS,
            this.EMAIL.STUDENT_AMBASSADOR,
            this.EMAIL.SVFG,
        ];
    },
    get EXPENSIFY_ACCOUNT_IDS() {
        return [
            this.ACCOUNT_ID.ACCOUNTING,
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
    // Account IDs that can't be added as a group member
    get NON_ADDABLE_ACCOUNT_IDS() {
        return [this.ACCOUNT_ID.NOTIFICATIONS, this.ACCOUNT_ID.CHRONOS];
    },

    // Auth limit is 60k for the column but we store edits and other metadata along the html so let's use a lower limit to accommodate for it.
    MAX_COMMENT_LENGTH: 10000,

    // Use the same value as MAX_COMMENT_LENGTH to ensure the entire comment is parsed. Note that applying markup is very resource-consuming.
    MAX_MARKUP_LENGTH: 10000,

    MAX_THREAD_REPLIES_PREVIEW: 99,

    // Character Limits
    FORM_CHARACTER_LIMIT: 50,
    LEGAL_NAMES_CHARACTER_LIMIT: 150,
    LOGIN_CHARACTER_LIMIT: 254,
    CATEGORY_NAME_LIMIT: 256,
    TAG_NAME_LIMIT: 256,
    WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH: 256,
    REPORT_NAME_LIMIT: 100,
    TITLE_CHARACTER_LIMIT: 100,
    DESCRIPTION_LIMIT: 1000,
    WORKSPACE_NAME_CHARACTER_LIMIT: 80,
    STATE_CHARACTER_LIMIT: 32,

    AVATAR_CROP_MODAL: {
        // The next two constants control what is min and max value of the image crop scale.
        // Values define in how many times the image can be bigger than its container.
        // Notice: that values less than 1 mean that the image won't cover the container fully.
        MAX_SCALE: 3, // 3x scale is used commonly in different apps.
        MIN_SCALE: 1, // 1x min scale means that the image covers the container completely

        // This const defines the initial container size, before layout measurement.
        // Since size cant be null, we have to define some initial value.
        INITIAL_SIZE: 1, // 1 was chosen because there is a very low probability that initialized component will have such size.
    },
    MICROSECONDS_PER_MS: 1000,
    RED_BRICK_ROAD_PENDING_ACTION: {
        ADD: 'add',
        DELETE: 'delete',
        UPDATE: 'update',
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
        EXPORT: 'export',
        DELETE: 'delete',
        MARK_AS_INCOMPLETE: 'markAsIncomplete',
        CANCEL_PAYMENT: 'cancelPayment',
        UNAPPROVE: 'unapprove',
        DEBUG: 'debug',
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
    },
    FOOTER: {
        EXPENSE_MANAGEMENT_URL: `${USE_EXPENSIFY_URL}/expense-management`,
        SPEND_MANAGEMENT_URL: `${USE_EXPENSIFY_URL}/spend-management`,
        EXPENSE_REPORTS_URL: `${USE_EXPENSIFY_URL}/expense-reports`,
        COMPANY_CARD_URL: `${USE_EXPENSIFY_URL}/company-credit-card`,
        RECIEPT_SCANNING_URL: `${USE_EXPENSIFY_URL}/receipt-scanning-app`,
        BILL_PAY_URL: `${USE_EXPENSIFY_URL}/bills`,
        INVOICES_URL: `${USE_EXPENSIFY_URL}/invoices`,
        PAYROLL_URL: `${USE_EXPENSIFY_URL}/payroll`,
        TRAVEL_URL: `${USE_EXPENSIFY_URL}/travel`,
        EXPENSIFY_APPROVED_URL: `${USE_EXPENSIFY_URL}/accountants`,
        PRESS_KIT_URL: 'https://we.are.expensify.com/press-kit',
        SUPPORT_URL: `${USE_EXPENSIFY_URL}/support`,
        COMMUNITY_URL: 'https://community.expensify.com/',
        PRIVACY_URL: `${USE_EXPENSIFY_URL}/privacy`,
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
            regex: /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z-CIKMOV]{2}$/,
            samples: 'LA102UX, BL2F8FX, BD1S9LU, WR4G 6LH',
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
    TRIP_ID_PATH: (tripID: string) => `trips/${tripID}`,
    SPOTNANA_TMC_ID: '8e8e7258-1cf3-48c0-9cd1-fe78a6e31eed',
    STAGING_SPOTNANA_TMC_ID: '7a290c6e-5328-4107-aff6-e48765845b81',
    SCREEN_READER_STATES: {
        ALL: 'all',
        ACTIVE: 'active',
        DISABLED: 'disabled',
    },
    SPACE_CHARACTER_WIDTH: 4,

    // The attribute used in the SelectionScraper.js helper to query all the DOM elements
    // that should be removed from the copied contents in the getHTMLOfSelection() method
    SELECTION_SCRAPER_HIDDEN_ELEMENT: 'selection-scrapper-hidden-element',
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
    QR: {
        DEFAULT_LOGO_SIZE_RATIO: 0.25,
        DEFAULT_LOGO_MARGIN_RATIO: 0.02,
        EXPENSIFY_LOGO_SIZE_RATIO: 0.22,
        EXPENSIFY_LOGO_MARGIN_RATIO: 0.03,
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
        CODES: 'CODES',
        VERIFY: 'VERIFY',
        SUCCESS: 'SUCCESS',
        ENABLED: 'ENABLED',
        DISABLED: 'DISABLED',
        GETCODE: 'GETCODE',
    },
    DELEGATE_ROLE: {
        ALL: 'all',
        SUBMITTER: 'submitter',
    },
    DELEGATE_ROLE_HELPDOT_ARTICLE_LINK: 'https://help.expensify.com/expensify-classic/hubs/copilots-and-delegates/',
    STRIPE_GBP_AUTH_STATUSES: {
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
    },
    TAB_REQUEST: {
        MANUAL: 'manual',
        SCAN: 'scan',
        DISTANCE: 'distance',
    },

    STATUS_TEXT_MAX_LENGTH: 100,

    DROPDOWN_BUTTON_SIZE: {
        LARGE: 'large',
        MEDIUM: 'medium',
        SMALL: 'small',
    },

    SF_COORDINATES: [-122.4194, 37.7749],

    NAVIGATION: {
        TYPE: {
            UP: 'UP',
        },
        ACTION_TYPE: {
            REPLACE: 'REPLACE',
            PUSH: 'PUSH',
            NAVIGATE: 'NAVIGATE',
        },
    },
    TIME_PERIOD: {
        AM: 'AM',
        PM: 'PM',
    },
    INDENTS: '    ',
    PARENT_CHILD_SEPARATOR: ': ',
    CATEGORY_LIST_THRESHOLD: 8,
    TAG_LIST_THRESHOLD: 8,
    TAX_RATES_LIST_THRESHOLD: 8,
    COLON: ':',
    MAPBOX: {
        PADDING: 32,
        DEFAULT_ZOOM: 15,
        SINGLE_MARKER_ZOOM: 15,
        DEFAULT_COORDINATE: [-122.4021, 37.7911],
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
        ON_RETURN_TO_OLD_DOT: 'onReturnToOldDot',
    },

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
            PAY_SOMEONE: 'paySomeone',
            REFER_FRIEND: 'referralFriend',
            SHARE_CODE: 'shareCode',
        },
        REVENUE: 250,
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

    /**
     * The maximum count of items per page for SelectionList.
     * When paginate, it multiplies by page number.
     */
    MAX_SELECTION_LIST_PAGE_LENGTH: 500,

    /**
     *  We only include the members search bar when we have 8 or more members
     */
    SHOULD_SHOW_MEMBERS_SEARCH_INPUT_BREAKPOINT: 8,

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
     * Constants for maxToRenderPerBatch parameter that is used for FlatList or SectionList. This controls the amount of items rendered per batch, which is the next chunk of items
     * rendered on every scroll.
     */
    MAX_TO_RENDER_PER_BATCH: {
        DEFAULT: 5,
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
        NON_EXPENSIWORKS_EXPENSE: 'nonExpensiworksExpense',
        OVER_AUTO_APPROVAL_LIMIT: 'overAutoApprovalLimit',
        OVER_CATEGORY_LIMIT: 'overCategoryLimit',
        OVER_LIMIT: 'overLimit',
        OVER_LIMIT_ATTENDEE: 'overLimitAttendee',
        PER_DAY_LIMIT: 'perDayLimit',
        RECEIPT_NOT_SMART_SCANNED: 'receiptNotSmartScanned',
        RECEIPT_REQUIRED: 'receiptRequired',
        RTER: 'rter',
        SMARTSCAN_FAILED: 'smartscanFailed',
        SOME_TAG_LEVELS_REQUIRED: 'someTagLevelsRequired',
        TAG_OUT_OF_POLICY: 'tagOutOfPolicy',
        TAX_AMOUNT_CHANGED: 'taxAmountChanged',
        TAX_OUT_OF_POLICY: 'taxOutOfPolicy',
        TAX_RATE_CHANGED: 'taxRateChanged',
        TAX_REQUIRED: 'taxRequired',
        HOLD: 'hold',
    },
    REVIEW_DUPLICATES_ORDER: ['merchant', 'category', 'tag', 'description', 'taxCode', 'billable', 'reimbursable'],

    REPORT_VIOLATIONS: {
        FIELD_REQUIRED: 'fieldRequired',
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

    WORKSPACE_SWITCHER: {
        NAME: 'Expensify',
        SUBSCRIPT_ICON_SIZE: 8,
        MINIMUM_WORKSPACES_TO_SHOW_SEARCH: 8,
    },

    WELCOME_VIDEO_URL: `${CLOUDFRONT_URL}/videos/intro-1280.mp4`,

    ONBOARDING_INTRODUCTION: 'Let’s get you set up 🔧',
    ONBOARDING_CHOICES: {...onboardingChoices},
    SELECTABLE_ONBOARDING_CHOICES: {...selectableOnboardingChoices},
    ONBOARDING_INVITE_TYPES: {...onboardingInviteTypes},
    ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE: 'What would you like to do with this expense?',
    ONBOARDING_CONCIERGE: {
        [onboardingChoices.EMPLOYER]:
            '# Expensify is the fastest way to get paid back!\n' +
            '\n' +
            'To submit expenses for reimbursement:\n' +
            '1. From the home screen, click the green + button > *Request money*.\n' +
            "2. Enter an amount or scan a receipt, then input your boss's email.\n" +
            '\n' +
            "That'll send a request to get you paid back. Let me know if you have any questions!",
        [onboardingChoices.MANAGE_TEAM]:
            "# Let's start managing your team's expenses!\n" +
            '\n' +
            "To manage your team's expenses, create a workspace to keep everything in one place. Here's how:\n" +
            '1. From the home screen, click the green + button > *New Workspace*\n' +
            '2. Give your workspace a name (e.g. "Sales team expenses").\n' +
            '\n' +
            'Then, invite your team to your workspace via the Members pane and [connect a business bank account](https://help.expensify.com/articles/new-expensify/bank-accounts/Connect-a-Bank-Account) to reimburse them. Let me know if you have any questions!',
        [onboardingChoices.PERSONAL_SPEND]:
            "# Let's start tracking your expenses! \n" +
            '\n' +
            "To track your expenses, create a workspace to keep everything in one place. Here's how:\n" +
            '1. From the home screen, click the green + button > *New Workspace*\n' +
            '2. Give your workspace a name (e.g. "My expenses").\n' +
            '\n' +
            'Then, add expenses to your workspace:\n' +
            '1. Find your workspace using the search field.\n' +
            '2. Click the gray + button next to the message field.\n' +
            '3. Click Request money, then add your expense type.\n' +
            '\n' +
            "We'll store all expenses in your new workspace for easy access. Let me know if you have any questions!",
        [onboardingChoices.CHAT_SPLIT]:
            '# Splitting the bill is as easy as a conversation!\n' +
            '\n' +
            'To split an expense:\n' +
            '1. From the home screen, click the green + button > *Request money*.\n' +
            '2. Enter an amount or scan a receipt, then choose who you want to split it with.\n' +
            '\n' +
            "We'll send a request to each person so they can pay you back. Let me know if you have any questions!",
    },

    ONBOARDING_MESSAGES: {
        [onboardingChoices.EMPLOYER]: onboardingEmployerOrSubmitMessage,
        [onboardingChoices.SUBMIT]: onboardingEmployerOrSubmitMessage,
        [onboardingChoices.MANAGE_TEAM]: {
            message: 'Here are some important tasks to help get your team’s expenses under control.',
            video: {
                url: `${CLOUDFRONT_URL}/videos/guided-setup-manage-team-v2.mp4`,
                thumbnailUrl: `${CLOUDFRONT_URL}/images/guided-setup-manage-team.jpg`,
                duration: 55,
                width: 1280,
                height: 960,
            },
            tasks: [
                {
                    type: 'createWorkspace',
                    autoCompleted: true,
                    title: 'Create a workspace',
                    description:
                        '*Create a workspace* to track expenses, scan receipts, chat, and more.\n' +
                        '\n' +
                        'Here’s how to create a workspace:\n' +
                        '\n' +
                        '1. Click your profile picture.\n' +
                        '2. Click *Workspaces* > *New workspace*.\n' +
                        '\n' +
                        '*Your new workspace is ready! It’ll keep all of your spend (and chats) in one place.*',
                },
                {
                    type: 'meetGuide',
                    autoCompleted: false,
                    title: 'Meet your setup specialist',
                    description: ({adminsRoomLink}) =>
                        `Meet your setup specialist, who can answer any questions as you get started with Expensify. Yes, a real human!\n` +
                        '\n' +
                        `Chat with the specialist in your [#admins room](${adminsRoomLink}).`,
                },
                {
                    type: 'setupCategories',
                    autoCompleted: false,
                    title: 'Set up categories',
                    description: ({workspaceCategoriesLink}) =>
                        '*Set up categories* so your team can code expenses for easy reporting.\n' +
                        '\n' +
                        'Here’s how to set up categories:\n' +
                        '\n' +
                        '1. Click your profile picture.\n' +
                        '2. Go to Workspaces.\n' +
                        '3. Select your workspace.\n' +
                        '4. Click *Categories*.\n' +
                        '5. Enable and disable default categories.\n' +
                        '6. Click *Add categories* to make your own.\n' +
                        '7. For more controls like requiring a category for every expense, click *Settings*.\n' +
                        '\n' +
                        `[Take me to workspace category settings](${workspaceCategoriesLink}).`,
                },
                {
                    type: 'setupTags',
                    autoCompleted: false,
                    title: 'Set up tags',
                    description: ({workspaceMoreFeaturesLink}) =>
                        'Tags can be used if you want more details with every expense. Use tags for projects, clients, locations, departments, and more. If you need multiple levels of tags you can upgrade to a control plan.\n' +
                        '\n' +
                        '*Here’s how to set up tags:*\n' +
                        '\n' +
                        '1. Click your profile picture.\n' +
                        '2. Go to Workspaces.\n' +
                        '3. Select your workspace.\n' +
                        '4. Click More features.\n' +
                        '5. Enable tags.\n' +
                        '6. Navigate to Tags in the workspace editor.\n' +
                        '7. In Tags, click + Add tag to make your own.\n' +
                        '\n' +
                        `*[Take me to more features](${workspaceMoreFeaturesLink})*`,
                },
                {
                    type: 'addExpenseApprovals',
                    autoCompleted: false,
                    title: 'Add expense approvals',
                    description: ({workspaceMoreFeaturesLink}) =>
                        '*Add expense approvals* to review your team’s spend and keep it under control.\n' +
                        '\n' +
                        'Here’s how to add expense approvals:\n' +
                        '\n' +
                        '1. Click your profile picture.\n' +
                        '2. Go to Workspaces.\n' +
                        '3. Select your workspace.\n' +
                        '4. Click *More features*.\n' +
                        '5. Enable *Workflows*.\n' +
                        '6. In *Workflows*, enable *Add approvals*.\n' +
                        '7. You’ll be set as the expense approver. You can change this to any admin once you invite your team.\n' +
                        '\n' +
                        `[Take me to enable more features](${workspaceMoreFeaturesLink}).`,
                },
                {
                    type: 'inviteTeam',
                    autoCompleted: false,
                    title: 'Invite your team',
                    description: ({workspaceMembersLink}) =>
                        '*Invite your team* to Expensify so they can start tracking expenses today.\n' +
                        '\n' +
                        'Here’s how to invite your team:\n' +
                        '\n' +
                        '1. Click your profile picture.\n' +
                        '2. Go to Workspaces.\n' +
                        '3. Select your workspace.\n' +
                        '4. Click *Members* > *Invite member*.\n' +
                        '5. Enter emails or phone numbers. \n' +
                        '6. Add an invite message if you want.\n' +
                        '\n' +
                        `[Take me to workspace members](${workspaceMembersLink}). That’s it, happy expensing! :)`,
                },
            ],
        },
        [onboardingChoices.PERSONAL_SPEND]: {
            message: 'Here’s how to track your spend in a few clicks.',
            video: {
                url: `${CLOUDFRONT_URL}/videos/guided-setup-track-personal-v2.mp4`,
                thumbnailUrl: `${CLOUDFRONT_URL}/images/guided-setup-track-personal.jpg`,
                duration: 55,
                width: 1280,
                height: 960,
            },
            tasks: [
                {
                    type: 'trackExpense',
                    autoCompleted: false,
                    title: 'Track an expense',
                    description:
                        '*Track an expense* in any currency, whether you have a receipt or not.\n' +
                        '\n' +
                        'Here’s how to track an expense:\n' +
                        '\n' +
                        '1. Click the green *+* button.\n' +
                        '2. Choose *Track expense*.\n' +
                        '3. Enter an amount or scan a receipt.\n' +
                        '4. Click *Track*.\n' +
                        '\n' +
                        'And you’re done! Yep, it’s that easy.',
                },
            ],
        },
        [onboardingChoices.CHAT_SPLIT]: {
            message: 'Splitting bills with friends is as easy as sending a message. Here’s how.',
            video: {
                url: `${CLOUDFRONT_URL}/videos/guided-setup-chat-split-bills-v2.mp4`,
                thumbnailUrl: `${CLOUDFRONT_URL}/images/guided-setup-chat-split-bills.jpg`,
                duration: 55,
                width: 1280,
                height: 960,
            },
            tasks: [
                {
                    type: 'startChat',
                    autoCompleted: false,
                    title: 'Start a chat',
                    description:
                        '*Start a chat* with a friend or group using their email or phone number.\n' +
                        '\n' +
                        'Here’s how to start a chat:\n' +
                        '\n' +
                        '1. Click the green *+* button.\n' +
                        '2. Choose *Start chat*.\n' +
                        '3. Enter emails or phone numbers.\n' +
                        '\n' +
                        'If any of your friends aren’t using Expensify already, they’ll be invited automatically.\n' +
                        '\n' +
                        'Every chat will also turn into an email or text that they can respond to directly.',
                },
                {
                    type: 'splitExpense',
                    autoCompleted: false,
                    title: 'Split an expense',
                    description:
                        '*Split an expense* right in your chat with one or more friends.\n' +
                        '\n' +
                        'Here’s how to request money:\n' +
                        '\n' +
                        '1. Click the green *+* button.\n' +
                        '2. Choose *Split expense*.\n' +
                        '3. Scan a receipt or enter an amount.\n' +
                        '4. Add your friend(s) to the request.\n' +
                        '\n' +
                        'Feel free to add more details if you want, or just send it off. Let’s get you paid back!',
                },
                {
                    type: 'addBankAccount',
                    autoCompleted: false,
                    title: 'Add personal bank account',
                    description:
                        'You’ll need to add your personal bank account to get paid back. Don’t worry, it’s easy!\n' +
                        '\n' +
                        'Here’s how to set up your bank account:\n' +
                        '\n' +
                        '1. Click your profile picture.\n' +
                        '2. Click *Wallet* > *Bank accounts* > *+ Add bank account*.\n' +
                        '3. Connect your bank account.\n' +
                        '\n' +
                        'Once that’s done, you can request money from anyone and get paid back right into your personal bank account.',
                },
            ],
        },
        [onboardingChoices.LOOKING_AROUND]: {
            message:
                "Expensify is best known for expense and corporate card management, but we do a lot more than that. Let me know what you're interested in and I'll help get you started.",
            tasks: [],
        },
    } satisfies Record<OnboardingPurposeType, OnboardingMessageType>,

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
    REIMBURSEMENT_ACCOUNT: {
        DEFAULT_DATA: {
            achData: {
                state: BankAccount.STATE.SETUP,
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
            },
            UBO: {
                LEGAL_NAME: 0,
                DATE_OF_BIRTH: 1,
                SSN: 2,
                ADDRESS: 3,
            },
        },
    },
    CURRENCY_TO_DEFAULT_MILEAGE_RATE: JSON.parse(`{
        "AED": {
            "rate": 396,
            "unit": "km"
        },
        "AFN": {
            "rate": 8369,
            "unit": "km"
        },
        "ALL": {
            "rate": 11104,
            "unit": "km"
        },
        "AMD": {
            "rate": 56842,
            "unit": "km"
        },
        "ANG": {
            "rate": 193,
            "unit": "km"
        },
        "AOA": {
            "rate": 67518,
            "unit": "km"
        },
        "ARS": {
            "rate": 9873,
            "unit": "km"
        },
        "AUD": {
            "rate": 85,
            "unit": "km"
        },
        "AWG": {
            "rate": 195,
            "unit": "km"
        },
        "AZN": {
            "rate": 183,
            "unit": "km"
        },
        "BAM": {
            "rate": 177,
            "unit": "km"
        },
        "BBD": {
            "rate": 216,
            "unit": "km"
        },
        "BDT": {
            "rate": 9130,
            "unit": "km"
        },
        "BGN": {
            "rate": 177,
            "unit": "km"
        },
        "BHD": {
            "rate": 40,
            "unit": "km"
        },
        "BIF": {
            "rate": 210824,
            "unit": "km"
        },
        "BMD": {
            "rate": 108,
            "unit": "km"
        },
        "BND": {
            "rate": 145,
            "unit": "km"
        },
        "BOB": {
            "rate": 745,
            "unit": "km"
        },
        "BRL": {
            "rate": 594,
            "unit": "km"
        },
        "BSD": {
            "rate": 108,
            "unit": "km"
        },
        "BTN": {
            "rate": 7796,
            "unit": "km"
        },
        "BWP": {
            "rate": 1180,
            "unit": "km"
        },
        "BYN": {
            "rate": 280,
            "unit": "km"
        },
        "BYR": {
            "rate": 2159418,
            "unit": "km"
        },
        "BZD": {
            "rate": 217,
            "unit": "km"
        },
        "CAD": {
            "rate": 70,
            "unit": "km"
        },
        "CDF": {
            "rate": 213674,
            "unit": "km"
        },
        "CHF": {
            "rate": 70,
            "unit": "km"
        },
        "CLP": {
            "rate": 77249,
            "unit": "km"
        },
        "CNY": {
            "rate": 702,
            "unit": "km"
        },
        "COP": {
            "rate": 383668,
            "unit": "km"
        },
        "CRC": {
            "rate": 65899,
            "unit": "km"
        },
        "CUC": {
            "rate": 108,
            "unit": "km"
        },
        "CUP": {
            "rate": 2776,
            "unit": "km"
        },
        "CVE": {
            "rate": 6112,
            "unit": "km"
        },
        "CZK": {
            "rate": 2356,
            "unit": "km"
        },
        "DJF": {
            "rate": 19151,
            "unit": "km"
        },
        "DKK": {
            "rate": 379,
            "unit": "km"
        },
        "DOP": {
            "rate": 6144,
            "unit": "km"
        },
        "DZD": {
            "rate": 14375,
            "unit": "km"
        },
        "EEK": {
            "rate": 1576,
            "unit": "km"
        },
        "EGP": {
            "rate": 1696,
            "unit": "km"
        },
        "ERN": {
            "rate": 1617,
            "unit": "km"
        },
        "ETB": {
            "rate": 4382,
            "unit": "km"
        },
        "EUR": {
            "rate": 30,
            "unit": "km"
        },
        "FJD": {
            "rate": 220,
            "unit": "km"
        },
        "FKP": {
            "rate": 77,
            "unit": "km"
        },
        "GBP": {
            "rate": 45,
            "unit": "mi"
        },
        "GEL": {
            "rate": 359,
            "unit": "km"
        },
        "GHS": {
            "rate": 620,
            "unit": "km"
        },
        "GIP": {
            "rate": 77,
            "unit": "km"
        },
        "GMD": {
            "rate": 5526,
            "unit": "km"
        },
        "GNF": {
            "rate": 1081319,
            "unit": "km"
        },
        "GTQ": {
            "rate": 832,
            "unit": "km"
        },
        "GYD": {
            "rate": 22537,
            "unit": "km"
        },
        "HKD": {
            "rate": 837,
            "unit": "km"
        },
        "HNL": {
            "rate": 2606,
            "unit": "km"
        },
        "HRK": {
            "rate": 684,
            "unit": "km"
        },
        "HTG": {
            "rate": 8563,
            "unit": "km"
        },
        "HUF": {
            "rate": 33091,
            "unit": "km"
        },
        "IDR": {
            "rate": 1555279,
            "unit": "km"
        },
        "ILS": {
            "rate": 540,
            "unit": "km"
        },
        "INR": {
            "rate": 7805,
            "unit": "km"
        },
        "IQD": {
            "rate": 157394,
            "unit": "km"
        },
        "IRR": {
            "rate": 4539961,
            "unit": "km"
        },
        "ISK": {
            "rate": 13518,
            "unit": "km"
        },
        "JMD": {
            "rate": 15794,
            "unit": "km"
        },
        "JOD": {
            "rate": 77,
            "unit": "km"
        },
        "JPY": {
            "rate": 11748,
            "unit": "km"
        },
        "KES": {
            "rate": 11845,
            "unit": "km"
        },
        "KGS": {
            "rate": 9144,
            "unit": "km"
        },
        "KHR": {
            "rate": 437658,
            "unit": "km"
        },
        "KMF": {
            "rate": 44418,
            "unit": "km"
        },
        "KPW": {
            "rate": 97043,
            "unit": "km"
        },
        "KRW": {
            "rate": 121345,
            "unit": "km"
        },
        "KWD": {
            "rate": 32,
            "unit": "km"
        },
        "KYD": {
            "rate": 90,
            "unit": "km"
        },
        "KZT": {
            "rate": 45396,
            "unit": "km"
        },
        "LAK": {
            "rate": 1010829,
            "unit": "km"
        },
        "LBP": {
            "rate": 164153,
            "unit": "km"
        },
        "LKR": {
            "rate": 21377,
            "unit": "km"
        },
        "LRD": {
            "rate": 18709,
            "unit": "km"
        },
        "LSL": {
            "rate": 1587,
            "unit": "km"
        },
        "LTL": {
            "rate": 348,
            "unit": "km"
        },
        "LVL": {
            "rate": 71,
            "unit": "km"
        },
        "LYD": {
            "rate": 486,
            "unit": "km"
        },
        "MAD": {
            "rate": 967,
            "unit": "km"
        },
        "MDL": {
            "rate": 1910,
            "unit": "km"
        },
        "MGA": {
            "rate": 406520,
            "unit": "km"
        },
        "MKD": {
            "rate": 5570,
            "unit": "km"
        },
        "MMK": {
            "rate": 152083,
            "unit": "km"
        },
        "MNT": {
            "rate": 306788,
            "unit": "km"
        },
        "MOP": {
            "rate": 863,
            "unit": "km"
        },
        "MRO": {
            "rate": 38463,
            "unit": "km"
        },
        "MRU": {
            "rate": 3862,
            "unit": "km"
        },
        "MUR": {
            "rate": 4340,
            "unit": "km"
        },
        "MVR": {
            "rate": 1667,
            "unit": "km"
        },
        "MWK": {
            "rate": 84643,
            "unit": "km"
        },
        "MXN": {
            "rate": 93,
            "unit": "km"
        },
        "MYR": {
            "rate": 444,
            "unit": "km"
        },
        "MZN": {
            "rate": 7772,
            "unit": "km"
        },
        "NAD": {
            "rate": 1587,
            "unit": "km"
        },
        "NGN": {
            "rate": 42688,
            "unit": "km"
        },
        "NIO": {
            "rate": 3772,
            "unit": "km"
        },
        "NOK": {
            "rate": 350,
            "unit": "km"
        },
        "NPR": {
            "rate": 12474,
            "unit": "km"
        },
        "NZD": {
            "rate": 95,
            "unit": "km"
        },
        "OMR": {
            "rate": 42,
            "unit": "km"
        },
        "PAB": {
            "rate": 108,
            "unit": "km"
        },
        "PEN": {
            "rate": 401,
            "unit": "km"
        },
        "PGK": {
            "rate": 380,
            "unit": "km"
        },
        "PHP": {
            "rate": 5234,
            "unit": "km"
        },
        "PKR": {
            "rate": 16785,
            "unit": "km"
        },
        "PLN": {
            "rate": 89,
            "unit": "km"
        },
        "PYG": {
            "rate": 704732,
            "unit": "km"
        },
        "QAR": {
            "rate": 393,
            "unit": "km"
        },
        "RON": {
            "rate": 443,
            "unit": "km"
        },
        "RSD": {
            "rate": 10630,
            "unit": "km"
        },
        "RUB": {
            "rate": 8074,
            "unit": "km"
        },
        "RWF": {
            "rate": 107182,
            "unit": "km"
        },
        "SAR": {
            "rate": 404,
            "unit": "km"
        },
        "SBD": {
            "rate": 859,
            "unit": "km"
        },
        "SCR": {
            "rate": 2287,
            "unit": "km"
        },
        "SDG": {
            "rate": 41029,
            "unit": "km"
        },
        "SEK": {
            "rate": 250,
            "unit": "km"
        },
        "SGD": {
            "rate": 145,
            "unit": "km"
        },
        "SHP": {
            "rate": 77,
            "unit": "km"
        },
        "SLL": {
            "rate": 1102723,
            "unit": "km"
        },
        "SOS": {
            "rate": 62604,
            "unit": "km"
        },
        "SRD": {
            "rate": 1526,
            "unit": "km"
        },
        "STD": {
            "rate": 2223309,
            "unit": "km"
        },
        "STN": {
            "rate": 2232,
            "unit": "km"
        },
        "SVC": {
            "rate": 943,
            "unit": "km"
        },
        "SYP": {
            "rate": 82077,
            "unit": "km"
        },
        "SZL": {
            "rate": 1585,
            "unit": "km"
        },
        "THB": {
            "rate": 3328,
            "unit": "km"
        },
        "TJS": {
            "rate": 1230,
            "unit": "km"
        },
        "TMT": {
            "rate": 378,
            "unit": "km"
        },
        "TND": {
            "rate": 295,
            "unit": "km"
        },
        "TOP": {
            "rate": 245,
            "unit": "km"
        },
        "TRY": {
            "rate": 845,
            "unit": "km"
        },
        "TTD": {
            "rate": 732,
            "unit": "km"
        },
        "TWD": {
            "rate": 3055,
            "unit": "km"
        },
        "TZS": {
            "rate": 250116,
            "unit": "km"
        },
        "UAH": {
            "rate": 2985,
            "unit": "km"
        },
        "UGX": {
            "rate": 395255,
            "unit": "km"
        },
        "USD": {
            "rate": 67,
            "unit": "mi"
        },
        "UYU": {
            "rate": 4777,
            "unit": "km"
        },
        "UZS": {
            "rate": 1131331,
            "unit": "km"
        },
        "VEB": {
            "rate": 679346,
            "unit": "km"
        },
        "VEF": {
            "rate": 26793449,
            "unit": "km"
        },
        "VES": {
            "rate": 194381905,
            "unit": "km"
        },
        "VND": {
            "rate": 2487242,
            "unit": "km"
        },
        "VUV": {
            "rate": 11748,
            "unit": "km"
        },
        "WST": {
            "rate": 272,
            "unit": "km"
        },
        "XAF": {
            "rate": 59224,
            "unit": "km"
        },
        "XCD": {
            "rate": 291,
            "unit": "km"
        },
        "XOF": {
            "rate": 59224,
            "unit": "km"
        },
        "XPF": {
            "rate": 10783,
            "unit": "km"
        },
        "YER": {
            "rate": 27037,
            "unit": "km"
        },
        "ZAR": {
            "rate": 464,
            "unit": "km"
        },
        "ZMK": {
            "rate": 566489,
            "unit": "km"
        },
        "ZMW": {
            "rate": 2377,
            "unit": "km"
        }
    }`) as CurrencyDefaultMileageRate,

    EXIT_SURVEY: {
        REASONS: {
            FEATURE_NOT_AVAILABLE: 'featureNotAvailable',
            DONT_UNDERSTAND: 'dontUnderstand',
            PREFER_CLASSIC: 'preferClassic',
        },
    },

    SESSION_STORAGE_KEYS: {
        INITIAL_URL: 'INITIAL_URL',
        ACTIVE_WORKSPACE_ID: 'ACTIVE_WORKSPACE_ID',
        RETRY_LAZY_REFRESHED: 'RETRY_LAZY_REFRESHED',
    },

    RESERVATION_TYPE: {
        CAR: 'car',
        HOTEL: 'hotel',
        FLIGHT: 'flight',
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

    DOWNLOADS_PATH: '/Downloads',
    DOWNLOADS_TIMEOUT: 5000,
    NEW_EXPENSIFY_PATH: '/New Expensify',

    ENVIRONMENT_SUFFIX: {
        DEV: ' Dev',
        ADHOC: ' AdHoc',
    },

    SEARCH: {
        RESULTS_PAGE_SIZE: 50,
        DATA_TYPES: {
            EXPENSE: 'expense',
            INVOICE: 'invoice',
            TRIP: 'trip',
            CHAT: 'chat',
        },
        ACTION_TYPES: {
            VIEW: 'view',
            REVIEW: 'review',
            DONE: 'done',
            PAID: 'paid',
        },
        BULK_ACTION_TYPES: {
            EXPORT: 'export',
            HOLD: 'hold',
            UNHOLD: 'unhold',
            DELETE: 'delete',
        },
        TRANSACTION_TYPE: {
            CASH: 'cash',
            CARD: 'card',
            DISTANCE: 'distance',
        },
        SORT_ORDER: {
            ASC: 'asc',
            DESC: 'desc',
        },
        STATUS: {
            EXPENSE: {
                ALL: 'all',
                DRAFTS: 'drafts',
                OUTSTANDING: 'outstanding',
                APPROVED: 'approved',
                PAID: 'paid',
            },
            INVOICE: {
                ALL: 'all',
                OUTSTANDING: 'outstanding',
                PAID: 'paid',
            },
            TRIP: {
                ALL: 'all',
                CURRENT: 'current',
                PAST: 'past',
            },
            CHAT: {
                ALL: 'all',
                UNREAD: 'unread',
                SENT: 'sent',
                ATTACHMENTS: 'attachments',
                LINKS: 'links',
                PINNED: 'pinned',
            },
        },
        TABLE_COLUMNS: {
            RECEIPT: 'receipt',
            DATE: 'date',
            MERCHANT: 'merchant',
            DESCRIPTION: 'description',
            FROM: 'from',
            TO: 'to',
            CATEGORY: 'category',
            TAG: 'tag',
            TOTAL_AMOUNT: 'amount',
            TYPE: 'type',
            ACTION: 'action',
            TAX_AMOUNT: 'taxAmount',
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
            POLICY_ID: 'policyID',
        },
        SYNTAX_FILTER_KEYS: {
            DATE: 'date',
            AMOUNT: 'amount',
            EXPENSE_TYPE: 'expenseType',
            CURRENCY: 'currency',
            MERCHANT: 'merchant',
            DESCRIPTION: 'description',
            FROM: 'from',
            TO: 'to',
            CATEGORY: 'category',
            TAG: 'tag',
            TAX_RATE: 'taxRate',
            CARD_ID: 'cardID',
            REPORT_ID: 'reportID',
            KEYWORD: 'keyword',
            IN: 'in',
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
    },
    GBP_AUTHENTICATION_COMPLETE: '3DS-authentication-complete',

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

    EXCLUDE_FROM_LAST_VISITED_PATH: [SCREENS.NOT_FOUND, SCREENS.SAML_SIGN_IN, SCREENS.VALIDATE_LOGIN] as string[],

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
            approvals: {
                id: 'approvals' as const,
                alias: 'approvals' as const,
                name: 'Advanced Approvals' as const,
                title: `workspace.upgrade.approvals.title` as const,
                description: `workspace.upgrade.approvals.description` as const,
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
        };
    },
    REPORT_FIELD_TYPES: {
        TEXT: 'text',
        DATE: 'date',
        LIST: 'dropdown',
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
    },

    IMPORT_SPREADSHEET: {
        ICON_WIDTH: 180,
        ICON_HEIGHT: 160,

        CATEGORIES_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-categories#import-custom-categories',
        MEMBERS_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Invite-members-and-assign-roles#import-a-group-of-members',
        TAGS_ARTICLE_LINK: 'https://help.expensify.com/articles/expensify-classic/workspaces/Create-tags#import-a-spreadsheet-1',
    },

    DEBUG: {
        DETAILS: 'details',
        JSON: 'json',
        REPORT_ACTIONS: 'actions',
        REPORT_ACTION_PREVIEW: 'preview',
    },
} as const;

type Country = keyof typeof CONST.ALL_COUNTRIES;

type IOUType = ValueOf<typeof CONST.IOU.TYPE>;
type IOUAction = ValueOf<typeof CONST.IOU.ACTION>;
type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;
type FeedbackSurveyOptionID = ValueOf<Pick<ValueOf<typeof CONST.FEEDBACK_SURVEY_OPTIONS>, 'ID'>>;

type SubscriptionType = ValueOf<typeof CONST.SUBSCRIPTION.TYPE>;
type CancellationType = ValueOf<typeof CONST.CANCELLATION_TYPE>;

export type {Country, IOUAction, IOUType, RateAndUnit, OnboardingPurposeType, IOURequestType, SubscriptionType, FeedbackSurveyOptionID, CancellationType, OnboardingInviteType};

export default CONST;
