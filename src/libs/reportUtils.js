import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';

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
 * Given a collection of reports returns the most recently accessed one
 *
 * @param {Record<String, {lastVisitedTimestamp, reportID}>|Array<{lastVisitedTimestamp, reportID}>} reports
 * @returns {Object}
 */
function findLastAccessedReport(reports) {
    return _.chain(reports)
        .toArray()
        .filter(report => report && report.reportID)
        .sortBy('lastVisitedTimestamp')
        .last()
        .value();
}

function canEditReportAction(reportAction, sessionEmail) {
    return reportAction.actorEmail === sessionEmail
        && reportAction.reportActionID
        && reportAction.actionName !== 'IOU'
        && !isReportMessageAttachment(lodashGet(reportAction, ['message', 0, 'text'], ''));
}

export {
    getReportParticipantsTitle,
    isReportMessageAttachment,
    findLastAccessedReport,
    canEditReportAction,
};
