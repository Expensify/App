import {subYears} from 'date-fns';
import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import FormProvider from '@components/Form/FormProvider';
import NewDatePicker from '@components/NewDatePicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
// import * as ValidationUtils from '@libs/ValidationUtils';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
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

    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountDefaultProps,
    reimbursementAccountDraft: {},
};

const beneficialOwnerInfoDobKey = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.INPUT_KEY.DOB;

const validate = () => {};
// const validate = (values) => {
//     const errors = ValidationUtils.getFieldRequiredErrors(values, [beneficialOwnerInfoDobKey]);

//     if (values.dob) {
//         if (!ValidationUtils.isValidPastDate(values.dob) || !ValidationUtils.meetsMaximumAgeRequirement(values.dob)) {
//             errors.dob = 'bankAccount.error.dob';
//         } else if (!ValidationUtils.meetsMinimumAgeRequirement(values.dob)) {
//             errors.dob = 'bankAccount.error.age';
//         }
//     }

//     return errors;
// };

function DateOfBirthUBO({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing}) {
    const {translate} = useLocalize();

    const dobDefaultValue =
        getDefaultStateForField({reimbursementAccount, fieldName: beneficialOwnerInfoDobKey, defaultValue: ''}) || lodashGet(reimbursementAccountDraft, beneficialOwnerInfoDobKey, '');

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
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('beneficialOwnerInfoStep.enterTheDateOfBirthOfTheOwner')}</Text>
            <NewDatePicker
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={beneficialOwnerInfoDobKey}
                label={translate('common.dob')}
                containerStyles={[styles.mt6]}
                placeholder={translate('common.dateFormat')}
                defaultValue={dobDefaultValue}
                minDate={minDate}
                maxDate={maxDate}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

DateOfBirthUBO.propTypes = propTypes;
DateOfBirthUBO.defaultProps = defaultProps;
DateOfBirthUBO.displayName = 'DateOfBirthUBO';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(DateOfBirthUBO);
