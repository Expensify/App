import lodashGet from 'lodash/get';
import React from 'react';
import {withOnyx} from 'react-native-onyx';
import DatePicker from '@components/DatePicker';
import FormProvider from '@components/Form/FormProvider';
import InputWrapper from '@components/Form/InputWrapper';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import reimbursementAccountDraftPropTypes from '@pages/ReimbursementAccount/ReimbursementAccountDraftPropTypes';
import {reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import subStepPropTypes from '@pages/ReimbursementAccount/subStepPropTypes';
import getDefaultValueForReimbursementAccountField from '@pages/ReimbursementAccount/utils/getDefaultValueForReimbursementAccountField';
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
    const styles = useThemeStyles();

    const defaultCompanyIncorporationDate =
        getDefaultValueForReimbursementAccountField(reimbursementAccount, companyIncorporationDateKey, '') || lodashGet(reimbursementAccountDraft, companyIncorporationDateKey, '');

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
            <InputWrapper
                InputComponent={DatePicker}
                formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
                inputID={companyIncorporationDateKey}
                label={translate('businessInfoStep.incorporationDate')}
                containerStyles={[styles.mt4]}
                placeholder={translate('businessInfoStep.incorporationDatePlaceholder')}
                defaultValue={defaultCompanyIncorporationDate}
                shouldSaveDraft
                maxDate={new Date()}
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
