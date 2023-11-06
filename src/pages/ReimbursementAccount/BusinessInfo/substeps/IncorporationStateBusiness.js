import React from 'react';
import {withOnyx} from 'react-native-onyx';
import {View} from 'react-native';
import useLocalize from '../../../../hooks/useLocalize';
import styles from '../../../../styles/styles';
import Text from '../../../../components/Text';
import CONST from '../../../../CONST';
import Form from '../../../../components/Form';
import ONYXKEYS from '../../../../ONYXKEYS';
import subStepPropTypes from '../../subStepPropTypes';
import * as ValidationUtils from '../../../../libs/ValidationUtils';
import {reimbursementAccountPropTypes} from '../../reimbursementAccountPropTypes';
import * as BankAccounts from '../../../../libs/actions/BankAccounts';
import getDefaultStateForField from '../../utils/getDefaultStateForField';
import StatePicker from '../../../../components/StatePicker';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const companyIncorporationStateKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.INCORPORATION_STATE;

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, [companyIncorporationStateKey]);

function IncorporationStateBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyIncorporationState = getDefaultStateForField({reimbursementAccount, fieldName: companyIncorporationStateKey, defaultValue: ''});

    const handleSubmit = (values) => {
        BankAccounts.updateOnyxVBBAData({
            [companyIncorporationStateKey]: values[companyIncorporationStateKey],
        });

        onNext();
    };

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={handleSubmit}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <View>
                <Text style={styles.textHeadline}>{translate('businessInfoStep.pleaseSelectTheStateYourCompanyWasIncorporatedIn')}</Text>
                <StatePicker
                    inputID={companyIncorporationStateKey}
                    label={translate('businessInfoStep.incorporationState')}
                    defaultValue={defaultCompanyIncorporationState}
                    shouldSaveDraft
                />
            </View>
        </Form>
    );
}

IncorporationStateBusiness.propTypes = propTypes;
IncorporationStateBusiness.displayName = 'IncorporationStateBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(IncorporationStateBusiness);
