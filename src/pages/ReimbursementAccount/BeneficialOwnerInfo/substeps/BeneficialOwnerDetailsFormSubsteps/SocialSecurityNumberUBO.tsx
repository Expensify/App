import React from 'react';
import {View} from 'react-native';
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

const SSN_LAST_4 = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.SSN_LAST_4;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

type SocialSecurityNumberUBOOnyxProps = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: OnyxEntry<ReimbursementAccountForm>;
};
type SocialSecurityNumberUBOProps = SubStepProps & SocialSecurityNumberUBOOnyxProps & {beneficialOwnerBeingModifiedID: string};

function SocialSecurityNumberUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}: SocialSecurityNumberUBOProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

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
        <FormProvider
            formID={ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('beneficialOwnerInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.textSupporting]}>{translate('beneficialOwnerInfoStep.dontWorry')}</Text>
                <View style={[styles.flex1]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={ssnLast4InputID}
                        label={translate('beneficialOwnerInfoStep.last4SSN')}
                        aria-label={translate('beneficialOwnerInfoStep.last4SSN')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt6]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        defaultValue={defaultSsnLast4}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
            </View>
        </FormProvider>
    );
}

SocialSecurityNumberUBO.displayName = 'SocialSecurityNumberUBO';

export default withOnyx<SocialSecurityNumberUBOProps, SocialSecurityNumberUBOOnyxProps>({
    reimbursementAccountDraft: {
        key: ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM_DRAFT,
    },
})(SocialSecurityNumberUBO);
