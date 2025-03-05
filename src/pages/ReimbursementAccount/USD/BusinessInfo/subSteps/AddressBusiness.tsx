import React from 'react';
import {useOnyx} from 'react-native-onyx';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

const COMPANY_BUSINESS_INFO_KEY = INPUT_IDS.BUSINESS_INFO_STEP;

const INPUT_KEYS = {
    street: COMPANY_BUSINESS_INFO_KEY.STREET,
    city: COMPANY_BUSINESS_INFO_KEY.CITY,
    state: COMPANY_BUSINESS_INFO_KEY.STATE,
    zipCode: COMPANY_BUSINESS_INFO_KEY.ZIP_CODE,
};

const STEP_FIELDS = [COMPANY_BUSINESS_INFO_KEY.STREET, COMPANY_BUSINESS_INFO_KEY.CITY, COMPANY_BUSINESS_INFO_KEY.STATE, COMPANY_BUSINESS_INFO_KEY.ZIP_CODE];

function AddressBusiness({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    const defaultValues = {
        street: reimbursementAccount?.achData?.addressStreet ?? '',
        city: reimbursementAccount?.achData?.addressCity ?? '',
        state: reimbursementAccount?.achData?.addressState ?? '',
        zipCode: reimbursementAccount?.achData?.addressZipCode ?? '',
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <AddressStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.enterYourCompanysAddress')}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={STEP_FIELDS}
            inputFieldsIDs={INPUT_KEYS}
            defaultValues={defaultValues}
            streetTranslationKey="common.companyAddress"
        />
    );
}

AddressBusiness.displayName = 'AddressBusiness';

export default AddressBusiness;
