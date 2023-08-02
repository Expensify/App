import lodashGet from 'lodash/get';
import _ from 'underscore';
import lodashMerge from 'lodash/merge';
import lodashFindLast from 'lodash/findLast';
import Onyx from 'react-native-onyx';
import moment from 'moment';
import * as CollectionUtils from './CollectionUtils';
import CONST from '../CONST';
import ONYXKEYS from '../ONYXKEYS';
import Log from './Log';
import * as CurrencyUtils from './CurrencyUtils';
import isReportMessageAttachment from './isReportMessageAttachment';

const allReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!key || !report) {
            return;
        }

        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReports[reportID] = report;
    },
});

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
    callback: (val) => (isNetworkOffline = lodashGet(val, 'isOffline', false)),
});

/**
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isCreatedAction(reportAction) {
    return lodashGet(reportAction, 'actionName') === CONST.REPORT.ACTIONS.TYPE.CREATED;
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
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isDeletedParentAction(reportAction) {
    return lodashGet(reportAction, ['message', 0, 'isDeletedParentAction'], false) && lodashGet(reportAction, 'childVisibleActionCount', 0) > 0;
}

/**
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isPendingRemove(reportAction) {
    return lodashGet(reportAction, 'message[0].moderationDecision.decision') === CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE;
}

/**
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isMoneyRequestAction(reportAction) {
    return lodashGet(reportAction, 'actionName', '') === CONST.REPORT.ACTIONS.TYPE.IOU;
}

/**
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isReportPreviewAction(reportAction) {
    return lodashGet(reportAction, 'actionName', '') === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW;
}

function isWhisperAction(action) {
    return (action.whisperedToAccountIDs || []).length > 0;
}

/**
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function hasCommentThread(reportAction) {
    return lodashGet(reportAction, 'childType', '') === CONST.REPORT.TYPE.CHAT && lodashGet(reportAction, 'childVisibleActionCount', 0) > 0;
}

/**
 * Returns the parentReportAction if the given report is a thread/task.
 *
 * @param {Object} report
 * @param {Object} [allReportActionsParam]
 * @returns {Object}
 */
function getParentReportAction(report, allReportActionsParam = undefined) {
    if (!report || !report.parentReportID || !report.parentReportActionID) {
        return {};
    }
    return lodashGet(allReportActionsParam || allReportActions, [report.parentReportID, report.parentReportActionID], {});
}

/**
 * Determines if the given report action is sent money report action by checking for 'pay' type and presence of IOUDetails object.
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isSentMoneyReportAction(reportAction) {
    return (
        reportAction &&
        reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
        lodashGet(reportAction, 'originalMessage.type') === CONST.IOU.REPORT_ACTION_TYPE.PAY &&
        _.has(reportAction.originalMessage, 'IOUDetails')
    );
}

/**
 * Returns the formatted amount of a money request. The request and money sent (from send money flow) have
 * currency and amount in IOUDetails object.
 *
 * @param {Object} reportAction
 * @returns {Number}
 */
function getFormattedAmount(reportAction) {
    return lodashGet(reportAction, 'originalMessage.type', '') === CONST.IOU.REPORT_ACTION_TYPE.PAY && lodashGet(reportAction, 'originalMessage.IOUDetails', false)
        ? CurrencyUtils.convertToDisplayString(lodashGet(reportAction, 'originalMessage.IOUDetails.amount', 0), lodashGet(reportAction, 'originalMessage.IOUDetails.currency', ''))
        : CurrencyUtils.convertToDisplayString(lodashGet(reportAction, 'originalMessage.amount', 0), lodashGet(reportAction, 'originalMessage.currency', ''));
}

/**
 * Returns whether the thread is a transaction thread, which is any thread with IOU parent
 * report action from requesting money (type - create) or from sending money (type - pay with IOUDetails field)
 *
 * @param {Object} parentReportAction
 * @returns {Boolean}
 */
