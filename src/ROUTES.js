"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SHARED_ROUTE_PARAMS = exports.PUBLIC_SCREENS_ROUTES = exports.HYBRID_APP_ROUTES = void 0;
exports.getUrlWithBackToParam = getUrlWithBackToParam;
var Log_1 = require("./libs/Log");
var SCREENS_1 = require("./SCREENS");
// This is a file containing constants for all the routes we want to be able to go to
/**
 * Builds a URL with an encoded URI component for the `backTo` param which can be added to the end of URLs
 */
function getUrlWithBackToParam(url, backTo, shouldEncodeURIComponent) {
    if (shouldEncodeURIComponent === void 0) { shouldEncodeURIComponent = true; }
    var backToParam = backTo ? "".concat(url.includes('?') ? '&' : '?', "backTo=").concat(shouldEncodeURIComponent ? encodeURIComponent(backTo) : backTo) : '';
    return "".concat(url).concat(backToParam);
}
var PUBLIC_SCREENS_ROUTES = {
    // If the user opens this route, we'll redirect them to the path saved in the last visited path or to the home page if the last visited path is empty.
    ROOT: '',
    TRANSITION_BETWEEN_APPS: 'transition',
    CONNECTION_COMPLETE: 'connection-complete',
    BANK_CONNECTION_COMPLETE: 'bank-connection-complete',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    UNLINK_LOGIN: 'u/:accountID/:validateCode',
    APPLE_SIGN_IN: 'sign-in-with-apple',
    GOOGLE_SIGN_IN: 'sign-in-with-google',
    SAML_SIGN_IN: 'sign-in-with-saml',
};
exports.PUBLIC_SCREENS_ROUTES = PUBLIC_SCREENS_ROUTES;
var ROUTES = __assign(__assign({}, PUBLIC_SCREENS_ROUTES), { 
    // This route renders the list of reports.
    HOME: 'home', WORKSPACES_LIST: { route: 'workspaces', getRoute: function (backTo) { return getUrlWithBackToParam('workspaces', backTo); } }, SEARCH_ROOT: {
        route: 'search',
        getRoute: function (_a) {
            var query = _a.query, name = _a.name;
            return "search?q=".concat(encodeURIComponent(query)).concat(name ? "&name=".concat(name) : '');
        },
    }, SEARCH_SAVED_SEARCH_RENAME: {
        route: 'search/saved-search/rename',
        getRoute: function (_a) {
            var name = _a.name, jsonQuery = _a.jsonQuery;
            return "search/saved-search/rename?name=".concat(name, "&q=").concat(jsonQuery);
        },
    }, SEARCH_ADVANCED_FILTERS: 'search/filters', SEARCH_ADVANCED_FILTERS_TYPE: 'search/filters/type', SEARCH_ADVANCED_FILTERS_GROUP_BY: 'search/filters/groupBy', SEARCH_ADVANCED_FILTERS_STATUS: 'search/filters/status', SEARCH_ADVANCED_FILTERS_DATE: 'search/filters/date', SEARCH_ADVANCED_FILTERS_CURRENCY: 'search/filters/currency', SEARCH_ADVANCED_FILTERS_MERCHANT: 'search/filters/merchant', SEARCH_ADVANCED_FILTERS_DESCRIPTION: 'search/filters/description', SEARCH_ADVANCED_FILTERS_REPORT_ID: 'search/filters/reportID', SEARCH_ADVANCED_FILTERS_AMOUNT: 'search/filters/amount', SEARCH_ADVANCED_FILTERS_CATEGORY: 'search/filters/category', SEARCH_ADVANCED_FILTERS_KEYWORD: 'search/filters/keyword', SEARCH_ADVANCED_FILTERS_CARD: 'search/filters/card', SEARCH_ADVANCED_FILTERS_TAX_RATE: 'search/filters/taxRate', SEARCH_ADVANCED_FILTERS_EXPENSE_TYPE: 'search/filters/expenseType', SEARCH_ADVANCED_FILTERS_TAG: 'search/filters/tag', SEARCH_ADVANCED_FILTERS_FROM: 'search/filters/from', SEARCH_ADVANCED_FILTERS_TO: 'search/filters/to', SEARCH_ADVANCED_FILTERS_IN: 'search/filters/in', SEARCH_ADVANCED_FILTERS_SUBMITTED: 'search/filters/submitted', SEARCH_ADVANCED_FILTERS_APPROVED: 'search/filters/approved', SEARCH_ADVANCED_FILTERS_PAID: 'search/filters/paid', SEARCH_ADVANCED_FILTERS_EXPORTED: 'search/filters/exported', SEARCH_ADVANCED_FILTERS_POSTED: 'search/filters/posted', SEARCH_ADVANCED_FILTERS_TITLE: 'search/filters/title', SEARCH_ADVANCED_FILTERS_ASSIGNEE: 'search/filters/assignee', SEARCH_ADVANCED_FILTERS_REIMBURSABLE: 'search/filters/reimbursable', SEARCH_ADVANCED_FILTERS_BILLABLE: 'search/filters/billable', SEARCH_ADVANCED_FILTERS_WORKSPACE: 'search/filters/workspace', SEARCH_REPORT: {
        route: 'search/view/:reportID/:reportActionID?',
        getRoute: function (_a) {
            var reportID = _a.reportID, reportActionID = _a.reportActionID, backTo = _a.backTo, moneyRequestReportActionID = _a.moneyRequestReportActionID, transactionID = _a.transactionID;
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the SEARCH_REPORT route');
            }
            var baseRoute = reportActionID ? "search/view/".concat(reportID, "/").concat(reportActionID) : "search/view/".concat(reportID);
            var queryParams = [];
            // When we are opening a transaction thread but don't have the transaction thread report created yet we need to pass the moneyRequestReportActionID and transactionID so we can send those to the OpenReport call and create the transaction report
            if (transactionID) {
                queryParams.push("transactionID=".concat(transactionID));
            }
            if (moneyRequestReportActionID) {
                queryParams.push("moneyRequestReportActionID=".concat(moneyRequestReportActionID));
            }
            var queryString = queryParams.length > 0 ? "".concat(baseRoute, "?").concat(queryParams.join('&')) : baseRoute;
            return getUrlWithBackToParam(queryString, backTo);
        },
    }, SEARCH_MONEY_REQUEST_REPORT: {
        route: 'search/r/:reportID',
        getRoute: function (_a) {
            var reportID = _a.reportID, backTo = _a.backTo;
            var baseRoute = "search/r/".concat(reportID);
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    }, SEARCH_MONEY_REQUEST_REPORT_HOLD_TRANSACTIONS: {
        route: 'search/r/:reportID/hold',
        getRoute: function (_a) {
            var reportID = _a.reportID, backTo = _a.backTo;
            var baseRoute = "search/r/".concat(reportID, "/hold");
            return getUrlWithBackToParam(baseRoute, backTo);
        },
    }, TRANSACTION_HOLD_REASON_RHP: 'search/hold', MOVE_TRANSACTIONS_SEARCH_RHP: 'search/move-transactions', 
    // This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated
    CONCIERGE: 'concierge', TRACK_EXPENSE: 'track-expense', SUBMIT_EXPENSE: 'submit-expense', FLAG_COMMENT: {
        route: 'flag/:reportID/:reportActionID',
        getRoute: function (reportID, reportActionID, backTo) { return getUrlWithBackToParam("flag/".concat(reportID, "/").concat(reportActionID), backTo); },
    }, PROFILE: {
        route: 'a/:accountID',
        getRoute: function (accountID, backTo, login) {
            var baseRoute = getUrlWithBackToParam("a/".concat(accountID), backTo);
            var loginParam = login ? "?login=".concat(encodeURIComponent(login)) : '';
            return "".concat(baseRoute).concat(loginParam);
        },
    }, PROFILE_AVATAR: {
        route: 'a/:accountID/avatar',
        getRoute: function (accountID, backTo) { return getUrlWithBackToParam("a/".concat(accountID, "/avatar"), backTo); },
    }, DESKTOP_SIGN_IN_REDIRECT: 'desktop-signin-redirect', 
    // This is a special validation URL that will take the user to /workspace/new after validation. This is used
    // when linking users from e.com in order to share a session in this app.
    ENABLE_PAYMENTS: 'enable-payments', WALLET_STATEMENT_WITH_DATE: 'statements/:yearMonth', SIGN_IN_MODAL: 'sign-in-modal', REQUIRE_TWO_FACTOR_AUTH: '2fa-required', BANK_ACCOUNT: 'bank-account', BANK_ACCOUNT_NEW: 'bank-account/new', BANK_ACCOUNT_PERSONAL: 'bank-account/personal', BANK_ACCOUNT_WITH_STEP_TO_OPEN: {
        route: 'bank-account/:stepToOpen?',
        getRoute: function (policyID, stepToOpen, backTo) {
            if (stepToOpen === void 0) { stepToOpen = ''; }
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the BANK_ACCOUNT_WITH_STEP_TO_OPEN route');
            }
            return getUrlWithBackToParam("bank-account/".concat(stepToOpen, "?policyID=").concat(policyID), backTo);
        },
    }, PUBLIC_CONSOLE_DEBUG: {
        route: 'troubleshoot/console',
        getRoute: function (backTo) { return getUrlWithBackToParam("troubleshoot/console", backTo); },
    }, SETTINGS: 'settings', SETTINGS_PROFILE: {
        route: 'settings/profile',
        getRoute: function (backTo) { return getUrlWithBackToParam('settings/profile', backTo); },
    }, SETTINGS_CHANGE_CURRENCY: 'settings/add-payment-card/change-currency', SETTINGS_SHARE_CODE: 'settings/shareCode', SETTINGS_DISPLAY_NAME: 'settings/profile/display-name', SETTINGS_TIMEZONE: 'settings/profile/timezone', SETTINGS_TIMEZONE_SELECT: 'settings/profile/timezone/select', SETTINGS_PRONOUNS: 'settings/profile/pronouns', SETTINGS_PREFERENCES: 'settings/preferences', SETTINGS_SUBSCRIPTION: {
        route: 'settings/subscription',
        getRoute: function (backTo) { return getUrlWithBackToParam('settings/subscription', backTo); },
    }, SETTINGS_SUBSCRIPTION_SIZE: {
        route: 'settings/subscription/subscription-size',
        getRoute: function (canChangeSize) { return "settings/subscription/subscription-size?canChangeSize=".concat(canChangeSize); },
    }, SETTINGS_SUBSCRIPTION_SETTINGS_DETAILS: 'settings/subscription/details', SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD: 'settings/subscription/add-payment-card', SETTINGS_SUBSCRIPTION_CHANGE_BILLING_CURRENCY: 'settings/subscription/change-billing-currency', SETTINGS_SUBSCRIPTION_CHANGE_PAYMENT_CURRENCY: 'settings/subscription/add-payment-card/change-payment-currency', SETTINGS_SUBSCRIPTION_DISABLE_AUTO_RENEW_SURVEY: 'settings/subscription/disable-auto-renew-survey', SETTINGS_SUBSCRIPTION_REQUEST_EARLY_CANCELLATION: 'settings/subscription/request-early-cancellation-survey', SETTINGS_PRIORITY_MODE: 'settings/preferences/priority-mode', SETTINGS_LANGUAGE: 'settings/preferences/language', SETTINGS_PAYMENT_CURRENCY: 'setting/preferences/payment-currency', SETTINGS_THEME: 'settings/preferences/theme', SETTINGS_SECURITY: 'settings/security', SETTINGS_CLOSE: 'settings/security/closeAccount', SETTINGS_MERGE_ACCOUNTS: {
        route: 'settings/security/merge-accounts',
        getRoute: function (email) { return "settings/security/merge-accounts".concat(email ? "?email=".concat(encodeURIComponent(email)) : ''); },
    }, SETTINGS_MERGE_ACCOUNTS_MAGIC_CODE: {
        route: 'settings/security/merge-accounts/:login/magic-code',
        getRoute: function (login) { return "settings/security/merge-accounts/".concat(encodeURIComponent(login), "/magic-code"); },
    }, SETTINGS_MERGE_ACCOUNTS_RESULT: {
        route: 'settings/security/merge-accounts/:login/result/:result',
        getRoute: function (login, result, backTo) { return getUrlWithBackToParam("settings/security/merge-accounts/".concat(encodeURIComponent(login), "/result/").concat(result), backTo); },
    }, SETTINGS_LOCK_ACCOUNT: 'settings/security/lock-account', SETTINGS_UNLOCK_ACCOUNT: 'settings/security/unlock-account', SETTINGS_FAILED_TO_LOCK_ACCOUNT: 'settings/security/failed-to-lock-account', SETTINGS_ADD_DELEGATE: 'settings/security/delegate', SETTINGS_DELEGATE_ROLE: {
        route: 'settings/security/delegate/:login/role/:role',
        getRoute: function (login, role, backTo) { return getUrlWithBackToParam("settings/security/delegate/".concat(encodeURIComponent(login), "/role/").concat(role), backTo); },
    }, SETTINGS_UPDATE_DELEGATE_ROLE: {
        route: 'settings/security/delegate/:login/update-role/:currentRole',
        getRoute: function (login, currentRole) { return "settings/security/delegate/".concat(encodeURIComponent(login), "/update-role/").concat(currentRole); },
    }, SETTINGS_DELEGATE_CONFIRM: {
        route: 'settings/security/delegate/:login/role/:role/confirm',
        getRoute: function (login, role, showValidateActionModal) {
            var validateActionModalParam = showValidateActionModal ? "?showValidateActionModal=true" : '';
            return "settings/security/delegate/".concat(encodeURIComponent(login), "/role/").concat(role, "/confirm").concat(validateActionModalParam);
        },
    }, SETTINGS_ABOUT: 'settings/about', SETTINGS_APP_DOWNLOAD_LINKS: 'settings/about/app-download-links', SETTINGS_WALLET: 'settings/wallet', SETTINGS_WALLET_DOMAIN_CARD: {
        route: 'settings/wallet/card/:cardID?',
        getRoute: function (cardID) { return "settings/wallet/card/".concat(cardID); },
    }, SETTINGS_DOMAIN_CARD_DETAIL: {
        route: 'settings/card/:cardID?',
        getRoute: function (cardID) { return "settings/card/".concat(cardID); },
    }, SETTINGS_REPORT_FRAUD: {
        route: 'settings/wallet/card/:cardID/report-virtual-fraud',
        getRoute: function (cardID, backTo) { return getUrlWithBackToParam("settings/wallet/card/".concat(cardID, "/report-virtual-fraud"), backTo); },
    }, SETTINGS_REPORT_FRAUD_CONFIRMATION: {
        route: 'settings/wallet/card/:cardID/report-virtual-fraud-confirm',
        getRoute: function (cardID) { return "settings/wallet/card/".concat(cardID, "/report-virtual-fraud-confirm"); },
    }, SETTINGS_DOMAIN_CARD_REPORT_FRAUD: {
        route: 'settings/card/:cardID/report-virtual-fraud',
        getRoute: function (cardID) { return "settings/card/".concat(cardID, "/report-virtual-fraud"); },
    }, SETTINGS_ADD_DEBIT_CARD: 'settings/wallet/add-debit-card', SETTINGS_ADD_BANK_ACCOUNT: {
        route: 'settings/wallet/add-bank-account',
        getRoute: function (backTo) { return getUrlWithBackToParam('settings/wallet/add-bank-account', backTo); },
    }, SETTINGS_ADD_US_BANK_ACCOUNT: 'settings/wallet/add-us-bank-account', SETTINGS_ENABLE_PAYMENTS: 'settings/wallet/enable-payments', SETTINGS_WALLET_CARD_DIGITAL_DETAILS_UPDATE_ADDRESS: {
        route: 'settings/wallet/card/:domain/digital-details/update-address',
        getRoute: function (domain) { return "settings/wallet/card/".concat(domain, "/digital-details/update-address"); },
    }, SETTINGS_WALLET_TRANSFER_BALANCE: 'settings/wallet/transfer-balance', SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT: 'settings/wallet/choose-transfer-account', SETTINGS_WALLET_REPORT_CARD_LOST_OR_DAMAGED: {
        route: 'settings/wallet/card/:cardID/report-card-lost-or-damaged',
        getRoute: function (cardID) { return "settings/wallet/card/".concat(cardID, "/report-card-lost-or-damaged"); },
    }, SETTINGS_WALLET_CARD_ACTIVATE: {
        route: 'settings/wallet/card/:cardID/activate',
        getRoute: function (cardID) { return "settings/wallet/card/".concat(cardID, "/activate"); },
    }, SETTINGS_LEGAL_NAME: 'settings/profile/legal-name', SETTINGS_DATE_OF_BIRTH: 'settings/profile/date-of-birth', SETTINGS_PHONE_NUMBER: 'settings/profile/phone', SETTINGS_ADDRESS: 'settings/profile/address', SETTINGS_ADDRESS_COUNTRY: {
        route: 'settings/profile/address/country',
        getRoute: function (country, backTo) { return getUrlWithBackToParam("settings/profile/address/country?country=".concat(country), backTo); },
    }, SETTINGS_ADDRESS_STATE: {
        route: 'settings/profile/address/state',
        getRoute: function (state, backTo, label) {
            return "".concat(getUrlWithBackToParam("settings/profile/address/state".concat(state ? "?state=".concat(encodeURIComponent(state)) : ''), backTo)).concat(
            // the label param can be an empty string so we cannot use a nullish ?? operator
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            label ? "".concat(backTo || state ? '&' : '?', "label=").concat(encodeURIComponent(label)) : '');
        },
    }, SETTINGS_CONTACT_METHODS: {
        route: 'settings/profile/contact-methods',
        getRoute: function (backTo) { return getUrlWithBackToParam('settings/profile/contact-methods', backTo); },
    }, SETTINGS_CONTACT_METHOD_DETAILS: {
        route: 'settings/profile/contact-methods/:contactMethod/details',
        getRoute: function (contactMethod, backTo, shouldSkipInitialValidation) {
            var encodedMethod = encodeURIComponent(contactMethod);
            return getUrlWithBackToParam("settings/profile/contact-methods/".concat(encodedMethod, "/details").concat(shouldSkipInitialValidation ? "?shouldSkipInitialValidation=true" : ""), backTo);
        },
    }, SETTINGS_NEW_CONTACT_METHOD: {
        route: 'settings/profile/contact-methods/new',
        getRoute: function (backTo) { return getUrlWithBackToParam('settings/profile/contact-methods/new', backTo); },
    }, SETTINGS_CONTACT_METHOD_VERIFY_ACCOUNT: {
        route: 'settings/profile/contact-methods/verify',
        getRoute: function (backTo, forwardTo) {
            return getUrlWithBackToParam(forwardTo ? "settings/profile/contact-methods/verify?forwardTo=".concat(encodeURIComponent(forwardTo)) : 'settings/profile/contact-methods/verify', backTo);
        },
    }, SETTINGS_2FA_ROOT: {
        route: 'settings/security/two-factor-auth',
        getRoute: function (backTo, forwardTo) {
            return getUrlWithBackToParam(forwardTo ? "settings/security/two-factor-auth?forwardTo=".concat(encodeURIComponent(forwardTo)) : 'settings/security/two-factor-auth', backTo);
        },
    }, SETTINGS_2FA_VERIFY: {
        route: 'settings/security/two-factor-auth/verify',
        getRoute: function (backTo, forwardTo) {
            return getUrlWithBackToParam(forwardTo ? "settings/security/two-factor-auth/verify?forwardTo=".concat(encodeURIComponent(forwardTo)) : 'settings/security/two-factor-auth/verify', backTo);
        },
    }, SETTINGS_2FA_SUCCESS: {
        route: 'settings/security/two-factor-auth/success',
        getRoute: function (backTo, forwardTo) {
            return getUrlWithBackToParam(forwardTo ? "settings/security/two-factor-auth/success?forwardTo=".concat(encodeURIComponent(forwardTo)) : 'settings/security/two-factor-auth/success', backTo);
        },
    }, SETTINGS_2FA_DISABLED: 'settings/security/two-factor-auth/disabled', SETTINGS_2FA_DISABLE: 'settings/security/two-factor-auth/disable', SETTINGS_STATUS: 'settings/profile/status', SETTINGS_STATUS_CLEAR_AFTER: 'settings/profile/status/clear-after', SETTINGS_STATUS_CLEAR_AFTER_DATE: 'settings/profile/status/clear-after/date', SETTINGS_STATUS_CLEAR_AFTER_TIME: 'settings/profile/status/clear-after/time', SETTINGS_TROUBLESHOOT: 'settings/troubleshoot', SETTINGS_CONSOLE: {
        route: 'settings/troubleshoot/console',
        getRoute: function (backTo) { return getUrlWithBackToParam("settings/troubleshoot/console", backTo); },
    }, SETTINGS_SHARE_LOG: {
        route: 'settings/troubleshoot/console/share-log',
        getRoute: function (source) { return "settings/troubleshoot/console/share-log?source=".concat(encodeURI(source)); },
    }, SETTINGS_EXIT_SURVEY_REASON: {
        route: 'settings/exit-survey/reason',
        getRoute: function (backTo) { return getUrlWithBackToParam('settings/exit-survey/reason', backTo); },
    }, SETTINGS_EXIT_SURVEY_RESPONSE: {
        route: 'settings/exit-survey/response',
        getRoute: function (reason, backTo) { return getUrlWithBackToParam("settings/exit-survey/response".concat(reason ? "?reason=".concat(encodeURIComponent(reason)) : ''), backTo); },
    }, SETTINGS_EXIT_SURVEY_CONFIRM: {
        route: 'settings/exit-survey/confirm',
        getRoute: function (backTo) { return getUrlWithBackToParam('settings/exit-survey/confirm', backTo); },
    }, SETTINGS_SAVE_THE_WORLD: 'settings/teachersunite', KEYBOARD_SHORTCUTS: 'keyboard-shortcuts', NEW: 'new', NEW_CHAT: 'new/chat', NEW_CHAT_CONFIRM: 'new/chat/confirm', NEW_CHAT_EDIT_NAME: 'new/chat/confirm/name/edit', NEW_ROOM: 'new/room', NEW_REPORT_WORKSPACE_SELECTION: 'new-report-workspace-selection', REPORT: 'r', REPORT_WITH_ID: {
        route: 'r/:reportID?/:reportActionID?',
        getRoute: function (reportID, reportActionID, referrer, moneyRequestReportActionID, transactionID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the REPORT_WITH_ID route');
            }
            var baseRoute = reportActionID ? "r/".concat(reportID, "/").concat(reportActionID) : "r/".concat(reportID);
            var queryParams = [];
            if (referrer) {
                queryParams.push("referrer=".concat(encodeURIComponent(referrer)));
            }
            // When we are opening a transaction thread but don't have the transaction report created yet we need to pass the moneyRequestReportActionID and transactionID so we can send those to the OpenReport call and create the transaction report
            if (moneyRequestReportActionID && transactionID) {
                queryParams.push("moneyRequestReportActionID=".concat(moneyRequestReportActionID));
                queryParams.push("transactionID=".concat(transactionID));
            }
            var queryString = queryParams.length > 0 ? "?".concat(queryParams.join('&')) : '';
            return getUrlWithBackToParam("".concat(baseRoute).concat(queryString), backTo);
        },
    }, REPORT_AVATAR: {
        route: 'r/:reportID/avatar',
        getRoute: function (reportID, policyID) {
            if (policyID) {
                return "r/".concat(reportID, "/avatar?policyID=").concat(policyID);
            }
            return "r/".concat(reportID, "/avatar");
        },
    }, EDIT_CURRENCY_REQUEST: {
        route: 'r/:threadReportID/edit/currency',
        getRoute: function (threadReportID, currency, backTo) { return "r/".concat(threadReportID, "/edit/currency?currency=").concat(currency, "&backTo=").concat(backTo); },
    }, EDIT_REPORT_FIELD_REQUEST: {
        route: 'r/:reportID/edit/policyField/:policyID/:fieldID',
        getRoute: function (reportID, policyID, fieldID, backTo) {
            if (!policyID || !reportID) {
                Log_1.default.warn('Invalid policyID or reportID is used to build the EDIT_REPORT_FIELD_REQUEST route', {
                    policyID: policyID,
                    reportID: reportID,
                });
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/edit/policyField/").concat(policyID, "/").concat(encodeURIComponent(fieldID)), backTo);
        },
    }, REPORT_WITH_ID_DETAILS_SHARE_CODE: {
        route: 'r/:reportID/details/shareCode',
        getRoute: function (reportID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the REPORT_WITH_ID_DETAILS_SHARE_CODE route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/details/shareCode"), backTo);
        },
    }, ATTACHMENTS: {
        route: 'attachment',
        getRoute: function (params) { return getAttachmentModalScreenRoute('attachment', params); },
    }, REPORT_PARTICIPANTS: {
        route: 'r/:reportID/participants',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/participants"), backTo); },
    }, REPORT_PARTICIPANTS_INVITE: {
        route: 'r/:reportID/participants/invite',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/participants/invite"), backTo); },
    }, REPORT_PARTICIPANTS_DETAILS: {
        route: 'r/:reportID/participants/:accountID',
        getRoute: function (reportID, accountID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/participants/").concat(accountID), backTo); },
    }, REPORT_PARTICIPANTS_ROLE_SELECTION: {
        route: 'r/:reportID/participants/:accountID/role',
        getRoute: function (reportID, accountID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/participants/").concat(accountID, "/role"), backTo); },
    }, REPORT_WITH_ID_DETAILS: {
        route: 'r/:reportID/details',
        getRoute: function (reportID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the REPORT_WITH_ID_DETAILS route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/details"), backTo);
        },
    }, REPORT_WITH_ID_DETAILS_EXPORT: {
        route: 'r/:reportID/details/export/:connectionName',
        getRoute: function (reportID, connectionName, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/details/export/").concat(connectionName), backTo); },
    }, REPORT_WITH_ID_CHANGE_WORKSPACE: {
        route: 'r/:reportID/change-workspace',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/change-workspace"), backTo); },
    }, REPORT_SETTINGS: {
        route: 'r/:reportID/settings',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/settings"), backTo); },
    }, REPORT_SETTINGS_NAME: {
        route: 'r/:reportID/settings/name',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/settings/name"), backTo); },
    }, REPORT_SETTINGS_NOTIFICATION_PREFERENCES: {
        route: 'r/:reportID/settings/notification-preferences',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/settings/notification-preferences"), backTo); },
    }, REPORT_SETTINGS_WRITE_CAPABILITY: {
        route: 'r/:reportID/settings/who-can-post',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/settings/who-can-post"), backTo); },
    }, REPORT_SETTINGS_VISIBILITY: {
        route: 'r/:reportID/settings/visibility',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/settings/visibility"), backTo); },
    }, SPLIT_BILL_DETAILS: {
        route: 'r/:reportID/split/:reportActionID',
        getRoute: function (reportID, reportActionID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the SPLIT_BILL_DETAILS route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/split/").concat(reportActionID), backTo);
        },
    }, TASK_TITLE: {
        route: 'r/:reportID/title',
        getRoute: function (reportID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the TASK_TITLE route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/title"), backTo);
        },
    }, REPORT_DESCRIPTION: {
        route: 'r/:reportID/description',
        getRoute: function (reportID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the REPORT_DESCRIPTION route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/description"), backTo);
        },
    }, TASK_ASSIGNEE: {
        route: 'r/:reportID/assignee',
        getRoute: function (reportID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the TASK_ASSIGNEE route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/assignee"), backTo);
        },
    }, PRIVATE_NOTES_LIST: {
        route: 'r/:reportID/notes',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/notes"), backTo); },
    }, PRIVATE_NOTES_EDIT: {
        route: 'r/:reportID/notes/:accountID/edit',
        getRoute: function (reportID, accountID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/notes/").concat(accountID, "/edit"), backTo); },
    }, ROOM_MEMBERS: {
        route: 'r/:reportID/members',
        getRoute: function (reportID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/members"), backTo); },
    }, ROOM_MEMBER_DETAILS: {
        route: 'r/:reportID/members/:accountID',
        getRoute: function (reportID, accountID, backTo) { return getUrlWithBackToParam("r/".concat(reportID, "/members/").concat(accountID), backTo); },
    }, ROOM_INVITE: {
        route: 'r/:reportID/invite',
        getRoute: function (reportID, backTo) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the ROOM_INVITE route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/invite"), backTo);
        },
    }, SPLIT_EXPENSE: {
        route: 'create/split-expense/overview/:reportID/:transactionID/:splitExpenseTransactionID?',
        getRoute: function (reportID, originalTransactionID, splitExpenseTransactionID, backTo) {
            if (!reportID || !originalTransactionID) {
                Log_1.default.warn("Invalid ".concat(reportID, "(reportID) or ").concat(originalTransactionID, "(transactionID) is used to build the SPLIT_EXPENSE route"));
            }
            return getUrlWithBackToParam("create/split-expense/overview/".concat(reportID, "/").concat(originalTransactionID).concat(splitExpenseTransactionID ? "/".concat(splitExpenseTransactionID) : ''), backTo);
        },
    }, SPLIT_EXPENSE_EDIT: {
        route: 'edit/split-expense/overview/:reportID/:transactionID/:splitExpenseTransactionID?',
        getRoute: function (reportID, originalTransactionID, splitExpenseTransactionID, backTo) {
            if (!reportID || !originalTransactionID) {
                Log_1.default.warn("Invalid ".concat(reportID, "(reportID) or ").concat(originalTransactionID, "(transactionID) is used to build the SPLIT_EXPENSE_EDIT route"));
            }
            return getUrlWithBackToParam("edit/split-expense/overview/".concat(reportID, "/").concat(originalTransactionID).concat(splitExpenseTransactionID ? "/".concat(splitExpenseTransactionID) : ''), backTo);
        },
    }, MONEY_REQUEST_HOLD_REASON: {
        route: ':type/edit/reason/:transactionID?/:searchHash?',
        getRoute: function (type, transactionID, reportID, backTo, searchHash) {
            var route = searchHash
                ? "".concat(type, "/edit/reason/").concat(transactionID, "/").concat(searchHash, "/?backTo=").concat(backTo, "&reportID=").concat(reportID)
                : "".concat(type, "/edit/reason/").concat(transactionID, "/?backTo=").concat(backTo, "&reportID=").concat(reportID);
            return route;
        },
    }, MONEY_REQUEST_CREATE: {
        route: ':action/:iouType/start/:transactionID/:reportID/:backToReport?',
        getRoute: function (action, iouType, transactionID, reportID, backToReport) {
            return "".concat(action, "/").concat(iouType, "/start/").concat(transactionID, "/").concat(reportID, "/").concat(backToReport !== null && backToReport !== void 0 ? backToReport : '');
        },
    }, MONEY_REQUEST_STEP_SEND_FROM: {
        route: 'create/:iouType/from/:transactionID/:reportID',
        getRoute: function (iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("create/".concat(iouType, "/from/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_COMPANY_INFO: {
        route: 'create/:iouType/company-info/:transactionID/:reportID',
        getRoute: function (iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("create/".concat(iouType, "/company-info/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_CONFIRMATION: {
        route: ':action/:iouType/confirmation/:transactionID/:reportID/:backToReport?',
        getRoute: function (action, iouType, transactionID, reportID, backToReport, participantsAutoAssigned) {
            return "".concat(action, "/").concat(iouType, "/confirmation/").concat(transactionID, "/").concat(reportID, "/").concat(backToReport !== null && backToReport !== void 0 ? backToReport : '').concat(participantsAutoAssigned ? '?participantsAutoAssigned=true' : '');
        },
    }, MONEY_REQUEST_STEP_AMOUNT: {
        route: ':action/:iouType/amount/:transactionID/:reportID/:pageIndex?/:backToReport?',
        getRoute: function (action, iouType, transactionID, reportID, pageIndex, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_AMOUNT route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/amount/").concat(transactionID, "/").concat(reportID, "/").concat(pageIndex), backTo);
        },
    }, MONEY_REQUEST_STEP_TAX_RATE: {
        route: ':action/:iouType/taxRate/:transactionID/:reportID?',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_TAX_RATE route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/taxRate/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_TAX_AMOUNT: {
        route: ':action/:iouType/taxAmount/:transactionID/:reportID?',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_TAX_AMOUNT route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/taxAmount/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_CATEGORY: {
        route: ':action/:iouType/category/:transactionID/:reportID/:reportActionID?',
        getRoute: function (action, iouType, transactionID, reportID, backTo, reportActionID) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_CATEGORY route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/category/").concat(transactionID, "/").concat(reportID).concat(reportActionID ? "/".concat(reportActionID) : ''), backTo);
        },
    }, MONEY_REQUEST_ATTENDEE: {
        route: ':action/:iouType/attendees/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_ATTENDEE route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/attendees/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_ACCOUNTANT: {
        route: ':action/:iouType/accountant/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_ACCOUNTANT route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/accountant/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_UPGRADE: {
        route: ':action/:iouType/upgrade/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/upgrade/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_DESTINATION: {
        route: ':action/:iouType/destination/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/destination/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_TIME: {
        route: ':action/:iouType/time/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/time/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_SUBRATE: {
        route: ':action/:iouType/subrate/:transactionID/:reportID/:pageIndex',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/subrate/").concat(transactionID, "/").concat(reportID, "/0"), backTo);
        },
    }, MONEY_REQUEST_STEP_DESTINATION_EDIT: {
        route: ':action/:iouType/destination/:transactionID/:reportID/edit',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/destination/").concat(transactionID, "/").concat(reportID, "/edit"), backTo);
        },
    }, MONEY_REQUEST_STEP_TIME_EDIT: {
        route: ':action/:iouType/time/:transactionID/:reportID/edit',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/time/").concat(transactionID, "/").concat(reportID, "/edit"), backTo);
        },
    }, MONEY_REQUEST_STEP_SUBRATE_EDIT: {
        route: ':action/:iouType/subrate/:transactionID/:reportID/edit/:pageIndex',
        getRoute: function (action, iouType, transactionID, reportID, pageIndex, backTo) {
            if (pageIndex === void 0) { pageIndex = 0; }
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/subrate/").concat(transactionID, "/").concat(reportID, "/edit/").concat(pageIndex), backTo);
        },
    }, MONEY_REQUEST_STEP_REPORT: {
        route: ':action/:iouType/report/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/report/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_EDIT_REPORT: {
        route: ':action/:iouType/report/:reportID/edit',
        getRoute: function (action, iouType, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!reportID) {
                Log_1.default.warn('Invalid reportID while building route MONEY_REQUEST_EDIT_REPORT');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/report/").concat(reportID, "/edit"), backTo);
        },
    }, SETTINGS_TAGS_ROOT: {
        route: 'settings/:policyID/tags',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!policyID) {
                Log_1.default.warn('Invalid policyID while building route SETTINGS_TAGS_ROOT');
            }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tags"), backTo);
        },
    }, SETTINGS_TAGS_SETTINGS: {
        route: 'settings/:policyID/tags/settings',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tags/settings"), backTo);
        },
    }, SETTINGS_TAGS_EDIT: {
        route: 'settings/:policyID/tags/:orderWeight/edit',
        getRoute: function (policyID, orderWeight, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tags/").concat(orderWeight, "/edit"), backTo);
        },
    }, SETTINGS_TAG_CREATE: {
        route: 'settings/:policyID/tags/new',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tags/new"), backTo);
        },
    }, SETTINGS_TAG_EDIT: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName/edit',
        getRoute: function (policyID, orderWeight, tagName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName), "/edit"), backTo);
        },
    }, SETTINGS_TAG_SETTINGS: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName',
        getRoute: function (policyID, orderWeight, tagName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName)), backTo);
        },
    }, SETTINGS_TAG_APPROVER: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName/approver',
        getRoute: function (policyID, orderWeight, tagName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName), "/approver"), backTo);
        },
    }, SETTINGS_TAG_LIST_VIEW: {
        route: 'settings/:policyID/tag-list/:orderWeight',
        getRoute: function (policyID, orderWeight, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tag-list/").concat(orderWeight), backTo);
        },
    }, SETTINGS_TAG_GL_CODE: {
        route: 'settings/:policyID/tag/:orderWeight/:tagName/gl-code',
        getRoute: function (policyID, orderWeight, tagName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName), "/gl-code"), backTo);
        },
    }, SETTINGS_TAGS_IMPORT: {
        route: 'settings/:policyID/tags/import',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tags/import"), backTo);
        },
    }, SETTINGS_TAGS_IMPORTED: {
        route: 'settings/:policyID/tags/imported',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/tags/imported"), backTo);
        },
    }, SETTINGS_CATEGORIES_ROOT: {
        route: 'settings/:policyID/categories',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/categories"), backTo);
        },
    }, SETTINGS_CATEGORY_SETTINGS: {
        route: 'settings/:policyID/category/:categoryName',
        getRoute: function (policyID, categoryName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName)), backTo);
        },
    }, SETTINGS_CATEGORIES_SETTINGS: {
        route: 'settings/:policyID/categories/settings',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/categories/settings"), backTo);
        },
    }, SETTINGS_CATEGORY_CREATE: {
        route: 'settings/:policyID/categories/new',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/categories/new"), backTo);
        },
    }, SETTINGS_CATEGORY_EDIT: {
        route: 'settings/:policyID/category/:categoryName/edit',
        getRoute: function (policyID, categoryName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/edit"), backTo);
        },
    }, SETTINGS_CATEGORIES_IMPORT: {
        route: 'settings/:policyID/categories/import',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/categories/import"), backTo);
        },
    }, SETTINGS_CATEGORIES_IMPORTED: {
        route: 'settings/:policyID/categories/imported',
        getRoute: function (policyID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/categories/imported"), backTo);
        },
    }, SETTINGS_CATEGORY_PAYROLL_CODE: {
        route: 'settings/:policyID/category/:categoryName/payroll-code',
        getRoute: function (policyID, categoryName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/payroll-code"), backTo);
        },
    }, SETTINGS_CATEGORY_GL_CODE: {
        route: 'settings/:policyID/category/:categoryName/gl-code',
        getRoute: function (policyID, categoryName, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("settings/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/gl-code"), backTo);
        },
    }, MONEY_REQUEST_STEP_CURRENCY: {
        route: ':action/:iouType/currency/:transactionID/:reportID/:pageIndex?',
        getRoute: function (action, iouType, transactionID, reportID, pageIndex, currency, backTo) {
            if (pageIndex === void 0) { pageIndex = ''; }
            if (currency === void 0) { currency = ''; }
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/currency/").concat(transactionID, "/").concat(reportID, "/").concat(pageIndex, "?currency=").concat(currency), backTo);
        },
    }, MONEY_REQUEST_STEP_DATE: {
        route: ':action/:iouType/date/:transactionID/:reportID/:reportActionID?',
        getRoute: function (action, iouType, transactionID, reportID, backTo, reportActionID) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DATE route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/date/").concat(transactionID, "/").concat(reportID).concat(reportActionID ? "/".concat(reportActionID) : ''), backTo);
        },
    }, MONEY_REQUEST_STEP_DESCRIPTION: {
        route: ':action/:iouType/description/:transactionID/:reportID/:reportActionID?',
        getRoute: function (action, iouType, transactionID, reportID, backTo, reportActionID) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DESCRIPTION route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/description/").concat(transactionID, "/").concat(reportID).concat(reportActionID ? "/".concat(reportActionID) : ''), backTo);
        },
    }, MONEY_REQUEST_STEP_DISTANCE: {
        route: ':action/:iouType/distance/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DISTANCE route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/distance/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_DISTANCE_RATE: {
        route: ':action/:iouType/distanceRate/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_DISTANCE_RATE route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/distanceRate/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_MERCHANT: {
        route: ':action/:iouType/merchant/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_MERCHANT route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/merchant/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_PARTICIPANTS: {
        route: ':action/:iouType/participants/:transactionID/:reportID',
        getRoute: function (iouType, transactionID, reportID, backTo, action) {
            if (backTo === void 0) { backTo = ''; }
            if (action === void 0) { action = 'create'; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/participants/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_SPLIT_PAYER: {
        route: ':action/:iouType/confirmation/:transactionID/:reportID/payer',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/confirmation/").concat(transactionID, "/").concat(reportID, "/payer"), backTo);
        },
    }, MONEY_REQUEST_STEP_SCAN: {
        route: ':action/:iouType/scan/:transactionID/:reportID',
        getRoute: function (action, iouType, transactionID, reportID, backTo) {
            if (backTo === void 0) { backTo = ''; }
            if (!transactionID || !reportID) {
                Log_1.default.warn('Invalid transactionID or reportID is used to build the MONEY_REQUEST_STEP_SCAN route');
            }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/scan/").concat(transactionID, "/").concat(reportID), backTo);
        },
    }, MONEY_REQUEST_STEP_TAG: {
        route: ':action/:iouType/tag/:orderWeight/:transactionID/:reportID/:reportActionID?',
        getRoute: function (action, iouType, orderWeight, transactionID, reportID, backTo, reportActionID) {
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/tag/").concat(orderWeight, "/").concat(transactionID).concat(reportID ? "/".concat(reportID) : '').concat(reportActionID ? "/".concat(reportActionID) : ''), backTo);
        },
    }, MONEY_REQUEST_STEP_WAYPOINT: {
        route: ':action/:iouType/waypoint/:transactionID/:reportID/:pageIndex',
        getRoute: function (action, iouType, transactionID, reportID, pageIndex, backTo) {
            if (pageIndex === void 0) { pageIndex = ''; }
            if (backTo === void 0) { backTo = ''; }
            return getUrlWithBackToParam("".concat(action, "/").concat(iouType, "/waypoint/").concat(transactionID, "/").concat(reportID, "/").concat(pageIndex), backTo);
        },
    }, 
    // This URL is used as a redirect to one of the create tabs below. This is so that we can message users with a link
    // straight to those flows without needing to have optimistic transaction and report IDs.
    MONEY_REQUEST_START: {
        route: 'start/:iouType/:iouRequestType',
        getRoute: function (iouType, iouRequestType) { return "start/".concat(iouType, "/").concat(iouRequestType); },
    }, MONEY_REQUEST_CREATE_TAB_DISTANCE: {
        route: 'distance/:backToReport?',
        getRoute: function (action, iouType, transactionID, reportID, backToReport) {
            return "create/".concat(iouType, "/start/").concat(transactionID, "/").concat(reportID, "/distance/").concat(backToReport !== null && backToReport !== void 0 ? backToReport : '');
        },
    }, MONEY_REQUEST_CREATE_TAB_MANUAL: {
        route: 'manual/:backToReport?',
        getRoute: function (action, iouType, transactionID, reportID, backToReport) {
            return "".concat(action, "/").concat(iouType, "/start/").concat(transactionID, "/").concat(reportID, "/manual/").concat(backToReport !== null && backToReport !== void 0 ? backToReport : '');
        },
    }, MONEY_REQUEST_CREATE_TAB_SCAN: {
        route: 'scan/:backToReport?',
        getRoute: function (action, iouType, transactionID, reportID, backToReport) {
            return "create/".concat(iouType, "/start/").concat(transactionID, "/").concat(reportID, "/scan/").concat(backToReport !== null && backToReport !== void 0 ? backToReport : '');
        },
    }, MONEY_REQUEST_CREATE_TAB_PER_DIEM: {
        route: ':action/:iouType/start/:transactionID/:reportID/per-diem/:backToReport?',
        getRoute: function (action, iouType, transactionID, reportID, backToReport) {
            return "create/".concat(iouType, "/start/").concat(transactionID, "/").concat(reportID, "/per-diem/").concat(backToReport !== null && backToReport !== void 0 ? backToReport : '');
        },
    }, MONEY_REQUEST_RECEIPT_VIEW_MODAL: {
        route: 'receipt-view-modal/:transactionID',
        getRoute: function (transactionID, backTo) { return getUrlWithBackToParam("receipt-view-modal/".concat(transactionID), backTo); },
    }, MONEY_REQUEST_STATE_SELECTOR: {
        route: 'submit/state',
        getRoute: function (state, backTo, label) {
            return "".concat(getUrlWithBackToParam("submit/state".concat(state ? "?state=".concat(encodeURIComponent(state)) : ''), backTo)).concat(
            // the label param can be an empty string so we cannot use a nullish ?? operator
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            label ? "".concat(backTo || state ? '&' : '?', "label=").concat(encodeURIComponent(label)) : '');
        },
    }, IOU_SEND_ADD_BANK_ACCOUNT: 'pay/new/add-bank-account', IOU_SEND_ADD_DEBIT_CARD: 'pay/new/add-debit-card', IOU_SEND_ENABLE_PAYMENTS: 'pay/new/enable-payments', NEW_TASK: {
        route: 'new/task',
        getRoute: function (backTo) { return getUrlWithBackToParam('new/task', backTo); },
    }, NEW_TASK_ASSIGNEE: {
        route: 'new/task/assignee',
        getRoute: function (backTo) { return getUrlWithBackToParam('new/task/assignee', backTo); },
    }, NEW_TASK_SHARE_DESTINATION: 'new/task/share-destination', NEW_TASK_DETAILS: {
        route: 'new/task/details',
        getRoute: function (backTo) { return getUrlWithBackToParam('new/task/details', backTo); },
    }, NEW_TASK_TITLE: {
        route: 'new/task/title',
        getRoute: function (backTo) { return getUrlWithBackToParam('new/task/title', backTo); },
    }, NEW_TASK_DESCRIPTION: {
        route: 'new/task/description',
        getRoute: function (backTo) { return getUrlWithBackToParam('new/task/description', backTo); },
    }, TEACHERS_UNITE: 'settings/teachersunite', I_KNOW_A_TEACHER: 'settings/teachersunite/i-know-a-teacher', I_AM_A_TEACHER: 'settings/teachersunite/i-am-a-teacher', INTRO_SCHOOL_PRINCIPAL: 'settings/teachersunite/intro-school-principal', ERECEIPT: {
        route: 'eReceipt/:transactionID',
        getRoute: function (transactionID) { return "eReceipt/".concat(transactionID); },
    }, WORKSPACE_NEW: 'workspace/new', WORKSPACE_NEW_ROOM: 'workspace/new-room', WORKSPACE_INITIAL: {
        route: 'workspaces/:policyID',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_INITIAL route');
            }
            return "".concat(getUrlWithBackToParam("workspaces/".concat(policyID), backTo));
        },
    }, WORKSPACE_INVITE: {
        route: 'workspaces/:policyID/invite',
        getRoute: function (policyID, backTo) { return "".concat(getUrlWithBackToParam("workspaces/".concat(policyID, "/invite"), backTo)); },
    }, WORKSPACE_INVITE_MESSAGE: {
        route: 'workspaces/:policyID/invite-message',
        getRoute: function (policyID, backTo) { return "".concat(getUrlWithBackToParam("workspaces/".concat(policyID, "/invite-message"), backTo)); },
    }, WORKSPACE_INVITE_MESSAGE_ROLE: {
        route: 'workspaces/:policyID/invite-message/role',
        getRoute: function (policyID, backTo) { return "".concat(getUrlWithBackToParam("workspaces/".concat(policyID, "/invite-message/role"), backTo)); },
    }, WORKSPACE_OVERVIEW: {
        route: 'workspaces/:policyID/overview',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_OVERVIEW route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/overview"), backTo);
        },
    }, WORKSPACE_OVERVIEW_ADDRESS: {
        route: 'workspaces/:policyID/overview/address',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_OVERVIEW_ADDRESS route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/overview/address"), backTo);
        },
    }, WORKSPACE_OVERVIEW_PLAN: {
        route: 'workspaces/:policyID/overview/plan',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/overview/plan"), backTo); },
    }, WORKSPACE_ACCOUNTING: {
        route: 'workspaces/:policyID/accounting',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting"); },
    }, WORKSPACE_OVERVIEW_CURRENCY: {
        route: 'workspaces/:policyID/overview/currency',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/overview/currency"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export"), backTo, false);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/company-card-expense-account"), backTo); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/account-select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/company-card-expense-account/account-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/default-vendor-select',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT route');
            }
            return "workspaces/".concat(policyID, "/accounting/quickbooks-online/export/company-card-expense-account/default-vendor-select");
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/company-card-expense-account/card-select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_COMPANY_CARD_EXPENSE_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/company-card-expense-account/card-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/invoice-account-select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/invoice-account-select"), backTo); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_PREFERRED_EXPORTER: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/preferred-exporter',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/preferred-exporter"), backTo); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/out-of-pocket-expense"), backTo); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense/account-select',
        getRoute: function (policyID, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/out-of-pocket-expense/account-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/out-of-pocket-expense/entity-select',
        getRoute: function (policyID, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/out-of-pocket-expense/entity-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_EXPORT_DATE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/export/date-select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-online/export/date-select"), backTo); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account/account-select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/company-card-expense-account/account-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account/card-select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/company-card-expense-account/card-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account/default-vendor-select',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_DEFAULT_VENDOR_SELECT route');
            }
            return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/company-card-expense-account/default-vendor-select");
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/company-card-expense-account',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_COMPANY_CARD_EXPENSE_ACCOUNT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/company-card-expense-account"), backTo);
        },
    }, WORKSPACE_ACCOUNTING_QUICKBOOKS_DESKTOP_ADVANCED: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/advanced',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/advanced"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/date-select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_DATE_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/date-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/preferred-exporter',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_PREFERRED_EXPORTER route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/preferred-exporter"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/out-of-pocket-expense"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_ACCOUNT_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/out-of-pocket-expense/account-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT_OUT_OF_POCKET_EXPENSES_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export/out-of-pocket-expense/entity-select"), backTo);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/export',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_EXPORT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/quickbooks-desktop/export"), backTo, false);
        },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_MODAL: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/setup-modal',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/setup-modal"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_SETUP_REQUIRED_DEVICE_MODAL: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/setup-required-device',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/setup-required-device"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_TRIGGER_FIRST_SYNC: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/trigger-first-sync',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/trigger-first-sync"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_IMPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/import"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CHART_OF_ACCOUNTS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/accounts',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/import/accounts"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/classes',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/import/classes"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CLASSES_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/classes/displayed_as',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/import/classes/displayed_as"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/customers',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/import/customers"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_CUSTOMERS_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/customers/displayed_as',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/import/customers/displayed_as"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_DESKTOP_ITEMS: {
        route: 'workspaces/:policyID/accounting/quickbooks-desktop/import/items',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-desktop/import/items"); },
    }, WORKSPACE_OVERVIEW_NAME: {
        route: 'workspaces/:policyID/overview/name',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/overview/name"); },
    }, WORKSPACE_OVERVIEW_DESCRIPTION: {
        route: 'workspaces/:policyID/overview/description',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_OVERVIEW_DESCRIPTION route');
            }
            return "workspaces/".concat(policyID, "/overview/description");
        },
    }, WORKSPACE_OVERVIEW_SHARE: {
        route: 'workspaces/:policyID/overview/share',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/overview/share"); },
    }, WORKSPACE_AVATAR: {
        route: 'workspaces/:policyID/avatar',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/avatar"); },
    }, WORKSPACE_JOIN_USER: {
        route: 'workspaces/:policyID/join',
        getRoute: function (policyID, inviterEmail) { return "workspaces/".concat(policyID, "/join?email=").concat(inviterEmail); },
    }, WORKSPACE_SETTINGS_CURRENCY: {
        route: 'workspaces/:policyID/settings/currency',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/settings/currency"); },
    }, WORKSPACE_WORKFLOWS: {
        route: 'workspaces/:policyID/workflows',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_WORKFLOWS route');
            }
            return "workspaces/".concat(policyID, "/workflows");
        },
    }, WORKSPACE_WORKFLOWS_APPROVALS_NEW: {
        route: 'workspaces/:policyID/workflows/approvals/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/workflows/approvals/new"); },
    }, WORKSPACE_WORKFLOWS_APPROVALS_EDIT: {
        route: 'workspaces/:policyID/workflows/approvals/:firstApproverEmail/edit',
        getRoute: function (policyID, firstApproverEmail) { return "workspaces/".concat(policyID, "/workflows/approvals/").concat(encodeURIComponent(firstApproverEmail), "/edit"); },
    }, WORKSPACE_WORKFLOWS_APPROVALS_EXPENSES_FROM: {
        route: 'workspaces/:policyID/workflows/approvals/expenses-from',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/workflows/approvals/expenses-from"), backTo); },
    }, WORKSPACE_WORKFLOWS_APPROVALS_APPROVER: {
        route: 'workspaces/:policyID/workflows/approvals/approver',
        getRoute: function (policyID, approverIndex, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/workflows/approvals/approver?approverIndex=").concat(approverIndex), backTo);
        },
    }, WORKSPACE_WORKFLOWS_PAYER: {
        route: 'workspaces/:policyID/workflows/payer',
        getRoute: function (policyId) { return "workspaces/".concat(policyId, "/workflows/payer"); },
    }, WORKSPACE_WORKFLOWS_AUTOREPORTING_FREQUENCY: {
        route: 'workspaces/:policyID/workflows/auto-reporting-frequency',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/workflows/auto-reporting-frequency"); },
    }, WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET: {
        route: 'workspaces/:policyID/workflows/auto-reporting-frequency/monthly-offset',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_WORKFLOWS_AUTOREPORTING_MONTHLY_OFFSET route');
            }
            return "workspaces/".concat(policyID, "/workflows/auto-reporting-frequency/monthly-offset");
        },
    }, WORKSPACE_INVOICES: {
        route: 'workspaces/:policyID/invoices',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_INVOICES route');
            }
            return "workspaces/".concat(policyID, "/invoices");
        },
    }, WORKSPACE_INVOICES_COMPANY_NAME: {
        route: 'workspaces/:policyID/invoices/company-name',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/invoices/company-name"); },
    }, WORKSPACE_INVOICES_COMPANY_WEBSITE: {
        route: 'workspaces/:policyID/invoices/company-website',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/invoices/company-website"); },
    }, WORKSPACE_MEMBERS: {
        route: 'workspaces/:policyID/members',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_MEMBERS route');
            }
            return "workspaces/".concat(policyID, "/members");
        },
    }, WORKSPACE_MEMBERS_IMPORT: {
        route: 'workspaces/:policyID/members/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/members/import"); },
    }, WORKSPACE_MEMBERS_IMPORTED: {
        route: 'workspaces/:policyID/members/imported',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/members/imported"); },
    }, POLICY_ACCOUNTING: {
        route: 'workspaces/:policyID/accounting',
        getRoute: function (policyID, newConnectionName, integrationToDisconnect, shouldDisconnectIntegrationBeforeConnecting) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING route');
            }
            var queryParams = '';
            if (newConnectionName) {
                queryParams += "?newConnectionName=".concat(newConnectionName);
                if (integrationToDisconnect) {
                    queryParams += "&integrationToDisconnect=".concat(integrationToDisconnect);
                }
                if (shouldDisconnectIntegrationBeforeConnecting !== undefined) {
                    queryParams += "&shouldDisconnectIntegrationBeforeConnecting=".concat(shouldDisconnectIntegrationBeforeConnecting);
                }
            }
            return "workspaces/".concat(policyID, "/accounting").concat(queryParams);
        },
    }, WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/advanced',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ADVANCED route');
            }
            return "workspaces/".concat(policyID, "/accounting/quickbooks-online/advanced");
        },
    }, WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNT_SELECTOR: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/account-selector',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/account-selector"); },
    }, WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_INVOICE_ACCOUNT_SELECTOR: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/invoice-account-selector',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/invoice-account-selector"); },
    }, WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_AUTO_SYNC: {
        route: 'workspaces/:policyID/connections/quickbooks-online/advanced/autosync',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/quickbooks-online/advanced/autosync"), backTo); },
    }, WORKSPACE_ACCOUNTING_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD: {
        route: 'workspaces/:policyID/connections/quickbooks-online/advanced/autosync/accounting-method',
        getRoute: function (policyID, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/quickbooks-online/advanced/autosync/accounting-method"), backTo);
        },
    }, WORKSPACE_ACCOUNTING_CARD_RECONCILIATION: {
        route: 'workspaces/:policyID/accounting/:connection/card-reconciliation',
        getRoute: function (policyID, connection) { return "workspaces/".concat(policyID, "/accounting/").concat(connection, "/card-reconciliation"); },
    }, WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS: {
        route: 'workspaces/:policyID/accounting/:connection/card-reconciliation/account',
        getRoute: function (policyID, connection) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_ACCOUNTING_RECONCILIATION_ACCOUNT_SETTINGS route');
            }
            return "workspaces/".concat(policyID, "/accounting/").concat(connection, "/card-reconciliation/account");
        },
    }, WORKSPACE_CATEGORIES: {
        route: 'workspaces/:policyID/categories',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_CATEGORIES route');
            }
            return "workspaces/".concat(policyID, "/categories");
        },
    }, WORKSPACE_CATEGORY_SETTINGS: {
        route: 'workspaces/:policyID/category/:categoryName',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName)); },
    }, WORKSPACE_UPGRADE: {
        route: 'workspaces/:policyID?/upgrade/:featureName?',
        getRoute: function (policyID, featureName, backTo) {
            return getUrlWithBackToParam(policyID ? "workspaces/".concat(policyID, "/upgrade/").concat(encodeURIComponent(featureName !== null && featureName !== void 0 ? featureName : '')) : "workspaces/upgrade", backTo);
        },
    }, WORKSPACE_DOWNGRADE: {
        route: 'workspaces/:policyID?/downgrade/',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam(policyID ? "workspaces/".concat(policyID, "/downgrade/") : "workspaces/downgrade", backTo); },
    }, WORKSPACE_PAY_AND_DOWNGRADE: {
        route: 'workspaces/pay-and-downgrade/',
        getRoute: function (backTo) { return getUrlWithBackToParam("workspaces/pay-and-downgrade", backTo); },
    }, WORKSPACE_CATEGORIES_SETTINGS: {
        route: 'workspaces/:policyID/categories/settings',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/categories/settings"); },
    }, WORKSPACE_CATEGORIES_IMPORT: {
        route: 'workspaces/:policyID/categories/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/categories/import"); },
    }, WORKSPACE_CATEGORIES_IMPORTED: {
        route: 'workspaces/:policyID/categories/imported',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/categories/imported"); },
    }, WORKSPACE_CATEGORY_CREATE: {
        route: 'workspaces/:policyID/categories/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/categories/new"); },
    }, WORKSPACE_CATEGORY_EDIT: {
        route: 'workspaces/:policyID/category/:categoryName/edit',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/edit"); },
    }, WORKSPACE_CATEGORY_PAYROLL_CODE: {
        route: 'workspaces/:policyID/category/:categoryName/payroll-code',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/payroll-code"); },
    }, WORKSPACE_CATEGORY_GL_CODE: {
        route: 'workspaces/:policyID/category/:categoryName/gl-code',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/gl-code"); },
    }, WORKSPACE_CATEGORY_DEFAULT_TAX_RATE: {
        route: 'workspaces/:policyID/category/:categoryName/tax-rate',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/tax-rate"); },
    }, WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER: {
        route: 'workspaces/:policyID/category/:categoryName/flag-amounts',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/flag-amounts"); },
    }, WORKSPACE_CATEGORY_DESCRIPTION_HINT: {
        route: 'workspaces/:policyID/category/:categoryName/description-hint',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/description-hint"); },
    }, WORKSPACE_CATEGORY_REQUIRE_RECEIPTS_OVER: {
        route: 'workspaces/:policyID/category/:categoryName/require-receipts-over',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/require-receipts-over"); },
    }, WORKSPACE_CATEGORY_APPROVER: {
        route: 'workspaces/:policyID/category/:categoryName/approver',
        getRoute: function (policyID, categoryName) { return "workspaces/".concat(policyID, "/category/").concat(encodeURIComponent(categoryName), "/approver"); },
    }, WORKSPACE_MORE_FEATURES: {
        route: 'workspaces/:policyID/more-features',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_MORE_FEATURES route');
            }
            return "workspaces/".concat(policyID, "/more-features");
        },
    }, WORKSPACE_TAGS: {
        route: 'workspaces/:policyID/tags',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_TAGS route');
            }
            return "workspaces/".concat(policyID, "/tags");
        },
    }, WORKSPACE_TAG_CREATE: {
        route: 'workspaces/:policyID/tags/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/tags/new"); },
    }, WORKSPACE_TAGS_SETTINGS: {
        route: 'workspaces/:policyID/tags/settings',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/tags/settings"); },
    }, WORKSPACE_EDIT_TAGS: {
        route: 'workspaces/:policyID/tags/:orderWeight/edit',
        getRoute: function (policyID, orderWeight, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/tags/").concat(orderWeight, "/edit"), backTo); },
    }, WORKSPACE_TAG_EDIT: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName/edit',
        getRoute: function (policyID, orderWeight, tagName) { return "workspaces/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName), "/edit"); },
    }, WORKSPACE_TAG_SETTINGS: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName',
        getRoute: function (policyID, orderWeight, tagName, parentTagsFilter) {
            var queryParams = '';
            if (parentTagsFilter) {
                queryParams += "?parentTagsFilter=".concat(parentTagsFilter);
            }
            return "workspaces/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName)).concat(queryParams);
        },
    }, WORKSPACE_TAG_APPROVER: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName/approver',
        getRoute: function (policyID, orderWeight, tagName) { return "workspaces/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName), "/approver"); },
    }, WORKSPACE_TAG_LIST_VIEW: {
        route: 'workspaces/:policyID/tag-list/:orderWeight',
        getRoute: function (policyID, orderWeight) { return "workspaces/".concat(policyID, "/tag-list/").concat(orderWeight); },
    }, WORKSPACE_TAG_GL_CODE: {
        route: 'workspaces/:policyID/tag/:orderWeight/:tagName/gl-code',
        getRoute: function (policyID, orderWeight, tagName) { return "workspaces/".concat(policyID, "/tag/").concat(orderWeight, "/").concat(encodeURIComponent(tagName), "/gl-code"); },
    }, WORKSPACE_TAGS_IMPORT: {
        route: 'workspaces/:policyID/tags/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/tags/import"); },
    }, WORKSPACE_MULTI_LEVEL_TAGS_IMPORT_SETTINGS: {
        route: 'workspaces/:policyID/tags/import/multi-level',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/tags/import/multi-level"); },
    }, WORKSPACE_TAGS_IMPORT_OPTIONS: {
        route: 'workspaces/:policyID/tags/import/import-options',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/tags/import/import-options"); },
    }, WORKSPACE_TAGS_IMPORTED: {
        route: 'workspaces/:policyID/tags/imported',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/tags/imported"); },
    }, WORKSPACE_TAGS_IMPORTED_MULTI_LEVEL: {
        route: 'workspaces/:policyID/tags/imported/multi-level',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/tags/imported/multi-level"); },
    }, WORKSPACE_TAXES: {
        route: 'workspaces/:policyID/taxes',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_TAXES route');
            }
            return "workspaces/".concat(policyID, "/taxes");
        },
    }, WORKSPACE_TAXES_SETTINGS: {
        route: 'workspaces/:policyID/taxes/settings',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/taxes/settings"); },
    }, WORKSPACE_TAXES_SETTINGS_WORKSPACE_CURRENCY_DEFAULT: {
        route: 'workspaces/:policyID/taxes/settings/workspace-currency',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/taxes/settings/workspace-currency"); },
    }, WORKSPACE_TAXES_SETTINGS_FOREIGN_CURRENCY_DEFAULT: {
        route: 'workspaces/:policyID/taxes/settings/foreign-currency',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/taxes/settings/foreign-currency"); },
    }, WORKSPACE_TAXES_SETTINGS_CUSTOM_TAX_NAME: {
        route: 'workspaces/:policyID/taxes/settings/tax-name',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/taxes/settings/tax-name"); },
    }, WORKSPACE_MEMBER_DETAILS: {
        route: 'workspaces/:policyID/members/:accountID',
        getRoute: function (policyID, accountID) { return "workspaces/".concat(policyID, "/members/").concat(accountID); },
    }, WORKSPACE_CUSTOM_FIELDS: {
        route: 'workspaces/:policyID/members/:accountID/:customFieldType',
        getRoute: function (policyID, accountID, customFieldType) { return "/workspaces/".concat(policyID, "/members/").concat(accountID, "/").concat(customFieldType); },
    }, WORKSPACE_MEMBER_NEW_CARD: {
        route: 'workspaces/:policyID/members/:accountID/new-card',
        getRoute: function (policyID, accountID) { return "workspaces/".concat(policyID, "/members/").concat(accountID, "/new-card"); },
    }, WORKSPACE_MEMBER_ROLE_SELECTION: {
        route: 'workspaces/:policyID/members/:accountID/role-selection',
        getRoute: function (policyID, accountID) { return "workspaces/".concat(policyID, "/members/").concat(accountID, "/role-selection"); },
    }, WORKSPACE_OWNER_CHANGE_SUCCESS: {
        route: 'workspaces/:policyID/change-owner/:accountID/success',
        getRoute: function (policyID, accountID) { return "workspaces/".concat(policyID, "/change-owner/").concat(accountID, "/success"); },
    }, WORKSPACE_OWNER_CHANGE_ERROR: {
        route: 'workspaces/:policyID/change-owner/:accountID/failure',
        getRoute: function (policyID, accountID) { return "workspaces/".concat(policyID, "/change-owner/").concat(accountID, "/failure"); },
    }, WORKSPACE_OWNER_CHANGE_CHECK: {
        route: 'workspaces/:policyID/change-owner/:accountID/:error',
        getRoute: function (policyID, accountID, error) {
            return "workspaces/".concat(policyID, "/change-owner/").concat(accountID, "/").concat(error);
        },
    }, WORKSPACE_TAX_CREATE: {
        route: 'workspaces/:policyID/taxes/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/taxes/new"); },
    }, WORKSPACE_TAX_EDIT: {
        route: 'workspaces/:policyID/tax/:taxID',
        getRoute: function (policyID, taxID) { return "workspaces/".concat(policyID, "/tax/").concat(encodeURIComponent(taxID)); },
    }, WORKSPACE_TAX_NAME: {
        route: 'workspaces/:policyID/tax/:taxID/name',
        getRoute: function (policyID, taxID) { return "workspaces/".concat(policyID, "/tax/").concat(encodeURIComponent(taxID), "/name"); },
    }, WORKSPACE_TAX_VALUE: {
        route: 'workspaces/:policyID/tax/:taxID/value',
        getRoute: function (policyID, taxID) { return "workspaces/".concat(policyID, "/tax/").concat(encodeURIComponent(taxID), "/value"); },
    }, WORKSPACE_TAX_CODE: {
        route: 'workspaces/:policyID/tax/:taxID/tax-code',
        getRoute: function (policyID, taxID) { return "workspaces/".concat(policyID, "/tax/").concat(encodeURIComponent(taxID), "/tax-code"); },
    }, WORKSPACE_REPORT_FIELDS: {
        route: 'workspaces/:policyID/reportFields',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_REPORT_FIELDS route');
            }
            return "workspaces/".concat(policyID, "/reportFields");
        },
    }, WORKSPACE_CREATE_REPORT_FIELD: {
        route: 'workspaces/:policyID/reportFields/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/reportFields/new"); },
    }, WORKSPACE_REPORT_FIELDS_SETTINGS: {
        route: 'workspaces/:policyID/reportFields/:reportFieldID/edit',
        getRoute: function (policyID, reportFieldID) { return "workspaces/".concat(policyID, "/reportFields/").concat(encodeURIComponent(reportFieldID), "/edit"); },
    }, WORKSPACE_REPORT_FIELDS_LIST_VALUES: {
        route: 'workspaces/:policyID/reportFields/listValues/:reportFieldID?',
        getRoute: function (policyID, reportFieldID) { return "workspaces/".concat(policyID, "/reportFields/listValues/").concat(reportFieldID ? encodeURIComponent(reportFieldID) : ''); },
    }, WORKSPACE_REPORT_FIELDS_ADD_VALUE: {
        route: 'workspaces/:policyID/reportFields/addValue/:reportFieldID?',
        getRoute: function (policyID, reportFieldID) { return "workspaces/".concat(policyID, "/reportFields/addValue/").concat(reportFieldID ? encodeURIComponent(reportFieldID) : ''); },
    }, WORKSPACE_REPORT_FIELDS_VALUE_SETTINGS: {
        route: 'workspaces/:policyID/reportFields/:valueIndex/:reportFieldID?',
        getRoute: function (policyID, valueIndex, reportFieldID) {
            return "workspaces/".concat(policyID, "/reportFields/").concat(valueIndex, "/").concat(reportFieldID ? encodeURIComponent(reportFieldID) : '');
        },
    }, WORKSPACE_REPORT_FIELDS_EDIT_VALUE: {
        route: 'workspaces/:policyID/reportFields/new/:valueIndex/edit',
        getRoute: function (policyID, valueIndex) { return "workspaces/".concat(policyID, "/reportFields/new/").concat(valueIndex, "/edit"); },
    }, WORKSPACE_EDIT_REPORT_FIELDS_INITIAL_VALUE: {
        route: 'workspaces/:policyID/reportFields/:reportFieldID/edit/initialValue',
        getRoute: function (policyID, reportFieldID) { return "workspaces/".concat(policyID, "/reportFields/").concat(encodeURIComponent(reportFieldID), "/edit/initialValue"); },
    }, WORKSPACE_COMPANY_CARDS: {
        route: 'workspaces/:policyID/company-cards',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_COMPANY_CARDS route');
            }
            return "workspaces/".concat(policyID, "/company-cards");
        },
    }, WORKSPACE_COMPANY_CARDS_BANK_CONNECTION: {
        route: 'workspaces/:policyID/company-cards/:bankName/bank-connection',
        getRoute: function (policyID, bankName, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_COMPANY_CARDS_BANK_CONNECTION route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/company-cards/").concat(bankName, "/bank-connection"), backTo);
        },
    }, WORKSPACE_COMPANY_CARDS_ADD_NEW: {
        route: 'workspaces/:policyID/company-cards/add-card-feed',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/company-cards/add-card-feed"), backTo); },
    }, WORKSPACE_COMPANY_CARDS_SELECT_FEED: {
        route: 'workspaces/:policyID/company-cards/select-feed',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/company-cards/select-feed"); },
    }, WORKSPACE_COMPANY_CARDS_ASSIGN_CARD: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card',
        getRoute: function (policyID, feed, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/company-cards/").concat(feed, "/assign-card"), backTo); },
    }, WORKSPACE_COMPANY_CARDS_TRANSACTION_START_DATE: {
        route: 'workspaces/:policyID/company-cards/:feed/assign-card/transaction-start-date',
        getRoute: function (policyID, feed, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/company-cards/").concat(feed, "/assign-card/transaction-start-date"), backTo); },
    }, WORKSPACE_COMPANY_CARD_DETAILS: {
        route: 'workspaces/:policyID/company-cards/:bank/:cardID',
        getRoute: function (policyID, cardID, bank, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/company-cards/").concat(bank, "/").concat(cardID), backTo); },
    }, WORKSPACE_COMPANY_CARD_NAME: {
        route: 'workspaces/:policyID/company-cards/:bank/:cardID/edit/name',
        getRoute: function (policyID, cardID, bank) { return "workspaces/".concat(policyID, "/company-cards/").concat(bank, "/").concat(cardID, "/edit/name"); },
    }, WORKSPACE_COMPANY_CARD_EXPORT: {
        route: 'workspaces/:policyID/company-cards/:bank/:cardID/edit/export',
        getRoute: function (policyID, cardID, bank, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/company-cards/").concat(bank, "/").concat(cardID, "/edit/export"), backTo, false);
        },
    }, WORKSPACE_EXPENSIFY_CARD: {
        route: 'workspaces/:policyID/expensify-card',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_EXPENSIFY_CARD route');
            }
            return "workspaces/".concat(policyID, "/expensify-card");
        },
    }, WORKSPACE_EXPENSIFY_CARD_DETAILS: {
        route: 'workspaces/:policyID/expensify-card/:cardID',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/expensify-card/").concat(cardID), backTo); },
    }, EXPENSIFY_CARD_DETAILS: {
        route: 'settings/:policyID/expensify-card/:cardID',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("settings/".concat(policyID, "/expensify-card/").concat(cardID), backTo); },
    }, WORKSPACE_EXPENSIFY_CARD_NAME: {
        route: 'workspaces/:policyID/expensify-card/:cardID/edit/name',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/expensify-card/").concat(cardID, "/edit/name"), backTo); },
    }, EXPENSIFY_CARD_NAME: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/name',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("settings/".concat(policyID, "/expensify-card/").concat(cardID, "/edit/name"), backTo); },
    }, WORKSPACE_EXPENSIFY_CARD_LIMIT: {
        route: 'workspaces/:policyID/expensify-card/:cardID/edit/limit',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/expensify-card/").concat(cardID, "/edit/limit"), backTo); },
    }, EXPENSIFY_CARD_LIMIT: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/limit',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("settings/".concat(policyID, "/expensify-card/").concat(cardID, "/edit/limit"), backTo); },
    }, WORKSPACE_EXPENSIFY_CARD_LIMIT_TYPE: {
        route: 'workspaces/:policyID/expensify-card/:cardID/edit/limit-type',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/expensify-card/").concat(cardID, "/edit/limit-type"), backTo); },
    }, EXPENSIFY_CARD_LIMIT_TYPE: {
        route: 'settings/:policyID/expensify-card/:cardID/edit/limit-type',
        getRoute: function (policyID, cardID, backTo) { return getUrlWithBackToParam("settings/".concat(policyID, "/expensify-card/").concat(cardID, "/edit/limit-type"), backTo); },
    }, WORKSPACE_EXPENSIFY_CARD_ISSUE_NEW: {
        route: 'workspaces/:policyID/expensify-card/issue-new',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/expensify-card/issue-new"), backTo); },
    }, WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT: {
        route: 'workspaces/:policyID/expensify-card/choose-bank-account',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_EXPENSIFY_CARD_BANK_ACCOUNT route');
            }
            return "workspaces/".concat(policyID, "/expensify-card/choose-bank-account");
        },
    }, WORKSPACE_EXPENSIFY_CARD_SETTINGS: {
        route: 'workspaces/:policyID/expensify-card/settings',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/expensify-card/settings"); },
    }, WORKSPACE_EXPENSIFY_CARD_SETTINGS_ACCOUNT: {
        route: 'workspaces/:policyID/expensify-card/settings/account',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/expensify-card/settings/account"), backTo); },
    }, WORKSPACE_EXPENSIFY_CARD_SELECT_FEED: {
        route: 'workspaces/:policyID/expensify-card/select-feed',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/expensify-card/select-feed"), backTo); },
    }, WORKSPACE_EXPENSIFY_CARD_SETTINGS_FREQUENCY: {
        route: 'workspaces/:policyID/expensify-card/settings/frequency',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/expensify-card/settings/frequency"); },
    }, WORKSPACE_COMPANY_CARDS_SETTINGS: {
        route: 'workspaces/:policyID/company-cards/settings',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/company-cards/settings"); },
    }, WORKSPACE_COMPANY_CARDS_SETTINGS_FEED_NAME: {
        route: 'workspaces/:policyID/company-cards/settings/feed-name',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/company-cards/settings/feed-name"); },
    }, WORKSPACE_RULES: {
        route: 'workspaces/:policyID/rules',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_RULES route');
            }
            return "workspaces/".concat(policyID, "/rules");
        },
    }, WORKSPACE_DISTANCE_RATES: {
        route: 'workspaces/:policyID/distance-rates',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_DISTANCE_RATES route');
            }
            return "workspaces/".concat(policyID, "/distance-rates");
        },
    }, WORKSPACE_CREATE_DISTANCE_RATE: {
        route: 'workspaces/:policyID/distance-rates/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/distance-rates/new"); },
    }, WORKSPACE_DISTANCE_RATES_SETTINGS: {
        route: 'workspaces/:policyID/distance-rates/settings',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/distance-rates/settings"); },
    }, WORKSPACE_DISTANCE_RATE_DETAILS: {
        route: 'workspaces/:policyID/distance-rates/:rateID',
        getRoute: function (policyID, rateID) { return "workspaces/".concat(policyID, "/distance-rates/").concat(rateID); },
    }, WORKSPACE_DISTANCE_RATE_EDIT: {
        route: 'workspaces/:policyID/distance-rates/:rateID/edit',
        getRoute: function (policyID, rateID) { return "workspaces/".concat(policyID, "/distance-rates/").concat(rateID, "/edit"); },
    }, WORKSPACE_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT: {
        route: 'workspaces/:policyID/distance-rates/:rateID/tax-reclaimable/edit',
        getRoute: function (policyID, rateID) { return "workspaces/".concat(policyID, "/distance-rates/").concat(rateID, "/tax-reclaimable/edit"); },
    }, WORKSPACE_DISTANCE_RATE_TAX_RATE_EDIT: {
        route: 'workspaces/:policyID/distance-rates/:rateID/tax-rate/edit',
        getRoute: function (policyID, rateID) { return "workspaces/".concat(policyID, "/distance-rates/").concat(rateID, "/tax-rate/edit"); },
    }, WORKSPACE_PER_DIEM: {
        route: 'workspaces/:policyID/per-diem',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the WORKSPACE_PER_DIEM route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/per-diem"), backTo);
        },
    }, WORKSPACE_PER_DIEM_IMPORT: {
        route: 'workspaces/:policyID/per-diem/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/per-diem/import"); },
    }, WORKSPACE_PER_DIEM_IMPORTED: {
        route: 'workspaces/:policyID/per-diem/imported',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/per-diem/imported"); },
    }, WORKSPACE_PER_DIEM_SETTINGS: {
        route: 'workspaces/:policyID/per-diem/settings',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/per-diem/settings"); },
    }, WORKSPACE_PER_DIEM_DETAILS: {
        route: 'workspaces/:policyID/per-diem/details/:rateID/:subRateID',
        getRoute: function (policyID, rateID, subRateID) { return "workspaces/".concat(policyID, "/per-diem/details/").concat(rateID, "/").concat(subRateID); },
    }, WORKSPACE_PER_DIEM_EDIT_DESTINATION: {
        route: 'workspaces/:policyID/per-diem/edit/destination/:rateID/:subRateID',
        getRoute: function (policyID, rateID, subRateID) { return "workspaces/".concat(policyID, "/per-diem/edit/destination/").concat(rateID, "/").concat(subRateID); },
    }, WORKSPACE_PER_DIEM_EDIT_SUBRATE: {
        route: 'workspaces/:policyID/per-diem/edit/subrate/:rateID/:subRateID',
        getRoute: function (policyID, rateID, subRateID) { return "workspaces/".concat(policyID, "/per-diem/edit/subrate/").concat(rateID, "/").concat(subRateID); },
    }, WORKSPACE_PER_DIEM_EDIT_AMOUNT: {
        route: 'workspaces/:policyID/per-diem/edit/amount/:rateID/:subRateID',
        getRoute: function (policyID, rateID, subRateID) { return "workspaces/".concat(policyID, "/per-diem/edit/amount/").concat(rateID, "/").concat(subRateID); },
    }, WORKSPACE_PER_DIEM_EDIT_CURRENCY: {
        route: 'workspaces/:policyID/per-diem/edit/currency/:rateID/:subRateID',
        getRoute: function (policyID, rateID, subRateID) { return "workspaces/".concat(policyID, "/per-diem/edit/currency/").concat(rateID, "/").concat(subRateID); },
    }, RULES_CUSTOM_NAME: {
        route: 'workspaces/:policyID/rules/name',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/name"); },
    }, RULES_AUTO_APPROVE_REPORTS_UNDER: {
        route: 'workspaces/:policyID/rules/auto-approve',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/auto-approve"); },
    }, RULES_RANDOM_REPORT_AUDIT: {
        route: 'workspaces/:policyID/rules/audit',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/audit"); },
    }, RULES_AUTO_PAY_REPORTS_UNDER: {
        route: 'workspaces/:policyID/rules/auto-pay',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/auto-pay"); },
    }, RULES_RECEIPT_REQUIRED_AMOUNT: {
        route: 'workspaces/:policyID/rules/receipt-required-amount',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/receipt-required-amount"); },
    }, RULES_MAX_EXPENSE_AMOUNT: {
        route: 'workspaces/:policyID/rules/max-expense-amount',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/max-expense-amount"); },
    }, RULES_MAX_EXPENSE_AGE: {
        route: 'workspaces/:policyID/rules/max-expense-age',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/max-expense-age"); },
    }, RULES_BILLABLE_DEFAULT: {
        route: 'workspaces/:policyID/rules/billable',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/billable"); },
    }, RULES_PROHIBITED_DEFAULT: {
        route: 'workspaces/:policyID/rules/prohibited',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/prohibited"); },
    }, RULES_CUSTOM: {
        route: 'workspaces/:policyID/rules/custom',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/rules/custom"); },
    }, 
    // Referral program promotion
    REFERRAL_DETAILS_MODAL: {
        route: 'referral/:contentType',
        getRoute: function (contentType, backTo) { return getUrlWithBackToParam("referral/".concat(contentType), backTo); },
    }, SHARE_ROOT: 'share/root', SHARE_ROOT_SHARE: 'share/root/share', SHARE_ROOT_SUBMIT: 'share/root/submit', SHARE_DETAILS: {
        route: 'share/share-details/:reportOrAccountID',
        getRoute: function (reportOrAccountID) { return "share/share-details/".concat(reportOrAccountID); },
    }, SHARE_SUBMIT_DETAILS: {
        route: 'share/submit-details/:reportOrAccountID',
        getRoute: function (reportOrAccountID) { return "share/submit-details/".concat(reportOrAccountID); },
    }, PROCESS_MONEY_REQUEST_HOLD: {
        route: 'hold-expense-educational',
        getRoute: function (backTo) { return getUrlWithBackToParam('hold-expense-educational', backTo); },
    }, CHANGE_POLICY_EDUCATIONAL: {
        route: 'change-workspace-educational',
        getRoute: function (backTo) { return getUrlWithBackToParam('change-workspace-educational', backTo); },
    }, TRAVEL_MY_TRIPS: 'travel', TRAVEL_TCS: {
        route: 'travel/terms/:domain/accept',
        getRoute: function (domain, backTo) { return getUrlWithBackToParam("travel/terms/".concat(domain, "/accept"), backTo); },
    }, TRAVEL_UPGRADE: {
        route: 'travel/upgrade',
        getRoute: function (backTo) { return getUrlWithBackToParam('travel/upgrade', backTo); },
    }, TRACK_TRAINING_MODAL: 'track-training', TRAVEL_TRIP_SUMMARY: {
        route: 'r/:reportID/trip/:transactionID',
        getRoute: function (reportID, transactionID, backTo) {
            if (!reportID || !transactionID) {
                Log_1.default.warn('Invalid reportID or transactionID is used to build the TRAVEL_TRIP_SUMMARY route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/trip/").concat(transactionID), backTo);
        },
    }, TRAVEL_TRIP_DETAILS: {
        route: 'r/:reportID/trip/:transactionID/:pnr/:sequenceIndex',
        getRoute: function (reportID, transactionID, pnr, sequenceIndex, backTo) {
            if (!reportID || !transactionID || !pnr) {
                Log_1.default.warn('Invalid reportID, transactionID or pnr is used to build the TRAVEL_TRIP_DETAILS route');
            }
            return getUrlWithBackToParam("r/".concat(reportID, "/trip/").concat(transactionID, "/").concat(pnr, "/").concat(sequenceIndex), backTo);
        },
    }, TRAVEL_DOMAIN_SELECTOR: {
        route: 'travel/domain-selector',
        getRoute: function (backTo) { return getUrlWithBackToParam("travel/domain-selector", backTo); },
    }, TRAVEL_DOMAIN_PERMISSION_INFO: {
        route: 'travel/domain-permission/:domain/info',
        getRoute: function (domain, backTo) { return getUrlWithBackToParam("travel/domain-permission/".concat(domain, "/info"), backTo); },
    }, TRAVEL_PUBLIC_DOMAIN_ERROR: {
        route: 'travel/public-domain-error',
        getRoute: function (backTo) { return getUrlWithBackToParam("travel/public-domain-error", backTo); },
    }, TRAVEL_WORKSPACE_ADDRESS: {
        route: 'travel/:domain/workspace-address',
        getRoute: function (domain, backTo) { return getUrlWithBackToParam("travel/".concat(domain, "/workspace-address"), backTo); },
    }, ONBOARDING_ROOT: {
        route: 'onboarding',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding", backTo); },
    }, ONBOARDING_PERSONAL_DETAILS: {
        route: 'onboarding/personal-details',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/personal-details", backTo); },
    }, ONBOARDING_PRIVATE_DOMAIN: {
        route: 'onboarding/private-domain',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/private-domain", backTo); },
    }, ONBOARDING_EMPLOYEES: {
        route: 'onboarding/employees',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/employees", backTo); },
    }, ONBOARDING_ACCOUNTING: {
        route: 'onboarding/accounting',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/accounting", backTo); },
    }, ONBOARDING_PURPOSE: {
        route: 'onboarding/purpose',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/purpose", backTo); },
    }, ONBOARDING_WORKSPACES: {
        route: 'onboarding/join-workspaces',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/join-workspaces", backTo); },
    }, ONBOARDING_WORK_EMAIL: {
        route: 'onboarding/work-email',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/work-email", backTo); },
    }, ONBOARDING_WORK_EMAIL_VALIDATION: {
        route: 'onboarding/work-email-validation',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/work-email-validation", backTo); },
    }, ONBOARDING_WORKSPACE: {
        route: 'onboarding/create-workspace',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/create-workspace", backTo); },
    }, ONBOARDING_WORKSPACE_CONFIRMATION: {
        route: 'onboarding/workspace-confirmation',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/workspace-confirmation", backTo); },
    }, ONBOARDING_WORKSPACE_CURRENCY: {
        route: 'onboarding/workspace-currency',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/workspace-currency", backTo); },
    }, ONBOARDING_WORKSPACE_INVITE: {
        route: 'onboarding/workspace-invite',
        getRoute: function (backTo) { return getUrlWithBackToParam("onboarding/workspace-invite", backTo); },
    }, WELCOME_VIDEO_ROOT: 'onboarding/welcome-video', EXPLANATION_MODAL_ROOT: 'onboarding/explanation', TEST_DRIVE_MODAL_ROOT: {
        route: 'onboarding/test-drive',
        getRoute: function (bossEmail) { return "onboarding/test-drive".concat(bossEmail ? "?bossEmail=".concat(encodeURIComponent(bossEmail)) : ''); },
    }, TEST_DRIVE_DEMO_ROOT: 'onboarding/test-drive/demo', AUTO_SUBMIT_MODAL_ROOT: '/auto-submit', WORKSPACE_CONFIRMATION: {
        route: 'workspace/confirmation',
        getRoute: function (backTo) { return getUrlWithBackToParam("workspace/confirmation", backTo); },
    }, MIGRATED_USER_WELCOME_MODAL: {
        route: 'onboarding/migrated-user-welcome',
        getRoute: function (shouldOpenSearch) { return getUrlWithBackToParam("onboarding/migrated-user-welcome?".concat(shouldOpenSearch ? 'shouldOpenSearch=true' : ''), undefined, false); },
    }, TRANSACTION_RECEIPT: {
        route: 'r/:reportID/transaction/:transactionID/receipt/:action?/:iouType?',
        getRoute: function (reportID, transactionID, readonly, isFromReviewDuplicates, action, iouType) {
            if (readonly === void 0) { readonly = false; }
            if (isFromReviewDuplicates === void 0) { isFromReviewDuplicates = false; }
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the TRANSACTION_RECEIPT route');
            }
            if (!transactionID) {
                Log_1.default.warn('Invalid transactionID is used to build the TRANSACTION_RECEIPT route');
            }
            return "r/".concat(reportID, "/transaction/").concat(transactionID, "/receipt").concat(action ? "/".concat(action) : '').concat(iouType ? "/".concat(iouType) : '', "?readonly=").concat(readonly).concat(isFromReviewDuplicates ? '&isFromReviewDuplicates=true' : '');
        },
    }, TRANSACTION_DUPLICATE_REVIEW_PAGE: {
        route: 'r/:threadReportID/duplicates/review',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review"), backTo); },
    }, TRANSACTION_DUPLICATE_REVIEW_MERCHANT_PAGE: {
        route: 'r/:threadReportID/duplicates/review/merchant',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review/merchant"), backTo); },
    }, TRANSACTION_DUPLICATE_REVIEW_CATEGORY_PAGE: {
        route: 'r/:threadReportID/duplicates/review/category',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review/category"), backTo); },
    }, TRANSACTION_DUPLICATE_REVIEW_TAG_PAGE: {
        route: 'r/:threadReportID/duplicates/review/tag',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review/tag"), backTo); },
    }, TRANSACTION_DUPLICATE_REVIEW_TAX_CODE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/tax-code',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review/tax-code"), backTo); },
    }, TRANSACTION_DUPLICATE_REVIEW_DESCRIPTION_PAGE: {
        route: 'r/:threadReportID/duplicates/review/description',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review/description"), backTo); },
    }, TRANSACTION_DUPLICATE_REVIEW_REIMBURSABLE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/reimbursable',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review/reimbursable"), backTo); },
    }, TRANSACTION_DUPLICATE_REVIEW_BILLABLE_PAGE: {
        route: 'r/:threadReportID/duplicates/review/billable',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/review/billable"), backTo); },
    }, TRANSACTION_DUPLICATE_CONFIRMATION_PAGE: {
        route: 'r/:threadReportID/duplicates/confirm',
        getRoute: function (threadReportID, backTo) { return getUrlWithBackToParam("r/".concat(threadReportID, "/duplicates/confirm"), backTo); },
    }, POLICY_ACCOUNTING_XERO_IMPORT: {
        route: 'workspaces/:policyID/accounting/xero/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/xero/import"); },
    }, POLICY_ACCOUNTING_XERO_CHART_OF_ACCOUNTS: {
        route: 'workspaces/:policyID/accounting/xero/import/accounts',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/xero/import/accounts"); },
    }, POLICY_ACCOUNTING_XERO_ORGANIZATION: {
        route: 'workspaces/:policyID/accounting/xero/organization/:currentOrganizationID',
        getRoute: function (policyID, currentOrganizationID) {
            if (!policyID || !currentOrganizationID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_ORGANIZATION route');
            }
            return "workspaces/".concat(policyID, "/accounting/xero/organization/").concat(currentOrganizationID);
        },
    }, POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES: {
        route: 'workspaces/:policyID/accounting/xero/import/tracking-categories',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/xero/import/tracking-categories"); },
    }, POLICY_ACCOUNTING_XERO_TRACKING_CATEGORIES_MAP: {
        route: 'workspaces/:policyID/accounting/xero/import/tracking-categories/mapping/:categoryId/:categoryName',
        getRoute: function (policyID, categoryId, categoryName) {
            return "workspaces/".concat(policyID, "/accounting/xero/import/tracking-categories/mapping/").concat(categoryId, "/").concat(encodeURIComponent(categoryName));
        },
    }, POLICY_ACCOUNTING_XERO_CUSTOMER: {
        route: 'workspaces/:policyID/accounting/xero/import/customers',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/xero/import/customers"); },
    }, POLICY_ACCOUNTING_XERO_TAXES: {
        route: 'workspaces/:policyID/accounting/xero/import/taxes',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/xero/import/taxes"); },
    }, POLICY_ACCOUNTING_XERO_EXPORT: {
        route: 'workspaces/:policyID/accounting/xero/export',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/xero/export"), backTo, false); },
    }, POLICY_ACCOUNTING_XERO_PREFERRED_EXPORTER_SELECT: {
        route: 'workspaces/:policyID/connections/xero/export/preferred-exporter/select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/xero/export/preferred-exporter/select"), backTo); },
    }, POLICY_ACCOUNTING_XERO_EXPORT_PURCHASE_BILL_DATE_SELECT: {
        route: 'workspaces/:policyID/accounting/xero/export/purchase-bill-date-select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/xero/export/purchase-bill-date-select"), backTo); },
    }, POLICY_ACCOUNTING_XERO_EXPORT_BANK_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/accounting/xero/export/bank-account-select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/xero/export/bank-account-select"), backTo); },
    }, POLICY_ACCOUNTING_XERO_ADVANCED: {
        route: 'workspaces/:policyID/accounting/xero/advanced',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_XERO_ADVANCED route');
            }
            return "workspaces/".concat(policyID, "/accounting/xero/advanced");
        },
    }, POLICY_ACCOUNTING_XERO_BILL_STATUS_SELECTOR: {
        route: 'workspaces/:policyID/accounting/xero/export/purchase-bill-status-selector',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/xero/export/purchase-bill-status-selector"), backTo); },
    }, POLICY_ACCOUNTING_XERO_INVOICE_SELECTOR: {
        route: 'workspaces/:policyID/accounting/xero/advanced/invoice-account-selector',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/xero/advanced/invoice-account-selector"); },
    }, POLICY_ACCOUNTING_XERO_BILL_PAYMENT_ACCOUNT_SELECTOR: {
        route: 'workspaces/:policyID/accounting/xero/advanced/bill-payment-account-selector',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/xero/advanced/bill-payment-account-selector"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_IMPORT: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CHART_OF_ACCOUNTS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/accounts',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/accounts"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/classes',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/classes"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CLASSES_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/classes/displayed-as',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/classes/displayed-as"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/customers',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/customers"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_CUSTOMERS_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/customers/displayed-as',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/customers/displayed-as"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/locations',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/locations"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_LOCATIONS_DISPLAYED_AS: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/locations/displayed-as',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/locations/displayed-as"); },
    }, POLICY_ACCOUNTING_QUICKBOOKS_ONLINE_TAXES: {
        route: 'workspaces/:policyID/accounting/quickbooks-online/import/taxes',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/quickbooks-online/import/taxes"); },
    }, RESTRICTED_ACTION: {
        route: 'restricted-action/workspace/:policyID',
        getRoute: function (policyID) { return "restricted-action/workspace/".concat(policyID); },
    }, MISSING_PERSONAL_DETAILS: 'missing-personal-details', POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR: {
        route: 'workspaces/:policyID/accounting/netsuite/subsidiary-selector',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_SUBSIDIARY_SELECTOR route');
            }
            return "workspaces/".concat(policyID, "/accounting/netsuite/subsidiary-selector");
        },
    }, POLICY_ACCOUNTING_NETSUITE_EXISTING_CONNECTIONS: {
        route: 'workspaces/:policyID/accounting/netsuite/existing-connections',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/netsuite/existing-connections"); },
    }, POLICY_ACCOUNTING_NETSUITE_TOKEN_INPUT: {
        route: 'workspaces/:policyID/accounting/netsuite/token-input',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/netsuite/token-input"); },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT: {
        route: 'workspaces/:policyID/accounting/netsuite/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/netsuite/import"); },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_MAPPING: {
        route: 'workspaces/:policyID/accounting/netsuite/import/mapping/:importField',
        getRoute: function (policyID, importField) {
            return "workspaces/".concat(policyID, "/accounting/netsuite/import/mapping/").concat(importField);
        },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_MAPPING: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField',
        getRoute: function (policyID, importCustomField) {
            return "workspaces/".concat(policyID, "/accounting/netsuite/import/custom/").concat(importCustomField);
        },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField/view/:valueIndex',
        getRoute: function (policyID, importCustomField, valueIndex) {
            return "workspaces/".concat(policyID, "/accounting/netsuite/import/custom/").concat(importCustomField, "/view/").concat(valueIndex);
        },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_EDIT: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom/:importCustomField/edit/:valueIndex/:fieldName',
        getRoute: function (policyID, importCustomField, valueIndex, fieldName) {
            return "workspaces/".concat(policyID, "/accounting/netsuite/import/custom/").concat(importCustomField, "/edit/").concat(valueIndex, "/").concat(fieldName);
        },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_LIST_ADD: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom-list/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/netsuite/import/custom-list/new"); },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_SEGMENT_ADD: {
        route: 'workspaces/:policyID/accounting/netsuite/import/custom-segment/new',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/netsuite/import/custom-segment/new"); },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS: {
        route: 'workspaces/:policyID/accounting/netsuite/import/customer-projects',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/netsuite/import/customer-projects"); },
    }, POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOMERS_OR_PROJECTS_SELECT: {
        route: 'workspaces/:policyID/accounting/netsuite/import/customer-projects/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/netsuite/import/customer-projects/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_EXPORT: {
        route: 'workspaces/:policyID/connections/netsuite/export/',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_EXPORT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/"), backTo, false);
        },
    }, POLICY_ACCOUNTING_NETSUITE_PREFERRED_EXPORTER_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/preferred-exporter/select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/preferred-exporter/select"), backTo); },
    }, POLICY_ACCOUNTING_NETSUITE_DATE_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/date/select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/date/select"), backTo); },
    }, POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType',
        getRoute: function (policyID, expenseType, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/expenses/").concat(expenseType), backTo);
        },
    }, POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_DESTINATION_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/destination/select',
        getRoute: function (policyID, expenseType, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/expenses/").concat(expenseType, "/destination/select"), backTo);
        },
    }, POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_VENDOR_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/vendor/select',
        getRoute: function (policyID, expenseType, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/expenses/").concat(expenseType, "/vendor/select"), backTo);
        },
    }, POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_PAYABLE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/payable-account/select',
        getRoute: function (policyID, expenseType, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/expenses/").concat(expenseType, "/payable-account/select"), backTo);
        },
    }, POLICY_ACCOUNTING_NETSUITE_EXPORT_EXPENSES_JOURNAL_POSTING_PREFERENCE_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/expenses/:expenseType/journal-posting-preference/select',
        getRoute: function (policyID, expenseType, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/expenses/").concat(expenseType, "/journal-posting-preference/select"), backTo);
        },
    }, POLICY_ACCOUNTING_NETSUITE_RECEIVABLE_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/receivable-account/select',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/receivable-account/select"), backTo); },
    }, POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/invoice-item-preference/select',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_PREFERENCE_SELECT route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/export/invoice-item-preference/select"), backTo);
        },
    }, POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/invoice-item-preference/invoice-item/select',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_INVOICE_ITEM_SELECT route');
            }
            return "workspaces/".concat(policyID, "/connections/netsuite/export/invoice-item-preference/invoice-item/select");
        },
    }, POLICY_ACCOUNTING_NETSUITE_TAX_POSTING_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/tax-posting-account/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/export/tax-posting-account/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/export/provincial-tax-posting-account/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/export/provincial-tax-posting-account/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_ADVANCED: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_ADVANCED route');
            }
            return "workspaces/".concat(policyID, "/connections/netsuite/advanced/");
        },
    }, POLICY_ACCOUNTING_NETSUITE_REIMBURSEMENT_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/reimbursement-account/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/advanced/reimbursement-account/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_COLLECTION_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/collection-account/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/advanced/collection-account/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_EXPENSE_REPORT_APPROVAL_LEVEL_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/expense-report-approval-level/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/advanced/expense-report-approval-level/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_VENDOR_BILL_APPROVAL_LEVEL_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/vendor-bill-approval-level/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/advanced/vendor-bill-approval-level/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_JOURNAL_ENTRY_APPROVAL_LEVEL_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/journal-entry-approval-level/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/advanced/journal-entry-approval-level/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_APPROVAL_ACCOUNT_SELECT: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/approval-account/select',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/connections/netsuite/advanced/approval-account/select"); },
    }, POLICY_ACCOUNTING_NETSUITE_CUSTOM_FORM_ID: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/custom-form-id/:expenseType',
        getRoute: function (policyID, expenseType) {
            return "workspaces/".concat(policyID, "/connections/netsuite/advanced/custom-form-id/").concat(expenseType);
        },
    }, POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/autosync',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_AUTO_SYNC route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/advanced/autosync"), backTo);
        },
    }, POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD: {
        route: 'workspaces/:policyID/connections/netsuite/advanced/autosync/accounting-method',
        getRoute: function (policyID, backTo) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_NETSUITE_ACCOUNTING_METHOD route');
            }
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/connections/netsuite/advanced/autosync/accounting-method"), backTo);
        },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_PREREQUISITES: {
        route: 'workspaces/:policyID/accounting/sage-intacct/prerequisites',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/prerequisites"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_ENTER_CREDENTIALS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/enter-credentials',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/enter-credentials"); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_EXISTING_CONNECTIONS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/existing-connections',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/existing-connections"); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY: {
        route: 'workspaces/:policyID/accounting/sage-intacct/entity',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_SAGE_INTACCT_ENTITY route');
            }
            return "workspaces/".concat(policyID, "/accounting/sage-intacct/entity");
        },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import"); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_TOGGLE_MAPPINGS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/toggle-mapping/:mapping',
        getRoute: function (policyID, mapping) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import/toggle-mapping/").concat(mapping); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_MAPPINGS_TYPE: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/mapping-type/:mapping',
        getRoute: function (policyID, mapping) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import/mapping-type/").concat(mapping); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/tax',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import/tax"); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_IMPORT_TAX_MAPPING: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/tax/mapping',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import/tax/mapping"); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_USER_DIMENSIONS: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/user-dimensions',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import/user-dimensions"); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_ADD_USER_DIMENSION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/add-user-dimension',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import/add-user-dimension"); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_EDIT_USER_DIMENSION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/import/edit-user-dimension/:dimensionName',
        getRoute: function (policyID, dimensionName) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/import/edit-user-dimension/").concat(dimensionName); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export"), backTo, false); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_PREFERRED_EXPORTER: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/preferred-exporter',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/preferred-exporter"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_EXPORT_DATE: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/date',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/date"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_EXPENSES: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/reimbursable',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/reimbursable"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/nonreimbursable"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_REIMBURSABLE_DESTINATION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/reimbursable/destination',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/reimbursable/destination"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_DESTINATION: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable/destination',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/nonreimbursable/destination"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_DEFAULT_VENDOR: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/:reimbursable/default-vendor',
        getRoute: function (policyID, reimbursable, backTo) {
            return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/").concat(reimbursable, "/default-vendor"), backTo);
        },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_NON_REIMBURSABLE_CREDIT_CARD_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/export/nonreimbursable/credit-card-account',
        getRoute: function (policyID, backTo) { return getUrlWithBackToParam("workspaces/".concat(policyID, "/accounting/sage-intacct/export/nonreimbursable/credit-card-account"), backTo); },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED: {
        route: 'workspaces/:policyID/accounting/sage-intacct/advanced',
        getRoute: function (policyID) {
            if (!policyID) {
                Log_1.default.warn('Invalid policyID is used to build the POLICY_ACCOUNTING_SAGE_INTACCT_ADVANCED route');
            }
            return "workspaces/".concat(policyID, "/accounting/sage-intacct/advanced");
        },
    }, POLICY_ACCOUNTING_SAGE_INTACCT_PAYMENT_ACCOUNT: {
        route: 'workspaces/:policyID/accounting/sage-intacct/advanced/payment-account',
        getRoute: function (policyID) { return "workspaces/".concat(policyID, "/accounting/sage-intacct/advanced/payment-account"); },
    }, ADD_UNREPORTED_EXPENSE: {
        route: 'search/r/:reportID/add-unreported-expense/:backToReport?',
        getRoute: function (reportID, backToReport) { return "search/r/".concat(reportID, "/add-unreported-expense/").concat(backToReport !== null && backToReport !== void 0 ? backToReport : ''); },
    }, DEBUG_REPORT: {
        route: 'debug/report/:reportID',
        getRoute: function (reportID) { return "debug/report/".concat(reportID); },
    }, DEBUG_REPORT_TAB_DETAILS: {
        route: 'debug/report/:reportID/details',
        getRoute: function (reportID) { return "debug/report/".concat(reportID, "/details"); },
    }, DEBUG_REPORT_TAB_JSON: {
        route: 'debug/report/:reportID/json',
        getRoute: function (reportID) { return "debug/report/".concat(reportID, "/json"); },
    }, DEBUG_REPORT_TAB_ACTIONS: {
        route: 'debug/report/:reportID/actions',
        getRoute: function (reportID) { return "debug/report/".concat(reportID, "/actions"); },
    }, DEBUG_REPORT_ACTION: {
        route: 'debug/report/:reportID/actions/:reportActionID',
        getRoute: function (reportID, reportActionID) {
            if (!reportID) {
                Log_1.default.warn('Invalid reportID is used to build the DEBUG_REPORT_ACTION route');
            }
            return "debug/report/".concat(reportID, "/actions/").concat(reportActionID);
        },
    }, DEBUG_REPORT_ACTION_CREATE: {
        route: 'debug/report/:reportID/actions/create',
        getRoute: function (reportID) { return "debug/report/".concat(reportID, "/actions/create"); },
    }, DEBUG_REPORT_ACTION_TAB_DETAILS: {
        route: 'debug/report/:reportID/actions/:reportActionID/details',
        getRoute: function (reportID, reportActionID) { return "debug/report/".concat(reportID, "/actions/").concat(reportActionID, "/details"); },
    }, DEBUG_REPORT_ACTION_TAB_JSON: {
        route: 'debug/report/:reportID/actions/:reportActionID/json',
        getRoute: function (reportID, reportActionID) { return "debug/report/".concat(reportID, "/actions/").concat(reportActionID, "/json"); },
    }, DEBUG_REPORT_ACTION_TAB_PREVIEW: {
        route: 'debug/report/:reportID/actions/:reportActionID/preview',
        getRoute: function (reportID, reportActionID) { return "debug/report/".concat(reportID, "/actions/").concat(reportActionID, "/preview"); },
    }, DETAILS_CONSTANT_PICKER_PAGE: {
        route: 'debug/:formType/details/constant/:fieldName',
        getRoute: function (formType, fieldName, fieldValue, policyID, backTo) {
            return getUrlWithBackToParam("debug/".concat(formType, "/details/constant/").concat(fieldName, "?fieldValue=").concat(fieldValue, "&policyID=").concat(policyID), backTo);
        },
    }, DETAILS_DATE_TIME_PICKER_PAGE: {
        route: 'debug/details/datetime/:fieldName',
        getRoute: function (fieldName, fieldValue, backTo) { return getUrlWithBackToParam("debug/details/datetime/".concat(fieldName, "?fieldValue=").concat(fieldValue), backTo); },
    }, DEBUG_TRANSACTION: {
        route: 'debug/transaction/:transactionID',
        getRoute: function (transactionID) { return "debug/transaction/".concat(transactionID); },
    }, DEBUG_TRANSACTION_TAB_DETAILS: {
        route: 'debug/transaction/:transactionID/details',
        getRoute: function (transactionID) { return "debug/transaction/".concat(transactionID, "/details"); },
    }, DEBUG_TRANSACTION_TAB_JSON: {
        route: 'debug/transaction/:transactionID/json',
        getRoute: function (transactionID) { return "debug/transaction/".concat(transactionID, "/json"); },
    }, DEBUG_TRANSACTION_TAB_VIOLATIONS: {
        route: 'debug/transaction/:transactionID/violations',
        getRoute: function (transactionID) { return "debug/transaction/".concat(transactionID, "/violations"); },
    }, DEBUG_TRANSACTION_VIOLATION_CREATE: {
        route: 'debug/transaction/:transactionID/violations/create',
        getRoute: function (transactionID) { return "debug/transaction/".concat(transactionID, "/violations/create"); },
    }, DEBUG_TRANSACTION_VIOLATION: {
        route: 'debug/transaction/:transactionID/violations/:index',
        getRoute: function (transactionID, index) { return "debug/transaction/".concat(transactionID, "/violations/").concat(index); },
    }, DEBUG_TRANSACTION_VIOLATION_TAB_DETAILS: {
        route: 'debug/transaction/:transactionID/violations/:index/details',
        getRoute: function (transactionID, index) { return "debug/transaction/".concat(transactionID, "/violations/").concat(index, "/details"); },
    }, DEBUG_TRANSACTION_VIOLATION_TAB_JSON: {
        route: 'debug/transaction/:transactionID/violations/:index/json',
        getRoute: function (transactionID, index) { return "debug/transaction/".concat(transactionID, "/violations/").concat(index, "/json"); },
    }, SCHEDULE_CALL_BOOK: {
        route: 'r/:reportID/schedule-call/book',
        getRoute: function (reportID) { return "r/".concat(reportID, "/schedule-call/book"); },
    }, SCHEDULE_CALL_CONFIRMATION: {
        route: 'r/:reportID/schedule-call/confirmation',
        getRoute: function (reportID) { return "r/".concat(reportID, "/schedule-call/confirmation"); },
    }, TEST_TOOLS_MODAL: 'test-tools' });
