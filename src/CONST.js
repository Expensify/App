const CLOUDFRONT_URL = 'https://d2k5nsl2zxldvw.cloudfront.net';

const CONST = {
    BETAS: {
        ALL: 'all',
        REPORT_ACTION_CONTEXT_MENU: 'reportActionContextMenu',
    },
    BUTTON_STATES: {
        DEFAULT: 'default',
        HOVERED: 'hovered',
        PRESSED: 'pressed',
    },
    CLOUDFRONT_URL,
    NEW_ZOOM_MEETING_URL: 'https://zoom.us/start/videomeeting',
    NEW_GOOGLE_MEET_MEETING_URL: 'https://meet.google.com/new',
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    UPWORK_URL: 'https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&user_location_match=2',
    TERMS_URL: 'https://use.expensify.com/terms',
    PRIVACY_URL: 'https://use.expensify.com/privacy',
    LICENSES_URL: 'https://use.expensify.com/licenses',
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
            },
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
        HOT: 'hot',
        COLD: 'cold',
    },
    MESSAGES: {
        // eslint-disable-next-line max-len
        NO_PHONE_NUMBER: 'Please enter a phone number including the country code e.g +447814266907',
        MAXIMUM_PARTICIPANTS_REACHED: 'You\'ve reached the maximum number of participants for a group chat.',
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    ERROR: {
        API_OFFLINE: 'API is offline',
    },
    MENU_ITEM_KEYS: {
        NEW_CHAT: 'NewChat',
        NEW_GROUP: 'NewGroup',
        REQUEST_MONEY: 'RequestMoney',
        SPLIT_BILL: 'SplitBill',
        ATTACHMENT_PICKER: 'AttachmentPicker',
    },
    NVP: {
        PAYPAL_ME_ADDRESS: 'expensify_payPalMeAddress',
        PRIORITY_MODE: 'priorityMode',
        TIMEZONE: 'timeZone',
    },
    DEFAULT_TIME_ZONE: {automatic: true, selected: 'America/Los_Angeles'},
    PRONOUNS: {
        HE_HIM_HIS: 'He/him',
        SHE_HER_HERS: 'She/her',
        THEY_THEM_THEIRS: 'They/them',
        ZE_HIR_HIRS: 'Ze/hir',
        SELF_SELECT: 'Self-select',
        CALL_ME_BY_MY_NAME: 'Call me by my name',
    },
    APP_STATE: {
        ACTIVE: 'active',
        BACKGROUND: 'background',
        INACTIVE: 'inactive',
    },

    // at least 8 characters, 1 capital letter, 1 lowercase number, 1 number
    PASSWORD_COMPLEXITY_REGEX_STRING: '^(?=.*[A-Z])(?=.*[0-9])(?=.*[a-z]).{8,}$',
    EMOJI_SPACER: 'SPACER',
};

export default CONST;