function isTransactionThread(parentReportAction) {
    const originalMessage = lodashGet(parentReportAction, 'originalMessage', {});
    return (
        parentReportAction &&
        parentReportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU &&
        (originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE || (originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.PAY && _.has(originalMessage, 'IOUDetails')))
    );
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
                return (first.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED ? -1 : 1) * invertedMultiplier;
            }
            // Ensure that `REPORTPREVIEW` actions always come after if they have the same timestamp as another action type
            if ((first.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW || second.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW) && first.actionName !== second.actionName) {
                return (first.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW ? 1 : -1) * invertedMultiplier;
            }

            // Then fallback on reportActionID as the final sorting criteria. It is a random number,
            // but using this will ensure that the order of reportActions with the same created time and action type
            // will be consistent across all users and devices
            return (first.reportActionID < second.reportActionID ? -1 : 1) * invertedMultiplier;
        })
        .value();
}

/**
 * Finds most recent IOU request action ID.
 *
 * @param {Array} reportActions
 * @returns {String}
 */
function getMostRecentIOURequestActionID(reportActions) {
    const iouRequestTypes = [CONST.IOU.REPORT_ACTION_TYPE.CREATE, CONST.IOU.REPORT_ACTION_TYPE.SPLIT];
    const iouRequestActions = _.filter(reportActions, (action) => iouRequestTypes.includes(lodashGet(action, 'originalMessage.type')));

    if (_.isEmpty(iouRequestActions)) {
        return null;
    }

    const sortedReportActions = getSortedReportActions(iouRequestActions);
    return _.last(sortedReportActions).reportActionID;
}

/**
 * Returns array of links inside a given report action
 *
 * @param {Object} reportAction
 * @returns {Array}
 */
function extractLinksFromMessageHtml(reportAction) {
    const htmlContent = lodashGet(reportAction, ['message', 0, 'html']);

    // Regex to get link in href prop inside of <a/> component
    const regex = /<a\s+(?:[^>]*?\s+)?href="([^"]*)"/gi;

    if (!htmlContent) {
        return [];
    }

    return _.map([...htmlContent.matchAll(regex)], (match) => match[1]);
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
    const previousAction = _.find(_.drop(reportActions, actionIndex + 1), (action) => isNetworkOffline || action.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE);
    const currentAction = reportActions[actionIndex];

    // It's OK for there to be no previous action, and in that case, false will be returned
    // so that the comment isn't grouped
    if (!currentAction || !previousAction) {
        return false;
    }

    // Comments are only grouped if they happen within 5 minutes of each other
    if (new Date(currentAction.created).getTime() - new Date(previousAction.created).getTime() > 300000) {
        return false;
    }

    // Do not group if previous action was a created action
    if (previousAction.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED) {
        return false;
    }

    // Do not group if previous or current action was a renamed action
    if (previousAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED || currentAction.actionName === CONST.REPORT.ACTIONS.TYPE.RENAMED) {
        return false;
    }

    // Do not group if the delegate account ID is different
    if (previousAction.delegateAccountID !== currentAction.delegateAccountID) {
        return false;
    }

    return currentAction.actorAccountID === previousAction.actorAccountID;
}

/**
 * Checks if a reportAction is deprecated.
 *
 * @param {Object} reportAction
 * @param {String} key
 * @returns {Boolean}
 */
function isReportActionDeprecated(reportAction, key) {
    if (!reportAction) {
        return true;
    }

    // HACK ALERT: We're temporarily filtering out any reportActions keyed by sequenceNumber
    // to prevent bugs during the migration from sequenceNumber -> reportActionID
    if (String(reportAction.sequenceNumber) === key) {
        Log.info('Front-end filtered out reportAction keyed by sequenceNumber!', false, reportAction);
        return true;
    }

    return false;
}

/**
 * Checks if a reportAction is fit for display, meaning that it's not deprecated, is of a valid
 * and supported type, it's not deleted and also not closed.
 *
 * @param {Object} reportAction
 * @param {String} key
 * @returns {Boolean}
 */
function shouldReportActionBeVisible(reportAction, key) {
    if (isReportActionDeprecated(reportAction, key)) {
        return false;
    }

    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.TASKEDITED) {
        return false;
    }

    // Filter out any unsupported reportAction types
    if (
        !_.has(CONST.REPORT.ACTIONS.TYPE, reportAction.actionName) &&
        !_.contains(_.values(CONST.REPORT.ACTIONS.TYPE.POLICYCHANGELOG), reportAction.actionName) &&
        !_.contains(_.values(CONST.REPORT.ACTIONS.TYPE.TASK), reportAction.actionName)
    ) {
        return false;
    }

    // Ignore closed action here since we're already displaying a footer that explains why the report was closed
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED) {
        return false;
    }

    if (isPendingRemove(reportAction)) {
        return false;
    }

    // All other actions are displayed except thread parents, deleted, or non-pending actions
    const isDeleted = isDeletedAction(reportAction);
    const isPending = !_.isEmpty(reportAction.pendingAction);
    return !isDeleted || isPending || isDeletedParentAction(reportAction);
}

