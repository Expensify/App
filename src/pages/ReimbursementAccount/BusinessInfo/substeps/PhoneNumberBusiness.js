import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultStateForField from '@pages/ReimbursementAccount/utils/getDefaultStateForField';
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

const companyPhoneNumberKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_PHONE;

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyPhoneNumberKey]);

    if (values.companyPhone && !ValidationUtils.isValidUSPhone(values.companyPhone, true)) {
        errors.companyPhone = 'bankAccount.error.phoneNumber';
    }

    return errors;
};

function PhoneNumberBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyPhoneNumber = getDefaultStateForField({reimbursementAccount, fieldName: companyPhoneNumberKey, defaultValue: ''});

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
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
        </Form>
    );
}

PhoneNumberBusiness.propTypes = propTypes;
PhoneNumberBusiness.defaultProps = defaultProps;
PhoneNumberBusiness.displayName = 'PhoneNumberBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(PhoneNumberBusiness);
