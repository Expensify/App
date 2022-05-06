import _ from 'underscore';
import CONST from '../CONST';

/**
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isDeletedAction(reportAction) {
    // A deleted comment has either an empty array or an object with html field with empty string as value
    return reportAction.message.length === 0 || reportAction.message[0].html === '';
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
            || (action.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && !isDeletedAction(action))
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

export {
    getSortedReportActions,
    getMostRecentIOUReportSequenceNumber,
    isDeletedAction,
    isConsecutiveActionMadeByPreviousActor,
};