/**
 * Checks if a reportAction is fit for display as report last action, meaning that
 * it satisfies shouldReportActionBeVisible, it's not whisper action and not deleted.
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function shouldReportActionBeVisibleAsLastAction(reportAction) {
    if (!reportAction) {
        return false;
    }

    return shouldReportActionBeVisible(reportAction, reportAction.reportActionID) && !isWhisperAction(reportAction) && !isDeletedAction(reportAction);
}

/**
 * @param {String} reportID
 * @param {Object} [actionsToMerge]
 * @return {Object}
 */
function getLastVisibleAction(reportID, actionsToMerge = {}) {
    const actions = _.toArray(lodashMerge({}, allReportActions[reportID], actionsToMerge));
    const visibleActions = _.filter(actions, (action) => shouldReportActionBeVisibleAsLastAction(action));

    if (_.isEmpty(visibleActions)) {
        return {};
    }

    return _.max(visibleActions, (action) => moment.utc(action.created).valueOf());
}

/**
 * @param {String} reportID
 * @param {Object} [actionsToMerge]
 * @return {Object}
 */
function getLastVisibleMessage(reportID, actionsToMerge = {}) {
    const lastVisibleAction = getLastVisibleAction(reportID, actionsToMerge);
    const message = lodashGet(lastVisibleAction, ['message', 0], {});

    if (isReportMessageAttachment(message)) {
        return {
            lastMessageTranslationKey: CONST.TRANSLATION_KEYS.ATTACHMENT,
        };
    }

    if (isCreatedAction(lastVisibleAction)) {
        return {
            lastMessageText: '',
        };
    }

    const messageText = lodashGet(message, 'text', '');
    return {
        lastMessageText: String(messageText).replace(CONST.REGEX.AFTER_FIRST_LINE_BREAK, '').substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim(),
    };
}

/**
 * A helper method to filter out report actions keyed by sequenceNumbers.
 *
 * @param {Object} reportActions
 * @returns {Array}
 */
function filterOutDeprecatedReportActions(reportActions) {
    return _.filter(reportActions, (reportAction, key) => !isReportActionDeprecated(reportAction, key));
}

/**
 * This method returns the report actions that are ready for display in the ReportActionsView.
 * The report actions need to be sorted by created timestamp first, and reportActionID second
 * to ensure they will always be displayed in the same order (in case multiple actions have the same timestamp).
 * This is all handled with getSortedReportActions() which is used by several other methods to keep the code DRY.
 *
 * @param {Object} reportActions
 * @returns {Array}
 */
function getSortedReportActionsForDisplay(reportActions) {
    const filteredReportActions = _.filter(reportActions, (reportAction, key) => shouldReportActionBeVisible(reportAction, key));
    return getSortedReportActions(filteredReportActions, true);
}

/**
 * In some cases, there can be multiple closed report actions in a chat report.
 * This method returns the last closed report action so we can always show the correct archived report reason.
 * Additionally, archived #admins and #announce do not have the closed report action so we will return null if none is found.
 *
 * @param {Object} reportActions
 * @returns {Object|null}
 */
