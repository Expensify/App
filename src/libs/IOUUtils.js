import CONST from '../CONST';

/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * In case the owner/manager swap, we need to update the owner of the IOU report and the report total, since it is always positive.
 * For example: if user1 owes user2 $10, then we have: {ownerEmail: user2, managerEmail: user1, total: $10 (a positive amount, owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerEmail: user1, managerEmail: user2, total: $7 (still a positive amount, but now owed to user1)}
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
        iouReportUpdate.ownerEmail = iouReport.managerEmail;
        iouReportUpdate.managerEmail = iouReport.ownerEmail;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    return iouReportUpdate;
}

export {
    updateIOUOwnerAndTotal,
};