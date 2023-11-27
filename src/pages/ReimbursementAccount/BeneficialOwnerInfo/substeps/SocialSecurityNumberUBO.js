import React from 'react';
import {View} from 'react-native';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
// import * as ValidationUtils from '@libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
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

const beneficialOwnerInfoStepKey = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY;
const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

// const validate = () => {};
// const validate = (values) => {
//     const errors = ValidationUtils.getFieldRequiredErrors(values, [personalInfoStepKey.SSN_LAST_4]);

//     if (values.ssnLast4 && !ValidationUtils.isValidSSNLastFour(values.ssnLast4)) {
//         errors.ssnLast4 = 'bankAccount.error.ssnLast4';
//     }

//     return errors;
// };

function SocialSecurityNumberUBO({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultSsnLast4 = getDefaultStateForField({reimbursementAccount, fieldName: beneficialOwnerInfoStepKey.SSN_LAST_4, defaultValue: ''});

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            // validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={[styles.textHeadline]}>{translate('beneficialOwnerInfoStep.enterTheLast4')}</Text>
                <Text style={[styles.mb3]}>{translate('beneficialOwnerInfoStep.dontWorry')}</Text>
                <View style={[styles.flex1]}>
                    <TextInput
                        inputID={beneficialOwnerInfoStepKey.SSN_LAST_4}
                        label={translate('beneficialOwnerInfoStep.last4SSN')}
                        aria-label={translate('beneficialOwnerInfoStep.last4SSN')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        containerStyles={[styles.mt4]}
                        inputMode={CONST.INPUT_MODE.NUMERIC}
                        defaultValue={defaultSsnLast4}
                        maxLength={CONST.BANK_ACCOUNT.MAX_LENGTH.SSN}
                        shouldSaveDraft
                    />
                </View>
            </View>
        </Form>
    );
}

SocialSecurityNumberUBO.propTypes = propTypes;
SocialSecurityNumberUBO.defaultProps = defaultProps;
SocialSecurityNumberUBO.displayName = 'SocialSecurityNumberUBO';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(SocialSecurityNumberUBO);
