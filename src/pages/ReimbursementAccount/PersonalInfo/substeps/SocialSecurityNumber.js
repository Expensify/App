import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import HelpLinks from '@pages/ReimbursementAccount/PersonalInfo/HelpLinks';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
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

const personalInfoStepKey = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;
const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [personalInfoStepKey.SSN_LAST_4]);

    if (values.ssnLast4 && !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
        errors.ssnLast4 = 'bankAccount.error.ssnLast4';
    }

    return errors;
};
function SocialSecurityNumber({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultSsnLast4 = getDefaultValueForReimbursementAccountField(reimbursementAccount, personalInfoStepKey.SSN_LAST_4, '');

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('personalInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.mb3]}>{translate('personalInfoStep.dontWorry')}</Text>
                <View style={[styles.flex1]}>
                    <TextInput
                        inputID={personalInfoStepKey.SSN_LAST_4}
                        label={translate('personalInfoStep.last4SSN')}
                        aria-label={translate('personalInfoStep.last4SSN')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt4]}
                        keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                        defaultValue={defaultSsnLast4}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                        shouldSaveDraft
                    />
                </View>
                <HelpLinks
                    translate={translate}
                    containerStyles={[styles.mt5]}
                />
            </View>
        </Form>
    );
}

SocialSecurityNumber.propTypes = propTypes;
SocialSecurityNumber.defaultProps = defaultProps;
SocialSecurityNumber.displayName = 'SocialSecurityNumber';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(SocialSecurityNumber);
