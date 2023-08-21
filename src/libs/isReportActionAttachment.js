import _ from 'underscore';
import lodashGet from 'lodash/get';
import isReportMessageAttachment from './isReportMessageAttachment';

/**
 * Check whether a report action is an attachment.
 *
 * @param {Object} reportAction report action
 * @returns {Boolean}
 */
export default function isReportActionAttachment(reportAction) {
    const message = _.first(lodashGet(reportAction, 'message', [{}]));
    return _.has(reportAction, 'isAttachment') ? reportAction.isAttachment : isReportMessageAttachment(message);
}
