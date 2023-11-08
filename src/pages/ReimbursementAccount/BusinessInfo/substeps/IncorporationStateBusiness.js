import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import StatePicker from '@components/StatePicker';
import Text from '@components/Text';
import useLocalize from '@hooks/useLocalize';
import * as ValidationUtils from '@libs/ValidationUtils';
import {reimbursementAccountDefaultProps, reimbursementAccountPropTypes} from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
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

const defaultProps = {
    reimbursementAccount: reimbursementAccountDefaultProps,
};

const companyIncorporationStateKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_STATE;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyIncorporationStateKey]);

function IncorporationStateBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyIncorporationState = getDefaultStateForField({reimbursementAccount, fieldName: companyIncorporationStateKey, defaultValue: ''});

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={styles.textHeadline}>{translate('businessInfoStep.pleaseSelectTheStateYourCompanyWasIncorporatedIn')}</Text>
            <StatePicker
                inputID={companyIncorporationStateKey}
                label={translate('businessInfoStep.incorporationState')}
                defaultValue={defaultCompanyIncorporationState}
                shouldSaveDraft
            />
        </Form>
    );
}

IncorporationStateBusiness.propTypes = propTypes;
IncorporationStateBusiness.defaultProps = defaultProps;
IncorporationStateBusiness.displayName = 'IncorporationStateBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(IncorporationStateBusiness);
