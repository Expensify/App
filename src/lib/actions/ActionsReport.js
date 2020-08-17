import moment from 'moment';
import _ from 'underscore';
import get from 'lodash.get';
import Ion from '../Ion';
import {request, delayedWrite} from '../Network';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import * as pusher from '../Pusher/pusher';
import promiseAllSettled from '../promiseAllSettled';
import ExpensiMark from '../ExpensiMark';

/**
 * Updates a report in the store with a new report action
 *
 * @param {string} reportID
 * @param {object} reportAction
 */
function updateReportWithNewAction(reportID, reportAction) {
    Ion.get(`${IONKEYS.REPORT}_${reportID}`, 'reportID')
        .then((ionReportID) => {
            // This is necessary for local development because there will be pusher events from other engineers with
            // different reportIDs
            if (!CONFIG.IS_IN_PRODUCTION && !ionReportID) {
                throw new Error('Report does not exist in the store, so ignoring new comments');
            }

            // Get the report history and return that to the next chain
            return Ion.get(`${IONKEYS.REPORT_HISTORY}_${reportID}`);
        })

        // Look to see if the report action from pusher already exists or not (it would exist if it's a comment just
        // written by the user). If the action doesn't exist, then update the unread flag on the report so the user
        // knows there is a new comment
        .then((reportHistory) => {
            if (reportHistory && !reportHistory[reportAction.sequenceNumber]) {
                Ion.merge(`${IONKEYS.REPORT}_${reportID}`, {hasUnread: true});
            }
            return reportHistory || {};
        })

        // Put the report action from pusher into the history, it's OK to overwrite it if it already exists
        .then(reportHistory => ({
            ...reportHistory,
            [reportAction.sequenceNumber]: reportAction,
        }))

        // Put the report history back into Ion
        .then((reportHistory) => {
            Ion.set(`${IONKEYS.REPORT_HISTORY}_${reportID}`, reportHistory);
        });
}

/**
 * Checks the report to see if there are any unread history items
 *
 * @param {string} accountID
 * @param {object} report
 * @returns {boolean}
 */
function hasUnreadHistoryItems(accountID, report) {
    const usersLastReadActionID = report.reportNameValuePairs[`lastReadActionID_${accountID}`];
    if (!usersLastReadActionID || report.reportActionList.length === 0) {
        return false;
    }

    // Find the most recent sequence number from the report history
    const lastReportAction = _.chain(report.reportActionList)
        .pluck('sequenceNumber')
        .max()
        .value();

    if (!lastReportAction) {
        return false;
    }

    // There are unread items if the last one the user has read is less than the highest sequence number we have
    return usersLastReadActionID < lastReportAction.sequenceNumber;
}

/**
 * Initialize our pusher subscriptions to listen for new report comments
 *
 * @returns {Promise}
 */
function initPusher() {
    return Ion.get(IONKEYS.SESSION, 'accountID')
        .then((accountID) => {
            const pusherChannelName = `private-user-accountID-${accountID}`;
            pusher.subscribe(pusherChannelName, 'reportComment', (pushJSON) => {
                updateReportWithNewAction(pushJSON.reportID, pushJSON.reportAction);
            });
        });
}

/**
 * Get all of our reports
 *
 * @returns {Promise}
 */
function fetchAll() {
    let fetchedReports;

    // Request each report one at a time to allow individual reports to fail if access to it is prevents by Auth
    const reportFetchPromises = _.map(CONFIG.REPORT_IDS.split(','), reportID => request('Get', {
        returnValueList: 'reportStuff',
        reportIDList: reportID,
        shouldLoadOptionalKeys: true,
    }));

    return promiseAllSettled(reportFetchPromises)
        .then(data => fetchedReports = _.compact(_.map(data, (promiseResult) => {
            // Grab the report from the promise result which stores it in the `value` key
            const report = get(promiseResult, 'value.reports', {});

            // If there is no report found from the promise, return null
            // Otherwise, grab the actual report object from the first index in the values array
            return _.isEmpty(report) ? null : _.values(report)[0];
        })))
        .then(() => Ion.get(IONKEYS.SESSION, 'accountID'))
        .then((accountID) => {
            const ionPromises = _.map(fetchedReports, (report) => {
                // Store only the absolute bare minimum of data in Ion because space is limited
                const newReport = {
                    reportID: report.reportID,
                    reportName: report.reportName,
                    reportNameValuePairs: report.reportNameValuePairs,
                    hasUnread: hasUnreadHistoryItems(accountID, report),
                };

                // Merge the data into Ion. Don't use set() here or multiSet() because then that would
                // overwrite any existing data (like if they have unread messages)
                return Ion.merge(`${IONKEYS.REPORT}_${report.reportID}`, newReport);
            });

            return promiseAllSettled(ionPromises);
        });
}

