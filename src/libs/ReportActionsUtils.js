import lodashGet from 'lodash/get';
import _ from 'underscore';
import lodashMerge from 'lodash/merge';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import moment from 'moment';
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

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: val => isNetworkOffline = lodashGet(val, 'isOffline', false),
});

/**
 * Sort an array of reportActions by their created timestamp,
 * using actionName as a secondary sorting parameter,
 * finally falling back on reportActionID in case multiple reportActions of the same actionName are created in the same millisecond.
 *
 * @param {Array} reportActions
 * @param {Boolean} [shouldInvertSortingOrder]
 * @returns {Array}
 */
function sortReportActions(reportActions, shouldInvertSortingOrder = false) {
    if (!_.isArray(reportActions)) {
        throw new Error(`ReportActionsUtils::sortReportActions requires an array, received ${typeof reportActions}`);
    }
    const invertedMultiplier = shouldInvertSortingOrder ? -1 : 1;
    reportActions.sort((first, second) => {
        if (first.created !== second.created) {
            return (first.created < second.created ? -1 : 1) * invertedMultiplier;
        }

        return (first.reportActionID < second.reportActionID ? -1 : 1) * invertedMultiplier;
    });
    return reportActions;
}

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
 * Finds most recent IOU report action number.
 *
 * @param {Array} reportActions
 * @returns {String}
 */
function getMostRecentIOUReportActionID(reportActions) {
    const iouActions = _.where(reportActions, {actionName: CONST.REPORT.ACTIONS.TYPE.IOU});
    if (_.isEmpty(iouActions)) {
        return null;
    }

    sortReportActions(iouActions);
    return _.last(iouActions).reportActionID;
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
    // Find the next non-pending deletion report action, as the pending delete action means that it is not displayed in the UI, but still is in the report actions list.
    // If we are offline, all actions are pending but shown in the UI, so we take the previous action, even if it is a delete.
    const previousAction = _.find(_.drop(reportActions, actionIndex + 1), action => isNetworkOffline || (action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE));
    const currentAction = reportActions[actionIndex];

    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !previousAction) {
        return false;
    }

    // Comments are only grouped if they happen within 5 minutes of each other
    if (moment(currentAction.created).unix() - moment(previousAction.created).unix() > 300) {
        return false;
    }

    // Do not group if previous or current action was a renamed action
    if (previousAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED
        || currentAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
        return false;
    }

    return currentAction.actorEmail === previousAction.actorEmail;
}

/**
 * Get the message text for the last action that was not deleted
 * @param {String} reportID
 * @param {Object} [actionsToMerge]
 * @return {String}
 */
function getLastVisibleMessageText(reportID, actionsToMerge = {}) {
    const parser = new ExpensiMark();
    const actions = _.toArray(lodashMerge({}, allReportActions[reportID], actionsToMerge));
    const sortedActions = sortReportActions(actions);
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
 * @param {String} reportID
 * @param {Object} [actionsToMerge]
 * @param {Number} deletedSequenceNumber
 * @param {Number} lastReadSequenceNumber
 * @return {Number}
 */
function getOptimisticLastReadSequenceNumberForDeletedAction(reportID, actionsToMerge = {}, deletedSequenceNumber, lastReadSequenceNumber) {
    // If the action we are deleting is unread then just return the current last read sequence number
    if (deletedSequenceNumber > lastReadSequenceNumber) {
        return lastReadSequenceNumber;
    }

    // Otherwise, we must find the first previous index of an action that is not deleted and less than the lastReadSequenceNumber
    const actions = _.toArray(lodashMerge({}, allReportActions[reportID], actionsToMerge));
    const sortedActions = sortReportActions(actions);
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
    sortReportActions,
    getOptimisticLastReadSequenceNumberForDeletedAction,
    getLastVisibleMessageText,
    getMostRecentIOUReportActionID,
    isDeletedAction,
    isConsecutiveActionMadeByPreviousActor,
};
