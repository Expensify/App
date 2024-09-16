import React, {useCallback} from 'react';
import {View} from 'react-native';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import useWalletAdditionalDetailsStepFormSubmit from '@hooks/useWalletAdditionalDetailsStepFormSubmit';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/WalletAdditionalDetailsForm';

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;

const INPUT_KEYS = {
    street: PERSONAL_INFO_STEP_KEY.STREET,
    city: PERSONAL_INFO_STEP_KEY.CITY,
    state: PERSONAL_INFO_STEP_KEY.STATE,
    zipCode: PERSONAL_INFO_STEP_KEY.ZIP_CODE,
};

const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.STATE, PERSONAL_INFO_STEP_KEY.ZIP_CODE];

function AddressStep({onNext, isEditing}: SubStepProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const [walletAdditionalDetails] = useOnyx(ONYXKEYS.WALLET_ADDITIONAL_DETAILS);

    const defaultValues = {
        street: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STREET] ?? '',
        city: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.CITY] ?? '',
        state: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STATE] ?? '',
        zipCode: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.ZIP_CODE] ?? '',
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
                errors.addressStreet = translate('bankAccount.error.addressStreet');
            }

            if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
                errors.addressZipCode = translate('bankAccount.error.zipCode');
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
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('personalInfoStep.whatsYourAddress')}</Text>
                <Text style={[styles.textSupporting]}>{translate('personalInfoStep.noPOBoxesPlease')}</Text>
                <AddressFormFields
                    inputKeys={INPUT_KEYS}
                    streetTranslationKey="common.streetAddress"
                    defaultValues={defaultValues}
                    shouldSaveDraft={!isEditing}
                />
                <HelpLinks containerStyles={[styles.mt6]} />
            </View>
        </FormProvider>
    );
}

AddressStep.displayName = 'AddressStep';

export default AddressStep;