/**
 * Proxy routes can be used to generate a correct url with dynamic values
 *
 * It will be used by HybridApp, that has no access to methods generating dynamic routes in NewDot
 */
var HYBRID_APP_ROUTES = {
    MONEY_REQUEST_CREATE: '/request/new/scan',
    MONEY_REQUEST_CREATE_TAB_SCAN: '/submit/new/scan',
    MONEY_REQUEST_CREATE_TAB_MANUAL: '/submit/new/manual',
    MONEY_REQUEST_CREATE_TAB_DISTANCE: '/submit/new/distance',
};
exports.HYBRID_APP_ROUTES = HYBRID_APP_ROUTES;
/**
 * Configuration for shared parameters that can be passed between routes.
 * These parameters are commonly used across multiple screens and are preserved
 * during navigation state transitions.
 *
 * Currently includes:
 * - `backTo`: Specifies the route to return to when navigating back, preserving
 *   navigation context in split-screen and central screen
 */
var SHARED_ROUTE_PARAMS = (_a = {},
    _a[SCREENS_1.default.WORKSPACE.INITIAL] = ['backTo'],
    _a);
exports.SHARED_ROUTE_PARAMS = SHARED_ROUTE_PARAMS;
exports.default = ROUTES;
function getAttachmentModalScreenRoute(url, params) {
    if (!(params === null || params === void 0 ? void 0 : params.source)) {
        return url;
    }
    var source = params.source, attachmentID = params.attachmentID, type = params.type, reportID = params.reportID, accountID = params.accountID, isAuthTokenRequired = params.isAuthTokenRequired, originalFileName = params.originalFileName, attachmentLink = params.attachmentLink;
    var sourceParam = "?source=".concat(encodeURIComponent(source));
    var attachmentIDParam = attachmentID ? "&attachmentID=".concat(attachmentID) : '';
    var typeParam = type ? "&type=".concat(type) : '';
    var reportIDParam = reportID ? "&reportID=".concat(reportID) : '';
    var accountIDParam = accountID ? "&accountID=".concat(accountID) : '';
    var authTokenParam = isAuthTokenRequired ? '&isAuthTokenRequired=true' : '';
    var fileNameParam = originalFileName ? "&originalFileName=".concat(originalFileName) : '';
    var attachmentLinkParam = attachmentLink ? "&attachmentLink=".concat(attachmentLink) : '';
    return "".concat(url).concat(sourceParam).concat(typeParam).concat(reportIDParam).concat(attachmentIDParam).concat(accountIDParam).concat(authTokenParam).concat(fileNameParam).concat(attachmentLinkParam, " ");
}
