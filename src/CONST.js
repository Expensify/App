import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import * as KeyCommand from 'react-native-key-command';
import * as Url from './libs/Url';

const CLOUDFRONT_DOMAIN = 'cloudfront.net';
const CLOUDFRONT_URL = `https://d2k5nsl2zxldvw.${CLOUDFRONT_DOMAIN}`;
const ACTIVE_EXPENSIFY_URL = Url.addTrailingForwardSlash(lodashGet(Config, 'NEW_EXPENSIFY_URL', 'https://new.expensify.com'));
const USE_EXPENSIFY_URL = 'https://use.expensify.com';
const PLATFORM_OS_MACOS = 'Mac OS';
const PLATFORM_IOS = 'iOS';
const ANDROID_PACKAGE_NAME = 'com.expensify.chat';
const CURRENT_YEAR = new Date().getFullYear();
const PULL_REQUEST_NUMBER = lodashGet(Config, 'PULL_REQUEST_NUMBER', '');

const keyModifierControl = lodashGet(KeyCommand, 'constants.keyModifierControl', 'keyModifierControl');
const keyModifierCommand = lodashGet(KeyCommand, 'constants.keyModifierCommand', 'keyModifierCommand');
const keyModifierShiftControl = lodashGet(KeyCommand, 'constants.keyModifierShiftControl', 'keyModifierShiftControl');
const keyModifierShiftCommand = lodashGet(KeyCommand, 'constants.keyModifierShiftCommand', 'keyModifierShiftCommand');
const keyInputEscape = lodashGet(KeyCommand, 'constants.keyInputEscape', 'keyInputEscape');
const keyInputEnter = lodashGet(KeyCommand, 'constants.keyInputEnter', 'keyInputEnter');
const keyInputUpArrow = lodashGet(KeyCommand, 'constants.keyInputUpArrow', 'keyInputUpArrow');
const keyInputDownArrow = lodashGet(KeyCommand, 'constants.keyInputDownArrow', 'keyInputDownArrow');
const keyInputLeftArrow = lodashGet(KeyCommand, 'constants.keyInputLeftArrow', 'keyInputLeftArrow');
const keyInputRightArrow = lodashGet(KeyCommand, 'constants.keyInputRightArrow', 'keyInputRightArrow');

// describes if a shortcut key can cause navigation
const KEYBOARD_SHORTCUT_NAVIGATION_TYPE = 'NAVIGATION_SHORTCUT';

