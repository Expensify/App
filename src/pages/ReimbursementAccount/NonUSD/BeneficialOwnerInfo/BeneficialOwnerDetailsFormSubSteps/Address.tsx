import React, {useMemo, useState} from 'react';
import {useOnyx} from 'react-native-onyx';
import AddressStep from '@components/SubStepForms/AddressStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

type NameProps = SubStepProps & {isUserEnteringHisOwnData: boolean; ownerBeingModifiedID: string};

const {STREET, CITY, STATE, ZIP_CODE, COUNTRY, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function Address({onNext, isEditing, onMove, isUserEnteringHisOwnData, ownerBeingModifiedID}: NameProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const countryInputKey: `beneficialOwner_${string}_${string}` = `${PREFIX}_${ownerBeingModifiedID}_${COUNTRY}`;
    const inputKeys = {
        street: `${PREFIX}_${ownerBeingModifiedID}_${STREET}`,
        city: `${PREFIX}_${ownerBeingModifiedID}_${CITY}`,
        state: `${PREFIX}_${ownerBeingModifiedID}_${STATE}`,
        zipCode: `${PREFIX}_${ownerBeingModifiedID}_${ZIP_CODE}`,
        country: countryInputKey,
    } as const;

    const defaultValues = {
        street: reimbursementAccountDraft?.[inputKeys.street] ?? '',
        city: reimbursementAccountDraft?.[inputKeys.city] ?? '',
        state: reimbursementAccountDraft?.[inputKeys.state] ?? '',
        zipCode: reimbursementAccountDraft?.[inputKeys.zipCode] ?? '',
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
            formTitle={formTitle}
            formPOBoxDisclaimer={translate('common.noPO')}
            onSubmit={handleSubmit}
            stepFields={stepFields}
            inputFieldsIDs={inputKeys}
            defaultValues={defaultValues}
            onCountryChange={handleCountryChange}
            shouldDisplayStateSelector={shouldDisplayStateSelector}
            shouldDisplayCountrySelector
        />
    );
}

Address.displayName = 'Address';

export default Address;
