import React, {useMemo, useState} from 'react';
import AddressStep from '@components/SubStepForms/AddressStep';
import useEnterSignerInfoStepFormSubmit from '@hooks/useEnterSignerInfoStepFormSubmit';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/EnterSignerInfoForm';

function Address({onNext, isEditing, onMove}: SubStepProps) {
    const {translate} = useLocalize();
    const [enterSignerInfoFormDraft] = useOnyx(ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM_DRAFT, {canBeMissing: false});

    const inputKeys = {
        street: INPUT_IDS.SIGNER_STREET,
        city: INPUT_IDS.SIGNER_CITY,
        state: INPUT_IDS.SIGNER_STATE,
        zipCode: INPUT_IDS.SIGNER_ZIP_CODE,
        country: INPUT_IDS.SIGNER_COUNTRY,
    } as const;

    const defaultValues = {
        street: String(enterSignerInfoFormDraft?.[inputKeys.street] ?? ''),
        city: String(enterSignerInfoFormDraft?.[inputKeys.city] ?? ''),
        state: String(enterSignerInfoFormDraft?.[inputKeys.state] ?? ''),
        zipCode: String(enterSignerInfoFormDraft?.[inputKeys.zipCode] ?? ''),
        country: (enterSignerInfoFormDraft?.[inputKeys.country] ?? '') as Country | '',
    };

    const formTitle = translate('ownershipInfoStep.whatsYourAddress');

    // Has to be stored in state and updated on country change due to the fact that we can't relay on onyxValues when user is editing the form (draft values are not being saved in that case)
    const [shouldDisplayStateSelector, setShouldDisplayStateSelector] = useState<boolean>(
        defaultValues.country === CONST.COUNTRY.US || defaultValues.country === CONST.COUNTRY.CA || defaultValues.country === '',
    );
    const [shouldValidateZipCodeFormat, setShouldValidateZipCodeFormat] = useState<boolean>(defaultValues.country === CONST.COUNTRY.US);

    const stepFieldsWithState = useMemo(
        () => [inputKeys.street, inputKeys.city, inputKeys.state, inputKeys.zipCode, inputKeys.country],
        [inputKeys.country, inputKeys.city, inputKeys.state, inputKeys.street, inputKeys.zipCode],
    );
    const stepFieldsWithoutState = useMemo(
        () => [inputKeys.street, inputKeys.city, inputKeys.zipCode, inputKeys.country],
        [inputKeys.country, inputKeys.city, inputKeys.street, inputKeys.zipCode],
    );

    const stepFields = shouldDisplayStateSelector ? stepFieldsWithState : stepFieldsWithoutState;

    const handleCountryChange = (country: unknown) => {
        if (typeof country !== 'string' || country === '') {
            return;
        }
        setShouldDisplayStateSelector(country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA);
        setShouldValidateZipCodeFormat(country === CONST.COUNTRY.US);
    };

    const handleSubmit = useEnterSignerInfoStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <AddressStep<typeof ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.ENTER_SINGER_INFO_FORM}
            formTitle={formTitle}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={stepFields}
            inputFieldsIDs={inputKeys}
            defaultValues={defaultValues}
            onCountryChange={handleCountryChange}
            shouldDisplayStateSelector={shouldDisplayStateSelector}
            shouldDisplayCountrySelector
            shouldValidateZipCodeFormat={shouldValidateZipCodeFormat}
        />
    );
}

export default Address;
