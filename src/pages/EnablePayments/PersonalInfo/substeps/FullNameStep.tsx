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
const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.FIRST_NAME, PERSONAL_INFO_STEP_KEY.LAST_NAME];

function FullNameStep({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);

    const defaultValues = {
        firstName: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.FIRST_NAME] ?? '',
        lastName: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.LAST_NAME] ?? '',
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);
            if (values.legalFirstName && !ValidationUtils.isValidLegalName(values.legalFirstName)) {
                errors.legalFirstName = translate('bankAccount.error.firstName');
            }

            if (values.legalLastName && !ValidationUtils.isValidLegalName(values.legalLastName)) {
                errors.legalLastName = translate('bankAccount.error.lastName');
            }
            return errors;
        },
        [translate],
    );

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
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('personalInfoStep.whatsYourLegalName')}</Text>
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={PERSONAL_INFO_STEP_KEY.FIRST_NAME}
                    label={translate('common.firstName')}
                    aria-label={translate('common.firstName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues.firstName}
                    shouldSaveDraft={!isEditing}
                    containerStyles={[styles.mb6]}
                />
                <InputWrapper
                    InputComponent={TextInput}
                    inputID={PERSONAL_INFO_STEP_KEY.LAST_NAME}
                    label={translate('common.lastName')}
                    aria-label={translate('common.lastName')}
                    role={CONST.ROLE.PRESENTATION}
                    defaultValue={defaultValues.lastName}
                    shouldSaveDraft={!isEditing}
                    containerStyles={[styles.mb6]}
                />
                <HelpLinks />
            </View>
        </FormProvider>
    );
}

FullNameStep.displayName = 'FullNameStep';

export default FullNameStep;
