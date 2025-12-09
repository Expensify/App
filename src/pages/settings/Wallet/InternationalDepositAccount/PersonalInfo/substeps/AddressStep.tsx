import React, {useCallback, useMemo, useState} from 'react';
import CommonAddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePersonalBankAccountDetailsFormSubmit from '@hooks/usePersonalBankAccountDetailsFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getCurrentAddress} from '@libs/PersonalDetailsUtils';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/PersonalBankAccountForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.BANK_INFO_STEP;

const INPUT_KEYS = {
    street: PERSONAL_INFO_STEP_KEY.STREET,
    city: PERSONAL_INFO_STEP_KEY.CITY,
    state: PERSONAL_INFO_STEP_KEY.STATE,
    zipCode: PERSONAL_INFO_STEP_KEY.ZIP_CODE,
};

const STEP_FIELDS_WITH_STATE = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.STATE, PERSONAL_INFO_STEP_KEY.ZIP_CODE, PERSONAL_INFO_STEP_KEY.COUNTRY];
const STEP_FIELDS_WITHOUT_STATE = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.ZIP_CODE, PERSONAL_INFO_STEP_KEY.COUNTRY];

function AddressStep({onNext, onMove, isEditing}: SubStepProps) {
    const {translate} = useLocalize();

    const [privatePersonalDetails] = useOnyx(ONYXKEYS.PRIVATE_PERSONAL_DETAILS, {canBeMissing: true});
    const [bankAccountPersonalDetails] = useOnyx(ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const currentAddress = getCurrentAddress(privatePersonalDetails);

    const defaultValues = useMemo(
        () => ({
            street: bankAccountPersonalDetails?.addressStreet ?? currentAddress?.street ?? '',
            city: bankAccountPersonalDetails?.addressCity ?? currentAddress?.city ?? '',
            state: bankAccountPersonalDetails?.addressState ?? currentAddress?.state ?? '',
            zipCode: bankAccountPersonalDetails?.addressZipCode ?? currentAddress?.zip ?? '',
            country: (bankAccountPersonalDetails?.country ?? currentAddress?.country ?? '') as Country | '',
        }),
        [
            bankAccountPersonalDetails?.addressCity,
            bankAccountPersonalDetails?.addressState,
            bankAccountPersonalDetails?.addressStreet,
            bankAccountPersonalDetails?.addressZipCode,
            bankAccountPersonalDetails?.country,
            currentAddress?.city,
            currentAddress?.country,
            currentAddress?.state,
            currentAddress?.street,
            currentAddress?.zip,
        ],
    );
    // Has to be stored in state and updated on country change due to the fact that we can't relay on onyxValues when user is editing the form (draft values are not being saved in that case)
    const [shouldDisplayStateSelector, setShouldDisplayStateSelector] = useState<boolean>(
        defaultValues?.country === CONST.COUNTRY.US || defaultValues?.country === CONST.COUNTRY.CA || defaultValues?.country === '',
    );
    const [shouldValidateZipCodeFormat, setShouldValidateZipCodeFormat] = useState<boolean>(defaultValues?.country === CONST.COUNTRY.US);

    const stepFields = shouldDisplayStateSelector ? STEP_FIELDS_WITH_STATE : STEP_FIELDS_WITHOUT_STATE;

    const handleCountryChange = useCallback((country: unknown) => {
        if (typeof country !== 'string' || country === '') {
            return;
        }
        setShouldDisplayStateSelector(country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA);
        setShouldValidateZipCodeFormat(country === CONST.COUNTRY.US);
    }, []);

    const handleSubmit = usePersonalBankAccountDetailsFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <CommonAddressStep<typeof ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.PERSONAL_BANK_ACCOUNT_FORM}
            formTitle={translate('personalInfoStep.whatsYourAddress')}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={stepFields}
            defaultValues={defaultValues}
            inputFieldsIDs={INPUT_KEYS}
            onCountryChange={handleCountryChange}
            shouldDisplayStateSelector={shouldDisplayStateSelector}
            shouldDisplayCountrySelector
            shouldValidateZipCodeFormat={shouldValidateZipCodeFormat}
        />
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
