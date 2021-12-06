const CLOUDFRONT_URL = 'https://d2k5nsl2zxldvw.cloudfront.net';
const NEW_EXPENSIFY_URL = 'https://new.expensify.com';
const PLATFORM_OS_MACOS = 'Mac OS';
const ANDROID_PACKAGE_NAME = 'com.expensify.chat';

const CONST = {
    ANDROID_PACKAGE_NAME,
    ANIMATED_TRANSITION: 300,

    // 50 megabytes in bytes
    API_MAX_ATTACHMENT_SIZE: 52428800,
    AVATAR_MAX_ATTACHMENT_SIZE: 3145728,
    APP_DOWNLOAD_LINKS: {
        ANDROID: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
        IOS: 'https://apps.apple.com/us/app/expensify-cash/id1530278510',
        DESKTOP: `${NEW_EXPENSIFY_URL}/NewExpensify.dmg`,
    },
    DATE: {
        MOMENT_FORMAT_STRING: 'YYYY-MM-DD',
    },
    SMS: {
        DOMAIN: '@expensify.sms',
    },
    BANK_ACCOUNT: {
        PLAID: {
            ALLOWED_THROTTLED_COUNT: 2,
            ERROR: {
                TOO_MANY_ATTEMPTS: 'Too many attempts',
            },
        },
        ERROR: {
            MISSING_ROUTING_NUMBER: '402 Missing routingNumber',
            MAX_ROUTING_NUMBER: '402 Maximum Size Exceeded routingNumber',
            MISSING_INCORPORATION_STATE: '402 Missing incorporationState in additionalData',
            MISSING_INCORPORATION_TYPE: '402 Missing incorporationType in additionalData',
            MAX_VALIDATION_ATTEMPTS_REACHED: 'Validation for this bank account has been disabled due to too many incorrect attempts. Please contact us.',
            INCORRECT_VALIDATION_AMOUNTS: 'The validate code you entered is incorrect, please try again.',
        },
        STEP: {
            // In the order they appear in the VBA flow
            BANK_ACCOUNT: 'BankAccountStep',
            COMPANY: 'CompanyStep',
            REQUESTOR: 'RequestorStep',
            ACH_CONTRACT: 'ACHContractStep',
            VALIDATION: 'ValidationStep',
            ENABLE: 'EnableStep',
        },
        SUBSTEP: {
            MANUAL: 'manual',
        },
        VERIFICATIONS: {
            ERROR_MESSAGE: 'verifications.errorMessage',
            EXTERNAL_API_RESPONSES: 'verifications.externalApiResponses',
            REQUESTOR_IDENTITY_ID: 'verifications.externalApiResponses.requestorIdentityID',
            REQUESTOR_IDENTITY_ONFIDO: 'verifications.externalApiResponses.requestorIdentityOnfido',
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
            IBAN: /^[A-Za-z0-9]{2,30}$/,
            SWIFT_BIC: /^[A-Za-z0-9]{8,11}$/,
        },
        VERIFICATION_MAX_ATTEMPTS: 7,
        STATE: {
            VERIFYING: 'VERIFYING',
            PENDING: 'PENDING',
        },
        MAX_LENGTH: {
            TAX_ID_NUMBER: 9,
            SSN: 4,
            ZIP_CODE: 5,
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
        CHRONOS_IN_CASH: 'chronosInCash',
        IOU: 'IOU',
        PAY_WITH_EXPENSIFY: 'payWithExpensify',
        FREE_PLAN: 'freePlan',
        DEFAULT_ROOMS: 'defaultRooms',
        BETA_EXPENSIFY_WALLET: 'expensifyWallet',
        INTERNATIONALIZATION: 'internationalization',
        IOU_SEND: 'sendMoney',
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
    },
    PLATFORM: {
        IOS: 'ios',
        ANDROID: 'android',
    },
    KEYBOARD_SHORTCUT_MODIFIERS: {
        CTRL: {
            DEFAULT: 'control',
            [PLATFORM_OS_MACOS]: 'meta',
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
        },
        NEW_GROUP: {
            descriptionKey: 'newGroup',
            shortcutKey: 'K',
            modifiers: ['CTRL', 'SHIFT'],
        },
        SHORTCUT_MODAL: {
            descriptionKey: 'openShortcutDialog',
            shortcutKey: '?',
            modifiers: ['CTRL'],
        },
        ESCAPE: {
            descriptionKey: 'escape',
            shortcutKey: 'Escape',
            modifiers: [],
        },
        ENTER: {
            descriptionKey: null,
            shortcutKey: 'Enter',
            modifiers: [],
        },
    },
    KEYBOARD_SHORTCUT_KEY_DISPLAY_NAME: {
        CONTROL: 'Ctrl',
        META: 'Cmd',
        SHIFT: 'Shift',
    },
    CURRENCY: {
        USD: 'USD',
    },
    CONCIERGE_CHAT_NAME: 'Concierge',
    CLOUDFRONT_URL,
    NEW_ZOOM_MEETING_URL: 'https://zoom.us/start/videomeeting',
    NEW_GOOGLE_MEET_MEETING_URL: 'https://meet.google.com/new',
    DEEPLINK_BASE_URL: 'new-expensify://',
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    UPWORK_URL: 'https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22',
    GITHUB_URL: 'https://github.com/Expensify/App',
    TERMS_URL: 'https://use.expensify.com/terms',
    PRIVACY_URL: 'https://use.expensify.com/privacy',
    LICENSES_URL: 'https://use.expensify.com/licenses',
    PLAY_STORE_URL: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}&hl=en`,
    ADD_SECONDARY_LOGIN_URL: encodeURI('settings?param={"section":"account","openModal":"secondaryLogin"}'),
    MANAGE_CARDS_URL: 'domain_companycards',
    FEES_URL: 'https://use.expensify.com/fees',
    CFPB_PREPAID_URL: 'https://cfpb.gov/prepaid',
    STAGING_SECURE_URL: 'https://staging-secure.expensify.com/',
    NEWDOT: 'new.expensify.com',
    NEW_EXPENSIFY_URL,
    STAGING_NEW_EXPENSIFY_URL: 'https://staging.new.expensify.com',
    OPTION_TYPE: {
        REPORT: 'report',
        PERSONAL_DETAIL: 'personalDetail',
    },
    REPORT: {
        DROP_NATIVE_ID: 'report-dropzone',
        MAXIMUM_PARTICIPANTS: 8,
        ACTIONS: {
            LIMIT: 50,
            TYPE: {
                IOU: 'IOU',
                ADDCOMMENT: 'ADDCOMMENT',
            },
        },
        ERROR: {
            INACCESSIBLE_REPORT: 'Report not found',
        },
        MESSAGE: {
            TYPE: {
                COMMENT: 'COMMENT',
            },
        },
        TYPE: {
            CHAT: 'chat',
            IOU: 'iou',
        },
        CHAT_TYPE: {
            POLICY_ANNOUNCE: 'policyAnnounce',
            POLICY_ADMINS: 'policyAdmins',
            DOMAIN_ALL: 'domainAll',
        },
        STATE_NUM: {
            OPEN: 0,
            PROCESSING: 1,
            SUBMITTED: 2,
        },
        NOTIFICATION_PREFERENCE: {
            MUTE: 'mute',
            DAILY: 'daily',
            ALWAYS: 'always',
        },
        MAX_PREVIEW_AVATARS: 4,
    },
    MODAL: {
        MODAL_TYPE: {
            CONFIRM: 'confirm',
            CENTERED: 'centered',
            CENTERED_UNSWIPEABLE: 'centered_unswipeable',
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
    },
    TIMING: {
        SEARCH_RENDER: 'search_render',
        HOMEPAGE_INITIAL_RENDER: 'homepage_initial_render',
        REPORT_INITIAL_RENDER: 'report_initial_render',
        HOMEPAGE_REPORTS_LOADED: 'homepage_reports_loaded',
        SWITCH_REPORT: 'switch_report',
        SIDEBAR_LOADED: 'sidebar_loaded',
        COLD: 'cold',
        REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME: 1500,
        TOOLTIP_SENSE: 1000,
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    ERROR: {
        API_OFFLINE: 'session.offlineMessageRetry',
        UNKNOWN_ERROR: 'Unknown error',
    },
    NETWORK: {
        METHOD: {
            POST: 'post',
        },
    },
    NVP: {
        IS_FIRST_TIME_NEW_EXPENSIFY_USER: 'isFirstTimeNewExpensifyUser',
        BLOCKED_FROM_CONCIERGE: 'private_blockedFromConcierge',
        PAYPAL_ME_ADDRESS: 'expensify_payPalMeAddress',
        PRIORITY_MODE: 'priorityMode',
        TIMEZONE: 'timeZone',
        FREE_PLAN_BANK_ACCOUNT_ID: 'expensify_freePlanBankAccountID',
        ACH_DATA_THROTTLED: 'expensify_ACHData_throttled',
        FAILED_BANK_ACCOUNT_VALIDATIONS_PREFIX: 'private_failedBankValidations_',
        BANK_ACCOUNT_GET_THROTTLED: 'private_throttledHistory_BankAccount_Get',
        PREFERRED_LOCALE: 'preferredLocale',
        KYC_MIGRATION: 'expensify_migration_2020_04_28_RunKycVerifications',
        PREFERRED_EMOJI_SKIN_TONE: 'expensify_preferredEmojiSkinTone',
    },
    DEFAULT_TIME_ZONE: {automatic: true, selected: 'America/Los_Angeles'},
    DEFAULT_ACCOUNT_DATA: {error: '', success: '', loading: false},
    APP_STATE: {
        ACTIVE: 'active',
        BACKGROUND: 'background',
        INACTIVE: 'inactive',
    },

    // at least 8 characters, 1 capital letter, 1 lowercase number, 1 number
    PASSWORD_COMPLEXITY_REGEX_STRING: '^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$',

    PASSWORD_PAGE: {
        ERROR: {
            ALREADY_VALIDATED: 'Account already validated',
            VALIDATE_CODE_FAILED: 'Validate code failed',
        },
    },

    EMOJI_SPACER: 'SPACER',

    LOGIN_TYPE: {
        PHONE: 'phone',
        EMAIL: 'email',
    },

    KEYBOARD_TYPE: {
        NUMERIC: 'numeric',
        PHONE_PAD: 'phone-pad',
        NUMBER_PAD: 'number-pad',
    },

    ATTACHMENT_PICKER_TYPE: {
        FILE: 'file',
        IMAGE: 'image',
    },

    EMOJI_PICKER_SIZE: 320,
    NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT: 300,
    EMOJI_PICKER_ITEM_HEIGHT: 40,
    EMOJI_PICKER_HEADER_HEIGHT: 38,

    COMPOSER_MAX_HEIGHT: 116,

    EMAIL: {
        CONCIERGE: 'concierge@expensify.com',
        HELP: 'help@expensify.com',
        RECEIPTS: 'receipts@expensify.com',
        CHRONOS: 'chronos@expensify.com',
        QA: 'qa@expensify.com',
        CONTRIBUTORS: 'contributors@expensify.com',
        FIRST_RESPONDER: 'firstresponders@expensify.com',
        QA_TRAVIS: 'qa+travisreceipts@expensify.com',
        BILLS: 'bills@expensify.com',
        STUDENT_AMBASSADOR: 'studentambassadors@expensify.com',
        ACCOUNTING: 'accounting@expensify.com',
        PAYROLL: 'payroll@expensify.com',
        SVFG: 'svfg@expensify.com',
        INTEGRATION_TESTING_CREDS: 'integrationtestingcreds@expensify.com',
        ADMIN: 'admin@expensify.com',
    },

    ENVIRONMENT: {
        DEV: 'DEV',
        STAGING: 'STG',
        PRODUCTION: 'PROD',
    },

    // Used to delay the initial fetching of reportActions when the app first inits or reconnects (e.g. returning
    // from backgound). The times are based on how long it generally seems to take for the app to become interactive
    // in each scenario.
    FETCH_ACTIONS_DELAY: {
        STARTUP: 8000,
        RECONNECT: 1000,
    },

    WALLET: {
        ERROR: {
            IDENTITY_NOT_FOUND: 'Identity not found',
            INVALID_SSN: 'Invalid SSN',
            UNEXPECTED: 'Unexpected error',
            MISSING_FIELD: 'Missing required additional details fields',
            UNABLE_TO_VERIFY: 'Unable to verify identity',
        },
        STEP: {
            ONFIDO: 'OnfidoStep',
            ADDITIONAL_DETAILS: 'AdditionalDetailsStep',
            TERMS: 'TermsStep',
            ACTIVATE: 'ActivateStep',
        },
        TIER_NAME: {
            GOLD: 'GOLD',
            SILVER: 'SILVER',
        },
    },

    PLAID: {
        EVENT: {
            ERROR: 'ERROR',
            EXIT: 'EXIT',
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
            USER_CANCELLED: 'User canceled flow',
            USER_TAPPED_BACK: 'User exited by clicking the back button.',
        },
    },

    OS: {
        WINDOWS: 'Windows',
        MAC_OS: PLATFORM_OS_MACOS,
        ANDROID: 'Android',
        IOS: 'iOS',
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

    IOU: {
        // Note: These payment types are used when building IOU reportAction message values in the server and should
        // not be changed.
        PAYMENT_TYPE: {
            ELSEWHERE: 'Elsewhere',
            EXPENSIFY: 'Expensify',
            PAYPAL_ME: 'PayPal.me',
            VENMO: 'Venmo',
        },
        IOU_TYPE: {
            SEND: 'send',
            SPLIT: 'split',
            REQUEST: 'request',
        },
        AMOUNT_MAX_LENGTH: 10,
    },

    GROWL: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        DURATION: 2000,
        DURATION_LONG: 3500,
    },

    DEFAULT_LOCALE: 'en',
    DEFAULT_SKIN_TONE: 'default',

    POLICY: {
        TYPE: {
            FREE: 'free',
            PERSONAL: 'personal',
        },
        ROLE: {
            ADMIN: 'admin',
        },
    },

    TERMS: {
        CFPB_PREPAID: 'cfpb.gov/prepaid',
        CFPB_COMPLAINT: 'cfpb.gov/complaint',
        FDIC_PREPAID: 'fdic.gov/deposit/deposits/prepaid.html',
        USE_EXPENSIFY_FEES: 'use.expensify.com/fees',
    },

    ICON_TYPE_ICON: 'icon',
    ICON_TYPE_AVATAR: 'avatar',
    AVATAR_SIZE: {
        LARGE: 'large',
        DEFAULT: 'default',
    },

    PHONE_MAX_LENGTH: 15,
    PHONE_MIN_LENGTH: 5,
    REGEX: {
        SPECIAL_CHARS_WITHOUT_NEWLINE: /((?!\n)[()-\s\t])/g,
        US_PHONE: /^\+1\d{10}$/,
        DIGITS_AND_PLUS: /^\+?[0-9]*$/,
        PHONE_E164_PLUS: /^\+?[1-9]\d{1,14}$/,
        PHONE_WITH_SPECIAL_CHARS: /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\\./0-9]{0,12}$/,
        NON_ALPHA_NUMERIC: /[^A-Za-z0-9+]/g,
        PO_BOX: /\b[P|p]?(OST|ost)?\.?\s*[O|o|0]?(ffice|FFICE)?\.?\s*[B|b][O|o|0]?[X|x]?\.?\s+[#]?(\d+)\b/,
        ANY_VALUE: /^.+$/,
        ZIP_CODE: /[0-9]{5}(?:[- ][0-9]{4})?/,
        INDUSTRY_CODE: /^[0-9]{6}$/,
        SSN_LAST_FOUR: /^(?!0000)[0-9]{4}$/,
        NUMBER: /^[0-9]+$/,
        CARD_NUMBER: /^[0-9]{15,16}$/,
        CARD_SECURITY_CODE: /^[0-9]{3,4}$/,
        CARD_EXPIRATION_DATE: /^(0[1-9]|1[0-2])([^0-9])?([0-9]{4}|([0-9]{2}))$/,
        PAYPAL_ME_USERNAME: /^[a-zA-Z0-9]+$/,

        // Adapted from: https://gist.github.com/dperini/729294
        // eslint-disable-next-line max-len
        HYPERLINK: /^(?:(?:(?:https?|ftp):\/\/)?)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i,

        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJIS: /(?:\uD83D(?:\uDC41\u200D\uD83D\uDDE8|\uDC68\u200D\uD83D[\uDC68\uDC69]\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?)|\uDC69\u200D\uD83D\uDC69\u200D\uD83D(?:\uDC66(?:\u200D\uD83D\uDC66)?|\uDC67(?:\u200D\uD83D[\uDC66\uDC67])?))|[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|[\ud83c\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|[\ud83c\ude32-\ude3a]|[\ud83c\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g,
    },

    PRONOUNS: {
        PREFIX: '__predefined_',
        SELF_SELECT: '__predefined_selfSelect',
    },
    get EXPENSIFY_EMAILS() {
        return [
            this.EMAIL.CONCIERGE,
            this.EMAIL.HELP,
            this.EMAIL.RECEIPTS,
            this.EMAIL.CHRONOS,
            this.EMAIL.QA,
            this.EMAIL.CONTRIBUTORS,
            this.EMAIL.FIRST_RESPONDER,
            this.EMAIL.QA_TRAVIS,
            this.EMAIL.BILLS,
            this.EMAIL.STUDENT_AMBASSADOR,
            this.EMAIL.ACCOUNTING,
            this.EMAIL.PAYROLL,
            this.EMAIL.SVFG,
            this.EMAIL.INTEGRATION_TESTING_CREDS,
            this.EMAIL.ADMIN,
        ];
    },
};

export default CONST;
