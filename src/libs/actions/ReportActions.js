import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import ONYXKEYS from '../../ONYXKEYS';
import * as CollectionUtils from '../CollectionUtils';
import CONST from '../../CONST';
import * as ReportUtils from '../ReportUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';

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
 * @return {String}
 */
function getLastVisibleMessageText(reportID) {
    const lastMessageIndex = _.findLastIndex(reportActions[reportID], action => (
        !ReportActionsUtils.isDeletedAction(action)
    ));

    return ReportUtils.formatReportLastMessageText(
        lodashGet(reportActions, [reportID, lastMessageIndex, 'message', 0, 'text'], ''),
    );
}

export {
    getDeletedCommentsCount,
    getLastVisibleMessageText,
};
