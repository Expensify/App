import React, {useMemo, useState} from 'react';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import SafeString from '@src/utils/SafeString';

type NameProps = SubStepProps & {isUserEnteringHisOwnData: boolean; ownerBeingModifiedID: string};

const {STREET, CITY, STATE, ZIP_CODE, COUNTRY, NATIONALITY, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Address({onNext, isEditing, onMove, isUserEnteringHisOwnData, ownerBeingModifiedID}: NameProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT, {canBeMissing: true});
    const countryStepCountryValue = reimbursementAccountDraft?.[INPUT_IDS.ADDITIONAL_DATA.COUNTRY] ?? '';
    const nationalityInputKey = `${PREFIX}_${ownerBeingModifiedID}_${NATIONALITY}` as const;
    const nationality = reimbursementAccountDraft?.[nationalityInputKey] ?? '';

    const countryInputKey = `${PREFIX}_${ownerBeingModifiedID}_${COUNTRY}` as const;

    const inputKeys = {
        street: `${PREFIX}_${ownerBeingModifiedID}_${STREET}`,
        city: `${PREFIX}_${ownerBeingModifiedID}_${CITY}`,
        state: `${PREFIX}_${ownerBeingModifiedID}_${STATE}`,
        zipCode: `${PREFIX}_${ownerBeingModifiedID}_${ZIP_CODE}`,
        country: countryInputKey,
    } as const;

    const defaultValues = {
        street: SafeString(reimbursementAccountDraft?.[inputKeys.street]),
        city: SafeString(reimbursementAccountDraft?.[inputKeys.city]),
        state: SafeString(reimbursementAccountDraft?.[inputKeys.state]),
        zipCode: SafeString(reimbursementAccountDraft?.[inputKeys.zipCode]),
        country: (reimbursementAccountDraft?.[inputKeys.country] ?? '') as Country | '',
    };

    const formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYourAddress' : 'ownershipInfoStep.whatsTheOwnersAddress');

    // Has to be stored in state and updated on country change due to the fact that we can't relay on onyxValues when user is editing the form (draft values are not being saved in that case)
    const [shouldDisplayStateSelector, setShouldDisplayStateSelector] = useState<boolean>(
        defaultValues.country === CONST.COUNTRY.US || defaultValues.country === CONST.COUNTRY.CA || defaultValues.country === '',
    );

    const stepFieldsWithState = useMemo(
        () => [inputKeys.street, inputKeys.city, inputKeys.state, inputKeys.zipCode, countryInputKey],
        [countryInputKey, inputKeys.city, inputKeys.state, inputKeys.street, inputKeys.zipCode],
    );
    const stepFieldsWithoutState = useMemo(
        () => [inputKeys.street, inputKeys.city, inputKeys.zipCode, countryInputKey],
        [countryInputKey, inputKeys.city, inputKeys.street, inputKeys.zipCode],
    );

    const stepFields = shouldDisplayStateSelector ? stepFieldsWithState : stepFieldsWithoutState;

    const handleCountryChange = (country: unknown) => {
        if (typeof country !== 'string' || country === '') {
            return;
        }
        setShouldDisplayStateSelector(country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA);
    };

    const handleNextStep = () => {
        // owner is US citizen so we need to gather last four digits of his SSN
        if (nationality === CONST.COUNTRY.US) {
            onNext();
            // currency is set to GBP and owner is UK citizen, so we skip SSN and Documents step
        } else if (countryStepCountryValue === CONST.COUNTRY.GB && nationality === CONST.COUNTRY.GB) {
            onMove(7, false);
            // owner is not US citizen so we skip SSN step
        } else {
            onMove(6, false);
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
            shouldValidateZipCodeFormat={reimbursementAccountDraft?.[inputKeys.country] === CONST.COUNTRY.US}
        />
    );
}

export default Address;
