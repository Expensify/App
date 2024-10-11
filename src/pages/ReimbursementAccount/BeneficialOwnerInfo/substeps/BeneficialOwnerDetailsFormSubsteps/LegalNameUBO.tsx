import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import type {ReimbursementAccountForm} from '@src/types/form';

const {FIRST_NAME, LAST_NAME} = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type LegalNameUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type LegalNameUBOProps = SubStepProps & LegalNameUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

function LegalNameUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}: LegalNameUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const firstNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${FIRST_NAME}` as const;
    const lastNameInputID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${LAST_NAME}` as const;
    const stepFields = [firstNameInputID, lastNameInputID];
    const defaultFirstName = reimbursementAccountDraft?.[firstNameInputID] ?? '';
    const defaultLastName = reimbursementAccountDraft?.[lastNameInputID] ?? '';

    const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> =>
        ValidationUtils.getFieldRequiredErrors(values, stepFields);

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: stepFields,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('beneficialOwnerInfoStep.enterLegalFirstAndLastName')}</Text>
            <InputWrapper
                InputComponent={TextInput}
                label={translate('beneficialOwnerInfoStep.legalFirstName')}
                aria-label={translate('beneficialOwnerInfoStep.legalFirstName')}
                role={CONST.ROLE.PRESENTATION}
                inputID={firstNameInputID}
                containerStyles={[styles.mt6]}
                defaultValue={defaultFirstName}
                shouldSaveDraft={!isEditing}
            />
            <InputWrapper
                InputComponent={TextInput}
                label={translate('beneficialOwnerInfoStep.legalLastName')}
                aria-label={translate('beneficialOwnerInfoStep.legalLastName')}
                role={CONST.ROLE.PRESENTATION}
                inputID={lastNameInputID}
                containerStyles={[styles.mt6]}
                defaultValue={defaultLastName}
                shouldSaveDraft={!isEditing}
            />
        </FormProvider>
    );
}

LegalNameUBO.displayName = 'LegalNameUBO';

export default withOnyx<LegalNameUBOProps, LegalNameUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(LegalNameUBO);