const CONST = {
    ANDROID_PACKAGE_NAME,
    ANIMATED_TRANSITION: 300,
    ANIMATED_TRANSITION_FROM_VALUE: 100,
    ANIMATION_IN_TIMING: 100,
    ARROW_HIDE_DELAY: 3000,

    API_ATTACHMENT_VALIDATIONS: {
        // 24 megabytes in bytes, this is limit set on servers, do not update without wider internal discussion
        MAX_SIZE: 25165824,

        // An arbitrary size, but the same minimum as in the PHP layer
        MIN_SIZE: 240,
    },

    AUTO_AUTH_STATE: {
        NOT_STARTED: 'not-started',
        SIGNING_IN: 'signing-in',
        JUST_SIGNED_IN: 'just-signed-in',
        FAILED: 'failed',
    },

    AVATAR_MAX_ATTACHMENT_SIZE: 6291456,

    AVATAR_ALLOWED_EXTENSIONS: ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg'],

    // Minimum width and height size in px for a selected image
    AVATAR_MIN_WIDTH_PX: 80,
    AVATAR_MIN_HEIGHT_PX: 80,

    // Maximum width and height size in px for a selected image
    AVATAR_MAX_WIDTH_PX: 4096,
    AVATAR_MAX_HEIGHT_PX: 4096,

    DEFAULT_AVATAR_COUNT: 24,
    OLD_DEFAULT_AVATAR_COUNT: 8,

    DISPLAY_NAME: {
        MAX_LENGTH: 50,
        RESERVED_FIRST_NAMES: ['Expensify', 'Concierge'],
    },

    PULL_REQUEST_NUMBER,

    CALENDAR_PICKER: {
        // Numbers were arbitrarily picked.
        MIN_YEAR: CURRENT_YEAR - 100,
        MAX_YEAR: CURRENT_YEAR + 100,
    },

    DATE_BIRTH: {
        MIN_AGE: 5,
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
        SMALL_SCREEN: {
            IMAGE_HEIGHT: 300,
            CONTAINER_MINHEIGHT: 200,
            VIEW_HEIGHT: 185,
        },
        WIDE_SCREEN: {
            IMAGE_HEIGHT: 450,
            CONTAINER_MINHEIGHT: 500,
            VIEW_HEIGHT: 275,
        },
        MONEY_REPORT: {
            MIN_HEIGHT: 280,
        },
    },

    RIGHT_MODAL_BACKGROUND_OVERLAY_OPACITY: 0.4,

    NEW_EXPENSIFY_URL: ACTIVE_EXPENSIFY_URL,
    APP_DOWNLOAD_LINKS: {
        ANDROID: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
        IOS: 'https://apps.apple.com/us/app/expensify-cash/id1530278510',
        DESKTOP: `${ACTIVE_EXPENSIFY_URL}NewExpensify.dmg`,
    },
    DATE: {
        MOMENT_FORMAT_STRING: 'YYYY-MM-DD',
        SQL_DATE_TIME: 'YYYY-MM-DD HH:mm:ss',
        FNS_FORMAT_STRING: 'yyyy-MM-dd',
        UNIX_EPOCH: '1970-01-01 00:00:00.000',
        MAX_DATE: '9999-12-31',
        MIN_DATE: '0001-01-01',
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

            // If the account number length is from 4 to 13 digits, we show the last 4 digits and hide the rest with X
            // If the length is longer than 13 digits, we show the first 6 and last 4 digits, hiding the rest with X
            MASKED_US_ACCOUNT_NUMBER: /^[X]{0,9}[0-9]{4}$|^[0-9]{6}[X]{4,7}[0-9]{4}$/,
            SWIFT_BIC: /^[A-Za-z0-9]{8,11}$/,
        },
        VERIFICATION_MAX_ATTEMPTS: 7,
        STATE: {
            VERIFYING: 'VERIFYING',
            PENDING: 'PENDING',
            OPEN: 'OPEN',
        },
        MAX_LENGTH: {
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
        CHRONOS_IN_CASH: 'chronosInCash',
        PAY_WITH_EXPENSIFY: 'payWithExpensify',
        FREE_PLAN: 'freePlan',
        DEFAULT_ROOMS: 'defaultRooms',
        BETA_EXPENSIFY_WALLET: 'expensifyWallet',
        BETA_COMMENT_LINKING: 'commentLinking',
        INTERNATIONALIZATION: 'internationalization',
        IOU_SEND: 'sendMoney',
        POLICY_ROOMS: 'policyRooms',
        POLICY_EXPENSE_CHAT: 'policyExpenseChat',
        PASSWORDLESS: 'passwordless',
        TASKS: 'tasks',
        THREADS: 'threads',
        SCAN_RECEIPTS: 'scanReceipts',
        DISTANCE_REQUESTS: 'distanceRequests',
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
        NEW_GROUP: {
            descriptionKey: 'newGroup',
            shortcutKey: 'K',
            modifiers: ['CTRL', 'SHIFT'],
            trigger: {
                DEFAULT: {input: 'k', modifierFlags: keyModifierShiftControl},
                [PLATFORM_OS_MACOS]: {input: 'k', modifierFlags: keyModifierShiftCommand},
                [PLATFORM_IOS]: {input: 'k', modifierFlags: keyModifierShiftCommand},
            },
            type: KEYBOARD_SHORTCUT_NAVIGATION_TYPE,
        },
        SHORTCUT_MODAL: {
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
    },
    EXAMPLE_PHONE_NUMBER: '+15005550006',
    CONCIERGE_CHAT_NAME: 'Concierge',
    CLOUDFRONT_URL,
    USE_EXPENSIFY_URL,
    NEW_ZOOM_MEETING_URL: 'https://zoom.us/start/videomeeting',
    NEW_GOOGLE_MEET_MEETING_URL: 'https://meet.google.com/new',
    GOOGLE_MEET_URL_ANDROID: 'https://meet.google.com',
    DEEPLINK_BASE_URL: 'new-expensify://',
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    CLOUDFRONT_DOMAIN_REGEX: /^https:\/\/\w+\.cloudfront\.net/i,
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    CONCIERGE_ICON_URL_2021: `${CLOUDFRONT_URL}/images/icons/concierge_2021.png`,
    CONCIERGE_ICON_URL: `${CLOUDFRONT_URL}/images/icons/concierge_2022.png`,
    UPWORK_URL: 'https://github.com/Expensify/App/issues?q=is%3Aopen+is%3Aissue+label%3A%22Help+Wanted%22',
    GITHUB_URL: 'https://github.com/Expensify/App',
    TERMS_URL: `${USE_EXPENSIFY_URL}/terms`,
    PRIVACY_URL: `${USE_EXPENSIFY_URL}/privacy`,
    LICENSES_URL: `${USE_EXPENSIFY_URL}/licenses`,
    GITHUB_RELEASE_URL: 'https://api.github.com/repos/expensify/app/releases/latest',
    ADD_SECONDARY_LOGIN_URL: encodeURI('settings?param={"section":"account","openModal":"secondaryLogin"}'),
    MANAGE_CARDS_URL: 'domain_companycards',
    FEES_URL: `${USE_EXPENSIFY_URL}/fees`,
    CFPB_PREPAID_URL: 'https://cfpb.gov/prepaid',
    STAGING_NEW_EXPENSIFY_URL: 'https://staging.new.expensify.com',
    NEWHELP_URL: 'https://help.expensify.com',
    INTERNAL_DEV_EXPENSIFY_URL: 'https://www.expensify.com.dev',
    STAGING_EXPENSIFY_URL: 'https://staging.expensify.com',
    EXPENSIFY_URL: 'https://www.expensify.com',

    // Use Environment.getEnvironmentURL to get the complete URL with port number
    DEV_NEW_EXPENSIFY_URL: 'http://localhost:',

    OPTION_TYPE: {
        REPORT: 'report',
        PERSONAL_DETAIL: 'personalDetail',
    },
    RECEIPT: {
        ICON_SIZE: 164,
        PERMISSION_AUTHORIZED: 'authorized',
        HAND_ICON_HEIGHT: 152,
        HAND_ICON_WIDTH: 200,
        SHUTTER_SIZE: 90,
    },
    REPORT: {
        MAXIMUM_PARTICIPANTS: 8,
        SPLIT_REPORTID: '-2',
        ACTIONS: {
            LIMIT: 50,
            TYPE: {
                ADDCOMMENT: 'ADDCOMMENT',
                CLOSED: 'CLOSED',
                CREATED: 'CREATED',
                TASKEDITED: 'TASKEDITED',
                TASKCANCELLED: 'TASKCANCELLED',
                IOU: 'IOU',
                REIMBURSEMENTQUEUED: 'REIMBURSEMENTQUEUED',
                RENAMED: 'RENAMED',
                CHRONOSOOOLIST: 'CHRONOSOOOLIST',
                TASKCOMPLETED: 'TASKCOMPLETED',
                TASKREOPENED: 'TASKREOPENED',
                REPORTPREVIEW: 'REPORTPREVIEW',
                POLICYCHANGELOG: {
                    ADD_APPROVER_RULE: 'POLICYCHANGELOG_ADD_APPROVER_RULE',
                    ADD_CATEGORY: 'POLICYCHANGELOG_ADD_CATEGORY',
                    ADD_CUSTOM_UNIT: 'POLICYCHANGELOG_ADD_CUSTOM_UNIT',
                    ADD_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_ADD_CUSTOM_UNIT_RATE',
                    ADD_EMPLOYEE: 'POLICYCHANGELOG_ADD_EMPLOYEE',
                    ADD_INTEGRATION: 'POLICYCHANGELOG_ADD_INTEGRATION',
                    ADD_REPORT_FIELD: 'POLICYCHANGELOG_ADD_REPORT_FIELD',
                    ADD_TAG: 'POLICYCHANGELOG_ADD_TAG',
                    DELETE_ALL_TAGS: 'POLICYCHANGELOG_DELETE_ALL_TAGS',
                    DELETE_APPROVER_RULE: 'POLICYCHANGELOG_DELETE_APPROVER_RULE',
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
                    SET_AUTOREIMBURSEMENT: 'POLICYCHANGELOG_SET_AUTOREIMBURSEMENT',
                    SET_AUTO_JOIN: 'POLICYCHANGELOG_SET_AUTO_JOIN',
                    SET_CATEGORY_NAME: 'POLICYCHANGELOG_SET_CATEGORY_NAME',
                    UPDATE_ACH_ACCOUNT: 'POLICYCHANGELOG_UPDATE_ACH_ACCOUNT',
                    UPDATE_APPROVER_RULE: 'POLICYCHANGELOG_UPDATE_APPROVER_RULE',
                    UPDATE_AUDIT_RATE: 'POLICYCHANGELOG_UPDATE_AUDIT_RATE',
                    UPDATE_AUTOHARVESTING: 'POLICYCHANGELOG_UPDATE_AUTOHARVESTING',
                    UPDATE_AUTOREIMBURSEMENT: 'POLICYCHANGELOG_UPDATE_AUTOREIMBURSEMENT',
                    UPDATE_AUTOREPORTING_FREQUENCY: 'POLICYCHANGELOG_UPDATE_AUTOREPORTING_FREQUENCY',
                    UPDATE_CATEGORY: 'POLICYCHANGELOG_UPDATE_CATEGORY',
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
                    UPDATE_OWNERSHIP: 'POLICYCHANGELOG_UPDATE_OWNERSHIP',
                    UPDATE_REIMBURSEMENT_CHOICE: 'POLICYCHANGELOG_UPDATE_REIMBURSEMENT_CHOICE',
                    UPDATE_REPORT_FIELD: 'POLICYCHANGELOG_UPDATE_REPORT_FIELD',
                    UPDATE_TAG: 'POLICYCHANGELOG_UPDATE_TAG',
                    UPDATE_TAG_LIST_NAME: 'POLICYCHANGELOG_UPDATE_TAG_LIST_NAME',
                    UPDATE_TAG_NAME: 'POLICYCHANGELOG_UPDATE_TAG_NAME',
                    UPDATE_TIME_ENABLED: 'POLICYCHANGELOG_UPDATE_TIME_ENABLED',
                    UPDATE_TIME_RATE: 'POLICYCHANGELOG_UPDATE_TIME_RATE',
                },
            },
        },
        ARCHIVE_REASON: {
            DEFAULT: 'default',
            ACCOUNT_CLOSED: 'accountClosed',
            ACCOUNT_MERGED: 'accountMerged',
            REMOVED_FROM_POLICY: 'removedFromPolicy',
            POLICY_DELETED: 'policyDeleted',
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
        },
        CHAT_TYPE: {
            POLICY_ANNOUNCE: 'policyAnnounce',
            POLICY_ADMINS: 'policyAdmins',
            DOMAIN_ALL: 'domainAll',
            POLICY_ROOM: 'policyRoom',
            POLICY_EXPENSE_CHAT: 'policyExpenseChat',
        },
        WORKSPACE_CHAT_ROOMS: {
            ANNOUNCE: '#announce',
            ADMINS: '#admins',
        },
        STATE: {
            SUBMITTED: 'SUBMITTED',
            PROCESSING: 'PROCESSING',
        },
        STATE_NUM: {
            OPEN: 0,
            PROCESSING: 1,
            SUBMITTED: 2,
            BILLING: 3,
        },
        STATUS: {
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
        MAX_ROOM_NAME_LENGTH: 79,
        LAST_MESSAGE_TEXT_MAX_LENGTH: 200,
        OWNER_EMAIL_FAKE: '__FAKE__',
        OWNER_ACCOUNT_ID_FAKE: 0,
        DEFAULT_REPORT_NAME: 'Chat Report',
    },
    COMPOSER: {
        MAX_LINES: 16,
        MAX_LINES_SMALL_SCREEN: 6,
        MAX_LINES_FULL: -1,

        // The minimum number of typed lines needed to enable the full screen composer
        FULL_COMPOSER_MIN_LINES: 3,
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
    },
    TIMING: {
        CALCULATE_MOST_RECENT_LAST_MODIFIED_ACTION: 'calc_most_recent_last_modified_action',
        SEARCH_RENDER: 'search_render',
        HOMEPAGE_INITIAL_RENDER: 'homepage_initial_render',
        REPORT_INITIAL_RENDER: 'report_initial_render',
        SWITCH_REPORT: 'switch_report',
        SIDEBAR_LOADED: 'sidebar_loaded',
        COLD: 'cold',
        WARM: 'warm',
        REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME: 1500,
        SHOW_LOADING_SPINNER_DEBOUNCE_TIME: 250,
        TEST_TOOLS_MODAL_THROTTLE_TIME: 800,
        TOOLTIP_SENSE: 1000,
        TRIE_INITIALIZATION: 'trie_initialization',
        COMMENT_LENGTH_DEBOUNCE_TIME: 500,
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    THEME: {
        DEFAULT: 'dark',
        LIGHT: 'light',
        DARK: 'dark',
        SYSTEM: 'system',
    },
    JSON_CODE: {
        SUCCESS: 200,
        BAD_REQUEST: 400,
        NOT_AUTHENTICATED: 407,
        EXP_ERROR: 666,
        MANY_WRITES_ERROR: 665,
        UNABLE_TO_RETRY: 'unableToRetry',
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
    },
    DEFAULT_TIME_ZONE: {automatic: true, selected: 'America/Los_Angeles'},
    DEFAULT_ACCOUNT_DATA: {errors: null, success: '', isLoading: false},
    DEFAULT_CLOSE_ACCOUNT_DATA: {errors: {}, success: '', isLoading: false},
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

    // The server has a WAF (Web Application Firewall) which will strip out HTML/XML tags using this regex pattern.
    // It's copied here so that the same regex pattern can be used in form validations to be consistent with the server.
    VALIDATE_FOR_HTML_TAG_REGEX: /<([^>\s]+)(?:[^>]*?)>/g,

    PASSWORD_PAGE: {
        ERROR: {
            ALREADY_VALIDATED: 'Account already validated',
            VALIDATE_CODE_FAILED: 'Validate code failed',
        },
    },

    PUSHER: {
        PRIVATE_USER_CHANNEL_PREFIX: 'private-encrypted-user-accountID-',
        PRIVATE_REPORT_CHANNEL_PREFIX: 'private-report-reportID-',
    },

    EMOJI_SPACER: 'SPACER',

    // This is the number of columns in each row of the picker.
    // Because of how flatList implements these rows, each row is an index rather than each element
    // For this reason to make headers work, we need to have the header be the only rendered element in its row
    // If this number is changed, emojis.js will need to be updated to have the proper number of spacer elements
    // around each header.
    EMOJI_NUM_PER_ROW: 8,

    EMOJI_FREQUENT_ROW_COUNT: 3,

    EMOJI_DEFAULT_SKIN_TONE: -1,

    INVISIBLE_CODEPOINTS: ['fe0f', '200d', '2066'],

    TOOLTIP_MAX_LINES: 3,

    LOGIN_TYPE: {
        PHONE: 'phone',
        EMAIL: 'email',
    },

    MAGIC_CODE_LENGTH: 6,
    MAGIC_CODE_EMPTY_CHAR: ' ',

    KEYBOARD_TYPE: {
        PHONE_PAD: 'phone-pad',
        NUMBER_PAD: 'number-pad',
        DECIMAL_PAD: 'decimal-pad',
        VISIBLE_PASSWORD: 'visible-password',
        EMAIL_ADDRESS: 'email-address',
        ASCII_CAPABLE: 'ascii-capable',
        URL: 'url',
        DEFAULT: 'default',
    },

    ATTACHMENT_MESSAGE_TEXT: '[Attachment]',
    // This is a placeholder for attachment which is uploading
    ATTACHMENT_UPLOADING_MESSAGE_HTML: 'Uploading attachment...',
    ATTACHMENT_SOURCE_ATTRIBUTE: 'data-expensify-source',
    ATTACHMENT_PREVIEW_ATTRIBUTE: 'src',
    ATTACHMENT_ORIGINAL_FILENAME_ATTRIBUTE: 'data-name',

    ATTACHMENT_PICKER_TYPE: {
        FILE: 'file',
        IMAGE: 'image',
    },

    ATTACHMENT_FILE_TYPE: {
        FILE: 'file',
        IMAGE: 'image',
        VIDEO: 'video',
    },

    FILE_TYPE_REGEX: {
        IMAGE: /\.(jpg|jpeg|png|webp|avif|gif|tiff|wbmp|ico|jng|bmp|heic|svg|svg2)$/,
        VIDEO: /\.(3gp|h261|h263|h264|m4s|jpgv|jpm|jpgm|mp4|mp4v|mpg4|mpeg|mpg|ogv|ogg|mov|qt|webm|flv|mkv|wmv|wav|avi|movie|f4v|avchd|mp2|mpe|mpv|m4v|swf)$/,
    },
    IOS_CAMERAROLL_ACCESS_ERROR: 'Access to photo library was denied',
    ADD_PAYMENT_MENU_POSITION_Y: 226,
    ADD_PAYMENT_MENU_POSITION_X: 356,
    EMOJI_PICKER_SIZE: {
        WIDTH: 320,
        HEIGHT: 416,
    },
    DESKTOP_HEADER_PADDING: 12,
    CATEGORY_SHORTCUT_BAR_HEIGHT: 32,
    SMALL_EMOJI_PICKER_SIZE: {
        WIDTH: '100%',
    },
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
        MIN_AMOUNT_OF_SUGGESTIONS: 3,
        MAX_AMOUNT_OF_SUGGESTIONS: 20,
        MAX_AMOUNT_OF_VISIBLE_SUGGESTIONS_IN_CONTAINER: 5,
        HERE_TEXT: '@here',
    },
    COMPOSER_MAX_HEIGHT: 125,
    CHAT_FOOTER_MIN_HEIGHT: 65,
    CHAT_SKELETON_VIEW: {
        AVERAGE_ROW_HEIGHT: 80,
        HEIGHT_FOR_ROW_COUNT: {
            1: 60,
            2: 80,
            3: 100,
        },
    },
    LHN_SKELETON_VIEW_ITEM_HEIGHT: 64,
    EXPENSIFY_PARTNER_NAME: 'expensify.com',
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
        PAYROLL: 'payroll@expensify.com',
        QA: 'qa@expensify.com',
        QA_TRAVIS: 'qa+travisreceipts@expensify.com',
        RECEIPTS: 'receipts@expensify.com',
        STUDENT_AMBASSADOR: 'studentambassadors@expensify.com',
        SVFG: 'svfg@expensify.com',
    },

    ACCOUNT_ID: {
        ACCOUNTING: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_ACCOUNTING', 9645353)),
        ADMIN: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_ADMIN', -1)),
        BILLS: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_BILLS', 1371)),
        CHRONOS: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_CHRONOS', 10027416)),
        CONCIERGE: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_CONCIERGE', 8392101)),
        CONTRIBUTORS: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_CONTRIBUTORS', 9675014)),
        FIRST_RESPONDER: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_FIRST_RESPONDER', 9375152)),
        HELP: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_HELP', -1)),
        INTEGRATION_TESTING_CREDS: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_INTEGRATION_TESTING_CREDS', -1)),
        PAYROLL: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_PAYROLL', 9679724)),
        QA: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_QA', 3126513)),
        QA_TRAVIS: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_QA_TRAVIS', 8595733)),
        RECEIPTS: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_RECEIPTS', -1)),
        REWARDS: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_REWARDS', 11023767)), // rewards@expensify.com
        STUDENT_AMBASSADOR: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_STUDENT_AMBASSADOR', 10476956)),
        SVFG: Number(lodashGet(Config, 'EXPENSIFY_ACCOUNT_ID_SVFG', 2012843)),
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
            ADDITIONAL_DETAILS: 'AdditionalDetailsStep',
            ADDITIONAL_DETAILS_KBA: 'AdditionalDetailsKBAStep',
            ONFIDO: 'OnfidoStep',
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
            USER_CANCELLED: 'User canceled flow.',
            USER_TAPPED_BACK: 'User exited by clicking the back button.',
            USER_EXITED: 'User exited by manual action.',
            USER_CAMERA_DENINED: 'Onfido.OnfidoFlowError',
            USER_CAMERA_PERMISSION: 'Encountered an error: cameraPermission',
            // eslint-disable-next-line max-len
            USER_CAMERA_CONSENT_DENIED:
                'Unexpected result Intent. It might be a result of incorrect integration, make sure you only pass Onfido intent to handleActivityResult. It might be due to unpredictable crash or error. Please report the problem to android-sdk@onfido.com. Intent: null \n resultCode: 0',
        },
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
        PAYPAL: 'payPalMe',
        DEBIT_CARD: 'debitCard',
        BANK_ACCOUNT: 'bankAccount',
    },

    PAYMENT_METHOD_ID_KEYS: {
        DEBIT_CARD: 'fundID',
        BANK_ACCOUNT: 'bankAccountID',
    },

    IOU: {
        // Note: These payment types are used when building IOU reportAction message values in the server and should
        // not be changed.
        PAYMENT_TYPE: {
            ELSEWHERE: 'Elsewhere',
            EXPENSIFY: 'Expensify',
            PAYPAL_ME: 'PayPal.me',
            VBBA: 'ACH',
        },
        MONEY_REQUEST_TYPE: {
            SEND: 'send',
            SPLIT: 'split',
            REQUEST: 'request',
        },
        REPORT_ACTION_TYPE: {
            PAY: 'pay',
            CREATE: 'create',
            SPLIT: 'split',
            DECLINE: 'decline',
            CANCEL: 'cancel',
            DELETE: 'delete',
        },
        AMOUNT_MAX_LENGTH: 10,
        RECEIPT_STATE: {
            SCANREADY: 'SCANREADY',
        },
        FILE_TYPES: {
            HTML: 'html',
            DOC: 'doc',
            DOCX: 'docx',
            SVG: 'svg',
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

    POLICY: {
        TYPE: {
            FREE: 'free',
            PERSONAL: 'personal',
            CORPORATE: 'corporate',
            TEAM: 'team',
        },
        ROLE: {
            ADMIN: 'admin',
            AUDITOR: 'auditor',
            USER: 'user',
        },
        ROOM_PREFIX: '#',
        CUSTOM_UNIT_RATE_BASE_OFFSET: 100,
        OWNER_EMAIL_FAKE: '_FAKE_',
        OWNER_ACCOUNT_ID_FAKE: 0,
    },

    CUSTOM_UNITS: {
        NAME_DISTANCE: 'Distance',
        DISTANCE_UNIT_MILES: 'mi',
        DISTANCE_UNIT_KILOMETERS: 'km',
        MILEAGE_IRS_RATE: 0.655,
        DEFAULT_RATE: 'Default Rate',
    },

    TERMS: {
        CFPB_PREPAID: 'cfpb.gov/prepaid',
        CFPB_COMPLAINT: 'cfpb.gov/complaint',
        FDIC_PREPAID: 'fdic.gov/deposit/deposits/prepaid.html',
        USE_EXPENSIFY_FEES: 'use.expensify.com/fees',
    },

    ICON_TYPE_ICON: 'icon',
    ICON_TYPE_AVATAR: 'avatar',
    ICON_TYPE_WORKSPACE: 'workspace',

    ACTIVITY_INDICATOR_SIZE: {
        LARGE: 'large',
    },

    AVATAR_SIZE: {
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
    AVATAR_ROW_SIZE: {
        DEFAULT: 4,
        LARGE_SCREEN: 8,
    },
    OPTION_MODE: {
        COMPACT: 'compact',
        DEFAULT: 'default',
    },
    REGEX: {
        SPECIAL_CHARS_WITHOUT_NEWLINE: /((?!\n)[()-\s\t])/g,
        DIGITS_AND_PLUS: /^\+?[0-9]*$/,
        ALPHABETIC_AND_LATIN_CHARS: /^[a-zA-ZÀ-ÿ ]*$/,
        NON_ALPHABETIC_AND_NON_LATIN_CHARS: /[^a-zA-ZÀ-ÿ]/g,
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
        PAYPAL_ME_USERNAME: /^[a-zA-Z0-9]{1,20}$/,
        ROOM_NAME: /^#[a-z0-9à-ÿ-]{1,80}$/,

        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJIS: /[\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3/gu,
        TAX_ID: /^\d{9}$/,
        NON_NUMERIC: /\D/g,

        // Extract attachment's source from the data's html string
        ATTACHMENT_DATA: /(data-expensify-source|data-name)="([^"]+)"/g,

        EMOJI_NAME: /:[\w+-]+:/g,
        EMOJI_SUGGESTIONS: /:[a-zA-Z0-9_+-]{1,40}$/,
        AFTER_FIRST_LINE_BREAK: /\n.*/g,
        CODE_2FA: /^\d{6}$/,
        ATTACHMENT_ID: /chat-attachments\/(\d+)/,
        HAS_COLON_ONLY_AT_THE_BEGINNING: /^:[^:]+$/,
        HAS_AT_MOST_TWO_AT_SIGNS: /^@[^@]*@?[^@]*$/,

        SPECIAL_CHAR_OR_EMOJI:
            // eslint-disable-next-line no-misleading-character-class
            /[\n\s,/?"{}[\]()&^%\\;`$=#<>!*\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3/gu,

        SPACE_OR_EMOJI:
            // eslint-disable-next-line no-misleading-character-class
            /(\s+|(?:[\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3)+)/gu,

        // Define the regular expression pattern to match a string starting with an at sign and ending with a space or newline character
        MENTION_REPLACER:
            // eslint-disable-next-line no-misleading-character-class
            /^@[^\n\r]*?(?=$|[\s,/?"{}[\]()&^%\\;`$=#<>!*\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3)/u,

        MERGED_ACCOUNT_PREFIX: /^(MERGED_\d+@)/,

        ROUTES: {
            VALIDATE_LOGIN: /\/v($|(\/\/*))/,
        },
    },

    PRONOUNS: {
        PREFIX: '__predefined_',
        SELF_SELECT: '__predefined_selfSelect',
    },
    GUIDES_CALL_TASK_IDS: {
        CONCIERGE_DM: 'NewExpensifyConciergeDM',
        WORKSPACE_INITIAL: 'WorkspaceHome',
        WORKSPACE_SETTINGS: 'WorkspaceGeneralSettings',
        WORKSPACE_CARD: 'WorkspaceCorporateCards',
        WORKSPACE_REIMBURSE: 'WorkspaceReimburseReceipts',
        WORKSPACE_BILLS: 'WorkspacePayBills',
        WORKSPACE_INVOICES: 'WorkspaceSendInvoices',
        WORKSPACE_TRAVEL: 'WorkspaceBookTravel',
        WORKSPACE_MEMBERS: 'WorkspaceManageMembers',
        WORKSPACE_BANK_ACCOUNT: 'WorkspaceBankAccount',
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
        ];
    },

    // Auth limit is 60k for the column but we store edits and other metadata along the html so let's use a lower limit to accommodate for it.
    MAX_COMMENT_LENGTH: 15000,

    // Furthermore, applying markup is very resource-consuming, so let's set a slightly lower limit for that
    MAX_MARKUP_LENGTH: 10000,

    MAX_THREAD_REPLIES_PREVIEW: 99,

    FORM_CHARACTER_LIMIT: 50,
    LEGAL_NAMES_CHARACTER_LIMIT: 150,
    LOGIN_CHARACTER_LIMIT: 254,
    WORKSPACE_NAME_CHARACTER_LIMIT: 80,
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
        SHARE_CODE: 'shareCode',
        MEMBERS: 'member',
        SETTINGS: 'settings',
        LEAVE_ROOM: 'leaveRoom',
        WELCOME_MESSAGE: 'welcomeMessage',
    },
    EDIT_REQUEST_FIELD: {
        AMOUNT: 'amount',
        DATE: 'date',
        DESCRIPTION: 'description',
    },
    FOOTER: {
        EXPENSE_MANAGEMENT_URL: `${USE_EXPENSIFY_URL}/expense-management`,
        SPEND_MANAGEMENT_URL: `${USE_EXPENSIFY_URL}/spend-management`,
        EXPENSE_REPORTS_URL: `${USE_EXPENSIFY_URL}/expense-reports`,
        COMPANY_CARD_URL: `${USE_EXPENSIFY_URL}/company-credit-card`,
        RECIEPT_SCANNING_URL: `${USE_EXPENSIFY_URL}/receipt-scanning-app`,
        BILL_PAY_URL: `${USE_EXPENSIFY_URL}/bills`,
        INVOICES_URL: `${USE_EXPENSIFY_URL}/invoices`,
        CPA_CARD_URL: `${USE_EXPENSIFY_URL}/cpa-card`,
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

    // When generating a random value to fit in 7 digits (for the `middle` or `right` parts above), this is the maximum value to multiply by Math.random().
    MAX_INT_FOR_RANDOM_7_DIGIT_VALUE: 10000000,
    IOS_KEYBOARD_SPACE_OFFSET: -30,

    PDF_PASSWORD_FORM: {
        // Constants for password-related error responses received from react-pdf.
        REACT_PDF_PASSWORD_RESPONSES: {
            NEED_PASSWORD: 1,
            INCORRECT_PASSWORD: 2,
        },
    },
    TESTING: {
        SCREEN_SIZE: {
            SMALL: {
                width: 300,
                height: 700,
                scale: 1,
                fontScale: 1,
            },
        },
    },
    API_REQUEST_TYPE: {
        READ: 'read',
        WRITE: 'write',
        MAKE_REQUEST_WITH_SIDE_EFFECTS: 'makeRequestWithSideEffects',
    },

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
        EXPECTED_OUTPUT: 'FCFA 123,457',
    },

    PATHS_TO_TREAT_AS_EXTERNAL: ['NewExpensify.dmg'],

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

    PAYPAL_SUPPORTED_CURRENCIES: [
        'AUD',
        'BRL',
        'CAD',
        'CZK',
        'DKK',
        'EUR',
        'HKD',
        'HUF',
        'ILS',
        'JPY',
        'MYR',
        'MXN',
        'TWD',
        'NZD',
        'NOK',
        'PHP',
        'PLN',
        'GBP',
        'RUB',
        'SGD',
        'SEK',
        'CHF',
        'THB',
        'USD',
    ],
    CONCIERGE_TRAVEL_URL: 'https://community.expensify.com/discussion/7066/introducing-concierge-travel',
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
    ACCESSIBILITY_ROLE: {
        BUTTON: 'button',
        LINK: 'link',
        MENUITEM: 'menuitem',
        TEXT: 'text',
        RADIO: 'radio',
        IMAGEBUTTON: 'imagebutton',
        CHECKBOX: 'checkbox',
        SWITCH: 'switch',
        ADJUSTABLE: 'adjustable',
        IMAGE: 'image',
    },
    TRANSLATION_KEYS: {
        ATTACHMENT: 'common.attachment',
    },
    TAB: {
        RECEIPT_TAB_ID: 'ReceiptTab',
        MANUAL: 'manual',
        SCAN: 'scan',
        DISTANCE: 'distance',
    },
};

export default CONST;
