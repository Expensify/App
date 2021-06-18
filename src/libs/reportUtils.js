import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';

let sessionEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => sessionEmail = val ? val.email : null,
});

/**
 * Returns the concatenated title for the PrimaryLogins of a report
 *
 * @param {Array} logins
 * @returns {string}
 */
function getReportParticipantsTitle(logins) {
    return _.map(logins, login => Str.removeSMSDomain(login)).join(', ');
}

/**
 * Check whether a report action is Attachment is not.
 *
 * @param {Object} reportMessageText report action's message as text
 * @returns {Boolean}
 */
function isReportMessageAttachment(reportMessageText) {
    return reportMessageText === '[Attachment]';
}

/**
 * Given a collection of reports returns them sorted by last visited
 *
 * @param {Object} reports
 * @returns {Array}
 */
function sortReportsByLastVisited(reports) {
    return _.chain(reports)
        .toArray()
        .filter(report => report && report.reportID)
        .sortBy('lastVisitedTimestamp')
        .value();
}

/**
 * Can only edit if it's a ADDCOMMENT, the author is this user and it's not a optimistic response.
 * If it's an optimistic response comment it will not have a reportActionID,
 * and we should wait until it does before we show the actions
 *
 * @param {Object} reportAction
 * @param {String} sessionEmail
 * @returns {Boolean}
 */
function canEditReportAction(reportAction) {
    return reportAction.actorEmail === sessionEmail
        && reportAction.reportActionID
        && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT
        && !isReportMessageAttachment(lodashGet(reportAction, ['message', 0, 'text'], ''));
}

/**
 * Given a collection of reports returns the most recently accessed one
 *
 * @param {Record<String, {lastVisitedTimestamp, reportID}>|Array<{lastVisitedTimestamp, reportID}>} reports
 * @returns {Object}
 */
function findLastAccessedReport(reports) {
    return _.last(sortReportsByLastVisited(reports));
}

/**
 * Whether the provided chatType corresponds to a default room
 * @param {String} chatType
 * @returns {Boolean}
 */
function isDefaultRoom(chatType) {
    return _.contains([
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
    ], chatType);
}

export {
    getReportParticipantsTitle,
    isReportMessageAttachment,
    findLastAccessedReport,
    canEditReportAction,
    sortReportsByLastVisited,
    isDefaultRoom,
};
