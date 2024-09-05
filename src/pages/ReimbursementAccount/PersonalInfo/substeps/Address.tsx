import React, {useCallback} from 'react';
import {View} from 'react-native';
import type {OnyxEntry} from 'react-native-onyx';
import {useOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';
import isLoadingOnyxValue from '@src/types/utils/isLoadingOnyxValue';

type AddressOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
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

function Address({reimbursementAccount, onNext, isEditing}: AddressProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValues = {
        street: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.STREET] ?? '',
        city: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.CITY] ?? '',
        state: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.STATE] ?? '',
        zipCode: reimbursementAccount?.achData?.[PERSONAL_INFO_STEP_KEY.ZIP_CODE] ?? '',
    };

    const validate = useCallback(
        (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
            const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

            if (values.requestorAddressStreet && !ValidationUtils.isValidAddress(values.requestorAddressStreet)) {
                errors.requestorAddressStreet = translate('bankAccount.error.addressStreet');
            }

            if (values.requestorAddressZipCode && !ValidationUtils.isValidZipCode(values.requestorAddressZipCode)) {
                errors.requestorAddressZipCode = translate('bankAccount.error.zipCode');
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
            submitButtonStyles={[styles.mb0]}
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

Address.displayName = 'Address';

export default function AddressOnyx(props: Omit<AddressProps, keyof AddressOnyxProps>) {
    const [reimbursementAccount, reimbursementAccountMetadata] = useOnyx(ONYXKEYS.REIMBURSEMENT_ACCOUNT);

    if (isLoadingOnyxValue(reimbursementAccountMetadata)) {
        return null;
    }

    return (
        <Address
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            reimbursementAccount={reimbursementAccount}
        />
    );
}
