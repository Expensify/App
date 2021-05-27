import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import {
    getSimplifiedIOUReport,
    fetchChatReportsByIDs,
    fetchIOUReportByIDAndUpdateChatReport,
} from './Report';

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
        reportIDList: _.pluck(requestParams, 'reportID').join(','),
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
        .catch(() => Onyx.merge(ONYXKEYS.IOU, {error: true}))
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
 * Fetch both the chatReport and associated iouReport. Both reports need to be fetched after the user triggers an IOU
 * action, to ensure that Components are re-rendered with the updated report data.
 *
 * @param {Number} chatReportID
 * @param {Number} iouReportID
 *
 * @private
 */
 function fetchChatAndIOUReportsAndUpdateChatReport(chatReportID, iouReportID) {
    fetchChatReportsByIDs([chatReportID]);

    // If an iouReport is open (has an IOU, but is not yet paid) then we sync the chatReport's 'iouReportID'
    // field in Onyx, simplifying IOU data retrieval and reducing necessary API calls when displaying IOU
    // components. If we didn't sync the reportIDs, the paid IOU would still be shown to users as unpaid. 
    // In this case, the iouReport being fetched here must be open, because only an open iouReoport can be paid.
    // Therefore, we should also sync the chatReport after fetching the iouReport.
    fetchIOUReportByIDAndUpdateChatReport(iouReportID, chatReportID);
}

/**
 * Reject an iouReport transaction. Declining and cancelling transactions are done via the same Auth command.
 *
 * @param {Object} params
 * @param {Number} params.number
 * @param {Number} params.number
 * @param {String} params.number
 */
function rejectTransaction({
    reportID, chatReportID, transactionID, comment,
}) {
    API.RejectTransaction({
        reportID,
        transactionID,
        comment,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(`${response.code} ${response.message}`);
            }
            fetchChatAndIOUReportsAndUpdateChatReport(chatReportID, reportID);
        })
        .catch(error => console.error(`Error rejecting transaction: ${error}`));
}

/**
 * Pays an IOU Report and then retrieves the iou and chat reports to trigger updates to the UI.
 */
function payIOUReport({
    chatReportID, reportID, paymentMethodType,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, error: false});
    API.PayIOU({
        reportID,
        paymentMethodType,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }
            fetchChatAndIOUReportsAndUpdateChatReport(chatReportID, reportID);
        })
        .catch((error) => {
            console.error(`Error Paying iouReport: ${error}`);
            Onyx.merge(ONYXKEYS.IOU, {error: true});
        })
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false}));
}

export {
    getPreferredCurrency,
    createIOUTransaction,
    createIOUSplit,
    rejectTransaction,
    payIOUReport,
};
