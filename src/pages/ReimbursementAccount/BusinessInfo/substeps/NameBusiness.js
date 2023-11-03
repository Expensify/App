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
import * as BankAccounts from '../../../../libs/actions/BankAccounts';

const propTypes = {
    /** Reimbursement account from ONYX */
    reimbursementAccount: reimbursementAccountPropTypes.isRequired,

    ...subStepPropTypes,
};

const REQUIRED_FIELDS = [CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_NAME];

const validate = (values) => ValidationUtils.getFieldRequiredErrors(values, REQUIRED_FIELDS);

function NameBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyName = lodashGet(reimbursementAccount, ['achData', CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_NAME], '');

    const bankAccountID = lodashGet(reimbursementAccount, 'achData.bankAccountID', 0);
    const shouldDisableCompanyName = Boolean(bankAccountID && defaultCompanyName);

    const handleSubmit = (values) => {
        BankAccounts.updateOnyxVBBAData({
            [CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_NAME]: values[CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_NAME],
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
                <Text style={[styles.textHeadline, styles.mb3]}>{translate('businessInfoStep.enterTheNameOfYourBusiness')}</Text>
                <TextInput
                    label={translate('businessInfoStep.businessName')}
                    accessibilityLabel={translate('businessInfoStep.businessName')}
                    accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                    inputID={CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_NAME}
                    containerStyles={[styles.mt4]}
                    disabled={shouldDisableCompanyName}
                    defaultValue={defaultCompanyName}
                    shouldSaveDraft
                    shouldUseDefaultValue={shouldDisableCompanyName}
                />
            </View>
        </Form>
    );
}

NameBusiness.propTypes = propTypes;
NameBusiness.displayName = 'NameBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(NameBusiness);
