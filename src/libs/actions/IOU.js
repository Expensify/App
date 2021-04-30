import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import {getSimplifiedIOUReport, fetchChatReportsByIDs} from './Report';
import Navigation from '../Navigation/Navigation';
import ROUTES from '../../ROUTES';

/**
 * Retrieve the users preferred currency
 */
function getPreferredCurrency() {
    Onyx.merge(ONYXKEYS.IOU, {loading: true});

    // fake loading timer, to be replaced with actual network request
    setTimeout(() => {
        Onyx.merge(ONYXKEYS.IOU, {loading: false});
    }, 1600);
}

/**
 * @param {Object[]} requestParams
 * @param {Number} requestParams.reportID the ID of the IOU report
 * @param {Number} requestParams.chatReportID the ID of the chat report that the IOU report belongs to
 * @returns {Promise}
 * Gets the IOU Reports for new transaction
 */
function getIOUReportsForNewTransaction(requestParams) {
    return API.Get({
        returnValueList: 'reportStuff',
        reportIDList: _.pluck(requestParams, 'reportID'),
        shouldLoadOptionalKeys: true,
        includePinnedReports: true,
    })
        .then(({reports}) => {
            const chatReportsToUpdate = {};
            const iouReportsToUpdate = {};

            _.each(reports, (reportData) => {
                // First, the existing chat report needs updated with the details about the new IOU
                const paramsForIOUReport = _.findWhere(requestParams, {reportID: reportData.reportID});
                if (paramsForIOUReport && paramsForIOUReport.chatReportID) {
                    const chatReportKey = `${ONYXKEYS.COLLECTION.REPORT}${paramsForIOUReport.chatReportID}`;
                    chatReportsToUpdate[chatReportKey] = {
                        iouReportID: reportData.reportID,
                        total: reportData.total,
                        stateNum: reportData.stateNum,
                        hasOutstandingIOU: true,
                    };

                    // Second, the IOU report needs updated with the new IOU details too
                    const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${reportData.reportID}`;
                    iouReportsToUpdate[iouReportKey] = getSimplifiedIOUReport(reportData, reportData.reportID);
                }
            });

            // Now, merge the updated objects into our store
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, chatReportsToUpdate);
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, iouReportsToUpdate);
        })
        .catch(() => Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false, error: true}))
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false}));
}

/**
 * Creates IOUSplit Transaction
 * @param {Object} params
 * @param {String} params.amount
 * @param {String} params.comment
 * @param {String} params.currency
 * @param {String} params.debtorEmail
 */
function createIOUTransaction(params) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});
    API.CreateIOUTransaction(params)
        .then(data => getIOUReportsForNewTransaction([data]));
}

/**
 * Creates IOUSplit Transaction
 * @param {Object} params
 * @param {Array} params.splits
 * @param {String} params.comment
 * @param {String} params.amount
 * @param {String} params.currency
 */
function createIOUSplit(params) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});

    API.CreateChatReport({
        emailList: params.splits.map(participant => participant.email).join(','),
    })
        .then(data => API.CreateIOUSplit({
            ...params,
            splits: JSON.stringify(params.splits),
            reportID: data.reportID,
        }))
        .then((data) => {
            // This data needs to go from this:
            // {reportIDList: [1, 2], chatReportIDList: [3, 4]}
            // to this:
            // [{reportID: 1, chatReportID: 3}, {reportID: 2, chatReportID: 4}]
            // in order for getIOUReportsForNewTransaction to know which IOU reports are associated with which
            // chat reports
            const reportParams = [];
            for (let i = 0; i < data.reportIDList.length; i++) {
                reportParams.push({
                    reportID: data.reportIDList[i],
                    chatReportID: data.chatReportIDList[i],
                });
            }
            getIOUReportsForNewTransaction(reportParams);
        });
}

/**
 * Retrieve an IOU report using a transactionID, then navigate to the page.
 * @param {Int} transactionID
 */
function getIOUReportDetailFromTransactionID(transactionID) {
    API.Get({
        returnValueList: 'transactionList',
        transactionID,
    })
        .then((data) => {
            const chatReportID = data.transactionList[0].reportID;
            if (!chatReportID) {
                return;
            }
            Navigation.navigate(ROUTES.getIouDetailsRoute(chatReportID));
        })
        .catch((error) => {
            console.error('Error retrieving Transaction: ', error);
        });
}

/**
 * Settles an IOU Report
 */
function settleIOUReport({
    chatReportID, reportID, paymentMethodType,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, error: false});
    API.PayIOU({
        reportID,
        paymentMethodType,
    })
        .then((data) => {
            if (data.jsonCode != 200) {
                console.error(data.message);
                return;
            }
        })
        .then(fetchChatReportsByIDs(chatReportID))
        .catch(() => Onyx.merge(ONYXKEYS.IOU, {error: true}))
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false}));
}

/**
 * Decline or cancel a transaction
 */
function rejectTransaction({
    reportID, transactionID, comment,
}) {
    console.debug('juless: rejectTransaction', {reportID, transactionID, comment});

    API.RejectTransaction({
        reportID,
        transactionID,
        comment,
    }).then((data) => {
        console.debug('juless: rejectedTransaction response: ', data);
    });
}

/**
 * @param {Object} action
 * @param {Object} originalMessage
 * @param {number} action.originalMessage.IOUReportID
 * @param {number} action.originalMessage.IOUTransactionID
 */
function launchDetailsFromIOUAction(action) {
    if (!action.originalMessage) {
        console.error('Error launching IOUDetailModal: reportAction `originalMessage` data not provided.');
        return;
    }
    if (action.originalMessage.IOUReportID) {
        Navigation.navigate(ROUTES.getIouDetailsRoute(action.originalMessage.IOUReportID));
    } else if (action.originalMessage.IOUTransactionID) {
        getIOUReportDetailFromTransactionID(action.originalMessage.IOUTransactionID);
    }
}

export {
    getPreferredCurrency,
    createIOUTransaction,
    createIOUSplit,
    launchDetailsFromIOUAction,
    rejectTransaction,
    settleIOUReport,
};
