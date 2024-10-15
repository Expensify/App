import React from 'react';
import {withOnyx} from 'react-native-onyx';
import type {OnyxEntry} from 'react-native-onyx';
import type {FormOnyxValues} from '@components/Form/types';
import FullNameStep from '@components/FullNameStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';

const {FIRST_NAME, LAST_NAME} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type LegalNameUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type LegalNameUBOProps = SubStepProps & LegalNameUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

function LegalNameUBO({reimbursementAccountDraft, onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: LegalNameUBOProps) {
    const {translate} = useLocalize();

    const firstNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${FIRST_NAME}` as keyof FormOnyxValues;
    const lastNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${LAST_NAME}` as keyof FormOnyxValues;
    const stepFields = [firstNameInputID, lastNameInputID];
    const defaultValues = {
        firstName: reimbursementAccountDraft?.[firstNameInputID] ?? '',
        lastName: reimbursementAccountDraft?.[lastNameInputID] ?? '',
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    }) as (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    return (
        <FullNameStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('beneficialOwnerInfoStep.enterLegalFirstAndLastName')}
            onSubmit={handleSubmit}
            stepFields={stepFields}
            firstNameInputID={firstNameInputID}
            lastNameInputID={lastNameInputID}
            defaultValues={defaultValues}
        />
    );
}

LegalNameUBO.defaultName = 'LegalNameUBO';

export default withOnyx<LegalNameUBOProps, LegalNameUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(LegalNameUBO);
