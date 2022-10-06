/**
 * Calculates the amount per user given a list of participants
 * @param {Array} participants
 * @param {Int} total
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

export {
    // eslint-disable-next-line import/prefer-default-export
    calculateAmount,
};
