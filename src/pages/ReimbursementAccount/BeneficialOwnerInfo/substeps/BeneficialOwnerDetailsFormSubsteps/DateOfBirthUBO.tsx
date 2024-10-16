import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import type {FormOnyxKeys, FormOnyxValues} from '@components/Form/types';
import DateOfBirthStep from '@components/SubStepForms/DateOfBirthStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxFormValuesMapping} from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';

const DOB = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.DOB;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type DateOfBirthUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type DateOfBirthUBOProps = SubStepProps & DateOfBirthUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

function DateOfBirthUBO({reimbursementAccountDraft, onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: DateOfBirthUBOProps) {
    const {translate} = useLocalize();

    const dobInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${DOB}` as const;
    const dobDefaultValue = reimbursementAccountDraft?.[dobInputID] ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [dobInputID],
        onNext,
        shouldSaveDraft: isEditing,
    }) as (values: FormOnyxValues<keyof OnyxFormValuesMapping>) => void;

    return (
        <DateOfBirthStep
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('beneficialOwnerInfoStep.enterTheDateOfBirthOfTheOwner')}
            onSubmit={handleSubmit}
            stepFields={[dobInputID] as Array<FormOnyxKeys<keyof OnyxFormValuesMapping>>}
            dobInputID={dobInputID as keyof FormOnyxValues}
            dobDefaultValue={dobDefaultValue}
        />
    );
}

DateOfBirthUBO.defaultName = 'DateOfBirthUBO';

export default withOnyx<DateOfBirthUBOProps, DateOfBirthUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(DateOfBirthUBO);
