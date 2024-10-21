import React from 'react';
import {OnyxEntry, withOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccountForm} from '@src/types/form';

const SSN_LAST_4 = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.SSN_LAST_4;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type SocialSecurityNumberUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type SocialSecurityNumberUBOProps = SubStepProps & SocialSecurityNumberUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

function SocialSecurityNumberUBO({reimbursementAccountDraft, onNext, onMove, isEditing, beneficialOwnerBeingModifiedID}: SocialSecurityNumberUBOProps) {
    const {translate} = useLocalize();

    const ssnLast4InputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${SSN_LAST_4}` as const;
    const defaultSsnLast4 = reimbursementAccountDraft?.[ssnLast4InputID] ?? '';
    const stepFields = [ssnLast4InputID];

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, stepFields);
        if (values[ssnLast4InputID] && !ValidationUtils.isValidSSNLastFour(values[ssnLast4InputID])) {
            errors[ssnLast4InputID] = translate('bankAccount.error.ssnLast4');
        }
        return errors;
    };

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('beneficialOwnerInfoStep.enterTheLast4')}
            formDisclaimer={translate('beneficialOwnerInfoStep.dontWorry')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={ssnLast4InputID}
            inputLabel={translate('beneficialOwnerInfoStep.last4SSN')}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            defaultValue={defaultSsnLast4}
            shouldShowHelpLinks={false}
        />
    );
}

SocialSecurityNumberUBO.displayName = 'SocialSecurityNumberUBO';

export default withOnyx<SocialSecurityNumberUBOProps, SocialSecurityNumberUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(SocialSecurityNumberUBO);
