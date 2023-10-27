import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
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

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
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

function Address(props) {
    const {translate} = useLocalize();

    const defaultValues = {
        street: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STREET], ''),
        city: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.CITY], ''),
        state: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.STATE], ''),
        zipCode: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.ZIP_CODE], ''),
    };

    const handleNextPress = () => {
        // TODO save to onyx
        props.onNext();
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate('common.confirm')}
            validate={validate}
            onSubmit={props.onNext}
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
