import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import {getSimplifiedIOUReport, fetchChatReportsByIDs, fetchIOUReportByIDAndUpdateChatReport} from './Report';

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
        .catch(() => Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false, error: ''}))
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
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: ''});
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
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: ''});

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
 * Settles an IOU Report and then retrieves the iou and chat reports to trigger updates to the UI.
 */
function settleIOUReport({
    chatReportID, reportID, paymentMethodType,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, error: ''});
    API.PayIOU({
        reportID,
        paymentMethodType,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(`Error while settling IOU: ${response.message}`);
            }
        })
        .then(() => fetchChatReportsByIDs([chatReportID]))
        // Any report that is being settled must be open, and must be currently set as open iouReport within the
        // chatReport object. Therefore, we must also update the chatReport to break this existing link.
        .then(() => fetchIOUReportByIDAndUpdateChatReport(reportID, chatReportID))
        .catch(error => Onyx.merge(ONYXKEYS.IOU, {error}))
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false}));
}

export {
    getPreferredCurrency,
    createIOUTransaction,
    createIOUSplit,
    settleIOUReport,
};
