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

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
};

const personalInfoStepKey = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY;

const REQUIRED_FIELDS = [personalInfoStepKey.FIRST_NAME, personalInfoStepKey.LAST_NAME];

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

function FullName({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultValues = {
        firstName: getDefaultValueForReimbursementAccountField(reimbursementAccount, personalInfoStepKey.FIRST_NAME, ''),
        lastName: getDefaultValueForReimbursementAccountField(reimbursementAccount, personalInfoStepKey.LAST_NAME, ''),
    };

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
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('personalInfoStep.enterYourLegalFirstAndLast')}</Text>
                <View style={[styles.flex2, styles.mb5]}>
                    <TextInput
                        inputID={personalInfoStepKey.FIRST_NAME}
                        label={translate('personalInfoStep.legalFirstName')}
                        aria-label={translate('personalInfoStep.legalFirstName')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={defaultValues.firstName}
                        shouldSaveDraft
                    />
                </View>
                <View style={[styles.flex2, styles.mb3]}>
                    <TextInput
                        inputID={personalInfoStepKey.LAST_NAME}
                        label={translate('personalInfoStep.legalLastName')}
                        aria-label={translate('personalInfoStep.legalLastName')}
                        role={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={defaultValues.lastName}
                        shouldSaveDraft
                    />
                </View>
                <HelpLinks translate={translate} />
            </View>
        </Form>
    );
}

FullName.propTypes = propTypes;
FullName.defaultProps = defaultProps;
FullName.displayName = 'FullName';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(FullName);
