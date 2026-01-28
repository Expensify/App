/**
 * NOTE!!!!
 *
 * Refer to ./contributingGuides/philosophies/ROUTING.md for information on how to construct routes.
 */
import type {TupleToUnion, ValueOf} from 'type-fest';
import type {UpperCaseCharacters} from 'type-fest/source/internal';
import type {SearchFilterKey, SearchQueryString, UserFriendlyKey} from './components/Search/types';
import type CONST from './CONST';
import type {IOUAction, IOUType} from './CONST';
import type {ReplacementReason} from './libs/actions/Card';
import type {IOURequestType} from './libs/actions/IOU';
import Log from './libs/Log';
import type {RootNavigatorParamList} from './libs/Navigation/types';
import type {ReimbursementAccountStepToOpen} from './libs/ReimbursementAccountUtils';
import StringUtils from './libs/StringUtils';
import {getUrlWithParams} from './libs/Url';
import SCREENS from './SCREENS';
import type {Screen} from './SCREENS';
import type {CompanyCardFeedWithDomainID} from './types/onyx';
import type {ConnectionName, SageIntacctMappingName} from './types/onyx/Policy';
import type {CustomFieldType} from './types/onyx/PolicyEmployee';
import type AssertTypesNotEqual from './types/utils/AssertTypesNotEqual';

type WorkspaceCompanyCardsAssignCardParams = {
    policyID: string;
    feed: CompanyCardFeedWithDomainID;
    cardID: string;
};

// This is a file containing constants for all the routes we want to be able to go to

/**
 * Builds a URL with an encoded URI component for the `backTo` param which can be added to the end of URLs
 */
function getUrlWithBackToParam<TUrl extends string>(url: TUrl, backTo?: string, shouldEncodeURIComponent = true): `${TUrl}` {
    const backToParam = backTo ? (`${url.includes('?') ? '&' : '?'}backTo=${shouldEncodeURIComponent ? encodeURIComponent(backTo) : backTo}` as const) : '';
    return `${url}${backToParam}` as `${TUrl}`;
}

const PUBLIC_SCREENS_ROUTES = {
    // If the user opens this route, we'll redirect them to the path saved in the last visited path or to the home page if the last visited path is empty.
    ROOT: '',
    TRANSITION_BETWEEN_APPS: 'transition',
    CONNECTION_COMPLETE: 'connection-complete',
    BANK_CONNECTION_COMPLETE: 'bank-connection-complete',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    UNLINK_LOGIN: 'u/:accountID/:validateCode',
    SAML_SIGN_IN: 'sign-in-with-saml',
} as const;

// Exported for identifying a url as a verify-account route, associated with a page extending the VerifyAccountPageBase component
const VERIFY_ACCOUNT = 'verify-account';

const MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES = {
    FACTOR: 'multifactor-authentication/factor',
    PROMPT: 'multifactor-authentication/prompt',
} as const;

