const CLOUDFRONT_URL = 'https://d2k5nsl2zxldvw.cloudfront.net';

const CONST = {
    BUTTON_STATES: {
        DEFAULT: 'default',
        HOVERED: 'hovered',
        PRESSED: 'pressed',
    },
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
        HOMEPAGE_INITIAL_RENDER: 'homepage_initial_render',
        HOMEPAGE_REPORTS_LOADED: 'homepage_reports_loaded',
        SWITCH_REPORT: 'switch_report',
        HOT: 'hot',
        COLD: 'cold',
    },
};

export default CONST;
