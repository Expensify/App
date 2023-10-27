import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
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
import HelpLinks from '../HelpLinks';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const REQUIRED_FIELDS = [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4];

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

    if (values.ssnLast4 && !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
        errors.ssnLast4 = 'bankAccount.error.ssnLast4';
    }

    return errors;
};
function SocialSecurityNumber(props) {
    const {translate} = useLocalize();

    const defaultSsnLast4 = lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4], '');

    const handleNextPress = () => {
        // TODO save to onyx
        props.onNext();
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate('common.next')}
            validate={validate}
            onSubmit={props.onNext}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('personalInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.mb3]}>{translate('personalInfoStep.dontWorry')}</Text>
                <TextInput
                    inputID={CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.SSN_LAST_4}
                    shouldSaveDraft
                    label={translate('personalInfoStep.last4SSN')}
                    accessibilityLabel={translate('personalInfoStep.last4SSN')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    containerStyles={[styles.mt4]}
                    keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                    defaultValue={defaultSsnLast4}
                    maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                />
                <HelpLinks
                    translate={translate}
                    containerStyles={[styles.mt5]}
                />
            </View>
        </Form>
    );
}

SocialSecurityNumber.propTypes = propTypes;
SocialSecurityNumber.displayName = 'SocialSecurityNumber';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(SocialSecurityNumber);
