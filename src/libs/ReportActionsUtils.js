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
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isDeletedAction(reportAction) {
    // A deleted comment has either an empty array or an object with html field with empty string as value
    const message = lodashGet(reportAction, 'message', []);
    return message.length === 0 || lodashGet(message, [0, 'html']) === '';
}

/**
 * Sort an array of reportActions by their created timestamp first, and reportActionID second
 * This gives us a stable order even in the case of multiple reportActions created on the same millisecond
 *
 * @param {Array} reportActions
 * @param {Boolean} shouldSortInDescendingOrder
 * @returns {Array}
 */
function getSortedReportActions(reportActions, shouldSortInDescendingOrder = false) {
    if (!_.isArray(reportActions)) {
        throw new Error(`ReportActionsUtils.getSortedReportActions requires an array, received ${typeof reportActions}`);
    }

    const invertedMultiplier = shouldSortInDescendingOrder ? -1 : 1;
    return _.chain(reportActions)
        .compact()
        .sort((first, second) => {
            // First sort by timestamp
            if (first.created !== second.created) {
                return (first.created < second.created ? -1 : 1) * invertedMultiplier;
            }

            // Then by action type, ensuring that `CREATED` actions always come first if they have the same timestamp as another action type
            if ((first.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED || second.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) && first.actionName !== second.actionName) {
                return ((first.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) ? -1 : 1) * invertedMultiplier;
            }

            // Then fallback on reportActionID as the final sorting criteria. It is a random number,
            // but using this will ensure that the order of reportActions with the same created time and action type
            // will be consistent across all users and devices
            return (first.reportActionID < second.reportActionID ? -1 : 1) * invertedMultiplier;
        })
        .value();
}

/**
 * Filter out any reportActions which should not be displayed.
 *
 * @param {Array} reportActions
 * @returns {Array}
 */
function filterReportActionsForDisplay(reportActions) {
    return _.filter(reportActions, (reportAction) => {
        // Filter out any unsupported reportAction types
        if (!_.has(CONST.REPORT.ACTIONS.TYPE, reportAction.actionName)) {
            return false;
        }

        // Ignore closed action here since we're already displaying a footer that explains why the report was closed
        if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
            return false;
        }

        // All other actions are displayed except deleted, non-pending actions
        const isDeleted = isDeletedAction(reportAction);
        const isPending = !_.isEmpty(reportAction.pendingAction);
        return !isDeleted || isPending;
    });
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

    const sortedReportActions = getSortedReportActions(iouActions);
    return _.last(sortedReportActions).reportActionID;
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
 * @param {String} reportID
 * @param {Object} [actionsToMerge]
 * @return {Object}
 */
function getLastVisibleAction(reportID, actionsToMerge = {}) {
    const actions = _.toArray(lodashMerge({}, allReportActions[reportID], actionsToMerge));
    const visibleActions = _.filter(actions, action => (!isDeletedAction(action)));
    return _.max(visibleActions, action => moment.utc(action.created).valueOf());
}

/**
 * @param {String} reportID
 * @param {Object} [actionsToMerge]
 * @return {String}
 */
function getLastVisibleMessageText(reportID, actionsToMerge = {}) {
    const lastVisibleAction = getLastVisibleAction(reportID, actionsToMerge);
    const htmlText = lodashGet(lastVisibleAction, 'message[0].html', '');

    const parser = new ExpensiMark();
    const messageText = parser.htmlToText(htmlText);
    return ReportUtils.formatReportLastMessageText(messageText);
}

/**
 * Given an array of Onyx updates, this function will filter out any which attempt to update reportActions data using reportActionID as the key.
 * It is a TEMPORARY measure while we migrate the shape of reportActions Onyx data. Additional context:
 *
 * - In GitHub: https://github.com/Expensify/App/issues/14452
 * - In Slack: https://expensify.slack.com/archives/C04DC6LU2UB/p1674243288556829?thread_ts=1674242808.964579&cid=C04DC6LU2UB
 *
 * @param {Array} onyxUpdates – each Onyx update typically has shape: {onyxMethod: string, key: string, value: *}
 * @returns {Array}
 */
function filterReportActionIDKeyedOnyxUpdates(onyxUpdates) {
    return _.reduce(
        onyxUpdates,
        (memo, onyxUpdate) => {
            if (!onyxUpdate.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS)) {
                memo.push(onyxUpdate);
                return memo;
            }

            const newValue = {};
            _.each(onyxUpdate.value, (reportAction, key) => {
                if (reportAction && reportAction.reportActionID === key) {
                    return;
                }
                newValue[key] = reportAction;
            });

            if (_.isEmpty(newValue)) {
                return memo;
            }

            // eslint-disable-next-line no-param-reassign
            onyxUpdate.value = newValue;
            memo.push(onyxUpdate);
            return memo;
        },
        [],
    );
}

export {
    getSortedReportActions,
    filterReportActionsForDisplay,
    getLastVisibleAction,
    getLastVisibleMessageText,
    getMostRecentIOUReportActionID,
    isDeletedAction,
    isConsecutiveActionMadeByPreviousActor,
    filterReportActionIDKeyedOnyxUpdates,
};
