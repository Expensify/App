import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import type {FormInputErrors, FormOnyxValues} from '@components/Form/types';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useReimbursementAccountStepFormSubmit from '@hooks/useReimbursementAccountStepFormSubmit';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import ONYXKEYS from '@src/ONYXKEYS';
import INPUT_IDS from '@src/types/form/ReimbursementAccountForm';
import type {ReimbursementAccount} from '@src/types/onyx';

type AddressBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type AddressBusinessProps = AddressBusinessOnyxProps & SubStepProps;

const COMPANY_BUSINESS_INFO_KEY = INPUT_IDS.BUSINESS_INFO_STEP;

const INPUT_KEYS = {
    street: COMPANY_BUSINESS_INFO_KEY.STREET,
    city: COMPANY_BUSINESS_INFO_KEY.CITY,
    state: COMPANY_BUSINESS_INFO_KEY.STATE,
    zipCode: COMPANY_BUSINESS_INFO_KEY.ZIP_CODE,
};

const STEP_FIELDS = [COMPANY_BUSINESS_INFO_KEY.STREET, COMPANY_BUSINESS_INFO_KEY.CITY, COMPANY_BUSINESS_INFO_KEY.STATE, COMPANY_BUSINESS_INFO_KEY.ZIP_CODE];

const validate = (values: FormOnyxValues<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM>): FormInputErrors<typeof ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM> => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, STEP_FIELDS);

    if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
        errors.addressStreet = 'bankAccount.error.addressStreet';
    }

    if (values.addressCity && !ValidationUtils.isValidAddress(values.addressCity)) {
        errors.addressCity = 'bankAccount.error.addressCity';
    }

    if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
        errors.addressZipCode = 'bankAccount.error.zipCode';
    }

    return errors;
};

function AddressBusiness({reimbursementAccount, onNext, isEditing}: AddressBusinessProps) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    const defaultValues = {
        street: reimbursementAccount?.achData?.addressStreet ?? '',
        city: reimbursementAccount?.achData?.addressCity ?? '',
        state: reimbursementAccount?.achData?.addressState ?? '',
        zipCode: reimbursementAccount?.achData?.addressZipCode ?? '',
    };

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
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadlineLineHeightXXL]}>{translate('businessInfoStep.enterYourCompanysAddress')}</Text>
            <Text>{translate('common.noPO')}</Text>
            <AddressForm
                inputKeys={INPUT_KEYS}
                shouldSaveDraft={!isEditing}
                defaultValues={defaultValues}
                streetTranslationKey="common.companyAddress"
            />
        </FormProvider>
    );
}

AddressBusiness.displayName = 'AddressBusiness';

export default withOnyx<AddressBusinessProps, AddressBusinessOnyxProps>({
    // @ts-expect-error: ONYXKEYS.REIMBURSEMENT_ACCOUNT is conflicting with ONYXKEYS.FORMS.REIMBURSEMENT_ACCOUNT_FORM
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(AddressBusiness);
