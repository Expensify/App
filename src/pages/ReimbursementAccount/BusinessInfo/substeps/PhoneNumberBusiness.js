import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import TextInput from '../../../../components/TextInput';
import CONST from '../../../../CONST';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import getDefaultStateForField from '../../utils/getDefaultStateForField';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const companyPhoneNumberKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_PHONE;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyPhoneNumberKey]);

function PhoneNumberBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyPhoneNumber = getDefaultStateForField({reimbursementAccount, fieldName: companyPhoneNumberKey, defaultValue: ''});

    const handleSubmit = (values) => {
        BankAccounts.updateOnyxVBBAData({
            [companyPhoneNumberKey]: values[companyPhoneNumberKey],
        });

        onNext();
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={styles.textHeadline}>{translate('businessInfoStep.enterYourCompanysPhoneNumber')}</Text>
                <TextInput
                    inputID={companyPhoneNumberKey}
                    label={translate('common.phoneNumber')}
                    accessibilityLabel={translate('common.phoneNumber')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    containerStyles={[styles.mt4]}
                    keyboardType={CONST.KEYBOARD_TYPE.PHONE_PAD}
                    placeholder={translate('common.phoneNumberPlaceholder')}
                    defaultValue={defaultCompanyPhoneNumber}
                    shouldSaveDraft
                />
            </View>
        </Form>
    );
}

PhoneNumberBusiness.propTypes = propTypes;
PhoneNumberBusiness.displayName = 'PhoneNumberBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(PhoneNumberBusiness);
