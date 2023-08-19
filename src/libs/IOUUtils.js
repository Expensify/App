import _ from 'underscore';
import CONST from '../CONST';
import * as TransactionUtils from './TransactionUtils';
import * as CurrencyUtils from './CurrencyUtils';

/**
 * Calculates the amount per user given a list of participants
 *
 * @param {Number} numberOfParticipants - Number of participants in the chat. It should not include the current user.
 * @param {Number} total - IOU total amount in backend format (cents, no matter the currency)
 * @param {String} currency - This is used to know how many decimal places are valid to use when splitting the total
 * @param {Boolean} isDefaultUser - Whether we are calculating the amount for the current user
 * @returns {Number}
 */
function calculateAmount(numberOfParticipants, total, currency, isDefaultUser = false) {
    // Since the backend can maximum store 2 decimal places, any currency with more than 2 decimals
    // has to be capped to 2 decimal places
    const currencyUnit = Math.min(100, CurrencyUtils.getCurrencyUnit(currency));
    const totalInCurrencySubunit = Math.round((total / 100) * currencyUnit);
    const totalParticipants = numberOfParticipants + 1;
    const amountPerPerson = Math.round(totalInCurrencySubunit / totalParticipants);
    let finalAmount = amountPerPerson;
    if (isDefaultUser) {
        const sumAmount = amountPerPerson * totalParticipants;
        const difference = totalInCurrencySubunit - sumAmount;
        finalAmount = totalInCurrencySubunit !== sumAmount ? amountPerPerson + difference : amountPerPerson;
    }
    return Math.round((finalAmount * 100) / currencyUnit);
}

/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * In case the owner/manager swap, we need to update the owner of the IOU report and the report total, since it is always positive.
 * For example: if user1 owes user2 $10, then we have: {ownerAccountID: user2, managerID: user1, total: $10 (a positive amount, owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerAccountID: user1, managerID: user2, total: $7 (still a positive amount, but now owed to user1)}
 *
 * @param {Object} iouReport
 * @param {Number} actorAccountID
 * @param {Number} amount
 * @param {String} currency
 * @param {String} isDeleting - whether the user is deleting the request
 * @returns {Object}
 */
function updateIOUOwnerAndTotal(iouReport, actorAccountID, amount, currency, isDeleting = false) {
    if (currency !== iouReport.currency) {
        return iouReport;
    }

    // Make a copy so we don't mutate the original object
    const iouReportUpdate = {...iouReport};

    if (actorAccountID === iouReport.ownerAccountID) {
        iouReportUpdate.total += isDeleting ? -amount : amount;
    } else {
        iouReportUpdate.total += isDeleting ? amount : -amount;
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerAccountID = iouReport.managerID;
        iouReportUpdate.managerID = iouReport.ownerAccountID;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    iouReportUpdate.hasOutstandingIOU = iouReportUpdate.total !== 0;

    return iouReportUpdate;
}

/**
 * Returns whether or not an IOU report contains money requests in a different currency
 * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
 *
 * @param {Object} iouReport
 * @returns {Boolean}
 */
function isIOUReportPendingCurrencyConversion(iouReport) {
    const reportTransactions = TransactionUtils.getAllReportTransactions(iouReport.reportID);
    const pendingRequestsInDifferentCurrency = _.filter(reportTransactions, (transaction) => transaction.pendingAction && TransactionUtils.getCurrency(transaction) !== iouReport.currency);
    return pendingRequestsInDifferentCurrency.length > 0;
}

/**
 * Checks if the iou type is one of request, send, or split.
 * @param {String} iouType
 * @returns {Boolean}
 */
function isValidMoneyRequestType(iouType) {
    return [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST, CONST.IOU.MONEY_REQUEST_TYPE.SPLIT].includes(iouType);
}

export {calculateAmount, updateIOUOwnerAndTotal, isIOUReportPendingCurrencyConversion, isValidMoneyRequestType};
