import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as CollectionUtils from '../CollectionUtils';
import CONST from '../../CONST';

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
        const mostRecentNonLoadingActionIndex = _.findLastIndex(actionsArray, action => !action.loading);
        const mostRecentAction = actionsArray[mostRecentNonLoadingActionIndex];
        if (!mostRecentAction || _.isUndefined(mostRecentAction.sequenceNumber)) {
            return;
        }

        reportActionsMaxSequenceNumbers[reportID] = mostRecentAction.sequenceNumber;
    },
});

/**
 * WARNING: Do not use this method to access the maxSequenceNumber for a report. This ONLY returns the maxSequenceNumber
 * for reportActions that are stored in Onyx under a reportActions_* key.
 *
 * @param {Number} reportID
 * @param {Boolean} shouldWarn
 * @returns {Number}
 */
function dangerouslyGetReportActionsMaxSequenceNumber(reportID, shouldWarn = true) {
    if (shouldWarn) {
        console.error('WARNING: dangerouslyGetReportActionsMaxSequenceNumber is unreliable as it ONLY references '
            + 'reportActions in storage. It should not be used to access the maxSequenceNumber for a report. Use '
            + 'reportMaxSequenceNumbers[reportID] instead.');
    }

    return reportActionsMaxSequenceNumbers[reportID];
}

/**
 * Compares the maximum sequenceNumber that we know about with the most recent report action we have saved.
 * If we have no report actions at all for the report we will assume that it is missing actions.
 *
 * @param {Number} reportID
 * @param {Number} maxKnownSequenceNumber
 * @returns {Boolean}
 */
function isReportMissingActions(reportID, maxKnownSequenceNumber) {
    return _.isUndefined(reportActionsMaxSequenceNumbers[reportID])
        || reportActionsMaxSequenceNumbers[reportID] < maxKnownSequenceNumber;
}

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

function getPreviousMessageText(reportID) {
    for (let i = reportActionsMaxSequenceNumbers[reportID]; i >= 0; i--) {
        const message = lodashGet(reportActions, [reportID, i, 'message', 0, 'text'], '');
        if (message !== '') {
            return message;
        }
    }
    return '';
}

export {
    isReportMissingActions,
    dangerouslyGetReportActionsMaxSequenceNumber,
    getDeletedCommentsCount,
    getPreviousMessageText,
};
