import Onyx from 'react-native-onyx';
import _ from 'underscore';
import ONYXKEYS from '../../ONYXKEYS';
import * as API from '../API';
import {getSimplifiedIOUReport} from './Report';
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
 * @param {Object} parameters
 * @param {String} parameters.amount
 * @param {String} parameters.comment
 * @param {String} parameters.currency
 * @param {String} parameters.debtorEmail
 */
function createIOUTransaction({
    comment, amount, currency, debtorEmail,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});
    API.CreateIOUTransaction({
        comment,
        amount,
        currency,
        debtorEmail,
    })
        .then(data => data.reportID)
        .then(reportID => getIOUReportsForNewTransaction([reportID]));
}

/**
 * Creates IOUSplit Transaction
 * @param {Object} parameters
 * @param {Array} parameters.splits
 * @param {String} parameters.comment
 * @param {String} parameters.amount
 * @param {String} parameters.currency
 */
function createIOUSplit({
    comment,
    amount,
    currency,
    splits,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});

    API.CreateChatReport({
        emailList: splits.map(participant => participant.email).join(','),
    })
        .then((data) => {
            console.debug(data);
            return data.reportID;
        })
        .then(reportID => API.CreateIOUSplit({
            splits: JSON.stringify(splits),
            currency,
            amount,
            comment,
            reportID,
        }))
        .then(data => data.reportIDList)
        .then(reportIDList => getIOUReportsForNewTransaction(reportIDList));
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
    reportID, paymentMethodType,
}) {
    // Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});
    console.debug('juless: settleIOUReport', {reportID, paymentMethodType});

    API.PayIOU({
        reportID,
        paymentMethodType,
    })
        .then((data) => {
            console.debug('juless: IOU Settled: ', data);
        });
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
