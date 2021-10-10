import lodashGet from 'lodash/get';
import {addTrailingForwardSlash} from './libs/Url';

/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */

const REPORT = 'r';
const IOU_REQUEST = 'iou/request';
const IOU_BILL = 'iou/split';
const IOU_SEND = 'iou/send';
const IOU_DETAILS = 'iou/details';
const IOU_REQUEST_CURRENCY = `${IOU_REQUEST}/currency`;
const IOU_BILL_CURRENCY = `${IOU_BILL}/currency`;
const IOU_SEND_CURRENCY = `${IOU_SEND}/currency`;

export default {
    BANK_ACCOUNT: 'bank-account/:stepToOpen?',
    BANK_ACCOUNT_PERSONAL: 'bank-account/personal',
    getBankAccountRoute: (stepToOpen = '') => `bank-account/${stepToOpen}`,
    HOME: '',
    SETTINGS: 'settings',
    SETTINGS_PROFILE: 'settings/profile',
    SETTINGS_PREFERENCES: 'settings/preferences',
    SETTINGS_PASSWORD: 'settings/password',
    SETTINGS_ABOUT: 'settings/about',
    SETTINGS_APP_DOWNLOAD_LINKS: 'settings/about/app-download-links',
    SETTINGS_PAYMENTS: 'settings/payments',
    SETTINGS_ADD_PAYPAL_ME: 'settings/payments/add-paypal-me',
    SETTINGS_ADD_DEBIT_CARD: 'settings/payments/add-debit-card',
    SETTINGS_ADD_LOGIN: 'settings/addlogin/:type',
    getSettingsAddLoginRoute: type => `settings/addlogin/${type}`,
    NEW_GROUP: 'new/group',
    NEW_CHAT: 'new/chat',
    REPORT,
    REPORT_WITH_ID: 'r/:reportID',
    getReportRoute: reportID => `r/${reportID}`,
    IOU_REQUEST,
    IOU_BILL,
    IOU_SEND,
    IOU_REQUEST_WITH_REPORT_ID: `${IOU_REQUEST}/:reportID?`,
    IOU_BILL_WITH_REPORT_ID: `${IOU_BILL}/:reportID?`,
    IOU_SEND_WITH_REPORT_ID: `${IOU_SEND}/:reportID?`,
    getIouRequestRoute: reportID => `${IOU_REQUEST}/${reportID}`,
    getIouSplitRoute: reportID => `${IOU_BILL}/${reportID}`,
    getIOUSendRoute: reportID => `${IOU_SEND}/${reportID}`,
    IOU_BILL_CURRENCY: `${IOU_BILL_CURRENCY}/:reportID?`,
    IOU_REQUEST_CURRENCY: `${IOU_REQUEST_CURRENCY}/:reportID?`,
    IOU_SEND_CURRENCY: `${IOU_SEND_CURRENCY}/:reportID?`,
    getIouRequestCurrencyRoute: reportID => `${IOU_REQUEST_CURRENCY}/${reportID}`,
    getIouBillCurrencyRoute: reportID => `${IOU_BILL_CURRENCY}/${reportID}`,
    getIouSendCurrencyRoute: reportID => `${IOU_SEND_CURRENCY}/${reportID}`,
    IOU_DETAILS,
    IOU_DETAILS_WITH_IOU_REPORT_ID: `${IOU_DETAILS}/:chatReportID/:iouReportID/`,
    getIouDetailsRoute: (chatReportID, iouReportID) => `iou/details/${chatReportID}/${iouReportID}`,
    SEARCH: 'search',
    SET_PASSWORD_WITH_VALIDATE_CODE: 'setpassword/:accountID/:validateCode',
    DETAILS: 'details',
    getDetailsRoute: login => `details?login=${encodeURIComponent(login)}`,
    REPORT_PARTICIPANTS: 'r/:reportID/participants',
    getReportParticipantsRoute: reportID => `r/${reportID}/participants`,
    REPORT_PARTICIPANT: 'r/:reportID/participants/details',
    getReportParticipantRoute: (
        reportID,
        login,
    ) => `r/${reportID}/participants/details?login=${encodeURIComponent(login)}`,
    REPORT_WITH_ID_DETAILS: 'r/:reportID/details',
    getReportDetailsRoute: reportID => `r/${reportID}/details`,
    VALIDATE_LOGIN: 'v',
    VALIDATE_LOGIN_WITH_VALIDATE_CODE: 'v/:accountID/:validateCode',
    LOGIN_WITH_SHORT_LIVED_TOKEN: 'transition',

    // This is a special validation URL that will take the user to /workspace/new after validation. This is used
    // when linking users from e.com in order to share a session in this app.
    LOGIN_WITH_VALIDATE_CODE_NEW_WORKSPACE: 'v/:accountID/:validateCode/new-workspace',
    LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE: 'v/:accountID/:validateCode/2fa/new-workspace',
    LOGIN_WITH_VALIDATE_CODE_WORKSPACE_CARD: 'v/:accountID/:validateCode/workspace/:policyID/card',
    LOGIN_WITH_VALIDATE_CODE_2FA_WORKSPACE_CARD: 'v/:accountID/:validateCode/2fa/workspace/:policyID/card',
    ENABLE_PAYMENTS: 'enable-payments',
    WORKSPACE_NEW: 'workspace/new',
    WORKSPACE_INITIAL: 'workspace/:policyID',
    WORKSPACE_INVITE: 'workspace/:policyID/invite',
    WORKSPACE_SETTINGS: 'workspace/:policyID/settings',
    WORKSPACE_CARD: 'workspace/:policyID/card',
    WORKSPACE_REIMBURSE: 'workspace/:policyID/reimburse',
    WORKSPACE_BILLS: 'workspace/:policyID/bills',
    WORKSPACE_INVOICES: 'workspace/:policyID/invoices',
    WORKSPACE_TRAVEL: 'workspace/:policyID/travel',
    WORKSPACE_MEMBERS: 'workspace/:policyID/members',
    WORKSPACE_BANK_ACCOUNT: 'workspace/:policyID/bank-account',
    getWorkspaceInitialRoute: policyID => `workspace/${policyID}`,
    getWorkspaceInviteRoute: policyID => `workspace/${policyID}/invite`,
    getWorkspaceSettingsRoute: policyID => `workspace/${policyID}/settings`,
    getWorkspaceCardRoute: policyID => `workspace/${policyID}/card`,
    getWorkspaceReimburseRoute: policyID => `workspace/${policyID}/reimburse`,
    getWorkspaceBillsRoute: policyID => `workspace/${policyID}/bills`,
    getWorkspaceInvoicesRoute: policyID => `workspace/${policyID}/invoices`,
    getWorkspaceTravelRoute: policyID => `workspace/${policyID}/travel`,
    getWorkspaceMembersRoute: policyID => `workspace/${policyID}/members`,
    getWorkspaceBankAccountRoute: policyID => `workspace/${policyID}/bank-account`,
    getRequestCallRoute: taskID => `request-call/${taskID}`,
    REQUEST_CALL: 'request-call/:taskID',

    /**
     * @param {String} route
     * @returns {Object}
     */
    parseReportRouteParams: (route) => {
        if (!route.startsWith(addTrailingForwardSlash(REPORT))) {
            return {};
        }

        const pathSegments = route.split('/');
        return {
            reportID: lodashGet(pathSegments, 1),
            isParticipantsRoute: Boolean(lodashGet(pathSegments, 2)),
        };
    },
};
