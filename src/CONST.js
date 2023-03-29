import lodashGet from 'lodash/get';
import Config from 'react-native-config';
import * as Url from './libs/Url';

const CLOUDFRONT_DOMAIN = 'cloudfront.net';
const CLOUDFRONT_URL = `https://d2k5nsl2zxldvw.${CLOUDFRONT_DOMAIN}`;
const ACTIVE_EXPENSIFY_URL = Url.addTrailingForwardSlash(lodashGet(Config, 'NEW_EXPENSIFY_URL', 'https://new.expensify.com'));
const USE_EXPENSIFY_URL = 'https://use.expensify.com';
const PLATFORM_OS_MACOS = 'Mac OS';
const ANDROID_PACKAGE_NAME = 'com.expensify.chat';
const USA_COUNTRY_NAME = 'United States';
const CURRENT_YEAR = new Date().getFullYear();

const CONST = {
    ANDROID_PACKAGE_NAME,
    ANIMATED_TRANSITION: 300,
    ANIMATED_TRANSITION_FROM_VALUE: 100,
    ANIMATION_IN_TIMING: 100,

    API_ATTACHMENT_VALIDATIONS: {
        // Same as the PHP layer allows
        ALLOWED_EXTENSIONS: ['webp', 'jpg', 'jpeg', 'png', 'gif', 'pdf', 'html', 'txt', 'rtf', 'doc', 'docx', 'htm', 'tiff', 'tif', 'xml', 'mp3', 'mp4', 'mov'],

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

    CALENDAR_PICKER: {
        // Numbers were arbitrarily picked.
        MIN_YEAR: CURRENT_YEAR - 100,
        MAX_YEAR: CURRENT_YEAR + 100,
    },

    DATE_BIRTH: {
        MIN_AGE: 5,
        MAX_AGE: 150,
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
    },

    NEW_EXPENSIFY_URL: ACTIVE_EXPENSIFY_URL,
    APP_DOWNLOAD_LINKS: {
        ANDROID: `https://play.google.com/store/apps/details?id=${ANDROID_PACKAGE_NAME}`,
        IOS: 'https://apps.apple.com/us/app/expensify-cash/id1530278510',
        DESKTOP: `${ACTIVE_EXPENSIFY_URL}NewExpensify.dmg`,
    },
    DATE: {
        MOMENT_FORMAT_STRING: 'YYYY-MM-DD',
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
        IOU: 'IOU',
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
            shortcutKey: 'I',
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
        CTRL_ENTER: {
            descriptionKey: null,
            shortcutKey: 'Enter',
            modifiers: ['CTRL'],
        },
        COPY: {
            descriptionKey: 'copy',
            shortcutKey: 'C',
            modifiers: ['CTRL'],
        },
        ARROW_UP: {
            descriptionKey: null,
            shortcutKey: 'ArrowUp',
            modifiers: [],
        },
        ARROW_DOWN: {
            descriptionKey: null,
            shortcutKey: 'ArrowDown',
            modifiers: [],
        },
        TAB: {
            descriptionKey: null,
            shortcutKey: 'Tab',
            modifiers: [],
        },
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
    REPORT: {
        DROP_HOST_NAME: 'ReportDropZone',
        DROP_NATIVE_ID: 'report-dropzone',
        ACTIVE_DROP_NATIVE_ID: 'report-dropzone',
        MAXIMUM_PARTICIPANTS: 8,
        ACTIONS: {
            LIMIT: 50,
            TYPE: {
                ADDCOMMENT: 'ADDCOMMENT',
                CLOSED: 'CLOSED',
                CREATED: 'CREATED',
                IOU: 'IOU',
                RENAMED: 'RENAMED',
                CHRONOSOOOLIST: 'CHRONOSOOOLIST',
                POLICYCHANGELOG: {
                    UPDATE_NAME: 'POLICYCHANGELOG_UPDATE_NAME',
                    UPDATE_CURRENCY: 'POLICYCHANGELOG_UPDATE_CURRENCY',
                    UPDATE_OWNERSHIP: 'POLICYCHANGELOG_UPDATE_OWNERSHIP',
                    UPDATE_AUTOHARVESTING: 'POLICYCHANGELOG_UPDATE_AUTOHARVESTING',
                    UPDATE_AUTOREPORTING_FREQUENCY: 'POLICYCHANGELOG_UPDATE_AUTOREPORTING_FREQUENCY',
                    UPDATE_DEFAULT_TITLE_ENFORCED: 'POLICYCHANGELOG_UPDATE_DEFAULT_TITLE_ENFORCED',
                    UPDATE_REPORT_FIELD: 'POLICYCHANGELOG_UPDATE_REPORT_FIELD',
                    ADD_REPORT_FIELD: 'POLICYCHANGELOG_ADD_REPORT_FIELD',
                    DELETE_REPORT_FIELD: 'POLICYCHANGELOG_DELETE_REPORT_FIELD',
                    UPDATE_DEFAULT_TITLE: 'POLICYCHANGELOG_UPDATE_DEFAULT_TITLE',
                    ADD_CATEGORY: 'POLICYCHANGELOG_ADD_CATEGORY',
                    DELETE_CATEGORY: 'POLICYCHANGELOG_DELETE_CATEGORY',
                    SET_CATEGORY_NAME: 'POLICYCHANGELOG_SET_CATEGORY_NAME',
                    UPDATE_CATEGORY: 'POLICYCHANGELOG_UPDATE_CATEGORY',
                    ADD_TAG: 'POLICYCHANGELOG_ADD_TAG',
                    UPDATE_TAG: 'POLICYCHANGELOG_UPDATE_TAG',
                    DELETE_TAG: 'POLICYCHANGELOG_DELETE_TAG',
                    UPDATE_TAG_NAME: 'POLICYCHANGELOG_UPDATE_TAG_NAME',
                    UPDATE_TAG_LIST_NAME: 'POLICYCHANGELOG_UPDATE_TAG_LIST_NAME',
                    IMPORT_TAGS: 'POLICYCHANGELOG_IMPORT_TAGS',
                    DELETE_ALL_TAGS: 'POLICYCHANGELOG_DELETE_ALL_TAGS',
                    ADD_APPROVER_RULE: 'POLICYCHANGELOG_ADD_APPROVER_RULE',
                    UPDATE_APPROVER_RULE: 'POLICYCHANGELOG_UPDATE_APPROVER_RULE',
                    DELETE_APPROVER_RULE: 'POLICYCHANGELOG_DELETE_APPROVER_RULE',
                    ADD_EMPLOYEE: 'POLICYCHANGELOG_ADD_EMPLOYEE',
                    DELETE_EMPLOYEE: 'POLICYCHANGELOG_DELETE_EMPLOYEE',
                    UPDATE_EMPLOYEE: 'POLICYCHANGELOG_UPDATE_EMPLOYEE',
                    SET_AUTO_JOIN: 'POLICYCHANGELOG_SET_AUTO_JOIN',
                    ADD_INTEGRATION: 'POLICYCHANGELOG_ADD_INTEGRATION',
                    DELETE_INTEGRATION: 'POLICYCHANGELOG_DELETE_INTEGRATION',
                    UPDATE_ACH_ACCOUNT: 'POLICYCHANGELOG_UPDATE_ACH_ACCOUNT',
                    UPDATE_REIMBURSEMENT_CHOICE: 'POLICYCHANGELOG_UPDATE_REIMBURSEMENT_CHOICE',
                    SET_AUTOREIMBURSEMENT: 'POLICYCHANGELOG_SET_AUTOREIMBURSEMENT',
                    ADD_CUSTOM_UNIT: 'POLICYCHANGELOG_ADD_CUSTOM_UNIT',
                    DELETE_CUSTOM_UNIT: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT',
                    UPDATE_CUSTOM_UNIT: 'POLICYCHANGELOG_UPDATE_CUSTOM_UNIT',
                    UPDATE_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_UPDATE_CUSTOM_UNIT_RATE',
                    ADD_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_ADD_CUSTOM_UNIT_RATE',
                    DELETE_CUSTOM_UNIT_RATE: 'POLICYCHANGELOG_DELETE_CUSTOM_UNIT_RATE',
                    UPDATE_FIELD: 'POLICYCHANGELOG_UPDATE_FIELD',
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
            IOU: 'iou',
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
        },
        STATE_NUM: {
            OPEN: 0,
            PROCESSING: 1,
            SUBMITTED: 2,
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
        SWITCH_REPORT: 'switch_report',
        SIDEBAR_LOADED: 'sidebar_loaded',
        COLD: 'cold',
        WARM: 'warm',
        REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME: 1500,
        SHOW_LOADING_SPINNER_DEBOUNCE_TIME: 250,
        TOOLTIP_SENSE: 1000,
        TRIE_INITIALIZATION: 'trie_initialization',
        COMMENT_LENGTH_DEBOUNCE_TIME: 500,
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    JSON_CODE: {
        SUCCESS: 200,
        NOT_AUTHENTICATED: 407,
        EXP_ERROR: 666,
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
    },
    ERROR_TYPE: {
        SOCKET: 'Expensify\\Auth\\Error\\Socket',
    },
    ERROR_TITLE: {
        SOCKET: 'Issue connecting to database',
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
        COMMAND: {
            RECONNECT_APP: 'ReconnectApp',
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
        PLAID_THROTTLED: 'private_throttledHistory_openPlaidBankAccountSelector',
        PREFERRED_LOCALE: 'preferredLocale',
        KYC_MIGRATION: 'expensify_migration_2020_04_28_RunKycVerifications',
        PREFERRED_EMOJI_SKIN_TONE: 'expensify_preferredEmojiSkinTone',
        FREQUENTLY_USED_EMOJIS: 'expensify_frequentlyUsedEmojis',
        PUSH_NOTIFICATIONS_ENABLED: 'pushNotificationsEnabled',
    },
    DEFAULT_TIME_ZONE: {automatic: true, selected: 'America/Los_Angeles'},
    DEFAULT_ACCOUNT_DATA: {errors: null, success: '', isLoading: false},
    DEFAULT_CLOSE_ACCOUNT_DATA: {error: '', success: '', isLoading: false},
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
    VALIDATE_FOR_HTML_TAG_REGEX: /<(.|\n)*?>/g,

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

    KEYBOARD_TYPE: {
        PHONE_PAD: 'phone-pad',
        NUMBER_PAD: 'number-pad',
        DECIMAL_PAD: 'decimal-pad',
        VISIBLE_PASSWORD: 'visible-password',
        EMAIL_ADDRESS: 'email-address',
        ASCII_CAPABLE: 'ascii-capable',
        URL: 'url',
    },

    ATTACHMENT_MESSAGE_TEXT: '[Attachment]',
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
    NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT: 256,
    EMOJI_PICKER_ITEM_HEIGHT: 32,
    EMOJI_PICKER_HEADER_HEIGHT: 32,
    RECIPIENT_LOCAL_TIME_HEIGHT: 25,
    EMOJI_SUGGESTER: {
        SUGGESTER_PADDING: 6,
        ITEM_HEIGHT: 36,
        SMALL_CONTAINER_HEIGHT_FACTOR: 2.5,
        MIN_AMOUNT_OF_ITEMS: 3,
        MAX_AMOUNT_OF_ITEMS: 5,
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
        GUIDES_DOMAIN: 'team.expensify.com',
    },

    ENVIRONMENT: {
        DEV: 'development',
        STAGING: 'staging',
        PRODUCTION: 'production',
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
            USER_CAMERA_CONSENT_DENIED: 'Unexpected result Intent. It might be a result of incorrect integration, make sure you only pass Onfido intent to handleActivityResult. It might be due to unpredictable crash or error. Please report the problem to android-sdk@onfido.com. Intent: null \n resultCode: 0',
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
        },
        IOU_TYPE: {
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
    },

    CUSTOM_UNITS: {
        NAME_DISTANCE: 'Distance',
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
    },
    OPTION_MODE: {
        COMPACT: 'compact',
        DEFAULT: 'default',
    },
    REGEX: {
        SPECIAL_CHARS_WITHOUT_NEWLINE: /((?!\n)[()-\s\t])/g,
        US_PHONE: /^\+1\d{10}$/,
        US_PHONE_WITH_OPTIONAL_COUNTRY_CODE: /^(\+1)?\d{10}$/,
        DIGITS_AND_PLUS: /^\+?[0-9]*$/,
        PHONE_E164_PLUS: /^\+?[1-9]\d{1,14}$/,
        PHONE_WITH_SPECIAL_CHARS: /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/,
        ALPHABETIC_CHARS: /[a-zA-Z]+/,
        ALPHABETIC_CHARS_WITH_NUMBER: /^[a-zA-Z0-9 ]*$/,
        POSITIVE_INTEGER: /^\d+$/,
        NON_ALPHA_NUMERIC: /[^A-Za-z0-9+]/g,
        PO_BOX: /\b[P|p]?(OST|ost)?\.?\s*[O|o|0]?(ffice|FFICE)?\.?\s*[B|b][O|o|0]?[X|x]?\.?\s+[#]?(\d+)\b/,
        ANY_VALUE: /^.+$/,
        ZIP_CODE: /[0-9]{5}(?:[- ][0-9]{4})?/,
        INDUSTRY_CODE: /^[0-9]{6}$/,
        SSN_LAST_FOUR: /^(?!0000)[0-9]{4}$/,
        SSN_FULL_NINE: /^(?!0000)[0-9]{9}$/,
        NUMBER: /^[0-9]+$/,
        CARD_NUMBER: /^[0-9]{15,16}$/,
        CARD_SECURITY_CODE: /^[0-9]{3,4}$/,
        CARD_EXPIRATION_DATE: /^(0[1-9]|1[0-2])([^0-9])?([0-9]{4}|([0-9]{2}))$/,
        PAYPAL_ME_USERNAME: /^[a-zA-Z0-9]+$/,
        ROOM_NAME: /^#[a-z0-9-]{1,80}$/,

        WEBSITE: /^((https?|ftp):\/\/)(([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(#[-a-z\d_]*)?$/i,

        // eslint-disable-next-line max-len, no-misleading-character-class
        EMOJIS: /[\p{Extended_Pictographic}\u200d\u{1f1e6}-\u{1f1ff}\u{1f3fb}-\u{1f3ff}\u{e0020}-\u{e007f}\u20E3\uFE0F]|[#*0-9]\uFE0F?\u20E3/gu,
        TAX_ID: /^\d{9}$/,
        NON_NUMERIC: /\D/g,

        // Extract attachment's source from the data's html string
        ATTACHMENT_DATA: /(data-expensify-source|data-name)="([^"]+)"/g,

        NON_NUMERIC_WITH_PLUS: /[^0-9+]/g,
        EMOJI_NAME: /:[\w+-]+:/g,
        EMOJI_SUGGESTIONS: /:[a-zA-Z0-9_+-]{1,40}$/,
        AFTER_FIRST_LINE_BREAK: /\n.*/g,
        CODE_2FA: /^\d{6}$/,
        ATTACHMENT_ID: /chat-attachments\/(\d+)/,
        HAS_COLON_ONLY_AT_THE_BEGINNING: /^:[^:]+$/,
        NEW_LINE_OR_WHITE_SPACE: /[\n\s]/g,

        // Define the regular expression pattern to match a string starting with a colon and ending with a space or newline character
        EMOJI_REPLACER: /^:[^\n\r]+?(?=$|\s)/,
        MERGED_ACCOUNT_PREFIX: /^(MERGED_\d+@)/,
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

    // Auth limit is 60k for the column but we store edits and other metadata along the html so let's use a lower limit to accommodate for it.
    MAX_COMMENT_LENGTH: 15000,

    // Furthermore, applying markup is very resource-consuming, so let's set a slightly lower limit for that
    MAX_MARKUP_LENGTH: 10000,

    FORM_CHARACTER_LIMIT: 50,
    LEGAL_NAMES_CHARACTER_LIMIT: 150,
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

    ONYX: {
        METHOD: {
            MERGE: 'merge',
            SET: 'set',
        },
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
        SETTINGS: 'settings',
        INVITE: 'invite',
        LEAVE_ROOM: 'leaveRoom',
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
        ABOUT_URL: 'https://we.are.expensify.com/',
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
                width: 300, height: 700, scale: 1, fontScale: 1,
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
            types: [
                '👍🏿',
                '👍🏾',
                '👍🏽',
                '👍🏼',
                '👍🏻',
            ],
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

    USA_COUNTRY_NAME,
    SPACE_LENGTH: 1,
    SPACE: 1,
    ALL_COUNTRIES: {
        AC: 'Ascension Island',
        AD: 'Andorra',
        AE: 'United Arab Emirates',
        AF: 'Afghanistan',
        AG: 'Antigua & Barbuda',
        AI: 'Anguilla',
        AL: 'Albania',
        AM: 'Armenia',
        AO: 'Angola',
        AQ: 'Antarctica',
        AR: 'Argentina',
        AS: 'American Samoa',
        AT: 'Austria',
        AU: 'Australia',
        AW: 'Aruba',
        AX: 'Åland Islands',
        AZ: 'Azerbaijan',
        BA: 'Bosnia & Herzegovina',
        BB: 'Barbados',
        BD: 'Bangladesh',
        BE: 'Belgium',
        BF: 'Burkina Faso',
        BG: 'Bulgaria',
        BH: 'Bahrain',
        BI: 'Burundi',
        BJ: 'Benin',
        BL: 'St. Barthélemy',
        BM: 'Bermuda',
        BN: 'Brunei',
        BO: 'Bolivia',
        BQ: 'Caribbean Netherlands',
        BR: 'Brazil',
        BS: 'Bahamas',
        BT: 'Bhutan',
        BW: 'Botswana',
        BY: 'Belarus',
        BZ: 'Belize',
        CA: 'Canada',
        CC: 'Cocos (Keeling) Islands',
        CD: 'Congo - Kinshasa',
        CF: 'Central African Republic',
        CG: 'Congo - Brazzaville',
        CH: 'Switzerland',
        CI: 'Côte d’Ivoire',
        CK: 'Cook Islands',
        CL: 'Chile',
        CM: 'Cameroon',
        CN: 'China',
        CO: 'Colombia',
        CR: 'Costa Rica',
        CU: 'Cuba',
        CV: 'Cape Verde',
        CW: 'Curaçao',
        CX: 'Christmas Island',
        CY: 'Cyprus',
        CZ: 'Czechia',
        DE: 'Germany',
        DG: 'Diego Garcia',
        DJ: 'Djibouti',
        DK: 'Denmark',
        DM: 'Dominica',
        DO: 'Dominican Republic',
        DZ: 'Algeria',
        EA: 'Ceuta & Melilla',
        EC: 'Ecuador',
        EE: 'Estonia',
        EG: 'Egypt',
        EH: 'Western Sahara',
        ER: 'Eritrea',
        ES: 'Spain',
        ET: 'Ethiopia',
        EZ: 'Eurozone',
        FI: 'Finland',
        FJ: 'Fiji',
        FK: 'Falkland Islands',
        FM: 'Micronesia',
        FO: 'Faroe Islands',
        FR: 'France',
        GA: 'Gabon',
        GB: 'United Kingdom',
        GD: 'Grenada',
        GE: 'Georgia',
        GF: 'French Guiana',
        GG: 'Guernsey',
        GH: 'Ghana',
        GI: 'Gibraltar',
        GL: 'Greenland',
        GM: 'Gambia',
        GN: 'Guinea',
        GP: 'Guadeloupe',
        GQ: 'Equatorial Guinea',
        GR: 'Greece',
        GS: 'South Georgia & South Sandwich Islands',
        GT: 'Guatemala',
        GU: 'Guam',
        GW: 'Guinea-Bissau',
        GY: 'Guyana',
        HK: 'Hong Kong',
        HN: 'Honduras',
        HR: 'Croatia',
        HT: 'Haiti',
        HU: 'Hungary',
        IC: 'Canary Islands',
        ID: 'Indonesia',
        IE: 'Ireland',
        IL: 'Israel',
        IM: 'Isle of Man',
        IN: 'India',
        IO: 'British Indian Ocean Territory',
        IQ: 'Iraq',
        IR: 'Iran',
        IS: 'Iceland',
        IT: 'Italy',
        JE: 'Jersey',
        JM: 'Jamaica',
        JO: 'Jordan',
        JP: 'Japan',
        KE: 'Kenya',
        KG: 'Kyrgyzstan',
        KH: 'Cambodia',
        KI: 'Kiribati',
        KM: 'Comoros',
        KN: 'St. Kitts & Nevis',
        KP: 'North Korea',
        KR: 'South Korea',
        KW: 'Kuwait',
        KY: 'Cayman Islands',
        KZ: 'Kazakhstan',
        LA: 'Laos',
        LB: 'Lebanon',
        LC: 'St. Lucia',
        LI: 'Liechtenstein',
        LK: 'Sri Lanka',
        LR: 'Liberia',
        LS: 'Lesotho',
        LT: 'Lithuania',
        LU: 'Luxembourg',
        LV: 'Latvia',
        LY: 'Libya',
        MA: 'Morocco',
        MC: 'Monaco',
        MD: 'Moldova',
        ME: 'Montenegro',
        MF: 'St. Martin',
        MG: 'Madagascar',
        MH: 'Marshall Islands',
        MK: 'Macedonia',
        ML: 'Mali',
        MM: 'Myanmar (Burma)',
        MN: 'Mongolia',
        MO: 'Macau',
        MP: 'Northern Mariana Islands',
        MQ: 'Martinique',
        MR: 'Mauritania',
        MS: 'Montserrat',
        MT: 'Malta',
        MU: 'Mauritius',
        MV: 'Maldives',
        MW: 'Malawi',
        MX: 'Mexico',
        MY: 'Malaysia',
        MZ: 'Mozambique',
        NA: 'Namibia',
        NC: 'New Caledonia',
        NE: 'Niger',
        NF: 'Norfolk Island',
        NG: 'Nigeria',
        NI: 'Nicaragua',
        NL: 'Netherlands',
        NO: 'Norway',
        NP: 'Nepal',
        NR: 'Nauru',
        NU: 'Niue',
        NZ: 'New Zealand',
        OM: 'Oman',
        PA: 'Panama',
        PE: 'Peru',
        PF: 'French Polynesia',
        PG: 'Papua New Guinea',
        PH: 'Philippines',
        PK: 'Pakistan',
        PL: 'Poland',
        PM: 'St. Pierre & Miquelon',
        PN: 'Pitcairn Islands',
        PR: 'Puerto Rico',
        PS: 'Palestinian Territories',
        PT: 'Portugal',
        PW: 'Palau',
        PY: 'Paraguay',
        QA: 'Qatar',
        RE: 'Réunion',
        RO: 'Romania',
        RS: 'Serbia',
        RU: 'Russia',
        RW: 'Rwanda',
        SA: 'Saudi Arabia',
        SB: 'Solomon Islands',
        SC: 'Seychelles',
        SD: 'Sudan',
        SE: 'Sweden',
        SG: 'Singapore',
        SH: 'St. Helena',
        SI: 'Slovenia',
        SJ: 'Svalbard & Jan Mayen',
        SK: 'Slovakia',
        SL: 'Sierra Leone',
        SM: 'San Marino',
        SN: 'Senegal',
        SO: 'Somalia',
        SR: 'Suriname',
        SS: 'South Sudan',
        ST: 'São Tomé & Príncipe',
        SV: 'El Salvador',
        SX: 'Sint Maarten',
        SY: 'Syria',
        SZ: 'Swaziland',
        TA: 'Tristan da Cunha',
        TC: 'Turks & Caicos Islands',
        TD: 'Chad',
        TF: 'French Southern Territories',
        TG: 'Togo',
        TH: 'Thailand',
        TJ: 'Tajikistan',
        TK: 'Tokelau',
        TL: 'Timor-Leste',
        TM: 'Turkmenistan',
        TN: 'Tunisia',
        TO: 'Tonga',
        TR: 'Turkey',
        TT: 'Trinidad & Tobago',
        TV: 'Tuvalu',
        TW: 'Taiwan',
        TZ: 'Tanzania',
        UA: 'Ukraine',
        UG: 'Uganda',
        UM: 'U.S. Outlying Islands',
        UN: 'United Nations',
        US: 'United States',
        UY: 'Uruguay',
        UZ: 'Uzbekistan',
        VA: 'Vatican City',
        VC: 'St. Vincent & Grenadines',
        VE: 'Venezuela',
        VG: 'British Virgin Islands',
        VI: 'U.S. Virgin Islands',
        VN: 'Vietnam',
        VU: 'Vanuatu',
        WF: 'Wallis & Futuna',
        WS: 'Samoa',
        XK: 'Kosovo',
        YE: 'Yemen',
        YT: 'Mayotte',
        ZA: 'South Africa',
        ZM: 'Zambia',
        ZW: 'Zimbabwe',
    },

    // Values for checking if polyfill is required on a platform
    POLYFILL_TEST: {
        STYLE: 'currency',
        CURRENCY: 'XAF',
        FORMAT: 'symbol',
        SAMPLE_INPUT: '123456.789',
        EXPECTED_OUTPUT: 'FCFA 123,457',
    },
};

export default CONST;
