import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import SingleFieldStep from '@components/SubStepForms/SingleFieldStep';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import {getFieldRequiredErrors} from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type TaxIDEINNumberProps = SubStepProps;

const {TAX_ID_EIN_NUMBER} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;
const STEP_FIELDS = [TAX_ID_EIN_NUMBER];

function TaxIDEINNumber({onNext, onMove, isEditing}: TaxIDEINNumberProps) {
    const {translate} = useLocalize();

    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const defaultValue = reimbursementAccount?.achData?.additionalData?.corpay?.[TAX_ID_EIN_NUMBER] ?? reimbursementAccountDraft?.[TAX_ID_EIN_NUMBER] ?? '';

    const validate = useCallback((values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
        return getFieldRequiredErrors(values, STEP_FIELDS);
    }, []);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <SingleFieldStep<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>
            isEditing={isEditing}
            onNext={onNext}
            onMove={onMove}
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            formTitle={translate('businessInfoStep.whatsTheBusinessTaxIDEIN')}
            validate={validate}
            onSubmit={handleSubmit}
            inputId={TAX_ID_EIN_NUMBER}
            inputLabel={translate('businessInfoStep.taxIDEIN')}
            inputMode={CONST.INPUT_MODE.NUMERIC}
            defaultValue={defaultValue}
            shouldShowHelpLinks={false}
        />
    );
}

TaxIDEINNumber.displayName = 'TaxIDEINNumber';

export default TaxIDEINNumber;
