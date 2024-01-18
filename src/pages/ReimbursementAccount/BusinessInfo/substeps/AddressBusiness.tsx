import React from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import type {SubStepProps} from '@hooks/useSubStep/types';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ReimbursementAccount} from '@src/types/onyx';
import type {FormValues} from '@src/types/onyx/Form';
import type * as OnyxCommon from '@src/types/onyx/OnyxCommon';

type AddressBusinessOnyxProps = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: OnyxEntry<ReimbursementAccount>;
};

type AddressBusinessProps = AddressBusinessOnyxProps & SubStepProps;

const companyBusinessInfoKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

const INPUT_KEYS = {
    street: companyBusinessInfoKey.STREET,
    city: companyBusinessInfoKey.CITY,
    state: companyBusinessInfoKey.STATE,
    zipCode: companyBusinessInfoKey.ZIP_CODE,
};

const REQUIRED_FIELDS = [companyBusinessInfoKey.STREET, companyBusinessInfoKey.CITY, companyBusinessInfoKey.STATE, companyBusinessInfoKey.ZIP_CODE];

const validate = (values: FormValues): OnyxCommon.Errors => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

    if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
        errors.addressStreet = 'bankAccount.error.addressStreet';
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

    const handleSubmit = (values: BankAccounts.BusinessAddress) => {
        BankAccounts.addBusinessAddressForDraft(values);
        onNext();
    };

    return (
        // @ts-expect-error TODO: Remove this once FormProvider (https://github.com/Expensify/App/issues/31972) is migrated to TypeScript
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadline]}>{translate('businessInfoStep.enterYourCompanysAddress')}</Text>
            <Text>{translate('common.noPO')}</Text>
            <AddressForm
                inputKeys={INPUT_KEYS}
                shouldSaveDraft
                translate={translate}
                defaultValues={defaultValues}
                streetTranslationKey="common.companyAddress"
            />
        </FormProvider>
    );
}

AddressBusiness.displayName = 'AddressBusiness';

export default withOnyx<AddressBusinessProps, AddressBusinessOnyxProps>({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(AddressBusiness);
