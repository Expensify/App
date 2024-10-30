
import React, {useCallback} from 'react';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';

type NameProps = SubStepProps & {isSecondSigner: boolean};

const {SIGNER_FULL_NAME, SECOND_SIGNER_FULL_NAME} = INPUT_IDS.ADDITIONAL_DATA.CORPAY;

function Name({onNext, isEditing, isSecondSigner}: NameProps) {
    const inputID = isSecondSigner ? SECOND_SIGNER_FULL_NAME : SIGNER_FULL_NAME;
    const {translate} = useLocalize();
    const styles = useThemeStyles();
    const [reimbursementAccount] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);
    const [reimbursementAccountDraft] = useOnyx(ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT);
    const defaultValue = reimbursementAccount?.achData?.additionalData?.corpay?.[inputID] ?? reimbursementAccountDraft?.[inputID] ?? '';
    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, [inputID]);

            if (values[inputID] && !ValidationUtils.isValidLegalName(values[inputID])) {
                errors[inputID] = translate('bankAccount.error.fullName');
            }

            return errors;
        },
        [inputID, translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: [inputID],
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            onSubmit={handleSubmit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('signerInfoStep.whatsYourName')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('signerInfoStep.fullName')}
                aria-label={translate('signerInfoStep.fullName')}
                role={CONST.ROLE.PRESENTATION}
                inputID={inputID}
                containerStyles={[styles.mt6]}
                defaultValue={defaultValue}
                shouldSaveDraft={!isEditing}
            />
        </FormProvider>
    );
}

Name.displayName = 'Name';

export default Name;
