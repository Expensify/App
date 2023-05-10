import lodashGet from 'lodash/get';
import * as Url from './libs/Url';

/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */

const REPORT = 'r';
const IOU_REQUEST = 'request/new';
const IOU_BILL = 'split/new';
const IOU_SEND = 'send/new';
const IOU_DETAILS = 'iou/details';
const IOU_REQUEST_CURRENCY = `${IOU_REQUEST}/currency`;
const IOU_BILL_CURRENCY = `${IOU_BILL}/currency`;
const IOU_SEND_CURRENCY = `${IOU_SEND}/currency`;
const NEW_TASK = 'new/task';
const SETTINGS_PERSONAL_DETAILS = 'settings/profile/personal-details';
const SETTINGS_CONTACT_METHODS = 'settings/profile/contact-methods';

export default {
    BANK_ACCOUNT: 'bank-account',
    BANK_ACCOUNT_WITH_STEP_TO_OPEN: 'bank-account/:stepToOpen?',
    BANK_ACCOUNT_PERSONAL: 'bank-account/personal',
    getBankAccountRoute: (stepToOpen = '', policyID = '') => `bank-account/${stepToOpen}?policyID=${policyID}`,
    HOME: '',
    SETTINGS: 'settings',
    SETTINGS_PROFILE: 'settings/profile',
    SETTINGS_DISPLAY_NAME: 'settings/profile/display-name',
    SETTINGS_TIMEZONE: 'settings/profile/timezone',
    SETTINGS_TIMEZONE_SELECT: 'settings/profile/timezone/select',
    SETTINGS_PRONOUNS: 'settings/profile/pronouns',
    SETTINGS_PREFERENCES: 'settings/preferences',
    SETTINGS_PRIORITY_MODE: 'settings/preferences/priority-mode',
    SETTINGS_LANGUAGE: 'settings/preferences/language',
    SETTINGS_WORKSPACES: 'settings/workspaces',
    SETTINGS_SECURITY: 'settings/security',
    SETTINGS_CLOSE: 'settings/security/closeAccount',
    SETTINGS_PASSWORD: 'settings/security/password',
    SETTINGS_ABOUT: 'settings/about',
    SETTINGS_APP_DOWNLOAD_LINKS: 'settings/about/app-download-links',
    SETTINGS_PAYMENTS: 'settings/payments',
    SETTINGS_ADD_PAYPAL_ME: 'settings/payments/add-paypal-me',
    SETTINGS_ADD_DEBIT_CARD: 'settings/payments/add-debit-card',
    SETTINGS_ADD_BANK_ACCOUNT: 'settings/payments/add-bank-account',
    SETTINGS_ENABLE_PAYMENTS: 'settings/payments/enable-payments',
    getSettingsAddLoginRoute: (type) => `settings/addlogin/${type}`,
    SETTINGS_PAYMENTS_TRANSFER_BALANCE: 'settings/payments/transfer-balance',
    SETTINGS_PAYMENTS_CHOOSE_TRANSFER_ACCOUNT: 'settings/payments/choose-transfer-account',
    SETTINGS_PERSONAL_DETAILS,
    SETTINGS_PERSONAL_DETAILS_LEGAL_NAME: `${SETTINGS_PERSONAL_DETAILS}/legal-name`,
    SETTINGS_PERSONAL_DETAILS_DATE_OF_BIRTH: `${SETTINGS_PERSONAL_DETAILS}/date-of-birth`,
    SETTINGS_PERSONAL_DETAILS_ADDRESS: `${SETTINGS_PERSONAL_DETAILS}/address`,
    SETTINGS_CONTACT_METHODS,
    SETTINGS_CONTACT_METHOD_DETAILS: `${SETTINGS_CONTACT_METHODS}/:contactMethod/details`,
    getEditContactMethodRoute: (contactMethod) => `${SETTINGS_CONTACT_METHODS}/${encodeURIComponent(contactMethod)}/details`,
    SETTINGS_NEW_CONTACT_METHOD: `${SETTINGS_CONTACT_METHODS}/new`,
    NEW_GROUP: 'new/group',
    NEW_CHAT: 'new/chat',
    NEW_TASK,
    REPORT,
    REPORT_WITH_ID: 'r/:reportID',
    getReportRoute: (reportID) => `r/${reportID}`,
    SELECT_YEAR: 'select-year',
    getYearSelectionRoute: (minYear, maxYear, currYear, backTo) => `select-year?min=${minYear}&max=${maxYear}&year=${currYear}&backTo=${backTo}`,

    /** This is a utility route used to go to the user's concierge chat, or the sign-in page if the user's not authenticated */
    CONCIERGE: 'concierge',

    IOU_REQUEST,
    IOU_BILL,
    IOU_SEND,
    IOU_REQUEST_WITH_REPORT_ID: `${IOU_REQUEST}/:reportID?`,
    IOU_BILL_WITH_REPORT_ID: `${IOU_BILL}/:reportID?`,
    IOU_SEND_WITH_REPORT_ID: `${IOU_SEND}/:reportID?`,
    getIouRequestRoute: (reportID) => `${IOU_REQUEST}/${reportID}`,
    getIouSplitRoute: (reportID) => `${IOU_BILL}/${reportID}`,
    getIOUSendRoute: (reportID) => `${IOU_SEND}/${reportID}`,
    IOU_BILL_CURRENCY: `${IOU_BILL_CURRENCY}/:reportID?`,
    IOU_REQUEST_CURRENCY: `${IOU_REQUEST_CURRENCY}/:reportID?`,
    MONEY_REQUEST_DESCRIPTION: `${IOU_REQUEST}/description`,
    IOU_SEND_CURRENCY: `${IOU_SEND_CURRENCY}/:reportID?`,
    IOU_SEND_ADD_BANK_ACCOUNT: `${IOU_SEND}/add-bank-account`,
    IOU_SEND_ADD_DEBIT_CARD: `${IOU_SEND}/add-debit-card`,
    IOU_SEND_ENABLE_PAYMENTS: `${IOU_SEND}/enable-payments`,
    getIouRequestCurrencyRoute: (reportID) => `${IOU_REQUEST_CURRENCY}/${reportID}`,
    getIouBillCurrencyRoute: (reportID) => `${IOU_BILL_CURRENCY}/${reportID}`,
    getIouSendCurrencyRoute: (reportID) => `${IOU_SEND_CURRENCY}/${reportID}`,
    IOU_DETAILS,
    IOU_DETAILS_ADD_BANK_ACCOUNT: `${IOU_DETAILS}/add-bank-account`,
    IOU_DETAILS_ADD_DEBIT_CARD: `${IOU_DETAILS}/add-debit-card`,
    IOU_DETAILS_ENABLE_PAYMENTS: `${IOU_DETAILS}/enable-payments`,
    IOU_DETAILS_WITH_IOU_REPORT_ID: `${IOU_DETAILS}/:chatReportID/:iouReportID/`,
    getIouDetailsRoute: (chatReportID, iouReportID) => `iou/details/${chatReportID}/${iouReportID}`,
    getNewTaskRoute: (reportID) => `${NEW_TASK}/${reportID}`,
    NEW_TASK_WITH_REPORT_ID: `${NEW_TASK}/:reportID?`,
    TASK_TITLE: 'r/:reportID/title',
    TASK_DESCRIPTION: 'r/:reportID/description',
    getTaskReportTitleRoute: (reportID) => `r/${reportID}/title`,
    getTaskReportDescriptionRoute: (reportID) => `r/${reportID}/description`,
    NEW_TASK_ASSIGNEE: `${NEW_TASK}/assignee`,
    NEW_TASK_SHARE_DESTINATION: `${NEW_TASK}/share-destination`,
    NEW_TASK_DETAILS: `${NEW_TASK}/details`,
    NEW_TASK_TITLE: `${NEW_TASK}/title`,
    NEW_TASK_DESCRIPTION: `${NEW_TASK}/description`,
    getTaskDetailsRoute: (taskID) => `task/details/${taskID}`,
    SEARCH: 'search',
    SET_PASSWORD_WITH_VALIDATE_CODE: 'setpassword/:accountID/:validateCode',
    DETAILS: 'details',
    getDetailsRoute: (login) => `details?login=${encodeURIComponent(login)}`,
    REPORT_PARTICIPANTS: 'r/:reportID/participants',
    getReportParticipantsRoute: (reportID) => `r/${reportID}/participants`,
    REPORT_PARTICIPANT: 'r/:reportID/participants/details',
    getReportParticipantRoute: (reportID, login) => `r/${reportID}/participants/details?login=${encodeURIComponent(login)}`,
    REPORT_WITH_ID_DETAILS: 'r/:reportID/details',
    getReportDetailsRoute: (reportID) => `r/${reportID}/details`,
    REPORT_SETTINGS: 'r/:reportID/settings',
    getReportSettingsRoute: (reportID) => `r/${reportID}/settings`,
    TRANSITION_FROM_OLD_DOT: 'transition',
    VALIDATE_LOGIN: 'v/:accountID/:validateCode',
    GET_ASSISTANCE: 'get-assistance/:taskID',
    getGetAssistanceRoute: (taskID) => `get-assistance/${taskID}`,
    UNLINK_LOGIN: 'u/:accountID/:validateCode',

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
    getWorkspaceBillsRoute: (policyID) => `workspace/${policyID}/bills`,
    getWorkspaceInvoicesRoute: (policyID) => `workspace/${policyID}/invoices`,
    getWorkspaceTravelRoute: (policyID) => `workspace/${policyID}/travel`,
    getWorkspaceMembersRoute: (policyID) => `workspace/${policyID}/members`,

    /**
     * @param {String} route
     * @returns {Object}
     */
    parseReportRouteParams: (route) => {
        if (!route.startsWith(Url.addTrailingForwardSlash(REPORT))) {
            return {reportID: '', isSubReportPageRoute: false};
        }

        const pathSegments = route.split('/');
        return {
            reportID: lodashGet(pathSegments, 1),
            isSubReportPageRoute: Boolean(lodashGet(pathSegments, 2)),
        };
    },
};
