import CONST from '@src/CONST';

function isOtherCorpayPicklistSelection(selectedName: string, field: keyof typeof CONST.NON_USD_BANK_ACCOUNT.BUSINESS_INFO_STEP.OTHER_PICKLIST_VALUES): boolean {
    // Auth validates the picklist identifiers, not the labels shown to users.
    return selectedName === CONST.NON_USD_BANK_ACCOUNT.BUSINESS_INFO_STEP.OTHER_PICKLIST_VALUES[field];
}

export default isOtherCorpayPicklistSelection;