function getLastClosedReportAction(reportActions) {
    // If closed report action is not present, return early
    if (!_.some(reportActions, (action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED)) {
        return null;
    }
    const filteredReportActions = filterOutDeprecatedReportActions(reportActions);
    const sortedReportActions = getSortedReportActions(filteredReportActions);
    return lodashFindLast(sortedReportActions, (action) => action.actionName === CONST.REPORT.ACTIONS.TYPE.CLOSED);
}

/**
 * @param {Array} onyxData
 * @returns {Object} The latest report action in the `onyxData` or `null` if one couldn't be found
 */
function getLatestReportActionFromOnyxData(onyxData) {
    const reportActionUpdate = _.find(onyxData, (onyxUpdate) => onyxUpdate.key.startsWith(ONYXKEYS.COLLECTION.REPORT_ACTIONS));

    if (!reportActionUpdate) {
        return null;
    }

    const reportActions = _.values(reportActionUpdate.value);
    const sortedReportActions = getSortedReportActions(reportActions);
    return _.last(sortedReportActions);
}

/**
 * Find the transaction associated with this reportAction, if one exists.
 *
 * @param {String} reportID
 * @param {String} reportActionID
 * @returns {String|null}
 */
function getLinkedTransactionID(reportID, reportActionID) {
    const reportAction = lodashGet(allReportActions, [reportID, reportActionID]);
    if (!reportAction || reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU) {
        return null;
    }
    return reportAction.originalMessage.IOUTransactionID;
}

/**
 *
 * @param {String} reportID
 * @param {String} reportActionID
 * @returns {Object}
 */
function getReportAction(reportID, reportActionID) {
    return lodashGet(allReportActions, [reportID, reportActionID], {});
}

/**
 * @returns {string}
 */
function getMostRecentReportActionLastModified() {
    // Start with the oldest date possible
    let mostRecentReportActionLastModified = new Date(0).toISOString();

    // Flatten all the actions
    // Loop over them all to find the one that is the most recent
    const flatReportActions = _.flatten(_.map(allReportActions, (actions) => _.values(actions)));
    _.each(flatReportActions, (action) => {
        // Pending actions should not be counted here as a user could create a comment or some other action while offline and the server might know about
        // messages they have not seen yet.
        if (!_.isEmpty(action.pendingAction)) {
            return;
        }

        const lastModified = action.lastModified || action.created;
        if (lastModified < mostRecentReportActionLastModified) {
            return;
        }

        mostRecentReportActionLastModified = lastModified;
    });

    // We might not have actions so we also look at the report objects to see if any have a lastVisibleActionLastModified that is more recent. We don't need to get
    // any reports that have been updated before either a recently updated report or reportAction as we should be up to date on these
    _.each(allReports, (report) => {
        const reportLastVisibleActionLastModified = report.lastVisibleActionLastModified || report.lastVisibleActionCreated;
        if (!reportLastVisibleActionLastModified || reportLastVisibleActionLastModified < mostRecentReportActionLastModified) {
            return;
        }

        mostRecentReportActionLastModified = reportLastVisibleActionLastModified;
    });

    return mostRecentReportActionLastModified;
}

/**
 * @param {*} chatReportID
 * @param {*} iouReportID
 * @returns {Object} The report preview action or `null` if one couldn't be found
 */
function getReportPreviewAction(chatReportID, iouReportID) {
    return _.find(
        allReportActions[chatReportID],
        (reportAction) => reportAction && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW && lodashGet(reportAction, 'originalMessage.linkedReportID') === iouReportID,
    );
}

/**
 * Get the iouReportID for a given report action.
 *
 * @param {Object} reportAction
 * @returns {String}
 */
function getIOUReportIDFromReportActionPreview(reportAction) {
    return lodashGet(reportAction, 'originalMessage.linkedReportID', '');
}

function isCreatedTaskReportAction(reportAction) {
    return reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT && _.has(reportAction.originalMessage, 'taskReportID');
}

/**
 * A helper method to identify if the message is deleted or not.
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isMessageDeleted(reportAction) {
    return lodashGet(reportAction, ['message', 0, 'isDeletedParentAction'], false);
}

export {
    getSortedReportActions,
    getLastVisibleAction,
    getLastVisibleMessage,
    getMostRecentIOURequestActionID,
    extractLinksFromMessageHtml,
    isCreatedAction,
    isDeletedAction,
    shouldReportActionBeVisible,
    shouldReportActionBeVisibleAsLastAction,
    isReportActionDeprecated,
    isConsecutiveActionMadeByPreviousActor,
    getSortedReportActionsForDisplay,
    getLastClosedReportAction,
    getLatestReportActionFromOnyxData,
    isMoneyRequestAction,
    hasCommentThread,
    getLinkedTransactionID,
    getMostRecentReportActionLastModified,
    getReportPreviewAction,
    isCreatedTaskReportAction,
    getParentReportAction,
    isTransactionThread,
    getFormattedAmount,
    isSentMoneyReportAction,
    isDeletedParentAction,
    isReportPreviewAction,
    getIOUReportIDFromReportActionPreview,
    isMessageDeleted,
    isWhisperAction,
    isPendingRemove,
    getReportAction,
};
