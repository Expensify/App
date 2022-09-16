import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import lodashMerge from 'lodash/merge';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import ONYXKEYS from '../../ONYXKEYS';
import * as CollectionUtils from '../CollectionUtils';
import CONST from '../../CONST';
import * as ReportUtils from '../ReportUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';

/**
 * Map of the most recent non-loading sequenceNumber for a reportActions_* key in Onyx by reportID.
 *
 * What's the difference between reportMaxSequenceNumbers and reportActionsMaxSequenceNumbers?
 *
 * Knowing the maxSequenceNumber for a report does not necessarily mean we have stored the report actions for that
 * report. To understand and optimize which reportActions we need to fetch we also keep track of the max sequenceNumber
 * for the stored reportActions in reportActionsMaxSequenceNumbers. This allows us to initially download all
 * reportActions when the app starts up and then only download the actions that we need when the app reconnects.
 *
 * This information should only be used in the correct contexts. In most cases, reportMaxSequenceNumbers should be
 * referenced and not the locally stored reportAction's max sequenceNumber.
 */
const reportActionsMaxSequenceNumbers = {};
const reportActions = {};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }

        const reportID = CollectionUtils.extractCollectionItemID(key);
        const actionsArray = _.toArray(actions);
        reportActions[reportID] = actionsArray;
        const mostRecentNonLoadingActionIndex = _.findLastIndex(actionsArray, action => !action.isLoading);
        const mostRecentAction = actionsArray[mostRecentNonLoadingActionIndex];
        if (!mostRecentAction || _.isUndefined(mostRecentAction.sequenceNumber)) {
            return;
        }

        reportActionsMaxSequenceNumbers[reportID] = mostRecentAction.sequenceNumber;
    },
});

/**
 * Get the count of deleted messages after a sequence number of a report
 * @param {Number|String} reportID
 * @param {Number} sequenceNumber
 * @return {Number}
 */
function getDeletedCommentsCount(reportID, sequenceNumber) {
    if (!reportActions[reportID]) {
        return 0;
    }

    return _.reduce(reportActions[reportID], (numDeletedMessages, action) => {
        if (action.actionName !== CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT || action.sequenceNumber <= sequenceNumber) {
            return numDeletedMessages;
        }

        // Empty ADDCOMMENT actions typically mean they have been deleted
        const message = _.first(lodashGet(action, 'message', null));
        const html = lodashGet(message, 'html', '');
        return _.isEmpty(html) ? numDeletedMessages + 1 : numDeletedMessages;
    }, 0);
}

/**
 * Get the message text for the last action that was not deleted
 * @param {Number} reportID
 * @param {Object} [actionsToMerge]
 * @return {String}
 */
function getLastVisibleMessageText(reportID, actionsToMerge = {}) {
    const parser = new ExpensiMark();
    const existingReportActions = _.indexBy(reportActions[reportID], 'sequenceNumber');
    const actions = _.toArray(lodashMerge({}, existingReportActions, actionsToMerge));
    const lastMessageIndex = _.findLastIndex(actions, action => (
        !ReportActionsUtils.isDeletedAction(action)
    ));
    const htmlText = lodashGet(actions, [lastMessageIndex, 'message', 0, 'html'], '');
    const messageText = parser.htmlToText(htmlText);
    return ReportUtils.formatReportLastMessageText(messageText);
}

/**
 * @param {Number} reportID
 * @param {Number} sequenceNumber
 * @param {Number} currentUserAccountID
 * @param {Object} [actionsToMerge]
 * @returns {Boolean}
 */
function isFromCurrentUser(reportID, sequenceNumber, currentUserAccountID, actionsToMerge = {}) {
    const existingReportActions = _.indexBy(reportActions[reportID], 'sequenceNumber');
    const action = lodashMerge({}, existingReportActions, actionsToMerge)[sequenceNumber];
    return action.actorAccountID === currentUserAccountID;
}

/**
 * @param {Number} reportID
 * @param {String} sequenceNumber
 */
function deleteOptimisticReportAction(reportID, sequenceNumber) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [sequenceNumber]: null,
    });
}

/**
 * @param {Number} reportID
 * @param {String} sequenceNumber
 */
function clearReportActionErrors(reportID, sequenceNumber) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [sequenceNumber]: {
            errors: null,
        },
    });
}

export {
    getDeletedCommentsCount,
    getLastVisibleMessageText,
    clearReportActionErrors,
    isFromCurrentUser,
    deleteOptimisticReportAction,
};
