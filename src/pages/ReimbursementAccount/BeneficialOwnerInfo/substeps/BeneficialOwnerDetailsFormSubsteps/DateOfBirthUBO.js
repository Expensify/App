import {subYears} from 'date-fns';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import styles from '@styles/styles';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

const propTypes = {
    /** The draft values of the bank account being setup */
    reimbursementAccountDraft: reimbursementAccountDraftPropTypes,

    /** ID of the beneficial owner that is being modified */
    beneficialOwnerBeingModifiedID: PropTypes.string.isRequired,

    ...subStepPropTypes,
};

const defaultProps = {
    reimbursementAccountDraft: {},
};

const DOB = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.DOB;
const BENEFICIAL_OWNER_PREFIX = CONST.BANK_ACCOUNT.BENEFICIAL_OWNER_INFO_STEP.BENEFICIAL_OWNER_DATA.PREFIX;

function DateOfBirthUBO({reimbursementAccountDraft, onNext, isEditing, beneficialOwnerBeingModifiedID}) {
    const {translate} = useLocalize();

    const DOB_INPUT_ID = `${BENEFICIAL_OWNER_PREFIX}_${beneficialOwnerBeingModifiedID}_${DOB}`;

    const dobDefaultValue = lodashGet(reimbursementAccountDraft, DOB_INPUT_ID, '');

    const minDate = subYears(new Date(), CONST.DATE_BIRTH.MAX_AGE);
    const maxDate = subYears(new Date(), CONST.DATE_BIRTH.MIN_AGE_FOR_PAYMENT);

    const validate = (values) => {
        const errors = ValidationUtils.getFieldRequiredErrors(values, [DOB_INPUT_ID]);

        if (values[DOB_INPUT_ID]) {
            if (!ValidationUtils.isValidPastDate(values[DOB_INPUT_ID]) || !ValidationUtils.meetsMaximumAgeRequirement(values[DOB_INPUT_ID])) {
                errors[DOB_INPUT_ID] = 'bankAccount.error.dob';
            } else if (!ValidationUtils.meetsMinimumAgeRequirement(values[DOB_INPUT_ID])) {
                errors[DOB_INPUT_ID] = 'bankAccount.error.age';
            }
        }

        return errors;
    };
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
            <DatePicker
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={DOB_INPUT_ID}
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
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(DateOfBirthUBO);
