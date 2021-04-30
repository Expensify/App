import _ from 'underscore';
import Str from 'expensify-common/lib/str';

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
 * @param {Record<String, {lastVisitedTimestamp}>|Array<{lastVisitedTimestamp}>} reports
 * @returns {Object}
 */
function getLastAccessedReport(reports) {
    return _.chain(reports)
        .toArray()
        .sortBy('lastVisitedTimestamp')
        .last()
        .value();
}

export {
    getReportParticipantsTitle,
    isReportMessageAttachment,
    getLastAccessedReport,
};
