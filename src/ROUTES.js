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
const IOU_REQUEST_CURRENCY = `${IOU_REQUEST}/:reportID/currency`;
const IOU_BILL_CURRENCY = `${IOU_BILL}/:reportID/currency`;
const IOU_SEND_CURRENCY = `${IOU_SEND}/:reportID/currency`;

export default {
    BANK_ACCOUNT: 'bank-account/:stepToOpen?',
    BANK_ACCOUNT_PERSONAL: 'bank-account/personal',
    getBankAccountRoute: stepToOpen => `bank-account/${stepToOpen}`,
    HOME: '',
    SETTINGS: 'settings',
    SETTINGS_PROFILE: 'settings/profile',
    SETTINGS_PREFERENCES: 'settings/preferences',
    SETTINGS_PASSWORD: 'settings/password',
    SETTINGS_ABOUT: 'settings/about',
    SETTINGS_APP_DOWNLOAD_LINKS: 'settings/about/app-download-links',
    SETTINGS_PAYMENTS: 'settings/payments',
    SETTINGS_ADD_PAYPAL_ME: 'settings/payments/add-paypal-me',
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
    getIouRequestRoute: reportID => (reportID ? `${IOU_REQUEST}/${reportID}` : IOU_REQUEST),
    getIouSplitRoute: reportID => (reportID ? `${IOU_BILL}/${reportID}` : IOU_BILL),
    getIOUSendRoute: reportID => (reportID ? `${IOU_SEND}/${reportID}` : IOU_SEND),
    IOU_BILL_CURRENCY,
    IOU_REQUEST_CURRENCY,
    IOU_SEND_CURRENCY,
    getIouRequestCurrencyRoute: reportID => (reportID ? `${IOU_REQUEST}/${reportID}/currency` : IOU_REQUEST_CURRENCY),
    getIouBillCurrencyRoute: reportID => (reportID ? `${IOU_BILL}/${reportID}/currency` : IOU_BILL_CURRENCY),
    getIouSendCurrencyRoute: reportID => (reportID ? `${IOU_SEND}/${reportID}/currency` : IOU_SEND_CURRENCY),
    IOU_DETAILS,
    IOU_DETAILS_WITH_IOU_REPORT_ID: `${IOU_DETAILS}/:chatReportID/:iouReportID/`,
    getIouDetailsRoute: (chatReportID, iouReportID) => `iou/details/${chatReportID}/${iouReportID}`,
    SEARCH: 'search',
    SET_PASSWORD_WITH_VALIDATE_CODE: 'setpassword/:accountID/:validateCode',
    DETAILS: 'details',
    DETAILS_WITH_LOGIN: 'details/:login',
    getDetailsRoute: login => `details/${login}`,
    REPORT_PARTICIPANTS: 'r/:reportID/participants',
    getReportParticipantsRoute: reportID => `r/${reportID}/participants`,
    REPORT_PARTICIPANT: 'r/:reportID/participants/:login',
    getReportParticipantRoute: (reportID, login) => `r/${reportID}/participants/${login}`,
    REPORT_WITH_ID_DETAILS: 'r/:reportID/details',
    getReportDetailsRoute: reportID => `r/${reportID}/details`,
    VALIDATE_LOGIN: 'v',
    VALIDATE_LOGIN_WITH_VALIDATE_CODE: 'v/:accountID/:validateCode',

    // This is a special validation URL that will take the user to /workspace/new after validation. This is used
    // when linking users from e.com in order to share a session in this app.
    VALIDATE_LOGIN_WITH_VALIDATE_CODE_NEW_WORKSPACE: 'v/:accountID/:validateCode/new-workspace',
    VALIDATE_LOGIN_WITH_VALIDATE_CODE_2FA_NEW_WORKSPACE: 'v/:accountID/:validateCode/2fa/new-workspace',
    ENABLE_PAYMENTS: 'enable-payments',
    WORKSPACE_NEW: 'workspace/new',
    WORKSPACE: 'workspace',
    WORKSPACE_CARD: ':policyID/card',
    WORKSPACE_PEOPLE: ':policyID/people',
    getWorkspaceCardRoute: policyID => `workspace/${policyID}/card`,
    getWorkspacePeopleRoute: policyID => `workspace/${policyID}/people`,
    getWorkspaceInviteRoute: policyID => `workspace/${policyID}/invite`,
    WORKSPACE_INVITE: 'workspace/:policyID/invite',
    REQUEST_CALL: 'request-call',

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
