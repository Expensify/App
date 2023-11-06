import React from 'react';
import {withOnyx} from 'react-native-onyx';
import lodashGet from 'lodash/get';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import getDefaultStateForField from '../../utils/getDefaultStateForField';
import NewDatePicker from '../../../../components/NewDatePicker';
import FormProvider from '../../../../components/Form/FormProvider';
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

const companyIncorporationDateKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_DATE;

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyIncorporationDateKey]);

    if (values.incorporationDate && !ValidationUtils.isValidDate(values.incorporationDate)) {
        errors.incorporationDate = 'common.error.dateInvalid';
    } else if (values.incorporationDate && !ValidationUtils.isValidPastDate(values.incorporationDate)) {
        errors.incorporationDate = 'bankAccount.error.incorporationDateFuture';
    }

    return errors;
};

function IncorporationDateBusiness({reimbursementAccount, reimbursementAccountDraft, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyIncorporationDate =
        getDefaultStateForField({reimbursementAccount, fieldName: companyIncorporationDateKey, defaultValue: ''}) || lodashGet(reimbursementAccountDraft, companyIncorporationDateKey, '');

    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={[styles.textHeadline, styles.mb3]}>{translate('businessInfoStep.selectYourCompanysIncorporationDate')}</Text>
            <NewDatePicker
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={companyIncorporationDateKey}
                label={translate('businessInfoStep.incorporationDate')}
                containerStyles={[styles.mt6]}
                placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                defaultValue={defaultCompanyIncorporationDate}
                shouldSaveDraft
            />
        </FormProvider>
    );
}

IncorporationDateBusiness.propTypes = propTypes;
IncorporationDateBusiness.defaultProps = defaultProps;
IncorporationDateBusiness.displayName = 'IncorporationDateBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
    reimbursementAccountDraft: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT_DRAFT,
    },
})(IncorporationDateBusiness);
