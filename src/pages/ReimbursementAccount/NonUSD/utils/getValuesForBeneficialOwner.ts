import type {OnyxEntry} from 'react-native-onyx';
import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';

type BeneficialOwnerValues = {
    firstName: string;
    lastName: string;
    ownershipPercentage: string;
    dob: string;
    ssnLast4: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
};

function getValuesForOwner(beneficialOwnerBeingModifiedID: string, reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>): BeneficialOwnerValues {
    if (!reimbursementAccountDraft) {
        return {
            firstName: '',
            lastName: '',
            ownershipPercentage: '',
            dob: '',
            ssnLast4: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: '',
        };
    }
    const beneficialOwnerPrefix = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
    const beneficialOwnerInfoKey = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

    const INPUT_KEYS = {
        firstName: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.FIRST_NAME}`,
        lastName: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.LAST_NAME}`,
        ownershipPercentage: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.OWNERSHIP_PERCENTAGE}`,
        dob: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.DOB}`,
        ssnLast4: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.SSN_LAST_4}`,
        street: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.STREET}`,
        city: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.CITY}`,
        state: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.STATE}`,
        zipCode: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.ZIP_CODE}`,
        country: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.COUNTRY}`,
    } as const;

    return {
        firstName: reimbursementAccountDraft[INPUT_KEYS.firstName] ?? '',
        lastName: reimbursementAccountDraft[INPUT_KEYS.lastName] ?? '',
        ownershipPercentage: reimbursementAccountDraft[INPUT_KEYS.ownershipPercentage] ?? '',
        dob: reimbursementAccountDraft[INPUT_KEYS.dob] ?? '',
        ssnLast4: reimbursementAccountDraft[INPUT_KEYS.ssnLast4] ?? '',
        street: reimbursementAccountDraft[INPUT_KEYS.street] ?? '',
        city: reimbursementAccountDraft[INPUT_KEYS.city] ?? '',
        state: reimbursementAccountDraft[INPUT_KEYS.state] ?? '',
        zipCode: reimbursementAccountDraft[INPUT_KEYS.zipCode] ?? '',
        country: reimbursementAccountDraft[INPUT_KEYS.country] ?? '',
    };
}

export default getValuesForOwner;
