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
import HelpLinks from '../HelpLinks';
import getDefaultStateForField from '../../utils/getDefaultStateForField';
import * as ReimbursementAccountProps from '../../reimbursementAccountPropTypes';

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
        firstName: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.FIRST_NAME, defaultValue: ''}),
        lastName: getDefaultStateForField({reimbursementAccount, fieldName: personalInfoStepKey.LAST_NAME, defaultValue: ''}),
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
                        accessibilityLabel={translate('personalInfoStep.legalFirstName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={defaultValues.firstName}
                        shouldSaveDraft
                    />
                </View>
                <View style={[styles.flex2, styles.mb3]}>
                    <TextInput
                        inputID={personalInfoStepKey.LAST_NAME}
                        label={translate('personalInfoStep.legalLastName')}
                        accessibilityLabel={translate('personalInfoStep.legalLastName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
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
