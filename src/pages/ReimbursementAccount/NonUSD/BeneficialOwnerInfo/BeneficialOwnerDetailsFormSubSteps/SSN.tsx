import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubPageProps} from '@hooks/useSubPage/types';

import {getFieldRequiredErrors, isValidSSNFullNine} from '@libs/ValidationUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {SafeString} from 'expensify-common';
import React, {useCallback} from 'react';

type SSNProps = SubPageProps & {isUserEnteringHisOwnData: boolean; ownerBeingModifiedID: string};

const {SSN: SSN_KEY, PREFIX} = CONST.NON_USD_BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;

function SSN({onNext, isEditing, onMove, isUserEnteringHisOwnData, ownerBeingModifiedID}: SSNProps) {
    const {translate} = useLocalize();
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);

    const ssnInputID = `${PREFIX}_${ownerBeingModifiedID}_${SSN_KEY}` as const;
    const defaultSSN = SafeString(reimbursementAccountDraft?.[ssnInputID]);
    const formTitle = translate(isUserEnteringHisOwnData ? 'ownershipInfoStep.whatsYourSSN' : 'ownershipInfoStep.whatsTheOwnersSSN');

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = getFieldRequiredErrors(values, [ssnInputID], translate);

            if (values[ssnInputID] && !isValidSSNFullNine(SafeString(values[ssnInputID]))) {
                errors[ssnInputID] = translate('additionalDetailsStep.ssnFull9Error');
            }

            return errors;
        },
        [ssnInputID, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [ssnInputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={formTitle}
            formDisclaimer={translate('beneficialOwnerInfoStep.dontWorry')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={ssnInputID}
            inputLabel={translate('common.ssnFull9')}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            defaultValue={defaultSSN}
            shouldShowHelpLinks={false}
            maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.FULL_SSN}
            forwardedFSClass={CONST.FULLSTORY.CLASS.MASK}
            shouldDelayAutoFocus
        />
    );
}

export default SSN;
