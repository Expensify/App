import lodashGet from 'lodash/get';
import {addTrailingForwardSlash} from './libs/Url';

/**
 * This is a file containing constants for all of the routes we want to be able to go to
 */

const REPORT = 'r';

export default {
    HOME: '',
    SETTINGS: 'settings',
    SETTINGS_PROFILE: 'settings/profile',
    SETTINGS_PREFERENCES: 'settings/preferences',
    SETTINGS_PASSWORD: 'settings/password',
    SETTINGS_PAYMENTS: 'settings/payments',
    SETTINGS_ADD_LOGIN: 'settings/addlogin/:type',
    getSettingsAddLoginRoute: type => `settings/addlogin/${type}`,
    NEW_GROUP: 'new/group',
    NEW_CHAT: 'new/chat',
    REPORT,
    REPORT_WITH_ID: 'r/:reportID',
    getReportRoute: reportID => `r/${reportID}`,
    IOU_REQUEST: 'iou/request/:reportID',
    getIouRequestRoute: reportID => `iou/request/${reportID}`,
    IOU_BILL: 'iou/split/:reportID',
    getIouSplitRoute: reportID => `iou/split/${reportID}`,
    SEARCH: 'search',
    SIGNIN: 'signin',
    SET_PASSWORD_WITH_VALIDATE_CODE: 'setpassword/:accountID/:validateCode',
    DETAILS: 'details',
    DETAILS_WITH_LOGIN: 'details/:login',
    getDetailsRoute: login => `details/${login}`,
    REPORT_PARTICIPANTS: 'r/:reportID/participants',
    getReportParticipantsRoute: reportID => `r/${reportID}/participants`,
    REPORT_PARTICIPANT: 'r/:reportID/participants/:login',
    getReportParticipantRoute: (reportID, login) => `r/${reportID}/participants/${login}`,
    VALIDATE_LOGIN: 'v',
    VALIDATE_LOGIN_WITH_VALIDATE_CODE: 'v/:accountID/:validateCode',

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
