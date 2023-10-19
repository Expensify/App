import {ValueOf} from 'type-fest';
import CONST from './CONST';

/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */

export default {
    HOME: '',
    /** This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated */
    CONCIERGE: 'concierge',
    FLAG_COMMENT: {
        route: 'flag/:reportID/:reportActionID',
        getRoute: (reportID: string, reportActionID: string) => `flag/${reportID}/${reportActionID}`,
    },
    SEARCH: 'search',
    DETAILS: {
        route: 'details',
        getRoute: (login: string) => `details?login=${encodeURIComponent(login)}`,
    },
    PROFILE: {
        route: 'a/:accountID',
        getRoute: (accountID: string | number, backTo = '') => {
            const backToParam = backTo ? `?backTo=${encodeURIComponent(backTo)}` : '';
            return `a/${accountID}${backToParam}`;
        },
    },

    TRANSITION_BETWEEN_APPS: 'transition',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    GET_ASSISTANCE: {
        route: 'get-assistance/:taskID',
        getRoute: (taskID: string) => `get-assistance/${taskID}`,
    },
    UNLINK_LOGIN: 'u/:accountID/:validateCode',
    APPLE_SIGN_IN: 'sign-in-with-apple',
    GOOGLE_SIGN_IN: 'sign-in-with-google',
    DESKTOP_SIGN_IN_REDIRECT: 'desktop-signin-redirect',
    SAML_SIGN_IN: 'sign-in-with-saml',

    // This is a special validation URL that will take the user to /workspace/new after validation. This is used
    // when linking users from e.com in order to share a session in this app.
    ENABLE_PAYMENTS: 'enable-payments',
    WALLET_STATEMENT_WITH_DATE: 'statements/:yearMonth',
    SIGN_IN_MODAL: 'sign-in-modal',

    BANK_ACCOUNT: 'bank-account',
    BANK_ACCOUNT_NEW: 'bank-account/new',
    BANK_ACCOUNT_PERSONAL: 'bank-account/personal',
    BANK_ACCOUNT_WITH_STEP_TO_OPEN: {
        route: 'bank-account/:stepToOpen?',
        getRoute: (stepToOpen = '', policyID = '', backTo = ''): string => {
            const backToParam = backTo ? `&backTo=${encodeURIComponent(backTo)}` : '';
            return `bank-account/${stepToOpen}?policyID=${policyID}${backToParam}`;
        },
    },

    SETTINGS: 'settings',
    SETTINGS_PROFILE: 'settings/profile',
    SETTINGS_SHARE_CODE: 'settings/shareCode',
    SETTINGS_DISPLAY_NAME: 'settings/profile/display-name',
    SETTINGS_TIMEZONE: 'settings/profile/timezone',
    SETTINGS_TIMEZONE_SELECT: 'settings/profile/timezone/select',
    SETTINGS_PRONOUNS: 'settings/profile/pronouns',
    SETTINGS_LOUNGE_ACCESS: 'settings/profile/lounge-access',
    SETTINGS_PREFERENCES: 'settings/preferences',
    SETTINGS_PRIORITY_MODE: 'settings/preferences/priority-mode',
    SETTINGS_LANGUAGE: 'settings/preferences/language',
    SETTINGS_THEME: 'settings/preferences/theme',
    SETTINGS_WORKSPACES: 'settings/workspaces',
    SETTINGS_SECURITY: 'settings/security',
    SETTINGS_CLOSE: 'settings/security/closeAccount',
    SETTINGS_ABOUT: 'settings/about',
    SETTINGS_APP_DOWNLOAD_LINKS: 'settings/about/app-download-links',
    SETTINGS_WALLET: 'settings/wallet',
    SETTINGS_WALLET_DOMAINCARD: {
        route: '/settings/wallet/card/:domain',
        getRoute: (domain: string) => `/settings/wallet/card/${domain}`,
    },
    SETTINGS_REPORT_FRAUD: {
        route: '/settings/wallet/card/:domain/report-virtual-fraud',
        getRoute: (domain: string) => `/settings/wallet/card/${domain}/report-virtual-fraud`,
    },
    SETTINGS_ADD_DEBIT_CARD: 'settings/wallet/add-debit-card',
    SETTINGS_ADD_BANK_ACCOUNT: 'settings/wallet/add-bank-account',
    SETTINGS_ENABLE_PAYMENTS: 'settings/wallet/enable-payments',
    SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS: {
        route: 'settings/wallet/card/:domain/digital-details/update-address',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/digital-details/update-address`,
    },
    SETTINGS_WALLET_TRANSFER_BALANCE: 'settings/wallet/transfer-balance',
    SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT: 'settings/wallet/choose-transfer-account',
    SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED: {
        route: '/settings/wallet/card/:domain/report-card-lost-or-damaged',
        getRoute: (domain: string) => `/settings/wallet/card/${domain}/report-card-lost-or-damaged`,
    },
    SETTINGS_WALLET_CARD_ACTIVATE: {
        route: 'settings/wallet/card/:domain/activate',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/activate`,
    },
    SETTINGS_PERSONAL_DETAILS: 'settings/profile/personal-details',
    SETTINGS_PERSONAL_DETAILS_LEGAL_NAME: 'settings/profile/personal-details/legal-name',
    SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH: 'settings/profile/personal-details/date-of-birth',
    SETTINGS_PERSONAL_DETAILS_ADDRESS: 'settings/profile/personal-details/address',
    SETTINGS_PERSONAL_DETAILS_ADDRESS_COUNTRY: {
        route: 'settings/profile/personal-details/address/country',
        getRoute: (country: string, backTo?: string) => {
            let route = `settings/profile/personal-details/address/country?country=${country}`;
            if (backTo) {
                route += `&backTo=${encodeURIComponent(backTo)}`;
            }
            return route;
        },
    },
    SETTINGS_CONTACT_METHODS: 'settings/profile/contact-methods',
    SETTINGS_CONTACT_METHOD_DETAILS: {
        route: 'settings/profile/contact-methods/:contactMethod/details',
        getRoute: (contactMethod: string) => `settings/profile/contact-methods/${encodeURIComponent(contactMethod)}/details`,
    },
    SETTINGS_NEW_CONTACT_METHOD: 'settings/profile/contact-methods/new',
    SETTINGS_2FA: 'settings/security/two-factor-auth',
    SETTINGS_STATUS: 'settings/profile/status',
    SETTINGS_STATUS_SET: 'settings/profile/status/set',

    KEYBOARD_SHORTCUTS: 'keyboard-shortcuts',

    NEW: 'new',
    NEW_CHAT: 'new/chat',
    NEW_ROOM: 'new/room',

    REPORT: 'r',
    REPORT_WITH_ID: {
        route: 'r/:reportID?/:reportActionID?',
        getRoute: (reportID: string) => `r/${reportID}`,
    },
    EDIT_REQUEST: {
        route: 'r/:threadReportID/edit/:field',
        getRoute: (threadReportID: string, field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => `r/${threadReportID}/edit/${field}`,
    },
    EDIT_CURRENCY_REQUEST: {
        route: 'r/:threadReportID/edit/currency',
        getRoute: (threadReportID: string, currency: string, backTo: string) => `r/${threadReportID}/edit/currency?currency=${currency}&backTo=${backTo}`,
    },
    REPORT_WITH_ID_DETAILS_SHARE_CODE: {
        route: 'r/:reportID/details/shareCode',
        getRoute: (reportID: string) => `r/${reportID}/details/shareCode`,
    },
    REPORT_ATTACHMENTS: {
        route: 'r/:reportID/attachment',
        getRoute: (reportID: string, source: string) => `r/${reportID}/attachment?source=${encodeURI(source)}`,
    },
    REPORT_PARTICIPANTS: {
        route: 'r/:reportID/participants',
        getRoute: (reportID: string) => `r/${reportID}/participants`,
    },
    REPORT_WITH_ID_DETAILS: {
        route: 'r/:reportID/details',
        getRoute: (reportID: string) => `r/${reportID}/details`,
    },
    REPORT_SETTINGS: {
        route: 'r/:reportID/settings',
        getRoute: (reportID: string) => `r/${reportID}/settings`,
    },
    REPORT_SETTINGS_ROOM_NAME: {
        route: 'r/:reportID/settings/room-name',
        getRoute: (reportID: string) => `r/${reportID}/settings/room-name`,
    },
    REPORT_SETTINGS_NOTIFICATION_PREFERENCES: {
        route: 'r/:reportID/settings/notification-preferences',
        getRoute: (reportID: string) => `r/${reportID}/settings/notification-preferences`,
    },
    REPORT_SETTINGS_WRITE_CAPABILITY: {
        route: 'r/:reportID/settings/who-can-post',
        getRoute: (reportID: string) => `r/${reportID}/settings/who-can-post`,
    },
    REPORT_WELCOME_MESSAGE: {
        route: 'r/:reportID/welcomeMessage',
        getRoute: (reportID: string) => `r/${reportID}/welcomeMessage`,
    },
    SPLIT_BILL_DETAILS: {
        route: 'r/:reportID/split/:reportActionID',
        getRoute: (reportID: string, reportActionID: string) => `r/${reportID}/split/${reportActionID}`,
    },
    EDIT_SPLIT_BILL: {
        route: `r/:reportID/split/:reportActionID/edit/:field`,
        getRoute: (reportID: string, reportActionID: string, field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => `r/${reportID}/split/${reportActionID}/edit/${field}`,
    },
    EDIT_SPLIT_BILL_CURRENCY: {
        route: 'r/:reportID/split/:reportActionID/edit/currency',
        getRoute: (reportID: string, reportActionID: string, currency: string, backTo: string) => `r/${reportID}/split/${reportActionID}/edit/currency?currency=${currency}&backTo=${backTo}`,
    },
    TASK_TITLE: {
        route: 'r/:reportID/title',
        getRoute: (reportID: string) => `r/${reportID}/title`,
    },
    TASK_DESCRIPTION: {
        route: 'r/:reportID/description',
        getRoute: (reportID: string) => `r/${reportID}/description`,
    },
    TASK_ASSIGNEE: {
        route: 'r/:reportID/assignee',
        getRoute: (reportID: string) => `r/${reportID}/assignee`,
    },
    PRIVATE_NOTES_VIEW: {
        route: 'r/:reportID/notes/:accountID',
        getRoute: (reportID: string, accountID: string | number) => `r/${reportID}/notes/${accountID}`,
    },
    PRIVATE_NOTES_LIST: {
        route: 'r/:reportID/notes',
        getRoute: (reportID: string) => `r/${reportID}/notes`,
    },
    PRIVATE_NOTES_EDIT: {
        route: 'r/:reportID/notes/:accountID/edit',
        getRoute: (reportID: string, accountID: string | number) => `r/${reportID}/notes/${accountID}/edit`,
    },
    ROOM_MEMBERS: {
        route: 'r/:reportID/members',
        getRoute: (reportID: string) => `r/${reportID}/members`,
    },
    ROOM_INVITE: {
        route: 'r/:reportID/invite',
        getRoute: (reportID: string) => `r/${reportID}/invite`,
    },

    // To see the available iouType, please refer to CONST.IOU.TYPE
    MONEY_REQUEST: {
        route: ':iouType/new/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/${reportID}`,
    },
    MONEY_REQUEST_AMOUNT: {
        route: ':iouType/new/amount/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/amount/${reportID}`,
    },
    MONEY_REQUEST_PARTICIPANTS: {
        route: ':iouType/new/participants/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/participants/${reportID}`,
    },
    MONEY_REQUEST_CONFIRMATION: {
        route: ':iouType/new/confirmation/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/confirmation/${reportID}`,
    },
    MONEY_REQUEST_DATE: {
        route: ':iouType/new/date/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/date/${reportID}`,
    },
    MONEY_REQUEST_CURRENCY: {
        route: ':iouType/new/currency/:reportID?',
        getRoute: (iouType: string, reportID: string, currency: string, backTo: string) => `${iouType}/new/currency/${reportID}?currency=${currency}&backTo=${backTo}`,
    },
    MONEY_REQUEST_DESCRIPTION: {
        route: ':iouType/new/description/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/description/${reportID}`,
    },
    MONEY_REQUEST_CATEGORY: {
        route: ':iouType/new/category/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/category/${reportID}`,
    },
    MONEY_REQUEST_TAG: {
        route: ':iouType/new/tag/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/tag/${reportID}`,
    },
    MONEY_REQUEST_MERCHANT: {
        route: ':iouType/new/merchant/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/merchant/${reportID}`,
    },
    MONEY_REQUEST_WAYPOINT: {
        route: ':iouType/new/waypoint/:waypointIndex',
        getRoute: (iouType: string, waypointIndex: number) => `${iouType}/new/waypoint/${waypointIndex}`,
    },
    MONEY_REQUEST_RECEIPT: {
        route: ':iouType/new/receipt/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/receipt/${reportID}`,
    },
    MONEY_REQUEST_DISTANCE: {
        route: ':iouType/new/address/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/address/${reportID}`,
    },
    MONEY_REQUEST_EDIT_WAYPOINT: {
        route: 'r/:threadReportID/edit/distance/:transactionID/waypoint/:waypointIndex',
        getRoute: (threadReportID: number, transactionID: string, waypointIndex: number) => `r/${threadReportID}/edit/distance/${transactionID}/waypoint/${waypointIndex}`,
    },
    MONEY_REQUEST_DISTANCE_TAB: {
        route: ':iouType/new/:reportID?/distance',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/${reportID}/distance`,
    },
    MONEY_REQUEST_MANUAL_TAB: ':iouType/new/:reportID?/manual',
    MONEY_REQUEST_SCAN_TAB: ':iouType/new/:reportID?/scan',

    IOU_REQUEST: 'request/new',
    IOU_SEND: 'send/new',
    IOU_SEND_ADD_BANK_ACCOUNT: 'send/new/add-bank-account',
    IOU_SEND_ADD_DEBIT_CARD: 'send/new/add-debit-card',
    IOU_SEND_ENABLE_PAYMENTS: 'send/new/enable-payments',

    NEW_TASK: 'new/task',
    NEW_TASK_ASSIGNEE: 'new/task/assignee',
    NEW_TASK_SHARE_DESTINATION: 'new/task/share-destination',
    NEW_TASK_DETAILS: 'new/task/details',
    NEW_TASK_TITLE: 'new/task/title',
    NEW_TASK_DESCRIPTION: 'new/task/description',

    TEACHERS_UNITE: 'teachersunite',
    I_KNOW_A_TEACHER: 'teachersunite/i-know-a-teacher',
    I_AM_A_TEACHER: 'teachersunite/i-am-a-teacher',
    INTRO_SCHOOL_PRINCIPAL: 'teachersunite/intro-school-principal',

    ERECEIPT: {
        route: 'eReceipt/:transactionID',
        getRoute: (transactionID: string) => `eReceipt/${transactionID}`,
    },

    WORKSPACE_NEW: 'workspace/new',
    WORKSPACE_NEW_ROOM: 'workspace/new-room',
    WORKSPACE_INITIAL: {
        route: 'workspace/:policyID',
        getRoute: (policyID: string) => `workspace/${policyID}`,
    },
    WORKSPACE_INVITE: {
        route: 'workspace/:policyID/invite',
        getRoute: (policyID: string) => `workspace/${policyID}/invite`,
    },
    WORKSPACE_INVITE_MESSAGE: {
        route: 'workspace/:policyID/invite-message',
        getRoute: (policyID: string) => `workspace/${policyID}/invite-message`,
    },
    WORKSPACE_SETTINGS: {
        route: 'workspace/:policyID/settings',
        getRoute: (policyID: string) => `workspace/${policyID}/settings`,
    },
    WORKSPACE_SETTINGS_CURRENCY: {
        route: 'workspace/:policyID/settings/currency',
        getRoute: (policyID: string) => `workspace/${policyID}/settings/currency`,
    },
    WORKSPACE_CARD: {
        route: 'workspace/:policyID/card',
        getRoute: (policyID: string) => `workspace/${policyID}/card`,
    },
    WORKSPACE_REIMBURSE: {
        route: 'workspace/:policyID/reimburse',
        getRoute: (policyID: string) => `workspace/${policyID}/reimburse`,
    },
    WORKSPACE_RATE_AND_UNIT: {
        route: 'workspace/:policyID/rateandunit',
        getRoute: (policyID: string) => `workspace/${policyID}/rateandunit`,
    },
    WORKSPACE_BILLS: {
        route: 'workspace/:policyID/bills',
        getRoute: (policyID: string) => `workspace/${policyID}/bills`,
    },
    WORKSPACE_INVOICES: {
        route: 'workspace/:policyID/invoices',
        getRoute: (policyID: string) => `workspace/${policyID}/invoices`,
    },
    WORKSPACE_TRAVEL: {
        route: 'workspace/:policyID/travel',
        getRoute: (policyID: string) => `workspace/${policyID}/travel`,
    },
    WORKSPACE_MEMBERS: {
        route: 'workspace/:policyID/members',
        getRoute: (policyID: string) => `workspace/${policyID}/members`,
    },

    // These are some one-off routes that will be removed once they're no longer needed (see GH issues for details)
    SAASTR: 'saastr',
    SBE: 'sbe',
    MONEY2020: 'money2020',

    // Iframe screens from olddot
    HOME_OLDDOT: 'home',

    // Spend tab
    EXPENSES_OLDDOT: 'expenses',
    REPORTS_OLDDOT: 'reports',
    INSIGHTS_OLDDOT: 'insights',

    // Workspaces tab
    INDIVIDUALS_OLDDOT: 'individual_workspaces',
    GROUPS_OLDDOT: 'group_workspaces',
    CARDS_AND_DOMAINS_OLDDOT: 'cards-and-domains',
} as const;
