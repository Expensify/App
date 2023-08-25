import lodashGet from 'lodash/get';
import * as Url from './libs/Url';

/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */

const REPORT = 'r';
const IOU_REQUEST = 'request/new';
const IOU_BILL = 'split/new';
const IOU_SEND = 'send/new';
const NEW_TASK = 'new/task';
const SETTINGS_PERSONAL_DETAILS = 'settings/profile/personal-details';
const SETTINGS_CONTACT_METHODS = 'settings/profile/contact-methods';
const SETTINGS_STATUS = 'settings/profile/status';
const SETTINGS_STATUS_SET = 'settings/profile/status/set';

export default {
    BANK_ACCOUNT: 'bank-account',
    BANK_ACCOUNT_NEW: 'bank-account/new',
    BANK_ACCOUNT_WITH_STEP_TO_OPEN: 'bank-account/:stepToOpen?',
    BANK_ACCOUNT_PERSONAL: 'bank-account/personal',
    getBankAccountRoute: (stepToOpen = '', policyID = '', backTo = '') => {
        const backToParam = backTo ? `&backTo=${encodeURIComponent(backTo)}` : '';
        return `bank-account/${stepToOpen}?policyID=${policyID}${backToParam}`;
    },
    HOME: '',
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
    SETTINGS_ADD_PAYPAL_ME: 'settings/wallet/add-paypal-me',
    SETTINGS_ADD_DEBIT_CARD: 'settings/wallet/add-debit-card',
    SETTINGS_ADD_BANK_ACCOUNT: 'settings/wallet/add-bank-account',
    SETTINGS_ENABLE_PAYMENTS: 'settings/wallet/enable-payments',
    getSettingsAddLoginRoute: (type) => `settings/addlogin/${type}`,
    SETTINGS_WALLET_TRANSFER_BALANCE: 'settings/wallet/transfer-balance',
    SETTINGS_WALLET_CHOOSE_TRANSFER_ACCOUNT: 'settings/wallet/choose-transfer-account',
    SETTINGS_PERSONAL_DETAILS,
    SETTINGS_PERSONAL_DETAILS_LEGAL_NAME: `${SETTINGS_PERSONAL_DETAILS}/legal-name`,
    SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH: `${SETTINGS_PERSONAL_DETAILS}/date-of-birth`,
    SETTINGS_PERSONAL_DETAILS_ADDRESS: `${SETTINGS_PERSONAL_DETAILS}/address`,
    SETTINGS_CONTACT_METHODS,
    SETTINGS_CONTACT_METHOD_DETAILS: `${SETTINGS_CONTACT_METHODS}/:contactMethod/details`,
    getEditContactMethodRoute: (contactMethod) => `${SETTINGS_CONTACT_METHODS}/${encodeURIComponent(contactMethod)}/details`,
    SETTINGS_NEW_CONTACT_METHOD: `${SETTINGS_CONTACT_METHODS}/new`,
    SETTINGS_2FA: 'settings/security/two-factor-auth',
    SETTINGS_STATUS,
    SETTINGS_STATUS_SET,
    NEW_GROUP: 'new/group',
    NEW_CHAT: 'new/chat',
    NEW_TASK,
    REPORT,
    REPORT_WITH_ID: 'r/:reportID?',
    EDIT_REQUEST: 'r/:threadReportID/edit/:field',
    getEditRequestRoute: (threadReportID, field) => `r/${threadReportID}/edit/${field}`,
    EDIT_CURRENCY_REQUEST: 'r/:threadReportID/edit/currency',
    getEditRequestCurrencyRoute: (threadReportID, currency, backTo) => `r/${threadReportID}/edit/currency?currency=${currency}&backTo=${backTo}`,
    getReportRoute: (reportID) => `r/${reportID}`,
    REPORT_WITH_ID_DETAILS_SHARE_CODE: 'r/:reportID/details/shareCode',
    getReportShareCodeRoute: (reportID) => `r/${reportID}/details/shareCode`,
    REPORT_ATTACHMENTS: 'r/:reportID/attachment',
    getReportAttachmentRoute: (reportID, source) => `r/${reportID}/attachment?source=${encodeURI(source)}`,

    /** This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated */
    CONCIERGE: 'concierge',

    IOU_REQUEST,
    IOU_BILL,
    IOU_SEND,

    // To see the available iouType, please refer to CONST.IOU.MONEY_REQUEST_TYPE
    MONEY_REQUEST: ':iouType/new/:reportID?',
    MONEY_REQUEST_AMOUNT: ':iouType/new/amount/:reportID?',
    MONEY_REQUEST_PARTICIPANTS: ':iouType/new/participants/:reportID?',
    MONEY_REQUEST_CONFIRMATION: ':iouType/new/confirmation/:reportID?',
    MONEY_REQUEST_DATE: ':iouType/new/date/:reportID?',
    MONEY_REQUEST_CURRENCY: ':iouType/new/currency/:reportID?',
    MONEY_REQUEST_DESCRIPTION: ':iouType/new/description/:reportID?',
    MONEY_REQUEST_CATEGORY: ':iouType/new/category/:reportID?',
    MONEY_REQUEST_MERCHANT: ':iouType/new/merchant/:reportID?',
    MONEY_REQUEST_MANUAL_TAB: ':iouType/new/:reportID?/manual',
    MONEY_REQUEST_SCAN_TAB: ':iouType/new/:reportID?/scan',
    MONEY_REQUEST_DISTANCE_TAB: ':iouType/new/:reportID?/distance',
    MONEY_REQUEST_WAYPOINT: ':iouType/new/waypoint/:waypointIndex',
    IOU_SEND_ADD_BANK_ACCOUNT: `${IOU_SEND}/add-bank-account`,
    IOU_SEND_ADD_DEBIT_CARD: `${IOU_SEND}/add-debit-card`,
    IOU_SEND_ENABLE_PAYMENTS: `${IOU_SEND}/enable-payments`,
    getMoneyRequestRoute: (iouType, reportID = '') => `${iouType}/new/${reportID}`,
    getMoneyRequestAmountRoute: (iouType, reportID = '') => `${iouType}/new/amount/${reportID}`,
    getMoneyRequestParticipantsRoute: (iouType, reportID = '') => `${iouType}/new/participants/${reportID}`,
    getMoneyRequestConfirmationRoute: (iouType, reportID = '') => `${iouType}/new/confirmation/${reportID}`,
    getMoneyRequestCreatedRoute: (iouType, reportID = '') => `${iouType}/new/date/${reportID}`,
    getMoneyRequestCurrencyRoute: (iouType, reportID = '', currency, backTo) => `${iouType}/new/currency/${reportID}?currency=${currency}&backTo=${backTo}`,
    getMoneyRequestDescriptionRoute: (iouType, reportID = '') => `${iouType}/new/description/${reportID}`,
    getMoneyRequestCategoryRoute: (iouType, reportID = '') => `${iouType}/new/category/${reportID}`,
    getMoneyRequestMerchantRoute: (iouType, reportID = '') => `${iouType}/new/merchant/${reportID}`,
    getMoneyRequestDistanceTabRoute: (iouType, reportID = '') => `${iouType}/new/${reportID}/distance`,
    getMoneyRequestWaypointRoute: (iouType, waypointIndex) => `${iouType}/new/waypoint/${waypointIndex}`,
    SPLIT_BILL_DETAILS: `r/:reportID/split/:reportActionID`,
    getSplitBillDetailsRoute: (reportID, reportActionID) => `r/${reportID}/split/${reportActionID}`,
    getNewTaskRoute: (reportID) => `${NEW_TASK}/${reportID}`,
    NEW_TASK_WITH_REPORT_ID: `${NEW_TASK}/:reportID?`,
    TASK_TITLE: 'r/:reportID/title',
    TASK_DESCRIPTION: 'r/:reportID/description',
    TASK_ASSIGNEE: 'r/:reportID/assignee',
    getTaskReportTitleRoute: (reportID) => `r/${reportID}/title`,
    getTaskReportDescriptionRoute: (reportID) => `r/${reportID}/description`,
    getTaskReportAssigneeRoute: (reportID) => `r/${reportID}/assignee`,
    NEW_TASK_ASSIGNEE: `${NEW_TASK}/assignee`,
    NEW_TASK_SHARE_DESTINATION: `${NEW_TASK}/share-destination`,
    NEW_TASK_DETAILS: `${NEW_TASK}/details`,
    NEW_TASK_TITLE: `${NEW_TASK}/title`,
    NEW_TASK_DESCRIPTION: `${NEW_TASK}/description`,
    FLAG_COMMENT: `flag/:reportID/:reportActionID`,
    getFlagCommentRoute: (reportID, reportActionID) => `flag/${reportID}/${reportActionID}`,
    SEARCH: 'search',
    DETAILS: 'details',
    getDetailsRoute: (login) => `details?login=${encodeURIComponent(login)}`,
    PROFILE: 'a/:accountID',
    getProfileRoute: (accountID, backTo = '') => {
        const backToParam = backTo ? `?backTo=${encodeURIComponent(backTo)}` : '';
        return `a/${accountID}${backToParam}`;
    },
    REPORT_PARTICIPANTS: 'r/:reportID/participants',
    getReportParticipantsRoute: (reportID) => `r/${reportID}/participants`,
    REPORT_WITH_ID_DETAILS: 'r/:reportID/details',
    getReportDetailsRoute: (reportID) => `r/${reportID}/details`,
    REPORT_SETTINGS: 'r/:reportID/settings',
    getReportSettingsRoute: (reportID) => `r/${reportID}/settings`,
    REPORT_SETTINGS_ROOM_NAME: 'r/:reportID/settings/room-name',
    getReportSettingsRoomNameRoute: (reportID) => `r/${reportID}/settings/room-name`,
    REPORT_SETTINGS_NOTIFICATION_PREFERENCES: 'r/:reportID/settings/notification-preferences',
    getReportSettingsNotificationPreferencesRoute: (reportID) => `r/${reportID}/settings/notification-preferences`,
    REPORT_WELCOME_MESSAGE: 'r/:reportID/welcomeMessage',
    getReportWelcomeMessageRoute: (reportID) => `r/${reportID}/welcomeMessage`,
    REPORT_SETTINGS_WRITE_CAPABILITY: 'r/:reportID/settings/who-can-post',
    getReportSettingsWriteCapabilityRoute: (reportID) => `r/${reportID}/settings/who-can-post`,
    TRANSITION_BETWEEN_APPS: 'transition',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    GET_ASSISTANCE: 'get-assistance/:taskID',
    getGetAssistanceRoute: (taskID) => `get-assistance/${taskID}`,
    UNLINK_LOGIN: 'u/:accountID/:validateCode',

    APPLE_SIGN_IN: 'sign-in-with-apple',
    GOOGLE_SIGN_IN: 'sign-in-with-google',
    DESKTOP_SIGN_IN_REDIRECT: 'desktop-signin-redirect',

    // This is a special validation URL that will take the user to /workspace/new after validation. This is used
    // when linking users from e.com in order to share a session in this app.
    ENABLE_PAYMENTS: 'enable-payments',
    WALLET_STATEMENT_WITH_DATE: 'statements/:yearMonth',
    getWalletStatementWithDateRoute: (yearMonth) => `statements/${yearMonth}`,
    WORKSPACE_NEW: 'workspace/new',
    WORKSPACE_INITIAL: 'workspace/:policyID',
    WORKSPACE_INVITE: 'workspace/:policyID/invite',
    WORKSPACE_INVITE_MESSAGE: 'workspace/:policyID/invite-message',
    WORKSPACE_SETTINGS: 'workspace/:policyID/settings',
    WORKSPACE_CARD: 'workspace/:policyID/card',
    WORKSPACE_REIMBURSE: 'workspace/:policyID/reimburse',
    WORKSPACE_RATE_AND_UNIT: 'workspace/:policyID/rateandunit',
    WORKSPACE_BILLS: 'workspace/:policyID/bills',
    WORKSPACE_INVOICES: 'workspace/:policyID/invoices',
    WORKSPACE_TRAVEL: 'workspace/:policyID/travel',
    WORKSPACE_MEMBERS: 'workspace/:policyID/members',
    WORKSPACE_NEW_ROOM: 'workspace/new-room',
    getWorkspaceInitialRoute: (policyID) => `workspace/${policyID}`,
    getWorkspaceInviteRoute: (policyID) => `workspace/${policyID}/invite`,
    getWorkspaceInviteMessageRoute: (policyID) => `workspace/${policyID}/invite-message`,
    getWorkspaceSettingsRoute: (policyID) => `workspace/${policyID}/settings`,
    getWorkspaceCardRoute: (policyID) => `workspace/${policyID}/card`,
    getWorkspaceReimburseRoute: (policyID) => `workspace/${policyID}/reimburse`,
    getWorkspaceRateAndUnitRoute: (policyID) => `workspace/${policyID}/rateandunit`,
    getWorkspaceBillsRoute: (policyID) => `workspace/${policyID}/bills`,
    getWorkspaceInvoicesRoute: (policyID) => `workspace/${policyID}/invoices`,
    getWorkspaceTravelRoute: (policyID) => `workspace/${policyID}/travel`,
    getWorkspaceMembersRoute: (policyID) => `workspace/${policyID}/members`,

    // These are some on-off routes that will be removed once they're no longer needed (see GH issues for details)
    SAASTR: 'saastr',
    SBE: 'sbe',

    /**
     * @param {String} route
     * @returns {Object}
     */
    parseReportRouteParams: (route) => {
        let parsingRoute = route;
        if (parsingRoute.at(0) === '/') {
            // remove the first slash
            parsingRoute = parsingRoute.slice(1);
        }

        if (!parsingRoute.startsWith(Url.addTrailingForwardSlash(REPORT))) {
            return {reportID: '', isSubReportPageRoute: false};
        }

        const pathSegments = parsingRoute.split('/');
        return {
            reportID: lodashGet(pathSegments, 1),
            isSubReportPageRoute: pathSegments.length > 2,
        };
    },
    SIGN_IN_MODAL: 'sign-in-modal',
};
