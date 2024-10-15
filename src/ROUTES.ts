import type {TupleToUnion, ValueOf} from 'type-fest';
import type {SearchQueryString} from './components/Search/types';
import type CONST from './CONST';
import type {IOUAction, IOUType} from './CONST';
import type {IOURequestType} from './libs/actions/IOU';
import type {ConnectionName, SageIntacctMappingName} from './types/onyx/Policy';
import type AssertTypesNotEqual from './types/utils/AssertTypesNotEqual';

// This is a file containing constants for all the routes we want to be able to go to

/**
 * Builds a URL with an encoded URI component for the `backTo` param which can be added to the end of URLs
 */
function getUrlWithBackToParam<TUrl extends string>(url: TUrl, backTo?: string): `${TUrl}` | `${TUrl}?backTo=${string}` | `${TUrl}&backTo=${string}` {
    const backToParam = backTo ? (`${url.includes('?') ? '&' : '?'}backTo=${encodeURIComponent(backTo)}` as const) : '';
    return `${url}${backToParam}` as const;
}

const PUBLIC_SCREENS_ROUTES = {
    // If the user opens this route, we'll redirect them to the path saved in the last visited path or to the home page if the last visited path is empty.
    ROOT: '',
    TRANSITION_BETWEEN_APPS: 'transition',
    CONNECTION_COMPLETE: 'connection-complete',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    UNLINK_LOGIN: 'u/:accountID/:validateCode',
    APPLE_SIGN_IN: 'sign-in-with-apple',
    GOOGLE_SIGN_IN: 'sign-in-with-google',
    SAML_SIGN_IN: 'sign-in-with-saml',
} as const;

