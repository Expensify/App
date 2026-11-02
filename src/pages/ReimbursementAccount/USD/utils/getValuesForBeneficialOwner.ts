import CONST from '@src/CONST';
import type {ReimbursementAccountForm} from '@src/types/form';

import type {OnyxEntry} from 'react-native-onyx';

import {SafeString} from 'expensify-common';

type BeneficialOwnerValues = {
    firstName: string;
    lastName: string;
    email: string;
    dob: string;
    ssnLast4: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
};

function getValuesForBeneficialOwner(beneficialOwnerBeingModifiedID: string, reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>): BeneficialOwnerValues {
    if (!reimbursementAccountDraft) {
        return {
            firstName: '',
            lastName: '',
            email: '',
            dob: '',
            ssnLast4: '',
            street: '',
            city: '',
            state: '',
            zipCode: '',
        };
    }
    const beneficialOwnerPrefix = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;
    const beneficialOwnerInfoKey = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

    const INPUT_KEYS = {
        firstName: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.FIRST_NAME}`,
        lastName: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.LAST_NAME}`,
        email: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.EMAIL}`,
        dob: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.DOB}`,
        ssnLast4: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.SSN_LAST_4}`,
        street: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.STREET}`,
        city: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.CITY}`,
        state: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.STATE}`,
        zipCode: `${beneficialOwnerPrefix}_${beneficialOwnerBeingModifiedID}_${beneficialOwnerInfoKey.ZIP_CODE}`,
    } as const;

    return {
        firstName: SafeString(reimbursementAccountDraft[INPUT_KEYS.firstName]),
        lastName: SafeString(reimbursementAccountDraft[INPUT_KEYS.lastName]),
        email: SafeString(reimbursementAccountDraft[INPUT_KEYS.email]),
        dob: SafeString(reimbursementAccountDraft[INPUT_KEYS.dob]),
        ssnLast4: SafeString(reimbursementAccountDraft[INPUT_KEYS.ssnLast4]),
        street: SafeString(reimbursementAccountDraft[INPUT_KEYS.street]),
        city: SafeString(reimbursementAccountDraft[INPUT_KEYS.city]),
        state: SafeString(reimbursementAccountDraft[INPUT_KEYS.state]),
        zipCode: SafeString(reimbursementAccountDraft[INPUT_KEYS.zipCode]),
    };
}

export default getValuesForBeneficialOwner;
