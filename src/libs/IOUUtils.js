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

/**
 *
 */
function getIOUReportMessageText(iouReport, chatReport) {
    let text = '';
    const paymentType = message['paymentType'] ?? '';
    const type = message['type'] ?? '';
    const IOUDetails = message['IOUDetails'] ?? [];
    const isSendRequest = !empty(IOUDetails);
    const actorEmail = getActorEmail();
    const formattedAmount = isSendRequest
        ? ForexUtils::format(abs(IOUDetails['amount']), IOUDetails['currency'])
        : ForexUtils::format(abs((int) (message['amount'] ?? 0)), message['currency'] ?? '');

    let comment = message['comment'] ?? '';
    switch (type) {
        case self::IOU_ACTION_TYPE_PAY:
            if (isSendRequest) {
                comment = IOUDetails['comment'];
                text = 'Sent';
                text += $formattedAmount ? " {$formattedAmount}" : '';
                text += $formattedAmount && strlen($comment) ? " for {$comment}" : '';
            } else {
                text = 'Settled up';
            }
            if (paymentType === self::PAYMENT_TYPE_PAYPAL_ME) {
                text += ' using PayPal.me';
            } else if (paymentType === self::PAYMENT_TYPE_VENMO) {
            text += ' using Venmo';
        } else if ($paymentType === self::PAYMENT_TYPE_EXPENSIFY) {
            text += '!';
        } else {
            text += ' elsewhere';
        }
            break;
        case self::IOU_ACTION_TYPE_CREATE:
        case self::IOU_ACTION_TYPE_SPLIT:
            let who;
            if (isset(message['participants'])) {
                who = ArrayUtils::filter(message['participants'], fn (string $email): bool => $email !== $actorEmail);
            } else {
                // Newer actions have the participants in the message, but old ones do not
                const actorAuthToken = AuthTokenManager::getEmailToken($actorEmail);
                const chatReport = ReportStore::getByID($actorAuthToken, $this->getReportID(), true);
                who = chatReport->getParticipants([$actorEmail, '__FAKE__', EMAIL_ACCOUNT_ID_0]);
            }
            who = array_values(ArrayUtils::map(PersonalDetailsStore::getByEmails(who), fn (PersonalDetail $personalDetail) => $personalDetail->getFirstName() ?: $personalDetail->getEmail()));
            if (count(who) === 1) {
                who = who[0];
            } else {
                who = implode(', ', array_slice(who, 0, -1)).' and '.who[count(who) - 1];
            }
            if ($type === 'create') {
                message = "Requested $formattedAmount from who".(strlen($comment) ? " for {$comment}" : '');
            } else {
                message = "Split $formattedAmount with who".(strlen($comment) ? " for {$comment}" : '');
            }
            break;
        case self::IOU_ACTION_TYPE_CANCEL:
            message = "Cancelled the $formattedAmount request".(strlen($comment) ? " for {$comment}" : '');
            break;
        case self::IOU_ACTION_TYPE_DECLINE:
            message = "Declined the $formattedAmount request".(strlen($comment) ? " for {$comment}" : '');
            break;
        default:
            // This should only be hit for actions created before we standardized on having `type`
            message = 'This action was taken on old code and is not supported anymore';
            break;
    }
    messages = [];
    if (message) {
        messages[] = ReportUtils::createHTMLCommentFragment(message, []);
    }
    return messages;
}

export {
    calculateAmount,
    updateIOUOwnerAndTotal,
};
