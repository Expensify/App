import _ from 'underscore';
import CONST from '../CONST';

/**
 * Calculates the amount per user given a list of participants
 * @param {Array} participants - List of logins for the participants in the chat. It should not include the current user's login.
 * @param {Number} total - IOU total amount
 * @param {Boolean} isDefaultUser - Whether we are calculating the amount for the current user
 * @returns {Number}
 */
function calculateAmount(participants, total, isDefaultUser = false) {
    // Convert to cents before working with iouAmount to avoid
    // javascript subtraction with decimal problem -- when dealing with decimals,
    // because they are encoded as IEEE 754 floating point numbers, some of the decimal
    // numbers cannot be represented with perfect accuracy.
    // Cents is temporary and there must be support for other currencies in the future
    const iouAmount = Math.round(parseFloat(total * 100));
    const totalParticipants = participants.length + 1;
    const amountPerPerson = Math.round(iouAmount / totalParticipants);

    if (!isDefaultUser) {
        return amountPerPerson;
    }

    const sumAmount = amountPerPerson * totalParticipants;
    const difference = iouAmount - sumAmount;

    return iouAmount !== sumAmount ? (amountPerPerson + difference) : amountPerPerson;
}

/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * In case the owner/manager swap, we need to update the owner of the IOU report and the report total, since it is always positive.
 * For example: if user1 owes user2 $10, then we have: {ownerEmail: user2, managerEmail: user1, total: $10 (a positive amount, owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerEmail: user1, managerEmail: user2, total: $7 (still a positive amount, but now owed to user1)}
 *
 * @param {Object} iouReport
 * @param {String} actorEmail
 * @param {Number} amount
 * @param {String} currency
 * @param {String} type
 * @returns {Object}
 */
function updateIOUOwnerAndTotal(iouReport, actorEmail, amount, currency, type = CONST.IOU.REPORT_ACTION_TYPE.CREATE) {
    if (currency !== iouReport.currency) {
        return iouReport;
    }

    const iouReportUpdate = {...iouReport};

    if (actorEmail === iouReport.ownerEmail) {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? -amount : amount;
    } else {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? amount : -amount;
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerEmail = iouReport.managerEmail;
        iouReportUpdate.managerEmail = iouReport.ownerEmail;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    return iouReportUpdate;
}

function getPendingIOUReportActionsInDifferentCurrency(reportIOUActions, iouReport, type) {
    return _.chain(reportIOUActions)
        .filter(action => action.originalMessage
            && action.originalMessage.IOUReportID.toString() === iouReport.reportID.toString()
            && action.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD
            && action.originalMessage.currency !== iouReport.currency
            && action.originalMessage.type === type)
        .map(action => action.originalMessage.IOUTransactionID)
        .value();
}

function isIOUReportPendingCurrencyConversion(reportActions, iouReport) {
    const pendingRequestsInDifferentCurrency = getPendingIOUReportActionsInDifferentCurrency(
        reportActions,
        iouReport,
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
    );

    const pendingCancelledRequestsInDifferentCurrency = getPendingIOUReportActionsInDifferentCurrency(
        reportActions,
        iouReport,
        CONST.IOU.REPORT_ACTION_TYPE.CANCEL,
    );

    // If we have pending requests in a different currency and all of them have been cancelled,
    // Then the report is not pending any conversion from the backend
    // in this case areAllRequestInDifferentCurrencyCancelled should be true, and we should return false.
    if (pendingRequestsInDifferentCurrency.length) {
        const areAllRequestsInDifferentCurrencyCancelled = _.every(
            pendingRequestsInDifferentCurrency,
            requestTransactionID => _.contains(pendingCancelledRequestsInDifferentCurrency, requestTransactionID),
        );
        return !areAllRequestsInDifferentCurrencyCancelled;
    }

    // We have pending cancelled requests, this means we're waiting for conversion from the backend.
    return pendingCancelledRequestsInDifferentCurrency.length !== 0;
}

export {
    calculateAmount,
    updateIOUOwnerAndTotal,
    isIOUReportPendingCurrencyConversion,
};
