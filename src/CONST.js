const CLOUDFRONT_URL = 'https://d2k5nsl2zxldvw.cloudfront.net';

const CONST = {
    CLOUDFRONT_URL,
    PDF_VIEWER_URL: '/pdf/web/viewer.html',
    EXPENSIFY_ICON_URL: `${CLOUDFRONT_URL}/images/favicon-2019.png`,
    OPTION_TYPE: {
        REPORT: 'report',
        CONTACT: 'contact',
    },
    MODAL: {
        MODAL_TYPE: {
            CENTERED: 'centered',
        },
    },
    TIMING: {
        HOMEPAGE_INITIAL_RENDER: 'homepage_initial_render',
        HOMEPAGE_REPORTS_LOADED: 'homepage_reports_loaded',
        SWITCH_REPORT: 'switch_report',
        HOT: 'hot',
        COLD: 'cold'
    }
};

export default CONST;
