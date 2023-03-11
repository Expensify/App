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

    // Sources: https://github.com/Expensify/App/issues/14958#issuecomment-1442138427
    // https://github.com/Expensify/App/issues/14958#issuecomment-1456026810
    ALL_COUNTRIES: {
        AC: {
            countryName: 'Ascension Island',
            zipRegex: /^ASCN 1ZZ$/,
            zipSample: 'ASCN 1ZZ',
        },
        AD: {
            countryName: 'Andorra',
            zipRegex: /^AD[1-7]0\d$/,
            zipSample: 'AD206, AD403, AD106, AD406',
        },
        AE: {
            countryName: 'United Arab Emirates',
        },
        AF: {
            countryName: 'Afghanistan',
            zipRegex: /^\d{4}$/,
            zipSample: '9536, 1476, 3842, 7975',
        },
        AG: {
            countryName: 'Antigua & Barbuda',
        },
        AI: {
            countryName: 'Anguilla',
            zipRegex: /^AI-2640$/,
            zipSample: 'AI-2640',
        },
        AL: {
            countryName: 'Albania',
            zipRegex: /^\d{4}$/,
            zipSample: '1631, 9721, 2360, 5574',
        },
        AM: {
            countryName: 'Armenia',
            zipRegex: /^\d{4}$/,
            zipSample: '5581, 7585, 8434, 2492',
        },
        AO: {
            countryName: 'Angola',
        },
        AQ: {
            countryName: 'Antarctica',
        },
        AR: {
            countryName: 'Argentina',
            zipRegex: /^((?:[A-HJ-NP-Z])?\d{4})([A-Z]{3})?$/,
            zipSample: 'Q7040GFQ, K2178ZHR, P6240EJG, J6070IAE',
        },
        AS: {
            countryName: 'American Samoa',
            zipRegex: /^96799$/,
            zipSample: '96799',
        },
        AT: {
            countryName: 'Austria',
            zipRegex: /^\d{4}$/,
            zipSample: '4223, 2052, 3544, 5488',
        },
        AU: {
            countryName: 'Australia',
            zipRegex: /^\d{4}$/,
            zipSample: '7181, 7735, 9169, 8780',
        },
        AW: {
            countryName: 'Aruba',
        },
        AX: {
            countryName: 'Åland Islands',
            zipRegex: /^22\d{3}$/,
            zipSample: '22270, 22889, 22906, 22284',
        },
        AZ: {
            countryName: 'Azerbaijan',
            zipRegex: /^(AZ) (\d{4})$/,
            zipSample: 'AZ 6704, AZ 5332, AZ 3907, AZ 6892',
        },
        BA: {
            countryName: 'Bosnia & Herzegovina',
            zipRegex: /^\d{5}$/,
            zipSample: '62722, 80420, 44595, 74614',
        },
        BB: {
            countryName: 'Barbados',
            zipRegex: /^BB\d{5}$/,
            zipSample: 'BB64089, BB17494, BB73163, BB25752',
        },
        BD: {
            countryName: 'Bangladesh',
            zipRegex: /^\d{4}$/,
            zipSample: '8585, 8175, 7381, 0154',
        },
        BE: {
            countryName: 'Belgium',
            zipRegex: /^\d{4}$/,
            zipSample: '7944, 5303, 6746, 7921',
        },
        BF: {
            countryName: 'Burkina Faso',
        },
        BG: {
            countryName: 'Bulgaria',
            zipRegex: /^\d{4}$/,
            zipSample: '6409, 7657, 1206, 7908',
        },
        BH: {
            countryName: 'Bahrain',
            zipRegex: /^\d{3}\d?$/,
            zipSample: '047, 1116, 490, 631',
        },
        BI: {
            countryName: 'Burundi',
        },
        BJ: {
            countryName: 'Benin',
        },
        BL: {
            countryName: 'Saint Barthélemy',
            zipRegex: /^97133$/,
            zipSample: '97133',
        },
        BM: {
            countryName: 'Bermuda',
            zipRegex: /^[A-Z]{2} ?[A-Z0-9]{2}$/,
            zipSample: 'QV9P, OSJ1, PZ 3D, GR YK',
        },
        BN: {
            countryName: 'Brunei',
            zipRegex: /^[A-Z]{2} ?\d{4}$/,
            zipSample: 'PF 9925, TH1970, SC 4619, NF0781',
        },
        BO: {
            countryName: 'Bolivia',
        },
        BQ: {
            countryName: 'Caribbean Netherlands',
        },
        BR: {
            countryName: 'Brazil',
            zipRegex: /^\d{5}-?\d{3}$/,
            zipSample: '18816-403, 95177-465, 43447-782, 39403-136',
        },
        BS: {
            countryName: 'Bahamas',
        },
        BT: {
            countryName: 'Bhutan',
            zipRegex: /^\d{5}$/,
            zipSample: '28256, 52484, 30608, 93524',
        },
        BW: {
            countryName: 'Botswana',
        },
        BY: {
            countryName: 'Belarus',
            zipRegex: /^\d{6}$/,
            zipSample: '504154, 360246, 741167, 895047',
        },
        BZ: {
            countryName: 'Belize',
        },
        CA: {
            countryName: 'Canada',
            zipRegex: /^[ABCEGHJKLMNPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] ?\d[ABCEGHJ-NPRSTV-Z]\d$/,
            zipSample: 'S1A7K8, Y5H 4G6, H9V0P2, H1A1B5',
        },
        CC: {
            countryName: 'Cocos (Keeling) Islands',
            zipRegex: /^6799$/,
            zipSample: '6799',
        },
        CD: {
            countryName: 'Congo - Kinshasa',
        },
        CF: {
            countryName: 'Central African Republic',
        },
        CG: {
            countryName: 'Congo - Brazzaville',
        },
        CH: {
            countryName: 'Switzerland',
            zipRegex: /^\d{4}$/,
            zipSample: '6370, 5271, 7873, 8220',
        },
        CI: {
            countryName: 'Côte d’Ivoire',
        },
        CK: {
            countryName: 'Cook Islands',
        },
        CL: {
            countryName: 'Chile',
            zipRegex: /^\d{7}$/,
            zipSample: '7565829, 8702008, 3161669, 1607703',
        },
        CM: {
            countryName: 'Cameroon',
        },
        CN: {
            countryName: 'China',
            zipRegex: /^\d{6}$/,
            zipSample: '240543, 870138, 295528, 861683',
        },
        CO: {
            countryName: 'Colombia',
            zipRegex: /^\d{6}$/,
            zipSample: '678978, 775145, 823943, 913970',
        },
        CR: {
            countryName: 'Costa Rica',
            zipRegex: /^\d{5}$/,
            zipSample: '28256, 52484, 30608, 93524',
        },
        CU: {
            countryName: 'Cuba',
            zipRegex: /^(?:CP)?(\d{5})$/,
            zipSample: '28256, 52484, 30608, 93524',
        },
        CV: {
            countryName: 'Cape Verde',
            zipRegex: /^\d{4}$/,
            zipSample: '9056, 8085, 0491, 4627',
        },
        CW: {
            countryName: 'Curaçao',
        },
        CX: {
            countryName: 'Christmas Island',
            zipRegex: /^6798$/,
            zipSample: '6798',
        },
        CY: {
            countryName: 'Cyprus',
            zipRegex: /^\d{4}$/,
            zipSample: '9301, 2478, 1981, 6162',
        },
        CZ: {
            countryName: 'Czech Republic',
            zipRegex: /^\d{3} ?\d{2}$/,
            zipSample: '150 56, 50694, 229 08, 82811',
        },
        DE: {
            countryName: 'Germany',
            zipRegex: /^\d{5}$/,
            zipSample: '33185, 37198, 81711, 44262',
        },
        DJ: {
            countryName: 'Djibouti',
        },
        DK: {
            countryName: 'Denmark',
            zipRegex: /^\d{4}$/,
            zipSample: '1429, 2457, 0637, 5764',
        },
        DM: {
            countryName: 'Dominica',
        },
        DO: {
            countryName: 'Dominican Republic',
            zipRegex: /^\d{5}$/,
            zipSample: '11877, 95773, 93875, 98032',
        },
        DZ: {
            countryName: 'Algeria',
            zipRegex: /^\d{5}$/,
            zipSample: '26581, 64621, 57550, 72201',
        },
        EC: {
            countryName: 'Ecuador',
            zipRegex: /^\d{6}$/,
            zipSample: '541124, 873848, 011495, 334509',
        },
        EE: {
            countryName: 'Estonia',
            zipRegex: /^\d{5}$/,
            zipSample: '87173, 01127, 73214, 52381',
        },
        EG: {
            countryName: 'Egypt',
            zipRegex: /^\d{5}$/,
            zipSample: '98394, 05129, 91463, 77359',
        },
        EH: {
            countryName: 'Western Sahara',
            zipRegex: /^\d{5}$/,
            zipSample: '30577, 60264, 16487, 38593',
        },
        ER: {
            countryName: 'Eritrea',
        },
        ES: {
            countryName: 'Spain',
            zipRegex: /^\d{5}$/,
            zipSample: '03315, 00413, 23179, 89324',
        },
        ET: {
            countryName: 'Ethiopia',
            zipRegex: /^\d{4}$/,
            zipSample: '6269, 8498, 4514, 7820',
        },
        FI: {
            countryName: 'Finland',
            zipRegex: /^\d{5}$/,
            zipSample: '21859, 72086, 22422, 03774',
        },
        FJ: {
            countryName: 'Fiji',
        },
        FK: {
            countryName: 'Falkland Islands',
            zipRegex: /^FIQQ 1ZZ$/,
            zipSample: 'FIQQ 1ZZ',
        },
        FM: {
            countryName: 'Micronesia',
            zipRegex: /^(9694[1-4])(?:[ -](\d{4}))?$/,
            zipSample: '96942-9352, 96944-4935, 96941 9065, 96943-5369',
        },
        FO: {
            countryName: 'Faroe Islands',
            zipRegex: /^\d{3}$/,
            zipSample: '334, 068, 741, 787',
        },
        FR: {
            countryName: 'France',
            zipRegex: /^\d{2} ?\d{3}$/,
            zipSample: '25822, 53 637, 55354, 82522',
        },
        GA: {
            countryName: 'Gabon',
        },
        GB: {
            countryName: 'United Kingdom',
            zipRegex: /^[A-Z]{1,2}[0-9R][0-9A-Z]?\s*[0-9][A-Z-CIKMOV]{2}$/,
            zipSample: 'LA102UX, BL2F8FX, BD1S9LU, WR4G 6LH',
        },
        GD: {
            countryName: 'Grenada',
        },
        GE: {
            countryName: 'Georgia',
            zipRegex: /^\d{4}$/,
            zipSample: '1232, 9831, 4717, 9428',
        },
        GF: {
            countryName: 'French Guiana',
            zipRegex: /^9[78]3\d{2}$/,
            zipSample: '98380, 97335, 98344, 97300',
        },
        GG: {
            countryName: 'Guernsey',
            zipRegex: /^GY\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}$/,
            zipSample: 'GY757LD, GY6D 6XL, GY3Y2BU, GY85 1YO',
        },
        GH: {
            countryName: 'Ghana',
        },
        GI: {
            countryName: 'Gibraltar',
            zipRegex: /^GX11 1AA$/,
            zipSample: 'GX11 1AA',
        },
        GL: {
            countryName: 'Greenland',
            zipRegex: /^39\d{2}$/,
            zipSample: '3964, 3915, 3963, 3956',
        },
        GM: {
            countryName: 'Gambia',
        },
        GN: {
            countryName: 'Guinea',
            zipRegex: /^\d{3}$/,
            zipSample: '465, 994, 333, 078',
        },
        GP: {
            countryName: 'Guadeloupe',
            zipRegex: /^9[78][01]\d{2}$/,
            zipSample: '98069, 97007, 97147, 97106',
        },
        GQ: {
            countryName: 'Equatorial Guinea',
        },
        GR: {
            countryName: 'Greece',
            zipRegex: /^\d{3} ?\d{2}$/,
            zipSample: '98654, 319 78, 127 09, 590 52',
        },
        GS: {
            countryName: 'South Georgia & South Sandwich Islands',
            zipRegex: /^SIQQ 1ZZ$/,
            zipSample: 'SIQQ 1ZZ',
        },
        GT: {
            countryName: 'Guatemala',
            zipRegex: /^\d{5}$/,
            zipSample: '30553, 69925, 09376, 83719',
        },
        GU: {
            countryName: 'Guam',
            zipRegex: /^((969)[1-3][0-2])$/,
            zipSample: '96922, 96932, 96921, 96911',
        },
        GW: {
            countryName: 'Guinea-Bissau',
            zipRegex: /^\d{4}$/,
            zipSample: '1742, 7941, 4437, 7728',
        },
        GY: {
            countryName: 'Guyana',
        },
        HK: {
            countryName: 'Hong Kong',
            zipRegex: /^999077$|^$/,
            zipSample: '999077, empty',
        },
        HN: {
            countryName: 'Honduras',
            zipRegex: /^\d{5}$/,
            zipSample: '86238, 78999, 03594, 30406',
        },
        HR: {
            countryName: 'Croatia',
            zipRegex: /^\d{5}$/,
            zipSample: '85240, 80710, 78235, 98766',
        },
        HT: {
            countryName: 'Haiti',
            zipRegex: /^(?:HT)?(\d{4})$/,
            zipSample: '5101, HT6991, HT3871, 1126',
        },
        HU: {
            countryName: 'Hungary',
            zipRegex: /^\d{4}$/,
            zipSample: '0360, 2604, 3362, 4775',
        },
        ID: {
            countryName: 'Indonesia',
            zipRegex: /^\d{5}$/,
            zipSample: '60993, 52656, 16521, 34931',
        },
        IE: {
            countryName: 'Ireland',
        },
        IL: {
            countryName: 'Israel',
            zipRegex: /^\d{5}(?:\d{2})?$/,
            zipSample: '74213, 6978354, 2441689, 4971551',
        },
        IM: {
            countryName: 'Isle of Man',
            zipRegex: /^IM\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}$/,
            zipSample: 'IM2X1JP, IM4V 9JU, IM3B1UP, IM8E 5XF',
        },
        IN: {
            countryName: 'India',
            zipRegex: /^\d{6}$/,
            zipSample: '946956, 143659, 243258, 938385',
        },
        IO: {
            countryName: 'British Indian Ocean Territory',
            zipRegex: /^BBND 1ZZ$/,
            zipSample: 'BBND 1ZZ',
        },
        IQ: {
            countryName: 'Iraq',
            zipRegex: /^\d{5}$/,
            zipSample: '63282, 87817, 38580, 47725',
        },
        IR: {
            countryName: 'Iran',
            zipRegex: /^\d{5}-?\d{5}$/,
            zipSample: '0666174250, 6052682188, 02360-81920, 25102-08646',
        },
        IS: {
            countryName: 'Iceland',
            zipRegex: /^\d{3}$/,
            zipSample: '408, 013, 001, 936',
        },
        IT: {
            countryName: 'Italy',
            zipRegex: /^\d{5}$/,
            zipSample: '31701, 61341, 92781, 45609',
        },
        JE: {
            countryName: 'Jersey',
            zipRegex: /^JE\d[\dA-Z]? ?\d[ABD-HJLN-UW-Z]{2}$/,
            zipSample: 'JE0D 2EX, JE59 2OF, JE1X1ZW, JE0V 1SO',
        },
        JM: {
            countryName: 'Jamaica',
        },
        JO: {
            countryName: 'Jordan',
            zipRegex: /^\d{5}$/,
            zipSample: '20789, 02128, 52170, 40284',
        },
        JP: {
            countryName: 'Japan',
            zipRegex: /^\d{3}-?\d{4}$/,
            zipSample: '5429642, 046-1544, 6463599, 368-5362',
        },
        KE: {
            countryName: 'Kenya',
            zipRegex: /^\d{5}$/,
            zipSample: '33043, 98830, 59324, 42876',
        },
        KG: {
            countryName: 'Kyrgyzstan',
            zipRegex: /^\d{6}$/,
            zipSample: '500371, 176592, 184133, 225279',
        },
        KH: {
            countryName: 'Cambodia',
            zipRegex: /^\d{5,6}$/,
            zipSample: '220281, 18824, 35379, 09570',
        },
        KI: {
            countryName: 'Kiribati',
            zipRegex: /^KI\d{4}$/,
            zipSample: '36524, 49717, 67606, 96469',
        },
        KM: {
            countryName: 'Comoros',
        },
        KN: {
            countryName: 'St. Kitts & Nevis',
            zipRegex: /^KN\d{4}(-\d{4})?$/,
            zipSample: 'KN2522, KN2560-3032, KN3507, KN4440',
        },
        KP: {
            countryName: 'North Korea',
        },
        KR: {
            countryName: 'South Korea',
            zipRegex: /^\d{5}$/,
            zipSample: '67417, 66648, 08359, 93750',
        },
        KW: {
            countryName: 'Kuwait',
            zipRegex: /^\d{5}$/,
            zipSample: '74840, 53309, 71276, 59262',
        },
        KY: {
            countryName: 'Cayman Islands',
            zipRegex: /^KY\d-\d{4}$/,
            zipSample: 'KY0-3078, KY1-7812, KY8-3729, KY3-4664',
        },
        KZ: {
            countryName: 'Kazakhstan',
            zipRegex: /^\d{6}$/,
            zipSample: '129113, 976562, 226811, 933781',
        },
        LA: {
            countryName: 'Laos',
            zipRegex: /^\d{5}$/,
            zipSample: '08875, 50779, 87756, 75932',
        },
        LB: {
            countryName: 'Lebanon',
            zipRegex: /^(?:\d{4})(?: ?(?:\d{4}))?$/,
            zipSample: '5436 1302, 9830 7470, 76911911, 9453 1306',
        },
        LC: {
            countryName: 'St. Lucia',
            zipRegex: /^(LC)?\d{2} ?\d{3}$/,
            zipSample: '21080, LC99127, LC24 258, 51 740',
        },
        LI: {
            countryName: 'Liechtenstein',
            zipRegex: /^\d{4}$/,
            zipSample: '6644, 2852, 4630, 4541',
        },
        LK: {
            countryName: 'Sri Lanka',
            zipRegex: /^\d{5}$/,
            zipSample: '44605, 27721, 90695, 65514',
        },
        LR: {
            countryName: 'Liberia',
            zipRegex: /^\d{4}$/,
            zipSample: '6644, 2852, 4630, 4541',
        },
        LS: {
            countryName: 'Lesotho',
            zipRegex: /^\d{3}$/,
            zipSample: '779, 803, 104, 897',
        },
        LT: {
            countryName: 'Lithuania',
            zipRegex: /^((LT)[-])?(\d{5})$/,
            zipSample: 'LT-22248, LT-12796, 69822, 37280',
        },
        LU: {
            countryName: 'Luxembourg',
            zipRegex: /^((L)[-])?(\d{4})$/,
            zipSample: '5469, L-4476, 6304, 9739',
        },
        LV: {
            countryName: 'Latvia',
            zipRegex: /^((LV)[-])?\d{4}$/,
            zipSample: '9344, LV-5030, LV-0132, 8097',
        },
        LY: {
            countryName: 'Libya',
        },
        MA: {
            countryName: 'Morocco',
            zipRegex: /^\d{5}$/,
            zipSample: '50219, 95871, 80907, 79804',
        },
        MC: {
            countryName: 'Monaco',
            zipRegex: /^980\d{2}$/,
            zipSample: '98084, 98041, 98070, 98062',
        },
        MD: {
            countryName: 'Moldova',
            zipRegex: /^(MD[-]?)?(\d{4})$/,
            zipSample: '6250, MD-9681, MD3282, MD-0652',
        },
        ME: {
            countryName: 'Montenegro',
            zipRegex: /^\d{5}$/,
            zipSample: '87622, 92688, 23129, 59566',
        },
        MF: {
            countryName: 'St. Martin',
            zipRegex: /^9[78][01]\d{2}$/,
            zipSample: '97169, 98180, 98067, 98043',
        },
        MG: {
            countryName: 'Madagascar',
            zipRegex: /^\d{3}$/,
            zipSample: '854, 084, 524, 064',
        },
        MH: {
            countryName: 'Marshall Islands',
            zipRegex: /^((969)[6-7][0-9])(-\d{4})?/,
            zipSample: '96962, 96969, 96970-8530, 96960-3226',
        },
        MK: {
            countryName: 'Macedonia',
            zipRegex: /^\d{4}$/,
            zipSample: '8299, 6904, 6144, 9753',
        },
        ML: {
            countryName: 'Mali',
        },
        MM: {
            countryName: 'Myanmar (Burma)',
            zipRegex: /^\d{5}$/,
            zipSample: '59188, 93943, 40829, 69981',
        },
        MN: {
            countryName: 'Mongolia',
            zipRegex: /^\d{5}$/,
            zipSample: '94129, 29906, 53374, 80141',
        },
        MO: {
            countryName: 'Macau',
        },
        MP: {
            countryName: 'Northern Mariana Islands',
            zipRegex: /^(9695[012])(?:[ -](\d{4}))?$/,
            zipSample: '96952 3162, 96950 1567, 96951 2994, 96950 8745',
        },
        MQ: {
            countryName: 'Martinique',
            zipRegex: /^9[78]2\d{2}$/,
            zipSample: '98297, 97273, 97261, 98282',
        },
        MR: {
            countryName: 'Mauritania',
        },
        MS: {
            countryName: 'Montserrat',
            zipRegex: /^[Mm][Ss][Rr]\s{0,1}\d{4}$/,
            zipSample: '97263, 97243, 98210, 97213',
        },
        MT: {
            countryName: 'Malta',
            zipRegex: /^[A-Z]{3} [0-9]{4}|[A-Z]{2}[0-9]{2}|[A-Z]{2} [0-9]{2}|[A-Z]{3}[0-9]{4}|[A-Z]{3}[0-9]{2}|[A-Z]{3} [0-9]{2}$/,
            zipSample: 'DKV 8196, KSU9264, QII0259, HKH 1020',
        },
        MU: {
            countryName: 'Mauritius',
            zipRegex: /^([0-9A-R]\d{4})$/,
            zipSample: 'H8310, 52591, M9826, F5810',
        },
        MV: {
            countryName: 'Maldives',
            zipRegex: /^\d{5}$/,
            zipSample: '16354, 20857, 50991, 72527',
        },
        MW: {
            countryName: 'Malawi',
        },
        MX: {
            countryName: 'Mexico',
            zipRegex: /^\d{5}$/,
            zipSample: '71530, 76424, 73811, 50503',
        },
        MY: {
            countryName: 'Malaysia',
            zipRegex: /^\d{5}$/,
            zipSample: '75958, 15826, 86715, 37081',
        },
        MZ: {
            countryName: 'Mozambique',
            zipRegex: /^\d{4}$/,
            zipSample: '0902, 6258, 7826, 7150',
        },
        NA: {
            countryName: 'Namibia',
            zipRegex: /^\d{5}$/,
            zipSample: '68338, 63392, 21820, 61211',
        },
        NC: {
            countryName: 'New Caledonia',
            zipRegex: /^988\d{2}$/,
            zipSample: '98865, 98813, 98820, 98855',
        },
        NE: {
            countryName: 'Niger',
            zipRegex: /^\d{4}$/,
            zipSample: '9790, 3270, 2239, 0400',
        },
        NF: {
            countryName: 'Norfolk Island',
            zipRegex: /^2899$/,
            zipSample: '2899',
        },
        NG: {
            countryName: 'Nigeria',
            zipRegex: /^\d{6}$/,
            zipSample: '289096, 223817, 199970, 840648',
        },
        NI: {
            countryName: 'Nicaragua',
            zipRegex: /^\d{5}$/,
            zipSample: '86308, 60956, 49945, 15470',
        },
        NL: {
            countryName: 'Netherlands',
            zipRegex: /^\d{4} ?[A-Z]{2}$/,
            zipSample: '6998 VY, 5390 CK, 2476 PS, 8873OX',
        },
        NO: {
            countryName: 'Norway',
            zipRegex: /^\d{4}$/,
            zipSample: '0711, 4104, 2683, 5015',
        },
        NP: {
            countryName: 'Nepal',
            zipRegex: /^\d{5}$/,
            zipSample: '42438, 73964, 66400, 33976',
        },
        NR: {
            countryName: 'Nauru',
            zipRegex: /^(NRU68)$/,
            zipSample: 'NRU68',
        },
        NU: {
            countryName: 'Niue',
            zipRegex: /^(9974)$/,
            zipSample: '9974',
        },
        NZ: {
            countryName: 'New Zealand',
            zipRegex: /^\d{4}$/,
            zipSample: '7015, 0780, 4109, 1422',
        },
        OM: {
            countryName: 'Oman',
            zipRegex: /^(?:PC )?\d{3}$/,
            zipSample: 'PC 851, PC 362, PC 598, PC 499',
        },
        PA: {
            countryName: 'Panama',
            zipRegex: /^\d{4}$/,
            zipSample: '0711, 4104, 2683, 5015',
        },
        PE: {
            countryName: 'Peru',
            zipRegex: /^\d{5}$/,
            zipSample: '10013, 12081, 14833, 24615',
        },
        PF: {
            countryName: 'French Polynesia',
            zipRegex: /^987\d{2}$/,
            zipSample: '98755, 98710, 98748, 98791',
        },
        PG: {
            countryName: 'Papua New Guinea',
            zipRegex: /^\d{3}$/,
            zipSample: '193, 166, 880, 553',
        },
        PH: {
            countryName: 'Philippines',
            zipRegex: /^\d{4}$/,
            zipSample: '0137, 8216, 2876, 0876',
        },
        PK: {
            countryName: 'Pakistan',
            zipRegex: /^\d{5}$/,
            zipSample: '78219, 84497, 62102, 12564',
        },
        PL: {
            countryName: 'Poland',
            zipRegex: /^\d{2}-\d{3}$/,
            zipSample: '63-825, 26-714, 05-505, 15-200',
        },
        PM: {
            countryName: 'St. Pierre & Miquelon',
            zipRegex: /^(97500)$/,
            zipSample: '97500',
        },
        PN: {
            countryName: 'Pitcairn Islands',
            zipRegex: /^PCRN 1ZZ$/,
            zipSample: 'PCRN 1ZZ',
        },
        PR: {
            countryName: 'Puerto Rico',
            zipRegex: /^(00[679]\d{2})(?:[ -](\d{4}))?$/,
            zipSample: '00989 3603, 00639 0720, 00707-9803, 00610 7362',
        },
        PS: {
            countryName: 'Palestinian Territories',
            zipRegex: /^(00[679]\d{2})(?:[ -](\d{4}))?$/,
            zipSample: '00748, 00663, 00779-4433, 00934 1559',
        },
        PT: {
            countryName: 'Portugal',
            zipRegex: /^\d{4}-\d{3}$/,
            zipSample: '0060-917, 4391-979, 5551-657, 9961-093',
        },
        PW: {
            countryName: 'Palau',
            zipRegex: /^(969(?:39|40))(?:[ -](\d{4}))?$/,
            zipSample: '96940, 96939, 96939 6004, 96940-1871',
        },
        PY: {
            countryName: 'Paraguay',
            zipRegex: /^\d{4}$/,
            zipSample: '7895, 5835, 8783, 5887',
        },
        QA: {
            countryName: 'Qatar',
        },
        RE: {
            countryName: 'Réunion',
            zipRegex: /^9[78]4\d{2}$/,
            zipSample: '98445, 97404, 98421, 98434',
        },
        RO: {
            countryName: 'Romania',
            zipRegex: /^\d{6}$/,
            zipSample: '935929, 407608, 637434, 174574',
        },
        RS: {
            countryName: 'Serbia',
            zipRegex: /^\d{5,6}$/,
            zipSample: '929863, 259131, 687739, 07011',
        },
        RU: {
            countryName: 'Russia',
            zipRegex: /^\d{6}$/,
            zipSample: '138294, 617323, 307906, 981238',
        },
        RW: {
            countryName: 'Rwanda',
        },
        SA: {
            countryName: 'Saudi Arabia',
            zipRegex: /^\d{5}(-{1}\d{4})?$/,
            zipSample: '86020-12567, 72375, 70280, 96328',
        },
        SB: {
            countryName: 'Solomon Islands',
        },
        SC: {
            countryName: 'Seychelles',
        },
        SD: {
            countryName: 'Sudan',
            zipRegex: /^\d{5}$/,
            zipSample: '78219, 84497, 62102, 12564',
        },
        SE: {
            countryName: 'Sweden',
            zipRegex: /^\d{3} ?\d{2}$/,
            zipSample: '095 39, 41052, 84687, 563 66',
        },
        SG: {
            countryName: 'Singapore',
            zipRegex: /^\d{6}$/,
            zipSample: '606542, 233985, 036755, 265255',
        },
        SH: {
            countryName: 'St. Helena',
            zipRegex: /^(?:ASCN|TDCU|STHL) 1ZZ$/,
            zipSample: 'STHL 1ZZ, ASCN 1ZZ, TDCU 1ZZ',
        },
        SI: {
            countryName: 'Slovenia',
            zipRegex: /^\d{4}$/,
            zipSample: '6898, 3413, 2031, 5732',
        },
        SJ: {
            countryName: 'Svalbard & Jan Mayen',
            zipRegex: /^\d{4}$/,
            zipSample: '7616, 3163, 5769, 0237',
        },
        SK: {
            countryName: 'Slovakia',
            zipRegex: /^\d{3} ?\d{2}$/,
            zipSample: '594 52, 813 34, 867 67, 41814',
        },
        SL: {
            countryName: 'Sierra Leone',
        },
        SM: {
            countryName: 'San Marino',
            zipRegex: /^4789\d$/,
            zipSample: '47894, 47895, 47893, 47899',
        },
        SN: {
            countryName: 'Senegal',
            zipRegex: /^[1-8]\d{4}$/,
            zipSample: '48336, 23224, 33261, 82430',
        },
        SO: {
            countryName: 'Somalia',
        },
        SR: {
            countryName: 'Suriname',
        },
        SS: {
            countryName: 'South Sudan',
            zipRegex: /^[A-Z]{2} ?\d{5}$/,
            zipSample: 'JQ 80186, CU 46474, DE33738, MS 59107',
        },
        ST: {
            countryName: 'São Tomé & Príncipe',
            zipRegex: /^[A-Z]{2} ?\d{5}$/,
            zipSample: '87849, 89861, AG 93268, RC88066',
        },
        SV: {
            countryName: 'El Salvador',
        },
        SX: {
            countryName: 'Sint Maarten',
        },
        SY: {
            countryName: 'Syria',
        },
        SZ: {
            countryName: 'Swaziland',
            zipRegex: /^[HLMS]\d{3}$/,
            zipSample: 'H458, L986, M477, S916',
        },
        TA: {
            countryName: 'Tristan da Cunha',
            zipRegex: /^TDCU 1ZZ$/,
            zipSample: 'TDCU 1ZZ',
        },
        TC: {
            countryName: 'Turks & Caicos Islands',
            zipRegex: /^TKCA 1ZZ$/,
            zipSample: 'TKCA 1ZZ',
        },
        TD: {
            countryName: 'Chad',
        },
        TF: {
            countryName: 'French Southern Territories',
        },
        TG: {
            countryName: 'Togo',
        },
        TH: {
            countryName: 'Thailand',
            zipRegex: /^\d{5}$/,
            zipSample: '30706, 18695, 21044, 42496',
        },
        TJ: {
            countryName: 'Tajikistan',
            zipRegex: /^\d{6}$/,
            zipSample: '381098, 961344, 519925, 667883',
        },
        TK: {
            countryName: 'Tokelau',
        },
        TL: {
            countryName: 'Timor-Leste',
        },
        TM: {
            countryName: 'Turkmenistan',
            zipRegex: /^\d{6}$/,
            zipSample: '544985, 164362, 425224, 374603',
        },
        TN: {
            countryName: 'Tunisia',
            zipRegex: /^\d{4}$/,
            zipSample: '6075, 7340, 2574, 8988',
        },
        TO: {
            countryName: 'Tonga',
        },
        TR: {
            countryName: 'Turkey',
            zipRegex: /^\d{5}$/,
            zipSample: '42524, 81057, 50859, 42677',
        },
        TT: {
            countryName: 'Trinidad & Tobago',
            zipRegex: /^\d{6}$/,
            zipSample: '041238, 033990, 763476, 981118',
        },
        TV: {
            countryName: 'Tuvalu',
        },
        TW: {
            countryName: 'Taiwan',
            zipRegex: /^\d{3}(?:\d{2})?$/,
            zipSample: '21577, 76068, 68698, 08912',
        },
        TZ: {
            countryName: 'Tanzania',
        },
        UA: {
            countryName: 'Ukraine',
            zipRegex: /^\d{5}$/,
            zipSample: '10629, 81138, 15668, 30055',
        },
        UG: {
            countryName: 'Uganda',
        },
        UM: {
            countryName: 'U.S. Outlying Islands',
        },
        US: {
            countryName: 'United States',
            zipRegex: /^[0-9]{5}(?:[- ][0-9]{4})?$/,
            zipSample: '12345, 12345-1234, 12345 1234',
        },
        UY: {
            countryName: 'Uruguay',
            zipRegex: /^\d{5}$/,
            zipSample: '40073, 30136, 06583, 00021',
        },
        UZ: {
            countryName: 'Uzbekistan',
            zipRegex: /^\d{6}$/,
            zipSample: '205122, 219713, 441699, 287471',
        },
        VA: {
            countryName: 'Vatican City',
            zipRegex: /^(00120)$/,
            zipSample: '00120',
        },
        VC: {
            countryName: 'St. Vincent & Grenadines',
            zipRegex: /^VC\d{4}$/,
            zipSample: 'VC0600, VC0176, VC0616, VC4094',
        },
        VE: {
            countryName: 'Venezuela',
            zipRegex: /^\d{4}$/,
            zipSample: '9692, 1953, 6680, 8302',
        },
        VG: {
            countryName: 'British Virgin Islands',
            zipRegex: /^VG\d{4}$/,
            zipSample: 'VG1204, VG7387, VG3431, VG6021',
        },
        VI: {
            countryName: 'U.S. Virgin Islands',
            zipRegex: /^(008(?:(?:[0-4]\d)|(?:5[01])))(?:[ -](\d{4}))?$/,
            zipSample: '00820, 00804 2036, 00825 3344, 00811-5900',
        },
        VN: {
            countryName: 'Vietnam',
            zipRegex: /^\d{6}$/,
            zipSample: '133836, 748243, 894060, 020597',
        },
        VU: {
            countryName: 'Vanuatu',
        },
        WF: {
            countryName: 'Wallis & Futuna',
            zipRegex: /^986\d{2}$/,
            zipSample: '98692, 98697, 98698, 98671',
        },
        WS: {
            countryName: 'Samoa',
            zipRegex: /^WS[1-2]\d{3}$/,
            zipSample: 'WS1349, WS2798, WS1751, WS2090',
        },
        XK: {
            countryName: 'Kosovo',
            zipRegex: /^[1-7]\d{4}$/,
            zipSample: '56509, 15863, 46644, 21896',
        },
        YE: {
            countryName: 'Yemen',
        },
        YT: {
            countryName: 'Mayotte',
            zipRegex: /^976\d{2}$/,
            zipSample: '97698, 97697, 97632, 97609',
        },
        ZA: {
            countryName: 'South Africa',
            zipRegex: /^\d{4}$/,
            zipSample: '6855, 5179, 6956, 7147',
        },
        ZM: {
            countryName: 'Zambia',
            zipRegex: /^\d{5}$/,
            zipSample: '77603, 97367, 80454, 94484',
        },
        ZW: {
            countryName: 'Zimbabwe',
        },
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
