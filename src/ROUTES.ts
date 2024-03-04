import type {IsEqual, ValueOf} from 'type-fest';
import type CONST from './CONST';

// This is a file containing constants for all the routes we want to be able to go to

/**
 * Builds a URL with an encoded URI component for the `backTo` param which can be added to the end of URLs
 */
function getUrlWithBackToParam<TUrl extends string>(url: TUrl, backTo?: string): `${TUrl}` | `${TUrl}?backTo=${string}` | `${TUrl}&backTo=${string}` {
    const backToParam = backTo ? (`${url.includes('?') ? '&' : '?'}backTo=${encodeURIComponent(backTo)}` as const) : '';
    return `${url}${backToParam}` as const;
}

const ROUTES = {
    // If the user opens this route, we'll redirect them to the path saved in the last visited path or to the home page if the last visited path is empty.
    ROOT: '',

    // This route renders the list of reports.
    HOME: 'home',

    ALL_SETTINGS: 'all-settings',

    // This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated
    CONCIERGE: 'concierge',
    FLAG_COMMENT: {
        route: 'flag/:reportID/:reportActionID',
        getRoute: (reportID: string, reportActionID: string) => `flag/${reportID}/${reportActionID}` as const,
    },
    SEARCH: 'search',
    DETAILS: {
        route: 'details',
        getRoute: (login: string) => `details?login=${encodeURIComponent(login)}` as const,
    },
    PROFILE: {
        route: 'a/:accountID',
        getRoute: (accountID: string | number, backTo?: string) => getUrlWithBackToParam(`a/${accountID}`, backTo),
    },
    PROFILE_AVATAR: {
        route: 'a/:accountID/avatar',
        getRoute: (accountID: string) => `a/${accountID}/avatar` as const,
    },

    TRANSITION_BETWEEN_APPS: 'transition',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    GET_ASSISTANCE: {
        route: 'get-assistance/:taskID',
        getRoute: (taskID: string, backTo: string) => getUrlWithBackToParam(`get-assistance/${taskID}`, backTo),
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
        getRoute: (stepToOpen = '', policyID = '', backTo?: string) => getUrlWithBackToParam(`bank-account/${stepToOpen}?policyID=${policyID}`, backTo),
    },
    WORKSPACE_SWITCHER: 'workspace-switcher',
    SETTINGS: 'settings',
    SETTINGS_PROFILE: 'settings/profile',
    SETTINGS_SHARE_CODE: 'settings/shareCode',
    SETTINGS_DISPLAY_NAME: 'settings/profile/display-name',
    SETTINGS_TIMEZONE: 'settings/profile/timezone',
    SETTINGS_TIMEZONE_SELECT: 'settings/profile/timezone/select',
    SETTINGS_PRONOUNS: 'settings/profile/pronouns',
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
        route: 'settings/wallet/card/:domain',
        getRoute: (domain: string) => `settings/wallet/card/${domain}` as const,
    },
    SETTINGS_REPORT_FRAUD: {
        route: 'settings/wallet/card/:domain/report-virtual-fraud',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/report-virtual-fraud` as const,
    },
    SETTINGS_WALLET_CARD_GET_PHYSICAL_NAME: {
        route: 'settings/wallet/card/:domain/get-physical/name',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/get-physical/name` as const,
    },
    SETTINGS_WALLET_CARD_GET_PHYSICAL_PHONE: {
        route: 'settings/wallet/card/:domain/get-physical/phone',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/get-physical/phone` as const,
    },
    SETTINGS_WALLET_CARD_GET_PHYSICAL_ADDRESS: {
        route: 'settings/wallet/card/:domain/get-physical/address',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/get-physical/address` as const,
    },
    SETTINGS_WALLET_CARD_GET_PHYSICAL_CONFIRM: {
        route: 'settings/wallet/card/:domain/get-physical/confirm',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/get-physical/confirm` as const,
    },
    SETTINGS_ADD_DEBIT_CARD: 'settings/wallet/add-debit-card',
    SETTINGS_ADD_BANK_ACCOUNT: 'settings/wallet/add-bank-account',
    SETTINGS_ENABLE_PAYMENTS: 'settings/wallet/enable-payments',
    SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS: {
        route: 'settings/wallet/card/:domain/digital-details/update-address',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/digital-details/update-address` as const,
    },
    SETTINGS_WALLET_TRANSFER_BALANCE: 'settings/wallet/transfer-balance',
    SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT: 'settings/wallet/choose-transfer-account',
    SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED: {
        route: 'settings/wallet/card/:domain/report-card-lost-or-damaged',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/report-card-lost-or-damaged` as const,
    },
    SETTINGS_WALLET_CARD_ACTIVATE: {
        route: 'settings/wallet/card/:domain/activate',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/activate` as const,
    },
    SETTINGS_LEGAL_NAME: 'settings/profile/legal-name',
    SETTINGS_DATE_OF_BIRTH: 'settings/profile/date-of-birth',
    SETTINGS_ADDRESS: 'settings/profile/address',
    SETTINGS_ADDRESS_COUNTRY: {
        route: 'settings/profile/address/country',
        getRoute: (country: string, backTo?: string) => getUrlWithBackToParam(`settings/profile/address/country?country=${country}`, backTo),
    },
    SETTINGS_CONTACT_METHODS: {
        route: 'settings/profile/contact-methods',
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/profile/contact-methods', backTo),
    },
    SETTINGS_CONTACT_METHOD_DETAILS: {
        route: 'settings/profile/contact-methods/:contactMethod/details',
        getRoute: (contactMethod: string) => `settings/profile/contact-methods/${encodeURIComponent(contactMethod)}/details` as const,
    },
    SETTINGS_NEW_CONTACT_METHOD: {
        route: 'settings/profile/contact-methods/new',
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/profile/contact-methods/new', backTo),
    },
    SETTINGS_2FA: {
        route: 'settings/security/two-factor-auth',
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/security/two-factor-auth', backTo),
    },
    SETTINGS_STATUS: 'settings/profile/status',

    SETTINGS_STATUS_CLEAR_AFTER: 'settings/profile/status/clear-after',
    SETTINGS_STATUS_CLEAR_AFTER_DATE: 'settings/profile/status/clear-after/date',
    SETTINGS_STATUS_CLEAR_AFTER_TIME: 'settings/profile/status/clear-after/time',
    SETTINGS_TROUBLESHOOT: 'settings/troubleshoot',
    SETTINGS_CONSOLE: 'settings/troubleshoot/console',
    SETTINGS_SHARE_LOG: {
        route: 'settings/troubleshoot/console/share-log',
        getRoute: (source: string) => `settings/troubleshoot/console/share-log?source=${encodeURI(source)}` as const,
    },

    SETTINGS_EXIT_SURVEY_REASON: 'settings/exit-survey/reason',
    SETTINGS_EXIT_SURVEY_RESPONSE: {
        route: 'settings/exit-survey/response',
        getRoute: (reason?: ValueOf<typeof CONST.EXIT_SURVEY.REASONS>, backTo?: string) =>
            getUrlWithBackToParam(`settings/exit-survey/response${reason ? `?reason=${encodeURIComponent(reason)}` : ''}`, backTo),
    },
    SETTINGS_EXIT_SURVEY_CONFIRM: {
        route: 'settings/exit-survey/confirm',
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/exit-survey/confirm', backTo),
    },

    KEYBOARD_SHORTCUTS: 'keyboard-shortcuts',

    NEW: 'new',
    NEW_CHAT: 'new/chat',
    NEW_ROOM: 'new/room',

    REPORT: 'r',
    REPORT_WITH_ID: {
        route: 'r/:reportID?/:reportActionID?',
        getRoute: (reportID: string) => `r/${reportID}` as const,
    },
    REPORT_AVATAR: {
        route: 'r/:reportID/avatar',
        getRoute: (reportID: string) => `r/${reportID}/avatar` as const,
    },
    EDIT_REQUEST: {
        route: 'r/:threadReportID/edit/:field/:tagIndex?',
        getRoute: (threadReportID: string, field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>, tagIndex?: number) =>
            `r/${threadReportID}/edit/${field}${typeof tagIndex === 'number' ? `/${tagIndex}` : ''}` as const,
    },
    EDIT_CURRENCY_REQUEST: {
        route: 'r/:threadReportID/edit/currency',
        getRoute: (threadReportID: string, currency: string, backTo: string) => `r/${threadReportID}/edit/currency?currency=${currency}&backTo=${backTo}` as const,
    },
    EDIT_REPORT_FIELD_REQUEST: {
        route: 'r/:reportID/edit/policyField/:policyID/:fieldID',
        getRoute: (reportID: string, policyID: string, fieldID: string) => `r/${reportID}/edit/policyField/${policyID}/${fieldID}` as const,
    },
    REPORT_WITH_ID_DETAILS_SHARE_CODE: {
        route: 'r/:reportID/details/shareCode',
        getRoute: (reportID: string) => `r/${reportID}/details/shareCode` as const,
    },
    REPORT_ATTACHMENTS: {
        route: 'r/:reportID/attachment',
        getRoute: (reportID: string, source: string) => `r/${reportID}/attachment?source=${encodeURI(source)}` as const,
    },
    REPORT_PARTICIPANTS: {
        route: 'r/:reportID/participants',
        getRoute: (reportID: string) => `r/${reportID}/participants` as const,
    },
    REPORT_WITH_ID_DETAILS: {
        route: 'r/:reportID/details',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/details`, backTo),
    },
    REPORT_SETTINGS: {
        route: 'r/:reportID/settings',
        getRoute: (reportID: string) => `r/${reportID}/settings` as const,
    },
    REPORT_SETTINGS_ROOM_NAME: {
        route: 'r/:reportID/settings/room-name',
        getRoute: (reportID: string) => `r/${reportID}/settings/room-name` as const,
    },
    REPORT_SETTINGS_NOTIFICATION_PREFERENCES: {
        route: 'r/:reportID/settings/notification-preferences',
        getRoute: (reportID: string) => `r/${reportID}/settings/notification-preferences` as const,
    },
    REPORT_SETTINGS_WRITE_CAPABILITY: {
        route: 'r/:reportID/settings/who-can-post',
        getRoute: (reportID: string) => `r/${reportID}/settings/who-can-post` as const,
    },
    REPORT_SETTINGS_VISIBILITY: {
        route: 'r/:reportID/settings/visibility',
        getRoute: (reportID: string) => `r/${reportID}/settings/visibility` as const,
    },
    SPLIT_BILL_DETAILS: {
        route: 'r/:reportID/split/:reportActionID',
        getRoute: (reportID: string, reportActionID: string) => `r/${reportID}/split/${reportActionID}` as const,
    },
    EDIT_SPLIT_BILL: {
        route: `r/:reportID/split/:reportActionID/edit/:field/:tagIndex?`,
        getRoute: (reportID: string, reportActionID: string, field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>, tagIndex?: number) =>
            `r/${reportID}/split/${reportActionID}/edit/${field}${typeof tagIndex === 'number' ? `/${tagIndex}` : ''}` as const,
    },
    EDIT_SPLIT_BILL_CURRENCY: {
        route: 'r/:reportID/split/:reportActionID/edit/currency',
        getRoute: (reportID: string, reportActionID: string, currency: string, backTo: string) =>
            `r/${reportID}/split/${reportActionID}/edit/currency?currency=${currency}&backTo=${backTo}` as const,
    },
    TASK_TITLE: {
        route: 'r/:reportID/title',
        getRoute: (reportID: string) => `r/${reportID}/title` as const,
    },
    REPORT_DESCRIPTION: {
        route: 'r/:reportID/description',
        getRoute: (reportID: string) => `r/${reportID}/description` as const,
    },
    TASK_ASSIGNEE: {
        route: 'r/:reportID/assignee',
        getRoute: (reportID: string) => `r/${reportID}/assignee` as const,
    },
    PRIVATE_NOTES_LIST: {
        route: 'r/:reportID/notes',
        getRoute: (reportID: string) => `r/${reportID}/notes` as const,
    },
    PRIVATE_NOTES_EDIT: {
        route: 'r/:reportID/notes/:accountID/edit',
        getRoute: (reportID: string, accountID: string | number) => `r/${reportID}/notes/${accountID}/edit` as const,
    },
    ROOM_MEMBERS: {
        route: 'r/:reportID/members',
        getRoute: (reportID: string) => `r/${reportID}/members` as const,
    },
    ROOM_INVITE: {
        route: 'r/:reportID/invite',
        getRoute: (reportID: string) => `r/${reportID}/invite` as const,
    },

    // To see the available iouType, please refer to CONST.IOU.TYPE
    MONEY_REQUEST: {
        route: ':iouType/new/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/${reportID}` as const,
    },
    MONEY_REQUEST_AMOUNT: {
        route: ':iouType/new/amount/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/amount/${reportID}` as const,
    },
    MONEY_REQUEST_PARTICIPANTS: {
        route: ':iouType/new/participants/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/participants/${reportID}` as const,
    },
    MONEY_REQUEST_CONFIRMATION: {
        route: ':iouType/new/confirmation/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/confirmation/${reportID}` as const,
    },
    MONEY_REQUEST_CURRENCY: {
        route: ':iouType/new/currency/:reportID?',
        getRoute: (iouType: string, reportID: string, currency: string, backTo: string) => `${iouType}/new/currency/${reportID}?currency=${currency}&backTo=${backTo}` as const,
    },
    MONEY_REQUEST_HOLD_REASON: {
        route: ':iouType/edit/reason/:transactionID?',
        getRoute: (iouType: string, transactionID: string, reportID: string, backTo: string) => `${iouType}/edit/reason/${transactionID}?backTo=${backTo}&reportID=${reportID}` as const,
    },
    MONEY_REQUEST_MERCHANT: {
        route: ':iouType/new/merchant/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/merchant/${reportID}` as const,
    },
    MONEY_REQUEST_RECEIPT: {
        route: ':iouType/new/receipt/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/receipt/${reportID}` as const,
    },
    MONEY_REQUEST_DISTANCE: {
        route: ':iouType/new/address/:reportID?',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/address/${reportID}` as const,
    },
    MONEY_REQUEST_DISTANCE_TAB: {
        route: ':iouType/new/:reportID?/distance',
        getRoute: (iouType: string, reportID = '') => `${iouType}/new/${reportID}/distance` as const,
    },
    MONEY_REQUEST_MANUAL_TAB: ':iouType/new/:reportID?/manual',
    MONEY_REQUEST_SCAN_TAB: ':iouType/new/:reportID?/scan',

    MONEY_REQUEST_CREATE: {
        route: 'create/:iouType/start/:transactionID/:reportID',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string) => `create/${iouType}/start/${transactionID}/${reportID}` as const,
    },
    MONEY_REQUEST_STEP_CONFIRMATION: {
        route: 'create/:iouType/confirmation/:transactionID/:reportID',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string) => `create/${iouType}/confirmation/${transactionID}/${reportID}` as const,
    },
    MONEY_REQUEST_STEP_AMOUNT: {
        route: 'create/:iouType/amount/:transactionID/:reportID',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`create/${iouType}/amount/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_TAX_RATE: {
        route: 'create/:iouType/taxRate/:transactionID/:reportID?',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo: string) =>
            getUrlWithBackToParam(`create/${iouType}/taxRate/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_TAX_AMOUNT: {
        route: 'create/:iouType/taxAmount/:transactionID/:reportID?',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo: string) =>
            getUrlWithBackToParam(`create/${iouType}/taxAmount/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_CATEGORY: {
        route: ':action/:iouType/category/:transactionID/:reportID',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/category/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_CURRENCY: {
        route: 'create/:iouType/currency/:transactionID/:reportID/:pageIndex?',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, pageIndex = '', backTo = '') =>
            getUrlWithBackToParam(`create/${iouType}/currency/${transactionID}/${reportID}/${pageIndex}`, backTo),
    },
    MONEY_REQUEST_STEP_DATE: {
        route: ':action/:iouType/date/:transactionID/:reportID',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/date/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_DESCRIPTION: {
        route: ':action/:iouType/description/:transactionID/:reportID',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/description/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_DISTANCE: {
        route: 'create/:iouType/distance/:transactionID/:reportID',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`create/${iouType}/distance/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_MERCHANT: {
        route: ':action/:iouType/merchant/:transactionID/:reportID',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/merchant/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_PARTICIPANTS: {
        route: 'create/:iouType/participants/:transactionID/:reportID',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`create/${iouType}/participants/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_SCAN: {
        route: ':action/:iouType/scan/:transactionID/:reportID',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/scan/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_TAG: {
        route: ':action/:iouType/tag/:tagIndex/:transactionID/:reportID',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, tagIndex: number, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/tag/${tagIndex}/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_WAYPOINT: {
        route: ':action/:iouType/waypoint/:transactionID/:reportID/:pageIndex',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, pageIndex = '', backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/waypoint/${transactionID}/${reportID}/${pageIndex}`, backTo),
    },
    // This URL is used as a redirect to one of the create tabs below. This is so that we can message users with a link
    // straight to those flows without needing to have optimistic transaction and report IDs.
    MONEY_REQUEST_START: {
        route: 'start/:iouType/:iouRequestType',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, iouRequestType: ValueOf<typeof CONST.IOU.REQUEST_TYPE>) => `start/${iouType}/${iouRequestType}` as const,
    },
    MONEY_REQUEST_CREATE_TAB_DISTANCE: {
        route: 'create/:iouType/start/:transactionID/:reportID/distance',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string) => `create/${iouType}/start/${transactionID}/${reportID}/distance` as const,
    },
    MONEY_REQUEST_CREATE_TAB_MANUAL: {
        route: 'create/:iouType/start/:transactionID/:reportID/manual',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string) => `create/${iouType}/start/${transactionID}/${reportID}/manual` as const,
    },
    MONEY_REQUEST_CREATE_TAB_SCAN: {
        route: 'create/:iouType/start/:transactionID/:reportID/scan',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string) => `create/${iouType}/start/${transactionID}/${reportID}/scan` as const,
    },

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

    ONBOARD: 'onboard',
    ONBOARD_MANAGE_EXPENSES: 'onboard/manage-expenses',
    ONBOARD_EXPENSIFY_CLASSIC: 'onboard/expensify-classic',

    TEACHERS_UNITE: 'teachersunite',
    I_KNOW_A_TEACHER: 'teachersunite/i-know-a-teacher',
    I_AM_A_TEACHER: 'teachersunite/i-am-a-teacher',
    INTRO_SCHOOL_PRINCIPAL: 'teachersunite/intro-school-principal',

    ERECEIPT: {
        route: 'eReceipt/:transactionID',
        getRoute: (transactionID: string) => `eReceipt/${transactionID}` as const,
    },

    WORKSPACE_NEW: 'workspace/new',
    WORKSPACE_NEW_ROOM: 'workspace/new-room',
    WORKSPACE_INITIAL: {
        route: 'workspace/:policyID',
        getRoute: (policyID: string) => `workspace/${policyID}` as const,
    },
    WORKSPACE_INVITE: {
        route: 'workspace/:policyID/invite',
        getRoute: (policyID: string) => `workspace/${policyID}/invite` as const,
    },
    WORKSPACE_INVITE_MESSAGE: {
        route: 'workspace/:policyID/invite-message',
        getRoute: (policyID: string) => `workspace/${policyID}/invite-message` as const,
    },
    WORKSPACE_PROFILE: {
        route: 'workspace/:policyID/profile',
        getRoute: (policyID: string) => `workspace/${policyID}/profile` as const,
    },
    WORKSPACE_PROFILE_CURRENCY: {
        route: 'workspace/:policyID/profile/currency',
        getRoute: (policyID: string) => `workspace/${policyID}/profile/currency` as const,
    },
    WORKSPACE_PROFILE_NAME: {
        route: 'workspace/:policyID/profile/name',
        getRoute: (policyID: string) => `workspace/${policyID}/profile/name` as const,
    },
    WORKSPACE_PROFILE_DESCRIPTION: {
        route: 'workspace/:policyID/profile/description',
        getRoute: (policyID: string) => `workspace/${policyID}/profile/description` as const,
    },
    WORKSPACE_PROFILE_SHARE: {
        route: 'workspace/:policyID/profile/share',
        getRoute: (policyID: string) => `workspace/${policyID}/profile/share` as const,
    },
    WORKSPACE_AVATAR: {
        route: 'workspace/:policyID/avatar',
        getRoute: (policyID: string) => `workspace/${policyID}/avatar` as const,
    },
    WORKSPACE_SETTINGS_CURRENCY: {
        route: 'workspace/:policyID/settings/currency',
        getRoute: (policyID: string) => `workspace/${policyID}/settings/currency` as const,
    },
    WORKSPACE_WORKFLOWS: {
        route: 'workspace/:policyID/workflows',
        getRoute: (policyID: string) => `workspace/${policyID}/workflows` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVER: {
        route: 'workspace/:policyID/settings/workflows/approver',
        getRoute: (policyId: string) => `workspace/${policyId}/settings/workflows/approver` as const,
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY: {
        route: 'workspace/:policyID/settings/workflows/auto-reporting-frequency',
        getRoute: (policyID: string) => `workspace/${policyID}/settings/workflows/auto-reporting-frequency` as const,
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET: {
        route: 'workspace/:policyID/settings/workflows/auto-reporting-frequency/monthly-offset',
        getRoute: (policyID: string) => `workspace/${policyID}/settings/workflows/auto-reporting-frequency/monthly-offset` as const,
    },
    WORKSPACE_CARD: {
        route: 'workspace/:policyID/card',
        getRoute: (policyID: string) => `workspace/${policyID}/card` as const,
    },
    WORKSPACE_REIMBURSE: {
        route: 'workspace/:policyID/reimburse',
        getRoute: (policyID: string) => `workspace/${policyID}/reimburse` as const,
    },
    WORKSPACE_RATE_AND_UNIT: {
        route: 'workspace/:policyID/rateandunit',
        getRoute: (policyID: string) => `workspace/${policyID}/rateandunit` as const,
    },
    WORKSPACE_RATE_AND_UNIT_RATE: {
        route: 'workspace/:policyID/rateandunit/rate',
        getRoute: (policyID: string) => `workspace/${policyID}/rateandunit/rate` as const,
    },
    WORKSPACE_RATE_AND_UNIT_UNIT: {
        route: 'workspace/:policyID/rateandunit/unit',
        getRoute: (policyID: string) => `workspace/${policyID}/rateandunit/unit` as const,
    },
    WORKSPACE_BILLS: {
        route: 'workspace/:policyID/bills',
        getRoute: (policyID: string) => `workspace/${policyID}/bills` as const,
    },
    WORKSPACE_INVOICES: {
        route: 'workspace/:policyID/invoices',
        getRoute: (policyID: string) => `workspace/${policyID}/invoices` as const,
    },
    WORKSPACE_TRAVEL: {
        route: 'workspace/:policyID/travel',
        getRoute: (policyID: string) => `workspace/${policyID}/travel` as const,
    },
    WORKSPACE_MEMBERS: {
        route: 'workspace/:policyID/members',
        getRoute: (policyID: string) => `workspace/${policyID}/members` as const,
    },
    WORKSPACE_CATEGORIES: {
        route: 'workspace/:policyID/categories',
        getRoute: (policyID: string) => `workspace/${policyID}/categories` as const,
    },
    WORKSPACE_CATEGORY_SETTINGS: {
        route: 'workspace/:policyID/categories/:categoryName',
        getRoute: (policyID: string, categoryName: string) => `workspace/${policyID}/categories/${encodeURI(categoryName)}` as const,
    },
    WORKSPACE_CATEGORIES_SETTINGS: {
        route: 'workspace/:policyID/categories/settings',
        getRoute: (policyID: string) => `workspace/${policyID}/categories/settings` as const,
    },

    // Referral program promotion
    REFERRAL_DETAILS_MODAL: {
        route: 'referral/:contentType',
        getRoute: (contentType: string, backTo?: string) => getUrlWithBackToParam(`referral/${contentType}`, backTo),
    },
    PROCESS_MONEY_REQUEST_HOLD: 'hold-request-educational',
} as const;

/**
 * Proxy routes can be used to generate a correct url with dynamic values
 *
 * It will be used by HybridApp, that has no access to methods generating dynamic routes in NewDot
 */
const HYBRID_APP_ROUTES = {
    MONEY_REQUEST_CREATE: '/request/new/scan',
} as const;

export {getUrlWithBackToParam, HYBRID_APP_ROUTES};
export default ROUTES;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractRouteName<TRoute> = TRoute extends {getRoute: (...args: any[]) => infer TRouteName} ? TRouteName : TRoute;

type AllRoutes = {
    [K in keyof typeof ROUTES]: ExtractRouteName<(typeof ROUTES)[K]>;
}[keyof typeof ROUTES];

type RouteIsPlainString = IsEqual<AllRoutes, string>;

/**
 * Represents all routes in the app as a union of literal strings.
 *
 * If this type resolves to `never`, it implies that one or more routes defined within `ROUTES` have not correctly used
 * `as const` in their `getRoute` function return value.
 */
type Route = RouteIsPlainString extends true ? never : AllRoutes;

type HybridAppRoute = (typeof HYBRID_APP_ROUTES)[keyof typeof HYBRID_APP_ROUTES];

export type {Route, HybridAppRoute, AllRoutes};