/**
 * Get the history of a report
 *
 * @param {string} reportID
 * @returns {Promise}
 */
function fetchHistory(reportID) {
    return request('Report_GetHistory', {
        reportID,
        offset: 0,
    })
        .then((data) => {
            const indexedData = _.indexBy(data.history, 'sequenceNumber');
            Ion.set(`${IONKEYS.REPORT_HISTORY}_${reportID}`, indexedData);
        });
}

/**
 * Add a history item to a report
 *
 * @param {string} reportID
 * @param {string} reportComment
 * @returns {Promise}
 */
function addHistoryItem(reportID, reportComment) {
    const historyKey = `${IONKEYS.REPORT_HISTORY}_${reportID}`;

    // Convert the comment from MD into HTML because that's how it is stored in the database
    const parser = new ExpensiMark();
    const htmlComment = parser.replace(reportComment);

    return Ion.multiGet([historyKey, IONKEYS.SESSION, IONKEYS.PERSONAL_DETAILS])
        .then((values) => {
            const reportHistory = values[historyKey];
            const email = values[IONKEYS.SESSION].email || '';
            const personalDetails = values[IONKEYS.PERSONAL_DETAILS][email];

            // The new sequence number will be one higher than the highest
            let highestSequenceNumber = _.chain(reportHistory)
                .pluck('sequenceNumber')
                .max()
                .value() || 0;
            const newSequenceNumber = highestSequenceNumber + 1;

            // Optimistically add the new comment to the store before waiting to save it to the server
            return Ion.set(historyKey, {
                ...reportHistory,
                [newSequenceNumber]: {
                    actionName: 'ADDCOMMENT',
                    actorEmail: Ion.get(IONKEYS.SESSION, 'email'),
                    person: [
                        {
                            style: 'strong',
                            text: personalDetails.displayName || email,
                            type: 'TEXT'
                        }
                    ],
                    automatic: false,
                    sequenceNumber: ++highestSequenceNumber,
                    avatar: personalDetails.avatarURL,
                    timestamp: moment().unix(),
                    message: [
                        {
                            type: 'COMMENT',
                            html: htmlComment,
                            text: htmlComment,
                        }
                    ],
                    isFirstItem: false,
                    isAttachmentPlaceHolder: false,
                }
            });
        })
        .then(() => delayedWrite('Report_AddComment', {
            reportID,
            reportComment: htmlComment,
        }));
}

/**
 * Updates the last read action ID on the report. It optimistically makes the change to the store, and then let's the
 * network layer handle the delayed write.
 *
 * @param {string} accountID
 * @param {string} reportID
 * @param {number} sequenceNumber
 * @returns {Promise}
 */
function updateLastReadActionID(accountID, reportID, sequenceNumber) {
    // Mark the report as not having any unread items
    return Ion.merge(`${IONKEYS.REPORT}_${reportID}`, {
        hasUnread: false,
        reportNameValuePairs: {
            [`lastReadActionID_${accountID}`]: sequenceNumber,
        }
    })

        // Update the lastReadActionID on the report optimistically
        .then(() => delayedWrite('Report_SetLastReadActionID', {
            accountID,
            reportID,
            sequenceNumber,
        }));
}

export {
    fetchAll,
    fetchHistory,
    addHistoryItem,
    updateLastReadActionID,
    initPusher,
};
