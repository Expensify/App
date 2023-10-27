import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import lodashGet from 'lodash/get';
import {subYears} from 'date-fns';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import HelpLinks from '../HelpLinks';
import NewDatePicker from '../../../../components/NewDatePicker';
import FormProvider from '../../../../components/Form/FormProvider';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const REQUIRED_FIELDS = [CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB];

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

    if (values.dob) {
        if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.dob';
        } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.age';
        }
    }

    return errors;
};

function DateOfBirth(props) {
    const {translate} = useLocalize();

    const dobDefaultValue = lodashGet(props.reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB], '');
    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const handleNextPress = () => {
        // TODO save to onyx
        props.onNext();
    };

    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate('common.next')}
            validate={validate}
            onSubmit={props.onNext}
            style={[styles.mh5, styles.flexGrow1]}
            enabledWhenOffline
        >
            <View>
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('personalInfoStep.enterYourDateOfBirth')}</Text>
                <NewDatePicker
                    inputID={CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB}
                    shouldSaveDraft
                    label={translate('common.dob')}
                    containerStyles={[styles.mt6]}
                    placeholder={translate('common.dateFormat')}
                    defaultValue={dobDefaultValue}
                    minDate={minDate}
                    maxDate={maxDate}
                />
                <HelpLinks
                    translate={translate}
                    containerStyles={[styles.mt5]}
                />
            </View>
        </FormProvider>
    );
}

DateOfBirth.propTypes = propTypes;
DateOfBirth.displayName = 'DateOfBirth';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(DateOfBirth);
