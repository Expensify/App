import CONST from "../CONST";

/**
 * Calculates the amount per user given a list of participants
 * @param {Array} participants
 * @param {Number} total
 * @param {Boolean} isDefaultUser
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

    if (!isDefaultUser) { return amountPerPerson; }

    const sumAmount = amountPerPerson * totalParticipants;
    const difference = iouAmount - sumAmount;

    return iouAmount !== sumAmount ? (amountPerPerson + difference) : amountPerPerson;
}

/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * We need to update the owner and the report total in case the owner/manager swap.
 * For example: if user1 owes user2 $10, then we have: {ownerEmail: user2, managerEmail: user1, total: $10 (owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerEmail: user1, managerEmail: user2, total: $7 (owed to user1)}
 *
 * @param {Object} iouReport
 * @param {String} actorEmail
 * @param {Number} amount
 * @param {String} type
 * @returns {Object}
 */
function updateIOUOwnerAndTotal(iouReport, actorEmail, amount, type = CONST.IOU.REPORT_ACTION_TYPE.CREATE) {
    const iouReportUpdate = {...iouReport};

    if (actorEmail === iouReport.ownerEmail) {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? -amount : amount;
    } else {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? amount : -amount;
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        const oldOwnerEmail = iouReport.ownerEmail;
        iouReportUpdate.ownerEmail = iouReport.managerEmail;
        iouReportUpdate.managerEmail = oldOwnerEmail;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    return iouReportUpdate;
}

export {
    calculateAmount,
    updateIOUOwnerAndTotal,
};
