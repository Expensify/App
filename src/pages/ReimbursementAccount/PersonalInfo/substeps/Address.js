import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import HelpLinks from '../HelpLinks';
import AddressForm from '../../AddressForm';
import CONST from '../../../../CONST';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import getDefaultStateForField from '../../utils/getDefaultStateForField';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const personalInfoStepKey = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

const INPUT_KEYS = {
    street: personalInfoStepKey.STREET,
    city: personalInfoStepKey.CITY,
    state: personalInfoStepKey.STATE,
    zipCode: personalInfoStepKey.ZIP_CODE,
};

const REQUIRED_FIELDS = [personalInfoStepKey.STREET, personalInfoStepKey.CITY, personalInfoStepKey.STATE, personalInfoStepKey.ZIP_CODE];

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

    if (values.requestorAddressStreet && !ValidationUtils.isValidAddress(values.requestorAddressStreet)) {
        errors.requestorAddressStreet = 'bankAccount.error.addressStreet';
    }

    if (values.requestorAddressZipCode && !ValidationUtils.isValidZipCode(values.requestorAddressZipCode)) {
        errors.requestorAddressZipCode = 'bankAccount.error.zipCode';
    }

    return errors;
};

function Address({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultValues = {
        street: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.STREET, defaultValue: ''}),
        city: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.CITY, defaultValue: ''}),
        state: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.STATE, defaultValue: ''}),
        zipCode: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.ZIP_CODE, defaultValue: ''}),
    };

    const handleSubmit = (values) => {
        BankAccounts.updateOnyxVBBAData({
            [personalInfoStepKey.STREET]: values[personalInfoStepKey.STREET],
            [personalInfoStepKey.CITY]: values[personalInfoStepKey.CITY],
            [personalInfoStepKey.STATE]: values[personalInfoStepKey.STATE],
            [personalInfoStepKey.ZIP_CODE]: values[personalInfoStepKey.ZIP_CODE],
        });
        onNext();
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            submitButtonStyles={[styles.mb0, styles.pb5]}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('personalInfoStep.enterYourAddress')}</Text>
                <Text>{translate('common.noPO')}</Text>
                <AddressForm
                    inputKeys={INPUT_KEYS}
                    shouldSaveDraft
                    translate={translate}
                    streetTranslationKey="common.streetAddress"
                    defaultValues={defaultValues}
                />
                <HelpLinks
                    translate={translate}
                    containerStyles={[styles.mt5]}
                />
            </View>
        </Form>
    );
}

Address.propTypes = propTypes;
Address.displayName = 'Address';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(Address);
