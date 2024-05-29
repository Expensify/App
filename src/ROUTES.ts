import type {ValueOf} from 'type-fest';
import type CONST from './CONST';
import type {IOUAction, IOUType} from './CONST';
import type {IOURequestType} from './libs/actions/IOU';
import type AssertTypesNotEqual from './types/utils/AssertTypesNotEqual';

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

    SEARCH: {
        route: '/search/:query',
        getRoute: (query: string) => `search/${query}` as const,
    },

    SEARCH_REPORT: {
        route: '/search/:query/view/:reportID',
        getRoute: (query: string, reportID: string) => `search/${query}/view/${reportID}` as const,
    },

    // This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated
    CONCIERGE: 'concierge',
    FLAG_COMMENT: {
        route: 'flag/:reportID/:reportActionID',
        getRoute: (reportID: string, reportActionID: string) => `flag/${reportID}/${reportActionID}` as const,
    },
    CHAT_FINDER: 'chat-finder',
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
        getRoute: (accountID: string | number) => `a/${accountID}/avatar` as const,
    },

    TRANSITION_BETWEEN_APPS: 'transition',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    CONNECTION_COMPLETE: 'connection-complete',
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
    SETTINGS_SUBSCRIPTION: 'settings/subscription',
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
        route: 'settings/wallet/card/:cardID?',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}` as const,
    },
    SETTINGS_REPORT_FRAUD: {
        route: 'settings/wallet/card/:cardID/report-virtual-fraud',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/report-virtual-fraud` as const,
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
    SETTINGS_ADD_BANK_ACCOUNT_REFACTOR: 'settings/wallet/add-bank-account-refactor',
    SETTINGS_ENABLE_PAYMENTS: 'settings/wallet/enable-payments',
    // TODO: Added temporarily for testing purposes, remove after refactor - https://github.com/Expensify/App/issues/36648
    SETTINGS_ENABLE_PAYMENTS_REFACTOR: 'settings/wallet/enable-payments-refactor',
    // TODO: Added temporarily for testing purposes, remove after refactor - https://github.com/Expensify/App/issues/36648
    SETTINGS_ENABLE_PAYMENTS_TEMPORARY_TERMS: 'settings/wallet/enable-payments-temporary-terms',
    SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS: {
        route: 'settings/wallet/card/:domain/digital-details/update-address',
        getRoute: (domain: string) => `settings/wallet/card/${domain}/digital-details/update-address` as const,
    },
    SETTINGS_WALLET_TRANSFER_BALANCE: 'settings/wallet/transfer-balance',
    SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT: 'settings/wallet/choose-transfer-account',
    SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED: {
        route: 'settings/wallet/card/:cardID/report-card-lost-or-damaged',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/report-card-lost-or-damaged` as const,
    },
    SETTINGS_WALLET_CARD_ACTIVATE: {
        route: 'settings/wallet/card/:cardID/activate',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/activate` as const,
    },
    SETTINGS_LEGAL_NAME: 'settings/profile/legal-name',
    SETTINGS_DATE_OF_BIRTH: 'settings/profile/date-of-birth',
    SETTINGS_ADDRESS: 'settings/profile/address',
    SETTINGS_ADDRESS_COUNTRY: {
        route: 'settings/profile/address/country',
        getRoute: (country: string, backTo?: string) => getUrlWithBackToParam(`settings/profile/address/country?country=${country}`, backTo),
    },
    SETTINGS_ADDRESS_STATE: {
        route: 'settings/profile/address/state',

        getRoute: (state?: string, backTo?: string, label?: string) =>
            `${getUrlWithBackToParam(`settings/profile/address/state${state ? `?state=${encodeURIComponent(state)}` : ''}`, backTo)}${
                // the label param can be an empty string so we cannot use a nullish ?? operator
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                label ? `${backTo || state ? '&' : '?'}label=${encodeURIComponent(label)}` : ''
            }` as const,
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

    SETTINGS_SAVE_THE_WORLD: 'settings/teachersunite',

    KEYBOARD_SHORTCUTS: 'keyboard-shortcuts',

    NEW: 'new',
    NEW_CHAT: 'new/chat',
    NEW_CHAT_CONFIRM: 'new/chat/confirm',
    NEW_CHAT_EDIT_NAME: 'new/chat/confirm/name/edit',
    NEW_ROOM: 'new/room',

    REPORT: 'r',
    REPORT_WITH_ID: {
        route: 'r/:reportID?/:reportActionID?',
        getRoute: (reportID: string, reportActionID?: string, referrer?: string) => {
            const baseRoute = reportActionID ? (`r/${reportID}/${reportActionID}` as const) : (`r/${reportID}` as const);
            const referrerParam = referrer ? `?referrer=${encodeURIComponent(referrer)}` : '';
            return `${baseRoute}${referrerParam}` as const;
        },
    },
    REPORT_AVATAR: {
        route: 'r/:reportID/avatar',
        getRoute: (reportID: string) => `r/${reportID}/avatar` as const,
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
        getRoute: (reportID: string, source: string) => `r/${reportID}/attachment?source=${encodeURIComponent(source)}` as const,
    },
    REPORT_PARTICIPANTS: {
        route: 'r/:reportID/participants',
        getRoute: (reportID: string) => `r/${reportID}/participants` as const,
    },
    REPORT_PARTICIPANTS_INVITE: {
        route: 'r/:reportID/participants/invite',
        getRoute: (reportID: string) => `r/${reportID}/participants/invite` as const,
    },
    REPORT_PARTICIPANTS_DETAILS: {
        route: 'r/:reportID/participants/:accountID',
        getRoute: (reportID: string, accountID: number) => `r/${reportID}/participants/${accountID}` as const,
    },
    REPORT_PARTICIPANTS_ROLE_SELECTION: {
        route: 'r/:reportID/participants/:accountID/role',
        getRoute: (reportID: string, accountID: number) => `r/${reportID}/participants/${accountID}/role` as const,
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
    REPORT_SETTINGS_GROUP_NAME: {
        route: 'r/:reportID/settings/group-name',
        getRoute: (reportID: string) => `r/${reportID}/settings/group-name` as const,
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
        route: 'r/:reportID/invite/:role?',
        getRoute: (reportID: string, role?: string) => `r/${reportID}/invite/${role}` as const,
    },
    MONEY_REQUEST_HOLD_REASON: {
        route: ':type/edit/reason/:transactionID?',
        getRoute: (type: ValueOf<typeof CONST.POLICY.TYPE>, transactionID: string, reportID: string, backTo: string) =>
            `${type}/edit/reason/${transactionID}?backTo=${backTo}&reportID=${reportID}` as const,
    },
    MONEY_REQUEST_CREATE: {
        route: ':action/:iouType/start/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string) => `${action as string}/${iouType as string}/start/${transactionID}/${reportID}` as const,
    },
    MONEY_REQUEST_STEP_SEND_FROM: {
        route: 'create/:iouType/from/:transactionID/:reportID',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`create/${iouType as string}/from/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_CONFIRMATION: {
        route: ':action/:iouType/confirmation/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string) =>
            `${action as string}/${iouType as string}/confirmation/${transactionID}/${reportID}` as const,
    },
    MONEY_REQUEST_STEP_AMOUNT: {
        route: ':action/:iouType/amount/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/amount/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_TAX_RATE: {
        route: ':action/:iouType/taxRate/:transactionID/:reportID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/taxRate/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_TAX_AMOUNT: {
        route: ':action/:iouType/taxAmount/:transactionID/:reportID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/taxAmount/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_CATEGORY: {
        route: ':action/:iouType/category/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '', reportActionID?: string) =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/category/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo),
    },
    MONEY_REQUEST_STEP_CURRENCY: {
        route: ':action/:iouType/currency/:transactionID/:reportID/:pageIndex?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, pageIndex = '', currency = '', backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/currency/${transactionID}/${reportID}/${pageIndex}?currency=${currency}`, backTo),
    },
    MONEY_REQUEST_STEP_DATE: {
        route: ':action/:iouType/date/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '', reportActionID?: string) =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/date/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo),
    },
    MONEY_REQUEST_STEP_DESCRIPTION: {
        route: ':action/:iouType/description/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '', reportActionID?: string) =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/description/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo),
    },
    MONEY_REQUEST_STEP_DISTANCE: {
        route: ':action/:iouType/distance/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/distance/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_DISTANCE_RATE: {
        route: ':action/:iouType/distanceRate/:transactionID/:reportID',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/distanceRate/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_MERCHANT: {
        route: ':action/:iouType/merchant/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/merchant/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_PARTICIPANTS: {
        route: ':action/:iouType/participants/:transactionID/:reportID',
        getRoute: (iouType: IOUType, transactionID: string, reportID: string, backTo = '', action: IOUAction = 'create') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/participants/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_SPLIT_PAYER: {
        route: ':action/:iouType/confirmation/:transactionID/:reportID/payer',
        getRoute: (action: ValueOf<typeof CONST.IOU.ACTION>, iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action}/${iouType}/confirmation/${transactionID}/${reportID}/payer`, backTo),
    },
    MONEY_REQUEST_STEP_SCAN: {
        route: ':action/:iouType/scan/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/scan/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_TAG: {
        route: ':action/:iouType/tag/:orderWeight/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, orderWeight: number, transactionID: string, reportID: string, backTo = '', reportActionID?: string) =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/tag/${orderWeight}/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo),
    },
    MONEY_REQUEST_STEP_WAYPOINT: {
        route: ':action/:iouType/waypoint/:transactionID/:reportID/:pageIndex',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID?: string, pageIndex = '', backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/waypoint/${transactionID}/${reportID}/${pageIndex}`, backTo),
    },
    // This URL is used as a redirect to one of the create tabs below. This is so that we can message users with a link
    // straight to those flows without needing to have optimistic transaction and report IDs.
    MONEY_REQUEST_START: {
        route: 'start/:iouType/:iouRequestType',
        getRoute: (iouType: IOUType, iouRequestType: IOURequestType) => `start/${iouType as string}/${iouRequestType}` as const,
    },
    MONEY_REQUEST_CREATE_TAB_DISTANCE: {
        route: ':action/:iouType/start/:transactionID/:reportID/distance',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string) => `create/${iouType as string}/start/${transactionID}/${reportID}/distance` as const,
    },
    MONEY_REQUEST_CREATE_TAB_MANUAL: {
        route: ':action/:iouType/start/:transactionID/:reportID/manual',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string) =>
            `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/manual` as const,
    },
    MONEY_REQUEST_CREATE_TAB_SCAN: {
        route: ':action/:iouType/start/:transactionID/:reportID/scan',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string) => `create/${iouType as string}/start/${transactionID}/${reportID}/scan` as const,
    },

    MONEY_REQUEST_STATE_SELECTOR: {
        route: 'submit/state',

        getRoute: (state?: string, backTo?: string, label?: string) =>
            `${getUrlWithBackToParam(`submit/state${state ? `?state=${encodeURIComponent(state)}` : ''}`, backTo)}${
                // the label param can be an empty string so we cannot use a nullish ?? operator
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                label ? `${backTo || state ? '&' : '?'}label=${encodeURIComponent(label)}` : ''
            }` as const,
    },
    IOU_REQUEST: 'submit/new',
    IOU_SEND: 'pay/new',
    IOU_SEND_ADD_BANK_ACCOUNT: 'pay/new/add-bank-account',
    IOU_SEND_ADD_DEBIT_CARD: 'pay/new/add-debit-card',
    IOU_SEND_ENABLE_PAYMENTS: 'pay/new/enable-payments',

    NEW_TASK: 'new/task',
    NEW_TASK_ASSIGNEE: 'new/task/assignee',
    NEW_TASK_SHARE_DESTINATION: 'new/task/share-destination',
    NEW_TASK_DETAILS: 'new/task/details',
    NEW_TASK_TITLE: 'new/task/title',
    NEW_TASK_DESCRIPTION: 'new/task/description',

    TEACHERS_UNITE: 'settings/teachersunite',
    I_KNOW_A_TEACHER: 'settings/teachersunite/i-know-a-teacher',
    I_AM_A_TEACHER: 'settings/teachersunite/i-am-a-teacher',
    INTRO_SCHOOL_PRINCIPAL: 'settings/teachersunite/intro-school-principal',

    ERECEIPT: {
        route: 'eReceipt/:transactionID',
        getRoute: (transactionID: string) => `eReceipt/${transactionID}` as const,
    },

    WORKSPACE_NEW: 'workspace/new',
    WORKSPACE_NEW_ROOM: 'workspace/new-room',
    WORKSPACE_INITIAL: {
        route: 'settings/workspaces/:policyID',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}` as const,
    },
    WORKSPACE_INVITE: {
        route: 'settings/workspaces/:policyID/invite',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/invite` as const,
    },
    WORKSPACE_INVITE_MESSAGE: {
        route: 'settings/workspaces/:policyID/invite-message',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/invite-message` as const,
    },
    WORKSPACE_PROFILE: {
        route: 'settings/workspaces/:policyID/profile',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/profile` as const,
    },
    WORKSPACE_PROFILE_ADDRESS: {
        route: 'settings/workspaces/:policyID/profile/address',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/profile/address` as const,
    },
    WORKSPACE_ACCOUNTING: {
        route: 'settings/workspaces/:policyID/accounting',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting` as const,
    },
    WORKSPACE_PROFILE_CURRENCY: {
        route: 'settings/workspaces/:policyID/profile/currency',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/profile/currency` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/account-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account/account-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/default-vendor-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account/default-vendor-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/card-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account/card-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/invoice-account-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/invoice-account-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/preferred-exporter',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/preferred-exporter` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/out-of-pocket-expense` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense/account-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/out-of-pocket-expense/account-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense/entity-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/out-of-pocket-expense/entity-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/export/date-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/export/date-select` as const,
    },
    WORKSPACE_PROFILE_NAME: {
        route: 'settings/workspaces/:policyID/profile/name',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/profile/name` as const,
    },
    WORKSPACE_PROFILE_DESCRIPTION: {
        route: 'settings/workspaces/:policyID/profile/description',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/profile/description` as const,
    },
    WORKSPACE_PROFILE_SHARE: {
        route: 'settings/workspaces/:policyID/profile/share',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/profile/share` as const,
    },
    WORKSPACE_AVATAR: {
        route: 'settings/workspaces/:policyID/avatar',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/avatar` as const,
    },
    WORKSPACE_JOIN_USER: {
        route: 'settings/workspaces/:policyID/join',
        getRoute: (policyID: string, inviterEmail: string) => `settings/workspaces/${policyID}/join?email=${inviterEmail}` as const,
    },
    WORKSPACE_SETTINGS_CURRENCY: {
        route: 'settings/workspaces/:policyID/settings/currency',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/settings/currency` as const,
    },
    WORKSPACE_WORKFLOWS: {
        route: 'settings/workspaces/:policyID/workflows',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/workflows` as const,
    },
    WORKSPACE_WORKFLOWS_PAYER: {
        route: 'workspace/:policyID/settings/workflows/payer',
        getRoute: (policyId: string) => `workspace/${policyId}/settings/workflows/payer` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVER: {
        route: 'settings/workspaces/:policyID/settings/workflows/approver',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/settings/workflows/approver` as const,
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY: {
        route: 'settings/workspaces/:policyID/settings/workflows/auto-reporting-frequency',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/settings/workflows/auto-reporting-frequency` as const,
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET: {
        route: 'settings/workspaces/:policyID/settings/workflows/auto-reporting-frequency/monthly-offset',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/settings/workflows/auto-reporting-frequency/monthly-offset` as const,
    },
    WORKSPACE_CARD: {
        route: 'settings/workspaces/:policyID/card',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/card` as const,
    },
    WORKSPACE_REIMBURSE: {
        route: 'settings/workspaces/:policyID/reimburse',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/reimburse` as const,
    },
    WORKSPACE_RATE_AND_UNIT: {
        route: 'settings/workspaces/:policyID/rateandunit',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rateandunit` as const,
    },
    WORKSPACE_RATE_AND_UNIT_RATE: {
        route: 'settings/workspaces/:policyID/rateandunit/rate',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rateandunit/rate` as const,
    },
    WORKSPACE_RATE_AND_UNIT_UNIT: {
        route: 'settings/workspaces/:policyID/rateandunit/unit',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rateandunit/unit` as const,
    },
    WORKSPACE_BILLS: {
        route: 'settings/workspaces/:policyID/bills',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/bills` as const,
    },
    WORKSPACE_INVOICES: {
        route: 'settings/workspaces/:policyID/invoices',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/invoices` as const,
    },
    WORKSPACE_TRAVEL: {
        route: 'settings/workspaces/:policyID/travel',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/travel` as const,
    },
    WORKSPACE_MEMBERS: {
        route: 'settings/workspaces/:policyID/members',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/members` as const,
    },
    POLICY_ACCOUNTING: {
        route: 'settings/workspaces/:policyID/accounting',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting` as const,
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/advanced',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/advanced` as const,
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/account-selector',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/account-selector` as const,
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/invoice-account-selector',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/invoice-account-selector` as const,
    },
    WORKSPACE_CATEGORIES: {
        route: 'settings/workspaces/:policyID/categories',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories` as const,
    },
    WORKSPACE_CATEGORY_SETTINGS: {
        route: 'settings/workspaces/:policyID/categories/:categoryName',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/categories/${encodeURIComponent(categoryName)}` as const,
    },
    WORKSPACE_CATEGORIES_SETTINGS: {
        route: 'settings/workspaces/:policyID/categories/settings',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories/settings` as const,
    },
    WORKSPACE_MORE_FEATURES: {
        route: 'settings/workspaces/:policyID/more-features',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/more-features` as const,
    },
    WORKSPACE_CATEGORY_CREATE: {
        route: 'settings/workspaces/:policyID/categories/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories/new` as const,
    },
    WORKSPACE_CATEGORY_EDIT: {
        route: 'settings/workspaces/:policyID/categories/:categoryName/edit',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/categories/${encodeURIComponent(categoryName)}/edit` as const,
    },
    WORKSPACE_TAGS: {
        route: 'settings/workspaces/:policyID/tags',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/tags` as const,
    },
    WORKSPACE_TAG_CREATE: {
        route: 'settings/workspaces/:policyID/tags/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/tags/new` as const,
    },
    WORKSPACE_TAGS_SETTINGS: {
        route: 'settings/workspaces/:policyID/tags/settings',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/tags/settings` as const,
    },
    WORKSPACE_EDIT_TAGS: {
        route: 'settings/workspaces/:policyID/tags/:orderWeight/edit',
        getRoute: (policyID: string, orderWeight: number) => `settings/workspaces/${policyID}/tags/${orderWeight}/edit` as const,
    },
    WORKSPACE_TAG_EDIT: {
        route: 'settings/workspace/:policyID/tag/:tagName/edit',
        getRoute: (policyID: string, tagName: string) => `settings/workspace/${policyID}/tag/${encodeURIComponent(tagName)}/edit` as const,
    },
    WORKSPACE_TAG_SETTINGS: {
        route: 'settings/workspaces/:policyID/tag/:tagName',
        getRoute: (policyID: string, tagName: string) => `settings/workspaces/${policyID}/tag/${encodeURIComponent(tagName)}` as const,
    },
    WORKSPACE_TAG_LIST_VIEW: {
        route: 'settings/workspaces/:policyID/tag-list/:orderWeight',
        getRoute: (policyID: string, orderWeight: number) => `settings/workspaces/${policyID}/tag-list/${orderWeight}` as const,
    },
    WORKSPACE_TAXES: {
        route: 'settings/workspaces/:policyID/taxes',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/taxes` as const,
    },
    WORKSPACE_TAXES_SETTINGS: {
        route: 'settings/workspaces/:policyID/taxes/settings',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/taxes/settings` as const,
    },
    WORKSPACE_TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT: {
        route: 'settings/workspaces/:policyID/taxes/settings/workspace-currency',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/taxes/settings/workspace-currency` as const,
    },
    WORKSPACE_TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT: {
        route: 'settings/workspaces/:policyID/taxes/settings/foreign-currency',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/taxes/settings/foreign-currency` as const,
    },
    WORKSPACE_TAXES_SETTINGS_CUSTOM_TAX_NAME: {
        route: 'settings/workspaces/:policyID/taxes/settings/tax-name',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/taxes/settings/tax-name` as const,
    },
    WORKSPACE_MEMBER_DETAILS: {
        route: 'settings/workspaces/:policyID/members/:accountID',
        getRoute: (policyID: string, accountID: number) => `settings/workspaces/${policyID}/members/${accountID}` as const,
    },
    WORKSPACE_MEMBER_ROLE_SELECTION: {
        route: 'settings/workspaces/:policyID/members/:accountID/role-selection',
        getRoute: (policyID: string, accountID: number) => `settings/workspaces/${policyID}/members/${accountID}/role-selection` as const,
    },
    WORKSPACE_OWNER_CHANGE_SUCCESS: {
        route: 'settings/workspaces/:policyID/change-owner/:accountID/success',
        getRoute: (policyID: string, accountID: number) => `settings/workspaces/${policyID}/change-owner/${accountID}/success` as const,
    },
    WORKSPACE_OWNER_CHANGE_ERROR: {
        route: 'settings/workspaces/:policyID/change-owner/:accountID/failure',
        getRoute: (policyID: string, accountID: number) => `settings/workspaces/${policyID}/change-owner/${accountID}/failure` as const,
    },
    WORKSPACE_OWNER_CHANGE_CHECK: {
        route: 'settings/workspaces/:policyID/change-owner/:accountID/:error',
        getRoute: (policyID: string, accountID: number, error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>) =>
            `settings/workspaces/${policyID}/change-owner/${accountID}/${error as string}` as const,
    },
    WORKSPACE_TAX_CREATE: {
        route: 'settings/workspaces/:policyID/taxes/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/taxes/new` as const,
    },
    WORKSPACE_TAX_EDIT: {
        route: 'settings/workspaces/:policyID/tax/:taxID',
        getRoute: (policyID: string, taxID: string) => `settings/workspaces/${policyID}/tax/${encodeURIComponent(taxID)}` as const,
    },
    WORKSPACE_TAX_NAME: {
        route: 'settings/workspaces/:policyID/tax/:taxID/name',
        getRoute: (policyID: string, taxID: string) => `settings/workspaces/${policyID}/tax/${encodeURIComponent(taxID)}/name` as const,
    },
    WORKSPACE_TAX_VALUE: {
        route: 'settings/workspaces/:policyID/tax/:taxID/value',
        getRoute: (policyID: string, taxID: string) => `settings/workspaces/${policyID}/tax/${encodeURIComponent(taxID)}/value` as const,
    },
    WORKSPACE_DISTANCE_RATES: {
        route: 'settings/workspaces/:policyID/distance-rates',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/distance-rates` as const,
    },
    WORKSPACE_CREATE_DISTANCE_RATE: {
        route: 'settings/workspaces/:policyID/distance-rates/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/distance-rates/new` as const,
    },
    WORKSPACE_DISTANCE_RATES_SETTINGS: {
        route: 'settings/workspaces/:policyID/distance-rates/settings',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/distance-rates/settings` as const,
    },
    WORKSPACE_DISTANCE_RATE_DETAILS: {
        route: 'settings/workspaces/:policyID/distance-rates/:rateID',
        getRoute: (policyID: string, rateID: string) => `settings/workspaces/${policyID}/distance-rates/${rateID}` as const,
    },
    WORKSPACE_DISTANCE_RATE_EDIT: {
        route: 'settings/workspaces/:policyID/distance-rates/:rateID/edit',
        getRoute: (policyID: string, rateID: string) => `settings/workspaces/${policyID}/distance-rates/${rateID}/edit` as const,
    },
    // Referral program promotion
    REFERRAL_DETAILS_MODAL: {
        route: 'referral/:contentType',
        getRoute: (contentType: string, backTo?: string) => getUrlWithBackToParam(`referral/${contentType}`, backTo),
    },
    PROCESS_MONEY_REQUEST_HOLD: 'hold-expense-educational',
    TRAVEL_MY_TRIPS: 'travel',
    TRAVEL_TCS: 'travel/terms',
    TRACK_TRAINING_MODAL: 'track-training',
    ONBOARDING_ROOT: 'onboarding',
    ONBOARDING_PERSONAL_DETAILS: 'onboarding/personal-details',
    ONBOARDING_WORK: 'onboarding/work',
    ONBOARDING_PURPOSE: 'onboarding/purpose',
    WELCOME_VIDEO_ROOT: 'onboarding/welcome-video',

    TRANSACTION_RECEIPT: {
        route: 'r/:reportID/transaction/:transactionID/receipt',
        getRoute: (reportID: string, transactionID: string) => `r/${reportID}/transaction/${transactionID}/receipt` as const,
    },
    POLICY_ACCOUNTING_XERO_IMPORT: {
        route: 'settings/workspaces/:policyID/accounting/xero/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/import` as const,
    },
    POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS: {
        route: 'settings/workspaces/:policyID/accounting/xero/import/accounts',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/import/accounts` as const,
    },
    POLICY_ACCOUNTING_XERO_ORGANIZATION: {
        route: 'settings/workspaces/:policyID/accounting/xero/organization/:currentOrganizationID',
        getRoute: (policyID: string, currentOrganizationID: string) => `settings/workspaces/${policyID}/accounting/xero/organization/${currentOrganizationID}` as const,
    },
    POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES: {
        route: 'settings/workspaces/:policyID/accounting/xero/import/tracking-categories',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/import/tracking-categories` as const,
    },
    POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP_COST_CENTERS: {
        route: 'settings/workspaces/:policyID/accounting/xero/import/tracking-categories/cost-centers',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/import/tracking-categories/cost-centers` as const,
    },
    POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP_REGION: {
        route: 'settings/workspaces/:policyID/accounting/xero/import/tracking-categories/region',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/import/tracking-categories/region` as const,
    },
    POLICY_ACCOUNTING_XERO_CUSTOMER: {
        route: '/settings/workspaces/:policyID/accounting/xero/import/customers',
        getRoute: (policyID: string) => `/settings/workspaces/${policyID}/accounting/xero/import/customers` as const,
    },
    POLICY_ACCOUNTING_XERO_TAXES: {
        route: 'settings/workspaces/:policyID/accounting/xero/import/taxes',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/import/taxes` as const,
    },
    POLICY_ACCOUNTING_XERO_EXPORT: {
        route: 'settings/workspaces/:policyID/accounting/xero/export',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/export` as const,
    },
    POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT: {
        route: '/settings/workspaces/:policyID/connections/xero/export/preferred-exporter/select',
        getRoute: (policyID: string) => `/settings/workspaces/${policyID}/connections/xero/export/preferred-exporter/select` as const,
    },
    POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/xero/export/purchase-bill-date-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/export/purchase-bill-date-select` as const,
    },
    POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/xero/export/bank-account-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/export/bank-account-select` as const,
    },
    POLICY_ACCOUNTING_XERO_ADVANCED: {
        route: 'settings/workspaces/:policyID/accounting/xero/advanced',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/advanced` as const,
    },
    POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR: {
        route: 'settings/workspaces/:policyID/accounting/xero/advanced/invoice-account-selector',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/advanced/invoice-account-selector` as const,
    },
    POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR: {
        route: 'settings/workspaces/:policyID/accounting/xero/advanced/bill-payment-account-selector',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/advanced/bill-payment-account-selector` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/import` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/import/accounts',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/import/accounts` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/import/classes',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/import/classes` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/import/customers',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/import/customers` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/import/locations',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/import/locations` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-online/import/taxes',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-online/import/taxes` as const,
    },
} as const;

/**
 * Proxy routes can be used to generate a correct url with dynamic values
 *
 * It will be used by HybridApp, that has no access to methods generating dynamic routes in NewDot
 */
const HYBRID_APP_ROUTES = {
    MONEY_REQUEST_CREATE: '/request/new/scan',
    MONEY_REQUEST_SUBMIT_CREATE: '/submit/new/scan',
} as const;

export {HYBRID_APP_ROUTES, getUrlWithBackToParam};
export default ROUTES;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractRouteName<TRoute> = TRoute extends {getRoute: (...args: any[]) => infer TRouteName} ? TRouteName : TRoute;

/**
 * Represents all routes in the app as a union of literal strings.
 */
type Route = {
    [K in keyof typeof ROUTES]: ExtractRouteName<(typeof ROUTES)[K]>;
}[keyof typeof ROUTES];

type RoutesValidationError = 'Error: One or more routes defined within `ROUTES` have not correctly used `as const` in their `getRoute` function return value.';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RouteIsPlainString = AssertTypesNotEqual<string, Route, RoutesValidationError>;

type HybridAppRoute = (typeof HYBRID_APP_ROUTES)[keyof typeof HYBRID_APP_ROUTES];

export type {HybridAppRoute, Route};
