import React, {useMemo} from 'react';
import {useOnyx} from 'react-native-onyx';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getSubstepValues from '@pages/ReimbursementAccount/utils/getSubstepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type AddressProps = SubStepProps;

const {COMPANY_STREET, COMPANY_ZIP_CODE, COMPANY_STATE, COMPANY_CITY, COMPANY_COUNTRY} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const INPUT_KEYS = {
    street: COMPANY_STREET,
    city: COMPANY_CITY,
    state: COMPANY_STATE,
    zipCode: COMPANY_ZIP_CODE,
    country: COMPANY_COUNTRY,
};
const STEP_FIELDS = [COMPANY_STREET, COMPANY_CITY, COMPANY_STATE, COMPANY_ZIP_CODE, COMPANY_COUNTRY];
const STEP_FIELDS_WITHOUT_STATE = [COMPANY_STREET, COMPANY_CITY, COMPANY_ZIP_CODE, COMPANY_COUNTRY];

function Address({onNext, onMove, isEditing}: AddressProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const onyxValues = useMemo(() => getSubstepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const businessStepCountryDraftValue = onyxValues[COMPANY_COUNTRY];
    const countryStepCountryDraftValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const countryInitialValue =
        businessStepCountryDraftValue !== '' && businessStepCountryDraftValue !== countryStepCountryDraftValue ? businessStepCountryDraftValue : countryStepCountryDraftValue;

    const defaultValues = {
        street: onyxValues[COMPANY_STREET] ?? '',
        city: onyxValues[COMPANY_CITY] ?? '',
        state: onyxValues[COMPANY_STATE] ?? '',
        zipCode: onyxValues[COMPANY_ZIP_CODE] ?? '',
        country: onyxValues[COMPANY_COUNTRY] ?? countryInitialValue,
    };

    const shouldDisplayStateSelector = defaultValues.country === CONST.COUNTRY.US || defaultValues.country === CONST.COUNTRY.CA || defaultValues.country === '';
    const stepFields = shouldDisplayStateSelector ? STEP_FIELDS : STEP_FIELDS_WITHOUT_STATE;

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <AddressStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.whatsTheBusinessAddress')}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={stepFields}
            inputFieldsIDs={INPUT_KEYS}
            defaultValues={defaultValues}
            shouldDisplayStateSelector={shouldDisplayStateSelector}
            shouldDisplayCountrySelector
        />
    );
}

Address.displayName = 'Address';

export default Address;
