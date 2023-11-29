import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
// import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
import styles from '@styles/styles';
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

const beneficialOwnerInfoKey = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;

const INPUT_KEYS = {
    street: beneficialOwnerInfoKey.STREET,
    city: beneficialOwnerInfoKey.CITY,
    state: beneficialOwnerInfoKey.STATE,
    zipCode: beneficialOwnerInfoKey.ZIP_CODE,
};

// const REQUIRED_FIELDS = [beneficialOwnerInfoKey.STREET, beneficialOwnerInfoKey.CITY, beneficialOwnerInfoKey.STATE, beneficialOwnerInfoKey.ZIP_CODE];

// const validate = (values) => {
//     const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

//     if (values.addressStreet && !ValidationUtils.isValidAddress(values.addressStreet)) {
//         errors.addressStreet = 'bankAccount.error.addressStreet';
//     }

//     if (values.addressZipCode && !ValidationUtils.isValidZipCode(values.addressZipCode)) {
//         errors.addressZipCode = 'bankAccount.error.zipCode';
//     }

//     return errors;
// };

function AddressUBO({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultValues = {
        street: getDefaultValueForReimbursementAccountField(reimbursementAccount, beneficialOwnerInfoKey.STREET, ''),
        city: getDefaultValueForReimbursementAccountField(reimbursementAccount, beneficialOwnerInfoKey.CITY, ''),
        state: getDefaultValueForReimbursementAccountField(reimbursementAccount, beneficialOwnerInfoKey.STATE, ''),
        zipCode: getDefaultValueForReimbursementAccountField(reimbursementAccount, beneficialOwnerInfoKey.ZIP_CODE, ''),
    };

    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            // validate={validate}
            onSubmit={onNext}
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text style={[styles.textHeadline]}>{translate('beneficialOwnerInfoStep.enterTheOwnersAddress')}</Text>
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

AddressUBO.propTypes = propTypes;
AddressUBO.defaultProps = defaultProps;
AddressUBO.displayName = 'AddressUBO';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(AddressUBO);
