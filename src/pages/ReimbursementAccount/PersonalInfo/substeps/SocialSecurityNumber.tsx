import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
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
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type SocialSecurityNumberOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type SocialSecurityNumberProps = SocialSecurityNumberOnyxProps & SubStepProps;

const PERSONAL_INFO_STEP_KEY = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.SSN_LAST_4];

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

    if (values.ssnLast4 && !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
        errors.ssnLast4 = 'bankAccount.error.ssnLast4';
    }

    return errors;
};
function SocialSecurityNumber({reimbursementAccount, onNext, isEditing}: SocialSecurityNumberProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultSsnLast4 = reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.SSN_LAST_4] ?? '';

    const handleSubmit = useReimbursementAccountStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        isEditing,
    });

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
            shouldSaveDraft={!isEditing}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('personalInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.mb3]}>{translate('personalInfoStep.dontWorry')}</Text>
                <View style={[styles.flex1]}>
                    <InputWrapper
                        // @ts-expect-error TODO: Remove this once InputWrapper (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript.
                        InputComponent={TextInput}
                        inputID={PERSONAL_INFO_STEP_KEY.SSN_LAST_4}
                        label={translate('personalInfoStep.last4SSN')}
                        aria-label={translate('personalInfoStep.last4SSN')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt4]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        defaultValue={defaultSsnLast4}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                    />
                </View>
                <HelpLinks containerStyles={[styles.mt5]} />
            </View>
        </FormProvider>
    );
}

SocialSecurityNumber.displayName = 'SocialSecurityNumber';

export default withOnyx<SocialSecurityNumberProps, SocialSecurityNumberOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(SocialSecurityNumber);
