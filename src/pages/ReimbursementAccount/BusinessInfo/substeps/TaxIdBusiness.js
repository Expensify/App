import React from 'react';
import {withOnyx} from 'react-native-onyx';
import Form from '@components/Form';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
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

const companyTaxIdKey = CONST.BANK_ACCOUNT.BUSINESS_INFO_STEP.INPUT_KEY.COMPANY_TAX_ID;

const validate = (values) => {
    const errors = ValidationUtils.getFieldRequiredErrors(values, [companyTaxIdKey]);

    if (values.companyTaxID && !ValidationUtils.isValidTaxID(values.companyTaxID)) {
        errors.companyTaxID = 'bankAccount.error.taxID';
    }

    return errors;
};

function TaxIdBusiness({reimbursementAccount, onNext, isEditing}) {
    const {translate} = useLocalize();

    const defaultCompanyTaxId = getDefaultStateForField({reimbursementAccount, fieldName: companyTaxIdKey, defaultValue: ''});

    const bankAccountID = getDefaultStateForField({reimbursementAccount, fieldName: 'bankAccountID', defaultValue: 0});

    const shouldDisableCompanyTaxID = Boolean(bankAccountID && defaultCompanyTaxId);

    return (
        <Form
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={isEditing ? translate('common.confirm') : translate('common.next')}
            validate={validate}
            onSubmit={onNext}
            style={[styles.mh5, styles.flexGrow1]}
            submitButtonStyles={[styles.pb5, styles.mb0]}
        >
            <Text style={styles.textHeadline}>{translate('businessInfoStep.enterYourCompanysTaxIdNumber')}</Text>
            <TextInput
                inputID={companyTaxIdKey}
                label={translate('businessInfoStep.taxIDNumber')}
                accessibilityLabel={translate('businessInfoStep.taxIDNumber')}
                accessibilityRole={CONST.ACCESSIBILITY_ROLE.TEXT}
                containerStyles={[styles.mt4]}
                keyboardType={CONST.KEYBOARD_TYPE.NUMBER_PAD}
                disabled={shouldDisableCompanyTaxID}
                placeholder={translate('businessInfoStep.taxIDNumberPlaceholder')}
                defaultValue={defaultCompanyTaxId}
                shouldSaveDraft
                shouldUseDefaultValue={shouldDisableCompanyTaxID}
            />
        </Form>
    );
}

TaxIdBusiness.propTypes = propTypes;
TaxIdBusiness.defaultProps = defaultProps;
TaxIdBusiness.displayName = 'TaxIdBusiness';

export default withOnyx({
    reimbursementAccount: {
        key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
    },
})(TaxIdBusiness);
