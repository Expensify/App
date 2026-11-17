import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const emptyPersonalDetails: OnyxTypes.PersonalDetails = {
    accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

/**
 * Returns the data for displaying payer and receiver (`from` and `to`) values for given ids and amount.
 * In IOU transactions we can deduce who is the payer and receiver based on sign (positive/negative) of the amount.
 */
function getIOUPayerAndReceiver(managerID: number, ownerAccountID: number, personalDetails: OnyxTypes.PersonalDetailsList | undefined, amount: number) {
    let fromID = ownerAccountID;
    let toID = managerID;

    if (amount < 0) {
        fromID = managerID;
        toID = ownerAccountID;
    }

    return {
        from: personalDetails ? personalDetails[fromID] : emptyPersonalDetails,
        to: personalDetails ? personalDetails[toID] : emptyPersonalDetails,
    };
}

export default getIOUPayerAndReceiver;
