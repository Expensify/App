import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import moment from 'moment';
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
 * Can only edit if it's an ADDCOMMENT that is not an attachment,
 * the author is this user and it's not an optimistic response.
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
 * Can only delete if it's an ADDCOMMENT, the author is this user and it's not an optimistic response.
 * If it's an optimistic response comment it will not have a reportActionID,
 * and we should wait until it does before we show the actions
 *
 * @param {Object} reportAction
 * @param {String} sessionEmail
 * @returns {Boolean}
 */
function canDeleteReportAction(reportAction) {
    return reportAction.actorEmail === sessionEmail
        && reportAction.reportActionID
        && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT;
}

/**
 * Whether the provided report is a default room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isDefaultRoom(report) {
    return _.contains([
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
    ], lodashGet(report, ['chatType'], ''));
}

/**
 * Whether the provided report is a user created policy room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isUserCreatedPolicyRoom(report) {
    return lodashGet(report, ['chatType'], '') === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
}

/**
 * Whether the provided report is a chat room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isChatRoom(report) {
    return isUserCreatedPolicyRoom(report) || isDefaultRoom(report);
}

/**
 * Given a collection of reports returns the most recently accessed one
 *
 * @param {Record<String, {lastVisitedTimestamp, reportID}>|Array<{lastVisitedTimestamp, reportID}>} reports
 * @param {Boolean} [ignoreDefaultRooms]
 * @returns {Object}
 */
function findLastAccessedReport(reports, ignoreDefaultRooms) {
    let sortedReports = sortReportsByLastVisited(reports);

    if (ignoreDefaultRooms) {
        sortedReports = _.filter(sortedReports, report => !isDefaultRoom(report));
    }

    return _.last(sortedReports);
}

/**
 * Whether the provided report is an archived room
 * @param {Object} report
 * @param {Number} report.stateNum
 * @param {Number} report.statusNum
 * @returns {Boolean}
 */
function isArchivedRoom(report) {
    if (!isDefaultRoom(report)) {
        return false;
    }

    return report.statusNum === 2 && report.stateNum === 2;
}

/**
 * Get either the policyName or domainName the chat is tied to
 * @param {Object} report
 * @param {Object} policiesMap must have onyxkey prefix (i.e 'policy_') for keys
 * @returns {String}
 */
function getChatRoomSubtitle(report, policiesMap) {
    if (!isDefaultRoom(report) && !isUserCreatedPolicyRoom(report)) {
        return '';
    }
    if (report.chatType === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL) {
        // The domainAll rooms are just #domainName, so we ignore the prefix '#' to get the domainName
        return report.reportName.substring(1);
    }
    if (isArchivedRoom(report)) {
        return report.oldPolicyName;
    }
    return lodashGet(
        policiesMap,
        [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'name'],
        'Unknown Policy',
    );
}

/**
 * Only returns true if this is our main 1:1 DM report with Concierge
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isConciergeChatReport(report) {
    return lodashGet(report, 'participants', []).length === 1
        && report.participants[0] === CONST.EMAIL.CONCIERGE;
}

/**
 *
 * @param {*} report
 * @returns {Boolean}
 */
function chatIncludesConcierge(report) {
    return report.participants
            && _.contains(report.participants, CONST.EMAIL.CONCIERGE);
}

/**
 * Returns true if there is any automated expensify account in emails
 * @param {Array} emails
 * @returns {Boolean}
 */
function hasExpensifyEmails(emails) {
    return _.intersection(emails, CONST.EXPENSIFY_EMAILS).length > 0;
}

/**
 * Whether the time row should be shown for a report.
 * @param {Array<Object>} personalDetails
 * @param {Object} myPersonalDetails
 * @param {Object} report
 * @return {Boolean}
 */
function canShowReportRecipientLocalTime(personalDetails, myPersonalDetails, report) {
    const reportParticipants = lodashGet(report, 'participants', []);
    const hasMultipleParticipants = reportParticipants.length > 1;
    const reportRecipient = personalDetails[reportParticipants[0]];
    const currentUserTimezone = lodashGet(myPersonalDetails, 'timezone', CONST.DEFAULT_TIME_ZONE);
    const reportRecipientTimezone = lodashGet(reportRecipient, 'timezone', CONST.DEFAULT_TIME_ZONE);
    return !hasExpensifyEmails(reportParticipants)
        && !hasMultipleParticipants
        && reportRecipient
        && reportRecipientTimezone
        && currentUserTimezone.selected
        && reportRecipientTimezone.selected
        && moment().tz(currentUserTimezone.selected).utcOffset() !== moment().tz(reportRecipientTimezone.selected).utcOffset();
}

/**
 * Check if the comment is deleted
 * @param {Object} action
 * @returns {Boolean}
 */
function isDeletedAction(action) {
    // A deleted comment has either an empty array or an object with html field with empty string as value
    return action.message.length === 0 || action.message[0].html === '';
}

/**
 * Trim the last message text to a fixed limit.
 * @param {String} lastMessageText
 * @returns {String}
 */
function formatReportLastMessageText(lastMessageText) {
    return String(lastMessageText).substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH);
}

export {
    getReportParticipantsTitle,
    isDeletedAction,
    isReportMessageAttachment,
    findLastAccessedReport,
    canEditReportAction,
    canDeleteReportAction,
    sortReportsByLastVisited,
    isDefaultRoom,
    isUserCreatedPolicyRoom,
    isChatRoom,
    getChatRoomSubtitle,
    isArchivedRoom,
    isConciergeChatReport,
    hasExpensifyEmails,
    canShowReportRecipientLocalTime,
    formatReportLastMessageText,
    chatIncludesConcierge,
};
