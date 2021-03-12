const CLOUDFRONT_URL = 'https://d2k5nsl2zxldvw.cloudfront.net';

const CONST = {
    CLOUDFRONT_URL,
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    UPWORK_URL: 'https://www.upwork.com/ab/jobs/search/?q=Expensify%20React%20Native&user_location_match=2',
    OPTION_TYPE: {
        REPORT: 'report',
        PERSONAL_DETAIL: 'personalDetail',
    },
    REPORT: {
        MAXIMUM_PARTICIPANTS: 8,
        REPORT_ACTIONS_LIMIT: 50,
    },
    MODAL: {
        MODAL_TYPE: {
            CENTERED: 'centered',
            BOTTOM_DOCKED: 'bottom_docked',
            POPOVER: 'popover',
            RIGHT_DOCKED: 'right_docked',
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
        NO_CONTACTS_FOUND: 'Don\'t see who you\'re looking for? Type their email or phone number to invite them to chat.',
        MAXIMUM_PARTICIPANTS_REACHED: 'You\'ve reached the maximum number of participants for a group chat.',
    },
    PRIORITY_MODE: {
        GSD: 'gsd',
        DEFAULT: 'default',
    },
    ERROR: {
        API_OFFLINE: 'API is offline',
    },
    NVP: {
        PAYPAL_ME_ADDRESS: 'expensify_payPalMeAddress',
        PRIORITY_MODE: 'priorityMode',
        TIMEZONE: 'timeZone',
    },
    DEFAULT_TIME_ZONE: {automatic: true, selected: 'America/Los_Angeles'},
};

export default CONST;
