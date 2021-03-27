import Onyx from 'react-native-onyx';
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
    Onyx.merge(ONYXKEYS.IOU, {loading: true});
    let iouReportID = '';
    API.CreateIOUTransaction({
        comment,
        amount,
        currency,
        debtorEmail,
    })
        .then((data) => {
            iouReportID = data.reportID;
            return iouReportID;
        })
        .then(reportID => API.Get({
            returnValueList: 'reportStuff',
            reportIDList: reportID,
            shouldLoadOptionalKeys: true,
            includePinnedReports: true,
        }))
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            const iouReportData = response.reports[iouReportID];
            if (!iouReportData) {
                throw new Error(`No iouReportData found for reportID ${iouReportID}`);
            }

            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportID}`,
                getSimplifiedIOUReport(iouReportData));

            Onyx.merge(ONYXKEYS.IOU, {loading: false});
        })
        .catch((error) => {
            console.debug(`[Report] Failed to populate IOU Collection: ${error.message}`);
        });
}

/**
 * Creates IOUSplit Transaction
 * @param {Object} parameters
 * @param {Array} parameters.participants
 * @param {Array} parameters.splits
 * @param {String} parameters.comment
 * @param {String} parameters.amount
 * @param {String} parameters.currency
 */
function createIOUSplit({
    participants,
    comment,
    amount,
    currency,
    splits,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true});
    API.CreateChatReport({
        emailList: participants.join(','),
    })
        .then(data => data.reportID)
        .then(reportID => API.CreateIOUSplit({
            splits: JSON.stringify(splits),
            currency,
            amount,
            comment,
            reportID,
        }))
        .then((res) => {
            console.debug('Response from CreateIOUSplit', res);
            Onyx.merge(ONYXKEYS.IOU, {loading: false}); // placeholder
        })
        .catch((error) => {
            console.debug(`Error: ${error.message}`);
            Onyx.merge(ONYXKEYS.IOU, {loading: false});
        });
}

export {
    getPreferredCurrency,
    createIOUTransaction,
    createIOUSplit,
};
