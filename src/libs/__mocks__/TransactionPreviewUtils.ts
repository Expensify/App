import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';

const chooseIdBasedOnAmount = (amount: number, negativeId: number, positiveId: number) => (amount < 0 ? negativeId : positiveId);

const emptyPersonalDetails: OnyxTypes.PersonalDetails = {
    accountID: CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    avatar: '',
    displayName: undefined,
    login: undefined,
};

function getIOUData(
    managerID: number,
    ownerAccountID: number,
    reportOrID: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report> | string | undefined,
    personalDetails: OnyxTypes.PersonalDetailsList | undefined,
    amount: number,
) {
    const fromID = chooseIdBasedOnAmount(amount, managerID, ownerAccountID);
    const toID = chooseIdBasedOnAmount(amount, ownerAccountID, managerID);

    const from = personalDetails ? personalDetails[fromID] : emptyPersonalDetails;
    const to = personalDetails ? personalDetails[toID] : emptyPersonalDetails;

    if (reportOrID && (typeof reportOrID === 'string' || reportOrID.type === CONST.REPORT.TYPE.IOU)) {
        return {from, to};
    }

    return undefined;
}

export {getTransactionPreviewTextAndTranslationPaths, createTransactionPreviewConditionals, getReviewNavigationRoute} from '../TransactionPreviewUtils';
export {getIOUData};