const ROUTES = {
    ...PUBLIC_SCREENS_ROUTES,
    // This route renders the list of reports.
    INBOX: 'home',
    // @TODO: Rename it to 'home' and INBOX to 'inbox' when removing the newDotHome beta
    HOME: 'home-page',

    // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
    WORKSPACES_LIST: {route: 'workspaces', getRoute: (backTo?: string) => getUrlWithBackToParam('workspaces', backTo)},
    SEARCH_ROUTER: 'search-router',
    SEARCH_ROOT: {
        route: 'search',
        getRoute: ({query, rawQuery, name}: {query: SearchQueryString; rawQuery?: SearchQueryString; name?: string}) => {
            const rawQuerySegment = rawQuery ? `&rawQuery=${encodeURIComponent(rawQuery)}` : '';
            return `search?q=${encodeURIComponent(query)}${name ? `&name=${name}` : ''}${rawQuerySegment}` as const;
        },
    },
    SEARCH_ROOT_VERIFY_ACCOUNT: `search/${VERIFY_ACCOUNT}`,
    SEARCH_SAVED_SEARCH_RENAME: {
        route: 'search/saved-search/rename',
        getRoute: ({name, jsonQuery}: {name: string; jsonQuery: SearchQueryString}) => `search/saved-search/rename?name=${name}&q=${jsonQuery}` as const,
    },
    SEARCH_COLUMNS: 'search/columns',
    SEARCH_ADVANCED_FILTERS: {
        route: 'search/filters/:filterKey?',
        getRoute: (filterKey?: SearchFilterKey | UserFriendlyKey) => {
            return `search/filters/${filterKey ?? ''}` as const;
        },
    },
    SEARCH_REPORT: {
        route: 'search/view/:reportID/:reportActionID?',
        getRoute: ({reportID, reportActionID, backTo}: {reportID: string | undefined; reportActionID?: string; backTo?: string}) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the SEARCH_REPORT route');
            }

            const baseRoute = reportActionID ? (`search/view/${reportID}/${reportActionID}` as const) : (`search/view/${reportID}` as const);

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    },

    EXPENSE_REPORT_RHP: {
        route: 'e/:reportID',
        getRoute: ({reportID, backTo}: {reportID: string; backTo?: string}) => {
            const baseRoute = `e/${reportID}` as const;

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    },

    SEARCH_REPORT_VERIFY_ACCOUNT: {
        route: `search/view/:reportID/${VERIFY_ACCOUNT}`,
        getRoute: (reportID: string) => `search/view/${reportID}/${VERIFY_ACCOUNT}` as const,
    },
    SEARCH_MONEY_REQUEST_REPORT: {
        route: 'search/r/:reportID',
        getRoute: ({reportID, backTo}: {reportID: string; backTo?: string}) => {
            const baseRoute = `search/r/${reportID}` as const;

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    },
    SEARCH_MONEY_REQUEST_REPORT_VERIFY_ACCOUNT: {
        route: `search/r/:reportID/${VERIFY_ACCOUNT}`,
        getRoute: (reportID: string) => `search/r/${reportID}/${VERIFY_ACCOUNT}` as const,
    },
    SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS: {
        route: 'search/r/:reportID/hold',
        getRoute: ({reportID, backTo}: {reportID: string; backTo?: string}) => {
            const baseRoute = `search/r/${reportID}/hold` as const;

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    },
    SEARCH_MONEY_REQUEST_REPORT_REJECT_TRANSACTIONS: {
        route: 'search/r/:reportID/reject',
        getRoute: ({reportID}: {reportID: string}) => `search/r/${reportID}/reject` as const,
    },
    TRANSACTION_HOLD_REASON_RHP: 'search/hold',
    SEARCH_REJECT_REASON_RHP: 'search/reject',
    MOVE_TRANSACTIONS_SEARCH_RHP: 'search/move-transactions',

    // This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated
    CONCIERGE: 'concierge',
    TRACK_EXPENSE: 'track-expense',
    SUBMIT_EXPENSE: 'submit-expense',
    FLAG_COMMENT: {
        route: 'flag/:reportID/:reportActionID',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, reportActionID: string, backTo?: string) => getUrlWithBackToParam(`flag/${reportID}/${reportActionID}` as const, backTo),
    },
    PROFILE: {
        route: 'a/:accountID',
        getRoute: (accountID?: number, backTo?: string, login?: string) => {
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            const baseRoute = getUrlWithBackToParam(`a/${accountID}`, backTo);
            const loginParam = login ? `?login=${encodeURIComponent(login)}` : '';
            return `${baseRoute}${loginParam}` as const;
        },
    },
    PROFILE_AVATAR: {
        route: 'a/:accountID/avatar',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (accountID: number, backTo?: string) => getUrlWithBackToParam(`a/${accountID}/avatar` as const, backTo),
    },

    // This is a special validation URL that will take the user to /workspace/new after validation. This is used
    // when linking users from e.com in order to share a session in this app.
    ENABLE_PAYMENTS: 'enable-payments',
    WALLET_STATEMENT_WITH_DATE: 'statements/:yearMonth',
    SIGN_IN_MODAL: 'sign-in-modal',

    BANK_ACCOUNT: 'bank-account',
    BANK_ACCOUNT_VERIFY_ACCOUNT: {
        route: `bank-account/${VERIFY_ACCOUNT}`,
        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID?: string, backTo?: string) => getUrlWithBackToParam(`bank-account/${VERIFY_ACCOUNT}?policyID=${policyID}`, backTo),
    },
    BANK_ACCOUNT_NEW: 'bank-account/new',
    BANK_ACCOUNT_PERSONAL: 'bank-account/personal',
    BANK_ACCOUNT_WITH_STEP_TO_OPEN: {
        route: 'bank-account/:stepToOpen?',
        getRoute: (policyID: string | undefined, stepToOpen: ReimbursementAccountStepToOpen = '', backTo?: string, subStepToOpen?: typeof CONST.BANK_ACCOUNT.STEP.COUNTRY) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the BANK_ACCOUNT_WITH_STEP_TO_OPEN route');
            }
            // TODO this backTo comes from drilling it through bank account form screens
            // should be removed once https://github.com/Expensify/App/pull/72219 is resolved
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`bank-account/${stepToOpen}?policyID=${policyID}${subStepToOpen ? `&subStep=${subStepToOpen}` : ''}`, backTo);
        },
    },
    BANK_ACCOUNT_ENTER_SIGNER_INFO: {
        route: 'bank-account/enter-signer-info',
        getRoute: (policyID: string | undefined, bankAccountID: string | undefined, isCompleted: boolean) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the BANK_ACCOUNT_ENTER_SIGNER_INFO route');
            }
            return `bank-account/enter-signer-info?policyID=${policyID}&bankAccountID=${bankAccountID}&isCompleted=${isCompleted}` as const;
        },
    },
    BANK_ACCOUNT_CONNECT_EXISTING_BUSINESS_BANK_ACCOUNT: {
        route: 'bank-account/connect-existing-business-bank-account',
        getRoute: (policyID: string) => `bank-account/connect-existing-business-bank-account?policyID=${policyID}` as const,
    },
    PUBLIC_CONSOLE_DEBUG: {
        route: 'troubleshoot/console',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`troubleshoot/console`, backTo),
    },
    SETTINGS: 'settings',
    SETTINGS_PROFILE: {
        route: 'settings/profile',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/profile', backTo),
    },
    SETTINGS_CHANGE_CURRENCY: 'settings/add-payment-card/change-currency',
    SETTINGS_SHARE_CODE: 'settings/shareCode',
    SETTINGS_DISPLAY_NAME: 'settings/profile/display-name',
    SETTINGS_AVATAR: 'settings/profile/avatar',
    SETTINGS_TIMEZONE: 'settings/profile/timezone',
    SETTINGS_TIMEZONE_SELECT: 'settings/profile/timezone/select',
    SETTINGS_PRONOUNS: 'settings/profile/pronouns',
    SETTINGS_PREFERENCES: 'settings/preferences',
    SETTINGS_SUBSCRIPTION: {
        route: 'settings/subscription',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/subscription', backTo),
    },
    SETTINGS_SUBSCRIPTION_SIZE: {
        route: 'settings/subscription/subscription-size',
        getRoute: (canChangeSize: 0 | 1) => `settings/subscription/subscription-size?canChangeSize=${canChangeSize as number}` as const,
    },
    SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS: 'settings/subscription/details',
    SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD: 'settings/subscription/add-payment-card',
    SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY: 'settings/subscription/change-billing-currency',
    SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY: 'settings/subscription/add-payment-card/change-payment-currency',
    SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY: 'settings/subscription/disable-auto-renew-survey',
    SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION: 'settings/subscription/request-early-cancellation-survey',
    SETTINGS_SUBSCRIPTION_DOWNGRADE_BLOCKED: {
        route: 'settings/subscription/downgrade-blocked',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/subscription/downgrade-blocked', backTo),
    },
    SETTINGS_PRIORITY_MODE: 'settings/preferences/priority-mode',
    SETTINGS_LANGUAGE: 'settings/preferences/language',
    SETTINGS_PAYMENT_CURRENCY: 'setting/preferences/payment-currency',
    SETTINGS_THEME: 'settings/preferences/theme',
    SETTINGS_SECURITY: 'settings/security',
    SETTINGS_CLOSE: 'settings/security/closeAccount',
    SETTINGS_MERGE_ACCOUNTS: {
        route: 'settings/security/merge-accounts',
        getRoute: (email?: string) => `settings/security/merge-accounts${email ? `?email=${encodeURIComponent(email)}` : ''}` as const,
    },
    SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE: {
        route: 'settings/security/merge-accounts/:login/magic-code',
        getRoute: (login: string) => `settings/security/merge-accounts/${encodeURIComponent(login)}/magic-code` as const,
    },
    SETTINGS_MERGE_ACCOUNTS_RESULT: {
        route: 'settings/security/merge-accounts/:login/result/:result',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (login: string, result: string, backTo?: string) => getUrlWithBackToParam(`settings/security/merge-accounts/${encodeURIComponent(login)}/result/${result}`, backTo),
    },
    SETTINGS_LOCK_ACCOUNT: 'settings/security/lock-account',
    SETTINGS_UNLOCK_ACCOUNT: 'settings/security/unlock-account',
    SETTINGS_FAILED_TO_LOCK_ACCOUNT: 'settings/security/failed-to-lock-account',
    SETTINGS_DELEGATE_VERIFY_ACCOUNT: `settings/security/delegate/${VERIFY_ACCOUNT}`,
    SETTINGS_ADD_DELEGATE: 'settings/security/delegate',
    SETTINGS_DELEGATE_ROLE: {
        route: 'settings/security/delegate/:login/role/:role',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (login: string, role?: string, backTo?: string) => getUrlWithBackToParam(`settings/security/delegate/${encodeURIComponent(login)}/role/${role}`, backTo),
    },
    SETTINGS_UPDATE_DELEGATE_ROLE: {
        route: 'settings/security/delegate/:login/update-role/:currentRole',
        getRoute: (login: string, currentRole: string) => `settings/security/delegate/${encodeURIComponent(login)}/update-role/${currentRole}` as const,
    },
    SETTINGS_UPDATE_DELEGATE_ROLE_CONFIRM_MAGIC_CODE: {
        route: 'settings/security/delegate/:login/confirm-role/:newRole',
        getRoute: (login: string, newRole: string) => `settings/security/delegate/${encodeURIComponent(login)}/confirm-role/${newRole}` as const,
    },
    SETTINGS_DELEGATE_CONFIRM: {
        route: 'settings/security/delegate/:login/role/:role/confirm',
        getRoute: (login: string, role: string) => `settings/security/delegate/${encodeURIComponent(login)}/role/${role}/confirm` as const,
    },
    SETTINGS_DELEGATE_CONFIRM_MAGIC_CODE: {
        route: 'settings/security/delegate/:login/role/:role/confirm/magic-code',
        getRoute: (login: string, role: string) => `settings/security/delegate/${encodeURIComponent(login)}/role/${role}/confirm/magic-code` as const,
    },
    SETTINGS_ABOUT: 'settings/about',
    SETTINGS_APP_DOWNLOAD_LINKS: 'settings/about/app-download-links',
    SETTINGS_WALLET: 'settings/wallet',
    SETTINGS_WALLET_VERIFY_ACCOUNT: `settings/wallet/${VERIFY_ACCOUNT}`,
    SETTINGS_WALLET_DOMAIN_CARD: {
        route: 'settings/wallet/card/:cardID?',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}` as const,
    },
    SETTINGS_WALLET_DOMAIN_CARD_CONFIRM_MAGIC_CODE: {
        route: 'settings/wallet/card/:cardID/confirm-magic-code',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/confirm-magic-code` as const,
    },
    SETTINGS_WALLET_CARD_MISSING_DETAILS: {
        route: 'settings/wallet/card/:cardID/missing-details',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/missing-details` as const,
    },
    SETTINGS_WALLET_CARD_MISSING_DETAILS_CONFIRM_MAGIC_CODE: {
        route: 'settings/wallet/card/:cardID/missing-details/confirm-magic-code',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/missing-details/confirm-magic-code` as const,
    },
    SETTINGS_DOMAIN_CARD_DETAIL: {
        route: 'settings/card/:cardID?',
        getRoute: (cardID: string) => `settings/card/${cardID}` as const,
    },
    SETTINGS_DOMAIN_CARD_UPDATE_ADDRESS: {
        route: 'settings/card/:cardID/update-address',
        getRoute: (cardID: string) => `settings/card/${cardID}/update-address` as const,
    },
    SETTINGS_DOMAIN_CARD_CONFIRM_MAGIC_CODE: {
        route: 'settings/card/:cardID/confirm-magic-code',
        getRoute: (cardID: string) => `settings/card/${cardID}/confirm-magic-code` as const,
    },
    SETTINGS_REPORT_FRAUD: {
        route: 'settings/wallet/card/:cardID/report-virtual-fraud',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/report-virtual-fraud` as const,
    },
    SETTINGS_REPORT_FRAUD_VERIFY_ACCOUNT: {
        route: `settings/wallet/card/:cardID/report-virtual-fraud/${VERIFY_ACCOUNT}`,
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/report-virtual-fraud/${VERIFY_ACCOUNT}` as const,
    },
    SETTINGS_REPORT_FRAUD_CONFIRMATION: {
        route: 'settings/wallet/card/:cardID/report-virtual-fraud-confirm',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/report-virtual-fraud-confirm` as const,
    },
    SETTINGS_DOMAIN_CARD_REPORT_FRAUD: {
        route: 'settings/card/:cardID/report-virtual-fraud',
        getRoute: (cardID: string) => `settings/card/${cardID}/report-virtual-fraud` as const,
    },
    SETTINGS_ADD_DEBIT_CARD: 'settings/wallet/add-debit-card',
    SETTINGS_ADD_BANK_ACCOUNT: {
        route: 'settings/wallet/add-bank-account',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/wallet/add-bank-account', backTo),
    },
    SETTINGS_ADD_BANK_ACCOUNT_VERIFY_ACCOUNT: {
        route: `settings/wallet/add-bank-account/${VERIFY_ACCOUNT}`,
        getRoute: (params: {backTo?: string}) => getUrlWithParams(`settings/wallet/add-bank-account/${VERIFY_ACCOUNT}`, params),
    },

    SETTINGS_ADD_US_BANK_ACCOUNT: 'settings/wallet/add-us-bank-account',
    SETTINGS_ADD_US_BANK_ACCOUNT_ENTRY_POINT: 'settings/wallet/add-us-bank-account/entry-point',
    SETTINGS_ADD_BANK_ACCOUNT_SELECT_COUNTRY_VERIFY_ACCOUNT: `settings/wallet/add-bank-account/select-country/${VERIFY_ACCOUNT}`,
    SETTINGS_ENABLE_PAYMENTS: 'settings/wallet/enable-payments',
    SETTINGS_WALLET_UNSHARE_BANK_ACCOUNT: {
        route: 'settings/wallet/:bankAccountID/unshare-bank-account',
        getRoute: (bankAccountID: number | undefined) => `settings/wallet/${bankAccountID}/unshare-bank-account` as const,
    },
    SETTINGS_WALLET_ENABLE_GLOBAL_REIMBURSEMENTS: {
        route: 'settings/wallet/:bankAccountID/enable-global-reimbursements',
        getRoute: (bankAccountID: number | undefined) => `settings/wallet/${bankAccountID}/enable-global-reimbursements` as const,
    },
    SETTINGS_WALLET_SHARE_BANK_ACCOUNT: {
        route: 'settings/wallet/:bankAccountID/share-bank-account',
        getRoute: (bankAccountID: number | undefined) => `settings/wallet/${bankAccountID}/share-bank-account` as const,
    },
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
    SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED_CONFIRM_MAGIC_CODE: {
        route: 'settings/wallet/card/:cardID/report-card-lost-or-damaged/:reason/confirm-magic-code',
        getRoute: (cardID: string, reason: ReplacementReason) => `settings/wallet/card/${cardID}/report-card-lost-or-damaged/${reason}/confirm-magic-code` as const,
    },
    SETTINGS_WALLET_CARD_ACTIVATE: {
        route: 'settings/wallet/card/:cardID/activate',
        getRoute: (cardID: string) => `settings/wallet/card/${cardID}/activate` as const,
    },
    SETTINGS_RULES: 'settings/rules',
    SETTINGS_RULES_ADD: {
        route: 'settings/rules/new/:field?',
        getRoute: (field?: ValueOf<typeof CONST.EXPENSE_RULES.FIELDS>) => {
            return `settings/rules/new/${field ? StringUtils.camelToHyphenCase(field) : ''}` as const;
        },
    },
    SETTINGS_RULES_EDIT: {
        route: 'settings/rules/edit/:hash/:field?',
        getRoute: (hash?: string, field?: ValueOf<typeof CONST.EXPENSE_RULES.FIELDS>) => {
            return `settings/rules/edit/${hash ?? ':hash'}/${field ? StringUtils.camelToHyphenCase(field) : ''}` as const;
        },
    },
    SETTINGS_LEGAL_NAME: 'settings/profile/legal-name',
    SETTINGS_DATE_OF_BIRTH: 'settings/profile/date-of-birth',
    SETTINGS_PHONE_NUMBER: 'settings/profile/phone',
    SETTINGS_ADDRESS: 'settings/profile/address',
    SETTINGS_ADDRESS_COUNTRY: {
        route: 'settings/profile/address/country',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (country: string, backTo?: string) => getUrlWithBackToParam(`settings/profile/address/country?country=${country}`, backTo),
    },
    SETTINGS_ADDRESS_STATE: {
        route: 'settings/profile/address/state',

        getRoute: (state?: string, backTo?: string, label?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            `${getUrlWithBackToParam(`settings/profile/address/state${state ? `?state=${encodeURIComponent(state)}` : ''}`, backTo)}${
                // the label param can be an empty string so we cannot use a nullish ?? operator
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                label ? `${backTo || state ? '&' : '?'}label=${encodeURIComponent(label)}` : ''
            }` as const,
    },
    SETTINGS_CONTACT_METHODS: {
        route: 'settings/profile/contact-methods',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/profile/contact-methods', backTo),
    },
    SETTINGS_CONTACT_METHOD_DETAILS: {
        route: 'settings/profile/contact-methods/:contactMethod/details',
        getRoute: (contactMethod: string, backTo?: string, shouldSkipInitialValidation?: boolean) => {
            const encodedMethod = encodeURIComponent(contactMethod);

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`settings/profile/contact-methods/${encodedMethod}/details${shouldSkipInitialValidation ? `?shouldSkipInitialValidation=true` : ``}`, backTo);
        },
    },
    SETTINGS_NEW_CONTACT_METHOD: {
        route: 'settings/profile/contact-methods/new',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/profile/contact-methods/new', backTo),
    },
    SETTINGS_NEW_CONTACT_METHOD_CONFIRM_MAGIC_CODE: {
        route: 'settings/profile/contact-methods/new/confirm-magic-code',
        getRoute: (backTo?: string) => {
            // TODO this backTo comes from drilling it through settings screens
            // should be removed once https://github.com/Expensify/App/pull/72219 is resolved
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`settings/profile/contact-methods/new/confirm-magic-code`, backTo);
        },
    },
    SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT: {
        route: 'settings/profile/contact-methods/verify',
        getRoute: (backTo?: string, forwardTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(forwardTo ? `settings/profile/contact-methods/verify?forwardTo=${encodeURIComponent(forwardTo)}` : 'settings/profile/contact-methods/verify', backTo),
    },
    SETTINGS_2FA_VERIFY_ACCOUNT: {
        route: `settings/security/two-factor-auth/${VERIFY_ACCOUNT}`,
        getRoute: (params: {backTo?: string; forwardTo?: string} = {}) => getUrlWithParams(`settings/security/two-factor-auth/${VERIFY_ACCOUNT}`, params),
    },
    SETTINGS_2FA_ROOT: {
        route: 'settings/security/two-factor-auth',
        getRoute: (backTo?: string, forwardTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(forwardTo ? `settings/security/two-factor-auth?forwardTo=${encodeURIComponent(forwardTo)}` : 'settings/security/two-factor-auth', backTo),
    },
    SETTINGS_2FA_VERIFY: {
        route: 'settings/security/two-factor-auth/verify',
        getRoute: (backTo?: string, forwardTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(forwardTo ? `settings/security/two-factor-auth/verify?forwardTo=${encodeURIComponent(forwardTo)}` : 'settings/security/two-factor-auth/verify', backTo),
    },
    SETTINGS_2FA_SUCCESS: {
        route: 'settings/security/two-factor-auth/success',
        getRoute: (backTo?: string, forwardTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(forwardTo ? `settings/security/two-factor-auth/success?forwardTo=${encodeURIComponent(forwardTo)}` : 'settings/security/two-factor-auth/success', backTo),
    },
    SETTINGS_2FA_DISABLED: 'settings/security/two-factor-auth/disabled',
    SETTINGS_2FA_DISABLE: 'settings/security/two-factor-auth/disable',

    SETTINGS_STATUS: 'settings/profile/status',

    SETTINGS_STATUS_CLEAR_AFTER: 'settings/profile/status/clear-after',
    SETTINGS_STATUS_CLEAR_AFTER_DATE: 'settings/profile/status/clear-after/date',
    SETTINGS_STATUS_CLEAR_AFTER_TIME: 'settings/profile/status/clear-after/time',
    SETTINGS_VACATION_DELEGATE: 'settings/profile/status/vacation-delegate',
    SETTINGS_TROUBLESHOOT: 'settings/troubleshoot',
    SETTINGS_CONSOLE: {
        route: 'settings/troubleshoot/console',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`settings/troubleshoot/console`, backTo),
    },
    SETTINGS_SHARE_LOG: {
        route: 'settings/troubleshoot/console/share-log',
        getRoute: (source: string) => `settings/troubleshoot/console/share-log?source=${encodeURI(source)}` as const,
    },

    SETTINGS_EXIT_SURVEY_REASON: 'settings/exit-survey/reason',

    SETTINGS_EXIT_SURVEY_CONFIRM: {
        route: 'settings/exit-survey/confirm',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('settings/exit-survey/confirm', backTo),
    },

    SETTINGS_SAVE_THE_WORLD: 'settings/teachersunite',

    KEYBOARD_SHORTCUTS: {
        route: 'keyboard-shortcuts',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('keyboard-shortcuts', backTo),
    },

    NEW: 'new',
    NEW_CHAT: 'new/chat',
    NEW_CHAT_CONFIRM: 'new/chat/confirm',
    NEW_CHAT_EDIT_NAME: 'new/chat/confirm/name/edit',
    NEW_ROOM: 'new/room',

    NEW_REPORT_WORKSPACE_SELECTION: {
        route: 'new-report-workspace-selection',
        getRoute: (isMovingExpenses?: boolean, backTo?: string) => {
            const baseRoute = `new-report-workspace-selection${isMovingExpenses ? '?isMovingExpenses=true' : ''}` as const;

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    },
    REPORT: 'r',
    REPORT_WITH_ID: {
        route: 'r/:reportID?/:reportActionID?',
        getRoute: (reportID: string | undefined, reportActionID?: string, referrer?: string, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the REPORT_WITH_ID route');
            }
            const baseRoute = reportActionID ? (`r/${reportID}/${reportActionID}` as const) : (`r/${reportID}` as const);

            const queryParams: string[] = [];
            if (referrer) {
                queryParams.push(`referrer=${encodeURIComponent(referrer)}`);
            }

            const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${baseRoute}${queryString}` as const, backTo);
        },
    },
    REPORT_CARD_ACTIVATE: {
        route: 'r/:reportID/:reportActionID?/card/:cardID/activate',
        getRoute: (cardID: number, reportID?: string, reportActionID?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the REPORT_CARD_ACTIVATE route');
            }
            if (!reportActionID) {
                return `r/${reportID}/card/${cardID}/activate` as const;
            }
            return `r/${reportID}/${reportActionID}/card/${cardID}/activate` as const;
        },
    },
    REPORT_ATTACHMENTS: {
        route: 'attachment',
        getRoute: (params?: ReportAttachmentsRouteParams) => getAttachmentModalScreenRoute('attachment', params),
    },
    REPORT_ADD_ATTACHMENT: {
        route: 'r/:reportID/attachment/add',
        getRoute: (reportID: string, params?: ReportAddAttachmentRouteParams) => {
            return getAttachmentModalScreenRoute(`r/${reportID}/attachment/add`, params);
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
        getRoute: (reportID: string | undefined, policyID: string | undefined, fieldID: string, backTo?: string) => {
            if (!policyID || !reportID) {
                Log.warn('Invalid policyID or reportID is used to build the EDIT_REPORT_FIELD_REQUEST route', {
                    policyID,
                    reportID,
                });
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/edit/policyField/${policyID}/${encodeURIComponent(fieldID)}` as const, backTo);
        },
    },
    REPORT_WITH_ID_DETAILS_SHARE_CODE: {
        route: 'r/:reportID/details/shareCode',
        getRoute: (reportID: string | undefined, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the REPORT_WITH_ID_DETAILS_SHARE_CODE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/details/shareCode` as const, backTo);
        },
    },
    REPORT_VERIFY_ACCOUNT: {
        route: `r/:reportID/${VERIFY_ACCOUNT}`,
        getRoute: (reportID: string) => `r/${reportID}/${VERIFY_ACCOUNT}` as const,
    },
    EXPENSE_REPORT_VERIFY_ACCOUNT: {
        route: `e/:reportID/${VERIFY_ACCOUNT}`,
        getRoute: (reportID: string) => `e/${reportID}/${VERIFY_ACCOUNT}` as const,
    },
    REPORT_PARTICIPANTS: {
        route: 'r/:reportID/participants',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants` as const, backTo),
    },
    REPORT_PARTICIPANTS_INVITE: {
        route: 'r/:reportID/participants/invite',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants/invite` as const, backTo),
    },
    REPORT_PARTICIPANTS_DETAILS: {
        route: 'r/:reportID/participants/:accountID',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants/${accountID}` as const, backTo),
    },
    REPORT_PARTICIPANTS_ROLE_SELECTION: {
        route: 'r/:reportID/participants/:accountID/role',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/participants/${accountID}/role` as const, backTo),
    },
    REPORT_WITH_ID_DETAILS: {
        route: 'r/:reportID/details',
        getRoute: (reportID: string | number | undefined, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the REPORT_WITH_ID_DETAILS route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/details`, backTo);
        },
    },
    REPORT_WITH_ID_DETAILS_EXPORT: {
        route: 'r/:reportID/details/export/:connectionName',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, connectionName: ConnectionName, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/details/export/${connectionName as string}` as const, backTo),
    },
    REPORT_WITH_ID_CHANGE_WORKSPACE: {
        route: 'r/:reportID/change-workspace',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/change-workspace` as const, backTo),
    },
    REPORT_SETTINGS: {
        route: 'r/:reportID/settings',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings` as const, backTo),
    },
    REPORT_SETTINGS_NAME: {
        route: 'r/:reportID/settings/name',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/name` as const, backTo),
    },
    REPORT_SETTINGS_NOTIFICATION_PREFERENCES: {
        route: 'r/:reportID/settings/notification-preferences',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/notification-preferences` as const, backTo),
    },
    REPORT_SETTINGS_WRITE_CAPABILITY: {
        route: 'r/:reportID/settings/who-can-post',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/who-can-post` as const, backTo),
    },
    REPORT_SETTINGS_VISIBILITY: {
        route: 'r/:reportID/settings/visibility',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/settings/visibility` as const, backTo),
    },
    REPORT_CHANGE_APPROVER: {
        route: 'r/:reportID/change-approver',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/change-approver` as const, backTo),
    },
    REPORT_CHANGE_APPROVER_ADD_APPROVER: {
        route: 'r/:reportID/change-approver/add',
        getRoute: (reportID: string) => `r/${reportID}/change-approver/add` as const,
    },
    REPORT_SETTINGS_REPORT_LAYOUT: {
        route: 'r/:reportID/settings/report-layout',
        getRoute: (reportID: string) => `r/${reportID}/settings/report-layout` as const,
    },
    SPLIT_BILL_DETAILS: {
        route: 'r/:reportID/split/:reportActionID',
        getRoute: (reportID: string | undefined, reportActionID: string, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the SPLIT_BILL_DETAILS route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/split/${reportActionID}` as const, backTo);
        },
    },
    TASK_TITLE: {
        route: 'r/:reportID/title',
        getRoute: (reportID: string | undefined, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the TASK_TITLE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/title` as const, backTo);
        },
    },
    REPORT_DESCRIPTION: {
        route: 'r/:reportID/description',
        getRoute: (reportID: string | undefined, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the REPORT_DESCRIPTION route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/description` as const, backTo);
        },
    },
    TASK_ASSIGNEE: {
        route: 'r/:reportID/assignee',
        getRoute: (reportID: string | undefined, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the TASK_ASSIGNEE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/assignee` as const, backTo);
        },
    },
    PRIVATE_NOTES_LIST: {
        route: 'r/:reportID/notes',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/notes` as const, backTo),
    },
    PRIVATE_NOTES_EDIT: {
        route: 'r/:reportID/notes/:accountID/edit',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/notes/${accountID}/edit` as const, backTo),
    },
    ROOM_MEMBERS: {
        route: 'r/:reportID/members',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/members` as const, backTo),
    },
    ROOM_MEMBER_DETAILS: {
        route: 'r/:reportID/members/:accountID',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (reportID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`r/${reportID}/members/${accountID}` as const, backTo),
    },
    ROOM_INVITE: {
        route: 'r/:reportID/invite',
        getRoute: (reportID: string | undefined, backTo?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the ROOM_INVITE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/invite` as const, backTo);
        },
    },
    SPLIT_EXPENSE: {
        // TODO: Remove backTo from route once we have find another way to fix navigation issues with tabs
        route: 'create/split-expense/overview/:reportID/:transactionID/:splitExpenseTransactionID/:backTo?',
        getRoute: (reportID: string | undefined, originalTransactionID: string | undefined, splitExpenseTransactionID?: string, backTo?: string) => {
            if (!reportID || !originalTransactionID) {
                Log.warn(`Invalid ${reportID}(reportID) or ${originalTransactionID}(transactionID) is used to build the SPLIT_EXPENSE route`);
            }

            const splitExpenseTransactionIDPart = splitExpenseTransactionID ? `/${splitExpenseTransactionID}` : '/0';

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`create/split-expense/overview/${reportID}/${originalTransactionID}${splitExpenseTransactionIDPart}`, backTo);
        },
    },
    SPLIT_EXPENSE_SEARCH: {
        route: 'create/split-expense/overview/:reportID/:transactionID/:splitExpenseTransactionID/search/:backTo?',
        getRoute: (reportID: string | undefined, originalTransactionID: string | undefined, splitExpenseTransactionID?: string, backTo?: string) => {
            if (!reportID || !originalTransactionID) {
                Log.warn(`Invalid ${reportID}(reportID) or ${originalTransactionID}(transactionID) is used to build the SPLIT_EXPENSE_SEARCH route`);
            }

            const splitExpenseTransactionIDPart = splitExpenseTransactionID ? `/${splitExpenseTransactionID}` : '/0';

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`create/split-expense/overview/${reportID}/${originalTransactionID}${splitExpenseTransactionIDPart}/search`, backTo);
        },
    },
    SPLIT_EXPENSE_CREATE_DATE_RANGE: {
        route: 'create/split-expense/create-date-range/:reportID/:transactionID?',
        getRoute: (reportID: string | undefined, transactionID: string | undefined, backTo?: string) => {
            if (!reportID || !transactionID) {
                Log.warn(`Invalid ${reportID}(reportID) or ${transactionID}(transactionID) is used to build the SPLIT_EXPENSE_CREATE_DATE_RANGE route`);
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`create/split-expense/create-date-range/${reportID}/${transactionID}`, backTo);
        },
    },
    SPLIT_EXPENSE_EDIT: {
        route: 'edit/split-expense/overview/:reportID/:transactionID/:splitExpenseTransactionID?',
        getRoute: (reportID: string | undefined, originalTransactionID: string | undefined, splitExpenseTransactionID?: string, backTo?: string) => {
            if (!reportID || !originalTransactionID) {
                Log.warn(`Invalid ${reportID}(reportID) or ${originalTransactionID}(transactionID) is used to build the SPLIT_EXPENSE_EDIT route`);
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`edit/split-expense/overview/${reportID}/${originalTransactionID}${splitExpenseTransactionID ? `/${splitExpenseTransactionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_HOLD_REASON: {
        route: ':type/edit/reason/:transactionID?/:searchHash?',
        getRoute: (type: ValueOf<typeof CONST.POLICY.TYPE>, transactionID: string, reportID: string | undefined, backTo: string, searchHash?: number) => {
            const searchPart = searchHash ? `/${searchHash}` : '';
            const reportPart = reportID ? `&reportID=${reportID}` : '';
            return `${type as string}/edit/reason/${transactionID}${searchPart}/?backTo=${backTo}${reportPart}` as const;
        },
    },
    MONEY_REQUEST_CREATE: {
        route: ':action/:iouType/start/:transactionID/:reportID/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) => {
            if (backToReport) {
                return `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/${backToReport}` as const;
            }
            return `${action as string}/${iouType as string}/start/${transactionID}/${reportID}` as const;
        },
    },
    MONEY_REQUEST_STEP_SEND_FROM: {
        route: 'create/:iouType/from/:transactionID/:reportID',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (iouType: IOUType, transactionID: string, reportID: string, backTo = '') => getUrlWithBackToParam(`create/${iouType as string}/from/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_COMPANY_INFO: {
        route: 'create/:iouType/company-info/:transactionID/:reportID',
        getRoute: (iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`create/${iouType as string}/company-info/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_CONFIRMATION: {
        route: ':action/:iouType/confirmation/:transactionID/:reportID/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string | undefined, backToReport?: string, participantsAutoAssigned?: boolean, backTo?: string) => {
            let optionalRoutePart = '';
            if (backToReport !== undefined) {
                optionalRoutePart += `/${backToReport}`;
            }
            if (participantsAutoAssigned !== undefined) {
                optionalRoutePart += '?participantsAutoAssigned=true';
            }
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/confirmation/${transactionID}/${reportID}${optionalRoutePart}` as const, backTo);
        },
    },
    MONEY_REQUEST_STEP_CONFIRMATION_VERIFY_ACCOUNT: {
        route: `:action/:iouType/confirmation/:transactionID/:reportID/${VERIFY_ACCOUNT}`,
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string) =>
            `${action as string}/${iouType as string}/confirmation/${transactionID}/${reportID}/${VERIFY_ACCOUNT}` as const,
    },
    MONEY_REQUEST_STEP_AMOUNT: {
        route: ':action/:iouType/amount/:transactionID/:reportID/:reportActionID?/:pageIndex?/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, reportActionID?: string, pageIndex?: string, backTo = '') => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_AMOUNT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/amount/${transactionID}/${reportID}/${reportActionID ? `${reportActionID}/` : ''}${pageIndex}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_TAX_RATE: {
        route: ':action/:iouType/taxRate/:transactionID/:reportID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '') => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_TAX_RATE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/taxRate/${transactionID}/${reportID}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_TAX_AMOUNT: {
        route: ':action/:iouType/taxAmount/:transactionID/:reportID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '') => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_TAX_AMOUNT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/taxAmount/${transactionID}/${reportID}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_CATEGORY: {
        route: ':action/:iouType/category/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', reportActionID?: string) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_CATEGORY route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/category/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_ATTENDEE: {
        route: ':action/:iouType/attendees/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '') => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_ATTENDEE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/attendees/${transactionID}/${reportID}`, backTo);
        },
    },
    MONEY_REQUEST_ACCOUNTANT: {
        route: ':action/:iouType/accountant/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '') => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_ACCOUNTANT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/accountant/${transactionID}/${reportID}`, backTo);
        },
    },
    MONEY_REQUEST_UPGRADE: {
        route: ':action/:iouType/upgrade/:transactionID/:reportID/:upgradePath?',
        getRoute: (params: {action: IOUAction; iouType: IOUType; transactionID: string; reportID: string; backTo?: string; shouldSubmitExpense?: boolean; upgradePath?: string}) => {
            const {action, iouType, transactionID, reportID, backTo = '', shouldSubmitExpense = false, upgradePath} = params;
            const upgradePathParam = upgradePath ? `/${upgradePath}` : '';
            const baseURL = `${action as string}/${iouType as string}/upgrade/${transactionID}/${reportID}${upgradePathParam}` as const;

            if (shouldSubmitExpense) {
                // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
                return getUrlWithBackToParam(`${baseURL}?shouldSubmitExpense=${shouldSubmitExpense}` as const, backTo);
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(baseURL, backTo);
        },
    },
    MONEY_REQUEST_STEP_DESTINATION: {
        route: ':action/:iouType/destination/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/destination/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_TIME: {
        route: ':action/:iouType/time/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/time/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_SUBRATE: {
        route: ':action/:iouType/subrate/:transactionID/:reportID/:pageIndex',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/subrate/${transactionID}/${reportID}/0`, backTo),
    },
    MONEY_REQUEST_STEP_DESTINATION_EDIT: {
        route: ':action/:iouType/destination/:transactionID/:reportID/edit',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/destination/${transactionID}/${reportID}/edit`, backTo),
    },
    MONEY_REQUEST_STEP_TIME_EDIT: {
        route: ':action/:iouType/time/:transactionID/:reportID/edit',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/time/${transactionID}/${reportID}/edit`, backTo),
    },
    MONEY_REQUEST_STEP_SUBRATE_EDIT: {
        route: ':action/:iouType/subrate/:transactionID/:reportID/edit/:pageIndex',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, pageIndex = 0, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/subrate/${transactionID}/${reportID}/edit/${pageIndex}`, backTo),
    },
    MONEY_REQUEST_STEP_REPORT: {
        route: ':action/:iouType/report/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backTo = '', reportActionID?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/report/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo),
    },
    MONEY_REQUEST_RECEIPT_PREVIEW: {
        route: ':action/:iouType/receipt/:transactionID/:reportID',
        getRoute: (reportID: string, transactionID: string, action: IOUAction, iouType: IOUType) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the MONEY_REQUEST_RECEIPT_PREVIEW route');
            }
            if (!transactionID) {
                Log.warn('Invalid transactionID is used to build the MONEY_REQUEST_RECEIPT_PREVIEW route');
            }
            return `${action}/${iouType}/receipt/${transactionID}/${reportID}?readonly=false` as const;
        },
    },
    MONEY_REQUEST_EDIT_REPORT: {
        route: ':action/:iouType/report/:reportID/edit',
        getRoute: (action: IOUAction, iouType: IOUType, reportID?: string, shouldTurnOffSelectionMode?: boolean, backTo = '') => {
            if (!reportID) {
                Log.warn('Invalid reportID while building route MONEY_REQUEST_EDIT_REPORT');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/report/${reportID}/edit${shouldTurnOffSelectionMode ? '?shouldTurnOffSelectionMode=true' : ''}`, backTo);
        },
    },
    SET_DEFAULT_WORKSPACE: {
        route: 'set-default-workspace',
        getRoute: (navigateTo?: string) => (navigateTo ? (`set-default-workspace?navigateTo=${encodeURIComponent(navigateTo)}` as const) : ('set-default-workspace' as const)),
    },
    SETTINGS_TAGS_ROOT: {
        route: 'settings/:policyID/tags',
        getRoute: (policyID: string | undefined, backTo = '') => {
            if (!policyID) {
                Log.warn('Invalid policyID while building route SETTINGS_TAGS_ROOT');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`settings/${policyID}/tags`, backTo);
        },
    },
    SETTINGS_TAGS_SETTINGS: {
        route: 'settings/:policyID/tags/settings',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/tags/settings` as const, backTo),
    },
    SETTINGS_TAGS_EDIT: {
        route: 'settings/:policyID/tags/:orderWeight/edit',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, orderWeight: number, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/tags/${orderWeight}/edit` as const, backTo),
    },
    SETTINGS_TAG_CREATE: {
        route: 'settings/:policyID/tags/new',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/tags/new` as const, backTo),
    },
    SETTINGS_TAG_EDIT: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName/edit',
        getRoute: (policyID: string, orderWeight: number, tagName: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`settings/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/edit` as const, backTo),
    },
    SETTINGS_TAG_SETTINGS: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName',
        getRoute: (policyID: string, orderWeight: number, tagName: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`settings/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}` as const, backTo),
    },
    SETTINGS_TAG_APPROVER: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName/approver',
        getRoute: (policyID: string, orderWeight: number, tagName: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`settings/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/approver` as const, backTo),
    },
    SETTINGS_TAG_LIST_VIEW: {
        route: 'settings/:policyID/tag-list/:orderWeight',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, orderWeight: number, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/tag-list/${orderWeight}` as const, backTo),
    },
    SETTINGS_TAG_GL_CODE: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName/gl-code',
        getRoute: (policyID: string, orderWeight: number, tagName: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`settings/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/gl-code` as const, backTo),
    },
    SETTINGS_TAGS_IMPORT: {
        route: 'settings/:policyID/tags/import',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/tags/import` as const, backTo),
    },
    SETTINGS_TAGS_IMPORTED: {
        route: 'settings/:policyID/tags/imported',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/tags/imported` as const, backTo),
    },
    SETTINGS_CATEGORIES_ROOT: {
        route: 'settings/:policyID/categories',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories`, backTo),
    },
    SETTINGS_CATEGORY_SETTINGS: {
        route: 'settings/:policyID/category/:categoryName',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, categoryName: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/category/${encodeURIComponent(categoryName)}`, backTo),
    },
    SETTINGS_CATEGORIES_SETTINGS: {
        route: 'settings/:policyID/categories/settings',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories/settings`, backTo),
    },
    SETTINGS_CATEGORY_CREATE: {
        route: 'settings/:policyID/categories/new',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories/new`, backTo),
    },
    SETTINGS_CATEGORY_EDIT: {
        route: 'settings/:policyID/category/:categoryName/edit',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, categoryName: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/category/${encodeURIComponent(categoryName)}/edit`, backTo),
    },
    SETTINGS_CATEGORIES_IMPORT: {
        route: 'settings/:policyID/categories/import',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories/import` as const, backTo),
    },
    SETTINGS_CATEGORIES_IMPORTED: {
        route: 'settings/:policyID/categories/imported',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo = '') => getUrlWithBackToParam(`settings/${policyID}/categories/imported` as const, backTo),
    },
    SETTINGS_CATEGORY_PAYROLL_CODE: {
        route: 'settings/:policyID/category/:categoryName/payroll-code',
        getRoute: (policyID: string, categoryName: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`settings/${policyID}/category/${encodeURIComponent(categoryName)}/payroll-code` as const, backTo),
    },
    SETTINGS_CATEGORY_GL_CODE: {
        route: 'settings/:policyID/category/:categoryName/gl-code',
        getRoute: (policyID: string, categoryName: string, backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`settings/${policyID}/category/${encodeURIComponent(categoryName)}/gl-code` as const, backTo),
    },
    MONEY_REQUEST_STEP_DATE: {
        route: ':action/:iouType/date/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', reportActionID?: string) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DATE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/date/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_DESCRIPTION: {
        route: ':action/:iouType/description/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', reportActionID?: string) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DESCRIPTION route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/description/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_DISTANCE: {
        route: ':action/:iouType/distance/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', reportActionID?: string) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DISTANCE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/distance/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_DISTANCE_MANUAL: {
        route: ':action/:iouType/distance-manual/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', reportActionID?: string) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DISTANCE_MANUAL route');
            }
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/distance-manual/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_DISTANCE_ODOMETER: {
        route: ':action/:iouType/distance-odometer/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DISTANCE_ODOMETER route');
            }

            return `${action as string}/${iouType as string}/distance-odometer/${transactionID}/${reportID}` as const;
        },
    },
    MONEY_REQUEST_STEP_DISTANCE_RATE: {
        route: ':action/:iouType/distanceRate/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', reportActionID?: string) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DISTANCE_RATE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/distanceRate/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_MERCHANT: {
        route: ':action/:iouType/merchant/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', reportActionID?: string) => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_MERCHANT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/merchant/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_PARTICIPANTS: {
        route: ':action/:iouType/participants/:transactionID/:reportID',
        getRoute: (iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '', action: IOUAction = 'create') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/participants/${transactionID}/${reportID}`, backTo),
    },
    MONEY_REQUEST_STEP_SCAN: {
        route: ':action/:iouType/scan/:transactionID/:reportID',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backTo = '') => {
            if (!transactionID || !reportID) {
                Log.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_SCAN route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`${action as string}/${iouType as string}/scan/${transactionID}/${reportID}`, backTo);
        },
    },
    MONEY_REQUEST_STEP_TAG: {
        route: ':action/:iouType/tag/:orderWeight/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, orderWeight: number, transactionID: string, reportID?: string, backTo = '', reportActionID?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(
                `${action as string}/${iouType as string}/tag/${orderWeight}/${transactionID}${reportID ? `/${reportID}` : ''}${reportActionID ? `/${reportActionID}` : ''}`,
                backTo,
            ),
    },
    MONEY_REQUEST_STEP_WAYPOINT: {
        route: ':action/:iouType/waypoint/:transactionID/:reportID/:pageIndex',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID?: string, pageIndex = '', backTo = '') =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`${action as string}/${iouType as string}/waypoint/${transactionID}/${reportID}/${pageIndex}`, backTo),
    },
    // This URL is used as a redirect to one of the create tabs below. This is so that we can message users with a link
    // straight to those flows without needing to have optimistic transaction and report IDs.
    MONEY_REQUEST_START: {
        route: 'start/:iouType/:iouRequestType',
        getRoute: (iouType: IOUType, iouRequestType: IOURequestType) => `start/${iouType as string}/${iouRequestType as string}` as const,
    },
    MONEY_REQUEST_CREATE_TAB_DISTANCE: {
        route: 'distance/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `create/${iouType as string}/start/${transactionID}/${reportID}/distance/${backToReport ?? ''}` as const,
    },
    MONEY_REQUEST_CREATE_TAB_MANUAL: {
        route: 'manual/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/manual/${backToReport ?? ''}` as const,
    },
    MONEY_REQUEST_CREATE_TAB_SCAN: {
        route: 'scan/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `create/${iouType as string}/start/${transactionID}/${reportID}/scan/${backToReport ?? ''}` as const,
    },
    MONEY_REQUEST_CREATE_TAB_PER_DIEM: {
        route: 'per-diem/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `create/${iouType as string}/start/${transactionID}/${reportID}/per-diem/${backToReport ?? ''}` as const,
    },
    MONEY_REQUEST_CREATE_TAB_TIME: {
        route: 'time/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `create/${iouType as string}/start/${transactionID}/${reportID}/time/${backToReport ?? ''}` as const,
    },

    MONEY_REQUEST_RECEIPT_VIEW: {
        route: 'receipt-view/:transactionID',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (transactionID: string, backTo: string) => getUrlWithBackToParam(`receipt-view/${transactionID}`, backTo),
    } as const,

    MONEY_REQUEST_STATE_SELECTOR: {
        route: 'submit/state',

        getRoute: (state?: string, backTo?: string, label?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            `${getUrlWithBackToParam(`submit/state${state ? `?state=${encodeURIComponent(state)}` : ''}`, backTo)}${
                // the label param can be an empty string so we cannot use a nullish ?? operator
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                label ? `${backTo || state ? '&' : '?'}label=${encodeURIComponent(label)}` : ''
            }` as const,
    },
    MONEY_REQUEST_STEP_TIME_RATE: {
        route: ':action/:iouType/rate/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, reportActionID?: string) =>
            `${action as string}/${iouType as string}/rate/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}` as const,
    },
    MONEY_REQUEST_STEP_HOURS: {
        route: ':action/:iouType/hours/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, reportActionID?: string) =>
            `${action as string}/${iouType as string}/hours/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}` as const,
    },
    MONEY_REQUEST_STEP_HOURS_EDIT: {
        route: ':action/:iouType/hours-edit/:transactionID/:reportID/:reportActionID?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, reportActionID?: string) =>
            `${action as string}/${iouType as string}/hours-edit/${transactionID}/${reportID}${reportActionID ? `/${reportActionID}` : ''}` as const,
    },
    DISTANCE_REQUEST_CREATE: {
        route: ':action/:iouType/start/:transactionID/:reportID/distance-new/:backToReport?',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/distance-new/${backToReport ?? ''}` as const,
    },
    DISTANCE_REQUEST_CREATE_TAB_MAP: {
        route: 'distance-map',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/distance-new${backToReport ? `/${backToReport}` : ''}/distance-map` as const,
    },
    DISTANCE_REQUEST_CREATE_TAB_MANUAL: {
        route: 'distance-manual',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/distance-new${backToReport ? `/${backToReport}` : ''}/distance-manual` as const,
    },
    DISTANCE_REQUEST_CREATE_TAB_GPS: {
        route: 'distance-gps',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string | undefined, reportID: string | undefined, backToReport?: string) =>
            `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/distance-new${backToReport ? `/${backToReport}` : ''}/distance-gps` as const,
    },
    DISTANCE_REQUEST_CREATE_TAB_ODOMETER: {
        route: 'distance-odometer',
        getRoute: (action: IOUAction, iouType: IOUType, transactionID: string, reportID: string, backToReport?: string) =>
            `${action as string}/${iouType as string}/start/${transactionID}/${reportID}/distance-new${backToReport ? `/${backToReport}` : ''}/distance-odometer` as const,
    },
    IOU_SEND_ADD_BANK_ACCOUNT: 'pay/new/add-bank-account',
    IOU_SEND_ADD_DEBIT_CARD: 'pay/new/add-debit-card',
    IOU_SEND_ENABLE_PAYMENTS: 'pay/new/enable-payments',

    NEW_TASK: {
        route: 'new/task',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task', backTo),
    },
    NEW_TASK_ASSIGNEE: {
        route: 'new/task/assignee',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task/assignee', backTo),
    },
    NEW_TASK_SHARE_DESTINATION: 'new/task/share-destination',
    NEW_TASK_DETAILS: {
        route: 'new/task/details',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task/details', backTo),
    },
    NEW_TASK_TITLE: {
        route: 'new/task/title',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('new/task/title', backTo),
    },
    NEW_TASK_DESCRIPTION: {
        route: 'new/task/description',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
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
        route: 'workspaces/:policyID',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_INITIAL route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return `${getUrlWithBackToParam(`workspaces/${policyID}`, backTo)}` as const;
        },
    },
    WORKSPACE_INVITE: {
        route: 'workspaces/:policyID/invite',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => `${getUrlWithBackToParam(`workspaces/${policyID}/invite`, backTo)}` as const,
    },
    WORKSPACE_INVITE_MESSAGE: {
        route: 'workspaces/:policyID/invite-message',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => `${getUrlWithBackToParam(`workspaces/${policyID}/invite-message`, backTo)}` as const,
    },
    WORKSPACE_INVITE_MESSAGE_ROLE: {
        route: 'workspaces/:policyID/invite-message/role',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => `${getUrlWithBackToParam(`workspaces/${policyID}/invite-message/role`, backTo)}` as const,
    },
    WORKSPACE_OVERVIEW: {
        route: 'workspaces/:policyID/overview',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_OVERVIEW route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/overview` as const, backTo);
        },
    },
    WORKSPACE_OVERVIEW_ADDRESS: {
        route: 'workspaces/:policyID/overview/address',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_OVERVIEW_ADDRESS route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/overview/address` as const, backTo);
        },
    },
    WORKSPACE_OVERVIEW_PLAN: {
        route: 'workspaces/:policyID/overview/plan',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/overview/plan` as const, backTo),
    },
    WORKSPACE_ACCOUNTING: {
        route: 'workspaces/:policyID/accounting',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting` as const,
    },
    WORKSPACE_OVERVIEW_CURRENCY: {
        route: 'workspaces/:policyID/overview/currency',
        getRoute: (policyID: string, isForcedToChangeCurrency?: boolean) => {
            let queryParams = '';
            if (isForcedToChangeCurrency) {
                queryParams += `?isForcedToChangeCurrency=true`;
            }
            return `workspaces/${policyID}/overview/currency${queryParams}` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export` as const, backTo, false);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account` as const, backTo),
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/account-select',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account/account-select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/default-vendor-select',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account/default-vendor-select` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/card-select',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/company-card-expense-account/card-select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/invoice-account-select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/invoice-account-select` as const, backTo),
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/preferred-exporter',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/preferred-exporter` as const, backTo),
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/out-of-pocket-expense` as const, backTo),
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense/account-select',
        getRoute: (policyID: string, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/out-of-pocket-expense/account-select` as const, backTo),
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense/entity-select',
        getRoute: (policyID: string, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/out-of-pocket-expense/entity-select` as const, backTo),
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/date-select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-online/export/date-select` as const, backTo),
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account/account-select',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/company-card-expense-account/account-select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account/card-select',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/company-card-expense-account/card-select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account/default-vendor-select',
        getRoute: (policyID?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-desktop/export/company-card-expense-account/default-vendor-select` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/company-card-expense-account` as const, backTo);
        },
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/advanced',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/advanced` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_AUTO_SYNC: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/advanced/autosync',
        getRoute: (policyID?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_AUTO_SYNC route');
            }

            return `workspaces/${policyID}/accounting/quickbooks-desktop/advanced/autosync` as const;
        },
    },
    POLICY_ACCOUNTING_CARD_RECONCILIATION_QUICKBOOKS_DESKTOP_AUTO_SYNC: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/card-reconciliation/autosync',
        getRoute: (policyID?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_CARD_RECONCILIATION_QUICKBOOKS_DESKTOP_AUTO_SYNC route');
            }

            return `workspaces/${policyID}/accounting/quickbooks-desktop/card-reconciliation/autosync` as const;
        },
    },
    POLICY_ACCOUNTING_CARD_RECONCILIATION_SAGE_INTACCT_AUTO_SYNC: {
        route: 'workspaces/:policyID/accounting/sage-intacct/card-reconciliation/autosync',
        getRoute: (policyID?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_CARD_RECONCILIATION_SAGE_INTACCT_AUTO_SYNC route');
            }

            return `workspaces/${policyID}/accounting/sage-intacct/card-reconciliation/autosync` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/advanced/autosync/accounting-method',
        getRoute: (policyID?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ACCOUNTING_METHOD route');
            }

            return `workspaces/${policyID}/accounting/quickbooks-desktop/advanced/autosync/accounting-method` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/date-select',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/date-select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/preferred-exporter',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/preferred-exporter` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/out-of-pocket-expense` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select',
        getRoute: (policyID?: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/quickbooks-desktop/export` as const, backTo, false);
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/setup-modal',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/setup-modal` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/setup-required-device',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/setup-required-device` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/trigger-first-sync',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/trigger-first-sync` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/import` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/accounts',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/import/accounts` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/classes',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-desktop/import/classes` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/classes/displayed_as',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/import/classes/displayed_as` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/customers',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-desktop/import/customers` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/customers/displayed_as',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/import/customers/displayed_as` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ITEMS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/items',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-desktop/import/items` as const,
    },
    WORKSPACE_OVERVIEW_NAME: {
        route: 'workspaces/:policyID/overview/name',
        getRoute: (policyID: string) => `workspaces/${policyID}/overview/name` as const,
    },
    WORKSPACE_OVERVIEW_DESCRIPTION: {
        route: 'workspaces/:policyID/overview/description',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_OVERVIEW_DESCRIPTION route');
            }
            return `workspaces/${policyID}/overview/description` as const;
        },
    },
    WORKSPACE_OVERVIEW_SHARE: {
        route: 'workspaces/:policyID/overview/share',
        getRoute: (policyID: string) => `workspaces/${policyID}/overview/share` as const,
    },
    WORKSPACE_AVATAR: {
        route: 'workspaces/:policyID/avatar',
        getRoute: (policyID: string, fallbackLetter?: UpperCaseCharacters) => `workspaces/${policyID}/avatar${fallbackLetter ? `?letter=${fallbackLetter}` : ''}` as const,
    },
    WORKSPACE_JOIN_USER: {
        route: 'workspaces/:policyID/join',
        getRoute: (policyID: string, inviterEmail: string) => `workspaces/${policyID}/join?email=${inviterEmail}` as const,
    },
    WORKSPACE_SETTINGS_CURRENCY: {
        route: 'workspaces/:policyID/settings/currency',
        getRoute: (policyID: string) => `workspaces/${policyID}/settings/currency` as const,
    },
    WORKSPACE_WORKFLOWS: {
        route: 'workspaces/:policyID/workflows',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_WORKFLOWS route');
            }
            return `workspaces/${policyID}/workflows` as const;
        },
    },
    WORKSPACE_WORKFLOWS_APPROVALS_NEW: {
        route: 'workspaces/:policyID/workflows/approvals/new',
        getRoute: (policyID: string) => `workspaces/${policyID}/workflows/approvals/new` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVALS_EDIT: {
        route: 'workspaces/:policyID/workflows/approvals/:firstApproverEmail/edit',
        getRoute: (policyID: string, firstApproverEmail: string) => `workspaces/${policyID}/workflows/approvals/${encodeURIComponent(firstApproverEmail)}/edit` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM: {
        route: 'workspaces/:policyID/workflows/approvals/expenses-from',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/workflows/approvals/expenses-from` as const, backTo),
    },
    WORKSPACE_WORKFLOWS_APPROVALS_APPROVER: {
        route: 'workspaces/:policyID/workflows/approvals/approver',
        getRoute: (policyID: string, approverIndex: number) => `workspaces/${policyID}/workflows/approvals/approver?approverIndex=${approverIndex}` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVALS_APPROVER_CHANGE: {
        route: 'workspaces/:policyID/workflows/approvals/approver-change',
        getRoute: (policyID: string, approverIndex: number) => `workspaces/${policyID}/workflows/approvals/approver-change?approverIndex=${approverIndex}` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVALS_APPROVAL_LIMIT: {
        route: 'workspaces/:policyID/workflows/approvals/approval-limit',
        getRoute: (policyID: string, approverIndex: number) => `workspaces/${policyID}/workflows/approvals/approval-limit?approverIndex=${approverIndex}` as const,
    },
    WORKSPACE_WORKFLOWS_APPROVALS_OVER_LIMIT_APPROVER: {
        route: 'workspaces/:policyID/workflows/approvals/over-limit-approver',
        getRoute: (policyID: string, approverIndex: number) => `workspaces/${policyID}/workflows/approvals/over-limit-approver?approverIndex=${approverIndex}` as const,
    },
    WORKSPACE_WORKFLOWS_PAYER: {
        route: 'workspaces/:policyID/workflows/payer',
        getRoute: (policyId: string) => `workspaces/${policyId}/workflows/payer` as const,
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY: {
        route: 'workspaces/:policyID/workflows/auto-reporting-frequency',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY route');
            }
            return `workspaces/${policyID}/workflows/auto-reporting-frequency` as const;
        },
    },
    WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET: {
        route: 'workspaces/:policyID/workflows/auto-reporting-frequency/monthly-offset',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET route');
            }
            return `workspaces/${policyID}/workflows/auto-reporting-frequency/monthly-offset` as const;
        },
    },
    WORKSPACE_INVOICES: {
        route: 'workspaces/:policyID/invoices',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_INVOICES route');
            }
            return `workspaces/${policyID}/invoices` as const;
        },
    },
    WORKSPACE_INVOICES_VERIFY_ACCOUNT: {
        route: `workspaces/:policyID/invoices/${VERIFY_ACCOUNT}`,
        getRoute: (policyID: string) => `workspaces/${policyID}/invoices/${VERIFY_ACCOUNT}` as const,
    },
    WORKSPACE_INVOICES_COMPANY_NAME: {
        route: 'workspaces/:policyID/invoices/company-name',
        getRoute: (policyID: string) => `workspaces/${policyID}/invoices/company-name` as const,
    },
    WORKSPACE_INVOICES_COMPANY_WEBSITE: {
        route: 'workspaces/:policyID/invoices/company-website',
        getRoute: (policyID: string) => `workspaces/${policyID}/invoices/company-website` as const,
    },
    WORKSPACE_MEMBERS: {
        route: 'workspaces/:policyID/members',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_MEMBERS route');
            }
            return `workspaces/${policyID}/members` as const;
        },
    },
    WORKSPACE_MEMBERS_IMPORT: {
        route: 'workspaces/:policyID/members/import',
        getRoute: (policyID: string) => `workspaces/${policyID}/members/import` as const,
    },
    WORKSPACE_MEMBERS_IMPORTED: {
        route: 'workspaces/:policyID/members/imported',
        getRoute: (policyID: string) => `workspaces/${policyID}/members/imported` as const,
    },
    WORKSPACE_MEMBERS_IMPORTED_CONFIRMATION: {
        route: 'workspaces/:policyID/members/imported/confirmation',
        getRoute: (policyID: string) => `workspaces/${policyID}/members/imported/confirmation` as const,
    },
    POLICY_ACCOUNTING: {
        route: 'workspaces/:policyID/accounting',
        getRoute: (policyID: string | undefined, newConnectionName?: ConnectionName, integrationToDisconnect?: ConnectionName, shouldDisconnectIntegrationBeforeConnecting?: boolean) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING route');
            }

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
            return `workspaces/${policyID}/accounting${queryParams}` as const;
        },
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/advanced',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-online/advanced` as const;
        },
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/account-selector',
        getRoute: (policyID: string | undefined) => `workspaces/${policyID}/accounting/quickbooks-online/account-selector` as const,
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/invoice-account-selector',
        getRoute: (policyID: string | undefined) => `workspaces/${policyID}/accounting/quickbooks-online/invoice-account-selector` as const,
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC: {
        route: 'workspaces/:policyID/connections/quickbooks-online/advanced/autosync',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string | undefined, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/connections/quickbooks-online/advanced/autosync` as const, backTo),
    },
    WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD: {
        route: 'workspaces/:policyID/connections/quickbooks-online/advanced/autosync/accounting-method',
        getRoute: (policyID: string | undefined, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/connections/quickbooks-online/advanced/autosync/accounting-method` as const, backTo),
    },
    WORKSPACE_ACCOUNTING_CARD_RECONCILIATION: {
        route: 'workspaces/:policyID/accounting/:connection/card-reconciliation',
        getRoute: (policyID?: string, connection?: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_ACCOUNTING_CARD_RECONCILIATION route');
            }

            return `workspaces/${policyID}/accounting/${connection as string}/card-reconciliation` as const;
        },
    },
    WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS: {
        route: 'workspaces/:policyID/accounting/:connection/card-reconciliation/account',
        getRoute: (policyID: string | undefined, connection?: ValueOf<typeof CONST.POLICY.CONNECTIONS.ROUTE>, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/${connection as string}/card-reconciliation/account` as const, backTo);
        },
    },
    WORKSPACE_CATEGORIES: {
        route: 'workspaces/:policyID/categories',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_CATEGORIES route');
            }
            return `workspaces/${policyID}/categories` as const;
        },
    },
    WORKSPACE_CATEGORY_SETTINGS: {
        route: 'workspaces/:policyID/category/:categoryName',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}` as const,
    },
    WORKSPACE_UPGRADE: {
        route: 'workspaces/:policyID?/upgrade/:featureName?',
        getRoute: (policyID?: string, featureName?: string, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(policyID ? (`workspaces/${policyID}/upgrade/${encodeURIComponent(featureName ?? '')}` as const) : (`workspaces/upgrade` as const), backTo),
    },
    WORKSPACE_DOWNGRADE: {
        route: 'workspaces/:policyID?/downgrade/',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID?: string, backTo?: string) => getUrlWithBackToParam(policyID ? (`workspaces/${policyID}/downgrade/` as const) : (`workspaces/downgrade` as const), backTo),
    },
    WORKSPACE_PAY_AND_DOWNGRADE: {
        route: 'workspaces/pay-and-downgrade/',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`workspaces/pay-and-downgrade` as const, backTo),
    },
    WORKSPACE_CATEGORIES_SETTINGS: {
        route: 'workspaces/:policyID/categories/settings',
        getRoute: (policyID: string) => `workspaces/${policyID}/categories/settings` as const,
    },
    WORKSPACE_CATEGORIES_IMPORT: {
        route: 'workspaces/:policyID/categories/import',
        getRoute: (policyID: string) => `workspaces/${policyID}/categories/import` as const,
    },
    WORKSPACE_CATEGORIES_IMPORTED: {
        route: 'workspaces/:policyID/categories/imported',
        getRoute: (policyID: string) => `workspaces/${policyID}/categories/imported` as const,
    },
    WORKSPACE_CATEGORY_CREATE: {
        route: 'workspaces/:policyID/categories/new',
        getRoute: (policyID: string) => `workspaces/${policyID}/categories/new` as const,
    },
    WORKSPACE_CATEGORY_EDIT: {
        route: 'workspaces/:policyID/category/:categoryName/edit',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/edit` as const,
    },
    WORKSPACE_CATEGORY_PAYROLL_CODE: {
        route: 'workspaces/:policyID/category/:categoryName/payroll-code',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/payroll-code` as const,
    },
    WORKSPACE_CATEGORY_GL_CODE: {
        route: 'workspaces/:policyID/category/:categoryName/gl-code',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/gl-code` as const,
    },
    WORKSPACE_CATEGORY_DEFAULT_TAX_RATE: {
        route: 'workspaces/:policyID/category/:categoryName/tax-rate',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/tax-rate` as const,
    },
    WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER: {
        route: 'workspaces/:policyID/category/:categoryName/flag-amounts',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/flag-amounts` as const,
    },
    WORKSPACE_CATEGORY_DESCRIPTION_HINT: {
        route: 'workspaces/:policyID/category/:categoryName/description-hint',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/description-hint` as const,
    },
    WORKSPACE_CATEGORY_REQUIRE_RECEIPTS_OVER: {
        route: 'workspaces/:policyID/category/:categoryName/require-receipts-over',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/require-receipts-over` as const,
    },
    WORKSPACE_CATEGORY_REQUIRE_ITEMIZED_RECEIPTS_OVER: {
        route: 'workspaces/:policyID/category/:categoryName/require-itemized-receipts-over',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/require-itemized-receipts-over` as const,
    },
    WORKSPACE_CATEGORY_REQUIRED_FIELDS: {
        route: 'workspaces/:policyID/category/:categoryName/required-fields',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/required-fields` as const,
    },
    WORKSPACE_CATEGORY_APPROVER: {
        route: 'workspaces/:policyID/category/:categoryName/approver',
        getRoute: (policyID: string, categoryName: string) => `workspaces/${policyID}/category/${encodeURIComponent(categoryName)}/approver` as const,
    },
    WORKSPACE_MORE_FEATURES: {
        route: 'workspaces/:policyID/more-features',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_MORE_FEATURES route');
            }
            return `workspaces/${policyID}/more-features` as const;
        },
    },
    WORKSPACE_TAGS: {
        route: 'workspaces/:policyID/tags',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_TAGS route');
            }
            return `workspaces/${policyID}/tags` as const;
        },
    },
    WORKSPACE_TAG_CREATE: {
        route: 'workspaces/:policyID/tags/new',
        getRoute: (policyID: string) => `workspaces/${policyID}/tags/new` as const,
    },
    WORKSPACE_TAGS_SETTINGS: {
        route: 'workspaces/:policyID/tags/settings',
        getRoute: (policyID: string) => `workspaces/${policyID}/tags/settings` as const,
    },
    WORKSPACE_EDIT_TAGS: {
        route: 'workspaces/:policyID/tags/:orderWeight/edit',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, orderWeight: number, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/tags/${orderWeight}/edit` as const, backTo),
    },
    WORKSPACE_TAG_EDIT: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName/edit',
        getRoute: (policyID: string, orderWeight: number, tagName: string) => `workspaces/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/edit` as const,
    },
    WORKSPACE_TAG_SETTINGS: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName',
        getRoute: (policyID: string, orderWeight: number, tagName: string, parentTagsFilter?: string) => {
            let queryParams = '';
            if (parentTagsFilter) {
                queryParams += `?parentTagsFilter=${parentTagsFilter}`;
            }
            return `workspaces/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}${queryParams}` as const;
        },
    },
    WORKSPACE_TAG_APPROVER: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName/approver',
        getRoute: (policyID: string, orderWeight: number, tagName: string) => `workspaces/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/approver` as const,
    },
    WORKSPACE_TAG_LIST_VIEW: {
        route: 'workspaces/:policyID/tag-list/:orderWeight',
        getRoute: (policyID: string, orderWeight: number) => `workspaces/${policyID}/tag-list/${orderWeight}` as const,
    },
    WORKSPACE_TAG_GL_CODE: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName/gl-code',
        getRoute: (policyID: string, orderWeight: number, tagName: string) => `workspaces/${policyID}/tag/${orderWeight}/${encodeURIComponent(tagName)}/gl-code` as const,
    },
    WORKSPACE_TAGS_IMPORT: {
        route: 'workspaces/:policyID/tags/import',
        getRoute: (policyID: string) => `workspaces/${policyID}/tags/import` as const,
    },
    WORKSPACE_MULTI_LEVEL_TAGS_IMPORT_SETTINGS: {
        route: 'workspaces/:policyID/tags/import/multi-level',
        getRoute: (policyID: string) => `workspaces/${policyID}/tags/import/multi-level` as const,
    },
    WORKSPACE_TAGS_IMPORT_OPTIONS: {
        route: 'workspaces/:policyID/tags/import/import-options',
        getRoute: (policyID: string) => `workspaces/${policyID}/tags/import/import-options` as const,
    },
    WORKSPACE_TAGS_IMPORTED: {
        route: 'workspaces/:policyID/tags/imported',
        getRoute: (policyID: string) => `workspaces/${policyID}/tags/imported` as const,
    },
    WORKSPACE_TAGS_IMPORTED_MULTI_LEVEL: {
        route: 'workspaces/:policyID/tags/imported/multi-level',
        getRoute: (policyID: string) => `workspaces/${policyID}/tags/imported/multi-level` as const,
    },
    WORKSPACE_TAXES: {
        route: 'workspaces/:policyID/taxes',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_TAXES route');
            }
            return `workspaces/${policyID}/taxes` as const;
        },
    },
    WORKSPACE_TAXES_SETTINGS: {
        route: 'workspaces/:policyID/taxes/settings',
        getRoute: (policyID: string) => `workspaces/${policyID}/taxes/settings` as const,
    },
    WORKSPACE_TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT: {
        route: 'workspaces/:policyID/taxes/settings/workspace-currency',
        getRoute: (policyID: string) => `workspaces/${policyID}/taxes/settings/workspace-currency` as const,
    },
    WORKSPACE_TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT: {
        route: 'workspaces/:policyID/taxes/settings/foreign-currency',
        getRoute: (policyID: string) => `workspaces/${policyID}/taxes/settings/foreign-currency` as const,
    },
    WORKSPACE_TAXES_SETTINGS_CUSTOM_TAX_NAME: {
        route: 'workspaces/:policyID/taxes/settings/tax-name',
        getRoute: (policyID: string) => `workspaces/${policyID}/taxes/settings/tax-name` as const,
    },
    WORKSPACE_MEMBER_DETAILS: {
        route: 'workspaces/:policyID/members/:accountID',
        getRoute: (policyID: string, accountID: number) => `workspaces/${policyID}/members/${accountID}` as const,
    },
    WORKSPACE_MEMBER_DETAILS_ROLE: {
        route: 'workspaces/:policyID/members/:accountID/role',
        getRoute: (policyID: string, accountID: number) => `workspaces/${policyID}/members/${accountID}/role` as const,
    },
    WORKSPACE_CUSTOM_FIELDS: {
        route: 'workspaces/:policyID/members/:accountID/:customFieldType',
        getRoute: (policyID: string, accountID: number, customFieldType: CustomFieldType) => `/workspaces/${policyID}/members/${accountID}/${customFieldType}` as const,
    },
    WORKSPACE_MEMBER_NEW_CARD: {
        route: 'workspaces/:policyID/members/:accountID/new-card',
        getRoute: (policyID: string, accountID: number) => `workspaces/${policyID}/members/${accountID}/new-card` as const,
    },
    WORKSPACE_MEMBER_ROLE_SELECTION: {
        route: 'workspaces/:policyID/members/:accountID/role-selection',
        getRoute: (policyID: string, accountID: number) => `workspaces/${policyID}/members/${accountID}/role-selection` as const,
    },
    WORKSPACE_OWNER_CHANGE_SUCCESS: {
        route: 'workspaces/:policyID/change-owner/:accountID/success',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/change-owner/${accountID}/success` as const, backTo),
    },
    WORKSPACE_OWNER_CHANGE_ERROR: {
        route: 'workspaces/:policyID/change-owner/:accountID/failure',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, accountID: number, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/change-owner/${accountID}/failure` as const, backTo),
    },
    WORKSPACE_OWNER_CHANGE_CHECK: {
        route: 'workspaces/:policyID/change-owner/:accountID/:error',
        getRoute: (policyID: string | undefined, accountID: number, error: ValueOf<typeof CONST.POLICY.OWNERSHIP_ERRORS>, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_OWNER_CHANGE_CHECK route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/change-owner/${accountID}/${error as string}` as const, backTo);
        },
    },
    WORKSPACE_TAX_CREATE: {
        route: 'workspaces/:policyID/taxes/new',
        getRoute: (policyID: string) => `workspaces/${policyID}/taxes/new` as const,
    },
    WORKSPACE_TAX_EDIT: {
        route: 'workspaces/:policyID/tax/:taxID',
        getRoute: (policyID: string, taxID: string) => `workspaces/${policyID}/tax/${encodeURIComponent(taxID)}` as const,
    },
    WORKSPACE_TAX_NAME: {
        route: 'workspaces/:policyID/tax/:taxID/name',
        getRoute: (policyID: string, taxID: string) => `workspaces/${policyID}/tax/${encodeURIComponent(taxID)}/name` as const,
    },
    WORKSPACE_TAX_VALUE: {
        route: 'workspaces/:policyID/tax/:taxID/value',
        getRoute: (policyID: string, taxID: string) => `workspaces/${policyID}/tax/${encodeURIComponent(taxID)}/value` as const,
    },
    WORKSPACE_TAX_CODE: {
        route: 'workspaces/:policyID/tax/:taxID/tax-code',
        getRoute: (policyID: string, taxID: string) => `workspaces/${policyID}/tax/${encodeURIComponent(taxID)}/tax-code` as const,
    },
    WORKSPACE_REPORTS: {
        route: 'workspaces/:policyID/reports',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_REPORTS route');
            }
            return `workspaces/${policyID}/reports` as const;
        },
    },
    WORKSPACE_CREATE_REPORT_FIELD: {
        route: 'workspaces/:policyID/reports/newReportField',
        getRoute: (policyID: string) => `workspaces/${policyID}/reports/newReportField` as const,
    },
    WORKSPACE_REPORT_FIELDS_SETTINGS: {
        route: 'workspaces/:policyID/reports/:reportFieldID/edit',
        getRoute: (policyID: string, reportFieldID: string) => `workspaces/${policyID}/reports/${encodeURIComponent(reportFieldID)}/edit` as const,
    },
    WORKSPACE_REPORT_FIELDS_LIST_VALUES: {
        route: 'workspaces/:policyID/reports/listValues/:reportFieldID?',
        getRoute: (policyID: string, reportFieldID?: string) => `workspaces/${policyID}/reports/listValues/${reportFieldID ? encodeURIComponent(reportFieldID) : ''}` as const,
    },
    WORKSPACE_REPORT_FIELDS_ADD_VALUE: {
        route: 'workspaces/:policyID/reports/addValue/:reportFieldID?',
        getRoute: (policyID: string, reportFieldID?: string) => `workspaces/${policyID}/reports/addValue/${reportFieldID ? encodeURIComponent(reportFieldID) : ''}` as const,
    },
    WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS: {
        route: 'workspaces/:policyID/reports/:valueIndex/:reportFieldID?',
        getRoute: (policyID: string, valueIndex: number, reportFieldID?: string) =>
            `workspaces/${policyID}/reports/${valueIndex}/${reportFieldID ? encodeURIComponent(reportFieldID) : ''}` as const,
    },
    WORKSPACE_REPORT_FIELDS_EDIT_VALUE: {
        route: 'workspaces/:policyID/reports/newReportField/:valueIndex/edit',
        getRoute: (policyID: string, valueIndex: number) => `workspaces/${policyID}/reports/newReportField/${valueIndex}/edit` as const,
    },
    WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE: {
        route: 'workspaces/:policyID/reports/:reportFieldID/edit/initialValue',
        getRoute: (policyID: string, reportFieldID: string) => `workspaces/${policyID}/reports/${encodeURIComponent(reportFieldID)}/edit/initialValue` as const,
    },
    WORKSPACE_COMPANY_CARDS: {
        route: 'workspaces/:policyID/company-cards',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_COMPANY_CARDS route');
            }
            return `workspaces/${policyID}/company-cards` as const;
        },
    },
    WORKSPACE_COMPANY_CARDS_BANK_CONNECTION: {
        route: 'workspaces/:policyID/company-cards/:feed/bank-connection',
        getRoute: (policyID: string | undefined, feed: CompanyCardFeedWithDomainID, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_COMPANY_CARDS_BANK_CONNECTION route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/company-cards/${feed}/bank-connection`, backTo);
        },
    },
    WORKSPACE_COMPANY_CARDS_ADD_NEW: {
        route: 'workspaces/:policyID/company-cards/add-card-feed',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/company-cards/add-card-feed`, backTo),
    },
    WORKSPACE_COMPANY_CARDS_SELECT_FEED: {
        route: 'workspaces/:policyID/company-cards/select-feed',
        getRoute: (policyID: string) => `workspaces/${policyID}/company-cards/select-feed` as const,
    },
    WORKSPACE_COMPANY_CARDS_BROKEN_CARD_FEED_CONNECTION: {
        route: 'workspaces/:policyID/company-cards/:feed/broken-card-feed-connection',
        getRoute: (policyID: string, feed: CompanyCardFeedWithDomainID) => `workspaces/${policyID}/company-cards/${encodeURIComponent(feed)}/broken-card-feed-connection` as const,
    },
    WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_ASSIGNEE: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card/:cardID/assignee',
        getRoute: (params: WorkspaceCompanyCardsAssignCardParams, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${params.policyID}/company-cards/${encodeURIComponent(params.feed)}/assign-card/${encodeURIComponent(params.cardID)}/assignee`, backTo),
    },
    WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_SELECTION: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card/:cardID/card-selection',
        getRoute: (params: WorkspaceCompanyCardsAssignCardParams) =>
            `workspaces/${params.policyID}/company-cards/${encodeURIComponent(params.feed)}/assign-card/${encodeURIComponent(params.cardID)}/card-selection` as const,
    },
    WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_TRANSACTION_START_DATE: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card/:cardID/transaction-start-date',
        getRoute: (params: WorkspaceCompanyCardsAssignCardParams) =>
            `workspaces/${params.policyID}/company-cards/${encodeURIComponent(params.feed)}/assign-card/${encodeURIComponent(params.cardID)}/transaction-start-date` as const,
    },
    WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CARD_NAME: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card/:cardID/card-name',
        getRoute: (params: WorkspaceCompanyCardsAssignCardParams) =>
            `workspaces/${params.policyID}/company-cards/${encodeURIComponent(params.feed)}/assign-card/${encodeURIComponent(params.cardID)}/card-name` as const,
    },
    WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_CONFIRMATION: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card/:cardID/confirmation',
        getRoute: (params: WorkspaceCompanyCardsAssignCardParams, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${params.policyID}/company-cards/${encodeURIComponent(params.feed)}/assign-card/${encodeURIComponent(params.cardID)}/confirmation`, backTo),
    },
    WORKSPACE_COMPANY_CARDS_ASSIGN_CARD_INVITE_NEW_MEMBER: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card/:cardID/invite-new-member',
        getRoute: (params: WorkspaceCompanyCardsAssignCardParams) =>
            `workspaces/${params.policyID}/company-cards/${encodeURIComponent(params.feed)}/assign-card/${encodeURIComponent(params.cardID)}/invite-new-member` as const,
    },
    WORKSPACE_COMPANY_CARD_DETAILS: {
        route: 'workspaces/:policyID/company-cards/:feed/:cardID',

        getRoute: (policyID: string, feed: CompanyCardFeedWithDomainID, cardID: string, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/company-cards/${encodeURIComponent(feed)}/${encodeURIComponent(cardID)}`, backTo),
    },
    WORKSPACE_COMPANY_CARD_EDIT_CARD_NAME: {
        route: 'workspaces/:policyID/company-cards/:feed/:cardID/edit/name',
        getRoute: (policyID: string, cardID: string, feed: CompanyCardFeedWithDomainID) =>
            `workspaces/${policyID}/company-cards/${encodeURIComponent(feed)}/${encodeURIComponent(cardID)}/edit/name` as const,
    },
    WORKSPACE_COMPANY_CARD_EDIT_TRANSACTION_START_DATE: {
        route: 'workspaces/:policyID/company-cards/:feed/:cardID/edit/transaction-start-date',
        getRoute: (policyID: string, cardID: string, feed: CompanyCardFeedWithDomainID) =>
            `workspaces/${policyID}/company-cards/${encodeURIComponent(feed)}/${encodeURIComponent(cardID)}/edit/transaction-start-date` as const,
    },
    WORKSPACE_COMPANY_CARD_EXPORT: {
        route: 'workspaces/:policyID/company-cards/:feed/:cardID/edit/export',
        getRoute: (policyID: string, cardID: string, feed: CompanyCardFeedWithDomainID, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/company-cards/${feed}/${cardID}/edit/export`, backTo, false),
    },
    WORKSPACE_EXPENSIFY_CARD: {
        route: 'workspaces/:policyID/expensify-card',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_EXPENSIFY_CARD route');
            }
            return `workspaces/${policyID}/expensify-card` as const;
        },
    },
    WORKSPACE_EXPENSIFY_CARD_DETAILS: {
        route: 'workspaces/:policyID/expensify-card/:cardID',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/${cardID}`, backTo),
    },
    EXPENSIFY_CARD_DETAILS: {
        route: 'settings/:policyID/expensify-card/:cardID',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`settings/${policyID}/expensify-card/${cardID}`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_NAME: {
        route: 'workspaces/:policyID/expensify-card/:cardID/edit/name',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/${cardID}/edit/name`, backTo),
    },
    EXPENSIFY_CARD_NAME: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/name',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`settings/${policyID}/expensify-card/${cardID}/edit/name`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_LIMIT: {
        route: 'workspaces/:policyID/expensify-card/:cardID/edit/limit',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/${cardID}/edit/limit`, backTo),
    },
    EXPENSIFY_CARD_LIMIT: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/limit',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`settings/${policyID}/expensify-card/${cardID}/edit/limit`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE: {
        route: 'workspaces/:policyID/expensify-card/:cardID/edit/limit-type',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/${cardID}/edit/limit-type`, backTo),
    },
    EXPENSIFY_CARD_LIMIT_TYPE: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/limit-type',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, cardID: string, backTo?: string) => getUrlWithBackToParam(`settings/${policyID}/expensify-card/${cardID}/edit/limit-type`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW: {
        route: 'workspaces/:policyID/expensify-card/issue-new',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/issue-new`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW_CONFIRM_MAGIC_CODE: {
        route: 'workspaces/:policyID/expensify-card/issue-new/confirm-magic-code',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/issue-new/confirm-magic-code`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT: {
        route: 'workspaces/:policyID/expensify-card/choose-bank-account',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT route');
            }
            return `workspaces/${policyID}/expensify-card/choose-bank-account` as const;
        },
    },
    WORKSPACE_EXPENSIFY_CARD_SETTINGS: {
        route: 'workspaces/:policyID/expensify-card/settings',
        getRoute: (policyID: string) => `workspaces/${policyID}/expensify-card/settings` as const,
    },
    WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT: {
        route: 'workspaces/:policyID/expensify-card/settings/account',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/settings/account`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_SELECT_FEED: {
        route: 'workspaces/:policyID/expensify-card/select-feed',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/expensify-card/select-feed`, backTo),
    },
    WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY: {
        route: 'workspaces/:policyID/expensify-card/settings/frequency',
        getRoute: (policyID: string) => `workspaces/${policyID}/expensify-card/settings/frequency` as const,
    },
    WORKSPACE_COMPANY_CARDS_SETTINGS: {
        route: 'workspaces/:policyID/company-cards/settings',
        getRoute: (policyID: string) => `workspaces/${policyID}/company-cards/settings` as const,
    },
    WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME: {
        route: 'workspaces/:policyID/company-cards/settings/feed-name',
        getRoute: (policyID: string) => `workspaces/${policyID}/company-cards/settings/feed-name` as const,
    },
    WORKSPACE_COMPANY_CARDS_SETTINGS_STATEMENT_CLOSE_DATE: {
        route: 'workspaces/:policyID/company-cards/settings/statement-close-date',
        getRoute: (policyID: string) => `workspaces/${policyID}/company-cards/settings/statement-close-date` as const,
    },
    WORKSPACE_RULES: {
        route: 'workspaces/:policyID/rules',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_RULES route');
            }
            return `workspaces/${policyID}/rules` as const;
        },
    },
    WORKSPACE_DISTANCE_RATES: {
        route: 'workspaces/:policyID/distance-rates',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_DISTANCE_RATES route');
            }
            return `workspaces/${policyID}/distance-rates` as const;
        },
    },
    WORKSPACE_TRAVEL: {
        route: 'workspaces/:policyID/travel',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_TRAVEL route');
            }
            return `workspaces/${policyID}/travel` as const;
        },
    },
    WORKSPACE_CREATE_DISTANCE_RATE: {
        route: 'workspaces/:policyID/distance-rates/new',
        getRoute: (policyID: string, transactionID?: string, reportID?: string) =>
            `workspaces/${policyID}/distance-rates/new${transactionID ? `?transactionID=${transactionID}` : ''}${reportID ? `&reportID=${reportID}` : ''}` as const,
    },
    WORKSPACE_CREATE_DISTANCE_RATE_UPGRADE: {
        route: 'workspaces/:policyID/distance-rates/new/upgrade',
        getRoute: (policyID: string, transactionID?: string, reportID?: string) =>
            `workspaces/${policyID}/distance-rates/new/upgrade${transactionID ? `?transactionID=${transactionID}` : ''}${reportID ? `&reportID=${reportID}` : ''}` as const,
    },
    WORKSPACE_DISTANCE_RATES_SETTINGS: {
        route: 'workspaces/:policyID/distance-rates/settings',
        getRoute: (policyID: string) => `workspaces/${policyID}/distance-rates/settings` as const,
    },
    WORKSPACE_DISTANCE_RATE_DETAILS: {
        route: 'workspaces/:policyID/distance-rates/:rateID',
        getRoute: (policyID: string, rateID: string) => `workspaces/${policyID}/distance-rates/${rateID}` as const,
    },
    WORKSPACE_DISTANCE_RATE_EDIT: {
        route: 'workspaces/:policyID/distance-rates/:rateID/edit',
        getRoute: (policyID: string, rateID: string) => `workspaces/${policyID}/distance-rates/${rateID}/edit` as const,
    },
    WORKSPACE_DISTANCE_RATE_NAME_EDIT: {
        route: 'workspaces/:policyID/distance-rates/:rateID/name/edit',
        getRoute: (policyID: string, rateID: string) => `workspaces/${policyID}/distance-rates/${rateID}/name/edit` as const,
    },
    WORKSPACE_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT: {
        route: 'workspaces/:policyID/distance-rates/:rateID/tax-reclaimable/edit',
        getRoute: (policyID: string, rateID: string) => `workspaces/${policyID}/distance-rates/${rateID}/tax-reclaimable/edit` as const,
    },
    WORKSPACE_DISTANCE_RATE_TAX_RATE_EDIT: {
        route: 'workspaces/:policyID/distance-rates/:rateID/tax-rate/edit',
        getRoute: (policyID: string, rateID: string) => `workspaces/${policyID}/distance-rates/${rateID}/tax-rate/edit` as const,
    },
    WORKSPACE_PER_DIEM: {
        route: 'workspaces/:policyID/per-diem',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_PER_DIEM route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/per-diem`, backTo);
        },
    },
    WORKSPACE_DUPLICATE: {
        route: 'workspace/:policyID/duplicate',
        getRoute: (policyID: string) => `workspace/${policyID}/duplicate` as const,
    },
    WORKSPACE_DUPLICATE_SELECT_FEATURES: {
        route: 'workspace/:policyID/duplicate/select-features',
        getRoute: (policyID: string) => `workspace/${policyID}/duplicate/select-features` as const,
    },
    WORKSPACE_RECEIPT_PARTNERS: {
        route: 'workspaces/:policyID/receipt-partners',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_RECEIPT_PARTNERS route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/receipt-partners`, backTo);
        },
    },
    WORKSPACE_RECEIPT_PARTNERS_INVITE: {
        route: 'workspaces/:policyID/receipt-partners/:integration/invite',
        getRoute: (policyID: string | undefined, integration: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_RECEIPT_PARTNERS_INVITE route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/receipt-partners/${integration}/invite`, backTo);
        },
    },
    WORKSPACE_RECEIPT_PARTNERS_CHANGE_BILLING_ACCOUNT: {
        route: 'workspaces/:policyID/receipt-partners/:integration/billing-account',
        getRoute: (policyID: string, integration: string) => `workspaces/${policyID}/receipt-partners/${integration}/billing-account` as const,
    },
    WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT: {
        route: 'workspaces/:policyID/receipt-partners/:integration/invite/edit',
        getRoute: (policyID: string | undefined, integration: string, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/receipt-partners/${integration}/invite/edit`, backTo);
        },
    },
    WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT_ALL: 'workspaces/:policyID/receipt-partners/:integration/invite/edit/ReceiptPartnersAllTab',
    WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT_LINKED: 'workspaces/:policyID/receipt-partners/:integration/invite/edit/ReceiptPartnersLinkedTab',
    WORKSPACE_RECEIPT_PARTNERS_INVITE_EDIT_OUTSTANDING: 'workspaces/:policyID/receipt-partners/:integration/invite/edit/ReceiptPartnersOutstandingTab',

    WORKSPACE_PER_DIEM_IMPORT: {
        route: 'workspaces/:policyID/per-diem/import',
        getRoute: (policyID: string) => `workspaces/${policyID}/per-diem/import` as const,
    },
    WORKSPACE_PER_DIEM_IMPORTED: {
        route: 'workspaces/:policyID/per-diem/imported',
        getRoute: (policyID: string) => `workspaces/${policyID}/per-diem/imported` as const,
    },
    WORKSPACE_PER_DIEM_SETTINGS: {
        route: 'workspaces/:policyID/per-diem/settings',
        getRoute: (policyID: string) => `workspaces/${policyID}/per-diem/settings` as const,
    },
    WORKSPACE_PER_DIEM_DETAILS: {
        route: 'workspaces/:policyID/per-diem/details/:rateID/:subRateID',
        getRoute: (policyID: string, rateID: string, subRateID: string) => `workspaces/${policyID}/per-diem/details/${rateID}/${subRateID}` as const,
    },
    WORKSPACE_PER_DIEM_EDIT_DESTINATION: {
        route: 'workspaces/:policyID/per-diem/edit/destination/:rateID/:subRateID',
        getRoute: (policyID: string, rateID: string, subRateID: string) => `workspaces/${policyID}/per-diem/edit/destination/${rateID}/${subRateID}` as const,
    },
    WORKSPACE_PER_DIEM_EDIT_SUBRATE: {
        route: 'workspaces/:policyID/per-diem/edit/subrate/:rateID/:subRateID',
        getRoute: (policyID: string, rateID: string, subRateID: string) => `workspaces/${policyID}/per-diem/edit/subrate/${rateID}/${subRateID}` as const,
    },
    WORKSPACE_PER_DIEM_EDIT_AMOUNT: {
        route: 'workspaces/:policyID/per-diem/edit/amount/:rateID/:subRateID',
        getRoute: (policyID: string, rateID: string, subRateID: string) => `workspaces/${policyID}/per-diem/edit/amount/${rateID}/${subRateID}` as const,
    },
    WORKSPACE_PER_DIEM_EDIT_CURRENCY: {
        route: 'workspaces/:policyID/per-diem/edit/currency/:rateID/:subRateID',
        getRoute: (policyID: string, rateID: string, subRateID: string) => `workspaces/${policyID}/per-diem/edit/currency/${rateID}/${subRateID}` as const,
    },
    REPORTS_DEFAULT_TITLE: {
        route: 'workspaces/:policyID/reports/name',
        getRoute: (policyID: string) => `workspaces/${policyID}/reports/name` as const,
    },
    RULES_AUTO_APPROVE_REPORTS_UNDER: {
        route: 'workspaces/:policyID/rules/auto-approve',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/auto-approve` as const,
    },
    RULES_RANDOM_REPORT_AUDIT: {
        route: 'workspaces/:policyID/rules/audit',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/audit` as const,
    },
    RULES_AUTO_PAY_REPORTS_UNDER: {
        route: 'workspaces/:policyID/rules/auto-pay',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/auto-pay` as const,
    },
    RULES_RECEIPT_REQUIRED_AMOUNT: {
        route: 'workspaces/:policyID/rules/receipt-required-amount',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/receipt-required-amount` as const,
    },
    RULES_ITEMIZED_RECEIPT_REQUIRED_AMOUNT: {
        route: 'workspaces/:policyID/rules/itemized-receipt-required-amount',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/itemized-receipt-required-amount` as const,
    },
    RULES_MAX_EXPENSE_AMOUNT: {
        route: 'workspaces/:policyID/rules/max-expense-amount',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/max-expense-amount` as const,
    },
    RULES_MAX_EXPENSE_AGE: {
        route: 'workspaces/:policyID/rules/max-expense-age',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/max-expense-age` as const,
    },
    RULES_BILLABLE_DEFAULT: {
        route: 'workspaces/:policyID/rules/billable',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/billable` as const,
    },
    RULES_REIMBURSABLE_DEFAULT: {
        route: 'workspaces/:policyID/rules/reimbursable',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/reimbursable` as const,
    },
    RULES_PROHIBITED_DEFAULT: {
        route: 'workspaces/:policyID/rules/prohibited',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/prohibited` as const,
    },
    RULES_CUSTOM: {
        route: 'workspaces/:policyID/overview/policy',
        getRoute: (policyID: string) => `workspaces/${policyID}/overview/policy` as const,
    },
    RULES_MERCHANT_NEW: {
        route: 'workspaces/:policyID/rules/merchant-rules/new',
        getRoute: (policyID: string) => `workspaces/${policyID}/rules/merchant-rules/new` as const,
    },
    RULES_MERCHANT_MERCHANT_TO_MATCH: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/merchant-to-match',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/merchant-to-match` as const,
    },
    RULES_MERCHANT_MERCHANT: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/merchant',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/merchant` as const,
    },
    RULES_MERCHANT_CATEGORY: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/category',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/category` as const,
    },
    RULES_MERCHANT_TAG: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/tag',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/tag` as const,
    },
    RULES_MERCHANT_TAX: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/tax',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/tax` as const,
    },
    RULES_MERCHANT_DESCRIPTION: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/description',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/description` as const,
    },
    RULES_MERCHANT_REIMBURSABLE: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/reimbursable',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/reimbursable` as const,
    },
    RULES_MERCHANT_BILLABLE: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID/billable',
        getRoute: (policyID: string, ruleID?: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID ?? 'new'}/billable` as const,
    },
    RULES_MERCHANT_EDIT: {
        route: 'workspaces/:policyID/rules/merchant-rules/:ruleID',
        getRoute: (policyID: string, ruleID: string) => `workspaces/${policyID}/rules/merchant-rules/${ruleID}` as const,
    },
    // Referral program promotion
    REFERRAL_DETAILS_MODAL: {
        route: 'referral/:contentType',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (contentType: string, backTo?: string) => getUrlWithBackToParam(`referral/${contentType}`, backTo),
    },
    SHARE_ROOT: 'share/root',
    SHARE_ROOT_SHARE: 'share/root/share',
    SHARE_ROOT_SUBMIT: 'share/root/submit',
    SHARE_DETAILS: {
        route: 'share/share-details/:reportOrAccountID',
        getRoute: (reportOrAccountID: string) => `share/share-details/${reportOrAccountID}` as const,
    },
    SHARE_DETAILS_ATTACHMENT: 'share/details/:reportOrAccountID/attachment',
    SHARE_SUBMIT_DETAILS: {
        route: 'share/submit-details/:reportOrAccountID',
        getRoute: (reportOrAccountID: string) => `share/submit-details/${reportOrAccountID}` as const,
    },
    CHANGE_POLICY_EDUCATIONAL: {
        route: 'change-workspace-educational',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('change-workspace-educational', backTo),
    },
    TRAVEL_MY_TRIPS: {
        route: 'travel',
        getRoute: (policyID?: string) => `travel?${policyID ? `policyID=${policyID}` : ''}` as const,
    },
    TRAVEL_DOT_LINK_WEB_VIEW: {
        route: 'travel-dot-link',
        getRoute: (token: string, isTestAccount?: boolean, postLoginPath?: string) => {
            const redirectURL = postLoginPath ? `&redirectUrl=${encodeURIComponent(postLoginPath)}` : '';
            return `travel-dot-link?token=${token}&isTestAccount=${isTestAccount}${redirectURL}` as const;
        },
    },
    TRAVEL_TCS: {
        route: 'travel/terms/:domain/accept',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (domain: string, policyID?: string, backTo?: string) => getUrlWithBackToParam(`travel/terms/${domain}/accept?${policyID ? `policyID=${policyID}` : ''}`, backTo),
    },
    TRAVEL_UPGRADE: {
        route: 'travel/upgrade',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('travel/upgrade', backTo),
    },
    TRACK_TRAINING_MODAL: 'track-training',
    TRAVEL_TRIP_SUMMARY: {
        route: 'r/:reportID/trip/:transactionID',
        getRoute: (reportID: string | undefined, transactionID: string | undefined, backTo?: string) => {
            if (!reportID || !transactionID) {
                Log.warn('Invalid reportID or transactionID is used to build the TRAVEL_TRIP_SUMMARY route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/trip/${transactionID}`, backTo);
        },
    },
    TRAVEL_TRIP_DETAILS: {
        route: 'r/:reportID/trip/:transactionID/:pnr/:sequenceIndex',
        getRoute: (reportID: string | undefined, transactionID: string | undefined, pnr: string | undefined, sequenceIndex: number, backTo?: string) => {
            if (!reportID || !transactionID || !pnr) {
                Log.warn('Invalid reportID, transactionID or pnr is used to build the TRAVEL_TRIP_DETAILS route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`r/${reportID}/trip/${transactionID}/${pnr}/${sequenceIndex}`, backTo);
        },
    },
    TRAVEL_DOMAIN_SELECTOR: {
        route: 'travel/domain-selector',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID?: string, backTo?: string) => getUrlWithBackToParam(`travel/domain-selector?${policyID ? `policyID=${policyID}` : ''}`, backTo),
    },
    TRAVEL_DOMAIN_PERMISSION_INFO: {
        route: 'travel/domain-permission/:domain/info',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (domain?: string, backTo?: string) => getUrlWithBackToParam(`travel/domain-permission/${domain}/info`, backTo),
    },
    TRAVEL_PUBLIC_DOMAIN_ERROR: {
        route: 'travel/public-domain-error',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`travel/public-domain-error`, backTo),
    },
    TRAVEL_WORKSPACE_CONFIRMATION: {
        route: 'travel/upgrade/workspace/confirmation',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`travel/upgrade/workspace/confirmation`, backTo),
    },
    TRAVEL_WORKSPACE_ADDRESS: {
        route: 'travel/:domain/workspace-address',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (domain: string, policyID?: string, backTo?: string) => getUrlWithBackToParam(`travel/${domain}/workspace-address?${policyID ? `policyID=${policyID}` : ''}`, backTo),
    },
    TRAVEL_VERIFY_ACCOUNT: {
        route: `travel/${VERIFY_ACCOUNT}`,
        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (domain?: string, policyID?: string, backTo?: string) => getUrlWithBackToParam(getUrlWithParams(`travel/${VERIFY_ACCOUNT}`, {domain, policyID}), backTo),
    },
    ONBOARDING_ROOT: {
        route: 'onboarding',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding`, backTo),
    },
    ONBOARDING_PERSONAL_DETAILS: {
        route: 'onboarding/personal-details',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/personal-details`, backTo),
    },
    ONBOARDING_PRIVATE_DOMAIN: {
        route: 'onboarding/private-domain',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/private-domain`, backTo),
    },
    ONBOARDING_EMPLOYEES: {
        route: 'onboarding/employees',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/employees`, backTo),
    },
    ONBOARDING_ACCOUNTING: {
        route: 'onboarding/accounting',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/accounting`, backTo),
    },
    ONBOARDING_INTERESTED_FEATURES: {
        route: 'onboarding/interested-features',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (userReportedIntegration?: string, backTo?: string) => getUrlWithBackToParam(`onboarding/interested-features?userReportedIntegration=${userReportedIntegration}`, backTo),
    },
    ONBOARDING_PURPOSE: {
        route: 'onboarding/purpose',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/purpose`, backTo),
    },
    ONBOARDING_WORKSPACES: {
        route: 'onboarding/join-workspaces',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/join-workspaces`, backTo),
    },
    ONBOARDING_WORK_EMAIL: {
        route: 'onboarding/work-email',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/work-email`, backTo),
    },
    ONBOARDING_WORK_EMAIL_VALIDATION: {
        route: 'onboarding/work-email-validation',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/work-email-validation`, backTo),
    },
    ONBOARDING_WORKSPACE: {
        route: 'onboarding/create-workspace',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/create-workspace`, backTo),
    },
    ONBOARDING_WORKSPACE_CONFIRMATION: {
        route: 'onboarding/workspace-confirmation',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/workspace-confirmation`, backTo),
    },
    ONBOARDING_WORKSPACE_CURRENCY: {
        route: 'onboarding/workspace-currency',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/workspace-currency`, backTo),
    },
    CURRENCY_SELECTION: {
        route: 'workspace/confirmation/currency',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`workspace/confirmation/currency`, backTo),
    },
    ONBOARDING_WORKSPACE_INVITE: {
        route: 'onboarding/workspace-invite',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`onboarding/workspace-invite`, backTo),
    },
    EXPLANATION_MODAL_ROOT: 'onboarding/explanation',
    TEST_DRIVE_MODAL_ROOT: {
        route: 'onboarding/test-drive',
        getRoute: (bossEmail?: string) => `onboarding/test-drive${bossEmail ? `?bossEmail=${encodeURIComponent(bossEmail)}` : ''}` as const,
    },
    TEST_DRIVE_DEMO_ROOT: 'onboarding/test-drive/demo',
    AUTO_SUBMIT_MODAL_ROOT: '/auto-submit',
    WORKSPACE_CONFIRMATION: {
        route: 'workspace/confirmation',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam(`workspace/confirmation`, backTo),
    },
    MIGRATED_USER_WELCOME_MODAL: {
        route: 'onboarding/migrated-user-welcome',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (shouldOpenSearch?: boolean) => getUrlWithBackToParam(`onboarding/migrated-user-welcome?${shouldOpenSearch ? 'shouldOpenSearch=true' : ''}`, undefined, false),
    },

    TRANSACTION_RECEIPT: {
        route: 'r/:reportID/transaction/:transactionID/receipt/:action?/:iouType?',
        getRoute: (reportID: string | undefined, transactionID: string | undefined, readonly = false, mergeTransactionID?: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the TRANSACTION_RECEIPT route');
            }
            if (!transactionID) {
                Log.warn('Invalid transactionID is used to build the TRANSACTION_RECEIPT route');
            }
            return `r/${reportID}/transaction/${transactionID}/receipt?readonly=${readonly}${mergeTransactionID ? `&mergeTransactionID=${mergeTransactionID}` : ''}` as const;
        },
    },

    TRANSACTION_DUPLICATE_REVIEW_PAGE: {
        route: 'r/:threadReportID/duplicates/review',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string | undefined, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE: {
        route: 'r/:threadReportID/duplicates/review/merchant',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/merchant` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE: {
        route: 'r/:threadReportID/duplicates/review/category',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/category` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE: {
        route: 'r/:threadReportID/duplicates/review/tag',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/tag` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/tax-code',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/tax-code` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE: {
        route: 'r/:threadReportID/duplicates/review/description',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/description` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/reimbursable',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/reimbursable` as const, backTo),
    },
    TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/billable',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/review/billable` as const, backTo),
    },
    TRANSACTION_DUPLICATE_CONFIRMATION_PAGE: {
        route: 'r/:threadReportID/duplicates/confirm',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (threadReportID: string, backTo?: string) => getUrlWithBackToParam(`r/${threadReportID}/duplicates/confirm` as const, backTo),
    },
    MERGE_TRANSACTION_LIST_PAGE: {
        route: 'merge/:transactionID',

        getRoute: (transactionID: string, backTo: string, isOnSearch = false) => {
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            const url = getUrlWithBackToParam(`merge/${transactionID}` as const, backTo);
            return isOnSearch ? (`${url}&isOnSearch=true` as const) : url;
        },
    },
    MERGE_TRANSACTION_RECEIPT_PAGE: {
        route: 'merge/:transactionID/receipt',

        getRoute: (transactionID: string, backTo: string, isOnSearch = false) => {
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            const url = getUrlWithBackToParam(`merge/${transactionID}/receipt` as const, backTo);
            return isOnSearch ? (`${url}&isOnSearch=true` as const) : url;
        },
    },
    MERGE_TRANSACTION_DETAILS_PAGE: {
        route: 'merge/:transactionID/details',

        getRoute: (transactionID: string, backTo: string, isOnSearch = false) => {
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            const url = getUrlWithBackToParam(`merge/${transactionID}/details` as const, backTo);
            return isOnSearch ? (`${url}&isOnSearch=true` as const) : url;
        },
    },
    MERGE_TRANSACTION_CONFIRMATION_PAGE: {
        route: 'merge/:transactionID/confirmation',

        getRoute: (transactionID: string, backTo: string, isOnSearch = false) => {
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            const url = getUrlWithBackToParam(`merge/${transactionID}/confirmation` as const, backTo);
            return isOnSearch ? (`${url}&isOnSearch=true` as const) : url;
        },
    },
    POLICY_ACCOUNTING_XERO_IMPORT: {
        route: 'workspaces/:policyID/accounting/xero/import',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/xero/import` as const,
    },
    POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS: {
        route: 'workspaces/:policyID/accounting/xero/import/accounts',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/xero/import/accounts` as const,
    },
    POLICY_ACCOUNTING_XERO_ORGANIZATION: {
        route: 'workspaces/:policyID/accounting/xero/organization/:currentOrganizationID',
        getRoute: (policyID: string | undefined, currentOrganizationID: string | undefined) => {
            if (!policyID || !currentOrganizationID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_ORGANIZATION route');
            }
            return `workspaces/${policyID}/accounting/xero/organization/${currentOrganizationID}` as const;
        },
    },
    POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES: {
        route: 'workspaces/:policyID/accounting/xero/import/tracking-categories',
        getRoute: (policyID?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES route');
            }
            return `workspaces/${policyID}/accounting/xero/import/tracking-categories` as const;
        },
    },
    POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP: {
        route: 'workspaces/:policyID/accounting/xero/import/tracking-categories/mapping/:categoryId/:categoryName',
        getRoute: (policyID: string, categoryId: string, categoryName: string) =>
            `workspaces/${policyID}/accounting/xero/import/tracking-categories/mapping/${categoryId}/${encodeURIComponent(categoryName)}` as const,
    },
    POLICY_ACCOUNTING_XERO_CUSTOMER: {
        route: 'workspaces/:policyID/accounting/xero/import/customers',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/xero/import/customers` as const,
    },
    POLICY_ACCOUNTING_XERO_TAXES: {
        route: 'workspaces/:policyID/accounting/xero/import/taxes',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/xero/import/taxes` as const,
    },
    POLICY_ACCOUNTING_XERO_EXPORT: {
        route: 'workspaces/:policyID/accounting/xero/export',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/xero/export` as const, backTo, false),
    },
    POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT: {
        route: 'workspaces/:policyID/connections/xero/export/preferred-exporter/select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/connections/xero/export/preferred-exporter/select` as const, backTo),
    },
    POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT: {
        route: 'workspaces/:policyID/accounting/xero/export/purchase-bill-date-select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/xero/export/purchase-bill-date-select` as const, backTo),
    },
    POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/xero/export/bank-account-select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/xero/export/bank-account-select` as const, backTo),
    },
    POLICY_ACCOUNTING_XERO_ADVANCED: {
        route: 'workspaces/:policyID/accounting/xero/advanced',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_ADVANCED route');
            }
            return `workspaces/${policyID}/accounting/xero/advanced` as const;
        },
    },
    POLICY_ACCOUNTING_CLAIM_OFFER: {
        route: 'workspaces/:policyID/accounting/claim-offer/:integration',
        getRoute: (policyID: string, integration: string) => `workspaces/${policyID}/accounting/claim-offer/${integration}` as const,
    },
    POLICY_ACCOUNTING_XERO_AUTO_SYNC: {
        route: 'workspaces/:policyID/accounting/xero/advanced/autosync',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_AUTO_SYNC route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/xero/advanced/autosync` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_XERO_ACCOUNTING_METHOD: {
        route: 'workspaces/:policyID/accounting/xero/advanced/autosync/accounting-method',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_ACCOUNTING_METHOD route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/xero/advanced/autosync/accounting-method` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR: {
        route: 'workspaces/:policyID/accounting/xero/export/purchase-bill-status-selector',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/xero/export/purchase-bill-status-selector` as const, backTo),
    },
    POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR: {
        route: 'workspaces/:policyID/accounting/xero/advanced/invoice-account-selector',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR route');
            }
            return `workspaces/${policyID}/accounting/xero/advanced/invoice-account-selector` as const;
        },
    },
    POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR: {
        route: 'workspaces/:policyID/accounting/xero/advanced/bill-payment-account-selector',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR route');
            }
            return `workspaces/${policyID}/accounting/xero/advanced/bill-payment-account-selector` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-online/import` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/accounts',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-online/import/accounts` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/classes',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-online/import/classes` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/classes/displayed-as',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-online/import/classes/displayed-as` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/customers',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-online/import/customers` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/customers/displayed-as',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-online/import/customers/displayed-as` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/locations',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS route');
            }
            return `workspaces/${policyID}/accounting/quickbooks-online/import/locations` as const;
        },
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/locations/displayed-as',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-online/import/locations/displayed-as` as const,
    },
    POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/taxes',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/quickbooks-online/import/taxes` as const,
    },
    RESTRICTED_ACTION: {
        route: 'restricted-action/workspace/:policyID',
        getRoute: (policyID: string) => `restricted-action/workspace/${policyID}` as const,
    },
    MISSING_PERSONAL_DETAILS: {
        route: 'missing-personal-details/:subPage?/:action?',
        getRoute: (subPage?: string, action?: 'edit') => {
            if (!subPage) {
                return 'missing-personal-details' as const;
            }
            return `missing-personal-details/${subPage}${action ? `/${action}` : ''}` as const;
        },
    },
    MISSING_PERSONAL_DETAILS_CONFIRM_MAGIC_CODE: 'missing-personal-details/confirm-magic-code',
    POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR: {
        route: 'workspaces/:policyID/accounting/netsuite/subsidiary-selector',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR route');
            }
            return `workspaces/${policyID}/accounting/netsuite/subsidiary-selector` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_EXISTING_CONNECTIONS: {
        route: 'workspaces/:policyID/accounting/netsuite/existing-connections',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/netsuite/existing-connections` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT: {
        route: 'workspaces/:policyID/accounting/netsuite/token-input/:subPage?',
        getRoute: (policyID: string | undefined, subPage?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT route');
            }
            return `workspaces/${policyID}/accounting/netsuite/token-input${subPage ? `/${subPage}` : ''}` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT: {
        route: 'workspaces/:policyID/accounting/netsuite/import',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_IMPORT route');
            }
            return `workspaces/${policyID}/accounting/netsuite/import` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_MAPPING: {
        route: 'workspaces/:policyID/accounting/netsuite/import/mapping/:importField',
        getRoute: (policyID: string, importField: TupleToUnion<typeof CONST.NETSUITE_CONFIG.IMPORT_FIELDS>) =>
            `workspaces/${policyID}/accounting/netsuite/import/mapping/${importField as string}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField',
        getRoute: (policyID: string | undefined, importCustomField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING route');
            }
            return `workspaces/${policyID}/accounting/netsuite/import/custom/${importCustomField as string}` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField/view/:valueIndex',
        getRoute: (policyID: string, importCustomField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>, valueIndex: number) =>
            `workspaces/${policyID}/accounting/netsuite/import/custom/${importCustomField as string}/view/${valueIndex}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField/edit/:valueIndex/:fieldName',
        getRoute: (policyID: string | undefined, importCustomField: ValueOf<typeof CONST.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS>, valueIndex: number, fieldName: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT route');
            }
            return `workspaces/${policyID}/accounting/netsuite/import/custom/${importCustomField as string}/edit/${valueIndex}/${fieldName}` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom-list/new',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/netsuite/import/custom-list/new` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom-segment/new',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/netsuite/import/custom-segment/new` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS: {
        route: 'workspaces/:policyID/accounting/netsuite/import/customer-projects',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS route');
            }
            return `workspaces/${policyID}/accounting/netsuite/import/customer-projects` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT: {
        route: 'workspaces/:policyID/accounting/netsuite/import/customer-projects/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/netsuite/import/customer-projects/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT: {
        route: 'workspaces/:policyID/connections/netsuite/export/',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_EXPORT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/` as const, backTo, false);
        },
    },
    POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/preferred-exporter/select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/preferred-exporter/select` as const, backTo),
    },
    POLICY_ACCOUNTING_NETSUITE_DATE_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/date/select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/date/select` as const, backTo),
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType',
        getRoute: (policyID: string | undefined, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType as string}` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/destination/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType as string}/destination/select` as const, backTo),
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/vendor/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType as string}/vendor/select` as const, backTo),
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/payable-account/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType as string}/payable-account/select` as const, backTo),
    },
    POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/journal-posting-preference/select',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/expenses/${expenseType as string}/journal-posting-preference/select` as const, backTo),
    },
    POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/receivable-account/select',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/receivable-account/select` as const, backTo),
    },
    POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/invoice-item-preference/select',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/export/invoice-item-preference/select` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/invoice-item-preference/invoice-item/select',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT route');
            }
            return `workspaces/${policyID}/connections/netsuite/export/invoice-item-preference/invoice-item/select` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/tax-posting-account/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/export/tax-posting-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/provincial-tax-posting-account/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/export/provincial-tax-posting-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_ADVANCED: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_ADVANCED route');
            }
            return `workspaces/${policyID}/connections/netsuite/advanced/` as const;
        },
    },
    POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/reimbursement-account/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/advanced/reimbursement-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/collection-account/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/advanced/collection-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/expense-report-approval-level/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/advanced/expense-report-approval-level/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/vendor-bill-approval-level/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/advanced/vendor-bill-approval-level/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/journal-entry-approval-level/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/advanced/journal-entry-approval-level/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/approval-account/select',
        getRoute: (policyID: string) => `workspaces/${policyID}/connections/netsuite/advanced/approval-account/select` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/custom-form-id/:expenseType',
        getRoute: (policyID: string, expenseType: ValueOf<typeof CONST.NETSUITE_EXPENSE_TYPE>) =>
            `workspaces/${policyID}/connections/netsuite/advanced/custom-form-id/${expenseType as string}` as const,
    },
    POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/autosync',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/advanced/autosync` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/autosync/accounting-method',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD route');
            }

            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            return getUrlWithBackToParam(`workspaces/${policyID}/connections/netsuite/advanced/autosync/accounting-method` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES: {
        route: 'workspaces/:policyID/accounting/sage-intacct/prerequisites',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/prerequisites` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/enter-credentials',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/sage-intacct/enter-credentials` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/existing-connections',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/sage-intacct/existing-connections` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY: {
        route: 'workspaces/:policyID/accounting/sage-intacct/entity',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY route');
            }
            return `workspaces/${policyID}/accounting/sage-intacct/entity` as const;
        },
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import',
        getRoute: (policyID: string | undefined) => `workspaces/${policyID}/accounting/sage-intacct/import` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/toggle-mapping/:mapping',
        getRoute: (policyID: string | undefined, mapping: SageIntacctMappingName) => `workspaces/${policyID}/accounting/sage-intacct/import/toggle-mapping/${mapping as string}` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/mapping-type/:mapping',
        getRoute: (policyID: string | undefined, mapping: string) => `workspaces/${policyID}/accounting/sage-intacct/import/mapping-type/${mapping}` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/tax',
        getRoute: (policyID: string | undefined) => `workspaces/${policyID}/accounting/sage-intacct/import/tax` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX_MAPPING: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/tax/mapping',
        getRoute: (policyID: string | undefined) => `workspaces/${policyID}/accounting/sage-intacct/import/tax/mapping` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/user-dimensions',
        getRoute: (policyID: string | undefined) => `workspaces/${policyID}/accounting/sage-intacct/import/user-dimensions` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ADD_USER_DIMENSION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/add-user-dimension',
        getRoute: (policyID: string) => `workspaces/${policyID}/accounting/sage-intacct/import/add-user-dimension` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/edit-user-dimension/:dimensionName',
        getRoute: (policyID: string, dimensionName: string) => `workspaces/${policyID}/accounting/sage-intacct/import/edit-user-dimension/${dimensionName}` as const,
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export` as const, backTo, false),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/preferred-exporter',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/preferred-exporter` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/date',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/date` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/reimbursable',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/reimbursable` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/nonreimbursable` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/reimbursable/destination',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/reimbursable/destination` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable/destination',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/nonreimbursable/destination` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/:reimbursable/default-vendor',
        getRoute: (policyID: string, reimbursable: string, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/${reimbursable}/default-vendor` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable/credit-card-account',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (policyID: string, backTo?: string) => getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/export/nonreimbursable/credit-card-account` as const, backTo),
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED: {
        route: 'workspaces/:policyID/accounting/sage-intacct/advanced',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED route');
            }
            return `workspaces/${policyID}/accounting/sage-intacct/advanced` as const;
        },
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/advanced/payment-account',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT route');
            }
            return `workspaces/${policyID}/accounting/sage-intacct/advanced/payment-account` as const;
        },
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_AUTO_SYNC: {
        route: 'workspaces/:policyID/accounting/sage-intacct/advanced/autosync',
        getRoute: (policyID: string | undefined, backTo?: string) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_SAGE_INTACCT_AUTO_SYNC route');
            }
            // eslint-disable-next-line no-restricted-syntax
            return getUrlWithBackToParam(`workspaces/${policyID}/accounting/sage-intacct/advanced/autosync` as const, backTo);
        },
    },
    POLICY_ACCOUNTING_SAGE_INTACCT_ACCOUNTING_METHOD: {
        route: 'workspaces/:policyID/accounting/sage-intacct/advanced/autosync/accounting-method',
        getRoute: (policyID: string | undefined) => {
            if (!policyID) {
                Log.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_SAGE_INTACCT_ACCOUNTING_METHOD route');
            }
            return `workspaces/${policyID}/accounting/sage-intacct/advanced/autosync/accounting-method` as const;
        },
    },
    ADD_UNREPORTED_EXPENSE: {
        route: 'search/r/:reportID/add-unreported-expense/:backToReport?',
        getRoute: (reportID: string | undefined, backToReport?: string) => `search/r/${reportID}/add-unreported-expense/${backToReport ?? ''}` as const,
    },
    DEBUG_REPORT: {
        route: 'debug/report/:reportID',
        getRoute: (reportID: string | undefined) => `debug/report/${reportID}` as const,
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
        getRoute: (reportID: string | undefined, reportActionID: string) => {
            if (!reportID) {
                Log.warn('Invalid reportID is used to build the DEBUG_REPORT_ACTION route');
            }
            return `debug/report/${reportID}/actions/${reportActionID}` as const;
        },
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
        route: 'debug/:formType/details/constant/:fieldName',
        getRoute: (formType: string, fieldName: string, fieldValue?: string, policyID?: string, backTo?: string) =>
            // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
            getUrlWithBackToParam(`debug/${formType}/details/constant/${fieldName}?fieldValue=${fieldValue}&policyID=${policyID}`, backTo),
    },
    DETAILS_DATE_TIME_PICKER_PAGE: {
        route: 'debug/details/datetime/:fieldName',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (fieldName: string, fieldValue?: string, backTo?: string) => getUrlWithBackToParam(`debug/details/datetime/${fieldName}?fieldValue=${fieldValue}`, backTo),
    },
    DEBUG_TRANSACTION: {
        route: 'debug/transaction/:transactionID',
        getRoute: (transactionID: string) => `debug/transaction/${transactionID}` as const,
    },
    DEBUG_TRANSACTION_TAB_DETAILS: {
        route: 'debug/transaction/:transactionID/details',
        getRoute: (transactionID: string) => `debug/transaction/${transactionID}/details` as const,
    },
    DEBUG_TRANSACTION_TAB_JSON: {
        route: 'debug/transaction/:transactionID/json',
        getRoute: (transactionID: string) => `debug/transaction/${transactionID}/json` as const,
    },
    DEBUG_TRANSACTION_TAB_VIOLATIONS: {
        route: 'debug/transaction/:transactionID/violations',
        getRoute: (transactionID: string) => `debug/transaction/${transactionID}/violations` as const,
    },
    DEBUG_TRANSACTION_VIOLATION_CREATE: {
        route: 'debug/transaction/:transactionID/violations/create',
        getRoute: (transactionID: string) => `debug/transaction/${transactionID}/violations/create` as const,
    },
    DEBUG_TRANSACTION_VIOLATION: {
        route: 'debug/transaction/:transactionID/violations/:index',
        getRoute: (transactionID: string, index: string) => `debug/transaction/${transactionID}/violations/${index}` as const,
    },
    DEBUG_TRANSACTION_VIOLATION_TAB_DETAILS: {
        route: 'debug/transaction/:transactionID/violations/:index/details',
        getRoute: (transactionID: string, index: string) => `debug/transaction/${transactionID}/violations/${index}/details` as const,
    },
    DEBUG_TRANSACTION_VIOLATION_TAB_JSON: {
        route: 'debug/transaction/:transactionID/violations/:index/json',
        getRoute: (transactionID: string, index: string) => `debug/transaction/${transactionID}/violations/${index}/json` as const,
    },
    REJECT_MONEY_REQUEST_REASON: {
        route: 'reject/reason/:transactionID',
        getRoute: (transactionID: string, reportID: string, backTo?: string) => `reject/reason/${transactionID}?reportID=${reportID}&backTo=${backTo}` as const,
    },
    SCHEDULE_CALL_BOOK: {
        route: 'r/:reportID/schedule-call/book',
        getRoute: (reportID: string) => `r/${reportID}/schedule-call/book` as const,
    },
    SCHEDULE_CALL_CONFIRMATION: {
        route: 'r/:reportID/schedule-call/confirmation',
        getRoute: (reportID: string) => `r/${reportID}/schedule-call/confirmation` as const,
    },

    TEST_TOOLS_MODAL: {
        route: 'test-tools',

        // eslint-disable-next-line no-restricted-syntax -- Legacy route generation
        getRoute: (backTo?: string) => getUrlWithBackToParam('test-tools' as const, backTo),
    },
    WORKSPACES_VERIFY_DOMAIN: {
        route: 'workspaces/verify-domain/:domainAccountID',
        getRoute: (domainAccountID: number) => `workspaces/verify-domain/${domainAccountID}` as const,
    },
    WORKSPACES_DOMAIN_VERIFIED: {
        route: 'workspaces/domain-verified/:domainAccountID',
        getRoute: (domainAccountID: number) => `workspaces/domain-verified/${domainAccountID}` as const,
    },
    WORKSPACES_ADD_DOMAIN: 'workspaces/add-domain',
    WORKSPACES_ADD_DOMAIN_VERIFY_ACCOUNT: `workspaces/add-domain/${VERIFY_ACCOUNT}`,
    WORKSPACES_DOMAIN_ADDED: {
        route: 'workspaces/domain-added/:domainAccountID',
        getRoute: (domainAccountID: number) => `workspaces/domain-added/${domainAccountID}` as const,
    },
    WORKSPACES_DOMAIN_ACCESS_RESTRICTED: {
        route: 'workspaces/domain-access-restricted/:domainAccountID',
        getRoute: (domainAccountID: number) => `workspaces/domain-access-restricted/${domainAccountID}` as const,
    },
    DOMAIN_INITIAL: {
        route: 'domain/:domainAccountID',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}` as const,
    },
    DOMAIN_SAML: {
        route: 'domain/:domainAccountID/saml',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/saml` as const,
    },
    DOMAIN_VERIFY: {
        route: 'domain/:domainAccountID/verify',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/verify` as const,
    },
    DOMAIN_VERIFIED: {
        route: 'domain/:domainAccountID/verified',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/verified` as const,
    },
    DOMAIN_ADMINS: {
        route: 'domain/:domainAccountID/admins',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/admins` as const,
    },
    DOMAIN_ADMIN_DETAILS: {
        route: 'domain/:domainAccountID/admins/:accountID',
        getRoute: (domainAccountID: number, accountID: number) => `domain/${domainAccountID}/admins/${accountID}` as const,
    },
    DOMAIN_ADMINS_SETTINGS: {
        route: 'domain/:domainAccountID/admins/settings',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/admins/settings` as const,
    },
    DOMAIN_ADD_PRIMARY_CONTACT: {
        route: 'domain/:domainAccountID/admins/settings/primary-contact',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/admins/settings/primary-contact` as const,
    },
    DOMAIN_ADD_ADMIN: {
        route: 'domain/:domainAccountID/admins/invite',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/admins/invite` as const,
    },
    DOMAIN_MEMBERS: {
        route: 'domain/:domainAccountID/members',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/members` as const,
    },
    DOMAIN_MEMBER_DETAILS: {
        route: 'domain/:domainAccountID/members/:accountID',
        getRoute: (domainAccountID: number, accountID: number) => `domain/${domainAccountID}/members/${accountID}` as const,
    },
    DOMAIN_RESET_DOMAIN: {
        route: 'domain/:domainAccountID/admins/:accountID/reset-domain',
        getRoute: (domainAccountID: number, accountID: number) => `domain/${domainAccountID}/admins/${accountID}/reset-domain` as const,
    },
    DOMAIN_ADD_MEMBER: {
        route: 'domain/:domainAccountID/members/invite',
        getRoute: (domainAccountID: number) => `domain/${domainAccountID}/members/invite` as const,
    },

    MULTIFACTOR_AUTHENTICATION_MAGIC_CODE: `${MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES.FACTOR}/magic-code`,
    MULTIFACTOR_AUTHENTICATION_BIOMETRICS_TEST: 'multifactor-authentication/scenario/biometrics-test',

    // The exact outcome & prompt type will be added as a part of Multifactor Authentication config in another PR,
    // for now a string is accepted to avoid blocking this PR.
    MULTIFACTOR_AUTHENTICATION_OUTCOME: {
        route: 'multifactor-authentication/outcome/:outcomeType',
        getRoute: (outcomeType: ValueOf<typeof CONST.MULTIFACTOR_AUTHENTICATION_OUTCOME_TYPE>) => `multifactor-authentication/outcome/${outcomeType}` as const,
    },

    MULTIFACTOR_AUTHENTICATION_PROMPT: {
        route: `${MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES.PROMPT}/:promptType`,
        getRoute: (promptType: string) => `${MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES.PROMPT}/${promptType}` as const,
    },

    MULTIFACTOR_AUTHENTICATION_NOT_FOUND: 'multifactor-authentication/not-found',

    MULTIFACTOR_AUTHENTICATION_REVOKE: 'multifactor-authentication/revoke',
} as const;

/**
 * Configuration for shared parameters that can be passed between routes.
 * These parameters are commonly used across multiple screens and are preserved
 * during navigation state transitions.
 *
 * Currently includes:
 * - `backTo`: Specifies the route to return to when navigating back, preserving
 *   navigation context in split-screen and central screen
 */
const SHARED_ROUTE_PARAMS: Partial<Record<Screen, string[]>> = {
    [SCREENS.WORKSPACE.INITIAL]: ['backTo'],
} as const;

export {PUBLIC_SCREENS_ROUTES, SHARED_ROUTE_PARAMS, VERIFY_ACCOUNT, MULTIFACTOR_AUTHENTICATION_PROTECTED_ROUTES};
export default ROUTES;

type ReportAttachmentsRoute = typeof ROUTES.REPORT_ATTACHMENTS.route;
type ReportAddAttachmentRoute = `r/${string}/attachment/add`;
type AttachmentRoutes = ReportAttachmentsRoute | ReportAddAttachmentRoute;

type ReportAttachmentsRouteParams = RootNavigatorParamList[typeof SCREENS.REPORT_ATTACHMENTS];
type ReportAddAttachmentRouteParams = RootNavigatorParamList[typeof SCREENS.REPORT_ADD_ATTACHMENT];

function getAttachmentModalScreenRoute(url: AttachmentRoutes, params?: ReportAttachmentsRouteParams | ReportAddAttachmentRouteParams) {
    if (!params?.source) {
        return url;
    }

    const {source, attachmentID, type, reportID, accountID, isAuthTokenRequired, originalFileName, attachmentLink} = params;

    const sourceParam = `?source=${encodeURIComponent(source as string)}`;
    const attachmentIDParam = attachmentID ? `&attachmentID=${attachmentID}` : '';
    const typeParam = type ? `&type=${type as string}` : '';
    const reportIDParam = reportID ? `&reportID=${reportID}` : '';
    const accountIDParam = accountID ? `&accountID=${accountID}` : '';
    const authTokenParam = isAuthTokenRequired ? '&isAuthTokenRequired=true' : '';
    const fileNameParam = originalFileName ? `&originalFileName=${originalFileName}` : '';
    const attachmentLinkParam = attachmentLink ? `&attachmentLink=${attachmentLink}` : '';

    return `${url}${sourceParam}${typeParam}${reportIDParam}${attachmentIDParam}${accountIDParam}${authTokenParam}${fileNameParam}${attachmentLinkParam} ` as const;
}

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

export type {Route};
