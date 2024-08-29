import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.SSN_LAST_4];

function SocialSecurityNumberStep({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);
    const shouldAskForFullSSN = walletAdditionalDetails?.errorCode === CONST.WALLET.ERROR.SSN;

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (shouldAskForFullSSN) {
                if (values.ssn && !ValidationUtils.isValidSSNFullNine(values.ssn)) {
                    errors.ssn = translate('additionalDetailsStep.ssnFull9Error');
                }
            } else if (values.ssn && !ValidationUtils.isValidSSNLastFour(values.ssn)) {
                errors.ssn = translate('bankAccount.error.ssnLast4');
            }

            return errors;
        },
        [translate, shouldAskForFullSSN],
    );

    const defaultSsnLast4 = walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.SSN_LAST_4] ?? '';

    const handleSubmit = useWalletAdditionalDetailsStepFormSubmit({
        fieldIds: STEP_FIELDS,
        onNext,
        shouldSaveDraft: isEditing,
    });

    return (
        <FormProvider
            formID={ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('personalInfoStep.whatsYourSSN')}</Text>
                <Text style={[styles.textSupporting]}>{translate('personalInfoStep.noPersonalChecks')}</Text>
                <View style={[styles.flex1]}>
                    <InputWrapper
                        InputComponent={TextInput}
                        inputID={PERSONAL_INFO_STEP_KEY.SSN_LAST_4}
                        label={translate(shouldAskForFullSSN ? 'common.ssnFull9' : 'personalInfoStep.last4SSN')}
                        aria-label={translate(shouldAskForFullSSN ? 'common.ssnFull9' : 'personalInfoStep.last4SSN')}
                        role={CONST.ROLE.PRESENTATION}
                        containerStyles={[styles.mt6]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        defaultValue={defaultSsnLast4}
                        maxLength={shouldAskForFullSSN ? CONST.BANK_ACCOUNT.MAX_LENGTH.FULL_SSN : CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                        shouldSaveDraft={!isEditing}
                    />
                </View>
                <HelpLinks containerStyles={[styles.mt5]} />
            </View>
        </FormProvider>
    );
}

SocialSecurityNumberStep.displayName = 'SocialSecurityNumberStep';

export default SocialSecurityNumberStep;
