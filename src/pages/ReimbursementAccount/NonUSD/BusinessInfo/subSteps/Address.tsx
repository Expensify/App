import React, {useMemo} from 'react';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import getSubStepValues from '@pages/ReimbursementAccount/utils/getSubStepValues';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type AddressProps = SubStepProps;

const {COMPANY_STREET, COMPANY_POSTAL_CODE, COMPANY_STATE, COMPANY_CITY, COMPANY_COUNTRY_CODE} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

const INPUT_KEYS = {
    street: COMPANY_STREET,
    city: COMPANY_CITY,
    state: COMPANY_STATE,
    zipCode: COMPANY_POSTAL_CODE,
    country: COMPANY_COUNTRY_CODE,
};
const STEP_FIELDS = [COMPANY_STREET, COMPANY_CITY, COMPANY_STATE, COMPANY_POSTAL_CODE, COMPANY_COUNTRY_CODE];
const STEP_FIELDS_WITHOUT_STATE = [COMPANY_STREET, COMPANY_CITY, COMPANY_POSTAL_CODE, COMPANY_COUNTRY_CODE];

function Address({onNext, onMove, isEditing}: AddressProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const onyxValues = useMemo(() => getSubStepValues(INPUT_KEYS, reimbursementAccountDraft, reimbursementAccount), [reimbursementAccount, reimbursementAccountDraft]);

    const businessStepCountryDefaultValue = onyxValues[COMPANY_COUNTRY_CODE] ?? '';
    const countryStepCountryValue = reimbursementAccount?.achData?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const countryDefaultValue = businessStepCountryDefaultValue === '' ? countryStepCountryValue : businessStepCountryDefaultValue;
    const shouldDisplayStateSelector = countryDefaultValue === CONST.COUNTRY.US || countryDefaultValue === CONST.COUNTRY.CA;

    const defaultValues = {
        street: onyxValues[COMPANY_STREET] ?? '',
        city: onyxValues[COMPANY_CITY] ?? '',
        state: onyxValues[COMPANY_STATE] ?? '',
        zipCode: onyxValues[COMPANY_POSTAL_CODE] ?? '',
        country: countryDefaultValue,
    };

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
            shouldAllowCountryChange={false}
            shouldValidateZipCodeFormat={countryDefaultValue === CONST.COUNTRY.US}
        />
    );
}

export default Address;