const ROUTES = {
    ...PUBLIC_SCREENS_ROUTES,
    // This route renders the list of reports.
    HOME: 'home',

    SEARCH_CENTRAL_PANE: {
        route: 'search',
        getRoute: ({query, name}: {query: SearchQueryString; name?: string}) => `search?q=${encodeURIComponent(query)}${name ? `&name=${name}` : ''}` as const,
    },
    SEARCH_SAVED_SEARCH_RENAME: {
        route: 'search/saved-search/rename',
        getRoute: ({name, jsonQuery}: {name: string; jsonQuery: SearchQueryString}) => `search/saved-search/rename?name=${name}&q=${jsonQuery}` as const,
    },
    SEARCH_ADVANCED_FILTERS: 'search/filters',
    SEARCH_ADVANCED_FILTERS_DATE: 'search/filters/date',
    SEARCH_ADVANCED_FILTERS_CURRENCY: 'search/filters/currency',
    SEARCH_ADVANCED_FILTERS_MERCHANT: 'search/filters/merchant',
    SEARCH_ADVANCED_FILTERS_DESCRIPTION: 'search/filters/description',
    SEARCH_ADVANCED_FILTERS_REPORT_ID: 'search/filters/reportID',
    SEARCH_ADVANCED_FILTERS_AMOUNT: 'search/filters/amount',
    SEARCH_ADVANCED_FILTERS_CATEGORY: 'search/filters/category',
    SEARCH_ADVANCED_FILTERS_KEYWORD: 'search/filters/keyword',
    SEARCH_ADVANCED_FILTERS_CARD: 'search/filters/card',
    SEARCH_ADVANCED_FILTERS_TAX_RATE: 'search/filters/taxRate',
    SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE: 'search/filters/expenseType',
    SEARCH_ADVANCED_FILTERS_TAG: 'search/filters/tag',
    SEARCH_ADVANCED_FILTERS_FROM: 'search/filters/from',
    SEARCH_ADVANCED_FILTERS_TO: 'search/filters/to',
    SEARCH_ADVANCED_FILTERS_IN: 'search/filters/in',
    SEARCH_REPORT: {
        route: 'search/view/:reportID/:reportActionID?',
        getRoute: ({reportID, reportActionID, backTo}: {reportID: string; reportActionID?: string; backTo?: string}) => {
            const baseRoute = reportActionID ? (`search/view/${reportID}/${reportActionID}` as const) : (`search/view/${reportID}` as const);
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    },
    TRANSACTION_HOLD_REASON_RHP: 'search/hold',

    // This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated
    CONCIERGE: 'concierge',
    TRACK_EXPENSE: 'track-expense',
    SUBMIT_EXPENSE: 'submit-expense',
    FLAG_COMMENT: {
        route: 'flag/:reportID/:reportActionID',
        getRoute: (reportID: string, reportActionID: string, backTo?: string) => getUrlWithBackToParam(`flag/${reportID}/${reportActionID}` as const, backTo),
    },
    CHAT_FINDER: 'chat-finder',
    PROFILE: {
        route: 'a/:accountID',
        getRoute: (accountID?: string | number, backTo?: string, login?: string) => {
            const baseRoute = getUrlWithBackToParam(`a/${accountID}`, backTo);
            const loginParam = login ? `?login=${encodeURIComponent(login)}` : '';
            return `${baseRoute}${loginParam}` as const;
        },
    },
    PROFILE_AVATAR: {
        route: 'a/:accountID/avatar',
        getRoute: (accountID: string | number) => `a/${accountID}/avatar` as const,
    },

    GET_ASSISTANCE: {
        route: 'get-assistance/:taskID',
        getRoute: (taskID: string, backTo: string) => getUrlWithBackToParam(`get-assistance/${taskID}`, backTo),
    },
    DESKTOP_SIGN_IN_REDIRECT: 'desktop-signin-redirect',

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
    SETTINGS_CHANGE_CURRENCY: 'settings/add-payment-card/change-currency',
    SETTINGS_SHARE_CODE: 'settings/shareCode',
    SETTINGS_DISPLAY_NAME: 'settings/profile/display-name',
    SETTINGS_TIMEZONE: 'settings/profile/timezone',
    SETTINGS_TIMEZONE_SELECT: 'settings/profile/timezone/select',
    SETTINGS_PRONOUNS: 'settings/profile/pronouns',
    SETTINGS_PREFERENCES: 'settings/preferences',
    SETTINGS_SUBSCRIPTION: 'settings/subscription',
    SETTINGS_SUBSCRIPTION_SIZE: {
        route: 'settings/subscription/subscription-size',
        getRoute: (canChangeSize: 0 | 1) => `settings/subscription/subscription-size?canChangeSize=${canChangeSize}` as const,
    },
    SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD: 'settings/subscription/add-payment-card',
    SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY: 'settings/subscription/change-billing-currency',
    SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY: 'settings/subscription/add-payment-card/change-payment-currency',
    SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY: 'settings/subscription/disable-auto-renew-survey',
    SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION: 'settings/subscription/request-early-cancellation-survey',
    SETTINGS_PRIORITY_MODE: 'settings/preferences/priority-mode',
    SETTINGS_LANGUAGE: 'settings/preferences/language',
    SETTINGS_THEME: 'settings/preferences/theme',
    SETTINGS_WORKSPACES: 'settings/workspaces',
    SETTINGS_SECURITY: 'settings/security',
    SETTINGS_CLOSE: 'settings/security/closeAccount',
    SETTINGS_ADD_DELEGATE: 'settings/security/delegate',
    SETTINGS_DELEGATE_ROLE: {
        route: 'settings/security/delegate/:login/role/:role',
        getRoute: (login: string, role?: string) => `settings/security/delegate/${encodeURIComponent(login)}/role/${role}` as const,
    },
    SETTINGS_UPDATE_DELEGATE_ROLE: {
        route: 'settings/security/delegate/:login/update-role/:currentRole',
        getRoute: (login: string, currentRole: string) => `settings/security/delegate/${encodeURIComponent(login)}/update-role/${currentRole}` as const,
    },
    SETTINGS_UPDATE_DELEGATE_ROLE_MAGIC_CODE: {
        route: 'settings/security/delegate/:login/update-role/:role/magic-code',
        getRoute: (login: string, role: string) => `settings/security/delegate/${encodeURIComponent(login)}/update-role/${role}/magic-code` as const,
    },
    SETTINGS_DELEGATE_CONFIRM: {
        route: 'settings/security/delegate/:login/role/:role/confirm',
        getRoute: (login: string, role: string) => `settings/security/delegate/${encodeURIComponent(login)}/role/${role}/confirm` as const,
    },
    SETTINGS_DELEGATE_MAGIC_CODE: {
        route: 'settings/security/delegate/:login/role/:role/magic-code',
        getRoute: (login: string, role: string) => `settings/security/delegate/${encodeURIComponent(login)}/role/${role}/magic-code` as const,
    },
    SETTINGS_ABOUT: 'settings/about',
    SETTINGS_APP_DOWNLOAD_LINKS: 'settings/about/app-download-links',
    SETTINGS_WALLET: 'settings/wallet',
    SETTINGS_WALLET_VERIFY_ACCOUNT: {route: 'settings/wallet/verify', getRoute: (backTo?: string) => getUrlWithBackToParam('settings/wallet/verify', backTo)},
    SETTINGS_WALLET_DOMAINCARD: {
        route: 'settings/wallet/card/:cardID?',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}` as const,
    },
    SETTINGS_DOMAINCARD_DETAIL: {
        route: 'settings/card/:cardID?',
        getRoute: (cardID: string) => `settings/card/${cardID}` as const,
    },
    SETTINGS_REPORT_FRAUD: {
        route: 'settings/wallet/card/:cardID/report-virtual-fraud',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/report-virtual-fraud` as const,
    },
    SETTINGS_DOMAINCARD_REPORT_FRAUD: {
        route: 'settings/card/:cardID/report-virtual-fraud',
        getRoute: (cardID: string) => `settings/card/${cardID}/report-virtual-fraud` as const,
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
        getRoute: (contactMethod: string, backTo?: string) => getUrlWithBackToParam(`settings/profile/contact-methods/${encodeURIComponent(contactMethod)}/details`, backTo),
    },
    SETINGS_CONTACT_METHOD_VALIDATE_ACTION: 'settings/profile/contact-methods/validate-action',
    SETTINGS_NEW_CONTACT_METHOD: {
        route: 'settings/profile/contact-methods/new',
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/profile/contact-methods/new', backTo),
    },
    SETTINGS_2FA: {
        route: 'settings/security/two-factor-auth',
        getRoute: (backTo?: string, forwardTo?: string) =>
            getUrlWithBackToParam(forwardTo ? `settings/security/two-factor-auth?forwardTo=${encodeURIComponent(forwardTo)}` : 'settings/security/two-factor-auth', backTo),
    },
    SETTINGS_STATUS: 'settings/profile/status',

    SETTINGS_STATUS_CLEAR_AFTER: 'settings/profile/status/clear-after',
    SETTINGS_STATUS_CLEAR_AFTER_DATE: 'settings/profile/status/clear-after/date',
    SETTINGS_STATUS_CLEAR_AFTER_TIME: 'settings/profile/status/clear-after/time',
    SETTINGS_TROUBLESHOOT: 'settings/troubleshoot',
    SETTINGS_CONSOLE: {
        route: 'settings/troubleshoot/console',
        getRoute: (backTo?: string) => getUrlWithBackToParam(`settings/troubleshoot/console`, backTo),
    },
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
        getRoute: (reportID: string, policyID?: string) => {
            if (policyID) {
                return `r/${reportID}/avatar?policyID=${policyID}` as const;
            }
            return `r/${reportID}/avatar` as const;
        },
    },
    EDIT_CURRENCY_REQUEST: {
        route: 'r/:threadReportID/edit/currency',
        getRoute: (threadReportID: string, currency: string, backTo: string) => `r/${threadReportID}/edit/currency?currency=${currency}&backTo=${backTo}` as const,
    },
    EDIT_REPORT_FIELD_REQUEST: {
        route: 'r/:reportID/edit/policyField/:policyID/:fieldID',
        getRoute: (reportID: string, policyID: string, fieldID: string, backTo?: string) =>
            getUrlWithBackToParam(`r/${reportID}/edit/policyField/${policyID}/${encodeURIComponent(fieldID)}` as const, backTo),
    },
    REPORT_WITH_ID_DETAILS_SHARE_CODE: {
        route: 'r/:reportID/details/shareCode',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/details/shareCode` as const, backTo),
    },
    ATTACHMENTS: {
        route: 'attachment',
        getRoute: (reportID: string, type: ValueOf<typeof CONST.ATTACHMENT_TYPE>, url: string, accountID?: number, isAuthTokenRequired?: boolean) => {
            const reportParam = reportID ? `&reportID=${reportID}` : '';
            const accountParam = accountID ? `&accountID=${accountID}` : '';
            const authTokenParam = isAuthTokenRequired ? '&isAuthTokenRequired=true' : '';
            return `attachment?source=${encodeURIComponent(url)}&type=${type}${reportParam}${accountParam}${authTokenParam}` as const;
        },
    },
    REPORT_PARTICIPANTS: {
        route: 'r/:reportID/participants',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants` as const, backTo),
    },
    REPORT_PARTICIPANTS_INVITE: {
        route: 'r/:reportID/participants/invite',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants/invite` as const, backTo),
    },
    REPORT_PARTICIPANTS_DETAILS: {
        route: 'r/:reportID/participants/:accountID',
        getRoute: (reportID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants/${accountID}` as const, backTo),
    },
    REPORT_PARTICIPANTS_ROLE_SELECTION: {
        route: 'r/:reportID/participants/:accountID/role',
        getRoute: (reportID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants/${accountID}/role` as const, backTo),
    },
    REPORT_WITH_ID_DETAILS: {
        route: 'r/:reportID/details',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/details`, backTo),
    },
    REPORT_WITH_ID_DETAILS_EXPORT: {
        route: 'r/:reportID/details/export/:connectionName',
        getRoute: (reportID: string, connectionName: ConnectionName, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/details/export/${connectionName}` as const, backTo),
    },
    REPORT_SETTINGS: {
        route: 'r/:reportID/settings',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings` as const, backTo),
    },
    REPORT_SETTINGS_NAME: {
        route: 'r/:reportID/settings/name',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/name` as const, backTo),
    },
    REPORT_SETTINGS_NOTIFICATION_PREFERENCES: {
        route: 'r/:reportID/settings/notification-preferences',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/notification-preferences` as const, backTo),
    },
    REPORT_SETTINGS_WRITE_CAPABILITY: {
        route: 'r/:reportID/settings/who-can-post',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/who-can-post` as const, backTo),
    },
    REPORT_SETTINGS_VISIBILITY: {
        route: 'r/:reportID/settings/visibility',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/visibility` as const, backTo),
    },
    SPLIT_BILL_DETAILS: {
        route: 'r/:reportID/split/:reportActionID',
        getRoute: (reportID: string, reportActionID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/split/${reportActionID}` as const, backTo),
    },
    TASK_TITLE: {
        route: 'r/:reportID/title',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/title` as const, backTo),
    },
    REPORT_DESCRIPTION: {
        route: 'r/:reportID/description',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/description` as const, backTo),
    },
    TASK_ASSIGNEE: {
        route: 'r/:reportID/assignee',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/assignee` as const, backTo),
    },
    PRIVATE_NOTES_LIST: {
        route: 'r/:reportID/notes',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/notes` as const, backTo),
    },
    PRIVATE_NOTES_EDIT: {
        route: 'r/:reportID/notes/:accountID/edit',
        getRoute: (reportID: string, accountID: string | number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/notes/${accountID}/edit` as const, backTo),
    },
    ROOM_MEMBERS: {
        route: 'r/:reportID/members',
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/members` as const, backTo),
    },
    ROOM_MEMBER_DETAILS: {
        route: 'r/:reportID/members/:accountID',
        getRoute: (reportID: string, accountID: string | number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/members/${accountID}` as const, backTo),
    },
    ROOM_INVITE: {
        route: 'r/:reportID/invite/:role?',
        getRoute: (reportID: string, role?: string, backTo?: string) => {
            const route = role ? (`r/${reportID}/invite/${role}` as const) : (`r/${reportID}/invite` as const);
            return getUrlWithBackToParam(route, backTo);
        },
    },
    MONEY_REQUEST_HOLD_REASON: {
        route: ':type/edit/reason/:transactionID?/:searchHash?',
        getRoute: (type: ValueOf<typeof CONST.POLICY.TYPE>, transactionID: string, reportID: string, backTo: string, searchHash?: number) => {
            const route = searchHash
                ? (`${type}/edit/reason/${transactionID}/${searchHash}/?backTo=${backTo}&reportID=${reportID}` as const)
                : (`${type}/edit/reason/${transactionID}/?backTo=${backTo}&reportID=${reportID}` as const);
            return route;
        },
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
    MONEY_REQUEST_STEP_COMPANY_INFO: {
        route: 'create/:iouType/company-info/:transactionID/:reportID',
        getRoute: (iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string, backTo = '') =>
            getUrlWithBackToParam(`create/${iouType as string}/company-info/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_CONFIRMATION: {
        route: ':action/:iouType/confirmation/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, participantsAutoAssigned?: boolean) =>
            `${action as string}/${iouType as string}/confirmation/${transactionID}/${reportID}${participantsAutoAssigned ? '?participantsAutoAssigned=true' : ''}` as const,
    },
    MONEY_REQUEST_STEP_AMOUNT: {
        route: ':action/:iouType/amount/:transactionID/:reportID/:pageIndex?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, pageIndex: string, backTo = '') =>
            getUrlWithBackToParam(`${action as string}/${iouType as string}/amount/${transactionID}/${reportID}/${pageIndex}`, backTo),
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
    SETTINGS_CATEGORIES_ROOT: {
        route: 'settings/:policyID/categories',
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories`, backTo),
    },
    SETTINGS_CATEGORY_SETTINGS: {
        route: 'settings/:policyID/category/:categoryName',
        getRoute: (policyID: string, categoryName: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/category/${encodeURIComponent(categoryName)}`, backTo),
    },
    SETTINGS_CATEGORIES_SETTINGS: {
        route: 'settings/:policyID/categories/settings',
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories/settings`, backTo),
    },
    SETTINGS_CATEGORY_CREATE: {
        route: 'settings/:policyID/categories/new',
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories/new`, backTo),
    },
    SETTINGS_CATEGORY_EDIT: {
        route: 'settings/:policyID/category/:categoryName/edit',
        getRoute: (policyID: string, categoryName: string, backTo = '') => getUrlWithBackToParam(`settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/edit`, backTo),
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
    SETTINGS_TAGS_ROOT: {
        route: 'settings/:policyID/tags',
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/tags`, backTo),
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

    NEW_TASK: {
        route: 'new/task',
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task', backTo),
    },
    NEW_TASK_ASSIGNEE: {
        route: 'new/task/assignee',
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task/assignee', backTo),
    },
    NEW_TASK_SHARE_DESTINATION: 'new/task/share-destination',
    NEW_TASK_DETAILS: {
        route: 'new/task/details',
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task/details', backTo),
    },
    NEW_TASK_TITLE: {
        route: 'new/task/title',
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task/title', backTo),
    },
    NEW_TASK_DESCRIPTION: {
        route: 'new/task/description',
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task/description', backTo),
    },

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
        getRoute: (policyID: string, backTo?: string) => `${getUrlWithBackToParam(`settings/workspaces/${policyID}`, backTo)}` as const,
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
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`settings/workspaces/${policyID}/profile/address` as const, backTo),
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
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/export/date-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/export/date-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/export/preferred-exporter',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/export/preferred-exporter` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/export/out-of-pocket-expense` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/export',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/export` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/setup-modal',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/setup-modal` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/setup-required-device',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/setup-required-device` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/trigger-first-sync',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/trigger-first-sync` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/import` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/import/accounts',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/import/accounts` as const,
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/import/classes',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/import/classes` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS: {
        route: 'settings/workspaces/:policyID/accounting/quickbooks-desktop/import/classes/displayed_as',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/quickbooks-desktop/import/classes/displayed_as` as const,
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
    WORKSPACE_WORKFLOWS_APPROVALS_NEW: {
        route: 'settings/workspaces/:policyID/workflows/approvals/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/workflows/approvals/new` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVALS_EDIT: {
        route: 'settings/workspaces/:policyID/workflows/approvals/:firstApproverEmail/edit',
        getRoute: (policyID: string, firstApproverEmail: string) => `settings/workspaces/${policyID}/workflows/approvals/${encodeURIComponent(firstApproverEmail)}/edit` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM: {
        route: 'settings/workspaces/:policyID/workflows/approvals/expenses-from',
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`settings/workspaces/${policyID}/workflows/approvals/expenses-from` as const, backTo),
    },
    WORKSPACE_WORKFLOWS_APPROVALS_APPROVER: {
        route: 'settings/workspaces/:policyID/workflows/approvals/approver',
        getRoute: (policyID: string, approverIndex: number, backTo?: string) =>
            getUrlWithBackToParam(`settings/workspaces/${policyID}/workflows/approvals/approver?approverIndex=${approverIndex}` as const, backTo),
    },
    WORKSPACE_WORKFLOWS_PAYER: {
        route: 'settings/workspaces/:policyID/workflows/payer',
        getRoute: (policyId: string) => `settings/workspaces/${policyId}/workflows/payer` as const,
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY: {
        route: 'settings/workspaces/:policyID/workflows/auto-reporting-frequency',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/workflows/auto-reporting-frequency` as const,
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET: {
        route: 'settings/workspaces/:policyID/workflows/auto-reporting-frequency/monthly-offset',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/workflows/auto-reporting-frequency/monthly-offset` as const,
    },
    WORKSPACE_INVOICES: {
        route: 'settings/workspaces/:policyID/invoices',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/invoices` as const,
    },
    WORKSPACE_INVOICES_COMPANY_NAME: {
        route: 'settings/workspaces/:policyID/invoices/company-name',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/invoices/company-name` as const,
    },
    WORKSPACE_INVOICES_COMPANY_WEBSITE: {
        route: 'settings/workspaces/:policyID/invoices/company-website',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/invoices/company-website` as const,
    },
    WORKSPACE_MEMBERS: {
        route: 'settings/workspaces/:policyID/members',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/members` as const,
    },
    WORKSPACE_MEMBERS_IMPORT: {
        route: 'settings/workspaces/:policyID/members/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/members/import` as const,
    },
    WORKSPACE_MEMBERS_IMPORTED: {
        route: 'settings/workspaces/:policyID/members/imported',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/members/imported` as const,
    },
    POLICY_ACCOUNTING: {
        route: 'settings/workspaces/:policyID/accounting',
        getRoute: (policyID: string, newConnectionName?: ConnectionName, integrationToDisconnect?: ConnectionName, shouldDisconnectIntegrationBeforeConnecting?: boolean) => {
            let queryParams = '';
            if (newConnectionName) {
                queryParams += `?newConnectionName=${newConnectionName}`;
                if (integrationToDisconnect) {
                    queryParams += `&integrationToDisconnect=${integrationToDisconnect}`;
                }
                if (shouldDisconnectIntegrationBeforeConnecting !== undefined) {
                    queryParams += `&shouldDisconnectIntegrationBeforeConnecting=${shouldDisconnectIntegrationBeforeConnecting}`;
                }
            }
            return `settings/workspaces/${policyID}/accounting${queryParams}` as const;
        },
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
    WORKSPACE_ACCOUNTING_CARD_RECONCILIATION: {
        route: 'settings/workspaces/:policyID/accounting/:connection/card-reconciliation',
        getRoute: (policyID: string, connection?: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>) => `settings/workspaces/${policyID}/accounting/${connection}/card-reconciliation` as const,
    },
    WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS: {
        route: 'settings/workspaces/:policyID/accounting/:connection/card-reconciliation/account',
        getRoute: (policyID: string, connection?: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>) =>
            `settings/workspaces/${policyID}/accounting/${connection}/card-reconciliation/account` as const,
    },
    WORKSPACE_CATEGORIES: {
        route: 'settings/workspaces/:policyID/categories',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories` as const,
    },
    WORKSPACE_CATEGORY_SETTINGS: {
        route: 'settings/workspaces/:policyID/category/:categoryName',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}` as const,
    },
    WORKSPACE_UPGRADE: {
        route: 'settings/workspaces/:policyID/upgrade/:featureName',
        getRoute: (policyID: string, featureName: string, backTo?: string) =>
            getUrlWithBackToParam(`settings/workspaces/${policyID}/upgrade/${encodeURIComponent(featureName)}` as const, backTo),
    },
    WORKSPACE_CATEGORIES_SETTINGS: {
        route: 'settings/workspaces/:policyID/categories/settings',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories/settings` as const,
    },
    WORKSPACE_CATEGORIES_IMPORT: {
        route: 'settings/workspaces/:policyID/categories/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories/import` as const,
    },
    WORKSPACE_CATEGORIES_IMPORTED: {
        route: 'settings/workspaces/:policyID/categories/imported',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories/imported` as const,
    },
    WORKSPACE_CATEGORY_CREATE: {
        route: 'settings/workspaces/:policyID/categories/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/categories/new` as const,
    },
    WORKSPACE_CATEGORY_EDIT: {
        route: 'settings/workspaces/:policyID/category/:categoryName/edit',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/edit` as const,
    },
    WORKSPACE_CATEGORY_PAYROLL_CODE: {
        route: 'settings/workspaces/:policyID/category/:categoryName/payroll-code',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/payroll-code` as const,
    },
    WORKSPACE_CATEGORY_GL_CODE: {
        route: 'settings/workspaces/:policyID/category/:categoryName/gl-code',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/gl-code` as const,
    },
    WORSKPACE_CATEGORY_DEFAULT_TAX_RATE: {
        route: 'settings/workspaces/:policyID/category/:categoryName/tax-rate',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/tax-rate` as const,
    },
    WORSKPACE_CATEGORY_FLAG_AMOUNTS_OVER: {
        route: 'settings/workspaces/:policyID/category/:categoryName/flag-amounts',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/flag-amounts` as const,
    },
    WORSKPACE_CATEGORY_DESCRIPTION_HINT: {
        route: 'settings/workspaces/:policyID/category/:categoryName/description-hint',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/description-hint` as const,
    },
    WORSKPACE_CATEGORY_REQUIRE_RECEIPTS_OVER: {
        route: 'settings/workspaces/:policyID/category/:categoryName/require-receipts-over',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/require-receipts-over` as const,
    },
    WORSKPACE_CATEGORY_APPROVER: {
        route: 'settings/workspaces/:policyID/category/:categoryName/approver',
        getRoute: (policyID: string, categoryName: string) => `settings/workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/approver` as const,
    },
    WORKSPACE_MORE_FEATURES: {
        route: 'settings/workspaces/:policyID/more-features',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/more-features` as const,
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
        route: 'settings/workspaces/:policyID/tag/:orderWeight/:tagName/edit',
        getRoute: (policyID: string, orderWeight: number, tagName: string) => `settings/workspaces/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/edit` as const,
    },
    WORKSPACE_TAG_SETTINGS: {
        route: 'settings/workspaces/:policyID/tag/:orderWeight/:tagName',
        getRoute: (policyID: string, orderWeight: number, tagName: string) => `settings/workspaces/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}` as const,
    },
    WORKSPACE_TAG_APPROVER: {
        route: 'settings/workspaces/:policyID/tag/:orderWeight/:tagName/approver',
        getRoute: (policyID: string, orderWeight: number, tagName: string) => `settings/workspaces/${policyID}/tag/${orderWeight}/${tagName}/approver` as const,
    },
    WORKSPACE_TAG_LIST_VIEW: {
        route: 'settings/workspaces/:policyID/tag-list/:orderWeight',
        getRoute: (policyID: string, orderWeight: number) => `settings/workspaces/${policyID}/tag-list/${orderWeight}` as const,
    },
    WORKSPACE_TAG_GL_CODE: {
        route: 'settings/workspaces/:policyID/tag/:orderWeight/:tagName/gl-code',
        getRoute: (policyID: string, orderWeight: number, tagName: string) => `settings/workspaces/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/gl-code` as const,
    },
    WORKSPACE_TAGS_IMPORT: {
        route: 'settings/workspaces/:policyID/tags/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/tags/import` as const,
    },
    WORKSPACE_TAGS_IMPORTED: {
        route: 'settings/workspaces/:policyID/tags/imported',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/tags/imported` as const,
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
    WORKSPACE_MEMBER_NEW_CARD: {
        route: 'settings/workspaces/:policyID/members/:accountID/new-card',
        getRoute: (policyID: string, accountID: number) => `settings/workspaces/${policyID}/members/${accountID}/new-card` as const,
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
    WORKSPACE_TAX_CODE: {
        route: 'settings/workspaces/:policyID/tax/:taxID/tax-code',
        getRoute: (policyID: string, taxID: string) => `settings/workspaces/${policyID}/tax/${encodeURIComponent(taxID)}/tax-code` as const,
    },
    WORKSPACE_REPORT_FIELDS: {
        route: 'settings/workspaces/:policyID/reportFields',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/reportFields` as const,
    },
    WORKSPACE_CREATE_REPORT_FIELD: {
        route: 'settings/workspaces/:policyID/reportFields/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/reportFields/new` as const,
    },
    WORKSPACE_REPORT_FIELDS_SETTINGS: {
        route: 'settings/workspaces/:policyID/reportFields/:reportFieldID/edit',
        getRoute: (policyID: string, reportFieldID: string) => `settings/workspaces/${policyID}/reportFields/${encodeURIComponent(reportFieldID)}/edit` as const,
    },
    WORKSPACE_REPORT_FIELDS_LIST_VALUES: {
        route: 'settings/workspaces/:policyID/reportFields/listValues/:reportFieldID?',
        getRoute: (policyID: string, reportFieldID?: string) => `settings/workspaces/${policyID}/reportFields/listValues/${encodeURIComponent(reportFieldID ?? '')}` as const,
    },
    WORKSPACE_REPORT_FIELDS_ADD_VALUE: {
        route: 'settings/workspaces/:policyID/reportFields/addValue/:reportFieldID?',
        getRoute: (policyID: string, reportFieldID?: string) => `settings/workspaces/${policyID}/reportFields/addValue/${encodeURIComponent(reportFieldID ?? '')}` as const,
    },
    WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS: {
        route: 'settings/workspaces/:policyID/reportFields/:valueIndex/:reportFieldID?',
        getRoute: (policyID: string, valueIndex: number, reportFieldID?: string) =>
            `settings/workspaces/${policyID}/reportFields/${valueIndex}/${encodeURIComponent(reportFieldID ?? '')}` as const,
    },
    WORKSPACE_REPORT_FIELDS_EDIT_VALUE: {
        route: 'settings/workspaces/:policyID/reportFields/new/:valueIndex/edit',
        getRoute: (policyID: string, valueIndex: number) => `settings/workspaces/${policyID}/reportFields/new/${valueIndex}/edit` as const,
    },
    WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE: {
        route: 'settings/workspaces/:policyID/reportFields/:reportFieldID/edit/initialValue',
        getRoute: (policyID: string, reportFieldID: string) => `settings/workspaces/${policyID}/reportFields/${encodeURIComponent(reportFieldID)}/edit/initialValue` as const,
    },
    WORKSPACE_COMPANY_CARDS: {
        route: 'settings/workspaces/:policyID/company-cards',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/company-cards` as const,
    },
    WORKSPACE_COMPANY_CARDS_ADD_NEW: {
        route: 'settings/workspaces/:policyID/company-cards/add-card-feed',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/company-cards/add-card-feed` as const,
    },
    WORKSPACE_COMPANY_CARDS_SELECT_FEED: {
        route: 'settings/workspaces/:policyID/company-cards/select-feed',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/company-cards/select-feed` as const,
    },
    WORKSPACE_COMPANY_CARDS_ASSIGN_CARD: {
        route: 'settings/workspaces/:policyID/company-cards/:feed/assign-card',
        getRoute: (policyID: string, feed: string) => `settings/workspaces/${policyID}/company-cards/${feed}/assign-card` as const,
    },
    WORKSPACE_COMPANY_CARD_DETAILS: {
        route: 'settings/workspaces/:policyID/company-cards/:bank/:cardID',
        getRoute: (policyID: string, cardID: string, bank: string, backTo?: string) => getUrlWithBackToParam(`settings/workspaces/${policyID}/company-cards/${bank}/${cardID}`, backTo),
    },
    WORKSPACE_COMPANY_CARD_NAME: {
        route: 'settings/workspaces/:policyID/company-cards/:bank/:cardID/edit/name',
        getRoute: (policyID: string, cardID: string, bank: string) => `settings/workspaces/${policyID}/company-cards/${bank}/${cardID}/edit/name` as const,
    },
    WORKSPACE_COMPANY_CARD_EXPORT: {
        route: 'settings/workspaces/:policyID/company-cards/:bank/:cardID/edit/export',
        getRoute: (policyID: string, cardID: string, bank: string) => `settings/workspaces/${policyID}/company-cards/${bank}/${cardID}/edit/export` as const,
    },
    WORKSPACE_EXPENSIFY_CARD: {
        route: 'settings/workspaces/:policyID/expensify-card',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/expensify-card` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_DETAILS: {
        route: 'settings/workspaces/:policyID/expensify-card/:cardID',
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`settings/workspaces/${policyID}/expensify-card/${cardID}`, backTo),
    },
    EXPENSIFY_CARD_DETAILS: {
        route: 'settings/:policyID/expensify-card/:cardID',
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`settings/${policyID}/expensify-card/${cardID}`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_NAME: {
        route: 'settings/workspaces/:policyID/expensify-card/:cardID/edit/name',
        getRoute: (policyID: string, cardID: string) => `settings/workspaces/${policyID}/expensify-card/${cardID}/edit/name` as const,
    },
    EXPENSIFY_CARD_NAME: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/name',
        getRoute: (policyID: string, cardID: string) => `settings/${policyID}/expensify-card/${cardID}/edit/name` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_LIMIT: {
        route: 'settings/workspaces/:policyID/expensify-card/:cardID/edit/limit',
        getRoute: (policyID: string, cardID: string) => `settings/workspaces/${policyID}/expensify-card/${cardID}/edit/limit` as const,
    },
    EXPENSIFY_CARD_LIMIT: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/limit',
        getRoute: (policyID: string, cardID: string) => `settings/${policyID}/expensify-card/${cardID}/edit/limit` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE: {
        route: 'settings/workspaces/:policyID/expensify-card/:cardID/edit/limit-type',
        getRoute: (policyID: string, cardID: string) => `settings/workspaces/${policyID}/expensify-card/${cardID}/edit/limit-type` as const,
    },
    EXPENSIFY_CARD_LIMIT_TYPE: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/limit-type',
        getRoute: (policyID: string, cardID: string) => `settings/${policyID}/expensify-card/${cardID}/edit/limit-type` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW: {
        route: 'settings/workspaces/:policyID/expensify-card/issue-new',
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`settings/workspaces/${policyID}/expensify-card/issue-new`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT: {
        route: 'settings/workspaces/:policyID/expensify-card/choose-bank-account',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/expensify-card/choose-bank-account` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_SETTINGS: {
        route: 'settings/workspaces/:policyID/expensify-card/settings',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/expensify-card/settings` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT: {
        route: 'settings/workspaces/:policyID/expensify-card/settings/account',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/expensify-card/settings/account` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY: {
        route: 'settings/workspaces/:policyID/expensify-card/settings/frequency',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/expensify-card/settings/frequency` as const,
    },
    WORKSPACE_COMPANY_CARDS_SETTINGS: {
        route: 'settings/workspaces/:policyID/company-cards/settings',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/company-cards/settings` as const,
    },
    WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME: {
        route: 'settings/workspaces/:policyID/company-cards/settings/feed-name',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/company-cards/settings/feed-name` as const,
    },
    WORKSPACE_RULES: {
        route: 'settings/workspaces/:policyID/rules',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules` as const,
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
    WORKSPACE_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT: {
        route: 'settings/workspaces/:policyID/distance-rates/:rateID/tax-reclaimable/edit',
        getRoute: (policyID: string, rateID: string) => `settings/workspaces/${policyID}/distance-rates/${rateID}/tax-reclaimable/edit` as const,
    },
    WORKSPACE_DISTANCE_RATE_TAX_RATE_EDIT: {
        route: 'settings/workspaces/:policyID/distance-rates/:rateID/tax-rate/edit',
        getRoute: (policyID: string, rateID: string) => `settings/workspaces/${policyID}/distance-rates/${rateID}/tax-rate/edit` as const,
    },
    RULES_CUSTOM_NAME: {
        route: 'settings/workspaces/:policyID/rules/name',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/name` as const,
    },
    RULES_AUTO_APPROVE_REPORTS_UNDER: {
        route: 'settings/workspaces/:policyID/rules/auto-approve',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/auto-approve` as const,
    },
    RULES_RANDOM_REPORT_AUDIT: {
        route: 'settings/workspaces/:policyID/rules/audit',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/audit` as const,
    },
    RULES_AUTO_PAY_REPORTS_UNDER: {
        route: 'settings/workspaces/:policyID/rules/auto-pay',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/auto-pay` as const,
    },
    RULES_RECEIPT_REQUIRED_AMOUNT: {
        route: 'settings/workspaces/:policyID/rules/receipt-required-amount',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/receipt-required-amount` as const,
    },
    RULES_MAX_EXPENSE_AMOUNT: {
        route: 'settings/workspaces/:policyID/rules/max-expense-amount',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/max-expense-amount` as const,
    },
    RULES_MAX_EXPENSE_AGE: {
        route: 'settings/workspaces/:policyID/rules/max-expense-age',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/max-expense-age` as const,
    },
    RULES_BILLABLE_DEFAULT: {
        route: 'settings/workspaces/:policyID/rules/billable',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/rules/billable` as const,
    },
    // Referral program promotion
    REFERRAL_DETAILS_MODAL: {
        route: 'referral/:contentType',
        getRoute: (contentType: string, backTo?: string) => getUrlWithBackToParam(`referral/${contentType}`, backTo),
    },
    PROCESS_MONEY_REQUEST_HOLD: {
        route: 'hold-expense-educational',
        getRoute: (backTo?: string) => getUrlWithBackToParam('hold-expense-educational', backTo),
    },
    TRAVEL_MY_TRIPS: 'travel',
    TRAVEL_TCS: 'travel/terms',
    TRACK_TRAINING_MODAL: 'track-training',
    ONBOARDING_ROOT: {
        route: 'onboarding',
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding`, backTo),
    },
    ONBOARDING_PERSONAL_DETAILS: {
        route: 'onboarding/personal-details',
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/personal-details`, backTo),
    },
    ONBOARDING_EMPLOYEES: {
        route: 'onboarding/employees',
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/employees`, backTo),
    },
    ONBOARDING_ACCOUNTING: {
        route: 'onboarding/accounting',
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/accounting`, backTo),
    },
    ONBOARDING_PURPOSE: {
        route: 'onboarding/purpose',
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/purpose`, backTo),
    },
    WELCOME_VIDEO_ROOT: 'onboarding/welcome-video',
    EXPLANATION_MODAL_ROOT: 'onboarding/explanation',

    TRANSACTION_RECEIPT: {
        route: 'r/:reportID/transaction/:transactionID/receipt',
        getRoute: (reportID: string, transactionID: string, readonly = false) => `r/${reportID}/transaction/${transactionID}/receipt${readonly ? '?readonly=true' : ''}` as const,
    },
    TRANSACTION_DUPLICATE_REVIEW_PAGE: {
        route: 'r/:threadReportID/duplicates/review',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE: {
        route: 'r/:threadReportID/duplicates/review/merchant',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/merchant` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE: {
        route: 'r/:threadReportID/duplicates/review/category',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/category` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE: {
        route: 'r/:threadReportID/duplicates/review/tag',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/tag` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/tax-code',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/tax-code` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE: {
        route: 'r/:threadReportID/duplicates/review/description',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/description` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/reimbursable',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/reimbursable` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/billable',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/billable` as const, backTo),
    },
    TRANSACTION_DUPLICATE_CONFIRMATION_PAGE: {
        route: 'r/:threadReportID/duplicates/confirm',
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/confirm` as const, backTo),
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
    POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP: {
        route: 'settings/workspaces/:policyID/accounting/xero/import/tracking-categories/mapping/:categoryId/:categoryName',
        getRoute: (policyID: string, categoryId: string, categoryName: string) =>
            `settings/workspaces/${policyID}/accounting/xero/import/tracking-categories/mapping/${categoryId}/${encodeURIComponent(categoryName)}` as const,
    },
    POLICY_ACCOUNTING_XERO_CUSTOMER: {
        route: 'settings/workspaces/:policyID/accounting/xero/import/customers',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/import/customers` as const,
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
        route: 'settings/workspaces/:policyID/connections/xero/export/preferred-exporter/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/xero/export/preferred-exporter/select` as const,
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
    POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR: {
        route: 'settings/workspaces/:policyID/accounting/xero/export/purchase-bill-status-selector',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/xero/export/purchase-bill-status-selector` as const,
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
    RESTRICTED_ACTION: {
        route: 'restricted-action/workspace/:policyID',
        getRoute: (policyID: string) => `restricted-action/workspace/${policyID}` as const,
    },
    MISSING_PERSONAL_DETAILS: 'missing-personal-details',
    POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/subsidiary-selector',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/subsidiary-selector` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXISTING_CONNECTIONS: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/existing-connections',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/existing-connections` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/token-input',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/token-input` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/import` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_MAPPING: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/mapping/:importField',
        getRoute: (policyID: string, importField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_FIELDS>) =>
            `settings/workspaces/${policyID}/accounting/netsuite/import/mapping/${importField}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField',
        getRoute: (policyID: string, importCustomField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>) =>
            `settings/workspaces/${policyID}/accounting/netsuite/import/custom/${importCustomField}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField/view/:valueIndex',
        getRoute: (policyID: string, importCustomField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>, valueIndex: number) =>
            `settings/workspaces/${policyID}/accounting/netsuite/import/custom/${importCustomField}/view/${valueIndex}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField/edit/:valueIndex/:fieldName',
        getRoute: (policyID: string, importCustomField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>, valueIndex: number, fieldName: string) =>
            `settings/workspaces/${policyID}/accounting/netsuite/import/custom/${importCustomField}/edit/${valueIndex}/${fieldName}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/custom-list/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/import/custom-list/new` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/custom-segment/new',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/import/custom-segment/new` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/customer-projects',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/import/customer-projects` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT: {
        route: 'settings/workspaces/:policyID/accounting/netsuite/import/customer-projects/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/netsuite/import/customer-projects/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/preferred-exporter/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/preferred-exporter/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_DATE_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/date/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/date/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/expenses/:expenseType',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>) =>
            `settings/workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/destination/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>) =>
            `settings/workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType}/destination/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/vendor/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>) =>
            `settings/workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType}/vendor/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/payable-account/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>) =>
            `settings/workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType}/payable-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/journal-posting-preference/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>) =>
            `settings/workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType}/journal-posting-preference/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/receivable-account/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/receivable-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/invoice-item-preference/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/invoice-item-preference/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/invoice-item-preference/invoice-item/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/invoice-item-preference/invoice-item/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/tax-posting-account/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/tax-posting-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/export/provincial-tax-posting-account/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/export/provincial-tax-posting-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_ADVANCED: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/advanced/` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/reimbursement-account/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/advanced/reimbursement-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/collection-account/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/advanced/collection-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/expense-report-approval-level/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/advanced/expense-report-approval-level/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/vendor-bill-approval-level/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/advanced/vendor-bill-approval-level/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/journal-entry-approval-level/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/advanced/journal-entry-approval-level/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/approval-account/select',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/connections/netsuite/advanced/approval-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID: {
        route: 'settings/workspaces/:policyID/connections/netsuite/advanced/custom-form-id/:expenseType',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>) =>
            `settings/workspaces/${policyID}/connections/netsuite/advanced/custom-form-id/${expenseType}` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/prerequisites',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/prerequisites` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/enter-credentials',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/enter-credentials` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/existing-connections',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/existing-connections` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/entity',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/entity` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/import',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/import` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/import/toggle-mapping/:mapping',
        getRoute: (policyID: string, mapping: SageIntacctMappingName) => `settings/workspaces/${policyID}/accounting/sage-intacct/import/toggle-mapping/${mapping}` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/import/mapping-type/:mapping',
        getRoute: (policyID: string, mapping: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/import/mapping-type/${mapping}` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/import/user-dimensions',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/import/user-dimensions` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ADD_USER_DIMENSION: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/import/add-user-dimension',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/import/add-user-dimension` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/import/edit-user-dimension/:dimensionName',
        getRoute: (policyID: string, dimensionName: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/import/edit-user-dimension/${dimensionName}` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/preferred-exporter',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/preferred-exporter` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/date',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/date` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/reimbursable',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/reimbursable` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/nonreimbursable` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/reimbursable/destination',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/reimbursable/destination` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable/destination',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/nonreimbursable/destination` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/:reimbursable/default-vendor',
        getRoute: (policyID: string, reimbursable: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/${reimbursable}/default-vendor` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable/credit-card-account',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/export/nonreimbursable/credit-card-account` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/advanced',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/advanced` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT: {
        route: 'settings/workspaces/:policyID/accounting/sage-intacct/advanced/payment-account',
        getRoute: (policyID: string) => `settings/workspaces/${policyID}/accounting/sage-intacct/advanced/payment-account` as const,
    },
    DEBUG_REPORT: {
        route: 'debug/report/:reportID',
        getRoute: (reportID: string) => `debug/report/${reportID}` as const,
    },
    DEBUG_REPORT_TAB_DETAILS: {
        route: 'debug/report/:reportID/details',
        getRoute: (reportID: string) => `debug/report/${reportID}/details` as const,
    },
    DEBUG_REPORT_TAB_JSON: {
        route: 'debug/report/:reportID/json',
        getRoute: (reportID: string) => `debug/report/${reportID}/json` as const,
    },
    DEBUG_REPORT_TAB_ACTIONS: {
        route: 'debug/report/:reportID/actions',
        getRoute: (reportID: string) => `debug/report/${reportID}/actions` as const,
    },
    DEBUG_REPORT_ACTION: {
        route: 'debug/report/:reportID/actions/:reportActionID',
        getRoute: (reportID: string, reportActionID: string) => `debug/report/${reportID}/actions/${reportActionID}` as const,
    },
    DEBUG_REPORT_ACTION_CREATE: {
        route: 'debug/report/:reportID/actions/create',
        getRoute: (reportID: string) => `debug/report/${reportID}/actions/create` as const,
    },
    DEBUG_REPORT_ACTION_TAB_DETAILS: {
        route: 'debug/report/:reportID/actions/:reportActionID/details',
        getRoute: (reportID: string, reportActionID: string) => `debug/report/${reportID}/actions/${reportActionID}/details` as const,
    },
    DEBUG_REPORT_ACTION_TAB_JSON: {
        route: 'debug/report/:reportID/actions/:reportActionID/json',
        getRoute: (reportID: string, reportActionID: string) => `debug/report/${reportID}/actions/${reportActionID}/json` as const,
    },
    DEBUG_REPORT_ACTION_TAB_PREVIEW: {
        route: 'debug/report/:reportID/actions/:reportActionID/preview',
        getRoute: (reportID: string, reportActionID: string) => `debug/report/${reportID}/actions/${reportActionID}/preview` as const,
    },
    DETAILS_CONSTANT_PICKER_PAGE: {
        route: 'debug/details/constant/:fieldName',
        getRoute: (fieldName: string, fieldValue?: string, backTo?: string) => getUrlWithBackToParam(`debug/details/constant/${fieldName}?fieldValue=${fieldValue}`, backTo),
    },
    DETAILS_DATE_TIME_PICKER_PAGE: {
        route: 'debug/details/datetime/:fieldName',
        getRoute: (fieldName: string, fieldValue?: string, backTo?: string) => getUrlWithBackToParam(`debug/details/datetime/${fieldName}?fieldValue=${fieldValue}`, backTo),
    },
} as const;

/**
 * Proxy routes can be used to generate a correct url with dynamic values
 *
 * It will be used by HybridApp, that has no access to methods generating dynamic routes in NewDot
 */
const HYBRID_APP_ROUTES = {
    MONEY_REQUEST_CREATE: '/request/new/scan',
    MONEY_REQUEST_CREATE_TAB_SCAN: '/submit/new/scan',
    MONEY_REQUEST_CREATE_TAB_MANUAL: '/submit/new/manual',
    MONEY_REQUEST_CREATE_TAB_DISTANCE: '/submit/new/distance',
} as const;

export {HYBRID_APP_ROUTES, getUrlWithBackToParam, PUBLIC_SCREENS_ROUTES};
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

/**
 * Represents all routes in the app as a union of literal strings.
 *
 * If TS throws on this line, it implies that one or more routes defined within `ROUTES` have not correctly used
 * `as const` in their `getRoute` function return value.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type RouteIsPlainString = AssertTypesNotEqual<string, Route, RoutesValidationError>;

type HybridAppRoute = (typeof HYBRID_APP_ROUTES)[keyof typeof HYBRID_APP_ROUTES];

export type {HybridAppRoute, Route};
