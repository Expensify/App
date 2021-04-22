import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import {getSimplifiedIOUReport} from './Report';

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
 * @param {Array} reportIds
 * @returns {Promise}
 * Gets the IOU Reports for new transaction
 */
function getIOUReportsForNewTransaction(reportIds) {
    return API.Get({
        returnValueList: 'reportStuff',
        reportIDList: reportIds,
        shouldLoadOptionalKeys: true,
        includePinnedReports: true,
    })
        .then(({reports}) => _.map(reports, getSimplifiedIOUReport))
        .then((iouReportObjects) => {
            const reportIOUData = {};

            if (iouReportObjects.length === 1) {
                const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportObjects[0].reportID}`;
                return Onyx.merge(iouReportKey,
                    getSimplifiedIOUReport(iouReportObjects[0]));
            }

            _.each(iouReportObjects, (iouReportObject) => {
                if (!iouReportObject) {
                    return;
                }
                const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportObject.reportID}`;
                reportIOUData[iouReportKey] = iouReportObject;
            });
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, {...reportIOUData});
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
        .then(data => data.reportID)
        .then(reportID => getIOUReportsForNewTransaction([reportID]));
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
            reportID: data.data,
        }))
        .then(data => getIOUReportsForNewTransaction(data.reportIDList));
}

export {
    getPreferredCurrency,
    createIOUTransaction,
    createIOUSplit,
};
