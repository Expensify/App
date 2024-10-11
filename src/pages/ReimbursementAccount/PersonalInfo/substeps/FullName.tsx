import React, {useCallback} from 'react';
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
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type FullNameOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type FullNameProps = FullNameOnyxProps & SubStepProps;

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.FIRST_NAME, PERSONAL_INFO_STEP_KEY.LAST_NAME];
function FullName({reimbursementAccount, onNext, isEditing}: FullNameProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValues = {
        firstName: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.FIRST_NAME] ?? '',
        lastName: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.LAST_NAME] ?? '',
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
            if (values.firstName && !ValidationUtils.isValidPersonName(values.firstName)) {
                errors.firstName = translate('bankAccount.error.firstName');
            }

            if (values.lastName && !ValidationUtils.isValidPersonName(values.lastName)) {
                errors.lastName = translate('bankAccount.error.lastName');
            }
            return errors;
        },
        [translate],
    );

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
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
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('personalInfoStep.enterYourLegalFirstAndLast')}</Text>
                <View style={[styles.flex2, styles.mb6]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={PERSONAL_INFO_STEP_KEY.FIRST_NAME}
                        label={translate('personalInfoStep.legalFirstName')}
                        aria-label={translate('personalInfoStep.legalFirstName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={defaultValues.firstName}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
                <View style={[styles.flex2, styles.mb6]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={PERSONAL_INFO_STEP_KEY.LAST_NAME}
                        label={translate('personalInfoStep.legalLastName')}
                        aria-label={translate('personalInfoStep.legalLastName')}
                        role={CONST.ROLE.PRESENTATION}
                        defaultValue={defaultValues.lastName}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
                <HelpLinks />
            </View>
        </FormProvider>
    );
}

FullName.displayName = 'FullName';

export default withOnyx<FullNameProps, FullNameOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(FullName);
