import lodashGet from 'lodash/get';
import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import AddressForm from '@pages/ReimbursementAccount/AddressForm';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

const INPUT_KEYS = {
    street: CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET,
    city: CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY,
    state: CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE,
    zipCode: CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE,
};

const REQUIRED_FIELDS = [
    CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET,
    CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY,
    CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE,
    CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE,
];

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
        street: lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET], ''),
        city: lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY], ''),
        state: lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE], ''),
        zipCode: lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE], ''),
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
Address.defaultProps = defaultProps;
Address.displayName = 'Address';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(Address);
