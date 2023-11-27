import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import styles from '@styles/styles';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: reimbursementAccountDefaultProps,
};

const companyBusinessInfoKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY;

const INPUT_KEYS = {
    street: companyBusinessInfoKey.STREET,
    city: companyBusinessInfoKey.CITY,
    state: companyBusinessInfoKey.STATE,
    zipCode: companyBusinessInfoKey.ZIP_CODE,
};

const REQUIRED_FIELDS = [companyBusinessInfoKey.STREET, companyBusinessInfoKey.CITY, companyBusinessInfoKey.STATE, companyBusinessInfoKey.ZIP_CODE];

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

    if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
        errors.addressStreet = 'bankAccount.error.addressStreet';
    }

    if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
        errors.addressZipCode = 'bankAccount.error.zipCode';
    }

    return errors;
};

function AddressBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultValues = {
        street: getDefaultValueForReimbursementAccountField(reimbursementAccount, companyBusinessInfoKey.STREET, ''),
        city: getDefaultValueForReimbursementAccountField(reimbursementAccount, companyBusinessInfoKey.CITY, ''),
        state: getDefaultValueForReimbursementAccountField(reimbursementAccount, companyBusinessInfoKey.STATE, ''),
        zipCode: getDefaultValueForReimbursementAccountField(reimbursementAccount, companyBusinessInfoKey.ZIP_CODE, ''),
    };

    const handleSubmit = (values) => {
        BankAccounts.addBusinessAddressForDraft(values);
        onNext();
    };

    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
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

AddressBusiness.propTypes = propTypes;
AddressBusiness.defaultProps = defaultProps;
AddressBusiness.displayName = 'AddressBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(AddressBusiness);
