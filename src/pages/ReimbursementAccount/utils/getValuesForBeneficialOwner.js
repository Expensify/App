import lodashGet from 'lodash/get';
import CONST from '@src/CONST';

function getValuesForBeneficialOwner(beneficialOwnerBeingModifiedID, reimbursementAccountDraft) {
    const beneficialOwnerPrefix = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
    const beneficialOwnerInfoKey = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

    const INPUT_KEYS = {
        firstName: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.FIRST_NAME}`,
        lastName: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.LAST_NAME}`,
        dob: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.DOB}`,
        ssnLast4: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.SSN_LAST_4}`,
        street: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.STREET}`,
        city: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.CITY}`,
        state: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.STATE}`,
        zipCode: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.ZIP_CODE}`,
    };

    return {
        firstName: lodashGet(reimbursementAccountDraft, INPUT_KEYS.firstName, ''),
        lastName: lodashGet(reimbursementAccountDraft, INPUT_KEYS.lastName, ''),
        dob: lodashGet(reimbursementAccountDraft, INPUT_KEYS.dob, ''),
        ssnLast4: lodashGet(reimbursementAccountDraft, INPUT_KEYS.ssnLast4, ''),
        street: lodashGet(reimbursementAccountDraft, INPUT_KEYS.street, ''),
        city: lodashGet(reimbursementAccountDraft, INPUT_KEYS.city, ''),
        state: lodashGet(reimbursementAccountDraft, INPUT_KEYS.state, ''),
        zipCode: lodashGet(reimbursementAccountDraft, INPUT_KEYS.zipCode, ''),
    };
}

export default getValuesForBeneficialOwner;
