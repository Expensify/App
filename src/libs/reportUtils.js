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
 * @param {Object} reportAction action from a Report
 * @returns {Boolean}
 */
function isReportActionAttachment(reportAction) {
    if (_.has(reportAction, 'isAttachment')) {
        return reportAction.isAttachment;
    }
    const lastMessage = _.last(lodashGet(reportAction, 'message', null));
    return lodashGet(lastMessage, 'text', '') === '[Attachment]';
}

export {
    getReportParticipantsTitle,
    isReportActionAttachment,
};
