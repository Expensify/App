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

const REQUIRED_FIELDS = [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME, CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME];

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

function FullName(props) {
    const {translate} = useLocalize();

    const defaultValues = {
        firstName: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME], ''),
        lastName: lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME], ''),
    };

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
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('personalInfoStep.enterYourLegalFirstAndLast')}</Text>
                <View style={[styles.flex2, styles.mb5]}>
                    <TextInput
                        inputID={CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.FIRST_NAME}
                        label={translate('personalInfoStep.legalFirstName')}
                        accessibilityLabel={translate('personalInfoStep.legalFirstName')}
                        accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                        defaultValue={defaultValues.firstName}
                        shouldSaveDraft
                    />
                </View>
                <View style={[styles.flex2, styles.mb3]}>
                    <TextInput
                        inputID={CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.LAST_NAME}
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
FullName.displayName = 'FullName';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(FullName);
