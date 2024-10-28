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

type SocialSecurityNumberOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type SocialSecurityNumberProps = SocialSecurityNumberOnyxProps & SubStepProps;

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.SSN_LAST_4];

function SocialSecurityNumber({reimbursementAccount, onNext, isEditing}: SocialSecurityNumberProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultSsnLast4 = reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.SSN_LAST_4] ?? '';

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.ssnLast4 && !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
                errors.ssnLast4 = translate('bankAccount.error.ssnLast4');
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
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('personalInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.textSupporting]}>{translate('personalInfoStep.dontWorry')}</Text>
                <View style={[styles.flex1]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={PERSONAL_INFO_STEP_KEY.SSN_LAST_4}
                        label={translate('personalInfoStep.last4SSN')}
                        aria-label={translate('personalInfoStep.last4SSN')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt6]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        defaultValue={defaultSsnLast4}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
                <HelpLinks containerStyles={[styles.mt5]} />
            </View>
        </FormProvider>
    );
}

SocialSecurityNumber.displayName = 'SocialSecurityNumber';

export default withOnyx<SocialSecurityNumberProps, SocialSecurityNumberOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(SocialSecurityNumber);
