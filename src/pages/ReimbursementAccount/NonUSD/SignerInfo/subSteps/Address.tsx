import React, {useMemo, useState} from 'react';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type NameProps = SubStepProps;

const {STREET, CITY, STATE, ZIP_CODE, COUNTRY} = CONST.NON_USD_BANK_ACCOUNT.SIGNER_INFO_STEP.SIGNER_INFO_DATA;

function Address({onNext, isEditing, onMove}: NameProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});

    const inputKeys = {
        street: STREET,
        city: CITY,
        state: STATE,
        zipCode: ZIP_CODE,
        country: COUNTRY,
    } as const;

    const defaultValues = {
        street: String(reimbursementAccountDraft?.[inputKeys.street] ?? ''),
        city: String(reimbursementAccountDraft?.[inputKeys.city] ?? ''),
        state: String(reimbursementAccountDraft?.[inputKeys.state] ?? ''),
        zipCode: String(reimbursementAccountDraft?.[inputKeys.zipCode] ?? ''),
        country: (reimbursementAccountDraft?.[inputKeys.country] ?? '') as Country | '',
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

    const handleNextStep = () => {
        // owner is US based we need to gather last four digits of his SSN
        if (reimbursementAccountDraft?.[inputKeys.country] === CONST.COUNTRY.US) {
            onNext();
            // owner is not US based so we skip SSN step
        } else {
            onMove(4, false);
        }
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext: handleNextStep,
        shouldSaveDraft: isEditing,
    });

    return (
        <AddressStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
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
