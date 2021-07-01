import lodashGet from 'lodash/get';
import {addTrailingForwardSlash} from './libs/Url';

/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */

const REPORT = 'r';

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
    SETTINGS_ADD_LOGIN: 'settings/addlogin/:type',
    getSettingsAddLoginRoute: type => `settings/addlogin/${type}`,
    NEW_GROUP: 'new/group',
    NEW_CHAT: 'new/chat',
    REPORT,
    REPORT_WITH_ID: 'r/:reportID',
    getReportRoute: reportID => `r/${reportID}`,
    IOU_BILL_CURRENCY: 'iou/split/:reportID/currency',
    IOU_REQUEST_CURRENCY: 'iou/request/:reportID/currency',
    getIouRequestCurrencyRoute: reportID => `iou/request/${reportID}/currency`,
    getIouBillCurrencyRoute: reportID => `iou/split/${reportID}/currency`,
    IOU_REQUEST: 'iou/request/:reportID',
    IOU_BILL: 'iou/split/:reportID',
    getIouRequestRoute: reportID => `iou/request/${reportID}`,
    getIouSplitRoute: reportID => `iou/split/${reportID}`,
    IOU_SEND: 'iou/send/:reportID',
    getIOUSendRoute: reportID => `/iou/send/${reportID}`,
    IOU_SEND_CURRENCY: 'iou/send/:reportID/currency',
    getIouSendCurrencyRoute: reportID => `iou/send/${reportID}/currency`,
    IOU_DETAILS: 'iou/details',
    IOU_DETAILS_WITH_IOU_REPORT_ID: 'iou/details/:chatReportID/:iouReportID/',
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
