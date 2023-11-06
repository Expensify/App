import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import getDefaultStateForField from '../../utils/getDefaultStateForField';
import AddressForm from '../../AddressForm';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
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
        street: getDefaultStateForField({reimbursementAccount, fieldName: companyBusinessInfoKey.STREET, defaultValue: ''}),
        city: getDefaultStateForField({reimbursementAccount, fieldName: companyBusinessInfoKey.CITY, defaultValue: ''}),
        state: getDefaultStateForField({reimbursementAccount, fieldName: companyBusinessInfoKey.STATE, defaultValue: ''}),
        zipCode: getDefaultStateForField({reimbursementAccount, fieldName: companyBusinessInfoKey.ZIP_CODE, defaultValue: ''}),
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('businessInfoStep.enterYourCompanysAddress')}</Text>
                <Text>{translate('common.noPO')}</Text>
                <AddressForm
                    inputKeys={INPUT_KEYS}
                    shouldSaveDraft
                    translate={translate}
                    defaultValues={defaultValues}
                    streetTranslationKey="common.companyAddress"
                />
            </View>
        </Form>
    );
}

AddressBusiness.propTypes = propTypes;
AddressBusiness.displayName = 'AddressBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(AddressBusiness);
