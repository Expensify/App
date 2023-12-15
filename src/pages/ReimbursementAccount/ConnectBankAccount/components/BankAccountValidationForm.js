import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import PropTypes from 'prop-types';
import React, {useCallback} from 'react';
import {View} from 'react-native';
import _ from 'underscore';
import FormProvider from '@components/Form/FormProvider';
import Text from '@components/Text';
import TextInput from '@components/TextInput';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';
import * as ValidationUtils from '@libs/ValidationUtils';
import * as ReimbursementAccountProps from '@pages/ReimbursementAccount/reimbursementAccountPropTypes';
import * as BankAccounts from '@userActions/BankAccounts';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import Enable2FACard from './Enable2FACard';

const propTypes = {
    reimbursementAccount: ReimbursementAccountProps.reimbursementAccountPropTypes.isRequired,
    requiresTwoFactorAuth: PropTypes.bool.isRequired,
};

/**
 * Filter input for validation amount
 * Anything that isn't a number is returned as an empty string
 * Any dollar amount (e.g. 1.12) will be returned as 112
 *
 * @param {String} amount field input
 * @returns {String}
 */
const filterInput = (amount) => {
    let value = amount ? amount.toString().trim() : '';
    if (value === '' || _.isNaN(Number(value)) || !Math.abs(Str.fromUSDToNumber(value))) {
        return '';
    }

    // If the user enters the values in dollars, convert it to the respective cents amount
    if (_.contains(value, '.')) {
        value = Str.fromUSDToNumber(value);
    }

    return value;
};

/**
 * @param {Object} values - form input values passed by the Form component
 * @returns {Object}
 */

const validate = (values) => {
    const errors = {};

    _.each(values, (value, key) => {
        const filteredValue = typeof value === 'string' ? filterInput(value) : value;
        if (ValidationUtils.isRequiredFulfilled(filteredValue)) {
            return;
        }
        errors[key] = 'common.error.invalidAmount';
    });

    return errors;
};

function BankAccountValidationForm({requiresTwoFactorAuth, reimbursementAccount}) {
    const {translate} = useLocalize();
    const styles = useThemeStyles();

    /**
     * @param {Object} values - form input values passed by the Form component
     */
    const submit = useCallback(
        (values) => {
            const amount1 = filterInput(values.amount1);
            const amount2 = filterInput(values.amount2);
            const amount3 = filterInput(values.amount3);

            const validateCode = [amount1, amount2, amount3].join(',');

            // Send valid amounts to BankAccountAPI::validateBankAccount in Web-Expensify
            const bankAccountID = lodashGet(reimbursementAccount, 'achData.bankAccountID');
            BankAccounts.validateBankAccount(bankAccountID, validateCode);
        },
        [reimbursementAccount],
    );
    return (
        <FormProvider
            formID={ONYXKEYS.REIMBURSEMENT_ACCOUNT}
            submitButtonText={translate('connectBankAccountStep.validateButtonText')}
            onSubmit={submit}
            validate={validate}
            style={[styles.mh5, styles.flexGrow1]}
        >
            <Text>{translate('connectBankAccountStep.description')}</Text>
            <Text>{translate('connectBankAccountStep.descriptionCTA')}</Text>

            <View style={[styles.mv5]}>
                <TextInput
                    inputID="amount1"
                    shouldSaveDraft
                    containerStyles={[styles.mb1]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 1`}
                />
                <TextInput
                    inputID="amount2"
                    shouldSaveDraft
                    containerStyles={[styles.mb1]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 2`}
                />
                <TextInput
                    shouldSaveDraft
                    inputID="amount3"
                    containerStyles={[styles.mb1]}
                    inputMode={CONST.INPUT_MODE.DECIMAL}
                    role={CONST.ACCESSIBILITY_ROLE.TEXT}
                    label={`${translate('connectBankAccountStep.validationInputLabel')} 3`}
                />
            </View>
            {!requiresTwoFactorAuth && (
                <View style={[styles.mln5, styles.mrn5, styles.mt3]}>
                    <Enable2FACard />
                </View>
            )}
        </FormProvider>
    );
}

BankAccountValidationForm.propTypes = propTypes;
BankAccountValidationForm.displayName = 'BankAccountValidationForm';

export default BankAccountValidationForm;
