const CLOUDFRONT_URL = 'https://d2k5nsl2zxldvw.cloudfront.net';

const CONST = {
    APP_DOWNLOAD_LINKS: {
        ANDROID: 'https://play.google.com/store/apps/details?id=com.expensify.chat',
        IOS: 'https://apps.apple.com/us/app/expensify-cash/id1530278510',
        DESKTOP: 'https://expensify.cash/Expensify.cash.dmg',
    },
    BETAS: {
        ALL: 'all',
        CHRONOS_IN_CASH: 'chronosInCash',
        IOU: 'IOU',
    },
    BUTTON_STATES: {
        DEFAULT: 'default',
        HOVERED: 'hovered',
        PRESSED: 'pressed',
        COMPLETE: 'complete',
    },
    CURRENCY: {
        USD: 'USD',
    },
    CONCIERGE_CHAT_NAME: 'Concierge',
    CLOUDFRONT_URL,
    NEW_ZOOM_MEETING_URL: 'https://zoom.us/start/videomeeting',
    NEW_GOOGLE_MEET_MEETING_URL: 'https://meet.google.com/new',
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    UPWORK_URL: 'https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&user_location_match=2',
    GITHUB_URL: 'https://github.com/Expensify/Expensify.cash',
    TERMS_URL: 'https://use.expensify.com/terms',
    PRIVACY_URL: 'https://use.expensify.com/privacy',
    LICENSES_URL: 'https://use.expensify.com/licenses',
    PLAY_STORE_URL: 'https://play.google.com/store/apps/details?id=com.expensify.chat&hl=en',
    OPTION_TYPE: {
        REPORT: 'report',
        PERSONAL_DETAIL: 'personalDetail',
    },
    REPORT: {
        MAXIMUM_PARTICIPANTS: 8,
        ACTIONS: {
            LIMIT: 50,
            TYPE: {
                IOU: 'IOU',
                ADDCOMMENT: 'ADDCOMMENT',
            },
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
    },
    MODAL: {
        MODAL_TYPE: {
            CONFIRM: 'confirm',
            CENTERED: 'centered',
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
        HOMEPAGE_REPORTS_LOADED: 'homepage_reports_loaded',
        SWITCH_REPORT: 'switch_report',
        COLD: 'cold',
        REPORT_ACTION_ITEM_LAYOUT_DEBOUNCE_TIME: 1500,
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    ERROR: {
        API_OFFLINE: 'API is offline',
    },
    NETWORK: {
        METHOD: {
            POST: 'post',
        },
    },
    NVP: {
        PAYPAL_ME_ADDRESS: 'expensify_payPalMeAddress',
        PRIORITY_MODE: 'priorityMode',
        TIMEZONE: 'timeZone',
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

    EMOJI_SPACER: 'SPACER',

    LOGIN_TYPE: {
        PHONE: 'phone',
        EMAIL: 'email',
    },

    KEYBOARD_TYPE: {
        NUMERIC: 'numeric',
        PHONE_PAD: 'phone-pad',
    },

    EMOJI_PICKER_SIZE: 392,
    NON_NATIVE_EMOJI_PICKER_LIST_HEIGHT: 300,
    EMOJI_PICKER_ITEM_HEIGHT: 40,
    EMOJI_PICKER_HEADER_HEIGHT: 38,

    EMAIL: {
        CHRONOS: 'chronos@expensify.com',
        CONCIERGE: 'concierge@expensify.com',
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

    PLAID: {
        EVENT: {
            ERROR: 'ERROR',
            EXIT: 'EXIT',
        },
    },

    OS: {
        WINDOWS: 'Windows',
        MAC_OS: 'Mac OS',
        ANDROID: 'Android',
        IOS: 'iOS',
        LINUX: 'Linux',
        NATIVE: 'Native',
    },

    IOU: {
        // Note: These payment types are used when building IOU reportAction message values in the server and should
        // not be changed.
        PAYMENT_TYPE: {
            ELSEWHERE: 'Elsewhere',
            PAYPAL_ME: 'PayPal.me',
            VENMO: 'Venmo',
        },
    },

    REGEX: {
        US_PHONE: /^\+1\d{10}$/,
        PHONE_E164_PLUS: /^\+?[1-9]\d{1,14}$/,
        NON_ALPHA_NUMERIC: /[^A-Za-z0-9+]/g,
    },

    GROWL: {
        SUCCESS: 'success',
        ERROR: 'error',
        WARNING: 'warning',
        DURATION: 2000,
    },
};

export default CONST;
