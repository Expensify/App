import React from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
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
import type {WalletAdditionalDetailsRefactor} from '@src/types/onyx/WalletAdditionalDetails';

type AddressOnyxProps = {
    /** wallet additional details from ONYX */
    walletAdditionalDetails: OnyxEntry<WalletAdditionalDetailsRefactor>;
};

type AddressProps = AddressOnyxProps & SubStepProps;

const PERSONAL_INFO_STEP_KEY = INPUT_IDS.PERSONAL_INFO_STEP;

const INPUT_KEYS = {
    street: PERSONAL_INFO_STEP_KEY.STREET,
    city: PERSONAL_INFO_STEP_KEY.CITY,
    state: PERSONAL_INFO_STEP_KEY.STATE,
    zipCode: PERSONAL_INFO_STEP_KEY.ZIP_CODE,
};

const STEP_FIELDS = [PERSONAL_INFO_STEP_KEY.STREET, PERSONAL_INFO_STEP_KEY.CITY, PERSONAL_INFO_STEP_KEY.STATE, PERSONAL_INFO_STEP_KEY.ZIP_CODE];

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS>): FormInputErrors<typeof ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS> => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

    if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
        errors.addressStreet = 'bankAccount.error.addressStreet';
    }

    if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
        errors.addressZipCode = 'bankAccount.error.zipCode';
    }

    return errors;
};

function AddressStep({walletAdditionalDetails, onNext, isEditing}: AddressProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValues = {
        street: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STREET] ?? '',
        city: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.CITY] ?? '',
        state: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.STATE] ?? '',
        zipCode: walletAdditionalDetails?.[PERSONAL_INFO_STEP_KEY.ZIP_CODE] ?? '',
    };

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
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadlineLineHeightXXL, styles.mb3]}>{translate('personalInfoStep.enterYourAddress')}</Text>
                <Text style={[styles.textSupporting]}>{translate('common.noPO')}</Text>
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

export default withOnyx<AddressProps, AddressOnyxProps>({
    // @ts-expect-error ONYXKEYS.WALLET_ADDITIONAL_DETAILS is conflicting with ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS
    walletAdditionalDetails: {
        key: ONYXKEYS.FORMS.WALLET_ADDITIONAL_DETAILS,
    },
})(AddressStep);
