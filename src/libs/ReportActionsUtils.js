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
 * Sort an array of reportActions by their created timestamp,
 * falling back on reportActionID in case multiple reportActions are created in the same millisecond.
 *
 * @param {Array} reportActions
 * @returns {Array}
 */
function sortReportActions(reportActions) {
    reportActions.sort((first, second) => {
        if (first.timestamp !== second.timestamp) {
            return first.timestamp - second.timestamp;
        }
        return first.reportActionID - second.reportActionID;
    });
    return reportActions;
}

/**
 * Sorts the report actions by timestamp, filters out any that should not be shown and formats them for display.
 *
 * @param {Array} reportActions
 * @returns {Array}
 */
function getSortedReportActions(reportActions) {
    const sortedActions = sortReportActions(reportActions);
    return _.chain(sortedActions)
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
 * Finds the most recent IOU report action ID.
 *
 * @param {Array} reportActions
 * @returns {String}
 */
function getMostRecentIOUReportActionID(reportActions) {
    const iouActions = _.filter(reportActions, action => action.name === CONST.REPORT.ACTIONS.TYPE.IOU);
    if (_.isEmpty(iouActions)) {
        return '';
    }
    const sortedActions = sortReportActions(iouActions);
    return _.last(sortedActions).reportActionID;
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
 * Get the last
 * @param {String} reportID
 * @param {Object} [actionsToMerge]
 * @returns {Number}
 */
function getLastMessageTimestamp(reportID, actionsToMerge = {}) {
    const actions = lodashMerge({}, allReportActions[reportID], actionsToMerge);
    return _.max(actions, action => action.timestamp).timestamp;
}

export {
    getLastMessageTimestamp,
    getLastVisibleMessageText,
    getSortedReportActions,
    getMostRecentIOUReportActionID,
    isDeletedAction,
    isConsecutiveActionMadeByPreviousActor,
};
