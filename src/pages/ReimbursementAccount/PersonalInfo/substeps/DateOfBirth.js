import React from 'react';
import {withOnyx} from 'react-native-onyx';
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
import getDefaultStateForField from '../../utils/getDefaultStateForField';
import reimbursementAccountDraftPropTypes from '../../ReimbursementAccountDraftPropTypes';
import * as ReimbursementAccountProps from '../../reimbursementAccountPropTypes';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes,

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const personalInfoDobKey = CONST.BANK_ACCOUNT.PERSONAL_INFO_STEP.INPUT_KEY.DOB;

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [personalInfoDobKey]);

    if (values.dob) {
        if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.dob';
        } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
            errors.dob = 'bankAccount.error.age';
        }
    }

    return errors;
};

function DateOfBirth({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing}) {
    const {translate} = useLocalize();

    const dobDefaultValue = getDefaultStateForField({reimbursementAccount, fieldName: personalInfoDobKey, defaultValue: ''}) || lodashGet(reimbursementAccountDraft, personalInfoDobKey, '');

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow2, styles.justifyContentBetween]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('personalInfoStep.enterYourDateOfBirth')}</Text>
            <NewDatePicker
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={personalInfoDobKey}
                label={translate('common.dob')}
                containerStyles={[styles.mt6]}
                placeholder={translate('common.dateFormat')}
                defaultValue={dobDefaultValue}
                minDate={minDate}
                maxDate={maxDate}
                shouldSaveDraft
            />
            <HelpLinks
                translate={translate}
                containerStyles={[styles.mt5]}
            />
        </FormProvider>
    );
}

DateOfBirth.propTypes = propTypes;
DateOfBirth.defaultProps = defaultProps;
DateOfBirth.displayName = 'DateOfBirth';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(DateOfBirth);
