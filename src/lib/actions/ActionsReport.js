import moment from 'moment';
import _ from 'underscore';
import * as Store from '../Store';
import {request, delayedWrite} from '../Network';
import STOREKEYS from '../../store/STOREKEYS';
import ExpensiMark from '../ExpensiMark';
import Guid from '../Guid';
import CONFIG from '../../CONFIG';
import * as pusher from '../Pusher/pusher';

/**
 * Sorts the report actions so that the newest actions are at the bottom
 *
 * @param {object} firstReport
 * @param {object} secondReport
 * @returns {number}
 */
function sortReportActions(firstReport, secondReport) {
    return firstReport.sequenceNumber - secondReport.sequenceNumber;
}

/**
 * Updates a report in the store with a new report action
 *
 * @param {string} reportID
 * @param {object} reportAction
 */
function updateReportWithNewAction(reportID, reportAction) {
    // Get the comments for this report, and add the comment (being sure to sort and filter properly)
    let foundExistingReportHistoryItem = false;

    Store.get(`${STOREKEYS.REPORT_HISTORY}_${reportID}`)

        // Use a reducer to replace an existing report history item if there is one
        .then(reportHistory => _.map(reportHistory, (reportHistoryItem) => {
            // If there is an existing reportHistoryItem, replace it
            if (reportHistoryItem.sequenceNumber === reportAction.sequenceNumber) {
                foundExistingReportHistoryItem = true;
                return reportAction;
            }
            return reportHistoryItem;
        }))
        .then((reportHistory) => {
            // If there was no existing history item, add it to the report history and mark the report for having unread
            // items
            if (!foundExistingReportHistoryItem) {
                reportHistory.push(reportAction);
                Store.merge(`${STOREKEYS.REPORT}_${reportID}`, {hasUnread: true});
            }
            return reportHistory;
        })
        .then((reportHistory) => {
            Store.set(`${STOREKEYS.REPORT_HISTORY}_${reportID}`, reportHistory.sort(sortReportActions));
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
        .sortBy(sortReportActions)
        .last()
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
    return Store.get(STOREKEYS.SESSION, 'accountID')
        .then((accountID) => {
            const pusherChannelName = `private-user-accountID-${accountID}`;
            pusher.subscribe(pusherChannelName, 'reportComment', (pushJSON) => {
                updateReportWithNewAction(pushJSON.reportID, pushJSON.reportAction);
            });
        });
}

/**
 * Get a single report
 *
 * @param {string} reportID
 * @returns {Promise}
 */
function fetch(reportID) {
    let fetchedReport;
    return request('Get', {
        returnValueList: 'reportStuff',
        reportIDList: reportID,
        shouldLoadOptionalKeys: true,
    })
        .then(data => data.reports && data.reports[reportID])
        .then((report) => {
            fetchedReport = report;
            return Store.get(STOREKEYS.SESSION, 'accountID');
        })
        .then((accountID) => {
            // When we fetch a full report, we want to figure out if there are unread comments on it
            fetchedReport.hasUnread = hasUnreadHistoryItems(accountID, fetchedReport);
            return Store.merge(`${STOREKEYS.REPORT}_${reportID}`, fetchedReport);
        });
}

/**
 * Get all of our reports
 *
 * @returns {Promise}
 */
function fetchAll() {
    if (CONFIG.IS_IN_PRODUCTION) {
        return request('Get', {
            returnValueList: 'reportStuff',
            reportIDList: '63212778,63212795,63212764,63212607,63699490',
            shouldLoadOptionalKeys: true,
        })

            // Load the full report of each one, it's OK to fire-and-forget these requests
            .then((data) => {
                _.each(data.reports, report => fetch(report.reportID));
                return data.reports;
            })

            // Transform the data so we only store what we need (space is valuable)
            .then(data => _.chain(data)
                .values()
                .map(report => ({reportID: report.reportID, reportName: report.reportName}))
                .value())

            // Put the data into the store
            .then(data => Store.set(STOREKEYS.REPORTS, data))
            // eslint-disable-next-line no-console
            .catch((error) => { console.log('Error fetching report actions', error); });
    }

    return request('Get', {
        returnValueList: 'reportListBeta',
        sortBy: 'starred',
        offset: 0,
        limit: 10,
    })

        // Load the full report of each one, it's OK to fire-and-forget these requests
        .then((data) => {
            _.each(data.reportListBeta, report => fetch(report.reportID));
            return data.reportListBeta;
        })

        // Transform the data so we only store what we need (space is valuable)
        .then(data => _.chain(data)
            .map(report => ({reportID: report.reportID, reportName: report.reportName}))
            .value())

        // Put the data into the store
        .then(data => Store.set(STOREKEYS.REPORTS, _.values(data)))
        // eslint-disable-next-line no-console
        .catch((error) => { console.log('Error fetching report actions', error); });
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
        .then(data => Store.set(`${STOREKEYS.REPORT_HISTORY}_${reportID}`, data.history.sort(sortReportActions)));
}

/**
 * Add a history item to a report
 *
 * @param {string} reportID
 * @param {string} reportComment
 * @returns {Promise}
 */
function addHistoryItem(reportID, reportComment) {
    const messageParser = new ExpensiMark();
    const guid = Guid();
    const historyKey = `${STOREKEYS.REPORT_HISTORY}_${reportID}`;

    return Store.multiGet([historyKey, STOREKEYS.SESSION, STOREKEYS.PERSONAL_DETAILS])
        .then((values) => {
            const reportHistory = values[historyKey];
            const email = values[STOREKEYS.SESSION].email || '';
            const personalDetails = values[STOREKEYS.PERSONAL_DETAILS][email];

            // The new sequence number will be one higher than the highest
            let highestSequenceNumber = _.chain(reportHistory)
                .pluck('sequenceNumber')
                .max()
                .value() || 0;

            // Optimistically add the new comment to the store before waiting to save it to the server
            return Store.set(historyKey, [
                ...reportHistory,
                {
                    tempGuid: guid,
                    actionName: 'ADDCOMMENT',
                    actorEmail: Store.get(STOREKEYS.SESSION, 'email'),
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
                            html: messageParser.replace(reportComment),
                            text: reportComment,
                        }
                    ],
                    isFirstItem: false,
                    isAttachmentPlaceHolder: false,
                }
            ]);
        })
        .then(() => delayedWrite('Report_AddComment', {
            reportID,
            reportComment,
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
    return Store.merge(`${STOREKEYS.REPORT}_${reportID}`, {
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
    fetch,
    fetchHistory,
    addHistoryItem,
    updateLastReadActionID,
    initPusher,
};
