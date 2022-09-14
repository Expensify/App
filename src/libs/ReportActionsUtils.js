import lodashGet from 'lodash/get';
import _ from 'underscore';
import lodashMerge from 'lodash/merge';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import * as CollectionUtils from './CollectionUtils';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import * as ReportUtils from './ReportUtils';

const allReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }

        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReportActions[reportID] = actions;
    },
});

/**
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isDeletedAction(reportAction) {
    // A deleted comment has either an empty array or an object with html field with empty string as value
    const message = lodashGet(reportAction, 'message', []);
    return message.length === 0 || lodashGet(message, [0, 'html']) === '';
}

/**
 * Sorts the report actions by sequence number, filters out any that should not be shown and formats them for display.
 *
 * @param {Array} reportActions
 * @returns {Array}
 */
function getSortedReportActions(reportActions) {
    return _.chain(reportActions)
        .sortBy('sequenceNumber')
        .filter(action => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU

            // All comment actions are shown unless they are deleted and non-pending
            || (action.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && (!isDeletedAction(action) || !_.isEmpty(action.pendingAction)))
            || action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED
            || action.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED)
        .map((item, index) => ({action: item, index}))
        .value()
        .reverse();
}

/**
 * Finds most recent IOU report action number.
 *
 * @param {Array} reportActions
 * @returns {Number}
 */
function getMostRecentIOUReportSequenceNumber(reportActions) {
    return _.chain(reportActions)
        .sortBy('sequenceNumber')
        .filter(action => action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU)
        .max(action => action.sequenceNumber)
        .value().sequenceNumber;
}

/**
 * Returns true when the report action immediately before the specified index is a comment made by the same actor who who is leaving a comment in the action at the specified index.
 * Also checks to ensure that the comment is not too old to be shown as a grouped comment.
 *
 * @param {Array} reportActions
 * @param {Number} actionIndex - index of the comment item in state to check
 * @returns {Boolean}
 */
function isConsecutiveActionMadeByPreviousActor(reportActions, actionIndex) {
    const previousAction = reportActions[actionIndex + 1];
    const currentAction = reportActions[actionIndex];

    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !previousAction) {
        return false;
    }

    // Comments are only grouped if they happen within 5 minutes of each other
    if (currentAction.action.timestamp - previousAction.action.timestamp > 300) {
        return false;
    }

    // Do not group if previous or current action was a renamed action
    if (previousAction.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED
        || currentAction.action.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
        return false;
    }

    return currentAction.action.actorEmail === previousAction.action.actorEmail;
}

/**
 * Get the message text for the last action that was not deleted
 * @param {Number} reportID
 * @param {Object} [actionsToMerge]
 * @return {String}
 */
function getLastVisibleMessageText(reportID, actionsToMerge = {}) {
    const parser = new ExpensiMark();
    const actions = _.toArray(lodashMerge({}, allReportActions[reportID], actionsToMerge));
    const sortedActions = _.sortBy(actions, 'sequenceNumber');
    const lastMessageIndex = _.findLastIndex(sortedActions, action => (
        !isDeletedAction(action)
    ));
    if (lastMessageIndex < 0) {
        return '';
    }

    const htmlText = lodashGet(sortedActions, [lastMessageIndex, 'message', 0, 'html'], '');
    const messageText = parser.htmlToText(htmlText);
    return ReportUtils.formatReportLastMessageText(messageText);
}

/**
 * @param {Number} reportID
 * @param {Object} [actionsToMerge]
 * @param {Number} deletedSequenceNumber
 * @param {Number} lastReadSequenceNumber
 * @return {String}
 */
function getNewLastReadSequenceNumberForDeletedAction(reportID, actionsToMerge = {}, deletedSequenceNumber, lastReadSequenceNumber) {
    // If the action we are deleting is unread then just return the current last read sequence number
    if (deletedSequenceNumber > lastReadSequenceNumber) {
        return lastReadSequenceNumber;
    }

    // Otherwise, we must find the first previous index of an action that is not deleted and less than the lastReadSequenceNumber
    const actions = _.toArray(lodashMerge({}, allReportActions[reportID], actionsToMerge));
    const sortedActions = _.sortBy(actions, 'sequenceNumber');
    const lastMessageIndex = _.findLastIndex(sortedActions, action => (
        !isDeletedAction(action) && action.sequenceNumber <= lastReadSequenceNumber
    ));

    // It's possible we won't find any and in that case the last read should be reset
    if (lastMessageIndex < 0) {
        return 0;
    }

    return sortedActions[lastMessageIndex].sequenceNumber;
}

export {
    getNewLastReadSequenceNumberForDeletedAction,
    getLastVisibleMessageText,
    getSortedReportActions,
    getMostRecentIOUReportSequenceNumber,
    isDeletedAction,
    isConsecutiveActionMadeByPreviousActor,
};
